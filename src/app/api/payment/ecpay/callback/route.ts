import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyCallback } from "@/lib/ecpay/payment";

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
      // 付款成功
      const updateData: Record<string, string> = {
        status: "paid",
        payment_id: tradeNo,
        ecpay_trade_no: tradeNo,
        paid_at: new Date().toISOString(),
      };

      // 優先用 ecpay_trade_no 精確匹配已存在的訂單
      let matched = false;
      if (tradeNo) {
        const { data: existing } = await admin
          .from("orders")
          .select("id")
          .eq("ecpay_trade_no", tradeNo)
          .limit(1);
        if (existing?.[0]) {
          await admin.from("orders").update(updateData).eq("id", existing[0].id);
          matched = true;
        }
      }

      // 次優先用 CustomField1（order UUID）
      if (!matched && orderUUID) {
        const { data: existing, error } = await admin
          .from("orders")
          .update(updateData)
          .eq("id", orderUUID)
          .select("id");
        if (error) {
          console.error(`ECPay callback: update by UUID failed`, { orderUUID, error });
        }
        matched = !!(existing?.length);
      }

      // fallback: 用 order_number 精確匹配 MerchantTradeNo
      if (!matched && merchantTradeNo) {
        const { data: orders } = await admin
          .from("orders")
          .select("id, order_number")
          .eq("order_number", merchantTradeNo)
          .limit(1);

        if (orders?.[0]) {
          await admin.from("orders").update(updateData).eq("id", orders[0].id);
          matched = true;
        }
      }

      if (!matched) {
        console.error(`ECPay callback: no order found`, { merchantTradeNo, tradeNo, orderUUID });
      }

      console.log(
        `ECPay payment success: ${merchantTradeNo}, TradeNo: ${tradeNo}, Type: ${paymentType}, matched: ${matched}`
      );
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
