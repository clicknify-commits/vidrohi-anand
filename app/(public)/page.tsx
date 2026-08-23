import { LeadBlock } from "@/components/public/lead-block";
import { CategoryRail } from "@/components/public/category-rail";
import { MagazineCategoryRail } from "@/components/public/magazine-category-rail";
import { LucknowWeather } from "@/components/public/lucknow-weather";
import { StocksWidget } from "@/components/public/stocks-widget";
import { FuelPriceWidget } from "@/components/public/fuel-price-widget";
import { GoldSilverWidget } from "@/components/public/gold-silver-widget";
import { JobsWidget } from "@/components/public/jobs-widget";
import { RandomNewsWidget } from "@/components/public/random-news-widget";
import { HeadlinesWidget } from "@/components/public/headlines-widget";
import { Reveal } from "@/components/public/reveal";
import { getActiveCategories } from "@/lib/articles/queries";

// Sports/entertainment/business get the magazine-style featured+trio
// layout; the rest of the categories keep the uniform 4-card rail.
const MAGAZINE_STYLE_SLUGS = new Set(["khel", "manoranjan", "business"]);

export default async function HomePage() {
  const categories = await getActiveCategories();

  return (
    <div className="space-y-10">
      <Reveal>
        <LeadBlock />
      </Reveal>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {categories.map((cat) =>
            MAGAZINE_STYLE_SLUGS.has(cat.slug) ? (
              <MagazineCategoryRail
                key={cat.slug}
                categorySlug={cat.slug}
                categoryName={cat.name_hi}
              />
            ) : (
              <CategoryRail key={cat.slug} categorySlug={cat.slug} categoryName={cat.name_hi} />
            )
          )}
        </div>
        <aside className="space-y-6">
          <LucknowWeather />
          <StocksWidget />
          <FuelPriceWidget />
          <GoldSilverWidget />
          <JobsWidget />
          <RandomNewsWidget />
          <HeadlinesWidget />
        </aside>
      </div>
    </div>
  );
}
