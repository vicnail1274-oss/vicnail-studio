import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET 公開課程列表（只回 status='published'）
 *
 * Query params:
 *   ?category=gel
 *   ?level=beginner
 *   ?featured=1
 *   ?sort=newest | price-asc | price-desc | popular
 *   ?q=關鍵字（搜尋標題與描述）
 *   ?limit=20&offset=0
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const featured = searchParams.get("featured");
  const sort = searchParams.get("sort");
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, description, price, sale_price, thumbnail_url, level, category, instructor_name, total_lessons, total_duration_seconds, featured, sort_order, published_at"
    )
    .eq("status", "published");

  if (category) query = query.eq("category", category);
  if (level) {
    const validLevels = ["beginner", "intermediate", "advanced", "all"] as const;
    if ((validLevels as readonly string[]).includes(level)) {
      query = query.eq("level", level as (typeof validLevels)[number]);
    }
  }
  if (featured === "1") query = query.eq("featured", true);
  if (q) {
    const escaped = q.replace(/[%,]/g, (m) => `\\${m}`);
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  // 排序：預設精選優先 + sort_order，其餘依使用者選擇
  switch (sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "popular":
      // 無觀看數欄位，以精選 + 課數作為熱門度近似
      query = query
        .order("featured", { ascending: false })
        .order("total_lessons", { ascending: false });
      break;
    case "newest":
      query = query.order("published_at", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("sort_order", { ascending: true })
        .order("published_at", { ascending: false, nullsFirst: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
