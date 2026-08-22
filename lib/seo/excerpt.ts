import type { JSONContent } from "@tiptap/core";

export function extractPlainText(body: Record<string, unknown>): string {
  const parts: string[] = [];

  function walk(node: JSONContent) {
    if (node.text) parts.push(node.text);
    node.content?.forEach(walk);
  }

  walk(body as JSONContent);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function excerpt(body: Record<string, unknown>, maxLength = 155): string {
  const text = extractPlainText(body);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
