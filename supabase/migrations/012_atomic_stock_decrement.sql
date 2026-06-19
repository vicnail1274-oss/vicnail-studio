-- ============================================================
-- VicNail Studio — 訂單扣庫存原子化（取代 route 端 N+1 迴圈）
-- 012_atomic_stock_decrement.sql
-- 執行：貼到 Supabase Dashboard > SQL Editor > Run
--
-- 問題：src/app/api/orders/create 用逐項 update().gte() 迴圈扣庫存，
--   (1) N+1 query（每項一次往返）
--   (2) 非原子：item2 庫存不足時，item1 已扣的庫存不會還原 → 取消訂單卻漏庫存
-- 解法：單一 RPC 在一個交易內扣完所有現貨項目，任一不足即 RAISE → 整筆 rollback。
-- 自包：不依賴 009 的 stock_movements（避免該 migration 未套用時失敗）。
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_stock_batch(p_items jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_updated integer;
BEGIN
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;

    -- 略過無效/非正數量
    IF v_product_id IS NULL OR v_qty IS NULL OR v_qty <= 0 THEN
      CONTINUE;
    END IF;

    -- 僅扣現貨（instock）且庫存足夠者；row lock 由 UPDATE 自動取得，序列化並行扣減
    UPDATE products
      SET stock = stock - v_qty
      WHERE id = v_product_id
        AND purchase_type = 'instock'
        AND stock >= v_qty;
    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
      -- 沒扣到：若該商品是現貨 → 庫存不足，整筆交易 rollback
      IF EXISTS (
        SELECT 1 FROM products
        WHERE id = v_product_id AND purchase_type = 'instock'
      ) THEN
        RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', v_product_id
          USING ERRCODE = 'check_violation';
      END IF;
      -- 非現貨（preorder/proxy）不扣庫存，正常略過
    END IF;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION decrement_stock_batch TO service_role;

-- ============================================================
-- 驗證：SELECT proname FROM pg_proc WHERE proname = 'decrement_stock_batch';
-- ============================================================
