// Distributes a set of REAL places (already fetched from Wikipedia/OSM) across
// days using simple geographic clustering, so a day's plan is places that are
// actually near each other — not an invented route. Timing is estimated from
// real distance, always labeled "estimated", never presented as verified.

type Place = {
  name: string;
  lat: number;
  lng: number;
  extract?: string | null;
  sourceUrl: string;
};

function haversineKm(a: Place, b: Place) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}

// Distance-appropriate travel time: short hops are walkable, longer gaps
// between landmarks (common in spread-out regions like Ladakh or Kashmir)
// realistically mean a taxi/shared vehicle, not walking. Using a flat
// walking pace for e.g. a 90km gap wrapped the 24-hour clock and produced
// nonsensical out-of-order times — this tiered estimate fixes that.
function estimateTravelMinutes(km: number): { minutes: number; mode: "walk" | "drive" } {
  if (km <= 1.5) return { minutes: Math.round((km / 4.5) * 60), mode: "walk" };
  // Mountain/rural roads average well under highway speed — 30km/h is a
  // deliberately conservative, clearly-labeled estimate, not a promise.
  return { minutes: Math.round((km / 30) * 60), mode: "drive" };
}

export function buildItinerary(places: Place[], numDays: number, pace: "relaxed" | "packed") {
  const perDay = pace === "relaxed" ? 3 : 5;
  const sorted = [...places];

  // Nearest-neighbor greedy ordering starting from the first selected place —
  // real coordinates, real distances, simple deterministic routing.
  const ordered: Place[] = [];
  const remaining = [...sorted];
  let current = remaining.shift();
  if (current) ordered.push(current);
  while (remaining.length) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    remaining.forEach((p, idx) => {
      const d = haversineKm(current!, p);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = idx;
      }
    });
    current = remaining.splice(nearestIdx, 1)[0];
    ordered.push(current);
  }

  const days: { dayNumber: number; items: (Place & { estimatedArrival: string; distanceFromPrevKm?: number })[] }[] = [];
  for (let d = 0; d < numDays; d++) {
    const chunk = ordered.slice(d * perDay, (d + 1) * perDay);
    if (!chunk.length) break;

    let clock = 9 * 60; // start 9:00 AM, in minutes
    const items = chunk.map((p, i) => {
      if (i > 0) {
        const distKm = haversineKm(chunk[i - 1], p);
        const { minutes, mode } = estimateTravelMinutes(distKm);
        clock += minutes + 60; // + ~1hr at each stop, rough
        // If travel pushes past a realistic day (10pm), it's a sign this
        // day is overpacked for the distances involved — flag it plainly
        // rather than silently wrapping to a nonsensical early-morning time.
        if (clock >= 22 * 60) {
          return {
            ...p,
            distanceFromPrevKm: Math.round(distKm * 10) / 10,
            estimatedArrival: `Late (est.) — this day may be overpacked for the distances involved; consider fewer stops or an extra day`,
          };
        }
        const h = Math.floor(clock / 60);
        const m = clock % 60;
        return {
          ...p,
          distanceFromPrevKm: Math.round(distKm * 10) / 10,
          estimatedArrival: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} (est. ${mode === "drive" ? "drive" : "walk"})`,
        };
      }
      const h = Math.floor(clock / 60) % 24;
      const m = clock % 60;
      return { ...p, estimatedArrival: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} (est.)` };
    });

    days.push({ dayNumber: d + 1, items });
  }

  return days;
}
