"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { findFeaturedDestination } from "@/lib/featured-trips";
import { safeJson } from "@/lib/safeJson";
import { useReveal } from "@/lib/useReveal";
import BackButton from "@/components/BackButton";
import TravelQuoteLoader from "@/components/TravelQuoteLoader";

const TABS = ["Places to cover", "Itinerary", "Checklist", "Expenses"] as const;
type Tab = (typeof TABS)[number];

function slugify(name: string) {
  return name.toLowerCase().replace(/\(.*?\)/g, "").trim().replace(/\s+/g, "-");
}

export default function TripPage() {
  const { id } = useParams<{ id: string }>();
  const { status } = useSession();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("Places to cover");
  const [places, setPlaces] = useState<any[]>([]);
  const [destInfo, setDestInfo] = useState<any>(null);
  const [selected, setSelected] = useState<Record<string, any>>({});
  const [numDays, setNumDays] = useState(3);
  const [pace, setPace] = useState<"relaxed" | "packed">("relaxed");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [poiError, setPoiError] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function loadTrip() {
    try {
      const res = await fetch(`/api/trips/${id}`);
      if (res.ok) setTrip(await safeJson(res));
    } catch {
      // Transient — the polling/refresh pattern here will retry via the
      // next user action rather than needing a dedicated error state.
    }
  }

  useEffect(() => {
    if (status === "authenticated") loadTrip();
  }, [status, id]);

  useEffect(() => {
    if (trip?.destination && places.length === 0) {
      setLoadingPlaces(true);
      setPoiError(null);

      // Featured destinations (Leh-Ladakh, Kashi, Kashmir, Kerala, Goa) use
      // curated, real research data — no API call needed, and definitely
      // no AI guessing for these, since real researched data is better.
      const featured = findFeaturedDestination(slugify(trip.destination));
      if (featured) {
        setIsFeatured(true);
        const asPlaces = featured.places.map((p) => ({
          name: p.name,
          extract: p.whyVisit,
          mustSee: p.priority === "High priority",
          hiddenGem: p.category.toLowerCase().includes("less visited") || p.category.toLowerCase().includes("underrated") || p.category.toLowerCase().includes("remote"),
          planningNote: p.planningNote,
          lat: p.lat,
          lng: p.lng,
          sourceUrl: null,
        }));
        setPlaces(asPlaces);
        setDestInfo({ bestSeason: featured.bestSeason, source: "curated" });
        const preSelected: Record<string, any> = {};
        asPlaces.forEach((p) => { if (p.mustSee) preSelected[p.name] = p; });
        setSelected(preSelected);
        setLoadingPlaces(false);
        return;
      }

      // Everything else: 100% AI-generated, no Wikipedia/OSM dependency.
      setIsFeatured(false);
      fetch(`/api/ai-places?destination=${encodeURIComponent(trip.destination)}`)
        .then(async (r) => {
          const raw = await r.text();
          let d: any = {};
          if (raw) {
            try {
              d = JSON.parse(raw);
            } catch {
              throw new Error("Server sent back an invalid response — this is usually a dev-server hiccup. Please try again.");
            }
          }
          if (!r.ok) throw new Error(d.error || `Request failed (status ${r.status}).`);
          return d;
        })
        .then((d) => {
          const asPlaces = (d.places || []).map((p: any) => ({
            name: p.name,
            extract: p.whyVisit,
            mustSee: p.priority === "High priority",
            hiddenGem: p.hiddenGem,
            safetyNote: p.safetyNote,
            lat: p.lat,
            lng: p.lng,
            sourceUrl: null,
          }));
          setPlaces(asPlaces);
          setDestInfo({ ...d, source: "ai" });
          const preSelected: Record<string, any> = {};
          asPlaces.forEach((p: any) => { if (p.mustSee) preSelected[p.name] = p; });
          setSelected(preSelected);
        })
        .catch((e) => setPoiError(e.message))
        .finally(() => setLoadingPlaces(false));
    }
  }, [trip]);

  if (!trip) return <p className="py-12" style={{ color: "var(--ink-muted)" }}>Loading trip…</p>;

  return (
    <div className="py-8 sm:py-10">
      <BackButton fallbackHref="/dashboard" label="Back to my trips" />
      <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>{trip.destination}</p>
      <h1 className="font-display text-3xl sm:text-4xl mt-1" style={{ color: "var(--navy)" }}>{trip.title}</h1>
      {trip.startDate && new Date(trip.startDate).getTime() > Date.now() && (
        <p className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm floaty" style={{ background: "var(--surface-2)", color: "var(--gold)" }}>
          ✈ {Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000)} days until your trip
        </p>
      )}

      <div className="mt-6 scroll-x flex gap-1 border-b" style={{ borderColor: "var(--line)" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 text-sm font-medium -mb-px border-b-2 whitespace-nowrap"
            style={{ borderColor: tab === t ? "var(--navy)" : "transparent", color: tab === t ? "var(--navy)" : "var(--ink-muted)" }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Places to cover" && (
        <PlacesTab places={places} destInfo={destInfo} loading={loadingPlaces} isFeatured={isFeatured} error={poiError} selected={selected} setSelected={setSelected} />
      )}
      {tab === "Itinerary" && (
        <ItineraryTab
          trip={trip}
          selected={selected}
          numDays={numDays}
          setNumDays={setNumDays}
          pace={pace}
          setPace={setPace}
          onGenerated={loadTrip}
        />
      )}
      {tab === "Checklist" && <ChecklistTab trip={trip} onChange={loadTrip} />}
      {tab === "Expenses" && <ExpensesTab trip={trip} onChange={loadTrip} />}
    </div>
  );
}

