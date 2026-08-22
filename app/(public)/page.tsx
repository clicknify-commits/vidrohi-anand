import { LeadBlock } from "@/components/public/lead-block";
import { CategoryRail } from "@/components/public/category-rail";
import { getActiveCategories } from "@/lib/articles/queries";

export default async function HomePage() {
  const categories = await getActiveCategories();

  return (
    <div className="space-y-10">
      <LeadBlock />
      {categories.map((cat) => (
        <CategoryRail key={cat.slug} categorySlug={cat.slug} categoryName={cat.name_hi} />
      ))}
    </div>
  );
}
