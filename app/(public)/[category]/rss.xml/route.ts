import { createClient } from "@/lib/supabase/server";
import { buildFeed, type FeedArticle } from "@/lib/rss/build-feed";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/[category]/rss.xml">
) {
  const { category: categorySlug } = await ctx.params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name_hi")
    .eq("slug", categorySlug)
    .single();

  if (!category) {
    return new Response("Not found", { status: 404 });
  }

  const { data } = await supabase
    .from("articles")
    .select("*, categories(slug, name_hi)")
    .eq("status", "published")
    .eq("category_id", category.id)
    .order("published_at", { ascending: false })
    .limit(50)
    .returns<FeedArticle[]>();

  const feed = buildFeed(data ?? [], { title: `विद्रोही आनंद - ${category.name_hi}` });

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
