import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 次 / 10 分鐘 / IP（防垃圾訂閱）
    const ip = getClientIp(req);
    const rl = rateLimit(`newsletter:${ip}`, 5, 10 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "請求過於頻繁" },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 1. Always save to Supabase as primary store
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("newsletter_subscribers")
      .upsert(
        { email, source: "vicnail-studio", is_active: true, subscribed_at: new Date().toISOString() },
        { onConflict: "email" }
      );

    if (dbError && dbError.code !== "23505") { // ignore duplicate email
      console.error("[newsletter] Supabase write error:", dbError);
    }

    // 2. Also trigger n8n workflow (for email sending / welcome flow)
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_NEWSLETTER_WEBHOOK;
    if (n8nWebhookUrl) {
      fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "vicnail-studio", timestamp: new Date().toISOString() }),
      }).catch((err) => console.error("[newsletter] n8n webhook error:", err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[newsletter] route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
