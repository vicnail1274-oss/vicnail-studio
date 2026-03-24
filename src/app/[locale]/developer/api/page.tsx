import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Code2,
  Zap,
  Shield,
  BarChart3,
  DollarSign,
  FileText,
  Type,
  Terminal,
  Copy,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Developer API — 開發者工具 API",
  description:
    "Token 計數器、LLM 價格計算器、程式碼格式化、文字分析、Markdown 轉換 — 付費 API 服務",
};

const API_ENDPOINTS = [
  {
    id: "tokens",
    method: "POST",
    path: "/api/v1/tokens/count",
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    zh: {
      title: "Token 計數器",
      description: "估算不同 LLM 模型的 Token 數量，支援中日韓文字",
    },
    en: {
      title: "Token Counter",
      description: "Estimate token counts for various LLM models with CJK support",
    },
    example: {
      request: `curl -X POST /api/v1/tokens/count \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello 你好世界"}'`,
      response: `{
  "success": true,
  "data": {
    "text_length": 10,
    "word_count": 4,
    "estimated_tokens": 7,
    "model_estimates": {
      "gpt-4o": 7,
      "claude-3.5-sonnet": 8,
      "gemini-pro": 6
    }
  }
}`,
    },
  },
  {
    id: "pricing",
    method: "POST",
    path: "/api/v1/pricing/calculate",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    zh: {
      title: "LLM 價格計算器",
      description: "計算 12+ 個主流 LLM 模型的 API 費用，結果按價格排序",
    },
    en: {
      title: "LLM Pricing Calculator",
      description: "Calculate API costs for 12+ popular LLM models, sorted by price",
    },
    example: {
      request: `curl -X POST /api/v1/pricing/calculate \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"input_tokens": 10000, "output_tokens": 5000}'`,
      response: `{
  "success": true,
  "data": {
    "pricing": [
      {"model": "gemini-1.5-flash", "total_cost": 0.00225},
      {"model": "gpt-4o-mini", "total_cost": 0.0045},
      {"model": "gpt-4o", "total_cost": 0.075}
    ]
  }
}`,
    },
  },
  {
    id: "code-format",
    method: "POST",
    path: "/api/v1/code/format",
    icon: Code2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    zh: {
      title: "程式碼格式化",
      description: "支援 JS/TS/JSON/HTML/CSS/Python/SQL 七種語言格式化",
    },
    en: {
      title: "Code Formatter",
      description: "Format code in 7 languages: JS, TS, JSON, HTML, CSS, Python, SQL",
    },
    example: {
      request: `curl -X POST /api/v1/code/format \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"code": "{\\"a\\":1,\\"b\\":2}", "language": "json"}'`,
      response: `{
  "success": true,
  "data": {
    "formatted": "{\\n  \\"a\\": 1,\\n  \\"b\\": 2\\n}",
    "language": "json"
  }
}`,
    },
  },
  {
    id: "text-analyze",
    method: "POST",
    path: "/api/v1/text/analyze",
    icon: Type,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    zh: {
      title: "文字分析",
      description: "字數統計、語言偵測、可讀性分析、詞頻統計",
    },
    en: {
      title: "Text Analyzer",
      description: "Word count, language detection, readability metrics, frequency analysis",
    },
    example: {
      request: `curl -X POST /api/v1/text/analyze \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "這是測試文字。This is a test."}'`,
      response: `{
  "success": true,
  "data": {
    "word_count": 9,
    "sentence_count": 2,
    "reading_time_minutes": 0.1,
    "language_detection": {
      "primary": "chinese",
      "confidence": 38.46
    }
  }
}`,
    },
  },
  {
    id: "markdown",
    method: "POST",
    path: "/api/v1/markdown/convert",
    icon: FileText,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    zh: {
      title: "Markdown 轉換器",
      description: "將 Markdown 轉換為 HTML、純文字或 JSON AST",
    },
    en: {
      title: "Markdown Converter",
      description: "Convert Markdown to HTML, plain text, or JSON AST",
    },
    example: {
      request: `curl -X POST /api/v1/markdown/convert \\
  -H "x-api-key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Hello\\n**Bold** text", "format": "html"}'`,
      response: `{
  "success": true,
  "data": {
    "output": "<h1>Hello</h1>\\n<p><strong>Bold</strong> text</p>",
    "format": "html"
  }
}`,
    },
  },
];

