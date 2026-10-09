"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { safeJson } from "@/lib/safeJson";
import BackButton from "@/components/BackButton";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      await signIn("credentials", { email, password: newPassword, redirect: false });
      // Same fix as sign-in/sign-up: verify via an actual session check
      // rather than trusting signIn()'s returned ok/error shape, which
      // proved unreliable in this version.
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await safeJson(sessionRes);
      if (sessionData?.user) router.push("/dashboard");
      else router.push("/login");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <BackButton fallbackHref="/forgot-password" label="Back" />
      <h1 className="font-display text-3xl" style={{ color: "var(--navy)" }}>Enter your reset code</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>Email</span>
          <input required type="email" className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>6-digit code</span>
          <input required maxLength={6} className="input mt-1 font-mono tracking-widest" value={code} onChange={(e) => setCode(e.target.value)} />
        </label>
        <label className="block">
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>New password (8+ characters)</span>
          <input required type="password" minLength={8} className="input mt-1" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </label>
        {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
        <button disabled={loading} className="w-full py-3 rounded-full btn-primary font-medium">
          {loading ? "Resetting…" : "Reset password & sign in"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
