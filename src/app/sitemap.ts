import type { MetadataRoute } from "next";
import { getArticleSlugs } from "@/lib/mdx";

const BASE_URL = "https://vicnail-studio.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["zh-TW", "en"];
  const entries: MetadataRoute.Sitemap = [];

  // Static pages
  const staticPages = ["", "/nail/knowledge", "/nail/news", "/ai", "/about"];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "daily",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  // Courses (zh-TW only)
  entries.push({
    url: `${BASE_URL}/zh-TW/courses`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  });

  // Blog articles
  const sections = ["nail-knowledge", "nail-news", "ai"];
  const pathMap: Record<string, string> = {
    "nail-knowledge": "/nail/knowledge",
    "nail-news": "/nail/news",
    ai: "/ai",
  };

  for (const section of sections) {
    for (const locale of locales) {
      const slugs = getArticleSlugs(section, locale);
      for (const slug of slugs) {
        entries.push({
          url: `${BASE_URL}/${locale}${pathMap[section]}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
    }
  }

  return entries;
}
