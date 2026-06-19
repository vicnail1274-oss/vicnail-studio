"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, MessageCircle } from "lucide-react";
import { LINE_URL } from "@/lib/line";
import { cn } from "@/lib/utils";

type Category = "all" | "full" | "single" | "exam";

interface Course {
  id: number;
  badge: string;
  badgeStyle: "new" | "hot" | "fix" | "exam" | "intensive" | "elective";
  title: string;
  subtitle: string;
  price: string;
  priceUnit?: string;
  originalPrice?: string;
  promo?: string;
  meta: string[];
  note?: string;
  highlights: string[];
  audience?: string;
  category: Exclude<Category, "all">;
  recommended?: boolean;
}

const categories: { key: Category; label: string }[] = [
  { key: "all", label: "全部課程" },
  { key: "full", label: "全科・創業・調整" },
  { key: "single", label: "單堂・一日專修" },
  { key: "exam", label: "檢定衝刺" },
];

const badgeStyles: Record<Course["badgeStyle"], string> = {
  new: "bg-nail-gold text-white",
  hot: "bg-red-50 text-red-500",
  fix: "bg-nail-pink/60 text-nail-gold",
  exam: "bg-amber-50 text-amber-600",
  intensive: "bg-orange-50 text-orange-500",
  elective: "bg-nail-cream text-nail-gold",
};

const courses: Course[] = [
  {
    id: 1,
    badge: "NEW",
    badgeStyle: "new",
    title: "全方位開店創業班",
    subtitle: "沙龍實戰全修",
    price: "$98,000",
    originalPrice: "$164,300",
    promo: "本月限時優惠・兩人同行折抵",
    meta: ["效期 18 個月", "44 堂（約 156 小時）"],
    highlights: [
      "包含全科班所有內容",
      "含 5 堂高階一日專修班（價值 $37,500）",
      "進階實戰技術",
      "長短延甲、足部保養、特殊素材",
      "最長複習效期",
    ],
    audience: "目標開店、想一次學完高階技術者",
    category: "full",
    recommended: true,
  },
  {
    id: 2,
    badge: "熱門基礎",
    badgeStyle: "hot",
    title: "全科班 2.0",
    subtitle: "基礎全能",
    price: "$54,000",
    originalPrice: "$69,800",
    meta: ["效期 12 個月", "22 堂（約 75 小時）"],
    highlights: [
      "指甲學概論 & 基礎保養",
      "單色、法式、多種彩繪技法",
      "基礎延甲技術",
      "贈送：檢定彩繪 & 模擬",
      "無限複習跟課機制",
    ],
    audience: "零基礎、考證照、基礎不穩者",
    category: "full",
  },
  {
    id: 3,
    badge: "技術導正",
    badgeStyle: "fix",
    title: "調整班",
    subtitle: "技術重塑・找回自信",
    price: "$26,000",
    originalPrice: "$30,000",
    meta: ["效期 3 個月", "10 堂精華（約 30 小時）"],
    note: "針對已學過美甲但基礎不穩、或長期壞習慣的學員，精準拆解並導正手法，不只「重學」更是「重塑」技術與自信。",
    highlights: [
      "針對個人手法問題拆解",
      "精準導正操作壞習慣",
      "改善操作速度與精緻度",
      "包含全科班基礎核心內容",
    ],
    category: "full",
  },
  {
    id: 4,
    badge: "檢定攻略",
    badgeStyle: "exam",
    title: "TNA 檢定衝刺班",
    subtitle: "短期兩日課程",
    price: "$9,800 起",
    note: "外縣市 $11,980／外島 $13,500。針對 TNA 二級檢定考試設計的衝刺班，重點攻略與模擬。",
    meta: ["12 小時／兩日", "10:00–17:00"],
    highlights: [
      "檢定規則說明與模擬",
      "手部保養與單色上色",
      "凝膠卸甲與紅色漸層",
      "指定彩繪攻略（花卉・幾何・愛心）",
    ],
    category: "exam",
  },
  {
    id: 5,
    badge: "高強度",
    badgeStyle: "intensive",
    title: "一日專修班",
    subtitle: "One-Day Intensive",
    price: "$7,500",
    priceUnit: "／堂",
    meta: ["7 小時／堂（含午休）"],
    highlights: [
      "可卸式橢圓短延甲",
      "硬式方形長延甲",
      "足部保養",
      "暈染・花磚・素材應用",
    ],
    category: "single",
  },
  {
    id: 6,
    badge: "選修",
    badgeStyle: "elective",
    title: "單堂選修課",
    subtitle: "Single Class",
    price: "$3,000",
    priceUnit: "／堂",
    meta: ["3 小時／堂"],
    note: "針對特定弱點，單點突破。適合想嘗試特定技術或只需單一項目進修的美甲師。",
    highlights: [
      "全科/創業班課綱任選單一主題",
      "單色技法・法式指甲",
      "建構技法・特定彩繪",
      "一對一或小班指導",
    ],
    category: "single",
  },
];

