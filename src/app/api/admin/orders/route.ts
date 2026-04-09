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

  if (status) query = query.eq("status", status);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** PUT: 更新訂單狀態、追蹤碼等 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少訂單 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
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
