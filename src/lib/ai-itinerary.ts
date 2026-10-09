// AI-assisted mode. Re-sequences the already-selected real places into a
// full, richly-detailed trip plan: route/transport logistics from the
// traveller's origin, a day-by-day plan, a categorized budget breakdown,
// and money-saving tips — matching the depth of a well-researched backpacker
// itinerary. Everything here is labeled "AI-suggested" in the UI since,
// unlike the coordinate-based algorithm or curated spreadsheet data, it
// isn't independently verified — always confirm transport/costs before
// booking.

import { callAI } from "./ai-provider";

type Place = { name: string; lat: number; lng: number; extract?: string | null; sourceUrl?: string | null };

export type AITravelNotes = {
  toDestination: string;
  backHome: string;
};

export type BudgetLine = {
  category: string;
  details: string;
  costRange: string;
};

export type FullAIItinerary = {
  days: { dayNumber: number; title: string; items: any[] }[];
  travelNotes: AITravelNotes | null;
  routeLogistics: string | null;
  budgetBreakdown: BudgetLine[];
  totalBudgetRange: string | null;
  tips: string[];
};

export async function generateAIItinerary(
  places: Place[],
  numDays: number,
  pace: "relaxed" | "packed",
  opts: {
    budgetTotal?: number;
    interests?: string[];
    originCity?: string;
    destinationName?: string;
    nearestAirport?: string;
    nearestRailway?: string;
    travelStyle?: string; // backpacker | mid-range | luxury
  } = {}
): Promise<FullAIItinerary> {
  const placeList = places.map((p, i) => `${i + 1}. ${p.name}${p.extract ? " — " + p.extract : ""}`).join("\n");

  const originLine = opts.originCity
    ? `The traveller starts from ${opts.originCity}, India, and returns there afterward. This is 100% domestic India travel — no passport or visa is ever needed. ${
        opts.nearestAirport ? `Nearest airport at the destination: ${opts.nearestAirport}.` : ""
      } ${opts.nearestRailway ? `Nearest railway station at the destination: ${opts.nearestRailway}.` : ""} Work out a realistic, specific way to get from ${opts.originCity} to ${
        opts.destinationName || "the destination"
      } and back — train, bus, flight, or a practical combination, using your knowledge of real Indian routes (note it should be verified on IRCTC/redBus/airline sites before booking). Describe this as a short narrative covering the outbound and return legs, phase by phase if it involves a long multi-leg journey (e.g. train to a hub city, then a connecting bus/flight/shared-taxi onward) — the way an experienced backpacker would explain the route to a friend.`
    : "";

  const style = opts.travelStyle || "backpacker";

  const prompt = `You are an expert India travel planner writing a detailed, practical trip plan — the level of detail a seasoned backpacker forum post would have, not generic tourist-brochure text. Style: ${style}. Pace: ${pace}. Duration: ${numDays} days. ${
    opts.budgetTotal ? `Target budget: roughly INR ${opts.budgetTotal} total.` : ""
  } ${opts.interests?.length ? `Interests: ${opts.interests.join(", ")}.` : ""}

${originLine}

Places already chosen for this trip (use ONLY these — do not invent or add any other named place; you may leave some out if there isn't time for all of them in ${numDays} days):
${placeList}

Return ONLY valid JSON, no prose, no markdown fences, in this exact shape:
{
  "routeLogistics": "2-5 sentences describing the real route/transport phases from origin to destination and back, specific to the actual cities/regions involved — omit or set to null if no origin city was given",
  "travelNotes": {"toDestination":"1-2 sentence summary of the outbound leg","backHome":"1-2 sentence summary of the return leg"} or null if no origin given,
  "days": [
    {
      "dayNumber": 1,
      "title": "short descriptive day title, e.g. 'Arrival & Old City exploration'",
      "items": [{"placeName":"<must exactly match one of the given place names>","suggestedTime":"e.g. Morning (9-11am)","note":"one short practical sentence — a real tip, not filler"}]
    }
  ],
  "budgetBreakdown": [
    {"category":"e.g. Train Travel (Round Trip)","details":"what this covers","costRange":"₹X,XXX – ₹Y,YYY"}
  ],
  "totalBudgetRange": "₹X,XXX – ₹Y,YYY",
  "tips": ["3-6 specific, practical money-saving or logistics tips for this exact trip and style — not generic advice"]
}

Group places sensibly by day matching the pace (${pace === "relaxed" ? "~2-3 stops/day" : "~4-5 stops/day"}), use every given place at most once, and make the budget breakdown genuinely itemized (transport, accommodation, food, activities/permits, buffer) with realistic INR ranges for a ${style} traveller on a ${numDays}-day trip. Keep all text concrete and specific to this actual trip — never generic.`;

  const cleaned = await callAI(prompt, 4000);

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("AI itinerary response could not be parsed as JSON:", cleaned.slice(0, 1000));
    throw new Error("AI itinerary response could not be parsed. Try again or use standard mode.");
  }

  const byName = new Map(places.map((p) => [p.name, p]));
  const days = (parsed.days || []).map((day: any) => ({
    dayNumber: day.dayNumber,
    title: day.title || `Day ${day.dayNumber}`,
    items: (day.items || [])
      .filter((item: any) => byName.has(item.placeName))
      .map((item: any) => {
        const place = byName.get(item.placeName)!;
        return {
          ...place,
          estimatedArrival: `${item.suggestedTime} (AI-suggested)`,
          notes: item.note,
        };
      }),
  }));

  return {
    days,
    travelNotes: parsed.travelNotes || null,
    routeLogistics: parsed.routeLogistics || null,
    budgetBreakdown: Array.isArray(parsed.budgetBreakdown) ? parsed.budgetBreakdown : [],
    totalBudgetRange: parsed.totalBudgetRange || null,
    tips: Array.isArray(parsed.tips) ? parsed.tips : [],
  };
}
