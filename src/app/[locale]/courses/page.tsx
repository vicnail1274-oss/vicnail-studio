import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { InstructorProfile } from "@/components/courses/InstructorProfile";
import { ContactCTA } from "@/components/courses/ContactCTA";
import {
  CourseFilterBar,
  type CourseCard,
} from "@/components/courses/CourseFilterBar";

export const metadata: Metadata = {
  title: "美甲課程",
  description:
    "Vic Nail Academy — 全科班、創業班、單堂進修。承諾學會為止，無限複習跟課機制。",
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

  const list = (courses ?? []) as CourseCard[];

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
          <CourseFilterBar initialCourses={list} />
        </div>
      </section>

      <InstructorProfile />
      <ContactCTA />
    </>
  );
}
