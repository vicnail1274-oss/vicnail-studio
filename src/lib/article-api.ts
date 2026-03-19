import fs from "fs";
import path from "path";

const contentRoot = path.join(process.cwd(), "src/content");

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
  const dir = path.join(contentRoot, payload.section, payload.locale);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${slug}.mdx`);

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
  const filePath = path.join(contentRoot, section, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}
