import { HeroSection } from "@/components/sections/HeroSection";
import { LatestArticles } from "@/components/sections/LatestArticles";
import { CategoryGrid } from "@/components/sections/CategoryGrid";
import { FounderSection } from "@/components/sections/FounderSection";
import { NewsletterCTA } from "@/components/sections/NewsletterCTA";
import { AdSlot } from "@/components/ads/AdSlot";
import { getArticles } from "@/lib/mdx";
import { getLocale } from "next-intl/server";

export default async function Home() {
  const locale = await getLocale();

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
      <HeroSection />
      <LatestArticles articles={allArticles} locale={locale} />
      <div className="flex justify-center py-6 bg-white">
        <AdSlot size="leaderboard" slotId="home-mid" />
      </div>
      <CategoryGrid locale={locale} />
      <NewsletterCTA locale={locale} />
      <FounderSection />
    </>
  );
}
