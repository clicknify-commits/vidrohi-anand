import Link from "next/link";

export function Masthead() {
  return (
    <div className="border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-5 text-center">
        <Link href="/" className="inline-block">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            विद्रोही आनंद
          </h1>
        </Link>
        <p className="mt-1.5 text-xs font-medium tracking-[0.3em] text-muted-foreground">
          सत्य • निष्पक्षता • जनहित
        </p>
      </div>
    </div>
  );
}
