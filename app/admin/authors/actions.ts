"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slugify";

export async function createAuthor(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = await createClient();
  await supabase.from("authors").insert({ name, slug: slugify(name) });

  revalidatePath("/admin/authors");
}

export async function updateAuthor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const x = String(formData.get("x") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const facebook = String(formData.get("facebook") ?? "").trim();
  const linkedin = String(formData.get("linkedin") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  if (!id || !name) return;

  const supabase = await createClient();
  await supabase
    .from("authors")
    .update({
      name,
      bio: bio || null,
      social_links: { x, instagram, facebook, linkedin, website },
    })
    .eq("id", id);

  revalidatePath("/admin/authors");
  revalidatePath("/admin/articles");
}

export async function deleteAuthor(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("authors").delete().eq("id", id);

  revalidatePath("/admin/authors");
}
