import Image from "next/image";
import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { publicImageUrl } from "@/lib/images/url";
import { Reveal } from "./reveal";
import type { ArticleCardData } from "@/lib/articles/queries";

interface MagazineCategoryRailProps {
  categorySlug: string;
  categoryName: string;
}

function HeroArticle({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/${article.categorySlug}/${article.slug}`}
      className="group block space-y-3"
    >
      <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
        {article.featuredImage ? (
          <Image
            src={publicImageUrl(article.featuredImage.card_path)}
            alt={article.featuredImage.alt_text}
            fill
            sizes="(min-width: 1024px) 460px, 100vw"
            style={{
              objectPosition: `${article.featuredImage.focal_x * 100}% ${article.featuredImage.focal_y * 100}%`,
            }}
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-semibold tracking-wide text-brand">{article.categoryName}</span>
        <h3 className="font-heading text-2xl leading-tight font-bold text-foreground transition-colors group-hover:text-brand">
          {article.headline}
        </h3>
        {article.dek ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{article.dek}</p>
        ) : null}
      </div>
    </Link>
  );
}

function CompanionArticle({ article }: { article: ArticleCardData }) {
  return (
    <Link
      href={`/${article.categorySlug}/${article.slug}`}
      className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0"
    >
      <div className="relative aspect-square size-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {article.featuredImage ? (
          <Image
            src={publicImageUrl(article.featuredImage.card_path)}
            alt={article.featuredImage.alt_text}
            fill
            sizes="80px"
            style={{
              objectPosition: `${article.featuredImage.focal_x * 100}% ${article.featuredImage.focal_y * 100}%`,
            }}
            className="object-cover"
          />
        ) : null}
      </div>
      <div className="min-w-0 space-y-0.5">
        <h4 className="font-heading line-clamp-3 text-sm leading-snug font-semibold text-foreground group-hover:text-brand">
          {article.headline}
        </h4>
      </div>
    </Link>
  );
}

// Editorial "featured + trio" layout, borrowed from print magazine
// front-of-book sections: one large photo-led lead plus three tightly-
// stacked companions. Falls back to a plain stack below md, since the
// two-column split needs real horizontal room to read as intentional
// rather than cramped.
export async function MagazineCategoryRail({ categorySlug, categoryName }: MagazineCategoryRailProps) {
  const articles = await getLatestArticles(4, categorySlug);
  if (articles.length === 0) return null;

  const [hero, ...companions] = articles;

  return (
    <Reveal>
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
          <h2 className="font-heading text-xl font-bold">{categoryName}</h2>
          <Link href={`/${categorySlug}`} className="text-xs font-medium text-brand hover:underline">
            सभी देखें →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="md:col-span-7">
            <HeroArticle article={hero} />
          </div>
          <div className="divide-y md:col-span-5 md:border-l md:pl-6">
            {companions.map((a) => (
              <CompanionArticle key={a.slug} article={a} />
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
