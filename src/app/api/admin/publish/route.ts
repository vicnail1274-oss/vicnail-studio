import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { execSync, execFileSync } from "child_process";
import path from "path";

const repoRoot = path.join(process.cwd());
const PUSH_MAX_RETRIES = 3;
const PUSH_BASE_DELAY_MS = 4_000;

let publishLock = false;

function run(cmd: string): string {
  return execSync(cmd, { cwd: repoRoot, encoding: "utf-8", timeout: 30_000 }).trim();
}

function runGit(...args: string[]): string {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf-8", timeout: 30_000 }).trim();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pushWithRetry(): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= PUSH_MAX_RETRIES; attempt++) {
    try {
      runGit("push", "origin", "HEAD");
      return;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < PUSH_MAX_RETRIES) {
        const delay = PUSH_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[publish] push 第 ${attempt + 1} 次失敗，${delay / 1000}s 後重試`);
        await sleep(delay);
      }
    }
  }

  throw lastError ?? new Error("push 重試次數已用盡");
}

// GET /api/admin/publish — 取得目前 git 狀態
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const status = run("git status --porcelain");
    const branch = run("git branch --show-current");
    const lastCommit = run('git log -1 --format="%h %s"');

    let unpushed = 0;
    try {
      const ahead = run("git rev-list --count @{u}..HEAD");
      unpushed = parseInt(ahead) || 0;
    } catch {
      // 可能沒有 upstream
    }

    const changedFiles = status
      ? status.split("\n").map((line) => ({
          status: line.substring(0, 2).trim(),
          file: line.substring(3),
        }))
      : [];

    return NextResponse.json({
      branch,
      lastCommit,
      unpushed,
      changedFiles,
      hasChanges: changedFiles.length > 0,
      publishLocked: publishLock,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/publish — commit + push（含互斥鎖與重試）
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (publishLock) {
    return NextResponse.json(
      { error: "另一個發布作業正在執行中，請稍後再試" },
      { status: 409 }
    );
  }

  publishLock = true;
  try {
    const { message } = await req.json();
    const commitMsg = message || `content: update articles ${new Date().toISOString().slice(0, 10)}`;

    run("git add src/content/");

    const staged = run("git diff --cached --name-only");
    if (!staged) {
      return NextResponse.json({ error: "沒有需要推播的變更" }, { status: 400 });
    }

    runGit("commit", "-m", commitMsg);

    try {
      await pushWithRetry();
    } catch (pushErr: unknown) {
      const pushMsg = pushErr instanceof Error ? pushErr.message : String(pushErr);
      console.error("[publish] push 最終失敗，commit 已保留在本地:", pushMsg);
      const lastCommit = run('git log -1 --format="%h %s"');
      return NextResponse.json({
        ok: false,
        commit: lastCommit,
        pushed: false,
        error: `commit 成功但 push 失敗（已保留本地 commit）：${pushMsg}`,
        filesChanged: staged.split("\n").filter(Boolean).length,
      }, { status: 502 });
    }

    const lastCommit = run('git log -1 --format="%h %s"');

    return NextResponse.json({
      ok: true,
      commit: lastCommit,
      pushed: true,
      filesChanged: staged.split("\n").filter(Boolean).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[publish] error:", msg);
    return NextResponse.json({ error: `推播失敗：${msg}` }, { status: 500 });
  } finally {
    publishLock = false;
  }
}
