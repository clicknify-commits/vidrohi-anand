import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getWeather } from "@/lib/weather/weatherapi";
import { WeatherWidget } from "./weather-widget";
import { LiveClock } from "./live-clock";

export async function HeaderStrip() {
  const supabase = await createClient();
  const { data: citySetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "default_weather_city")
    .single();

  const city = (citySetting?.value as string) ?? "New Delhi";
  const weather = await getWeather(city);

  const dateStr = new Intl.DateTimeFormat("hi-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="border-b bg-muted/30 text-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-1.5">
        <div className="flex items-center gap-3">
          <span>{dateStr}</span>
          <LiveClock />
        </div>
        <div className="flex items-center gap-4">
          <WeatherWidget initial={weather} />
          <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
            लॉगिन
          </Link>
        </div>
      </div>
    </div>
  );
}
