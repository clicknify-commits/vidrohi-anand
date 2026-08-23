import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { restoreRevision } from "./actions";
import { getLanguage } from "@/lib/i18n/language";
import { t } from "@/lib/i18n/dictionary";

interface RevisionRow {
  id: string;
  snapshot: { headline?: string; status?: string };
  created_at: string;
}

export default async function ArticleHistoryPage(
  props: PageProps<"/admin/articles/[id]/history">
) {
  const lang = await getLanguage();
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: revisions } = await supabase
    .from("article_revisions")
    .select("id, snapshot, created_at")
    .eq("article_id", id)
    .order("created_at", { ascending: false })
    .returns<RevisionRow[]>();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t(lang, "history.title")}</h1>
      <div className="space-y-2">
        {(revisions ?? []).map((rev) => (
          <div key={rev.id} className="flex items-center justify-between rounded border bg-background p-3">
            <div>
              <p className="text-sm font-medium">{rev.snapshot.headline ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(rev.created_at).toLocaleString(lang === "en" ? "en-IN" : "hi-IN")} ·{" "}
                {rev.snapshot.status ?? ""}
              </p>
            </div>
            <form action={restoreRevision}>
              <input type="hidden" name="articleId" value={id} />
              <input type="hidden" name="revisionId" value={rev.id} />
              <Button type="submit" variant="outline" size="sm">
                {t(lang, "history.restore")}
              </Button>
            </form>
          </div>
        ))}
        {(revisions ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t(lang, "history.noneYet")}</p>
        ) : null}
      </div>
    </div>
  );
}
