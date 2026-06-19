"use client";

import { ArticleCard } from "./ArticleCard";
import type { ArticleMeta } from "@/lib/mdx";

interface ArticleGridProps {
  articles: ArticleMeta[];
  basePath: string;
  dark?: boolean;
}

export function ArticleGrid({ articles, basePath, dark = false }: ArticleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, i) => (
        <ArticleCard
          key={article.slug}
          article={article}
          href={`${basePath}/${article.slug}`}
          dark={dark}
          index={i}
        />
      ))}
    </div>
  );
}
