import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rateLimit";

// Note on the security trade-off here: this endpoint reveals whether an
// email is registered, which is normally avoided (user enumeration). It's
// added deliberately so sign-in can show "create an account first" instead
// of a generic error — a usability choice for this app. Rate-limited to
// make scripted enumeration at least slow and noisy.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { allowed, retryAfterSeconds } = checkRateLimit(`check-account:${ip}`, 20, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    return NextResponse.json({ exists: !!user });
  } catch (err: any) {
    console.error("Unhandled error in GET /api/auth/check-account:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
