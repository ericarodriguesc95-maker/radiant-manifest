import { useState, useEffect, useCallback } from "react";
import FourPointStar from "./FourPointStar";

const PARTICLE_COUNT = 28;
const SPLASH_DURATION = 2800;

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 2,
    duration: Math.random() * 3 + 2,
    opacity: Math.random() * 0.6 + 0.2,
    drift: (Math.random() - 0.5) * 40,
  }));
}

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [particles] = useState(generateParticles);

  const finish = useCallback(() => {
    setPhase("exit");
    setTimeout(onFinish, 600);
  }, [onFinish]);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("hold"), 400);
    const t2 = setTimeout(finish, SPLASH_DURATION);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [finish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-500 ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(180deg, hsl(0 0% 3%), hsl(0 0% 7%) 50%, hsl(0 0% 3%))" }}
    >
      {/* Gold radial glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(43 72% 52% / 0.12) 0%, transparent 70%)",
          animation: "splash-pulse 2.5s ease-in-out infinite",
        }}
      />

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: `hsl(43 72% ${50 + Math.random() * 20}%)`,
            opacity: 0,
            animation: `splash-particle-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            ["--drift" as string]: `${p.drift}px`,
          }}
        />
      ))}

      {/* Logo container */}
      <div
        className={`relative flex flex-col items-center gap-5 transition-all duration-700 ${
          phase === "enter" ? "scale-90 opacity-0 translate-y-4" : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        {/* Star with glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 -m-4 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(43 72% 52% / 0.25) 0%, transparent 70%)",
              animation: "splash-ring 2s ease-in-out infinite",
            }}
          />
          <FourPointStar
            size={56}
            animate="spin"
            className="text-gold drop-shadow-[0_0_20px_hsl(43_72%_52%_/_0.6)]"
            fill="hsl(43 72% 52%)"
          />
        </div>

        {/* Brand text */}
        <div className="text-center">
          <h1
            className="font-display text-3xl tracking-wider"
            style={{
              background: "linear-gradient(135deg, hsl(43 55% 65%), hsl(43 72% 52%), hsl(38 60% 42%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "splash-shimmer 3s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          >
            GLOOW UP
          </h1>
          <p
            className="font-body text-sm tracking-[0.4em] mt-1"
            style={{ color: "hsl(43 30% 55%)" }}
          >
            CLUB
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-32 h-[2px] rounded-full overflow-hidden mt-3" style={{ background: "hsl(0 0% 15%)" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(43 72% 52%), hsl(43 55% 65%))",
              animation: `splash-load ${SPLASH_DURATION - 600}ms ease-out forwards`,
            }}
          />
        </div>
      </div>

      {/* Bottom tagline */}
      <p
        className={`absolute bottom-12 font-body text-xs tracking-widest transition-opacity duration-700 ${
          phase === "enter" ? "opacity-0" : "opacity-100"
        }`}
        style={{ color: "hsl(43 20% 40%)" }}
      >
        SUA TRANSFORMAÇÃO COMEÇA AQUI
      </p>
    </div>
  );
}
