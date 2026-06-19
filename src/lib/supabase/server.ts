import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Server Component / API Route 用的 Supabase client
 * 每次 request 都要呼叫此函式建立新實例
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component 中無法寫 cookie，忽略
          }
        },
      },
    }
  );
}

/**
 * 使用 service_role key 的管理員 client
 * 只在 API routes 使用，絕不暴露給前端
 */
export async function createAdminClient() {
  // 純 service_role client：絕不可帶使用者 cookie/session。
  // createServerClient 若讀到使用者 auth cookie，會用該使用者 JWT 當 Authorization bearer，
  // 使有效角色從 service_role 降為 authenticated → 讀不到 bunny_video_id 等受限欄位、
  // 也無法繞過 RLS（播放憑證會 404、訂單/庫存等 admin 寫入也會失敗）。
  // 回傳空 cookies 讓 client 改用 service_role 金鑰本身作為 bearer。
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
}
