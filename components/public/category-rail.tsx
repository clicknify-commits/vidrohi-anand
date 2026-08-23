import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "./article-card";
import { Reveal } from "./reveal";

interface CategoryRailProps {
  categorySlug: string;
  categoryName: string;
}

export async function CategoryRail({ categorySlug, categoryName }: CategoryRailProps) {
  const articles = await getLatestArticles(4, categorySlug);
  if (articles.length === 0) return null;

  return (
    <Reveal>
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
          <h2 className="font-heading text-xl font-bold">{categoryName}</h2>
          <Link href={`/${categorySlug}`} className="text-xs font-medium text-brand hover:underline">
            सभी देखें →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
          {articles.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
