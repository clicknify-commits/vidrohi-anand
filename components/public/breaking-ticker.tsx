import Link from "next/link";
import { getBreakingArticles } from "@/lib/articles/queries";

export async function BreakingTicker() {
  const articles = await getBreakingArticles(5);
  if (articles.length === 0) return null;

  return (
    <div className="border-b bg-brand/5">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm">
        <span className="shrink-0 rounded-sm bg-brand px-2 py-0.5 text-xs font-bold tracking-wide text-brand-foreground">
          ब्रेकिंग
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-ticker gap-10 hover:[animation-play-state:paused]">
            {[...articles, ...articles].map((a, i) => (
              <Link
                key={`${a.slug}-${i}`}
                href={`/${a.categorySlug}/${a.slug}`}
                className="shrink-0 hover:text-brand hover:underline"
              >
                {a.headline}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
