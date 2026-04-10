"use client";

/**
 * 最近瀏覽商品追蹤（localStorage）
 * 用 productId 儲存（不是整個物件），避免舊資料過期
 */

const KEY = "vicnail_recently_viewed";
const MAX_ITEMS = 8;

export function addRecentlyViewed(productId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(KEY);
    let ids: string[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(ids)) ids = [];
    ids = ids.filter((id) => id !== productId);
    ids.unshift(productId);
    ids = ids.slice(0, MAX_ITEMS);
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
