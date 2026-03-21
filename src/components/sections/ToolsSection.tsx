"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  {
    key: "nail-color-matcher",
    href: "/tools/nail-color-matcher",
    icon: Palette,
    color: "bg-nail-pink/30 text-nail-gold",
    hoverBorder: "hover:border-nail-gold/40",
    zhTitle: "膚色配色推薦",
    enTitle: "Nail Color Matcher",
    zhDesc: "根據你的膚色與色調，推薦最適合的指甲油配色",
    enDesc: "Find perfect nail colors based on your skin tone",
  },
];

export function ToolsSection({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-12 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-8">
          {isZh ? "免費工具" : "Free Tools"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.key}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link href={tool.href} className="block group">
                <div
                  className={cn(
                    "rounded-xl p-5 border border-gray-100 bg-nail-cream/30 text-center transition-all duration-300",
                    "group-hover:-translate-y-1 group-hover:shadow-md",
                    tool.hoverBorder
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3",
                      tool.color
                    )}
                  >
                    <tool.icon size={22} />
                  </div>
                  <h3 className="font-bold text-foreground mb-1">
                    {isZh ? tool.zhTitle : tool.enTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {isZh ? tool.zhDesc : tool.enDesc}
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
