import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const MAX_CONTENT_LENGTH = 2000;

/**
 * 取得本人在此 lesson 的學習筆記
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

    const { data: notes, error } = await supabase
      .from("lesson_notes")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("position_seconds", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "讀取筆記失敗" }, { status: 500 });
    }

    return NextResponse.json({ notes: notes ?? [] });
  } catch (err) {
    console.error("Notes GET error:", err);
    return NextResponse.json({ error: "讀取筆記失敗" }, { status: 500 });
  }
}

/**
 * 新增學習筆記
 *
 * Body: { positionSeconds?: number, content: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const body = await req.json();

    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ error: "筆記內容不可空白" }, { status: 400 });
    }
    const trimmedContent = content.slice(0, MAX_CONTENT_LENGTH);
    const positionSeconds = Math.max(
      0,
      Math.floor(Number(body.positionSeconds) || 0)
    );

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
    const { data: note, error } = await supabase
      .from("lesson_notes")
      .insert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: lesson.course_id,
        position_seconds: positionSeconds,
        content: trimmedContent,
      })
      .select("*")
      .single();

    if (error || !note) {
      return NextResponse.json({ error: "新增筆記失敗" }, { status: 500 });
    }

    return NextResponse.json({ note });
  } catch (err) {
    console.error("Notes POST error:", err);
    return NextResponse.json({ error: "新增筆記失敗" }, { status: 500 });
  }
}

/**
 * 刪除筆記
 *
 * Query: ?id=xxx（RLS 確保只能刪自己的）
 */
export async function DELETE(req: NextRequest) {
  try {
    const noteId = req.nextUrl.searchParams.get("id");
    if (!noteId) {
      return NextResponse.json({ error: "缺少筆記 id" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { error } = await supabase
      .from("lesson_notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      return NextResponse.json({ error: "刪除筆記失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notes DELETE error:", err);
    return NextResponse.json({ error: "刪除筆記失敗" }, { status: 500 });
  }
}
