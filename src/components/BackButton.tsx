"use client";
import { useRouter } from "next/navigation";

export default function BackButton({ fallbackHref = "/dashboard", label = "Back" }: { fallbackHref?: string; label?: string }) {
  const router = useRouter();

  function goBack() {
    // Prefer real browser back (preserves scroll position, feels native),
    // but fall back to a known safe route if there's no history to go back
    // to (e.g. arrived here via a direct link or after a fresh sign-in).
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      onClick={goBack}
      className="relative z-30 inline-flex items-center gap-1.5 text-sm mb-4 pointer-events-auto hover:underline underline-offset-4 transition"
      style={{ color: "var(--ink-muted)" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}
