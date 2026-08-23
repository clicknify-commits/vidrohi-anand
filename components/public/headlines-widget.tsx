import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getLatestArticles } from "@/lib/articles/queries";
import { Reveal } from "./reveal";

// Text-only compact list - fits ~10 headlines in the space of a single
// image card, so it earns its place in the sidebar. Numbered so the
// visual weight isn't just uniform text rows.
export async function HeadlinesWidget() {
  const articles = await getLatestArticles(10);
  if (articles.length === 0) return null;

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Newspaper className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">ताज़ा सुर्खियां</h2>
        </div>
        <ol className="space-y-2.5">
          {articles.map((a, i) => (
            <li key={a.slug} className="flex items-start gap-2.5">
              <span className="font-heading w-5 shrink-0 text-lg leading-none font-bold text-brand tabular-nums">
                {i + 1}
              </span>
              <Link
                href={`/${a.categorySlug}/${a.slug}`}
                className="font-heading line-clamp-2 text-sm leading-snug font-semibold text-foreground hover:text-brand"
              >
                {a.headline}
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </Reveal>
  );
}
