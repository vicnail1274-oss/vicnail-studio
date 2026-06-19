import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CourseList } from "@/components/courses/CourseList";
import { InstructorProfile } from "@/components/courses/InstructorProfile";
import { ContactCTA } from "@/components/courses/ContactCTA";

export const metadata: Metadata = {
  title: "美甲課程",
  description:
    "Vic Nail Academy — 實體手把手・小班教學：凝膠美甲、延甲、彩繪、檢定、開店創業班型。歡迎諮詢報名。",
};

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "zh-TW") redirect("/");

  return (
    <>
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            美甲課程
          </h1>
          <p className="mt-2 text-xl text-nail-gold font-display">
            不只是學技術，更是打造職涯競爭力
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            實體手把手・小班教學：凝膠美甲・延甲・彩繪・檢定・開店創業
          </p>
        </div>
      </section>

      <CourseList />
      <InstructorProfile />
      <ContactCTA />
    </>
  );
}
