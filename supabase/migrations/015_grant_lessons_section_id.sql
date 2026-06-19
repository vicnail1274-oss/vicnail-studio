-- 015: 補 lessons.section_id 的欄位級 SELECT 權限
-- 症狀：課程詳情頁/觀看頁（server 端以使用者 session 查詢）SELECT lessons 時包含 section_id
--       （migration 013 course_sections 功能新增的欄位），但 010 的欄位級 GRANT 清單未納入該欄位
--       → 整個 lessons 查詢回 "permission denied for table lessons"（42501，privilege 層級）
--       → 課程章節顯示「章節準備中⋯⋯」、免費試看單元無法點入觀看。
-- 根因：欄位級 GRANT 是固定清單，後續 ADD COLUMN 不會自動納入，必須補授權。
-- 修法：補授 section_id（非敏感的章節分組欄位）SELECT 給 anon/authenticated。
--       video_id / bunny_video_id / hls_url 仍維持不開放（播放走 playback-token，server service-role 讀）。
GRANT SELECT (section_id) ON lessons TO anon, authenticated;
