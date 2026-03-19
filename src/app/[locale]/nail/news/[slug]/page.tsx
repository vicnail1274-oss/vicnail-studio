import { getArticle, getArticles, getArticleSlugs } from "@/lib/mdx";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { getRelatedArticles } from "@/lib/related";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of routing.locales) {
    const slugs = getArticleSlugs("nail-news", locale);
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
  const article = await getArticle("nail-news", locale, slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle("nail-news", locale, slug);

  if (!article) notFound();

  const allArticles = getArticles("nail-news", locale);
  const related = getRelatedArticles(article, allArticles);
  const backLabel = locale === "zh-TW" ? "返回美甲新聞" : "Back to Nail News";

  return (
    <ArticleContent
      article={article}
      backPath="/nail/news"
      backLabel={backLabel}
      relatedArticles={
        <RelatedArticles
          articles={related}
          basePath="/nail/news"
          locale={locale}
        />
      }
    />
  );
}
