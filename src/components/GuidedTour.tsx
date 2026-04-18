import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Target, Zap, Wallet, User,
  ChevronRight, ChevronLeft, X, Sparkles, MapPin,
  Crown, BookMarked, Heart, Trophy, Camera, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourStep {
  icon: React.ElementType;
  tab: string;
  route: string;
  title: string;
  description: string;
  tips: string[];
  color: string;
  emoji: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    icon: Home,
    tab: "Home",
    route: "/",
    title: "Sua Central de Comando",
    description: "A Home é o coração do Gloow Up Club! Hábitos, streak, afirmação, devocional, planejamento mensal e atalhos para tudo.",
    tips: [
      "Marque hábitos diários para manter seu streak 🔥",
      "Ganhe medalhas de bronze, prata e ouro pela consistência",
      "Ícone 🎁 mostra novidades retroativas do app",
      "Toque no mapa para refazer este tour quando quiser",
    ],
    color: "from-amber-500 to-orange-600",
    emoji: "🏠",
  },
  {
    icon: Crown,
    tab: "Elite",
    route: "/jornada-elite",
    title: "Jornada Elite Premium 👑",
    description: "Programa transformacional em níveis com módulos, vídeos, reflexões salvas e celebração com confete dourado a cada nível concluído.",
    tips: [
      "Faça o diagnóstico de arquétipo no início",
      "Cada módulo tem campo de reflexão que salva no banco",
      "Complete todos os módulos para ver a animação especial ✨",
      "Plano de aceleração personalizado pra você",
    ],
    color: "from-yellow-600 to-amber-700",
    emoji: "👑",
  },
  {
    icon: Sparkles,
    tab: "Manifestação",
    route: "/jornada",
    title: "Hub de Manifestação 🌟",
    description: "Escala de Hawkins, Termômetro Vibracional, Quadro dos Sonhos, Ritual Matinal e Frequências de Cura (Solfeggio).",
    tips: [
      "Termômetro Vibracional mede sua frequência diária",
      "Frequências 432Hz, 528Hz e mais com Web Audio API 🎵",
      "Ritual matinal de 5 minutos para começar elevada",
      "Manifestação escrita com guia passo a passo",
    ],
    color: "from-fuchsia-500 to-purple-600",
    emoji: "🌟",
  },
  {
    icon: BookMarked,
    tab: "Bíblia 365",
    route: "/biblia-365",
    title: "Bíblia em 365 Dias 📖",
    description: "Plano personalizado que começa no SEU primeiro acesso, com cronograma diário, calendário de progresso e Visão da Neurociência.",
    tips: [
      "Cronograma único que se adapta à sua data de início",
      "Marque cada capítulo lido e veja seu progresso",
      "Calendário visual mostra dias completos",
      "Reflexões com base científica em cada leitura",
    ],
    color: "from-indigo-500 to-blue-600",
    emoji: "📖",
  },
  {
    icon: Heart,
    tab: "Saúde",
    route: "/saude",
    title: "Saúde, Fitness & Ciclo 💖",
    description: "Calculadoras de proteína e água, dieta, treinos, suplementos, medicações e rastreador de ciclo menstrual com mapa de fases.",
    tips: [
      "Ciclo menstrual com previsão de período fértil 🌸",
      "Calculadoras automáticas de proteína e água",
      "Rastreio de suplementos e contraceptivos",
      "Dashboard semanal com tudo num lugar só",
    ],
    color: "from-rose-500 to-pink-600",
    emoji: "💖",
  },
  {
    icon: Trophy,
    tab: "Desafios",
    route: "/desafios",
    title: "Desafios Progressivos 🏆",
    description: "Jornadas de 7 a 90 dias temáticas (Mente, Corpo, Alma, Evolução) com base bíblica e neurocientífica.",
    tips: [
      "Escolha desafios de 7, 21, 30, 60 ou 90 dias",
      "Veja quantas girls estão no mesmo desafio",
      "Cada tarefa explica o porquê (ciência + fé)",
      "Compartilhe sua vitória na comunidade 💪",
    ],
    color: "from-orange-500 to-red-600",
    emoji: "🏆",
  },
  {
    icon: Zap,
    tab: "Performance",
    route: "/alta-performance",
    title: "Reprogramação Mental 🧠",
    description: "Neurociência + PNL, Ho'oponopono, Meditações Guiadas, Lei da Atração e Pomodoro com técnica Feynman.",
    tips: [
      "Meditações guiadas com voz pt-BR profissional 🎙️",
      "Hooponopono: técnica havaiana de cura e perdão",
      "60+ exercícios de PNL e neurociência",
      "Audio ducking inteligente nos players",
    ],
    color: "from-yellow-500 to-amber-600",
    emoji: "⚡",
  },
  {
    icon: Target,
    tab: "Metas",
    route: "/metas",
    title: "Metas SMART & Vision Board 🎯",
    description: "Defina objetivos com prazos, decompose em passos e visualize seus sonhos no quadro Pinterest.",
    tips: [
      "Metas SMART com decomposição em tarefas",
      "Vision Board grid 2 colunas estilo Pinterest 🎨",
      "Histórico de progresso com cálculo automático",
      "Manifestação diária integrada às metas",
    ],
    color: "from-emerald-500 to-teal-600",
    emoji: "🎯",
  },
  {
    icon: Wallet,
    tab: "Finanças",
    route: "/financas",
    title: "Finanças Inteligentes 💰",
    description: "Registros, cartão de crédito, AI assistant financeira e quiz de perfil com 4 arquétipos comportamentais.",
    tips: [
      "Quiz revela seu arquétipo financeiro",
      "AI assistant te dá dicas personalizadas 🤖",
      "Renda, despesas fixas e variáveis separadas",
      "Histórico mensal com gráficos e notas",
    ],
    color: "from-green-500 to-emerald-600",
    emoji: "💰",
  },
  {
    icon: Camera,
    tab: "Girls",
    route: "/comunidade",
    title: "Comunidade & Stories 👯",
    description: "Rede social privada com stories de 24h, posts com mídia, mensagens diretas, salas temáticas e leaderboard.",
    tips: [
      "Stories no topo: editor estilo Instagram 📸",
      "Mensagens diretas privadas com stickers e GIFs",
      "Salas temáticas para conversas em grupo",
      "Use @ para mencionar e ❤️ para reagir",
    ],
    color: "from-pink-500 to-rose-600",
    emoji: "👯",
  },
  {
    icon: Bot,
    tab: "AI",
    route: "/",
    title: "Assistente de IA Empática 🤖",
    description: "AI estilo Gemini com raciocínio fluido, memória de conversas e voz pt-BR (fale e ouça).",
    tips: [
      "Botão flutuante disponível em qualquer página",
      "Voz pt-BR com cadência natural 🎙️",
      "Memória de contexto entre mensagens",
      "Pergunte sobre rotina, manifestação, fé, saúde...",
    ],
    color: "from-violet-500 to-purple-600",
    emoji: "🤖",
  },
  {
    icon: BookOpen,
    tab: "Diário",
    route: "/diario",
    title: "Diário & Anotações 📝",
    description: "Bloco de notas pessoal com 10 cores, títulos editáveis e sync na nuvem.",
    tips: [
      "Crie notas com título e cor personalizada",
      "Use como diário, lista ou brainstorm",
      "Tudo salvo automaticamente ☁️",
      "Privacidade total: só você vê",
    ],
    color: "from-violet-500 to-purple-600",
    emoji: "📝",
  },
  {
    icon: User,
    tab: "Perfil",
    route: "/perfil",
    title: "Seu Perfil Social ✨",
    description: "Personalize foto, capa arrastável, bio com links clicáveis e gerencie seguidores.",
    tips: [
      "Arraste a capa para reposicionar",
      "Cole links na bio — viram clicáveis automaticamente",
      "Notificações push 5x/dia: 08h, 12h, 16h30, 20h, 23h30 🔔",
      "Visite perfis de outras girls pela comunidade 💖",
    ],
    color: "from-blue-500 to-indigo-600",
    emoji: "✨",
  },
];

