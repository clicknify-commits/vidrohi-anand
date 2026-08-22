import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "@/components/public/article-card";
import { Breadcrumbs } from "@/components/public/breadcrumbs";

export async function generateMetadata(
  props: PageProps<"/[category]">
): Promise<Metadata> {
  const { category: categorySlug } = await props.params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name_hi")
    .eq("slug", categorySlug)
    .single();
  if (!category) return {};
  return { title: category.name_hi };
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const { category: categorySlug } = await props.params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name_hi, slug, is_active")
    .eq("slug", categorySlug)
    .single();

  if (!category || !category.is_active) notFound();

  const articles = await getLatestArticles(24, categorySlug);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: "होम", href: "/" }, { label: category.name_hi }]} />
      <h1 className="text-2xl font-bold">{category.name_hi}</h1>
      {articles.length === 0 ? (
        <p className="text-muted-foreground">इस श्रेणी में अभी कोई समाचार नहीं है।</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
