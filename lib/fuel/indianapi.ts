export interface FuelPrices {
  city: string;
  petrol: number | null;
  diesel: number | null;
}

interface FuelPriceRow {
  city: string;
  price: string;
  change: string;
}

async function fetchPrice(fuelType: "petrol" | "diesel", key: string): Promise<FuelPriceRow[]> {
  const res = await fetch(
    `https://fuel.indianapi.in/live_fuel_price?fuel_type=${fuelType}&location_type=city`,
    { headers: { "x-api-key": key }, next: { revalidate: 21600 } }
  );
  if (!res.ok) return [];
  const data = (await res.json()) as FuelPriceRow[];
  return Array.isArray(data) ? data : [];
}

function findCity(rows: FuelPriceRow[], city: string): number | null {
  const row = rows.find((r) => r.city?.toLowerCase() === city.toLowerCase());
  if (!row) return null;
  const price = Number(row.price);
  return Number.isNaN(price) ? null : price;
}

// indianapi.in Fuel Price API - /live_fuel_price returns every city at once
// per fuel type, so this fetches both and picks out the one city needed.
export async function getFuelPrices(city = "Lucknow"): Promise<FuelPrices | null> {
  const key = process.env.INDIAN_FUEL_API_KEY;
  if (!key) return null;

  try {
    const [petrolRows, dieselRows] = await Promise.all([
      fetchPrice("petrol", key),
      fetchPrice("diesel", key),
    ]);
    const petrol = findCity(petrolRows, city);
    const diesel = findCity(dieselRows, city);
    if (petrol === null && diesel === null) return null;

    return { city, petrol, diesel };
  } catch {
    return null;
  }
}
