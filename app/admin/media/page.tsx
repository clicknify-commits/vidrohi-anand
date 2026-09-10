import { createClient } from "@/lib/supabase/server";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";
import { MediaImageCard } from "@/components/admin/media-image-card";

interface MediaRow {
  id: string;
  article_id: string;
  position: number;
  thumbnail_path: string;
  alt_text: string;
  created_at: string;
  articles: { headline: string; slug: string } | null;
}

export default async function MediaLibraryPage() {
  const lang = await getLanguage();
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_images")
    .select(
      "id, article_id, position, thumbnail_path, alt_text, created_at, articles!article_images_article_id_fkey(headline, slug)"
    )
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<MediaRow[]>();

  const images = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang, "media.title")}</h1>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t(lang, "media.noneUploaded")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <MediaImageCard
              key={img.id}
              imageId={img.id}
              articleId={img.article_id}
              thumbnailPath={img.thumbnail_path}
              altText={img.alt_text}
              headline={img.articles?.headline ?? "—"}
              position={img.position}
            />
          ))}
        </div>
      )}
    </div>
  );
}
