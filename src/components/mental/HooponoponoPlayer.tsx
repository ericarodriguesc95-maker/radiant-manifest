import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Heart, Volume2, VolumeX, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const mantras = [
  {
    phrase: "Sinto muito",
    meaning: "Reconhecimento: você reconhece que uma memória dolorosa está ativa dentro de você. Não é culpa — é consciência. Na neurociência, esse ato de reconhecimento ativa o córtex cingulado anterior, reduzindo a reatividade emocional automática.",
    duration: 6000,
  },
  {
    phrase: "Me perdoe",
    meaning: "Responsabilidade: ao pedir perdão, você assume a responsabilidade de limpar essa memória. Estudos da Universidade de Wisconsin mostram que a prática de perdão reduz biomarcadores de estresse crônico e melhora a imunidade.",
    duration: 6000,
  },
  {
    phrase: "Eu te amo",
    meaning: "Transmutação: o amor é a frequência mais alta de cura. Ao enviar amor à memória dolorosa, você ativa a liberação de ocitocina e serotonina, neuroquímicos associados à conexão e bem-estar profundo.",
    duration: 6000,
  },
  {
    phrase: "Sou grata",
    meaning: "Gratidão: fecha o ciclo de cura. A gratidão ativa o sistema de recompensa do cérebro (núcleo accumbens), criando um padrão neural positivo que substitui a memória dolorosa. Pesquisas da UCLA confirmam que gratidão regular aumenta a produção de dopamina em até 25%.",
    duration: 6000,
  },
];

