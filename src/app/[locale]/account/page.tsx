import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  GraduationCap,
  Package,
  Heart,
  Pencil,
  Film,
  CheckCircle2,
  Clock,
  Award,
  Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "我的學習 | Vic Nail Academy",
};

interface EnrolledCourse {
  course_id: string;
  slug: string;
  title: string;
  thumbnail_url: string | null;
  total_lessons: number;
  total_duration_seconds: number;
  completed_lessons: number;
  progress_percentage: number;
  last_accessed_at: string | null;
}

function formatHours(seconds: number) {
  if (!seconds || seconds < 60) return "0";
  const h = seconds / 3600;
  if (h >= 10) return String(Math.round(h));
  return h.toFixed(1).replace(/\.0$/, "");
}

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/zh-TW/auth/login?redirect=/zh-TW/account");

  const [{ data: profileData }, { data: coursesData }, { data: progressData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("my_enrolled_courses")
        .select(
          "course_id, slug, title, thumbnail_url, total_lessons, total_duration_seconds, completed_lessons, progress_percentage, last_accessed_at"
        )
        .order("last_accessed_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("lesson_progress")
        .select("total_watch_seconds")
        .eq("user_id", user.id),
    ]);

  const profile = profileData as {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  const courses = (coursesData ?? []) as EnrolledCourse[];

  const courseCount = courses.length;
  const completedLessons = courses.reduce(
    (s, c) => s + (c.completed_lessons || 0),
    0
  );
  const learningSeconds = (
    (progressData ?? []) as { total_watch_seconds: number | null }[]
  ).reduce((s, p) => s + (p.total_watch_seconds || 0), 0);
  const certCount = courses.filter(
    (c) => c.total_lessons > 0 && Number(c.progress_percentage) >= 100
  ).length;

  // 繼續學習：最近觀看且未完成優先；否則第一個未完成
  const inProgress = courses.filter(
    (c) => c.total_lessons > 0 && Number(c.progress_percentage) < 100
  );
  const continueCourse =
    inProgress.find((c) => c.last_accessed_at) ?? inProgress[0] ?? null;

  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "學員";

  const stats = [
    { icon: GraduationCap, label: "我的課程", value: courseCount },
    { icon: CheckCircle2, label: "完成單元", value: completedLessons },
    { icon: Clock, label: "學習時數", value: formatHours(learningSeconds) },
    { icon: Award, label: "結業證書", value: certCount },
  ];

  const quickLinks = [
    { href: "/zh-TW/account/courses", icon: Film, label: "我的課程" },
    { href: "/zh-TW/account/orders", icon: Package, label: "我的訂單" },
    { href: "/zh-TW/account/wishlist", icon: Heart, label: "願望清單" },
    { href: "/zh-TW/account/profile", icon: Pencil, label: "編輯資料" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 歡迎列 */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-nail-pink/30 flex items-center justify-center text-xl font-bold text-nail-gold flex-shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          ) : (
            displayName[0]?.toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">
            歡迎回來，{displayName}
          </h1>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
        </div>
      </div>

      {/* 統計卡 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2"
            >
              <Icon size={20} className="text-nail-gold" />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* 繼續學習 / 空狀態 / 全部完成 */}
      {continueCourse ? (
        <Link
          href={`/zh-TW/courses/${continueCourse.slug}`}
          className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-nail-gold hover:shadow-md transition-all mb-8"
        >
          <div className="flex">
            <div className="w-32 sm:w-40 h-28 bg-nail-cream/40 relative flex-shrink-0">
              {continueCourse.thumbnail_url ? (
                <Image
                  src={continueCourse.thumbnail_url}
                  alt={continueCourse.title}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-nail-pink/30">
                  <GraduationCap size={32} />
                </div>
              )}
            </div>
            <div className="flex-1 p-4 min-w-0">
              <div className="text-xs text-nail-gold font-medium mb-1">
                繼續學習
              </div>
              <h3 className="font-semibold truncate group-hover:text-nail-gold transition-colors">
                {continueCourse.title}
              </h3>
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    {continueCourse.completed_lessons}/
                    {continueCourse.total_lessons} 已完成
                  </span>
                  <span className="font-medium text-nail-gold">
                    {Number(continueCourse.progress_percentage).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-nail-gold to-nail-gold-light h-full transition-all"
                    style={{ width: `${continueCourse.progress_percentage}%` }}
                  />
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-nail-gold font-medium mt-3 group-hover:gap-2 transition-all">
                <Play size={12} /> 繼續觀看
              </span>
            </div>
          </div>
        </Link>
      ) : courseCount === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-8">
          <GraduationCap size={48} className="mx-auto text-nail-pink/40 mb-3" />
          <p className="text-sm text-gray-500 mb-4">
            還沒有購買任何課程，探索 Vic Nail Academy 的線上美甲教學
          </p>
          <Link
            href="/zh-TW/courses"
            className="inline-block px-6 py-3 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90"
          >
            前往課程列表
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center mb-8">
          <Award size={40} className="mx-auto text-nail-gold mb-2" />
          <p className="text-sm text-gray-600">太棒了！你已完成所有課程 🎉</p>
          <Link
            href="/zh-TW/courses"
            className="inline-block mt-3 text-sm text-nail-gold hover:underline"
          >
            探索更多課程
          </Link>
        </div>
      )}

      {/* 快捷功能 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickLinks.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-4 hover:border-nail-gold hover:shadow-sm transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-nail-pink/20 flex items-center justify-center text-nail-gold flex-shrink-0">
                <Icon size={18} />
              </div>
              <span className="font-medium text-gray-800">{l.label}</span>
              <span className="ml-auto text-gray-300">→</span>
            </Link>
          );
        })}
      </div>

      {/* 登出 */}
      <div className="mt-6 text-center">
        <LogoutButton />
      </div>
    </div>
  );
}

function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className="text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
      >
        登出
      </button>
    </form>
  );
}
