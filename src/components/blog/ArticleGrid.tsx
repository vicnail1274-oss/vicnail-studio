"use client";

import { motion } from "framer-motion";
import { ArticleCard } from "./ArticleCard";
import { AdSlot } from "@/components/ads/AdSlot";
import type { ArticleMeta } from "@/lib/mdx";

interface ArticleGridProps {
  articles: ArticleMeta[];
  basePath: string;
  dark?: boolean;
  adEvery?: number;
}

export function ArticleGrid({ articles, basePath, dark = false, adEvery = 4 }: ArticleGridProps) {
  // Build items list with ads interleaved
  const items: ({ type: "article"; data: ArticleMeta } | { type: "ad"; index: number })[] = [];

  articles.forEach((article, i) => {
    items.push({ type: "article", data: article });
    // Insert ad after every N articles
    if ((i + 1) % adEvery === 0 && i < articles.length - 1) {
      items.push({ type: "ad", index: Math.floor((i + 1) / adEvery) });
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, i) => {
        if (item.type === "ad") {
          return (
            <motion.div
              key={`ad-${item.index}`}
              className="flex items-center justify-center md:col-span-2 lg:col-span-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <AdSlot size="in-feed" slotId={`list-infeed-${item.index}`} dark={dark} />
            </motion.div>
          );
        }

        return (
          <ArticleCard
            key={item.data.slug}
            article={item.data}
            href={`${basePath}/${item.data.slug}`}
            dark={dark}
            index={i}
          />
        );
      })}
    </div>
  );
}
