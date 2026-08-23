import { HeaderStrip } from "@/components/public/header-strip";
import { Masthead } from "@/components/public/masthead";
import { CategoryNav } from "@/components/public/category-nav";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { NewsStrip } from "@/components/public/news-strip";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <HeaderStrip />
      <Masthead />
      <CategoryNav />
      <BreakingTicker />
      <NewsStrip />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
      <Footer />
    </>
  );
}
