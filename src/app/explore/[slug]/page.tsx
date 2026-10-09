"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { findFeaturedDestination, costWarning } from "@/lib/featured-trips";
import { indiaDestinations } from "@/lib/india-destinations";
import { SceneBackground, DESTINATION_SCENES } from "@/components/SceneBackground";
import { safeJson } from "@/lib/safeJson";

export default function ExplorePage() {
  const { slug } = useParams<{ slug: string }>();
  const { status } = useSession();
  const router = useRouter();
  const dest = findFeaturedDestination(slug);
  const geo = indiaDestinations.find((d) => d.slug === slug);
  const [view, setView] = useState<"explore" | "itinerary" | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  if (!dest) return <p className="py-12" style={{ color: "var(--ink-muted)" }}>Destination not found.</p>;

  return (
    <div className="-mx-4 sm:-mx-6">
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <SceneBackground scene={DESTINATION_SCENES[slug] || "mountains"} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.75) 100%)" }} />
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 left-4 sm:left-6 z-20 inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition hover:translate-x-[-2px]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 pb-6 max-w-5xl mx-auto">
          <p className="font-mono text-xs uppercase text-white/70">{dest.idealDuration} · {dest.bestSeason}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-white mt-1">{dest.name}</h1>
          <p className="text-white/85 mt-2 max-w-lg">{dest.coreExperience}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setView(view === "explore" ? null : "explore")}
            className="px-6 py-3 rounded-full font-medium text-sm"
            style={{ background: view === "explore" ? "var(--navy)" : "var(--surface-2)", color: view === "explore" ? "white" : "var(--ink)" }}
          >
            Places to explore
          </button>
          <button
            onClick={() => setView(view === "itinerary" ? null : "itinerary")}
            className="px-6 py-3 rounded-full font-medium text-sm"
            style={{ background: view === "itinerary" ? "var(--navy)" : "var(--surface-2)", color: view === "itinerary" ? "white" : "var(--ink)" }}
          >
            Itinerary
          </button>
          <button
            onClick={() => setShowAddForm((s) => !s)}
            className="px-6 py-3 rounded-full font-medium text-sm ml-auto"
            style={{ background: "var(--gold)", color: "#1a1408" }}
          >
            + Add to my trips
          </button>
        </div>

        {showAddForm && (
          <AddToTripsForm dest={dest} geo={geo} onCreated={(id) => router.push(`/trips/${id}`)} />
        )}

        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <InfoCard label="Budget from Hyderabad" value={dest.estimatedBudgetFromHyderabad} />
          <InfoCard label="Route" value={dest.budgetRoute} />
          <InfoCard label="Getting there" value={`${geo?.nearestAirport || ""}`} small />
          <InfoCard label="By rail" value={`${geo?.nearestRailway || ""}`} small />
        </div>

        {view === "explore" && <PlacesView dest={dest} />}
        {view === "itinerary" && <ItineraryView dest={dest} />}

        {!view && (
          <p className="mt-10 text-sm" style={{ color: "var(--ink-muted)" }}>
            Tap "Places to explore" to see what's worth visiting, or "Itinerary" for the full day-by-day plan.
          </p>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="ticket p-3">
      <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>{label}</p>
      <p className={small ? "text-xs mt-1" : "text-sm mt-1 font-medium"}>{value || "—"}</p>
    </div>
  );
}

