import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createArticle } from "./articles/actions";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";
import type { ArticleStatus } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const STATUS_KEYS: Record<ArticleStatus, TranslationKey> = {
  draft: "status.draft",
  in_review: "status.in_review",
  scheduled: "status.scheduled",
  published: "status.published",
  archived: "status.archived",
};

export default async function AdminDashboardPage() {
  const lang = await getLanguage();
  const supabase = await createClient();
  const { data: articles } = await supabase.from("articles").select("status");

  const counts = (articles ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(lang, "dashboard.title")}</h1>
        <form action={createArticle}>
          <Button type="submit">{t(lang, "dashboard.newStory")}</Button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(STATUS_KEYS) as ArticleStatus[]).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {t(lang, STATUS_KEYS[status])}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts[status] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" asChild>
          <Link href="/admin/articles">{t(lang, "dashboard.viewAll")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/media">{t(lang, "dashboard.mediaLibrary")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">{t(lang, "dashboard.manageCategories")}</Link>
        </Button>
      </div>
    </div>
  );
}
