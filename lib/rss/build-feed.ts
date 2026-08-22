import { Feed } from "feed";
import { excerpt } from "@/lib/seo/excerpt";
import type { Article, Category } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export interface FeedArticle extends Article {
  categories: Pick<Category, "slug" | "name_hi">;
}

export function buildFeed(
  articles: FeedArticle[],
  options?: { title?: string; description?: string }
) {
  const feed = new Feed({
    title: options?.title ?? "विद्रोही आनंद",
    description: options?.description ?? "सत्य • निष्पक्षता • जनहित",
    id: siteUrl,
    link: siteUrl,
    language: "hi",
    updated: articles[0] ? new Date(articles[0].updated_at) : new Date(),
    generator: "Vidrohi Anand CMS",
    feedLinks: { rss: `${siteUrl}/rss.xml` },
  });

  for (const article of articles) {
    const url = `${siteUrl}/${article.categories.slug}/${article.slug}`;
    feed.addItem({
      title: article.headline,
      id: url,
      link: url,
      description: article.dek ?? article.seo_description ?? excerpt(article.body),
      date: article.published_at ? new Date(article.published_at) : new Date(article.updated_at),
      category: [{ name: article.categories.name_hi }],
    });
  }

  return feed;
}
