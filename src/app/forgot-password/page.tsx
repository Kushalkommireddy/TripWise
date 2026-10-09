"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { safeJson } from "@/lib/safeJson";
import BackButton from "@/components/BackButton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setMessage(data.message || "If an account exists for that email, a code has been sent.");
      if (data.devCode) {
        // A dev code means no email provider is configured — this IS the
        // user's only way to get the code, so don't whisk them away before
        // they can read/copy it. Let them continue manually instead.
        setDevCode(data.devCode);
      } else {
        // A real email was sent — safe to move them along automatically.
        setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}`), 1800);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <BackButton fallbackHref="/login" label="Back to sign in" />
      <h1 className="font-display text-3xl" style={{ color: "var(--navy)" }}>Reset your password</h1>
      <p className="text-sm mt-2" style={{ color: "var(--ink-muted)" }}>
        Enter your account email and we'll send a 6-digit code to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Email</span>
          <input required type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <button disabled={loading} className="w-full py-3 rounded-full btn-primary font-medium">
          {loading ? "Sending…" : "Send reset code"}
        </button>
        {message && <p className="text-sm" style={{ color: "var(--teal)" }}>{message}</p>}
        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        {devCode && (
          <div className="p-3 rounded space-y-2" style={{ background: "var(--danger-bg)" }}>
            <p className="text-xs font-mono" style={{ color: "var(--danger)" }}>
              Dev mode (no email provider configured) — your code is: <strong>{devCode}</strong>
            </p>
            <button
              type="button"
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(email)}`)}
              className="text-sm underline"
              style={{ color: "var(--danger)" }}
            >
              Continue to reset password →
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
