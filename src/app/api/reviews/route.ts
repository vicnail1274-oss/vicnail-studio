import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/reviews?productId=xxx
 * 公開取得某商品的所有評論 + 平均評分
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId || !UUID_RE.test(productId)) {
      return NextResponse.json({ error: "缺少或無效的 productId" }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from("product_reviews")
      .select("id, rating, comment, display_name, created_at, user_id")
      .eq("product_id", productId)
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      // 表還沒建（migration 005 未跑）— 安靜回空陣列，避免前端 500
      if (
        error.message?.includes("does not exist") ||
        error.message?.includes("relation")
      ) {
        return NextResponse.json({ reviews: [], avg: null, count: 0 });
      }
      console.error("Reviews GET error:", error);
      return NextResponse.json({ error: "讀取失敗" }, { status: 500 });
    }

    const reviews = (data || []) as Array<{
      id: string;
      rating: number;
      comment: string | null;
      display_name: string | null;
      created_at: string;
      user_id: string;
    }>;

    const count = reviews.length;
    const avg =
      count === 0
        ? null
        : Math.round(
            (reviews.reduce((s, r) => s + r.rating, 0) / count) * 10,
          ) / 10;

    return NextResponse.json({ reviews, avg, count });
  } catch (err) {
    console.error("Reviews GET error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

/**
 * POST /api/reviews
 * 已登入用戶建立或更新評論（每個 user × product 唯一）
 * body: { productId, rating (1-5), comment? }
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(`review:${ip}`, 10, 10 * 60 * 1000);
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
    const productId = String(body?.productId || "");
    const rating = Number(body?.rating);
    const commentRaw = typeof body?.comment === "string" ? body.comment : "";

    if (!UUID_RE.test(productId)) {
      return NextResponse.json({ error: "無效的商品 ID" }, { status: 400 });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "評分必須是 1~5" }, { status: 400 });
    }
    const comment = commentRaw.trim().slice(0, 1000);

    const admin = await createAdminClient();

    // 確認商品存在且已發布
    const { data: product } = await admin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();
    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 取顯示名稱
    const { data: profile } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle() as { data: { display_name: string | null } | null };
    const displayName =
      profile?.display_name || user.email?.split("@")[0] || "匿名用戶";

    // upsert（unique constraint on product_id+user_id）
    const { error } = await admin
      .from("product_reviews")
      .upsert(
        {
          product_id: productId,
          user_id: user.id,
          rating,
          comment: comment || null,
          display_name: displayName,
          is_published: true,
        },
        { onConflict: "product_id,user_id" },
      );

    if (error) {
      if (
        error.message?.includes("does not exist") ||
        error.message?.includes("relation")
      ) {
        return NextResponse.json(
          { error: "評論功能尚未啟用，請通知管理員執行 migration 005" },
          { status: 503 },
        );
      }
      console.error("Reviews POST error:", error);
      return NextResponse.json({ error: "送出失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reviews POST error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}

/**
 * DELETE /api/reviews?id=xxx — 刪除自己的評論
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
      return NextResponse.json({ error: "無效的評論 ID" }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { error } = await admin
      .from("product_reviews")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Reviews DELETE error:", error);
      return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reviews DELETE error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
