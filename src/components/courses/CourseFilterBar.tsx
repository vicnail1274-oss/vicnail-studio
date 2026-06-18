"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Film, ArrowRight, GraduationCap, Search, X, Loader2 } from "lucide-react";

export interface CourseCard {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  thumbnail_url: string | null;
  level: string | null;
  category: string | null;
  instructor_name: string | null;
  total_lessons: number;
  total_duration_seconds: number;
  featured: boolean;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "進階",
  all: "通用",
};

const LEVEL_OPTIONS = [
  { value: "", label: "所有難度" },
  { value: "beginner", label: "初級" },
  { value: "intermediate", label: "中級" },
  { value: "advanced", label: "進階" },
  { value: "all", label: "通用" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "最新上架" },
  { value: "popular", label: "熱門推薦" },
  { value: "price-asc", label: "價格：低到高" },
  { value: "price-desc", label: "價格：高到低" },
];

const CATEGORY_LABELS: Record<string, string> = {
  gel: "凝膠",
  extension: "延甲",
  art: "彩繪",
  business: "創業",
  foundation: "基礎",
};

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} 小時` : `${m} 分鐘`;
}

const SELECT_CLASS =
  "appearance-none rounded-full border border-nail-pink/30 bg-white px-4 py-2.5 pr-9 text-sm text-foreground focus:outline-none focus:border-nail-gold focus:ring-2 focus:ring-nail-gold/20 transition-all bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat";

const CHEVRON_BG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B76E79' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

function CourseGridCard({ course }: { course: CourseCard }) {
  return (
    <Link
      href={`/zh-TW/courses/${course.slug}`}
      className={`group bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all relative ${
        course.featured
          ? "border-nail-gold ring-2 ring-nail-gold/20"
          : "border-nail-pink/30"
      }`}
    >
      {course.featured && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-nail-gold text-white text-xs font-semibold rounded-full z-10">
          推薦
        </div>
      )}

      <div className="aspect-[16/10] bg-nail-cream/50 relative overflow-hidden">
        {course.thumbnail_url ? (
          <Image
            src={course.thumbnail_url}
            alt={course.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-nail-pink/30">
            <GraduationCap size={64} />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {course.level && (
            <span className="px-2 py-0.5 bg-nail-pink/10 text-nail-pink rounded-full">
              {LEVEL_LABELS[course.level] || course.level}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Film size={12} />
            {course.total_lessons} 堂
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDuration(course.total_duration_seconds)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-nail-gold transition-colors">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description}
          </p>
        )}

        <div className="flex items-end justify-between">
          <div>
            {course.sale_price ? (
              <>
                <div className="text-2xl font-bold text-foreground">
                  NT${course.sale_price.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground line-through">
                  NT${course.price.toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-foreground">
                NT${course.price.toLocaleString()}
              </div>
            )}
          </div>
          <span className="text-sm text-nail-gold flex items-center gap-1 group-hover:gap-2 transition-all">
            立即查看 <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function CourseFilterBar({ initialCourses }: { initialCourses: CourseCard[] }) {
  const [courses, setCourses] = useState<CourseCard[]>(initialCourses);
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  // 第一次掛載時不重新抓（沿用 SSR 結果）
  const isFirstRun = useRef(true);

  // 分類選項：由 SSR 初始資料中實際出現的分類動態產生
  const categoryOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const c of initialCourses) {
      if (c.category) seen.add(c.category);
    }
    return [
      { value: "", label: "全部分類" },
      ...Array.from(seen).map((value) => ({
        value,
        label: CATEGORY_LABELS[value] || value,
      })),
    ];
  }, [initialCourses]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (level) params.set("level", level);
      if (sort) params.set("sort", sort);
      const q = search.trim();
      if (q) params.set("q", q);

      setLoading(true);
      try {
        const res = await fetch(`/api/courses?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as CourseCard[];
        setCourses(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          // 失敗時保留現有清單，不清空
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [category, level, sort, search]);

  const hasActiveFilter = !!(category || level || search.trim()) || sort !== "newest";

  return (
    <div>
      {/* 篩選工具列 */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* 搜尋框 */}
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋課程名稱、內容…"
            aria-label="搜尋課程"
            className="w-full pl-10 pr-10 py-2.5 rounded-full border border-nail-pink/30 bg-white text-sm focus:outline-none focus:border-nail-gold focus:ring-2 focus:ring-nail-gold/20 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="清除搜尋"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* 下拉篩選 */}
        <div className="flex flex-wrap gap-3">
          {categoryOptions.length > 1 && (
            <div>
              <label htmlFor="course-category" className="sr-only">
                課程分類
              </label>
              <select
                id="course-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={SELECT_CLASS}
                style={{ backgroundImage: CHEVRON_BG }}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="course-level" className="sr-only">
              課程難度
            </label>
            <select
              id="course-level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={SELECT_CLASS}
              style={{ backgroundImage: CHEVRON_BG }}
            >
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course-sort" className="sr-only">
              排序方式
            </label>
            <select
              id="course-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={SELECT_CLASS}
              style={{ backgroundImage: CHEVRON_BG }}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 課程列表 */}
      <div aria-busy={loading} className="relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-start justify-center pt-10 bg-white/60 backdrop-blur-[1px]">
            <Loader2 className="animate-spin text-nail-gold" size={28} aria-label="載入中" />
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <GraduationCap size={48} className="mx-auto mb-4 text-nail-pink" />
            {hasActiveFilter ? (
              <>
                <p>找不到符合條件的課程</p>
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    setLevel("");
                    setSort("newest");
                    setSearch("");
                  }}
                  className="mt-4 text-sm text-nail-gold hover:underline"
                >
                  清除所有篩選
                </button>
              </>
            ) : (
              <p>課程準備中，敬請期待</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseGridCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
