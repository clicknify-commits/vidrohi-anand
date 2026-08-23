import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";
import { LanguageProvider } from "@/components/admin/language-provider";
import { getLanguage } from "@/lib/i18n/language";
import type { Profile } from "@/lib/types";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, user_id, display_name, role, created_at")
    .eq("user_id", user.id)
    .single<Profile>();

  if (!profile) {
    redirect("/auth/login");
  }

  const lang = await getLanguage();

  return (
    <LanguageProvider initialLang={lang}>
      <div className="min-h-screen bg-muted/20">
        <AdminNav profile={profile} />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </LanguageProvider>
  );
}
