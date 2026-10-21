import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Moon, Sparkles, Sun, Flame, ChevronRight,
  Heart, Target, Wallet, Brain, BookOpen, Dumbbell, Users, NotebookPen,
  Trophy, Utensils, Crown, Image, ListChecks,
} from "lucide-react";
import { useCurrentPhase, type Phase } from "@/hooks/useCurrentPhase";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";



interface AreaTip {
  label: string;
  to: string;
  icon: typeof Moon;
  hint: string;
}

interface Suggestion {
  label: string;
  icon: typeof Moon;
  message: string;
  gradient: string;
  areas: AreaTip[];
}

const SUGGESTIONS: Record<Phase, Suggestion> = {
  menstrual: {
    label: "Fase Menstrual",
    icon: Moon,
    message: "Energia em recolhimento. Priorize descanso ativo, regulação emocional e organização leve.",
    gradient: "from-violet-100 via-slate-100 to-violet-200",
    areas: [
      { label: "Reprogramação", to: "/reprogramacao", icon: Brain, hint: "Áudios de regulação" },
      { label: "Diário", to: "/diario", icon: NotebookPen, hint: "Escrita terapêutica" },
      { label: "Saúde", to: "/saude", icon: Heart, hint: "Movimento leve" },
      { label: "Bíblia 365", to: "/biblia-365", icon: BookOpen, hint: "Leitura calma" },
      { label: "Plano alimentar", to: "/plano-alimentar", icon: Utensils, hint: "Ferro e magnésio" },
      { label: "Sono", to: "/sono", icon: Moon, hint: "Recuperar energia" },
      { label: "Meu mês", to: "/meu-mes", icon: ListChecks, hint: "Revisar sem cobrança" },
      { label: "Comunidade", to: "/comunidade", icon: Users, hint: "Acolhimento" },
    ],
  },
  folicular: {
    label: "Fase Folicular",
    icon: Sun,
    message: "Estrogênio subindo: criatividade, foco e memória em alta. Hora de estudar, planejar e começar.",
    gradient: "from-amber-50 via-yellow-50 to-amber-100",
    areas: [
      { label: "Metas", to: "/metas", icon: Target, hint: "Planejar o mês" },
      { label: "Finanças", to: "/financas", icon: Wallet, hint: "Organizar contas" },
      { label: "Vision board", to: "/vision-board", icon: Image, hint: "Criatividade em alta" },
      { label: "Desafios", to: "/desafios", icon: Trophy, hint: "Começar jornada" },
      { label: "Saúde", to: "/saude", icon: Dumbbell, hint: "Treinos intensos" },
      { label: "Jornada Elite", to: "/jornada-elite", icon: Crown, hint: "Avançar módulos" },
      { label: "Glow Move", to: "/glow-move", icon: Sparkles, hint: "Novos hábitos" },
    ],
  },
  ovulatoria: {
    label: "Fase Ovulatória",
    icon: Flame,
    message: "Pico de energia, comunicação e magnetismo. Use para se expor, conectar e performar.",
    gradient: "from-pink-50 via-rose-50 to-pink-100",
    areas: [
      { label: "Comunidade", to: "/comunidade", icon: Users, hint: "Se conectar" },
      { label: "Apresentações", to: "/apresentacoes", icon: Heart, hint: "Se mostrar" },
      { label: "Metas", to: "/metas", icon: Target, hint: "Executar o difícil" },
      { label: "Saúde", to: "/saude", icon: Dumbbell, hint: "Pico de força" },
      { label: "Ranking", to: "/ranking-mensal", icon: Trophy, hint: "Disputar o topo" },
      { label: "Identidade", to: "/identidade-inabalavel", icon: Crown, hint: "Presença e voz" },
      { label: "Finanças", to: "/financas", icon: Wallet, hint: "Negociar e vender" },
    ],
  },
  lutea: {
    label: "Fase Lútea",
    icon: Sparkles,
    message: "Progesterona alta: introspecção e sensibilidade. Priorize regulação, revisão e cuidado, não cobrança.",
    gradient: "from-violet-50 via-purple-50 to-purple-100",
    areas: [
      { label: "Reprogramação", to: "/reprogramacao", icon: Brain, hint: "Regular emoções" },
      { label: "Diário", to: "/diario", icon: NotebookPen, hint: "Desabafar" },
      { label: "Ritual do mês", to: "/ritual-fechamento", icon: ListChecks, hint: "Fechar ciclos" },
      { label: "Evolução", to: "/evolucao", icon: Trophy, hint: "Ver o progresso" },
      { label: "Plano alimentar", to: "/plano-alimentar", icon: Utensils, hint: "Controlar compulsão" },
      { label: "Sono", to: "/sono", icon: Moon, hint: "Dormir melhor" },
      { label: "Mente poderosa", to: "/mente-poderosa", icon: Sparkles, hint: "Aliviar a TPM" },
      { label: "Guias", to: "/guias", icon: BookOpen, hint: "Autocuidado" },
    ],
  },
};

export default function HormonalPhaseSuggestion({ cardOnly = false }: { cardOnly?: boolean }) {
  const navigate = useNavigate();
  const phase = useCurrentPhase();

  if (!phase && cardOnly) return <div className="ed-card p-4 flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Minha fase</p><Button asChild size="sm" variant="outline"><Link to="/saude">Registrar ciclo</Link></Button></div>;
  if (!phase) return null;
  const s = SUGGESTIONS[phase];
  const Icon = s.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 border border-gold/15">
      <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient}`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_50%,hsl(var(--gold)/0.18),transparent_60%)]" />

      <div className="relative z-10 flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center border border-gold/30 shrink-0">
          <Icon className="h-6 w-6 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-body uppercase tracking-[0.2em] text-gold/70">Para sua fase atual</p>
          <p className="text-sm font-display font-bold text-foreground mt-0.5">{s.label}</p>
          <p className="text-[11px] font-body text-foreground/70 mt-1 leading-snug">{s.message}</p>
        </div>
      </div>

      {!cardOnly && <div className="relative z-10 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {s.areas.map((a) => {
          const AIcon = a.icon;
          return (
            <button
              key={a.to + a.label}
              onClick={() => navigate(a.to)}
              className="group flex items-center gap-2 rounded-xl bg-background/60 hover:bg-background/85 border border-gold/15 px-2.5 py-2 text-left transition-all active:scale-[0.97]"
            >
              <div className="h-7 w-7 rounded-lg bg-gold/12 flex items-center justify-center border border-gold/20 shrink-0">
                <AIcon className="h-3.5 w-3.5 text-gold" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-body font-semibold text-foreground truncate">{a.label}</p>
                <p className="text-[9px] font-body text-foreground/55 truncate">{a.hint}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-gold/50 group-hover:text-gold shrink-0" />
            </button>
          );
        })}
      </div>}
    </div>
  );
}
