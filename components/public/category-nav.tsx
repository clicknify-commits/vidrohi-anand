import Link from "next/link";
import { getActiveCategories } from "@/lib/articles/queries";
import { SearchBox } from "./search-box";

export async function CategoryNav() {
  const categories = await getActiveCategories();

  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4">
        <div className="flex flex-1 gap-1 overflow-x-auto text-sm">
          <Link
            href="/"
            className="shrink-0 border-b-2 border-transparent px-3 py-3 font-semibold text-foreground hover:border-brand"
          >
            होम
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="shrink-0 border-b-2 border-transparent px-3 py-3 font-medium text-foreground/80 hover:border-brand hover:text-foreground"
            >
              {cat.name_hi}
            </Link>
          ))}
        </div>
        <SearchBox />
      </div>
    </nav>
  );
}
