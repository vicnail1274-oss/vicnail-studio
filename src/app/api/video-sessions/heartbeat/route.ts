import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * 心跳 — 每 30 秒由前端呼叫，維持 session active
 *
 * Body: { deviceFingerprint: string, lessonId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const deviceFingerprint = String(body.deviceFingerprint || "");

    if (!deviceFingerprint) {
      return NextResponse.json({ error: "缺少裝置識別" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "未登入" }, { status: 401 });
    }

    const admin = await createAdminClient();

    const updateData: Record<string, unknown> = {
      last_heartbeat_at: new Date().toISOString(),
      is_active: true,
    };
    if (body.lessonId) updateData.lesson_id = body.lessonId;

    const { data, error } = await admin
      .from("video_view_sessions")
      .update(updateData)
      .eq("user_id", user.id)
      .eq("device_fingerprint", deviceFingerprint)
      .eq("is_active", true)
      .select("id");

    if (error) {
      console.error("Heartbeat error:", error);
      return NextResponse.json({ error: "心跳失敗" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, updated: data?.length || 0 });
  } catch (err) {
    console.error("Heartbeat error:", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
