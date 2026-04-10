"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

/**
 * 掛載時清空購物車（用於 /checkout/success 頁面）
 * 付款完成後，確保前端 localStorage 購物車被清空。
 */
export function CartClearOnMount() {
  useEffect(() => {
    clearCart();
  }, []);
  return null;
}
