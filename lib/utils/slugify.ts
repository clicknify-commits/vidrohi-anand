// Best-effort Devanagari -> Latin transliteration for generating readable,
// URL-safe slugs from Hindi text. Not a linguistic transliteration standard
// (no IAST/ITRANS diacritics) - optimized for producing clean slugs that a
// reporter can still recognize and hand-edit.

const CONSONANTS: Record<string, string> = {
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

const VOWELS: Record<string, string> = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo",
  ऋ: "ri", ॠ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au",
  ऍ: "e", ऑ: "o",
};

const MATRAS: Record<string, string> = {
  "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
  "ृ": "ri", "ॄ": "ri", "े": "e", "ै": "ai", "ो": "o",
  "ौ": "au", "ॅ": "e", "ॉ": "o",
};

const DIGITS: Record<string, string> = {
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4",
  "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

const ANUSVARA = "ं";
const VISARGA = "ः";
const CHANDRABINDU = "ँ";
const VIRAMA = "्";

function transliterateDevanagari(input: string): string {
  const chars = Array.from(input);
  let out = "";

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const next = chars[i + 1];

    if (CONSONANTS[ch]) {
      const base = CONSONANTS[ch].slice(0, -1); // strip the inherent "a"
      if (next && MATRAS[next]) {
        out += base + MATRAS[next];
        i++;
      } else if (next === VIRAMA) {
        out += base; // conjunct: no vowel sound on this consonant
        i++;
      } else {
        out += base + "a";
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

    if (ch === ANUSVARA || ch === CHANDRABINDU) {
      out += "n";
      continue;
    }

    if (ch === VISARGA) {
      out += "h";
      continue;
    }

    if (ch === VIRAMA) {
      continue; // stray virama with no preceding consonant match
    }

    out += ch;
  }

  return out;
}

export function slugify(input: string): string {
  const transliterated = transliterateDevanagari(input);

  return transliterated
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
