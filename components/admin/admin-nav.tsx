import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/admin/actions";
import type { Profile } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/admin", label: "डैशबोर्ड" },
  { href: "/admin/articles", label: "समाचार" },
  { href: "/admin/media", label: "मीडिया लाइब्रेरी" },
  { href: "/admin/categories", label: "श्रेणियाँ" },
  { href: "/admin/settings", label: "सेटिंग्स" },
];

export function AdminNav({ profile }: { profile: Profile }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/admin" className="rounded bg-brand px-2.5 py-1 text-sm font-bold text-brand-foreground">
          विद्रोही आनंद
        </Link>
        <nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{profile.display_name}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              लॉगआउट
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
