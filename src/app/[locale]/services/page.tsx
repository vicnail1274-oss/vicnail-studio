import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  BreadcrumbListJsonLd,
  NailServicesJsonLd,
} from "@/components/seo/JsonLd";
import { ServiceCard, type ServiceData } from "@/components/services/ServiceCard";
import { BookingCTA } from "@/components/services/BookingCTA";
import { WhyChooseUs } from "@/components/services/WhyChooseUs";
import { FAQ } from "@/components/services/FAQ";
import { Sparkles, Clock, Star, MapPin, Phone } from "lucide-react";

const BASE_URL = "https://vicnail-studio.com";

type Locale = "zh-TW" | "en";

// ── Service data ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    slug: "gel-nails",
    icon: "💅",
    zh: {
      title: "凝膠美甲",
      subtitle: "Gel Nail Art",
      description:
        "日本頂級凝膠品牌，持色 3–4 週不脫落。提供素色、法式、漸層、立體彩繪等豐富款式，讓指尖成為個人風格的延伸。",
      keywords: ["凝膠指甲", "凝膠美甲", "台北美甲", "凝膠美甲推薦"],
      duration: "90–120 分鐘",
      highlight: "持色 3-4 週",
      price: "NT$ 800 起",
      details: [
        "素色 / 法式 / 漸層多種款式可選",
        "使用日本 PREGEL、LEAFGEL 等頂級品牌",
        "含甲面處理、指緣保養與塗抹",
        "提供顏色試片，現場挑選不煩惱",
      ],
    },
    en: {
      title: "Gel Nail Art",
      subtitle: "Professional Gel Manicure",
      description:
        "Premium Japanese gel brands with 3–4 week color retention. Solid colors, French tips, gradients, 3D nail art — we do it all with precision and care.",
      keywords: [
        "gel nails",
        "gel manicure Taipei",
        "nail art",
        "gel nail salon",
      ],
      duration: "90–120 min",
      highlight: "3–4 Week Hold",
      price: "From NT$ 800",
      details: [
        "Solid, French, gradient and more styles",
        "Japanese PREGEL, LEAFGEL premium brands",
        "Includes nail prep, cuticle care & application",
        "Color swatches available for in-person selection",
      ],
    },
  },
  {
    slug: "japanese-nail-art",
    icon: "🌸",
    zh: {
      title: "日式美甲彩繪",
      subtitle: "Japanese Nail Art",
      description:
        "細膩手繪工藝，從花卉到幾何、繁複到極簡，每款設計均由專業美甲師親手完成。獨一無二的指尖藝術。",
      keywords: ["日式美甲", "美甲彩繪", "手繪美甲", "台北日式美甲"],
      duration: "120–180 分鐘",
      highlight: "全手工設計",
      price: "NT$ 1,200 起",
      details: [
        "花卉、幾何、和風等多元風格",
        "全手繪彩繪，非貼紙轉印",
        "可參考圖片或量身設計專屬款式",
        "搭配高品質裝飾：鏡面粉、金箔、貝殼片",
      ],
    },
    en: {
      title: "Japanese Nail Art",
      subtitle: "Hand-Painted Nail Designs",
      description:
        "Intricate hand-painted designs — florals, geometrics, minimalist art. Each piece is uniquely crafted by our professional nail artist.",
      keywords: [
        "Japanese nail art",
        "hand-painted nails",
        "nail design",
        "Taipei nail salon",
      ],
      duration: "120–180 min",
      highlight: "100% Hand-Crafted",
      price: "From NT$ 1,200",
      details: [
        "Florals, geometric, Japanese-style & more",
        "Fully hand-painted — no stickers or transfers",
        "Custom design from reference photos",
        "Premium charms: mirror powder, gold foil, shell",
      ],
    },
  },
  {
    slug: "gel-extensions",
    icon: "💎",
    zh: {
      title: "凝膠延甲",
      subtitle: "Gel Nail Extensions",
      description:
        "使用頂級凝膠延甲技術，打造自然修長的指甲外形。可搭配彩繪設計，持久牢固不易斷裂。適合短甲想留長的客人。",
      keywords: ["凝膠延甲", "延甲", "台北延甲", "凝膠美甲延甲"],
      duration: "120–150 分鐘",
      highlight: "自然修長",
      price: "NT$ 1,500 起",
      details: [
        "紙模 / 快速延甲兩種技術可選",
        "可搭配任何彩繪或裝飾設計",
        "自然弧度，薄透不厚重",
        "適合自甲過短、想嘗試長甲造型的客人",
      ],
    },
    en: {
      title: "Gel Nail Extensions",
      subtitle: "Sculpted Gel Extensions",
      description:
        "Premium gel extensions for naturally elongated nails. Durable, chip-resistant, and combinable with any nail art design. Perfect for short nails.",
      keywords: [
        "gel extensions",
        "nail extensions",
        "sculpted nails",
        "Taipei nail extensions",
      ],
      duration: "120–150 min",
      highlight: "Natural Length",
      price: "From NT$ 1,500",
      details: [
        "Paper form or quick-extend tip options",
        "Combinable with any art or embellishment",
        "Natural arch, thin and lightweight finish",
        "Perfect for short nails wanting extra length",
      ],
    },
  },
  {
    slug: "gel-polish",
    icon: "✨",
    zh: {
      title: "凝膠指甲油",
      subtitle: "Gel Polish Manicure",
      description:
        "保留自然甲，用 UV 固化凝膠打造亮澤光滑的色彩質感。不傷甲面、快速完成，適合日常上班族與初學者。",
      keywords: ["凝膠指甲油", "凝膠美甲", "不傷甲美甲", "自然甲美甲"],
      duration: "60–90 分鐘",
      highlight: "不傷天然甲",
      price: "NT$ 600 起",
      details: [
        "保留自然甲，不需要磨甲",
        "UV/LED 快速固化，光澤持久",
        "超過 200 色可選",
        "最適合首次嘗試美甲的客人",
      ],
    },
    en: {
      title: "Gel Polish",
      subtitle: "Chip-Free Color Manicure",
      description:
        "Long-lasting gel polish on natural nails. UV-cured for a glossy, chip-free finish without damage. Fast, sleek, and perfect for everyday wear.",
      keywords: [
        "gel polish",
        "no-chip manicure",
        "natural nail gel",
        "Taiwan nail salon",
      ],
      duration: "60–90 min",
      highlight: "No Nail Damage",
      price: "From NT$ 600",
      details: [
        "Natural nail preserved — no filing required",
        "UV/LED quick-cure, long-lasting shine",
        "200+ colors available",
        "Best for first-time nail clients",
      ],
    },
  },
  {
    slug: "manicure-pedicure",
    icon: "🦶",
    zh: {
      title: "手足保養護理",
      subtitle: "Manicure & Pedicure",
      description:
        "從角質軟化到保濕按摩，完整的手足護理療程讓你煥然一新。可搭配凝膠美甲，享受一站式美甲體驗。",
      keywords: ["手部護理", "足部護理", "美足", "台北美甲保養"],
      duration: "60–90 分鐘",
      highlight: "完整護理療程",
      price: "NT$ 700 起",
      details: [
        "角質軟化與清除",
        "甲面修整與指緣護理",
        "精油保濕按摩",
        "可加購凝膠美甲享一站式服務",
      ],
    },
    en: {
      title: "Manicure & Pedicure",
      subtitle: "Hand & Foot Care",
      description:
        "Cuticle care, exfoliation, moisturizing massage — full hand and foot treatment to rejuvenate your skin. Combinable with gel nails.",
      keywords: ["manicure", "pedicure", "hand care", "foot care Taipei"],
      duration: "60–90 min",
      highlight: "Full Spa Treatment",
      price: "From NT$ 700",
      details: [
        "Cuticle softening & removal",
        "Nail shaping & cuticle grooming",
        "Essential oil moisturizing massage",
        "Add gel nails for a full-service experience",
      ],
    },
  },
  {
    slug: "nail-removal",
    icon: "🔧",
    zh: {
      title: "卸甲服務",
      subtitle: "Nail Removal",
      description:
        "專業安全卸甲，不傷真甲。無論是凝膠美甲還是水晶甲，均使用溫和配方，保護指甲健康。",
      keywords: ["卸甲", "安全卸甲", "凝膠卸除", "台北卸甲服務"],
      duration: "30–45 分鐘",
      highlight: "零損傷工法",
      price: "NT$ 200 起",
      details: [
        "溫和卸除配方，不傷天然甲",
        "適用凝膠 / 水晶 / 光療甲",
        "卸甲後提供指甲保養護理",
        "搭配新做美甲可享折扣",
      ],
    },
    en: {
      title: "Nail Removal",
      subtitle: "Safe & Gentle Soak-Off",
      description:
        "Safe, professional removal of gel nails or acrylic nails using gentle formulas that protect your natural nails.",
      keywords: [
        "nail removal",
        "gel removal",
        "soak off nails",
        "Taipei nail salon",
      ],
      duration: "30–45 min",
      highlight: "Zero Damage Method",
      price: "From NT$ 200",
      details: [
        "Gentle formula that protects natural nails",
        "Works with gel, acrylic & UV polish",
        "Post-removal nail conditioning included",
        "Discounts when combined with new service",
      ],
    },
  },
  {
    slug: "nail-courses",
    icon: "🎓",
    zh: {
      title: "美甲教學課程",
      subtitle: "Professional Nail Courses",
      description:
        "Vic Nail Academy 提供全科班、創業班、單堂進修。承諾學會為止，無限複習跟課。從零基礎到沙龍開業一條龍。",
      keywords: ["美甲課程", "美甲學校", "美甲證照", "台北美甲教學"],
      duration: "依課程",
      highlight: "承諾學會為止",
    },
    en: {
      title: "Nail Courses",
      subtitle: "Vic Nail Academy",
      description:
        "Full curriculum, entrepreneur tracks, and single-day intensives. Our 'learn until you master it' policy means unlimited review sessions.",
      keywords: [
        "nail course",
        "nail school",
        "nail certification",
        "Taiwan nail academy",
      ],
      duration: "Per course",
      highlight: "Master-It Guarantee",
    },
  },
];

