import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  Sparkles,
  Heart,
  Scale,
  Flame,
  ArrowRight,
  RotateCcw,
  ThermometerSun,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Letter = "A" | "B" | "C";

interface CheckinRow {
  answer_1: Letter;
  answer_2: Letter;
  answer_3: Letter;
  profile: Letter;
  created_at: string;
}

const PROFILES: Record<
  Letter,
  {
    title: string;
    subtitle: string;
    emoji: string;
    icon: typeof Heart;
    gradient: string;
    ring: string;
    description: string;
    focus: string[];
    tip: string;
    cta: { label: string; path: string };
  }
> = {
  A: {
    title: "Modo Acolhimento",
    subtitle: "Este mês pede colo, não cobrança.",
    emoji: "🌷",
    icon: Heart,
    gradient: "from-rose-100 via-pink-50 to-amber-50",
    ring: "ring-rose-200",
    description:
      "Você chega neste mês pedindo pausa, gentileza e recomeço leve. Sua missão não é performar, é se reencontrar. Vamos priorizar rituais simples, descanso de qualidade e pequenas vitórias diárias que devolvem confiança.",
    focus: [
      "Rotina mínima viável: 3 hábitos essenciais por dia",
      "Devocional e afirmações para regular o emocional",
      "Sono e ciclo menstrual como base da energia",
    ],
    tip: "Comece pelo Devocional de hoje e marque 1 hábito simples. Progresso pequeno todo dia vira transformação.",
    cta: { label: "Ir para o Devocional", path: "/devocional" },
  },
  B: {
    title: "Modo Equilíbrio",
    subtitle: "Você sabe o caminho, agora é ajustar o passo.",
    emoji: "🌿",
    icon: Scale,
    gradient: "from-emerald-100 via-teal-50 to-amber-50",
    ring: "ring-emerald-200",
    description:
      "Você tem clareza, mas oscila entre execução e procrastinação. Este mês é sobre consistência: transformar intenção em constância. Foco em fechar ciclos, ajustar rotina e criar disciplina prazerosa.",
    focus: [
      "Metas SMART com revisão semanal",
      "Termômetro semanal para acompanhar constância",
      "Finanças e planejamento do mês em dia",
    ],
    tip: "Abra suas Metas e escolha 1 para avançar hoje. Consistência vence intensidade.",
    cta: { label: "Ir para Metas", path: "/metas" },
  },
  C: {
    title: "Modo Alta Performance",
    subtitle: "Sua energia está pronta para expandir.",
    emoji: "👑",
    icon: Flame,
    gradient: "from-amber-100 via-yellow-50 to-orange-50",
    ring: "ring-amber-300",
    description:
      "Você chega focada, alinhada e com energia em alta. Este é o mês de acelerar projetos, aprofundar identidade e ir para o próximo nível. Vamos usar Mente Poderosa, Identidade Inabalável e desafios progressivos pra escalar resultados.",
    focus: [
      "Identidade Inabalável e Mente Poderosa em dia",
      "Desafios progressivos e Vision Board ativos",
      "Rotina de alta performance com foco em execução",
    ],
    tip: "Entre em Mente Poderosa e escolha um exercício de expansão para hoje. Você está pronta para mais.",
    cta: { label: "Ir para Mente Poderosa", path: "/mente-poderosa" },
  },
};

