"use client";

import { useRef, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { publicImageUrl } from "@/lib/images/url";
import { useLanguage } from "@/components/admin/language-provider";

export function AuthorPhotoUpload({
  authorId,
  photoPath,
}: {
  authorId: string;
  photoPath: string | null;
}) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startUpload] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    startUpload(async () => {
      const res = await fetch(`/api/admin/authors/${authorId}/photo`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("images.uploadFailed"));
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative size-20 shrink-0 overflow-hidden rounded-full border bg-muted hover:opacity-80"
      >
        {photoPath ? (
          <Image src={publicImageUrl(photoPath)} alt="" fill sizes="80px" className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] text-muted-foreground">
            {isUploading ? "…" : t("images.choose")}
          </span>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