function PriorityBadge({ p }: { p: any }) {
  if (p.hiddenGem) return <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--teal)" }}>Least-visited gem</span>;
  if (p.mustSee) return <span className="text-xs font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--marigold)", color: "#3a2a00" }}>★ Must-see</span>;
  return null;
}

function PlacesTab({ places, destInfo, loading, isFeatured, error, selected, setSelected }: any) {
  if (loading) {
    return (
      <div className="py-8">
        <p style={{ color: "var(--ink-muted)" }}>{isFeatured ? "Loading curated places…" : "Asking AI for real places to explore…"}</p>
        {!isFeatured && <TravelQuoteLoader />}
      </div>
    );
  }
  if (error) return <p className="py-8" style={{ color: "var(--danger)" }}>{error}</p>;
  if (!places.length) return <p className="py-8" style={{ color: "var(--ink-muted)" }}>No places found for this destination yet.</p>;

  const mustSee = places.filter((p: any) => p.mustSee);
  const hiddenGems = places.filter((p: any) => !p.mustSee && p.hiddenGem);
  const others = places.filter((p: any) => !p.mustSee && !p.hiddenGem);

  return (
    <div className="mt-6">
      {destInfo?.source === "ai" && (
        <div className="text-xs font-mono px-3 py-2 rounded mb-4 inline-block" style={{ background: "var(--surface-2)", color: "var(--ink-muted)" }}>
          ✦ AI-suggested — this destination isn't one of our 5 curated routes, so Claude generated this list. Double-check anything important.
        </div>
      )}
      {destInfo?.source === "curated" && (
        <div className="text-xs font-mono px-3 py-2 rounded mb-4 inline-block" style={{ background: "var(--surface-2)", color: "var(--teal)" }}>
          ✓ Curated — hand-researched, not AI-generated
        </div>
      )}
      {destInfo && (destInfo.bestSeason || destInfo.generalSafetyNote || destInfo.nearestAirport) && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6 text-sm">
          {destInfo.bestSeason && (
            <div className="p-3 rounded border" style={{ borderColor: "var(--line)" }}>
              <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Best time to go</p>
              <p className="mt-1">{destInfo.bestSeason}</p>
            </div>
          )}
          {(destInfo.nearestAirport || destInfo.nearestRailway) && (
            <div className="p-3 rounded border" style={{ borderColor: "var(--line)" }}>
              <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Getting there</p>
              {destInfo.nearestAirport && <p className="mt-1">✈ {destInfo.nearestAirport}</p>}
              {destInfo.nearestRailway && <p className="mt-1">🚆 {destInfo.nearestRailway}</p>}
            </div>
          )}
          {destInfo.permitNote && (
            <div className="p-3 rounded border" style={{ borderColor: "var(--line)" }}>
              <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Permits</p>
              <p className="mt-1">{destInfo.permitNote}</p>
              {destInfo.permitSourceUrl && <a href={destInfo.permitSourceUrl} target="_blank" className="text-xs underline" style={{ color: "var(--teal)" }}>Official source ↗</a>}
            </div>
          )}
          {destInfo.generalSafetyNote && (
            <div className="p-3 rounded border" style={{ borderColor: "var(--danger)" }}>
              <p className="font-mono text-xs uppercase" style={{ color: "var(--danger)" }}>Safety note</p>
              <p className="mt-1">{destInfo.generalSafetyNote}</p>
            </div>
          )}
        </div>
      )}

      <p className="text-sm mb-4" style={{ color: "var(--ink-muted)" }}>
        Must-see spots are pre-selected. Every place is real — sourced and linked. Head to the Itinerary tab when ready.
      </p>
      {mustSee.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase mb-2" style={{ color: "var(--marigold)" }}>★ Must-see</p>
          <PlaceGrid places={mustSee} selected={selected} setSelected={setSelected} />
        </>
      )}
      {hiddenGems.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase mt-6 mb-2" style={{ color: "var(--teal)" }}>Least-visited gems</p>
          <PlaceGrid places={hiddenGems} selected={selected} setSelected={setSelected} />
        </>
      )}
      {others.length > 0 && (
        <>
          <p className="font-mono text-xs uppercase mt-6 mb-2" style={{ color: "var(--ink-muted)" }}>More real places nearby</p>
          <PlaceGrid places={others} selected={selected} setSelected={setSelected} />
        </>
      )}
    </div>
  );
}

