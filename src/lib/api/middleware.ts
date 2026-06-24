import { NextRequest, NextResponse } from "next/server";
import { extractApiKey, validateApiKey, type ApiKeyTier } from "./api-auth";
import { checkRateLimit, type RateLimitResult } from "./rate-limiter";
import { trackUsage } from "./usage-tracker";

export interface ApiContext {
  apiKey: string;
  tier: ApiKeyTier;
  rateLimit: RateLimitResult;
}

function rateLimitHeaders(rl: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(rl.limit),
    "X-RateLimit-Remaining": String(rl.remaining),
    "X-RateLimit-Reset": new Date(rl.resetAt).toISOString(),
  };
}

export function apiError(
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { success: false, error: { message, ...details } },
    { status, headers: { "Content-Type": "application/json" } }
  );
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): NextResponse {
  return NextResponse.json(
    { success: true, data, ...(meta ? { meta } : {}) },
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

type HandlerFn = (
  req: NextRequest,
  ctx: ApiContext
) => Promise<NextResponse>;

export function withApiAuth(
  handler: HandlerFn,
  endpointName: string
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const startTime = Date.now();

    const apiKey = extractApiKey(req);
    const { valid, tier, error } = validateApiKey(apiKey);

    if (!valid || !apiKey) {
      return apiError(error || "Unauthorized", 401);
    }

    const rl = checkRateLimit(
      `${apiKey}:${endpointName}`,
      tier.rateLimit,
      tier.rateLimitWindow
    );

    if (!rl.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Rate limit exceeded",
            retryAfter: Math.ceil((rl.resetAt - Date.now()) / 1000),
          },
        },
        { status: 429, headers: rateLimitHeaders(rl) }
      );
    }

    try {
      const response = await handler(req, { apiKey, tier, rateLimit: rl });

      const headers = new Headers(response.headers);
      for (const [k, v] of Object.entries(rateLimitHeaders(rl))) {
        headers.set(k, v);
      }
      headers.set("X-Api-Tier", tier.name);

      trackUsage({
        apiKey,
        endpoint: endpointName,
        timestamp: startTime,
        responseTimeMs: Date.now() - startTime,
        statusCode: response.status,
        inputSize: Number(req.headers.get("content-length") || 0),
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      return apiError(message, 500);
    }
  };
}
