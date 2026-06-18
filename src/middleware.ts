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

/**
 * Edge runtime 版的 admin token 驗證（與 lib/admin-auth.ts 同一格式 / 同一 secret）。
 * middleware 跑在 Edge，不能用 node:crypto，改用 Web Crypto（crypto.subtle）。
 * token 格式：base64url(payloadJson).base64url(HMAC-SHA256)，payload = { exp }。
 */
function getAdminSessionSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  return `${process.env.ADMIN_PASSWORD ?? ""}:vicnail-admin-session`;
}

/** base64url → ArrayBuffer（直接回 ArrayBuffer，餵給 Web Crypto 不會撞 ArrayBufferLike 型別） */
function base64urlToArrayBuffer(input: string): ArrayBuffer {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

/** UTF-8 字串 → ArrayBuffer */
function utf8ToArrayBuffer(input: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(input);
  const buf = new ArrayBuffer(bytes.length);
  new Uint8Array(buf).set(bytes);
  return buf;
}

async function verifyAdminTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      utf8ToArrayBuffer(getAdminSessionSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64urlToArrayBuffer(sigB64),
      utf8ToArrayBuffer(payloadB64)
    );
    if (!valid) return false;

    const json = new TextDecoder().decode(base64urlToArrayBuffer(payloadB64));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== "number" || Date.now() >= payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // === 1. /admin 與 /api/admin 路由：驗 HMAC session token ===
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // 登入頁與登入 API 本身不需驗證（否則無法登入）
    if (pathname === "/admin/login" || pathname === "/api/admin/auth") {
      return NextResponse.next();
    }

    const isApi = pathname.startsWith("/api/admin");
    const authed = await verifyAdminTokenEdge(req.cookies.get("admin_token")?.value);
    if (!authed) {
      if (isApi) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // === 2. /api/auth 路由：放行 ===
  if (pathname.startsWith("/api/auth")) {
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
