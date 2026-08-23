import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processInlineImage } from "@/lib/images/process";
import { publicImageUrl } from "@/lib/images/url";

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
  const file = formData.get("file");

  if (!articleId || !(file instanceof File)) {
    return NextResponse.json({ error: "अमान्य अनुरोध" }, { status: 400 });
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let processed;
  try {
    processed = await processInlineImage(inputBuffer);
  } catch {
    return NextResponse.json({ error: "छवि प्रोसेस नहीं हो सकी" }, { status: 422 });
  }

  const path = `${articleId}/body/${randomUUID()}.webp`;
  const { error } = await supabase.storage
    .from("article-images")
    .upload(path, processed.buffer, { contentType: "image/webp" });
  if (error) {
    return NextResponse.json({ error: `अपलोड विफल: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    url: publicImageUrl(path),
    width: processed.width,
    height: processed.height,
  });
}
