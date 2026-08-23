import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "@/lib/i18n/dictionary";

export async function getLanguage(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === "en" ? "en" : "hi";
}
