import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 10 / 10min / IP
    const ip = getClientIp(req);
    const rl = rateLimit(`stocknotify:${ip}`, 10, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const { productId, email } = body as { productId?: string; email?: string };

    if (!productId || !email) {
      return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email 格式錯誤" }, { status: 400 });
    }

    // 取得使用者（可選）
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = await createAdminClient();

    // 確認商品存在
    const { data: product } = await admin
      .from("products")
      .select("id, title")
      .eq("id", productId)
      .eq("status", "published")
      .maybeSingle();

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 插入（unique constraint 避免重複）
    const { error } = await admin.from("stock_notifications").insert({
      product_id: productId,
      email: email.toLowerCase().trim(),
      user_id: user?.id || null,
    });

    if (error && !error.message.includes("duplicate")) {
      console.error("Stock notify insert error:", error);
      return NextResponse.json({ error: "訂閱失敗" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      message: "補貨後會透過 Email 通知您",
    });
  } catch (err) {
    console.error("Stock notify error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
