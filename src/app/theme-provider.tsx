"use client";
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

type ThemeMode = "light" | "dark" | "travel";

// Travel mode is dark-based; only the accent hue shifts, cycling on every
// click anywhere in the app (not on a timer) per the requested behavior.
const TRAVEL_ACCENTS = [
  { accent: "#ff7a4d", accent2: "#f0b559" }, // sunset
  { accent: "#e0546b", accent2: "#f28aa0" }, // coral
  { accent: "#8a5cf6", accent2: "#c4a8ff" }, // violet
  { accent: "#3ddc97", accent2: "#8ff0c9" }, // emerald
  { accent: "#4c9be8", accent2: "#a8d4ff" }, // sky
  { accent: "#e0a53d", accent2: "#f5cf8a" }, // amber
];

const ThemeContext = createContext<{
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({ mode: "light", setMode: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);
  const accentIndex = useRef(0);

  useEffect(() => {
    const saved = (localStorage.getItem("tripwise-theme") as ThemeMode) || "light";
    setModeState(saved);
    setMounted(true);
  }, []);

  const applyAccent = useCallback((advance: boolean) => {
    if (advance) accentIndex.current = (accentIndex.current + 1) % TRAVEL_ACCENTS.length;
    const a = TRAVEL_ACCENTS[accentIndex.current];
    const root = document.documentElement;
    root.style.setProperty("--travel-accent", a.accent);
    root.style.setProperty("--travel-accent-2", a.accent2);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("tripwise-theme", mode);
    if (mode === "travel") applyAccent(false);
  }, [mode, mounted, applyAccent]);

  // Travel mode: cycle accent colour on every click anywhere in the app
  useEffect(() => {
    if (mode !== "travel") return;
    const onClick = () => applyAccent(true);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [mode, applyAccent]);

  const setMode = (m: ThemeMode) => setModeState(m);

  return <ThemeContext.Provider value={{ mode, setMode }}>{children}</ThemeContext.Provider>;
}
