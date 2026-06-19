"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, MessageCircle, ListChecks, X } from "lucide-react";
import { LINE_URL } from "@/lib/line";
import { cn } from "@/lib/utils";

type Category = "all" | "full" | "single" | "exam";

interface Curriculum {
  heading: string;
  sub: string;
  /** 課綱項目；編號於畫面自動生成 */
  lessons: string[];
  /** 計數單位：堂 / 主題 / 項（按鈕文字用），預設「堂」 */
  unit?: string;
}

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
  curriculum: Curriculum;
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
    curriculum: {
      heading: "創業班全修課程項目",
      sub: "最完整的課程體系，包含經營管理與高階設計",
      lessons: [
        "凝膠材料知識及產品說明",
        "指甲構造及問題甲辨識",
        "基礎色彩學及色彩搭配應用",
        "工具清潔保養與注意事項",
        "指甲修型",
        "磨甲機快速前置",
        "完美精緻前置",
        "足部深層保養",
        "罐裝完美單色",
        "甲油膠完美單色",
        "不傷甲凝膠卸甲",
        "建甲、斷甲修補",
        "足部凝膠上色及足部卸甲",
        "建構邏輯及不倒手建構",
        "凝膠法式設計",
        "罐裝漸層(彩膠、亮片)",
        "甲油膠漸層(彩膠、亮片)",
        "毛呢紋設計",
        "細膩蕾絲彩繪",
        "貼紙應用、星空貼應用",
        "水鑽及貼飾應用、大型飾品",
        "可卸式橢圓短延甲",
        "硬式方形長延甲",
        "全貼甲片延甲",
        "半貼甲片延甲",
        "基礎暈染技法",
        "進階暈染技法",
        "暈染液基礎應用",
        "暈染液進階應用及款式設計",
        "貓眼膠應用",
        "礦物石感(寶石、琥珀)",
        "細膩石紋設計",
        "各式素材應用",
        "基礎花磚技法",
        "進階花磚技法",
        "基礎花卉設計一",
        "進階花卉設計二",
        "油畫膠、石膏膠應用",
        "立體造型膠、軟糖膠應用",
        "沙龍實用款式設計",
        "作品拍攝、手機修圖",
        "沙龍經驗分享、價格設定",
        "檢定彩繪",
        "檢定考流程",
      ],
    },
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
    curriculum: {
      heading: "全科班 2.0 課程項目",
      sub: "包含兩堂獨家課程（鏡面粉操作、孔雀紋）",
      lessons: [
        "凝膠材料知識及產品說明",
        "指甲構造及問題甲辨識",
        "磨甲機快速前置",
        "建甲、斷甲修補",
        "不傷甲凝膠卸甲",
        "罐裝完美單色",
        "甲油膠完美單色",
        "罐裝漸層(彩膠、亮片)",
        "礦物石感(寶石、琥珀)",
        "基礎花卉設計",
        "鏡面粉、礦物粉、金屬粉 操作應用(本班獨有)",
        "建構邏輯及不倒手建構",
        "凝膠法式設計",
        "基礎暈染技法",
        "細膩蕾絲彩繪",
        "孔雀紋(本班獨有)",
        "可卸式橢圓短延甲",
        "硬式方形長延甲",
        "貼紙應用、星空貼應用",
        "水鑽及貼飾應用、大型飾品",
        "檢定彩繪",
        "檢定考流程",
      ],
    },
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
    curriculum: {
      heading: "調整班精選項目",
      sub: "針對執業需求進行技術矯正，課程名稱已與創業班統一",
      lessons: [
        "凝膠材料知識及產品說明",
        "指甲構造及問題甲辨識",
        "磨甲機快速前置",
        "罐裝完美單色",
        "不傷甲凝膠卸甲",
        "凝膠法式設計",
        "罐裝漸層(彩膠、亮片)",
        "基礎暈染技法",
        "水鑽及貼飾應用、大型飾品",
        "可卸式橢圓短延甲",
      ],
    },
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
    curriculum: {
      heading: "TNA 檢定班課程詳解",
      sub: "重點攻略與模擬，兩日完整訓練",
      lessons: [
        "【Day 1】檢定規則說明、事前準備",
        "【Day 1】手部保養流程：修型、甘皮處理、甲面拋光",
        "【Day 1】單色上色：底膠塗刷、正紅上色操作、清除溢膠技巧、評分規則",
        "【Day 1】凝膠卸甲：快速安全卸甲、磨甲機操作、零殘膠處理",
        "【Day 2】紅色漸層：操作技巧、檢定標準、與卸甲的時間分配",
        "【Day 2】彩繪技能：70%構圖技巧、五瓣水滴花、五瓣尖花、玫瑰花、直線格紋、愛心彩繪",
        "【Day 2】考前叮嚀：模特兒挑選、工具產品挑選、學科考題重點、評分標準與得分技巧",
      ],
    },
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
    curriculum: {
      heading: "一日專修 - 精選主題（擇一）",
      sub: "請從以下 5 大高階主題中，選擇一項進行全日（6小時）的深度特訓",
      unit: "主題",
      lessons: [
        "【主題 A】可卸式橢圓短延甲（凝膠延甲實戰、架指模技巧）",
        "【主題 B】硬式方形長延甲（高階結構、塑型）",
        "【主題 C】足部深層保養（去繭、按摩、不含上色）",
        "【主題 D】高階彩繪專修（多種暈染技巧 + 花磚基礎）",
        "【主題 E】素材應用專修（鏡面粉、貼飾、立體膠應用）",
      ],
    },
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
    curriculum: {
      heading: "單堂選修 - 可選課程庫",
      sub: "您可以從以下完整的課程清單中，任選「單一項目」進行 3 小時的重點指導",
      unit: "項",
      lessons: [
        "凝膠材料知識及產品說明",
        "指甲構造及問題甲辨識",
        "基礎色彩學及色彩搭配應用",
        "工具清潔保養與注意事項",
        "指甲修型 (方/圓/梯/杏)",
        "磨甲機快速前置",
        "完美精緻前置 (剪甘皮)",
        "足部深層保養",
        "罐裝完美單色",
        "甲油膠完美單色",
        "不傷甲凝膠卸甲",
        "建甲、斷甲修補",
        "足部凝膠上色及足部卸甲",
        "建構邏輯及不倒手建構",
        "凝膠法式設計",
        "罐裝漸層(彩膠、亮片)",
        "甲油膠漸層(彩膠、亮片)",
        "毛呢紋設計",
        "細膩蕾絲彩繪",
        "貼紙應用、星空貼應用",
        "水鑽及貼飾應用、大型飾品",
        "可卸式橢圓短延甲",
        "硬式方形長延甲",
        "全貼甲片延甲",
        "半貼甲片延甲",
        "基礎暈染技法",
        "進階暈染技法",
        "暈染液基礎應用",
        "暈染液進階應用及款式設計",
        "貓眼膠應用",
        "礦物石感(寶石、琥珀)",
        "細膩石紋設計",
        "各式素材應用 (鏡面/極光)",
        "基礎花磚技法",
        "進階花磚技法",
        "基礎花卉設計",
        "進階花卉設計",
        "油畫膠、石膏膠應用",
        "立體造型膠、軟糖膠應用",
        "沙龍實用款式設計",
        "作品拍攝、手機修圖",
        "沙龍經驗分享、價格設定",
        "檢定彩繪 (花卉/幾何)",
        "檢定考流程模擬",
      ],
    },
  },
];

