"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Native scroll-snap does the heavy lifting (smooth touch momentum on
// mobile, no JS layout cost) - the buttons are just a desktop affordance
// for mouse users who have no swipe gesture.
export function HorizontalScroller({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollBy(dir: -1 | 1) {
    const node = trackRef.current;
    if (!node) return;
    node.scrollBy({ left: dir * node.clientWidth * 0.85, behavior: "smooth" });
  }

  return (
    <div className="group/scroller relative">
      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-1"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="पीछे स्क्रॉल करें"
        className="absolute top-1/2 -left-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground opacity-0 shadow-md transition-opacity group-hover/scroller:opacity-100 sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="आगे स्क्रॉल करें"
        className="absolute top-1/2 -right-3 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground opacity-0 shadow-md transition-opacity group-hover/scroller:opacity-100 sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
