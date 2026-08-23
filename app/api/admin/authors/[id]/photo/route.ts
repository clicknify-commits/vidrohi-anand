import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processInlineImage } from "@/lib/images/process";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/authors/[id]/photo">
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "अनधिकृत" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "अमान्य अनुरोध" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processInlineImage(inputBuffer);
  } catch {
    return NextResponse.json({ error: "छवि प्रोसेस नहीं हो सकी" }, { status: 422 });
  }

  // Versioned filename - Next's image optimizer caches by URL for hours, so
  // overwriting a fixed path silently keeps serving the old photo until that
  // cache expires (see the same fix in scripts/attach-real-image.mjs).
  const path = `authors/${id}/photo-v${Date.now()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(path, processed.buffer, { contentType: "image/webp" });
  if (uploadError) {
    return NextResponse.json({ error: `अपलोड विफल: ${uploadError.message}` }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("authors")
    .update({ photo_path: path })
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
