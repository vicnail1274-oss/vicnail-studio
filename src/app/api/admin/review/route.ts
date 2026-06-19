import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { isAdminAuthed } from "@/lib/admin-auth";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 4_000;
const MAX_CONCURRENT = 2;
const COOLDOWN_MS = 5 * 60 * 1000;

let activeWorkers = 0;
let lastErrorTime = 0;
let consecutiveErrors = 0;

function isRateLimitError(msg: string): boolean {
  const patterns = ["rate limit", "429", "too many requests", "overloaded", "capacity"];
  return patterns.some((p) => msg.toLowerCase().includes(p));
}

function isInCooldown(): boolean {
  if (consecutiveErrors < 3) return false;
  return Date.now() - lastErrorTime < COOLDOWN_MS;
}

function recordSuccess() {
  consecutiveErrors = 0;
}

function recordError() {
  consecutiveErrors++;
  lastErrorTime = Date.now();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 透過 Claude CLI (claude -p) 執行 prompt，回傳輸出文字 */
function runClaudeCLI(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("claude", ["-p", "--model", "claude-opus-4-5"], {
      env: { ...process.env },
      timeout: 120_000,
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf-8");
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf-8");
    });

    proc.on("close", (code) => {
      if (code !== 0 && !stdout) {
        reject(new Error(stderr || `claude process exited with code ${code}`));
      } else {
        resolve(stdout.trim());
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });

    proc.stdin.write(prompt, "utf-8");
    proc.stdin.end();
  });
}

async function runClaudeCLIWithRetry(prompt: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await runClaudeCLI(prompt);
      recordSuccess();
      return result;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const msg = lastError.message;

      if (!isRateLimitError(msg) && attempt === 0) {
        recordError();
        throw lastError;
      }

      recordError();

      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(
          `[review] Claude CLI 第 ${attempt + 1} 次失敗，${delay / 1000}s 後重試: ${msg}`
        );
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("重試次數已用盡");
}

// POST /api/admin/review — 透過 Claude CLI 審查文章
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (isInCooldown()) {
    const remainSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastErrorTime)) / 1000);
    return NextResponse.json(
      {
        error: `Claude CLI 連續錯誤過多，冷卻中（${remainSec}s 後可重試）`,
        status: "cooldown",
        retryAfter: remainSec,
      },
      { status: 503 }
    );
  }

  if (activeWorkers >= MAX_CONCURRENT) {
    return NextResponse.json(
      { error: `審查佇列已滿（${MAX_CONCURRENT} 個任務執行中），請稍後再試`, status: "busy" },
      { status: 429 }
    );
  }

  const { title, content, locale } = await req.json();

  if (!title || !content) {
    return NextResponse.json({ error: "缺少 title 或 content" }, { status: 400 });
  }

  const lang = locale === "zh-TW" ? "繁體中文" : "English";
  const reviewLang = locale === "zh-TW" ? "繁體中文" : "English";

  const prompt = `你是 VicNail Studio 的內容品質審查員，負責審查一篇美甲/AI 工具相關的部落格文章。

文章語言：${lang}
文章標題：${title}

文章內容：
---
${content}
---

請用${reviewLang}提供以下四個面向的審查報告：

1. **內容品質** — 內容是否充實、有價值、符合目標讀者（美甲師/愛美的消費者）？
2. **文法與表達** — 語句是否流暢、有無明顯錯誤？（若有錯誤，請直接指出原句並提供修正版本）
3. **SEO 優化建議** — 標題、關鍵字密度、段落結構是否符合 SEO 最佳實踐？
4. **具體修改建議** — 列出 3-5 個最重要的具體修改建議

最後給出一個總體評分（滿分 100），以及一句話摘要。`;

  activeWorkers++;
  try {
    const review = await runClaudeCLIWithRetry(prompt);
    return NextResponse.json({ review });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[review] Claude CLI error:", msg);

    const statusCode = isRateLimitError(msg) ? 429 : 500;
    return NextResponse.json(
      {
        error: `Claude CLI 呼叫失敗：${msg}`,
        status: statusCode === 429 ? "rate_limited" : "error",
        retryAfter: statusCode === 429 ? 60 : undefined,
      },
      { status: statusCode }
    );
  } finally {
    activeWorkers--;
  }
}
