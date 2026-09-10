import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";

const EDITABLE_FIELDS = [
  "headline",
  "dek",
  "slug",
  "body",
  "category_id",
  "city_tag",
  "author_id",
  "guest_author_name",
  "is_breaking",
  "seo_title",
  "seo_description",
  "focus_keyword",
  "canonical_url",
  "og_image_id",
  "robots_index",
] as const;

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/articles/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = body[field];
  }
  // Never trust client-side sanitization alone - a raw slug with spaces/
  // punctuation breaks the public URL (this is what caused the 404s).
  if (typeof update.slug === "string") {
    const cleaned = slugify(update.slug);
    if (!cleaned) return NextResponse.json({ error: "अमान्य स्लग" }, { status: 400 });
    update.slug = cleaned;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("articles")
    .select("slug, status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("articles")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Published article's slug changed - leave a redirect from the old path so
  // any existing inbound links/search results don't 404.
  if (
    existing &&
    existing.status === "published" &&
    typeof update.slug === "string" &&
    update.slug !== existing.slug
  ) {
    const { data: category } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", data.category_id)
      .single();
    if (category) {
      await supabase.from("redirects").upsert(
        {
          old_slug: `/${category.slug}/${existing.slug}`,
          new_slug: `/${category.slug}/${update.slug}`,
        },
        { onConflict: "old_slug" }
      );
    }
  }

  if (Array.isArray(body.tag_ids)) {
    await supabase.from("article_tags").delete().eq("article_id", id);
    if (body.tag_ids.length > 0) {
      await supabase
        .from("article_tags")
        .insert(body.tag_ids.map((tagId: string) => ({ article_id: id, tag_id: tagId })));
    }
  }

  return NextResponse.json(data);
}

// Published articles can't be deleted outright - archive first (preserves
// the URL/redirect trail). Everything else (draft, in_review, scheduled,
// archived) can go straight away.
export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/articles/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("status")
    .eq("id", id)
    .single();

  if (!article) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  if (article.status === "published") {
    return NextResponse.json(
      { error: "प्रकाशित स्टोरी को सीधे हटाया नहीं जा सकता - पहले आर्काइव करें।" },
      { status: 422 }
    );
  }

  const { data: images } = await supabase
    .from("article_images")
    .select("storage_path, thumbnail_path, card_path")
    .eq("article_id", id);

  const paths = (images ?? []).flatMap((img) =>
    [img.storage_path, img.thumbnail_path, img.card_path].filter(Boolean)
  );
  if (paths.length > 0) {
    await supabase.storage.from("article-images").remove(paths);
  }
  // Inline body images live under a separate prefix, not tracked as
  // article_images rows - list and remove them too.
  const { data: bodyFiles } = await supabase.storage.from("article-images").list(`${id}/body`);
  if (bodyFiles && bodyFiles.length > 0) {
    await supabase.storage
      .from("article-images")
      .remove(bodyFiles.map((f) => `${id}/body/${f.name}`));
  }

  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
