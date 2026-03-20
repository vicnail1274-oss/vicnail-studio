import { getArticles } from "@/lib/mdx";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { BackgroundBeams } from "@/components/aceternity/BackgroundBeams";
import { ItemListJsonLd } from "@/components/seo/JsonLd";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

const BASE_URL = "https://vicnail-studio.com";

export const metadata: Metadata = {
  title: "AI Lab — 不務正業",
  description: "AI tool reviews, automation experiments, and tech insights. AI 工具評測、自動化探索與科技趨勢。",
  openGraph: {
    type: "website",
    title: "AI Lab — 不務正業 | VicNail Studio",
    description: "AI tool reviews, automation experiments, and tech insights.",
    images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Lab — 不務正業 | VicNail Studio",
    description: "AI tool reviews, automation experiments, and tech insights.",
    images: ["/og-default.svg"],
  },
};

export default async function AiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const articles = getArticles("ai", locale);
  const t = await getTranslations("sections");

  const listItems = articles.slice(0, 20).map((article) => ({
    name: article.title,
    url: `${BASE_URL}/${locale}/ai/${article.slug}`,
    description: article.description,
  }));

  return (
    <>
      {listItems.length > 0 && (
        <ItemListJsonLd
          name={locale === "zh-TW" ? "AI 實驗室" : "AI Lab"}
          description={locale === "zh-TW" ? "AI 工具評測與自動化探索" : "AI tool reviews and automation experiments"}
          items={listItems}
        />
      )}
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="text-ai-cyan text-sm font-mono tracking-widest uppercase mb-4">
            The Side Hustle
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-4">
            {locale === "zh-TW" ? "不務正業 AI 實驗室" : "AI Lab"}
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            {t("aiDesc")}
          </p>
        </div>
      </section>

      <div className="flex justify-center py-4">
        <AdSlot size="leaderboard" slotId="ai-top" dark />
      </div>

      {/* Articles */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-2">
                {locale === "zh-TW" ? "AI 機器人正在準備內容..." : "AI bot is preparing content..."}
              </p>
              <p className="text-gray-600 text-sm font-mono">
                {'>'} initializing content pipeline...
              </p>
            </div>
          ) : (
            <ArticleGrid articles={articles} basePath="/ai" dark />
          )}
        </div>
      </section>
    </>
  );
}
