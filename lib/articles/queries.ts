import { createClient } from "@/lib/supabase/server";

export interface ArticleCardData {
  slug: string;
  headline: string;
  dek: string | null;
  published_at: string | null;
  categorySlug: string;
  categoryName: string;
  featuredImage: {
    card_path: string;
    alt_text: string;
    focal_x: number;
    focal_y: number;
  } | null;
}

interface RawArticleRow {
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

const CARD_SELECT =
  "slug, headline, dek, published_at, categories(slug, name_hi), article_images!article_images_article_id_fkey(card_path, alt_text, focal_x, focal_y, position)";

function toCardData(row: RawArticleRow): ArticleCardData {
  const featured = row.article_images.find((img) => img.position === 1) ?? null;
  return {
    slug: row.slug,
    headline: row.headline,
    dek: row.dek,
    published_at: row.published_at,
    categorySlug: row.categories?.slug ?? "",
    categoryName: row.categories?.name_hi ?? "",
    featuredImage: featured
      ? {
          card_path: featured.card_path,
          alt_text: featured.alt_text,
          focal_x: featured.focal_x,
          focal_y: featured.focal_y,
        }
      : null,
  };
}

export async function getLatestArticles(
  limit: number,
  categorySlug?: string
): Promise<ArticleCardData[]> {
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (categorySlug) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (!category) return [];
    categoryId = category.id;
  }

  let query = supabase
    .from("articles")
    .select(CARD_SELECT)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query.returns<RawArticleRow[]>();
  return (data ?? []).map(toCardData);
}

export async function getBreakingArticles(limit = 5): Promise<ArticleCardData[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(CARD_SELECT)
    .eq("status", "published")
    .eq("is_breaking", true)
    .order("published_at", { ascending: false })
    .limit(limit)
    .returns<RawArticleRow[]>();
  return (data ?? []).map(toCardData);
}

export interface ActiveCategory {
  id: string;
  name_hi: string;
  name_en: string;
  slug: string;
}

export async function getActiveCategories(): Promise<ActiveCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name_hi, name_en, slug")
    .eq("is_active", true)
    .order("sort_order");
  return data ?? [];
}
