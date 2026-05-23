import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Zap, Clock, Sunrise, ShieldOff, TrendingUp, Moon, CalendarDays,
  Flame, Brain, Target, Check, RotateCcw, Activity, Layers, Droplet,
  Snowflake, Eye, Star, History, Trophy, Sparkles, NotebookPen, ChevronDown, ChevronUp, X, Lightbulb
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Protocolo145Chat from "@/components/Protocolo145Chat";

const STORAGE_KEY = "protocolo-14-5:progress:v3";
const HISTORY_KEY = "protocolo-14-5:history:v1";
const SECTION_IDS = [
  "tese", "neurociencia", "codigo", "jejuns", "firewall",
  "hawkins", "maslow", "subliminal", "execucao", "diario", "historico", "ia"
] as const;
type SectionId = typeof SECTION_IDS[number];

type DayTasks = Record<number, Record<string, boolean>>;
type DayNotes = Record<number, string>;
type FastingWindow = "14h" | "16h" | "18h" | "24h";
type Progress = {
  days: boolean[];
  dayTasks: DayTasks;
  notes: DayNotes;
  lastSection: SectionId;
  startedAt: string;
  updatedAt: string;
  fastingWindow: FastingWindow;
};
type HistoryRun = {
  id: string;
  startedAt: string;
  completedAt: string;
  daysCompleted: number;
  totalTasksDone: number;
  notes: DayNotes;
  dayTasks: DayTasks;
  fastingWindow?: FastingWindow;
};

