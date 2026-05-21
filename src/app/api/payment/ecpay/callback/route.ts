import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyCallback } from "@/lib/ecpay/payment";

type AdminClient = Awaited<ReturnType<typeof createAdminClient>>;

/** 嘗試呼叫 SQL function 自動建 course enrollments；錯誤不擋付款流程 */
async function tryGrantCourseEnrollments(admin: AdminClient, orderId: string) {
  try {
    const { error } = await admin.rpc("grant_course_enrollments_from_order", {
      p_order_id: orderId,
    });
    if (error) {
      console.error(`grant_course_enrollments failed for ${orderId}:`, error);
    }
  } catch (err) {
    console.error(`grant_course_enrollments exception for ${orderId}:`, err);
  }
}

/** 記錄優惠碼兌換（idempotent SQL function） */
async function tryRecordPromoRedemption(admin: AdminClient, orderId: string) {
  try {
    const { data: order } = await admin
      .from("orders")
      .select("user_id, promo_code_id, discount_amount")
      .eq("id", orderId)
      .single();

    if (!order?.user_id || !order.promo_code_id || !order.discount_amount) {
      return;
    }

    const { error } = await admin.rpc("record_promo_redemption", {
      p_promo_id: order.promo_code_id,
      p_user_id: order.user_id,
      p_order_id: orderId,
      p_discount_amount: order.discount_amount,
    });
    if (error) {
      console.error(`record_promo_redemption failed for ${orderId}:`, error);
    }
  } catch (err) {
    console.error(`record_promo_redemption exception for ${orderId}:`, err);
  }
}

/**
 * ECPay 付款結果通知（server-to-server callback）
 * ECPay 會 POST 付款結果到這裡
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = String(value);
    });

    // 驗證 CheckMacValue
    if (!verifyCallback(body)) {
      console.error("ECPay callback: CheckMacValue 驗證失敗");
      return new NextResponse("0|CheckMacValue Error", { status: 400 });
    }

    const rtnCode = body.RtnCode;
    const tradeNo = body.TradeNo;
    const merchantTradeNo = body.MerchantTradeNo;
    const orderUUID = body.CustomField1; // 完整 order UUID
    const paymentType = body.PaymentType;

    const admin = await createAdminClient();

    if (rtnCode === "1") {
      // 付款成功 — 三層查找定位訂單
      let orderRow: { id: string; status: string } | null = null;

      // 1. CustomField1（Supabase order UUID）— 最可靠
      if (orderUUID) {
        const { data } = await admin
          .from("orders")
          .select("id, status")
          .eq("id", orderUUID)
          .limit(1);
        if (data?.[0]) orderRow = data[0];
      }
      // 2. ecpay_trade_no 精確比對
      if (!orderRow && tradeNo) {
        const { data } = await admin
          .from("orders")
          .select("id, status")
          .eq("ecpay_trade_no", tradeNo)
          .limit(1);
        if (data?.[0]) orderRow = data[0];
      }
      // 3. order_number 比對 MerchantTradeNo
      if (!orderRow && merchantTradeNo) {
        const { data } = await admin
          .from("orders")
          .select("id, status")
          .eq("order_number", merchantTradeNo)
          .limit(1);
        if (data?.[0]) orderRow = data[0];
      }

      if (!orderRow) {
        console.error(`ECPay callback: no order found`, {
          merchantTradeNo,
          tradeNo,
          orderUUID,
        });
      } else if (orderRow.status === "paid") {
        // Idempotency：已處理過，直接回應 OK 不重複更新
        // 但仍嘗試補建 enrollments（過去版本可能沒建）
        await tryGrantCourseEnrollments(admin, orderRow.id);
        console.log(
          `ECPay callback: order ${orderRow.id} already paid, skip status update`
        );
      } else {
        await admin
          .from("orders")
          .update({
            status: "paid",
            payment_id: tradeNo,
            ecpay_trade_no: tradeNo,
            paid_at: new Date().toISOString(),
          })
          .eq("id", orderRow.id);

        // 課程訂單：自動建 enrollments + 記錄優惠碼兌換
        await tryGrantCourseEnrollments(admin, orderRow.id);
        await tryRecordPromoRedemption(admin, orderRow.id);

        console.log(
          `ECPay payment success: ${merchantTradeNo}, TradeNo: ${tradeNo}, Type: ${paymentType}`
        );
      }
    } else {
      console.error(
        `ECPay payment failed: ${merchantTradeNo}, Code: ${rtnCode}, Msg: ${body.RtnMsg}`
      );
    }

    // ECPay 要求回傳 "1|OK"
    return new NextResponse("1|OK");
  } catch (err) {
    console.error("ECPay callback error:", err);
    return new NextResponse("0|Error", { status: 500 });
  }
}
