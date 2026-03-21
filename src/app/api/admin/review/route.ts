import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { isAdminAuthed } from "@/lib/admin-auth";

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

    // 把 prompt 寫入 stdin
    proc.stdin.write(prompt, "utf-8");
    proc.stdin.end();
  });
}

// POST /api/admin/review — 透過 Claude CLI 審查文章
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  try {
    const review = await runClaudeCLI(prompt);
    return NextResponse.json({ review });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[review] Claude CLI error:", msg);
    return NextResponse.json(
      { error: `Claude CLI 呼叫失敗，請確認 claude 指令可正常執行：${msg}` },
      { status: 500 }
    );
  }
}
