import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/** GET: 列出團購活動 */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("group_buys")
    .select("*, group_buy_items(*, products(title, price))")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST: 新增團購活動 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const admin = await createAdminClient();

  const { data: groupBuy, error } = await admin
    .from("group_buys")
    .insert({
      title: body.title,
      description: body.description || null,
      cover_image: body.cover_image || null,
      start_date: body.start_date,
      end_date: body.end_date,
      target_qty: body.target_qty || 0,
      status: body.status || "upcoming",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 新增團購商品
  const gb = groupBuy as { id: string };
  if (body.items?.length && gb) {
    const items = body.items.map((item: { product_id: string; group_price: number; max_per_person?: number }) => ({
      group_buy_id: gb.id,
      product_id: item.product_id,
      group_price: item.group_price,
      max_per_person: item.max_per_person || 0,
    }));
    await admin.from("group_buy_items").insert(items);
  }

  return NextResponse.json(groupBuy, { status: 201 });
}

/** PUT: 更新團購活動 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少團購 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const updateData: Record<string, unknown> = {};

  const fields = ["title", "description", "cover_image", "start_date", "end_date", "target_qty", "current_qty", "status"];
  for (const f of fields) {
    if (body[f] !== undefined) updateData[f] = body[f];
  }

  const { data, error } = await admin
    .from("group_buys")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
