import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/products/by-ids?ids=id1,id2,id3
 * 批次取得商品摘要（給「最近瀏覽」使用）
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idsParam = searchParams.get("ids");
    if (!idsParam) {
      return NextResponse.json({ products: [] });
    }

    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s))
      .slice(0, 20);

    if (ids.length === 0) {
      return NextResponse.json({ products: [] });
    }

    const admin = await createAdminClient();
    const { data } = await admin
      .from("products")
      .select("id, title, price, sale_price, images")
      .in("id", ids)
      .eq("status", "published");

    return NextResponse.json({ products: data || [] });
  } catch (err) {
    console.error("by-ids error:", err);
    return NextResponse.json({ products: [] });
  }
}
