"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { JSONContent } from "@tiptap/core";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "./tiptap-editor";
import { FiveImageGrid } from "./five-image-grid";
import { SeoPanel } from "./seo-panel";
import { PublishControls } from "./publish-controls";
import { checkReadyForReview } from "@/lib/validation/article-rules";
import type { Article, ArticleImage, ArticleStatus, Category, Tag } from "@/lib/types";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "ड्राफ्ट",
  in_review: "समीक्षा में",
  scheduled: "शेड्यूल्ड",
  published: "प्रकाशित",
  archived: "आर्काइव्ड",
};

interface ComposerShellProps {
  article: Article;
  initialImages: ArticleImage[];
  categories: Category[];
  tags: Tag[];
  initialTagIds: string[];
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export function ComposerShell({
  article,
  initialImages,
  categories,
  tags,
  initialTagIds,
}: ComposerShellProps) {
  const router = useRouter();
  const [headline, setHeadline] = useState(article.headline);
  const [dek, setDek] = useState(article.dek ?? "");
  const [slug, setSlug] = useState(article.slug);
  const [categoryId, setCategoryId] = useState(article.category_id);
  const [cityTag, setCityTag] = useState(article.city_tag ?? "");
  const [guestAuthorName, setGuestAuthorName] = useState(article.guest_author_name ?? "");
  const [body, setBody] = useState<JSONContent>(
    Object.keys(article.body ?? {}).length ? (article.body as JSONContent) : EMPTY_DOC
  );
  const [tagIds, setTagIds] = useState<string[]>(initialTagIds);
  const [seoTitle, setSeoTitle] = useState(article.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(article.seo_description ?? "");
  const [focusKeyword, setFocusKeyword] = useState(article.focus_keyword ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(article.canonical_url ?? "");
  const [robotsIndex, setRobotsIndex] = useState(article.robots_index);
  const [isBreaking, setIsBreaking] = useState(article.is_breaking);
  const [images, setImages] = useState<ArticleImage[]>(initialImages);
  const [status, setStatus] = useState<ArticleStatus>(article.status);

  const dirtyRef = useRef(false);
  const markDirty = () => {
    dirtyRef.current = true;
  };

  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = {
      headline,
      dek,
      slug,
      category_id: categoryId,
      city_tag: cityTag || null,
      guest_author_name: guestAuthorName || null,
      body,
      tag_ids: tagIds,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      focus_keyword: focusKeyword || null,
      canonical_url: canonicalUrl || null,
      robots_index: robotsIndex,
      is_breaking: isBreaking,
    };
  });

  async function save() {
    if (!dirtyRef.current) return;
    dirtyRef.current = false;
    await fetch(`/api/admin/articles/${article.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stateRef.current),
    });
  }

  useEffect(() => {
    const id = setInterval(save, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const readiness = checkReadyForReview(images);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <Input
            value={headline}
            onChange={(e) => {
              setHeadline(e.target.value);
              markDirty();
            }}
            className="text-xl font-semibold"
            placeholder="शीर्षक"
          />
          <p className="text-xs text-muted-foreground">{headline.length} अक्षर (सुझाव: 50-70)</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{STATUS_LABELS[status]}</Badge>
          <button
            type="button"
            onClick={async () => {
              markDirty();
              await save();
              toast.success("सेव हो गया");
            }}
            className="text-xs text-muted-foreground underline"
          >
            अभी सेव करें
          </button>
        </div>
      </div>

      <Tabs defaultValue="story">
        <TabsList>
          <TabsTrigger value="story">स्टोरी</TabsTrigger>
          <TabsTrigger value="images">
            छवियाँ {readiness.ready ? "✓" : `(${images.length}/5)`}
          </TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="publish">प्रकाशन</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="space-y-4">
          <div className="space-y-2">
            <Label>देक / उप-शीर्षक</Label>
            <Textarea
              value={dek}
              onChange={(e) => {
                setDek(e.target.value);
                markDirty();
              }}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>श्रेणी *</Label>
              <Select
                value={categoryId}
                onValueChange={(v) => {
                  setCategoryId(v);
                  markDirty();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_hi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>शहर / राज्य टैग</Label>
              <Input
                value={cityTag}
                onChange={(e) => {
                  setCityTag(e.target.value);
                  markDirty();
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>URL स्लग</Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                markDirty();
              }}
            />
            <p className="text-xs text-muted-foreground">
              /{selectedCategory?.slug ?? "…"}/{slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label>गेस्ट बायलाइन (वैकल्पिक)</Label>
            <Input
              value={guestAuthorName}
              onChange={(e) => {
                setGuestAuthorName(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>टैग (अधिकतम 6)</Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setTagIds((prev) =>
                        active ? prev.filter((id) => id !== tag.id) : [...prev, tag.id].slice(0, 6)
                      );
                      markDirty();
                    }}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      active ? "bg-brand text-brand-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>मुख्य लेख</Label>
            <TiptapEditor
              content={body}
              onChange={(json) => {
                setBody(json);
                markDirty();
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="images">
          {!readiness.ready ? (
            <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-medium">प्रकाशन/समीक्षा से पहले पूरा करें:</p>
              <ul className="ml-4 list-disc">
                {readiness.missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <FiveImageGrid articleId={article.id} images={images} onChange={setImages} />
        </TabsContent>

        <TabsContent value="seo">
          <SeoPanel
            headline={headline}
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            focusKeyword={focusKeyword}
            canonicalUrl={canonicalUrl}
            robotsIndex={robotsIndex}
            slug={slug}
            categorySlug={selectedCategory?.slug ?? ""}
            onChange={(fields) => {
              if (fields.seo_title !== undefined) setSeoTitle(fields.seo_title);
              if (fields.seo_description !== undefined) setSeoDescription(fields.seo_description);
              if (fields.focus_keyword !== undefined) setFocusKeyword(fields.focus_keyword);
              if (fields.canonical_url !== undefined) setCanonicalUrl(fields.canonical_url);
              if (fields.robots_index !== undefined) setRobotsIndex(fields.robots_index);
              markDirty();
            }}
          />
        </TabsContent>

        <TabsContent value="publish">
          <PublishControls
            articleId={article.id}
            status={status}
            isBreaking={isBreaking}
            onBreakingChange={(value) => {
              setIsBreaking(value);
              markDirty();
            }}
            onBeforeTransition={async () => {
              markDirty();
              await save();
            }}
            onStatusChanged={(nextStatus) => {
              setStatus(nextStatus);
              router.refresh();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
