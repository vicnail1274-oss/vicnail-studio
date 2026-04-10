"use client";

/**
 * 願望清單 Client-side Store（localStorage）
 * 只存 productId，渲染時去 /api/products/by-ids 拉最新資料，避免改價後過期
 */

const WISHLIST_KEY = "vicnail_wishlist";
const MAX_WISHLIST_ITEMS = 200;

function isValidId(x: unknown): x is string {
  return typeof x === "string" && x.length > 0 && x.length <= 64;
}

export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidId).slice(0, MAX_WISHLIST_ITEMS);
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  const sanitized = ids.filter(isValidId).slice(0, MAX_WISHLIST_ITEMS);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(sanitized));
  window.dispatchEvent(new Event("wishlist-updated"));
}

export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId);
}

export function addToWishlist(productId: string) {
  if (!isValidId(productId)) return;
  const list = getWishlist();
  if (list.includes(productId)) return;
  list.unshift(productId);
  saveWishlist(list);
}

export function removeFromWishlist(productId: string) {
  saveWishlist(getWishlist().filter((id) => id !== productId));
}

export function toggleWishlist(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  }
  addToWishlist(productId);
  return true;
}

export function clearWishlist() {
  saveWishlist([]);
}

export function getWishlistCount(): number {
  return getWishlist().length;
}
