import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { BreadcrumbListJsonLd, NailServicesJsonLd } from "@/components/seo/JsonLd";
import { Link } from "@/i18n/navigation";
import { Sparkles, Clock, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = "https://vicnail-studio.com";

type Locale = "zh-TW" | "en";

// ── Service data ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    slug: "gel-nails",
    icon: "💅",
    zh: {
      title: "凝膠指甲",
      subtitle: "Gel Nail Art",
      description:
        "日本頂級凝膠品牌，持色 3–4 週不脫落。提供素色、法式、漸層、立體彩繪等豐富款式，讓指尖成為個人風格的延伸。",
      keywords: ["凝膠指甲", "光療指甲", "台北美甲", "凝膠美甲推薦"],
      duration: "90–120 分鐘",
      highlight: "持色 3-4 週",
    },
    en: {
      title: "Gel Nail Art",
      subtitle: "Professional Gel Manicure",
      description:
        "Premium Japanese gel brands with 3–4 week color retention. Solid colors, French tips, gradients, 3D nail art — we do it all with precision and care.",
      keywords: ["gel nails", "gel manicure Taipei", "nail art", "gel nail salon"],
      duration: "90–120 min",
      highlight: "3–4 Week Hold",
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
    },
    en: {
      title: "Japanese Nail Art",
      subtitle: "Hand-Painted Nail Designs",
      description:
        "Intricate hand-painted designs — florals, geometrics, minimalist art. Each piece is uniquely crafted by our professional nail artist.",
      keywords: ["Japanese nail art", "hand-painted nails", "nail design", "Taipei nail salon"],
      duration: "120–180 min",
      highlight: "100% Hand-Crafted",
    },
  },
  {
    slug: "gel-polish",
    icon: "✨",
    zh: {
      title: "光療指甲",
      subtitle: "Gel Polish Manicure",
      description:
        "保留自然甲，用 UV 固化光療膠打造亮澤光滑的色彩質感。不傷甲面、快速完成，適合日常上班族與初學者。",
      keywords: ["光療指甲", "凝膠指甲油", "不傷甲美甲", "自然甲美甲"],
      duration: "60–90 分鐘",
      highlight: "不傷天然甲",
    },
    en: {
      title: "Gel Polish",
      subtitle: "Chip-Free Color Manicure",
      description:
        "Long-lasting gel polish on natural nails. UV-cured for a glossy, chip-free finish without damage. Fast, sleek, and perfect for everyday wear.",
      keywords: ["gel polish", "no-chip manicure", "natural nail gel", "Taiwan nail salon"],
      duration: "60–90 min",
      highlight: "No Nail Damage",
    },
  },
  {
    slug: "manicure-pedicure",
    icon: "🦶",
    zh: {
      title: "手足保養護理",
      subtitle: "Manicure & Pedicure",
      description:
        "從角質軟化到保濕按摩，完整的手足護理療程讓你煥然一新。可搭配凝膠或光療，享受一站式美甲體驗。",
      keywords: ["手部護理", "足部護理", "美足", "台北美甲保養"],
      duration: "60–90 分鐘",
      highlight: "完整護理療程",
    },
    en: {
      title: "Manicure & Pedicure",
      subtitle: "Hand & Foot Care",
      description:
        "Cuticle care, exfoliation, moisturizing massage — full hand and foot treatment to rejuvenate your skin. Combinable with gel or gel polish.",
      keywords: ["manicure", "pedicure", "hand care", "foot care Taipei"],
      duration: "60–90 min",
      highlight: "Full Spa Treatment",
    },
  },
  {
    slug: "nail-removal",
    icon: "🔧",
    zh: {
      title: "卸甲服務",
      subtitle: "Nail Removal",
      description:
        "專業安全卸甲，不傷真甲。無論是凝膠、光療膠還是水晶甲，均使用溫和配方，保護指甲健康。",
      keywords: ["卸甲", "安全卸甲", "凝膠卸除", "台北卸甲服務"],
      duration: "30–45 分鐘",
      highlight: "零損傷工法",
    },
    en: {
      title: "Nail Removal",
      subtitle: "Safe & Gentle Soak-Off",
      description:
        "Safe, professional removal of gel, gel polish, or acrylic nails using gentle formulas that protect your natural nails.",
      keywords: ["nail removal", "gel removal", "soak off nails", "Taipei nail salon"],
      duration: "30–45 min",
      highlight: "Zero Damage Method",
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
      keywords: ["nail course", "nail school", "nail certification", "Taiwan nail academy"],
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
      ? "VicNail Studio 專業美甲服務：凝膠指甲、日式彩繪、光療指甲、手足護理、卸甲服務。台北專業美甲，品質保證。"
      : "VicNail Studio nail services: gel nails, Japanese nail art, gel polish, manicure & pedicure, nail removal. Professional nail salon in Taipei.",
    keywords: isZh
      ? ["美甲服務", "台北美甲", "凝膠指甲", "日式美甲", "光療指甲", "手足保養", "美甲推薦"]
      : ["nail salon", "gel nails", "Japanese nail art", "Taipei nail salon", "gel polish", "manicure"],
    openGraph: {
      title: isZh ? "VicNail Studio — 美甲服務項目" : "VicNail Studio — Nail Services",
      description: isZh
        ? "專業凝膠美甲、日式彩繪、光療指甲與手足護理。品質保證，預約洽詢。"
        : "Professional gel nails, Japanese nail art, gel polish & hand care in Taipei.",
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
    { name: isZh ? "服務項目" : "Services", url: `${BASE_URL}/${locale}/services` },
  ];

  const schemaServices = SERVICES.map((s) => {
    const t = isZh ? s.zh : s.en;
    return {
      name: t.title,
      description: t.description,
      url: `${BASE_URL}/${locale}/services#${s.slug}`,
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

      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-nail-gold font-medium mb-3">
            {isZh ? "VicNail Studio" : "VicNail Studio"}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {isZh ? "美甲服務項目" : "Nail Services"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            {isZh
              ? "從日常光療到精細彩繪，每一款服務都由專業美甲師親手完成，為您的指尖注入個性與品味。"
              : "From everyday gel polish to intricate nail art — every service is crafted by our professional nail artists with precision and care."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-nail-gold fill-nail-gold" />
              {isZh ? "專業認證技師" : "Certified Artists"}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-nail-gold" />
              {isZh ? "日本頂級材料" : "Premium Japanese Products"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-nail-gold" />
              {isZh ? "彈性預約時間" : "Flexible Booking"}
            </span>
          </div>
        </div>
      </section>

      {/* Service Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => {
              const t = isZh ? service.zh : service.en;
              const isCourse = service.slug === "nail-courses";

              return (
                <div
                  key={service.slug}
                  id={service.slug}
                  className={cn(
                    "group relative rounded-2xl border p-6 transition-all duration-200",
                    "hover:shadow-lg hover:-translate-y-0.5",
                    isCourse
                      ? "border-nail-gold/40 bg-nail-cream/50"
                      : "border-nail-pink/30 bg-white"
                  )}
                >
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl" role="img" aria-label={t.title}>
                      {service.icon}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-nail-pink/20 text-nail-gold">
                      {t.highlight}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">
                    {t.title}
                  </h2>
                  <p className="text-xs text-nail-gold font-medium mb-3">{t.subtitle}</p>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {t.description}
                  </p>

                  {/* Duration */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.duration}</span>
                  </div>

                  {/* Keywords (hidden, SEO) */}
                  <div className="sr-only" aria-hidden="true">
                    {t.keywords.join(", ")}
                  </div>

                  {/* CTA */}
                  {isCourse && (
                    <Link
                      href="/courses"
                      className={cn(
                        "inline-flex items-center gap-1 text-sm font-medium text-nail-gold",
                        "hover:underline transition-colors"
                      )}
                    >
                      {isZh ? "查看課程詳情" : "View Courses"}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-nail-cream/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            {isZh ? "預約諮詢" : "Book a Consultation"}
          </h2>
          <p className="text-muted-foreground mb-6">
            {isZh
              ? "有任何疑問或想了解更多服務細節？歡迎透過 LINE 或 Instagram 與我們聯繫，我們會盡快回覆。"
              : "Questions or want to learn more about our services? Reach out via LINE or Instagram — we'll get back to you soon."}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.instagram.com/vicnail_studio/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-nail-gold text-white text-sm font-medium hover:bg-nail-gold/90 transition-colors"
            >
              📷 Instagram
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-nail-gold text-nail-gold text-sm font-medium hover:bg-nail-pink/20 transition-colors"
            >
              {isZh ? "了解更多" : "About Us"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
