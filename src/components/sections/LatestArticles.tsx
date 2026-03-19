"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Calendar, Tag, ArrowRight, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleMeta } from "@/lib/mdx";

interface LatestArticlesProps {
  articles: (ArticleMeta & { section: string; href: string })[];
  locale: string;
}

export function LatestArticles({ articles, locale }: LatestArticlesProps) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              {isZh ? "最新文章" : "Latest Articles"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isZh ? "美甲知識、新聞與 AI 實驗室的最新內容" : "Fresh content from nail knowledge, news & AI lab"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, i) => {
            const isAi = article.section === "ai";
            return (
              <motion.div
                key={article.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={article.href} className="block group">
                  <div
                    className={cn(
                      "rounded-xl p-5 h-full border transition-all duration-300 group-hover:-translate-y-1",
                      isAi
                        ? "bg-gray-950 border-gray-800 group-hover:border-ai-purple/50 group-hover:shadow-lg group-hover:shadow-ai-purple/10"
                        : "bg-white border-gray-100 group-hover:border-nail-gold/30 group-hover:shadow-lg group-hover:shadow-nail-gold/10"
                    )}
                  >
                    {/* Section badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={cn(
                          "text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full",
                          isAi
                            ? "bg-ai-purple/20 text-ai-cyan"
                            : article.section === "nail-news"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-nail-pink/50 text-nail-gold"
                        )}
                      >
                        {isAi
                          ? "AI Lab"
                          : article.section === "nail-news"
                          ? isZh ? "新聞" : "News"
                          : isZh ? "知識" : "Knowledge"}
                      </span>
                      {article.source === "bot" && (
                        <Bot size={12} className={isAi ? "text-ai-neon" : "text-blue-500"} />
                      )}
                    </div>

                    <h3
                      className={cn(
                        "font-bold text-lg mb-2 line-clamp-2 transition-colors",
                        isAi
                          ? "text-white group-hover:text-ai-cyan"
                          : "text-foreground group-hover:text-nail-gold"
                      )}
                    >
                      {article.title}
                    </h3>

                    <p
                      className={cn(
                        "text-sm line-clamp-2 mb-4",
                        isAi ? "text-gray-400" : "text-muted-foreground"
                      )}
                    >
                      {article.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <span
                          className={cn(
                            "flex items-center gap-1",
                            isAi ? "text-gray-500" : "text-muted-foreground"
                          )}
                        >
                          <Calendar size={11} />
                          {article.date}
                        </span>
                        {article.tags[0] && (
                          <span
                            className={cn(
                              "flex items-center gap-1",
                              isAi ? "text-gray-500" : "text-muted-foreground"
                            )}
                          >
                            <Tag size={11} />
                            {article.tags[0]}
                          </span>
                        )}
                      </div>
                      <ArrowRight
                        size={14}
                        className={cn(
                          "transition-transform group-hover:translate-x-1",
                          isAi ? "text-ai-cyan" : "text-nail-gold"
                        )}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
