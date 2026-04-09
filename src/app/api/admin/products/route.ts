import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

/** GET: 列出所有商品（含未發布）*/
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST: 新增商品 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("products")
    .insert({
      title: body.title,
      description: body.description || null,
      price: body.price || 0,
      sale_price: body.sale_price || null,
      stock: body.stock || 0,
      category: body.category || null,
      images: body.images || [],
      variants: body.variants || [],
      status: body.status || "draft",
      purchase_type: body.purchase_type || "instock",
      preorder_deadline: body.preorder_deadline || null,
      estimated_delivery: body.estimated_delivery || null,
      min_order_qty: body.min_order_qty || 1,
      shipping_weight: body.shipping_weight || 0,
      sort_order: body.sort_order || 0,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

/** PUT: 更新商品 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少商品 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const updateData: Record<string, unknown> = {};

  const fields = [
    "title", "description", "price", "sale_price", "stock", "category",
    "images", "variants", "status", "purchase_type", "preorder_deadline",
    "estimated_delivery", "min_order_qty", "shipping_weight", "sort_order",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const { data, error } = await admin
    .from("products")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE: 刪除商品 */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少商品 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
