import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processImage } from "@/lib/images/process";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "अनधिकृत" }, { status: 401 });
  }

  const formData = await request.formData();
  const articleId = String(formData.get("articleId") ?? "");
  const position = Number(formData.get("position") ?? 0);
  const file = formData.get("file");
  const altText = String(formData.get("altText") ?? "");
  const captionRaw = formData.get("caption");
  const creditRaw = formData.get("credit");

  if (!articleId || !(position >= 1 && position <= 5) || !(file instanceof File)) {
    return NextResponse.json({ error: "अमान्य अनुरोध" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processImage(inputBuffer);
  } catch {
    return NextResponse.json({ error: "छवि प्रोसेस नहीं हो सकी" }, { status: 422 });
  }

  const basePath = `${articleId}/${position}`;
  const uploads = [
    { path: `${basePath}/thumb.webp`, body: processed.thumbnail },
    { path: `${basePath}/card.webp`, body: processed.card },
    { path: `${basePath}/full.webp`, body: processed.full },
  ];

  for (const upload of uploads) {
    const { error } = await supabase.storage
      .from("article-images")
      .upload(upload.path, upload.body, {
        contentType: "image/webp",
        upsert: true,
      });
    if (error) {
      return NextResponse.json({ error: `अपलोड विफल: ${error.message}` }, { status: 500 });
    }
  }

  const { data: row, error: dbError } = await supabase
    .from("article_images")
    .upsert(
      {
        article_id: articleId,
        position,
        storage_path: `${basePath}/full.webp`,
        thumbnail_path: `${basePath}/thumb.webp`,
        card_path: `${basePath}/card.webp`,
        width: processed.width,
        height: processed.height,
        alt_text: altText,
        caption: captionRaw ? String(captionRaw) : null,
        credit: creditRaw ? String(creditRaw) : null,
      },
      { onConflict: "article_id,position" }
    )
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(row);
}
