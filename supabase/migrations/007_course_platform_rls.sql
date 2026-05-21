-- ============================================================
-- VicNail Studio — Course Platform RLS Policies (Phase 1)
-- 為新表設定 Row Level Security，並補強現有表 RLS
-- ============================================================

-- ------------------------------------------------------------
-- 1. promo_codes：公開可讀（驗證碼用），只有 service_role 能寫
-- ------------------------------------------------------------

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_codes_public_validate" ON promo_codes;
CREATE POLICY "promo_codes_public_validate" ON promo_codes
  FOR SELECT USING (
    is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND starts_at <= now()
  );

-- ------------------------------------------------------------
-- 2. promo_code_redemptions：使用者只能看自己的兌換
-- ------------------------------------------------------------

ALTER TABLE promo_code_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions_select_own" ON promo_code_redemptions;
CREATE POLICY "redemptions_select_own" ON promo_code_redemptions
  FOR SELECT USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 3. video_view_sessions：使用者只能看/操作自己的 session
-- ------------------------------------------------------------

ALTER TABLE video_view_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sessions_select_own" ON video_view_sessions;
CREATE POLICY "sessions_select_own" ON video_view_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_insert_own" ON video_view_sessions;
CREATE POLICY "sessions_insert_own" ON video_view_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "sessions_update_own" ON video_view_sessions;
CREATE POLICY "sessions_update_own" ON video_view_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 4. enrollments：補 INSERT/UPDATE policy（原本只有 SELECT）
--    Service role 才能 INSERT（透過 ECPay callback）
--    User 可以 UPDATE 自己的 last_accessed_at
-- ------------------------------------------------------------

DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
CREATE POLICY "enrollments_update_own" ON enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 5. lessons：限制非預覽課需要購買才能讀 video 欄位
--    SELECT 公開（讓詳情頁能列出章節清單），但播放必須驗 enrollment
--    （播放權檢查交給 API 層處理，不靠 RLS）
-- ------------------------------------------------------------

-- lessons_public_read 已存在於 001，這裡不重設

-- ------------------------------------------------------------
-- 6. courses：補 INSERT/UPDATE/DELETE policy（admin 用 service_role）
--    純讀取 status='published' 已在 001 設定
-- ------------------------------------------------------------

-- ------------------------------------------------------------
-- 7. Helper view：包裝「我的課程」列表（給學生中心用）
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW my_enrolled_courses AS
SELECT
  e.user_id,
  e.course_id,
  c.slug,
  c.title,
  c.description,
  c.thumbnail_url,
  c.total_lessons,
  c.total_duration_seconds,
  c.level,
  c.instructor_name,
  e.purchased_at,
  e.expires_at,
  e.last_accessed_at,
  (
    SELECT COUNT(*) FROM lesson_progress lp
    JOIN lessons l ON l.id = lp.lesson_id
    WHERE l.course_id = c.id AND lp.user_id = e.user_id AND lp.completed = true
  ) AS completed_lessons,
  CASE
    WHEN c.total_lessons = 0 THEN 0
    ELSE ROUND(100.0 * (
      SELECT COUNT(*) FROM lesson_progress lp
      JOIN lessons l ON l.id = lp.lesson_id
      WHERE l.course_id = c.id AND lp.user_id = e.user_id AND lp.completed = true
    ) / c.total_lessons, 1)
  END AS progress_percentage
FROM enrollments e
JOIN courses c ON c.id = e.course_id
WHERE e.expires_at IS NULL OR e.expires_at > now();

GRANT SELECT ON my_enrolled_courses TO authenticated;

-- ------------------------------------------------------------
-- 8. Function：驗證並回傳優惠碼資訊（給 API 層用）
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_user_id UUID,
  p_subtotal INTEGER,
  p_course_ids UUID[] DEFAULT '{}',
  p_product_ids UUID[] DEFAULT '{}'
)
RETURNS TABLE (
  valid BOOLEAN,
  promo_id UUID,
  discount_amount INTEGER,
  reason TEXT
) AS $$
DECLARE
  pc RECORD;
  used_by_user INTEGER;
  calculated_discount INTEGER;
BEGIN
  SELECT * INTO pc FROM promo_codes WHERE code = UPPER(p_code) LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, '優惠碼不存在'::TEXT;
    RETURN;
  END IF;

  IF NOT pc.is_active THEN
    RETURN QUERY SELECT false, pc.id, 0, '優惠碼已停用'::TEXT;
    RETURN;
  END IF;

  IF pc.starts_at > now() THEN
    RETURN QUERY SELECT false, pc.id, 0, '優惠碼尚未開放使用'::TEXT;
    RETURN;
  END IF;

  IF pc.expires_at IS NOT NULL AND pc.expires_at < now() THEN
    RETURN QUERY SELECT false, pc.id, 0, '優惠碼已過期'::TEXT;
    RETURN;
  END IF;

  IF pc.max_uses IS NOT NULL AND pc.used_count >= pc.max_uses THEN
    RETURN QUERY SELECT false, pc.id, 0, '優惠碼使用次數已滿'::TEXT;
    RETURN;
  END IF;

  SELECT COUNT(*) INTO used_by_user FROM promo_code_redemptions
    WHERE promo_code_id = pc.id AND user_id = p_user_id;

  IF used_by_user >= pc.max_uses_per_user THEN
    RETURN QUERY SELECT false, pc.id, 0, '您已使用過此優惠碼'::TEXT;
    RETURN;
  END IF;

  IF p_subtotal < pc.min_purchase_amount THEN
    RETURN QUERY SELECT false, pc.id, 0,
      ('最低消費金額為 NT$' || pc.min_purchase_amount)::TEXT;
    RETURN;
  END IF;

  -- 計算折扣
  IF pc.discount_type = 'percentage' THEN
    calculated_discount := (p_subtotal * pc.discount_value / 100);
  ELSIF pc.discount_type = 'fixed_amount' THEN
    calculated_discount := LEAST(pc.discount_value, p_subtotal);
  ELSIF pc.discount_type = 'free' THEN
    calculated_discount := p_subtotal;
  ELSE
    calculated_discount := 0;
  END IF;

  RETURN QUERY SELECT true, pc.id, calculated_discount, '驗證成功'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION validate_promo_code TO authenticated;

-- ============================================================
-- 完成。下一步：執行 008_seed_courses.sql 灌入課程基礎資料
-- ============================================================
