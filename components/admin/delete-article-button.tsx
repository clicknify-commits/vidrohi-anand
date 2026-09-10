"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/admin/language-provider";

interface DeleteArticleButtonProps {
  articleId: string;
  children: React.ReactNode;
  variant?: "outline" | "ghost" | "destructive";
  size?: "sm" | "default";
  /** Called after a successful delete, e.g. to redirect away from the composer. */
  onDeleted?: () => void;
}

export function DeleteArticleButton({
  articleId,
  children,
  variant = "outline",
  size = "sm",
  onDeleted,
}: DeleteArticleButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("articles.deleteFailed"));
        return;
      }
      toast.success(t("articles.deleted"));
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
    });
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variant} size={size} className="text-destructive">
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("articles.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("articles.deleteConfirmBody")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete}>
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