function monthStartISO(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default function PerfilDoMesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<CheckinRow | null>(null);

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
        .select("answer_1, answer_2, answer_3, profile, created_at")
        .eq("user_id", user.id)
        .eq("month_start", currentMonth)
        .maybeSingle();
      setRow((data as unknown as CheckinRow | null) ?? null);
      setLoading(false);
    })();
  }, [user, currentMonth]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!row) {
    return (
      <div className="max-w-xl mx-auto px-4 pb-24 pt-4 space-y-6">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
            <ThermometerSun className="h-3.5 w-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
              Perfil do Mês
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground capitalize">
            {monthLabel}
          </h1>
          <p className="text-sm font-body text-muted-foreground">
            Você ainda não respondeu o Termômetro deste mês. Responda em 1 minuto para
            desbloquear seu perfil personalizado.
          </p>
        </header>
        <button
          type="button"
          onClick={() => navigate("/meu-mes")}
          className="w-full h-12 rounded-xl bg-gold text-background font-display font-bold text-sm shadow-brand hover:brightness-105 active:scale-[0.98] transition"
        >
          Responder Termômetro
        </button>
      </div>
    );
  }

  const p = PROFILES[row.profile];
  const Icon = p.icon;
  const answers: Letter[] = [row.answer_1, row.answer_2, row.answer_3];
  const categories = ["Mentalidade e Foco", "Rotina e Hábitos", "Energia e Saúde"];

  return (
    <div className="max-w-xl mx-auto px-4 pb-24 pt-2 space-y-6">
      {/* Header */}
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
          <Sparkles className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
            Seu Perfil do Mês
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground capitalize">
          {monthLabel}
        </h1>
      </header>

      {/* Profile card */}
      <div
        className={cn(
          "rounded-3xl p-6 shadow-card border border-white/60 ring-1 relative overflow-hidden",
          "bg-gradient-to-br",
          p.gradient,
          p.ring
        )}
      >
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/40 blur-2xl pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-3xl shadow-inner">
              {p.emoji}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-foreground/60">
                Perfil {row.profile}
              </p>
              <h2 className="text-xl font-display font-bold text-foreground leading-tight">
                {p.title}
              </h2>
            </div>
          </div>

          <p className="text-sm font-body font-semibold text-foreground/80 italic">
            "{p.subtitle}"
          </p>

          <p className="text-sm font-body text-foreground/85 leading-relaxed">
            {p.description}
          </p>
        </div>
      </div>

      {/* Focus of the month */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
            Foco deste mês
          </h3>
        </div>
        <ul className="space-y-2">
          {p.focus.map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm font-body text-foreground/85 leading-snug"
            >
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* Tip / CTA */}
      <div className="rounded-2xl border border-gold/30 bg-gold/5 p-5 space-y-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-gold mb-1">
            Próximo passo
          </p>
          <p className="text-sm font-body text-foreground/90 leading-relaxed">
            {p.tip}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(p.cta.path)}
          className="w-full h-11 rounded-xl bg-gold text-background font-display font-bold text-sm shadow-brand hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2"
        >
          {p.cta.label}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Evolution link */}
      <button
        type="button"
        onClick={() => navigate("/evolucao")}
        className="w-full h-12 rounded-xl border border-gold/40 bg-gradient-to-r from-amber-50 to-yellow-50 text-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:brightness-[0.98] active:scale-[0.99] transition"
      >
        Ver minha evolução mensal
        <ArrowRight className="h-4 w-4 text-gold" />
      </button>

      {/* Closure ritual link */}
      <button
        type="button"
        onClick={() => navigate("/ritual-fechamento")}
        className="w-full h-12 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 text-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:brightness-[0.98] active:scale-[0.99] transition"
      >
        Fazer o Ritual de Fechamento do mês anterior
        <ArrowRight className="h-4 w-4 text-purple-500" />
      </button>

      {/* Your answers */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
        <h3 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
          Suas respostas
        </h3>
        <div className="space-y-2">
          {answers.map((letter, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
            >
              <span className="text-xs font-body text-foreground/75">
                {categories[i]}
              </span>
              <span className="h-7 w-7 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-xs font-display font-bold text-gold">
                {letter}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Redo */}
      <button
        type="button"
        onClick={() => navigate("/meu-mes")}
        className="w-full h-11 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
      >
        <RotateCcw className="h-4 w-4" />
        Refazer Termômetro do mês
      </button>
    </div>
  );
}
