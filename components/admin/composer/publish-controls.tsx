"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { ArticleStatus } from "@/lib/types";

const STATUS_LABELS: Record<ArticleStatus, string> = {
  draft: "ड्राफ्ट",
  in_review: "समीक्षा में",
  scheduled: "शेड्यूल्ड",
  published: "प्रकाशित",
  archived: "आर्काइव्ड",
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
        toast.error(data.error ?? "स्टेटस बदला नहीं जा सका", {
          description: Array.isArray(data.missing) ? data.missing.join("، ") : undefined,
        });
        return;
      }
      onStatusChanged(data.status);
      toast.success("अपडेट हो गया");
    });
  }

  async function handleDuplicate() {
    await onBeforeTransition();
    const res = await fetch(`/api/admin/articles/${articleId}/duplicate`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      toast.success("फॉलो-अप ड्राफ्ट बन गया");
      router.push(`/admin/articles/${data.id}`);
    } else {
      toast.error(data.error ?? "फेल हो गया");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded border p-3">
        <p className="text-sm font-medium">वर्तमान स्टेटस</p>
        <p className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</p>
      </div>

      <div className="flex items-center justify-between rounded border p-3">
        <Label>ब्रेकिंग न्यूज़</Label>
        <Switch checked={isBreaking} onCheckedChange={onBreakingChange} />
      </div>

      <div className="flex flex-wrap gap-2">
        {status === "draft" ? (
          <Button disabled={isPending} onClick={() => transition("in_review")}>
            समीक्षा में भेजें
          </Button>
        ) : null}
        {status === "draft" || status === "in_review" ? (
          <Button disabled={isPending} onClick={() => transition("published")}>
            अभी प्रकाशित करें
          </Button>
        ) : null}
        {status === "published" ? (
          <Button disabled={isPending} variant="outline" onClick={() => transition("archived")}>
            आर्काइव करें
          </Button>
        ) : null}
        <Button disabled={isPending} variant="outline" onClick={handleDuplicate}>
          फॉलो-अप के रूप में डुप्लिकेट करें
        </Button>
      </div>

      {status === "draft" || status === "in_review" ? (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <div className="space-y-1">
            <Label>शेड्यूल करें (तारीख़ व समय)</Label>
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
            शेड्यूल करें
          </Button>
        </div>
      ) : null}
    </div>
  );
}
