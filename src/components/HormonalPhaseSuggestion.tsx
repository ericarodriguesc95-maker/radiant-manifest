import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sparkles, Sun, Flame, ChevronRight } from "lucide-react";
import { differenceInDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Phase = "menstrual" | "folicular" | "ovulatoria" | "lutea";

interface Suggestion {
  phase: Phase;
  label: string;
  icon: typeof Moon;
  message: string;
  ctaLabel: string;
  ctaTo: string;
  gradient: string;
}

const SUGGESTIONS: Record<Phase, Suggestion> = {
  menstrual: {
    phase: "menstrual",
    label: "Fase Menstrual",
    icon: Moon,
    message: "Energia em recolhimento. Priorize introspecção, descanso ativo e áudios de regulação emocional.",
    ctaLabel: "Reprogramação Mental",
    ctaTo: "/reprogramacao",
    gradient: "from-rose-950/60 via-rose-900/30 to-zinc-950/40",
  },
  folicular: {
    phase: "folicular",
    label: "Fase Folicular",
    icon: Sun,
    message: "Estrogênio subindo: criatividade, foco e memória em alta. Hora ideal para estudar e iniciar projetos.",
    ctaLabel: "Alta Performance",
    ctaTo: "/alta-performance",
    gradient: "from-amber-900/40 via-amber-800/20 to-zinc-950/40",
  },
  ovulatoria: {
    phase: "fase ovulatória" as any,
    label: "Fase Ovulatória",
    icon: Flame,
    message: "Pico de energia, comunicação e magnetismo. Use para gravar conteúdos, conversas difíceis e treinos intensos.",
    ctaLabel: "Metas & Manifestação",
    ctaTo: "/metas",
    gradient: "from-fuchsia-900/40 via-pink-900/20 to-zinc-950/40",
  },
  lutea: {
    phase: "lutea",
    label: "Fase Lútea",
    icon: Sparkles,
    message: "Progesterona alta = introspecção e sensibilidade. Priorize Neurociência & PNL para regular emoções, em vez de cobrança.",
    ctaLabel: "Reprogramação Mental",
    ctaTo: "/reprogramacao",
    gradient: "from-violet-950/60 via-purple-900/30 to-zinc-950/40",
  },
};

function estimatePhase(periodStart: Date, cycleLength: number): Phase {
  const day = (differenceInDays(new Date(), periodStart) % cycleLength + cycleLength) % cycleLength + 1;
  if (day <= 5) return "menstrual";
  if (day <= 13) return "folicular";
  if (day <= 16) return "ovulatoria";
  return "lutea";
}

export default function HormonalPhaseSuggestion() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("cycle_logs")
        .select("period_start")
        .eq("user_id", user.id)
        .order("period_start", { ascending: false })
        .limit(6);
      if (!data || data.length === 0) return;

      let avg = 28;
      if (data.length >= 2) {
        let total = 0;
        const n = Math.min(data.length, 5);
        for (let i = 0; i < n - 1; i++) {
          total += differenceInDays(new Date(data[i].period_start), new Date(data[i + 1].period_start));
        }
        avg = Math.max(21, Math.min(35, Math.round(total / (n - 1)) || 28));
      }
      setPhase(estimatePhase(new Date(data[0].period_start), avg));
    })();
  }, [user]);

  if (!phase) return null;
  const s = SUGGESTIONS[phase];
  const Icon = s.icon;

  return (
    <button
      onClick={() => navigate(s.ctaTo)}
      className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-brand active:scale-[0.98] group border border-gold/15 text-left"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,hsl(var(--gold)/0.18),transparent_60%)]" />
      <div className="relative z-10 h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center border border-gold/30 group-hover:bg-gold/25 transition-all shrink-0">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[9px] font-body uppercase tracking-[0.2em] text-gold/70">Para sua fase atual</p>
        </div>
        <p className="text-sm font-display font-bold text-foreground mt-0.5">{s.label}</p>
        <p className="text-[11px] font-body text-foreground/70 mt-1 leading-snug">{s.message}</p>
        <p className="text-[10px] font-body text-gold mt-1.5">→ {s.ctaLabel}</p>
      </div>
      <ChevronRight className="relative z-10 h-5 w-5 text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}
