import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getRandomArticles } from "@/lib/articles/queries";
import { publicImageUrl } from "@/lib/images/url";
import { Reveal } from "./reveal";

export async function RandomNewsWidget({
  excludeSlugs = [],
  limit = 10,
}: {
  excludeSlugs?: string[];
  limit?: number;
}) {
  const articles = await getRandomArticles(limit, excludeSlugs);
  if (articles.length === 0) return null;

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">और भी पढ़ें</h2>
        </div>
        <div className="divide-y">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/${a.categorySlug}/${a.slug}`}
              className="group flex items-start gap-3 py-2 first:pt-0 last:pb-0"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-muted">
                {a.featuredImage ? (
                  <Image
                    src={publicImageUrl(a.featuredImage.card_path)}
                    alt={a.featuredImage.alt_text}
                    fill
                    sizes="56px"
                    className="object-cover"
                    style={{
                      objectPosition: `${a.featuredImage.focal_x * 100}% ${a.featuredImage.focal_y * 100}%`,
                    }}
                  />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-brand">{a.categoryName}</p>
                <h4 className="font-heading line-clamp-2 text-sm leading-snug font-semibold text-foreground group-hover:text-brand">
                  {a.headline}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
