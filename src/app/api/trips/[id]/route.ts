import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";

async function ownsTrip(userId: string, tripId: string) {
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
  return trip && trip.userId === userId ? trip : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const trip = await db.query.trips.findFirst({
    where: (t, { eq }) => eq(t.id, id),
    with: {
      days: {
        with: { items: { orderBy: (i, { asc }) => asc(i.order) } },
        orderBy: (d, { asc }) => asc(d.dayNumber),
      },
      checklistItems: true,
      expenses: { orderBy: (e, { desc }) => desc(e.createdAt) },
    },
  });

  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(trip);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await ownsTrip((session.user as any).id, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const [trip] = await db.update(trips).set(body).where(eq(trips.id, id)).returning();
  return NextResponse.json(trip);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const owned = await ownsTrip((session.user as any).id, id);
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(trips).where(eq(trips.id, id));
  return NextResponse.json({ ok: true });
}
