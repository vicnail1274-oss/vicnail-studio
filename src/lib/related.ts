import type { ArticleMeta } from "./mdx";

export function getRelatedArticles(
  current: ArticleMeta,
  allArticles: ArticleMeta[],
  maxCount = 3
): ArticleMeta[] {
  const others = allArticles.filter((a) => a.slug !== current.slug);

  // Score by shared tags
  const scored = others.map((article) => {
    const shared = article.tags.filter((t) => current.tags.includes(t)).length;
    return { article, score: shared };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxCount).map((s) => s.article);
}
