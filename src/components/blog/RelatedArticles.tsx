"use client";

import { ArticleCard } from "./ArticleCard";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/lib/mdx";

export function RelatedArticles({
  articles,
  basePath,
  dark = false,
  locale,
}: {
  articles: ArticleMeta[];
  basePath: string;
  dark?: boolean;
  locale: string;
}) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <h2
        className={cn(
          "text-xl font-display font-bold mb-6",
          dark ? "text-white" : "text-foreground"
        )}
      >
        {locale === "zh-TW" ? "相關文章" : "Related Articles"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.map((article, i) => (
          <ArticleCard
            key={article.slug}
            article={article}
            basePath={basePath}
            dark={dark}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
