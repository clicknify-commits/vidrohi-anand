import Image from "next/image";
import { publicImageUrl } from "@/lib/images/url";
import type { Author } from "@/lib/types";

const SOCIAL_LABELS: { key: keyof Author["social_links"]; label: string }[] = [
  { key: "x", label: "X" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "website", label: "वेबसाइट" },
];

export function AuthorBio({ author }: { author: Author }) {
  const links = SOCIAL_LABELS.filter(({ key }) => author.social_links?.[key]);

  return (
    <div className="flex gap-4 rounded-md border bg-muted/20 p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
        {author.photo_path ? (
          <Image src={publicImageUrl(author.photo_path)} alt={author.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 space-y-1">
        <p className="font-heading font-semibold">{author.name}</p>
        {author.bio ? <p className="text-sm text-muted-foreground">{author.bio}</p> : null}
        {links.length > 0 ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1 text-xs">
            {links.map(({ key, label }) => (
              <a
                key={key}
                href={author.social_links[key]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                {label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
