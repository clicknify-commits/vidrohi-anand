"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";

export async function createCategory(formData: FormData) {
  const nameHi = String(formData.get("name_hi") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!nameHi || !nameEn) return;

  const slug = slugify(slugInput || nameEn);
  const supabase = await createClient();
  await supabase.from("categories").insert({
    name_hi: nameHi,
    name_en: nameEn,
    slug,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
  });

  revalidatePath("/admin/categories");
}

export async function updateCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const nameHi = String(formData.get("name_hi") ?? "").trim();
  const nameEn = String(formData.get("name_en") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const sortOrder = Number(formData.get("sort_order") ?? 0);
  const isActive = formData.get("is_active") === "on";

  const supabase = await createClient();
  await supabase
    .from("categories")
    .update({
      name_hi: nameHi,
      name_en: nameEn,
      slug,
      sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
      is_active: isActive,
    })
    .eq("id", id);

  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}

export async function createTag(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  await supabase.from("tags").insert({ name, slug: slugify(name) });
  revalidatePath("/admin/categories");
}

export async function deleteTag(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
