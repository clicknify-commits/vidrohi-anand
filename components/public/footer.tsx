import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
        <div className="mb-4 inline-block rounded bg-brand px-2.5 py-1 font-bold text-brand-foreground">
          विद्रोही आनंद
        </div>
        <p className="mb-4">सत्य • निष्पक्षता • जनहित</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/about" className="hover:underline">
            हमारे बारे में
          </Link>
          <Link href="/contact" className="hover:underline">
            संपर्क करें
          </Link>
          <Link href="/privacy" className="hover:underline">
            गोपनीयता नीति
          </Link>
          <Link href="/terms" className="hover:underline">
            नियम व शर्तें
          </Link>
          <Link href="/rss.xml" className="hover:underline">
            RSS फ़ीड
          </Link>
        </div>
        <p className="mt-6">© {new Date().getFullYear()} विद्रोही आनंद। सर्वाधिकार सुरक्षित।</p>
      </div>
    </footer>
  );
}
