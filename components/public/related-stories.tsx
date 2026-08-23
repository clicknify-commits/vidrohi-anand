import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "./article-card";
import { Reveal } from "./reveal";

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
    <Reveal>
      <section className="space-y-4 border-t pt-8">
        <h2 className="font-heading text-xl font-bold">{categoryName} से संबंधित</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
