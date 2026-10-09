"use client";
import { useEffect, useState } from "react";

// Original lines (not quoting any published author) so we stay clear of
// copyrighted material while still giving users something nice to read
// during the few seconds an AI call takes.
const TRAVEL_LINES = [
  "The best itineraries leave room for a wrong turn or two.",
  "A good trip budget has one line item for surprises.",
  "Pack light. You can always buy a scarf when you get there.",
  "The first bite of street food in a new city tells you everything.",
  "Every hill station has a view that photos never quite capture.",
  "Slow travel days remember better than fast ones.",
  "The best souvenir is a story you'll tell for years.",
  "A local's shortcut is worth more than any map.",
  "Trains teach patience that flights never do.",
  "The right playlist makes a long drive disappear.",
  "Sunrise at a new destination hits different every time.",
  "Travel light on plans, heavy on curiosity.",
];

export default function TravelQuoteLoader({ label = "Working on it…" }: { label?: string }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * TRAVEL_LINES.length));

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % TRAVEL_LINES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-4 p-4 rounded-lg border text-sm" style={{ borderColor: "var(--line)", background: "var(--surface-2)" }}>
      <p className="font-mono text-xs uppercase mb-2" style={{ color: "var(--ink-muted)" }}>{label}</p>
      <p className="italic transition-opacity duration-300" style={{ color: "var(--ink)" }}>
        "{TRAVEL_LINES[index]}"
      </p>
    </div>
  );
}
