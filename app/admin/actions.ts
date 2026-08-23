"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LANG_COOKIE, type Lang } from "@/lib/i18n/dictionary";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export async function setLanguage(lang: Lang) {
  const store = await cookies();
  store.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
