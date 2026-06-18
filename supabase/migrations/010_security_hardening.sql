-- ============================================================
-- VicNail Studio — Security Hardening（安全審查 2026-06-18）
-- 執行：Supabase Dashboard > SQL Editor > Run
-- ------------------------------------------------------------
-- C-1：lessons 欄位級權限——影片識別欄位只有 server service-role 能讀
-- C-2：my_enrolled_courses view 改 security_invoker（套用底層 RLS，不洩漏他人購買）
-- H-4：validate_promo_code 只允許 service_role 呼叫（前端不可 RPC 探測）
-- ============================================================

-- ------------------------------------------------------------
-- C-1: 收回 lessons 全表 SELECT，只開放非敏感 metadata 欄位
--      video_id / bunny_video_id / hls_url 不開放給 anon/authenticated
--      （播放一律走 /api/lessons/[id]/playback-token，server 用 service-role 讀）
-- ------------------------------------------------------------
REVOKE SELECT ON lessons FROM anon, authenticated;
GRANT SELECT (
  id, course_id, title, description, duration_seconds, sort_order,
  is_preview, created_at, thumbnail_url, attachments, resolution_height,
  upload_status, uploaded_at
) ON lessons TO anon, authenticated;

-- ------------------------------------------------------------
-- C-2: view 依「呼叫者」權限執行，套用底層 enrollments 的 RLS
--      （PG15+ 支援；Supabase 適用）
-- ------------------------------------------------------------
ALTER VIEW my_enrolled_courses SET (security_invoker = on);

-- ------------------------------------------------------------
-- H-4: 優惠碼驗證函數收回 authenticated 執行權，只留 service_role
--      （/api/promo-codes/validate 與 checkout 都以 admin client 呼叫，不受影響）
-- ------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION validate_promo_code(text, uuid, integer, uuid[], uuid[]) FROM authenticated;

-- ============================================================
-- 完成。驗證：
--  1) 用 anon key 跑 select bunny_video_id from lessons → 應 permission denied
--  2) 兩個帳號各自查 my_enrolled_courses → 只看到自己的列
--  3) 前端 supabase.rpc('validate_promo_code') → 應 permission denied（API 仍正常）
-- ============================================================
