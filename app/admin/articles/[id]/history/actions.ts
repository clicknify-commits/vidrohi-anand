"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function restoreRevision(formData: FormData) {
  const articleId = String(formData.get("articleId") ?? "");
  const revisionId = String(formData.get("revisionId") ?? "");
  if (!articleId || !revisionId) return;

  const supabase = await createClient();

  const { data: revision } = await supabase
    .from("article_revisions")
    .select("snapshot")
    .eq("id", revisionId)
    .single();

  if (!revision) return;

  const snapshot = revision.snapshot as Record<string, unknown>;

  const { data: current } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("id").eq("user_id", user.id).single()
    : { data: null };

  // Snapshot the current state first, so restoring is itself undoable.
  if (current) {
    await supabase.from("article_revisions").insert({
      article_id: articleId,
      snapshot: current,
      created_by: profile?.id ?? null,
    });
  }

  await supabase
    .from("articles")
    .update({
      headline: snapshot.headline,
      dek: snapshot.dek,
      slug: snapshot.slug,
      body: snapshot.body,
      category_id: snapshot.category_id,
      city_tag: snapshot.city_tag,
      author_id: snapshot.author_id,
      guest_author_name: snapshot.guest_author_name,
      is_breaking: snapshot.is_breaking,
      seo_title: snapshot.seo_title,
      seo_description: snapshot.seo_description,
      focus_keyword: snapshot.focus_keyword,
      canonical_url: snapshot.canonical_url,
      robots_index: snapshot.robots_index,
    })
    .eq("id", articleId);

  redirect(`/admin/articles/${articleId}`);
}
