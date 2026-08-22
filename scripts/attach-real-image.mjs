import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const slug = process.argv[2];
const localPath = process.argv[3];
const altText = process.argv[4];
const credit = process.argv[5] ?? null;
const position = 1;

const { data: article, error: articleError } = await supabase
  .from("articles")
  .select("id")
  .eq("slug", slug)
  .single();
if (articleError || !article) throw new Error(`article not found: ${articleError?.message}`);

const inputBuffer = readFileSync(localPath);
const metadata = await sharp(inputBuffer).rotate().metadata();

const SIZES = { thumbnail: 320, card: 640, full: 1600 };
const [thumbnail, card, full] = await Promise.all([
  sharp(inputBuffer).rotate().resize({ width: SIZES.thumbnail, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
  sharp(inputBuffer).rotate().resize({ width: SIZES.card, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
  sharp(inputBuffer).rotate().resize({ width: SIZES.full, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
]);

// Versioned filename (not a fixed name) - Next.js's image optimizer caches
// by URL for hours (minimumCacheTTL), so re-uploading to the same path as a
// prior image silently keeps serving the OLD content until that cache
// expires. A new version segment forces a fresh URL every time this script
// runs, so replacements are visible immediately.
const version = Date.now();
const basePath = `${article.id}/${position}`;
for (const [name, data] of [
  ["thumb.webp", thumbnail],
  ["card.webp", card],
  ["full.webp", full],
]) {
  const { error } = await supabase.storage
    .from("article-images")
    .upload(`${basePath}/v${version}-${name}`, data, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`upload ${name}: ${error.message}`);
}

const { data: updated, error: updateError } = await supabase
  .from("article_images")
  .update({
    storage_path: `${basePath}/v${version}-full.webp`,
    thumbnail_path: `${basePath}/v${version}-thumb.webp`,
    card_path: `${basePath}/v${version}-card.webp`,
    original_path: null,
    width: metadata.width,
    height: metadata.height,
    alt_text: altText,
    credit,
  })
  .eq("article_id", article.id)
  .eq("position", position)
  .select()
  .single();
if (updateError) throw new Error(`update: ${updateError.message}`);

console.log(JSON.stringify(updated));
