import { getArticles } from "@/lib/mdx";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

const BASE_URL = "https://vicnail-studio.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/nail/knowledge`;
  return {
    title: "Nail Knowledge",
    description: "Nail art techniques, care tips, and material guides. 美甲技術教學、保養知識與材質比較。",
    alternates: {
      canonical: url,
      languages: {
        "zh-TW": `${BASE_URL}/zh-TW/nail/knowledge`,
        en: `${BASE_URL}/en/nail/knowledge`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: "Nail Knowledge | VicNail Studio",
      description: "Nail art techniques, care tips, and material guides.",
      images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Nail Knowledge | VicNail Studio",
      description: "Nail art techniques, care tips, and material guides.",
      images: ["/og-default.svg"],
    },
  };
}

export default async function NailKnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = getArticles("nail-knowledge", locale);
  const t = await getTranslations("sections");

  const listItems = articles.slice(0, 20).map((article) => ({
    name: article.title,
    url: `${BASE_URL}/${locale}/nail/knowledge/${article.slug}`,
    description: article.description,
  }));

  return (
    <>
      {listItems.length > 0 && (
        <ItemListJsonLd
          name={locale === "zh-TW" ? "美甲知識" : "Nail Knowledge"}
          description={locale === "zh-TW" ? "美甲技術教學與保養知識" : "Nail art techniques and care guides"}
          items={listItems}
        />
      )}
      <section className="py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {t("knowledge")}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("knowledgeDesc")}
          </p>
        </div>
      </section>

      <div className="flex justify-center py-4">
        <AdSlot size="leaderboard" slotId="knowledge-top" />
      </div>

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {locale === "zh-TW" ? "即將推出更多內容..." : "More content coming soon..."}
            </p>
          ) : (
            <ArticleGrid articles={articles} basePath="/nail/knowledge" />
          )}
        </div>
      </section>
    </>
  );
}
