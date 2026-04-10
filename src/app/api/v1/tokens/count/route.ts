import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, apiError, type ApiContext } from "@/lib/api";

interface TokenCountResult {
  text_length: number;
  word_count: number;
  estimated_tokens: number;
  model_estimates: Record<string, number>;
  encoding_details: {
    cjk_characters: number;
    latin_words: number;
    numbers: number;
    special_characters: number;
    whitespace: number;
  };
}

function countTokens(text: string): TokenCountResult {
  const textLength = text.length;

  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u2e80-\u2eff\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = text.match(cjkRegex) || [];
  const cjkCount = cjkMatches.length;

  const latinWords = text
    .replace(cjkRegex, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const latinWordCount = latinWords.length;

  const numbers = (text.match(/\d+/g) || []).length;
  const specialChars = (text.match(/[^\w\s\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u2e80-\u2eff\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g) || []).length;
  const whitespace = (text.match(/\s/g) || []).length;

  const wordCount = cjkCount + latinWordCount;

  // GPT/Claude-style BPE: ~0.75 tokens per English word, ~1.5 tokens per CJK char
  const gptEstimate = Math.ceil(latinWordCount * 1.33 + cjkCount * 1.5 + specialChars * 0.5);
  // Claude tends to be similar but slightly different
  const claudeEstimate = Math.ceil(latinWordCount * 1.3 + cjkCount * 1.6 + specialChars * 0.5);
  // Gemini
  const geminiEstimate = Math.ceil(latinWordCount * 1.2 + cjkCount * 1.4 + specialChars * 0.4);

  const estimatedTokens = gptEstimate;

  return {
    text_length: textLength,
    word_count: wordCount,
    estimated_tokens: estimatedTokens,
    model_estimates: {
      "gpt-4o": gptEstimate,
      "gpt-4": Math.ceil(gptEstimate * 1.05),
      "gpt-3.5-turbo": Math.ceil(gptEstimate * 1.1),
      "claude-3.5-sonnet": claudeEstimate,
      "claude-3-opus": Math.ceil(claudeEstimate * 1.02),
      "gemini-pro": geminiEstimate,
    },
    encoding_details: {
      cjk_characters: cjkCount,
      latin_words: latinWordCount,
      numbers,
      special_characters: specialChars,
      whitespace,
    },
  };
}

async function handler(req: NextRequest, ctx: ApiContext) {
  let text: string;

  if (req.method === "POST") {
    const body = await req.json();
    text = body.text;
  } else {
    text = req.nextUrl.searchParams.get("text") || "";
  }

  if (!text) {
    return apiError("Missing 'text' parameter", 400);
  }

  if (text.length > 500_000) {
    return apiError("Text too long, max 500,000 characters", 413);
  }

  const result = countTokens(text);
  return apiSuccess(result, { tier: ctx.tier.name });
}

export const POST = withApiAuth(handler, "tokens/count");
export const GET = withApiAuth(handler, "tokens/count");
