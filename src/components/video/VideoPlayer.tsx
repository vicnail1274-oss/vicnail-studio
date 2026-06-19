"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Hls from "hls.js";
import { Watermark } from "./Watermark";
import { PlayerControls } from "./PlayerControls";
import { getDeviceFingerprint, getDeviceLabel } from "@/lib/device";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MonitorSmartphone,
  Play,
  X,
} from "lucide-react";

interface NextLessonInfo {
  id: string;
  title: string;
  href: string;
}

/** 播放器對外暴露的指令介面（給筆記/書籤面板抓目前時間、跳轉用） */
export interface LessonPlayerApi {
  getCurrentTime: () => number;
  seekTo: (seconds: number) => void;
}

interface VideoPlayerProps {
  lessonId: string;
  initialPosition?: number;
  onProgress?: (positionSeconds: number) => void;
  onComplete?: () => void;
  /** 下一堂課資訊 — 由觀看頁算好傳入，播完顯示倒數自動播放 */
  nextLesson?: NextLessonInfo | null;
  /** 播放器就緒時回傳指令介面（getCurrentTime / seekTo） */
  onReady?: (api: LessonPlayerApi) => void;
}

interface CaptionTrack {
  lang: string;
  label: string;
  url: string;
}

interface PlaybackToken {
  hlsUrl: string;
  expiresAt: number;
  captions?: CaptionTrack[];
  watermark: { email: string; timestamp: string };
}

interface ActiveDevice {
  id: string;
  label: string;
  fingerprint: string;
  lastActive: string;
}

const HEARTBEAT_INTERVAL_MS = 30_000;
const PROGRESS_SAVE_INTERVAL_MS = 10_000;
const TOKEN_REFRESH_BUFFER_MS = 60_000; // 過期前 1 分鐘換 token

