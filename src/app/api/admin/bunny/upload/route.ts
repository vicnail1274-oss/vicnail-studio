import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { createVideo, getTusUploadSignature } from "@/lib/bunny/stream";

/**
 * 建立 Bunny video object 並回傳 TUS 上傳所需的簽章資訊
 *
 * 前端流程：
 * 1. POST {title} 到這支 API
 * 2. 拿到 { videoId, tusSignature }
 * 3. 用 tus-js-client 直傳影片到 Bunny
 * 4. 上傳完成後 PUT /api/admin/lessons 更新 lesson.bunny_video_id + upload_status='ready'
 */
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title } = (await req.json()) as { title?: string };
    if (!title) {
      return NextResponse.json(
        { error: "請提供影片標題" },
        { status: 400 }
      );
    }

    const video = await createVideo(title);
    const sig = getTusUploadSignature(video.guid, 3600);

    return NextResponse.json({
      videoId: video.guid,
      title: video.title,
      tus: {
        endpoint: sig.endpoint,
        headers: {
          AuthorizationSignature: sig.authorizationSignature,
          AuthorizationExpire: String(sig.authorizationExpire),
          VideoId: sig.videoId,
          LibraryId: sig.libraryId,
        },
        metadata: {
          filetype: "video/mp4",
          title,
        },
      },
    });
  } catch (err) {
    console.error("Bunny upload signature error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "建立 Bunny 上傳簽章失敗（請檢查 BUNNY_STREAM_* 環境變數）",
      },
      { status: 500 }
    );
  }
}
