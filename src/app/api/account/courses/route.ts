import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * 我的已購買課程列表（用 my_enrolled_courses view，包含進度）
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("my_enrolled_courses")
    .select("*")
    .order("last_accessed_at", { ascending: false, nullsFirst: false })
    .order("purchased_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
