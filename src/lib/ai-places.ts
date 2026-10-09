// For any Indian destination outside the 5 curated flagships, this generates
// "places to explore" entirely via AI — no Wikipedia/OpenStreetMap call.
// Explicitly labeled AI-suggested in the UI since, unlike the curated data,
// it isn't independently sourced. Coordinates are AI-estimated and may be
// approximate — good enough for grouping into a day plan, not for precision
// mapping.

import { callAI } from "./ai-provider";

export type AIPlace = {
  name: string;
  category: string;
  whyVisit: string;
  priority: "High priority" | "Recommended" | "Optional";
  hiddenGem: boolean;
  safetyNote?: string;
  lat: number;
  lng: number;
};

export async function generateAIPlaces(destination: string): Promise<{
  places: AIPlace[];
  bestSeason: string;
  nearestAirport: string;
  nearestRailway: string;
  generalSafetyNote?: string;
}> {
  const prompt = `List real, well-known places to visit in and around "${destination}", India, for a domestic Indian traveller. Also give: best season to visit, nearest airport, nearest major railway station, and one general safety note if relevant (or omit if none).

Return ONLY valid JSON, no prose, no markdown fences, in this exact shape:
{"bestSeason":"...","nearestAirport":"...","nearestRailway":"...","generalSafetyNote":"... or omit this key if nothing notable","places":[{"name":"...","category":"e.g. Temple / Beach / Fort / Nature","whyVisit":"one short sentence","priority":"High priority|Recommended|Optional","hiddenGem":false,"safetyNote":"omit if none","lat":0.0,"lng":0.0}]}

Give 6-10 real places. Mark 3-5 as "High priority" (the genuinely essential/iconic ones), a couple as "Recommended", and if there's a real, less-crowded alternative worth knowing about, mark it hiddenGem:true. Use your best knowledge of real coordinates (approximate is fine). Do not invent places that don't exist.`;

  const cleaned = await callAI(prompt, 3000);

  try {
    const parsed = JSON.parse(cleaned);
    return {
      places: parsed.places || [],
      bestSeason: parsed.bestSeason || "",
      nearestAirport: parsed.nearestAirport || "",
      nearestRailway: parsed.nearestRailway || "",
      generalSafetyNote: parsed.generalSafetyNote,
    };
  } catch {
    console.error("AI places response could not be parsed as JSON:", cleaned.slice(0, 1000));
    throw new Error("AI response could not be parsed. Try again.");
  }
}
