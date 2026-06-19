"use client";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Clock, Flame } from "lucide-react";

interface CoursePlan {
  nameZh: string;
  nameEn: string;
  price: string;
  durationZh: string;
  durationEn: string;
  highlightZh: string;
  highlightEn: string;
  recommended?: boolean;
  hot?: boolean;
}

const COURSES: CoursePlan[] = [
  {
    nameZh: "選修單堂",
    nameEn: "Single Class",
    price: "NT$3,000",
    durationZh: "3 小時 / 堂",
    durationEn: "3 hrs / class",
    highlightZh: "針對特定弱點單點突破，課綱任選單一主題。",
    highlightEn: "Target a specific weak point — pick any single topic from the syllabus.",
  },
  {
    nameZh: "高強度一日專修班",
    nameEn: "One-Day Intensive",
    price: "NT$7,500",
    durationZh: "7 小時 / 堂",
    durationEn: "7 hrs / class",
    highlightZh: "精選主題深度學習，一天完成密集訓練。",
    highlightEn: "Deep-dive on a chosen topic with intensive single-day training.",
  },
  {
    nameZh: "基礎全科班 2.0",
    nameEn: "Full Foundation 2.0",
    price: "NT$54,000",
    durationZh: "22 堂・約 75 小時",
    durationEn: "22 classes · ~75 hrs",
    highlightZh: "零基礎、考證照首選，承諾學會為止無限複習。",
    highlightEn: "Best for beginners and certification — unlimited review until mastery.",
    hot: true,
  },
  {
    nameZh: "全方位開店創業班",
    nameEn: "Salon Startup Master",
    price: "NT$98,000",
    durationZh: "44 堂・約 156 小時",
    durationEn: "44 classes · ~156 hrs",
    highlightZh: "一次學完高階技術，目標開店創業的最佳選擇。",
    highlightEn: "Master advanced skills end-to-end — built for future salon owners.",
    recommended: true,
  },
  {
    nameZh: "技術導正調整班",
    nameEn: "Technique Reset",
    price: "NT$26,000",
    durationZh: "10 堂・約 30 小時",
    durationEn: "10 classes · ~30 hrs",
    highlightZh: "拆解導正壞習慣，重塑手法找回自信。",
    highlightEn: "Diagnose and correct bad habits to rebuild confident technique.",
  },
];

export function CoursesOverview({ locale }: { locale: string }) {
  const isZh = locale === "zh-TW";

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-nail-gold uppercase tracking-widest mb-2">
            {isZh ? "課程方案" : "Courses"}
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "找到最適合你的課程方案" : "Find the Course That Fits You"}
          </h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            {isZh
              ? "從單堂進修到開店創業，五種班型對應每個階段的學習需求。"
              : "From single classes to startup training — five course tracks for every stage."}
          </p>
        </div>

        {/* Course cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES.map((course) => (
            <Link
              key={course.nameZh}
              href="/courses"
              className={`group flex flex-col rounded-2xl p-6 bg-nail-cream/50 border transition-all duration-300 hover:shadow-lg ${
                course.recommended
                  ? "border-nail-gold ring-2 ring-nail-gold/20"
                  : "border-nail-pink/40 hover:border-nail-gold/50"
              }`}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-3 min-h-[24px]">
                {course.recommended && (
                  <span className="px-2.5 py-0.5 bg-nail-gold text-white text-xs font-semibold rounded-full">
                    {isZh ? "推薦" : "RECOMMENDED"}
                  </span>
                )}
                {course.hot && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full">
                    <Flame size={12} /> {isZh ? "熱門" : "POPULAR"}
                  </span>
                )}
              </div>

              {/* Name */}
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {isZh ? course.nameZh : course.nameEn}
              </h3>

              {/* Price + duration */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-nail-gold">
                  {course.price}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                <Clock size={14} className="text-nail-gold" />
                {isZh ? course.durationZh : course.durationEn}
              </div>

              {/* Highlight */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {isZh ? course.highlightZh : course.highlightEn}
              </p>

              {/* Per-card link cue */}
              <span className="mt-4 text-sm font-medium text-nail-gold group-hover:underline">
                {isZh ? "查看課程詳情 →" : "View details →"}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-nail-gold hover:bg-nail-gold/90 text-white rounded-full px-8"
          >
            <Link href="/courses">
              {isZh ? "查看完整課程方案" : "View All Courses"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
