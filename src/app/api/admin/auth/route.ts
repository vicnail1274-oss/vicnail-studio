import { NextRequest, NextResponse } from "next/server";
import { simpleHash } from "@/lib/admin-auth";

// === 速率限制：防暴力破解 ===
// IP → { count, blockedUntil }
const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();

const MAX_ATTEMPTS = 5;        // 5 次失敗
const BLOCK_DURATION = 15 * 60 * 1000; // 鎖 15 分鐘

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { blocked: boolean; remaining: number; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return { blocked: false, remaining: MAX_ATTEMPTS };

  // 封鎖期間
  if (record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { blocked: true, remaining: 0, retryAfter };
  }

  // 封鎖已過期，重設
  if (record.blockedUntil > 0 && record.blockedUntil <= now) {
    loginAttempts.delete(ip);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  return { blocked: false, remaining: MAX_ATTEMPTS - record.count };
}

function recordFailedAttempt(ip: string) {
  const record = loginAttempts.get(ip) || { count: 0, blockedUntil: 0 };
  record.count++;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION;
  }
  loginAttempts.set(ip, record);
}

function clearAttempts(ip: string) {
  loginAttempts.delete(ip);
}

// POST /api/admin/auth — 登入
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  const rateCheck = checkRateLimit(ip);

  if (rateCheck.blocked) {
    return NextResponse.json(
      { error: `嘗試次數過多，請 ${rateCheck.retryAfter} 秒後再試` },
      { status: 429 }
    );
  }

  const { password } = await req.json();
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || password !== expected) {
    recordFailedAttempt(ip);
    const remaining = MAX_ATTEMPTS - (loginAttempts.get(ip)?.count || 0);

    return NextResponse.json(
      {
        error:
          remaining > 0
            ? `密碼錯誤，還剩 ${remaining} 次嘗試`
            : `嘗試次數過多，帳號已鎖定 15 分鐘`,
      },
      { status: 401 }
    );
  }

  // 登入成功 → 清除失敗記錄，設定 hash cookie
  clearAttempts(ip);

  const tokenHash = simpleHash(expected);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", tokenHash, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 小時自動登出
    sameSite: "lax",
  });
  return res;
}

// DELETE /api/admin/auth — 登出
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("admin_token");
  res.cookies.delete("admin_gate");
  return res;
}
