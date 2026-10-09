import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trips, checklistItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { findDestination } from "@/lib/india-destinations";

// Seeds a checklist from curated, real domestic-travel guidance (permits,
// documents) plus generic reminders. Users can also add their own custom
// items — nothing here pretends to be exhaustive or destination-specific
// beyond what's actually curated.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const items: { label: string; category: string; sourceUrl?: string }[] = [];
  const curated = findDestination(trip.destination);

  if (curated?.permitNote) {
    items.push({ label: curated.permitNote, category: "permit", sourceUrl: curated.permitSourceUrl });
  }

  items.push(
    { label: "Government-issued photo ID (Aadhaar / passport / driving licence)", category: "document" },
    { label: "Travel insurance for the trip duration", category: "insurance" },
    { label: "Check weather and pack accordingly for the season", category: "packing" },
    { label: "Save local emergency numbers (police 112, ambulance 108) and hotel contact", category: "safety" },
    { label: "Screenshot/print key bookings for offline access", category: "document" },
    { label: "Carry some cash — card acceptance can be patchy outside major towns", category: "money" }
  );

  await db.insert(checklistItems).values(
    items.map((i) => ({ tripId: id, label: i.label, category: i.category, sourceUrl: i.sourceUrl }))
  );

  const all = await db.select().from(checklistItems).where(eq(checklistItems.tripId, id));
  return NextResponse.json(all);
}

// Add a single custom item (user-authored)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  if (!body.label) return NextResponse.json({ error: "label is required" }, { status: 400 });

  const [item] = await db
    .insert(checklistItems)
    .values({ tripId: id, label: body.label, category: body.category || "custom" })
    .returning();
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json(); // { itemId, done?, label? }

  const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, body.itemId)).limit(1);
  if (!item || item.tripId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Partial<{ done: boolean; label: string }> = {};
  if (typeof body.done === "boolean") updates.done = body.done;
  if (typeof body.label === "string" && body.label.trim()) updates.label = body.label.trim();

  const [updated] = await db.update(checklistItems).set(updates).where(eq(checklistItems.id, body.itemId)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const [item] = await db.select().from(checklistItems).where(eq(checklistItems.id, itemId)).limit(1);
  if (!item || item.tripId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(checklistItems).where(eq(checklistItems.id, itemId));
  return NextResponse.json({ ok: true });
}
