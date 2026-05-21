/**
 * 優惠碼折扣計算（client + server 共用）
 *
 * 主要驗證邏輯在 Postgres function `validate_promo_code`，
 * 這裡只負責「拿到驗證結果後展示折扣」與「前端 preview」。
 */

export type DiscountType = "percentage" | "fixed_amount" | "free";

export interface PromoCodeLite {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount: number;
}

export interface DiscountPreview {
  subtotal: number;
  discount: number;
  total: number;
}

/**
 * 計算套用優惠碼後的金額
 */
export function applyPromoCode(
  subtotal: number,
  promo: PromoCodeLite | null
): DiscountPreview {
  if (!promo || subtotal < promo.min_purchase_amount) {
    return { subtotal, discount: 0, total: subtotal };
  }

  let discount = 0;
  if (promo.discount_type === "percentage") {
    discount = Math.floor((subtotal * promo.discount_value) / 100);
  } else if (promo.discount_type === "fixed_amount") {
    discount = Math.min(promo.discount_value, subtotal);
  } else if (promo.discount_type === "free") {
    discount = subtotal;
  }

  return {
    subtotal,
    discount,
    total: Math.max(0, subtotal - discount),
  };
}

/**
 * 折扣顯示文字
 */
export function formatDiscount(promo: PromoCodeLite): string {
  if (promo.discount_type === "percentage") {
    return `${promo.discount_value}% 折扣`;
  }
  if (promo.discount_type === "fixed_amount") {
    return `折抵 NT$${promo.discount_value}`;
  }
  return "免費";
}