function PlacesView({ dest }: { dest: any }) {
  const priorityColor: Record<string, string> = {
    "High priority": "var(--marigold)",
    "Recommended": "var(--teal)",
    "Optional": "var(--ink-muted)",
    "Alternative": "var(--ink-muted)",
    "Extension": "var(--ink-muted)",
  };
  return (
    <div className="mt-8">
      <p className="font-display text-xl mb-4" style={{ color: "var(--navy)" }}>Places to explore</p>
      <div className="grid sm:grid-cols-2 gap-4">
        {dest.places.map((p: any) => (
          <div key={p.name} className="ticket p-4">
            <div className="flex justify-between items-start gap-2">
              <p className="font-display text-lg" style={{ color: "var(--navy)" }}>{p.name}</p>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: "var(--surface-2)", color: priorityColor[p.priority] }}>
                {p.priority}
              </span>
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--ink-muted)" }}>{p.category}</p>
            <p className="text-sm mt-2">{p.whyVisit}</p>
            <p className="text-xs mt-2 italic" style={{ color: "var(--teal)" }}>{p.planningNote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ItineraryView({ dest }: { dest: any }) {
  return (
    <div className="mt-8">
      <p className="font-display text-xl mb-1" style={{ color: "var(--navy)" }}>Day-by-day itinerary</p>
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>{dest.researchNote}</p>
      <div className="space-y-4">
        {dest.plan.map((day: any) => (
          <div key={day.day} className="ticket p-5">
            <div className="flex justify-between items-baseline">
              <p className="font-display text-lg" style={{ color: "var(--navy)" }}>Day {day.day} — {day.base}</p>
              <span className="font-mono text-sm" style={{ color: "var(--teal)" }}>{day.spendEstimate}</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
              <div><p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Morning</p><p>{day.morning}</p></div>
              <div><p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Afternoon</p><p>{day.afternoon}</p></div>
              <div><p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Evening</p><p>{day.evening}</p></div>
            </div>
            <div className="perforated mt-3 pt-3 flex flex-wrap justify-between gap-2 text-xs" style={{ color: "var(--ink-muted)" }}>
              <span>🚗 {day.transport}</span>
              <span className="italic">{day.planningNote}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="ticket p-4 mt-6">
        <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Budget breakdown</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2 text-sm">
          <div><p style={{ color: "var(--ink-muted)" }}>Total</p><p className="font-mono">{dest.budget.total}</p></div>
          <div><p style={{ color: "var(--ink-muted)" }}>Stay</p><p className="font-mono">{dest.budget.accommodation}</p></div>
          <div><p style={{ color: "var(--ink-muted)" }}>Food</p><p className="font-mono">{dest.budget.food}</p></div>
          <div><p style={{ color: "var(--ink-muted)" }}>Transport</p><p className="font-mono">{dest.budget.transport}</p></div>
          <div><p style={{ color: "var(--ink-muted)" }}>Buffer</p><p className="font-mono">{dest.budget.activitiesAndBuffer}</p></div>
        </div>
        <p className="text-xs mt-3" style={{ color: "var(--ink-muted)" }}>{costWarning}</p>
      </div>
    </div>
  );
}

function AddToTripsForm({ dest, geo, onCreated }: { dest: any; geo: any; onCreated: (id: string) => void }) {
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("backpacker");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function create() {
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Trip to ${dest.name}`,
          destination: dest.name,
          destinationLat: geo?.lat,
          destinationLng: geo?.lng,
          countryCode: "IN",
          budgetTotal: budget ? parseFloat(budget) : null,
          travelStyle,
        }),
      });
      const trip = await safeJson(res);
      if (!res.ok) {
        setCreateError(trip.error || "Could not create the trip. Please try again.");
        return;
      }
      onCreated(trip.id);
    } catch (err: any) {
      setCreateError(err.message || "Could not create the trip. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="ticket p-5 mt-4">
      <div className="grid sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Your budget (INR)</span>
          <input type="number" className="input mt-1" placeholder={dest.estimatedBudgetFromHyderabad} value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Travel style</span>
          <select className="input mt-1" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
            <option value="backpacker">Backpacker</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>
        <div className="flex items-end">
          <button onClick={create} disabled={creating} className="w-full py-2.5 rounded-full btn-primary text-sm font-medium">
            {creating ? "Adding…" : "Confirm — add to my trips"}
          </button>
        </div>
      </div>
      {createError && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{createError}</p>}
    </div>
  );
}
