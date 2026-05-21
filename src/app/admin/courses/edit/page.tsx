"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, X, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const LEVELS = [
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "進階" },
  { value: "all", label: "通用" },
];

const CATEGORIES = [
  { value: "gel", label: "凝膠" },
  { value: "extension", label: "延甲" },
  { value: "design", label: "彩繪設計" },
  { value: "certification", label: "考照" },
  { value: "business", label: "美甲創業" },
  { value: "other", label: "其他" },
];

export default function AdminCourseEditPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">載入中...</div>}>
      <AdminCourseEditInner />
    </Suspense>
  );
}

function AdminCourseEditInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("id");
  const isEdit = !!courseId;

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    long_description: "",
    price: 2500,
    sale_price: "",
    thumbnail_url: "",
    cover_video_url: "",
    status: "draft",
    sort_order: 0,
    level: "beginner",
    category: "gel",
    instructor_name: "Vic 老師",
    instructor_bio: "",
    featured: false,
    what_youll_learn: [] as string[],
    prerequisites: [] as string[],
    target_audience: [] as string[],
    learnInput: "",
    prereqInput: "",
    audienceInput: "",
  });

  useEffect(() => {
    if (courseId) {
      fetch("/api/admin/courses")
        .then((r) => r.json())
        .then((list) => {
          const c = list.find((x: { id: string }) => x.id === courseId);
          if (!c) return;
          setForm((prev) => ({
            ...prev,
            slug: c.slug || "",
            title: c.title || "",
            description: c.description || "",
            long_description: c.long_description || "",
            price: c.price || 0,
            sale_price: c.sale_price ? String(c.sale_price) : "",
            thumbnail_url: c.thumbnail_url || "",
            cover_video_url: c.cover_video_url || "",
            status: c.status || "draft",
            sort_order: c.sort_order || 0,
            level: c.level || "beginner",
            category: c.category || "gel",
            instructor_name: c.instructor_name || "Vic 老師",
            instructor_bio: c.instructor_bio || "",
            featured: !!c.featured,
            what_youll_learn: c.what_youll_learn || [],
            prerequisites: c.prerequisites || [],
            target_audience: c.target_audience || [],
          }));
        });
    }
  }, [courseId]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addToList(key: "what_youll_learn" | "prerequisites" | "target_audience", inputKey: "learnInput" | "prereqInput" | "audienceInput") {
    const value = form[inputKey].trim();
    if (!value) return;
    updateField(key, [...form[key], value] as never);
    updateField(inputKey, "" as never);
  }

  function removeFromList(key: "what_youll_learn" | "prerequisites" | "target_audience", idx: number) {
    updateField(key, form[key].filter((_, i) => i !== idx) as never);
  }

  function generateSlug() {
    const base = form.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);
    if (base) updateField("slug", base);
  }

  async function handleSave() {
    if (!form.title) {
      alert("請輸入課程名稱");
      return;
    }
    if (!form.slug) {
      alert("請輸入 slug（URL 識別碼）");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(form.slug)) {
      alert("slug 只能包含小寫字母、數字、連字號");
      return;
    }

    setSaving(true);
    const payload = {
      ...(isEdit ? { id: courseId } : {}),
      slug: form.slug,
      title: form.title,
      description: form.description || null,
      long_description: form.long_description || null,
      price: Number(form.price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      thumbnail_url: form.thumbnail_url || null,
      cover_video_url: form.cover_video_url || null,
      status: form.status,
      sort_order: Number(form.sort_order),
      level: form.level,
      category: form.category,
      instructor_name: form.instructor_name,
      instructor_bio: form.instructor_bio || null,
      featured: form.featured,
      what_youll_learn: form.what_youll_learn,
      prerequisites: form.prerequisites,
      target_audience: form.target_audience,
    };

    const res = await fetch("/api/admin/courses", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const saved = await res.json();
      // 新增完直接跳到章節管理
      if (!isEdit) {
        router.push(`/admin/courses/${saved.id}/lessons`);
      } else {
        router.push("/admin/courses");
      }
    } else {
      const err = await res.json();
      alert(err.error || "儲存失敗");
    }
    setSaving(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} /> 返回課程列表
      </Link>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? "編輯課程" : "新增課程"}
      </h1>

      <div className="space-y-6 bg-white rounded-xl border p-6">
        <div>
          <label className="block text-sm font-medium mb-1">課程名稱 *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            onBlur={() => !form.slug && generateSlug()}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="例：凝膠美甲基礎課"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Slug（網址識別碼）*
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value.toLowerCase())}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="gel-basic-course"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              自動產生
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            學生看到的網址：vicnail-studio.com/zh-TW/courses/{form.slug || "your-slug"}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">短描述（列表頁顯示）</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            placeholder="一句話介紹這堂課"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            完整介紹（詳情頁顯示，支援 markdown）
          </label>
          <textarea
            rows={6}
            value={form.long_description}
            onChange={(e) => updateField("long_description", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">原價 (NT$) *</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateField("price", Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              特價（留空為無特價）
            </label>
            <input
              type="number"
              value={form.sale_price}
              onChange={(e) => updateField("sale_price", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300"
              placeholder="可選"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">級別</label>
            <select
              value={form.level}
              onChange={(e) => updateField("level", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">分類</label>
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">排序</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => updateField("sort_order", Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="數字越小越前面"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">封面圖片 URL</label>
          <input
            type="text"
            value={form.thumbnail_url}
            onChange={(e) => updateField("thumbnail_url", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://..."
          />
          {form.thumbnail_url && (
            <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border">
              <Image src={form.thumbnail_url} alt="" fill sizes="128px" className="object-cover" />
            </div>
          )}
        </div>

        <ListEditor
          label="學生會學到什麼"
          items={form.what_youll_learn}
          input={form.learnInput}
          onInputChange={(v) => updateField("learnInput", v)}
          onAdd={() => addToList("what_youll_learn", "learnInput")}
          onRemove={(i) => removeFromList("what_youll_learn", i)}
          placeholder="例：學會凝膠單色塗法"
        />

        <ListEditor
          label="先備條件"
          items={form.prerequisites}
          input={form.prereqInput}
          onInputChange={(v) => updateField("prereqInput", v)}
          onAdd={() => addToList("prerequisites", "prereqInput")}
          onRemove={(i) => removeFromList("prerequisites", i)}
          placeholder="例：完成基礎入門課"
        />

        <ListEditor
          label="適合對象"
          items={form.target_audience}
          input={form.audienceInput}
          onInputChange={(v) => updateField("audienceInput", v)}
          onAdd={() => addToList("target_audience", "audienceInput")}
          onRemove={(i) => removeFromList("target_audience", i)}
          placeholder="例：想轉職美甲師"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">講師名稱</label>
            <input
              type="text"
              value={form.instructor_name}
              onChange={(e) => updateField("instructor_name", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">狀態</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="draft">草稿</option>
              <option value="published">已上架</option>
              <option value="archived">已下架</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">講師簡介</label>
          <textarea
            rows={3}
            value={form.instructor_bio}
            onChange={(e) => updateField("instructor_bio", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">精選課程（首頁優先顯示）</span>
        </label>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-pink-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-pink-600 disabled:bg-gray-300"
        >
          <Save size={18} />
          {saving ? "儲存中..." : isEdit ? "更新課程" : "建立課程並新增章節"}
        </button>
      </div>
    </div>
  );
}

function ListEditor({
  label,
  items,
  input,
  onInputChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          className="flex-1 px-4 py-2 border rounded-lg"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onAdd}
          className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <Plus size={16} />
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between bg-pink-50 rounded-lg px-3 py-1.5 text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
