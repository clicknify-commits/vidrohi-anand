import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "./article-card";

interface CategoryRailProps {
  categorySlug: string;
  categoryName: string;
}

export async function CategoryRail({ categorySlug, categoryName }: CategoryRailProps) {
  const articles = await getLatestArticles(4, categorySlug);
  if (articles.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-bold">{categoryName}</h2>
        <Link href={`/${categorySlug}`} className="text-xs text-brand hover:underline">
          सभी देखें →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </section>
  );
}
