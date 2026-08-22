"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { WeatherData } from "@/lib/weather/weatherapi";

export function WeatherWidget({ initial }: { initial: WeatherData | null }) {
  const [weather, setWeather] = useState(initial);
  const [loading, setLoading] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const res = await fetch(
          `/api/weather?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
        );
        if (res.ok) setWeather(await res.json());
        setLoading(false);
      },
      () => setLoading(false)
    );
  }

  if (!weather) {
    return (
      <button onClick={useMyLocation} className="text-xs text-muted-foreground hover:underline">
        मौसम उपलब्ध नहीं
      </button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 text-sm">
          {weather.conditionIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={weather.conditionIcon} alt={weather.conditionHi} className="size-5" />
          ) : null}
          <span>{weather.city}</span>
          <span className="font-medium">{weather.tempC}°C</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{weather.city}</p>
            <button
              onClick={useMyLocation}
              disabled={loading}
              className="text-xs text-muted-foreground hover:underline"
            >
              {loading ? "पता लगाया जा रहा है…" : "मेरा स्थान उपयोग करें"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{weather.conditionHi}</p>
          <div className="grid grid-cols-3 gap-2 border-t pt-2 text-center text-xs">
            {weather.forecast.map((day) => (
              <div key={day.date}>
                <p className="text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("hi-IN", { weekday: "short" })}
                </p>
                {day.conditionIcon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={day.conditionIcon} alt={day.conditionHi} className="mx-auto size-6" />
                ) : null}
                <p>
                  {day.maxC}° / {day.minC}°
                </p>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
