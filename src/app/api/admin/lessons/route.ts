import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { deleteVideo } from "@/lib/bunny/stream";

const FIELDS = [
  "course_id",
  "title",
  "description",
  "bunny_video_id",
  "hls_url",
  "thumbnail_url",
  "duration_seconds",
  "sort_order",
  "is_preview",
  "attachments",
  "resolution_height",
  "upload_status",
  "uploaded_at",
] as const;

/** GET: 列出指定課程的章節 */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");

  const admin = await createAdminClient();
  let query = admin
    .from("lessons")
    .select("*")
    .order("sort_order", { ascending: true });

  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST: 新增章節 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.course_id || !body.title) {
    return NextResponse.json(
      { error: "缺少 course_id 或 title" },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();
  const insertData: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) insertData[field] = body[field];
  }

  const { data, error } = await admin
    .from("lessons")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** PUT: 更新章節 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少章節 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const updateData: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  // 上傳完成時自動填 uploaded_at
  if (
    body.upload_status === "ready" &&
    body.bunny_video_id &&
    !body.uploaded_at
  ) {
    updateData.uploaded_at = new Date().toISOString();
  }

  const { data, error } = await admin
    .from("lessons")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE: 連同 Bunny video 一併刪除 */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少章節 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // 取得 bunny_video_id 後一起刪
  const { data: lesson } = await admin
    .from("lessons")
    .select("bunny_video_id")
    .eq("id", id)
    .single();

  if (lesson?.bunny_video_id) {
    try {
      await deleteVideo(lesson.bunny_video_id);
    } catch (err) {
      console.error("Bunny deleteVideo failed:", err);
      // 不擋本機刪除
    }
  }

  const { error } = await admin.from("lessons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
