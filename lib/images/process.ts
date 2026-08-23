import sharp from "sharp";

export { FEATURED_MIN_WIDTH, FEATURED_MIN_HEIGHT } from "@/lib/images/constants";

export interface ProcessedImage {
  thumbnail: Buffer;
  card: Buffer;
  full: Buffer;
  width: number;
  height: number;
}

const SIZES = {
  thumbnail: 320,
  card: 640,
  full: 1600,
} as const;

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const metadata = await sharp(input, { failOn: "none" }).rotate().metadata();
  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;

  const [thumbnail, card, full] = await Promise.all([
    sharp(input)
      .rotate()
      .resize({ width: SIZES.thumbnail, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(input)
      .rotate()
      .resize({ width: SIZES.card, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
    sharp(input)
      .rotate()
      .resize({ width: SIZES.full, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer(),
  ]);

  return { thumbnail, card, full, width, height };
}

const INLINE_MAX_WIDTH = 1400;

export interface ProcessedInlineImage {
  buffer: Buffer;
  width: number;
  height: number;
}

// Body-embedded images (dropped/pasted into the article text) don't need the
// thumb/card/full triad the 5-slot gallery uses - they render at one size
// inline, so a single content-width derivative avoids generating two unused
// variants per drop.
export async function processInlineImage(input: Buffer): Promise<ProcessedInlineImage> {
  const resized = sharp(input, { failOn: "none" })
    .rotate()
    .resize({ width: INLINE_MAX_WIDTH, withoutEnlargement: true });
  const buffer = await resized.webp({ quality: 82 }).toBuffer();
  const metadata = await sharp(buffer).metadata();
  return { buffer, width: metadata.width ?? 0, height: metadata.height ?? 0 };
}
