import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, trips } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";

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

function wanderlustLevel(tripsPlanned: number, destinationsCovered: number): string {
  const score = tripsPlanned * 2 + destinationsCovered * 3;
  if (score >= 15) return "Globe Trotter";
  if (score >= 8) return "Trailblazer";
  if (score >= 3) return "Explorer";
  return "Wanderer";
}

// Derives the "traveler card" data: profile fields plus trip-derived stats
// (destinations covered, days planned, wanderlust level).
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.email, (session.user as any).email)).limit(1);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const userTrips = await db
      .select()
      .from(trips)
      .where(eq(trips.userId, user.id))
      .orderBy(desc(trips.createdAt));

    const destinations = [...new Set(userTrips.map((t) => t.destination))];
    const daysPlanned = userTrips.reduce((sum, t) => {
      if (t.startDate && t.endDate) {
        return sum + Math.max(1, Math.round((+new Date(t.endDate) - +new Date(t.startDate)) / 86400000) + 1);
      }
      return sum;
    }, 0);

    let favoritePlaces: string[] = [];
    try {
      favoritePlaces = JSON.parse(user.favoritePlaces || "[]");
    } catch {
      favoritePlaces = [];
    }

    const profile: Profile = {
      name: user.name ?? "Traveler",
      email: user.email,
      originCity: user.originCity,
      passportStatus: user.passportStatus,
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : null,
      memberSince: new Date(user.createdAt).toISOString().slice(0, 10),
      favoritePlaces,
      stats: {
        tripsPlanned: userTrips.length,
        destinationsCovered: destinations.length,
        destinations,
        daysPlanned,
        wanderlustLevel: wanderlustLevel(userTrips.length, destinations.length),
      },
    };

    return NextResponse.json(profile);
  } catch (err: any) {
    console.error("Unhandled error in GET /api/profile:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  dateOfBirth: z.string().optional(),
  originCity: z.string().optional(),
  passportStatus: z.string().optional(),
  favoritePlaces: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, (session.user as any).email)).limit(1);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { name, dateOfBirth, originCity, passportStatus, favoritePlaces } = parsed.data;
    await db
      .update(users)
      .set({
        ...(name !== undefined ? { name } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth: new Date(dateOfBirth) } : {}),
        ...(originCity !== undefined ? { originCity } : {}),
        ...(passportStatus !== undefined ? { passportStatus } : {}),
        ...(favoritePlaces !== undefined ? { favoritePlaces: JSON.stringify(favoritePlaces) } : {}),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Unhandled error in PATCH /api/profile:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