export function VideoPlayer({
  lessonId,
  initialPosition = 0,
  onProgress,
  onComplete,
  nextLesson = null,
  onReady,
}: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const apiRef = useRef<LessonPlayerApi>({
    getCurrentTime: () => videoRef.current?.currentTime ?? 0,
    seekTo: (seconds: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = Math.max(0, seconds);
      v.play().catch(() => {});
    },
  });
  const [token, setToken] = useState<PlaybackToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceConflict, setDeviceConflict] = useState<ActiveDevice[]>([]);
  const [loading, setLoading] = useState(true);
  // hls levels 解析完成計數 — 觸發 PlayerControls 重讀畫質清單
  const [levelsVersion, setLevelsVersion] = useState(0);
  // 播完自動下一堂倒數
  const [countdown, setCountdown] = useState<number | null>(null);

  const fetchToken = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const fp = getDeviceFingerprint();
      const label = getDeviceLabel();
      const res = await fetch(`/api/lessons/${lessonId}/playback-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceFingerprint: fp, deviceLabel: label }),
      });

      if (res.status === 409) {
        const data = await res.json();
        if (data.error === "DEVICE_LIMIT") {
          setDeviceConflict(data.activeDevices || []);
          setError(data.message || "已達裝置上限");
          setLoading(false);
          return null;
        }
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "取得播放憑證失敗");
        setLoading(false);
        return null;
      }

      const data = (await res.json()) as PlaybackToken;
      setToken(data);
      setLoading(false);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "網路錯誤");
      setLoading(false);
      return null;
    }
  }, [lessonId]);

  async function kickDevice(fingerprint: string) {
    await fetch(`/api/video-sessions?fingerprint=${fingerprint}`, {
      method: "DELETE",
    });
    setDeviceConflict([]);
    await fetchToken();
  }

  // 初始載入
  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // 播放器就緒 → 回傳指令介面給外層（筆記/書籤面板用）
  useEffect(() => {
    onReadyRef.current?.(apiRef.current);
  }, []);

  // 載入 HLS
  useEffect(() => {
    if (!token || !videoRef.current) return;
    const video = videoRef.current;

    // 清理舊的
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });
      hls.loadSource(token.hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialPosition > 0) video.currentTime = initialPosition;
        setLevelsVersion((v) => v + 1);
      });
      // 字幕軌（Bunny caption）解析完成 → 通知 PlayerControls 重讀字幕清單
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        setLevelsVersion((v) => v + 1);
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error("HLS fatal error:", data);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // Token 可能過期，重新拿一次
            fetchToken();
          } else {
            setError("影片播放失敗");
          }
        }
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari 原生支援 HLS
      video.src = token.hlsUrl;
      video.addEventListener("loadedmetadata", () => {
        if (initialPosition > 0) video.currentTime = initialPosition;
      });
    } else {
      setError("您的瀏覽器不支援 HLS 串流");
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [token, initialPosition, fetchToken]);

  // Token 自動更新（過期前 1 分鐘）
  useEffect(() => {
    if (!token) return;
    const msUntilRefresh = token.expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_MS;
    if (msUntilRefresh <= 0) return;
    const t = setTimeout(() => fetchToken(), msUntilRefresh);
    return () => clearTimeout(t);
  }, [token, fetchToken]);

  // 心跳
  useEffect(() => {
    if (!token) return;
    const fp = getDeviceFingerprint();
    const send = () => {
      fetch(`/api/video-sessions/heartbeat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceFingerprint: fp, lessonId }),
      }).catch(() => {});
    };
    const interval = setInterval(send, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, lessonId]);

  // 進度儲存（每 10 秒 + 暫停時 + 離開時）
  const saveProgress = useCallback(
    async (force = false, completed = false) => {
      const video = videoRef.current;
      if (!video) return;
      const pos = Math.floor(video.currentTime);
      if (!force && pos < 5) return; // 不存太前面
      try {
        await fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionSeconds: pos, completed }),
        });
        onProgress?.(pos);
      } catch {}
    },
    [lessonId, onProgress]
  );

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => saveProgress(false), PROGRESS_SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [token, saveProgress]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePause = () => saveProgress(true);
    const handleEnded = () => {
      saveProgress(true, true);
      onComplete?.();
      if (nextLesson) setCountdown(5);
    };
    const handleBeforeUnload = () => saveProgress(true);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveProgress, onComplete, nextLesson]);

  // 自動下一堂倒數
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (nextLesson) router.push(nextLesson.href);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c === null ? null : c - 1)), 1000);
    return () => clearTimeout(t);
  }, [countdown, nextLesson, router]);

  // 裝置衝突 UI
  if (deviceConflict.length > 0) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center text-white space-y-4">
          <MonitorSmartphone size={48} className="mx-auto text-amber-400" />
          <h3 className="text-xl font-semibold">已達裝置上限</h3>
          <p className="text-gray-300 text-sm">
            您目前已在以下裝置觀看課程，請選擇要踢出哪一台：
          </p>
          <div className="space-y-2">
            {deviceConflict.map((d) => (
              <button
                key={d.id}
                onClick={() => kickDevice(d.fingerprint)}
                className="w-full bg-gray-800 hover:bg-red-900 transition-colors rounded-lg p-3 text-left flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{d.label}</div>
                  <div className="text-xs text-gray-400">
                    最後活動：{new Date(d.lastActive).toLocaleString("zh-TW")}
                  </div>
                </div>
                <span className="text-xs text-red-400">踢出 →</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setDeviceConflict([])}
            className="text-sm text-gray-400 hover:text-white"
          >
            取消
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center p-6">
        <div className="text-center text-white space-y-3">
          <AlertTriangle size={48} className="mx-auto text-red-400" />
          <p>{error}</p>
          <button
            onClick={() => fetchToken()}
            className="px-4 py-2 bg-pink-500 rounded-lg hover:bg-pink-600 text-sm"
          >
            重試
          </button>
        </div>
      </div>
    );
  }

  if (loading || !token) {
    return (
      <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-white" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group/player"
    >
      <video
        ref={videoRef}
        controls={false}
        controlsList="nodownload"
        playsInline
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full"
      >
        {/* Bunny 字幕（同源 proxy）；CC 由 PlayerControls 控制開關 */}
        {token.captions?.map((c, i) => (
          <track
            key={c.lang}
            kind="subtitles"
            src={c.url}
            srcLang={c.lang}
            label={c.label}
            default={i === 0}
          />
        ))}
      </video>
      <Watermark email={token.watermark.email} />

      <PlayerControls
        videoRef={videoRef}
        hlsRef={hlsRef}
        containerRef={containerRef}
        levelsVersion={levelsVersion}
      />

      {/* 播完自動下一堂倒數覆蓋層 */}
      {countdown !== null && nextLesson && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="text-center text-white max-w-sm w-full space-y-4">
            <p className="text-sm text-white/70">即將播放下一堂</p>
            <h3 className="text-lg sm:text-xl font-semibold line-clamp-2">
              {nextLesson.title}
            </h3>
            <p className="text-sm text-white/60">
              {countdown} 秒後自動播放…
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCountdown(null);
                  router.push(nextLesson.href);
                }}
                aria-label="立即播放下一堂"
                className="inline-flex items-center gap-1.5 bg-nail-gold hover:bg-nail-gold/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Play size={16} fill="currentColor" />
                立即播放
              </button>
              <button
                type="button"
                onClick={() => setCountdown(null)}
                aria-label="取消自動播放"
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <X size={16} />
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MarkCompleteButtonProps {
  lessonId: string;
  /** 後端目前已記錄的完成狀態 */
  initialCompleted: boolean;
  /** 已存的觀看位置（秒）— 標記完成時一併回傳，避免覆寫續播點 */
  positionSeconds?: number;
}

/**
 * 「標記完成」按鈕 — 呼叫既有 /api/lessons/[id]/progress 帶 { completed: true }
 * 成功後更新本地 UI（不重新整理頁面）。
 */
export function MarkCompleteButton({
  lessonId,
  initialCompleted,
  positionSeconds = 0,
}: MarkCompleteButtonProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [saving, setSaving] = useState(false);

  async function markComplete() {
    if (completed || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionSeconds, completed: true }),
      });
      if (res.ok) setCompleted(true);
    } catch {
      /* 失敗時保持未完成狀態 */
    } finally {
      setSaving(false);
    }
  }

  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle2 size={18} />
        已完成此單元
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={markComplete}
      disabled={saving}
      aria-label="標記此單元為完成"
      className="inline-flex items-center gap-1.5 bg-nail-gold hover:bg-nail-gold/90 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nail-gold/50"
    >
      {saving ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CheckCircle2 size={16} />
      )}
      標記完成
    </button>
  );
}
