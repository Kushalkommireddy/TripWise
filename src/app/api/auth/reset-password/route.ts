import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users, passwordResetCodes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { email, code, newPassword } = await req.json();
  if (!email || !code || !newPassword) {
    return NextResponse.json({ error: "email, code, and newPassword are required" }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return NextResponse.json({ error: "Invalid code or email." }, { status: 400 });
  }

  const candidates = await db
    .select()
    .from(passwordResetCodes)
    .where(
      and(
        eq(passwordResetCodes.userId, user.id),
        eq(passwordResetCodes.used, false),
        gt(passwordResetCodes.expiresAt, new Date())
      )
    );

  let match = null;
  for (const c of candidates) {
    if (await bcrypt.compare(code, c.codeHash)) {
      match = c;
      break;
    }
  }

  if (!match) {
    return NextResponse.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, user.id));
  await db.update(passwordResetCodes).set({ used: true }).where(eq(passwordResetCodes.id, match.id));

  return NextResponse.json({ ok: true });
}
