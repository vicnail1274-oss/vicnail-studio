import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  CheckCircle2,
  Clock,
  Film,
  GraduationCap,
  Lock,
  PlayCircle,
  User,
  Star,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CourseJsonLd } from "@/components/seo/JsonLd";
import { CourseReviews } from "@/components/courses/CourseReviews";
import type { Course } from "@/lib/supabase/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return {
    title: course?.title ? `${course.title} | Vic Nail Academy` : "課程",
    description: course?.description || undefined,
  };
}

function formatDuration(seconds: number) {
  if (!seconds) return "0 分鐘";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} 小時 ${m} 分鐘`;
  return `${m} 分鐘`;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級 / 適合零基礎",
  intermediate: "中級 / 需基本概念",
  advanced: "進階 / 有經驗者",
  all: "通用 / 所有人皆可",
};

export default async function CourseDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, long_description, price, sale_price, thumbnail_url, cover_video_url, level, category, instructor_name, instructor_bio, what_youll_learn, prerequisites, target_audience, total_lessons, total_duration_seconds, published_at"
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, title, description, duration_seconds, sort_order, is_preview, upload_status"
    )
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });

  // 評分摘要（無資料則不顯示）
  const { data: ratingSummary } = (await supabase
    .from("course_rating_summary")
    .select("avg_rating, review_count")
    .eq("course_id", course.id)
    .maybeSingle()) as {
    data: { avg_rating: number | null; review_count: number } | null;
  };
  const avgRating =
    ratingSummary?.avg_rating != null ? Number(ratingSummary.avg_rating) : null;
  const reviewCount = ratingSummary?.review_count ?? 0;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let hasAccess = false;
  let progressMap: Record<string, { completed: boolean; pos: number }> = {};

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id, expires_at")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    hasAccess =
      !!enrollment &&
      (!enrollment.expires_at || new Date(enrollment.expires_at) > new Date());

    if (hasAccess && lessons?.length) {
      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed, position_seconds")
        .eq("user_id", user.id)
        .in(
          "lesson_id",
          lessons.map((l) => l.id)
        );
      progressMap = Object.fromEntries(
        (progress ?? []).map((p) => [
          p.lesson_id,
          { completed: !!p.completed, pos: p.position_seconds ?? 0 },
        ])
      );
    }
  }

  const lessonList = lessons ?? [];
  const completedCount = lessonList.filter(
    (l) => progressMap[l.id]?.completed
  ).length;
  const isCourseComplete =
    hasAccess && lessonList.length > 0 && completedCount === lessonList.length;
  const whatYouLearn: string[] = Array.isArray(course.what_youll_learn)
    ? (course.what_youll_learn as string[])
    : [];
  const prerequisites: string[] = Array.isArray(course.prerequisites)
    ? (course.prerequisites as string[])
    : [];
  const targetAudience: string[] = Array.isArray(course.target_audience)
    ? (course.target_audience as string[])
    : [];

  const displayPrice = course.sale_price ?? course.price;

  return (
    <div className="bg-white">
      <CourseJsonLd course={course as Course} />
      {/* Hero */}
      <section className="bg-gradient-to-b from-nail-cream to-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/zh-TW/courses"
              className="text-sm text-nail-gold hover:underline"
            >
              ← 返回課程列表
            </Link>

            {course.level && (
              <span className="inline-block px-3 py-1 bg-nail-pink/10 text-nail-pink rounded-full text-xs">
                {LEVEL_LABELS[course.level] || course.level}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {course.title}
            </h1>

            {course.description && (
              <p className="text-lg text-muted-foreground">
                {course.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Film size={16} />
                {course.total_lessons} 堂課
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                共 {formatDuration(course.total_duration_seconds)}
              </span>
              <span className="flex items-center gap-1">
                <User size={16} />
                {course.instructor_name || "Vic 老師"}
              </span>
              {avgRating !== null && reviewCount > 0 && (
                <span
                  className="flex items-center gap-1"
                  aria-label={`平均評分 ${avgRating} 分，共 ${reviewCount} 則評價`}
                >
                  <span className="flex items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={16}
                        className={
                          n <= Math.round(avgRating)
                            ? "text-nail-gold"
                            : "text-gray-300"
                        }
                        fill={n <= Math.round(avgRating) ? "currentColor" : "none"}
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    ))}
                  </span>
                  <span className="font-medium text-foreground">{avgRating}</span>
                  <span>({reviewCount})</span>
                </span>
              )}
            </div>
          </div>

          {/* Right column: Buy box */}
          <div>
            <div className="bg-white rounded-2xl border border-nail-pink/30 shadow-sm overflow-hidden sticky top-4">
              <div className="aspect-video bg-nail-cream/40 relative">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-nail-pink/30">
                    <GraduationCap size={64} />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-4">
                <div>
                  {course.sale_price ? (
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        NT${course.sale_price.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        原價 NT${course.price.toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-foreground">
                      NT${course.price.toLocaleString()}
                    </div>
                  )}
                </div>

                {hasAccess ? (
                  <div className="space-y-2">
                    <Link
                      href={`/zh-TW/account/courses`}
                      className="w-full block py-3 bg-green-500 text-white rounded-xl text-center font-semibold hover:bg-green-600 transition-colors"
                    >
                      <CheckCircle2 className="inline mr-1" size={18} />
                      已購買 · 前往觀看
                    </Link>
                    {isCourseComplete && (
                      <Link
                        href={`/zh-TW/account/courses/${course.slug}/certificate`}
                        className="w-full block py-3 bg-nail-gold/10 text-nail-gold border border-nail-gold/30 rounded-xl text-center font-semibold hover:bg-nail-gold/20 transition-colors"
                      >
                        <Award className="inline mr-1" size={18} />
                        領取結業證書
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link
                    href={
                      user
                        ? `/zh-TW/courses/${course.slug}/buy`
                        : `/zh-TW/auth/login?redirect=/zh-TW/courses/${course.slug}/buy`
                    }
                    className="w-full block py-3 bg-nail-gold text-white rounded-xl text-center font-semibold hover:bg-nail-gold/90 transition-colors"
                  >
                    立即購買 NT${displayPrice.toLocaleString()}
                  </Link>
                )}

                <p className="text-xs text-muted-foreground text-center">
                  ✓ 終身觀看 ✓ 無限複習 ✓ 動態浮水印保護
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 py-12">
        <div className="lg:col-span-2 space-y-10">
          {whatYouLearn.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">您將學會</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {whatYouLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2
                      size={18}
                      className="text-nail-gold flex-shrink-0 mt-0.5"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {course.long_description && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">課程簡介</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {course.long_description}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-display font-bold mb-4">課程章節</h2>
            <div className="space-y-2">
              {lessonList.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  章節準備中⋯⋯
                </p>
              ) : (
                lessonList.map((lesson, idx) => {
                  const canWatch =
                    (hasAccess && lesson.upload_status === "ready") ||
                    (lesson.is_preview && lesson.upload_status === "ready");
                  const progress = progressMap[lesson.id];

                  return (
                    <div
                      key={lesson.id}
                      className={`bg-white rounded-xl border ${
                        canWatch
                          ? "border-nail-pink/30 hover:border-nail-gold"
                          : "border-gray-100"
                      } transition-colors`}
                    >
                      {canWatch ? (
                        <Link
                          href={`/zh-TW/courses/${course.slug}/lessons/${lesson.id}`}
                          className="flex items-center gap-3 p-4"
                        >
                          <span className="text-sm text-muted-foreground w-8">
                            #{idx + 1}
                          </span>
                          <PlayCircle
                            size={20}
                            className={
                              progress?.completed
                                ? "text-green-500"
                                : "text-nail-gold"
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium flex items-center gap-2">
                              {lesson.title}
                              {lesson.is_preview && !hasAccess && (
                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                  免費試看
                                </span>
                              )}
                              {progress?.completed && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  已完成
                                </span>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {lesson.description}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 p-4 opacity-60">
                          <span className="text-sm text-muted-foreground w-8">
                            #{idx + 1}
                          </span>
                          <Lock size={18} className="text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{lesson.title}</div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(lesson.duration_seconds)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <CourseReviews
            courseId={course.id}
            locale={locale}
            canReview={hasAccess}
          />
        </div>

        {/* Right column: 詳細資訊 */}
        <aside className="space-y-6">
          {targetAudience.length > 0 && (
            <div className="bg-nail-cream/40 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star size={16} className="text-nail-gold" />
                適合對象
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {targetAudience.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
          )}

          {prerequisites.length > 0 && (
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-semibold mb-3">先備條件</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {prerequisites.map((item, i) => (
                  <li key={i}>· {item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User size={16} />
              講師
            </h3>
            <p className="text-sm font-medium">
              {course.instructor_name || "Vic 老師"}
            </p>
            {course.instructor_bio && (
              <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">
                {course.instructor_bio}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
