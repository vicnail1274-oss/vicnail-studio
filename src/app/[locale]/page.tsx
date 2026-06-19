import { HeroSection } from "@/components/sections/HeroSection";
import { TeachingFeatures } from "@/components/sections/TeachingFeatures";
import { CoursesOverview } from "@/components/sections/CoursesOverview";
import { CertificationSection } from "@/components/sections/CertificationSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { FounderSection } from "@/components/sections/FounderSection";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { AdSlot } from "@/components/ads/AdSlot";
import { HomepageFAQJsonLd } from "@/components/seo/JsonLd";
import { getArticles } from "@/lib/mdx";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

const SITE_URL = "https://vicnail-studio.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh-TW";

  const title = isZh
    ? "VicNail Studio｜日系凝膠美甲・專業教學"
    : "VicNail Studio｜Japanese Gel Nail Art & Education";
  const description = isZh
    ? "VicNail Studio — 日系凝膠美甲・延甲・彩繪專業教學，線上影片課程與精選美甲商品。"
    : "VicNail Studio — professional Japanese gel nail, extension & nail-art education, online video courses and curated nail products.";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        "zh-TW": `${SITE_URL}/zh-TW`,
        en: `${SITE_URL}/en`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "VicNail Studio",
      title,
      description,
      locale: isZh ? "zh_TW" : "en_US",
      url: `${SITE_URL}/${locale}`,
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Gather latest articles from all sections
  const knowledge = getArticles("nail-knowledge", locale).map((a) => ({
    ...a,
    section: "nail-knowledge",
    href: `/nail/knowledge/${a.slug}`,
  }));
  const news = getArticles("nail-news", locale).map((a) => ({
    ...a,
    section: "nail-news",
    href: `/nail/news/${a.slug}`,
  }));
  // Merge and sort by date, take latest 6
  const allArticles = [...knowledge, ...news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <>
      <HomepageFAQJsonLd locale={locale as "zh-TW" | "en"} />
      <HeroSection />
      <TeachingFeatures locale={locale} />
      <CoursesOverview locale={locale} />
      <CertificationSection locale={locale} />
      <FounderSection />
      <FAQSection locale={locale} />
      <LatestArticles articles={allArticles} locale={locale} />
      <div className="flex justify-center py-6 bg-white">
        <AdSlot size="leaderboard" slotId="home-mid" />
      </div>
      <CategoryGrid locale={locale} />
      <ToolsSection locale={locale} />
      <LocationSection locale={locale} />
      <NewsletterCTA locale={locale} />
    </>
  );
}
