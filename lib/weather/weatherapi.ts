export interface WeatherForecastDay {
  date: string;
  maxC: number;
  minC: number;
  conditionIcon: string;
  conditionHi: string;
}

export interface WeatherData {
  city: string;
  tempC: number;
  conditionHi: string;
  conditionIcon: string;
  forecast: WeatherForecastDay[];
}

interface WeatherApiForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition?: { text?: string; icon?: string };
  };
}

interface WeatherApiResponse {
  location?: { name?: string };
  current?: { temp_c?: number; condition?: { text?: string; icon?: string } };
  forecast?: { forecastday?: WeatherApiForecastDay[] };
}

export async function getWeather(city: string): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHERAPI_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=3&lang=hi&aqi=no`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as WeatherApiResponse;

    return {
      city: data.location?.name ?? city,
      tempC: Math.round(data.current?.temp_c ?? 0),
      conditionHi: data.current?.condition?.text ?? "",
      conditionIcon: data.current?.condition?.icon ? `https:${data.current.condition.icon}` : "",
      forecast: (data.forecast?.forecastday ?? []).map((day) => ({
        date: day.date,
        maxC: Math.round(day.day.maxtemp_c),
        minC: Math.round(day.day.mintemp_c),
        conditionIcon: day.day.condition?.icon ? `https:${day.day.condition.icon}` : "",
        conditionHi: day.day.condition?.text ?? "",
      })),
    };
  } catch {
    return null;
  }
}
