"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X, Loader2 } from "lucide-react";
import * as tus from "tus-js-client";

interface LessonUploaderProps {
  lessonId: string;
  lessonTitle: string;
  onComplete: (videoId: string) => void;
}

export function LessonUploader({
  lessonId,
  lessonTitle,
  onComplete,
}: LessonUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "preparing" | "uploading" | "processing" | "done" | "error"
  >("idle");
  const [error, setError] = useState("");
  const uploadRef = useRef<tus.Upload | null>(null);

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024 * 1024) {
      setError("檔案太大（上限 5GB）");
      return;
    }
    setFile(f);
    setError("");
    setStatus("idle");
    setProgress(0);
  }

  async function startUpload() {
    if (!file) return;
    setStatus("preparing");
    setError("");

    try {
      // 1. 跟我們的 API 換取 Bunny 簽章
      const res = await fetch("/api/admin/bunny/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: lessonTitle }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "取得上傳簽章失敗");
      }
      const sig = await res.json();

      // 2. 用 TUS 上傳到 Bunny
      setStatus("uploading");
      const upload = new tus.Upload(file, {
        endpoint: sig.tus.endpoint,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        chunkSize: 50 * 1024 * 1024, // 50 MB chunks
        headers: sig.tus.headers,
        metadata: {
          ...sig.tus.metadata,
          filetype: file.type || "video/mp4",
          filename: file.name,
        },
        onError(err) {
          console.error("TUS upload error:", err);
          setError(err.message || "上傳失敗");
          setStatus("error");
        },
        onProgress(bytesUploaded, bytesTotal) {
          setProgress(Math.floor((bytesUploaded / bytesTotal) * 100));
        },
        async onSuccess() {
          setProgress(100);
          setStatus("processing");
          // 3. 更新 lesson 的 bunny_video_id + upload_status='ready'
          const updateRes = await fetch("/api/admin/lessons", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: lessonId,
              bunny_video_id: sig.videoId,
              upload_status: "ready",
              uploaded_at: new Date().toISOString(),
            }),
          });
          if (!updateRes.ok) {
            const err = await updateRes.json();
            setError(err.error || "影片已上傳但同步失敗");
            setStatus("error");
            return;
          }
          setStatus("done");
          onComplete(sig.videoId);
        },
      });

      uploadRef.current = upload;
      upload.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上傳失敗");
      setStatus("error");
    }
  }

  function cancelUpload() {
    if (uploadRef.current) {
      uploadRef.current.abort();
      uploadRef.current = null;
    }
    setStatus("idle");
    setProgress(0);
    setFile(null);
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-3 py-2 text-sm">
        <CheckCircle size={18} />
        <span>影片已上傳，Bunny 處理中（約 1-3 分鐘可播放）</span>
      </div>
    );
  }

  if (status === "uploading" || status === "preparing" || status === "processing") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {status === "preparing" && "準備中..."}
            {status === "uploading" && `上傳中... ${progress}%`}
            {status === "processing" && "Bunny 處理中..."}
          </span>
          {status === "uploading" && (
            <button
              onClick={cancelUpload}
              className="text-red-500 text-xs hover:underline"
            >
              取消
            </button>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-pink-500 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {file && (
          <div className="text-xs text-gray-400">
            {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-pink-300 hover:bg-pink-50 transition-colors">
        <Upload size={18} className="text-gray-400" />
        <span className="text-sm text-gray-600">
          {file ? file.name : "選擇影片檔案（mp4 / mov / mkv）"}
        </span>
        <input
          type="file"
          accept="video/*"
          onChange={onSelectFile}
          className="hidden"
        />
      </label>

      {file && status === "idle" && (
        <div className="flex items-center gap-2">
          <button
            onClick={startUpload}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 text-sm font-medium"
          >
            <Upload size={16} />
            開始上傳（{(file.size / 1024 / 1024).toFixed(1)} MB）
          </button>
          <button
            onClick={() => setFile(null)}
            className="p-2 text-gray-400 hover:text-red-500"
            title="取消"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2 text-sm">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {status === "error" && (
        <button
          onClick={() => {
            setStatus("idle");
            setError("");
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          <Loader2 size={14} className="inline mr-1" />
          重試
        </button>
      )}
    </div>
  );
}
