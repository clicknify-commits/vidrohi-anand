import { Gem } from "lucide-react";
import { getStoredGoldSilverRate } from "@/lib/gold-silver/goldapi";
import { Reveal } from "./reveal";

export async function GoldSilverWidget() {
  const rate = await getStoredGoldSilverRate();
  if (!rate) return null;

  const fetchedTime = new Date(rate.fetchedAt).toLocaleString("hi-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center gap-2">
          <Gem className="size-4 text-brand" />
          <h2 className="font-heading text-base font-bold">सोना-चांदी भाव</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border bg-background p-2.5 text-center">
            <p className="text-xs font-medium text-muted-foreground">सोना (10 ग्राम)</p>
            <p className="text-lg font-bold tabular-nums">₹{rate.goldPer10g.toLocaleString("hi-IN")}</p>
          </div>
          <div className="rounded-md border bg-background p-2.5 text-center">
            <p className="text-xs font-medium text-muted-foreground">चांदी (1 किलो)</p>
            <p className="text-lg font-bold tabular-nums">₹{rate.silverPerKg.toLocaleString("hi-IN")}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">{fetchedTime} तक की दर</p>
      </section>
    </Reveal>
  );
}
