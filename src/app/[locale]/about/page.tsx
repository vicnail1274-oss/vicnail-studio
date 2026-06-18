import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";

const BASE_URL = "https://vicnail-studio.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const url = `${BASE_URL}/${locale}/about`;
  const isZh = locale === "zh-TW";
  return {
    title: isZh ? "關於我們" : "About",
    description: isZh
      ? "VicNail Studio 是專業日系凝膠美甲教學工作室，由 Vic 主理。"
      : "VicNail Studio specializes in Japanese gel nail artistry and education, run by Vic.",
    alternates: {
      canonical: url,
      languages: {
        "zh-TW": `${BASE_URL}/zh-TW/about`,
        en: `${BASE_URL}/en/about`,
      },
    },
    openGraph: {
      type: "website",
      url,
      title: isZh ? "關於我們 | VicNail Studio" : "About | VicNail Studio",
      description: isZh
        ? "VicNail Studio 是專業日系凝膠美甲教學工作室"
        : "VicNail Studio specializes in Japanese gel nail artistry and education",
      images: [{ url: "/og-default.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: isZh ? "關於我們 | VicNail Studio" : "About | VicNail Studio",
      description: isZh
        ? "VicNail Studio 是專業日系凝膠美甲教學工作室"
        : "VicNail Studio specializes in Japanese gel nail artistry and education",
      images: ["/og-default.svg"],
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <AboutHero locale={locale} />
    </>
  );
}
