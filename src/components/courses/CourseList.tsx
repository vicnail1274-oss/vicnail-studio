"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Star, MessageCircle, ListChecks, X } from "lucide-react";
import { LINE_URL } from "@/lib/line";
import { cn } from "@/lib/utils";

type Category = "all" | "full" | "single" | "exam";

/** 課綱單一項目：名稱 + 時數（小時）+ 可選分段標題 */
interface Lesson {
  name: string;
  hours: number;
  /** 分段標題（如「基礎課」「進階課」），只在該段第一項標註 */
  section?: string;
}

interface Curriculum {
  heading: string;
  sub: string;
  /** 課綱項目（含時數）；編號於畫面自動生成 */
  lessons: Lesson[];
  /** 計數單位：堂 / 單元 / 主題 / 項（按鈕文字用），預設「堂」 */
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
    meta: ["共 156 小時", "46 堂", "真人實際操作考核・頒發證書"],
    highlights: [
      "包含全科班所有內容",
      "基礎 69 小時 + 進階 87 小時",
      "長短延甲、足部保養、各式素材應用",
      "暈染液、貓眼膠、石紋、花磚、花卉全系列",
      "經營實務：拍攝修圖、價格設定、設備挑選",
    ],
    audience: "目標開店、想一次學完高階技術者",
    category: "full",
    recommended: true,
    curriculum: {
      heading: "創業班全修課程項目",
      sub: "最完整的課程體系，基礎課 + 進階課，真人實際操作考核並頒發證書",
      lessons: [
        // 基礎課（69 小時・22 項）
        { section: "基礎課", name: "凝膠材料知識及產品說明", hours: 3 },
        { name: "指甲構造及問題甲辨識", hours: 3 },
        { name: "基礎色彩學及色彩搭配應用", hours: 3 },
        { name: "工具清潔、保養、消毒，凝膠筆清潔、養筆、潤筆等，及注意事項", hours: 3 },
        { name: "指甲修型", hours: 3 },
        { name: "磨甲機快速前置", hours: 3 },
        { name: "完美精緻前置", hours: 3 },
        { name: "足部深層保養", hours: 6 },
        { name: "罐裝完美單色", hours: 3 },
        { name: "甲油膠完美單色", hours: 3 },
        { name: "不傷甲凝膠卸甲（包卸、一層殘、磨甲機全卸）", hours: 3 },
        { name: "建甲、斷甲修補", hours: 3 },
        { name: "足部凝膠上色及足部卸甲", hours: 3 },
        { name: "建構邏輯及不倒手建構", hours: 3 },
        { name: "凝膠法式設計", hours: 3 },
        { name: "罐裝凝膠漸層（彩膠、亮片）", hours: 3 },
        { name: "甲油膠漸層（彩膠、亮片）", hours: 3 },
        { name: "毛呢紋設計", hours: 3 },
        { name: "細膩蕾絲彩繪", hours: 3 },
        { name: "貼紙應用、星空貼應用", hours: 3 },
        { name: "水鑽及貼飾應用、大型飾品", hours: 3 },
        { name: "檢定彩繪：愛心、格紋、五瓣尖花、五瓣水滴花、玫瑰花（額外贈送）", hours: 3 },
        // 進階課（81 小時・22 項）
        { section: "進階課", name: "可卸式橢圓短延甲（含架紙模）", hours: 6 },
        { name: "硬式方形長延甲", hours: 6 },
        { name: "全貼 甲片延甲", hours: 3 },
        { name: "半貼 甲片延甲", hours: 3 },
        { name: "基礎暈染技法（乾拍、濕暈、膠性暈染、雲霧暈染）", hours: 3 },
        { name: "進階暈染技法（層次堆疊、細節點綴）", hours: 3 },
        { name: "暈染液基礎應用", hours: 3 },
        { name: "暈染液進階應用及款式設計", hours: 3 },
        { name: "貓眼膠應用", hours: 3 },
        { name: "礦物石感（大理石、琥珀）", hours: 3 },
        { name: "細膩石紋設計（大理石、石紋肌理）", hours: 3 },
        { name: "各式素材應用（歐泊粉、金屬粉、鏡面粉、貝殼片、金箔、亮片、亮粉）", hours: 6 },
        { name: "基礎花磚技法（點、線、水滴）", hours: 3 },
        { name: "進階花磚技法（圖騰、排列、浮雕）", hours: 6 },
        { name: "基礎花卉設計", hours: 3 },
        { name: "進階花卉設計", hours: 3 },
        { name: "油畫膠、石膏膠應用", hours: 3 },
        { name: "立體造型膠、軟糖膠應用", hours: 3 },
        { name: "沙龍實用款式設計（綜合技法）", hours: 3 },
        { name: "作品拍攝、手機修圖、浮水印使用等", hours: 3 },
        { name: "沙龍經驗分享、價格設定、沙龍設備挑選", hours: 3 },
        { name: "檢定考流程：雙手手部保養、卸甲及漸層流程、得分技巧、考試規章（額外贈送）", hours: 6 },
        { name: "檢定模擬練習（額外贈送）", hours: 3 },
        { name: "檢定考規則說明（額外贈送）", hours: 3 },
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
    meta: ["共 78 小時", "24 堂", "效期 12 個月・不限次數循環複習"],
    highlights: [
      "凝膠學科 & 基礎保養",
      "單色、法式、漸層、暈染、蕾絲、孔雀紋",
      "可卸式橢圓短延甲 + 硬式方形長延甲",
      "贈送：TNA 檢定 4 堂（彩繪、流程、模擬練習、規則說明）",
      "一年內不限次數循環複習",
    ],
    audience: "零基礎、考證照、基礎不穩者",
    category: "full",
    curriculum: {
      heading: "全科班 2.0 課程項目",
      sub: "課程從第一天上課日起算，一年內不限次數循環複習；其他彩繪單元課程皆可享定價 8 折（與特惠價二選一，擇優計價）",
      lessons: [
        { name: "凝膠材料知識及產品說明", hours: 3 },
        { name: "指甲構造及問題甲辨識", hours: 3 },
        { name: "磨甲機快速前置", hours: 3 },
        { name: "建甲、斷甲修補", hours: 3 },
        { name: "不傷甲凝膠卸甲（包卸、一層殘、磨甲機全卸）", hours: 3 },
        { name: "罐裝完美單色", hours: 3 },
        { name: "甲油膠完美單色", hours: 3 },
        { name: "罐裝凝膠漸層（彩膠、亮片）", hours: 3 },
        { name: "礦物石感（大理石、琥珀）", hours: 3 },
        { name: "基礎花卉設計", hours: 3 },
        { name: "鏡面粉、礦物粉、金屬粉 操作應用", hours: 3 },
        { name: "建構邏輯及不倒手建構", hours: 3 },
        { name: "凝膠法式設計", hours: 3 },
        { name: "基礎暈染技法", hours: 3 },
        { name: "細膩蕾絲彩繪", hours: 3 },
        { name: "孔雀紋", hours: 3 },
        { name: "可卸式橢圓短延甲（含架紙模）", hours: 6 },
        { name: "硬式方形長延甲", hours: 6 },
        { name: "貼紙應用、星空貼應用", hours: 3 },
        { name: "水鑽及貼飾應用、大型飾品", hours: 3 },
        { name: "檢定彩繪：愛心、格紋、五瓣尖花、五瓣水滴花、玫瑰花", hours: 3 },
        { name: "檢定考流程：雙手手部保養、卸甲及漸層流程、得分技巧、考試規章", hours: 3 },
        { name: "檢定模擬練習", hours: 3 },
        { name: "檢定考規則說明", hours: 3 },
      ],
    },
  },
  {
    id: 3,
    badge: "技術導正",
    badgeStyle: "fix",
    title: "調整班",
    subtitle: "技術重塑・找回自信",
    price: "$29,800",
    originalPrice: "$36,000",
    meta: ["共 39 小時", "12 單元", "循環課程・3 個月不限次數複習"],
    note: "循環課程，課程開始含循環時間共 3 個月，時間內不限次數回來複習練習。限已學過的美甲師報名。",
    highlights: [
      "針對個人手法問題拆解導正",
      "精準改善操作速度與精緻度",
      "凝膠學科、基本工、彩繪技法完整重塑",
      "含可卸式橢圓短延甲與基礎暈染",
    ],
    audience: "已學過美甲、基礎不穩或想導正手法的美甲師",
    category: "full",
    curriculum: {
      heading: "調整班課程項目",
      sub: "針對執業需求進行技術矯正，課程名稱已與創業班統一",
      lessons: [
        { name: "凝膠材料知識及產品說明", hours: 3 },
        { name: "指甲構造及問題甲辨識", hours: 3 },
        { name: "磨甲機快速前置", hours: 3 },
        { name: "指甲修型", hours: 3 },
        { name: "罐裝完美單色", hours: 3 },
        { name: "甲油膠完美單色", hours: 3 },
        { name: "不傷甲凝膠卸甲（包卸、一層殘、磨甲機全卸）", hours: 3 },
        { name: "建構邏輯及不倒手建構", hours: 3 },
        { name: "凝膠法式設計", hours: 3 },
        { name: "罐裝凝膠漸層（彩膠、亮片）", hours: 3 },
        { name: "可卸式橢圓短延甲（含架紙模）", hours: 6 },
        { name: "基礎暈染技法", hours: 3 },
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
    note: "外縣市 $11,980／外島 $13,500。針對 TNA 檢定考試設計的衝刺班，重點攻略與模擬。",
    meta: ["共 12 小時", "4 堂・兩日班"],
    highlights: [
      "檢定考流程完整解析",
      "檢定彩繪重點攻略",
      "檢定模擬實戰練習",
      "檢定考規則說明",
    ],
    category: "exam",
    curriculum: {
      heading: "TNA 檢定班課程詳解",
      sub: "重點攻略與模擬，兩日完整訓練，共 4 堂各 3 小時",
      lessons: [
        { name: "檢定考流程", hours: 3 },
        { name: "檢定彩繪", hours: 3 },
        { name: "檢定模擬練習", hours: 3 },
        { name: "檢定考規則說明", hours: 3 },
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
    meta: ["每主題全日 6 小時", "8 大主題擇一"],
    highlights: [
      "可卸式橢圓短延甲・硬式方形長延甲",
      "足部深層保養",
      "凝膠暈染技巧・暈染液應用",
      "花磚技巧・各式素材應用",
    ],
    category: "single",
    curriculum: {
      heading: "一日專修 - 精選主題（擇一）",
      sub: "請從以下 8 大主題中，選擇一項進行全日（6 小時）的深度特訓",
      unit: "主題",
      lessons: [
        { name: "可卸式橢圓短延甲（含架紙模）", hours: 6 },
        { name: "硬式方形長延甲", hours: 6 },
        { name: "足部深層保養", hours: 6 },
        { name: "凝膠暈染技巧", hours: 6 },
        { name: "暈染液應用", hours: 6 },
        { name: "沙龍快速暈染款式實作", hours: 6 },
        { name: "花磚技巧", hours: 6 },
        { name: "各式素材應用", hours: 6 },
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
    meta: ["每堂 3 小時", "創業班全部單元任選一項"],
    note: "針對特定弱點，單點突破。適合想嘗試特定技術或只需單一項目進修的美甲師。",
    highlights: [
      "創業班全部課程任選單一項目",
      "基礎學科・基本工・延甲",
      "暈染、花磚、花卉、各式素材應用",
      "一對一或小班指導",
    ],
    category: "single",
    curriculum: {
      heading: "單堂選修 - 可選課程庫",
      sub: "您可以從以下創業班完整課程清單中，任選「單一項目」進行 3 小時的重點指導",
      unit: "項",
      lessons: [
        // 創業班基礎課
        { section: "基礎課", name: "凝膠材料知識及產品說明", hours: 3 },
        { name: "指甲構造及問題甲辨識", hours: 3 },
        { name: "基礎色彩學及色彩搭配應用", hours: 3 },
        { name: "工具清潔、保養、消毒，凝膠筆清潔、養筆、潤筆等，及注意事項", hours: 3 },
        { name: "指甲修型", hours: 3 },
        { name: "磨甲機快速前置", hours: 3 },
        { name: "完美精緻前置", hours: 3 },
        { name: "足部深層保養", hours: 6 },
        { name: "罐裝完美單色", hours: 3 },
        { name: "甲油膠完美單色", hours: 3 },
        { name: "不傷甲凝膠卸甲（包卸、一層殘、磨甲機全卸）", hours: 3 },
        { name: "建甲、斷甲修補", hours: 3 },
        { name: "足部凝膠上色及足部卸甲", hours: 3 },
        { name: "建構邏輯及不倒手建構", hours: 3 },
        { name: "凝膠法式設計", hours: 3 },
        { name: "罐裝凝膠漸層（彩膠、亮片）", hours: 3 },
        { name: "甲油膠漸層（彩膠、亮片）", hours: 3 },
        { name: "毛呢紋設計", hours: 3 },
        { name: "細膩蕾絲彩繪", hours: 3 },
        { name: "貼紙應用、星空貼應用", hours: 3 },
        { name: "水鑽及貼飾應用、大型飾品", hours: 3 },
        { name: "檢定彩繪：愛心、格紋、五瓣尖花、五瓣水滴花、玫瑰花", hours: 3 },
        // 創業班進階課
        { section: "進階課", name: "可卸式橢圓短延甲（含架紙模）", hours: 6 },
        { name: "硬式方形長延甲", hours: 6 },
        { name: "全貼 甲片延甲", hours: 3 },
        { name: "半貼 甲片延甲", hours: 3 },
        { name: "基礎暈染技法（乾拍、濕暈、膠性暈染、雲霧暈染）", hours: 3 },
        { name: "進階暈染技法（層次堆疊、細節點綴）", hours: 3 },
        { name: "暈染液基礎應用", hours: 3 },
        { name: "暈染液進階應用及款式設計", hours: 3 },
        { name: "貓眼膠應用", hours: 3 },
        { name: "礦物石感（大理石、琥珀）", hours: 3 },
        { name: "細膩石紋設計（大理石、石紋肌理）", hours: 3 },
        { name: "各式素材應用（歐泊粉、金屬粉、鏡面粉、貝殼片、金箔、亮片、亮粉）", hours: 6 },
        { name: "基礎花磚技法（點、線、水滴）", hours: 3 },
        { name: "進階花磚技法（圖騰、排列、浮雕）", hours: 6 },
        { name: "基礎花卉設計", hours: 3 },
        { name: "進階花卉設計", hours: 3 },
        { name: "油畫膠、石膏膠應用", hours: 3 },
        { name: "立體造型膠、軟糖膠應用", hours: 3 },
        { name: "沙龍實用款式設計（綜合技法）", hours: 3 },
        { name: "作品拍攝、手機修圖、浮水印使用等", hours: 3 },
        { name: "沙龍經驗分享、價格設定、沙龍設備挑選", hours: 3 },
        { name: "檢定考流程：雙手手部保養、卸甲及漸層流程、得分技巧、考試規章", hours: 6 },
      ],
    },
  },
];

/** 課綱總時數（小時） */
function totalHours(c: Curriculum): number {
  return c.lessons.reduce((sum, l) => sum + l.hours, 0);
}

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
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                    <ListChecks size={14} />
                    共 {openCourse.curriculum.lessons.length}{" "}
                    {openCourse.curriculum.unit ?? "堂"}
                    {(openCourse.curriculum.unit ?? "堂") === "堂" ? "課" : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
                    <Clock size={14} />
                    共 {totalHours(openCourse.curriculum)} 小時
                  </span>
                </div>
              </div>

              {/* 白底課綱內容 */}
              <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                <ol className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
                  {openCourse.curriculum.lessons.map((lesson, idx) => (
                    <li
                      key={`${lesson.name}-${idx}`}
                      className={cn(
                        lesson.section && idx !== 0 && "md:col-span-2"
                      )}
                    >
                      {lesson.section && (
                        <p
                          className={cn(
                            "mb-2 flex items-center gap-2 text-sm font-semibold text-nail-gold",
                            idx !== 0 && "mt-4 border-t border-nail-pink/30 pt-4"
                          )}
                        >
                          <span className="h-3 w-1 rounded-full bg-nail-gold" />
                          {lesson.section}
                        </p>
                      )}
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-nail-cream text-xs font-semibold text-nail-gold">
                          {idx + 1}
                        </span>
                        <span className="flex-1 text-sm leading-relaxed text-foreground/90">
                          {lesson.name}
                          <span className="ml-1.5 inline-flex items-center rounded-full bg-nail-cream px-1.5 py-0.5 text-xs font-medium text-nail-gold">
                            {lesson.hours === 6 ? "一日班 6h" : `${lesson.hours}h`}
                          </span>
                        </span>
                      </div>
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
