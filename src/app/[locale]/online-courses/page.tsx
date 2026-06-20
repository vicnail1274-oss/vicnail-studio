import { Link } from "@/i18n/navigation";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Lock, MessageCircle, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  CourseFilterBar,
  type CourseCard,
} from "@/components/courses/CourseFilterBar";
import { LINE_URL } from "@/lib/line";

// 依登入者 online_access 即時判斷門禁，停用快取
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "線上課程",
  description:
    "Vic Nail Academy 線上課程專區 — 專屬會員・終身複習。凝膠美甲、延甲、彩繪線上影片教學。",
};

export default async function OnlineCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let onlineAccess = false;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("online_access")
      .eq("id", user.id)
      .maybeSingle();
    onlineAccess = !!prof?.online_access;
  }

  // 未登入或未開通 → 鎖定畫面，不列出任何課程
  if (!onlineAccess) {
    return (
      <section className="relative min-h-[70vh] flex items-center py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-nail-gold/10 border border-nail-gold/20 flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-nail-gold" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            線上課程・即將開放
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            線上影片課程目前僅開放給開通的會員，敬請期待。
            <br />
            如為學員，請聯繫 Vic 為您開通觀看權限。
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <a
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] hover:bg-[#06C755]/90 text-white font-medium px-8 py-3 transition-colors"
              >
                <MessageCircle size={18} />
                聯繫 Vic 開通
              </a>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-nail-gold hover:bg-nail-gold/90 text-white font-medium px-8 py-3 transition-colors"
              >
                <LogIn size={18} />
                登入
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 已開通 → 抓已發布課程
  const { data: courses } = await supabase
    .from("courses")
    .select(
      "id, slug, title, description, price, sale_price, thumbnail_url, level, category, instructor_name, total_lessons, total_duration_seconds, featured"
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true });

  const list = (courses ?? []) as CourseCard[];

  return (
    <>
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            線上課程
          </h1>
          <p className="mt-2 text-xl text-nail-gold font-display">
            專屬會員・終身複習
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <CourseFilterBar initialCourses={list} />
        </div>
      </section>
    </>
  );
}
