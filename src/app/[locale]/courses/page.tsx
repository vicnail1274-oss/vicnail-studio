import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { CourseList } from "@/components/courses/CourseList";
import { InstructorProfile } from "@/components/courses/InstructorProfile";
import { ContactCTA } from "@/components/courses/ContactCTA";

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

  // Courses page is zh-TW only
  if (locale !== "zh-TW") {
    redirect("/");
  }

  return (
    <>
      {/* Hero Banner */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            Vic Nail Academy
          </h1>
          <p className="mt-2 text-xl text-nail-gold font-display">
            不只是學技術，更是打造職涯競爭力
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            全科班、創業班、單堂進修。我們承諾「學會為止」，提供業界最完善的無限複習機制，讓您的每一步都紮實穩健。
          </p>
        </div>
      </section>

      <CourseList />
      <InstructorProfile />
      <ContactCTA />
    </>
  );
}
