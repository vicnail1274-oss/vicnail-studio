import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, apiError, type ApiContext } from "@/lib/api";

interface TextAnalysis {
  character_count: number;
  word_count: number;
  sentence_count: number;
  paragraph_count: number;
  line_count: number;
  reading_time_minutes: number;
  speaking_time_minutes: number;
  language_detection: {
    primary: string;
    confidence: number;
    details: Record<string, number>;
  };
  readability: {
    avg_word_length: number;
    avg_sentence_length: number;
    unique_words: number;
    vocabulary_richness: number;
  };
  frequency: {
    top_words: Array<{ word: string; count: number }>;
    top_bigrams: Array<{ bigram: string; count: number }>;
  };
}

function detectLanguage(text: string): { primary: string; confidence: number; details: Record<string, number> } {
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf]/g;
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/g;
  const koreanRegex = /[\uac00-\ud7af]/g;
  const latinRegex = /[a-zA-Z]/g;
  const cyrillicRegex = /[\u0400-\u04ff]/g;
  const arabicRegex = /[\u0600-\u06ff]/g;

  const total = text.replace(/\s/g, "").length || 1;

  const details: Record<string, number> = {
    chinese: ((text.match(cjkRegex) || []).length / total) * 100,
    japanese: ((text.match(japaneseRegex) || []).length / total) * 100,
    korean: ((text.match(koreanRegex) || []).length / total) * 100,
    latin: ((text.match(latinRegex) || []).length / total) * 100,
    cyrillic: ((text.match(cyrillicRegex) || []).length / total) * 100,
    arabic: ((text.match(arabicRegex) || []).length / total) * 100,
  };

  let primary = "unknown";
  let maxScore = 0;

  for (const [lang, score] of Object.entries(details)) {
    if (score > maxScore) {
      maxScore = score;
      primary = lang;
    }
  }

  if (primary === "latin") primary = "english";

  return { primary, confidence: Math.round(maxScore * 100) / 100, details };
}

function analyzeText(text: string): TextAnalysis {
  const charCount = text.length;
  const lines = text.split("\n");
  const lineCount = lines.length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const paragraphCount = paragraphs.length || 1;

  const sentences = text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length || 1;

  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkCount = (text.match(cjkRegex) || []).length;
  const latinWords = text
    .replace(cjkRegex, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const wordCount = cjkCount + latinWords.length;

  // Reading speed: ~250 wpm English, ~500 cpm CJK
  const readingTimeMinutes = Math.max(0.1, Math.round((latinWords.length / 250 + cjkCount / 500) * 10) / 10);
  // Speaking speed: ~150 wpm English, ~300 cpm CJK
  const speakingTimeMinutes = Math.max(0.1, Math.round((latinWords.length / 150 + cjkCount / 300) * 10) / 10);

  const allWords = latinWords.map((w) => w.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, "")).filter((w) => w.length > 0);
  const totalWordLength = allWords.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = allWords.length > 0 ? Math.round((totalWordLength / allWords.length) * 100) / 100 : 0;
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 100) / 100;

  const uniqueWords = new Set(allWords);
  const vocabularyRichness = allWords.length > 0
    ? Math.round((uniqueWords.size / allWords.length) * 10000) / 10000
    : 0;

  const wordFreq: Record<string, number> = {};
  for (const w of allWords) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }
  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));

  const bigrams: Record<string, number> = {};
  for (let i = 0; i < allWords.length - 1; i++) {
    const bg = `${allWords[i]} ${allWords[i + 1]}`;
    bigrams[bg] = (bigrams[bg] || 0) + 1;
  }
  const topBigrams = Object.entries(bigrams)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([bigram, count]) => ({ bigram, count }));

  return {
    character_count: charCount,
    word_count: wordCount,
    sentence_count: sentenceCount,
    paragraph_count: paragraphCount,
    line_count: lineCount,
    reading_time_minutes: readingTimeMinutes,
    speaking_time_minutes: speakingTimeMinutes,
    language_detection: detectLanguage(text),
    readability: {
      avg_word_length: avgWordLength,
      avg_sentence_length: avgSentenceLength,
      unique_words: uniqueWords.size,
      vocabulary_richness: vocabularyRichness,
    },
    frequency: {
      top_words: topWords,
      top_bigrams: topBigrams,
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

  if (text.length > 1_000_000) {
    return apiError("Text too long, max 1,000,000 characters", 413);
  }

  const analysis = analyzeText(text);
  return apiSuccess(analysis, { tier: ctx.tier.name });
}

export const POST = withApiAuth(handler, "text/analyze");
export const GET = withApiAuth(handler, "text/analyze");
