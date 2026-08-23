import Image from "next/image";
import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { publicImageUrl } from "@/lib/images/url";
import { HorizontalScroller } from "./horizontal-scroller";

export async function NewsStrip() {
  const articles = await getLatestArticles(10);
  if (articles.length === 0) return null;

  return (
    <div className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-muted-foreground">
          ताज़ा अपडेट
        </p>
        <HorizontalScroller>
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.categorySlug}/${a.slug}`}
              className="group flex w-56 shrink-0 snap-start flex-col gap-2"
            >
              <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
                {a.featuredImage ? (
                  <Image
                    src={publicImageUrl(a.featuredImage.card_path)}
                    alt={a.featuredImage.alt_text}
                    fill
                    sizes="224px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                    style={{
                      objectPosition: `${a.featuredImage.focal_x * 100}% ${a.featuredImage.focal_y * 100}%`,
                    }}
                  />
                ) : null}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-brand">{a.categoryName}</span>
                <p className="line-clamp-2 text-sm leading-snug font-medium text-foreground group-hover:text-brand">
                  {a.headline}
                </p>
              </div>
            </Link>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}
