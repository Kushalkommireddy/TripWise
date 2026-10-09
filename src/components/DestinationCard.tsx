"use client";
import Link from "next/link";
import { useReveal } from "@/lib/useReveal";
import { SceneBackground } from "./SceneBackground";

type SceneType = "mountains" | "temple" | "valley" | "backwaters" | "beach";

export default function DestinationCard({
  slug, name, tagline, budget, scene, delay,
}: {
  slug: string; name: string; tagline: string; budget: string; scene: SceneType; delay: number;
}) {
  const ref = useReveal<HTMLAnchorElement>();
  return (
    <Link
      href={`/register?destination=${slug}`}
      ref={ref}
      className="dest-card reveal block"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <SceneBackground scene={scene} />
      <div className="dest-card-scrim" />
      <div className="dest-card-label">
        <p className="font-display text-xl">{name}</p>
        <p className="text-sm opacity-85 mt-1">{tagline}</p>
        <p className="font-mono text-xs mt-2 opacity-75">{budget}</p>
      </div>
    </Link>
  );
}
