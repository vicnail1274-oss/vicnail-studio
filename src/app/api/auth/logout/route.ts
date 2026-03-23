import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get("origin") || `https://${req.headers.get("host")}` || "http://localhost:3001";
  return NextResponse.redirect(new URL("/", siteUrl), { status: 302 });
}
