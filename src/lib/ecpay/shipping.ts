/**
 * ECPay 物流：純運費常數與計算
 *
 * 這裡的東西不依賴 node crypto，可安全用於 client component（購物車/結帳頁），
 * 不會把 crypto polyfill 打進 client bundle。需要簽章（CheckMacValue）的物流
 * API 呼叫請見 ./logistics（server only）。
 */

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
export const LOGISTICS_SUB_TYPE: Record<string, string> = {
  cvs_711: "UNIMARTC2C",
  cvs_fami: "FAMIC2C",
  cvs_hilife: "HILIFEC2C",
  cvs_ok: "OKMARTC2C",
  home_tcat: "TCAT",
  home_post: "POST",
};

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
 * 運費基礎價
 */
export const BASE_SHIPPING_FEES: Record<LogisticsType, number> = {
  cvs_711: 65,
  cvs_fami: 65,
  cvs_hilife: 65,
  cvs_ok: 65,
  home_tcat: 120,
  home_post: 80,
  home_sf: 180,
  self_pickup: 0,
};

/**
 * 免運門檻（商品小計達此金額免運費）
 */
export const FREE_SHIPPING_THRESHOLD = 1500;

/**
 * 計算運費（考慮免運門檻）
 */
export function calculateShippingFee(
  type: LogisticsType,
  subtotal?: number
): number {
  const base = BASE_SHIPPING_FEES[type] ?? 0;
  if (base === 0) return 0;
  if (typeof subtotal === "number" && subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return base;
}
