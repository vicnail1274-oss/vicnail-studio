/**
 * ECPay 綠界物流整合
 * 支援：7-11 / 全家 / 萊爾富 / OK 超商取貨 + 黑貓宅配
 * 文件：https://developers.ecpay.com.tw/10075/
 */
import { generateCheckMacValue } from "./payment";

const LOGISTICS_BASE =
  process.env.ECPAY_SANDBOX === "true"
    ? "https://logistics-stage.ecpay.com.tw"
    : "https://logistics.ecpay.com.tw";

export type LogisticsType =
  | "cvs_711"
  | "cvs_fami"
  | "cvs_hilife"
  | "cvs_ok"
  | "home_tcat"
  | "home_post"
  | "home_sf"
  | "self_pickup";

// ECPay LogisticsSubType 對應
const LOGISTICS_SUB_TYPE: Record<string, string> = {
  cvs_711: "UNIMARTC2C",
  cvs_fami: "FAMIC2C",
  cvs_hilife: "HILIFEC2C",
  cvs_ok: "OKMARTC2C",
  home_tcat: "TCAT",
  home_post: "POST",
};

/**
 * 取得超商門市地圖 URL
 * 使用者選擇門市後，ECPay 會 POST 結果到 serverReplyUrl
 */
export function getCvsMapUrl(params: {
  logisticsType: "cvs_711" | "cvs_fami" | "cvs_hilife" | "cvs_ok";
  serverReplyUrl: string;
  isCollection?: boolean; // 是否代收貨款
}): { url: string; formParams: Record<string, string> } {
  const merchantId = process.env.ECPAY_MERCHANT_ID!;
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
  const merchantId = process.env.ECPAY_MERCHANT_ID!;
  const isCvs = params.logisticsType.startsWith("cvs_");

  const now = new Date();
  const tradeDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

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

/**
 * 物流類型的中文名稱
 */
export function getLogisticsLabel(type: LogisticsType): string {
  const labels: Record<LogisticsType, string> = {
    cvs_711: "7-11 超商取貨",
    cvs_fami: "全家超商取貨",
    cvs_hilife: "萊爾富超商取貨",
    cvs_ok: "OK 超商取貨",
    home_tcat: "黑貓宅急便",
    home_post: "中華郵政",
    home_sf: "順豐速運",
    self_pickup: "自取",
  };
  return labels[type] || type;
}

/**
 * 計算運費
 */
export function calculateShippingFee(type: LogisticsType): number {
  const fees: Record<LogisticsType, number> = {
    cvs_711: 65,
    cvs_fami: 65,
    cvs_hilife: 65,
    cvs_ok: 65,
    home_tcat: 120,
    home_post: 80,
    home_sf: 180,
    self_pickup: 0,
  };
  return fees[type] ?? 0;
}
