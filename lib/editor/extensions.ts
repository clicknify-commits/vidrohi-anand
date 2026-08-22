import { Node, mergeAttributes, type Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";

// A pull-quote is visually distinct from a regular blockquote (larger, no
// citation semantics) - Tiptap/StarterKit has no stock node for it.
export const PullQuote = Node.create({
  name: "pullQuote",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "blockquote.pull-quote" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["blockquote", mergeAttributes(HTMLAttributes, { class: "pull-quote" }), 0];
  },
});

// Shared between the client editor and the server-side HTML renderer - both
// must build from the exact same schema or custom nodes like pullQuote won't
// round-trip correctly.
export const editorExtensions: Extensions = [
  StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
  TableKit.configure({ table: { resizable: false } }),
  PullQuote,
];
