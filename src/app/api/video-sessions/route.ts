import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** GET: 列出當前使用者的 active sessions（給「裝置管理」UI 用） */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const admin = await createAdminClient();
  const heartbeatThreshold = new Date(Date.now() - 90 * 1000).toISOString();

  const { data, error } = await admin
    .from("video_view_sessions")
    .select(
      "id, device_label, user_agent, ip_address, started_at, last_heartbeat_at, lesson_id"
    )
    .eq("user_id", user.id)
    .eq("is_active", true)
    .gte("last_heartbeat_at", heartbeatThreshold)
    .order("last_heartbeat_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

/** DELETE: 結束特定 session（踢人或主動登出） */
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");
  const deviceFingerprint = searchParams.get("fingerprint");

  if (!sessionId && !deviceFingerprint) {
    return NextResponse.json(
      { error: "需提供 session id 或 device fingerprint" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const admin = await createAdminClient();
  let q = admin
    .from("video_view_sessions")
    .update({ is_active: false, ended_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (sessionId) q = q.eq("id", sessionId);
  if (deviceFingerprint) q = q.eq("device_fingerprint", deviceFingerprint);

  const { error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
