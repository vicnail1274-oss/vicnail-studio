"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, StickyNote, Bookmark, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LessonNote, LessonBookmark } from "@/lib/supabase/types";

const MAX_NOTE_LENGTH = 2000;
const MAX_LABEL_LENGTH = 100;

function formatTime(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

type Tab = "notes" | "bookmarks";

interface LessonNotesPanelProps {
  lessonId: string;
  courseId: string;
  /** 取得播放器目前時間（秒）；未提供時筆記/書籤不帶時間 */
  getCurrentTime?: () => number;
  /** 點擊時間時跳轉播放器 */
  onSeek?: (seconds: number) => void;
}

export function LessonNotesPanel({
  lessonId,
  getCurrentTime,
  onSeek,
}: LessonNotesPanelProps) {
  const [tab, setTab] = useState<Tab>("notes");

  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [bookmarks, setBookmarks] = useState<LessonBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsLogin, setNeedsLogin] = useState(false);

  // 筆記輸入
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // 書籤輸入
  const [bookmarkLabel, setBookmarkLabel] = useState("");
  const [savingBookmark, setSavingBookmark] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [notesRes, bmRes] = await Promise.all([
        fetch(`/api/lessons/${lessonId}/notes`),
        fetch(`/api/lessons/${lessonId}/bookmarks`),
      ]);

      if (notesRes.status === 401 || bmRes.status === 401) {
        setNeedsLogin(true);
        setNotes([]);
        setBookmarks([]);
        return;
      }
      setNeedsLogin(false);

      if (notesRes.ok) {
        const data = await notesRes.json();
        setNotes(Array.isArray(data.notes) ? data.notes : []);
      }
      if (bmRes.ok) {
        const data = await bmRes.json();
        setBookmarks(Array.isArray(data.bookmarks) ? data.bookmarks : []);
      }
    } catch {
      // graceful：網路錯誤時保持空清單
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAddNote() {
    const content = noteContent.trim();
    if (!content || savingNote) return;
    setSavingNote(true);
    try {
      const positionSeconds = Math.floor(getCurrentTime?.() ?? 0);
      const res = await fetch(`/api/lessons/${lessonId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionSeconds, content }),
      });
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.note) {
        setNotes((prev) =>
          [...prev, data.note as LessonNote].sort(
            (a, b) =>
              a.position_seconds - b.position_seconds ||
              a.created_at.localeCompare(b.created_at)
          )
        );
        setNoteContent("");
      }
    } catch {
      // graceful
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAddBookmark() {
    if (savingBookmark) return;
    setSavingBookmark(true);
    try {
      const positionSeconds = Math.floor(getCurrentTime?.() ?? 0);
      const label = bookmarkLabel.trim();
      const res = await fetch(`/api/lessons/${lessonId}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionSeconds, label: label || undefined }),
      });
      if (res.status === 401) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok) return;
      const data = await res.json();
      if (data.bookmark) {
        setBookmarks((prev) =>
          [...prev, data.bookmark as LessonBookmark].sort(
            (a, b) => a.position_seconds - b.position_seconds
          )
        );
        setBookmarkLabel("");
      }
    } catch {
      // graceful
    } finally {
      setSavingBookmark(false);
    }
  }

  async function handleDeleteNote(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/lessons/${lessonId}/notes?id=${id}`, {
        method: "DELETE",
      });
    } catch {
      // graceful：失敗就重新載入修正狀態
      load();
    }
  }

  async function handleDeleteBookmark(id: string) {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    try {
      await fetch(`/api/lessons/${lessonId}/bookmarks?id=${id}`, {
        method: "DELETE",
      });
    } catch {
      load();
    }
  }

  const hasTime = typeof getCurrentTime === "function";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
      {/* 分頁切換 */}
      <div className="flex border-b border-gray-100">
        <button
          type="button"
          onClick={() => setTab("notes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
            tab === "notes"
              ? "text-nail-gold border-b-2 border-nail-gold bg-nail-cream/40"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <StickyNote size={16} />
          筆記
          {notes.length > 0 && (
            <span className="text-xs text-gray-400">({notes.length})</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setTab("bookmarks")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors",
            tab === "bookmarks"
              ? "text-nail-gold border-b-2 border-nail-gold bg-nail-cream/40"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Bookmark size={16} />
          書籤
          {bookmarks.length > 0 && (
            <span className="text-xs text-gray-400">({bookmarks.length})</span>
          )}
        </button>
      </div>

      <div className="p-4">
        {needsLogin ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            登入後可記筆記 ✨
          </p>
        ) : tab === "notes" ? (
          <div>
            {/* 筆記輸入 */}
            <textarea
              value={noteContent}
              onChange={(e) =>
                setNoteContent(e.target.value.slice(0, MAX_NOTE_LENGTH))
              }
              rows={3}
              aria-label="筆記內容"
              placeholder="在這裡寫下你的學習筆記…"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-nail-gold focus:ring-2 focus:ring-nail-gold/20 resize-none"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-gray-400">
                {noteContent.length}/{MAX_NOTE_LENGTH}
              </span>
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!noteContent.trim() || savingNote}
                className="px-3 py-1.5 rounded-lg bg-nail-gold text-white text-sm font-medium hover:bg-nail-gold/90 disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                {savingNote ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                {hasTime
                  ? `在 ${formatTime(getCurrentTime?.() ?? 0)} 加筆記`
                  : "加筆記"}
              </button>
            </div>

            {/* 筆記清單 */}
            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  還沒有筆記，邊看邊記下重點吧 ✨
                </p>
              ) : (
                <ul className="space-y-2">
                  {notes.map((n) => (
                    <li
                      key={n.id}
                      className="group p-3 rounded-lg border border-gray-100 bg-white"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onSeek?.(n.position_seconds)}
                          disabled={!onSeek}
                          className={cn(
                            "text-xs font-medium text-nail-gold tabular-nums rounded px-1.5 py-0.5 bg-nail-cream/60 flex-shrink-0",
                            onSeek
                              ? "hover:bg-nail-pink/30 cursor-pointer"
                              : "cursor-default"
                          )}
                        >
                          {formatTime(n.position_seconds)}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id)}
                          aria-label="刪除筆記"
                          className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="mt-1.5 text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {n.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* 書籤輸入 */}
            <input
              type="text"
              value={bookmarkLabel}
              onChange={(e) =>
                setBookmarkLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))
              }
              aria-label="書籤標籤"
              placeholder="書籤備註（選填）"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-nail-gold focus:ring-2 focus:ring-nail-gold/20"
            />
            <button
              type="button"
              onClick={handleAddBookmark}
              disabled={savingBookmark}
              className="mt-2 w-full px-3 py-1.5 rounded-lg bg-nail-gold text-white text-sm font-medium hover:bg-nail-gold/90 disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              {savingBookmark ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Bookmark size={14} />
              )}
              {hasTime
                ? `在 ${formatTime(getCurrentTime?.() ?? 0)} 加書籤`
                : "加書籤"}
            </button>

            {/* 書籤清單 */}
            <div className="mt-4">
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 bg-gray-50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  還沒有書籤，把想回看的片段標記起來吧 ✨
                </p>
              ) : (
                <ul className="space-y-2">
                  {bookmarks.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-100 bg-white"
                    >
                      <button
                        type="button"
                        onClick={() => onSeek?.(b.position_seconds)}
                        disabled={!onSeek}
                        className={cn(
                          "flex items-center gap-2 min-w-0 text-left",
                          onSeek ? "cursor-pointer group" : "cursor-default"
                        )}
                      >
                        <span className="text-xs font-medium text-nail-gold tabular-nums rounded px-1.5 py-0.5 bg-nail-cream/60 flex-shrink-0 group-hover:bg-nail-pink/30">
                          {formatTime(b.position_seconds)}
                        </span>
                        <span className="text-sm text-gray-700 truncate">
                          {b.label || "未命名書籤"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBookmark(b.id)}
                        aria-label="刪除書籤"
                        className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
