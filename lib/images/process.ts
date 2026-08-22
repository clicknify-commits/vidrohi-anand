import sharp from "sharp";

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

export const FEATURED_MIN_WIDTH = 1200;
export const FEATURED_MIN_HEIGHT = 675;

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
