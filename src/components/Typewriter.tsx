"use client";
import { useEffect, useState } from "react";

const LINES = [
  "India, on a real budget.",
  "Leh to Kerala, planned honestly.",
  "Day-by-day trips, real costs.",
];

export default function Typewriter() {
  const [text, setText] = useState("");
  const [line, setLine] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = LINES[line];
    const speed = deleting ? 40 : 80;
    const t = setTimeout(() => {
      if (!deleting && text === full) {
        setTimeout(() => setDeleting(true), 1600);
        return;
      }
      if (deleting && text === "") {
        setDeleting(false);
        setLine((line + 1) % LINES.length);
        return;
      }
      setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [text, deleting, line]);

  return (
    <p className="relative z-10 font-mono text-xs sm:text-sm uppercase tracking-widest text-white/80 caret min-h-[1.25rem]">
      {text}
    </p>
  );
}
