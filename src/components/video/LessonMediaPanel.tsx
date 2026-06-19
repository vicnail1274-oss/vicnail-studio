"use client";

import { useRef } from "react";
import { VideoPlayer, type LessonPlayerApi } from "./VideoPlayer";
import { LessonNotesPanel } from "./LessonNotesPanel";

interface NextLessonInfo {
  id: string;
  title: string;
  href: string;
}

interface LessonMediaPanelProps {
  lessonId: string;
  courseId: string;
  initialPosition?: number;
  nextLesson?: NextLessonInfo | null;
  /** 已購買學員才顯示筆記/書籤面板 */
  showNotes?: boolean;
}

/**
 * 觀看頁的影音區：播放器 + 筆記/書籤面板共享同一播放器指令介面
 * （筆記面板可抓目前播放時間、點時間跳轉）。
 */
export function LessonMediaPanel({
  lessonId,
  courseId,
  initialPosition = 0,
  nextLesson = null,
  showNotes = true,
}: LessonMediaPanelProps) {
  const apiRef = useRef<LessonPlayerApi | null>(null);

  return (
    <div className="space-y-4">
      <VideoPlayer
        lessonId={lessonId}
        initialPosition={initialPosition}
        nextLesson={nextLesson}
        onReady={(api) => {
          apiRef.current = api;
        }}
      />
      {showNotes && (
        <LessonNotesPanel
          lessonId={lessonId}
          courseId={courseId}
          getCurrentTime={() => apiRef.current?.getCurrentTime() ?? 0}
          onSeek={(s) => apiRef.current?.seekTo(s)}
        />
      )}
    </div>
  );
}
