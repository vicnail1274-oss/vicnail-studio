import { getArticle, getArticles, getArticleSlugs } from "@/lib/mdx";
import { ArticleContent } from "@/components/blog/ArticleContent";
import { RelatedArticles } from "@/components/blog/RelatedArticles";
import { ArticleJsonLd, BreadcrumbListJsonLd } from "@/components/seo/JsonLd";
import { getRelatedArticles } from "@/lib/related";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://vicnail-studio.com";

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
  const url = `${BASE_URL}/${locale}/nail/news/${slug}`;
  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
      languages: {
        "zh-TW": `${BASE_URL}/zh-TW/nail/news/${slug}`,
        en: `${BASE_URL}/en/nail/news/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.description,
      publishedTime: article.date,
      tags: article.tags,
      images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: ["/og-default.svg"],
    },
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
  const url = `${BASE_URL}/${locale}/nail/news/${slug}`;
  const sectionLabel = locale === "zh-TW" ? "美甲新聞" : "Nail News";

  return (
    <>
      <ArticleJsonLd article={article} url={url} />
      <BreadcrumbListJsonLd
        items={[
          { name: "VicNail Studio", url: BASE_URL },
          { name: sectionLabel, url: `${BASE_URL}/${locale}/nail/news` },
          { name: article.title, url },
        ]}
      />
      <ArticleContent
        article={article}
        backPath="/nail/news"
        backLabel={backLabel}
        locale={locale}
        relatedArticles={
          <RelatedArticles
            articles={related}
            basePath="/nail/news"
            locale={locale}
          />
        }
      />
    </>
  );
}
