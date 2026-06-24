import { NextResponse } from "next/server";

const API_DOCS = {
  openapi: "3.0.3",
  info: {
    title: "VicNail Studio Developer API",
    version: "1.0.0",
    description:
      "Practical developer tools API: token counting, pricing calculation, code formatting, text analysis, and markdown conversion. All endpoints require an API key via x-api-key header, Authorization Bearer token, or api_key query parameter.",
    contact: { url: "https://vicnail.com" },
  },
  servers: [{ url: "/api/v1", description: "API v1" }],
  security: [{ apiKey: [] }],
  components: {
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API key for authentication",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          data: { type: "object" },
          meta: { type: "object" },
        },
      },
    },
  },
  paths: {
    "/tokens/count": {
      post: {
        summary: "Count tokens",
        description:
          "Estimate token count for text across multiple LLM models (GPT-4o, Claude, Gemini, etc.)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: {
                    type: "string",
                    description: "Text to count tokens for (max 500,000 characters)",
                  },
                },
              },
              example: { text: "Hello, world! 你好世界！" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token count results",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    text_length: 18,
                    word_count: 6,
                    estimated_tokens: 8,
                    model_estimates: {
                      "gpt-4o": 8,
                      "claude-3.5-sonnet": 9,
                      "gemini-pro": 7,
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        summary: "Count tokens (GET)",
        parameters: [
          {
            name: "text",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { "200": { description: "Token count results" } },
      },
    },
    "/pricing/calculate": {
      post: {
        summary: "Calculate LLM pricing",
        description:
          "Calculate cost for using different LLM models based on token counts",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["input_tokens"],
                properties: {
                  input_tokens: { type: "number", description: "Number of input tokens" },
                  output_tokens: { type: "number", description: "Number of output tokens", default: 0 },
                  models: {
                    type: "array",
                    items: { type: "string" },
                    description: "Model IDs to calculate pricing for (defaults to all models)",
                  },
                },
              },
              example: { input_tokens: 1000, output_tokens: 500 },
            },
          },
        },
        responses: {
          "200": { description: "Pricing calculation results sorted by cost" },
        },
      },
    },
    "/code/format": {
      post: {
        summary: "Format code",
        description:
          "Format code in various languages: JavaScript, TypeScript, JSON, HTML, CSS, Python, SQL",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "language"],
                properties: {
                  code: { type: "string", description: "Code to format (max 200,000 chars)" },
                  language: {
                    type: "string",
                    enum: ["javascript", "typescript", "json", "html", "css", "python", "sql"],
                  },
                  indent: { type: "number", default: 2, description: "Indentation spaces" },
                },
              },
              example: {
                code: '{"name":"test","value":123}',
                language: "json",
                indent: 2,
              },
            },
          },
        },
        responses: { "200": { description: "Formatted code" } },
      },
    },
    "/text/analyze": {
      post: {
        summary: "Analyze text",
        description:
          "Comprehensive text analysis: character/word/sentence counts, language detection, readability metrics, word frequency",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["text"],
                properties: {
                  text: { type: "string", description: "Text to analyze (max 1,000,000 chars)" },
                },
              },
              example: { text: "這是一段測試文字。This is a test." },
            },
          },
        },
        responses: { "200": { description: "Text analysis results" } },
      },
    },
    "/markdown/convert": {
      post: {
        summary: "Convert Markdown",
        description: "Convert Markdown to HTML, plain text, or JSON AST",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["markdown"],
                properties: {
                  markdown: { type: "string", description: "Markdown content (max 500,000 chars)" },
                  format: {
                    type: "string",
                    enum: ["html", "plaintext", "json-ast"],
                    default: "html",
                  },
                },
              },
              example: { markdown: "# Hello\n\nThis is **bold** text.", format: "html" },
            },
          },
        },
        responses: { "200": { description: "Converted output" } },
      },
    },
    "/usage": {
      get: {
        summary: "View API usage",
        description: "View your API usage statistics and rate limit information",
        parameters: [
          {
            name: "period",
            in: "query",
            schema: {
              type: "string",
              enum: ["hour", "day", "week", "month", "all"],
              default: "all",
            },
          },
        ],
        responses: { "200": { description: "Usage statistics" } },
      },
    },
  },
  "x-rateLimit": {
    tiers: {
      free: { requests_per_minute: 30, description: "Demo/free tier" },
      basic: { requests_per_minute: 100, description: "Basic paid tier" },
      pro: { requests_per_minute: 500, description: "Professional tier" },
    },
  },
};

export async function GET() {
  return NextResponse.json(API_DOCS, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
