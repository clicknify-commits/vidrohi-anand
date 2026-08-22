import type { Article, Category } from "@/lib/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "विद्रोही आनंद",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
  };
}

export function breadcrumbListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function newsArticleJsonLd({
  article,
  category,
  imageUrl,
  authorName,
}: {
  article: Article;
  category: Category;
  imageUrl: string | null;
  authorName: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline,
    description: article.dek ?? article.seo_description ?? undefined,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at,
    author: { "@type": "Person", name: authorName },
    publisher: {
      "@type": "Organization",
      name: "विद्रोही आनंद",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/${category.slug}/${article.slug}`,
    },
  };
}
