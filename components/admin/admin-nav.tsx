"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/admin/actions";
import { useLanguage } from "@/components/admin/language-provider";
import type { Profile } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const NAV_ITEMS: { href: string; key: TranslationKey }[] = [
  { href: "/admin", key: "nav.dashboard" },
  { href: "/admin/articles", key: "nav.articles" },
  { href: "/admin/media", key: "nav.media" },
  { href: "/admin/categories", key: "nav.categories" },
  { href: "/admin/authors", key: "nav.authors" },
  { href: "/admin/settings", key: "nav.settings" },
];

export function AdminNav({ profile }: { profile: Profile }) {
  const { t, lang, toggle, isPending } = useLanguage();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/admin" className="rounded bg-brand px-2.5 py-1 text-sm font-bold text-brand-foreground">
          {t("nav.brand")}
        </Link>
        <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={toggle}
            disabled={isPending}
            className="rounded border px-2 py-1 text-xs font-medium hover:bg-muted"
            aria-label="Switch language"
          >
            {lang === "hi" ? "हिंदी / EN" : "EN / हिंदी"}
          </button>
          <span>{profile.display_name}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              {t("nav.logout")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
