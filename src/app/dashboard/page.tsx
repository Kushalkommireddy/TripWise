"use client";
import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { indiaDestinations } from "@/lib/india-destinations";
import { featuredDestinations } from "@/lib/featured-trips";
import { SceneBackground, DESTINATION_SCENES } from "@/components/SceneBackground";
import TravelerCard from "@/components/TravelerCard";
import { safeJson } from "@/lib/safeJson";

type Trip = {
  id: string;
  title: string;
  destination: string;
  budgetTotal: number | null;
  currency: string;
  startDate: string | null;
};

function Dashboard() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillDestination = searchParams.get("destination");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(!!prefillDestination);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDeleteTrip(tripId: string) {
    setDeletingId(tripId);
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: "DELETE" });
      if (res.ok) {
        setTrips((ts) => ts.filter((t) => t.id !== tripId));
      }
    } catch {
      // Transient — the trip stays in the list and the user can retry.
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/trips")
        .then(safeJson)
        .then((data) => {
          setTrips(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status !== "authenticated") return null;

  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <div className="py-8 sm:py-12">
      <p className="font-display text-2xl sm:text-3xl" style={{ color: "var(--navy)" }}>
        Welcome{firstName ? `, ${firstName}` : ""} - where would you like to travel today?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
        {featuredDestinations.map((d) => (
          <Link key={d.slug} href={`/explore/${d.slug}`} className="dest-card block">
            <SceneBackground scene={DESTINATION_SCENES[d.slug]} />
            <div className="dest-card-scrim" />
            <div className="dest-card-label">
              <p className="font-display text-lg">{d.name}</p>
              <p className="font-mono text-xs mt-1 opacity-80">{d.estimatedBudgetFromHyderabad}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-10">
        <h2 className="font-display text-xl" style={{ color: "var(--ink-muted)" }}>My trips</h2>
        <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2 rounded-full btn-primary glow-btn text-sm font-medium">
          {showForm ? "Cancel" : "+ New custom trip"}
        </button>
      </div>

      {showForm && (
        <NewTripForm
          initialDestination={prefillDestination || undefined}
          onCreated={(t) => {
            setTrips([t, ...trips]);
            setShowForm(false);
            router.push(`/trips/${t.id}`);
          }}
        />
      )}

      {loading ? (
        <p className="mt-8" style={{ color: "var(--ink-muted)" }}>Loading…</p>
      ) : trips.length === 0 ? (
        <p className="mt-8" style={{ color: "var(--ink-muted)" }}>No trips yet - start one above.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((t) => (
            <div key={t.id} className="ticket p-5 relative hover:shadow-sm transition">
              {confirmDeleteId === t.id ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-5 rounded-[14px]" style={{ background: "var(--surface)" }}>
                  <p className="text-sm text-center" style={{ color: "var(--ink)" }}>Delete "{t.title}"? This can't be undone.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteTrip(t.id)}
                      disabled={deletingId === t.id}
                      className="px-4 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: "var(--danger)", color: "white" }}
                    >
                      {deletingId === t.id ? "Deleting…" : "Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-4 py-1.5 rounded-full text-sm border"
                      style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDeleteId(t.id); }}
                  aria-label="Delete trip"
                  className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full text-sm"
                  style={{ color: "var(--ink-muted)", background: "var(--surface-2)" }}
                >
                  ✕
                </button>
              )}
              <Link href={`/trips/${t.id}`} className="block">
                <p className="font-mono text-xs uppercase pr-8" style={{ color: "var(--ink-muted)" }}>{t.destination}</p>
                <p className="font-display text-xl mt-1" style={{ color: "var(--navy)" }}>{t.title}</p>
                <div className="perforated mt-3 pt-3 flex justify-between text-sm" style={{ color: "var(--ink-muted)" }}>
                  <span>{t.startDate ? new Date(t.startDate).toLocaleDateString() : "Dates TBD"}</span>
                  <span className="font-mono">{t.budgetTotal ? `${t.currency} ${t.budgetTotal}` : "No budget set"}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <TravelerCard />
    </div>
  );
}

function NewTripForm({ onCreated, initialDestination }: { onCreated: (t: any) => void; initialDestination?: string }) {
  const [destination, setDestination] = useState(initialDestination ? initialDestination.replace(/-/g, " ") : "");
  const [title, setTitle] = useState("");
  const [budgetTotal, setBudgetTotal] = useState("");
  const [travelStyle, setTravelStyle] = useState("backpacker");
  const [geo, setGeo] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDestination) checkDestination();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkDestination() {
    if (!destination) return;
    setChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/poi?destination=${encodeURIComponent(destination)}`);
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);
      setGeo(data);
    } catch (e: any) {
      setError(e.message || "Could not look up that destination.");
      setGeo(null);
    }
    setChecking(false);
  }

  async function createTrip() {
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `Trip to ${destination}`,
          destination,
          destinationLat: geo?.lat,
          destinationLng: geo?.lng,
          countryCode: "IN",
          budgetTotal: budgetTotal ? parseFloat(budgetTotal) : null,
          travelStyle,
        }),
      });
      const trip = await safeJson(res);
      if (!res.ok) {
        setError(trip.error || "Could not create the trip. Please try again.");
        return;
      }
      onCreated(trip);
    } catch (err: any) {
      setError(err.message || "Could not create the trip. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="ticket p-5 sm:p-6 mt-6">
      <p className="text-xs mb-4" style={{ color: "var(--ink-muted)" }}>
        TripWise currently covers destinations within India. Try a popular one:{" "}
        {indiaDestinations.slice(0, 5).map((d) => d.name).join(", ")}, or search any Indian city/region.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Destination (India)</span>
          <input className="input mt-1" placeholder="e.g. Leh-Ladakh" value={destination} onChange={(e) => { setDestination(e.target.value); setGeo(null); }} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Trip title</span>
          <input className="input mt-1" placeholder="Optional" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Budget (INR)</span>
          <input type="number" className="input mt-1" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Travel style</span>
          <select className="input mt-1" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)}>
            <option value="backpacker">Backpacker</option>
            <option value="mid-range">Mid-range</option>
            <option value="luxury">Luxury</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <button onClick={checkDestination} disabled={!destination || checking} className="px-4 py-2 rounded-full border text-sm" style={{ borderColor: "var(--line)" }}>
          {checking ? "Checking…" : "Check destination"}
        </button>
        {error && <span className="text-sm" style={{ color: "var(--danger)" }}>{error}</span>}
      </div>

      {geo && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded border" style={{ borderColor: "var(--line)" }}>
            <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Best time to visit</p>
            <p className="mt-1">{geo.bestSeason || "No curated season data yet for this destination."}</p>
          </div>
          <div className="p-3 rounded border" style={{ borderColor: "var(--line)" }}>
            <p className="font-mono text-xs uppercase" style={{ color: "var(--ink-muted)" }}>Permits / access</p>
            {geo.permitNote ? (
              <>
                <p className="mt-1">{geo.permitNote}</p>
                {geo.permitSourceUrl && <a href={geo.permitSourceUrl} target="_blank" className="text-xs underline" style={{ color: "var(--teal)" }}>Official source ↗</a>}
              </>
            ) : (
              <p className="mt-1">No special permits noted.</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <button onClick={createTrip} disabled={!destination || creating} className="px-5 py-2.5 rounded-full btn-primary text-sm font-medium">
          {creating ? "Creating…" : "Create trip"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
