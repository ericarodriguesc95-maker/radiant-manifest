import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, Target, Zap, Wallet, Users, User,
  ChevronRight, ChevronLeft, X, Sparkles, MapPin
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
    description: "A Home é o coração do Glow Up! Aqui você encontra o resumo do seu dia: hábitos, streak, afirmações, devocional e planejamento mensal.",
    tips: [
      "Marque hábitos diários para manter seu streak 🔥",
      "Ganhe medalhas de bronze, prata e ouro pela consistência",
      "Compartilhe conquistas direto na comunidade",
      "Ícone 🎁 mostra novidades do app",
    ],
    color: "from-amber-500 to-orange-600",
    emoji: "🏠",
  },
  {
    icon: BookOpen,
    tab: "Diário",
    route: "/diario",
    title: "Seu Bloco de Notas",
    description: "Escreva seu diário pessoal, anote insights de reuniões, listas de mercado ou qualquer ideia. Cada nota tem título e cor personalizáveis!",
    tips: [
      "Toque em '+ Nova nota' para criar",
      "Escolha entre 10 cores para organizar por tema",
      "Use como diário, lista de tarefas ou brainstorm",
      "Tudo salvo na nuvem automaticamente ☁️",
    ],
    color: "from-violet-500 to-purple-600",
    emoji: "📝",
  },
  {
    icon: Target,
    tab: "Metas",
    route: "/metas",
    title: "Metas & Vision Board",
    description: "Defina seus objetivos com prazos e acompanhe o progresso. Crie um quadro de visão com imagens dos seus sonhos!",
    tips: [
      "Crie metas com título, descrição e prazo",
      "Acompanhe o progresso de cada meta",
      "Vision Board: adicione imagens inspiradoras",
      "Visualize diariamente para manifestar ✨",
    ],
    color: "from-emerald-500 to-teal-600",
    emoji: "🎯",
  },
  {
    icon: Zap,
    tab: "Performance",
    route: "/alta-performance",
    title: "Alta Performance",
    description: "Ferramentas para alcançar sua melhor versão! Reprogramação mental, neurociência, PNL, meditações guiadas e Lei da Atração.",
    tips: [
      "Meditações guiadas para foco e relaxamento",
      "Ho'oponopono — técnica de cura e perdão",
      "Exercícios de PNL e neurociência",
      "Lei da Atração com visualizações práticas 🧠",
    ],
    color: "from-yellow-500 to-amber-600",
    emoji: "⚡",
  },
  {
    icon: Wallet,
    tab: "Finanças",
    route: "/financas",
    title: "Finanças Pessoais",
    description: "Controle suas receitas e despesas de forma simples. Visualize seu saldo e mantenha sua vida financeira organizada!",
    tips: [
      "Registre receitas (entradas) e despesas (saídas)",
      "Saldo calculado automaticamente",
      "Histórico completo de transações",
      "Organize sua vida financeira 💰",
    ],
    color: "from-green-500 to-emerald-600",
    emoji: "💰",
  },
  {
    icon: Users,
    tab: "Girls",
    route: "/comunidade",
    title: "Comunidade & Stories",
    description: "Sua rede social exclusiva! Poste textos, fotos, áudios, figurinhas e GIFs. Crie stories como no Instagram, siga girls e interaja!",
    tips: [
      "Stories no topo: texto ou foto com fontes personalizáveis",
      "Use @ para mencionar amigas nos posts",
      "Reaja com figurinhas, GIFs e emojis 😊",
      "Siga girls e veja quem está online em tempo real",
    ],
    color: "from-pink-500 to-rose-600",
    emoji: "👯",
  },
  {
    icon: User,
    tab: "Perfil",
    route: "/perfil",
    title: "Seu Perfil Social",
    description: "Personalize seu perfil com foto, capa arrastável, bio com links clicáveis e veja seus seguidores. É sua identidade no Glow Up!",
    tips: [
      "Arraste a capa para reposicionar a imagem",
      "Cole links na bio — ficam clicáveis automaticamente",
      "Veja seus posts, seguidores e quem você segue",
      "Visite o perfil de outras girls pela comunidade 💖",
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
              Bem-vinda ao Glow Up!
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
