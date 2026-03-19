"use client";

import { motion } from "framer-motion";
import { Clock, Star, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const courses = [
  {
    id: 1,
    title: "選修單堂",
    subtitle: "Single Class",
    price: "$3,000",
    priceUnit: "/ 堂",
    duration: "3 小時 / 堂",
    description: "針對特定弱點，單點突破。適合想嘗試特定技術，或只需針對單一項目進修的美甲師。",
    highlights: [
      "全科/創業班課綱任選單一主題",
      "單色技法 / 法式指甲",
      "建構技法 / 特定彩繪",
      "一對一或小班指導",
    ],
    recommended: false,
  },
  {
    id: 2,
    title: "高強度一日專修班",
    subtitle: "One-Day Intensive",
    price: "$7,500",
    priceUnit: "/ 堂",
    duration: "7 小時 / 堂（含午休）",
    description: "精選主題深度學習，一天內完成特定技術的密集訓練。",
    highlights: [
      "可卸式橢圓短延甲",
      "硬式方形長延甲",
      "足部保養",
      "暈染/花磚/素材應用",
    ],
    recommended: false,
  },
  {
    id: 3,
    title: "基礎全科班 2.0",
    subtitle: "基礎全能",
    price: "$54,000",
    originalPrice: "$69,800",
    priceUnit: "",
    duration: "22 堂（約 75 小時）",
    validity: "效期 12 個月",
    description: "適合零基礎、考證照、基礎不穩者。承諾學會為止，無限複習跟課。",
    highlights: [
      "指甲學概論 & 基礎保養",
      "單色、法式、多種彩繪技法",
      "基礎延甲技術",
      "贈送：檢定彩繪 & 模擬",
      "無限複習跟課機制",
    ],
    recommended: false,
    hot: true,
  },
  {
    id: 4,
    title: "全方位開店創業班",
    subtitle: "沙龍實戰全修",
    price: "$98,000",
    originalPrice: "$164,300",
    priceUnit: "",
    duration: "44 堂（約 156 小時）",
    validity: "效期 18 個月",
    description: "目標開店、想一次學完高階技術者的最佳選擇。包含全科班所有內容加上進階實戰。",
    highlights: [
      "包含全科班所有內容",
      "含 5 堂高階一日專修班（價值 $37,500）",
      "進階實戰技術",
      "長短延甲、足部保養、特殊素材",
      "最長複習效期",
    ],
    recommended: true,
  },
  {
    id: 5,
    title: "技術導正調整班",
    subtitle: "技術重塑．找回自信",
    price: "$26,000",
    originalPrice: "$30,000",
    priceUnit: "",
    duration: "10 堂精華課（約 30 小時）",
    validity: "效期 3 個月",
    description:
      "針對已學過美甲但基礎不穩，或長期累積操作壞習慣的學員。精準拆解問題並導正手法。",
    highlights: [
      "針對個人手法問題拆解",
      "精準導正操作壞習慣",
      "改善操作速度與精緻度",
      "包含全科班基礎核心內容",
    ],
    recommended: false,
  },
];

export function CourseList() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-shadow relative",
                course.recommended
                  ? "border-nail-gold ring-2 ring-nail-gold/20"
                  : "border-nail-pink/30"
              )}
            >
              {/* Recommended badge */}
              {course.recommended && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-nail-gold text-white text-xs font-semibold rounded-full">
                  RECOMMENDED
                </div>
              )}

              {/* Card header with gradient */}
              <div
                className={cn(
                  "h-2",
                  course.recommended
                    ? "bg-gradient-to-r from-nail-gold via-nail-gold-light to-nail-gold"
                    : "bg-gradient-to-r from-nail-gold/60 to-nail-gold-light/60"
                )}
              />

              <div className="p-6">
                {/* Title */}
                <div className="mb-3">
                  {course.hot && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-500 text-xs font-medium rounded-full mb-2">
                      <Flame size={12} /> 熱門
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="text-sm text-nail-gold">{course.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {course.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {course.priceUnit}
                    </span>
                  </div>
                  {course.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {course.originalPrice}
                    </span>
                  )}
                </div>

                {/* Duration & validity */}
                <div className="flex flex-wrap gap-2 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {course.duration}
                  </span>
                  {course.validity && (
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {course.validity}
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {course.description}
                </p>

                {/* Highlights */}
                <div className="space-y-1.5">
                  {course.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-2 text-sm">
                      <Star
                        size={12}
                        className="text-nail-gold flex-shrink-0 mt-0.5"
                      />
                      <span className="text-muted-foreground">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
