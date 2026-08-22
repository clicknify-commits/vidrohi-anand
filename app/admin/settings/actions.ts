"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const city = String(formData.get("default_weather_city") ?? "").trim();
  const whatsapp = String(formData.get("whatsapp") ?? "").trim();
  const x = String(formData.get("x") ?? "").trim();
  const instagram = String(formData.get("instagram") ?? "").trim();
  const youtube = String(formData.get("youtube") ?? "").trim();

  const supabase = await createClient();

  if (city) {
    await supabase
      .from("settings")
      .upsert({ key: "default_weather_city", value: city }, { onConflict: "key" });
  }

  await supabase.from("settings").upsert(
    { key: "site_social_links", value: { whatsapp, x, instagram, youtube } },
    { onConflict: "key" }
  );

  revalidatePath("/admin/settings");
  revalidatePath("/");
}
