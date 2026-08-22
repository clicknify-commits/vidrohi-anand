"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createArticle() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id")
    .order("sort_order")
    .limit(1);

  const categoryId = categories?.[0]?.id;
  if (!categoryId) {
    throw new Error("कोई श्रेणी नहीं मिली - पहले एक श्रेणी बनाएँ।");
  }

  const tempSlug = `untitled-${Date.now().toString(36)}`;

  const { data: article, error } = await supabase
    .from("articles")
    .insert({
      headline: "शीर्षक रहित स्टोरी",
      slug: tempSlug,
      category_id: categoryId,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !article) {
    throw new Error(error?.message ?? "स्टोरी नहीं बन सकी");
  }

  redirect(`/admin/articles/${article.id}`);
}
