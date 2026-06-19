import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Award, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CertificatePrintButton } from "@/components/courses/CertificatePrintButton";

export const metadata = {
  title: "結業證書 | Vic Nail Academy",
  robots: "noindex,nofollow",
};

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export default async function CertificatePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(
      `/zh-TW/auth/login?redirect=/zh-TW/account/courses/${slug}/certificate`
    );
  }

  // 此課程的修課資料（view 受 RLS 限制，僅回傳本人已購課）
  const { data: courseRow } = await supabase
    .from("my_enrolled_courses")
    .select(
      "course_id, slug, title, instructor_name, total_lessons, completed_lessons, progress_percentage"
    )
    .eq("slug", slug)
    .maybeSingle();

  // 未購買（或課程不存在）→ 導回課程頁
  if (!courseRow) redirect(`/zh-TW/courses/${slug}`);

  const course = courseRow as {
    course_id: string;
    slug: string;
    title: string;
    instructor_name: string | null;
    total_lessons: number;
    completed_lessons: number;
    progress_percentage: number;
  };

  // 學員姓名
  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const studentName =
    (profileData as { display_name: string | null } | null)?.display_name ||
    user.email?.split("@")[0] ||
    "學員";

  const isComplete =
    course.total_lessons > 0 && Number(course.progress_percentage) >= 100;

  // 未完成 → 鎖定狀態
  if (!isComplete) {
    const pct = Number(course.progress_percentage) || 0;
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <Lock size={28} className="text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">結業證書尚未解鎖</h1>
        <p className="text-sm text-gray-500 mb-6">
          完成「{course.title}」的所有單元即可獲得結業證書。 目前進度{" "}
          {course.completed_lessons}/{course.total_lessons} 單元（{pct}%）。
        </p>
        <div className="w-full max-w-sm mx-auto bg-gray-100 rounded-full h-2 overflow-hidden mb-6">
          <div
            className="bg-nail-gold h-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <Link
          href={`/zh-TW/courses/${slug}`}
          className="inline-block px-5 py-2.5 bg-nail-gold text-white rounded-xl font-medium hover:bg-nail-gold/90"
        >
          繼續上課
        </Link>
      </div>
    );
  }

  // 完成日期 = 最後完成單元的時間，fallback 今天
  const { data: lastDone } = await supabase
    .from("lesson_progress")
    .select("completed_at, lessons!inner(course_id)")
    .eq("user_id", user.id)
    .eq("lessons.course_id", course.course_id)
    .eq("completed", true)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const completionIso =
    (lastDone as { completed_at: string | null } | null)?.completed_at ||
    new Date().toISOString();

  const instructor = course.instructor_name || "Vic 老師";

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      {/* 列印時只保留證書卡 */}
      <style>{`@media print {
        body * { visibility: hidden; }
        .print-cert, .print-cert * { visibility: visible; }
        .print-cert { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
        .no-print { display: none !important; }
        @page { margin: 1cm; }
      }`}</style>

      <div className="max-w-3xl mx-auto">
        {/* 證書卡 */}
        <div className="print-cert relative bg-white rounded-2xl border-4 border-nail-gold/30 shadow-lg overflow-hidden">
          <div className="absolute inset-3 border border-nail-gold/20 rounded-xl pointer-events-none" />

          <div className="relative px-8 sm:px-14 py-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Image
                src="/brand/logo.png"
                alt="VicNail Studio"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="text-lg font-display font-semibold tracking-wide text-gray-800">
                VicNail Studio
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-nail-gold mb-2">
              <Award size={22} />
              <span className="text-sm tracking-[0.3em] uppercase">
                Certificate
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-8">
              結業證書
            </h1>

            <p className="text-sm text-gray-500 mb-3">茲證明</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 border-b border-nail-gold/30 inline-block px-6 pb-2">
              {studentName}
            </p>
            <p className="text-sm text-gray-500 mt-5 mb-2">
              已完成本課程全部 {course.total_lessons} 個單元
            </p>
            <p className="text-lg sm:text-xl font-semibold text-nail-gold mb-10">
              {course.title}
            </p>

            <div className="flex items-end justify-between gap-4 text-left mt-8 pt-6 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-400 mb-1">完成日期</div>
                <div className="text-sm font-medium text-gray-700">
                  {formatDate(completionIso)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-display text-gray-700 mb-1">
                  {instructor}
                </div>
                <div className="text-xs text-gray-400 border-t border-gray-300 pt-1">
                  講師簽署
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 動作列 */}
        <div className="no-print flex items-center justify-center gap-3 mt-8">
          <CertificatePrintButton />
          <Link
            href="/zh-TW/account/courses"
            className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-white transition-colors"
          >
            返回我的課程
          </Link>
        </div>
      </div>
    </div>
  );
}
