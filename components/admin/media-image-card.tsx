"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { publicImageUrl } from "@/lib/images/url";
import { useLanguage } from "@/components/admin/language-provider";

interface MediaImageCardProps {
  imageId: string;
  articleId: string;
  thumbnailPath: string;
  altText: string;
  headline: string;
  position: number;
}

export function MediaImageCard({
  imageId,
  articleId,
  thumbnailPath,
  altText,
  headline,
  position,
}: MediaImageCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/images/${imageId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? t("media.deleteFailed"));
        return;
      }
      toast.success(t("media.deleted"));
      router.refresh();
    });
  }

  return (
    <Card className="group relative overflow-hidden py-0">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            type="button"
            className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            title={t("images.remove")}
          >
            <Trash2 className="size-3.5" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("media.deleteConfirmTitle")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleDelete}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Link href={`/admin/articles/${articleId}`}>
        <div className="relative aspect-square bg-muted">
          <Image
            src={publicImageUrl(thumbnailPath)}
            alt={altText || ""}
            fill
            sizes="200px"
            className="object-cover"
          />
        </div>
        <CardContent className="p-2">
          <p className="truncate text-xs font-medium">{headline}</p>
          <p className="text-[11px] text-muted-foreground">{t("media.slot", { position })}</p>
        </CardContent>
      </Link>
    </Card>
  );
}
