import { createClient } from "@/lib/supabase/server";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthorPhotoUpload } from "@/components/admin/author-photo-upload";
import { createAuthor, updateAuthor, deleteAuthor } from "./actions";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";
import type { Author } from "@/lib/types";

export default async function AuthorsPage() {
  const lang = await getLanguage();
  const supabase = await createClient();
  const { data: authors } = await supabase
    .from("authors")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Author[]>();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t(lang, "authors.title")}</h1>

      <div className="space-y-4">
        {(authors ?? []).map((author) => (
          <Card key={author.id}>
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row">
              <AuthorPhotoUpload authorId={author.id} photoPath={author.photo_path} />
              <form action={updateAuthor} className="flex-1 space-y-3">
                <input type="hidden" name="id" value={author.id} />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t(lang, "authors.name")}</label>
                    <Input name="name" defaultValue={author.name} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">/{author.slug}</label>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t(lang, "authors.bio")}</label>
                  <Textarea name="bio" defaultValue={author.bio ?? ""} rows={2} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">{t(lang, "authors.socialLinks")}</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    <Input name="x" defaultValue={author.social_links?.x ?? ""} placeholder="X" />
                    <Input
                      name="instagram"
                      defaultValue={author.social_links?.instagram ?? ""}
                      placeholder="Instagram"
                    />
                    <Input
                      name="facebook"
                      defaultValue={author.social_links?.facebook ?? ""}
                      placeholder="Facebook"
                    />
                    <Input
                      name="linkedin"
                      defaultValue={author.social_links?.linkedin ?? ""}
                      placeholder="LinkedIn"
                    />
                    <Input
                      name="website"
                      defaultValue={author.social_links?.website ?? ""}
                      placeholder="Website"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="outline">
                    {t(lang, "common.save")}
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    formAction={deleteAuthor}
                    className="text-destructive"
                  >
                    {t(lang, "common.delete")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}
        {(authors ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(lang, "authors.noneYet")}</p>
        ) : null}
      </div>

      <form action={createAuthor} className="flex items-end gap-2 border-t pt-4">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">{t(lang, "authors.name")}</label>
          <Input name="name" placeholder={t(lang, "authors.namePlaceholder")} required />
        </div>
        <Button type="submit">{t(lang, "authors.addNew")}</Button>
      </form>
    </div>
  );
}
