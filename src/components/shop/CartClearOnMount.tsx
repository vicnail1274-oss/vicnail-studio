"use client";

import { useEffect } from "react";
import { getCart, saveCart, getCartByType } from "@/lib/cart-store";

/**
 * 掛載時清空購物車中的「商品」（用於 /checkout/success 商品付款完成頁）
 * 只移除已結帳的商品項目，保留尚未結帳的課程，避免誤刪客人購物車裡的課程。
 */
export function CartClearOnMount() {
  useEffect(() => {
    saveCart(getCartByType(getCart(), "course"));
  }, []);
  return null;
}