function emptyProgress(): Progress {
  const now = new Date().toISOString();
  return {
    days: [false, false, false, false, false],
    dayTasks: {},
    notes: {},
    lastSection: "tese",
    startedAt: now,
    updatedAt: now,
    fastingWindow: "14h",
  };
}
function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.days) && p.days.length === 5) {
        return { ...emptyProgress(), ...p, dayTasks: p.dayTasks || {}, notes: p.notes || {} };
      }
    }
  } catch {}
  return emptyProgress();
}
function saveProgress(p: Progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}
function loadHistory(): HistoryRun[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const h = JSON.parse(raw);
      if (Array.isArray(h)) return h;
    }
  } catch {}
  return [];
}
function saveHistory(h: HistoryRun[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

const hawkinsLevels = [
  { range: "700+", name: "Iluminação", color: "from-gold to-yellow-200", low: false },
  { range: "600", name: "Paz", color: "from-gold to-amber-300", low: false },
  { range: "540", name: "Alegria", color: "from-amber-400 to-amber-200", low: false },
  { range: "500", name: "Amor", color: "from-amber-500 to-amber-300", low: false },
  { range: "400", name: "Razão / Inteligência Estratégica", color: "from-gold to-amber-400", target: true, low: false },
  { range: "350", name: "Aceitação", color: "from-amber-600/70 to-amber-500/70", low: false },
  { range: "310", name: "Disposição", color: "from-amber-700/60 to-amber-600/60", low: false },
  { range: "250", name: "Neutralidade", color: "from-zinc-500 to-zinc-400", low: false },
  { range: "200", name: "Coragem (linha de poder)", color: "from-zinc-600 to-zinc-500", line: true, low: false },
  { range: "175", name: "Orgulho", color: "from-zinc-700 to-zinc-600", low: true },
  { range: "150", name: "Raiva", color: "from-red-900/70 to-red-700/70", low: true },
  { range: "125", name: "Desejo (dopamina barata)", color: "from-red-900/80 to-orange-800/80", current: true, low: true },
  { range: "75", name: "Prostração", color: "from-red-950 to-red-900", current: true, low: true },
  { range: "20", name: "Vergonha", color: "from-black to-red-950", low: true },
];

const maslowLevels = [
  { name: "Autorrealização", desc: "Propósito · criatividade · operação no nível 400+ de Hawkins", width: "w-[40%]", color: "bg-gold", text: "text-black" },
  { name: "Estima", desc: "Confiança · respeito próprio · disciplina (Variável 5)", width: "w-[55%]", color: "bg-amber-500/80", text: "text-black" },
  { name: "Pertencimento", desc: "Conexão real · comunidade Glow Up (sem dopamina barata de redes)", width: "w-[70%]", color: "bg-amber-700/70", text: "text-white" },
  { name: "Segurança", desc: "Estabilidade insulínica · cortisol regulado · sono profundo", width: "w-[85%]", color: "bg-zinc-700", text: "text-white" },
  { name: "Fisiológico", desc: "Jejum 14h · hidratação 3L · luz solar matinal · proteína", width: "w-full", color: "bg-zinc-800", text: "text-white" },
];

const jejunsTipos = [
  { h: "14h", nome: "Janela Glow Up", uso: "Base do Protocolo 14.5. Estabiliza insulina e ativa autofagia leve.", cor: "border-gold/40 bg-gold/5" },
  { h: "16h", nome: "16:8 clássico", uso: "Próximo passo. Autofagia consistente, queima de gordura visceral.", cor: "border-amber-500/30 bg-amber-500/5" },
  { h: "18h", nome: "Avançado", uso: "Cetose leve, picos de BDNF, foco intenso para semanas de execução.", cor: "border-amber-600/30 bg-amber-700/5" },
  { h: "24h", nome: "OMAD / 24h", uso: "Reset metabólico mensal. Apenas com base sólida e eletrólitos.", cor: "border-zinc-600 bg-zinc-900/40" },
];

const fastingMeta: Record<FastingWindow, {
  label: string;
  short: string;
  jejumTask: string;
  pitch: string;
  tips: string[]; // dia 1..5
}> = {
  "14h": {
    label: "14h · Janela Glow Up",
    short: "14h",
    jejumTask: "Janela 14h fechada (ex.: 18:40 → 08:40)",
    pitch: "Base do protocolo. Estabiliza insulina e ativa autofagia leve.",
    tips: [
      "Hoje o foco é só fechar a janela. Não force, hidrate (3L + sal rosa).",
      "Quebre o jejum com proteína + gordura boa — evita pico de fome às 11h.",
      "Janela 14h + café preto pela manhã = clareza extra para o deep work.",
      "Repita a mesma janela. Constância > intensidade nesta fase.",
      "Mantenha 14h durante o fim de semana — não perca o platô conquistado.",
    ],
  },
  "16h": {
    label: "16h · 16:8 clássico",
    short: "16h",
    jejumTask: "Janela 16h fechada (ex.: 20:00 → 12:00)",
    pitch: "Autofagia consistente, queima de gordura visceral.",
    tips: [
      "Adiar 2h o café da manhã. Beba água com limão e sal — corta fissura.",
      "Treino em jejum leve (caminhada/força) acelera lipólise nesta janela.",
      "Comer dentro de 8h: 2 refeições densas com 30–40g proteína cada.",
      "Cuidado com o pico de fome falsa às 11h: é hábito, não fome real.",
      "16:8 já é hábito ao final da semana — você acabou de subir um nível.",
    ],
  },
  "18h": {
    label: "18h · Avançado",
    short: "18h",
    jejumTask: "Janela 18h fechada (ex.: 20:00 → 14:00)",
    pitch: "Cetose leve, picos de BDNF, foco intenso para execução.",
    tips: [
      "Sintoma comum: névoa leve nas primeiras 24h. Eletrólitos resolvem.",
      "Pico de BDNF entre 16–18h de jejum: agende deep work mais difícil aí.",
      "Quebre o jejum com proteína primeiro, carbo só depois — evita sonolência.",
      "Magnésio 400mg + potássio antes de dormir = sono profundo mesmo em jejum.",
      "Mantenha 18h só nos dias de alta demanda cognitiva. Não é diário.",
    ],
  },
  "24h": {
    label: "24h · OMAD / Reset",
    short: "24h",
    jejumTask: "Janela 24h fechada (OMAD · 1 refeição no dia)",
    pitch: "Reset metabólico avançado. Só com base sólida e eletrólitos.",
    tips: [
      "Dia mais duro. Hidratação + sal rosa a cada 3h. Sem treino pesado.",
      "Autofagia em pico: o corpo limpa células danificadas. Foco mental sobe.",
      "Refeição única densa: 600–800 kcal · proteína alta · vegetais · gordura boa.",
      "Não estenda além de 24h sem orientação. Voltar para 16h amanhã.",
      "Sente energia limpa? É o reset funcionando. Documente no diário.",
    ],
  },
};

type DayTask = { id: string; label: string };
const fiveDays: { day: string; title: string; body: string; tasks: DayTask[] }[] = [
  {
    day: "Segunda", title: "Desintoxicação Bruta",
    body: "Cefaleia leve, fissura por açúcar e scroll. O corpo grita pelo lixo. Hidrate com 3L de água + sal rosa. Foco baixo, disciplina alta.",
    tasks: [
      { id: "agua", label: "3L de água + pitada de sal rosa" },
      { id: "desinst", label: "Desinstalar Instagram, TikTok, Facebook" },
      { id: "jejum", label: "Janela 14h fechada (18:40 → 08:40)" },
      { id: "luz", label: "10 min de luz solar matinal" },
      { id: "registro", label: "Anotar 1 sintoma de abstinência (autoconsciência)" },
    ],
  },
  {
    day: "Terça", title: "Estabilização Insulínica",
    body: "Picos de fome desaparecem. Energia mais limpa pela manhã. Primeiros sinais de clareza após o jejum de 14h.",
    tasks: [
      { id: "5h", label: "Acordar 05:00 (Variável 5)" },
      { id: "proteina", label: "Proteína acima de 1.6g/kg de peso" },
      { id: "frio", label: "1 min de água fria no banho (norepinefrina ↑)" },
      { id: "leitura", label: "20 páginas de leitura não-ficção" },
      { id: "sono", label: "Dormir até 22:30" },
    ],
  },
  {
    day: "Quarta", title: "Despertar Cognitivo",
    body: "Cérebro entra em modo BDNF. Você lê, escreve e decide mais rápido. A vantagem das 05:00 começa a se sentir.",
    tasks: [
      { id: "deep", label: "90 min de deep work sem celular por perto" },
      { id: "treino", label: "Treino de força (BDNF + IGF-1)" },
      { id: "decisao", label: "Tomar 1 decisão estratégica adiada" },
      { id: "escrita", label: "5 min de journaling — clarear o ruído mental" },
      { id: "afirm", label: "Afirmação Teta antes de dormir" },
    ],
  },
  {
    day: "Quinta", title: "Reset Dopaminérgico",
    body: "Receptores resensibilizados. Tarefas simples voltam a dar prazer. Procrastinação some — o tédio vira combustível.",
    tasks: [
      { id: "tedio", label: "30 min de tédio consciente (sem input)" },
      { id: "caminhada", label: "Caminhada de 30 min ao ar livre" },
      { id: "respira", label: "Respiração de Wim Hof (3 rodadas)" },
      { id: "execucao", label: "Concluir 1 tarefa de alto impacto" },
      { id: "gratidao", label: "3 gratidões antes de dormir" },
    ],
  },
  {
    day: "Sexta", title: "Soberania Operacional",
    body: "Você opera em estado de fluxo prolongado. Identidade de alta performance instalada. O protocolo virou padrão.",
    tasks: [
      { id: "review", label: "Revisão semanal: o que funcionou?" },
      { id: "pacto", label: "Definir pacto da próxima semana" },
      { id: "frio2", label: "Banho frio completo 2 min" },
      { id: "subli", label: "Áudio Teta + afirmações (20 min)" },
      { id: "celebra", label: "Celebrar — você atravessou a linha 200" },
    ],
  },
];

function SectionCard({ id, icon, title, subtitle, children }: { id?: string; icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card id={id} data-section={id} className="border-gold/20 bg-gradient-to-br from-background to-background/60 backdrop-blur scroll-mt-24">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base font-display">{title}</CardTitle>
            {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

const celebrationMessages = [
  "Você acaba de reescrever seu código operacional. Razão 400+ instalada.",
  "Cinco dias. Cinco vitórias químicas. Sua dopamina agora trabalha para você.",
  "Linha 200 atravessada. De agora em diante, você gera energia — não a drena.",
  "Identidade de alta performance: salva no sistema 1. Bem-vinda à soberania.",
];

function CelebrationOverlay({ onClose, onArchive, runStats }: {
  onClose: () => void;
  onArchive: () => void;
  runStats: { days: number; tasks: number };
}) {
  const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      {/* Confetti-like sparkles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute block h-2 w-2 rounded-full bg-gold animate-ping"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 95}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              animationDuration: `${1.5 + Math.random() * 2}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-md w-full rounded-3xl border border-gold/50 bg-gradient-to-br from-black via-zinc-950 to-black p-7 text-center animate-scale-in shadow-[0_0_60px_-10px_hsl(var(--gold)/0.5)]">
        <button onClick={onClose} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="relative mx-auto h-20 w-20 mb-4">
          <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping" />
          <div className="relative h-full w-full rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-black" />
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[0.3em] text-gold mb-2">Protocolo Concluído</p>
        <h2 className="text-2xl font-display font-bold text-foreground leading-tight">
          Reset <span className="text-gold">14.5</span> completo
        </h2>
        <p className="text-sm text-muted-foreground mt-3 italic leading-relaxed">"{msg}"</p>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
            <p className="text-2xl font-display font-bold text-gold">{runStats.days}/5</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Dias</p>
          </div>
          <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
            <p className="text-2xl font-display font-bold text-gold">{runStats.tasks}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Hábitos</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 mt-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Sparkles key={i} className="h-4 w-4 text-gold animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>

        <Button
          onClick={onArchive}
          className="w-full mt-6 bg-gold hover:bg-gold/90 text-black font-bold tracking-wide uppercase"
        >
          Arquivar ciclo e iniciar novo
        </Button>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground mt-3 uppercase tracking-wider">
          Continuar revisando este ciclo
        </button>
      </div>
    </div>
  );
}

export default function Protocolo145Page() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [history, setHistory] = useState<HistoryRun[]>(() => loadHistory());
  const [resumed, setResumed] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { saveHistory(history); }, [history]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.section as SectionId | undefined;
          if (id && SECTION_IDS.includes(id)) {
            setProgress((p) => (p.lastSection === id ? p : { ...p, lastSection: id, updatedAt: new Date().toISOString() }));
          }
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.querySelector(`[data-section="${id}"]`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (resumed) return;
    const saved = loadProgress();
    if (saved.lastSection && saved.lastSection !== "tese") {
      const el = document.querySelector(`[data-section="${saved.lastSection}"]`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          toast.info("Retomando de onde você parou ✦", { duration: 2200 });
        }, 250);
      }
    }
    setResumed(true);
  }, [resumed]);

  const completedCount = progress.days.filter(Boolean).length;
  const percent = Math.round((completedCount / 5) * 100);
  const totalTasksDone = Object.values(progress.dayTasks).reduce(
    (acc, t) => acc + Object.values(t).filter(Boolean).length, 0
  );

  // Trigger celebration once all 5 days are completed
  useEffect(() => {
    if (completedCount === 5 && !celebrated) {
      setShowCelebration(true);
      setCelebrated(true);
    }
    if (completedCount < 5 && celebrated) {
      setCelebrated(false);
    }
  }, [completedCount, celebrated]);

  const toggleDay = (i: number) => {
    setProgress((p) => {
      const days = [...p.days];
      days[i] = !days[i];
      const now = new Date().toISOString();
      if (days[i]) toast.success(`Dia ${i + 1} concluído ✓`, { description: "Reset registrado." });
      else toast(`Dia ${i + 1} desmarcado`);
      return { ...p, days, updatedAt: now };
    });
  };

  const toggleTask = (dayIdx: number, taskId: string) => {
    setProgress((p) => {
      const dayTasks = { ...(p.dayTasks || {}) };
      const cur = { ...(dayTasks[dayIdx] || {}) };
      cur[taskId] = !cur[taskId];
      dayTasks[dayIdx] = cur;
      return { ...p, dayTasks, updatedAt: new Date().toISOString() };
    });
  };

  const updateNote = (dayIdx: number, value: string) => {
    setProgress((p) => ({
      ...p,
      notes: { ...p.notes, [dayIdx]: value },
      updatedAt: new Date().toISOString(),
    }));
  };

  const dayProgress = (i: number) => {
    const total = fiveDays[i].tasks.length;
    const done = Object.values(progress.dayTasks?.[i] || {}).filter(Boolean).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  const archiveCurrentRun = (reason: "completed" | "reset") => {
    const hasAnyProgress =
      progress.days.some(Boolean) ||
      Object.keys(progress.dayTasks).length > 0 ||
      Object.values(progress.notes).some((n) => n && n.trim().length > 0);
    if (!hasAnyProgress) return false;
    const run: HistoryRun = {
      id: `${Date.now()}`,
      startedAt: progress.startedAt,
      completedAt: new Date().toISOString(),
      daysCompleted: progress.days.filter(Boolean).length,
      totalTasksDone,
      notes: progress.notes,
      dayTasks: progress.dayTasks,
    };
    setHistory((h) => [run, ...h].slice(0, 30));
    toast.success(reason === "completed" ? "Ciclo arquivado no seu histórico ✓" : "Ciclo anterior salvo no histórico");
    return true;
  };

  const resetProgress = () => {
    archiveCurrentRun("reset");
    setProgress(emptyProgress());
    setCelebrated(false);
    toast("Novo ciclo iniciado", { description: "Pronta para reescrever o código." });
  };

  const handleCelebrationArchive = () => {
    archiveCurrentRun("completed");
    setProgress(emptyProgress());
    setCelebrated(false);
    setShowCelebration(false);
    setTimeout(() => {
      const el = document.querySelector(`[data-section="historico"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  };

  const deleteRun = (id: string) => {
    setHistory((h) => h.filter((r) => r.id !== id));
    toast("Registro removido");
  };

  const setFastingWindow = (w: FastingWindow) => {
    setProgress((p) => ({ ...p, fastingWindow: w, updatedAt: new Date().toISOString() }));
    toast.success(`Janela ajustada para ${w}`, { description: fastingMeta[w].pitch });
  };

  const currentMeta = fastingMeta[progress.fastingWindow];

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-2xl mx-auto">
      {showCelebration && (
        <CelebrationOverlay
          onClose={() => setShowCelebration(false)}
          onArchive={handleCelebrationArchive}
          runStats={{ days: completedCount, tasks: totalTasksDone }}
        />
      )}

      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-black via-zinc-950 to-black p-6 mb-4">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/40 rounded-full px-2.5 py-1 mb-3">
            <Zap className="h-3 w-3" /> Biohacking · Neurociência
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
            Protocolo <span className="text-gold">14.5</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reset Bio-Hacker · Guia Oficial Glow Up Club</p>
          <p className="text-xs text-foreground/80 mt-4 italic">"O corpo é hardware. A mente é software. Reescreva o código."</p>
        </div>
      </div>

      {/* PROGRESSO */}
      <div className="rounded-2xl border border-gold/30 bg-background/60 backdrop-blur p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Ciclo atual · 5 dias</p>
          <button onClick={resetProgress} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Novo ciclo
          </button>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden mb-3">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{completedCount}/5 dias · {percent}% · {totalTasksDone} hábitos</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Início: {formatDate(progress.startedAt)}</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 1 — TESE */}
        <SectionCard id="tese" icon={<Brain className="h-4 w-4" />} title="1. A Tese do Bio-Hack" subtitle="O corpo é um sistema otimizável">
          <p>Seu organismo não é frágil — é <span className="text-foreground font-semibold">programável</span>. Cada caloria vazia, cada scroll infinito, cada estímulo de dopamina barata acumula <span className="text-foreground font-semibold">lixo sistêmico</span> que consome largura de banda do córtex pré-frontal.</p>
          <p>O Protocolo 14.5 é uma <span className="text-foreground font-semibold">desfragmentação operacional</span>: remover o ruído metabólico e digital para liberar o processamento cerebral que sustenta foco, clareza e decisão estratégica.</p>
          <p className="text-xs text-foreground/70">Resultado mensurável: ↑ BDNF · ↑ sensibilidade à dopamina · ↓ inflamação · ↑ tempo em fluxo.</p>
        </SectionCard>

        {/* 2 — NEUROCIÊNCIA APROFUNDADA */}
        <SectionCard id="neurociencia" icon={<Activity className="h-4 w-4" />} title="2. Neurociência Aplicada" subtitle="Os 6 mecanismos que o protocolo ativa">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { icon: <Brain className="h-4 w-4 text-gold" />, t: "BDNF", d: "Fator Neurotrófico Derivado do Cérebro. Jejum + exercício + frio elevam BDNF em até 200% — combustível direto para neuroplasticidade e memória." },
              { icon: <Star className="h-4 w-4 text-gold" />, t: "Dopamina D2", d: "Receptores ressensibilizam em 5–7 dias sem scroll. A vontade de executar volta sem esforço — não é força de vontade, é química." },
              { icon: <Sunrise className="h-4 w-4 text-gold" />, t: "Cortisol Awakening", d: "Pico natural entre 06–09h. Acordar 05:00 + luz solar = você ancora o relógio biológico no estado de alerta máximo." },
              { icon: <Moon className="h-4 w-4 text-gold" />, t: "Glinfático", d: "Sistema de limpeza cerebral ativo no sono profundo. Dormir 22:30–05:00 maximiza a remoção de beta-amiloide." },
              { icon: <Snowflake className="h-4 w-4 text-gold" />, t: "Norepinefrina", d: "Banho frio 1–2 min eleva noradrenalina em 530%. Foco e humor pelas 4h seguintes." },
              { icon: <Eye className="h-4 w-4 text-gold" />, t: "Córtex pré-frontal", d: "Sede da decisão estratégica. Sem inflamação sistêmica + dopamina regulada, ele ganha banda de processamento." },
            ].map((b) => (
              <div key={b.t} className="rounded-lg border border-gold/15 bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">{b.icon}<p className="text-xs font-semibold text-foreground">{b.t}</p></div>
                <p className="text-[11px] leading-snug">{b.d}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 3 — CÓDIGO 14.5 */}
        <SectionCard id="codigo" icon={<Target className="h-4 w-4" />} title="3. O Código 14.5" subtitle="As duas variáveis fundadoras">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 14 — Jejum Metabólico</p>
            </div>
            <p>Janela de <span className="text-foreground font-semibold">14 horas sem ingestão calórica</span> (18:40 → 08:40). Ativa <span className="text-foreground font-semibold">autofagia celular</span>, estabiliza insulina e reduz inflamação de baixo grau.</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 5 — Despertar Estratégico</p>
            </div>
            <p>Acordar às <span className="text-foreground font-semibold">05:00</span> sincroniza o ritmo circadiano com o pico natural de cortisol. Você ganha <span className="text-foreground font-semibold">3h de vantagem operacional</span> sobre um mundo que ainda dorme.</p>
          </div>
        </SectionCard>

        {/* 4 — JEJUNS */}
        <SectionCard id="jejuns" icon={<Droplet className="h-4 w-4" />} title="4. Mapa dos Jejuns" subtitle="Do iniciante ao reset metabólico">
          <p>O 14.5 começa em 14h, mas a estrada continua. Cada janela ativa uma camada diferente do organismo:</p>
          <div className="space-y-2">
            {jejunsTipos.map((j) => (
              <div key={j.h} className={`rounded-lg border p-3 ${j.cor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-display font-bold text-gold">{j.h}</span>
                  <p className="text-sm font-semibold text-foreground">{j.nome}</p>
                </div>
                <p className="text-xs">{j.uso}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gold/30 bg-black/30 p-3 mt-2">
            <p className="text-xs"><span className="text-gold font-semibold">Eletrólitos no jejum:</span> 1g de sal rosa + magnésio 400mg + potássio. Sem isso, fadiga e dor de cabeça aparecem por mineral, não por fome.</p>
          </div>
        </SectionCard>

        {/* 5 — FIREWALL */}
        <SectionCard id="firewall" icon={<ShieldOff className="h-4 w-4" />} title="5. Firewall de Atenção" subtitle="Bloqueio total · Instagram · TikTok · Facebook">
          <p>Redes sociais são <span className="text-foreground font-semibold">máquinas de regulação negativa</span> de receptores D2. Cada deslize é uma microdose de dopamina que rebaixa o limiar — tarefas reais passam a parecer entediantes.</p>
          <p>Em <span className="text-foreground font-semibold">5 dias completos</span> sem o estímulo, o cérebro ressensibiliza os receptores. A procrastinação não é fraqueza de caráter: é química.</p>
          <p className="text-xs text-foreground/70">Tática: desinstale os apps. Use bloqueador (One Sec, Opal, Screen Zen). Sem exceção.</p>
        </SectionCard>

        {/* 6 — HAWKINS */}
        <SectionCard id="hawkins" icon={<TrendingUp className="h-4 w-4" />} title="6. Escala de Hawkins" subtitle="Mapa de Consciência · Dr. David R. Hawkins">
          <p className="mb-3">O protocolo move sua frequência operacional do território da <span className="text-foreground font-semibold">Prostração e Desejo</span> (abaixo de 200 — o homem-massa) para o nível da <span className="text-gold font-semibold">Razão e Inteligência Estratégica</span> (400+).</p>
          <div className="rounded-xl border border-gold/20 overflow-hidden">
            {hawkinsLevels.map((l) => (
              <div
                key={l.range}
                className={`flex items-center justify-between px-3 py-2 text-xs border-b border-border/40 last:border-b-0 bg-gradient-to-r ${l.color} ${
                  l.target ? "ring-2 ring-gold ring-inset" : ""
                } ${l.line ? "border-y-2 border-gold/60" : ""}`}
              >
                <span className={`font-mono font-bold ${l.low ? "text-white/90" : "text-black"}`}>{l.range}</span>
                <span className={`font-semibold ${l.low ? "text-white" : "text-black"}`}>{l.name}</span>
                {l.target && <span className="text-[10px] uppercase tracking-wider bg-black text-gold px-1.5 py-0.5 rounded">DESTINO</span>}
                {l.current && <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-1.5 py-0.5 rounded">SAÍDA</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/70 mt-3">Acima de 200 você gera energia. Abaixo, você drena.</p>
        </SectionCard>

        {/* 7 — MASLOW */}
        <SectionCard id="maslow" icon={<Layers className="h-4 w-4" />} title="7. Pirâmide de Maslow" subtitle="Da fisiologia à autorrealização">
          <p className="mb-3">Hawkins mede <span className="text-foreground font-semibold">frequência</span>. Maslow mapeia <span className="text-foreground font-semibold">necessidade</span>. O 14.5 ataca a <span className="text-gold font-semibold">base</span> — sem fisiologia regulada, nenhum nível superior se sustenta.</p>
          <div className="space-y-1.5 flex flex-col items-center">
            {maslowLevels.map((m) => (
              <div key={m.name} className={`${m.width} ${m.color} ${m.text} rounded-lg px-3 py-2.5 transition-all hover:scale-[1.02]`}>
                <p className="text-xs font-display font-bold leading-tight">{m.name}</p>
                <p className="text-[10px] opacity-90 leading-snug mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/70 mt-3">Quem pula a base e tenta operar no topo entra em colapso. O 14.5 reconstrói a pirâmide de baixo para cima.</p>
        </SectionCard>

        {/* 8 — HACK SUBLIMINAL */}
        <SectionCard id="subliminal" icon={<Moon className="h-4 w-4" />} title="8. Hack Subliminal" subtitle="Reprogramação durante o sono · ondas Delta/Teta">
          <p>Entre 22:00 e 02:00 o cérebro entra em <span className="text-foreground font-semibold">ondas Delta</span> — janela natural de consolidação de memória implícita. Antes de dormir, sintonize <span className="text-foreground font-semibold">Teta (4–8 Hz)</span> por 20 min para induzir hipnagogia.</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>22:30 — fone de ouvido, áudio Teta + afirmações em primeira pessoa.</li>
            <li>"Eu sou foco. Eu opero acima de 400. Eu não negocio com lixo."</li>
            <li>Volume baixo, suficiente para o subconsciente captar sem despertar o crítico.</li>
            <li>Repetir <span className="text-foreground font-semibold">os 5 dias</span> — a identidade nova é gravada no sistema 1.</li>
          </ul>
        </SectionCard>

        {/* 9 — 5 DIAS DINÂMICO */}
        <SectionCard id="execucao" icon={<CalendarDays className="h-4 w-4" />} title="9. Execução Dinâmica · 5 Dias" subtitle="Marque hábitos e registre como foi cada dia">
          <div className="space-y-3">
            {fiveDays.map((d, i) => {
              const done = progress.days[i];
              const dp = dayProgress(i);
              const note = progress.notes[i] || "";
              return (
                <div key={d.day} className={`rounded-xl border p-3 transition-colors ${done ? "border-gold/60 bg-gold/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${done ? "bg-gold text-black" : "bg-muted text-foreground"}`}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? "text-gold" : "text-foreground"}`}>{d.day} · {d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{dp.done}/{dp.total} hábitos · {dp.pct}%</p>
                    </div>
                  </div>
                  <p className="text-xs mb-2 text-muted-foreground">{d.body}</p>

                  <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden mb-3">
                    <div className="h-full bg-gold transition-all duration-500" style={{ width: `${dp.pct}%` }} />
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {d.tasks.map((t) => {
                      const checked = !!progress.dayTasks?.[i]?.[t.id];
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleTask(i, t.id)}
                          className={`w-full flex items-center gap-2 text-left text-xs px-2.5 py-2 rounded-lg border transition-colors ${
                            checked
                              ? "border-gold/50 bg-gold/10 text-foreground"
                              : "border-border bg-background/40 text-muted-foreground hover:border-gold/30"
                          }`}
                        >
                          <span className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-gold border-gold" : "border-muted-foreground/40"}`}>
                            {checked && <Check className="h-3 w-3 text-black" />}
                          </span>
                          <span className={checked ? "line-through opacity-80" : ""}>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Diário do dia */}
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <NotebookPen className="h-3.5 w-3.5 text-gold" />
                      <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">Como foi este dia?</p>
                    </div>
                    <Textarea
                      value={note}
                      onChange={(e) => updateNote(i, e.target.value)}
                      placeholder="Sensações, sintomas, vitórias, o que mudou… Tudo isso vai para o seu histórico."
                      className="text-xs min-h-[68px] bg-background/40 border-gold/20 focus-visible:ring-gold/40 resize-none"
                    />
                    {note.length > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">{note.length} caracteres salvos</p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    onClick={() => toggleDay(i)}
                    className={done
                      ? "w-full border-gold/60 text-gold hover:bg-gold/10"
                      : "w-full bg-gold hover:bg-gold/90 text-black font-semibold"}
                  >
                    {done ? "✓ Dia concluído · desfazer" : "Marcar dia concluído"}
                  </Button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 10 — DIÁRIO (atalho explicativo) */}
        <SectionCard id="diario" icon={<NotebookPen className="h-4 w-4" />} title="10. Seu Diário do Protocolo" subtitle="Tudo que você escrever em cada dia fica salvo aqui">
          <p>Cada anotação é gravada no seu dispositivo e arquivada quando o ciclo termina. Daqui a semanas, ao refazer o 14.5, você compara sintomas, vitórias e níveis de energia — e enxerga a evolução real entre os ciclos.</p>
          <p className="text-xs text-foreground/70">Dica de mentora: escreva 2–3 linhas por dia. O cérebro consolida o aprendizado quando vê o padrão repetido nos próprios ciclos.</p>
        </SectionCard>

        {/* 11 — HISTÓRICO */}
        <SectionCard id="historico" icon={<History className="h-4 w-4" />} title="11. Histórico de Ciclos" subtitle={`${history.length} ciclo${history.length === 1 ? "" : "s"} arquivado${history.length === 1 ? "" : "s"}`}>
          {history.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gold/30 bg-muted/10 p-4 text-center">
              <p className="text-xs">Nenhum ciclo arquivado ainda. Conclua os 5 dias e seu primeiro registro aparece aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((run, idx) => {
                const expanded = expandedRun === run.id;
                return (
                  <div key={run.id} className="rounded-xl border border-gold/20 bg-background/40 overflow-hidden">
                    <button
                      onClick={() => setExpandedRun(expanded ? null : run.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gold/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center">
                          <span className="text-xs font-display font-bold text-gold">#{history.length - idx}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            {formatDate(run.startedAt)} → {formatDate(run.completedAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {run.daysCompleted}/5 dias · {run.totalTasksDone} hábitos
                            {run.daysCompleted === 5 && <span className="ml-1.5 text-gold">· Completo ✦</span>}
                          </p>
                        </div>
                      </div>
                      {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>

                    {expanded && (
                      <div className="border-t border-gold/15 p-3 space-y-2 animate-fade-in">
                        {fiveDays.map((d, i) => {
                          const noteTxt = run.notes?.[i];
                          const taskCount = Object.values(run.dayTasks?.[i] || {}).filter(Boolean).length;
                          if (!noteTxt && taskCount === 0) return null;
                          return (
                            <div key={d.day} className="rounded-lg border border-border bg-muted/20 p-2.5">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[11px] font-semibold text-foreground">{d.day} · {d.title}</p>
                                <p className="text-[10px] text-muted-foreground">{taskCount}/{d.tasks.length}</p>
                              </div>
                              {noteTxt && <p className="text-[11px] text-muted-foreground italic leading-relaxed whitespace-pre-wrap">"{noteTxt}"</p>}
                            </div>
                          );
                        })}
                        {!fiveDays.some((_, i) => run.notes?.[i] || Object.values(run.dayTasks?.[i] || {}).some(Boolean)) && (
                          <p className="text-[11px] text-muted-foreground italic">Sem anotações registradas neste ciclo.</p>
                        )}
                        <button
                          onClick={() => deleteRun(run.id)}
                          className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-destructive flex items-center gap-1 pt-1"
                        >
                          <X className="h-3 w-3" /> Remover registro
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* 12 — IA */}
        <div data-section="ia" id="ia" className="scroll-mt-24">
          <Protocolo145Chat />
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-background to-background p-6 text-center">
          <Flame className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="text-lg font-display font-bold text-foreground leading-snug">
            O sistema só muda<br />se você mudar o código.
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-5">Inicie seu reset agora.</p>
          <Button
            size="lg"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold tracking-wide uppercase"
            onClick={() => navigate("/desafios")}
          >
            Iniciar Protocolo 14.5
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-[0.2em]">Soberania · Foco · Razão 400+</p>
        </div>
      </div>
    </div>
  );
}
