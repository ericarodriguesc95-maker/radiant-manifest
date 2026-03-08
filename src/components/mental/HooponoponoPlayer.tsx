import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const mantras = [
  { phrase: "Sinto muito", duration: 4000 },
  { phrase: "Me perdoe", duration: 4000 },
  { phrase: "Eu te amo", duration: 4000 },
  { phrase: "Sou grata", duration: 4000 },
];

export default function HooponoponoPlayer({ onBack }: { onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMantra, setCurrentMantra] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mantraIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);

      mantraIntervalRef.current = setInterval(() => {
        setCurrentMantra(prev => {
          const next = (prev + 1) % mantras.length;
          if (next === 0) setCycles(c => c + 1);
          return next;
        });
      }, 4000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mantraIntervalRef.current) clearInterval(mantraIntervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (mantraIntervalRef.current) clearInterval(mantraIntervalRef.current);
    };
  }, [isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentMantra(0);
    setCycles(0);
    setElapsed(0);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Ho'oponopono <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Prática de limpeza e reconciliação interior</p>
      </header>

      <div className="px-5 pb-6 flex flex-col items-center">
        {/* Circular display */}
        <div className="relative w-64 h-64 flex items-center justify-center my-8">
          {/* Outer ring */}
          <div className={cn(
            "absolute inset-0 rounded-full border-2 transition-all duration-1000",
            isPlaying ? "border-gold/60 shadow-gold" : "border-border"
          )} />

          {/* Animated rings */}
          {isPlaying && (
            <>
              <div className="absolute inset-2 rounded-full border border-gold/20 animate-pulse" />
              <div className="absolute inset-6 rounded-full border border-gold/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </>
          )}

          {/* Center content */}
          <div className="text-center z-10">
            <Heart className={cn(
              "h-6 w-6 mx-auto mb-3 transition-all duration-500",
              isPlaying ? "text-gold animate-pulse" : "text-muted-foreground"
            )} />
            <p className={cn(
              "text-2xl font-display font-bold transition-all duration-500",
              isPlaying ? "text-gold" : "text-foreground"
            )}>
              {mantras[currentMantra].phrase}
            </p>
            <p className="text-xs text-muted-foreground font-body mt-2">
              {formatTime(elapsed)}
            </p>
          </div>
        </div>

        {/* Mantra indicators */}
        <div className="flex gap-3 mb-8">
          {mantras.map((m, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-2 rounded-full transition-all duration-300",
                i === currentMantra ? "bg-gold scale-125" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button
            onClick={reset}
            className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card"
          >
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
            )}
          </button>
          <div className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card">
            <span className="text-xs font-body font-semibold text-muted-foreground">{cycles}x</span>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-card rounded-2xl border border-border p-4 w-full">
          <h3 className="text-sm font-display font-semibold mb-2">Como praticar</h3>
          <ul className="space-y-2">
            {[
              "Respire fundo e feche os olhos",
              "Repita cada mantra mentalmente com sentimento",
              "Sinto muito → reconheça a dor",
              "Me perdoe → peça perdão sincero",
              "Eu te amo → envie amor incondicional",
              "Sou grata → agradeça pela cura",
            ].map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground font-body flex items-start gap-2">
                <span className="text-gold mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
