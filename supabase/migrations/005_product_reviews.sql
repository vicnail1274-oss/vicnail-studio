-- 商品評價系統
-- 已登入用戶可對商品留下星等評分 + 文字評論
-- 每個用戶每件商品只能評論一次（可更新）

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text,
  display_name text,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON product_reviews(product_id) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_product_reviews_user
  ON product_reviews(user_id);

-- 自動更新 updated_at
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER trg_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_reviews_updated_at();

-- RLS
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- 任何人可讀取已發布評論
CREATE POLICY "Anyone can read published reviews"
  ON product_reviews FOR SELECT
  USING (is_published = true);

-- 已登入用戶可建立自己的評論
CREATE POLICY "Authenticated users can create their own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 已登入用戶可更新自己的評論
CREATE POLICY "Users can update their own reviews"
  ON product_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 已登入用戶可刪除自己的評論
CREATE POLICY "Users can delete their own reviews"
  ON product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- 查詢用：商品評分摘要 view（平均分數 + 評論數）
CREATE OR REPLACE VIEW product_rating_summary AS
SELECT
  product_id,
  COUNT(*)::int AS review_count,
  ROUND(AVG(rating)::numeric, 1) AS avg_rating
FROM product_reviews
WHERE is_published = true
GROUP BY product_id;