interface GuidedTourProps {
  onClose: () => void;
}

export default function GuidedTour({ onClose }: GuidedTourProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(-1); // -1 = intro screen
  const [isAnimating, setIsAnimating] = useState(false);

  const goToStep = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      if (index >= 0 && index < TOUR_STEPS.length) {
        navigate(TOUR_STEPS[index].route === "/perfil" ? "/" : TOUR_STEPS[index].route);
      }
      setIsAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      goToStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > -1) {
      goToStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem("glow-tour-completed", "true");
    navigate("/");
    onClose();
  };

  // Intro screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card border border-border rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-scale-in">
          <div className="bg-gradient-gold p-8 text-center relative">
            <button onClick={handleFinish} className="absolute top-3 right-3 text-primary-foreground/60 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
            <div className="text-6xl mb-4">🦋</div>
            <h2 className="text-2xl font-heading font-bold text-primary-foreground">
              Bem-vinda ao Gloow Up Club!
            </h2>
            <p className="text-sm font-body text-primary-foreground/80 mt-2">
              Vamos fazer um tour rápido pelo app?
            </p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm font-body text-muted-foreground text-center leading-relaxed">
              Em poucos passos você vai conhecer cada seção e como usar todas as ferramentas para sua evolução pessoal.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {TOUR_STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{step.emoji}</span>
                  <span className="text-[9px] font-body text-muted-foreground">{step.tab}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={handleFinish} className="flex-1 text-muted-foreground">
                Pular
              </Button>
              <Button variant="gold" size="sm" onClick={handleNext} className="flex-1 gap-1.5">
                Começar tour <MapPin className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLast = currentStep === TOUR_STEPS.length - 1;
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={() => {}} />

      {/* Bottom nav highlight */}
      <div className="absolute bottom-0 left-0 right-0 z-[201] pointer-events-none">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-1">
          {TOUR_STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStep;
            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[48px] transition-all duration-300",
                  isActive
                    ? "text-gold scale-125 drop-shadow-lg"
                    : "text-muted-foreground/30 scale-90"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={cn("text-[9px] font-body", isActive ? "font-bold" : "font-normal")}>
                  {s.tab}
                </span>
                {isActive && (
                  <div className="absolute -top-1.5 h-1 w-6 bg-gold rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content card */}
      <div
        className={cn(
          "absolute left-4 right-4 bottom-24 z-[202] pointer-events-auto max-w-md mx-auto transition-all duration-200",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}
      >
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-gold transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step header */}
          <div className={cn("bg-gradient-to-r p-4 flex items-center gap-3", step.color)}>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl">{step.emoji}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-body text-white/70 uppercase tracking-widest">
                  {currentStep + 1}/{TOUR_STEPS.length}
                </span>
                <span className="text-[10px] font-body bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {step.tab}
                </span>
              </div>
              <h3 className="text-lg font-heading font-bold text-white mt-0.5">
                {step.title}
              </h3>
            </div>
            <button onClick={handleFinish} className="text-white/60 hover:text-white p-1">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description */}
          <div className="p-4 space-y-3">
            <p className="text-sm font-body text-foreground leading-relaxed">
              {step.description}
            </p>

            {/* Tips */}
            <div className="space-y-2">
              {step.tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Sparkles className="h-3 w-3 text-gold mt-0.5 shrink-0" />
                  <span className="text-xs font-body text-muted-foreground leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToStep(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStep ? "w-6 bg-gold" : i < currentStep ? "w-1.5 bg-gold/40" : "w-1.5 bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-2 pt-1">
              {currentStep > 0 ? (
                <Button variant="ghost" size="sm" onClick={handlePrev} className="gap-1 text-muted-foreground">
                  <ChevronLeft className="h-3.5 w-3.5" /> Anterior
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleFinish} className="text-muted-foreground">
                  Pular tour
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="gold" size="sm" onClick={handleNext} className="gap-1.5">
                {isLast ? (
                  <>Concluir <Sparkles className="h-3.5 w-3.5" /></>
                ) : (
                  <>Próximo <ChevronRight className="h-3.5 w-3.5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
