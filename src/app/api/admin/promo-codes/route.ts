import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdminAuthed } from "@/lib/admin-auth";

const FIELDS = [
  "code",
  "description",
  "discount_type",
  "discount_value",
  "applies_to",
  "applicable_course_ids",
  "applicable_product_ids",
  "min_purchase_amount",
  "max_uses",
  "max_uses_per_user",
  "starts_at",
  "expires_at",
  "is_active",
] as const;

/** GET: 列出所有優惠碼 */
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** POST: 新增優惠碼 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  if (!body.code || !body.discount_type || body.discount_value === undefined) {
    return NextResponse.json(
      { error: "請填寫優惠碼、折扣類型、折扣值" },
      { status: 400 }
    );
  }
  if (!/^[A-Z0-9_-]+$/.test(body.code)) {
    return NextResponse.json(
      { error: "優惠碼只能包含大寫英文、數字、底線、連字號" },
      { status: 400 }
    );
  }
  if (!["percentage", "fixed_amount", "free"].includes(body.discount_type)) {
    return NextResponse.json({ error: "折扣類型錯誤" }, { status: 400 });
  }
  if (body.discount_type === "percentage" && (body.discount_value < 1 || body.discount_value > 100)) {
    return NextResponse.json(
      { error: "百分比折扣值必須介於 1-100" },
      { status: 400 }
    );
  }

  const admin = await createAdminClient();
  const insertData: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) insertData[field] = body[field];
  }
  insertData.code = String(body.code).toUpperCase();

  const { data, error } = await admin
    .from("promo_codes")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "此優惠碼已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

/** PUT: 更新優惠碼 */
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "缺少優惠碼 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();
  const updateData: Record<string, unknown> = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) {
      updateData[field] = field === "code" ? String(body[field]).toUpperCase() : body[field];
    }
  }

  const { data, error } = await admin
    .from("promo_codes")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(updateData as any)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE: 直接刪除（不影響歷史 redemptions，因為 FK ON DELETE CASCADE） */
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "缺少優惠碼 ID" }, { status: 400 });
  }

  const admin = await createAdminClient();

  // 改用 is_active=false 而非真刪，避免歷史 order.promo_code_id 為 null
  const { error } = await admin
    .from("promo_codes")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, mode: "deactivated" });
}
