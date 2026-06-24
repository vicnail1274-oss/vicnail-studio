import { NextRequest } from "next/server";

export interface ApiKeyTier {
  name: string;
  rateLimit: number;
  rateLimitWindow: number;
}

const API_KEY_TIERS: Record<string, ApiKeyTier> = {
  free: { name: "free", rateLimit: 30, rateLimitWindow: 60_000 },
  basic: { name: "basic", rateLimit: 100, rateLimitWindow: 60_000 },
  pro: { name: "pro", rateLimit: 500, rateLimitWindow: 60_000 },
};

export function extractApiKey(req: NextRequest): string | null {
  return (
    req.headers.get("x-api-key") ||
    req.headers.get("authorization")?.replace("Bearer ", "") ||
    req.nextUrl.searchParams.get("api_key") ||
    null
  );
}

export function validateApiKey(apiKey: string | null): {
  valid: boolean;
  tier: ApiKeyTier;
  error?: string;
} {
  const validKeys = process.env.API_KEYS?.split(",").map((k) => k.trim()) || [];
  const proKeys = process.env.API_KEYS_PRO?.split(",").map((k) => k.trim()) || [];
  const demoKey = process.env.API_DEMO_KEY || "demo-key-vicnail-2024";

  if (!apiKey) {
    return { valid: false, tier: API_KEY_TIERS.free, error: "Missing API key" };
  }

  if (apiKey === demoKey) {
    return { valid: true, tier: API_KEY_TIERS.free };
  }

  if (proKeys.includes(apiKey)) {
    return { valid: true, tier: API_KEY_TIERS.pro };
  }

  if (validKeys.includes(apiKey)) {
    return { valid: true, tier: API_KEY_TIERS.basic };
  }

  return { valid: false, tier: API_KEY_TIERS.free, error: "Invalid API key" };
}
