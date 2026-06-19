import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  Award,
  BadgeCheck,
  Trophy,
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const BASE_URL = "https://vicnail-studio.com";

// ── SEO metadata ────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh-TW";

  return {
    title: isZh ? "日本美甲檢定考照" : "Japanese Nail Certification",
    description: isZh
      ? "由具國際評審與日本檢定資歷的 Vic 親自輔導日本美甲檢定考照（JNEC / JNA），從技術到應考一站式準備。"
      : "Japanese nail certification (JNEC / JNA) coaching, guided personally by Vic — a certified Japanese nailist and international competition judge.",
    keywords: isZh
      ? ["日本美甲檢定", "JNEC", "JNA", "美甲證照", "美甲檢定考照", "美甲檢定輔導", "台北美甲檢定"]
      : ["Japanese nail certification", "JNEC", "JNA", "nail license", "nail exam coaching", "nail certification Taiwan"],
    openGraph: {
      title: isZh
        ? "VicNail Studio — 日本美甲檢定考照"
        : "VicNail Studio — Japanese Nail Certification",
      description: isZh
        ? "JNEC / JNA 日本美甲檢定考照輔導，由國際評審 Vic 親自帶領。"
        : "JNEC / JNA Japanese nail certification coaching, led by international judge Vic.",
      url: `${BASE_URL}/${locale}/certification`,
      type: "website",
      images: [{ url: "/og-default.png", width: 1200, height: 630 }],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/certification`,
      languages: {
        "zh-TW": `${BASE_URL}/zh-TW/certification`,
        en: `${BASE_URL}/en/certification`,
      },
    },
  };
}

// ── Content data ─────────────────────────────────────────────────────────────

const WHY = [
  {
    icon: BadgeCheck,
    zh: {
      title: "專業認證",
      desc: "日本美甲檢定是國際公認的技術門檻，證書讓你的專業實力被客戶與同業看見。",
    },
    en: {
      title: "Recognized Credential",
      desc: "Japanese nail certification is an internationally respected standard — proof of skill that clients and peers recognize.",
    },
  },
  {
    icon: Briefcase,
    zh: {
      title: "就業與開店優勢",
      desc: "無論是進入沙龍任職或自行開業，檢定證書都是專業背書，提升信任與競爭力。",
    },
    en: {
      title: "Career & Studio Edge",
      desc: "Whether joining a salon or opening your own, certification backs your professionalism and builds client trust.",
    },
  },
  {
    icon: ShieldCheck,
    zh: {
      title: "技術標準化",
      desc: "依日本檢定的衛生與技術規範訓練，建立扎實、可重複的標準作業流程。",
    },
    en: {
      title: "Standardized Technique",
      desc: "Train to Japan's hygiene and technical standards, building a solid, repeatable professional workflow.",
    },
  },
];

const CREDENTIALS = [
  {
    icon: BadgeCheck,
    zh: { heading: "日本檢定資歷", items: ["JNA 日本美甲師協會 衛生士合格", "JNEC 三級日本美甲師檢定合格"] },
    en: {
      heading: "Japanese Certifications",
      items: ["JNA Japan Nailist Association — Certified Hygienist", "JNEC Level 3 Japanese Nailist Certification"],
    },
  },
  {
    icon: Trophy,
    zh: { heading: "國際賽事評審 & 冠軍", items: ["OMC 美容美髮世界組織 國際評審", "亞洲盃藝術美甲 評審", "亞洲盃指甲彩繪靜態組 冠軍（2016）"] },
    en: {
      heading: "International Judge & Champion",
      items: ["OMC Hairworld — International Judge", "Asia Cup Nail Art — Judge", "Asia Cup Nail Art (Static) — Champion (2016)"],
    },
  },
  {
    icon: Award,
    zh: { heading: "品牌權威講師", items: ["PRESTO 台灣區認證講師", "喜成美的事業特約講師"] },
    en: {
      heading: "Brand Authority Educator",
      items: ["PRESTO Taiwan Certified Educator", "Xicheng Beauty — Contract Educator"],
    },
  },
  {
    icon: GraduationCap,
    zh: { heading: "專業教學資歷", items: ["前 美國愛藝術美甲檢定中心 研發部主任", "莊敬高職 美容科教師", "文化大學推廣部 藝術美甲講師"] },
    en: {
      heading: "Teaching Experience",
      items: [
        "Former R&D Director, US Nail Art Certification Center",
        "Instructor, Chuang Ching Vocational High School (Beauty)",
        "Nail Art Lecturer, PCCU Extension Education",
      ],
    },
  },
];

const LEVELS = [
  {
    badge: { zh: "3 級 / 初級", en: "Level 3 / Beginner" },
    zh: {
      title: "基礎技術與衛生",
      desc: "建立美甲基礎觀念、消毒衛生流程與基本指甲護理，是入門檢定的核心。適合零基礎或想取得第一張證書的學員。",
    },
    en: {
      title: "Fundamentals & Hygiene",
      desc: "Core nail-care concepts, sanitation procedures, and basic techniques — the foundation level for those new to certification.",
    },
  },
  {
    badge: { zh: "2 級 / 中級", en: "Level 2 / Intermediate" },
    zh: {
      title: "進階技術與彩繪",
      desc: "強化凝膠、卸甲與彩繪等進階技術，要求更高的完成度與穩定度。適合已具基礎、想精進實力的學員。",
    },
    en: {
      title: "Advanced Skills & Art",
      desc: "Strengthens gel work, removal, and nail-art techniques with higher precision and consistency, for those building on the basics.",
    },
  },
  {
    badge: { zh: "1 級 / 上級", en: "Level 1 / Advanced" },
    zh: {
      title: "專業級綜合技術",
      desc: "綜合性的高階檢定，著重整體完成度與專業表現，是邁向資深美甲師的進階目標。",
    },
    en: {
      title: "Professional Mastery",
      desc: "A comprehensive advanced level focused on overall quality and professional performance — a milestone toward senior expertise.",
    },
  },
];

const STEPS = [
  { zh: { title: "報名諮詢", desc: "了解適合的檢定級別與課程安排。" }, en: { title: "Enroll & Consult", desc: "Find the right level and course plan for you." } },
  { zh: { title: "上課輔導", desc: "由 Vic 系統性教學檢定所需技術與觀念。" }, en: { title: "Guided Classes", desc: "Systematic coaching on required skills and concepts." } },
  { zh: { title: "術科練習", desc: "反覆實作練習，打磨手法與完成度。" }, en: { title: "Hands-On Practice", desc: "Repeated practice to refine technique and finish." } },
  { zh: { title: "模擬演練", desc: "比照檢定情境進行模擬與彩繪演練。" }, en: { title: "Mock Exam", desc: "Full simulation and nail-art rehearsal under exam conditions." } },
  { zh: { title: "正式應考", desc: "在充分準備下從容應試，邁向證照。" }, en: { title: "Take the Exam", desc: "Sit the exam with confidence, fully prepared." } },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CertificationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh-TW";

  return (
    <>
      {/* Hero */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-nail-cream to-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm uppercase tracking-widest text-nail-gold font-medium mb-3">
            {isZh ? "VicNail Studio" : "VicNail Studio"}
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
            {isZh ? "日本美甲檢定考照" : "Japanese Nail Certification"}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {isZh
              ? "由具國際評審與日本檢定資歷的 Vic 親自輔導考照，從技術扎根到實戰模擬，陪你一步步取得專業證書。"
              : "Certification coaching guided personally by Vic — a certified Japanese nailist and international competition judge — from foundational skills to exam-day simulation."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-nail-gold" />
              {isZh ? "JNEC 三級合格" : "JNEC Level 3 Certified"}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-nail-gold" />
              {isZh ? "JNA 衛生士合格" : "JNA Certified Hygienist"}
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-nail-gold" />
              {isZh ? "OMC 國際評審" : "OMC International Judge"}
            </span>
          </div>
        </div>
      </section>

      {/* Why certify */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isZh ? "為什麼考日本美甲檢定" : "Why Japanese Nail Certification"}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {isZh
                ? "日系美甲以細膩與嚴謹著稱，檢定證書是你專業實力最具說服力的證明。"
                : "Japanese nail artistry is known for precision and rigor — certification is the most convincing proof of your professional skill."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {WHY.map((w) => {
              const t = isZh ? w.zh : w.en;
              const Icon = w.icon;
              return (
                <div
                  key={t.title}
                  className="rounded-2xl border border-nail-pink/30 bg-nail-cream/40 p-6"
                >
                  <div className="w-11 h-11 rounded-xl bg-nail-gold/15 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-nail-gold" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Vic's credentials */}
      <section className="py-16 px-4 bg-nail-cream/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isZh ? "Vic 的檢定資歷" : "Vic's Credentials"}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {isZh
                ? "橫跨日本檢定、國際評審與專業教學，由真正走過考照之路的老師親自帶領。"
                : "Spanning Japanese certifications, international judging, and professional teaching — learn from someone who has walked the path."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CREDENTIALS.map((c) => {
              const t = isZh ? c.zh : c.en;
              const Icon = c.icon;
              return (
                <div
                  key={t.heading}
                  className="rounded-2xl border border-nail-pink/30 bg-white p-6"
                >
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
                    <Icon size={16} className="text-nail-gold" />
                    {t.heading}
                  </h3>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    {t.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isZh ? "檢定級別介紹" : "Certification Levels"}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {isZh
                ? "JNEC 日本美甲檢定一般分為三個級別，由基礎到專業循序漸進。以下為通用說明，實際內容與報考方式以官方為準。"
                : "JNEC Japanese nail certification is generally organized into three levels, progressing from fundamentals to professional mastery. The summary below is general; official sources govern exact requirements."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEVELS.map((lv) => {
              const t = isZh ? lv.zh : lv.en;
              const badge = isZh ? lv.badge.zh : lv.badge.en;
              return (
                <div
                  key={t.title}
                  className="rounded-2xl border border-nail-pink/30 bg-nail-cream/40 p-6"
                >
                  <span className="inline-block text-xs font-medium px-3 py-1 rounded-full bg-nail-gold/15 text-nail-gold mb-4">
                    {badge}
                  </span>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                    {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isZh
              ? "各級別的報考資格、費用與考期等細節，歡迎詢問我們做進一步諮詢。"
              : "For eligibility, fees, and exam dates of each level, feel free to reach out for a detailed consultation."}
          </p>
        </div>
      </section>

      {/* Coaching course */}
      <section className="py-16 px-4 bg-nail-cream/30">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-nail-gold/15 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 text-nail-gold" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            {isZh ? "檢定輔導課程" : "Certification Coaching Course"}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {isZh
              ? "我們的基礎全科班完整涵蓋檢定所需技術，並包含「檢定彩繪 & 模擬」單元，讓你在實戰演練中熟悉應考節奏，循序漸進準備考照。"
              : "Our full-curriculum foundation course covers the techniques needed for certification, including a dedicated 'certification nail art & mock exam' unit so you can rehearse and pace yourself toward exam day."}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-8 py-4 rounded-full bg-nail-gold text-white text-base font-semibold hover:bg-nail-gold/90 transition-colors shadow-md"
          >
            {isZh ? "查看課程內容" : "View Courses"}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground">
              {isZh ? "考照流程" : "The Path to Certification"}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {isZh
                ? "從報名到應考，一步步陪你準備，讓考照之路清晰可循。"
                : "From enrollment to exam day, a clear step-by-step path guided every step of the way."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {STEPS.map((step, i) => {
              const t = isZh ? step.zh : step.en;
              return (
                <div
                  key={t.title}
                  className="rounded-2xl border border-nail-pink/30 bg-nail-cream/40 p-5"
                >
                  <div className="w-9 h-9 rounded-full bg-nail-gold text-white flex items-center justify-center font-display font-bold mb-3">
                    {i + 1}
                  </div>
                  <h3 className="text-base font-display font-semibold text-foreground mb-1.5">
                    {t.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-nail-cream/50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            {isZh ? "準備好考取日本美甲檢定了嗎？" : "Ready to earn your Japanese nail certification?"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {isZh
              ? "歡迎透過 LINE 諮詢檢定課程，我們會依你的程度與目標，給你最適合的考照建議。"
              : "Reach out via LINE to ask about our certification courses — we'll recommend the best path for your level and goals."}
          </p>
          <a
            href="https://lin.ee/vicnail"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#06C755] text-white text-base font-semibold hover:bg-[#05b04c] transition-colors shadow-md"
          >
            💬 {isZh ? "諮詢檢定課程" : "Ask About Certification"}
          </a>
        </div>
      </section>
    </>
  );
}
