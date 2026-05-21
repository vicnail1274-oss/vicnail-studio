import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseCheckoutForm } from "@/components/courses/CourseCheckoutForm";

export const metadata = {
  title: "購買課程 | Vic Nail Academy",
};

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CourseBuyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (locale !== "zh-TW") redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/zh-TW/auth/login?redirect=/zh-TW/courses/${slug}/buy`);
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, description, price, sale_price, thumbnail_url, total_lessons, total_duration_seconds")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!course) notFound();

  // 檢查是否已購買
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (existing) {
    redirect(`/zh-TW/account/courses`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-foreground mb-2">確認訂單</h1>
      <p className="text-sm text-muted-foreground mb-6">
        付款完成後立即開通課程，永久觀看不限次數。
      </p>

      <CourseCheckoutForm
        course={{
          id: course.id,
          slug: course.slug ?? slug,
          title: course.title,
          description: course.description,
          price: course.price,
          sale_price: course.sale_price,
          thumbnail_url: course.thumbnail_url,
          total_lessons: course.total_lessons,
          total_duration_seconds: course.total_duration_seconds,
        }}
        user={{
          email: user.email ?? "",
          name: profile?.display_name ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </div>
  );
}
