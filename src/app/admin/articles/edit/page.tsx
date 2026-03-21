"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Frontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  author?: string;
  source?: string;
  draft?: boolean;
  [key: string]: unknown;
};

function EditPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const section = params.get("section") || "";
  const locale = params.get("locale") || "";
  const slug = params.get("slug") || "";

  const [frontmatter, setFrontmatter] = useState<Frontmatter | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // AI 審查
  const [reviewing, setReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState("");
  const [showReview, setShowReview] = useState(false);

  // 欄位暫存
  const [tagsInput, setTagsInput] = useState("");

  const fetchArticle = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/admin/article?section=${section}&locale=${locale}&slug=${slug}`
    );
    if (res.status === 401) { router.push("/admin/login"); return; }
    if (!res.ok) { setLoading(false); return; }
    const data = await res.json();
    setFrontmatter(data.frontmatter);
    setContent(data.content);
    setTagsInput((data.frontmatter.tags || []).join(", "));
    setLoading(false);
  }, [section, locale, slug, router]);

  useEffect(() => {
    if (section && locale && slug) fetchArticle();
  }, [fetchArticle, section, locale, slug]);

  async function handleSave() {
    if (!frontmatter) return;
    setSaving(true);
    setSaveMsg("");

    const updatedFrontmatter = {
      ...frontmatter,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const res = await fetch("/api/admin/article", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, locale, slug, frontmatter: updatedFrontmatter, content }),
    });

    if (res.ok) {
      setSaveMsg("已儲存！");
      setFrontmatter(updatedFrontmatter);
    } else {
      setSaveMsg("儲存失敗，請再試");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  async function handleAIReview() {
    if (!frontmatter || !content) return;
    setReviewing(true);
    setShowReview(true);
    setReviewResult("");

    const res = await fetch("/api/admin/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: frontmatter.title, content, locale }),
    });

    if (res.ok) {
      const data = await res.json();
      setReviewResult(data.review);
    } else {
      setReviewResult("審查失敗，請確認 ANTHROPIC_API_KEY 已設定。");
    }
    setReviewing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        載入中...
      </div>
    );
  }

  if (!frontmatter) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-400">
        <p>找不到文章</p>
        <Link href="/admin/articles" className="text-pink-400 hover:underline text-sm">
          ← 返回列表
        </Link>
      </div>
    );
  }

  const sectionLabel: Record<string, string> = {
    "nail-news": "美甲新聞",
    "nail-knowledge": "美甲知識",
    "ai": "AI 工具",
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/articles" className="text-gray-400 hover:text-white text-sm flex-shrink-0">
            ← 返回
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-0.5">
              <span>{sectionLabel[section] || section}</span>
              <span>/</span>
              <span>{locale}</span>
            </div>
            <h1 className="text-white font-semibold truncate text-sm">{frontmatter.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {saveMsg && (
            <span className={`text-sm ${saveMsg.includes("失敗") ? "text-red-400" : "text-green-400"}`}>
              {saveMsg}
            </span>
          )}
          <button
            onClick={handleAIReview}
            disabled={reviewing}
            className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm hover:bg-purple-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            <span>✨</span>
            {reviewing ? "AI 審查中..." : "Claude 審查"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm hover:bg-pink-500 disabled:opacity-50 transition-colors"
          >
            {saving ? "儲存中..." : "儲存"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* 左側：文章編輯 */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* 標題 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">標題</label>
            <input
              value={frontmatter.title}
              onChange={(e) => setFrontmatter({ ...frontmatter, title: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-pink-500 focus:outline-none text-sm"
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">描述（SEO）</label>
            <textarea
              value={frontmatter.description}
              onChange={(e) => setFrontmatter({ ...frontmatter, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-pink-500 focus:outline-none text-sm resize-none"
            />
          </div>

          {/* 標籤 & 日期 & 草稿 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">標籤（逗號分隔）</label>
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">日期</label>
              <input
                type="date"
                value={frontmatter.date}
                onChange={(e) => setFrontmatter({ ...frontmatter, date: e.target.value })}
                className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2.5 text-white focus:border-pink-500 focus:outline-none text-sm"
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!frontmatter.draft}
                  onChange={(e) => setFrontmatter({ ...frontmatter, draft: e.target.checked })}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-gray-300">草稿</span>
              </label>
            </div>
          </div>

          {/* 內文編輯器 */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              內文（Markdown 格式）
              <span className="ml-2 text-gray-600">{content.length} 字元</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={30}
              spellCheck={false}
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white font-mono text-sm focus:border-pink-500 focus:outline-none resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* 右側：AI 審查結果 */}
        {showReview && (
          <div className="w-96 flex-shrink-0">
            <div className="sticky top-6 rounded-xl border border-purple-500/30 bg-purple-950/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-purple-300 flex items-center gap-2">
                  <span>✨</span> Claude Opus 4.6 審查
                </h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-500 hover:text-gray-300 text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {reviewing ? (
                <div className="space-y-3">
                  <div className="h-3 bg-purple-800/40 rounded animate-pulse" />
                  <div className="h-3 bg-purple-800/40 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-purple-800/40 rounded animate-pulse w-3/5" />
                  <p className="text-xs text-purple-400 mt-4">Claude 正在分析文章中...</p>
                </div>
              ) : (
                <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {reviewResult}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">載入中...</div>}>
      <EditPageInner />
    </Suspense>
  );
}
