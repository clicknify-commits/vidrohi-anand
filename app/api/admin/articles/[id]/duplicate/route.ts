import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";

export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/admin/articles/[id]/duplicate">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: original, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !original) {
    return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });
  }

  const newSlug = `${slugify(original.headline) || "story"}-follow-up-${Date.now().toString(36)}`;

  const { data: created, error: insertError } = await supabase
    .from("articles")
    .insert({
      headline: original.headline,
      dek: original.dek,
      slug: newSlug,
      body: original.body,
      category_id: original.category_id,
      city_tag: original.city_tag,
      status: "draft",
      author_id: original.author_id,
      guest_author_name: original.guest_author_name,
      is_breaking: false,
      seo_title: original.seo_title,
      seo_description: original.seo_description,
      focus_keyword: original.focus_keyword,
      robots_index: original.robots_index,
    })
    .select()
    .single();

  if (insertError || !created) {
    return NextResponse.json({ error: insertError?.message ?? "बनाने में विफल" }, { status: 500 });
  }

  const { data: images } = await supabase
    .from("article_images")
    .select("*")
    .eq("article_id", id);

  if (images && images.length > 0) {
    await supabase.from("article_images").insert(
      images.map((img) => ({
        article_id: created.id,
        position: img.position,
        storage_path: img.storage_path,
        thumbnail_path: img.thumbnail_path,
        card_path: img.card_path,
        original_path: img.original_path,
        width: img.width,
        height: img.height,
        alt_text: img.alt_text,
        caption: img.caption,
        credit: img.credit,
        focal_x: img.focal_x,
        focal_y: img.focal_y,
      }))
    );
  }

  const { data: articleTags } = await supabase
    .from("article_tags")
    .select("tag_id")
    .eq("article_id", id);

  if (articleTags && articleTags.length > 0) {
    await supabase
      .from("article_tags")
      .insert(articleTags.map((t) => ({ article_id: created.id, tag_id: t.tag_id })));
  }

  return NextResponse.json(created);
}
