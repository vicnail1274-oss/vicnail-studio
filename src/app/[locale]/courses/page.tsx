import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Clock, Film, ArrowRight, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { InstructorProfile } from "@/components/courses/InstructorProfile";
import { ContactCTA } from "@/components/courses/ContactCTA";

export const metadata: Metadata = {
  title: "美甲課程",
  description:
    "Vic Nail Academy — 全科班、創業班、單堂進修。承諾學會為止，無限複習跟課機制。",
};

interface CourseRow {
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

function formatDuration(seconds: number) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h} 小時` : `${m} 分鐘`;
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: "初級",
  intermediate: "中級",
  advanced: "進階",
  all: "通用",
};

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, price, sale_price, thumbnail_url, level, category, instructor_name, total_lessons, total_duration_seconds, featured"
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const list = (courses ?? []) as CourseRow[];

  return (
    <>
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Vic Nail Academy
          </h1>
          <p className="mt-2 text-xl text-nail-gold font-display">
            不只是學技術，更是打造職涯競爭力
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            線上影片課程 · 終身複習 · 凝膠美甲 / 延甲 / 彩繪 / 創業全方位教學
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {list.length === 0 ? (
            <div className="text-center text-muted-foreground py-20">
              <GraduationCap size={48} className="mx-auto mb-4 text-nail-pink" />
              <p>課程準備中，敬請期待</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {list.map((course) => (
                <Link
                  key={course.id}
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
              ))}
            </div>
          )}
        </div>
      </section>

      <InstructorProfile />
      <ContactCTA />
    </>
  );
}
