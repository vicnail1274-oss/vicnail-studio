import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface HealthCheck {
  name: string;
  status: "ok" | "warn" | "error";
  message: string;
  latencyMs?: number;
}

const CONTENT_DIRS = ["nail-knowledge", "nail-news", "ai"];
const MIN_DISK_MB = 500;

async function checkContentAccess(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const contentRoot = path.join(process.cwd(), "src/content");
    for (const dir of CONTENT_DIRS) {
      const dirPath = path.join(contentRoot, dir);
      if (!fs.existsSync(dirPath)) {
        return { name: "content_access", status: "warn", message: `目錄不存在: ${dir}`, latencyMs: Date.now() - start };
      }
    }
    return { name: "content_access", status: "ok", message: "內容目錄正常", latencyMs: Date.now() - start };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { name: "content_access", status: "error", message: msg, latencyMs: Date.now() - start };
  }
}

async function checkEnvVars(): Promise<HealthCheck> {
  const required = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"];
  const missing = required.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    return { name: "env_vars", status: "warn", message: `缺少環境變數: ${missing.join(", ")}` };
  }
  return { name: "env_vars", status: "ok", message: "必要環境變數正常" };
}

async function checkDiskSpace(): Promise<HealthCheck> {
  try {
    const stats = fs.statfsSync(process.cwd());
    const availableMB = Math.floor((stats.bavail * stats.bsize) / (1024 * 1024));
    if (availableMB < MIN_DISK_MB) {
      return { name: "disk_space", status: "error", message: `磁碟空間不足: ${availableMB}MB（低於 ${MIN_DISK_MB}MB）` };
    }
    return { name: "disk_space", status: "ok", message: `可用空間: ${availableMB}MB` };
  } catch {
    return { name: "disk_space", status: "warn", message: "無法檢查磁碟空間" };
  }
}

async function checkMemory(): Promise<HealthCheck> {
  const used = process.memoryUsage();
  const heapUsedMB = Math.floor(used.heapUsed / (1024 * 1024));
  const heapTotalMB = Math.floor(used.heapTotal / (1024 * 1024));
  const ratio = used.heapUsed / used.heapTotal;

  if (ratio > 0.9) {
    return { name: "memory", status: "error", message: `記憶體使用過高: ${heapUsedMB}/${heapTotalMB}MB (${Math.round(ratio * 100)}%)` };
  }
  if (ratio > 0.75) {
    return { name: "memory", status: "warn", message: `記憶體偏高: ${heapUsedMB}/${heapTotalMB}MB (${Math.round(ratio * 100)}%)` };
  }
  return { name: "memory", status: "ok", message: `${heapUsedMB}/${heapTotalMB}MB (${Math.round(ratio * 100)}%)` };
}

// GET /api/health — system-guardian 健康檢查端點
export async function GET() {
  const startTime = Date.now();

  const checks = await Promise.all([
    checkContentAccess(),
    checkEnvVars(),
    checkDiskSpace(),
    checkMemory(),
  ]);

  const hasError = checks.some((c) => c.status === "error");
  const hasWarn = checks.some((c) => c.status === "warn");

  const overallStatus = hasError ? "error" : hasWarn ? "degraded" : "healthy";

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    totalLatencyMs: Date.now() - startTime,
    checks,
  };

  const statusCode = hasError ? 503 : 200;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
