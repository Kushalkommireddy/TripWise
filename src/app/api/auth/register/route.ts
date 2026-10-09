import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  originCity: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    return await handleRegister(req);
  } catch (err: any) {
    console.error("Unhandled error in POST /api/auth/register:", err);
    return NextResponse.json(
      { error: "Something went wrong creating your account. Please try again in a moment." },
      { status: 500 }
    );
  }
}

async function handleRegister(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { name, email, password, originCity, dateOfBirth } = parsed.data;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash, originCity, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null })
    .returning();

  return NextResponse.json({ id: user.id, email: user.email });
}
