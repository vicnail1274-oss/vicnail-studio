/**
 * 簡易 in-memory rate limiter
 * 用 LRU Map 避免記憶體無限成長；serverless 環境每個實例獨立計數
 * 正式大流量建議換成 Upstash Redis
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_KEYS = 10_000; // 超過就清最舊的
const buckets = new Map<string, Bucket>();

/**
 * 取得 request 的識別 IP（x-forwarded-for / x-real-ip / fallback）
 */
export function getClientIp(req: Request): string {
  const h = req.headers;
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return h.get("x-real-ip") || h.get("cf-connecting-ip") || "unknown";
}

/**
 * 檢查是否超過速率限制
 * @param key 唯一識別（如 `order:${ip}`）
 * @param limit 時間窗內允許次數
 * @param windowMs 時間窗毫秒
 * @returns { ok: false, retryAfter } 時已超限
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: boolean; remaining: number; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // LRU 清理
    if (buckets.size >= MAX_KEYS) {
      const oldest = buckets.keys().next().value;
      if (oldest) buckets.delete(oldest);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfter: 0 };
}
