import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: [
      {
        path: "/api/v1/tokens/count",
        methods: ["GET", "POST"],
        description: "Count and estimate tokens for LLM models",
      },
      {
        path: "/api/v1/pricing/calculate",
        methods: ["GET", "POST"],
        description: "Calculate LLM API pricing for different models",
      },
      {
        path: "/api/v1/code/format",
        methods: ["POST"],
        description: "Format code in various languages",
      },
      {
        path: "/api/v1/text/analyze",
        methods: ["GET", "POST"],
        description: "Analyze text: word count, readability, language detection",
      },
      {
        path: "/api/v1/markdown/convert",
        methods: ["POST"],
        description: "Convert Markdown to HTML, plaintext, or JSON AST",
      },
      {
        path: "/api/v1/usage",
        methods: ["GET"],
        description: "View API usage statistics",
      },
    ],
    documentation: "/api/v1/docs",
  });
}