const PRICING_TIERS = [
  {
    id: "free",
    zh: { name: "免費方案", price: "免費", cta: "立即開始" },
    en: { name: "Free", price: "Free", cta: "Get Started" },
    limits: "30 req/min",
    features: ["5 API endpoints", "30 requests/min", "Community support"],
    featuresZh: ["5 個 API 端點", "每分鐘 30 次請求", "社群支援"],
    highlighted: false,
  },
  {
    id: "basic",
    zh: { name: "基本方案", price: "$9.99/月", cta: "選擇方案" },
    en: { name: "Basic", price: "$9.99/mo", cta: "Choose Plan" },
    limits: "100 req/min",
    features: ["5 API endpoints", "100 requests/min", "Email support", "Usage analytics"],
    featuresZh: ["5 個 API 端點", "每分鐘 100 次請求", "Email 支援", "用量分析"],
    highlighted: true,
  },
  {
    id: "pro",
    zh: { name: "專業方案", price: "$29.99/月", cta: "聯繫我們" },
    en: { name: "Professional", price: "$29.99/mo", cta: "Contact Us" },
    limits: "500 req/min",
    features: ["5 API endpoints", "500 requests/min", "Priority support", "Advanced analytics", "Custom integrations"],
    featuresZh: ["5 個 API 端點", "每分鐘 500 次請求", "優先支援", "進階分析", "客製整合"],
    highlighted: false,
  },
];

