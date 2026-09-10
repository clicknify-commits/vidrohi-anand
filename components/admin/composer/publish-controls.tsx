"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/components/admin/language-provider";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";
import type { ArticleStatus } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const STATUS_KEYS: Record<ArticleStatus, TranslationKey> = {
  draft: "status.draft",
  in_review: "status.in_review",
  scheduled: "status.scheduled",
  published: "status.published",
  archived: "status.archived",
};

interface PublishControlsProps {
  articleId: string;
  status: ArticleStatus;
  isBreaking: boolean;
  onBreakingChange: (value: boolean) => void;
  onBeforeTransition: () => Promise<void>;
  onStatusChanged: (status: ArticleStatus) => void;
}

export function PublishControls({
  articleId,
  status,
  isBreaking,
  onBreakingChange,
  onBeforeTransition,
  onStatusChanged,
}: PublishControlsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [scheduleAt, setScheduleAt] = useState("");
  const [isPending, startTransition] = useTransition();

  function transition(nextStatus: ArticleStatus, publishedAt?: string) {
    startTransition(async () => {
      await onBeforeTransition();
      const res = await fetch(`/api/admin/articles/${articleId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, published_at: publishedAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? t("publish.statusChangeFailed"), {
          description: Array.isArray(data.missing) ? data.missing.join("، ") : undefined,
        });
        return;
      }
      onStatusChanged(data.status);
      toast.success(t("publish.updated"));
    });
  }

  async function handleDuplicate() {
    await onBeforeTransition();
    const res = await fetch(`/api/admin/articles/${articleId}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success(t("publish.duplicated"));
      router.push(`/admin/articles/${data.id}`);
    } else {
      toast.error(data.error ?? t("publish.duplicateFailed"));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium">{t("publish.currentStatus")}</p>
        <p className="text-xs text-muted-foreground">{t(STATUS_KEYS[status])}</p>
      </div>

      <div className="flex items-center justify-between rounded border p-3">
        <Label>{t("publish.breakingNews")}</Label>
        <Switch checked={isBreaking} onCheckedChange={onBreakingChange} />
      </div>

      <div className="flex flex-wrap gap-2">
        {status === "draft" ? (
          <Button disabled={isPending} onClick={() => transition("in_review")}>
            {t("publish.sendToReview")}
          </Button>
        ) : null}
        {status === "draft" || status === "in_review" ? (
          <Button disabled={isPending} onClick={() => transition("published")}>
            {t("publish.publishNow")}
          </Button>
        ) : null}
        {status === "published" ? (
          <Button disabled={isPending} variant="outline" onClick={() => transition("archived")}>
            {t("publish.archive")}
          </Button>
        ) : null}
        <Button disabled={isPending} variant="outline" onClick={handleDuplicate}>
          {t("publish.duplicate")}
        </Button>
        {status !== "published" ? (
          <DeleteArticleButton
            articleId={articleId}
            onDeleted={() => router.push("/admin/articles")}
          >
            {t("publish.deleteArticle")}
          </DeleteArticleButton>
        ) : null}
      </div>

      {status === "draft" || status === "in_review" ? (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <div className="space-y-1">
            <Label>{t("publish.scheduleLabel")}</Label>
            <Input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            disabled={isPending || !scheduleAt}
            onClick={() => transition("scheduled", new Date(scheduleAt).toISOString())}
          >
            {t("publish.schedule")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
