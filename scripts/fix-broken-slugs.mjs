import { createClient } from "@supabase/supabase-js";

// Mirrors lib/utils/slugify.ts exactly (this script runs as plain Node ESM
// outside the TS build, same duplication pattern as scripts/lib/create-article.mjs).
const CONSONANTS = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ng",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "ny",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h",
  क़: "q", ख़: "kh", ग़: "gh", ज़: "z", ड़: "r", ढ़: "rh", फ़: "f", य़: "y",
  ळ: "l",
};
const VOWELS = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo",
  ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
  अं: "an", अः: "ah",
};
const MATRAS = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ं": "n", "ः": "h", "ँ": "n",
};
const DIGITS = { "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9" };
const VIRAMA = "्";

function transliterateDevanagari(input) {
  let out = "";
  const chars = Array.from(input);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (CONSONANTS[ch]) {
      out += CONSONANTS[ch];
      if (next === VIRAMA) {
        i++;
      } else if (next && MATRAS[next]) {
        out += MATRAS[next];
        i++;
      } else if (!next || !(CONSONANTS[next] || MATRAS[next] === undefined && VOWELS[next])) {
        out += "a";
      } else {
        out += "a";
      }
      continue;
    }
    if (VOWELS[ch]) {
      out += VOWELS[ch];
      continue;
    }
    if (DIGITS[ch]) {
      out += DIGITS[ch];
      continue;
    }
    if (ch === VIRAMA) continue;
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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const { data: articles, error } = await supabase
  .from("articles")
  .select("id, slug, status, category_id, categories(slug)");
if (error) throw new Error(error.message);

const dryRun = process.argv.includes("--dry-run");
const dirty = articles.filter((a) => a.slug !== slugify(a.slug));

console.log(`${dirty.length} article(s) with a non-clean slug out of ${articles.length} total.`);

for (const article of dirty) {
  let cleaned = slugify(article.slug);
  if (!cleaned) cleaned = `article-${article.id.slice(0, 8)}`;

  // Guard against collisions with an existing clean slug.
  let candidate = cleaned;
  let suffix = 2;
  while (articles.some((a) => a.id !== article.id && a.slug === candidate)) {
    candidate = `${cleaned}-${suffix++}`;
  }

  console.log(`${article.id}  "${article.slug}"  ->  "${candidate}"  (${article.status})`);

  if (dryRun) continue;

  const { error: updateError } = await supabase
    .from("articles")
    .update({ slug: candidate })
    .eq("id", article.id);
  if (updateError) {
    console.error(`  FAILED: ${updateError.message}`);
    continue;
  }

  if (article.status === "published" && article.categories?.slug) {
    await supabase.from("redirects").upsert(
      {
        old_slug: `/${article.categories.slug}/${article.slug}`,
        new_slug: `/${article.categories.slug}/${candidate}`,
      },
      { onConflict: "old_slug" }
    );
  }
}

console.log(dryRun ? "\nDry run - no changes made. Re-run without --dry-run to apply." : "\nDone.");
