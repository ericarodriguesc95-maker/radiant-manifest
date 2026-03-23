import { useState } from "react";
import { ArrowLeft, Play, ChevronRight, Sparkles, Heart, Brain, BookOpen, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import LeiAtracaoExercises from "@/components/mental/LeiAtracaoExercises";
import HooponoponoPlayer from "@/components/mental/HooponoponoPlayer";
import MeditacoesGuiadas from "@/components/mental/MeditacoesGuiadas";
import NeurocienciaPNL from "@/components/mental/NeurocienciaPNL";

type Section = "menu" | "fundamentos" | "lei-atracao" | "hooponopono" | "meditacoes" | "neurociencia";

const sections = [
  { id: "fundamentos" as Section, icon: BookOpen, label: "Fundamentos", desc: "O que é cada técnica e como reprograma o cérebro", color: "bg-gold/10 text-gold" },
  { id: "meditacoes" as Section, icon: Play, label: "Meditações Guiadas", desc: "20 meditações com frequências Hz e sons da natureza", color: "bg-blue-500/10 text-blue-500" },
  { id: "hooponopono" as Section, icon: Heart, label: "Ho'oponopono", desc: "Limpeza energética com fundo musical e voz guiada", color: "bg-pink-500/10 text-pink-500" },
  { id: "lei-atracao" as Section, icon: Sparkles, label: "Lei da Atração & RAS", desc: "20 exercícios: visualização, journaling e manifestação", color: "bg-gold/10 text-gold" },
  { id: "neurociencia" as Section, icon: Brain, label: "Neurociência & PNL", desc: "10 PNL + 10 Neuro: ancoragem, foco, regulação emocional", color: "bg-purple-500/10 text-purple-500" },
];

const fundamentos = [
  {
    title: "Meditação",
    icon: "🧘‍♀️",
    what: "A meditação é uma prática milenar de foco atencional que treina o cérebro a regular emoções e pensamentos. Não é 'esvaziar a mente', mas sim direcionar a atenção de forma intencional.",
    neuro: "Estudos de Harvard (2011) mostraram que 8 semanas de meditação aumentam a densidade de massa cinzenta no hipocampo (memória e aprendizado) e reduzem o volume da amígdala (centro do medo e estresse). A prática regular diminui cortisol em até 23% e aumenta GABA, o neurotransmissor calmante natural do corpo.",
    tip: "Comece com 5 min no Uber ou antes do café. Não precisa de silêncio perfeito — use fones e feche os olhos."
  },
  {
    title: "Ho'oponopono",
    icon: "💜",
    what: "Prática havaiana ancestral de reconciliação e perdão baseada em 4 frases: 'Sinto muito, Me perdoe, Eu te amo, Sou grata'. É uma técnica de limpeza de memórias e crenças subconscientes.",
    neuro: "A repetição de mantras ativa o córtex pré-frontal e reduz a atividade da Default Mode Network (rede neural do 'piloto automático' e ruminação). Estudos mostram que a prática de perdão reduz inflamação crônica (marcador IL-6) e melhora a variabilidade cardíaca (HRV), indicador de resiliência emocional.",
    tip: "Repita mentalmente as 4 frases durante banho quente ou antes de dormir — momentos em que o subconsciente está mais receptivo."
  },
  {
    title: "Lei da Atração & RAS",
    icon: "✨",
    what: "A Lei da Atração, sob a ótica da neurociência, é explicada pelo Sistema Ativador Reticular (RAS) — um filtro no tronco cerebral que decide quais informações chegam à consciência. Quando você define um foco claro (meta, desejo), o RAS começa a filtrar oportunidades alinhadas.",
    neuro: "O RAS processa ~11 milhões de bits de informação por segundo, mas só ~50 bits chegam à consciência. Ao praticar visualização e journaling, você 'programa' o RAS para priorizar informações relevantes às suas metas. É como quando você decide comprar um carro vermelho e começa a ver carros vermelhos em todo lugar — não é 'atração', é atenção seletiva neurocientificamente comprovada.",
    tip: "Escreva suas metas em detalhes sensoriais toda manhã. O RAS precisa de repetição e emoção para recalibrar seus filtros."
  },
  {
    title: "PNL (Programação Neurolinguística)",
    icon: "🧠",
    what: "A PNL estuda como a linguagem e os padrões mentais influenciam o comportamento. Técnicas como Ancoragem, Reenquadramento e Modelagem permitem reprogramar respostas automáticas e crenças limitantes.",
    neuro: "A neuroplasticidade comprova que o cérebro forma novos caminhos neurais a cada repetição de pensamento ou comportamento. A Ancoragem funciona por condicionamento pavloviano — associar estímulo (gesto) a resposta (estado emocional). O Reenquadramento ativa o córtex pré-frontal dorsolateral, responsável pela reavaliação cognitiva, literalmente 'reconstruindo' a interpretação de eventos.",
    tip: "Use Ancoragem 5 min antes de uma apresentação ou reunião importante. Pressione polegar+indicador lembrando de um momento de confiança máxima."
  },
  {
    title: "Neurociência Aplicada",
    icon: "⚡",
    what: "A neurociência aplicada ao bem-estar utiliza descobertas sobre neuroplasticidade, neuroquímica e ritmos cerebrais para otimizar foco, sono, regulação emocional e performance cognitiva no dia a dia.",
    neuro: "Técnicas como respiração 4-7-8 ativam o nervo vago e o sistema nervoso parassimpático, reduzindo cortisol em minutos. O Pomodoro Neuro-Sinergético alterna entre ondas Beta (foco) e Alpha (descanso criativo), otimizando a consolidação de memória. A exposição a frequências como 432Hz e 528Hz sincroniza ondas cerebrais via entrainment auditivo.",
    tip: "A respiração 4-7-8 funciona até no trânsito: inspire 4s pelo nariz, segure 7s, expire 8s pela boca. Em 3 ciclos, o cortisol já diminui."
  },
];

const ReprogramacaoPage = () => {
  const [activeSection, setActiveSection] = useState<Section>("menu");
  const navigate = useNavigate();

  if (activeSection === "lei-atracao") return <LeiAtracaoExercises onBack={() => setActiveSection("menu")} />;
  if (activeSection === "hooponopono") return <HooponoponoPlayer onBack={() => setActiveSection("menu")} />;
  if (activeSection === "meditacoes") return <MeditacoesGuiadas onBack={() => setActiveSection("menu")} />;
  if (activeSection === "neurociencia") return <NeurocienciaPNL onBack={() => setActiveSection("menu")} />;

  if (activeSection === "fundamentos") {
    return (
      <div className="min-h-screen">
        <header className="px-5 pt-12 pb-2">
          <button onClick={() => setActiveSection("menu")} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <h1 className="text-xl font-display font-bold">Fundamentos <span className="text-gold">✦</span></h1>
          <p className="text-xs text-muted-foreground font-body mt-1">Entenda a ciência por trás de cada técnica</p>
        </header>
        <div className="px-5 space-y-4 pb-8">
          {fundamentos.map((f, i) => (
            <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-card space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{f.icon}</span>
                <h2 className="text-base font-display font-bold">{f.title}</h2>
              </div>
              <div>
                <p className="text-[11px] font-body font-semibold text-gold uppercase tracking-wider mb-1">O que é</p>
                <p className="text-sm font-body text-foreground leading-relaxed">{f.what}</p>
              </div>
              <div className="bg-purple-500/5 rounded-xl p-3 border border-purple-500/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Brain className="h-3.5 w-3.5 text-purple-500" />
                  <p className="text-[11px] font-body font-semibold text-purple-500 uppercase tracking-wider">Neurociência</p>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{f.neuro}</p>
              </div>
              <div className="bg-gold/5 rounded-xl p-3 border border-gold/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Info className="h-3.5 w-3.5 text-gold" />
                  <p className="text-[11px] font-body font-semibold text-gold uppercase tracking-wider">Dica prática</p>
                </div>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{f.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
