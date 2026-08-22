import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "./article-card";

interface RelatedStoriesProps {
  categorySlug: string;
  categoryName: string;
  excludeSlug: string;
}

export async function RelatedStories({ categorySlug, categoryName, excludeSlug }: RelatedStoriesProps) {
  const articles = (await getLatestArticles(5, categorySlug))
    .filter((a) => a.slug !== excludeSlug)
    .slice(0, 4);

  if (articles.length === 0) return null;

  return (
    <section className="space-y-3 border-t pt-6">
      <h2 className="text-lg font-bold">{categoryName} से संबंधित</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
