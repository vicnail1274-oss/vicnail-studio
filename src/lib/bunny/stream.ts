/**
 * Bunny.net Stream SDK
 *
 * 文件：https://docs.bunny.net/reference/api-overview
 *
 * 流程：
 * 1. 後台呼叫 createVideo() 建立 Bunny video object 拿到 GUID
 * 2. 前端用 TUS 協議或 PUT 直傳到 Bunny（用 createVideo 回傳的 tus_endpoint）
 * 3. 上傳完成後 webhook 通知（或前端直接告知）lesson 設為 ready
 * 4. 學生播放時呼叫 signHlsUrl() 拿到 15 分鐘有效的 token URL
 *
 * 必要環境變數：
 *   BUNNY_STREAM_LIBRARY_ID
 *   BUNNY_STREAM_API_KEY
 *   BUNNY_STREAM_CDN_HOSTNAME       e.g. vz-12345678-abc.b-cdn.net
 *   BUNNY_STREAM_TOKEN_AUTH_KEY     用於簽 Signed URL（在 Bunny dashboard > Stream > Security 取得）
 */

import crypto from "crypto";

const BUNNY_API_BASE = "https://video.bunnycdn.com";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

export interface BunnyVideo {
  guid: string;
  title: string;
  status: number;
  length: number;
  thumbnailFileName: string;
  encodeProgress: number;
}

/**
 * 建立 Bunny video object（取得 GUID 供後續上傳）
 */
export async function createVideo(title: string): Promise<BunnyVideo> {
  const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = requireEnv("BUNNY_STREAM_API_KEY");

  const res = await fetch(`${BUNNY_API_BASE}/library/${libraryId}/videos`, {
    method: "POST",
    headers: {
      AccessKey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Bunny createVideo failed: ${res.status} ${text}`);
  }

  return (await res.json()) as BunnyVideo;
}

/**
 * 查詢 Bunny video 資訊（用於 polling 上傳/編碼狀態）
 */
export async function getVideo(videoId: string): Promise<BunnyVideo> {
  const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = requireEnv("BUNNY_STREAM_API_KEY");

  const res = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    { headers: { AccessKey: apiKey } }
  );

  if (!res.ok) {
    throw new Error(`Bunny getVideo failed: ${res.status}`);
  }

  return (await res.json()) as BunnyVideo;
}

/**
 * 刪除 Bunny video
 */
export async function deleteVideo(videoId: string): Promise<void> {
  const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = requireEnv("BUNNY_STREAM_API_KEY");

  const res = await fetch(
    `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
    { method: "DELETE", headers: { AccessKey: apiKey } }
  );

  if (!res.ok && res.status !== 404) {
    throw new Error(`Bunny deleteVideo failed: ${res.status}`);
  }
}

/**
 * 取得 TUS 上傳所需的 presigned signature
 * 前端用 tus-js-client 直傳到 Bunny，避免影片經過我們的 server
 *
 * TUS endpoint: https://video.bunnycdn.com/tusupload
 * Headers needed:
 *   - AuthorizationSignature: SHA256(libraryId + apiKey + expirationTime + videoId)
 *   - AuthorizationExpire: unix timestamp
 *   - VideoId: 影片 GUID
 *   - LibraryId
 */
export function getTusUploadSignature(
  videoId: string,
  expirationSeconds = 3600
): {
  libraryId: string;
  videoId: string;
  authorizationSignature: string;
  authorizationExpire: number;
  endpoint: string;
} {
  const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = requireEnv("BUNNY_STREAM_API_KEY");

  const expirationTime = Math.floor(Date.now() / 1000) + expirationSeconds;
  const toSign = `${libraryId}${apiKey}${expirationTime}${videoId}`;
  const signature = crypto.createHash("sha256").update(toSign).digest("hex");

  return {
    libraryId,
    videoId,
    authorizationSignature: signature,
    authorizationExpire: expirationTime,
    endpoint: `${BUNNY_API_BASE}/tusupload`,
  };
}

/**
 * 簽 Signed HLS URL（防盜鏈）
 *
 * Bunny Stream token 演算法：
 *   sha256_base64(TokenAuthKey + path + expirationUnix [+ ip] [+ pathAllowed])
 *   URL 加上 ?token={token}&expires={expiration}
 */
export function signHlsUrl(
  videoId: string,
  options: {
    expiresInSeconds?: number;
    userIp?: string;
  } = {}
): { url: string; expiresAt: number } {
  const cdnHostname = requireEnv("BUNNY_STREAM_CDN_HOSTNAME");
  const tokenAuthKey = requireEnv("BUNNY_STREAM_TOKEN_AUTH_KEY");

  const expiresInSeconds = options.expiresInSeconds ?? 900; // 預設 15 分鐘
  const expiration = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const path = `/${videoId}/playlist.m3u8`;

  // Bunny token formula: SHA256(token_key + path + expiration [+ ip])
  const ipPart = options.userIp ?? "";
  const tokenInput = `${tokenAuthKey}${path}${expiration}${ipPart}`;
  const hash = crypto.createHash("sha256").update(tokenInput).digest();
  const token = hash
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const params = new URLSearchParams({
    token,
    expires: String(expiration),
  });
  if (options.userIp) params.set("token_ip", options.userIp);

  const url = `https://${cdnHostname}${path}?${params.toString()}`;
  return { url, expiresAt: expiration * 1000 };
}

/**
 * 取得縮圖 URL（公開，無需 token）
 */
export function getThumbnailUrl(videoId: string): string {
  const cdnHostname = requireEnv("BUNNY_STREAM_CDN_HOSTNAME");
  return `https://${cdnHostname}/${videoId}/thumbnail.jpg`;
}

export interface CaptionInfo {
  lang: string;
  label: string;
}

/**
 * 取得 Bunny video 已上傳的字幕清單（srclang / label）。
 * Bunny 不會把字幕放進 HLS manifest，需另外以 <track> 載入。
 */
export async function getCaptionTracks(videoId: string): Promise<CaptionInfo[]> {
  const libraryId = requireEnv("BUNNY_STREAM_LIBRARY_ID");
  const apiKey = requireEnv("BUNNY_STREAM_API_KEY");
  try {
    const res = await fetch(
      `${BUNNY_API_BASE}/library/${libraryId}/videos/${videoId}`,
      { headers: { AccessKey: apiKey } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      captions?: { srclang: string; label?: string }[];
    };
    return (data.captions ?? [])
      .filter((c) => c.srclang)
      .map((c) => ({ lang: c.srclang, label: c.label || c.srclang }));
  } catch {
    return [];
  }
}

/**
 * 伺服器端抓 Bunny 字幕 .vtt 原始內容。
 * Bunny CDN 有 referrer 防盜連 + 字幕 content-type 是 octet-stream，
 * 故由 server 帶 Referer 抓回、再以 text/vtt 同源回傳給播放器。
 */
export async function fetchCaptionVtt(
  videoId: string,
  lang: string,
  referer: string
): Promise<string | null> {
  const cdnHostname = requireEnv("BUNNY_STREAM_CDN_HOSTNAME");
  const safeLang = lang.replace(/[^a-zA-Z-]/g, "");
  if (!safeLang) return null;
  try {
    const res = await fetch(
      `https://${cdnHostname}/${videoId}/captions/${safeLang}.vtt`,
      { headers: { Referer: referer } }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