export default function HooponoponoPlayer({ onBack }: { onBack: () => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMantra, setCurrentMantra] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceGender, setVoiceGender] = useState<"female" | "male">("female");
  const [showMeaning, setShowMeaning] = useState(true);
  const [bgMusicOn, setBgMusicOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [totalSessions, setTotalSessions] = useState(() => {
    try { return parseInt(localStorage.getItem("hooponopono-sessions") || "0"); } catch { return 0; }
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mantraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
  }, []);

  // Background ambient tone (gentle 396Hz — frequency of liberation)
  useEffect(() => {
    if (isPlaying && bgMusicOn) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 396; // Liberation frequency
      gain.gain.value = 0.04;
      // Add subtle modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.1;
      lfoGain.gain.value = 0.01;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;

      return () => { try { ctx.close(); } catch {} audioCtxRef.current = null; };
    } else {
      if (audioCtxRef.current) { try { audioCtxRef.current.close(); } catch {} audioCtxRef.current = null; }
    }
  }, [isPlaying, bgMusicOn]);

  const speakMantra = useCallback((text: string, onEnd?: () => void) => {
    if (!voiceEnabled) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const ptVoices = voices.filter(v => v.lang.startsWith("pt"));
    const voice = ptVoices[0] || voices[0];
    if (voice) utterance.voice = voice;
    utterance.lang = "pt-BR";
    utterance.rate = 0.7;
    utterance.pitch = voiceGender === "female" ? 1.2 : 0.85;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, voiceGender]);

  const advanceMantra = useCallback(() => {
    setCurrentMantra(prev => {
      const next = (prev + 1) % mantras.length;
      if (next === 0) {
        setCycles(c => {
          const newC = c + 1;
          if (newC > 0 && newC % 3 === 0) {
            const newTotal = totalSessions + 1;
            setTotalSessions(newTotal);
            localStorage.setItem("hooponopono-sessions", String(newTotal));
          }
          return newC;
        });
      }
      return next;
    });
  }, [totalSessions]);

  // Mantra cycle with voice
  useEffect(() => {
    if (!isPlaying) return;

    speakMantra(mantras[currentMantra].phrase, () => {
      mantraTimeoutRef.current = setTimeout(advanceMantra, 3000);
    });

    return () => { if (mantraTimeoutRef.current) clearTimeout(mantraTimeoutRef.current); };
  }, [isPlaying, currentMantra, speakMantra, advanceMantra]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentMantra(0);
    setCycles(0);
    setElapsed(0);
    window.speechSynthesis.cancel();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <button onClick={() => { reset(); onBack(); }} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Ho'oponopono <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Prática de limpeza e reconciliação interior</p>
        <p className="text-[10px] text-gold font-body">{totalSessions} sessões completadas</p>
      </header>

      <div className="px-5 pb-6 flex flex-col items-center">
        {/* Circular display */}
        <div className="relative w-56 h-56 flex items-center justify-center my-6">
          <div className={cn("absolute inset-0 rounded-full border-2 transition-all duration-1000", isPlaying ? "border-gold/60 shadow-gold" : "border-border")} />
          {isPlaying && (
            <>
              <div className="absolute inset-2 rounded-full border border-gold/20 animate-pulse" />
              <div className="absolute inset-5 rounded-full border border-gold/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
            </>
          )}
          <div className="text-center z-10">
            <Heart className={cn("h-6 w-6 mx-auto mb-2 transition-all", isPlaying ? "text-gold animate-pulse" : "text-muted-foreground")} />
            <p className={cn("text-2xl font-display font-bold transition-all", isPlaying ? "text-gold" : "text-foreground")}>
              {mantras[currentMantra].phrase}
            </p>
            {isSpeaking && (
              <div className="flex items-center justify-center gap-1 mt-2 animate-pulse">
                {[1, 2, 3, 2, 1].map((h, i) => <div key={i} className="rounded-full bg-gold" style={{ height: `${h * 3}px`, width: "2px" }} />)}
              </div>
            )}
            <p className="text-xs text-muted-foreground font-body mt-2">{formatTime(elapsed)} · {cycles}x ciclos</p>
          </div>
        </div>

        {/* Mantra indicators */}
        <div className="flex gap-3 mb-4">
          {mantras.map((_, i) => (
            <div key={i} className={cn("h-2 w-2 rounded-full transition-all", i === currentMantra ? "bg-gold scale-125" : "bg-muted")} />
          ))}
        </div>

        {/* Meaning card */}
        {showMeaning && (
          <div className="bg-card rounded-2xl border border-border p-4 w-full mb-4 animate-fade-in">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="h-3.5 w-3.5 text-gold" />
              <p className="text-[11px] font-body font-semibold text-gold uppercase tracking-wider">Significado</p>
            </div>
            <p className="text-xs font-body text-muted-foreground leading-relaxed">{mantras[currentMantra].meaning}</p>
          </div>
        )}

        {/* Settings */}
        <div className="w-full space-y-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            {(["female", "male"] as const).map(g => (
              <button key={g} onClick={() => setVoiceGender(g)} className={cn("text-[10px] font-body px-3 py-1 rounded-full border transition-all", voiceGender === g ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
                {g === "female" ? "👩 Feminina" : "👨 Masculina"}
              </button>
            ))}
            <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
              {voiceEnabled ? <Volume2 className="h-4 w-4 text-gold" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setBgMusicOn(!bgMusicOn)} className={cn("text-[10px] font-body px-3 py-1 rounded-full border transition-all", bgMusicOn ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
              🎵 396Hz (Liberação)
            </button>
            <button onClick={() => setShowMeaning(!showMeaning)} className={cn("text-[10px] font-body px-3 py-1 rounded-full border transition-all", showMeaning ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
              📖 Significados
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button onClick={reset} className="h-12 w-12 rounded-full bg-card border border-border flex items-center justify-center shadow-card">
            <RotateCcw className="h-5 w-5 text-muted-foreground" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="h-16 w-16 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            {isPlaying ? <Pause className="h-6 w-6 text-primary-foreground" /> : <Play className="h-6 w-6 text-primary-foreground ml-0.5" />}
          </button>
          <div className="h-12 w-12" />
        </div>

        {/* Dica prática */}
        <div className="mt-6 bg-gold/5 rounded-2xl border border-gold/10 p-4 w-full">
          <p className="text-[11px] font-body font-semibold text-gold uppercase tracking-wider mb-1">💡 Dica prática</p>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            Repita durante o banho quente ou antes de dormir — momentos em que o subconsciente está mais receptivo. Pesquisas mostram que a prática consistente de Ho'oponopono por 21 dias reduz marcadores de inflamação e melhora a qualidade do sono em até 40%.
          </p>
        </div>
      </div>
    </div>
  );
}
