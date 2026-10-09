import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trips, expenses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const [expense] = await db
    .insert(expenses)
    .values({
      tripId: id,
      label: body.label,
      category: body.category,
      amount: body.amount,
      currency: body.currency || trip.currency,
      plannedOrActual: body.plannedOrActual || "planned",
    })
    .returning();
  return NextResponse.json(expense);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const [trip] = await db.select().from(trips).where(eq(trips.id, id)).limit(1);
  if (!trip || trip.userId !== (session.user as any).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json(); // { expenseId, label?, category?, amount?, plannedOrActual? }
  const [existing] = await db.select().from(expenses).where(eq(expenses.id, body.expenseId)).limit(1);
  if (!existing || existing.tripId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates: Record<string, any> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.category !== undefined) updates.category = body.category;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.plannedOrActual !== undefined) updates.plannedOrActual = body.plannedOrActual;

  const [updated] = await db.update(expenses).set(updates).where(eq(expenses.id, body.expenseId)).returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const expenseId = searchParams.get("expenseId");
  if (!expenseId) return NextResponse.json({ error: "expenseId required" }, { status: 400 });

  const [existing] = await db.select().from(expenses).where(eq(expenses.id, expenseId)).limit(1);
  if (!existing || existing.tripId !== id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(expenses).where(eq(expenses.id, expenseId));
  return NextResponse.json({ ok: true });
}
