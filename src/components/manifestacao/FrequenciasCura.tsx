import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Frequency {
  hz: number;
  title: string;
  description: string;
  color: string;
}

const frequencies: Frequency[] = [
  { hz: 528, title: "Amor e Cura", description: "Relaxamento e redução do cortisol", color: "from-green-500/20 to-emerald-500/20" },
  { hz: 432, title: "Alinhamento Universal", description: "Meditação profunda e aterramento", color: "from-blue-500/20 to-indigo-500/20" },
  { hz: 396, title: "Limpeza Energética", description: "Libera medo, culpa e emoções negativas", color: "from-purple-500/20 to-violet-500/20" },
];

// Breathing states
type BreathPhase = "idle" | "inhale" | "hold" | "exhale";

export default function FrequenciasCura() {
  // Breathing exercise
  const [breathPhase, setBreathPhase] = useState<BreathPhase>("idle");
  const [breathCount, setBreathCount] = useState(0);
  const breathTimer = useRef<NodeJS.Timeout | null>(null);

  // Frequency player (uses Web Audio API for pure tones)
  const [playingHz, setPlayingHz] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const startBreathing = () => {
    setBreathPhase("inhale");
    setBreathCount(0);
    runBreathCycle(0);
  };

  const runBreathCycle = (cycle: number) => {
    if (cycle >= 5) {
      setBreathPhase("idle");
      return;
    }

    setBreathPhase("inhale");
    breathTimer.current = setTimeout(() => {
      setBreathPhase("hold");
      breathTimer.current = setTimeout(() => {
        setBreathPhase("exhale");
        breathTimer.current = setTimeout(() => {
          setBreathCount(cycle + 1);
          runBreathCycle(cycle + 1);
        }, 8000); // exhale 8s
      }, 4000); // hold 4s
    }, 4000); // inhale 4s
  };

  const stopBreathing = () => {
    if (breathTimer.current) clearTimeout(breathTimer.current);
    setBreathPhase("idle");
  };

  const toggleFrequency = (hz: number) => {
    if (playingHz === hz) {
      stopFrequency();
      return;
    }
    stopFrequency();

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = hz;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    audioCtxRef.current = ctx;
    oscRef.current = osc;
    gainRef.current = gain;
    setPlayingHz(hz);
  };

  const stopFrequency = () => {
    try {
      oscRef.current?.stop();
      audioCtxRef.current?.close();
    } catch {}
    setPlayingHz(null);
    oscRef.current = null;
    audioCtxRef.current = null;
    gainRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopFrequency();
      stopBreathing();
    };
  }, []);

  const breathLabel = {
    idle: "Pronta para começar?",
    inhale: "Inspire... 4s",
    hold: "Segure... 4s",
    exhale: "Solte... 8s",
  }[breathPhase];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
          <Music className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Frequências de Cura</h3>
        <p className="text-xs font-body text-muted-foreground">Sons que harmonizam corpo, mente e espírito</p>
      </div>

      {/* Breathing Exercise */}
      <div className="glass-gold rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-gold" />
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">Respiração Consciente</span>
        </div>
        <p className="text-[10px] font-body text-muted-foreground text-center">4 segundos inspira • 4 segura • 8 solta</p>

        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            "h-24 w-24 rounded-full flex items-center justify-center text-xs font-body font-semibold transition-all duration-1000",
            breathPhase === "idle" && "bg-muted/30 text-muted-foreground scale-100",
            breathPhase === "inhale" && "bg-gold/20 text-gold scale-125",
            breathPhase === "hold" && "bg-gold/30 text-gold scale-125",
            breathPhase === "exhale" && "bg-gold/10 text-gold scale-90",
          )}>
            {breathLabel}
          </div>

          {breathPhase === "idle" ? (
            <Button
              onClick={startBreathing}
              variant="outline"
              size="sm"
              className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
            >
              <Wind className="h-3.5 w-3.5 mr-1.5" />
              Começar a respirar
            </Button>
          ) : (
            <div className="text-center space-y-1">
              <p className="text-[10px] font-body text-muted-foreground">Ciclo {breathCount + 1}/5</p>
              <button onClick={stopBreathing} className="text-[10px] font-body text-muted-foreground underline">Parar</button>
            </div>
          )}
        </div>
      </div>

      {/* Frequencies */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-gold" />
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">Frequências de Cura</span>
        </div>

        {frequencies.map((freq, i) => {
          const isPlaying = playingHz === freq.hz;
          return (
            <div
              key={freq.hz}
              className="glass rounded-xl p-4 flex items-center gap-3 animate-stagger"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <button
                onClick={() => toggleFrequency(freq.hz)}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                  isPlaying ? "bg-gold text-background" : "bg-muted text-muted-foreground hover:bg-gold/20"
                )}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-semibold text-gold">{freq.hz} Hz - {freq.title}</p>
                <p className="text-[10px] font-body text-muted-foreground">{freq.description}</p>
              </div>
              {isPlaying && (
                <div className="flex gap-0.5 items-end h-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-1 bg-gold rounded-full animate-pulse" style={{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
