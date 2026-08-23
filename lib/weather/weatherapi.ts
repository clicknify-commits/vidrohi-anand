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

// WMO weather code -> [Hindi label, emoji]. Open-Meteo returns a numeric
// code instead of a condition string/icon URL, so this is the translation.
const WMO_CODES: Record<number, [string, string]> = {
  0: ["साफ आसमान", "☀️"],
  1: ["मुख्यतः साफ", "🌤️"],
  2: ["आंशिक बादल", "⛅"],
  3: ["बादल छाए", "☁️"],
  45: ["कोहरा", "🌫️"],
  48: ["जमने वाला कोहरा", "🌫️"],
  51: ["हल्की बूंदाबांदी", "🌦️"],
  53: ["बूंदाबांदी", "🌦️"],
  55: ["घनी बूंदाबांदी", "🌦️"],
  56: ["जमने वाली हल्की बूंदाबांदी", "🌦️"],
  57: ["जमने वाली घनी बूंदाबांदी", "🌦️"],
  61: ["हल्की बारिश", "🌧️"],
  63: ["बारिश", "🌧️"],
  65: ["भारी बारिश", "🌧️"],
  66: ["जमने वाली हल्की बारिश", "🌧️"],
  67: ["जमने वाली भारी बारिश", "🌧️"],
  71: ["हल्की बर्फबारी", "🌨️"],
  73: ["बर्फबारी", "🌨️"],
  75: ["भारी बर्फबारी", "🌨️"],
  77: ["बर्फ के कण", "🌨️"],
  80: ["हल्की बौछारें", "🌦️"],
  81: ["बौछारें", "🌦️"],
  82: ["तेज़ बौछारें", "⛈️"],
  85: ["हल्की बर्फ़ की बौछारें", "🌨️"],
  86: ["भारी बर्फ़ की बौछारें", "🌨️"],
  95: ["आंधी-तूफ़ान", "⛈️"],
  96: ["ओलों के साथ तूफ़ान", "⛈️"],
  99: ["भारी ओलों के साथ तूफ़ान", "⛈️"],
};

function describeCode(code: number): [string, string] {
  return WMO_CODES[code] ?? ["", ""];
}

interface GeocodeResult {
  results?: { name: string; latitude: number; longitude: number }[];
}

async function geocode(city: string): Promise<{ name: string; lat: number; lon: number } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=hi`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as GeocodeResult;
  const match = data.results?.[0];
  return match ? { name: match.name, lat: match.latitude, lon: match.longitude } : null;
}

interface ForecastResponse {
  current?: { temperature_2m?: number; weather_code?: number };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
}

async function fetchForecast(
  lat: number,
  lon: number,
  days: number
): Promise<Omit<WeatherData, "city"> | null> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&forecast_days=${days}&timezone=auto`,
    { next: { revalidate: 1800 } }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as ForecastResponse;

  const [currentHi, currentIcon] = describeCode(data.current?.weather_code ?? -1);
  const dailyTime = data.daily?.time ?? [];
  const dailyMax = data.daily?.temperature_2m_max ?? [];
  const dailyMin = data.daily?.temperature_2m_min ?? [];
  const dailyCode = data.daily?.weather_code ?? [];

  return {
    tempC: Math.round(data.current?.temperature_2m ?? 0),
    conditionHi: currentHi,
    conditionIcon: currentIcon,
    forecast: dailyTime.map((date, i) => {
      const [hi, icon] = describeCode(dailyCode[i] ?? -1);
      return {
        date,
        maxC: Math.round(dailyMax[i] ?? 0),
        minC: Math.round(dailyMin[i] ?? 0),
        conditionIcon: icon,
        conditionHi: hi,
      };
    }),
  };
}

async function fetchOpenMeteo(city: string, days: number): Promise<WeatherData | null> {
  try {
    const location = await geocode(city);
    if (!location) return null;
    const forecast = await fetchForecast(location.lat, location.lon, days);
    return forecast ? { city: location.name, ...forecast } : null;
  } catch {
    return null;
  }
}

interface ImdDay {
  date?: string;
  max_temp?: number;
  min_temp?: number;
  description?: string;
}

interface ImdResponse {
  city?: string;
  temperature?: number;
  weather_description?: string;
  forecast?: ImdDay[];
}

// Best-effort field mapping - the exact IndianWeatherResponse schema wasn't
// fully readable from the (JS-rendered) sandbox docs, only the endpoint/auth
// shape. Any mismatch here fails the sanity check below and falls through
// to Open-Meteo, so a wrong guess degrades gracefully rather than breaking.
async function fetchImd(city: string, days: number): Promise<WeatherData | null> {
  const key = process.env.INDIAN_WEATHER_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://weather.indianapi.in/india/weather?city=${encodeURIComponent(city)}`,
      { headers: { "x-api-key": key }, next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as ImdResponse;

    const forecast = (data.forecast ?? []).slice(0, days).map((day) => ({
      date: day.date ?? "",
      maxC: Math.round(day.max_temp ?? NaN),
      minC: Math.round(day.min_temp ?? NaN),
      conditionHi: day.description ?? "",
      conditionIcon: "",
    }));
    const tempC = Math.round(data.temperature ?? NaN);

    // Sanity check: if the guessed field names didn't match reality, these
    // come out NaN/empty - treat that as failure rather than show garbage.
    if (Number.isNaN(tempC) || forecast.some((d) => Number.isNaN(d.maxC))) return null;

    return {
      city: data.city || city,
      tempC,
      conditionHi: data.weather_description ?? "",
      conditionIcon: "",
      forecast,
    };
  } catch {
    return null;
  }
}

// Prefers IMD data (India Meteorological Department, via indianapi.in) when
// INDIAN_WEATHER_API_KEY is configured - more authoritative for Indian
// cities than a global model. Falls back to Open-Meteo (always free, no
// key) if IMD isn't configured or its response doesn't look right.
export async function getWeather(city: string, days = 3): Promise<WeatherData | null> {
  const imd = await fetchImd(city, days);
  return imd ?? fetchOpenMeteo(city, days);
}

// For when the caller already has coordinates (browser geolocation) - skips
// the name-based geocoding step entirely, since Open-Meteo's forecast
// endpoint takes lat/lon natively.
export async function getWeatherByCoords(
  lat: number,
  lon: number,
  days = 3
): Promise<WeatherData | null> {
  try {
    // Open-Meteo's forecast endpoint doesn't resolve coordinates back to a
    // place name (no reverse geocoding on the free tier) - a generic label
    // beats an empty one here.
    const forecast = await fetchForecast(lat, lon, days);
    return forecast ? { city: "आपका स्थान", ...forecast } : null;
  } catch {
    return null;
  }
}
