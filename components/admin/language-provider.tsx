"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/app/admin/actions";
import { t as translate, type Lang, type TranslationKey } from "@/lib/i18n/dictionary";

interface LanguageContextValue {
  lang: Lang;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  toggle: () => void;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLang,
  children,
}: {
  initialLang: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(initialLang);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next: Lang = lang === "hi" ? "en" : "hi";
    setLang(next);
    startTransition(async () => {
      await setLanguage(next);
      router.refresh();
    });
  }

  return (
    <LanguageContext.Provider
      value={{
        lang,
        t: (key, vars) => translate(lang, key, vars),
        toggle,
        isPending,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
