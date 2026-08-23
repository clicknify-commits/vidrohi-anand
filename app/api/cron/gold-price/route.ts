import { NextResponse, type NextRequest } from "next/server";
import { fetchAndStoreGoldSilverRate } from "@/lib/gold-silver/goldapi";

export const runtime = "nodejs";

// Triggered by Vercel Cron (see vercel.json - 30 2 * * * UTC = 8:00am IST
// daily). Vercel signs cron requests with this same secret as a Bearer
// token, so this rejects anyone else hitting the route directly - without
// it, a random request could burn through GoldAPI.io's metered quota.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rate = await fetchAndStoreGoldSilverRate();
  if (!rate) {
    return NextResponse.json({ error: "fetch or store failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, rate });
}
