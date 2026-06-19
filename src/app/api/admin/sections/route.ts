import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/** GET ?course_id= : 列出課程的章節分組 */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");

  const admin = await createAdminClient();
  let query = admin
    .from("course_sections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST { course_id, title, sort_order? } : 新增分組 */
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
  const { data, error } = await admin
    .from("course_sections")
    .insert({
      course_id: body.course_id,
      title: String(body.title),
      sort_order: typeof body.sort_order === "number" ? body.sort_order : 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** PUT { id, title?, sort_order? } : 更新分組 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少分組 ID" }, { status: 400 });
  }

  const update: { title?: string; sort_order?: number } = {};
  if (body.title !== undefined) update.title = String(body.title);
  if (body.sort_order !== undefined) update.sort_order = Number(body.sort_order);

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("course_sections")
    .update(update)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE ?id= : 刪除分組（其下章節的 section_id 由 FK ON DELETE SET NULL 自動清空） */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少分組 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { error } = await admin.from("course_sections").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
