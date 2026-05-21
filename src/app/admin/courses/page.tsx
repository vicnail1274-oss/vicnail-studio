"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Eye, EyeOff, Trash2, GraduationCap, Film, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  status: string;
  level: string | null;
  category: string | null;
  total_lessons: number;
  total_duration_seconds: number;
  featured: boolean;
  sort_order: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "bg-gray-100 text-gray-600" },
  published: { label: "已上架", color: "bg-green-100 text-green-700" },
  archived: { label: "已下架", color: "bg-red-100 text-red-600" },
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "進階",
  all: "通用",
};

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} 時 ${m} 分` : `${m} 分`;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCourses() {
    setLoading(true);
    const res = await fetch("/api/admin/courses");
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function toggleStatus(course: Course) {
    const newStatus = course.status === "published" ? "archived" : "published";
    await fetch("/api/admin/courses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: course.id, status: newStatus }),
    });
    loadCourses();
  }

  async function deleteCourse(id: string, title: string) {
    if (!confirm(`確定要刪除「${title}」？已有學生購買的課程會自動歸檔，不會真正刪除。`))
      return;
    const res = await fetch(`/api/admin/courses?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "刪除失敗");
    }
    loadCourses();
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap size={24} className="text-pink-500" />
          課程管理
        </h1>
        <Link
          href="/admin/courses/edit"
          className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <Plus size={18} /> 新增課程
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">載入中...</p>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <GraduationCap size={48} className="mx-auto mb-4" />
          <p>還沒有課程</p>
          <Link
            href="/admin/courses/edit"
            className="inline-block mt-4 text-pink-500 hover:underline"
          >
            建立第一堂課
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">課程</th>
                <th className="p-3">級別</th>
                <th className="p-3">章節 / 時長</th>
                <th className="p-3">價格</th>
                <th className="p-3">狀態</th>
                <th className="p-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0 relative">
                        {c.thumbnail_url ? (
                          <Image
                            src={c.thumbnail_url}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <GraduationCap size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-medium truncate max-w-[260px] flex items-center gap-1">
                          {c.featured && (
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                          )}
                          {c.title}
                        </div>
                        <div className="text-xs text-gray-400">/{c.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">
                    {LEVEL_LABELS[c.level || ""] || "—"}
                  </td>
                  <td className="p-3 text-gray-600">
                    <div className="flex items-center gap-1">
                      <Film size={14} className="text-gray-400" />
                      {c.total_lessons} 堂
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDuration(c.total_duration_seconds)}
                    </div>
                  </td>
                  <td className="p-3">
                    {c.sale_price ? (
                      <div>
                        <span className="font-semibold">NT${c.sale_price}</span>
                        <span className="text-gray-400 line-through ml-1 text-xs">
                          NT${c.price}
                        </span>
                      </div>
                    ) : (
                      <span className="font-semibold">NT${c.price}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_LABELS[c.status]?.color || ""
                      }`}
                    >
                      {STATUS_LABELS[c.status]?.label || c.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/courses/${c.id}/lessons`}
                        className="p-1.5 text-gray-400 hover:text-purple-500"
                        title="章節 / 影片"
                      >
                        <Film size={16} />
                      </Link>
                      <Link
                        href={`/admin/courses/edit?id=${c.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-500"
                        title="編輯"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => toggleStatus(c)}
                        className="p-1.5 text-gray-400 hover:text-amber-500"
                        title={c.status === "published" ? "下架" : "上架"}
                      >
                        {c.status === "published" ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCourse(c.id, c.title)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="刪除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
