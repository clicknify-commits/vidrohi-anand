import Image from "next/image";
import Link from "next/link";
import { publicImageUrl } from "@/lib/images/url";
import type { ArticleCardData } from "@/lib/articles/queries";

export function ArticleCard({
  article,
  size = "default",
}: {
  article: ArticleCardData;
  size?: "default" | "large";
}) {
  const href = `/${article.categorySlug}/${article.slug}`;

  return (
    <Link href={href} className="group block">
      <div
        className={`relative overflow-hidden rounded bg-muted ${
          size === "large" ? "aspect-video" : "aspect-[4/3]"
        }`}
      >
        {article.featuredImage ? (
          <Image
            src={publicImageUrl(article.featuredImage.card_path)}
            alt={article.featuredImage.alt_text}
            fill
            sizes={size === "large" ? "(min-width: 1024px) 700px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
            style={{
              objectPosition: `${article.featuredImage.focal_x * 100}% ${article.featuredImage.focal_y * 100}%`,
            }}
            className="object-cover transition group-hover:scale-105"
            priority={size === "large"}
          />
        ) : null}
      </div>
      <div className="mt-2 space-y-1">
        <span className="text-xs font-semibold text-brand">{article.categoryName}</span>
        <h3
          className={`font-semibold leading-snug group-hover:text-brand ${
            size === "large" ? "text-xl" : "text-sm"
          }`}
        >
          {article.headline}
        </h3>
        {size === "large" && article.dek ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">{article.dek}</p>
        ) : null}
      </div>
    </Link>
  );
}
