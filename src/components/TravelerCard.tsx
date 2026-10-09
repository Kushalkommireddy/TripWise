"use client";
import { useEffect, useRef, useState } from "react";
import { safeJson } from "@/lib/safeJson";

type Profile = {
  name: string;
  email: string;
  originCity: string | null;
  passportStatus: string | null;
  dateOfBirth: string | null;
  memberSince: string;
  favoritePlaces: string[];
  stats: {
    tripsPlanned: number;
    destinationsCovered: number;
    destinations: string[];
    daysPlanned: number;
    wanderlustLevel: string;
  };
};

const PASSPORT_OPTIONS = [
  { value: "Multiverse Explorer", emoji: "🌀" },
  { value: "Buriburi Detective", emoji: "🕵️" },
  { value: "Anywhere Door Explorer", emoji: "🚪" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "Not set";
  return new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: "var(--surface-2)", color: "var(--ink)", border: "1px solid var(--line)" }}
    >
      {label}
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${label}`} className="opacity-60 hover:opacity-100 transition">
          ✕
        </button>
      )}
    </span>
  );
}

export default function TravelerCard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newPlace, setNewPlace] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editPassport, setEditPassport] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/profile");
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);
      setProfile(data);
    } catch (e: any) {
      setError(e.message || "Could not load your traveler card.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit() {
    if (!profile) return;
    setEditName(profile.name);
    setEditDob(profile.dateOfBirth || "");
    setEditOrigin(profile.originCity || "");
    setEditPassport(profile.passportStatus || PASSPORT_OPTIONS[0].value);
    setSaveError(null);
    setEditing(true);
  }

  async function saveEdit() {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim() || profile.name,
          dateOfBirth: editDob || undefined,
          originCity: editOrigin.trim() || undefined,
          passportStatus: editPassport,
        }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);
      await load();
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function addFavorite() {
    const place = newPlace.trim();
    if (!place || !profile) return;
    if (profile.favoritePlaces.includes(place)) return;
    const next = [...profile.favoritePlaces, place];
    setProfile({ ...profile, favoritePlaces: next });
    setNewPlace("");
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoritePlaces: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeFavorite(place: string) {
    if (!profile) return;
    const next = profile.favoritePlaces.filter((p) => p !== place);
    setProfile({ ...profile, favoritePlaces: next });
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoritePlaces: next }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mt-12 ticket p-8 text-center" style={{ color: "var(--ink-muted)" }}>
        Loading your traveler card…
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mt-12 ticket p-8 text-center" style={{ color: "var(--danger)" }}>
        {error || "Could not load your traveler card."}
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>
          Your TripWise traveler card
        </p>
        {!editing && (
          <button
            onClick={startEdit}
            className="px-3 py-1 rounded-full text-xs font-medium border transition hover:scale-105"
            style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}
          >
            ✏️ Edit card
          </button>
        )}
      </div>

      <div
        className="relative rounded-3xl p-[1.5px] overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--gold), var(--teal), var(--navy), var(--gold))", backgroundSize: "300% 300%", animation: "shimmer 6s linear infinite" }}
      >
        <div className="rounded-[calc(1.5rem-1.5px)] p-6 sm:p-8" style={{ background: "var(--surface)" }}>
          {/* Header: avatar + identity */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 floaty"
              style={{
                background: "linear-gradient(135deg, var(--navy), var(--teal))",
                color: "var(--paper)",
                fontSize: "1.75rem",
                fontFamily: "'Quintessential', serif",
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.4)",
              }}
            >
              {initials(profile.name)}
            </div>
            <div className="min-w-0">
              {editing ? (
                <input
                  className="input font-display text-2xl sm:text-3xl"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ color: "var(--navy)" }}
                />
              ) : (
                <h2 className="font-display text-2xl sm:text-3xl truncate" style={{ color: "var(--navy)" }}>
                  {profile.name}
                </h2>
              )}
              <p className="text-sm mt-0.5" style={{ color: "var(--ink-muted)" }}>
                TripWise Traveler · Member since {formatDate(profile.memberSince)}
              </p>
              <span
                className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "var(--surface-2)", color: "var(--gold)", border: "1px solid var(--line)" }}
              >
                ✈ {stats.wanderlustLevel}
              </span>
            </div>
          </div>

          {/* Details grid — read mode */}
          {!editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Detail label="Date of birth" value={formatDate(profile.dateOfBirth)} />
              <Detail label="Email" value={profile.email} />
              <Detail label="Origin city" value={profile.originCity || "Not set"} />
              <Detail label="Passport status" value={profile.passportStatus || "Not specified"} />
            </div>
          )}

          {/* Details grid — edit mode */}
          {editing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Name</span>
                <input className="input mt-1" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Date of birth</span>
                <input type="date" className="input mt-1" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Origin city</span>
                <input className="input mt-1" value={editOrigin} onChange={(e) => setEditOrigin(e.target.value)} placeholder="e.g. Hyderabad" />
              </label>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Passport status</span>
                <PassportDropdown value={editPassport} onChange={setEditPassport} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button onClick={saveEdit} disabled={saving} className="px-5 py-2 rounded-full btn-primary text-sm font-medium">
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-5 py-2 rounded-full text-sm border"
                  style={{ borderColor: "var(--line)", color: "var(--ink-muted)" }}
                >
                  Cancel
                </button>
              </div>
              {saveError && <p className="text-sm sm:col-span-2" style={{ color: "var(--danger)" }}>{saveError}</p>}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Stat value={stats.tripsPlanned} label="Trips planned" />
            <Stat value={stats.destinationsCovered} label="Destinations" />
            <Stat value={stats.daysPlanned} label="Days planned" />
          </div>

          {/* Covered places */}
          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-muted)" }}>
              Places covered
            </p>
            {stats.destinations.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.destinations.map((d) => (
                  <Chip key={d} label={d} />
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                No trips yet — your covered places will appear here.
              </p>
            )}
          </div>

          {/* Favorite places */}
          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-widest mb-2" style={{ color: "var(--ink-muted)" }}>
              Favorite places
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.favoritePlaces.map((p) => (
                <Chip key={p} label={p} onRemove={() => removeFavorite(p)} />
              ))}
              {profile.favoritePlaces.length === 0 && (
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Add places you love — they'll be saved to your card.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <input
                className="input flex-1 min-w-[180px] max-w-xs"
                placeholder="Add a favorite place…"
                value={newPlace}
                onChange={(e) => setNewPlace(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFavorite()}
              />
              <button
                onClick={addFavorite}
                disabled={!newPlace.trim() || saving}
                className="px-4 py-2 rounded-full btn-primary text-sm whitespace-nowrap"
              >
                {saving ? "Saving…" : "Add"}
              </button>
            </div>
          </div>

          {/* Boarding-pass style footer */}
          <div className="perforated mt-8 pt-4 flex items-center justify-between gap-4">
            <div className="flex gap-[3px] items-end h-8" aria-hidden>
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: (i * 7) % 3 + 1,
                    height: `${40 + ((i * 13) % 60)}%`,
                    background: "var(--ink-muted)",
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
            <p className="font-mono text-xs" style={{ color: "var(--ink-muted)" }}>
              TRV-{profile.email.length}-{stats.tripsPlanned}{stats.destinationsCovered}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PassportDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const selected = PASSPORT_OPTIONS.find((o) => o.value === value) || PASSPORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
        style={{
          background: open ? "var(--surface-2)" : "var(--surface)",
          border: `1px solid ${open ? "var(--gold)" : "var(--line)"}`,
          color: "var(--ink)",
          boxShadow: open ? "0 0 0 3px color-mix(in srgb, var(--gold) 18%, transparent)" : "none",
        }}
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{selected.emoji}</span>
          {selected.value}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className="absolute left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 16px 40px -12px rgba(0,0,0,0.35)",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {PASSPORT_OPTIONS.map((o, i) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors duration-200"
              style={{
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--navy)" : "var(--ink)",
                fontWeight: active ? 600 : 400,
                transitionDelay: open ? `${i * 40}ms` : "0ms",
                opacity: open ? 1 : 0,
                transform: open ? "translateX(0)" : "translateX(-8px)",
                transitionProperty: "opacity, transform, background, color",
                transitionDuration: "0.3s",
              }}
            >
              <span className="text-lg">{o.emoji}</span>
              <span className="flex-1">{o.value}</span>
              {active && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: "var(--gold)", color: "#1a1408" }}
                >
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <p className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>
        {label}
      </p>
      <p className="text-sm mt-1 font-medium truncate">{value}</p>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center p-3 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <p className="font-display text-2xl" style={{ color: "var(--navy)" }}>
        {value}
      </p>
      <p className="text-[11px] mt-0.5" style={{ color: "var(--ink-muted)" }}>
        {label}
      </p>
    </div>
  );
}
