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

type GitStatus = {
  branch: string;
  lastCommit: string;
  unpushed: number;
  changedFiles: { status: string; file: string }[];
  hasChanges: boolean;
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

  // 推播狀態
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");
  const [showPublish, setShowPublish] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");

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

  const fetchGitStatus = useCallback(async () => {
    const res = await fetch("/api/admin/publish");
    if (res.ok) {
      const data = await res.json();
      setGitStatus(data);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  useEffect(() => {
    fetchGitStatus();
  }, [fetchGitStatus]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function handlePublish() {
    setPublishing(true);
    setPublishMsg("");

    const res = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: commitMessage || undefined }),
    });

    const data = await res.json();
    if (res.ok) {
      setPublishMsg(`推播成功！${data.filesChanged} 個檔案已上線 (${data.commit})`);
      setCommitMessage("");
      fetchGitStatus();
    } else {
      setPublishMsg(data.error || "推播失敗");
    }
    setPublishing(false);
  }

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const hasChanges = gitStatus?.hasChanges || (gitStatus?.unpushed ?? 0) > 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💅</span>
          <div>
            <h1 className="text-lg font-bold text-white">VicNail 後台</h1>
            <p className="text-xs text-gray-400">文章管理（本地）</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 推播按鈕 */}
          <button
            onClick={() => { setShowPublish(!showPublish); if (!showPublish) fetchGitStatus(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              hasChanges
                ? "bg-green-700 text-white hover:bg-green-600"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <span>🚀</span>
            推播上線
            {hasChanges && (
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {(gitStatus?.changedFiles.length || 0) + (gitStatus?.unpushed || 0)}
              </span>
            )}
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            登出
          </button>
        </div>
      </header>

      {/* 推播面板 */}
      {showPublish && (
        <div className="border-b border-green-900/50 bg-green-950/30 px-6 py-5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-sm font-semibold text-green-300 mb-3 flex items-center gap-2">
              🚀 推播上線
              {gitStatus && (
                <span className="text-xs text-gray-500 font-normal">
                  分支: {gitStatus.branch} | 最近: {gitStatus.lastCommit}
                </span>
              )}
            </h2>

            {gitStatus && !gitStatus.hasChanges && gitStatus.unpushed === 0 ? (
              <p className="text-sm text-gray-400">目前沒有需要推播的變更，所有內容已是最新。</p>
            ) : (
              <>
                {/* 變更清單 */}
                {gitStatus && gitStatus.changedFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-1">
                      待推播檔案（{gitStatus.changedFiles.length} 個）：
                    </p>
                    <div className="max-h-32 overflow-y-auto rounded-lg bg-gray-900/60 p-2 text-xs font-mono text-gray-400 space-y-0.5">
                      {gitStatus.changedFiles.map((f, i) => (
                        <div key={i} className="flex gap-2">
                          <span className={
                            f.status === "M" ? "text-yellow-400" :
                            f.status === "?" || f.status === "??" ? "text-green-400" :
                            f.status === "D" ? "text-red-400" : "text-gray-400"
                          }>
                            {f.status === "??" ? "新增" : f.status === "M" ? "修改" : f.status === "D" ? "刪除" : f.status}
                          </span>
                          <span>{f.file}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {gitStatus && gitStatus.unpushed > 0 && (
                  <p className="text-xs text-yellow-400 mb-3">
                    有 {gitStatus.unpushed} 個已儲存但未推播的 commit
                  </p>
                )}

                {/* Commit 訊息 + 推播 */}
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">推播說明（選填）</label>
                    <input
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      placeholder="例：更新春季美甲文章"
                      className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-500 disabled:opacity-50 transition-colors flex-shrink-0"
                  >
                    {publishing ? "推播中..." : "確認推播"}
                  </button>
                </div>
              </>
            )}

            {publishMsg && (
              <p className={`text-sm mt-3 ${publishMsg.includes("失敗") || publishMsg.includes("沒有") ? "text-red-400" : "text-green-400"}`}>
                {publishMsg}
              </p>
            )}
          </div>
        </div>
      )}

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
