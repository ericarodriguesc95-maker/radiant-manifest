import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Crown, Sparkles, RotateCcw, Quote } from "lucide-react";
import {
  QUIZ_QUESTIONS,
  PILAR_INFO,
  EXERCICIOS,
  calcularResultado,
  type Pilar,
  type ResultadoQuiz,
} from "@/data/identidadeInabalavelData";
import { cn } from "@/lib/utils";

const STORAGE_RESULT = "identidade-inabalavel:resultado";
const STORAGE_DONE = "identidade-inabalavel:exercicios-feitos";

export default function IdentidadeInabalavelPage() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [pilarAtivo, setPilarAtivo] = useState<Pilar>("espirito");
  const [feitos, setFeitos] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_RESULT);
    if (raw) {
      try {
        const r: ResultadoQuiz = JSON.parse(raw);
        setResultado(r);
        setPilarAtivo(r.pilarFoco);
      } catch {}
    }
    const done = localStorage.getItem(STORAGE_DONE);
    if (done) {
      try {
        setFeitos(JSON.parse(done));
      } catch {}
    }
  }, []);

  const salvarResultado = (r: ResultadoQuiz) => {
    localStorage.setItem(STORAGE_RESULT, JSON.stringify(r));
    setResultado(r);
    setPilarAtivo(r.pilarFoco);
  };

  const toggleExercicio = (key: string) => {
    setFeitos((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      localStorage.setItem(STORAGE_DONE, JSON.stringify(next));
      return next;
    });
  };

  const responder = (val: number) => {
    const q = QUIZ_QUESTIONS[step];
    const novo = { ...respostas, [q.id]: val };
    setRespostas(novo);
    if (step + 1 < QUIZ_QUESTIONS.length) {
      setStep(step + 1);
    } else {
      salvarResultado(calcularResultado(novo));
    }
  };

  const refazerQuiz = () => {
    setResultado(null);
    setRespostas({});
    setStep(0);
  };

  const totalExercicios = useMemo(
    () =>
      (["espirito", "alma", "corpo"] as Pilar[]).reduce(
        (acc, p) => acc + EXERCICIOS[p].length,
        0,
      ),
    [],
  );
  const progresso = Math.round((feitos.length / totalExercicios) * 100);

  // ═════════════════════════════════════════════════════
  // QUIZ
  // ═════════════════════════════════════════════════════
  if (!resultado) {
    const q = QUIZ_QUESTIONS[step];
    const pct = Math.round(((step) / QUIZ_QUESTIONS.length) * 100);
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

          {/* Progress */}
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

          {/* Question card */}
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
                    className={cn(
                      "py-3 rounded-xl border transition-all font-display font-bold text-base",
                      "border-gold/20 bg-muted/20 hover:bg-gold/10 hover:border-gold/50 hover:scale-105",
                      "active:scale-95",
                    )}
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
            “Sonda-me, ó Deus, e conhece o meu coração; prova-me e conhece os meus
            pensamentos.” — Salmos 139:23
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════
  // RESULTADO + EXERCÍCIOS
  // ═════════════════════════════════════════════════════
  const focoInfo = PILAR_INFO[resultado.pilarFoco];

  return (
    <div className="min-h-screen bg-background">
      <Header onBack={() => navigate(-1)} />

      <div className="px-5 max-w-xl mx-auto pb-16 space-y-7">
        {/* Resultado */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">
              Seu diagnóstico
            </p>
            <h2 className="text-xl font-display font-bold text-foreground">
              Pilar prioritário desta semana
            </h2>
          </div>

          <div
            className={cn(
              "relative overflow-hidden rounded-3xl p-6 border border-gold/30 glass-strong",
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
                <div className="h-14 w-14 rounded-2xl bg-gold/20 border border-gold/40 flex items-center justify-center text-2xl shadow-gold">
                  {focoInfo.icon}
                </div>
                <div>
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">
                    Foco
                  </p>
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    {focoInfo.nome}
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground">
                    {focoInfo.subtitulo}
                  </p>
                </div>
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

              <p className="text-[12px] font-body text-muted-foreground leading-relaxed">
                {focoInfo.descricao}
              </p>

              {/* Métrica geral */}
              <div className="grid grid-cols-3 gap-2 pt-2">
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

              <button
                onClick={refazerQuiz}
                className="text-[11px] font-body text-gold/80 hover:text-gold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Refazer diagnóstico
              </button>
            </div>
          </div>
        </section>

        {/* Progresso geral */}
        <section className="glass rounded-2xl border border-gold/15 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-gold" />
              <p className="text-[11px] font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">
                Sua jornada de Identidade
              </p>
            </div>
            <span className="text-xs font-display font-bold text-foreground">
              {progresso}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold via-amber-300 to-gold transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
          <p className="text-[10px] font-body text-muted-foreground">
            {feitos.length} de {totalExercicios} exercícios concluídos.
          </p>
        </section>

        {/* Tabs por pilar */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">
              Exercícios práticos da semana
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["espirito", "alma", "corpo"] as Pilar[]).map((p) => {
              const ativo = pilarAtivo === p;
              const ehFoco = resultado.pilarFoco === p;
              return (
                <button
                  key={p}
                  onClick={() => setPilarAtivo(p)}
                  className={cn(
                    "relative rounded-2xl p-3 border transition-all text-left",
                    ativo
                      ? "border-gold/50 bg-gold/10 shadow-glow"
                      : "border-gold/10 glass hover:border-gold/30",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{PILAR_INFO[p].icon}</span>
                    {ehFoco && (
                      <span className="text-[8px] font-body tracking-[0.15em] uppercase text-gold font-bold">
                        Foco
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-display font-bold text-foreground mt-1">
                    {PILAR_INFO[p].nome}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Cards de exercícios do pilar ativo */}
          <div className="space-y-3">
            {EXERCICIOS[pilarAtivo].map((ex, i) => {
              const key = `${pilarAtivo}-${i}`;
              const done = feitos.includes(key);
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
                          {PILAR_INFO[pilarAtivo].nome} · {ex.duracao}
                        </p>
                        <h4 className="text-base font-display font-bold text-foreground mt-1">
                          {ex.titulo}
                        </h4>
                      </div>
                      <button
                        onClick={() => toggleExercicio(key)}
                        className={cn(
                          "h-9 w-9 rounded-full border flex items-center justify-center transition-all shrink-0",
                          done
                            ? "bg-gold border-gold text-primary-foreground shadow-gold"
                            : "border-gold/30 text-gold/60 hover:bg-gold/10 hover:border-gold/60",
                        )}
                        aria-label={done ? "Marcar como não feito" : "Marcar como feito"}
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
        </section>

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
