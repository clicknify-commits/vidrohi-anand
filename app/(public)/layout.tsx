import { HeaderStrip } from "@/components/public/header-strip";
import { CategoryNav } from "@/components/public/category-nav";
import { BreakingTicker } from "@/components/public/breaking-ticker";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <HeaderStrip />
      <CategoryNav />
      <BreakingTicker />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <Footer />
    </>
  );
}
