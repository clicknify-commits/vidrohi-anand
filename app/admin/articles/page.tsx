import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createArticle } from "./actions";
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

const STATUS_VARIANTS: Record<ArticleStatus, "secondary" | "default" | "outline" | "destructive"> = {
  draft: "secondary",
  in_review: "outline",
  scheduled: "outline",
  published: "default",
  archived: "destructive",
};

interface ArticleListRow {
  id: string;
  headline: string;
  status: ArticleStatus;
  updated_at: string;
  categories: { name_hi: string; name_en: string } | null;
}

export default async function ArticlesPage(props: PageProps<"/admin/articles">) {
  const lang = await getLanguage();
  const searchParams = await props.searchParams;
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("id, headline, status, updated_at, categories(name_hi, name_en)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: articles } = await query.returns<ArticleListRow[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t(lang, "articles.title")}</h1>
        <form action={createArticle}>
          <Button type="submit">{t(lang, "dashboard.newStory")}</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/admin/articles" className={!statusFilter ? "font-semibold" : "text-muted-foreground"}>
          {t(lang, "common.all")}
        </Link>
        {(Object.keys(STATUS_KEYS) as ArticleStatus[]).map((s) => (
          <Link
            key={s}
            href={`/admin/articles?status=${s}`}
            className={statusFilter === s ? "font-semibold" : "text-muted-foreground"}
          >
            {t(lang, STATUS_KEYS[s])}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">{t(lang, "articles.headline")}</th>
              <th className="p-3">{t(lang, "articles.category")}</th>
              <th className="p-3">{t(lang, "articles.status")}</th>
              <th className="p-3">{t(lang, "common.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {(articles ?? []).map((article) => (
              <tr key={article.id} className="border-t">
                <td className="p-3">
                  <Link href={`/admin/articles/${article.id}`} className="hover:underline">
                    {article.headline}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">
                  {(lang === "en" ? article.categories?.name_en : article.categories?.name_hi) ?? "—"}
                </td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANTS[article.status]}>{t(lang, STATUS_KEYS[article.status])}</Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(article.updated_at).toLocaleString(lang === "en" ? "en-IN" : "hi-IN")}
                </td>
              </tr>
            ))}
            {(articles ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  {t(lang, "articles.noneYet")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
