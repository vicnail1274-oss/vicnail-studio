-- 016: 線上課程會員門禁 — profiles.online_access
-- 線上影片課程「暫時不開放」，僅限 Vic 開通的特定帳號可進入線上課程專區（/online-courses）
-- 與觀看課程影片（watch 頁 + playback-token）。一般註冊會員預設無權限。
-- Vic 開通某帳號：UPDATE profiles SET online_access = true WHERE id = '<該使用者 auth uid>';
-- 查 uid：SELECT id, email FROM auth.users WHERE email = '<email>';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS online_access BOOLEAN NOT NULL DEFAULT false;

-- 確保登入使用者可讀自己的 online_access（與既有 profiles SELECT 並存；用於前端門禁判斷）
GRANT SELECT (online_access) ON profiles TO authenticated;
