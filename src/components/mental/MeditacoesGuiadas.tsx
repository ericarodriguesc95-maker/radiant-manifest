import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, SkipForward, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Meditation {
  id: string;
  title: string;
  description: string;
  duration: string;
  durationSec: number;
  emoji: string;
  steps: string[];
}

const meditations: Meditation[] = [
  {
    id: "1",
    title: "Visualização Criativa",
    description: "Visualize sua vida ideal com todos os sentidos",
    duration: "10 min",
    durationSec: 600,
    emoji: "🌟",
    steps: [
      "Feche os olhos e respire profundamente 3 vezes",
      "Imagine-se em seu lugar seguro e confortável",
      "Visualize sua vida ideal: onde você está?",
      "Sinta as emoções dessa realidade: alegria, paz, gratidão",
      "Veja os detalhes: cores, sons, texturas",
      "Afirme: 'Essa é minha realidade agora'",
      "Respire e agradeça por essa visão",
    ],
  },
  {
    id: "2",
    title: "Relaxamento Profundo",
    description: "Libere tensões e renove sua energia",
    duration: "15 min",
    durationSec: 900,
    emoji: "🧘‍♀️",
    steps: [
      "Deite-se confortavelmente e feche os olhos",
      "Relaxe os músculos do rosto e maxilar",
      "Solte os ombros e braços",
      "Relaxe o abdômen e pernas",
      "Imagine uma luz dourada envolvendo seu corpo",
      "A cada respiração, a luz se torna mais brilhante",
      "Permaneça nesse estado de paz total",
    ],
  },
  {
    id: "3",
    title: "Abundância e Prosperidade",
    description: "Atraia prosperidade para todas as áreas",
    duration: "8 min",
    durationSec: 480,
    emoji: "💰",
    steps: [
      "Sente-se com a coluna ereta e feche os olhos",
      "Imagine uma chuva de luz dourada caindo sobre você",
      "Cada gota representa abundância em uma área da vida",
      "Sinta gratidão por tudo que já conquistou",
      "Visualize seus objetivos financeiros realizados",
      "Repita: 'Eu sou um ímã de prosperidade'",
      "Abra os olhos com um sorriso de gratidão",
    ],
  },
  {
    id: "4",
    title: "Amor Próprio",
    description: "Reconecte-se com seu valor e beleza interior",
    duration: "12 min",
    durationSec: 720,
    emoji: "💕",
    steps: [
      "Coloque a mão sobre o coração e respire",
      "Diga: 'Eu me amo e me aceito completamente'",
      "Lembre de 3 qualidades que você admira em si",
      "Perdoe-se por qualquer erro do passado",
      "Visualize-se abraçando sua versão mais jovem",
      "Envie amor para cada parte do seu corpo",
      "Agradeça por quem você é hoje",
    ],
  },
];

export default function MeditacoesGuiadas({ onBack }: { onBack: () => void }) {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying && activeMeditation) {
      const stepDuration = Math.floor(activeMeditation.durationSec / activeMeditation.steps.length) * 1000;

      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);

      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= activeMeditation.steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, stepDuration);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isPlaying, activeMeditation]);

  const startMeditation = (m: Meditation) => {
    setActiveMeditation(m);
    setCurrentStep(0);
    setElapsed(0);
    setIsPlaying(false);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (activeMeditation) {
    const progress = activeMeditation.durationSec > 0 ? (elapsed / activeMeditation.durationSec) * 100 : 0;

    return (
      <div className="min-h-screen">
        <header className="px-5 pt-12 pb-4">
          <button onClick={() => { setActiveMeditation(null); setIsPlaying(false); setElapsed(0); }} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{activeMeditation.emoji}</span>
            <h1 className="text-xl font-display font-bold">{activeMeditation.title}</h1>
          </div>
        </header>

        <div className="px-5 pb-6 flex flex-col items-center">
          {/* Progress ring */}
          <div className="relative w-48 h-48 flex items-center justify-center my-6">
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
              <circle
                cx="50" cy="50" r="45" fill="none"
                stroke="hsl(var(--gold))"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${Math.PI * 90}`}
                strokeDashoffset={`${Math.PI * 90 * (1 - progress / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <p className="text-2xl font-display font-bold">{formatTime(elapsed)}</p>
              <p className="text-[10px] text-muted-foreground font-body">{activeMeditation.duration}</p>
            </div>
          </div>

          {/* Current step */}
          <div className="bg-card rounded-2xl border border-border p-5 w-full mb-6 min-h-[100px] flex items-center justify-center">
            <p className="text-center text-base font-display font-medium text-foreground leading-relaxed animate-fade-in" key={currentStep}>
              {activeMeditation.steps[currentStep]}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex gap-1.5 mb-6">
            {activeMeditation.steps.map((_, i) => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === currentStep ? "w-6 bg-gold" : i < currentStep ? "w-1.5 bg-gold/50" : "w-1.5 bg-muted")} />
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, activeMeditation.steps.length - 1))}
              className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card"
            >
              <SkipForward className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold"
            >
              {isPlaying ? <Pause className="h-6 w-6 text-primary-foreground" /> : <Play className="h-6 w-6 text-primary-foreground ml-0.5" />}
            </button>
            <div className="h-12 w-12" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Meditações Guiadas <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Escolha sua meditação e comece agora</p>
      </header>

      <div className="px-5 space-y-3 pb-6">
        {meditations.map(m => (
          <button
            key={m.id}
            onClick={() => startMeditation(m)}
            className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-4 shadow-card hover:shadow-gold/10 transition-all active:scale-[0.98]"
          >
            <span className="text-3xl">{m.emoji}</span>
            <div className="flex-1 text-left">
              <p className="text-sm font-body font-semibold">{m.title}</p>
              <p className="text-xs text-muted-foreground font-body">{m.description}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-[10px] font-body">{m.duration}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
