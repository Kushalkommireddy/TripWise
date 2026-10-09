"use client";
import { useTheme } from "@/app/theme-provider";

const OPTIONS: { key: "light" | "dark" | "travel"; label: string; icon: string }[] = [
  { key: "light", label: "Light", icon: "☀" },
  { key: "dark", label: "Dark", icon: "☾" },
  { key: "travel", label: "Travel", icon: "✈" },
];

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <div
      className="flex items-center rounded-full p-0.5 text-xs"
      style={{ border: "1px solid var(--line)" }}
    >
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => setMode(o.key)}
          aria-label={o.label}
          className="px-2.5 py-1 rounded-full transition"
          style={{
            background: mode === o.key ? "var(--navy)" : "transparent",
            color: mode === o.key ? "white" : "var(--ink-muted)",
          }}
        >
          <span className="sm:hidden">{o.icon}</span>
          <span className="hidden sm:inline">{o.icon} {o.label}</span>
        </button>
      ))}
    </div>
  );
}
