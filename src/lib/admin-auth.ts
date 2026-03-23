import { NextRequest } from "next/server";

/**
 * 與 middleware 相同的 hash 函數。
 * Cookie 中存的是 hash 值，不是原始密碼。
 */
export function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  const salted = `vicnail_admin_${hash}_${input.length}`;
  let hash2 = 0;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash2 = ((hash2 << 7) - hash2 + char) | 0;
  }
  return `vn_${Math.abs(hash).toString(36)}_${Math.abs(hash2).toString(36)}`;
}

/** 檢查 admin API 請求是否已驗證 */
export function isAdminAuthed(req: NextRequest): boolean {
  const token = req.cookies.get("admin_token");
  const password = process.env.ADMIN_PASSWORD;
  if (!token || !password) return false;
  return token.value === simpleHash(password);
}