export default async function DeveloperApiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === "zh-TW";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <Terminal className="h-4 w-4" />
            {isZh ? "開發者工具 API v1.0" : "Developer Tools API v1.0"}
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            {isZh ? (
              <>
                實用開發者{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  API 工具
                </span>
              </>
            ) : (
              <>
                Developer{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  API Tools
                </span>
              </>
            )}
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400">
            {isZh
              ? "Token 計數、LLM 價格計算、程式碼格式化、文字分析、Markdown 轉換 — 一站式開發者 API 服務，附帶速率限制與用量追蹤。"
              : "Token counting, LLM pricing, code formatting, text analysis, Markdown conversion — all-in-one developer API with rate limiting and usage tracking."}
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="/api/v1/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              {isZh ? "查看 API 文件" : "View API Docs"}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/api/v1/health"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-6 py-3 font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white"
            >
              {isZh ? "健康檢查" : "Health Check"}
            </a>
          </div>
        </div>
      </section>

      {/* Features overview */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                zh: { title: "API Key 驗證", desc: "安全的 API Key 認證，支援多種傳送方式" },
                en: { title: "API Key Auth", desc: "Secure API key authentication with multiple methods" },
              },
              {
                icon: BarChart3,
                zh: { title: "速率限制", desc: "分級速率限制，保障服務穩定性" },
                en: { title: "Rate Limiting", desc: "Tiered rate limits for service stability" },
              },
              {
                icon: Zap,
                zh: { title: "用量追蹤", desc: "即時監控 API 使用狀況與回應時間" },
                en: { title: "Usage Tracking", desc: "Real-time monitoring of API usage and response times" },
              },
            ].map((feat, i) => (
              <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <feat.icon className="mb-3 h-8 w-8 text-blue-400" />
                <h3 className="mb-2 text-lg font-semibold">{isZh ? feat.zh.title : feat.en.title}</h3>
                <p className="text-sm text-gray-400">{isZh ? feat.zh.desc : feat.en.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">
            {isZh ? "API 端點" : "API Endpoints"}
          </h2>
          <div className="space-y-8">
            {API_ENDPOINTS.map((ep) => {
              const t = isZh ? ep.zh : ep.en;
              return (
                <div
                  key={ep.id}
                  className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50"
                >
                  <div className="flex items-center gap-4 border-b border-gray-800 p-6">
                    <div className={cn("rounded-lg p-2", ep.bgColor)}>
                      <ep.icon className={cn("h-5 w-5", ep.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{t.title}</h3>
                      <p className="text-sm text-gray-400">{t.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-green-900/50 px-2 py-0.5 text-xs font-mono text-green-400">
                        {ep.method}
                      </span>
                      <code className="text-sm text-gray-400">{ep.path}</code>
                    </div>
                  </div>
                  <div className="grid gap-0 lg:grid-cols-2">
                    <div className="border-b border-gray-800 p-4 lg:border-b-0 lg:border-r">
                      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                        <Copy className="h-3 w-3" />
                        Request
                      </div>
                      <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">
                        <code>{ep.example.request}</code>
                      </pre>
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                        <ArrowRight className="h-3 w-3" />
                        Response
                      </div>
                      <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-green-400">
                        <code>{ep.example.response}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            {isZh ? "認證方式" : "Authentication"}
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <p className="mb-4 text-gray-400">
              {isZh
                ? "所有 API 端點都需要 API Key。支援以下三種傳送方式："
                : "All API endpoints require an API key. Three authentication methods are supported:"}
            </p>
            <div className="space-y-3">
              {[
                { label: "Header", code: 'x-api-key: YOUR_API_KEY' },
                { label: "Bearer Token", code: 'Authorization: Bearer YOUR_API_KEY' },
                { label: "Query Param", code: '?api_key=YOUR_API_KEY' },
              ].map((method, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-950 p-3">
                  <span className="w-28 text-sm font-medium text-blue-400">{method.label}</span>
                  <code className="text-sm text-gray-300">{method.code}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">
            {isZh ? "定價方案" : "Pricing"}
          </h2>
          <p className="mb-12 text-center text-gray-400">
            {isZh ? "選擇適合你的方案" : "Choose the plan that fits your needs"}
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {PRICING_TIERS.map((tier) => {
              const t = isZh ? tier.zh : tier.en;
              const features = isZh ? tier.featuresZh : tier.features;
              return (
                <div
                  key={tier.id}
                  className={cn(
                    "rounded-xl border p-6 transition",
                    tier.highlighted
                      ? "border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/50"
                      : "border-gray-800 bg-gray-900/50"
                  )}
                >
                  <h3 className="mb-2 text-xl font-semibold">{t.name}</h3>
                  <p className="mb-1 text-3xl font-bold">{t.price}</p>
                  <p className="mb-6 text-sm text-gray-500">{tier.limits}</p>
                  <ul className="mb-6 space-y-2">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={cn(
                      "w-full rounded-lg py-2.5 text-sm font-semibold transition",
                      tier.highlighted
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-gray-700 text-gray-300 hover:border-gray-500"
                    )}
                  >
                    {t.cta}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick start */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">
            {isZh ? "快速開始" : "Quick Start"}
          </h2>
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-blue-400">
                  {isZh ? "1. 取得 API Key" : "1. Get Your API Key"}
                </h3>
                <p className="text-sm text-gray-400">
                  {isZh
                    ? "使用免費的 demo key 開始體驗，或聯繫我們取得正式 key。"
                    : "Start with the free demo key, or contact us for a production key."}
                </p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-blue-400">
                  {isZh ? "2. 發送請求" : "2. Make a Request"}
                </h3>
                <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">
                  <code>{`curl -X POST ${isZh ? "https://your-domain.com" : "https://your-domain.com"}/api/v1/tokens/count \\
  -H "x-api-key: demo-key-vicnail-2024" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "${isZh ? "你好世界" : "Hello, World!"}'`}</code>
                </pre>
              </div>
              <div>
                <h3 className="mb-2 font-semibold text-blue-400">
                  {isZh ? "3. 查看用量" : "3. Check Usage"}
                </h3>
                <pre className="overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">
                  <code>{`curl ${isZh ? "https://your-domain.com" : "https://your-domain.com"}/api/v1/usage \\
  -H "x-api-key: demo-key-vicnail-2024"`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
