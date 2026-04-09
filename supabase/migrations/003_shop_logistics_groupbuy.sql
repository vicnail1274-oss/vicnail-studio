-- ============================================================
-- VicNail Studio - Shop, Logistics, Group Buy, LINE Orders
-- 003_shop_logistics_groupbuy.sql
-- ============================================================

-- ============================================================
-- 1. 擴展 products 表：預購/代購/現貨 + 團購關聯
-- ============================================================
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS purchase_type TEXT DEFAULT 'instock'
    CHECK (purchase_type IN ('instock', 'preorder', 'proxy')),
  ADD COLUMN IF NOT EXISTS preorder_deadline TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_delivery TEXT,
  ADD COLUMN IF NOT EXISTS min_order_qty INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS group_buy_id UUID,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ============================================================
-- 2. 團購活動表
-- ============================================================
CREATE TABLE IF NOT EXISTS group_buys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  target_qty INTEGER DEFAULT 0,
  current_qty INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming'
    CHECK (status IN ('upcoming', 'active', 'closed', 'completed', 'cancelled')),
  notify_subscribers BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 團購商品關聯表
CREATE TABLE IF NOT EXISTS group_buy_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_buy_id UUID REFERENCES group_buys(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  group_price INTEGER NOT NULL,
  max_per_person INTEGER DEFAULT 0,
  UNIQUE(group_buy_id, product_id)
);

-- 外鍵：products → group_buys
ALTER TABLE products
  ADD CONSTRAINT fk_products_group_buy
  FOREIGN KEY (group_buy_id) REFERENCES group_buys(id) ON DELETE SET NULL;

-- ============================================================
-- 3. 擴展 orders 表：物流詳細資訊
-- ============================================================
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_store_id TEXT,
  ADD COLUMN IF NOT EXISTS shipping_store_name TEXT,
  ADD COLUMN IF NOT EXISTS logistics_id TEXT,
  ADD COLUMN IF NOT EXISTS logistics_status TEXT,
  ADD COLUMN IF NOT EXISTS logistics_type TEXT
    CHECK (logistics_type IN ('cvs_711', 'cvs_fami', 'cvs_hilife', 'cvs_ok', 'home_tcat', 'home_post', 'home_sf', 'self_pickup')),
  ADD COLUMN IF NOT EXISTS ecpay_trade_no TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'web'
    CHECK (source IN ('web', 'line', 'admin'));

-- ============================================================
-- 4. 購物車表（伺服器端儲存）
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant JSONB DEFAULT '{}',
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, variant)
);

-- ============================================================
-- 5. LINE 訂單表（群組自動接單）
-- ============================================================
CREATE TABLE IF NOT EXISTS line_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  line_display_name TEXT,
  line_group_id TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  raw_message TEXT NOT NULL,
  parsed_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'linked', 'cancelled', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. 電子報訂閱者擴展：訂閱類型
-- ============================================================
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS sub_type TEXT DEFAULT 'newsletter'
    CHECK (sub_type IN ('newsletter', 'groupbuy', 'all'));

-- ============================================================
-- RLS 設定
-- ============================================================
ALTER TABLE group_buys ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buy_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_orders ENABLE ROW LEVEL SECURITY;

-- 團購公開可讀
CREATE POLICY "group_buys_public_read" ON group_buys
  FOR SELECT USING (status IN ('active', 'upcoming'));

CREATE POLICY "group_buy_items_public_read" ON group_buy_items
  FOR SELECT USING (true);

-- 購物車：使用者只能存取自己的
CREATE POLICY "cart_select_own" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- 訂單新增：允許登入使用者建立自己的訂單
CREATE POLICY "orders_insert_own" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- LINE 訂單：只有 service_role 能操作（透過 Admin client）
CREATE POLICY "line_orders_service_only" ON line_orders
  FOR ALL USING (false);

-- ============================================================
-- Triggers
-- ============================================================
CREATE TRIGGER group_buys_updated_at BEFORE UPDATE ON group_buys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
