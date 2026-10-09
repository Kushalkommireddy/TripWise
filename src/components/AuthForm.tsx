"use client";
import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import PasswordInput from "./PasswordInput";
import { safeJson } from "@/lib/safeJson";

// Maps Auth.js's internal error codes (arrives as a URL query param, since
// signIn's redirect:false option doesn't reliably stay client-side for the
// credentials provider in this NextAuth version — it still navigates back
// to the sign-in page with ?error=... attached) to a friendly message.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  Configuration: "There's a server configuration problem. Please try again shortly.",
};

function AuthFormInner({ initialMode = "signin", destination }: { initialMode?: "signin" | "signup"; destination?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pick up an error that arrived via redirect (see note above) rather than
  // via the signIn() promise, and clean the URL afterward.
  useEffect(() => {
    const code = searchParams.get("error");
    if (code) {
      setError(AUTH_ERROR_MESSAGES[code] || "Invalid email or password.");
      setMode("signin");
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      router.replace(url.pathname + url.search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // sign in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // sign up fields
  const [username, setUsername] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [dob, setDob] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Check account existence first so we can give a clear, specific
      // message ("create an account first") instead of a generic one when
      // there's no account at all — NextAuth's own error deliberately
      // collapses "wrong password" and "no such account" into one message
      // for security, but this app's UX explicitly wants them distinguished.
      const checkRes = await fetch(`/api/auth/check-account?email=${encodeURIComponent(email)}`);
      const checkData = await safeJson(checkRes);
      if (checkRes.ok && checkData.exists === false) {
        setError("No account found with that email. Please create an account first.");
        return;
      }

      const res = await signIn("credentials", { email, password, redirect: false });

      // Belt-and-suspenders: don't trust signIn()'s returned shape alone —
      // this version's res.ok/res.error behavior turned out inconsistent
      // in testing (a failed login still reported success). Confirm a
      // real session actually exists before treating this as a success.
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await safeJson(sessionRes);

      if (sessionData?.user) {
        router.push(destination ? `/dashboard?destination=${destination}` : "/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong signing in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (suPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email: suEmail, password: suPassword, originCity, dateOfBirth: dob || undefined }),
      });

      // Read as text first — an empty/broken body (dev-server hiccup, a
      // server error that didn't produce JSON) would otherwise throw an
      // uncaught SyntaxError here and leave the button stuck on "loading".
      const raw = await res.text();
      let data: any = {};
      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          throw new Error("Server sent back an invalid response. Please try again.");
        }
      }

      if (!res.ok) {
        setError(data.error || `Something went wrong (status ${res.status}).`);
        return;
      }

      await signIn("credentials", { email: suEmail, password: suPassword, redirect: false });
      // Same reasoning as sign-in above: confirm via a real session check
      // rather than trusting signIn()'s returned shape.
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await safeJson(sessionRes);
      if (sessionData?.user) {
        router.push(destination ? `/dashboard?destination=${destination}` : "/dashboard");
      } else {
        setError("Account created — please sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md mx-4 surface rounded-2xl p-8 shadow-xl" style={{ border: "1px solid var(--line)" }}>
      <div className="flex gap-1 p-1 rounded-full mb-6" style={{ background: "var(--surface-2)" }}>
        <button
          onClick={() => { setMode("signin"); setError(null); }}
          className="flex-1 py-2 rounded-full text-sm font-medium transition"
          style={{ background: mode === "signin" ? "var(--navy)" : "transparent", color: mode === "signin" ? "white" : "var(--ink-muted)" }}
        >
          Sign in
        </button>
        <button
          onClick={() => { setMode("signup"); setError(null); }}
          className="flex-1 py-2 rounded-full text-sm font-medium transition"
          style={{ background: mode === "signup" ? "var(--navy)" : "transparent", color: mode === "signup" ? "white" : "var(--ink-muted)" }}
        >
          Sign up
        </button>
      </div>

      {mode === "signin" ? (
        <form onSubmit={handleSignIn} className="space-y-4">
          <h1 className="font-display text-2xl mb-2" style={{ color: "var(--navy)" }}>Welcome back</h1>
          <Field label="Email">
            <input required type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Password">
            <PasswordInput required value={password} onChange={setPassword} />
          </Field>
          <div className="flex justify-end -mt-2">
            <a href="/forgot-password" className="text-sm hover:underline" style={{ color: "var(--teal)" }}>Forgot your password?</a>
          </div>
          {error && (
            <p className="text-sm" style={{ color: "var(--danger)" }}>
              {error}{" "}
              {error.includes("create an account") && (
                <button type="button" onClick={() => setMode("signup")} className="underline font-medium" style={{ color: "var(--danger)" }}>
                  Sign up now →
                </button>
              )}
            </p>
          )}
          <button disabled={loading} className="w-full py-3 rounded-full btn-primary font-medium">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <p className="text-sm text-center" style={{ color: "var(--ink-muted)" }}>
            New here?{" "}
            <button type="button" onClick={() => setMode("signup")} className="underline" style={{ color: "var(--teal)" }}>
              Create new account
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="space-y-4">
          <h1 className="font-display text-2xl mb-2" style={{ color: "var(--navy)" }}>Create your account</h1>
          {destination && (
            <p className="text-sm" style={{ color: "var(--teal)" }}>
              We'll take you straight to planning your {destination.replace(/-/g, " ")} trip.
            </p>
          )}
          <Field label="Username">
            <input required className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. aisha_k" />
          </Field>
          <Field label="Email">
            <input required type="email" className="input" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} />
          </Field>
          <Field label="Password (8+ characters)">
            <PasswordInput required minLength={8} value={suPassword} onChange={setSuPassword} />
          </Field>
          <Field label="Confirm password">
            <PasswordInput required minLength={8} value={confirmPassword} onChange={setConfirmPassword} />
          </Field>
          <Field label="Origin city (optional)">
            <input className="input" placeholder="e.g. Hyderabad" value={originCity} onChange={(e) => setOriginCity(e.target.value)} />
          </Field>
          <Field label="Date of birth (optional)">
            <input type="date" className="input" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Field>
          {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
          <button disabled={loading} className="w-full py-3 rounded-full btn-primary font-medium">
            {loading ? "Creating account…" : "Create account"}
          </button>
          <p className="text-sm text-center" style={{ color: "var(--ink-muted)" }}>
            Already have an account?{" "}
            <button type="button" onClick={() => setMode("signin")} className="underline" style={{ color: "var(--teal)" }}>
              Sign in
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm" style={{ color: "var(--ink-muted)" }}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function AuthForm(props: { initialMode?: "signin" | "signup"; destination?: string | null }) {
  return (
    <Suspense fallback={null}>
      <AuthFormInner {...props} />
    </Suspense>
  );
}
