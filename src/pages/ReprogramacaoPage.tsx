import { useState } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight, Sparkles, Heart, Brain, Pen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LeiAtracaoExercises from "@/components/mental/LeiAtracaoExercises";
import HooponoponoPlayer from "@/components/mental/HooponoponoPlayer";
import MeditacoesGuiadas from "@/components/mental/MeditacoesGuiadas";
import NeurocienciaPNL from "@/components/mental/NeurocienciaPNL";

type Section = "menu" | "lei-atracao" | "hooponopono" | "meditacoes" | "neurociencia";

const sections = [
  { id: "lei-atracao" as Section, icon: Sparkles, label: "Lei da Atração", desc: "Exercícios de escrita e manifestação", color: "bg-gold/10 text-gold" },
  { id: "hooponopono" as Section, icon: Heart, label: "Ho'oponopono", desc: "Player de mantra e limpeza energética", color: "bg-pink-500/10 text-pink-500" },
  { id: "meditacoes" as Section, icon: Play, label: "Meditações Guiadas", desc: "Áudios para relaxar e visualizar", color: "bg-blue-500/10 text-blue-500" },
  { id: "neurociencia" as Section, icon: Brain, label: "Neurociência & PNL", desc: "Exercícios para mudança de hábitos", color: "bg-purple-500/10 text-purple-500" },
];

const ReprogramacaoPage = () => {
  const [activeSection, setActiveSection] = useState<Section>("menu");
  const navigate = useNavigate();

  if (activeSection === "lei-atracao") return <LeiAtracaoExercises onBack={() => setActiveSection("menu")} />;
  if (activeSection === "hooponopono") return <HooponoponoPlayer onBack={() => setActiveSection("menu")} />;
  if (activeSection === "meditacoes") return <MeditacoesGuiadas onBack={() => setActiveSection("menu")} />;
  if (activeSection === "neurociencia") return <NeurocienciaPNL onBack={() => setActiveSection("menu")} />;

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Sua jornada de</p>
        <h1 className="text-2xl font-display font-bold">Reprogramação Mental <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Transforme seus pensamentos, transforme sua vida</p>
      </header>

      <div className="px-5 space-y-3 pb-6 mt-4">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 shadow-card hover:shadow-gold/10 transition-all active:scale-[0.98]"
          >
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", s.color)}>
              <s.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-body font-semibold">{s.label}</p>
              <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReprogramacaoPage;
