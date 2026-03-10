import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Play, Pause, SkipForward, Clock, Volume2, VolumeX } from "lucide-react";
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
      "Feche os olhos e respire profundamente, três vezes.",
      "Imagine-se em seu lugar seguro e confortável.",
      "Visualize sua vida ideal. Onde você está?",
      "Sinta as emoções dessa realidade. Alegria, paz, gratidão.",
      "Veja os detalhes. Cores, sons, texturas.",
      "Afirme com convicção: Essa é minha realidade agora.",
      "Respire fundo e agradeça por essa visão.",
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
      "Deite-se confortavelmente e feche os olhos.",
      "Relaxe os músculos do rosto e do maxilar.",
      "Solte os ombros e os braços completamente.",
      "Relaxe o abdômen e as pernas.",
      "Imagine uma luz dourada envolvendo todo o seu corpo.",
      "A cada respiração, a luz se torna mais brilhante.",
      "Permaneça nesse estado de paz total.",
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
      "Sente-se com a coluna ereta e feche os olhos.",
      "Imagine uma chuva de luz dourada caindo sobre você.",
      "Cada gota representa abundância em uma área da sua vida.",
      "Sinta gratidão por tudo que já conquistou.",
      "Visualize seus objetivos financeiros sendo realizados.",
      "Repita com carinho: Eu sou um ímã de prosperidade.",
      "Abra os olhos com um sorriso de gratidão.",
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
      "Coloque a mão sobre o coração e respire.",
      "Diga com amor: Eu me amo e me aceito completamente.",
      "Lembre de três qualidades que você admira em si mesma.",
      "Perdoe-se por qualquer erro do passado.",
      "Visualize-se abraçando sua versão mais jovem.",
      "Envie amor para cada parte do seu corpo.",
      "Agradeça por quem você é hoje.",
    ],
  },
];

function getPortugueseVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  // Prefer female Portuguese voices
  const ptFemale = voices.find(v => v.lang.startsWith("pt") && v.name.toLowerCase().includes("female"));
  const ptBR = voices.find(v => v.lang === "pt-BR");
  const pt = voices.find(v => v.lang.startsWith("pt"));
  return ptFemale || ptBR || pt || null;
}

export default function MeditacoesGuiadas({ onBack }: { onBack: () => void }) {
  const [activeMeditation, setActiveMeditation] = useState<Meditation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  const speakStep = useCallback((text: string, onEnd?: () => void) => {
    if (!voiceEnabled) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getPortugueseVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = "pt-BR";
    utterance.rate = 0.85;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      onEnd?.();
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const advanceToNextStep = useCallback(() => {
    if (!activeMeditation) return;
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= activeMeditation.steps.length) {
        setIsPlaying(false);
        window.speechSynthesis.cancel();
        return prev;
      }
      return next;
    });
  }, [activeMeditation]);

  // Speak current step when it changes during playback
  useEffect(() => {
    if (!isPlaying || !activeMeditation) return;

    const stepText = activeMeditation.steps[currentStep];
    const pauseAfterSpeech = 4000; // 4 seconds of silence between steps

    speakStep(stepText, () => {
      // After speech ends, wait a pause then advance
      autoAdvanceRef.current = setTimeout(() => {
        advanceToNextStep();
      }, pauseAfterSpeech);
    });

    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [isPlaying, currentStep, activeMeditation, speakStep, advanceToNextStep]);

  // Timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  const startMeditation = (m: Meditation) => {
    setActiveMeditation(m);
    setCurrentStep(0);
    setElapsed(0);
    setIsPlaying(false);
    window.speechSynthesis.cancel();
  };

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      window.speechSynthesis.cancel();
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    } else {
      setIsPlaying(true);
    }
  };

  const skipStep = () => {
    window.speechSynthesis.cancel();
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    advanceToNextStep();
  };

  const closeMeditation = () => {
    setActiveMeditation(null);
    setIsPlaying(false);
    setElapsed(0);
    window.speechSynthesis.cancel();
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
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
          <button onClick={closeMeditation} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeMeditation.emoji}</span>
              <h1 className="text-xl font-display font-bold">{activeMeditation.title}</h1>
            </div>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
            >
              {voiceEnabled ? (
                <Volume2 className="h-5 w-5 text-gold" />
              ) : (
                <VolumeX className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
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

          {/* Speaking indicator */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 mb-2 animate-pulse">
              <div className="h-1 w-1 rounded-full bg-gold" />
              <div className="h-2 w-1 rounded-full bg-gold" />
              <div className="h-3 w-1 rounded-full bg-gold" />
              <div className="h-2 w-1 rounded-full bg-gold" />
              <div className="h-1 w-1 rounded-full bg-gold" />
              <span className="text-[10px] text-gold font-body ml-1">falando...</span>
            </div>
          )}

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
              onClick={skipStep}
              className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card"
            >
              <SkipForward className="h-5 w-5 text-muted-foreground" />
            </button>
            <button
              onClick={togglePlay}
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
