import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, type ApiContext, getUsageSummary, getUsageByPeriod } from "@/lib/api";

async function handler(req: NextRequest, ctx: ApiContext) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";

  const summary = getUsageSummary(ctx.apiKey);

  let periodRecords;
  if (period !== "all") {
    const now = Date.now();
    let startTime: number;
    switch (period) {
      case "hour":
        startTime = now - 3_600_000;
        break;
      case "day":
        startTime = now - 86_400_000;
        break;
      case "week":
        startTime = now - 604_800_000;
        break;
      case "month":
        startTime = now - 2_592_000_000;
        break;
      default:
        startTime = 0;
    }
    periodRecords = getUsageByPeriod(ctx.apiKey, startTime, now);
  }

  return apiSuccess({
    summary,
    tier: ctx.tier.name,
    rate_limit: {
      max_requests_per_minute: ctx.tier.rateLimit,
      remaining: ctx.rateLimit.remaining,
      reset_at: new Date(ctx.rateLimit.resetAt).toISOString(),
    },
    ...(periodRecords && {
      period_usage: {
        period,
        request_count: periodRecords.length,
        avg_response_time_ms:
          periodRecords.length > 0
            ? Math.round(periodRecords.reduce((s, r) => s + r.responseTimeMs, 0) / periodRecords.length)
            : 0,
      },
    }),
  });
}

export const GET = withApiAuth(handler, "usage");
