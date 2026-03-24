import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";

type SupportedLanguage = "javascript" | "typescript" | "json" | "html" | "css" | "python" | "sql";

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  "javascript", "typescript", "json", "html", "css", "python", "sql",
];

function formatJSON(code: string, indent: number): string {
  const parsed = JSON.parse(code);
  return JSON.stringify(parsed, null, indent);
}

function formatSQL(code: string): string {
  const keywords = [
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN",
    "OUTER JOIN", "ON", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING",
    "LIMIT", "OFFSET", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
    "CREATE TABLE", "ALTER TABLE", "DROP TABLE", "CREATE INDEX", "UNION",
    "CASE", "WHEN", "THEN", "ELSE", "END", "AS", "IN", "NOT", "NULL",
    "IS", "LIKE", "BETWEEN", "EXISTS", "DISTINCT", "COUNT", "SUM", "AVG",
    "MIN", "MAX",
  ];

  let formatted = code.replace(/\s+/g, " ").trim();

  for (const kw of keywords) {
    const regex = new RegExp(`\\b${kw}\\b`, "gi");
    formatted = formatted.replace(regex, kw);
  }

  const breakBefore = ["SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "RIGHT JOIN",
    "INNER JOIN", "ORDER BY", "GROUP BY", "HAVING", "LIMIT", "UNION"];
  for (const kw of breakBefore) {
    formatted = formatted.replace(new RegExp(`\\s+${kw}\\b`, "g"), `\n${kw}`);
  }

  const indentAfter = ["SELECT", "FROM", "WHERE", "SET"];
  const lines = formatted.split("\n");
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (indentAfter.some((kw) => trimmed.startsWith(kw))) {
      result.push(trimmed);
    } else {
      result.push("  " + trimmed);
    }
  }

  return result.join("\n");
}

function formatJSTS(code: string, indent: number): string {
  const indentStr = " ".repeat(indent);
  let depth = 0;
  const lines = code.split("\n");
  const result: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }

    if (trimmed.startsWith("}") || trimmed.startsWith("]") || trimmed.startsWith(")")) {
      depth = Math.max(0, depth - 1);
    }

    result.push(indentStr.repeat(depth) + trimmed);

    const opens = (trimmed.match(/[{[(]/g) || []).length;
    const closes = (trimmed.match(/[}\])]/g) || []).length;
    depth += opens - closes;
    if (depth < 0) depth = 0;
  }

  return result.join("\n");
}

function formatCSS(code: string, indent: number): string {
  const indentStr = " ".repeat(indent);
  let formatted = code.replace(/\s*\{\s*/g, " {\n" + indentStr);
  formatted = formatted.replace(/\s*;\s*/g, ";\n" + indentStr);
  formatted = formatted.replace(/\s*\}\s*/g, "\n}\n\n");
  formatted = formatted.replace(new RegExp(`${indentStr}\\}`, "g"), "}");
  formatted = formatted.replace(/\n{3,}/g, "\n\n");
  return formatted.trim();
}

function formatHTML(code: string, indent: number): string {
  const indentStr = " ".repeat(indent);
  let depth = 0;
  const tags = code.replace(/>\s*</g, ">\n<").split("\n");
  const result: string[] = [];

  for (const rawTag of tags) {
    const trimmed = rawTag.trim();
    if (!trimmed) continue;

    const isClosing = /^<\//.test(trimmed);
    const isSelfClosing = /\/>$/.test(trimmed);

    if (isClosing) depth = Math.max(0, depth - 1);
    result.push(indentStr.repeat(depth) + trimmed);
    if (!isClosing && !isSelfClosing && /^<[^!]/.test(trimmed)) depth++;
  }

  return result.join("\n");
}

function formatPython(code: string, indent: number): string {
  const indentStr = " ".repeat(indent);
  const lines = code.split("\n");
  const result: string[] = [];
  let depth = 0;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }

    const dedentKeywords = ["return", "break", "continue", "pass", "raise"];
    if (dedentKeywords.some((kw) => trimmed === kw || trimmed.startsWith(kw + " "))) {
      // keep current depth
    }

    if (
      trimmed.startsWith("elif ") ||
      trimmed.startsWith("else:") ||
      trimmed.startsWith("except") ||
      trimmed.startsWith("finally:")
    ) {
      depth = Math.max(0, depth - 1);
    }

    result.push(indentStr.repeat(depth) + trimmed);

    if (trimmed.endsWith(":") && !trimmed.startsWith("#")) {
      depth++;
    }
  }

  return result.join("\n");
}

function formatCode(code: string, language: SupportedLanguage, indent: number): string {
  switch (language) {
    case "json":
      return formatJSON(code, indent);
    case "sql":
      return formatSQL(code);
    case "javascript":
    case "typescript":
      return formatJSTS(code, indent);
    case "css":
      return formatCSS(code, indent);
    case "html":
      return formatHTML(code, indent);
    case "python":
      return formatPython(code, indent);
    default:
      return code;
  }
}

async function handler(req: NextRequest) {
  const body = await req.json();
  const { code, language, indent = 2 } = body;

  if (!code) {
    return apiError("Missing 'code' parameter", 400);
  }

  if (!language) {
    return apiError("Missing 'language' parameter", 400);
  }

  if (!SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    return apiError(
      `Unsupported language: ${language}. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
      400
    );
  }

  if (code.length > 200_000) {
    return apiError("Code too long, max 200,000 characters", 413);
  }

  try {
    const formatted = formatCode(code, language as SupportedLanguage, indent);
    return apiSuccess({
      formatted,
      language,
      original_length: code.length,
      formatted_length: formatted.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Format error";
    return apiError(`Failed to format: ${message}`, 422);
  }
}

export const POST = withApiAuth(handler, "code/format");