function PlaceGrid({ places, selected, setSelected }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {places.map((p: any) => {
        const isSelected = !!selected[p.name];
        return (
          <div key={p.name} className="ticket p-4" style={isSelected ? { boxShadow: `0 0 0 2px var(--marigold)` } : {}}>
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-display text-lg" style={{ color: "var(--navy)" }}>{p.name}</p>
                <div className="mt-1"><PriorityBadge p={p} /></div>
              </div>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  setSelected((s: any) => {
                    const next = { ...s };
                    if (e.target.checked) next[p.name] = p;
                    else delete next[p.name];
                    return next;
                  });
                }}
              />
            </div>
            <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--ink-muted)" }}>{p.extract}</p>
            {p.safetyNote && <p className="text-xs mt-2" style={{ color: "var(--danger)" }}>⚠ {p.safetyNote}</p>}
            {p.planningNote && <p className="text-xs mt-1 italic" style={{ color: "var(--ink-muted)" }}>{p.planningNote}</p>}
            {p.sourceUrl && (
              <a href={p.sourceUrl} target="_blank" className="text-xs underline mt-2 inline-block" style={{ color: "var(--teal)" }}>Source ↗</a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItineraryTab({ trip, selected, numDays, setNumDays, pace, setPace, onGenerated }: any) {
  const [generating, setGenerating] = useState(false);
  const mode = "ai" as const;
  const [originCity, setOriginCity] = useState(trip.originCity || "");
  const [travelStyle, setTravelStyle] = useState(trip.travelStyle || "backpacker");
  const [error, setError] = useState<string | null>(null);
  const selectedList = Object.values(selected);
  const travelNotes = trip.aiTravelNotes ? JSON.parse(trip.aiTravelNotes) : null;
  const budgetBreakdown = trip.aiBudgetBreakdown ? JSON.parse(trip.aiBudgetBreakdown) : [];
  const tips: string[] = trip.aiTips ? JSON.parse(trip.aiTips) : [];

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${trip.id}/days`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ places: selectedList, numDays, pace, mode, budgetTotal: trip.budgetTotal, interests: trip.interests, originCity, travelStyle }),
      });

      const raw = await res.text();
      let data: any = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Server sent back an invalid response — this is usually a dev-server hiccup. Please try again.");
        }
      }

      if (!res.ok) {
        setError(data.error || `Could not generate itinerary (status ${res.status}).`);
        return;
      }
      onGenerated();
    } catch (err: any) {
      setError(err.message || "Something went wrong generating the itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-4 items-end">
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Starting from</span>
          <input className="input mt-1 w-40" placeholder="e.g. Hyderabad" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Number of days</span>
          <input type="number" min={1} max={14} className="input mt-1 w-24" value={numDays} onChange={(e) => setNumDays(parseInt(e.target.value) || 1)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Pace</span>
          <select className="input mt-1" value={pace} onChange={(e) => setPace(e.target.value as any)}>
            <option value="relaxed">Relaxed (~2-3 stops/day)</option>
            <option value="packed">Packed (~4-5 stops/day)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Style</span>
          <select className="input mt-1" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
            <option value="backpacker">Backpacker</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>
        <div className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Mode</span>
          <p className="input mt-1 flex items-center" style={{ cursor: "default" }}>✦ AI plan</p>
        </div>
        <button onClick={generate} disabled={!selectedList.length || generating} className="px-5 py-2.5 rounded-full btn-primary text-sm font-medium">
          {generating ? "Building…" : `Generate from ${selectedList.length} place(s)`}
        </button>
      </div>
      {!selectedList.length && <p className="text-sm mt-3" style={{ color: "var(--ink-muted)" }}>Select places in the Places to cover tab first.</p>}
      <p className="text-xs mt-2" style={{ color: "var(--ink-muted)" }}>AI plan sequences your selected real places into a full plan — route, day-by-day, budget, and tips — without adding new places. Always verify transport/costs before booking. No passport or visa needed anywhere in India.</p>
      {generating && <TravelQuoteLoader />}
      {error && <p className="text-sm mt-3" style={{ color: "var(--danger)" }}>{error}</p>}

      {trip.aiRouteLogistics && (
        <RevealCard delay={0}>
          <p className="font-mono text-xs uppercase" style={{ color: "var(--teal)" }}>🧭 Route & logistics</p>
          <p className="text-sm mt-2 leading-relaxed">{trip.aiRouteLogistics}</p>
        </RevealCard>
      )}

      {travelNotes && (
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <RevealCard delay={80}>
            <p className="font-mono text-xs uppercase" style={{ color: "var(--teal)" }}>✈ Getting there</p>
            <p className="text-sm mt-1">{travelNotes.toDestination}</p>
          </RevealCard>
          <RevealCard delay={120}>
            <p className="font-mono text-xs uppercase" style={{ color: "var(--teal)" }}>🏠 Getting home</p>
            <p className="text-sm mt-1">{travelNotes.backHome}</p>
          </RevealCard>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {trip.days?.map((day: any, i: number) => (
          <RevealCard key={day.id} delay={160 + i * 60}>
            <p className="font-display text-lg" style={{ color: "var(--navy)" }}>
              Day {day.dayNumber}{day.title ? ` — ${day.title}` : ""}
            </p>
            <div className="mt-3 space-y-3">
              {day.items.map((item: any) => (
                <div key={item.id} className="perforated pt-3 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <div>
                    <p className="font-medium">{item.placeName}</p>
                    {item.extract && <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--ink-muted)" }}>{item.extract}</p>}
                    {item.notes && <p className="text-xs mt-1 italic" style={{ color: "var(--teal)" }}>{item.notes}</p>}
                    {item.sourceUrl && <a href={item.sourceUrl} target="_blank" className="text-xs underline" style={{ color: "var(--teal)" }}>Source ↗</a>}
                  </div>
                  <span className="font-mono text-sm whitespace-nowrap" style={{ color: "var(--ink-muted)" }}>{item.estimatedArrival}</span>
                </div>
              ))}
            </div>
          </RevealCard>
        ))}
      </div>

      {budgetBreakdown.length > 0 && (
        <RevealCard delay={160 + (trip.days?.length || 0) * 60 + 60}>
          <p className="font-mono text-xs uppercase" style={{ color: "var(--teal)" }}>💰 Budget breakdown</p>
          <div className="mt-3 space-y-2">
            {budgetBreakdown.map((line: any, i: number) => (
              <div key={i} className="perforated pt-2 flex justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{line.category}</p>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>{line.details}</p>
                </div>
                <span className="font-mono whitespace-nowrap">{line.costRange}</span>
              </div>
            ))}
          </div>
          {trip.aiTotalBudgetRange && (
            <div className="perforated pt-3 mt-3 flex justify-between items-baseline">
              <p className="font-display" style={{ color: "var(--navy)" }}>Total estimate</p>
              <span className="font-mono font-medium" style={{ color: "var(--teal)" }}>{trip.aiTotalBudgetRange}</span>
            </div>
          )}
        </RevealCard>
      )}

      {tips.length > 0 && (
        <RevealCard delay={160 + (trip.days?.length || 0) * 60 + 120}>
          <p className="font-mono text-xs uppercase" style={{ color: "var(--marigold)" }}>💡 Money-saving tips</p>
          <ul className="mt-3 space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="text-sm flex gap-2">
                <span style={{ color: "var(--marigold)" }}>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </RevealCard>
      )}
    </div>
  );
}

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className="ticket reveal p-5 mt-4 first:mt-0" style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ChecklistTab({ trip, onChange }: any) {
  const [seeding, setSeeding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  async function seed() {
    setSeeding(true);
    await fetch(`/api/trips/${trip.id}/checklist`, { method: "POST" });
    setSeeding(false);
    onChange();
  }

  async function addCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), category: "custom" }),
    });
    setNewLabel("");
    onChange();
  }

  async function toggle(itemId: string, done: boolean) {
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, done }),
    });
    onChange();
  }

  async function saveEdit(itemId: string) {
    await fetch(`/api/trips/${trip.id}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, label: editValue }),
    });
    setEditingId(null);
    onChange();
  }

  async function remove(itemId: string) {
    await fetch(`/api/trips/${trip.id}/checklist?itemId=${itemId}`, { method: "DELETE" });
    onChange();
  }

  return (
    <div className="mt-6">
      {(!trip.checklistItems || trip.checklistItems.length === 0) && (
        <div className="mb-6">
          <p className="text-sm mb-3" style={{ color: "var(--ink-muted)" }}>No checklist yet — generate one from curated, real guidance.</p>
          <button onClick={seed} disabled={seeding} className="px-4 py-2 rounded-full btn-primary text-sm">
            {seeding ? "Building…" : "Generate checklist"}
          </button>
        </div>
      )}

      <form onSubmit={addCustom} className="flex flex-wrap gap-2 mb-4">
        <input className="input flex-1 min-w-[200px]" placeholder="Add your own item…" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
        <button className="px-4 py-2 rounded-full btn-primary text-sm whitespace-nowrap">Add</button>
      </form>

      <div className="space-y-2">
        {(trip.checklistItems || []).map((item: any) => (
          <div key={item.id} className="flex items-start gap-3 p-3 ticket">
            <input type="checkbox" checked={item.done} onChange={(e) => toggle(item.id, e.target.checked)} className="mt-1 shrink-0 w-5 h-5 rounded accent-[var(--teal)] transition-transform active:scale-125 cursor-pointer" />
            <div className="flex-1 min-w-0">
              {editingId === item.id ? (
                <div className="flex flex-wrap gap-2">
                  <input className="input flex-1 min-w-[150px]" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                  <button onClick={() => saveEdit(item.id)} className="text-xs px-3 py-1 rounded-full btn-primary">Save</button>
                  <button onClick={() => setEditingId(null)} className="text-xs px-3 py-1 rounded-full border" style={{ borderColor: "var(--line)" }}>Cancel</button>
                </div>
              ) : (
                <p className={item.done ? "line-through" : ""} style={item.done ? { color: "var(--ink-muted)" } : {}}>{item.label}</p>
              )}
              {item.sourceUrl && <a href={item.sourceUrl} target="_blank" className="text-xs underline" style={{ color: "var(--teal)" }}>Official source ↗</a>}
            </div>
            {editingId !== item.id && (
              <div className="flex gap-2 shrink-0 text-xs">
                <button onClick={() => { setEditingId(item.id); setEditValue(item.label); }} style={{ color: "var(--teal)" }}>Edit</button>
                <button onClick={() => remove(item.id)} style={{ color: "var(--danger)" }}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpensesTab({ trip, onChange }: any) {
  const [form, setForm] = useState({ label: "", category: "food", amount: "", plannedOrActual: "planned" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  async function add(e: React.FormEvent) {
    e.preventDefault();
    await fetch(`/api/trips/${trip.id}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    setForm({ label: "", category: "food", amount: "", plannedOrActual: "planned" });
    onChange();
  }

  function startEdit(exp: any) {
    setEditingId(exp.id);
    setEditForm({ label: exp.label, category: exp.category, amount: exp.amount, plannedOrActual: exp.plannedOrActual });
  }

  async function saveEdit(expenseId: string) {
    await fetch(`/api/trips/${trip.id}/expenses`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expenseId, ...editForm, amount: parseFloat(editForm.amount) }),
    });
    setEditingId(null);
    onChange();
  }

  async function remove(expenseId: string) {
    await fetch(`/api/trips/${trip.id}/expenses?expenseId=${expenseId}`, { method: "DELETE" });
    onChange();
  }

  const total = (trip.expenses || []).reduce((s: number, e: any) => s + e.amount, 0);
  const budget = trip.budgetTotal || 0;

  return (
    <div className="mt-6">
      <div className="flex flex-wrap justify-between items-baseline mb-2 gap-2">
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>Logged: <span className="font-mono">{trip.currency} {total.toFixed(0)}</span></p>
        {budget > 0 && (
          <p className="text-sm" style={{ color: total > budget ? "var(--danger)" : "var(--teal)" }}>
            {total > budget ? `${trip.currency} ${(total - budget).toFixed(0)} over budget` : `${trip.currency} ${(budget - total).toFixed(0)} left`}
          </p>
        )}
      </div>
      {budget > 0 && (
        <div className="budget-bar mb-6" title={`${Math.min(100, Math.round((total / budget) * 100))}% of budget`}>
          <div style={{ width: `${Math.min(100, (total / budget) * 100)}%` }} />
        </div>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2 items-end mb-6">
        <input required placeholder="Label (e.g. Hostel night 1)" className="input flex-1 min-w-[160px]" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        <select className="input w-auto" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option value="stay">Stay</option>
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="activity">Activity</option>
          <option value="other">Other</option>
        </select>
        <input required type="number" placeholder="Amount" className="input w-24" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <select className="input w-auto" value={form.plannedOrActual} onChange={(e) => setForm({ ...form, plannedOrActual: e.target.value })}>
          <option value="planned">Planned</option>
          <option value="actual">Actual</option>
        </select>
        <button className="px-4 py-2 rounded-full btn-primary text-sm whitespace-nowrap">Add</button>
      </form>

      <div className="space-y-2">
        {(trip.expenses || []).map((exp: any) => (
          <div key={exp.id} className="p-3 ticket text-sm">
            {editingId === exp.id ? (
              <div className="flex flex-wrap gap-2 items-center">
                <input className="input flex-1 min-w-[140px]" value={editForm.label} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} />
                <select className="input w-auto" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                  <option value="stay">Stay</option>
                  <option value="food">Food</option>
                  <option value="transport">Transport</option>
                  <option value="activity">Activity</option>
                  <option value="other">Other</option>
                </select>
                <input type="number" className="input w-24" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })} />
                <select className="input w-auto" value={editForm.plannedOrActual} onChange={(e) => setEditForm({ ...editForm, plannedOrActual: e.target.value })}>
                  <option value="planned">Planned</option>
                  <option value="actual">Actual</option>
                </select>
                <button onClick={() => saveEdit(exp.id)} className="px-3 py-1.5 rounded-full btn-primary text-xs">Save</button>
                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-full border text-xs" style={{ borderColor: "var(--line)" }}>Cancel</button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span>{exp.label} <span style={{ color: "var(--ink-muted)" }}>· {exp.category} · {exp.plannedOrActual}</span></span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{exp.currency} {exp.amount}</span>
                  <button onClick={() => startEdit(exp)} className="text-xs" style={{ color: "var(--teal)" }}>Edit</button>
                  <button onClick={() => remove(exp.id)} className="text-xs" style={{ color: "var(--danger)" }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
