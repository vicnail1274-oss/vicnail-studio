import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET 公開課程詳情（含章節列表，但不含 bunny_video_id/hls_url，避免外洩）
 *
 * 回傳：
 *   - course: 完整資訊
 *   - lessons: 章節清單（只回 metadata，影片 URL 需另外呼叫 playback-token）
 *   - hasAccess: 是否已購買（登入時）
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "缺少 slug" }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. 取得課程
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, long_description, price, sale_price, thumbnail_url, cover_video_url, level, category, instructor_name, instructor_bio, what_youll_learn, prerequisites, target_audience, total_lessons, total_duration_seconds, published_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (courseError || !course) {
    return NextResponse.json({ error: "課程不存在" }, { status: 404 });
  }

  // 2. 取得章節（不含影片 URL）
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, title, description, duration_seconds, sort_order, is_preview, thumbnail_url, upload_status"
    )
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  // 3. 檢查使用者是否已購買
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAccess = false;
  let progress: Record<string, { completed: boolean; position_seconds: number }> = {};

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();

    hasAccess =
      !!enrollment &&
      (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());

    if (hasAccess && lessons?.length) {
      const lessonIds = lessons.map((l) => l.id);
      const { data: progressRows } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, position_seconds")
        .eq("user_id", user.id)
        .in("lesson_id", lessonIds);

      progress = Object.fromEntries(
        (progressRows ?? []).map((p) => [
          p.lesson_id,
          {
            completed: p.completed,
            position_seconds: p.position_seconds ?? 0,
          },
        ])
      );
    }
  }

  return NextResponse.json({
    course,
    lessons: lessons ?? [],
    hasAccess,
    progress,
  });
}
