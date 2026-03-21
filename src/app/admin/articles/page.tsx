"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Article = {
  slug: string;
  title: string;
  date: string;
  draft: boolean;
  source: string;
  tags: string[];
};

const SECTIONS = [
  { value: "nail-news", label: "美甲新聞" },
  { value: "nail-knowledge", label: "美甲知識" },
  { value: "ai", label: "AI 工具" },
];

const LOCALES = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
];

export default function AdminArticlesPage() {
  const router = useRouter();
  const [section, setSection] = useState("nail-news");
  const [locale, setLocale] = useState("zh-TW");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, locale }),
    });
    if (res.status === 401) {
      router.push("/admin/login");
      return;
    }
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }, [section, locale, router]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💅</span>
          <div>
            <h1 className="text-lg font-bold text-white">VicNail 後台</h1>
            <p className="text-xs text-gray-400">文章管理</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          登出
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 篩選器 */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Section 篩選 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {SECTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => setSection(s.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  section === s.value
                    ? "bg-pink-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Locale 篩選 */}
          <div className="flex rounded-lg overflow-hidden border border-gray-700">
            {LOCALES.map((l) => (
              <button
                key={l.value}
                onClick={() => setLocale(l.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  locale === l.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* 搜尋 */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋文章..."
            className="flex-1 min-w-48 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
          />
        </div>

        {/* 統計 */}
        <div className="mb-4 text-sm text-gray-400">
          共 <span className="text-white font-medium">{filtered.length}</span> 篇文章
          {search && ` (搜尋: "${search}")`}
        </div>

        {/* 文章列表 */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">載入中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">沒有找到文章</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((article) => (
              <Link
                key={article.slug}
                href={`/admin/articles/edit?section=${section}&locale=${locale}&slug=${article.slug}`}
                className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 hover:border-pink-500/50 hover:bg-gray-800/50 transition-all group"
              >
                {/* 狀態燈號 */}
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    article.draft ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />

                {/* 標題 & Slug */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate group-hover:text-pink-300 transition-colors">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{article.slug}</p>
                </div>

                {/* 標籤 */}
                <div className="hidden md:flex gap-1 flex-wrap max-w-xs">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 來源 */}
                <span
                  className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    article.source === "bot"
                      ? "bg-purple-900/50 text-purple-300"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {article.source === "bot" ? "AI" : "手動"}
                </span>

                {/* 日期 */}
                <span className="text-xs text-gray-500 flex-shrink-0">{article.date}</span>

                {/* 箭頭 */}
                <span className="text-gray-600 group-hover:text-pink-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
