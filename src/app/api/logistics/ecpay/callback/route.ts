import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyCallback } from "@/lib/ecpay/payment";

/**
 * ECPay 物流狀態更新回呼
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const body: Record<string, string> = {};
    formData.forEach((value, key) => {
      body[key] = String(value);
    });

    if (!verifyCallback(body)) {
      return new NextResponse("0|CheckMacValue Error", { status: 400 });
    }

    const merchantTradeNo = body.MerchantTradeNo;
    const logisticsStatus = body.RtnCode;
    const logisticsMsg = body.RtnMsg;
    const allPayLogisticsID = body.AllPayLogisticsID;

    const admin = await createAdminClient();

    // 找到對應訂單
    const { data: orders } = await admin
      .from("orders")
      .select("id")
      .or(`logistics_id.eq.${allPayLogisticsID},order_number.like.%${merchantTradeNo}%`)
      .limit(1);

    if (orders?.[0]) {
      const updateData: Record<string, string | null> = {
        logistics_status: `${logisticsStatus}: ${logisticsMsg}`,
        logistics_id: allPayLogisticsID,
      };

      // 如果物流狀態為已送達，更新訂單狀態
      if (logisticsStatus === "2067" || logisticsStatus === "3024") {
        // 2067: 超商已收到, 3024: 黑貓已送達
        updateData.status = "shipped";
        updateData.shipped_at = new Date().toISOString();
      }

      await admin
        .from("orders")
        .update(updateData)
        .eq("id", orders[0].id);
    }

    console.log(
      `ECPay logistics update: ${merchantTradeNo}, Status: ${logisticsStatus}, Msg: ${logisticsMsg}`
    );

    return new NextResponse("1|OK");
  } catch (err) {
    console.error("ECPay logistics callback error:", err);
    return new NextResponse("0|Error", { status: 500 });
  }
}
