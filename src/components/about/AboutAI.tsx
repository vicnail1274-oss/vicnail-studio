"use client";

import { motion } from "framer-motion";
import { Bot, Zap, Calendar, MessageSquare, BarChart3 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const content = {
  "zh-TW": {
    title: "不務正業的另一面",
    subtitle: "一個美甲師的 AI 自動化之旅",
    description:
      "誰說美甲師只能做美甲？Vic 從零開始，用 AI 打造了一套完整的自動化系統：自動排課、智能客服、社群自動發文、系統自我監控。這不是科幻電影，而是每天真實運行的工作流程。",
    systems: [
      { icon: "calendar", label: "智能排課", desc: "學員自助預約，AI 自動優化時段" },
      { icon: "message", label: "AI 客服", desc: "LINE 自動回覆常見問題" },
      { icon: "zap", label: "社群自動化", desc: "AI 生成內容，自動排程發布" },
      { icon: "chart", label: "系統監控", desc: "24/7 哨兵自動巡邏與自癒" },
    ],
    cta: "探索 AI 實驗室",
  },
  en: {
    title: "The Other Side",
    subtitle: "A Nail Artist's AI Automation Journey",
    description:
      "Who says a nail artist can only do nails? Vic built a complete AI automation system from scratch: smart scheduling, AI customer service, automated social media, and self-monitoring systems. Not science fiction — this runs every single day.",
    systems: [
      { icon: "calendar", label: "Smart Scheduling", desc: "Self-service booking with AI optimization" },
      { icon: "message", label: "AI Customer Service", desc: "Automated LINE replies for common questions" },
      { icon: "zap", label: "Social Automation", desc: "AI-generated content, auto-scheduled posting" },
      { icon: "chart", label: "System Monitoring", desc: "24/7 sentinel with self-healing" },
    ],
    cta: "Explore AI Lab",
  },
};

export function AboutAI({ locale }: { locale: string }) {
  const t = content[locale as keyof typeof content] || content["zh-TW"];
  const icons = {
    calendar: Calendar,
    message: MessageSquare,
    zap: Zap,
    chart: BarChart3,
  };

  return (
    <section className="py-20 px-4 bg-ai-dark text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <Bot size={40} className="text-ai-cyan mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {t.title}
            </h2>
            <p className="text-ai-cyan font-mono text-sm">{t.subtitle}</p>
          </div>

          <p className="text-gray-400 leading-relaxed text-center max-w-2xl mx-auto mb-12">
            {t.description}
          </p>

          {/* Systems Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            {t.systems.map((s) => {
              const Icon = icons[s.icon as keyof typeof icons];
              return (
                <div
                  key={s.label}
                  className="p-5 rounded-xl bg-white/5 border border-white/10"
                >
                  <Icon size={20} className="text-ai-cyan mb-2" />
                  <h3 className="font-semibold text-white mb-1">{s.label}</h3>
                  <p className="text-sm text-gray-400">{s.desc}</p>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              asChild
              size="lg"
              className="bg-ai-purple hover:bg-ai-purple/90 text-white rounded-full px-8"
            >
              <Link href="/ai">{t.cta}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
