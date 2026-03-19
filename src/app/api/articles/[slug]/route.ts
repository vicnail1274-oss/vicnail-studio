import { NextRequest, NextResponse } from "next/server";
import { getArticle } from "@/lib/mdx";
import { deleteArticle } from "@/lib/article-api";

function authorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.ARTICLE_API_KEY;
  if (!expected) return false;
  return key === expected;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") || "nail-knowledge";
  const locale = searchParams.get("locale") || "zh-TW";

  const article = await getArticle(section, locale, slug);
  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ article });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section") || "nail-knowledge";
  const locale = searchParams.get("locale") || "zh-TW";

  const deleted = deleteArticle(section, locale, slug);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, deleted: slug });
}
