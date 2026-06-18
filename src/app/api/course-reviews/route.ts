import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/course-reviews?courseId=xxx
 * 公開取得某課程的所有評價 + 平均評分（join profiles 取顯示名稱/頭像）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId || !UUID_RE.test(courseId)) {
      return NextResponse.json({ error: "缺少或無效的 courseId" }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("course_reviews")
      .select("id, rating, comment, created_at, user_id")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // 表還沒建（migration 011 未跑）— 安靜回空陣列，避免前端 500
      if (
        error.message?.includes("does not exist") ||
        error.message?.includes("relation")
      ) {
        return NextResponse.json({ reviews: [], avg: null, count: 0 });
      }
      console.error("Course reviews GET error:", error);
      return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
    }

    const rows = (data || []) as Array<{
      id: string;
      rating: number;
      comment: string | null;
      created_at: string;
      user_id: string;
    }>;

    // 撈評論者的 profile（display_name / avatar_url）
    const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
    const profileMap = new Map<
      string,
      { display_name: string | null; avatar_url: string | null }
    >();
    if (userIds.length > 0) {
      const { data: profiles } = (await admin
        .from("profiles")
        .select("id, display_name, avatar_url")
        .in("id", userIds)) as {
        data:
          | Array<{
              id: string;
              display_name: string | null;
              avatar_url: string | null;
            }>
          | null;
      };
      for (const p of profiles || []) {
        profileMap.set(p.id, {
          display_name: p.display_name,
          avatar_url: p.avatar_url,
        });
      }
    }

    const reviews = rows.map((r) => {
      const profile = profileMap.get(r.user_id);
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        user_id: r.user_id,
        display_name: profile?.display_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
      };
    });

    const count = reviews.length;
    const avg =
      count === 0
        ? null
        : Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / count) * 10,
          ) / 10;

    return NextResponse.json({ reviews, avg, count });
  } catch (err) {
    console.error("Course reviews GET error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

/**
 * POST /api/course-reviews
 * 已登入且已購買的用戶建立或更新評價（每個 user × course 唯一）
 * body: { courseId, rating (1-5), comment? }
 * 用登入 client upsert — RLS 確保只有已購買者能寫入
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`course-review:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const body = await req.json();
    const courseId = String(body?.courseId || "");
    const rating = Number(body?.rating);
    const commentRaw = typeof body?.comment === "string" ? body.comment : "";

    if (!UUID_RE.test(courseId)) {
      return NextResponse.json({ error: "無效的課程 ID" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "評分必須是 1~5" }, { status: 400 });
    }
    const comment = commentRaw.trim().slice(0, 1000);

    // 用登入 client upsert，RLS 把關（未購買者會被擋）
    const { error } = await supabase
      .from("course_reviews")
      .upsert(
        {
          course_id: courseId,
          user_id: user.id,
          rating,
          comment: comment || null,
        },
        { onConflict: "course_id,user_id" },
      );

    if (error) {
      if (
        error.message?.includes("does not exist") ||
        error.message?.includes("relation")
      ) {
        return NextResponse.json(
          { error: "評價功能尚未啟用，請通知管理員執行 migration 011" },
          { status: 503 },
        );
      }
      // RLS 擋下（未購買 / 不符 WITH CHECK）— 回友善訊息
      if (
        error.code === "42501" ||
        error.message?.toLowerCase().includes("row-level security") ||
        error.message?.toLowerCase().includes("violates")
      ) {
        return NextResponse.json(
          { error: "購買課程後才能評價喔" },
          { status: 403 },
        );
      }
      console.error("Course reviews POST error:", error);
      return NextResponse.json({ error: "送出失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Course reviews POST error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

/**
 * DELETE /api/course-reviews?id=xxx — 刪除自己的評價
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id || !UUID_RE.test(id)) {
      return NextResponse.json({ error: "無效的評價 ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("course_reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Course reviews DELETE error:", error);
      return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Course reviews DELETE error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
