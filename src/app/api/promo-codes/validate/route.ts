import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * 驗證優惠碼（結帳前/結帳時呼叫）
 *
 * Body: { code, subtotal, course_ids?, product_ids? }
 * Response (成功): { valid: true, discount_amount, total, promo: { code, description, discount_type } }
 * Response (失敗): { valid: false, reason }
 */
export async function POST(req: NextRequest) {
  // Rate limit: 20 次 / 分鐘 / IP（避免暴力嘗試）
  const ip = getClientIp(req);
  const rl = rateLimit(`promo:${ip}`, 20, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { valid: false, reason: "嘗試太多次，請稍後再試" },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);
    const courseIds: string[] = Array.isArray(body.course_ids) ? body.course_ids : [];
    const productIds: string[] = Array.isArray(body.product_ids) ? body.product_ids : [];

    if (!code || subtotal <= 0) {
      return NextResponse.json(
        { valid: false, reason: "缺少優惠碼或金額" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { valid: false, reason: "請先登入" },
        { status: 401 }
      );
    }

    const admin = await createAdminClient();
    const { data, error } = await admin.rpc("validate_promo_code", {
      p_code: code,
      p_user_id: user.id,
      p_subtotal: subtotal,
      p_course_ids: courseIds,
      p_product_ids: productIds,
    });

    if (error) {
      console.error("validate_promo_code error:", error);
      return NextResponse.json(
        { valid: false, reason: "驗證失敗" },
        { status: 500 }
      );
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result?.valid || !result.promo_id) {
      return NextResponse.json({
        valid: false,
        reason: result?.reason || "優惠碼無效",
      });
    }

    // 取得優惠碼基本資訊（顯示用）
    const { data: promo } = await admin
      .from("promo_codes")
      .select("id, code, description, discount_type, discount_value")
      .eq("id", result.promo_id)
      .single();

    return NextResponse.json({
      valid: true,
      discount_amount: result.discount_amount,
      total: Math.max(0, subtotal - result.discount_amount),
      promo,
    });
  } catch (err) {
    console.error("Promo code validate error:", err);
    return NextResponse.json(
      { valid: false, reason: "伺服器錯誤" },
      { status: 500 }
    );
  }
}
