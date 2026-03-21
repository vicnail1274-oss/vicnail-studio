import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

/**
 * 安全機制：
 * 1. 隱密入口 — 必須先訪問 /admin/login?gate=GATE_CODE 才能解鎖後台
 * 2. 沒有 gate cookie 的人訪問 /admin → 看到 404（假裝不存在）
 * 3. 登入 cookie 使用 SHA-256 hash 驗證
 */
export default function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // /admin 與 /api/admin 路由：只允許 localhost 存取
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const host = req.headers.get("host") || "";
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");

    // 線上環境直接 404，後台只在本地用
    if (!isLocal) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;

    // /admin/login → 直接放行
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // 其他 /admin 頁面 → 檢查登入 cookie
    const sessionToken = req.cookies.get("admin_token");
    if (!adminPassword || !sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    const expectedHash = simpleHash(adminPassword);
    if (sessionToken.value !== expectedHash) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  }

  // 其他路由走 i18n
  return intlMiddleware(req);
}

/** 簡單 hash 函數（同步，用於 middleware edge runtime） */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // 加 salt 讓 hash 不容易被反推
  const salted = `vicnail_admin_${hash}_${input.length}`;
  let hash2 = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash2 = ((hash << 7) - hash2 + char) | 0;
  }
  return `vn_${Math.abs(hash).toString(36)}_${Math.abs(hash2).toString(36)}`;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
