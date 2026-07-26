import { useState, useEffect, useCallback } from "react";
import brandLogo from "@/assets/gloow-up-club-logo.png";

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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
      style={{ background: "linear-gradient(180deg, #FAF7F0, #F3EDE0 50%, #FAF7F0)" }}
    >
      {/* Gold radial glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(43 72% 52% / 0.18) 0%, transparent 70%)",
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
            backgroundColor: `hsl(43 72% ${45 + Math.random() * 15}%)`,
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
        {/* Logo with glow ring */}
        <div className="relative">
          <div
            className="absolute inset-0 -m-6 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(43 72% 52% / 0.3) 0%, transparent 70%)",
              animation: "splash-ring 2s ease-in-out infinite",
            }}
          />
          <img
            src={brandLogo}
            alt="Gloow Up Club"
            className="relative h-32 w-32 object-contain rounded-2xl"
            style={{
              boxShadow: "0 15px 50px -10px rgba(201,148,41,0.4)",
            }}
          />
        </div>

        {/* Loading bar */}
        <div className="w-32 h-[2px] rounded-full overflow-hidden mt-3" style={{ background: "rgba(42,35,23,0.10)" }}>
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
        style={{ color: "hsl(43 40% 40%)" }}
      >
        SUA TRANSFORMAÇÃO COMEÇA AQUI
      </p>
    </div>
  );
}
