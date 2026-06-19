import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { fetchCaptionVtt } from "@/lib/bunny/stream";

/**
 * 字幕 proxy：伺服器帶 Referer 抓 Bunny 字幕 .vtt，再以 text/vtt 同源回傳。
 * 避開 Bunny CDN referrer 防盜連 + octet-stream content-type + 跨來源 CORS 三個坑。
 * 權限比照觀看：非試看課需登入 + enrollment。
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lang: string }> }
) {
  const { id: lessonId, lang } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = await createAdminClient();

  const { data: lesson } = await admin
    .from("lessons")
    .select("course_id, bunny_video_id, is_preview, upload_status")
    .eq("id", lessonId)
    .single();

  if (!lesson?.bunny_video_id || lesson.upload_status !== "ready") {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!lesson.is_preview) {
    if (!user) return new NextResponse("Unauthorized", { status: 401 });
    const { data: enrollment } = await admin
      .from("enrollments")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", lesson.course_id)
      .maybeSingle();
    const ok =
      !!enrollment &&
      (!enrollment.expires_at ||
        new Date(enrollment.expires_at) > new Date());
    if (!ok) return new NextResponse("Forbidden", { status: 403 });
  }

  const referer = `${req.nextUrl.origin}/`;
  const vtt = await fetchCaptionVtt(lesson.bunny_video_id, lang, referer);
  if (vtt === null) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(vtt, {
    headers: {
      "Content-Type": "text/vtt; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
