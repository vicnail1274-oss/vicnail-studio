import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

const FIELDS = [
  "slug",
  "title",
  "description",
  "long_description",
  "price",
  "sale_price",
  "thumbnail_url",
  "cover_video_url",
  "status",
  "sort_order",
  "what_youll_learn",
  "prerequisites",
  "target_audience",
  "category",
  "level",
  "instructor_name",
  "instructor_bio",
  "featured",
] as const;

/** GET: 列出所有課程（含未發布） */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST: 新增課程 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  if (!body.title) {
    return NextResponse.json({ error: "請輸入課程名稱" }, { status: 400 });
  }
  if (!body.slug) {
    return NextResponse.json({ error: "請輸入課程 slug" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(body.slug)) {
    return NextResponse.json(
      { error: "slug 只能包含小寫字母、數字、連字號" },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();
  const insertData: Record<string, unknown> = { title: body.title, slug: body.slug };
  for (const field of FIELDS) {
    if (body[field] !== undefined) insertData[field] = body[field];
  }
  if (body.status === "published" && !insertData.published_at) {
    insertData.published_at = new Date().toISOString();
  }

  const { data, error } = await admin
    .from("courses")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** PUT: 更新課程 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少課程 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const updateData: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  // 自動補 published_at（第一次從 draft 變 published 時）
  if (body.status === "published") {
    const { data: current } = await admin
      .from("courses")
      .select("published_at")
      .eq("id", body.id)
      .single();
    if (current && !current.published_at) {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await admin
    .from("courses")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/**
 * DELETE: soft delete（預設）或 hard delete（?hard=1）
 * Hard delete 會檢查是否有 enrollments 或 order_items 引用
 */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const hard = searchParams.get("hard") === "1";
  if (!id) {
    return NextResponse.json({ error: "缺少課程 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();

  if (hard) {
    const { count: enrollCount } = await admin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("course_id", id);
    if ((enrollCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "此課程已有學生購買，請改用 soft delete（歸檔）" },
        { status: 409 }
      );
    }
    const { count: orderCount } = await admin
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("item_id", id)
      .eq("item_type", "course");
    if ((orderCount ?? 0) > 0) {
      return NextResponse.json(
        { error: "此課程已有歷史訂單，請改用 soft delete（歸檔）" },
        { status: 409 }
      );
    }
    const { error } = await admin.from("courses").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, mode: "hard" });
  }

  const { error } = await admin
    .from("courses")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "soft" });
}
