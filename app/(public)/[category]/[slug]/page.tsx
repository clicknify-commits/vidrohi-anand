import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/images/url";
import { renderArticleBodyHtml } from "@/lib/seo/render-body";
import { excerpt } from "@/lib/seo/excerpt";
import { newsArticleJsonLd, breadcrumbListJsonLd } from "@/lib/seo/jsonld";
import { Breadcrumbs } from "@/components/public/breadcrumbs";
import { ShareRow } from "@/components/public/share-row";
import { RelatedStories } from "@/components/public/related-stories";
import { AuthorBio } from "@/components/public/author-bio";
import type { Article, ArticleImage, Author, Category } from "@/lib/types";

interface ArticlePageRow extends Article {
  categories: Category;
  article_images: ArticleImage[];
  authors: Author | null;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

async function getArticle(categorySlug: string, slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("*, categories(*), article_images!article_images_article_id_fkey(*), authors(*)")
    .eq("slug", slug)
    .eq("status", "published")
    .single<ArticlePageRow>();

  if (!data || data.categories.slug !== categorySlug) return null;
  return data;
}

async function findRedirect(categorySlug: string, slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("redirects")
    .select("new_slug")
    .eq("old_slug", `/${categorySlug}/${slug}`)
    .single();
  return data?.new_slug ?? null;
}

export async function generateMetadata(
  props: PageProps<"/[category]/[slug]">
): Promise<Metadata> {
  const { category, slug } = await props.params;
  const article = await getArticle(category, slug);
  if (!article) return {};

  const featured = article.article_images.find((img) => img.position === 1);
  const description = article.seo_description || article.dek || excerpt(article.body);
  const title = article.seo_title || article.headline;
  const url = `${siteUrl}/${category}/${slug}`;
  const imageUrl = featured ? publicImageUrl(featured.card_path) : undefined;

  return {
    title,
    description,
    alternates: { canonical: article.canonical_url || url },
    robots: article.robots_index ? undefined : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url,
      images: imageUrl ? [imageUrl] : undefined,
      type: "article",
      publishedTime: article.published_at ?? undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ArticlePage(props: PageProps<"/[category]/[slug]">) {
  const { category, slug } = await props.params;
  const article = await getArticle(category, slug);

  if (!article) {
    const newPath = await findRedirect(category, slug);
    if (newPath) redirect(newPath);
    notFound();
  }

  const featured = article.article_images.find((img) => img.position === 1);
  const gallery = article.article_images
    .filter((img) => img.position !== 1)
    .sort((a, b) => a.position - b.position);
  const authorName =
    article.guest_author_name || article.authors?.name || "विद्रोही आनंद डेस्क";
  const url = `${siteUrl}/${category}/${slug}`;
  const bodyHtml = renderArticleBodyHtml(article.body);

  const jsonLd = newsArticleJsonLd({
    article,
    category: article.categories,
    imageUrl: featured ? publicImageUrl(featured.card_path) : null,
    authorName,
  });
  const breadcrumbJsonLd = breadcrumbListJsonLd([
    { name: "होम", url: siteUrl },
    { name: article.categories.name_hi, url: `${siteUrl}/${category}` },
    { name: article.headline, url },
  ]);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "होम", href: "/" },
          { label: article.categories.name_hi, href: `/${category}` },
          { label: article.headline },
        ]}
      />

      <div>
        <Link
          href={`/${category}`}
          className="text-sm font-semibold tracking-wide text-brand hover:underline"
        >
          {article.categories.name_hi}
        </Link>
        <h1 className="font-heading mt-2 text-3xl leading-tight font-bold sm:text-4xl">
          {article.headline}
        </h1>
        {article.dek ? (
          <p className="text-muted-foreground mt-3 text-xl leading-snug">{article.dek}</p>
        ) : null}
        <div className="mt-4 flex flex-wrap items-center gap-x-3 border-t pt-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{authorName}</span>
          {article.published_at ? (
            <time dateTime={article.published_at} className="tabular-nums">
              {new Date(article.published_at).toLocaleString("hi-IN", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </time>
          ) : null}
        </div>
      </div>

      {featured ? (
        <figure>
          <div className="relative aspect-video overflow-hidden rounded-md">
            <Image
              src={publicImageUrl(featured.card_path)}
              alt={featured.alt_text}
              fill
              sizes="(min-width: 768px) 700px, 100vw"
              style={{ objectPosition: `${featured.focal_x * 100}% ${featured.focal_y * 100}%` }}
              className="object-cover"
              priority
            />
          </div>
          {featured.caption || featured.credit ? (
            <figcaption className="mt-2 border-l-2 border-brand/40 pl-2 text-xs text-muted-foreground">
              {featured.caption}
              {featured.credit ? ` — ${featured.credit}` : ""}
            </figcaption>
          ) : null}
        </figure>
      ) : null}

      <div
        className="prose prose-neutral prose-lg max-w-none prose-headings:font-heading"
        dangerouslySetInnerHTML={{ __html: bodyHtml }}
      />

      {gallery.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {gallery.map((img) => (
            <figure key={img.id}>
              <div className="relative aspect-square overflow-hidden rounded-md">
                <Image
                  src={publicImageUrl(img.card_path)}
                  alt={img.alt_text}
                  fill
                  sizes="200px"
                  className="object-cover"
                  style={{ objectPosition: `${img.focal_x * 100}% ${img.focal_y * 100}%` }}
                />
              </div>
              {img.caption ? (
                <figcaption className="mt-1 text-xs text-muted-foreground">{img.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {article.authors ? <AuthorBio author={article.authors} /> : null}

      <ShareRow url={url} title={article.headline} />

      <RelatedStories
        categorySlug={category}
        categoryName={article.categories.name_hi}
        excludeSlug={slug}
      />
    </article>
  );
}
