-- 017_security_hardening_2.sql
-- 擴大徹查（2026-06-21）發現的 RLS / 函式授權強化。
-- 全部用 IF EXISTS / 動態查 pg_proc 保護，未套用過的 migration（如 009）不存在的物件會被自動跳過，可安全重複執行。
-- 套用方式：Supabase Dashboard → SQL Editor 貼上整段執行。

-- ─────────────────────────────────────────────────────────────
-- P0：002 電子報 email 對 anon 外洩
-- RLS 是列級無法限欄位，改用「欄位級 GRANT」：anon 仍可 count(id) 顯示人數，但讀不到 email。
-- （比照 010 對 lessons 的欄位級收斂做法）
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'newsletter_subscribers') THEN
    REVOKE SELECT ON public.newsletter_subscribers FROM anon, authenticated;
    GRANT SELECT (id, is_active, subscribed_at) ON public.newsletter_subscribers TO anon, authenticated;
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- P0：009 庫存函式 set_stocktake / adjust_stock 預設對 PUBLIC 開放
-- （SECURITY DEFINER 會繞過 RLS 任意改庫存）→ 收回，只留 service_role。
-- 009 若尚未套用 production，下列 LOOP 找不到函式自動跳過。
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN ('set_stocktake', 'adjust_stock')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM public, anon, authenticated', r.proname, r.args);
    EXECUTE format('GRANT EXECUTE ON FUNCTION public.%I(%s) TO service_role', r.proname, r.args);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- P1：008 increment_promo_used_count 過度授權 authenticated
-- （任一登入者可狂打把 used_count 灌到 max_uses 使優惠碼對所有人失效）→ 收回 authenticated。
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'increment_promo_used_count'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM public, authenticated', r.proname, r.args);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- P1：SECURITY DEFINER 函式補 search_path（防 search_path 注入；014 只修了 handle_new_user）
-- ─────────────────────────────────────────────────────────────
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- 只處理 SECURITY DEFINER
      AND p.proname IN (
        'set_stocktake', 'adjust_stock', 'increment_promo_used_count',
        'grant_course_enrollments_from_order', 'record_promo_redemption',
        'decrement_stock_batch', 'expire_stale_video_sessions',
        'user_has_course_access', 'update_product_reviews_updated_at', 'update_updated_at'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public', r.proname, r.args);
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────
-- P1：003 group_buy_items 過寬 USING(true) → 洩漏未上架/已結束團購的底價
-- 改為只公開「進行中/即將開始」團購的品項。
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'group_buy_items') THEN
    DROP POLICY IF EXISTS "group_buy_items_public_read" ON public.group_buy_items;
    CREATE POLICY "group_buy_items_public_read" ON public.group_buy_items FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.group_buys gb
        WHERE gb.id = group_buy_id AND gb.status IN ('active', 'upcoming')
      ));
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- P1：005 product_rating_summary view 未設 security_invoker（應比照 011 course_rating_summary）
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.views
             WHERE table_schema = 'public' AND table_name = 'product_rating_summary') THEN
    ALTER VIEW public.product_rating_summary SET (security_invoker = on);
  END IF;
END $$;
