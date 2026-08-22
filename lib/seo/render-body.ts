import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import { editorExtensions } from "@/lib/editor/extensions";

export function renderArticleBodyHtml(body: Record<string, unknown>): string {
  if (!body || Object.keys(body).length === 0) return "";
  return generateHTML(body as JSONContent, editorExtensions);
}
