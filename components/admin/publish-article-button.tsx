"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/admin/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export function PublishArticleButton({ articleId }: { articleId: string }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const res = await fetch(`/api/admin/articles/${articleId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("publish.statusChangeFailed"), {
          description: Array.isArray(data.missing)
            ? data.missing
                .map((m: { key: TranslationKey; position: number }) => t(m.key, { position: m.position }))
                .join("، ")
            : undefined,
        });
        return;
      }
      toast.success(t("publish.updated"));
      router.refresh();
    });
  }

  return (
    <Button type="button" variant="ghost" size="sm" disabled={isPending} onClick={handlePublish}>
      {t("publish.publishNow")}
    </Button>
  );
}
