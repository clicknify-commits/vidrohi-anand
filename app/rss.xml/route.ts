import { createClient } from "@/lib/supabase/server";
import { buildFeed, type FeedArticle } from "@/lib/rss/build-feed";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, categories(slug, name_hi)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(50)
    .returns<FeedArticle[]>();

  const feed = buildFeed(data ?? []);

  return new Response(feed.rss2(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
