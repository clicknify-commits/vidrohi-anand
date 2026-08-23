export interface StockMover {
  ticker: string;
  name: string;
  price: number;
  percentChange: number;
}

export interface TrendingStocks {
  gainers: StockMover[];
  losers: StockMover[];
}

interface RawStock {
  ticker_id?: string;
  company_name?: string;
  price?: number | string;
  percent_change?: number | string;
}

interface TrendingResponse {
  trending_stocks?: {
    top_gainers?: RawStock[];
    top_losers?: RawStock[];
  };
}

function toMover(raw: RawStock): StockMover {
  return {
    ticker: raw.ticker_id ?? "",
    name: raw.company_name ?? raw.ticker_id ?? "",
    price: Number(raw.price ?? 0),
    percentChange: Number(raw.percent_change ?? 0),
  };
}

// Provider: indianapi.in - the free tier is credit-metered, so this fails
// quietly (returns null) rather than throwing, same pattern as getWeather().
export async function getTrendingStocks(limit = 5): Promise<TrendingStocks | null> {
  const apiKey = process.env.INDIAN_STOCK_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://stock.indianapi.in/trending", {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as TrendingResponse;

    return {
      gainers: (data.trending_stocks?.top_gainers ?? []).slice(0, limit).map(toMover),
      losers: (data.trending_stocks?.top_losers ?? []).slice(0, limit).map(toMover),
    };
  } catch {
    return null;
  }
}
