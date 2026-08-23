import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ComposerShell } from "@/components/admin/composer/composer-shell";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";
import type { Article, ArticleImage, Author, Category, Tag } from "@/lib/types";

export default async function ArticleComposerPage(props: PageProps<"/admin/articles/[id]">) {
  const lang = await getLanguage();
  const { id } = await props.params;
  const supabase = await createClient();

  const [
    { data: article },
    { data: images },
    { data: categories },
    { data: tags },
    { data: authors },
    { data: articleTags },
  ] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).single<Article>(),
    supabase
      .from("article_images")
      .select("*")
      .eq("article_id", id)
      .order("position")
      .returns<ArticleImage[]>(),
    supabase.from("categories").select("*").order("sort_order").returns<Category[]>(),
    supabase.from("tags").select("*").order("name").returns<Tag[]>(),
    supabase.from("authors").select("*").order("name").returns<Author[]>(),
    supabase.from("article_tags").select("tag_id").eq("article_id", id),
  ]);

  if (!article) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/admin/articles" className="hover:underline">
          {t(lang, "composer.backToAll")}
        </Link>
        <Link href={`/admin/articles/${id}/history`} className="hover:underline">
          {t(lang, "composer.versionHistory")}
        </Link>
      </div>
      <ComposerShell
        article={article}
        initialImages={images ?? []}
        categories={categories ?? []}
        tags={tags ?? []}
        authors={authors ?? []}
        initialTagIds={(articleTags ?? []).map((t) => t.tag_id)}
      />
    </div>
  );
}
