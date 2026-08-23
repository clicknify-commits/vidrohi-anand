import Image from "next/image";
import Link from "next/link";
import { getLatestArticles } from "@/lib/articles/queries";
import { publicImageUrl } from "@/lib/images/url";
import type { ArticleCardData } from "@/lib/articles/queries";

function BentoTile({
  article,
  large = false,
}: {
  article: ArticleCardData;
  large?: boolean;
}) {
  return (
    <Link
      href={`/${article.categorySlug}/${article.slug}`}
      className={`group relative block h-full min-h-56 overflow-hidden rounded-md bg-muted ${
        large ? "lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      {article.featuredImage ? (
        <Image
          src={publicImageUrl(article.featuredImage.card_path)}
          alt={article.featuredImage.alt_text}
          fill
          sizes={large ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 300px, 50vw"}
          style={{
            objectPosition: `${article.featuredImage.focal_x * 100}% ${article.featuredImage.focal_y * 100}%`,
          }}
          className="object-cover transition duration-300 group-hover:scale-105"
          priority={large}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <span className="text-[11px] font-semibold tracking-wide text-white/90">
          {article.categoryName}
        </span>
        <h3
          className={`font-heading leading-snug font-bold text-white ${
            large ? "mt-1 text-2xl sm:text-3xl" : "text-sm"
          }`}
        >
          {article.headline}
        </h3>
      </div>
    </Link>
  );
}

export async function LeadBlock() {
  const articles = await getLatestArticles(5);

  if (articles.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center text-muted-foreground">
        अभी कोई समाचार उपलब्ध नहीं है।
      </div>
    );
  }

  const [hero, ...rest] = articles;

  return (
    <div className="grid grid-cols-1 gap-4 border-b pb-10 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
      <BentoTile article={hero} large />
      {rest.map((a) => (
        <BentoTile key={a.slug} article={a} />
      ))}
    </div>
  );
}
