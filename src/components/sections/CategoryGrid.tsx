"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { BookOpen, Newspaper, Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    key: "knowledge",
    href: "/nail/knowledge",
    icon: BookOpen,
    color: "bg-nail-pink/30 text-nail-gold",
    hoverBorder: "hover:border-nail-gold/40",
    zhTitle: "美甲知識",
    enTitle: "Nail Knowledge",
    zhDesc: "從入門到進階的凝膠美甲技術教學",
    enDesc: "Gel & UV nail techniques from beginner to advanced",
  },
  {
    key: "news",
    href: "/nail/news",
    icon: Newspaper,
    color: "bg-amber-100 text-amber-700",
    hoverBorder: "hover:border-amber-400/40",
    zhTitle: "美甲新聞",
    enTitle: "Nail News",
    zhDesc: "最新趨勢、產品評測與產業動態",
    enDesc: "Latest trends, product reviews & industry updates",
  },
  {
    key: "ai",
    href: "/ai",
    icon: Bot,
    color: "bg-ai-purple/20 text-ai-cyan",
    hoverBorder: "hover:border-ai-purple/40",
    zhTitle: "AI 不務正業",
    enTitle: "AI Side Hustle",
    zhDesc: "美甲師的 AI 自動化實驗與心得分享",
    enDesc: "AI automation experiments from a nail artist",
  },
  {
    key: "courses",
    href: "/courses",
    icon: Sparkles,
    color: "bg-nail-gold/10 text-nail-gold",
    hoverBorder: "hover:border-nail-gold/40",
    zhTitle: "美甲課程",
    enTitle: "Nail Courses",
    zhDesc: "PRESTO 認證講師親授，從基礎到開店創業",
    enDesc: "Learn from a PRESTO certified instructor",
  },
];

export function CategoryGrid({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-16 px-4 bg-nail-cream/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-10">
          {isZh ? "探索分類" : "Explore Categories"}
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={cat.href} className="block group">
                <div
                  className={cn(
                    "rounded-xl p-5 border border-gray-100 bg-white text-center transition-all duration-300",
                    "group-hover:-translate-y-1 group-hover:shadow-md",
                    cat.hoverBorder
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                      cat.color
                    )}
                  >
                    <cat.icon size={22} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">
                    {isZh ? cat.zhTitle : cat.enTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isZh ? cat.zhDesc : cat.enDesc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
