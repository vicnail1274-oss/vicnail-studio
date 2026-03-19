import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  coverImage?: string;
  author?: string;
  source?: "manual" | "bot";
  draft?: boolean;
}

export interface Article extends ArticleMeta {
  content: string;
}

const contentRoot = path.join(process.cwd(), "src/content");

/**
 * Get all articles from a content section for a given locale.
 * Filters out drafts by default.
 */
export function getArticles(
  section: string,
  locale: string,
  includeDrafts = false
): ArticleMeta[] {
  const dir = path.join(contentRoot, section, locale);

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const articles = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const { data } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ""),
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        tags: data.tags || [],
        coverImage: data.coverImage,
        author: data.author,
        source: data.source || "manual",
        draft: data.draft || false,
      } as ArticleMeta;
    })
    .filter((a) => includeDrafts || !a.draft);

  // Sort by date descending
  articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return articles;
}

/**
 * Get a single article by slug.
 */
export function getArticle(
  section: string,
  locale: string,
  slug: string
): Article | null {
  const filePath = path.join(contentRoot, section, locale, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    tags: data.tags || [],
    coverImage: data.coverImage,
    author: data.author,
    source: data.source || "manual",
    draft: data.draft || false,
    content,
  };
}

/**
 * Get all slugs for static generation.
 */
export function getArticleSlugs(section: string, locale: string): string[] {
  const dir = path.join(contentRoot, section, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}
