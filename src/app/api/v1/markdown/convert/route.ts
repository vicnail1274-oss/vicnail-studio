import { NextRequest } from "next/server";
import { withApiAuth, apiSuccess, apiError } from "@/lib/api";

type ConvertFormat = "html" | "plaintext" | "json-ast";

function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (must be before inline code)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Links and images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Horizontal rule
  html = html.replace(/^[-*_]{3,}$/gm, "<hr />");

  // Unordered lists
  html = html.replace(/^[-*+]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>\n${match}</ul>\n`);

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Tables
  html = html.replace(
    /^(\|.+\|)\n(\|[-:\s|]+\|)\n((?:\|.+\|\n?)+)/gm,
    (_match, header, _separator, body) => {
      const headerCells = header.split("|").filter((c: string) => c.trim());
      const headerHtml = headerCells
        .map((c: string) => `<th>${c.trim()}</th>`)
        .join("");
      const rows = body.trim().split("\n");
      const bodyHtml = rows
        .map((row: string) => {
          const cells = row.split("|").filter((c: string) => c.trim());
          return `<tr>${cells.map((c: string) => `<td>${c.trim()}</td>`).join("")}</tr>`;
        })
        .join("\n");
      return `<table>\n<thead><tr>${headerHtml}</tr></thead>\n<tbody>\n${bodyHtml}\n</tbody>\n</table>`;
    }
  );

  // Paragraphs
  html = html.replace(/^(?!<[a-z]|$)(.+)$/gm, "<p>$1</p>");

  // Line breaks
  html = html.replace(/\n{2,}/g, "\n");

  return html.trim();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markdownToPlaintext(md: string): string {
  let text = md;
  text = text.replace(/```\w*\n[\s\S]*?```/g, (match) => {
    return match.replace(/```\w*\n?/g, "").replace(/```/g, "");
  });
  text = text.replace(/`([^`]+)`/g, "$1");
  text = text.replace(/^#{1,6}\s+/gm, "");
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "$1");
  text = text.replace(/\*\*(.+?)\*\*/g, "$1");
  text = text.replace(/\*(.+?)\*/g, "$1");
  text = text.replace(/~~(.+?)~~/g, "$1");
  text = text.replace(/^>\s+/gm, "");
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/^[-*_]{3,}$/gm, "---");
  text = text.replace(/^[-*+]\s+/gm, "• ");
  text = text.replace(/^\d+\.\s+/gm, "");
  text = text.replace(/\|/g, " ");
  return text.trim();
}

interface MarkdownNode {
  type: string;
  content?: string;
  children?: MarkdownNode[];
  properties?: Record<string, string>;
}

function markdownToAst(md: string): MarkdownNode {
  const lines = md.split("\n");
  const children: MarkdownNode[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      children.push({ type: `heading${headerMatch[1].length}`, content: headerMatch[2] });
      continue;
    }

    if (/^```/.test(trimmed)) {
      children.push({ type: "code_block", content: trimmed });
      continue;
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      children.push({ type: "list_item", content: trimmed.replace(/^[-*+]\s+/, "") });
      continue;
    }

    if (/^>\s+/.test(trimmed)) {
      children.push({ type: "blockquote", content: trimmed.replace(/^>\s+/, "") });
      continue;
    }

    if (/^[-*_]{3,}$/.test(trimmed)) {
      children.push({ type: "horizontal_rule" });
      continue;
    }

    children.push({ type: "paragraph", content: trimmed });
  }

  return { type: "document", children };
}

async function handler(req: NextRequest) {
  const body = await req.json();
  const { markdown, format = "html" } = body;

  if (!markdown) {
    return apiError("Missing 'markdown' parameter", 400);
  }

  if (markdown.length > 500_000) {
    return apiError("Markdown too long, max 500,000 characters", 413);
  }

  const validFormats: ConvertFormat[] = ["html", "plaintext", "json-ast"];
  if (!validFormats.includes(format as ConvertFormat)) {
    return apiError(`Invalid format: ${format}. Supported: ${validFormats.join(", ")}`, 400);
  }

  let result: string | MarkdownNode;

  switch (format as ConvertFormat) {
    case "html":
      result = markdownToHtml(markdown);
      break;
    case "plaintext":
      result = markdownToPlaintext(markdown);
      break;
    case "json-ast":
      result = markdownToAst(markdown);
      break;
  }

  return apiSuccess({
    output: result,
    format,
    input_length: markdown.length,
    output_length: typeof result === "string" ? result.length : JSON.stringify(result).length,
  });
}

export const POST = withApiAuth(handler, "markdown/convert");
