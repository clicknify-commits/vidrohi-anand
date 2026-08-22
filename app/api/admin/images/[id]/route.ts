import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/images/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (typeof body.alt_text === "string") update.alt_text = body.alt_text;
  if (typeof body.caption === "string" || body.caption === null) update.caption = body.caption;
  if (typeof body.credit === "string" || body.credit === null) update.credit = body.credit;
  if (typeof body.focal_x === "number") update.focal_x = Math.min(1, Math.max(0, body.focal_x));
  if (typeof body.focal_y === "number") update.focal_y = Math.min(1, Math.max(0, body.focal_y));

  const { data, error } = await supabase
    .from("article_images")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/images/[id]">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: image } = await supabase
    .from("article_images")
    .select("*")
    .eq("id", id)
    .single();

  if (!image) return NextResponse.json({ error: "नहीं मिला" }, { status: 404 });

  await supabase.storage
    .from("article-images")
    .remove([image.storage_path, image.thumbnail_path, image.card_path]);
  await supabase.from("article_images").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
