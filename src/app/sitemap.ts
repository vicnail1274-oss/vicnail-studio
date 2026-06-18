import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/mdx";
import { createClient } from "@/lib/supabase/server";

const BASE_URL = "https://vicnail-studio.com";
const LOCALES = ["zh-TW", "en"] as const;

/** Build the hreflang alternates map for a locale-prefixed path (path begins with "/"). */
function localeAlternates(path: string) {
  return {
    languages: {
      "zh-TW": `${BASE_URL}/zh-TW${path}`,
      en: `${BASE_URL}/en${path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // Static pages (both locales)
  const staticPages = [
    "",
    "/nail/knowledge",
    "/nail/news",
    "/about",
    "/services",
    "/shop",
    "/faq",
    "/privacy",
    "/tools/nail-color-matcher",
  ];

  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "daily",
        priority: page === "" ? 1 : 0.8,
        alternates: localeAlternates(page),
      });
    }
  }

  // Courses index (zh-TW only)
  entries.push({
    url: `${BASE_URL}/zh-TW/courses`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
    alternates: localeAlternates("/courses"),
  });

  // Dynamic: published products & courses from Supabase
  try {
    const supabase = await createClient();

    const [{ data: products }, { data: courses }] = await Promise.all([
      supabase
        .from("products")
        .select("id, updated_at")
        .eq("status", "published"),
      supabase
        .from("courses")
        .select("slug, updated_at")
        .eq("status", "published"),
    ]);

    for (const product of products ?? []) {
      entries.push({
        url: `${BASE_URL}/zh-TW/shop/${product.id}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: localeAlternates(`/shop/${product.id}`),
      });
    }

    for (const course of courses ?? []) {
      if (!course.slug) continue;
      entries.push({
        url: `${BASE_URL}/zh-TW/courses/${course.slug}`,
        lastModified: course.updated_at ? new Date(course.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: localeAlternates(`/courses/${course.slug}`),
      });
    }
  } catch {
    // Supabase unavailable at build/request time — fall back to static entries
  }

  // Blog articles
  const sections = ["nail-knowledge", "nail-news"];
  const pathMap: Record<string, string> = {
    "nail-knowledge": "/nail/knowledge",
    "nail-news": "/nail/news",
  };

  for (const section of sections) {
    for (const locale of LOCALES) {
      const articles = getArticles(section, locale);
      for (const article of articles) {
        const path = `${pathMap[section]}/${article.slug}`;
        entries.push({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified: article.date ? new Date(article.date) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
          alternates: localeAlternates(path),
        });
      }
    }
  }

  return entries;
}
