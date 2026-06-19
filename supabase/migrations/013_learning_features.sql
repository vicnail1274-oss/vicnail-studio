-- ============================================================
-- VicNail Studio — 學習功能擴充（第四批 B）
-- 013_learning_features.sql
-- 章節分組 course_sections + lessons.section_id
-- 學習筆記 lesson_notes / 書籤 lesson_bookmarks（時間軸）
-- 執行：貼到 Supabase Dashboard > SQL Editor > Run
-- ============================================================

-- ------------------------------------------------------------
-- 1. 章節分組：course_sections + lessons.section_id
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS course_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_course_sections_course
  ON course_sections(course_id, sort_order);

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS section_id UUID
  REFERENCES course_sections(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_lessons_section ON lessons(section_id);

-- RLS：章節結構公開可讀（同 lessons），寫入只走 service_role（後台 admin client）
ALTER TABLE course_sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sections_select_public" ON course_sections;
CREATE POLICY "sections_select_public" ON course_sections
  FOR SELECT USING (true);

DROP TRIGGER IF EXISTS course_sections_updated_at ON course_sections;
CREATE TRIGGER course_sections_updated_at BEFORE UPDATE ON course_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- 2. 學習筆記 lesson_notes（時間軸 + 內容）
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lesson_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  position_seconds INTEGER DEFAULT 0,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_lesson
  ON lesson_notes(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_user_course
  ON lesson_notes(user_id, course_id);

ALTER TABLE lesson_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notes_all_own" ON lesson_notes;
CREATE POLICY "notes_all_own" ON lesson_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS lesson_notes_updated_at ON lesson_notes;
CREATE TRIGGER lesson_notes_updated_at BEFORE UPDATE ON lesson_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- 3. 書籤 lesson_bookmarks（標記時間點）
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS lesson_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  position_seconds INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user_lesson
  ON lesson_bookmarks(user_id, lesson_id, position_seconds);

ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookmarks_all_own" ON lesson_bookmarks;
CREATE POLICY "bookmarks_all_own" ON lesson_bookmarks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 驗證：
--   SELECT to_regclass('public.course_sections'), to_regclass('public.lesson_notes'), to_regclass('public.lesson_bookmarks');
--   SELECT column_name FROM information_schema.columns WHERE table_name='lessons' AND column_name='section_id';
-- ============================================================
