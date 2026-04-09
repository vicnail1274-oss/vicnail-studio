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

      // 用 order_number 或 CustomField1 找訂單
      if (orderUUID) {
        await admin
          .from("orders")
          .update(updateData)
          .eq("id", orderUUID);
      } else {
        // fallback: 用 MerchantTradeNo 前綴匹配
        const { data: orders } = await admin
          .from("orders")
          .select("id, order_number")
          .like("order_number", `%${merchantTradeNo}%`)
          .limit(1);

        if (orders?.[0]) {
          await admin
            .from("orders")
            .update(updateData)
            .eq("id", orders[0].id);
        }
      }

      console.log(
        `ECPay payment success: ${merchantTradeNo}, TradeNo: ${tradeNo}, Type: ${paymentType}`
      );
    } else {
      console.log(
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
