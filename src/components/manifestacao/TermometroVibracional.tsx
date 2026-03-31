import { useState, useEffect } from "react";
import { Thermometer, TrendingUp, Mic, MicOff, Sparkles, Star, Lightbulb, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STORAGE_KEY = "glow-termometro";

interface DailyEntry {
  date: string;
  emotions: string[];
  level: number;
}

const emotionOptions = [
  "Gratidão", "Alegria", "Esperança", "Amor", "Paz",
  "Confiança", "Força", "Ansiedade", "Tristeza", "Medo",
  "Raiva", "Frustração", "Cansaço", "Solidão",
];

const vibeZones = [
  { level: 1, label: "Sombra", color: "bg-gray-500", textColor: "text-gray-400", emoji: "🌑" },
  { level: 2, label: "Transição", color: "bg-orange-500", textColor: "text-orange-400", emoji: "🌗" },
  { level: 3, label: "Força", color: "bg-yellow-500", textColor: "text-yellow-400", emoji: "⚡" },
  { level: 4, label: "Amor", color: "bg-green-500", textColor: "text-green-400", emoji: "💚" },
  { level: 5, label: "Luz", color: "bg-gold", textColor: "text-gold", emoji: "✨" },
];

const moodTips: Record<number, string[]> = {
  1: [
    "Permita-se sentir. Respire fundo 5 vezes e coloque uma mão no coração. Você está segura.",
    "Tome um banho quente, coloque uma música suave e se abrace. Amanhã é um novo dia.",
    "Escreva o que sente sem julgamento. A cura começa quando damos nome à dor.",
  ],
  2: [
    "Faça uma caminhada de 10 minutos ao ar livre. O movimento muda a energia.",
    "Ouça uma meditação guiada de 5 minutos. Sua vibração está subindo.",
    "Escreva 3 coisas pelas quais você é grata, mesmo que pequenas.",
  ],
  3: [
    "Você está no caminho certo! Uma afirmação poderosa pode elevar ainda mais sua energia.",
    "Pratique visualização por 5 minutos: imagine seu dia perfeito em detalhes.",
    "Compartilhe uma gentileza com alguém hoje. Dar eleva sua frequência.",
  ],
  4: [
    "Sua vibração está linda! Mantenha esse estado praticando gratidão antes de dormir.",
    "Aproveite essa energia para criar, planejar ou manifestar algo importante.",
    "Você está irradiando amor. Continue nutrindo seus relacionamentos e autocuidado.",
  ],
  5: [
    "Você está brilhando! ✨ Use essa energia para materializar seus maiores sonhos.",
    "Estado de pura luz! Compartilhe essa vibração com o mundo ao seu redor.",
    "Momento perfeito para fazer seu ritual de manifestação. O universo está conspirando a seu favor!",
  ],
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getSavedEntries(): DailyEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function normalize(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function getRandomTip(level: number): string {
  const tips = moodTips[level] || moodTips[3];
  return tips[Math.floor(Math.random() * tips.length)];
}

export default function TermometroVibracional() {
  const [entries, setEntries] = useState<DailyEntry[]>(getSavedEntries);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [level, setLevel] = useState(3);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const todayEntry = entries.find(e => e.date === getToday());
  const [saved, setSaved] = useState(!!todayEntry);

  const voice = useVoiceInput({
    onResult: (result) => {
      const spoken = normalize(result);
      for (const emotion of emotionOptions) {
        if (spoken.includes(normalize(emotion)) && !selectedEmotions.includes(emotion)) {
          if (selectedEmotions.length < 3) {
            setSelectedEmotions(prev => [...prev, emotion]);
          }
          break;
        }
      }
    },
  });

  useEffect(() => {
    if (todayEntry) {
      setSelectedEmotions(todayEntry.emotions);
      setLevel(todayEntry.level);
    }
  }, []);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(emotion)) return prev.filter(e => e !== emotion);
      if (prev.length >= 3) return prev;
      return [...prev, emotion];
    });
  };

  const saveEntry = () => {
    const entry: DailyEntry = { date: getToday(), emotions: selectedEmotions, level };
    const updated = entries.filter(e => e.date !== getToday());
    updated.push(entry);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setCurrentTip(getRandomTip(level));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const currentZone = vibeZones.find(z => z.level === level) || vibeZones[2];

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return { entry: entries.find(e => e.date === dateStr) || null, date: new Date(d) };
  });

  // Past entries sorted by date descending (excluding today)
  const pastEntries = entries
    .filter(e => e.date !== getToday())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center mx-auto">
          <Thermometer className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Termômetro Vibracional</h3>
        <p className="text-xs font-body text-muted-foreground">Consciência emocional real</p>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 animate-scale-in">
            <div className="text-6xl animate-bounce">{currentZone.emoji}</div>
            <div className="space-y-1">
              <p className="text-lg font-display font-bold text-foreground">Vibração registrada!</p>
              <p className={cn("text-sm font-body font-semibold", currentZone.textColor)}>
                Zona de {currentZone.label}
              </p>
            </div>
            {/* Floating particles */}
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animation: `float-up ${1.5 + Math.random()}s ease-out forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  opacity: 0,
                }}
              >
                {["✨", "🌟", "💫", "⭐", "🔮", "💛"][i % 6]}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vibration scale */}
      <div className="glass-gold rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider text-center">Sua Vibração de Hoje</p>
        <div className="flex items-center gap-1 h-5 rounded-full overflow-hidden">
          {vibeZones.map(z => (
            <div key={z.level} className={cn("h-full flex-1 transition-all duration-500", z.color, level >= z.level ? "opacity-100" : "opacity-20")} />
          ))}
        </div>
        <div className="flex justify-between px-1">
          {vibeZones.map(z => (
            <button
              key={z.level}
              onClick={() => setLevel(z.level)}
              className={cn(
                "text-[9px] font-body transition-all duration-300",
                level === z.level ? z.textColor + " font-bold scale-110" : "text-muted-foreground"
              )}
            >
              <span className="block text-base mb-0.5">{z.emoji}</span>
              {z.label}
            </button>
          ))}
        </div>
        <div className="text-center">
          <p className={cn("text-lg font-display font-bold transition-all duration-500", currentZone.textColor)}>
            Zona de {currentZone.label}
          </p>
        </div>
      </div>

      {/* Emotions picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-body font-semibold">Emoções mais presentes <span className="text-muted-foreground">(máx 3)</span></p>
          {voice.isSupported && (
            <button
              onClick={voice.toggle}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-body font-semibold transition-all",
                voice.isListening
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
              )}
            >
              {voice.isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              {voice.isListening ? "Parar" : "Ditar emoção"}
            </button>
          )}
        </div>
        {voice.isListening && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[9px] font-body text-red-400">Fale o nome da emoção: ex. "Gratidão", "Paz"...</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map(emotion => {
            const isSelected = selectedEmotions.includes(emotion);
            return (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-body transition-all duration-300",
                  isSelected
                    ? "bg-gold text-background font-semibold scale-105 shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                {emotion}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <Button
        onClick={saveEntry}
        className={cn(
          "w-full font-body font-semibold transition-all duration-300",
          saved
            ? "bg-green-500 hover:bg-green-500/90 text-background"
            : "bg-gold hover:bg-gold/90 text-background"
        )}
        disabled={selectedEmotions.length === 0}
      >
        {saved ? (
          <>
            <Star className="h-4 w-4 mr-2" />
            Atualizar registro
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Registrar vibração
          </>
        )}
      </Button>

      {/* Tip card */}
      {saved && currentTip && (
        <div className="glass-gold rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-gold" />
            <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">Dica para você</p>
          </div>
          <p className="text-xs font-body text-foreground/80 leading-relaxed">{currentTip}</p>
        </div>
      )}

      {/* Weekly chart */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold" />
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">Últimos 7 dias</span>
        </div>
        <div className="flex items-end gap-1.5 h-20 justify-between">
          {last7.map(({ entry, date }, i) => {
            const h = entry ? (entry.level / 5) * 100 : 10;
            const dayLabel = date.toLocaleDateString("pt-BR", { weekday: "narrow" });
            const isToday = date.toISOString().slice(0, 10) === getToday();
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    entry ? vibeZones[(entry.level || 1) - 1].color : "bg-muted/30",
                    isToday && "ring-2 ring-gold/50 ring-offset-1 ring-offset-background rounded-md"
                  )}
                  style={{ height: `${h}%`, minHeight: "4px" }}
                />
                <span className={cn("text-[8px] font-body", isToday ? "text-gold font-bold" : "text-muted-foreground")}>{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Past entries history */}
      <div className="space-y-3">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl glass hover:bg-muted/30 transition-all"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gold" />
            <span className="text-xs font-body font-semibold">Histórico de humor</span>
          </div>
          <span className="text-[10px] font-body text-muted-foreground">{pastEntries.length} registros</span>
        </button>

        {showHistory && pastEntries.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            {pastEntries.map((entry) => {
              const zone = vibeZones.find(z => z.level === entry.level) || vibeZones[2];
              const entryDate = new Date(entry.date + "T12:00:00");
              return (
                <div key={entry.date} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="text-xl">{zone.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-body font-semibold text-foreground">
                        {format(entryDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <span className={cn("text-[9px] font-body font-bold px-1.5 py-0.5 rounded-full", zone.textColor, `${zone.color}/20`)}>
                        {zone.label}
                      </span>
                    </div>
                    <p className="text-[10px] font-body text-muted-foreground truncate">
                      {entry.emotions.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-0.5">
                    {vibeZones.map(z => (
                      <div
                        key={z.level}
                        className={cn("h-3 w-1.5 rounded-full", z.color, entry.level >= z.level ? "opacity-100" : "opacity-20")}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showHistory && pastEntries.length === 0 && (
          <p className="text-center text-[10px] font-body text-muted-foreground py-4">
            Nenhum registro anterior ainda. Continue registrando diariamente! ✨
          </p>
        )}
      </div>
    </div>
  );
}
