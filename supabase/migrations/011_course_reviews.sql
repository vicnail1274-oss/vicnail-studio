-- ============================================================
-- VicNail Studio — 課程評價系統
-- 已購買課程的學生可對課程留下星等評分 + 文字評論
-- 每個用戶每門課只能評論一次（可更新）
-- 執行：貼到 Supabase Dashboard > SQL Editor > Run
-- 執行順序：001 → ... → 010 → 011
-- ============================================================

CREATE TABLE IF NOT EXISTS course_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_reviews_course
  ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_user
  ON course_reviews(user_id);

-- ------------------------------------------------------------
-- updated_at 觸發器（沿用 001 的共用函數 update_updated_at）
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS course_reviews_updated_at ON course_reviews;
CREATE TRIGGER course_reviews_updated_at
  BEFORE UPDATE ON course_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;

-- 任何人可讀取評價（給課程詳情頁顯示）
DROP POLICY IF EXISTS "course_reviews_public_read" ON course_reviews;
CREATE POLICY "course_reviews_public_read"
  ON course_reviews FOR SELECT
  USING (true);

-- 已購買該課程的用戶可建立自己的評價
DROP POLICY IF EXISTS "course_reviews_insert_own_enrolled" ON course_reviews;
CREATE POLICY "course_reviews_insert_own_enrolled"
  ON course_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = course_reviews.course_id
        AND (e.expires_at IS NULL OR e.expires_at > now())
    )
  );

-- 已購買該課程的用戶可更新自己的評價
DROP POLICY IF EXISTS "course_reviews_update_own_enrolled" ON course_reviews;
CREATE POLICY "course_reviews_update_own_enrolled"
  ON course_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.user_id = auth.uid()
        AND e.course_id = course_reviews.course_id
        AND (e.expires_at IS NULL OR e.expires_at > now())
    )
  );

-- 用戶可刪除自己的評價
DROP POLICY IF EXISTS "course_reviews_delete_own" ON course_reviews;
CREATE POLICY "course_reviews_delete_own"
  ON course_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------
-- 課程評分摘要 view（平均分數 + 評論數）
-- security_invoker：依呼叫者權限套用底層 RLS（course_reviews 公開可讀）
-- ------------------------------------------------------------

CREATE OR REPLACE VIEW course_rating_summary AS
SELECT
  course_id,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating,
  COUNT(*)::int AS review_count
FROM course_reviews
GROUP BY course_id;

ALTER VIEW course_rating_summary SET (security_invoker = on);

GRANT SELECT ON course_rating_summary TO anon, authenticated;

-- ============================================================
-- 完成。驗證：
--  1) 未購買帳號 INSERT course_reviews → 應被 RLS 擋下
--  2) anon 查 course_rating_summary → 可讀
-- ============================================================
