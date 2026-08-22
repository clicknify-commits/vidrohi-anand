import { FEATURED_MIN_WIDTH, FEATURED_MIN_HEIGHT } from "@/lib/images/process";

export interface ReviewCheck {
  ready: boolean;
  missing: string[];
}

type ImageForCheck = {
  position: number;
  alt_text: string;
  width: number | null;
  height: number | null;
};

export function checkReadyForReview(images: ImageForCheck[]): ReviewCheck {
  const missing: string[] = [];

  for (let position = 1; position <= 5; position++) {
    const image = images.find((img) => img.position === position);
    if (!image) {
      missing.push(`स्लॉट ${position}: कोई छवि नहीं है`);
      continue;
    }
    if (!image.alt_text || !image.alt_text.trim()) {
      missing.push(`स्लॉट ${position}: ऑल्ट टेक्स्ट आवश्यक है`);
    }
    if (position === 1) {
      const w = image.width ?? 0;
      const h = image.height ?? 0;
      if (w < FEATURED_MIN_WIDTH || h < FEATURED_MIN_HEIGHT) {
        missing.push(`फ़ीचर्ड छवि कम से कम ${FEATURED_MIN_WIDTH}x${FEATURED_MIN_HEIGHT}px होनी चाहिए`);
      }
    }
  }

  return { ready: missing.length === 0, missing };
}
