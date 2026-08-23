import { Fuel } from "lucide-react";
import { getFuelPrices } from "@/lib/fuel/indianapi";
import { Reveal } from "./reveal";

export async function FuelPriceWidget() {
  const prices = await getFuelPrices("Lucknow");
  if (!prices) return null;

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Fuel className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">लखनऊ - ईंधन की कीमत</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-background p-2.5 text-center">
            <p className="text-xs font-medium text-muted-foreground">पेट्रोल</p>
            <p className="text-lg font-bold tabular-nums">
              {prices.petrol !== null ? `₹${prices.petrol.toFixed(2)}` : "—"}
            </p>
          </div>
          <div className="rounded-md border bg-background p-2.5 text-center">
            <p className="text-xs font-medium text-muted-foreground">डीज़ल</p>
            <p className="text-lg font-bold tabular-nums">
              {prices.diesel !== null ? `₹${prices.diesel.toFixed(2)}` : "—"}
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
