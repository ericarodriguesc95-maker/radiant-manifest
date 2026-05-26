import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Lightbulb,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  DAYS,
  DIMENSIONS,
  DIMENSION_ORDER,
  POINTS_PER_TASK,
  TASKS_PER_DAY,
  TOTAL_DAYS,
  WEEKS,
  type Dimension,
  getDay,
} from "@/data/glowMove21Data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Completion = {
  pillar_id: string; // dimension
  phase: number; // day
  completed_at: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function GlowMovePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [openTask, setOpenTask] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [particles, setParticles] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("glow_move_missions")
        .select("pillar_id, phase, completed_at")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: true });
      const list = (data ?? []) as Completion[];
      setCompletions(list);
      setStartDate(list[0]?.completed_at?.slice(0, 10) ?? null);
    })();
  }, [user]);

  const currentDay = useMemo(() => {
    if (!startDate) return 1;
    const diff = Math.floor(
      (new Date(todayISO()).getTime() - new Date(startDate).getTime()) / 86400000,
    );
    return Math.min(TOTAL_DAYS, Math.max(1, diff + 1));
  }, [startDate]);

  useEffect(() => {
    setActiveDay(currentDay);
  }, [currentDay]);

  const completedKey = (day: number, dim: Dimension) => `${day}-${dim}`;
  const completedSet = useMemo(
    () => new Set(completions.map((c) => `${c.phase}-${c.pillar_id}`)),
    [completions],
  );

  const totalCompleted = completions.length;
  const totalPoints = totalCompleted * POINTS_PER_TASK;
  const totalPossible = TOTAL_DAYS * TASKS_PER_DAY;
  const challengePct = Math.round((totalCompleted / totalPossible) * 100);

  // Dias 100% completos (5 tarefas)
  const perfectDays = useMemo(() => {
    const counts: Record<number, number> = {};
    completions.forEach((c) => {
      counts[c.phase] = (counts[c.phase] ?? 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, v]) => v >= TASKS_PER_DAY)
      .map(([k]) => Number(k));
  }, [completions]);

  // Streak: dias consecutivos com ao menos 1 tarefa
  const streak = useMemo(() => {
    const set = new Set(completions.map((c) => c.completed_at.slice(0, 10)));
    let s = 0;
    let d = new Date(todayISO());
    while (set.has(d.toISOString().slice(0, 10))) {
      s++;
      d = new Date(d.getTime() - 86400000);
    }
    return s;
  }, [completions]);

  // Semanas conquistadas
  const weeksDone = WEEKS.filter((w) => {
    const [a, b] = w.dias;
    for (let i = a; i <= b; i++) if (!perfectDays.includes(i)) return false;
    return true;
  });

  const completeTask = async (day: number, dim: Dimension, titulo: string) => {
    if (!user) {
      toast.error("Faça login para registrar suas missões");
      return;
    }
    if (day > currentDay) {
      toast.info("Esse dia ainda não foi liberado, rainha");
      return;
    }
    const key = completedKey(day, dim);
    if (completedSet.has(key)) return;
    setSaving(key);
    try {
      const { error } = await supabase.from("glow_move_missions").insert({
        user_id: user.id,
        pillar_id: dim,
        phase: day,
        mission_text: titulo,
      });
      if (error) throw error;
      const nowIso = new Date().toISOString();
      setCompletions((prev) => [
        ...prev,
        { pillar_id: dim, phase: day, completed_at: nowIso },
      ]);
      if (!startDate) setStartDate(nowIso.slice(0, 10));
      setParticles(true);
      setTimeout(() => setParticles(false), 1400);
      toast.success(`+${POINTS_PER_TASK} Glow · ${DIMENSIONS[dim].nome}`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao concluir tarefa");
    } finally {
      setSaving(null);
    }
  };

  const day = getDay(activeDay)!;
  const dayCompletedCount = DIMENSION_ORDER.filter(
    (d) => completedSet.has(completedKey(activeDay, d)),
  ).length;
  const dayPct = Math.round((dayCompletedCount / TASKS_PER_DAY) * 100);
  const todayLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const activeWeek = WEEKS.find((w) => activeDay >= w.dias[0] && activeDay <= w.dias[1])!;
  const isLocked = activeDay > currentDay;

  return (
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Particles */}
      {particles && (
        <div className="pointer-events-none fixed inset-0 z-50">
          {Array.from({ length: 22 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1.5 w-1.5 rounded-full bg-gold animate-[fall_1.3s_ease-out_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-5%",
                animationDelay: `${Math.random() * 0.3}s`,
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
            onClick={() => navigate("/")}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gold/10 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gold" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg leading-none text-foreground truncate">
              Gloow Movimenta
            </h1>
            <p className="text-[10px] text-muted-foreground capitalize truncate">
              {todayLabel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Glow</p>
            <p className="font-display text-gold text-base leading-none">{totalPoints}</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20">
              <Flame className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold">{streak}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Hero do desafio */}
        <section className="relative overflow-hidden rounded-3xl p-6 border border-gold/25 bg-gradient-to-br from-purple-950/50 via-background to-amber-950/30">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_20%_20%,hsl(var(--gold))_0%,transparent_55%)]" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80 font-body">
              Desafio de 21 dias · Corpo · Mente · Alma · Externo
            </p>
            <h2 className="font-display text-3xl text-foreground mt-1">
              {totalCompleted >= totalPossible
                ? "Transformação completa"
                : `Dia ${currentDay} `}
              {totalCompleted < totalPossible && (
                <span className="text-gold/60 text-2xl">/ {TOTAL_DAYS}</span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md leading-relaxed">
              5 tarefas por dia, uma para cada dimensão. Cada tarefa concluída = {POINTS_PER_TASK}{" "}
              Glow. Reconstrua-se em 21 dias inteiros, integrando corpo, mente, alma, externo e finanças.
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
                <span>
                  {totalCompleted} de {totalPossible} tarefas
                </span>
                <span className="text-gold">{challengePct}%</span>
              </div>
              <div className="h-2 rounded-full bg-gold/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all duration-700"
                  style={{ width: `${challengePct}%` }}
                />
              </div>

              {/* 21 marcadores */}
              <div
                className="mt-4 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${TOTAL_DAYS}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: TOTAL_DAYS }).map((_, i) => {
                  const d = i + 1;
                  const perfect = perfectDays.includes(d);
                  const some = !perfect && completions.some((c) => c.phase === d);
                  const isCurrent = d === currentDay;
                  const isActive = d === activeDay;
                  return (
                    <button
                      key={d}
                      onClick={() => setActiveDay(d)}
                      title={`Dia ${d}`}
                      className={cn(
                        "h-7 rounded-[4px] flex items-center justify-center text-[9px] font-semibold transition-all",
                        perfect
                          ? "bg-gold text-background shadow-[0_0_10px_-2px_hsl(var(--gold))]"
                          : some
                          ? "bg-gold/30 text-gold border border-gold/40"
                          : isCurrent
                          ? "bg-gold/15 text-gold border border-gold/60 animate-pulse"
                          : d <= currentDay
                          ? "bg-gold/5 text-gold/70 border border-gold/15"
                          : "bg-background/40 text-muted-foreground/40 border border-gold/5",
                        isActive && "ring-2 ring-gold/60 ring-offset-2 ring-offset-background",
                      )}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Navegador de dia */}
        <section className="flex items-center justify-between gap-3">
          <button
            disabled={activeDay <= 1}
            onClick={() => setActiveDay((d) => Math.max(1, d - 1))}
            className="h-10 w-10 rounded-full flex items-center justify-center border border-gold/15 hover:bg-gold/5 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-gold" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">
              Semana {activeWeek.n} · {activeWeek.nome}
            </p>
            <h3 className="font-display text-xl text-foreground leading-tight">
              Dia {day.dia} · {day.tema}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 italic">"{day.intencao}"</p>
          </div>
          <button
            disabled={activeDay >= TOTAL_DAYS}
            onClick={() => setActiveDay((d) => Math.min(TOTAL_DAYS, d + 1))}
            className="h-10 w-10 rounded-full flex items-center justify-center border border-gold/15 hover:bg-gold/5 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-gold" />
          </button>
        </section>

        {/* Progresso do dia */}
        <section className="rounded-2xl glass border border-gold/15 p-4">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="text-muted-foreground">
              Progresso do dia {activeDay}
            </span>
            <span className="text-gold">
              {dayCompletedCount}/{TASKS_PER_DAY} · {dayPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gold/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-amber-300 transition-all duration-500"
              style={{ width: `${dayPct}%` }}
            />
          </div>
          {dayPct === 100 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gold">
              <Trophy className="h-4 w-4" /> Dia completo conquistado
            </div>
          )}
        </section>

        {/* Tarefas */}
        {isLocked ? (
          <div className="rounded-3xl border border-gold/15 p-8 text-center bg-background/40">
            <Lock className="h-7 w-7 text-gold/50 mx-auto mb-3" />
            <p className="font-display text-lg text-foreground">Dia ainda bloqueado</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Cada dia é desbloqueado no tempo certo. Volte amanhã, rainha.
            </p>
          </div>
        ) : (
          <section className="space-y-3">
            {DIMENSION_ORDER.map((dimId) => {
              const meta = DIMENSIONS[dimId];
              const task = day.tarefas[dimId];
              const Icon = meta.icon;
              const key = completedKey(day.dia, dimId);
              const done = completedSet.has(key);
              const isOpen = openTask === `${day.dia}-${dimId}`;
              return (
                <article
                  key={dimId}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border transition-all",
                    done
                      ? "border-gold/40 bg-gold/5"
                      : "border-gold/15 bg-background/40 hover:border-gold/30",
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none",
                      meta.corBg,
                    )}
                  />
                  <div className="relative p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-11 w-11 rounded-xl border flex items-center justify-center shrink-0",
                          done
                            ? "bg-gold border-gold text-background"
                            : "bg-background/60 border-gold/20",
                        )}
                      >
                        {done ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className={cn("h-5 w-5", meta.cor)} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={cn(
                              "text-[9px] uppercase tracking-[0.2em] font-semibold",
                              meta.cor,
                            )}
                          >
                            {meta.nome}
                          </p>
                          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                            · {meta.subtitulo}
                          </span>
                          <span className="text-[9px] text-muted-foreground ml-auto">
                            ⏱ {task.tempo}
                          </span>
                        </div>
                        <h4 className="font-display text-base text-foreground leading-tight mt-1">
                          {task.titulo}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                          {task.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Toggle dicas */}
                    <button
                      onClick={() =>
                        setOpenTask(isOpen ? null : `${day.dia}-${dimId}`)
                      }
                      className="mt-3 flex items-center gap-1.5 text-[11px] text-gold/80 hover:text-gold transition-colors"
                    >
                      <Info className="h-3.5 w-3.5" />
                      {isOpen ? "Esconder explicação" : "Por que e como fazer"}
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 space-y-2.5 rounded-xl bg-background/60 border border-gold/10 p-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                            Por que importa
                          </p>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {task.porque}
                          </p>
                        </div>
                        <div className="flex gap-2 items-start pt-2 border-t border-gold/10">
                          <Lightbulb className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gold/70 mb-0.5">
                              Dica da mentora
                            </p>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {task.dica}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => completeTask(day.dia, dimId, task.titulo)}
                      disabled={done || saving === key}
                      className={cn(
                        "mt-3 w-full h-11 rounded-xl font-body font-semibold flex items-center justify-center gap-2 transition-all text-sm",
                        done
                          ? "bg-gold/15 text-gold/70 border border-gold/25 cursor-default"
                          : "bg-gold text-background hover:brightness-110 active:scale-[0.98] shadow-[0_8px_24px_-10px_hsl(var(--gold)/0.7)]",
                      )}
                    >
                      {done ? (
                        <>
                          <Check className="h-4 w-4" /> Concluída · +{POINTS_PER_TASK} Glow
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" /> Marcar como feita
                        </>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {/* Badges das semanas */}
        <section className="rounded-2xl border border-gold/15 bg-background/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-gold" />
            <h3 className="font-display text-base">Conquistas</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WEEKS.map((w) => {
              const conquered = weeksDone.some((d) => d.n === w.n);
              return (
                <div
                  key={w.n}
                  className={cn(
                    "rounded-xl p-3 border text-center transition-all",
                    conquered
                      ? "bg-gold/15 border-gold/40 text-foreground"
                      : "bg-background/60 border-gold/10 text-muted-foreground/60",
                  )}
                >
                  <p className="text-[9px] uppercase tracking-wider">Semana {w.n}</p>
                  <p
                    className={cn(
                      "font-display text-sm mt-0.5",
                      conquered ? "text-gold" : "text-muted-foreground/70",
                    )}
                  >
                    {w.nome}
                  </p>
                  <p className="text-[9px] mt-1 leading-tight">{w.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg border border-gold/10 p-2 flex items-center gap-2">
              <Flame className="h-4 w-4 text-gold" />
              <span className="text-muted-foreground">
                Streak: <span className="text-foreground font-semibold">{streak} dias</span>
              </span>
            </div>
            <div className="rounded-lg border border-gold/10 p-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-muted-foreground">
                Dias 100%:{" "}
                <span className="text-foreground font-semibold">
                  {perfectDays.length}/{TOTAL_DAYS}
                </span>
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
