import { createClient } from "@/lib/supabase/server";
import { ArticleCard } from "@/components/public/article-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ArticleCardData } from "@/lib/articles/queries";

interface SearchRow {
  slug: string;
  headline: string;
  dek: string | null;
  published_at: string | null;
  categories: { slug: string; name_hi: string } | null;
  article_images: {
    card_path: string;
    alt_text: string;
    focal_x: number;
    focal_y: number;
    position: number;
  }[];
}

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q : "";

  let results: ArticleCardData[] = [];
  if (q.trim()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("articles")
      .select(
        "slug, headline, dek, published_at, categories(slug, name_hi), article_images!article_images_article_id_fkey(card_path, alt_text, focal_x, focal_y, position)"
      )
      .eq("status", "published")
      .or(`headline.ilike.%${q}%,dek.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(30)
      .returns<SearchRow[]>();

    results = (data ?? []).map((row) => ({
      slug: row.slug,
      headline: row.headline,
      dek: row.dek,
      published_at: row.published_at,
      categorySlug: row.categories?.slug ?? "",
      categoryName: row.categories?.name_hi ?? "",
      featuredImage: row.article_images.find((img) => img.position === 1) ?? null,
    }));
  }

  return (
    <div className="space-y-6">
      <form className="flex gap-2">
        <Input name="q" defaultValue={q} placeholder="समाचार खोजें…" />
        <Button type="submit">खोजें</Button>
      </form>

      {q.trim() ? (
        results.length === 0 ? (
          <p className="text-muted-foreground">&quot;{q}&quot; के लिए कोई परिणाम नहीं मिला।</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}
