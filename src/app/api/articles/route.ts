import { NextRequest, NextResponse } from "next/server";
import { createArticle, type CreateArticlePayload } from "@/lib/article-api";
import { getArticles } from "@/lib/mdx";

const RATE_WINDOW_MS = 60 * 1000;
const MAX_WRITES_PER_WINDOW = 10;

const writeLog: number[] = [];
let activeMutations = 0;
const MAX_CONCURRENT_MUTATIONS = 3;

function authorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key") || req.headers.get("authorization")?.replace("Bearer ", "");
  const expected = process.env.ARTICLE_API_KEY;
  if (!expected) return false;
  return key === expected;
}

function checkWriteRateLimit(): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  while (writeLog.length > 0 && writeLog[0] < now - RATE_WINDOW_MS) {
    writeLog.shift();
  }
  if (writeLog.length >= MAX_WRITES_PER_WINDOW) {
    const oldest = writeLog[0];
    const retryAfter = Math.ceil((oldest + RATE_WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true };
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") || "nail-knowledge";
    const locale = searchParams.get("locale") || "zh-TW";

    const articles = getArticles(section, locale, true);
    return NextResponse.json({ articles, count: articles.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[articles] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateCheck = checkWriteRateLimit();
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `寫入速率超限（每分鐘最多 ${MAX_WRITES_PER_WINDOW} 次），請 ${rateCheck.retryAfter}s 後重試`,
        retryAfter: rateCheck.retryAfter,
      },
      { status: 429 }
    );
  }

  if (activeMutations >= MAX_CONCURRENT_MUTATIONS) {
    return NextResponse.json(
      { error: `系統忙碌中（${activeMutations} 個寫入作業執行中），請稍後重試` },
      { status: 429 }
    );
  }

  activeMutations++;
  try {
    const body = (await req.json()) as CreateArticlePayload;

    if (!body.title || !body.content || !body.section || !body.locale || !body.tags?.length) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, section, locale, tags" },
        { status: 400 }
      );
    }

    const validSections = ["nail-knowledge", "nail-news", "ai"];
    if (!validSections.includes(body.section)) {
      return NextResponse.json(
        { error: `Invalid section. Must be one of: ${validSections.join(", ")}` },
        { status: 400 }
      );
    }

    const result = createArticle(body);
    writeLog.push(Date.now());

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[articles] POST error:", message);
    return NextResponse.json({ error: message }, { status: 409 });
  } finally {
    activeMutations--;
  }
}
