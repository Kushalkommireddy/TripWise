import { NextRequest, NextResponse } from "next/server";

// Real, live exchange rates. No API key needed. Source: open.er-api.com
// We never invent a rate — if the fetch fails, we say so instead of guessing.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const base = (searchParams.get("base") || "INR").toUpperCase();

  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${base}`, {
      next: { revalidate: 3600 }, // cache 1hr, still "live" for this purpose
    });
    if (!res.ok) throw new Error(`Upstream FX API returned ${res.status}`);
    const data = await res.json();
    if (data.result !== "success") throw new Error("FX API reported failure");

    return NextResponse.json({
      base,
      rates: data.rates,
      lastUpdated: data.time_last_update_utc,
      source: "open.er-api.com",
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          "Live exchange rate is currently unavailable. We don't show estimated rates — please check again shortly or use a bank/XE for now.",
      },
      { status: 502 }
    );
  }
}
