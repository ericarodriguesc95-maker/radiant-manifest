import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Lock, Flame, Sparkles, RefreshCw, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPillar, PHASES } from "@/data/glowMoveData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Mission {
  missao: string;
  frase_ancora: string;
  tempo_estimado: string;
}

interface Progress {
  current_phase: number;
  missions_in_phase: number;
  glow_points: number;
  streak: number;
  last_completed_date: string | null;
}

export default function GlowMovePillarPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pillar = pillarId ? getPillar(pillarId) : null;

  const [progress, setProgress] = useState<Progress>({
    current_phase: 1,
    missions_in_phase: 0,
    glow_points: 0,
    streak: 0,
    last_completed_date: null,
  });
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [completing, setCompleting] = useState(false);
  const [particles, setParticles] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!user || !pillar) return;
    (async () => {
      const { data } = await supabase
        .from("glow_move_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("pillar_id", pillar.id)
        .maybeSingle();
      if (data) {
        setProgress({
          current_phase: data.current_phase,
          missions_in_phase: data.missions_in_phase,
          glow_points: data.glow_points,
          streak: data.streak,
          last_completed_date: data.last_completed_date,
        });
        setCompletedToday(data.last_completed_date === today);
      }
      await loadMission(data?.current_phase ?? 1);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pillarId]);

  const loadMission = async (phase: number) => {
    setLoading(true);
    setMission(null);
    try {
      const { data, error } = await supabase.functions.invoke("glow-move-mission", {
        body: { pillar_id: pillar!.id, phase },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMission(data);
    } catch (e: any) {
      toast.error(e.message || "Não foi possível gerar a missão");
    } finally {
      setLoading(false);
    }
  };

  const completeMission = async () => {
    if (!user || !pillar || !mission || completedToday) return;
    setCompleting(true);
    try {
      const newMissionsCount = progress.missions_in_phase + 1;
      const phaseComplete = newMissionsCount >= 7;
      const newPhase = phaseComplete && progress.current_phase < 4 ? progress.current_phase + 1 : progress.current_phase;
      const missionsInNewPhase = phaseComplete && progress.current_phase < 4 ? 0 : newMissionsCount;

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const continuesStreak = progress.last_completed_date === yesterday || progress.last_completed_date === today;
      const newStreak = continuesStreak ? progress.streak + (progress.last_completed_date === today ? 0 : 1) : 1;

      await supabase.from("glow_move_missions").insert({
        user_id: user.id,
        pillar_id: pillar.id,
        phase: progress.current_phase,
        mission_text: mission.missao,
        frase_ancora: mission.frase_ancora,
        tempo_estimado: mission.tempo_estimado,
        reflection: reflection || null,
      });

      const next = {
        user_id: user.id,
        pillar_id: pillar.id,
        current_phase: newPhase,
        missions_in_phase: missionsInNewPhase,
        glow_points: progress.glow_points + 10,
        streak: newStreak,
        last_completed_date: today,
        unlocked: true,
      };

      await supabase
        .from("glow_move_progress")
        .upsert(next, { onConflict: "user_id,pillar_id" });

      setProgress({
        current_phase: newPhase,
        missions_in_phase: missionsInNewPhase,
        glow_points: next.glow_points,
        streak: newStreak,
        last_completed_date: today,
      });
      setCompletedToday(true);
      setParticles(true);
      setTimeout(() => setParticles(false), 1600);

      if (phaseComplete && progress.current_phase < 4) {
        toast.success(`Fase ${newPhase} desbloqueada — ${PHASES[newPhase - 1].nome}`);
        setReflection("");
        loadMission(newPhase);
      } else {
        toast.success("Missão concluída · +10 Glow");
      }
    } catch (e: any) {
      toast.error("Erro ao concluir missão");
      console.error(e);
    } finally {
      setCompleting(false);
    }
  };

  if (!pillar) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Pilar não encontrado</p>
      </div>
    );
  }

  const Icon = pillar.icon;
  const currentPhaseObj = PHASES[progress.current_phase - 1];

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Particles */}
      {particles && (
        <div className="pointer-events-none fixed inset-0 z-50">
          {Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-gold animate-[fall_1.5s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-5%",
                animationDelay: `${Math.random() * 0.4}s`,
                boxShadow: "0 0 8px hsl(var(--gold))",
              }}
            />
          ))}
          <style>{`@keyframes fall { to { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`}</style>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-gold/10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate("/glow-move")}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gold/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gold" />
          </button>
          <div className="flex-1">
            <h1 className="font-display text-lg leading-none">{pillar.nome}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{pillar.subtitulo}</p>
          </div>
          {progress.streak >= 3 && (
            <div className="flex items-center gap-1 text-xs text-gold">
              <Flame className="h-4 w-4" /> {progress.streak}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Âncora */}
        <section className="text-center px-4">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gold/10 border border-gold/20 items-center justify-center mb-3">
            <Icon className="h-7 w-7 text-gold" />
          </div>
          <p className="font-display italic text-xl text-foreground/90 max-w-md mx-auto leading-snug">
            “{pillar.ancora}”
          </p>
        </section>

        {/* Fase atual */}
        <section className="relative overflow-hidden rounded-3xl p-6 border border-gold/30 bg-gradient-to-br from-amber-950/30 via-background to-purple-950/20 shadow-[0_0_40px_-15px_hsl(var(--gold)/0.4)]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold/80">Fase {progress.current_phase}</p>
              <h3 className="font-display text-2xl">{currentPhaseObj.nome}</h3>
            </div>
            <button
              onClick={() => loadMission(progress.current_phase)}
              disabled={loading || completedToday}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gold/10 disabled:opacity-30 transition-colors"
              title="Nova missão"
            >
              <RefreshCw className={cn("h-4 w-4 text-gold", loading && "animate-spin")} />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            {progress.missions_in_phase} de 7 missões concluídas nesta fase
          </p>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gold/10 rounded w-3/4" />
              <div className="h-4 bg-gold/10 rounded w-1/2" />
            </div>
          ) : mission ? (
            <>
              <p className="font-display text-lg leading-snug text-foreground">{mission.missao}</p>
              <p className="text-sm italic text-gold/80 mt-2">{mission.frase_ancora}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                ⏱ {mission.tempo_estimado}
              </p>

              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                disabled={completedToday}
                placeholder="Reflexão (opcional)"
                className="w-full mt-5 rounded-xl bg-background/50 border border-gold/15 px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/40 resize-none disabled:opacity-60"
                rows={2}
              />

              <button
                onClick={completeMission}
                disabled={completing || completedToday}
                className={cn(
                  "mt-4 w-full h-12 rounded-xl font-body font-semibold flex items-center justify-center gap-2 transition-all",
                  completedToday
                    ? "bg-gold/10 text-gold/60 border border-gold/20 cursor-not-allowed"
                    : "bg-gold text-black hover:brightness-110 active:scale-[0.98] shadow-[0_8px_30px_-8px_hsl(var(--gold)/0.6)]"
                )}
              >
                {completedToday ? (
                  <>
                    <Check className="h-5 w-5" /> Concluída hoje
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Missão concluída
                  </>
                )}
              </button>
            </>
          ) : null}
        </section>

        {/* Trilha */}
        <section>
          <h3 className="font-display text-xl mb-4 px-1">Trilha de fases</h3>
          <ol className="relative border-l border-gold/15 ml-3 space-y-5">
            {PHASES.map((ph) => {
              const done = ph.n < progress.current_phase;
              const current = ph.n === progress.current_phase;
              const locked = ph.n > progress.current_phase;
              return (
                <li key={ph.n} className="pl-6 relative">
                  <span
                    className={cn(
                      "absolute -left-[11px] top-0 h-5 w-5 rounded-full flex items-center justify-center border-2",
                      done && "bg-gold border-gold",
                      current && "border-gold bg-gold/20 animate-pulse",
                      locked && "border-gold/15 bg-background"
                    )}
                  >
                    {done && <Check className="h-3 w-3 text-black" />}
                    {locked && <Lock className="h-2.5 w-2.5 text-muted-foreground/50" />}
                  </span>
                  <p className={cn(
                    "font-display text-base",
                    done && "text-foreground",
                    current && "text-gold",
                    locked && "text-muted-foreground/50"
                  )}>
                    Fase {ph.n} · {ph.nome}
                  </p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Insights */}
        <section className="rounded-2xl glass border border-gold/10 overflow-hidden">
          <button
            onClick={() => setInsightsOpen((v) => !v)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gold/5 transition-colors"
          >
            <span className="font-display text-base text-foreground">Insight do pilar</span>
            <ChevronDown className={cn("h-4 w-4 text-gold transition-transform", insightsOpen && "rotate-180")} />
          </button>
          {insightsOpen && (
            <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-gold/10 pt-3">
              {pillar.conceito}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
