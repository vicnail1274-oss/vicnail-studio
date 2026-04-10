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

    // 找到對應訂單：優先用 logistics_id 精確匹配
    let orderRow: { id: string; status: string; shipped_at: string | null } | null = null;

    if (allPayLogisticsID) {
      const { data } = await admin
        .from("orders")
        .select("id, status, shipped_at")
        .eq("logistics_id", allPayLogisticsID)
        .limit(1);
      if (data?.[0]) orderRow = data[0];
    }

    // fallback: 用 order_number 精確匹配
    if (!orderRow && merchantTradeNo) {
      const { data } = await admin
        .from("orders")
        .select("id, status, shipped_at")
        .eq("order_number", merchantTradeNo)
        .limit(1);
      if (data?.[0]) orderRow = data[0];
    }

    if (!orderRow) {
      console.error("ECPay logistics callback: no order found", { allPayLogisticsID, merchantTradeNo });
    } else {
      const updateData: Record<string, string | null> = {
        logistics_status: `${logisticsStatus}: ${logisticsMsg}`,
        logistics_id: allPayLogisticsID,
      };

      // 物流已送達 → 進展到 shipped（只允許 paid → shipped，不倒退 completed/cancelled/refunded）
      const shippedCodes = new Set(["2067", "3024"]); // 2067: 超商已收到, 3024: 黑貓已送達
      if (
        shippedCodes.has(logisticsStatus) &&
        orderRow.status === "paid" &&
        !orderRow.shipped_at
      ) {
        updateData.status = "shipped";
        updateData.shipped_at = new Date().toISOString();
      }

      await admin.from("orders").update(updateData).eq("id", orderRow.id);
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
