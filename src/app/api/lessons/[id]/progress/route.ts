import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * 儲存學生觀看進度
 *
 * Body: { positionSeconds: number, completed?: boolean }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const body = await req.json();
    const positionSeconds = Math.max(0, Math.floor(Number(body.positionSeconds) || 0));
    const completedFlag = body.completed === true;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "請先登入" },
        { status: 401 }
      );
    }

    const admin = await createAdminClient();

    // 取得 lesson 確認存在 + 算 progress_pct
    const { data: lesson } = await admin
      .from("lessons")
      .select("id, course_id, duration_seconds")
      .eq("id", lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: "章節不存在" }, { status: 404 });
    }

    // 確認 enrollment 存在
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", lesson.course_id)
      .maybeSingle();

    if (!enrollment) {
      return NextResponse.json({ error: "您尚未購買此課程" }, { status: 403 });
    }

    // 計算 progress_pct
    const duration = lesson.duration_seconds || 0;
    const progressPct =
      duration > 0 ? Math.min(100, (positionSeconds / duration) * 100) : 0;

    // 自動視為完成：看到 95% 以上
    const autoCompleted = duration > 0 && progressPct >= 95;
    const completed = completedFlag || autoCompleted;

    const { data: existing } = await admin
      .from("lesson_progress")
      .select("id, total_watch_seconds, position_seconds")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    const newWatchSeconds = Math.max(
      existing?.total_watch_seconds ?? 0,
      positionSeconds
    );

    const payload = {
      user_id: user.id,
      lesson_id: lessonId,
      progress_pct: progressPct,
      position_seconds: positionSeconds,
      total_watch_seconds: newWatchSeconds,
      completed,
      last_watched_at: new Date().toISOString(),
      completed_at: completed
        ? existing && completedFlag
          ? undefined
          : new Date().toISOString()
        : null,
    };

    // upsert（on conflict user_id+lesson_id）取代 check-then-write，
    // 避免併發回報時兩筆都判定 existing=null 各自 insert → 撞唯一鍵回 500
    const { error: writeError } = await admin
      .from("lesson_progress")
      .upsert(payload, { onConflict: "user_id,lesson_id" });

    if (writeError) {
      console.error("Progress write error:", writeError);
      return NextResponse.json({ error: "儲存進度失敗" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      progressPct,
      completed,
    });
  } catch (err) {
    console.error("Progress update error:", err);
    return NextResponse.json(
      { error: "儲存進度失敗" },
      { status: 500 }
    );
  }
}
