import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  PlayCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { MarkCompleteButton } from "@/components/video/VideoPlayer";
import { LessonMediaPanel } from "@/components/video/LessonMediaPanel";

// 觀看頁依使用者購買/進度與即時章節渲染，停用 fetch 快取避免過期內容
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; slug: string; lessonId: string }>;
}

export const metadata = {
  title: "觀看課程 | Vic Nail Academy",
  robots: "noindex,nofollow",
};

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default async function LessonWatchPage({ params }: PageProps) {
  const { locale, slug, lessonId } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();

  // 取得 course
  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!course) notFound();

  // 取得 lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, course_id, title, description, duration_seconds, sort_order, is_preview, upload_status"
    )
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .maybeSingle();
  if (!lesson) notFound();

  if (lesson.upload_status !== "ready") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">影片尚未準備好</h2>
        <p className="text-muted-foreground">
          老師正在準備這堂課的影片，請稍後再來。
        </p>
        <Link
          href={`/zh-TW/courses/${slug}`}
          className="inline-block mt-6 text-nail-gold hover:underline"
        >
          ← 返回課程
        </Link>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 權限檢查：算出是否已購買；非試看課未購買就導走（未登入導登入）
  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled =
      !!enrollment &&
      (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());
  }
  if (!lesson.is_preview && !isEnrolled) {
    redirect(
      user
        ? `/zh-TW/courses/${slug}`
        : `/zh-TW/auth/login?redirect=/zh-TW/courses/${slug}/lessons/${lessonId}`
    );
  }

  // 取得章節列表（用於 sidebar 跟前後章）
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, title, sort_order, is_preview, upload_status, duration_seconds, section_id"
    )
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  // 章節分組
  const { data: sectionsData } = await supabase
    .from("course_sections")
    .select("id, title, sort_order")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });
  const sections = (sectionsData ?? []) as {
    id: string;
    title: string;
    sort_order: number;
  }[];

  const lessonList = lessons ?? [];
  const currentIdx = lessonList.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? lessonList[currentIdx - 1] : null;
  const nextLesson =
    currentIdx >= 0 && currentIdx < lessonList.length - 1
      ? lessonList[currentIdx + 1]
      : null;

  // 取得已存進度
  let initialPosition = 0;
  let progressMap: Record<string, { completed: boolean; pos: number }> = {};

  if (user) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed, position_seconds")
      .eq("user_id", user.id)
      .in(
        "lesson_id",
        lessonList.map((l) => l.id)
      );
    progressMap = Object.fromEntries(
      (progress ?? []).map((p) => [
        p.lesson_id,
        { completed: !!p.completed, pos: p.position_seconds ?? 0 },
      ])
    );
    initialPosition = progressMap[lessonId]?.pos ?? 0;
  }

  // 課程整體進度（完成單元數 / 總單元數）
  const totalLessons = lessonList.length;
  const completedCount = lessonList.filter(
    (l) => progressMap[l.id]?.completed
  ).length;
  const coursePct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // 傳給播放器的下一堂（僅當影片已就緒才自動播放）
  const nextLessonInfo =
    nextLesson && nextLesson.upload_status === "ready"
      ? {
          id: nextLesson.id,
          title: nextLesson.title,
          href: `/zh-TW/courses/${slug}/lessons/${nextLesson.id}`,
        }
      : null;

  // 依章節分組（無分組則維持單一清單）；用 flat lessonList 位置算全域序號
  const globalIndex = new Map(lessonList.map((l, i) => [l.id, i]));
  const grouped: {
    section: { id: string; title: string } | null;
    items: typeof lessonList;
  }[] = [];
  if (sections.length > 0) {
    for (const s of sections) {
      const items = lessonList.filter((l) => l.section_id === s.id);
      if (items.length) grouped.push({ section: { id: s.id, title: s.title }, items });
    }
    const ungrouped = lessonList.filter(
      (l) => !l.section_id || !sections.some((s) => s.id === l.section_id)
    );
    if (ungrouped.length) grouped.push({ section: null, items: ungrouped });
  } else {
    grouped.push({ section: null, items: lessonList });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main: 播放器 */}
        <div className="lg:col-span-3 space-y-4">
          <Link
            href={`/zh-TW/courses/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-nail-gold"
          >
            <ArrowLeft size={14} />
            {course.title}
          </Link>

          <LessonMediaPanel
            lessonId={lesson.id}
            courseId={course.id}
            initialPosition={initialPosition}
            nextLesson={nextLessonInfo}
            showNotes={isEnrolled}
          />

          <div className="bg-white border rounded-xl p-5">
            <h1 className="text-xl font-bold mb-2">
              第 {currentIdx + 1} 堂 · {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {lesson.description}
              </p>
            )}

            {/* 標記完成 */}
            {user && (
              <div className="mt-4">
                <MarkCompleteButton
                  lessonId={lesson.id}
                  initialCompleted={progressMap[lessonId]?.completed ?? false}
                  positionSeconds={progressMap[lessonId]?.pos ?? 0}
                />
              </div>
            )}

            {/* 上下章 */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              {prevLesson ? (
                <Link
                  href={`/zh-TW/courses/${slug}/lessons/${prevLesson.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-nail-gold max-w-[40%]"
                >
                  <ChevronLeft size={16} />
                  <div className="truncate">
                    <div className="text-xs">上一堂</div>
                    <div className="font-medium truncate">
                      {prevLesson.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <span />
              )}

              {nextLesson ? (
                <Link
                  href={`/zh-TW/courses/${slug}/lessons/${nextLesson.id}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-nail-gold max-w-[40%] text-right"
                >
                  <div className="truncate">
                    <div className="text-xs">下一堂</div>
                    <div className="font-medium truncate">
                      {nextLesson.title}
                    </div>
                  </div>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: 章節清單 */}
        <aside className="lg:col-span-1">
          <div className="bg-white border rounded-xl overflow-hidden sticky top-4">
            <div className="p-4 border-b">
              <h3 className="font-semibold">課程章節</h3>
              <p className="text-xs text-muted-foreground">
                共 {lessonList.length} 堂
              </p>

              {/* 課程整體進度 */}
              {user && totalLessons > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>學習進度</span>
                    <span className="font-medium text-nail-gold">
                      {completedCount}/{totalLessons} 單元 · {coursePct}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full bg-nail-pink rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label="課程整體進度"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={coursePct}
                  >
                    <div
                      className="h-full bg-nail-gold rounded-full transition-all"
                      style={{ width: `${coursePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {grouped.map((group, gi) => (
                <div key={group.section?.id ?? `ungrouped-${gi}`}>
                  {group.section && (
                    <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-100 sticky top-0 z-10">
                      {group.section.title}
                    </div>
                  )}
                  <div className="divide-y divide-gray-50">
                    {group.items.map((l) => {
                      const idx = globalIndex.get(l.id) ?? 0;
                      const isCurrent = l.id === lessonId;
                      const isWatchable =
                  l.upload_status === "ready" &&
                  (l.is_preview || lesson.is_preview === false);
                const progress = progressMap[l.id];
                return (
                  <Link
                    key={l.id}
                    href={
                      isWatchable
                        ? `/zh-TW/courses/${slug}/lessons/${l.id}`
                        : "#"
                    }
                    className={`flex items-start gap-2 p-3 text-sm transition-colors ${
                      isCurrent
                        ? "bg-nail-gold/10 border-l-2 border-nail-gold"
                        : isWatchable
                          ? "hover:bg-gray-50"
                          : "opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {progress?.completed ? (
                      <CheckCircle2
                        size={16}
                        className="text-green-500 mt-0.5 flex-shrink-0"
                      />
                    ) : !isWatchable ? (
                      <Lock
                        size={16}
                        className="text-gray-400 mt-0.5 flex-shrink-0"
                      />
                    ) : (
                      <PlayCircle
                        size={16}
                        className={
                          isCurrent
                            ? "text-nail-gold mt-0.5 flex-shrink-0"
                            : "text-gray-400 mt-0.5 flex-shrink-0"
                        }
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${
                          isCurrent ? "text-nail-gold" : ""
                        }`}
                      >
                        #{idx + 1} {l.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(l.duration_seconds)}
                        {l.is_preview && " · 試看"}
                      </div>
                    </div>
                  </Link>
                );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
