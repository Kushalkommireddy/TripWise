import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { db } from "@/db";
import { users, passwordResetCodes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/rateLimit";

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

async function sendViaResend(email: string, code: string): Promise<{ sent: boolean; errorDetail?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || "TripWise <onboarding@resend.dev>",
        to: email,
        subject: "Your TripWise password reset code",
        html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error("Resend send failed:", res.status, detail);
      return { sent: false, errorDetail: detail };
    }
    return { sent: true };
  } catch (err: any) {
    console.error("Resend request threw an error:", err);
    return { sent: false, errorDetail: err.message };
  }
}

// Gmail SMTP — no domain required, since it sends from your own Gmail
// address. Needs a Google "App Password" (not your regular password),
// which requires 2-Step Verification to be enabled on the account.
async function sendViaGmail(email: string, code: string): Promise<{ sent: boolean; errorDetail?: string }> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return { sent: false };

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: `TripWise <${user}>`,
      to: email,
      subject: "Your TripWise password reset code",
      html: `<p>Your password reset code is:</p><p style="font-size:28px;font-weight:bold;letter-spacing:4px">${code}</p><p>This code expires in 15 minutes. If you didn't request this, you can ignore this email.</p>`,
    });
    return { sent: true };
  } catch (err: any) {
    // Common causes: 2-Step Verification not enabled, using the regular
    // Gmail password instead of an App Password, or an incorrect address.
    console.error("Gmail SMTP send failed:", err.message);
    return { sent: false, errorDetail: err.message };
  }
}

async function sendResetEmail(email: string, code: string): Promise<{ sent: boolean; errorDetail?: string }> {
  // Try Resend first if configured, then Gmail, then give up gracefully.
  if (process.env.RESEND_API_KEY) return sendViaResend(email, code);
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) return sendViaGmail(email, code);
  return { sent: false };
}

export async function POST(req: NextRequest) {
  // Top-level safety net — see the days route for why this matters: without
  // it, an unexpected error anywhere below returns an empty/broken body
  // instead of valid JSON, which crashes the frontend's res.json() call.
  try {
    return await handleForgotPassword(req);
  } catch (err: any) {
    console.error("Unhandled error in POST /api/auth/forgot-password:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}

async function handleForgotPassword(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "email is required" }, { status: 400 });

  // Cap reset requests per email so this can't be used to spam someone's
  // inbox or hammer the email provider's send quota.
  const { allowed, retryAfterSeconds } = checkRateLimit(`forgot-password:${email.toLowerCase()}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many reset requests for this email. Please try again in ${retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  // Always respond success-shaped, even if no account exists, so we don't
  // leak which emails are registered.
  if (!user) {
    return NextResponse.json({ ok: true, message: "If an account exists for that email, a code has been sent." });
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.insert(passwordResetCodes).values({ userId: user.id, codeHash, expiresAt });

  const { sent, errorDetail } = await sendResetEmail(email, code);

  const payload: Record<string, unknown> = {
    ok: true,
    message: "If an account exists for that email, a code has been sent.",
  };

  // Dev fallback: if no email provider is configured, or Resend rejected
  // the send, surface the code directly so the flow is testable locally —
  // never do this in production.
  if (!sent && process.env.NODE_ENV !== "production") {
    payload.devCode = code;
    if (process.env.RESEND_API_KEY || process.env.GMAIL_USER) {
      payload.devNote = `Email sending is configured but the send failed — check your terminal logs for the exact reason. Showing the code here for local testing only.`;
    } else {
      payload.devNote = "No email provider configured (RESEND_API_KEY or GMAIL_USER/GMAIL_APP_PASSWORD) — showing code here for local testing only.";
    }
  }

  return NextResponse.json(payload);
}
