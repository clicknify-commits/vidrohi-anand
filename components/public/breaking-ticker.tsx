import Link from "next/link";
import { getBreakingArticles } from "@/lib/articles/queries";

export async function BreakingTicker() {
  const articles = await getBreakingArticles(5);
  if (articles.length === 0) return null;

  return (
    <div className="border-b bg-brand/10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2 text-sm">
        <span className="shrink-0 rounded bg-brand px-2 py-0.5 text-xs font-bold text-brand-foreground">
          ब्रेकिंग
        </span>
        <div className="flex gap-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.categorySlug}/${a.slug}`}
              className="shrink-0 hover:underline"
            >
              {a.headline}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
