import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/** GET: 列出訂單 */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const source = searchParams.get("source");

  const admin = await createAdminClient();
  let query = admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status as "pending" | "paid" | "shipped" | "completed" | "cancelled" | "refunded");
  if (source) query = query.eq("source", source as "web" | "line" | "admin");

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

const VALID_STATUSES = new Set([
  "pending",
  "paid",
  "shipped",
  "completed",
  "cancelled",
  "refunded",
]);

/** PUT: 更新訂單狀態、追蹤碼等 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "請求格式錯誤" }, { status: 400 });
  }
  if (!body.id) {
    return NextResponse.json({ error: "缺少訂單 ID" }, { status: 400 });
  }

  if (body.status && !VALID_STATUSES.has(body.status)) {
    return NextResponse.json(
      { error: `無效的狀態：${body.status}` },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();

  // 退單回補庫存：訂單從「已扣庫存」狀態轉為取消/退款時，把現貨項目的 stock 還回去。
  // （現貨在付款成功時才扣，預購/代購未扣故不回補；只在狀態真的轉換時做，避免重複回補）
  const STOCK_DEDUCTED = new Set(["paid", "shipped", "completed"]);
  if (body.status === "cancelled" || body.status === "refunded") {
    const { data: current } = await admin
      .from("orders")
      .select("status, order_items(item_type, item_id, quantity)")
      .eq("id", body.id)
      .single();
    if (current && STOCK_DEDUCTED.has(current.status)) {
      const productItems = (
        (current.order_items as
          | { item_type: string; item_id: string; quantity: number }[]
          | null) || []
      ).filter((it) => it.item_type === "product");
      for (const it of productItems) {
        const { data: prod } = await admin
          .from("products")
          .select("stock, purchase_type")
          .eq("id", it.item_id)
          .single();
        if (prod && prod.purchase_type === "instock") {
          await admin
            .from("products")
            .update({ stock: (prod.stock ?? 0) + it.quantity })
            .eq("id", it.item_id);
        }
      }
    }
  }

  const updateData: Record<string, unknown> = {};

  if (body.status) updateData.status = body.status;
  if (body.tracking_number) updateData.tracking_number = body.tracking_number;
  if (body.logistics_id) updateData.logistics_id = body.logistics_id;
  if (body.logistics_status) updateData.logistics_status = body.logistics_status;
  if (body.notes !== undefined) updateData.notes = body.notes;

  if (body.status === "paid" && !body.paid_at) {
    updateData.paid_at = new Date().toISOString();
  }
  if (body.status === "shipped" && !body.shipped_at) {
    updateData.shipped_at = new Date().toISOString();
  }

  const { data, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
