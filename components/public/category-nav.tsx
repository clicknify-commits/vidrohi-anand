import Link from "next/link";
import { getActiveCategories } from "@/lib/articles/queries";

export async function CategoryNav() {
  const categories = await getActiveCategories();

  return (
    <nav className="border-b bg-brand">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 text-sm">
        <Link
          href="/"
          className="shrink-0 px-3 py-2.5 font-semibold text-brand-foreground hover:bg-black/10"
        >
          होम
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="shrink-0 px-3 py-2.5 text-brand-foreground/90 hover:bg-black/10"
          >
            {cat.name_hi}
          </Link>
        ))}
      </div>
    </nav>
  );
}
