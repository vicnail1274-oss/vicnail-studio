import { getArticle, getArticles, getArticleSlugs } from "@/lib/mdx";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ArticleJsonLd } from "@/components/seo/JsonLd";
import { getRelatedArticles } from "@/lib/related";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://vicnail-studio.com";

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
  const article = await getArticle("ai", locale, slug);
  if (!article) return {};
  const url = `${BASE_URL}/${locale}/ai/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      tags: article.tags,
    },
  };
}

export default async function AiArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await getArticle("ai", locale, slug);

  if (!article) notFound();

  const allArticles = getArticles("ai", locale);
  const related = getRelatedArticles(article, allArticles);
  const backLabel = locale === "zh-TW" ? "返回 AI 實驗室" : "Back to AI Lab";
  const url = `${BASE_URL}/${locale}/ai/${slug}`;

  return (
    <>
      <ArticleJsonLd article={article} url={url} />
      <ArticleContent
        article={article}
        backPath="/ai"
        backLabel={backLabel}
        dark
        relatedArticles={
          <RelatedArticles
            articles={related}
            basePath="/ai"
            dark
            locale={locale}
          />
        }
      />
    </>
  );
}
