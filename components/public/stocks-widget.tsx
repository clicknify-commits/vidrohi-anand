import { TrendingUp, TrendingDown } from "lucide-react";
import { getTrendingStocks, type StockMover } from "@/lib/stocks/indianapi";
import { Reveal } from "./reveal";

function StockRow({ stock, positive }: { stock: StockMover; positive: boolean }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-sm last:border-0">
      <div className="min-w-0">
        <p className="truncate font-medium">{stock.name}</p>
        <p className="text-xs text-muted-foreground">{stock.ticker}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="tabular-nums font-medium">₹{stock.price.toLocaleString("hi-IN")}</p>
        <p className={`text-xs tabular-nums font-semibold ${positive ? "text-green-600" : "text-red-600"}`}>
          {positive ? "+" : ""}
          {stock.percentChange.toFixed(2)}%
        </p>
      </div>
    </div>
  );
}

export async function StocksWidget() {
  const stocks = await getTrendingStocks(5);
  if (!stocks || (stocks.gainers.length === 0 && stocks.losers.length === 0)) return null;

  return (
    <Reveal>
      <section className="space-y-4 rounded-md border bg-muted/20 p-5">
        <h2 className="font-heading text-lg font-bold">आज के टॉप 10 स्टॉक्स</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-green-600">
              <TrendingUp className="size-4" />
              टॉप गेनर्स
            </div>
            {stocks.gainers.map((s) => (
              <StockRow key={s.ticker} stock={s} positive />
            ))}
          </div>
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-red-600">
              <TrendingDown className="size-4" />
              टॉप लूज़र्स
            </div>
            {stocks.losers.map((s) => (
              <StockRow key={s.ticker} stock={s} positive={false} />
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
