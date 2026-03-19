import { getArticles } from "@/lib/mdx";
import { ArticleGrid } from "@/components/blog/ArticleGrid";
import { AdSlot } from "@/components/ads/AdSlot";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nail Knowledge",
};

export default async function NailKnowledgePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const articles = getArticles("nail-knowledge", locale);
  const t = await getTranslations("sections");

  return (
    <>
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
