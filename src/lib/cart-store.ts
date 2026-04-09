"use client";

/**
 * 購物車 Client-side Store（localStorage + React state）
 * 未登入用 localStorage，登入後同步到 Supabase
 */

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  salePrice?: number;
  image?: string;
  variant?: Record<string, string>;
  quantity: number;
}

const CART_KEY = "vicnail_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(item: CartItem) {
  const cart = getCart();
  const key = `${item.productId}_${JSON.stringify(item.variant || {})}`;
  const existing = cart.find(
    (c) => `${c.productId}_${JSON.stringify(c.variant || {})}` === key
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
}

export function updateCartQuantity(productId: string, variant: Record<string, string> | undefined, quantity: number) {
  const cart = getCart();
  const key = `${productId}_${JSON.stringify(variant || {})}`;
  const idx = cart.findIndex(
    (c) => `${c.productId}_${JSON.stringify(c.variant || {})}` === key
  );
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
    saveCart(cart);
  }
}

export function removeFromCart(productId: string, variant?: Record<string, string>) {
  const cart = getCart();
  const key = `${productId}_${JSON.stringify(variant || {})}`;
  const filtered = cart.filter(
    (c) => `${c.productId}_${JSON.stringify(c.variant || {})}` !== key
  );
  saveCart(filtered);
}

export function clearCart() {
  saveCart([]);
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => {
    const price = item.salePrice ?? item.price;
    return sum + price * item.quantity;
  }, 0);
}

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
