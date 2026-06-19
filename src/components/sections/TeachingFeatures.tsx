"use client";

import { Infinity as InfinityIcon, Users, BadgeCheck, Rocket } from "lucide-react";

interface Feature {
  Icon: typeof InfinityIcon;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
}

const FEATURES: Feature[] = [
  {
    Icon: InfinityIcon,
    titleZh: "學會為止・無限複習",
    titleEn: "Learn Until Mastery",
    descZh: "承諾學會為止，不限次數複習跟課。基礎沒打穩，老師陪你練到熟練為止。",
    descEn: "We commit to your mastery — unlimited review sessions until the fundamentals are truly solid.",
  },
  {
    Icon: Users,
    titleZh: "小班手把手・個別指導",
    titleEn: "Small-Class Mentoring",
    descZh: "小班制親自示範與糾正，依每位學員的進度與手法給予一對一的個別指導。",
    descEn: "Small classes with hands-on demonstration and one-on-one guidance tailored to each student's pace.",
  },
  {
    Icon: BadgeCheck,
    titleZh: "JNEC 日本檢定考照輔導",
    titleEn: "JNEC Certification Support",
    descZh: "JNEC 日本美甲檢定考照輔導，含檢定彩繪與模擬演練，協助你考取專業證照。",
    descEn: "Full JNEC Japanese nail certification coaching, including exam art practice and mock tests.",
  },
  {
    Icon: Rocket,
    titleZh: "零基礎到開店創業一條龍",
    titleEn: "Zero to Salon Owner",
    descZh: "從零基礎入門到進階實戰與開店創業，一條龍課程規劃，陪你走完每一步。",
    descEn: "A complete pathway from absolute beginner to advanced skills and launching your own salon.",
  },
];

export function TeachingFeatures({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-20 bg-gradient-to-b from-white to-nail-cream">
      <div className="max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "教學工作室" : "Academy"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "為什麼選擇 VicNail Academy" : "Why Learn at VicNail Academy"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {isZh
              ? "亞洲盃冠軍、OMC 國際評審親自授課，堅持把每位學員的基礎打到紮實。"
              : "Taught by an Asian Cup champion and OMC international judge, committed to building rock-solid fundamentals."}
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.titleZh}
              className="group flex items-start gap-4 bg-white rounded-2xl p-6 border border-nail-pink/40 hover:border-nail-gold/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-nail-pink/40 flex items-center justify-center group-hover:bg-nail-gold/15 transition-colors">
                <feature.Icon size={24} className="text-nail-gold" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-1">
                  {isZh ? feature.titleZh : feature.titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isZh ? feature.descZh : feature.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
