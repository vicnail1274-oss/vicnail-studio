import { HeroSection } from "@/components/sections/HeroSection";
import { HomepageServices } from "@/components/sections/HomepageServices";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocationSection } from "@/components/sections/LocationSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { ToolsSection } from "@/components/sections/ToolsSection";
import { FounderSection } from "@/components/sections/FounderSection";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { AdSlot } from "@/components/ads/AdSlot";
import { HomepageFAQJsonLd, WebsiteJsonLd } from "@/components/seo/JsonLd";
import { getArticles } from "@/lib/mdx";
import { setRequestLocale } from "next-intl/server";

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
  const ai = getArticles("ai", locale).map((a) => ({
    ...a,
    section: "ai",
    href: `/ai/${a.slug}`,
  }));

  // Merge and sort by date, take latest 6
  const allArticles = [...knowledge, ...news, ...ai]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <>
      <WebsiteJsonLd />
      <HomepageFAQJsonLd locale={locale as "zh-TW" | "en"} />
      <HeroSection />
      <HomepageServices locale={locale} />
      <TestimonialsSection locale={locale} />
      <LocationSection locale={locale} />
      <FAQSection locale={locale} />
      <NewsletterCTA locale={locale} />
      <LatestArticles articles={allArticles} locale={locale} />
      <div className="flex justify-center py-6 bg-white">
        <AdSlot size="leaderboard" slotId="home-mid" />
      </div>
      <CategoryGrid locale={locale} />
      <ToolsSection locale={locale} />
      <NewsletterCTA locale={locale} />
      <FounderSection />
    </>
  );
}
