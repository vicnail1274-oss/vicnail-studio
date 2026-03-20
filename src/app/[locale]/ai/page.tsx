import { getArticles } from "@/lib/mdx";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { BackgroundBeams } from "@/components/aceternity/BackgroundBeams";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Lab — 不務正業",
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

  return (
    <>
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
