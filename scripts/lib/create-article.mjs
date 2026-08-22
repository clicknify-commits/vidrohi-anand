import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { generateGraphicCard } from "./graphic-card.mjs";

const SIZES = { thumbnail: 320, card: 640, full: 1600 };

function getClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
  }
  return createClient(url, serviceRoleKey);
}

// Mirrors lib/images/process.ts - duplicated here because this script runs
// as plain Node ESM outside the Next.js/TypeScript build.
async function processImage(inputBuffer) {
  const metadata = await sharp(inputBuffer).rotate().metadata();
  const [thumbnail, card, full] = await Promise.all([
    sharp(inputBuffer).rotate().resize({ width: SIZES.thumbnail, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    sharp(inputBuffer).rotate().resize({ width: SIZES.card, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    sharp(inputBuffer).rotate().resize({ width: SIZES.full, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
  ]);
  return { thumbnail, card, full, width: metadata.width ?? 0, height: metadata.height ?? 0 };
}

// Mirrors lib/utils/slugify.ts exactly (duplicated for the same reason as
// processImage above) - the Devanagari transliteration step is what actually
// makes Hindi text produce a real slug instead of collapsing to "".
const CONSONANTS = {
  क: "ka", ख: "kha", ग: "ga", घ: "gha", ङ: "nga",
  च: "cha", छ: "chha", ज: "ja", झ: "jha", ञ: "nya",
  ट: "ta", ठ: "tha", ड: "da", ढ: "dha", ण: "na",
  त: "ta", थ: "tha", द: "da", ध: "dha", न: "na",
  प: "pa", फ: "pha", ब: "ba", भ: "bha", म: "ma",
  य: "ya", र: "ra", ल: "la", व: "va",
  श: "sha", ष: "sha", स: "sa", ह: "ha", ळ: "la",
  "क़": "qa", "ख़": "kha", "ग़": "ga", "ज़": "za",
  "ड़": "ra", "ढ़": "rha", "फ़": "fa", "य़": "ya",
};
const VOWELS = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo",
  ऋ: "ri", ॠ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
  ऍ: "e", ऑ: "o",
};
const MATRAS = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "ृ": "ri", "ॄ": "ri", "े": "e", "ै": "ai", "ो": "o",
  "ौ": "au", "ॅ": "e", "ॉ": "o",
};
const DIGITS = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};
const ANUSVARA = "ं";
const VISARGA = "ः";
const CHANDRABINDU = "ँ";
const VIRAMA = "्";

function transliterateDevanagari(input) {
  const chars = Array.from(input);
  let out = "";
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];
    if (CONSONANTS[ch]) {
      const base = CONSONANTS[ch].slice(0, -1);
      if (next && MATRAS[next]) {
        out += base + MATRAS[next];
        i++;
      } else if (next === VIRAMA) {
        out += base;
        i++;
      } else {
        out += base + "a";
      }
      continue;
    }
    if (VOWELS[ch]) { out += VOWELS[ch]; continue; }
    if (DIGITS[ch]) { out += DIGITS[ch]; continue; }
    if (ch === ANUSVARA || ch === CHANDRABINDU) { out += "n"; continue; }
    if (ch === VISARGA) { out += "h"; continue; }
    if (ch === VIRAMA) { continue; }
    out += ch;
  }
  return out;
}

function slugify(input) {
  const transliterated = transliterateDevanagari(input);
  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function textToDoc(paragraphs) {
  return {
    type: "doc",
    content: paragraphs.map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })),
  };
}

function hashSeed(text, salt) {
  let h = salt * 2654435761;
  for (let i = 0; i < text.length; i++) {
    h = (h ^ text.charCodeAt(i)) * 16777619;
  }
  return h >>> 0;
}

