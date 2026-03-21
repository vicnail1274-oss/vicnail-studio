"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ---- Color data ----
type Season = "spring" | "summer" | "fall" | "winter";

interface NailColor {
  name: string;
  nameZh: string;
  hex: string;
  season: Season;
}

const seasonLabel: Record<Season, { en: string; zh: string }> = {
  spring: { en: "Spring", zh: "春" },
  summer: { en: "Summer", zh: "夏" },
  fall: { en: "Fall", zh: "秋" },
  winter: { en: "Winter", zh: "冬" },
};

const seasonBadge: Record<Season, string> = {
  spring: "bg-pink-100 text-pink-700",
  summer: "bg-sky-100 text-sky-700",
  fall: "bg-amber-100 text-amber-700",
  winter: "bg-indigo-100 text-indigo-700",
};

type Undertone = "warm" | "cool" | "neutral";
type Depth = "light" | "medium" | "dark";

const colorDatabase: Record<Undertone, Record<Depth, NailColor[]>> = {
  warm: {
    light: [
      { name: "Peachy Coral", nameZh: "蜜桃珊瑚", hex: "#FF8B6B", season: "spring" },
      { name: "Rose Gold", nameZh: "玫瑰金", hex: "#B76E79", season: "spring" },
      { name: "Champagne Nude", nameZh: "香檳裸色", hex: "#E8C99A", season: "summer" },
      { name: "Soft Peach", nameZh: "柔桃色", hex: "#FFCBA4", season: "spring" },
      { name: "Warm Blush", nameZh: "暖莓粉", hex: "#F4A7B9", season: "summer" },
      { name: "Butter Yellow", nameZh: "奶油黃", hex: "#F9E07F", season: "spring" },
      { name: "Terracotta Nude", nameZh: "陶土裸色", hex: "#C78B6B", season: "fall" },
      { name: "Vintage Rose", nameZh: "復古玫瑰", hex: "#C9857E", season: "fall" },
    ],
    medium: [
      { name: "Burnt Sienna", nameZh: "燒赭石", hex: "#C24E2C", season: "fall" },
      { name: "Warm Caramel", nameZh: "暖焦糖", hex: "#C47222", season: "fall" },
      { name: "Terracotta", nameZh: "陶土橘", hex: "#E07049", season: "fall" },
      { name: "Golden Honey", nameZh: "金蜂蜜", hex: "#D4A017", season: "fall" },
      { name: "Deep Coral", nameZh: "深珊瑚", hex: "#E05C47", season: "summer" },
      { name: "Warm Plum", nameZh: "暖李子", hex: "#8B4560", season: "winter" },
      { name: "Olive Mist", nameZh: "橄欖霧", hex: "#8B8544", season: "fall" },
      { name: "Spiced Wine", nameZh: "香料紅酒", hex: "#7A2C3E", season: "winter" },
    ],
    dark: [
      { name: "Warm Espresso", nameZh: "暖濃縮咖啡", hex: "#3C1A10", season: "fall" },
      { name: "Golden Bronze", nameZh: "黃金銅", hex: "#A05C2C", season: "fall" },
      { name: "Deep Burgundy", nameZh: "深勃根地", hex: "#6B1A2E", season: "winter" },
      { name: "Copper Glow", nameZh: "銅光", hex: "#B87333", season: "fall" },
      { name: "Rich Terracotta", nameZh: "濃陶土", hex: "#C0522A", season: "fall" },
      { name: "Forest Ember", nameZh: "森林餘燼", hex: "#3E5B2E", season: "fall" },
      { name: "Warm Black", nameZh: "暖黑", hex: "#1C1210", season: "winter" },
      { name: "Amber Dusk", nameZh: "琥珀暮色", hex: "#8B4A0A", season: "fall" },
    ],
  },
  cool: {
    light: [
      { name: "Lavender Mist", nameZh: "薰衣草霧", hex: "#C8B0E0", season: "spring" },
      { name: "Icy Baby Blue", nameZh: "冰水藍", hex: "#B0D4E8", season: "summer" },
      { name: "Soft Mauve", nameZh: "柔莫夫", hex: "#C4949C", season: "spring" },
      { name: "Cool Nude", nameZh: "冷調裸色", hex: "#D4BCC4", season: "summer" },
      { name: "Lilac Dream", nameZh: "丁香夢", hex: "#B89CC8", season: "spring" },
      { name: "Silver Mist", nameZh: "銀霧", hex: "#C0C8D4", season: "winter" },
      { name: "Mint Whisper", nameZh: "薄荷耳語", hex: "#AADACE", season: "summer" },
      { name: "Powder Pink", nameZh: "粉末粉", hex: "#F0C0CC", season: "spring" },
    ],
    medium: [
      { name: "Deep Plum", nameZh: "深紫李", hex: "#5E2D50", season: "winter" },
      { name: "Navy Sky", nameZh: "海軍天空藍", hex: "#2C4470", season: "winter" },
      { name: "Cool Rose", nameZh: "冷調玫瑰", hex: "#C0546E", season: "summer" },
      { name: "Violet Ice", nameZh: "紫羅蘭冰", hex: "#7860C4", season: "winter" },
      { name: "Steel Blue", nameZh: "鋼鐵藍", hex: "#4A7090", season: "winter" },
      { name: "Dusty Rose", nameZh: "霧玫瑰", hex: "#C4808E", season: "fall" },
      { name: "Cobalt Touch", nameZh: "鈷藍觸感", hex: "#1C4CA0", season: "winter" },
      { name: "Mauve Shadow", nameZh: "莫夫暗影", hex: "#8E606E", season: "fall" },
    ],
    dark: [
      { name: "Midnight Berry", nameZh: "午夜漿果", hex: "#3C1048", season: "winter" },
      { name: "Royal Purple", nameZh: "皇家紫", hex: "#4A1870", season: "winter" },
      { name: "Electric Blue", nameZh: "電光藍", hex: "#0040A0", season: "winter" },
      { name: "Black Cherry", nameZh: "黑櫻桃", hex: "#3C0820", season: "winter" },
      { name: "Deep Emerald", nameZh: "深祖母綠", hex: "#0A4028", season: "winter" },
      { name: "Icy Silver", nameZh: "冰銀", hex: "#888EA8", season: "winter" },
      { name: "Onyx Black", nameZh: "縞瑪瑙黑", hex: "#18181C", season: "winter" },
      { name: "Cobalt Night", nameZh: "鈷藍之夜", hex: "#0C2060", season: "winter" },
    ],
  },
  neutral: {
    light: [
      { name: "Blush Nude", nameZh: "緋紅裸色", hex: "#F0C4CC", season: "spring" },
      { name: "Soft Taupe", nameZh: "柔褐灰", hex: "#C4B4A4", season: "fall" },
      { name: "Warm White", nameZh: "暖白", hex: "#F8F0E8", season: "summer" },
      { name: "Rose Quartz", nameZh: "玫瑰石英", hex: "#E8AABB", season: "spring" },
      { name: "Opal Shimmer", nameZh: "蛋白石光澤", hex: "#D8E4E0", season: "summer" },
      { name: "Latte Nude", nameZh: "拿鐵裸色", hex: "#D4B4A0", season: "fall" },
      { name: "Soft Lilac", nameZh: "柔紫丁香", hex: "#CCC0D4", season: "spring" },
      { name: "Petal Pink", nameZh: "花瓣粉", hex: "#F4C0C8", season: "spring" },
    ],
    medium: [
      { name: "Mauve Taupe", nameZh: "莫夫褐灰", hex: "#A07888", season: "fall" },
      { name: "Dusty Plum", nameZh: "霧感李子", hex: "#906080", season: "fall" },
      { name: "Mocha Brown", nameZh: "摩卡棕", hex: "#7C5040", season: "fall" },
      { name: "Cranberry", nameZh: "蔓越莓", hex: "#C0304A", season: "fall" },
      { name: "Sage Green", nameZh: "鼠尾草綠", hex: "#8CA082", season: "fall" },
      { name: "Rosewood", nameZh: "玫瑰木", hex: "#B05868", season: "summer" },
      { name: "Teal Mist", nameZh: "青綠霧", hex: "#5A8C8A", season: "summer" },
      { name: "Warm Gold", nameZh: "暖金", hex: "#C4943C", season: "fall" },
    ],
    dark: [
      { name: "Deep Wine", nameZh: "深紅酒", hex: "#5A1A28", season: "winter" },
      { name: "Plum Noir", nameZh: "黑李子", hex: "#4A1C48", season: "winter" },
      { name: "Forest Night", nameZh: "森林之夜", hex: "#1E3828", season: "winter" },
      { name: "Bronze Dark", nameZh: "暗銅色", hex: "#6E4018", season: "fall" },
      { name: "Chocolate", nameZh: "巧克力", hex: "#3C1C10", season: "fall" },
      { name: "Bold Red", nameZh: "大紅", hex: "#C01828", season: "winter" },
      { name: "Midnight Teal", nameZh: "午夜青", hex: "#1A3C3E", season: "winter" },
      { name: "Graphite", nameZh: "石墨", hex: "#3C3C44", season: "winter" },
    ],
  },
};

