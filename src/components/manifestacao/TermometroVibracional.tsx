import { useState, useEffect } from "react";
import { Thermometer, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "glow-termometro";

interface DailyEntry {
  date: string;
  emotions: string[];
  level: number; // 1-5
}

const emotionOptions = [
  "Gratidão", "Alegria", "Esperança", "Amor", "Paz",
  "Confiança", "Força", "Ansiedade", "Tristeza", "Medo",
  "Raiva", "Frustração", "Cansaço", "Solidão",
];

const vibeZones = [
  { level: 1, label: "Sombra", color: "bg-gray-500", textColor: "text-gray-400" },
  { level: 2, label: "Transição", color: "bg-orange-500", textColor: "text-orange-400" },
  { level: 3, label: "Força", color: "bg-yellow-500", textColor: "text-yellow-400" },
  { level: 4, label: "Amor", color: "bg-green-500", textColor: "text-green-400" },
  { level: 5, label: "Luz", color: "bg-gold", textColor: "text-gold" },
];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getSavedEntries(): DailyEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

export default function TermometroVibracional() {
  const [entries, setEntries] = useState<DailyEntry[]>(getSavedEntries);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [level, setLevel] = useState(3);

  const todayEntry = entries.find(e => e.date === getToday());
  const [saved, setSaved] = useState(!!todayEntry);

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
  };

  const currentZone = vibeZones.find(z => z.level === level) || vibeZones[2];

  // Last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return entries.find(e => e.date === dateStr) || null;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 flex items-center justify-center mx-auto">
          <Thermometer className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Termômetro Vibracional</h3>
        <p className="text-xs font-body text-muted-foreground">Consciência emocional real</p>
      </div>

      {/* Vibration scale */}
      <div className="glass-gold rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider text-center">Sua Vibração de Hoje</p>

        <div className="flex items-center gap-1 h-5 rounded-full overflow-hidden">
          {vibeZones.map(z => (
            <div key={z.level} className={cn("h-full flex-1 transition-all", z.color, level >= z.level ? "opacity-100" : "opacity-20")} />
          ))}
        </div>

        <div className="flex justify-between px-1">
          {vibeZones.map(z => (
            <button
              key={z.level}
              onClick={() => setLevel(z.level)}
              className={cn("text-[9px] font-body transition-colors", level === z.level ? z.textColor + " font-bold" : "text-muted-foreground")}
            >
              {z.label}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={cn("text-lg font-display font-bold", currentZone.textColor)}>
            Zona de {currentZone.label}
          </p>
        </div>
      </div>

      {/* Emotions picker */}
      <div className="space-y-2">
        <p className="text-xs font-body font-semibold">Emoções mais presentes <span className="text-muted-foreground">(máx 3)</span></p>
        <div className="flex flex-wrap gap-2">
          {emotionOptions.map(emotion => {
            const isSelected = selectedEmotions.includes(emotion);
            return (
              <button
                key={emotion}
                onClick={() => toggleEmotion(emotion)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-body transition-all",
                  isSelected
                    ? "bg-gold text-background font-semibold"
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
        className="w-full bg-gold hover:bg-gold/90 text-background font-body font-semibold"
        disabled={selectedEmotions.length === 0}
      >
        {saved ? "Atualizar registro" : "Registrar vibração"}
      </Button>

      {/* Weekly chart */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold" />
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">Últimos 7 dias</span>
        </div>
        <div className="flex items-end gap-1.5 h-20 justify-between">
          {last7.map((entry, i) => {
            const h = entry ? (entry.level / 5) * 100 : 10;
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dayLabel = d.toLocaleDateString("pt-BR", { weekday: "narrow" });
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all",
                    entry ? vibeZones[(entry.level || 1) - 1].color : "bg-muted/30"
                  )}
                  style={{ height: `${h}%`, minHeight: "4px" }}
                />
                <span className="text-[8px] font-body text-muted-foreground">{dayLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
