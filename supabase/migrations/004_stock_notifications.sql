-- 缺貨通知訂閱表
-- 用戶訂閱「到貨通知」，商品補貨時系統可發 email 通知

CREATE TABLE IF NOT EXISTS stock_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, email)
);

CREATE INDEX IF NOT EXISTS idx_stock_notif_product ON stock_notifications(product_id) WHERE notified_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_stock_notif_email ON stock_notifications(email);

-- RLS：只有匿名可插入（訂閱），管理員可讀取
ALTER TABLE stock_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to stock notifications"
  ON stock_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users see their own subscriptions"
  ON stock_notifications FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
