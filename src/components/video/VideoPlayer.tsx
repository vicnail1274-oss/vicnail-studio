"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Watermark } from "./Watermark";
import { getDeviceFingerprint, getDeviceLabel } from "@/lib/device";
import { AlertTriangle, Loader2, MonitorSmartphone } from "lucide-react";

interface VideoPlayerProps {
  lessonId: string;
  initialPosition?: number;
  onProgress?: (positionSeconds: number) => void;
  onComplete?: () => void;
}

interface PlaybackToken {
  hlsUrl: string;
  expiresAt: number;
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
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [token, setToken] = useState<PlaybackToken | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceConflict, setDeviceConflict] = useState<ActiveDevice[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, [saveProgress, onComplete]);

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
    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
      <video
        ref={videoRef}
        controls
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full"
      />
      <Watermark email={token.watermark.email} />
    </div>
  );
}
