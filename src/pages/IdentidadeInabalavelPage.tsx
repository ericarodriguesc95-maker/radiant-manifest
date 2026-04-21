import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Crown,
  Sparkles,
  RotateCcw,
  Quote,
  History,
  TrendingUp,
  Calendar,
} from "lucide-react";
import {
  QUIZ_QUESTIONS,
  PILAR_INFO,
  EXERCICIOS,
  calcularResultado,
  type Pilar,
  type ResultadoQuiz,
} from "@/data/identidadeInabalavelData";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const STORAGE_RESULT = "identidade-inabalavel:resultado";

interface LogRow {
  id: string;
  pilar: Pilar;
  exercicio_key: string;
  exercicio_titulo: string;
  completed_at: string;
  week_start: string;
}

// segunda-feira da semana atual em ISO (YYYY-MM-DD)
function getWeekStart(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 dom .. 6 sab
  const diff = (day + 6) % 7; // segunda
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function formatWeekLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  const end = new Date(d);
  end.setDate(end.getDate() + 6);
  const fmt = (x: Date) =>
    `${x.getDate().toString().padStart(2, "0")}/${(x.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  return `${fmt(d)} – ${fmt(end)}`;
}

export default function IdentidadeInabalavelPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"exercicios" | "historico" | "evolucao">(
    "exercicios",
  );

  // ---------- carregar resultado local + logs do banco ----------
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_RESULT);
    if (raw) {
      try {
        setResultado(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void carregarLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const carregarLogs = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("identidade_exercicios_log")
      .select("id, pilar, exercicio_key, exercicio_titulo, completed_at, week_start")
      .eq("user_id", user.id)
      .order("completed_at", { ascending: false });
    if (!error && data) setLogs(data as LogRow[]);
  };

  // ---------- semana atual: chaves dos exercícios feitos ----------
  const weekStart = getWeekStart();
  const feitosNaSemana = useMemo(
    () =>
      new Set(
        logs.filter((l) => l.week_start === weekStart).map((l) => l.exercicio_key),
      ),
    [logs, weekStart],
  );

  const totalExercicios = useMemo(
    () =>
      (["espirito", "alma", "corpo"] as Pilar[]).reduce(
        (acc, p) => acc + EXERCICIOS[p].length,
        0,
      ),
    [],
  );
  const progressoSemana = Math.round(
    (feitosNaSemana.size / totalExercicios) * 100,
  );

  const toggleExercicio = async (
    pilar: Pilar,
    key: string,
    titulo: string,
  ) => {
    if (!user) {
      toast.error("Faça login para registrar seu progresso");
      return;
    }
    setLoading(true);
    const ja = logs.find(
      (l) => l.exercicio_key === key && l.week_start === weekStart,
    );
    if (ja) {
      const { error } = await supabase
        .from("identidade_exercicios_log")
        .delete()
        .eq("id", ja.id);
      if (error) toast.error("Não foi possível desmarcar");
      else setLogs((p) => p.filter((l) => l.id !== ja.id));
    } else {
      const { data, error } = await supabase
        .from("identidade_exercicios_log")
        .insert({
          user_id: user.id,
          pilar,
          exercicio_key: key,
          exercicio_titulo: titulo,
          week_start: weekStart,
        })
        .select()
        .single();
      if (error) toast.error("Não foi possível salvar");
      else if (data) {
        setLogs((p) => [data as LogRow, ...p]);
        toast.success("Exercício concluído ✨");
      }
    }
    setLoading(false);
  };

  const salvarResultado = async (r: ResultadoQuiz) => {
    localStorage.setItem(STORAGE_RESULT, JSON.stringify(r));
    setResultado(r);
    if (user) {
      await supabase.from("identidade_diagnosticos").insert({
        user_id: user.id,
        espirito_score: r.espirito,
        alma_score: r.alma,
        corpo_score: r.corpo,
        pilar_foco: r.pilarFoco,
      });
    }
  };

  const responder = (val: number) => {
    const q = QUIZ_QUESTIONS[step];
    const novo = { ...respostas, [q.id]: val };
    setRespostas(novo);
    if (step + 1 < QUIZ_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      void salvarResultado(calcularResultado(novo));
    }
  };

  const refazerQuiz = () => {
    setResultado(null);
    setRespostas({});
    setStep(0);
  };

  // ---------- Evolução semanal (últimas 6 semanas) ----------
  const evolucaoSemanal = useMemo(() => {
    const map = new Map<string, { total: number; pilares: Record<Pilar, number> }>();
    logs.forEach((l) => {
      const cur =
        map.get(l.week_start) ?? {
          total: 0,
          pilares: { espirito: 0, alma: 0, corpo: 0 },
        };
      cur.total += 1;
      cur.pilares[l.pilar] += 1;
      map.set(l.week_start, cur);
    });
    // últimas 6 semanas (incluindo a atual, mesmo se vazia)
    const semanas: string[] = [];
    const base = new Date(weekStart + "T00:00:00");
    for (let i = 5; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(d.getDate() - i * 7);
      semanas.push(d.toISOString().slice(0, 10));
    }
    return semanas.map((s) => ({
      week: s,
      label: formatWeekLabel(s),
      ...(map.get(s) ?? {
        total: 0,
        pilares: { espirito: 0, alma: 0, corpo: 0 },
      }),
    }));
  }, [logs, weekStart]);

  const maxSemanal = Math.max(1, ...evolucaoSemanal.map((s) => s.total));

  // ═════════════════════════════════════════════════════
  // QUIZ
  // ═════════════════════════════════════════════════════
  if (!resultado) {
    const q = QUIZ_QUESTIONS[step];
    const pct = Math.round((step / QUIZ_QUESTIONS.length) * 100);
    return (
      <div className="min-h-screen bg-background">
        <Header onBack={() => navigate(-1)} />
        <div className="px-5 max-w-xl mx-auto pb-12 space-y-6">
          <div className="text-center space-y-2 pt-2">
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">
              Diagnóstico
            </p>
            <h2 className="text-2xl font-display font-bold text-foreground">
              Qual peso você está carregando?
            </h2>
            <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
              4 perguntas para descobrir qual pilar — Espírito, Alma ou Corpo —
              precisa do seu cuidado prioritário esta semana.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-body tracking-[0.2em] uppercase text-gold/70">
              <span>
                Pergunta {step + 1} de {QUIZ_QUESTIONS.length}
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold to-amber-300 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="glass-strong rounded-3xl border border-gold/20 p-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-lg shrink-0">
                {PILAR_INFO[q.pilar].icon}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/70">
                  Pilar: {PILAR_INFO[q.pilar].nome}
                </p>
                <p className="text-base font-display font-semibold text-foreground leading-snug">
                  {q.question}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-body text-muted-foreground px-1">
                <span>Discordo totalmente</span>
                <span>Concordo totalmente</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    onClick={() => responder(v)}
                    className="py-3 rounded-xl border transition-all font-display font-bold text-base border-gold/20 bg-muted/20 hover:bg-gold/10 hover:border-gold/50 hover:scale-105 active:scale-95"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-[11px] font-body text-muted-foreground hover:text-gold transition-colors"
              >
                ← Voltar pergunta anterior
              </button>
            )}
          </div>

          <div className="text-center text-[11px] font-body italic text-muted-foreground/80 px-4">
            "Sonda-me, ó Deus, e conhece o meu coração; prova-me e conhece os meus
            pensamentos." — Salmos 139:23
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════
  // RESULTADO + ABAS (Exercícios | Histórico | Evolução)
  // ═════════════════════════════════════════════════════
  const focoInfo = PILAR_INFO[resultado.pilarFoco];

  return (
    <div className="min-h-screen bg-background">
      <Header onBack={() => navigate(-1)} />

      <div className="px-5 max-w-xl mx-auto pb-16 space-y-6">
        {/* Resultado do diagnóstico */}
        <section className="space-y-4">
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl p-5 border border-gold/30 glass-strong",
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-70",
                focoInfo.color,
              )}
            />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-2xl shadow-gold">
                  {focoInfo.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">
                    Foco da semana
                  </p>
                  <h3 className="text-xl font-display font-bold text-foreground">
                    {focoInfo.nome}
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground">
                    {focoInfo.subtitulo}
                  </p>
                </div>
                <button
                  onClick={refazerQuiz}
                  title="Refazer diagnóstico"
                  className="p-2 rounded-lg border border-gold/20 hover:bg-gold/10 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-gold" />
                </button>
              </div>

              <div className="rounded-xl bg-black/30 border border-gold/15 p-3 flex gap-3">
                <Quote className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-body italic text-foreground/90 leading-relaxed">
                    {focoInfo.versiculo}
                  </p>
                  <p className="text-[10px] font-body text-gold/80 mt-1 tracking-wide">
                    — {focoInfo.referencia}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["espirito", "alma", "corpo"] as Pilar[]).map((p) => (
                  <div
                    key={p}
                    className="rounded-xl bg-black/30 border border-gold/10 p-2 text-center"
                  >
                    <p className="text-[9px] font-body tracking-[0.2em] uppercase text-gold/70">
                      {PILAR_INFO[p].nome}
                    </p>
                    <p className="text-lg font-display font-bold text-foreground">
                      {resultado[p]}%
                    </p>
                    <div className="h-1 rounded-full bg-muted/30 overflow-hidden mt-1">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-amber-300"
                        style={{ width: `${resultado[p]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Abas */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full grid grid-cols-3 bg-muted/20 border border-gold/15 h-11">
            <TabsTrigger value="exercicios" className="text-[11px] font-body data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
              <Sparkles className="h-3 w-3 mr-1" /> Exercícios
            </TabsTrigger>
            <TabsTrigger value="historico" className="text-[11px] font-body data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
              <History className="h-3 w-3 mr-1" /> Histórico
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="text-[11px] font-body data-[state=active]:bg-gold/15 data-[state=active]:text-gold">
              <TrendingUp className="h-3 w-3 mr-1" /> Evolução
            </TabsTrigger>
          </TabsList>

          {/* ============ TODOS OS EXERCÍCIOS ============ */}
          <TabsContent value="exercicios" className="space-y-5 mt-5">
            {/* Progresso da semana */}
            <div className="glass rounded-2xl border border-gold/15 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">
                    Esta semana · {formatWeekLabel(weekStart)}
                  </p>
                </div>
                <span className="text-xs font-display font-bold text-foreground">
                  {progressoSemana}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all"
                  style={{ width: `${progressoSemana}%` }}
                />
              </div>
              <p className="text-[10px] font-body text-muted-foreground">
                {feitosNaSemana.size} de {totalExercicios} exercícios concluídos
                nesta semana.
              </p>
            </div>

            {/* TODOS os exercícios na mesma aba, agrupados por pilar */}
            {(["espirito", "alma", "corpo"] as Pilar[]).map((pilar) => (
              <div key={pilar} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{PILAR_INFO[pilar].icon}</span>
                  <h3 className="text-[11px] font-body tracking-[0.25em] uppercase text-gold font-bold">
                    {PILAR_INFO[pilar].nome}
                  </h3>
                  {resultado.pilarFoco === pilar && (
                    <span className="text-[8px] font-body tracking-[0.15em] uppercase text-gold bg-gold/15 border border-gold/30 px-2 py-0.5 rounded-full">
                      Foco
                    </span>
                  )}
                  <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
                </div>

                {EXERCICIOS[pilar].map((ex, i) => {
                  const key = `${pilar}-${i}`;
                  const done = feitosNaSemana.has(key);
                  return (
                    <article
                      key={key}
                      className={cn(
                        "relative overflow-hidden rounded-2xl p-5 border transition-all",
                        done
                          ? "border-gold/40 bg-gold/5"
                          : "border-gold/15 glass hover:border-gold/30",
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[9px] font-body tracking-[0.25em] uppercase text-gold/70">
                              {ex.duracao}
                            </p>
                            <h4 className="text-base font-display font-bold text-foreground mt-1">
                              {ex.titulo}
                            </h4>
                          </div>
                          <button
                            onClick={() => toggleExercicio(pilar, key, ex.titulo)}
                            disabled={loading}
                            className={cn(
                              "h-9 w-9 rounded-full border flex items-center justify-center transition-all shrink-0 disabled:opacity-50",
                              done
                                ? "bg-gold border-gold text-primary-foreground shadow-gold"
                                : "border-gold/30 text-gold/60 hover:bg-gold/10 hover:border-gold/60",
                            )}
                            aria-label={
                              done ? "Marcar como não feito" : "Marcar como feito"
                            }
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>

                        <p className="text-[12px] font-body text-muted-foreground leading-relaxed">
                          {ex.resumo}
                        </p>

                        <ul className="space-y-1.5">
                          {ex.passos.map((p, idx) => (
                            <li
                              key={idx}
                              className="flex gap-2 text-[12px] font-body text-foreground/85"
                            >
                              <span className="text-gold font-bold mt-0.5">
                                {idx + 1}.
                              </span>
                              <span className="leading-relaxed">{p}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="rounded-xl bg-black/25 border border-gold/15 p-3 flex gap-2">
                          <Quote className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[11px] font-body italic text-foreground/90 leading-relaxed">
                              {ex.versiculo}
                            </p>
                            <p className="text-[9px] font-body text-gold/80 mt-0.5 tracking-wide">
                              — {ex.referencia}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gold/10">
                          <span className="text-[9px] font-body tracking-[0.2em] uppercase text-gold/70">
                            Métrica
                          </span>
                          <span className="text-[11px] font-body text-foreground/85">
                            {ex.metrica}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ))}

            {/* CTA Diário */}
            <button
              onClick={() => navigate("/diario")}
              className="w-full relative overflow-hidden rounded-2xl p-4 flex items-center gap-3 transition-all hover:shadow-brand active:scale-[0.98] group glass-gold border border-gold/30"
            >
              <div className="h-10 w-10 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-lg">
                ✍️
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-display font-bold text-foreground">
                  Registrar insights no Diário
                </p>
                <p className="text-[11px] font-body text-muted-foreground">
                  Capture o que Deus te mostrou ao longo da prática.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
            </button>
          </TabsContent>

          {/* ============ HISTÓRICO ============ */}
          <TabsContent value="historico" className="mt-5 space-y-3">
            <div className="glass rounded-2xl border border-gold/15 p-4">
              <div className="flex items-center gap-2 mb-1">
                <History className="h-4 w-4 text-gold" />
                <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gold font-bold">
                  Tudo que você já fez
                </p>
              </div>
              <p className="text-[11px] font-body text-muted-foreground">
                Total de {logs.length} exercícios concluídos desde o início da
                jornada.
              </p>
            </div>

            {logs.length === 0 ? (
              <div className="glass rounded-2xl border border-gold/10 p-8 text-center">
                <p className="text-3xl mb-2">🌱</p>
                <p className="text-sm font-display font-semibold text-foreground">
                  Nada por aqui ainda
                </p>
                <p className="text-[11px] font-body text-muted-foreground mt-1">
                  Volte para a aba "Exercícios" e marque seu primeiro passo.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {logs.map((l) => (
                  <li
                    key={l.id}
                    className="glass rounded-xl border border-gold/10 p-3 flex items-center gap-3"
                  >
                    <div className="h-9 w-9 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-base shrink-0">
                      {PILAR_INFO[l.pilar].icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-display font-semibold text-foreground truncate">
                        {l.exercicio_titulo}
                      </p>
                      <p className="text-[10px] font-body text-muted-foreground">
                        {PILAR_INFO[l.pilar].nome} ·{" "}
                        {new Date(l.completed_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-gold shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {/* ============ EVOLUÇÃO SEMANAL ============ */}
          <TabsContent value="evolucao" className="mt-5 space-y-4">
            <div className="glass rounded-2xl border border-gold/15 p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-gold" />
                <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gold font-bold">
                  Sua evolução nas últimas 6 semanas
                </p>
              </div>
              <p className="text-[11px] font-body text-muted-foreground italic">
                "Cada dia uma nova misericórdia." — Lamentações 3:22-23
              </p>
            </div>

            {/* Gráfico de barras */}
            <div className="glass-strong rounded-2xl border border-gold/20 p-4">
              <div className="flex items-end justify-between gap-2 h-40">
                {evolucaoSemanal.map((s) => {
                  const h = (s.total / maxSemanal) * 100;
                  const isAtual = s.week === weekStart;
                  return (
                    <div
                      key={s.week}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span className="text-[10px] font-display font-bold text-foreground">
                        {s.total}
                      </span>
                      <div className="w-full flex flex-col-reverse h-28 rounded-md overflow-hidden bg-muted/15 border border-gold/10">
                        <div
                          className={cn(
                            "w-full transition-all",
                            isAtual
                              ? "bg-gradient-to-t from-gold to-amber-300 shadow-gold"
                              : "bg-gradient-to-t from-gold/60 to-amber-300/60",
                          )}
                          style={{ height: s.total === 0 ? "4px" : `${h}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-[8px] font-body tracking-wide text-center leading-tight",
                          isAtual ? "text-gold font-bold" : "text-muted-foreground",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Breakdown por pilar */}
            <div className="space-y-2">
              <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">
                Por pilar (últimas 6 semanas)
              </p>
              {(["espirito", "alma", "corpo"] as Pilar[]).map((p) => {
                const total = evolucaoSemanal.reduce(
                  (acc, s) => acc + s.pilares[p],
                  0,
                );
                const max = Math.max(
                  1,
                  ...(["espirito", "alma", "corpo"] as Pilar[]).map((pp) =>
                    evolucaoSemanal.reduce((a, s) => a + s.pilares[pp], 0),
                  ),
                );
                return (
                  <div
                    key={p}
                    className="glass rounded-xl border border-gold/10 p-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{PILAR_INFO[p].icon}</span>
                        <span className="text-[12px] font-display font-bold text-foreground">
                          {PILAR_INFO[p].nome}
                        </span>
                      </div>
                      <span className="text-[11px] font-body text-gold font-bold">
                        {total} ✓
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold to-amber-300"
                        style={{ width: `${(total / max) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mensagem motivacional */}
            <div className="rounded-2xl border border-gold/20 glass-gold p-4 text-center">
              <p className="text-[12px] font-body italic text-foreground/90 leading-relaxed">
                {logs.length === 0
                  ? "Sua jornada começa com o primeiro passo. Comece hoje, mesmo que pequeno."
                  : `Você já registrou ${logs.length} ato${
                      logs.length > 1 ? "s" : ""
                    } de cuidado com sua identidade. Continue firme, rainha. 👑`}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <header className="relative px-5 pt-10 pb-5">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-gradient-to-b from-gold/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl glass hover:bg-muted/30 transition-all"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <div>
          <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">
            Método
          </p>
          <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
            Identidade Inabalável
            <Crown className="h-4 w-4 text-gold" />
          </h1>
        </div>
      </div>
      <p className="relative mt-3 text-[11px] font-body text-muted-foreground max-w-md">
        Espírito · Alma · Corpo. Um caminho de cura e identidade ancorado na Palavra.
      </p>
      <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </header>
  );
}
