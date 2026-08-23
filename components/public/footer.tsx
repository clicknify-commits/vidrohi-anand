import Link from "next/link";

const LINKS = [
  { href: "/about", label: "हमारे बारे में" },
  { href: "/contact", label: "संपर्क करें" },
  { href: "/privacy", label: "गोपनीयता नीति" },
  { href: "/terms", label: "नियम व शर्तें" },
  { href: "/rss.xml", label: "RSS फ़ीड" },
];

export function Footer() {
  return (
    <footer className="border-t bg-foreground text-background">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div>
          <span className="font-heading text-2xl font-bold">विद्रोही आनंद</span>
          <p className="mt-1 text-xs tracking-[0.25em] text-background/60">सत्य • निष्पक्षता • जनहित</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 border-t border-background/15 pt-6 text-sm text-background/80">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-background hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-background/50">
          © {new Date().getFullYear()} विद्रोही आनंद। सर्वाधिकार सुरक्षित।
        </p>
      </div>
    </footer>
  );
}
