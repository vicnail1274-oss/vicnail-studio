import { getArticle, getArticleSlugs } from "@/lib/mdx";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    const slugs = getArticleSlugs("ai", locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle("ai", locale, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function AiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = getArticle("ai", locale, slug);

  if (!article) notFound();

  const backLabel = locale === "zh-TW" ? "返回 AI 實驗室" : "Back to AI Lab";

  return (
    <ArticleContent
      article={article}
      backPath="/ai"
      backLabel={backLabel}
      dark
    />
  );
}
