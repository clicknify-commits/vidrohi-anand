import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

interface NewsSitemapRow {
  slug: string;
  headline: string;
  published_at: string | null;
  categories: { slug: string } | null;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from("articles")
    .select("slug, headline, published_at, categories(slug)")
    .eq("status", "published")
    .gte("published_at", since)
    .order("published_at", { ascending: false })
    .returns<NewsSitemapRow[]>();

  const rows = (data ?? []).filter(
    (row): row is NewsSitemapRow & { categories: { slug: string } } => row.categories !== null
  );

  const urls = rows
    .map((row) => {
      const url = `${siteUrl}/${row.categories.slug}/${row.slug}`;
      return `<url>
  <loc>${escapeXml(url)}</loc>
  <news:news>
    <news:publication>
      <news:name>विद्रोही आनंद</news:name>
      <news:language>hi</news:language>
    </news:publication>
    <news:publication_date>${row.published_at}</news:publication_date>
    <news:title>${escapeXml(row.headline)}</news:title>
  </news:news>
</url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
