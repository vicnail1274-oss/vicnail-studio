"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { LessonUploader } from "@/components/admin/LessonUploader";

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  bunny_video_id: string | null;
  hls_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number;
  sort_order: number;
  is_preview: boolean;
  upload_status: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "尚未上傳", color: "text-gray-500 bg-gray-100", icon: Clock },
  uploading: { label: "上傳中", color: "text-blue-500 bg-blue-50", icon: Clock },
  processing: { label: "處理中", color: "text-amber-500 bg-amber-50", icon: Clock },
  ready: { label: "可播放", color: "text-green-600 bg-green-50", icon: CheckCircle },
  failed: { label: "失敗", color: "text-red-500 bg-red-50", icon: AlertTriangle },
};

export default function AdminCourseLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    duration_seconds: 0,
    is_preview: false,
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [cRes, lRes] = await Promise.all([
      fetch("/api/admin/courses"),
      fetch(`/api/admin/lessons?course_id=${courseId}`),
    ]);
    if (cRes.ok) {
      const list = await cRes.json();
      const c = list.find((x: Course) => x.id === courseId);
      if (c) setCourse(c);
    }
    if (lRes.ok) {
      setLessons(await lRes.json());
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addLesson() {
    const title = prompt("章節名稱？");
    if (!title) return;
    const res = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        course_id: courseId,
        title,
        sort_order: lessons.length,
      }),
    });
    if (!res.ok) {
      alert("新增失敗");
      return;
    }
    load();
  }

  async function deleteLesson(id: string, title: string) {
    if (!confirm(`刪除章節「${title}」？影片也會從 Bunny 一併刪除。`)) return;
    await fetch(`/api/admin/lessons?id=${id}`, { method: "DELETE" });
    load();
  }

  function startEdit(lesson: Lesson) {
    setEditing(lesson.id);
    setEditForm({
      title: lesson.title,
      description: lesson.description || "",
      duration_seconds: lesson.duration_seconds || 0,
      is_preview: lesson.is_preview,
    });
  }

  async function saveEdit() {
    if (!editing) return;
    const res = await fetch("/api/admin/lessons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editing,
        title: editForm.title,
        description: editForm.description || null,
        duration_seconds: Number(editForm.duration_seconds),
        is_preview: editForm.is_preview,
      }),
    });
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      alert("儲存失敗");
    }
  }

  async function moveLesson(id: string, direction: -1 | 1) {
    const idx = lessons.findIndex((l) => l.id === id);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= lessons.length) return;

    const reordered = [...lessons];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    // 並行 update sort_order
    await Promise.all(
      reordered.map((l, i) =>
        fetch("/api/admin/lessons", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: l.id, sort_order: i }),
        })
      )
    );
    load();
  }

  if (loading) {
    return <div className="p-6 text-gray-500">載入中...</div>;
  }

  if (!course) {
    return (
      <div className="p-6">
        <p className="text-red-500">課程不存在</p>
        <button onClick={() => router.push("/admin/courses")} className="mt-2 text-pink-500">
          返回課程列表
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> 返回課程列表
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{course.title} · 章節管理</h1>
          <p className="text-sm text-gray-400">共 {lessons.length} 個章節</p>
        </div>
        <button
          onClick={addLesson}
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <Plus size={18} /> 新增章節
        </button>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border">
          <p>還沒有章節，點上方「新增章節」開始</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, idx) => {
            const StatusIcon = STATUS_BADGE[lesson.upload_status]?.icon || Clock;
            const isEditing = editing === lesson.id;

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-xl border p-4 space-y-3"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => moveLesson(lesson.id, -1)}
                      disabled={idx === 0}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <GripVertical size={14} className="text-gray-300" />
                    <button
                      onClick={() => moveLesson(lesson.id, 1)}
                      disabled={idx === lessons.length - 1}
                      className="text-gray-300 hover:text-gray-500 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="w-full px-3 py-1.5 border rounded-lg font-medium"
                        />
                        <textarea
                          rows={2}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({ ...editForm, description: e.target.value })
                          }
                          placeholder="章節描述（選填）"
                          className="w-full px-3 py-1.5 border rounded-lg text-sm resize-none"
                        />
                        <div className="flex items-center gap-3 text-sm">
                          <label className="flex items-center gap-1">
                            時長（秒）：
                            <input
                              type="number"
                              value={editForm.duration_seconds}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  duration_seconds: Number(e.target.value),
                                })
                              }
                              className="w-20 px-2 py-1 border rounded"
                            />
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editForm.is_preview}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  is_preview: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <Eye size={14} />
                            免費試看
                          </label>
                          <button
                            onClick={saveEdit}
                            className="ml-auto px-3 py-1 bg-pink-500 text-white rounded text-xs"
                          >
                            <Save size={12} className="inline mr-1" />
                            儲存
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="text-gray-400 text-xs"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">#{idx + 1}</span>
                          <h3 className="font-medium">{lesson.title}</h3>
                          {lesson.is_preview && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Eye size={10} />
                              免費試看
                            </span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              STATUS_BADGE[lesson.upload_status]?.color || ""
                            }`}
                          >
                            <StatusIcon size={10} />
                            {STATUS_BADGE[lesson.upload_status]?.label || lesson.upload_status}
                          </span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                        )}
                      </>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(lesson)}
                        className="px-2 py-1 text-xs text-gray-500 hover:text-blue-500"
                      >
                        編輯
                      </button>
                      <button
                        onClick={() => deleteLesson(lesson.id, lesson.title)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Upload area */}
                {lesson.upload_status !== "ready" && !isEditing && (
                  <div className="ml-8 pl-3 border-l-2 border-gray-100">
                    <LessonUploader
                      lessonId={lesson.id}
                      lessonTitle={`${course.title} · ${lesson.title}`}
                      onComplete={() => load()}
                    />
                  </div>
                )}

                {lesson.upload_status === "ready" && lesson.bunny_video_id && (
                  <div className="ml-8 pl-3 border-l-2 border-green-100 text-xs text-gray-500">
                    Bunny Video ID: <code className="text-gray-600">{lesson.bunny_video_id}</code>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
