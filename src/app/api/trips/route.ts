import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, (session.user as any).id))
    .orderBy(desc(trips.createdAt));
  return NextResponse.json(userTrips);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const [trip] = await db
    .insert(trips)
    .values({
      userId: (session.user as any).id,
      title: body.title,
      destination: body.destination,
      destinationLat: body.destinationLat,
      destinationLng: body.destinationLng,
      countryCode: body.countryCode,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budgetTotal: body.budgetTotal,
      currency: body.currency || "INR",
      travelStyle: body.travelStyle,
      pace: body.pace,
      interests: body.interests || [],
    })
    .returning();
  return NextResponse.json(trip);
}
