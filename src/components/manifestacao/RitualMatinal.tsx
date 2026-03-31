import { useState, useCallback } from "react";
import { Sun, CheckCircle2, Circle, Sparkles, Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoiceInput } from "@/hooks/useVoiceInput";

const STORAGE_KEY = "glow-ritual-matinal";

interface RitualStep {
  id: string;
  label: string;
  placeholder: string;
}

const steps: RitualStep[] = [
  { id: "gratidao", label: "🙏 Gratidão", placeholder: "Escreva 3 coisas pelas quais é grata hoje..." },
  { id: "intencao", label: "🎯 Intenção do Dia", placeholder: "Qual é sua intenção para hoje?" },
  { id: "afirmacao", label: "✨ Afirmação", placeholder: "Escreva uma afirmação poderosa..." },
  { id: "emocao", label: "💛 Como quero me sentir", placeholder: "Que emoção quer cultivar hoje?" },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getSaved(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data._date !== getToday()) return {};
    return data;
  } catch { return {}; }
}

export default function RitualMatinal() {
  const [answers, setAnswers] = useState<Record<string, string>>(getSaved);
  const [activeVoiceStep, setActiveVoiceStep] = useState<string | null>(null);

  const save = (key: string, value: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [key]: value, _date: getToday() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const voice = useVoiceInput({
    continuous: true,
    onResult: (result) => {
      if (activeVoiceStep) {
        save(activeVoiceStep, (answers[activeVoiceStep] || "") + (answers[activeVoiceStep] ? " " : "") + result);
      }
    },
    onEnd: () => setActiveVoiceStep(null),
  });

  const toggleVoiceForStep = useCallback((stepId: string) => {
    if (voice.isListening && activeVoiceStep === stepId) {
      voice.stop();
      setActiveVoiceStep(null);
    } else {
      if (voice.isListening) voice.stop();
      setActiveVoiceStep(stepId);
      setTimeout(() => voice.start(), 100);
    }
  }, [voice, activeVoiceStep]);

  const completed = steps.filter(s => (answers[s.id] || "").trim().length > 0).length;
  const allDone = completed === steps.length;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mx-auto">
          <Sun className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Ritual Matinal</h3>
        <p className="text-xs font-body text-muted-foreground">
          Em 5 minutos, alinhe sua vibração para o dia
        </p>
      </div>

      {/* Progress */}
      <div className="glass rounded-xl p-3 flex items-center gap-3">
        <div className="bg-muted rounded-full h-2 flex-1 overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-500"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-body font-semibold text-gold">{completed}/{steps.length}</span>
      </div>

      {allDone && (
        <div className="glass-gold rounded-xl p-4 text-center space-y-1 animate-fade-in">
          <Sparkles className="h-5 w-5 text-gold mx-auto" />
          <p className="text-sm font-display font-bold text-gold">Ritual completo! ✨</p>
          <p className="text-[10px] font-body text-muted-foreground">Sua vibração está alinhada para o dia</p>
        </div>
      )}

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const hasAnswer = (answers[step.id] || "").trim().length > 0;
          const isVoiceActive = voice.isListening && activeVoiceStep === step.id;
          return (
            <div
              key={step.id}
              className="glass rounded-xl p-4 space-y-2 animate-stagger"
              style={{ "--stagger": i } as React.CSSProperties}
            >
              <div className="flex items-center gap-2">
                {hasAnswer ? (
                  <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <span className="text-sm font-body font-semibold flex-1">{step.label}</span>
                {voice.isSupported && (
                  <button
                    onClick={() => toggleVoiceForStep(step.id)}
                    className={cn(
                      "p-1.5 rounded-full transition-all",
                      isVoiceActive
                        ? "bg-red-500/20 text-red-400 animate-pulse"
                        : "bg-gold/10 text-gold hover:bg-gold/20"
                    )}
                    title={isVoiceActive ? "Parar" : "Ditar por voz"}
                  >
                    {isVoiceActive ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              {isVoiceActive && (
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <p className="text-[9px] font-body text-red-400">Ouvindo...</p>
                </div>
              )}
              <textarea
                value={answers[step.id] || ""}
                onChange={e => save(step.id, e.target.value)}
                placeholder={step.placeholder}
                rows={2}
                className="w-full bg-muted/50 border border-border rounded-xl p-3 text-xs font-body outline-none resize-none placeholder:text-muted-foreground focus:border-gold/50 transition-colors"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
