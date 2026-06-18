import { redirect } from "next/navigation";

// AI 探索 section 已關閉，文章頁一律導向首頁
export default async function AiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
