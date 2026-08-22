import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComposerShell } from "@/components/admin/composer/composer-shell";
import type { Article, ArticleImage, Category, Tag } from "@/lib/types";

export default async function ArticleComposerPage(props: PageProps<"/admin/articles/[id]">) {
  const { id } = await props.params;
  const supabase = await createClient();

  const [{ data: article }, { data: images }, { data: categories }, { data: tags }, { data: articleTags }] =
    await Promise.all([
      supabase.from("articles").select("*").eq("id", id).single<Article>(),
      supabase
        .from("article_images")
        .select("*")
        .eq("article_id", id)
        .order("position")
        .returns<ArticleImage[]>(),
      supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
      supabase.from("tags").select("*").order("name").returns<Tag[]>(),
      supabase.from("article_tags").select("tag_id").eq("article_id", id),
    ]);

  if (!article) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/admin/articles" className="hover:underline">
          ← सभी स्टोरी
        </Link>
        <Link href={`/admin/articles/${id}/history`} className="hover:underline">
          वर्ज़न हिस्ट्री
        </Link>
      </div>
      <ComposerShell
        article={article}
        initialImages={images ?? []}
        categories={categories ?? []}
        tags={tags ?? []}
        initialTagIds={(articleTags ?? []).map((t) => t.tag_id)}
      />
    </div>
  );
}
