"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/components/admin/language-provider";

interface SeoFields {
  seo_title?: string;
  seo_description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  robots_index?: boolean;
}

interface SeoPanelProps {
  headline: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  canonicalUrl: string;
  robotsIndex: boolean;
  slug: string;
  categorySlug: string;
  onChange: (fields: SeoFields) => void;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vidrohianand.com";

export function SeoPanel({
  headline,
  seoTitle,
  seoDescription,
  focusKeyword,
  canonicalUrl,
  robotsIndex,
  slug,
  categorySlug,
  onChange,
}: SeoPanelProps) {
  const { t } = useLanguage();
  const effectiveTitle = seoTitle || headline;
  const url = `${siteUrl}/${categorySlug || "…"}/${slug}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>{t("seo.title")}</Label>
          <Input
            value={seoTitle}
            placeholder={headline}
            onChange={(e) => onChange({ seo_title: e.target.value })}
            maxLength={70}
          />
          <p className="text-xs text-muted-foreground">
            {seoTitle.length}/60 {t("seo.titleHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("seo.description")}</Label>
          <Textarea
            value={seoDescription}
            onChange={(e) => onChange({ seo_description: e.target.value })}
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {seoDescription.length}/155 {t("seo.descriptionChars")}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("seo.focusKeyword")}</Label>
          <Input value={focusKeyword} onChange={(e) => onChange({ focus_keyword: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label>{t("seo.canonicalUrl")}</Label>
          <Input
            value={canonicalUrl}
            onChange={(e) => onChange({ canonical_url: e.target.value })}
            placeholder={url}
          />
        </div>

        <div className="flex items-center justify-between rounded border p-3">
          <div>
            <Label>{t("seo.indexTitle")}</Label>
            <p className="text-xs text-muted-foreground">{t("seo.indexHint")}</p>
          </div>
          <Switch checked={robotsIndex} onCheckedChange={(checked) => onChange({ robots_index: checked })} />
        </div>
      </div>

      <div className="space-y-2 rounded border p-4">
        <p className="text-xs font-medium text-muted-foreground">{t("seo.preview")}</p>
        <div className="space-y-0.5">
          <p className="truncate text-base text-[#1a0dab]">{effectiveTitle || t("seo.titlePlaceholder")}</p>
          <p className="text-xs text-[#006621]">{url}</p>
          <p className="line-clamp-2 text-sm text-[#545454]">
            {seoDescription || t("seo.descriptionPlaceholder")}
          </p>
        </div>
      </div>
    </div>
  );
}
