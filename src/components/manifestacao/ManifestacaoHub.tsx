import { useState, useMemo, useCallback, useEffect } from "react";
import { ArrowLeft, Sun, Sparkles, Music, Thermometer, PenLine, Heart, Mic, ImageIcon, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import RitualMatinal from "./RitualMatinal";
import EuSuperior from "./EuSuperior";
import FrequenciasCura from "./FrequenciasCura";
import TermometroVibracional from "./TermometroVibracional";
import ManifestacaoEscrita from "./ManifestacaoEscrita";
import QuadroDosSonhos from "./QuadroDosSonhos";
import { dailyQuotes } from "./dailyQuotes";
import { speakWithPauses } from "@/lib/voiceUtils";

type View = "hub" | "ritual" | "eu-superior" | "frequencias" | "termometro" | "manifestacao-escrita" | "quadro-sonhos";

const menuItems: { id: View; icon: React.ElementType; label: string }[] = [
  { id: "ritual", icon: Sun, label: "Começar meu dia" },
  { id: "eu-superior", icon: Sparkles, label: "Conversar com meu Eu Superior" },
  { id: "frequencias", icon: Music, label: "Preciso alinhar minha vibração" },
  { id: "manifestacao-escrita", icon: PenLine, label: "Escrever no meu diário vibracional" },
  { id: "quadro-sonhos", icon: ImageIcon, label: "Meu quadro dos sonhos" },
  { id: "termometro", icon: Thermometer, label: "Escala de Hawkins — Minha frequência" },
];

export default function ManifestacaoHub() {
  const [view, setView] = useState<View>("hub");

  // Deep-link from floating Eu Superior bubble
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("openEuSuperior") === "1") {
      setView("eu-superior");
      try { localStorage.setItem("eu-superior-used", "1"); } catch {}
    }
  }, []);
  const [quoteIndex, setQuoteIndex] = useState(() => {
    const start = new Date(2024, 0, 1).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    return Math.floor((today - start) / 86400000) % dailyQuotes.length;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cancelSpeech, setCancelSpeech] = useState<(() => void) | null>(null);

  const todayQuote = dailyQuotes[quoteIndex];

  const handleNextQuote = () => {
    if (cancelSpeech) { cancelSpeech(); setCancelSpeech(null); setIsSpeaking(false); }
    setQuoteIndex((prev) => (prev + 1) % dailyQuotes.length);
  };

  const handleSpeakQuote = useCallback(() => {
    if (isSpeaking && cancelSpeech) {
      cancelSpeech();
      setCancelSpeech(null);
      setIsSpeaking(false);
      return;
    }
    const cancel = speakWithPauses(todayQuote, "female", {
      rate: 0.85,
      pitch: 0.95,
      onStart: () => setIsSpeaking(true),
      onEnd: () => { setIsSpeaking(false); setCancelSpeech(null); },
    });
    setCancelSpeech(() => cancel);
  }, [todayQuote, isSpeaking, cancelSpeech]);

  if (view !== "hub") {
    const Component = {
      ritual: RitualMatinal,
      "eu-superior": EuSuperior,
      frequencias: FrequenciasCura,
      termometro: TermometroVibracional,
      "manifestacao-escrita": ManifestacaoEscrita,
      "quadro-sonhos": QuadroDosSonhos,
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
          Minha Manifestação <span className="text-gold">Diária</span>
        </h2>
        <p className="text-xs font-body text-muted-foreground italic leading-relaxed max-w-xs mx-auto">
          "Tudo sempre dá certo pra mim!"
        </p>
        <p className="text-[10px] font-body text-muted-foreground">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Quote card */}
      <div className="glass-gold rounded-2xl p-4 text-center space-y-3">
        <Heart className="h-4 w-4 text-gold mx-auto" />
        <p className="text-xs font-body text-foreground/80 italic leading-relaxed min-h-[3rem]">
          "{todayQuote}"
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleSpeakQuote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-body font-semibold transition-all",
              isSpeaking
                ? "bg-gold text-background"
                : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
            )}
          >
            {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            {isSpeaking ? "Parar" : "Ouvir"}
          </button>
          <button
            onClick={handleNextQuote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-body font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all"
          >
            <RefreshCw className="h-3 w-3" />
            Próxima frase
          </button>
        </div>
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

      {/* Benefits & Neuroscience */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-body font-semibold text-gold uppercase tracking-wider">✨ Benefícios comprovados</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { title: "Reduz cortisol em 23%", desc: "Práticas de gratidão reduzem o hormônio do estresse (UCLA, 2023)" },
            { title: "Ativa o córtex pré-frontal", desc: "Visualização consciente fortalece as redes neurais da intenção" },
            { title: "Neuroplasticidade real", desc: "Repetição diária reconfigura padrões mentais em 21 dias" },
            { title: "Aumenta serotonina", desc: "Frequências de cura estimulam neurotransmissores do bem-estar" },
          ].map(b => (
            <div key={b.title} className="glass-gold rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-body font-semibold text-foreground">{b.title}</p>
              <p className="text-[10px] font-body text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-xs font-body font-semibold text-gold uppercase tracking-wider">🧠 O que a neurociência diz</p>
        <div className="space-y-2.5">
          {[
            "Escrever intenções ativa o Sistema Ativador Reticular (SAR), fazendo seu cérebro filtrar oportunidades alinhadas aos seus objetivos.",
            "A prática diária de visualização cria as mesmas conexões neurais que a experiência real — seu cérebro não diferencia o imaginado do vivido.",
            "Registrar emoções aumenta a inteligência emocional e reduz a reatividade da amígdala em até 50%.",
          ].map((text, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
              <p className="text-[11px] font-body text-foreground/80 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
