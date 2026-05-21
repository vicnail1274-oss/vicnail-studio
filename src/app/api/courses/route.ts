import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET 公開課程列表（只回 status='published'）
 *
 * Query params:
 *   ?category=gel
 *   ?level=beginner
 *   ?featured=1
 *   ?limit=20&offset=0
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");
  const featured = searchParams.get("featured");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 100);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);

  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select(
      "id, slug, title, description, price, sale_price, thumbnail_url, level, category, instructor_name, total_lessons, total_duration_seconds, featured, sort_order, published_at"
    )
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (level) {
    const validLevels = ["beginner", "intermediate", "advanced", "all"] as const;
    if ((validLevels as readonly string[]).includes(level)) {
      query = query.eq("level", level as (typeof validLevels)[number]);
    }
  }
  if (featured === "1") query = query.eq("featured", true);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
