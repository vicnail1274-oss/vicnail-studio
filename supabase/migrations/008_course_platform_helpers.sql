-- ============================================================
-- VicNail Studio — Course Platform Helpers (Phase 1 收尾)
-- 補上 atomic increment + enrollment grant helper
-- ============================================================

-- ------------------------------------------------------------
-- 1. promo_codes.used_count 原子遞增（避免 race condition）
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION increment_promo_used_count(p_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE promo_codes
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = p_id
  RETURNING used_count INTO new_count;
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_promo_used_count TO authenticated, service_role;

-- ------------------------------------------------------------
-- 2. 付款成功後批量 grant enrollments（從 order_items 撈 course）
--    回傳：成功建立或已存在的 course_id 數量
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION grant_course_enrollments_from_order(p_order_id UUID)
RETURNS INTEGER AS $$
DECLARE
  target_user_id UUID;
  granted_count INTEGER := 0;
BEGIN
  -- 取得 order 對應的 user
  SELECT user_id INTO target_user_id FROM orders WHERE id = p_order_id;

  IF target_user_id IS NULL THEN
    RETURN 0;  -- 訪客訂單不建 enrollment
  END IF;

  -- upsert enrollments（onConflict user+course）
  INSERT INTO enrollments (user_id, course_id, order_id, source)
  SELECT
    target_user_id,
    oi.item_id,
    p_order_id,
    'purchase'
  FROM order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.item_type = 'course'
  ON CONFLICT (user_id, course_id) DO UPDATE
    SET order_id = EXCLUDED.order_id,
        purchased_at = COALESCE(enrollments.purchased_at, now());

  GET DIAGNOSTICS granted_count = ROW_COUNT;
  RETURN granted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION grant_course_enrollments_from_order TO service_role;

-- ------------------------------------------------------------
-- 3. 記錄 promo code 兌換（idempotent — 同 order 不重複）
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION record_promo_redemption(
  p_promo_id UUID,
  p_user_id UUID,
  p_order_id UUID,
  p_discount_amount INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  already_recorded BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM promo_code_redemptions
    WHERE promo_code_id = p_promo_id AND order_id = p_order_id
  ) INTO already_recorded;

  IF already_recorded THEN
    RETURN false;
  END IF;

  INSERT INTO promo_code_redemptions (promo_code_id, user_id, order_id, discount_amount)
  VALUES (p_promo_id, p_user_id, p_order_id, p_discount_amount);

  PERFORM increment_promo_used_count(p_promo_id);
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION record_promo_redemption TO service_role;

-- ============================================================
-- 完成。後續執行順序：
--   001 → 002 → 003 → 004 → 005 → 006 → 007 → 008
-- ============================================================