async function ensureTag(supabase, name) {
  const slug = slugify(name);
  const { data: existing } = await supabase.from("tags").select("id").eq("slug", slug).maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase.from("tags").insert({ name, slug }).select("id").single();
  if (!error) return created.id;

  // Another call in this same batch won the insert race for this slug - reuse it.
  if (error.code === "23505") {
    const { data: retry } = await supabase.from("tags").select("id").eq("slug", slug).single();
    if (retry) return retry.id;
  }
  throw new Error(`tag "${name}": ${error.message}`);
}

/**
 * Creates one article end-to-end: row + 5 generated editorial-graphic images
 * (processed through the same thumb/card/full WebP pipeline the real upload
 * route uses) + tags, then optionally publishes it with a real timestamp.
 */
export async function createArticle({
  headline,
  dek,
  slug,
  categorySlug,
  cityTag = null,
  guestAuthorName = "विद्रोही आनंद डेस्क",
  paragraphs,
  tags = [],
  seoTitle,
  seoDescription,
  focusKeyword,
  isBreaking = false,
  imageTopic = "default",
  withImages = true,
  publish = true,
  publishedAt,
}) {
  const supabase = getClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();
  if (categoryError || !category) {
    throw new Error(`category "${categorySlug}" not found: ${categoryError?.message ?? "no row"}`);
  }

  const finalSlug = slug || slugify(headline);

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .insert({
      headline,
      dek,
      slug: finalSlug,
      body: textToDoc(paragraphs),
      category_id: category.id,
      city_tag: cityTag,
      guest_author_name: guestAuthorName,
      status: "draft",
      is_breaking: isBreaking,
      seo_title: seoTitle ?? headline,
      seo_description: seoDescription,
      focus_keyword: focusKeyword,
    })
    .select()
    .single();

  if (articleError || !article) {
    throw new Error(`article insert failed: ${articleError?.message}`);
  }

  if (withImages) {
    for (let position = 1; position <= 5; position++) {
      const buffer = await generateGraphicCard({ topic: imageTopic, seed: hashSeed(finalSlug, position) });
      const processed = await processImage(buffer);
      const basePath = `${article.id}/${position}`;

      const uploads = [
        ["thumb.webp", processed.thumbnail],
        ["card.webp", processed.card],
        ["full.webp", processed.full],
      ];
      for (const [name, data] of uploads) {
        const { error: uploadError } = await supabase.storage
          .from("article-images")
          .upload(`${basePath}/${name}`, data, { contentType: "image/webp", upsert: true });
        if (uploadError) throw new Error(`upload ${basePath}/${name}: ${uploadError.message}`);
      }

      const { error: imageError } = await supabase.from("article_images").insert({
        article_id: article.id,
        position,
        storage_path: `${basePath}/full.webp`,
        thumbnail_path: `${basePath}/thumb.webp`,
        card_path: `${basePath}/card.webp`,
        width: processed.width,
        height: processed.height,
        alt_text: `${headline} - सांकेतिक चित्र ${position}`,
        credit: "विद्रोही आनंद ग्राफिक्स",
      });
      if (imageError) throw new Error(`image row ${position}: ${imageError.message}`);
    }
  }

  if (tags.length > 0) {
    const tagIds = [];
    for (const t of tags) {
      tagIds.push(await ensureTag(supabase, t));
    }
    const { error: tagError } = await supabase
      .from("article_tags")
      .insert(tagIds.map((tagId) => ({ article_id: article.id, tag_id: tagId })));
    if (tagError) throw new Error(`tags: ${tagError.message}`);
  }

  // Backdated/historical batch articles are explicitly allowed to publish
  // without images (user decision 2026-08-22) - unlike the real composer,
  // this script does not gate publish on the 5-image rule. `publishedAt`
  // lets the backfill set the real news-event date instead of today
  // (user decision 2026-08-22) - pass an ISO date string, e.g. "2026-07-14".
  if (publish) {
    const { error: publishError } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      })
      .eq("id", article.id);
    if (publishError) throw new Error(`publish: ${publishError.message}`);
  }

  return { id: article.id, slug: finalSlug, categorySlug, status: publish ? "published" : "draft" };
}
