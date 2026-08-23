import type { TranslationKey } from "@/lib/i18n/dictionary";

export interface MissingItem {
  key: TranslationKey;
  position: number;
}

export interface ReviewCheck {
  ready: boolean;
  missing: MissingItem[];
}

type ImageForCheck = {
  position: number;
  alt_text: string;
  width: number | null;
  height: number | null;
};

// Image dimensions are informational only (see images.recommendedSize in the
// composer) - they used to hard-block review/publish, but a strict minimum
// rejected legitimate images outright, so size no longer gates readiness.
export function checkReadyForReview(images: ImageForCheck[]): ReviewCheck {
  const missing: MissingItem[] = [];

  for (let position = 1; position <= 5; position++) {
    const image = images.find((img) => img.position === position);
    if (!image) {
      missing.push({ key: "images.slotMissing", position });
      continue;
    }
    if (!image.alt_text || !image.alt_text.trim()) {
      missing.push({ key: "images.altRequired", position });
    }
  }

  return { ready: missing.length === 0, missing };
}
