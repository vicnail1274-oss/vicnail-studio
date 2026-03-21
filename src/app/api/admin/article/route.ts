import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isAdminAuthed } from "@/lib/admin-auth";

const contentRoot = path.join(process.cwd(), "src/content");

// GET /api/admin/article?section=&locale=&slug= — 取得原始 MDX 內容
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");
  const locale = searchParams.get("locale");
  const slug = searchParams.get("slug");

  if (!section || !locale || !slug) {
    return NextResponse.json({ error: "缺少 section / locale / slug" }, { status: 400 });
  }

  const filePath = path.join(contentRoot, section, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return NextResponse.json({ frontmatter: data, content, raw });
}

// PUT /api/admin/article — 更新文章
export async function PUT(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, locale, slug, frontmatter, content } = await req.json();

  if (!section || !locale || !slug || frontmatter === undefined || content === undefined) {
    return NextResponse.json({ error: "缺少必要欄位" }, { status: 400 });
  }

  const filePath = path.join(contentRoot, section, locale, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "文章不存在" }, { status: 404 });
  }

  // 重新組合 frontmatter + content
  const fileContent = matter.stringify(content, frontmatter);
  fs.writeFileSync(filePath, fileContent, "utf-8");

  return NextResponse.json({ ok: true });
}

// POST /api/admin/article — 列出所有文章
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, locale } = await req.json();
  const dir = path.join(contentRoot, section || "", locale || "");

  if (!fs.existsSync(dir)) return NextResponse.json({ articles: [] });

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data } = matter(raw);
    return {
      slug: file.replace(/\.mdx$/, ""),
      title: data.title || "(無標題)",
      date: data.date || "",
      draft: data.draft || false,
      source: data.source || "manual",
      tags: data.tags || [],
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return NextResponse.json({ articles });
}
