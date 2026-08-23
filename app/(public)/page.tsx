import { LeadBlock } from "@/components/public/lead-block";
import { CategoryRail } from "@/components/public/category-rail";
import { LucknowWeather } from "@/components/public/lucknow-weather";
import { StocksWidget } from "@/components/public/stocks-widget";
import { FuelPriceWidget } from "@/components/public/fuel-price-widget";
import { GoldSilverWidget } from "@/components/public/gold-silver-widget";
import { JobsWidget } from "@/components/public/jobs-widget";
import { Reveal } from "@/components/public/reveal";
import { getActiveCategories } from "@/lib/articles/queries";

export default async function HomePage() {
  const categories = await getActiveCategories();

  return (
    <div className="space-y-10">
      <Reveal>
        <LeadBlock />
      </Reveal>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {categories.map((cat) => (
            <CategoryRail key={cat.slug} categorySlug={cat.slug} categoryName={cat.name_hi} />
          ))}
        </div>
        <aside className="space-y-6">
          <LucknowWeather />
          <StocksWidget />
          <FuelPriceWidget />
          <GoldSilverWidget />
          <JobsWidget />
        </aside>
      </div>
    </div>
  );
}
