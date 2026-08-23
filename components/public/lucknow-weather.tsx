import { getWeather } from "@/lib/weather/weatherapi";
import { Reveal } from "./reveal";

export async function LucknowWeather() {
  const weather = await getWeather("Lucknow", 7);
  if (!weather) return null;

  return (
    <Reveal>
      <section className="space-y-3 rounded-md border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-bold">लखनऊ - साप्ताहिक मौसम</h2>
          <span className="text-xl font-bold text-foreground">{weather.tempC}°C</span>
        </div>
        <div className="divide-y">
          {weather.forecast.map((day) => (
            <div key={day.date} className="flex items-center justify-between py-1.5 text-sm">
              <span className="w-10 text-muted-foreground">
                {new Date(day.date).toLocaleDateString("hi-IN", { weekday: "short" })}
              </span>
              {day.conditionIcon ? (
                <span aria-label={day.conditionHi} className="text-base leading-none">
                  {day.conditionIcon}
                </span>
              ) : (
                <span className="flex-1" />
              )}
              <span className="font-semibold tabular-nums">
                {day.maxC}°<span className="text-muted-foreground">/{day.minC}°</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
