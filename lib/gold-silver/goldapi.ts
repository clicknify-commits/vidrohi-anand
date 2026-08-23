import { createClient } from "@/lib/supabase/server";

export interface GoldSilverRate {
  goldPer10g: number;
  silverPerKg: number;
  fetchedAt: string;
}

const SETTINGS_KEY = "gold_silver_rate";

interface GoldApiResponse {
  price_gram_24k?: number;
}

async function fetchMetal(symbol: "XAU" | "XAG", key: string): Promise<number | null> {
  const res = await fetch(`https://www.goldapi.io/api/${symbol}/INR`, {
    headers: { "x-access-token": key },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as GoldApiResponse;
  return data.price_gram_24k ?? null;
}

// Called once/day by the Vercel Cron job (see app/api/cron/gold-price) -
// never called from a page render. Indian convention: gold quoted per 10g
// (24k), silver per kg.
export async function fetchAndStoreGoldSilverRate(): Promise<GoldSilverRate | null> {
  const key = process.env.GOLD_API_KEY;
  if (!key) return null;

  const [goldPerGram, silverPerGram] = await Promise.all([
    fetchMetal("XAU", key),
    fetchMetal("XAG", key),
  ]);
  if (goldPerGram === null || silverPerGram === null) return null;

  const rate: GoldSilverRate = {
    goldPer10g: Math.round(goldPerGram * 10),
    silverPerKg: Math.round(silverPerGram * 1000),
    fetchedAt: new Date().toISOString(),
  };

  // Table write would 401 under RLS (this route runs with no staff session) -
  // set_gold_silver_rate is a narrowly-scoped SECURITY DEFINER function for
  // exactly this, so the app never needs the service-role key at runtime.
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_gold_silver_rate", { rate });
  if (error) return null;

  return rate;
}

// Cheap DB read for the public widget - never calls GoldAPI.io directly, so
// page renders stay fast and the metered API quota is untouched.
export async function getStoredGoldSilverRate(): Promise<GoldSilverRate | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("value").eq("key", SETTINGS_KEY).single();
  return (data?.value as GoldSilverRate) ?? null;
}
