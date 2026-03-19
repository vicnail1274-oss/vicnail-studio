import { NextRequest, NextResponse } from "next/server";
import { createArticle, type CreateArticlePayload } from "@/lib/article-api";
import { getArticles } from "@/lib/mdx";

function authorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.ARTICLE_API_KEY;
  if (!expected) return false;
  return key === expected;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") || "nail-knowledge";
  const locale = searchParams.get("locale") || "zh-TW";

  const articles = getArticles(section, locale, true);
  return NextResponse.json({ articles, count: articles.length });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as CreateArticlePayload;

    // Validate required fields
    if (!body.title || !body.content || !body.section || !body.locale || !body.tags?.length) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, section, locale, tags" },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = ["nail-knowledge", "nail-news", "ai"];
    if (!validSections.includes(body.section)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${validSections.join(", ")}` },
        { status: 400 }
      );
    }

    const result = createArticle(body);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
