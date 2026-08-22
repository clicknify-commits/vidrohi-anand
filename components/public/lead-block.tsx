import Image from "next/image";
import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { ArticleCard } from "./article-card";
import { publicImageUrl } from "@/lib/images/url";

export async function LeadBlock() {
  const articles = await getLatestArticles(6);

  if (articles.length === 0) {
    return (
      <div className="rounded border border-dashed p-12 text-center text-muted-foreground">
        अभी कोई समाचार उपलब्ध नहीं है।
      </div>
    );
  }

  const [hero, ...secondary] = articles;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <ArticleCard article={hero} size="large" />
      </div>
      <div className="divide-y">
        {secondary.map((a) => (
          <Link
            key={a.slug}
            href={`/${a.categorySlug}/${a.slug}`}
            className="flex items-start gap-3 py-3 first:pt-0"
          >
            <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
              {a.featuredImage ? (
                <Image
                  src={publicImageUrl(a.featuredImage.card_path)}
                  alt={a.featuredImage.alt_text}
                  fill
                  sizes="64px"
                  className="object-cover"
                  style={{
                    objectPosition: `${a.featuredImage.focal_x * 100}% ${a.featuredImage.focal_y * 100}%`,
                  }}
                />
              ) : null}
            </div>
            <p className="text-sm font-medium leading-snug hover:text-brand">{a.headline}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
