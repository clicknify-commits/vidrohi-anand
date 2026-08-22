import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkReadyForReview } from "@/lib/validation/article-rules";
import type { ArticleStatus } from "@/lib/types";

const VALID_STATUSES: ArticleStatus[] = [
  "draft",
  "in_review",
  "scheduled",
  "published",
  "archived",
];

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/articles/[id]/status">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nextStatus = body.status as ArticleStatus;
  const publishAt = typeof body.published_at === "string" ? body.published_at : undefined;

  if (!VALID_STATUSES.includes(nextStatus)) {
    return NextResponse.json({ error: "अमान्य स्टेटस" }, { status: 400 });
  }

  const supabase = await createClient();

  if (nextStatus === "in_review" || nextStatus === "published" || nextStatus === "scheduled") {
    const { data: images } = await supabase
      .from("article_images")
      .select("position, alt_text, width, height")
      .eq("article_id", id);

    const check = checkReadyForReview(images ?? []);
    if (!check.ready) {
      return NextResponse.json({ error: "अधूरा", missing: check.missing }, { status: 422 });
    }
  }

  const update: Record<string, unknown> = { status: nextStatus };
  if (nextStatus === "published") {
    update.published_at = new Date().toISOString();
  } else if (nextStatus === "scheduled") {
    if (!publishAt) {
      return NextResponse.json({ error: "प्रकाशन तिथि आवश्यक है" }, { status: 400 });
    }
    update.published_at = publishAt;
  }

  const { data: article, error } = await supabase
    .from("articles")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("id").eq("user_id", user.id).single()
    : { data: null };

  await supabase.from("article_revisions").insert({
    article_id: id,
    snapshot: article,
    created_by: profile?.id ?? null,
  });

  return NextResponse.json(article);
}
