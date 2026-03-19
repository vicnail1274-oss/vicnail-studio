import { getArticles } from "@/lib/mdx";
import { ArticleCard } from "@/components/blog/ArticleCard";
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

      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {articles.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              {locale === "zh-TW" ? "即將推出更多內容..." : "More content coming soon..."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  basePath="/nail/knowledge"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
