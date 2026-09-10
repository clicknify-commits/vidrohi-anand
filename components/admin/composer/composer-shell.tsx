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
import { slugify } from "@/lib/utils/slugify";
import { useLanguage } from "@/components/admin/language-provider";
import type { Article, ArticleImage, ArticleStatus, Author, Category, Tag } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const STATUS_KEYS: Record<ArticleStatus, TranslationKey> = {
  draft: "status.draft",
  in_review: "status.in_review",
  scheduled: "status.scheduled",
  published: "status.published",
  archived: "status.archived",
};

interface ComposerShellProps {
  article: Article;
  initialImages: ArticleImage[];
  categories: Category[];
  tags: Tag[];
  authors: Author[];
  initialTagIds: string[];
}

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

export function ComposerShell({
  article,
  initialImages,
  categories,
  tags,
  authors,
  initialTagIds,
}: ComposerShellProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [headline, setHeadline] = useState(article.headline);
  const [dek, setDek] = useState(article.dek ?? "");
  const [slug, setSlug] = useState(article.slug);
  const slugTouchedRef = useRef(!/^untitled-[a-z0-9]+$/.test(article.slug));
  const [categoryId, setCategoryId] = useState(article.category_id);
  const [cityTag, setCityTag] = useState(article.city_tag ?? "");
  const [authorId, setAuthorId] = useState(article.author_id ?? "");
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
      author_id: authorId || null,
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
              if (!slugTouchedRef.current) {
                setSlug(slugify(e.target.value));
              }
              markDirty();
            }}
            className="text-xl font-semibold"
            placeholder={t("composer.headlinePlaceholder")}
          />
          <p className="text-xs text-muted-foreground">
            {headline.length} {t("composer.charsSuggestion")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{t(STATUS_KEYS[status])}</Badge>
          <button
            type="button"
            onClick={async () => {
              markDirty();
              await save();
              toast.success(t("composer.saved"));
            }}
            className="text-xs text-muted-foreground underline"
          >
            {t("composer.saveNow")}
          </button>
        </div>
      </div>

      <Tabs defaultValue="story">
        <TabsList>
          <TabsTrigger value="story">{t("composer.tabStory")}</TabsTrigger>
          <TabsTrigger value="images">
            {t("composer.tabImages")} {readiness.ready ? "✓" : `(${images.length}/5)`}
          </TabsTrigger>
          <TabsTrigger value="seo">{t("composer.tabSeo")}</TabsTrigger>
          <TabsTrigger value="publish">{t("composer.tabPublish")}</TabsTrigger>
        </TabsList>

        <TabsContent value="story" className="space-y-4">
          <div className="space-y-2">
            <Label>{t("composer.dek")}</Label>
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
              <Label>{t("composer.categoryRequired")}</Label>
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
              <Label>{t("composer.cityTag")}</Label>
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
            <Label>{t("composer.slug")}</Label>
            <Input
              value={slug}
              onChange={(e) => {
                slugTouchedRef.current = true;
                setSlug(slugify(e.target.value));
                markDirty();
              }}
            />
            <p className="text-xs text-muted-foreground">
              /{selectedCategory?.slug ?? "…"}/{slug}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("composer.author")}</Label>
            <Select
              value={authorId || "none"}
              onValueChange={(v) => {
                setAuthorId(v === "none" ? "" : v);
                markDirty();
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("composer.authorNone")}</SelectItem>
                {authors.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("composer.guestByline")}</Label>
            <Input
              value={guestAuthorName}
              onChange={(e) => {
                setGuestAuthorName(e.target.value);
                markDirty();
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("composer.tagsMax")}</Label>
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
            <Label>{t("composer.body")}</Label>
            <TiptapEditor
              articleId={article.id}
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
              <p className="font-medium">{t("composer.beforePublish")}</p>
              <ul className="ml-4 list-disc">
                {readiness.missing.map((m) => (
                  <li key={`${m.key}-${m.position}`}>{t(m.key, { position: m.position })}</li>
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
