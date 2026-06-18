import { NextRequest } from "next/server";
import crypto from "crypto";

/**
 * Admin session token：HMAC-SHA256 簽發。
 * 格式：base64url(payloadJson).base64url(hmac)
 * payload = { exp: <到期毫秒時間戳> }
 *
 * secret 取 ADMIN_SESSION_SECRET，無則退回 `${ADMIN_PASSWORD}:vicnail-admin-session`。
 *
 * 注意：本檔使用 node:crypto，僅供 Node runtime 的 API route 使用。
 * middleware（Edge runtime）自行以 Web Crypto 驗證相同格式的 token。
 */

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

function getSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  return `${process.env.ADMIN_PASSWORD ?? ""}:vicnail-admin-session`;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function hmac(payloadB64: string): Buffer {
  return crypto.createHmac("sha256", getSecret()).update(payloadB64).digest();
}

/** 簽發新的 admin session token（7 天有效） */
export function createAdminToken(): string {
  const payload = JSON.stringify({ exp: Date.now() + SESSION_TTL_MS });
  const payloadB64 = base64url(Buffer.from(payload, "utf-8"));
  const sigB64 = base64url(hmac(payloadB64));
  return `${payloadB64}.${sigB64}`;
}

/**
 * 驗證 admin session token：
 * - 格式錯誤一律 false
 * - HMAC 以 timingSafeEqual 比對
 * - 檢查 exp 未過期
 */
export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  } catch {
    return false;
  }

  const expectedSig = hmac(payloadB64);
  if (providedSig.length !== expectedSig.length) return false;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return false;

  try {
    const json = Buffer.from(payloadB64.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return false;
  } catch {
    return false;
  }

  return true;
}

/** 檢查 admin API 請求是否已驗證（沿用既有匯出名，供各 admin route import） */
export function isAdminAuthed(req: NextRequest): boolean {
  return verifyAdminToken(req.cookies.get("admin_token")?.value);
}