export function CourseList() {
  const [active, setActive] = useState<Category>("all");
  const [openId, setOpenId] = useState<number | null>(null);

  const visible =
    active === "all"
      ? courses
      : courses.filter((c) => c.category === active);

  const openCourse = openId !== null ? courses.find((c) => c.id === openId) ?? null : null;

  // 開啟彈窗時鎖背景捲動 + 支援 Esc 關閉
  useEffect(() => {
    if (!openCourse) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [openCourse]);

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

                  {/* CTA：查看詳細課綱 */}
                  <button
                    type="button"
                    onClick={() => setOpenId(course.id)}
                    className={cn(
                      "mt-auto inline-flex items-center justify-center gap-2 text-sm font-medium rounded-full px-5 py-2.5 transition-colors",
                      course.recommended
                        ? "bg-nail-gold text-white hover:bg-nail-gold/90"
                        : "bg-nail-cream text-nail-gold hover:bg-nail-pink/50"
                    )}
                  >
                    <ListChecks size={16} />
                    查看詳細課綱 ({course.curriculum.lessons.length}{" "}
                    {course.curriculum.unit ?? "堂"})
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA：全頁唯一 LINE 報名入口 */}
        <div className="mt-14 text-center">
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-base font-medium text-white bg-nail-gold hover:bg-nail-gold/90 rounded-full px-8 py-3.5 shadow-sm transition-colors"
          >
            <MessageCircle size={18} />
            加入官方 LINE 預約諮詢
          </a>
          <p className="mt-4 text-muted-foreground">
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

      {/* 課綱詳解彈窗 */}
      <AnimatePresence>
        {openCourse && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpenId(null)}
            role="dialog"
            aria-modal="true"
            aria-label={`${openCourse.title} 課程詳解`}
          >
            {/* 背景遮罩 */}
            <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" />

            {/* 彈窗主體 */}
            <motion.div
              className="relative w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 深色 header */}
              <div className="relative bg-gradient-to-br from-nail-gold to-nail-gold-light px-6 py-7 sm:px-8 text-white">
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="關閉"
                  className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
                >
                  <X size={18} />
                </button>
                <p className="text-sm font-medium text-white/80">
                  {openCourse.title}・課程詳解
                </p>
                <h3 className="mt-1 text-2xl font-display font-bold">
                  {openCourse.curriculum.heading}
                </h3>
                <p className="mt-2 text-sm text-white/90 leading-relaxed max-w-xl">
                  {openCourse.curriculum.sub}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                  <ListChecks size={14} />
                  共 {openCourse.curriculum.lessons.length}{" "}
                  {openCourse.curriculum.unit ?? "堂"}
                  {(openCourse.curriculum.unit ?? "堂") === "堂" ? "課" : ""}
                </span>
              </div>

              {/* 白底課綱內容 */}
              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <ol className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                  {openCourse.curriculum.lessons.map((lesson, idx) => (
                    <li key={lesson} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-nail-cream text-xs font-semibold text-nail-gold">
                        {idx + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/90">
                        {lesson}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* 底部：關閉列表 + 彈窗內單一 LINE CTA */}
              <div className="flex flex-col-reverse gap-3 border-t border-nail-pink/30 bg-nail-cream/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="inline-flex items-center justify-center rounded-full border border-nail-pink/50 bg-white px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-nail-gold/50 hover:text-nail-gold"
                >
                  關閉列表
                </button>
                <a
                  href={LINE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-nail-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-nail-gold/90"
                >
                  <MessageCircle size={16} />
                  LINE 諮詢報名
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
