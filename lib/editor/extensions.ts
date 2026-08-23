import { Node, mergeAttributes, type Extensions } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import TiptapImage from "@tiptap/extension-image";

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

// `uploading`/`tempId` are editor-only bookkeeping (find-and-replace the
// placeholder node once a drag/drop/paste upload finishes) - harmless no-ops
// once content is saved and re-rendered server-side.
export const ArticleImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      uploading: {
        default: false,
        renderHTML: (attrs) => (attrs.uploading ? { "data-uploading": "true" } : {}),
      },
      tempId: {
        default: null,
        renderHTML: (attrs) => (attrs.tempId ? { "data-temp-id": attrs.tempId } : {}),
      },
    };
  },
}).configure({ HTMLAttributes: { class: "rounded-md" } });

// Shared between the client editor and the server-side HTML renderer - both
// must build from the exact same schema or custom nodes like pullQuote won't
// round-trip correctly.
export const editorExtensions: Extensions = [
  StarterKit.configure({ link: { openOnClick: false, autolink: true } }),
  TableKit.configure({ table: { resizable: false } }),
  PullQuote,
  ArticleImage,
];
