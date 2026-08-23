"use client";

import { useState } from "react";
import { toast } from "sonner";

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const instagramUrl = "instagram-stories://share?source_application=vidrohianand";

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("लिंक कॉपी हो गया");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-y py-4 text-sm">
      <span className="font-medium text-muted-foreground">शेयर करें:</span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border px-3.5 py-1.5 transition-colors hover:border-brand hover:text-brand"
      >
        WhatsApp
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border px-3.5 py-1.5 transition-colors hover:border-brand hover:text-brand"
      >
        X
      </a>
      <a
        href={instagramUrl}
        className="rounded-full border px-3.5 py-1.5 transition-colors hover:border-brand hover:text-brand"
      >
        Instagram Stories
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="rounded-full border px-3.5 py-1.5 transition-colors hover:border-brand hover:text-brand"
      >
        {copied ? "कॉपी हो गया ✓" : "लिंक कॉपी करें"}
      </button>
    </div>
  );
}
