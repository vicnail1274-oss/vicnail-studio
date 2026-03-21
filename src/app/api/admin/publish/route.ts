import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { execSync } from "child_process";
import path from "path";

const repoRoot = path.join(process.cwd());

function run(cmd: string): string {
  return execSync(cmd, { cwd: repoRoot, encoding: "utf-8", timeout: 30_000 }).trim();
}

// GET /api/admin/publish — 取得目前 git 狀態
export async function GET(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const status = run("git status --porcelain");
    const branch = run("git branch --show-current");
    const lastCommit = run('git log -1 --format="%h %s"');

    // 檢查有沒有未推播的 commit
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
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST /api/admin/publish — commit + push
export async function POST(req: NextRequest) {
  if (!isAdminAuthed(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message } = await req.json();
    const commitMsg = message || `content: update articles ${new Date().toISOString().slice(0, 10)}`;

    // 1. Stage content + admin 相關的變更
    run("git add src/content/");

    // 檢查有沒有東西要 commit
    const staged = run("git diff --cached --name-only");
    if (!staged) {
      return NextResponse.json({ error: "沒有需要推播的變更" }, { status: 400 });
    }

    // 2. Commit
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);

    // 3. Push
    const pushResult = run("git push origin HEAD");

    const lastCommit = run('git log -1 --format="%h %s"');

    return NextResponse.json({
      ok: true,
      commit: lastCommit,
      pushed: true,
      filesChanged: staged.split("\n").filter(Boolean).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `推播失敗：${msg}` }, { status: 500 });
  }
}
