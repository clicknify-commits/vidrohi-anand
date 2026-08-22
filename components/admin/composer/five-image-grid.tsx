"use client";

import { ImageSlot } from "./image-slot";
import type { ArticleImage } from "@/lib/types";

interface FiveImageGridProps {
  articleId: string;
  images: ArticleImage[];
  onChange: (images: ArticleImage[]) => void;
}

export function FiveImageGrid({ articleId, images, onChange }: FiveImageGridProps) {
  function handleSlotChange(position: number, image: ArticleImage | null) {
    const next = images.filter((img) => img.position !== position);
    if (image) next.push(image);
    onChange(next.sort((a, b) => a.position - b.position));
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[1, 2, 3, 4, 5].map((position) => (
        <ImageSlot
          key={position}
          articleId={articleId}
          position={position}
          image={images.find((img) => img.position === position) ?? null}
          onChange={(image) => handleSlotChange(position, image)}
        />
      ))}
    </div>
  );
}
