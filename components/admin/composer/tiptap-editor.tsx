"use client";

import { useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { toast } from "sonner";
import { editorExtensions } from "@/lib/editor/extensions";
import { useLanguage } from "@/components/admin/language-provider";
import { Button } from "@/components/ui/button";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading2,
  Heading3,
  Quote,
  TextQuote,
  List,
  ListOrdered,
  Table as TableIcon,
  Link as LinkIcon,
  ImagePlus,
} from "lucide-react";

interface TiptapEditorProps {
  articleId: string;
  content: JSONContent;
  onChange: (json: JSONContent) => void;
}

function extractImageFiles(fileList: FileList | null | undefined): File[] {
  if (!fileList) return [];
  return Array.from(fileList).filter((file) => file.type.startsWith("image/"));
}

function replaceNodeByTempId(editor: Editor, tempId: string, attrs: Record<string, unknown>) {
  const { state, view } = editor;
  let targetPos: number | null = null;
  state.doc.descendants((node, pos) => {
    if (node.type.name === "image" && node.attrs.tempId === tempId) {
      targetPos = pos;
      return false;
    }
    return true;
  });
  if (targetPos === null) return;
  const node = state.doc.nodeAt(targetPos);
  if (!node) return;
  view.dispatch(state.tr.setNodeMarkup(targetPos, undefined, { ...node.attrs, ...attrs }));
}

function removeNodeByTempId(editor: Editor, tempId: string) {
  const { state, view } = editor;
  let targetPos: number | null = null;
  let nodeSize = 0;
  state.doc.descendants((node, pos) => {
    if (node.type.name === "image" && node.attrs.tempId === tempId) {
      targetPos = pos;
      nodeSize = node.nodeSize;
      return false;
    }
    return true;
  });
  if (targetPos === null) return;
  view.dispatch(state.tr.delete(targetPos, targetPos + nodeSize));
}

export function TiptapEditor({ articleId, content, onChange }: TiptapEditorProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: editorExtensions,
    content,
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[300px] focus:outline-none",
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const files = extractImageFiles(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        const pos = coords?.pos ?? view.state.selection.from;
        files.forEach((file, i) => uploadAndInsert(file, pos + i));
        return true;
      },
      handlePaste(_view, event) {
        const files = extractImageFiles(event.clipboardData?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => uploadAndInsert(file));
        return true;
      },
    },
  });

  function uploadAndInsert(file: File, atPos?: number) {
    if (!editor) return;
    const tempId = crypto.randomUUID();
    const blobUrl = URL.createObjectURL(file);
    const attrs = { src: blobUrl, alt: file.name, uploading: true, tempId };

    if (atPos !== undefined) {
      editor.chain().focus().insertContentAt(atPos, { type: "image", attrs }).run();
    } else {
      editor.chain().focus().setImage(attrs).run();
    }

    const formData = new FormData();
    formData.append("articleId", articleId);
    formData.append("file", file);

    fetch("/api/admin/images/inline", { method: "POST", body: formData })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? t("editor.imageUploadFailed"));
        replaceNodeByTempId(editor, tempId, { src: data.url, uploading: false, tempId: null });
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        removeNodeByTempId(editor, tempId);
        URL.revokeObjectURL(blobUrl);
        toast.error(t("editor.imageUploadFailed"));
      });
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) uploadAndInsert(file);
  }

  if (!editor) return null;

  return (
    <div className="rounded-md border">
      <div className="flex flex-wrap gap-1 border-b p-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("pullQuote")}
          onClick={() => editor.chain().focus().toggleNode("pullQuote", "paragraph").run()}
        >
          <TextQuote className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
        >
          <TableIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive("link")}
          onClick={() => {
            const url = window.prompt(t("editor.linkPrompt"));
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            } else {
              editor.chain().focus().unsetLink().run();
            }
          }}
        >
          <LinkIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="size-4" />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />
      </div>
      <EditorContent editor={editor} className="p-3" />
      <p className="border-t px-3 py-1.5 text-[11px] text-muted-foreground">{t("editor.dropHint")}</p>
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "secondary" : "ghost"}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
