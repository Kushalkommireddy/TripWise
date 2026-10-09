import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trips, tripDays, itineraryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildItinerary } from "@/lib/itinerary";
import { generateAIItinerary } from "@/lib/ai-itinerary";
import { findDestination } from "@/lib/india-destinations";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Top-level safety net: no matter what goes wrong below (a bug I haven't
  // anticipated, a bad request body, a DB hiccup), this guarantees the
  // client always gets back valid JSON instead of an empty/broken body
  // that crashes res.json() on the frontend.
  try {
    return await handlePost(req, params);
  } catch (err: any) {
    console.error("Unhandled error in POST /api/trips/[id]/days:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the itinerary. Please try again." },
      { status: 500 }
    );
  }
}

async function handlePost(req: NextRequest, params: Promise<{ id: string }>) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const { places, numDays, pace, mode, budgetTotal, interests, originCity, travelStyle } = body as {
    places: { name: string; lat: number; lng: number; extract?: string; sourceUrl: string }[];
    numDays: number;
    pace: "relaxed" | "packed";
    mode?: "standard" | "ai";
    budgetTotal?: number;
    interests?: string[];
    originCity?: string;
    travelStyle?: string;
  };

  if (!places?.length || !numDays) {
    return NextResponse.json({ error: "places and numDays are required" }, { status: 400 });
  }

  // Sanitize coordinates BEFORE generating the itinerary — not after. The
  // standard algorithm computes real distances/times from these values, so
  // fixing bad coordinates only after generation left already-broken math
  // (e.g. "NaN:NaN") baked into the result. Fixing it first means every
  // downstream calculation works with valid numbers from the start.
  const fallbackLat = trip.destinationLat ?? 20.5937; // India's rough centroid as a last resort
  const fallbackLng = trip.destinationLng ?? 78.9629;
  const sanitizedPlaces = places.map((p) => ({
    ...p,
    lat: typeof p.lat === "number" && Number.isFinite(p.lat) ? p.lat : fallbackLat,
    lng: typeof p.lng === "number" && Number.isFinite(p.lng) ? p.lng : fallbackLng,
  }));

  const curated = findDestination(trip.destination);
  let days;
  let travelNotes = null;
  let routeLogistics: string | null = null;
  let budgetBreakdown: any[] = [];
  let totalBudgetRange: string | null = null;
  let tips: string[] = [];

  try {
    if (mode === "ai") {
      const result = await generateAIItinerary(sanitizedPlaces, numDays, pace || "relaxed", {
        budgetTotal,
        interests,
        originCity,
        destinationName: trip.destination,
        nearestAirport: curated?.nearestAirport,
        nearestRailway: curated?.nearestRailway,
        travelStyle: travelStyle || trip.travelStyle || undefined,
      });
      days = result.days;
      travelNotes = result.travelNotes;
      routeLogistics = result.routeLogistics;
      budgetBreakdown = result.budgetBreakdown;
      totalBudgetRange = result.totalBudgetRange;
      tips = result.tips;
    } else {
      days = buildItinerary(sanitizedPlaces, numDays, pace || "relaxed");
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not generate itinerary." }, { status: 502 });
  }

  // Belt-and-suspenders: even with sanitized inputs, guarantee every item
  // has valid coordinates right before the DB write, since that's the
  // constraint that actually matters.
  for (const day of days) {
    for (const item of day.items) {
      if (typeof item.lat !== "number" || !Number.isFinite(item.lat)) item.lat = fallbackLat;
      if (typeof item.lng !== "number" || !Number.isFinite(item.lng)) item.lng = fallbackLng;
    }
  }

  try {
    await db.delete(tripDays).where(eq(tripDays.tripId, id));

    for (const day of days) {
      const [tripDay] = await db
        .insert(tripDays)
        .values({ tripId: id, dayNumber: day.dayNumber, title: (day as any).title || null })
        .returning();

      if (day.items.length) {
        await db.insert(itineraryItems).values(
          day.items.map((item, idx) => ({
            tripDayId: tripDay.id,
            order: idx,
            placeName: item.name,
            lat: item.lat,
            lng: item.lng,
            sourceUrl: item.sourceUrl || null,
            extract: item.extract || null,
            estimatedArrival: item.estimatedArrival,
            notes: (item as any).notes || null,
          }))
        );
      }
    }

    await db
      .update(trips)
      .set({
        originCity: originCity || trip.originCity,
        aiTravelNotes: travelNotes ? JSON.stringify(travelNotes) : trip.aiTravelNotes,
        aiRouteLogistics: routeLogistics || (mode === "ai" ? null : trip.aiRouteLogistics),
        aiBudgetBreakdown: budgetBreakdown.length ? JSON.stringify(budgetBreakdown) : (mode === "ai" ? null : trip.aiBudgetBreakdown),
        aiTotalBudgetRange: totalBudgetRange || (mode === "ai" ? null : trip.aiTotalBudgetRange),
        aiTips: tips.length ? JSON.stringify(tips) : (mode === "ai" ? null : trip.aiTips),
      })
      .where(eq(trips.id, id));

    const full = await db.query.trips.findFirst({
      where: (t, { eq }) => eq(t.id, id),
      with: {
        days: {
          with: { items: { orderBy: (i, { asc }) => asc(i.order) } },
          orderBy: (d, { asc }) => asc(d.dayNumber),
        },
      },
    });

    return NextResponse.json(full);
  } catch (err: any) {
    console.error("Failed to save generated itinerary:", err);
    return NextResponse.json(
      { error: "The itinerary was generated but couldn't be saved. Please try again." },
      { status: 500 }
    );
  }
}
