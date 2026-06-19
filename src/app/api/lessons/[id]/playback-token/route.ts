import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  signHlsUrl,
  getCaptionTracks,
  fetchCaptionVtt,
} from "@/lib/bunny/stream";
import { getClientIp } from "@/lib/rate-limit";

/**
 * 簽 HLS 播放 URL（15 分鐘有效）
 *
 * 流程：
 * 1. 驗證 lesson 存在且影片就緒
 * 2. 若非預覽課，檢查 enrollment
 * 3. 檢查 video_view_sessions：當前 active 裝置 < device_limit
 * 4. INSERT or UPDATE session（紀錄 device_fingerprint）
 * 5. 簽 HLS URL 回傳
 *
 * Body: { deviceFingerprint: string, deviceLabel?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: lessonId } = await params;
    const body = await req.json().catch(() => ({}));
    const deviceFingerprint = String(body.deviceFingerprint || "").slice(0, 128);
    const deviceLabel = body.deviceLabel
      ? String(body.deviceLabel).slice(0, 80)
      : null;

    if (!deviceFingerprint) {
      return NextResponse.json(
        { error: "缺少裝置識別" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const admin = await createAdminClient();

    // 1. 取得 lesson
    const { data: lesson, error: lessonError } = await admin
      .from("lessons")
      .select("id, course_id, is_preview, bunny_video_id, upload_status")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: "章節不存在" }, { status: 404 });
    }

    if (!lesson.bunny_video_id || lesson.upload_status !== "ready") {
      return NextResponse.json(
        { error: "影片尚未上傳完成" },
        { status: 425 }
      );
    }

    // 2. 預覽課無需驗 enrollment（但無浮水印）
    let userEmail = "guest";

    if (!lesson.is_preview) {
      if (!user) {
        return NextResponse.json(
          { error: "請先登入" },
          { status: 401 }
        );
      }
      userEmail = user.email ?? "user";

      const { data: enrollment } = await admin
        .from("enrollments")
        .select("id, device_limit, expires_at")
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id)
        .maybeSingle();

      if (!enrollment) {
        return NextResponse.json(
          { error: "您尚未購買此課程" },
          { status: 403 }
        );
      }

      if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
        return NextResponse.json(
          { error: "您的觀看權已過期" },
          { status: 403 }
        );
      }

      // 3. 檢查 active 裝置數
      const deviceLimit = enrollment.device_limit ?? 2;
      const heartbeatThreshold = new Date(Date.now() - 90 * 1000).toISOString();

      const { data: activeSessions } = await admin
        .from("video_view_sessions")
        .select("id, device_fingerprint, device_label, last_heartbeat_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .gte("last_heartbeat_at", heartbeatThreshold);

      const currentDevice = activeSessions?.find(
        (s) => s.device_fingerprint === deviceFingerprint
      );

      if (
        !currentDevice &&
        activeSessions &&
        activeSessions.length >= deviceLimit
      ) {
        return NextResponse.json(
          {
            error: "DEVICE_LIMIT",
            message: `您已達 ${deviceLimit} 台裝置觀看上限`,
            activeDevices: activeSessions.map((s) => ({
              id: s.id,
              label: s.device_label || "未命名裝置",
              fingerprint: s.device_fingerprint,
              lastActive: s.last_heartbeat_at,
            })),
          },
          { status: 409 }
        );
      }

      // 4. 寫 session（同裝置 update，新裝置 insert）
      if (currentDevice) {
        await admin
          .from("video_view_sessions")
          .update({
            lesson_id: lessonId,
            last_heartbeat_at: new Date().toISOString(),
          })
          .eq("id", currentDevice.id);
      } else {
        await admin.from("video_view_sessions").insert({
          user_id: user.id,
          lesson_id: lessonId,
          course_id: lesson.course_id,
          device_fingerprint: deviceFingerprint,
          device_label: deviceLabel,
          user_agent: req.headers.get("user-agent")?.slice(0, 200) || null,
          ip_address: getClientIp(req),
        });
      }

      // 更新 enrollment.last_accessed_at
      await admin
        .from("enrollments")
        .update({ last_accessed_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("course_id", lesson.course_id);
    }

    // 5. 簽 HLS URL
    const { url, expiresAt } = signHlsUrl(lesson.bunny_video_id, {
      expiresInSeconds: 900,
    });

    // 6. 字幕（Bunny 不放 HLS manifest，改以同源 proxy URL 給 <track> 載入）
    let captionInfos = await getCaptionTracks(lesson.bunny_video_id);
    // 後備：getCaptionTracks 走 Bunny API（需 API_KEY）；若環境變數未設妥列不到，
    // 直接用 CDN 探測 zh 字幕是否存在（只需 CDN_HOSTNAME，不需 API_KEY）。
    if (captionInfos.length === 0) {
      const probe = await fetchCaptionVtt(
        lesson.bunny_video_id,
        "zh",
        `${req.nextUrl.origin}/`
      );
      if (probe !== null) captionInfos = [{ lang: "zh", label: "中文" }];
    }
    const captions = captionInfos.map((c) => ({
      lang: c.lang,
      label: c.label,
      url: `/api/lessons/${lessonId}/captions/${c.lang}`,
    }));

    return NextResponse.json({
      hlsUrl: url,
      expiresAt,
      captions,
      watermark: {
        email: userEmail,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Playback token error:", err);
    return NextResponse.json(
      { error: "簽發播放憑證失敗" },
      { status: 500 }
    );
  }
}
