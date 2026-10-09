import { NextRequest, NextResponse } from "next/server";
import { findDestination } from "@/lib/india-destinations";

// India-only. Two real, free, no-key data sources chained together:
// 1. OpenStreetMap Nominatim, restricted to India (countrycodes=in)
// 2. Wikipedia Geosearch + Summary API for real nearby places
// Curated must-see places (src/lib/india-destinations.ts) are merged in
// and pre-flagged so the most important spots are selected by default.

const APP_UA = "TripWise/0.1 (educational project)";

async function geocode(destination: string) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    destination
  )}&countrycodes=in&format=json&limit=1&addressdetails=1`;
  const res = await fetch(url, { headers: { "User-Agent": APP_UA } });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.length) throw new Error("We couldn't find that destination within India. TripWise currently only covers Indian destinations.");
  const countryCode = (data[0].address?.country_code || "").toUpperCase();
  if (countryCode !== "IN") {
    throw new Error("TripWise currently only plans trips within India.");
  }
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name as string,
  };
}

async function geosearch(lat: number, lng: number, radius = 10000, limit = 20) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=${radius}&gslimit=${limit}&format=json&origin=*`;
  const res = await fetch(url, { headers: { "User-Agent": APP_UA } });
  if (!res.ok) throw new Error("Wikipedia geosearch failed");
  const data = await res.json();
  return data.query.geosearch as { pageid: number; title: string; lat: number; lon: number; dist: number }[];
}

async function summary(title: string) {
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
      headers: { "User-Agent": APP_UA },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      extract: data.extract as string,
      thumbnail: data.thumbnail?.source as string | undefined,
      url: data.content_urls?.desktop?.page as string,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
  if (!destination) {
    return NextResponse.json({ error: "destination is required" }, { status: 400 });
  }

  const curated = findDestination(destination);

  try {
    const geo = curated
      ? { lat: curated.lat, lng: curated.lng, displayName: `${curated.name}, ${curated.state}` }
      : await geocode(destination);

    let withContent: any[] = [];
    try {
      const places = await geosearch(geo.lat, geo.lng);
      const enriched = await Promise.all(
        places.map(async (p) => {
          const s = await summary(p.title);
          return {
            name: p.title,
            lat: p.lat,
            lng: p.lon,
            distanceMeters: p.dist,
            extract: s?.extract || null,
            thumbnail: s?.thumbnail || null,
            sourceUrl: s?.url || `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title)}`,
            mustSee: false,
          };
        })
      );
      withContent = enriched.filter((e) => e.extract);
    } catch {
      // Live Wikipedia/OSM lookup failed — fall through to curated data only,
      // rather than failing the whole request when we have real curated
      // places available.
      if (!curated) throw new Error("Could not fetch live place data, and no curated data exists for this destination yet.");
    }

    // Merge curated must-see places in, avoiding name collisions with live results
    const liveNames = new Set(withContent.map((p) => p.name.toLowerCase()));
    const curatedPlaces = (curated?.places || []).filter((p) => !liveNames.has(p.name.toLowerCase()));
    const merged = [...curatedPlaces, ...withContent];

    return NextResponse.json({
      destination: geo.displayName,
      lat: geo.lat,
      lng: geo.lng,
      countryCode: "IN",
      bestSeason: curated?.bestSeason || null,
      permitNote: curated?.permitNote || null,
      permitSourceUrl: curated?.permitSourceUrl || null,
      generalSafetyNote: curated?.generalSafetyNote || null,
      nearestAirport: curated?.nearestAirport || null,
      nearestRailway: curated?.nearestRailway || null,
      places: merged,
      sources: ["OpenStreetMap Nominatim", "Wikipedia Geosearch + Summary API", curated ? "TripWise curated shortlist" : null].filter(Boolean),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not fetch real place data for this destination." }, { status: 502 });
  }
}
