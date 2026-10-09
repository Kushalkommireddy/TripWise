"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Nav() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b sticky top-0 z-40 backdrop-blur-md" style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--paper) 82%, transparent)" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <Link href="/" className="font-display text-xl tracking-tight shrink-0" style={{ color: "var(--navy)" }}>
          TripWise
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <nav className="flex items-center gap-3 sm:gap-5 text-sm">
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="hover:underline hidden sm:inline">My trips</Link>
                <span className="hidden md:inline font-mono text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-2)", color: "var(--ink-muted)" }}>
                  {session?.user?.name}
                </span>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="hover:underline">
                  Sign out
                </button>
              </>
            ) : status === "loading" ? null : (
              <>
                <Link href="/login" className="hover:underline hidden sm:inline">Sign in</Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-full btn-primary text-sm whitespace-nowrap"
                >
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
