import { getWeather } from "@/lib/weather/weatherapi";
import { Reveal } from "./reveal";

export async function LucknowWeather() {
  const weather = await getWeather("Lucknow", 7);
  if (!weather) return null;

  return (
    <Reveal>
      <section className="space-y-4 rounded-md border bg-muted/20 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold">लखनऊ - साप्ताहिक मौसम</h2>
          <span className="text-2xl font-bold text-foreground">{weather.tempC}°C</span>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-7">
          {weather.forecast.map((day) => (
            <div key={day.date} className="rounded-md border bg-background p-2.5 text-center">
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(day.date).toLocaleDateString("hi-IN", { weekday: "short" })}
              </p>
              {day.conditionIcon ? (
                <p aria-label={day.conditionHi} className="my-1 text-2xl leading-none">
                  {day.conditionIcon}
                </p>
              ) : null}
              <p className="text-sm font-semibold">
                {day.maxC}°<span className="text-muted-foreground">/{day.minC}°</span>
              </p>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  );
}
