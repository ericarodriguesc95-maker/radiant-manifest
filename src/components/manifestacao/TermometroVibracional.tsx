import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Mic, MicOff, Sparkles, Star, Lightbulb, CalendarIcon, Zap, Brain, BarChart3 } from "lucide-react";
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

interface HawkinsLevel {
  id: number;
  emotion: string;
  frequency: number;
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

// Emotion-specific tips based on what the user selected
const emotionTips: Record<string, { tip: string; neuroscience: string }> = {
  Vergonha: {
    tip: "A vergonha ativa o sistema nervoso simpático. Pratique autocompaixão: coloque a mão no peito e diga 'Eu me aceito como sou'. Isso ativa o nervo vago e reduz o cortisol.",
    neuroscience: "A vergonha ativa a ínsula anterior e o córtex cingulado — áreas ligadas à dor social. Estudos da Dra. Brené Brown mostram que nomear a vergonha reduz seu poder em até 50%.",
  },
  Culpa: {
    tip: "Escreva uma carta de perdão para si mesma. A neurociência mostra que o autoperdão libera ocitocina e reduz inflamação no corpo.",
    neuroscience: "A culpa crônica mantém o córtex pré-frontal em hiperatividade, esgotando recursos cognitivos. O perdão ativa o córtex pré-frontal ventromedial, associado à regulação emocional.",
  },
  Apatia: {
    tip: "Comece com micro-ações: beba um copo de água, abra uma janela, sinta o sol. Pequenos estímulos sensoriais reativam o sistema de recompensa.",
    neuroscience: "A apatia está ligada à baixa atividade no núcleo accumbens (centro de motivação). Dopamina é liberada não pela conquista, mas pela antecipação — planejar algo pequeno já ativa o circuito.",
  },
  Tristeza: {
    tip: "Permita-se chorar — lágrimas emocionais contêm leucina-encefalina, um analgésico natural. Depois, ouça uma música que te conecte com um momento feliz.",
    neuroscience: "A tristeza reduz a atividade no córtex pré-frontal esquerdo (associado a emoções positivas). Exercício físico de apenas 20 minutos equilibra essa assimetria hemisférica.",
  },
  Medo: {
    tip: "Use a técnica 5-4-3-2-1: nomeie 5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia. Isso ancora seu cérebro no presente.",
    neuroscience: "O medo ativa a amígdala em 12ms — mais rápido que a consciência. A técnica de grounding ativa o córtex pré-frontal, que inibe a resposta da amígdala em segundos.",
  },
  Ansiedade: {
    tip: "Respiração 4-7-8: inspire por 4s, segure 7s, expire por 8s. Repita 4 vezes. Isso ativa o sistema nervoso parassimpático imediatamente.",
    neuroscience: "A ansiedade é uma hiperativação da rede de modo padrão (DMN). A respiração lenta aumenta a variabilidade da frequência cardíaca (HRV) e reduz cortisol em até 23%.",
  },
  Raiva: {
    tip: "Canalize a energia: faça 20 polichinelos ou escreva tudo que sente em um papel (pode rasgar depois). A raiva é energia — redirecione-a.",
    neuroscience: "A raiva libera noradrenalina e aumenta o fluxo sanguíneo no córtex pré-frontal dorsolateral. Exercício físico metaboliza esses hormônios em 20 minutos.",
  },
  Frustração: {
    tip: "Identifique a expectativa por trás da frustração. Depois pergunte: 'O que está no meu controle agora?' Foque apenas nisso.",
    neuroscience: "A frustração surge quando há discrepância entre expectativa (córtex orbitofrontal) e realidade. Reenquadrar a situação ativa novas redes neurais de solução.",
  },
  Orgulho: {
    tip: "O orgulho saudável celebra conquistas. Mas quando se torna comparação, nos isola. Pratique gratidão por quem contribuiu para suas vitórias.",
    neuroscience: "O orgulho ativa o sistema de recompensa (estriado ventral), mas o orgulho excessivo reduz a empatia ao diminuir a atividade na junção temporoparietal.",
  },
  Coragem: {
    tip: "Você está no ponto de virada de Hawkins! Acima de 200Hz, a energia se torna construtiva. Tome uma decisão que tem adiado.",
    neuroscience: "A coragem não é ausência de medo — é ativação simultânea da amígdala (medo) e do córtex pré-frontal (decisão). Quanto mais pratica, mais forte fica essa conexão.",
  },
  Confiança: {
    tip: "Mantenha essa frequência: adote uma postura expansiva por 2 minutos. A linguagem corporal retroalimenta o cérebro.",
    neuroscience: "A confiança está associada a níveis elevados de testosterona e baixos de cortisol. A postura de poder (Amy Cuddy) altera esses hormônios em apenas 2 minutos.",
  },
  Esperança: {
    tip: "Visualize o resultado que deseja por 5 minutos com todos os sentidos. Seu cérebro não diferencia o imaginado do vivido.",
    neuroscience: "A esperança ativa o córtex pré-frontal e o sistema dopaminérgico mesolímbico. Estudos mostram que pessoas esperançosas têm 14% mais chances de atingir suas metas.",
  },
  Aceitação: {
    tip: "A aceitação não é resignação — é sabedoria. Ao aceitar o que é, você libera energia para criar o que será.",
    neuroscience: "A aceitação reduz a atividade na amígdala e aumenta no córtex pré-frontal ventromedial. Praticantes de mindfulness mostram essa mudança em apenas 8 semanas (Harvard, 2011).",
  },
  Força: {
    tip: "Use essa clareza mental para criar planos concretos. A razão combinada com intenção é a fórmula da manifestação consciente.",
    neuroscience: "O pensamento analítico ativa o córtex pré-frontal dorsolateral. Quando combinado com emoções positivas (sistema límbico), cria as conexões neurais mais duradouras.",
  },
  Amor: {
    tip: "Você está vibrando a 500Hz! Espalhe esse amor: envie uma mensagem carinhosa para alguém, abrace quem está perto, ou simplesmente sorria para um estranho.",
    neuroscience: "O amor libera ocitocina, dopamina e serotonina simultaneamente. O HeartMath Institute provou que o coração em coerência emite campo eletromagnético 5.000x maior que o cérebro.",
  },
  Gratidão: {
    tip: "A gratidão vibra a 540Hz! Escreva 5 coisas pelas quais é grata agora. Sinta cada uma no coração. Isso reprograma seu filtro reticular.",
    neuroscience: "Robert Emmons (UC Davis) provou que 21 dias de gratidão diária aumentam o bem-estar em 25%, melhoram o sono e reduzem visitas ao médico em 35%.",
  },
  Alegria: {
    tip: "Celebre! Dance, cante, pule! A alegria é contagiante — quando você vibra alto, eleva todos ao redor. Esse é o efeito de campo.",
    neuroscience: "A alegria ativa o nucleus accumbens e libera endorfinas naturais. O cérebro em estado de alegria tem neuroplasticidade 31% maior (Shawn Achor, Harvard).",
  },
  Paz: {
    tip: "Você está em estado de beatitude (600Hz). Medite, contemple a natureza, ou simplesmente SEJA. Nenhuma ação é necessária — sua presença já transforma.",
    neuroscience: "A paz profunda produz ondas cerebrais gama (40Hz+), associadas à iluminação e insight. Monges tibetanos em meditação profunda mostram atividade gama 30x acima do normal.",
  },
};

const defaultTips = {
  low: {
    tip: "Respire fundo 5 vezes. Coloque uma mão no coração. Ouvir frequências de 528Hz pode ajudar a elevar sua vibração.",
    neuroscience: "Emoções de baixa frequência mantêm o sistema nervoso simpático em alerta constante. A respiração diafragmática ativa o nervo vago, reduzindo cortisol em minutos.",
  },
  mid: {
    tip: "Você está no ponto de virada! Caminhe 10 minutos ao ar livre. O movimento eleva a frequência vibracional.",
    neuroscience: "Acima de 200Hz na escala de Hawkins, o córtex pré-frontal assume o controle sobre a amígdala. Cada dia nessa faixa fortalece as conexões neurais construtivas.",
  },
  high: {
    tip: "Sua vibração está elevada! Aproveite para manifestar, criar e irradiar essa energia. O universo conspira a seu favor!",
    neuroscience: "Emoções elevadas (amor, alegria, paz) ativam o sistema nervoso parassimpático, produzem DHEA (hormônio da vitalidade) e aumentam a coerência cardíaca.",
  },
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

function getHawkinsFromEmotions(emotions: string[]): HawkinsLevel {
  if (emotions.length === 0) return hawkinsScale[8];
  const ids = emotions.map(e => {
    const found = emotionPicker.find(ep => ep.label === e);
    return found ? found.hawkinsId : 9;
  });
  const maxId = Math.max(...ids);
  return hawkinsScale.find(h => h.id === maxId) || hawkinsScale[8];
}

function getTipForEmotions(emotions: string[], hawkinsId: number): { tip: string; neuroscience: string } {
  // Use the dominant (first selected) emotion for specific tips
  const dominant = emotions[0];
  if (dominant && emotionTips[dominant]) return emotionTips[dominant];
  const cat = hawkinsId <= 8 ? "low" : hawkinsId <= 11 ? "mid" : "high";
  return defaultTips[cat];
}

// Calculate weekly averages for the last 4 weeks
function getWeeklyAverages(entries: DailyEntry[]): { weekLabel: string; avgFrequency: number; avgId: number; count: number }[] {
  const weeks: { weekLabel: string; avgFrequency: number; avgId: number; count: number }[] = [];
  
  for (let w = 3; w >= 0; w--) {
    const weekEntries: DailyEntry[] = [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (w * 7));

    for (const entry of entries) {
      const d = new Date(entry.date + "T12:00:00");
      if (d >= weekStart && d <= weekEnd) weekEntries.push(entry);
    }

    const label = `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`;
    if (weekEntries.length === 0) {
      weeks.push({ weekLabel: label, avgFrequency: 0, avgId: 0, count: 0 });
    } else {
      const avgId = Math.round(weekEntries.reduce((s, e) => s + e.level, 0) / weekEntries.length);
      const hawkins = hawkinsScale.find(h => h.id === avgId) || hawkinsScale[8];
      weeks.push({ weekLabel: label, avgFrequency: hawkins.frequency, avgId, count: weekEntries.length });
    }
  }
  return weeks;
}

export default function TermometroVibracional() {
  const [entries, setEntries] = useState<DailyEntry[]>(getSavedEntries);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [savedTipData, setSavedTipData] = useState<{ tip: string; neuroscience: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const todayEntry = entries.find(e => e.date === getToday());
  const [saved, setSaved] = useState(!!todayEntry);

  const currentHawkins = useMemo(() => getHawkinsFromEmotions(selectedEmotions), [selectedEmotions]);
  const weeklyAverages = useMemo(() => getWeeklyAverages(entries), [entries]);

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
    setSavedTipData(getTipForEmotions(selectedEmotions, currentHawkins.id));
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

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
        <div className="relative">
          <div className="flex items-center gap-0.5 h-4 rounded-full overflow-hidden">
            {hawkinsScale.map((h) => (
              <div
                key={h.id}
                className={cn("h-full flex-1 transition-all duration-500", h.color, currentHawkins.id >= h.id ? "opacity-100" : "opacity-15")}
              />
            ))}
          </div>
          <div
            className="absolute -top-1 transition-all duration-700 ease-out"
            style={{ left: `${((currentHawkins.id - 0.5) / hawkinsScale.length) * 100}%` }}
          >
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-gold mx-auto" />
          </div>
        </div>
        <div className="flex justify-between text-[7px] font-body text-muted-foreground px-0.5">
          <span>20 Hz</span>
          <span>200 Hz</span>
          <span>500 Hz</span>
          <span>700+ Hz</span>
        </div>
        <div className="text-center space-y-2 pt-1">
          <div className="text-4xl">{currentHawkins.emoji}</div>
          <div>
            <p className={cn("text-2xl font-display font-bold", currentHawkins.textColor)}>{currentHawkins.frequency} Hz</p>
            <p className="text-sm font-display font-bold text-foreground mt-0.5">{currentHawkins.emotion}</p>
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
          saved ? "bg-green-500 hover:bg-green-500/90 text-background" : "bg-gold hover:bg-gold/90 text-background"
        )}
        disabled={selectedEmotions.length === 0}
      >
        {saved ? (
          <><Star className="h-4 w-4 mr-2" />Atualizar frequência</>
        ) : (
          <><Sparkles className="h-4 w-4 mr-2" />Registrar frequência</>
        )}
      </Button>

      {/* Emotion-specific tip + neuroscience */}
      {saved && savedTipData && (
        <div className="space-y-3 animate-fade-in">
          {/* Tip */}
          <div className="glass-gold rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-gold" />
              <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">
                {currentHawkins.id >= 12 ? "Continue assim!" : "Dica personalizada"}
              </p>
            </div>
            <p className="text-xs font-body text-foreground/80 leading-relaxed">{savedTipData.tip}</p>
          </div>

          {/* Neuroscience insight */}
          <div className="glass rounded-2xl p-4 space-y-2 border border-purple-500/20">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <p className="text-[10px] font-body font-semibold text-purple-400 uppercase tracking-wider">O que a neurociência diz</p>
            </div>
            <p className="text-xs font-body text-foreground/80 leading-relaxed">{savedTipData.neuroscience}</p>
          </div>
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
                {hawkins && <span className="text-[7px] font-body text-muted-foreground">{hawkins.frequency}</span>}
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

      {/* Monthly evolution - Weekly averages */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gold" />
          <span className="text-xs font-body font-semibold text-gold uppercase tracking-wider">Evolução mensal</span>
        </div>
        <p className="text-[10px] font-body text-muted-foreground">Média semanal da sua frequência vibracional</p>
        
        <div className="space-y-2">
          {weeklyAverages.map((week, i) => {
            const hawkins = week.avgId > 0 ? (hawkinsScale.find(h => h.id === week.avgId) || hawkinsScale[8]) : null;
            const barWidth = week.avgId > 0 ? frequencyPercent(week.avgId) : 0;
            return (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-body">
                  <span className="text-muted-foreground">{week.weekLabel}</span>
                  {hawkins ? (
                    <span className={cn("font-bold", hawkins.textColor)}>
                      {hawkins.emoji} {week.avgFrequency}Hz • {hawkins.emotion}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">Sem registro</span>
                  )}
                </div>
                <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-700", hawkins ? hawkins.color : "bg-muted/20")}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                {week.count > 0 && (
                  <p className="text-[8px] font-body text-muted-foreground/60 text-right">{week.count} registro{week.count > 1 ? "s" : ""}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Trend analysis */}
        {weeklyAverages.filter(w => w.count > 0).length >= 2 && (() => {
          const valid = weeklyAverages.filter(w => w.count > 0);
          const first = valid[0].avgId;
          const last = valid[valid.length - 1].avgId;
          const trend = last > first ? "subindo" : last < first ? "descendo" : "estável";
          const trendEmoji = trend === "subindo" ? "📈" : trend === "descendo" ? "📉" : "➡️";
          const trendColor = trend === "subindo" ? "text-green-400" : trend === "descendo" ? "text-orange-400" : "text-yellow-400";
          return (
            <div className="glass-gold rounded-xl p-3 mt-2">
              <p className={cn("text-[11px] font-body font-semibold", trendColor)}>
                {trendEmoji} Sua frequência está {trend} nas últimas semanas
              </p>
              <p className="text-[10px] font-body text-muted-foreground mt-1">
                {trend === "subindo" && "Parabéns! Sua prática está elevando sua consciência. Continue assim!"}
                {trend === "descendo" && "Momento de atenção amorosa. Intensifique suas práticas de gratidão e meditação."}
                {trend === "estável" && "Estabilidade é bom sinal. Para evoluir, experimente novas práticas de elevação."}
              </p>
            </div>
          );
        })()}
      </div>

      {/* Neuroscience general section */}
      <div className="glass rounded-2xl p-4 space-y-3 border border-purple-500/10">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-body font-semibold text-purple-400 uppercase tracking-wider">Neurociência das emoções</span>
        </div>
        <div className="space-y-2.5">
          {[
            {
              title: "Seu cérebro muda com suas emoções",
              text: "Cada emoção ativa circuitos neurais específicos. Emoções de alta frequência (amor, gratidão, paz) fortalecem o córtex pré-frontal — responsável por decisões, criatividade e autoconsciência.",
            },
            {
              title: "A Escala de Hawkins é mensurável",
              text: "Dr. David Hawkins usou cinesiologia para mapear os níveis de consciência. Estudos com EEG e fMRI confirmam que estados emocionais alteram padrões de ondas cerebrais de forma consistente.",
            },
            {
              title: "Neuroplasticidade emocional",
              text: "Registrar suas emoções diariamente aumenta a inteligência emocional e reduz a reatividade da amígdala em até 50% (UCLA, 2007). Você está literalmente reconfigurando seu cérebro.",
            },
            {
              title: "Coerência cardíaca",
              text: "O HeartMath Institute provou que emoções elevadas criam coerência entre coração e cérebro, aumentando intuição, clareza mental e resiliência ao estresse.",
            },
            {
              title: "O efeito de campo vibracional",
              text: "Pesquisas mostram que estados emocionais se propagam até 3 graus de separação social. Quando você eleva sua frequência, impacta até pessoas que não conhece diretamente.",
            },
          ].map((item, i) => (
            <div key={i} className="space-y-1">
              <p className="text-[11px] font-body font-semibold text-foreground">{item.title}</p>
              <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
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
