"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { ArticleMeta } from "@/lib/mdx";
import { cn } from "@/lib/utils";
import { Calendar, Tag } from "lucide-react";

export function ArticleCard({
  article,
  basePath,
  href,
  dark = false,
  index = 0,
}: {
  article: ArticleMeta;
  basePath?: string;
  href?: string;
  dark?: boolean;
  index?: number;
}) {
  const linkHref = href || `${basePath}/${article.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 3) * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={linkHref}
        className={cn(
          "block rounded-2xl p-6 h-full transition-shadow duration-300",
          dark
            ? "bg-white/5 border border-white/10 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)]"
            : "bg-white border border-nail-pink/30 hover:shadow-[0_0_20px_rgba(183,110,121,0.1)]"
        )}
      >
        <h3
          className={cn(
            "text-lg font-semibold mb-2 line-clamp-2",
            dark ? "text-white" : "text-foreground"
          )}
        >
          {article.title}
        </h3>
        <p
          className={cn(
            "text-sm mb-4 line-clamp-2",
            dark ? "text-gray-400" : "text-muted-foreground"
          )}
        >
          {article.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span
            className={cn(
              "flex items-center gap-1",
              dark ? "text-gray-500" : "text-muted-foreground"
            )}
          >
            <Calendar size={12} />
            {article.date}
          </span>
          {article.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full",
                dark
                  ? "bg-ai-purple/20 text-ai-cyan"
                  : "bg-nail-pink/50 text-nail-gold"
              )}
            >
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </motion.article>
  );
}
