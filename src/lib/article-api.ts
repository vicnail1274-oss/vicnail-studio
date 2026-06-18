import fs from "fs";
import path from "path";

const contentRoot = path.join(process.cwd(), "src/content");

const ALLOWED_SECTIONS = new Set(["nail-news", "nail-knowledge", "ai"]);
const ALLOWED_LOCALES = new Set(["zh-TW", "en"]);
const SLUG_RE = /^[a-z0-9-]+$/;

/**
 * 驗 section/locale/slug 是否合法（白名單 + slug 格式）。
 * 用於本身不組路徑、但會把這三個值轉交給其他模組（如 lib/mdx）的呼叫端。
 */
export function isValidArticleParams(section: string, locale: string, slug: string): boolean {
  return ALLOWED_SECTIONS.has(section) && ALLOWED_LOCALES.has(locale) && SLUG_RE.test(slug);
}

/**
 * 驗 section/locale/slug 並組出安全的 .mdx 絕對路徑。
 * 任一不合法、或 resolve 後逃出 contentRoot，回 null（呼叫端視為 400/不存在）。
 * 路徑穿越（path traversal）防護的單一真相來源，三個檔共用。
 */
export function resolveArticlePath(
  section: string,
  locale: string,
  slug: string,
): string | null {
  if (!ALLOWED_SECTIONS.has(section)) return null;
  if (!ALLOWED_LOCALES.has(locale)) return null;
  if (!SLUG_RE.test(slug)) return null;

  const resolved = path.resolve(contentRoot, section, locale, `${slug}.mdx`);
  const rootWithSep = contentRoot.endsWith(path.sep) ? contentRoot : contentRoot + path.sep;
  if (!resolved.startsWith(rootWithSep)) return null;

  return resolved;
}

export interface CreateArticlePayload {
  title: string;
  description: string;
  content: string;
  section: "nail-knowledge" | "nail-news" | "ai";
  locale: "zh-TW" | "en";
  tags: string[];
  author?: string;
  slug?: string;
  draft?: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

export function createArticle(payload: CreateArticlePayload): { slug: string; path: string } {
  const slug = payload.slug || slugify(payload.title) || `article-${Date.now()}`;

  const filePath = resolveArticlePath(payload.section, payload.locale, slug);
  if (!filePath) {
    throw new Error(`Invalid section/locale/slug: ${payload.section}/${payload.locale}/${slug}`);
  }

  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Don't overwrite existing
  if (fs.existsSync(filePath)) {
    throw new Error(`Article already exists: ${slug}`);
  }

  const date = new Date().toISOString().split("T")[0];
  const tagsYaml = payload.tags.map((t) => `  - ${t}`).join("\n");

  const frontmatter = `---
title: "${payload.title.replace(/"/g, '\\"')}"
description: "${payload.description.replace(/"/g, '\\"')}"
date: "${date}"
tags:
${tagsYaml}
author: "${payload.author || "AI Bot"}"
source: "bot"
draft: ${payload.draft ?? false}
---`;

  const fileContent = `${frontmatter}\n\n${payload.content}\n`;
  fs.writeFileSync(filePath, fileContent, "utf-8");

  return { slug, path: `/${payload.locale}/${payload.section === "nail-knowledge" ? "nail/knowledge" : payload.section === "nail-news" ? "nail/news" : "ai"}/${slug}` };
}

export function deleteArticle(section: string, locale: string, slug: string): boolean {
  const filePath = resolveArticlePath(section, locale, slug);
  if (!filePath) return false;
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
