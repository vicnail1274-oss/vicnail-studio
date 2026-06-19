import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const MAX_LABEL_LENGTH = 100;

/**
 * 取得本人在此 lesson 的書籤
 *
 * 走 RLS（auth.uid() = user_id），依時間軸排序
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { data: bookmarks, error } = await supabase
      .from("lesson_bookmarks")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("position_seconds", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "讀取書籤失敗" }, { status: 500 });
    }

    return NextResponse.json({ bookmarks: bookmarks ?? [] });
  } catch (err) {
    console.error("Bookmarks GET error:", err);
    return NextResponse.json({ error: "讀取書籤失敗" }, { status: 500 });
  }
}

/**
 * 新增書籤
 *
 * Body: { positionSeconds: number, label?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const body = await req.json();

    const positionSeconds = Math.max(
      0,
      Math.floor(Number(body.positionSeconds) || 0)
    );
    const rawLabel = typeof body.label === "string" ? body.label.trim() : "";
    const label = rawLabel ? rawLabel.slice(0, MAX_LABEL_LENGTH) : null;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const admin = await createAdminClient();

    // 取得 lesson 確認存在 + 拿 course_id
    const { data: lesson } = await admin
      .from("lessons")
      .select("id, course_id")
      .eq("id", lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: "章節不存在" }, { status: 404 });
    }

    // 確認 enrollment 存在（擋未購買）
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", lesson.course_id)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "您尚未購買此課程" }, { status: 403 });
    }

    // 走 RLS insert：user_id 帶本人，RLS WITH CHECK 確保只能寫自己的
    const { data: bookmark, error } = await supabase
      .from("lesson_bookmarks")
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: lesson.course_id,
        position_seconds: positionSeconds,
        label,
      })
      .select("*")
      .single();

    if (error || !bookmark) {
      return NextResponse.json({ error: "新增書籤失敗" }, { status: 500 });
    }

    return NextResponse.json({ bookmark });
  } catch (err) {
    console.error("Bookmarks POST error:", err);
    return NextResponse.json({ error: "新增書籤失敗" }, { status: 500 });
  }
}

/**
 * 刪除書籤
 *
 * Query: ?id=xxx（RLS 確保只能刪自己的）
 */
export async function DELETE(req: NextRequest) {
  try {
    const bookmarkId = req.nextUrl.searchParams.get("id");
    if (!bookmarkId) {
      return NextResponse.json({ error: "缺少書籤 id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { error } = await supabase
      .from("lesson_bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      return NextResponse.json({ error: "刪除書籤失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Bookmarks DELETE error:", err);
    return NextResponse.json({ error: "刪除書籤失敗" }, { status: 500 });
  }
}
