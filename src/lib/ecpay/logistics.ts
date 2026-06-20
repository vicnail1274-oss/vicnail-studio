/**
 * ECPay 綠界物流整合（server only — 含 CheckMacValue 簽章）
 * 支援：7-11 / 全家 / 萊爾富 / OK 超商取貨 + 黑貓宅配
 * 文件：https://developers.ecpay.com.tw/10075/
 *
 * 注意：本檔 import ./payment（含 node crypto），僅供 server 端使用。
 * 純運費常數/計算（client 也會用到的部分）已抽到 ./shipping（不含 crypto），
 * 避免 crypto polyfill 被打進 /cart、/checkout 的 client bundle。
 */
import { generateCheckMacValue } from "./payment";
import { LOGISTICS_SUB_TYPE, type LogisticsType } from "./shipping";

// 純運費常數/計算 re-export，維持既有 "@/lib/ecpay/logistics" import 路徑相容（server 端）
export * from "./shipping";

const LOGISTICS_BASE =
  process.env.ECPAY_SANDBOX === "true"
    ? "https://logistics-stage.ecpay.com.tw"
    : "https://logistics.ecpay.com.tw";

/**
 * 取得超商門市地圖 URL
 * 使用者選擇門市後，ECPay 會 POST 結果到 serverReplyUrl
 */
export function getCvsMapUrl(params: {
  logisticsType: "cvs_711" | "cvs_fami" | "cvs_hilife" | "cvs_ok";
  serverReplyUrl: string;
  isCollection?: boolean; // 是否代收貨款
}): { url: string; formParams: Record<string, string> } {
  const merchantId = process.env.ECPAY_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("Missing ECPAY_MERCHANT_ID environment variable");
  }
  const subType = LOGISTICS_SUB_TYPE[params.logisticsType];

  const formParams: Record<string, string> = {
    MerchantID: merchantId,
    LogisticsType: "CVS",
    LogisticsSubType: subType,
    IsCollection: params.isCollection ? "Y" : "N",
    ServerReplyURL: params.serverReplyUrl,
  };

  return {
    url: `${LOGISTICS_BASE}/Express/map`,
    formParams,
  };
}

interface CreateShipmentParams {
  orderId: string;
  logisticsType: LogisticsType;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  // 超商取貨用
  receiverStoreId?: string;
  // 宅配用
  receiverAddress?: string;
  receiverZipCode?: string;
  // 商品
  goodsAmount: number;
  goodsName?: string;
  isCollection?: boolean; // 貨到付款
  serverReplyUrl: string;
}

/**
 * 建立物流訂單（超商取貨 or 宅配）
 */
export async function createShipment(
  params: CreateShipmentParams
): Promise<{ success: boolean; data?: Record<string, string>; error?: string }> {
  const merchantId = process.env.ECPAY_MERCHANT_ID;
  if (!merchantId) {
    throw new Error("Missing ECPAY_MERCHANT_ID environment variable");
  }
  const isCvs = params.logisticsType.startsWith("cvs_");

  // 明確使用台灣時區
  const now = new Date();
  const twFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = twFormatter.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value || "00";
  const tradeDate = `${get("year")}/${get("month")}/${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;

  const body: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: params.orderId.replace(/-/g, "").slice(0, 20),
    MerchantTradeDate: tradeDate,
    LogisticsType: isCvs ? "CVS" : "Home",
    LogisticsSubType: LOGISTICS_SUB_TYPE[params.logisticsType] || "",
    GoodsAmount: String(params.goodsAmount),
    GoodsName: params.goodsName || "VicNail 商品",
    SenderName: params.senderName,
    SenderCellPhone: params.senderPhone,
    ReceiverName: params.receiverName,
    ReceiverCellPhone: params.receiverPhone,
    ServerReplyURL: params.serverReplyUrl,
    IsCollection: params.isCollection ? "Y" : "N",
  };

  if (isCvs && params.receiverStoreId) {
    body.ReceiverStoreID = params.receiverStoreId;
  }
  if (!isCvs && params.receiverAddress) {
    body.ReceiverAddress = params.receiverAddress;
    if (params.receiverZipCode) {
      body.ReceiverZipCode = params.receiverZipCode;
    }
  }

  body.CheckMacValue = generateCheckMacValue(body);

  const endpoint = `${LOGISTICS_BASE}/Express/Create`;
  const formData = new URLSearchParams(body);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const text = await res.text();
    // ECPay 回傳格式：key1=value1&key2=value2
    const result: Record<string, string> = {};
    text.split("&").forEach((pair) => {
      const [k, v] = pair.split("=");
      if (k) result[k] = decodeURIComponent(v || "");
    });

    if (result.RtnCode === "1") {
      return { success: true, data: result };
    }
    return { success: false, error: result.RtnMsg || text };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
