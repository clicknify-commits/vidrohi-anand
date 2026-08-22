import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createArticle } from "./articles/actions";
import type { ArticleStatus } from "@/lib/types";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "ड्राफ्ट",
  in_review: "समीक्षा में",
  scheduled: "शेड्यूल्ड",
  published: "प्रकाशित",
  archived: "आर्काइव्ड",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase.from("articles").select("status");

  const counts = (articles ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">डैशबोर्ड</h1>
        <form action={createArticle}>
          <Button type="submit">+ नई स्टोरी</Button>
        </form>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {(Object.keys(STATUS_LABELS) as ArticleStatus[]).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {STATUS_LABELS[status]}
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
          <Link href="/admin/articles">सभी स्टोरी देखें</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/media">मीडिया लाइब्रेरी</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/admin/categories">श्रेणियाँ प्रबंधित करें</Link>
        </Button>
      </div>
    </div>
  );
}
