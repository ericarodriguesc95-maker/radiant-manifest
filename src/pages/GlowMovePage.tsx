import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Lock, Flame, ChevronsRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PILLARS } from "@/data/glowMoveData";
import { cn } from "@/lib/utils";

interface ProgressRow {
  pillar_id: string;
  current_phase: number;
  missions_in_phase: number;
  glow_points: number;
  streak: number;
  unlocked: boolean;
}

export default function GlowMovePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("glow_move_progress")
        .select("*")
        .eq("user_id", user.id);
      const map: Record<string, ProgressRow> = {};
      (data ?? []).forEach((r: any) => (map[r.pillar_id] = r));
      setProgress(map);
      setLoading(false);
    })();
  }, [user]);

  const totalPoints = Object.values(progress).reduce((s, p) => s + (p.glow_points || 0), 0);
  const totalCompleted = Object.values(progress).reduce(
    (s, p) => s + ((p.current_phase - 1) * 7 + p.missions_in_phase),
    0
  );
  const totalMax = PILLARS.length * 4 * 7;
  const overallPct = Math.round((totalCompleted / totalMax) * 100);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-gold/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gold/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gold" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg leading-none text-foreground">Gloow Movimenta</h1>
            <p className="text-[10px] text-muted-foreground capitalize">{today}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Pontos Glow</p>
            <p className="font-display text-gold text-lg leading-none">{totalPoints}</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl p-6 border border-gold/20 bg-gradient-to-br from-purple-950/40 via-background to-amber-950/20">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,hsl(var(--gold))_0%,transparent_50%)]" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold/80 font-body">21 dias de transformação</p>
            <h2 className="font-display text-3xl text-foreground mt-1">
              7 movimentos.<br />Uma só mulher.
            </h2>
            <p className="text-sm text-muted-foreground mt-3 max-w-md">
              21 dias de transformação em movimento. Avance por fases dentro de 7 pilares de vida — cada missão é um passo real.
            </p>
            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                <span>Progresso geral</span>
                <span className="text-gold">{overallPct}%</span>
              </div>
              <div className="h-1 rounded-full bg-gold/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold via-gold to-amber-300 transition-all duration-700"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Mapa dos pilares */}
        <section>
          <h3 className="font-display text-xl text-foreground mb-3 px-1">Os 7 pilares</h3>
          <div className="grid grid-cols-2 gap-3">
            {PILLARS.map((p, idx) => {
              const prog = progress[p.id];
              const phase = prog?.current_phase ?? 1;
              const missionsInPhase = prog?.missions_in_phase ?? 0;
              const pillarPct = Math.round((((phase - 1) * 7 + missionsInPhase) / (4 * 7)) * 100);
              const isLast = idx === PILLARS.length - 1;
              const active = !!prog && prog.glow_points > 0;
              const locked = false; // todas desbloqueadas por padrão (escolha livre)
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/glow-move/${p.id}`)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl p-4 text-left transition-all active:scale-[0.97] group",
                    "glass border",
                    active
                      ? "border-gold/40 shadow-[0_0_30px_-12px_hsl(var(--gold)/0.5)]"
                      : "border-gold/10 hover:border-gold/25",
                    isLast && "col-span-2"
                  )}
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-3xl" />
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                      <Icon className="h-5 w-5 text-gold" />
                    </div>
                    {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />}
                    {(prog?.streak ?? 0) >= 3 && (
                      <div className="flex items-center gap-0.5 text-[10px] text-gold">
                        <Flame className="h-3 w-3" /> {prog!.streak}
                      </div>
                    )}
                  </div>
                  <h4 className="font-display text-lg text-foreground mt-3 leading-tight">{p.nome}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{p.subtitulo}</p>
                  <div className="mt-3">
                    <p className="text-[10px] text-gold/80 mb-1">Fase {phase} · {pillarPct}%</p>
                    <div className="h-0.5 rounded-full bg-gold/10 overflow-hidden">
                      <div className="h-full bg-gold transition-all duration-500" style={{ width: `${pillarPct}%` }} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {!loading && totalCompleted === 0 && (
          <p className="text-center text-xs text-muted-foreground italic px-6">
            Comece por qualquer pilar. A ordem é sua.
          </p>
        )}
      </main>
    </div>
  );
}
