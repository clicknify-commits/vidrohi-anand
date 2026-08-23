"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { publicImageUrl } from "@/lib/images/url";
import { useLanguage } from "@/components/admin/language-provider";
import { FEATURED_MIN_WIDTH, FEATURED_MIN_HEIGHT } from "@/lib/images/constants";
import type { ArticleImage } from "@/lib/types";

interface ImageSlotProps {
  articleId: string;
  position: number;
  image: ArticleImage | null;
  onChange: (image: ArticleImage | null) => void;
}

export function ImageSlot({ articleId, position, image, onChange }: ImageSlotProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();
  const [isSaving, startSaving] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("articleId", articleId);
    formData.append("position", String(position));
    formData.append("file", file);
    formData.append("altText", "");

    startUpload(async () => {
      const res = await fetch("/api/admin/images/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("images.uploadFailed"));
        return;
      }
      onChange(data as ArticleImage);
      toast.success(t("images.uploaded", { position }));
    });
  }

  function patch(fields: Partial<Pick<ArticleImage, "alt_text" | "caption" | "credit" | "focal_x" | "focal_y">>) {
    if (!image) return;
    startSaving(async () => {
      const res = await fetch(`/api/admin/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (res.ok) onChange(data as ArticleImage);
    });
  }

  async function handleDelete() {
    if (!image) return;
    await fetch(`/api/admin/images/${image.id}`, { method: "DELETE" });
    onChange(null);
  }

  function handleFocalClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const focal_x = (e.clientX - rect.left) / rect.width;
    const focal_y = (e.clientY - rect.top) / rect.height;
    patch({ focal_x, focal_y });
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {position === 1 ? t("images.featured") : t("images.gallery", { position })}
        </span>
        {image ? (
          <button type="button" onClick={handleDelete} className="text-xs text-destructive">
            {t("images.remove")}
          </button>
        ) : null}
      </div>

      {image ? (
        <div
          className="relative aspect-video cursor-crosshair overflow-hidden rounded bg-muted"
          onClick={handleFocalClick}
          title={t("images.focalHint")}
        >
          <Image
            src={publicImageUrl(image.card_path)}
            alt={image.alt_text || ""}
            fill
            sizes="300px"
            className="object-cover"
            style={{ objectPosition: `${image.focal_x * 100}% ${image.focal_y * 100}%` }}
          />
          <div
            className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand shadow"
            style={{ left: `${image.focal_x * 100}%`, top: `${image.focal_y * 100}%` }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex aspect-video w-full items-center justify-center rounded border border-dashed text-sm text-muted-foreground hover:bg-muted/50"
        >
          {isUploading ? t("images.uploading") : t("images.choose")}
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {position === 1 &&
      image &&
      image.width != null &&
      image.height != null &&
      (image.width < FEATURED_MIN_WIDTH || image.height < FEATURED_MIN_HEIGHT) ? (
        <p className="text-[11px] text-amber-700">
          {t("images.recommendedSize", { w: FEATURED_MIN_WIDTH, h: FEATURED_MIN_HEIGHT })}
          {" · "}
          {t("images.currentSize", { w: image.width, h: image.height })}
        </p>
      ) : null}

      {image ? (
        <div className="space-y-1.5">
          <Input
            placeholder={t("images.altPlaceholder")}
            defaultValue={image.alt_text}
            onBlur={(e) => patch({ alt_text: e.target.value })}
          />
          <Input
            placeholder={t("images.captionPlaceholder")}
            defaultValue={image.caption ?? ""}
            onBlur={(e) => patch({ caption: e.target.value })}
          />
          <Input
            placeholder={t("images.creditPlaceholder")}
            defaultValue={image.credit ?? ""}
            onBlur={(e) => patch({ credit: e.target.value })}
          />
          {isSaving ? <p className="text-xs text-muted-foreground">{t("images.saving")}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
