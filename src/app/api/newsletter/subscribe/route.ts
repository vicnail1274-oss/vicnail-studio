import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
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