// ---- Component ----

export default function NailColorMatcherPage() {
  const [undertone, setUndertone] = useState<Undertone | null>(null);
  const [depth, setDepth] = useState<Depth | null>(null);
  const [lang, setLang] = useState<"zh" | "en">("zh");

  const isZh = lang === "zh";
  const colors =
    undertone && depth ? colorDatabase[undertone][depth] : null;

  const undertoneOptions: { value: Undertone; labelZh: string; labelEn: string; desc: string; descEn: string }[] = [
    {
      value: "warm",
      labelZh: "暖調",
      labelEn: "Warm",
      desc: "黃/橙/紅感，陽光自然",
      descEn: "Yellow / peachy / golden undertones",
    },
    {
      value: "cool",
      labelZh: "冷調",
      labelEn: "Cool",
      desc: "粉/藍/紫感，白皙透亮",
      descEn: "Pink / blue / purple undertones",
    },
    {
      value: "neutral",
      labelZh: "中性",
      labelEn: "Neutral",
      desc: "暖冷混合，百搭好選",
      descEn: "Mix of warm and cool tones",
    },
  ];

  const depthOptions: { value: Depth; labelZh: string; labelEn: string; desc: string; descEn: string }[] = [
    { value: "light", labelZh: "淺膚色", labelEn: "Light", desc: "瓷白～象牙白", descEn: "Fair to ivory" },
    { value: "medium", labelZh: "中膚色", labelEn: "Medium", desc: "小麥～蜂蜜色", descEn: "Wheat to honey" },
    { value: "dark", labelZh: "深膚色", labelEn: "Dark", desc: "咖啡～深棕色", descEn: "Caramel to espresso" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-nail-cream/40 to-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setLang(isZh ? "en" : "zh")}
              className="text-xs px-3 py-1 rounded-full border border-gray-200 text-muted-foreground hover:bg-gray-50"
            >
              {isZh ? "EN" : "中文"}
            </button>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            {isZh ? "膚色配色推薦" : "Nail Color Matcher"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isZh
              ? "選擇你的膚色，找到最適合你的美甲配色"
              : "Select your skin tone to find the perfect nail colors"}
          </p>
        </div>

        {/* Step 1: Undertone */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isZh ? "Step 1 — 選擇肌膚色調" : "Step 1 — Choose Your Undertone"}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {undertoneOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setUndertone(opt.value);
                }}
                className={cn(
                  "rounded-xl p-4 border-2 text-center transition-all duration-200",
                  undertone === opt.value
                    ? "border-nail-gold bg-nail-gold/10"
                    : "border-gray-100 bg-white hover:border-nail-gold/40 hover:bg-nail-cream/30"
                )}
              >
                <div className="font-bold text-foreground text-sm md:text-base">
                  {isZh ? opt.labelZh : opt.labelEn}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {isZh ? opt.desc : opt.descEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Depth */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {isZh ? "Step 2 — 選擇膚色深淺" : "Step 2 — Choose Your Skin Depth"}
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {depthOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDepth(opt.value)}
                className={cn(
                  "rounded-xl p-4 border-2 text-center transition-all duration-200",
                  depth === opt.value
                    ? "border-nail-gold bg-nail-gold/10"
                    : "border-gray-100 bg-white hover:border-nail-gold/40 hover:bg-nail-cream/30"
                )}
              >
                <div className="font-bold text-foreground text-sm md:text-base">
                  {isZh ? opt.labelZh : opt.labelEn}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {isZh ? opt.desc : opt.descEn}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {colors ? (
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {isZh ? "推薦配色" : "Recommended Colors"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {colors.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Color swatch */}
                  <div
                    className="h-20 w-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="p-3">
                    <div className="font-semibold text-xs text-foreground leading-tight mb-1">
                      {isZh ? color.nameZh : color.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mb-2">
                      {color.hex}
                    </div>
                    <span
                      className={cn(
                        "inline-block text-[10px] px-2 py-0.5 rounded-full font-medium",
                        seasonBadge[color.season]
                      )}
                    >
                      {isZh
                        ? seasonLabel[color.season].zh
                        : seasonLabel[color.season].en}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {isZh
                ? "以上顏色為建議參考，實際效果因個人肌膚與燈光而異"
                : "Colors are suggestions; actual results may vary by lighting and skin condition"}
            </p>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {isZh
              ? "請完成以上兩步選擇，即可查看推薦配色"
              : "Complete both steps above to see your color recommendations"}
          </div>
        )}
      </div>
    </div>
  );
}
