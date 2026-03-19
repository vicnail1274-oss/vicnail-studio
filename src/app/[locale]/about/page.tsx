import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutAI } from "@/components/about/AboutAI";

export const metadata: Metadata = {
  title: "About",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <AboutHero locale={locale} />
      <AboutAI locale={locale} />
    </>
  );
}
