-- 014: 修正 handle_new_user 觸發器 — 補 SET search_path = public
-- 症狀：前端 signup 端點回 "Database error saving new user"，真實註冊 + admin 建立使用者全部失敗。
-- 根因：handle_new_user 是 SECURITY DEFINER，但未設 search_path；GoTrue 寫入 auth.users 時的
--       搜尋路徑不含 public，觸發器內未加 schema 的 `profiles` 解析失敗 → 整筆交易 rollback。
-- 修法：函式設 SET search_path = public、表名改 public.profiles、加 ON CONFLICT 與例外保護，
--       讓 profile 建立失敗永不阻斷使用者註冊。
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- profile 建立失敗不可阻斷使用者註冊
  RETURN NEW;
END;
$$;

-- 觸發器沿用 001 的 on_auth_user_created（CREATE OR REPLACE FUNCTION 已保留綁定），此處不需重建。
