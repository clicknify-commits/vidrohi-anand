import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { publicImageUrl } from "@/lib/images/url";
import { Card, CardContent } from "@/components/ui/card";

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
      <h1 className="text-2xl font-semibold">मीडिया लाइब्रेरी</h1>

      {images.length === 0 ? (
        <p className="text-sm text-muted-foreground">अभी कोई छवि अपलोड नहीं हुई है।</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {images.map((img) => (
            <Card key={img.id} className="overflow-hidden py-0">
              <Link href={`/admin/articles/${img.article_id}`}>
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={publicImageUrl(img.thumbnail_path)}
                    alt={img.alt_text || ""}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-2">
                  <p className="truncate text-xs font-medium">
                    {img.articles?.headline ?? "—"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">स्लॉट {img.position}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
