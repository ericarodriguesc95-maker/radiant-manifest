import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, Moon, Sparkles, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MIN_CHARS = 20;

interface Question {
  id: number;
  label: string;
  title: string;
  placeholder: string;
  helper: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    label: "Reconhecimento",
    title: "Qual foi a sua maior vitória este mês?",
    placeholder: "Escreva sem filtro. Vale conquista pequena, grande, invisível...",
    helper: "Nomear a vitória fixa a memória do que deu certo e treina o cérebro pra repetir.",
  },
  {
    id: 2,
    label: "Ajuste",
    title: "O que saiu dos trilhos, e como vamos ajustar isso nas metas do próximo mês?",
    placeholder: "Seja honesta e gentil. O que ficou pendente e qual será o novo passo?",
    helper: "Fechar o mês com clareza faz o próximo começar com direção, sem culpa.",
  },
];

function firstOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function firstOfPreviousMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}
function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function RitualFechamentoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", ""]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);

  const targetMonth = useMemo(() => {
    const p = params.get("month");
    if (p) return new Date(p);
    return firstOfPreviousMonth();
  }, [params]);

  const monthLabel = useMemo(
    () => targetMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    [targetMonth]
  );
  const monthISO = useMemo(() => toISODate(firstOfMonth(targetMonth)), [targetMonth]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("monthly_closure_rituals" as any)
        .select("biggest_win, adjustment")
        .eq("user_id", user.id)
        .eq("month_start", monthISO)
        .maybeSingle();
      if (data) {
        const row = data as any;
        setAnswers([row.biggest_win ?? "", row.adjustment ?? ""]);
      }
      setLoading(false);
    })();
  }, [user, monthISO]);

  const q = QUESTIONS[step];
  const current = answers[step] ?? "";
  const remaining = Math.max(0, MIN_CHARS - current.trim().length);
  const canNext = current.trim().length >= MIN_CHARS;
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const goPrev = () => {
    if (step === 0) navigate(-1);
    else setStep((s) => s - 1);
  };

  const goNext = async () => {
    if (!canNext) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    if (!user) {
      toast.error("Você precisa estar logada.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("monthly_closure_rituals" as any)
      .upsert(
        {
          user_id: user.id,
          month_start: monthISO,
          biggest_win: answers[0].trim(),
          adjustment: answers[1].trim(),
        },
        { onConflict: "user_id,month_start" }
      );
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar. Tente novamente.");
      return;
    }
    setFinished(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-6 pb-24 space-y-6">
        <div className="rounded-3xl p-8 text-center space-y-5 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-gold/30 shadow-card">
          <div className="mx-auto h-16 w-16 rounded-full bg-gold text-background flex items-center justify-center shadow-brand">
            <Check className="h-8 w-8" strokeWidth={3} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-bold text-foreground">
              Mês fechado com consciência
            </h1>
            <p className="text-sm font-body text-foreground/80 leading-relaxed max-w-sm mx-auto">
              Você nomeou a sua vitória e deu direção ao que vem. É assim que se constrói uma nova versão, ciclo por ciclo.
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 backdrop-blur border border-gold/20 p-4 text-left space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-gold mb-1">
                Sua maior vitória
              </p>
              <p className="text-sm font-body text-foreground/90 italic">"{answers[0]}"</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-gold mb-1">
                Seu ajuste para o próximo mês
              </p>
              <p className="text-sm font-body text-foreground/90 italic">"{answers[1]}"</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate("/perfil-do-mes")}
              className="w-full h-12 rounded-xl bg-gold text-background font-display font-bold text-sm shadow-brand hover:brightness-105 active:scale-[0.98] transition"
            >
              Ver meu Perfil do Mês
            </button>
            <button
              type="button"
              onClick={() => navigate("/evolucao")}
              className="w-full h-11 rounded-xl border border-border bg-white/60 text-foreground font-body font-semibold text-sm hover:bg-white transition"
            >
              Ver minha evolução
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-24 pt-2 space-y-6">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
          <Moon className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
            Ritual de Fechamento
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground capitalize">
          Fechando {monthLabel}
        </h1>
        <p className="text-xs font-body text-muted-foreground max-w-sm mx-auto">
          Dois minutos para reconhecer o que você construiu e ajustar o que vem a seguir. Responda com verdade, sem pressa.
        </p>
      </header>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-body font-semibold text-muted-foreground">
          <span>
            Pergunta {step + 1} de {QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-gold/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold/80">
            {q.label}
          </p>
          <h2 className="mt-1 text-lg font-display font-bold text-foreground leading-snug">
            {q.title}
          </h2>
          <p className="mt-1 text-xs font-body text-muted-foreground italic">
            {q.helper}
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            value={current}
            onChange={(e) =>
              setAnswers((prev) => {
                const next = [...prev];
                next[step] = e.target.value;
                return next;
              })
            }
            placeholder={q.placeholder}
            rows={6}
            maxLength={1000}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 resize-none"
          />
          <div className="flex items-center justify-between text-[11px] font-body">
            <span className={cn(remaining === 0 ? "text-emerald-600" : "text-muted-foreground")}>
              {remaining === 0 ? (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Pronto para avançar
                </span>
              ) : (
                `Escreva pelo menos mais ${remaining} caractere${remaining === 1 ? "" : "s"}`
              )}
            </span>
            <span className="text-muted-foreground">{current.length}/1000</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          disabled={saving}
          className="flex-1 h-12 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {step === 0 ? "Sair" : "Voltar"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext || saving}
          className={cn(
            "flex-[1.4] h-12 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-1.5 transition-all",
            canNext && !saving
              ? "bg-gold text-background hover:brightness-105 shadow-brand active:scale-[0.98]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isLast ? "Fechar o mês" : "Próxima"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="flex justify-center gap-2 pt-1">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === step ? "w-6 bg-gold" : i < step ? "w-3 bg-gold/60" : "w-3 bg-gold/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
