import { Search } from "lucide-react";

// Plain GET form - works with zero JS. The width-on-focus expansion is pure
// CSS, so there's no client component needed just for this affordance.
export function SearchBox() {
  return (
    <form action="/search" method="GET" className="relative shrink-0 py-2">
      <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        name="q"
        placeholder="खोजें…"
        aria-label="समाचार खोजें"
        className="w-28 rounded-full border bg-muted/40 py-1.5 pr-3 pl-8 text-sm outline-none transition-all duration-300 focus:w-52 focus:border-brand focus:bg-background sm:w-36 sm:focus:w-64"
      />
    </form>
  );
}
