// Custom-illustrated scenic backgrounds — layered gradients + SVG silhouettes.
// Not stock photography (avoids licensing/reliability issues with hotlinked
// images), but designed to read as rich, atmospheric scenes per landscape type.

type SceneType = "mountains" | "temple" | "valley" | "backwaters" | "beach";

const GRADIENTS: Record<SceneType, string> = {
  mountains: "linear-gradient(180deg, #2b3a55 0%, #4a5f7a 40%, #8a9bb0 70%, #cfd9e3 100%)",
  temple: "linear-gradient(180deg, #3a2a1a 0%, #6b4423 35%, #c97b3d 65%, #f2c078 100%)",
  valley: "linear-gradient(180deg, #1e3a3a 0%, #2f5c52 40%, #6b9b7a 70%, #d4e4c8 100%)",
  backwaters: "linear-gradient(180deg, #0f3d3d 0%, #1a5c5c 40%, #4a9b8f 70%, #cfe8d8 100%)",
  beach: "linear-gradient(180deg, #1a3a5c 0%, #2f6a9b 35%, #4fa8c9 65%, #f2e0b8 100%)",
};

export function SceneBackground({ scene, className = "" }: { scene: SceneType; className?: string }) {
  const bg = GRADIENTS[scene] || GRADIENTS.mountains; // defensive fallback, never render blank
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ background: bg }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {scene === "mountains" && (
          <>
            <polygon points="0,500 0,320 90,180 160,300 230,140 320,320 400,260 400,500" fill="rgba(20,20,35,0.55)" />
            <polygon points="0,500 0,400 120,260 210,380 300,240 400,380 400,500" fill="rgba(10,10,20,0.7)" />
            <circle cx="320" cy="90" r="34" fill="rgba(255,240,210,0.85)" />
          </>
        )}
        {scene === "temple" && (
          <>
            <rect x="0" y="380" width="400" height="120" fill="rgba(20,15,10,0.55)" />
            {[60, 140, 220, 300].map((x, i) => (
              <g key={i}>
                <rect x={x} y={260 + (i % 2) * 20} width="46" height={160 - (i % 2) * 20} fill="rgba(15,10,8,0.75)" />
                <polygon points={`${x - 8},${260 + (i % 2) * 20} ${x + 23},${210 + (i % 2) * 20} ${x + 54},${260 + (i % 2) * 20}`} fill="rgba(15,10,8,0.85)" />
              </g>
            ))}
            <circle cx="330" cy="80" r="28" fill="rgba(255,220,180,0.8)" />
          </>
        )}
        {scene === "valley" && (
          <>
            <polygon points="0,500 0,300 100,200 200,290 300,190 400,280 400,500" fill="rgba(10,30,25,0.55)" />
            <polygon points="0,500 0,420 150,340 400,420 400,500" fill="rgba(6,20,16,0.7)" />
            <circle cx="90" cy="100" r="26" fill="rgba(255,245,220,0.75)" />
          </>
        )}
        {scene === "backwaters" && (
          <>
            <rect x="0" y="380" width="400" height="120" fill="rgba(6,30,28,0.5)" />
            <ellipse cx="200" cy="400" rx="380" ry="18" fill="rgba(255,255,255,0.12)" />
            <ellipse cx="120" cy="430" rx="380" ry="14" fill="rgba(255,255,255,0.08)" />
            <path d="M60,340 Q70,300 60,260" stroke="rgba(20,50,40,0.6)" strokeWidth="6" fill="none" />
            <ellipse cx="60" cy="250" rx="30" ry="14" fill="rgba(20,60,45,0.65)" />
            <path d="M320,360 Q330,315 320,270" stroke="rgba(20,50,40,0.6)" strokeWidth="6" fill="none" />
            <ellipse cx="320" cy="260" rx="26" ry="12" fill="rgba(20,60,45,0.65)" />
          </>
        )}
        {scene === "beach" && (
          <>
            <rect x="0" y="400" width="400" height="100" fill="rgba(240,220,170,0.4)" />
            <ellipse cx="200" cy="400" rx="400" ry="16" fill="rgba(255,255,255,0.35)" />
            <path d="M50,330 Q60,270 45,210" stroke="rgba(20,40,20,0.55)" strokeWidth="8" fill="none" />
            <ellipse cx="45" cy="200" rx="36" ry="16" fill="rgba(25,60,30,0.6)" />
            <rect x="300" y="300" width="18" height="60" fill="rgba(255,255,255,0.25)" />
            <polygon points="309,300 260,310 309,320" fill="rgba(255,255,255,0.3)" />
          </>
        )}
      </svg>
    </div>
  );
}

export const DESTINATION_SCENES: Record<string, SceneType> = {
  "leh-ladakh": "mountains",
  "varanasi": "temple",
  "kashmir": "valley",
  "kerala-backwaters": "backwaters",
  "goa": "beach",
};