// ── SEO metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh-TW";

  return {
    title: isZh ? "美甲服務項目" : "Nail Services",
    description: isZh
      ? "VicNail Studio 專業美甲服務：凝膠指甲、日式彩繪、光療指甲、手足護理、卸甲服務。台北專業美甲，品質保證。立即 LINE 預約！"
      : "VicNail Studio nail services: gel nails, Japanese nail art, gel polish, manicure & pedicure, nail removal. Professional nail salon in Taipei. Book via LINE!",
    keywords: isZh
      ? [
          "美甲服務",
          "台北美甲",
          "凝膠指甲",
          "日式美甲",
          "光療指甲",
          "手足保養",
          "美甲推薦",
          "美甲預約",
        ]
      : [
          "nail salon",
          "gel nails",
          "Japanese nail art",
          "Taipei nail salon",
          "gel polish",
          "manicure",
          "book nail appointment",
        ],
    openGraph: {
      title: isZh
        ? "VicNail Studio — 美甲服務項目"
        : "VicNail Studio — Nail Services",
      description: isZh
        ? "專業凝膠美甲、日式彩繪、光療指甲與手足護理。品質保證，LINE 立即預約！"
        : "Professional gel nails, Japanese nail art, gel polish & hand care in Taipei. Book now via LINE!",
      url: `${BASE_URL}/${locale}/services`,
      type: "website",
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/services`,
      languages: {
        "zh-TW": `${BASE_URL}/zh-TW/services`,
        en: `${BASE_URL}/en/services`,
      },
    },
  };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh-TW";

  const breadcrumbs = [
    { name: isZh ? "首頁" : "Home", url: `${BASE_URL}/${locale}` },
    {
      name: isZh ? "服務項目" : "Services",
      url: `${BASE_URL}/${locale}/services`,
    },
  ];

  const schemaServices = SERVICES.map((s) => {
    const t = isZh ? s.zh : s.en;
    return {
      name: t.title,
      description: t.description,
      url: `${BASE_URL}/${locale}/services#${s.slug}`,
    };
  });

  const serviceCards: ServiceData[] = SERVICES.map((s) => {
    const t = isZh ? s.zh : s.en;
    return {
      slug: s.slug,
      icon: s.icon,
      title: t.title,
      subtitle: t.subtitle,
      description: t.description,
      duration: t.duration,
      highlight: t.highlight,
      price: "price" in t ? (t as { price: string }).price : undefined,
      details: "details" in t ? (t as { details: string[] }).details : undefined,
    };
  });

  return (
    <>
      {/* JSON-LD */}
      <BreadcrumbListJsonLd items={breadcrumbs} />
      <NailServicesJsonLd
        locale={locale as Locale}
        services={schemaServices}
        pageUrl={`${BASE_URL}/${locale}/services`}
      />

      {/* Floating Booking CTA */}
      <BookingCTA isZh={isZh} />

      {/* Hero */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-nail-cream via-nail-blush/30 to-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-nail-pink/20 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-nail-gold font-medium mb-4">
            VicNail Studio
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
            {isZh ? "美甲服務項目" : "Nail Services"}
          </h1>
          <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isZh
              ? "從日常光療到精細彩繪，每一款服務都由專業美甲師親手完成，為您的指尖注入個性與品味。"
              : "From everyday gel polish to intricate nail art — every service is crafted by our professional nail artists with precision and care."}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-nail-gold fill-nail-gold" />
              {isZh ? "專業認證技師" : "Certified Artists"}
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-nail-gold" />
              {isZh ? "日本頂級材料" : "Premium Japanese Products"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-nail-gold" />
              {isZh ? "彈性預約時間" : "Flexible Booking"}
            </span>
          </div>

          {/* Hero CTA */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="https://line.me/ti/p/vicnail_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#06C755] text-white text-base font-semibold hover:bg-[#05b04c] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              💬 {isZh ? "LINE 立即預約" : "Book via LINE"}
            </a>
            <a
              href="#services-grid"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-nail-gold text-base font-semibold border-2 border-nail-gold/30 hover:border-nail-gold hover:bg-nail-cream transition-all duration-200"
            >
              {isZh ? "瀏覽全部服務" : "View All Services"}
            </a>
          </div>
        </div>
      </section>

      {/* Service Grid */}
      <section id="services-grid" className="py-16 px-4 bg-nail-cream/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              {isZh ? "全部服務項目" : "Our Services"}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isZh
                ? "點擊服務卡片查看詳情，找到最適合你的美甲方案。"
                : "Browse our services and find the perfect nail treatment for you."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCards.map((service) => (
              <ServiceCard
                key={service.slug}
                service={service}
                isZh={isZh}
                isCourse={service.slug === "nail-courses"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseUs isZh={isZh} />

      {/* Process Section */}
      <section className="py-16 px-4 bg-nail-cream/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">
              {isZh ? "預約流程" : "How to Book"}
            </h2>
            <p className="text-muted-foreground">
              {isZh
                ? "簡單四步驟，輕鬆完成預約。"
                : "Four simple steps to your perfect nail appointment."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(isZh
              ? [
                  {
                    step: "01",
                    title: "LINE 聯繫",
                    desc: "加入官方 LINE，傳送您想做的款式或需求。",
                  },
                  {
                    step: "02",
                    title: "確認時段",
                    desc: "美甲師與您確認服務內容與預約時間。",
                  },
                  {
                    step: "03",
                    title: "到店服務",
                    desc: "準時到店，享受專屬的一對一美甲服務。",
                  },
                  {
                    step: "04",
                    title: "美甲完成",
                    desc: "拍照留念！我們提供完整的保養建議。",
                  },
                ]
              : [
                  {
                    step: "01",
                    title: "Contact via LINE",
                    desc: "Add us on LINE and share your desired style or needs.",
                  },
                  {
                    step: "02",
                    title: "Confirm Slot",
                    desc: "We'll confirm service details and appointment time.",
                  },
                  {
                    step: "03",
                    title: "Visit Studio",
                    desc: "Arrive on time for your private one-on-one session.",
                  },
                  {
                    step: "04",
                    title: "Nails Done!",
                    desc: "Photo time! We'll share aftercare tips with you.",
                  },
                ]
            ).map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-nail-gold/10 text-nail-gold text-lg font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ isZh={isZh} />

      {/* Bottom CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-nail-cream/50 to-nail-blush/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            {isZh ? "準備好預約了嗎？" : "Ready to Book?"}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            {isZh
              ? "有任何疑問或想了解更多服務細節？歡迎透過 LINE 或 Instagram 與我們聯繫，我們會盡快回覆。"
              : "Questions or want to learn more about our services? Reach out via LINE or Instagram — we'll get back to you soon."}
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://line.me/ti/p/vicnail_studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#06C755] text-white text-base font-semibold hover:bg-[#05b04c] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              💬 {isZh ? "LINE 立即預約" : "Book via LINE"}
            </a>
            <a
              href="https://www.instagram.com/vicnail_studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-nail-gold text-white text-base font-semibold hover:bg-nail-gold/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              📷 {isZh ? "Instagram 私訊" : "DM on Instagram"}
            </a>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-nail-gold" />
              {isZh ? "通常 24 小時內回覆" : "Usually replies within 24h"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-nail-gold" />
              {isZh ? "台北市 · 捷運可達" : "Taipei · Metro Accessible"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-nail-gold" />
              {isZh ? "歡迎先詢問再預約" : "Feel free to ask before booking"}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
