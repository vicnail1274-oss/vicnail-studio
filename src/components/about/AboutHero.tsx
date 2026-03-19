"use client";

import { motion } from "framer-motion";
import { Award, Trophy, GraduationCap, MapPin } from "lucide-react";

const content = {
  "zh-TW": {
    title: "關於 VicNail Studio",
    subtitle: "美甲藝術與 AI 科技的跨界探索",
    story: [
      "VicNail Studio 由 Vic（東東老師）創立，是一間位於新北板橋的專業美甲教學工作室。",
      "Vic 老師擁有亞洲盃冠軍、OMC 國際評審的豐富資歷，堅持「學會為止」的教學理念，培育了無數優秀的美甲師。",
      "除了美甲專業，Vic 更是一位 AI 自動化愛好者，從零開始打造了完整的 AI 工作流程系統，讓科技與美學完美結合。",
    ],
    location: "新北市板橋區南雅南路二段144巷42號7樓",
    coreValues: [
      { icon: "award", label: "技術真正紮實", desc: "堅持基礎打到完美" },
      { icon: "trophy", label: "無限複習跟課", desc: "學會為止，不限次數" },
      { icon: "grad", label: "專屬排課系統", desc: "AI 驅動的智能排程" },
    ],
  },
  en: {
    title: "About VicNail Studio",
    subtitle: "Where Nail Artistry Meets AI Innovation",
    story: [
      "VicNail Studio was founded by Vic, a professional nail art instructor based in Banqiao, New Taipei City.",
      "With achievements including an Asian Cup championship and OMC international judge credentials, Vic is committed to thorough, mastery-based teaching.",
      "Beyond nail artistry, Vic is also an AI automation enthusiast who built a complete AI workflow system from scratch — merging technology with beauty.",
    ],
    location: "7F, No. 42, Lane 144, Sec. 2, Nanya S. Rd., Banqiao, New Taipei City",
    coreValues: [
      { icon: "award", label: "Solid Technique", desc: "Perfect the fundamentals" },
      { icon: "trophy", label: "Unlimited Review", desc: "Learn until you master it" },
      { icon: "grad", label: "Smart Scheduling", desc: "AI-powered booking system" },
    ],
  },
};

export function AboutHero({ locale }: { locale: string }) {
  const t = content[locale as keyof typeof content] || content["zh-TW"];
  const icons = { award: Award, trophy: Trophy, grad: GraduationCap };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-3">
              {t.title}
            </h1>
            <p className="text-xl text-nail-gold font-display">{t.subtitle}</p>
          </div>

          {/* Avatar + Story */}
          <div className="flex flex-col md:flex-row gap-10 items-start mb-16">
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-nail-gold/20 to-nail-pink/40 flex items-center justify-center border-2 border-nail-gold/20">
                <span className="text-6xl font-display text-nail-gold">V</span>
              </div>
            </div>
            <div className="space-y-4">
              {t.story.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {p}
                </p>
              ))}
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                <MapPin size={14} className="text-nail-gold" />
                {t.location}
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.coreValues.map((v) => {
              const Icon = icons[v.icon as keyof typeof icons];
              return (
                <div
                  key={v.label}
                  className="text-center p-6 rounded-2xl bg-white border border-nail-pink/20"
                >
                  <Icon size={28} className="text-nail-gold mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">
                    {v.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
