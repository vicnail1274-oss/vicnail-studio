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

/** 付款成功後扣現貨庫存。只在訂單「首次轉 paid」時呼叫（見下方冪等判斷），故天然冪等、
 *  重送 callback 不會重複扣。罕見競態（付款後才不足）→ 訂單仍 paid，標記 notes 供後台安排預購。 */
async function tryDecrementOrderStock(admin: AdminClient, orderId: string) {
  try {
    const { data: rows } = await admin
      .from("order_items")
      .select("item_id, quantity")
      .eq("order_id", orderId)
      .eq("item_type", "product");
    if (!rows?.length) return;

    const ids = rows.map((r) => r.item_id);
    const { data: prods } = await admin
      .from("products")
      .select("id, purchase_type")
      .in("id", ids);
    const instock = new Set(
      (prods ?? [])
        .filter((p) => p.purchase_type === "instock")
        .map((p) => p.id)
    );

    const p_items = rows
      .filter((r) => instock.has(r.item_id))
      .map((r) => ({ product_id: r.item_id, quantity: r.quantity }));
    if (!p_items.length) return;

    const { error } = await admin.rpc("decrement_stock_batch", { p_items });
    if (error) {
      // 付款後才發現庫存不足（罕見：兩筆同時付款搶最後一件）→ 訂單維持 paid，標記供後台預購/補貨
      console.error(`Stock decrement after payment failed for ${orderId}:`, error);
      const { data: o } = await admin
        .from("orders")
        .select("notes")
        .eq("id", orderId)
        .single();
      const flag = "⚠️ 付款後庫存不足，需安排預購/補貨";
      await admin
        .from("orders")
        .update({ notes: o?.notes ? `${o.notes}\n${flag}` : flag })
        .eq("id", orderId);
    }
  } catch (err) {
    console.error(`Stock decrement exception for ${orderId}:`, err);
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
      let orderRow: {
        id: string;
        status: string;
        total: number;
        ecpay_trade_no: string | null;
      } | null = null;
      const SELECT_COLS = "id, status, total, ecpay_trade_no";

      // 1. CustomField1（Supabase order UUID）— 最可靠
      if (orderUUID) {
        const { data } = await admin
          .from("orders")
          .select(SELECT_COLS)
          .eq("id", orderUUID)
          .limit(1);
        if (data?.[0]) orderRow = data[0];
      }
      // 2. ecpay_trade_no 精確比對
      if (!orderRow && tradeNo) {
        const { data } = await admin
          .from("orders")
          .select(SELECT_COLS)
          .eq("ecpay_trade_no", tradeNo)
          .limit(1);
        if (data?.[0]) orderRow = data[0];
      }
      // 3. order_number 比對 MerchantTradeNo
      if (!orderRow && merchantTradeNo) {
        const { data } = await admin
          .from("orders")
          .select(SELECT_COLS)
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
      } else if (Number(body.TotalAmount) !== Number(orderRow.total)) {
        // 金額不符：可能遭竄改，記錄並拒絕開通
        console.error(`ECPay callback: amount mismatch`, {
          orderId: orderRow.id,
          tradeNo,
          merchantTradeNo,
          received: body.TotalAmount,
          expected: orderRow.total,
        });
        return new NextResponse("0|amount mismatch", { status: 400 });
      } else if (orderRow.status === "paid" || orderRow.ecpay_trade_no === tradeNo) {
        // 冪等：訂單已 paid，或此 TradeNo 已處理過 → 不重複更新 / 不重複建 enrollment
        console.log(
          `ECPay callback: order ${orderRow.id} already processed (status=${orderRow.status}, tradeNo=${tradeNo}), skip`
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
        // 現貨商品：付款成功才扣庫存（首次轉 paid 才進到此區塊，故冪等）
        await tryDecrementOrderStock(admin, orderRow.id);

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
