import { NextResponse, type NextRequest } from "next/server";
import { getWeatherByCoords } from "@/lib/weather/weatherapi";

export async function GET(request: NextRequest) {
  const lat = request.nextUrl.searchParams.get("lat");
  const lon = request.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat/lon आवश्यक हैं" }, { status: 400 });
  }

  const weather = await getWeatherByCoords(Number(lat), Number(lon));
  if (!weather) {
    return NextResponse.json({ error: "मौसम डेटा उपलब्ध नहीं है" }, { status: 503 });
  }

  return NextResponse.json(weather);
}
