import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// 需要登入才能訪問的路徑（locale 前綴後的路徑）
const PROTECTED_PATHS = ["/account", "/checkout", "/courses/"];

// 需要登入但只判斷 watch 子路徑
function isProtectedPath(pathname: string): boolean {
  const withoutLocale = pathname.replace(/^\/(zh-TW|en)/, "");
  return PROTECTED_PATHS.some((p) => withoutLocale.startsWith(p));
}

/** 簡單 hash 函數（admin cookie 驗證用） */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const salted = `vicnail_admin_${hash}_${input.length}`;
  let hash2 = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash2 = ((hash << 7) - hash2 + char) | 0;
  }
  return `vn_${Math.abs(hash).toString(36)}_${Math.abs(hash2).toString(36)}`;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // === 1. /admin 路由：只允許 localhost ===
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const host = req.headers.get("host") || "";
    const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
    if (!isLocal) return new NextResponse("Not Found", { status: 404 });

    if (pathname === "/admin/login") return NextResponse.next();

    const sessionToken = req.cookies.get("admin_token");
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || !sessionToken) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (sessionToken.value !== simpleHash(adminPassword)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // === 2. /api/auth 及 /api/v1 路由：放行 ===
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/v1")) {
    return NextResponse.next();
  }

  // === 3. Supabase session 刷新（所有非 admin 路由） ===
  const { supabaseResponse, user } = await updateSession(req);

  // === 4. 需要登入的頁面：未登入導向登入頁 ===
  if (isProtectedPath(pathname) && !user) {
    const locale = pathname.startsWith("/zh-TW") ? "zh-TW" : "en";
    const loginUrl = new URL(`/${locale}/auth/login`, req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // === 5. 已登入不能再訪問登入/註冊頁 ===
  const isAuthPage = /\/(zh-TW|en)\/auth\/(login|register)/.test(pathname);
  if (isAuthPage && user) {
    const locale = pathname.startsWith("/zh-TW") ? "zh-TW" : "en";
    return NextResponse.redirect(new URL(`/${locale}/account`, req.url));
  }

  // === 6. i18n routing ===
  const intlResponse = intlMiddleware(req);

  // 把 Supabase 的 cookie 合併到 intl 的 response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
