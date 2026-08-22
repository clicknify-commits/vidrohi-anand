import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createArticle } from "./actions";
import type { ArticleStatus } from "@/lib/types";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "ड्राफ्ट",
  in_review: "समीक्षा में",
  scheduled: "शेड्यूल्ड",
  published: "प्रकाशित",
  archived: "आर्काइव्ड",
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
  categories: { name_hi: string } | null;
}

export default async function ArticlesPage(props: PageProps<"/admin/articles">) {
  const searchParams = await props.searchParams;
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("articles")
    .select("id, headline, status, updated_at, categories(name_hi)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: articles } = await query.returns<ArticleListRow[]>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">सभी स्टोरी</h1>
        <form action={createArticle}>
          <Button type="submit">+ नई स्टोरी</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href="/admin/articles" className={!statusFilter ? "font-semibold" : "text-muted-foreground"}>
          सभी
        </Link>
        {(Object.keys(STATUS_LABELS) as ArticleStatus[]).map((s) => (
          <Link
            key={s}
            href={`/admin/articles?status=${s}`}
            className={statusFilter === s ? "font-semibold" : "text-muted-foreground"}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="p-3">शीर्षक</th>
              <th className="p-3">श्रेणी</th>
              <th className="p-3">स्टेटस</th>
              <th className="p-3">अपडेटेड</th>
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
                <td className="p-3 text-muted-foreground">{article.categories?.name_hi ?? "—"}</td>
                <td className="p-3">
                  <Badge variant={STATUS_VARIANTS[article.status]}>{STATUS_LABELS[article.status]}</Badge>
                </td>
                <td className="p-3 text-muted-foreground">
                  {new Date(article.updated_at).toLocaleString("hi-IN")}
                </td>
              </tr>
            ))}
            {(articles ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  अभी कोई स्टोरी नहीं है।
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