export function CourseList() {
  const [active, setActive] = useState<Category>("all");

  const visible =
    active === "all"
      ? courses
      : courses.filter((c) => c.category === active);

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                active === cat.key
                  ? "bg-nail-gold text-white border-nail-gold"
                  : "bg-white text-muted-foreground border-nail-pink/40 hover:border-nail-gold/50 hover:text-nail-gold"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          <AnimatePresence mode="popLayout">
            {visible.map((course, i) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className={cn(
                  "flex flex-col bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow relative",
                  course.recommended
                    ? "border-nail-gold ring-2 ring-nail-gold/20"
                    : "border-nail-pink/30"
                )}
              >
                {/* Card header gradient */}
                <div
                  className={cn(
                    "h-2",
                    course.recommended
                      ? "bg-gradient-to-r from-nail-gold via-nail-gold-light to-nail-gold"
                      : "bg-gradient-to-r from-nail-gold/60 to-nail-gold-light/60"
                  )}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Badge */}
                  <span
                    className={cn(
                      "inline-flex self-start items-center px-2.5 py-0.5 text-xs font-semibold rounded-full mb-2",
                      badgeStyles[course.badgeStyle]
                    )}
                  >
                    {course.badge}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-display font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="text-sm text-nail-gold mb-3">{course.subtitle}</p>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">
                        {course.price}
                      </span>
                      {course.priceUnit && (
                        <span className="text-sm text-muted-foreground">
                          {course.priceUnit}
                        </span>
                      )}
                    </div>
                    {course.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        原價 {course.originalPrice}
                      </span>
                    )}
                  </div>

                  {/* Promo */}
                  {course.promo && (
                    <div className="mb-3 inline-flex self-start items-center px-2.5 py-1 rounded-full bg-red-50 text-red-500 text-xs font-medium">
                      {course.promo}
                    </div>
                  )}

                  {/* Meta: validity / lessons / hours */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.meta.map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1 text-xs bg-nail-cream text-muted-foreground px-2.5 py-1 rounded-full"
                      >
                        <Clock size={12} className="text-nail-gold" />
                        {m}
                      </span>
                    ))}
                  </div>

                  {/* Note */}
                  {course.note && (
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {course.note}
                    </p>
                  )}

                  {/* Highlights */}
                  <div className="space-y-1.5 mb-4">
                    {course.highlights.map((h) => (
                      <div key={h} className="flex items-start gap-2 text-sm">
                        <Star
                          size={12}
                          className="text-nail-gold flex-shrink-0 mt-1"
                        />
                        <span className="text-muted-foreground">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Audience */}
                  {course.audience && (
                    <p className="text-sm text-foreground/80 mb-4">
                      <span className="font-medium text-nail-gold">適合對象：</span>
                      {course.audience}
                    </p>
                  )}

                  {/* CTA */}
                  <a
                    href={LINE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 transition-colors",
                      course.recommended
                        ? "bg-nail-gold text-white hover:bg-nail-gold/90"
                        : "bg-nail-cream text-nail-gold hover:bg-nail-pink/50"
                    )}
                  >
                    <MessageCircle size={16} />
                    LINE 諮詢報名
                  </a>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            想了解{" "}
            <span className="font-medium text-foreground">全科班 vs 創業班</span>{" "}
            的差異？歡迎{" "}
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-nail-gold underline underline-offset-4 hover:text-nail-gold/80"
            >
              LINE 諮詢
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
