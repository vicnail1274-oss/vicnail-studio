-- ============================================================
-- VicNail Studio — Course Platform Extensions (Phase 1)
-- 擴充 courses / lessons / enrollments / orders，新增優惠碼與裝置 session
-- 執行：貼到 Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. 擴充 courses
-- ------------------------------------------------------------

ALTER TABLE courses ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS what_youll_learn JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS target_audience JSONB DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner','intermediate','advanced','all'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_name TEXT DEFAULT 'Vic 老師';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS instructor_bio TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover_video_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_lessons INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_status_featured ON courses(status, featured);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);

-- ------------------------------------------------------------
-- 2. 擴充 lessons（影片託管欄位）
-- ------------------------------------------------------------

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS bunny_video_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS hls_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resolution_height INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS upload_status TEXT DEFAULT 'pending'
  CHECK (upload_status IN ('pending','uploading','processing','ready','failed'));
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_lessons_course_sort ON lessons(course_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_bunny_video_id ON lessons(bunny_video_id);

-- ------------------------------------------------------------
-- 3. 擴充 enrollments（裝置限制 + 來源追蹤）
-- ------------------------------------------------------------

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS device_limit INTEGER DEFAULT 2;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'purchase'
  CHECK (source IN ('purchase','gift','promo_free','manual_grant'));
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ------------------------------------------------------------
-- 4. 擴充 lesson_progress（記錄秒數位置）
-- ------------------------------------------------------------

ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS position_seconds INTEGER DEFAULT 0;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS total_watch_seconds INTEGER DEFAULT 0;
ALTER TABLE lesson_progress ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);

-- ------------------------------------------------------------
-- 5. 擴充 orders（優惠碼整合）
-- ------------------------------------------------------------

ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_total INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id UUID;

-- ------------------------------------------------------------
-- 6. 新表 promo_codes（優惠碼）
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed_amount','free')),
  discount_value INTEGER NOT NULL,
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all','courses','products','specific')),
  applicable_course_ids JSONB DEFAULT '[]',
  applicable_product_ids JSONB DEFAULT '[]',
  min_purchase_amount INTEGER DEFAULT 0,
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active, expires_at);

ALTER TABLE orders ADD CONSTRAINT fk_orders_promo_code
  FOREIGN KEY (promo_code_id) REFERENCES promo_codes(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 7. 新表 promo_code_redemptions（兌換記錄）
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_redemptions_promo ON promo_code_redemptions(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON promo_code_redemptions(user_id);

-- ------------------------------------------------------------
-- 8. 新表 video_view_sessions（限 2 裝置）
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS video_view_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT NOT NULL,
  device_label TEXT,
  user_agent TEXT,
  ip_address TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_heartbeat_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON video_view_sessions(user_id, is_active, last_heartbeat_at);
CREATE INDEX IF NOT EXISTS idx_sessions_user_device ON video_view_sessions(user_id, device_fingerprint);

-- ------------------------------------------------------------
-- 9. Trigger：自動算 courses.total_lessons + total_duration_seconds
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalc_course_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_course_id UUID;
BEGIN
  target_course_id := COALESCE(NEW.course_id, OLD.course_id);
  UPDATE courses SET
    total_lessons = (SELECT COUNT(*) FROM lessons WHERE course_id = target_course_id),
    total_duration_seconds = (SELECT COALESCE(SUM(duration_seconds), 0) FROM lessons WHERE course_id = target_course_id),
    updated_at = now()
  WHERE id = target_course_id;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS lessons_recalc_course_stats ON lessons;
CREATE TRIGGER lessons_recalc_course_stats
  AFTER INSERT OR UPDATE OR DELETE ON lessons
  FOR EACH ROW EXECUTE FUNCTION recalc_course_stats();

-- ------------------------------------------------------------
-- 10. updated_at triggers for new/changed tables
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS promo_codes_updated_at ON promo_codes;
CREATE TRIGGER promo_codes_updated_at BEFORE UPDATE ON promo_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- 11. Function：清理 90 秒無心跳的 sessions（cron 用，但 query 時也會過濾）
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION expire_stale_video_sessions()
RETURNS INTEGER AS $$
DECLARE
  affected INTEGER;
BEGIN
  UPDATE video_view_sessions
  SET is_active = false, ended_at = now()
  WHERE is_active = true
    AND last_heartbeat_at < now() - INTERVAL '90 seconds';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 12. Function：檢查使用者是否有課程觀看權
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION user_has_course_access(p_user_id UUID, p_course_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM enrollments
    WHERE user_id = p_user_id
      AND course_id = p_course_id
      AND (expires_at IS NULL OR expires_at > now())
  ) INTO has_access;
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 完成。下一步：執行 007_course_platform_rls.sql 設定權限
-- ============================================================
