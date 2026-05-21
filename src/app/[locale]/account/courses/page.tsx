import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Film, Clock, Play } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "我的課程 | Vic Nail Academy",
};

interface EnrolledCourse {
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  total_lessons: number;
  total_duration_seconds: number;
  level: string | null;
  instructor_name: string | null;
  purchased_at: string;
  expires_at: string | null;
  last_accessed_at: string | null;
  completed_lessons: number;
  progress_percentage: number;
}

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}小時${m}分` : `${m}分`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("zh-TW");
}

export default async function MyCoursesPage({
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

  if (!user) {
    redirect("/zh-TW/auth/login?redirect=/zh-TW/account/courses");
  }

  const { data: courses } = await supabase
    .from("my_enrolled_courses")
    .select("*")
    .order("last_accessed_at", { ascending: false, nullsFirst: false })
    .order("purchased_at", { ascending: false });

  const list = (courses ?? []) as EnrolledCourse[];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">我的課程</h1>
          <p className="text-sm text-gray-500 mt-1">
            已購買 {list.length} 堂課程
          </p>
        </div>
        <Link
          href="/zh-TW/courses"
          className="text-sm text-nail-gold hover:underline"
        >
          + 探索更多課程
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border p-12 text-center">
          <GraduationCap
            size={64}
            className="mx-auto text-nail-pink/40 mb-4"
          />
          <h2 className="text-lg font-semibold mb-2">還沒有購買任何課程</h2>
          <p className="text-sm text-muted-foreground mb-6">
            探索 Vic Nail Academy 的線上美甲教學影片
          </p>
          <Link
            href="/zh-TW/courses"
            className="inline-block px-6 py-3 bg-nail-gold text-white rounded-xl font-semibold hover:bg-nail-gold/90"
          >
            前往課程列表
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((c) => (
            <Link
              key={c.course_id}
              href={`/zh-TW/courses/${c.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-nail-gold hover:shadow-md transition-all"
            >
              <div className="flex">
                <div className="w-32 h-32 bg-nail-cream/40 relative flex-shrink-0">
                  {c.thumbnail_url ? (
                    <Image
                      src={c.thumbnail_url}
                      alt={c.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-nail-pink/30">
                      <GraduationCap size={36} />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 min-w-0">
                  <h3 className="font-semibold truncate group-hover:text-nail-gold transition-colors">
                    {c.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Film size={12} />
                      {c.total_lessons} 堂
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(c.total_duration_seconds)}
                    </span>
                  </div>

                  {/* 進度條 */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">
                        {c.completed_lessons}/{c.total_lessons} 已完成
                      </span>
                      <span className="font-medium text-nail-gold">
                        {c.progress_percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-nail-gold to-nail-gold-light h-full transition-all"
                        style={{ width: `${c.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>購買於 {formatDate(c.purchased_at)}</span>
                    <span className="flex items-center gap-1 text-nail-gold font-medium group-hover:gap-2 transition-all">
                      <Play size={12} />
                      {c.last_accessed_at ? "繼續觀看" : "開始觀看"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
