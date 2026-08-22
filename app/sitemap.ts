import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const revalidate = 3600;

interface ArticleSitemapRow {
  slug: string;
  updated_at: string;
  categories: { slug: string } | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const [{ data: categories }, { data: articles }] = await Promise.all([
    supabase.from("categories").select("slug").eq("is_active", true),
    supabase
      .from("articles")
      .select("slug, updated_at, categories(slug)")
      .eq("status", "published")
      .returns<ArticleSitemapRow[]>(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "hourly", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${siteUrl}/${c.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articlePages: MetadataRoute.Sitemap = (articles ?? [])
    .filter((a): a is ArticleSitemapRow & { categories: { slug: string } } => a.categories !== null)
    .map((a) => ({
      url: `${siteUrl}/${a.categories.slug}/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "daily",
      priority: 0.6,
    }));

  return [...staticPages, ...categoryPages, ...articlePages];
}
