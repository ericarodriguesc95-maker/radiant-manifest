import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Loader2, ThermometerSun, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Letter = "A" | "B" | "C";

interface Option {
  letter: Letter;
  text: string;
}

interface Question {
  id: number;
  category: string;
  title: string;
  options: Option[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: "Mentalidade e Foco",
    title: "Como você avalia sua clareza mental esta semana?",
    options: [
      { letter: "A", text: "Totalmente perdida ou sobrecarregada" },
      { letter: "B", text: "Sei o que fazer, mas procrastino" },
      { letter: "C", text: "Focada e alinhada" },
    ],
  },
  {
    id: 2,
    category: "Rotina e Hábitos",
    title: "Como está a execução dos seus rituais?",
    options: [
      { letter: "A", text: "Não consegui começar" },
      { letter: "B", text: "Executo oscilando bastante" },
      { letter: "C", text: "Consistente" },
    ],
  },
  {
    id: 3,
    category: "Energia e Saúde",
    title: "Seu nível de energia física tem sido:",
    options: [
      { letter: "A", text: "Sempre cansada" },
      { letter: "B", text: "Oscila durante o dia" },
      { letter: "C", text: "Alta performance" },
    ],
  },
];

function computeProfile(a: Letter, b: Letter, c: Letter): Letter {
  const counts: Record<Letter, number> = { A: 0, B: 0, C: 0 };
  counts[a]++; counts[b]++; counts[c]++;
  // Priority tie-break: A > B > C (acolhimento primeiro)
  if (counts.A >= counts.B && counts.A >= counts.C) return "A";
  if (counts.B >= counts.C) return "B";
  return "C";
}

function monthStartISO(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function TermometroRotinaPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(Letter | null)[]>([null, null, null]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingProfile, setExistingProfile] = useState<Letter | null>(null);

  const currentMonth = useMemo(() => monthStartISO(), []);
  const monthLabel = useMemo(
    () => new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
    []
  );

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("monthly_routine_checkins" as any)
        .select("answer_1, answer_2, answer_3, profile")
        .eq("user_id", user.id)
        .eq("month_start", currentMonth)
        .maybeSingle();
      if (data) {
        const row = data as any;
        setAnswers([row.answer_1, row.answer_2, row.answer_3]);
        setExistingProfile(row.profile);
      }
      setLoading(false);
    })();
  }, [user, currentMonth]);

  const q = QUESTIONS[step];
  const selected = answers[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const canNext = selected !== null;
  const isLast = step === QUESTIONS.length - 1;

  const select = (letter: Letter) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = letter;
      return next;
    });
  };

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
    const [a, b, c] = answers as Letter[];
    const profile = computeProfile(a, b, c);
    setSaving(true);
    const { error } = await supabase
      .from("monthly_routine_checkins" as any)
      .upsert(
        {
          user_id: user.id,
          month_start: currentMonth,
          answer_1: a,
          answer_2: b,
          answer_3: c,
          profile,
        },
        { onConflict: "user_id,month_start" }
      );
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar. Tente novamente.");
      return;
    }
    toast.success("Termômetro salvo! Aqui está o seu perfil deste mês.");
    navigate("/perfil-do-mes", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 pb-24 pt-2 space-y-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
          <ThermometerSun className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
            Termômetro de Rotina
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground capitalize">
          {monthLabel}
        </h1>
        <p className="text-xs font-body text-muted-foreground max-w-sm mx-auto">
          Três perguntas rápidas pra entender como você chega este mês. Suas respostas
          ajustam o app pro seu momento.
        </p>
        {existingProfile && (
          <p className="text-[11px] font-body text-muted-foreground italic">
            Você já respondeu este mês. Refazer vai sobrescrever o resultado atual.
          </p>
        )}
      </header>

      {/* Progress bar */}
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

      {/* Question card */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold/80">
            {q.category}
          </p>
          <h2 className="mt-1 text-lg font-display font-bold text-foreground leading-snug">
            {q.title}
          </h2>
        </div>

        <div className="space-y-3">
          {q.options.map((opt) => {
            const isActive = selected === opt.letter;
            return (
              <button
                key={opt.letter}
                type="button"
                onClick={() => select(opt.letter)}
                className={cn(
                  "w-full text-left rounded-xl border p-4 flex items-center gap-4 transition-all active:scale-[0.99]",
                  isActive
                    ? "border-gold bg-gold/10 shadow-glow"
                    : "border-border bg-background hover:border-gold/50 hover:bg-gold/5"
                )}
              >
                <span
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-lg border-2 transition-all",
                    isActive
                      ? "bg-gold text-background border-gold"
                      : "bg-transparent text-gold/70 border-gold/30"
                  )}
                >
                  {isActive ? <Check className="h-5 w-5" /> : opt.letter}
                </span>
                <span
                  className={cn(
                    "text-sm font-body leading-snug",
                    isActive ? "text-foreground font-semibold" : "text-foreground/85"
                  )}
                >
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer buttons */}
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
              {isLast ? "Finalizar" : "Próxima"}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {/* Dots */}
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
