import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, apiError, type ApiContext } from "@/lib/api";

interface ModelPricing {
  name: string;
  provider: string;
  input_per_1m: number;
  output_per_1m: number;
  context_window: number;
}

const MODEL_PRICING: Record<string, ModelPricing> = {
  "gpt-4o": { name: "GPT-4o", provider: "OpenAI", input_per_1m: 2.5, output_per_1m: 10, context_window: 128000 },
  "gpt-4o-mini": { name: "GPT-4o Mini", provider: "OpenAI", input_per_1m: 0.15, output_per_1m: 0.6, context_window: 128000 },
  "gpt-4-turbo": { name: "GPT-4 Turbo", provider: "OpenAI", input_per_1m: 10, output_per_1m: 30, context_window: 128000 },
  "gpt-4": { name: "GPT-4", provider: "OpenAI", input_per_1m: 30, output_per_1m: 60, context_window: 8192 },
  "gpt-3.5-turbo": { name: "GPT-3.5 Turbo", provider: "OpenAI", input_per_1m: 0.5, output_per_1m: 1.5, context_window: 16385 },
  "claude-3.5-sonnet": { name: "Claude 3.5 Sonnet", provider: "Anthropic", input_per_1m: 3, output_per_1m: 15, context_window: 200000 },
  "claude-3-opus": { name: "Claude 3 Opus", provider: "Anthropic", input_per_1m: 15, output_per_1m: 75, context_window: 200000 },
  "claude-3-haiku": { name: "Claude 3 Haiku", provider: "Anthropic", input_per_1m: 0.25, output_per_1m: 1.25, context_window: 200000 },
  "gemini-1.5-pro": { name: "Gemini 1.5 Pro", provider: "Google", input_per_1m: 1.25, output_per_1m: 5, context_window: 2000000 },
  "gemini-1.5-flash": { name: "Gemini 1.5 Flash", provider: "Google", input_per_1m: 0.075, output_per_1m: 0.3, context_window: 1000000 },
  "deepseek-v3": { name: "DeepSeek V3", provider: "DeepSeek", input_per_1m: 0.27, output_per_1m: 1.1, context_window: 65536 },
  "llama-3.1-405b": { name: "Llama 3.1 405B", provider: "Meta", input_per_1m: 3, output_per_1m: 3, context_window: 131072 },
};

interface PricingResult {
  model: string;
  provider: string;
  input_tokens: number;
  output_tokens: number;
  input_cost: number;
  output_cost: number;
  total_cost: number;
  currency: string;
}

async function handler(req: NextRequest, ctx: ApiContext) {
  let inputTokens: number;
  let outputTokens: number;
  let models: string[];

  if (req.method === "POST") {
    const body = await req.json();
    inputTokens = body.input_tokens;
    outputTokens = body.output_tokens || 0;
    models = body.models || Object.keys(MODEL_PRICING);
  } else {
    inputTokens = Number(req.nextUrl.searchParams.get("input_tokens") || 0);
    outputTokens = Number(req.nextUrl.searchParams.get("output_tokens") || 0);
    const modelParam = req.nextUrl.searchParams.get("models");
    models = modelParam ? modelParam.split(",") : Object.keys(MODEL_PRICING);
  }

  if (!inputTokens || inputTokens <= 0) {
    return apiError("Missing or invalid 'input_tokens' parameter", 400);
  }

  const results: PricingResult[] = [];
  const unknownModels: string[] = [];

  for (const model of models) {
    const pricing = MODEL_PRICING[model.trim()];
    if (!pricing) {
      unknownModels.push(model.trim());
      continue;
    }

    const inputCost = (inputTokens / 1_000_000) * pricing.input_per_1m;
    const outputCost = (outputTokens / 1_000_000) * pricing.output_per_1m;

    results.push({
      model: model.trim(),
      provider: pricing.provider,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      input_cost: Math.round(inputCost * 1_000_000) / 1_000_000,
      output_cost: Math.round(outputCost * 1_000_000) / 1_000_000,
      total_cost: Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000,
      currency: "USD",
    });
  }

  results.sort((a, b) => a.total_cost - b.total_cost);

  return apiSuccess(
    { pricing: results, available_models: Object.keys(MODEL_PRICING) },
    {
      tier: ctx.tier.name,
      ...(unknownModels.length > 0 && { unknown_models: unknownModels }),
    }
  );
}

export const POST = withApiAuth(handler, "pricing/calculate");
export const GET = withApiAuth(handler, "pricing/calculate");
