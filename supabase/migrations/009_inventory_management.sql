-- ============================================================
-- VicNail Studio - 庫存管理（盤點 / 異動紀錄 / 低庫存）
-- 009_inventory_management.sql
-- 把 vic-daigou 的庫存管理概念併入官網。
-- 官網既有模型：products.stock 為現貨在手；下單(instock)即原子扣庫存。
-- 本 migration 補上：異動 ledger（稽核）、低庫存門檻、盤點/進貨/調整由後台操作。
-- ============================================================

-- 低庫存門檻（供後台警示）
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS aliases TEXT; -- 簡稱（搜尋帶入用）

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- 庫存異動紀錄
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  delta INTEGER NOT NULL,              -- 正=增加，負=減少
  balance_after INTEGER NOT NULL,      -- 異動後在手數量
  reason TEXT NOT NULL CHECK (reason IN ('STOCKTAKE', 'PURCHASE', 'SALE', 'ADJUST', 'RESTORE')),
  note TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL, -- 若為售出/退回，關聯訂單
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);

-- RLS：僅 service_role（後台 admin client）可存取
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock_movements_service_only" ON stock_movements
  FOR ALL USING (false);

-- 原子盤點：把 stock 設為盤點值，回傳差異（供 app 記 ledger）
CREATE OR REPLACE FUNCTION set_stocktake(p_product_id UUID, p_counted INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old INTEGER;
  v_delta INTEGER;
BEGIN
  SELECT stock INTO v_old FROM products WHERE id = p_product_id FOR UPDATE;
  IF v_old IS NULL THEN
    RAISE EXCEPTION 'product not found';
  END IF;
  v_delta := p_counted - v_old;
  UPDATE products SET stock = p_counted WHERE id = p_product_id;
  INSERT INTO stock_movements(product_id, delta, balance_after, reason, note)
    VALUES (p_product_id, v_delta, p_counted, 'STOCKTAKE', concat(v_old, ' → ', p_counted));
  RETURN v_delta;
END;
$$;

-- 原子增減（進貨 PURCHASE / 調整 ADJUST），回傳異動後數量
CREATE OR REPLACE FUNCTION adjust_stock(p_product_id UUID, p_delta INTEGER, p_reason TEXT, p_note TEXT DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new INTEGER;
BEGIN
  UPDATE products SET stock = GREATEST(0, stock + p_delta)
    WHERE id = p_product_id
    RETURNING stock INTO v_new;
  IF v_new IS NULL THEN
    RAISE EXCEPTION 'product not found';
  END IF;
  INSERT INTO stock_movements(product_id, delta, balance_after, reason, note)
    VALUES (p_product_id, p_delta, v_new, p_reason, p_note);
  RETURN v_new;
END;
$$;
