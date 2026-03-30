import { useState } from "react";
import { ArrowLeft, Sun, Sparkles, Music, Thermometer, PenLine, Heart, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import RitualMatinal from "./RitualMatinal";
import EuSuperior from "./EuSuperior";
import FrequenciasCura from "./FrequenciasCura";
import TermometroVibracional from "./TermometroVibracional";
import ManifestacaoEscrita from "./ManifestacaoEscrita";

type View = "hub" | "ritual" | "eu-superior" | "frequencias" | "termometro" | "manifestacao-escrita";

const menuItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: "ritual", icon: Sun, label: "Começar meu dia" },
  { id: "eu-superior", icon: Sparkles, label: "Conversar com meu Eu Superior" },
  { id: "frequencias", icon: Music, label: "Preciso alinhar minha vibração" },
  { id: "manifestacao-escrita", icon: PenLine, label: "Escrever no meu diário vibracional" },
  { id: "termometro", icon: Thermometer, label: "Meu termômetro emocional" },
];

export default function ManifestacaoHub() {
  const [view, setView] = useState<View>("hub");

  if (view !== "hub") {
    const Component = {
      ritual: RitualMatinal,
      "eu-superior": EuSuperior,
      frequencias: FrequenciasCura,
      termometro: TermometroVibracional,
      "manifestacao-escrita": ManifestacaoEscrita,
    }[view];

    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setView("hub")}
          className="flex items-center gap-2 text-sm text-muted-foreground font-body mb-4 hover:text-gold transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <Component />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-widest">Manifestação Consciente</span>
        </div>
        <h2 className="text-xl font-display font-bold text-foreground">
          Meu Manifesto <span className="text-gold">Diário</span>
        </h2>
        <p className="text-xs font-body text-muted-foreground italic leading-relaxed max-w-xs mx-auto">
          "Tudo sempre dá certo pra mim!"
        </p>
        <p className="text-[10px] font-body text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Quote card */}
      <div className="glass-gold rounded-2xl p-4 text-center space-y-2">
        <Heart className="h-4 w-4 text-gold mx-auto" />
        <p className="text-xs font-body text-foreground/80 italic leading-relaxed">
          "Você não precisa de mais uma técnica. Você precisa ser cuidada todos os dias, enquanto constrói a realidade que deseja viver."
        </p>
      </div>

      {/* Menu buttons */}
      <div className="space-y-2.5">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gold/90 hover:bg-gold text-background font-body font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg animate-stagger"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Voice command hint */}
      <div className="flex items-center justify-center gap-2 py-2">
        <Mic className="h-3.5 w-3.5 text-gold/60" />
        <p className="text-[10px] font-body text-muted-foreground">
          Comando de voz disponível em cada seção
        </p>
      </div>

      {/* Benefits */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-body font-semibold text-gold uppercase tracking-wider">O que muda na sua vida</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: "Clareza imediata", desc: "Acorde sabendo o que quer" },
            { title: "Hábito favorito", desc: "Prazer em evoluir todo dia" },
            { title: "Conexão direta", desc: "Ouça suas respostas internas" },
            { title: "Vibração no bolso", desc: "Eleve sua frequência na hora" },
          ].map(b => (
            <div key={b.title} className="glass-gold rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-body font-semibold text-foreground">{b.title}</p>
              <p className="text-[10px] font-body text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
