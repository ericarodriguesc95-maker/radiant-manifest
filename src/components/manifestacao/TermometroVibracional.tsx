import { useState, useEffect, useMemo } from "react";
import { Thermometer, TrendingUp, Mic, MicOff, Sparkles, Star, Lightbulb, CalendarIcon, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STORAGE_KEY = "glow-termometro";

interface DailyEntry {
  date: string;
  emotions: string[];
  level: number; // Hawkins scale index (0-based into hawkinsScale)
}

// Escala de Hawkins - Mapa da Consciência
interface HawkinsLevel {
  id: number;
  emotion: string;
  frequency: number; // Hz on Hawkins scale
  level: string;
  emoji: string;
  color: string;
  textColor: string;
  description: string;
}

const hawkinsScale: HawkinsLevel[] = [
  { id: 1, emotion: "Vergonha", frequency: 20, level: "Humilhação", emoji: "😔", color: "bg-gray-700", textColor: "text-gray-400", description: "Sentimento de insignificância. Respire fundo — você merece estar aqui." },
  { id: 2, emotion: "Culpa", frequency: 30, level: "Destruição", emoji: "😢", color: "bg-gray-600", textColor: "text-gray-400", description: "Culpa excessiva bloqueia o crescimento. Pratique o autoperdão." },
  { id: 3, emotion: "Apatia", frequency: 50, level: "Desespero", emoji: "😶", color: "bg-gray-500", textColor: "text-gray-400", description: "Sensação de vazio. Um pequeno passo já é uma vitória." },
  { id: 4, emotion: "Tristeza", frequency: 75, level: "Arrependimento", emoji: "😞", color: "bg-blue-800", textColor: "text-blue-400", description: "A tristeza é passageira. Permita-se sentir, mas não se instale nela." },
  { id: 5, emotion: "Medo", frequency: 100, level: "Ansiedade", emoji: "😰", color: "bg-red-900", textColor: "text-red-400", description: "O medo é natural, mas não é seu guia. Sua coragem é maior." },
  { id: 6, emotion: "Desejo", frequency: 125, level: "Escravidão", emoji: "😤", color: "bg-red-700", textColor: "text-red-400", description: "Desejo sem ação gera frustração. Canalize em metas claras." },
  { id: 7, emotion: "Raiva", frequency: 150, level: "Ódio", emoji: "😠", color: "bg-red-600", textColor: "text-red-400", description: "A raiva tem energia. Use-a para transformar, não para destruir." },
  { id: 8, emotion: "Orgulho", frequency: 175, level: "Desdém", emoji: "😏", color: "bg-orange-700", textColor: "text-orange-400", description: "O orgulho pode ser uma armadilha. A verdadeira força é humilde." },
  { id: 9, emotion: "Coragem", frequency: 200, level: "Afirmação", emoji: "💪", color: "bg-orange-500", textColor: "text-orange-400", description: "Ponto de virada! A partir daqui, a energia se torna construtiva." },
  { id: 10, emotion: "Neutralidade", frequency: 250, level: "Confiança", emoji: "😌", color: "bg-yellow-600", textColor: "text-yellow-400", description: "Estado de equilíbrio. Você está flexível e adaptável." },
  { id: 11, emotion: "Disposição", frequency: 310, level: "Otimismo", emoji: "😊", color: "bg-yellow-500", textColor: "text-yellow-400", description: "Energia de crescimento. Você está aberta a novas possibilidades." },
  { id: 12, emotion: "Aceitação", frequency: 350, level: "Perdão", emoji: "🙏", color: "bg-green-600", textColor: "text-green-400", description: "Você parou de resistir e está fluindo com a vida." },
  { id: 13, emotion: "Razão", frequency: 400, level: "Compreensão", emoji: "🧠", color: "bg-green-500", textColor: "text-green-400", description: "Mente clara e objetiva. Use essa clareza para criar." },
  { id: 14, emotion: "Amor", frequency: 500, level: "Reverência", emoji: "💖", color: "bg-pink-500", textColor: "text-pink-400", description: "Amor incondicional. Frequência que cura e transforma tudo ao redor." },
  { id: 15, emotion: "Alegria", frequency: 540, level: "Serenidade", emoji: "🌟", color: "bg-gold", textColor: "text-gold", description: "Alegria que nasce de dentro. Você irradia luz naturalmente." },
  { id: 16, emotion: "Paz", frequency: 600, level: "Beatitude", emoji: "🕊️", color: "bg-purple-500", textColor: "text-purple-400", description: "Estado de paz profunda. Transcendência e conexão com o todo." },
  { id: 17, emotion: "Iluminação", frequency: 700, level: "Inefável", emoji: "✨", color: "bg-gold", textColor: "text-gold", description: "Consciência pura. Estado dos grandes mestres espirituais." },
];

// Group emotions for the picker with their Hawkins mapping
const emotionPicker = [
  { label: "Vergonha", hawkinsId: 1, emoji: "😔" },
  { label: "Culpa", hawkinsId: 2, emoji: "😢" },
  { label: "Apatia", hawkinsId: 3, emoji: "😶" },
  { label: "Tristeza", hawkinsId: 4, emoji: "😞" },
  { label: "Medo", hawkinsId: 5, emoji: "😰" },
  { label: "Ansiedade", hawkinsId: 5, emoji: "😥" },
  { label: "Raiva", hawkinsId: 7, emoji: "😠" },
  { label: "Frustração", hawkinsId: 7, emoji: "😤" },
  { label: "Orgulho", hawkinsId: 8, emoji: "😏" },
  { label: "Coragem", hawkinsId: 9, emoji: "💪" },
  { label: "Confiança", hawkinsId: 10, emoji: "😌" },
  { label: "Esperança", hawkinsId: 11, emoji: "😊" },
  { label: "Aceitação", hawkinsId: 12, emoji: "🙏" },
  { label: "Força", hawkinsId: 13, emoji: "🧠" },
  { label: "Amor", hawkinsId: 14, emoji: "💖" },
  { label: "Gratidão", hawkinsId: 14, emoji: "💛" },
  { label: "Alegria", hawkinsId: 15, emoji: "🌟" },
  { label: "Paz", hawkinsId: 16, emoji: "🕊️" },
];

const moodTips: Record<string, string[]> = {
  low: [
    "Permita-se sentir. Respire fundo 5 vezes e coloque uma mão no coração. Você está segura.",
    "Tome um banho quente, coloque uma música suave e se abrace. Amanhã é um novo dia.",
    "Escreva o que sente sem julgamento. A cura começa quando damos nome à dor.",
    "Ouvir frequências de 528Hz (frequência do amor) pode ajudar a elevar sua vibração.",
  ],
  mid: [
    "Você está no ponto de virada! A coragem é o portal para frequências mais altas.",
    "Faça uma caminhada de 10 minutos ao ar livre. O movimento eleva sua frequência.",
    "Pratique visualização por 5 minutos: imagine-se vibrando em 500Hz (Amor).",
    "Escreva 3 coisas pelas quais você é grata. A gratidão vibra a 540Hz!",
  ],
  high: [
    "Sua vibração está linda! Mantenha-se nessa frequência praticando meditação.",
    "Você está irradiando amor (500Hz+). Continue nutrindo esse estado.",
    "Aproveite essa energia elevada para manifestar e criar. O universo conspira a seu favor!",
    "Compartilhe essa vibração com o mundo. Quando você brilha, ilumina quem está ao redor.",
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

function getRandomTip(hawkinsId: number): string {
  const category = hawkinsId <= 8 ? "low" : hawkinsId <= 11 ? "mid" : "high";
  const tips = moodTips[category];
  return tips[Math.floor(Math.random() * tips.length)];
}

function getHawkinsFromEmotions(emotions: string[]): HawkinsLevel {
  if (emotions.length === 0) return hawkinsScale[8]; // Default: Coragem
  const ids = emotions.map(e => {
    const found = emotionPicker.find(ep => ep.label === e);
    return found ? found.hawkinsId : 9;
  });
  // Use the highest frequency emotion as dominant
  const maxId = Math.max(...ids);
  return hawkinsScale.find(h => h.id === maxId) || hawkinsScale[8];
}

export default function TermometroVibracional() {
  const [entries, setEntries] = useState<DailyEntry[]>(getSavedEntries);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [currentTip, setCurrentTip] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const todayEntry = entries.find(e => e.date === getToday());
  const [saved, setSaved] = useState(!!todayEntry);

  const currentHawkins = useMemo(() => getHawkinsFromEmotions(selectedEmotions), [selectedEmotions]);

  const voice = useVoiceInput({
    onResult: (result) => {
      const spoken = normalize(result);
      for (const ep of emotionPicker) {
        if (spoken.includes(normalize(ep.label)) && !selectedEmotions.includes(ep.label)) {
          if (selectedEmotions.length < 3) {
            setSelectedEmotions(prev => [...prev, ep.label]);
          }
          break;
        }
      }
    },
  });

  useEffect(() => {
    if (todayEntry) {
      setSelectedEmotions(todayEntry.emotions);
    }
  }, []);

  const toggleEmotion = (label: string) => {
    setSelectedEmotions(prev => {
      if (prev.includes(label)) return prev.filter(e => e !== label);
      if (prev.length >= 3) return prev;
      return [...prev, label];
    });
  };

  const saveEntry = () => {
    const entry: DailyEntry = { date: getToday(), emotions: selectedEmotions, level: currentHawkins.id };
    const updated = entries.filter(e => e.date !== getToday());
    updated.push(entry);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSaved(true);
    setCurrentTip(getRandomTip(currentHawkins.id));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  // For the bar chart — normalize id to percentage
  const frequencyPercent = (id: number) => Math.round((id / 17) * 100);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    return { entry: entries.find(e => e.date === dateStr) || null, date: new Date(d) };
  });

  const pastEntries = entries
    .filter(e => e.date !== getToday())
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-gold/20 flex items-center justify-center mx-auto">
          <Zap className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Escala de Hawkins</h3>
        <p className="text-xs font-body text-muted-foreground">Mapa da Consciência & Frequência Vibracional</p>
      </div>

      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-3 animate-scale-in">
            <div className="text-6xl animate-bounce">{currentHawkins.emoji}</div>
            <div className="space-y-1">
              <p className="text-lg font-display font-bold text-foreground">Vibração registrada!</p>
              <p className={cn("text-2xl font-display font-bold", currentHawkins.textColor)}>
                {currentHawkins.frequency} Hz
              </p>
              <p className={cn("text-sm font-body font-semibold", currentHawkins.textColor)}>
                {currentHawkins.emotion} — {currentHawkins.level}
              </p>
            </div>
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

      {/* Current Hawkins reading */}
      <div className="glass-gold rounded-2xl p-4 space-y-4">
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider text-center">Sua Frequência Vibracional</p>

        {/* Frequency meter */}
        <div className="relative">
          <div className="flex items-center gap-0.5 h-4 rounded-full overflow-hidden">
            {hawkinsScale.map((h) => (
              <div
                key={h.id}
                className={cn(
                  "h-full flex-1 transition-all duration-500",
                  h.color,
                  currentHawkins.id >= h.id ? "opacity-100" : "opacity-15"
                )}
              />
            ))}
          </div>
          {/* Pointer */}
          <div
            className="absolute -top-1 transition-all duration-700 ease-out"
            style={{ left: `${((currentHawkins.id - 0.5) / hawkinsScale.length) * 100}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gold mx-auto" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-between text-[7px] font-body text-muted-foreground px-0.5">
          <span>20 Hz</span>
          <span>200 Hz</span>
          <span>500 Hz</span>
          <span>700+ Hz</span>
        </div>

        {/* Current state card */}
        <div className="text-center space-y-2 pt-1">
          <div className="text-4xl">{currentHawkins.emoji}</div>
          <div>
            <p className={cn("text-2xl font-display font-bold", currentHawkins.textColor)}>
              {currentHawkins.frequency} Hz
            </p>
            <p className="text-sm font-display font-bold text-foreground mt-0.5">
              {currentHawkins.emotion}
            </p>
            <p className={cn("text-[10px] font-body font-semibold uppercase tracking-wider mt-0.5", currentHawkins.textColor)}>
              Nível: {currentHawkins.level}
            </p>
          </div>
          <p className="text-[11px] font-body text-muted-foreground italic leading-relaxed max-w-[280px] mx-auto">
            {currentHawkins.description}
          </p>
        </div>
      </div>

      {/* Emotions picker */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-body font-semibold">Como você está se sentindo? <span className="text-muted-foreground">(máx 3)</span></p>
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
              {voice.isListening ? "Parar" : "Ditar"}
            </button>
          )}
        </div>
        {voice.isListening && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[9px] font-body text-red-400">Fale a emoção: "Amor", "Paz", "Coragem"...</p>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {emotionPicker.map(ep => {
            const isSelected = selectedEmotions.includes(ep.label);
            const hawkins = hawkinsScale.find(h => h.id === ep.hawkinsId);
            return (
              <button
                key={ep.label}
                onClick={() => toggleEmotion(ep.label)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-body transition-all duration-300",
                  isSelected
                    ? "bg-gold text-background font-semibold scale-105 shadow-md"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="text-xs">{ep.emoji}</span>
                {ep.label}
                {isSelected && hawkins && (
                  <span className="text-[9px] opacity-80 ml-0.5">{hawkins.frequency}Hz</span>
                )}
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
            Atualizar frequência
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Registrar frequência
          </>
        )}
      </Button>

      {/* Tip card */}
      {saved && currentTip && (
        <div className="glass-gold rounded-2xl p-4 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-gold" />
            <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">
              {currentHawkins.id >= 12 ? "Continue assim!" : "Dica para elevar sua frequência"}
            </p>
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
        <div className="flex items-end gap-1.5 h-24 justify-between">
          {last7.map(({ entry, date }, i) => {
            const hawkins = entry ? (hawkinsScale.find(h => h.id === entry.level) || hawkinsScale[8]) : null;
            const h = entry ? frequencyPercent(entry.level) : 8;
            const dayLabel = date.toLocaleDateString("pt-BR", { weekday: "narrow" });
            const isToday = date.toISOString().slice(0, 10) === getToday();
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                {hawkins && (
                  <span className="text-[7px] font-body text-muted-foreground">{hawkins.frequency}</span>
                )}
                <div
                  className={cn(
                    "w-full rounded-t-md transition-all duration-500",
                    hawkins ? hawkins.color : "bg-muted/30",
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
            <span className="text-xs font-body font-semibold">Histórico de frequências</span>
          </div>
          <span className="text-[10px] font-body text-muted-foreground">{pastEntries.length} registros</span>
        </button>

        {showHistory && pastEntries.length > 0 && (
          <div className="space-y-2 animate-fade-in">
            {pastEntries.map((entry) => {
              const hawkins = hawkinsScale.find(h => h.id === entry.level) || hawkinsScale[8];
              const entryDate = new Date(entry.date + "T12:00:00");
              return (
                <div key={entry.date} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="text-center min-w-[40px]">
                    <div className="text-lg">{hawkins.emoji}</div>
                    <p className={cn("text-[9px] font-body font-bold", hawkins.textColor)}>{hawkins.frequency}Hz</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[11px] font-body font-semibold text-foreground">
                        {format(entryDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </p>
                      <span className={cn("text-[8px] font-body font-bold px-1.5 py-0.5 rounded-full", hawkins.textColor, `${hawkins.color}/20`)}>
                        {hawkins.emotion}
                      </span>
                    </div>
                    <p className="text-[10px] font-body text-muted-foreground truncate">
                      {entry.emotions.join(", ")}
                    </p>
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

      {/* Hawkins reference */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">📖 Escala completa de Hawkins</p>
        <div className="space-y-1">
          {hawkinsScale.map(h => (
            <div
              key={h.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-lg transition-all",
                currentHawkins.id === h.id ? "bg-gold/10 border border-gold/20" : ""
              )}
            >
              <span className="text-xs">{h.emoji}</span>
              <span className="text-[10px] font-body text-foreground font-semibold w-20">{h.emotion}</span>
              <span className={cn("text-[9px] font-body font-bold w-12", h.textColor)}>{h.frequency} Hz</span>
              <span className="text-[9px] font-body text-muted-foreground">{h.level}</span>
            </div>
          ))}
        </div>
        <p className="text-[9px] font-body text-muted-foreground italic text-center pt-1">
          Baseado no Mapa da Consciência de Dr. David R. Hawkins
        </p>
      </div>
    </div>
  );
}
