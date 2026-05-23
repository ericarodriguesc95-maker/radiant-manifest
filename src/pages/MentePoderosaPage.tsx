import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Brain, Heart, Eye, Sparkles, Trophy, Flame, CheckCircle2,
  Circle, Target, History, BookOpen, Zap, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import MentePoderosaChat from "@/components/MentePoderosaChat";

// ───────────────────────── Storage Keys ─────────────────────────
const PROGRESS_KEY = "mente-poderosa:progress:v1";
const HISTORY_KEY = "mente-poderosa:history:v1";

// ───────────────────────── Modules (Trilhas) ─────────────────────────
type Task = { id: string; title: string; desc: string; xp: number };
type ModuleDef = {
  id: string;
  title: string;
  area: "IE" | "PSI" | "NEURO" | "MKT";
  icon: typeof Brain;
  tagline: string;
  tasks: Task[];
};

const MODULES: ModuleDef[] = [
  {
    id: "ie-fundamentos",
    title: "Inteligência Emocional — Os 5 Pilares de Goleman",
    area: "IE",
    icon: Heart,
    tagline: "Autoconsciência → Autorregulação → Motivação → Empatia → Habilidade Social",
    tasks: [
      { id: "ie1", title: "Nomeie 3 emoções do seu dia", desc: "Pesquisa de Lisa Feldman Barrett: granularidade emocional reduz a ativação da amígdala. Nomeie com precisão — não 'mal', mas 'frustrada', 'ressentida', 'ansiosa'.", xp: 20 },
      { id: "ie2", title: "Pratique a pausa de 6 segundos", desc: "Entre o gatilho e a reação, conte 6s respirando. É o tempo neural para o córtex pré-frontal assumir o controle da amígdala.", xp: 25 },
      { id: "ie3", title: "Escreva uma carta de empatia", desc: "Para alguém que te irritou esta semana, escreva 3 razões plausíveis pelo comportamento dela. Aumenta empatia cognitiva (Hojat).", xp: 30 },
      { id: "ie4", title: "Identifique seu gatilho-mestre", desc: "Qual situação repetidamente te tira do eixo? Mapeie: gatilho → emoção → pensamento → comportamento.", xp: 25 },
      { id: "ie5", title: "Respiração 4-7-8 antes de decidir", desc: "Ative o nervo vago. Inspire 4s, segure 7s, expire 8s. Faça 4 ciclos antes de qualquer decisão importante hoje.", xp: 20 },
    ],
  },
  {
    id: "psi-sombra",
    title: "Psicologia Humana — Sombra, Apego & Arquétipos",
    area: "PSI",
    icon: Eye,
    tagline: "Jung, Bowlby e o que sua mente esconde de você mesma",
    tasks: [
      { id: "psi1", title: "Mapeie sua sombra (Jung)", desc: "Liste 3 traços que você mais critica nas outras mulheres. Geralmente é projeção do que você reprime em si.", xp: 30 },
      { id: "psi2", title: "Identifique seu estilo de apego", desc: "Seguro, ansioso, evitativo ou desorganizado? Observe como você reage quando alguém demora a responder.", xp: 25 },
      { id: "psi3", title: "Qual arquétipo feminino te governa?", desc: "Donzela, Mãe, Sábia, Guerreira, Sedutora, Mística. Reconheça e escolha conscientemente qual ativar.", xp: 25 },
      { id: "psi4", title: "Liste 3 distorções cognitivas suas", desc: "Catastrofização, leitura de mente, tudo ou nada, personalização… Identifique as suas (TCC — Beck).", xp: 30 },
      { id: "psi5", title: "Reframe um pensamento automático", desc: "Pegue um pensamento negativo recorrente e reescreva em 3 versões mais funcionais. Modelo ABC de Ellis.", xp: 30 },
    ],
  },
  {
    id: "neuro-cerebro",
    title: "Neurociência — Cérebro Feminino Sob Controle",
    area: "NEURO",
    icon: Brain,
    tagline: "Amígdala, córtex pré-frontal, dopamina, nervo vago",
    tasks: [
      { id: "n1", title: "Tom vagal: cante 2 minutos", desc: "Cantar/cantarolar estimula o nervo vago via cordas vocais — reduz cortisol em até 23% (Porges).", xp: 20 },
      { id: "n2", title: "Exposição ao frio 30s", desc: "Final do banho em água fria por 30s. Aumenta noradrenalina em 530% e treina resiliência neural.", xp: 25 },
      { id: "n3", title: "Caminhada bilateral 15 min", desc: "Caminhar ativa coordenação interhemisférica — mesmo efeito do EMDR para regulação emocional.", xp: 25 },
      { id: "n4", title: "Estudo: leia sobre neuroplasticidade", desc: "Hebb: 'neurônios que disparam juntos, se conectam'. Por isso repetir hábitos por 21–66 dias rewire o cérebro.", xp: 30 },
      { id: "n5", title: "Dieta dopaminérgica 24h", desc: "Sem redes sociais, sem açúcar, sem notificações por 24h. Ressensibiliza receptores D2 (Lembke).", xp: 40 },
    ],
  },
  {
    id: "mkt-influencia",
    title: "Neuromarketing — Arquitetura de Influência Feminina",
    area: "MKT",
    icon: Sparkles,
    tagline: "Cialdini + Kahneman aplicados à sua presença e narrativa",
    tasks: [
      { id: "m1", title: "Escassez na sua agenda", desc: "Pare de estar 100% disponível. Escassez aumenta valor percebido (Cialdini). Diga 'tenho uma janela quinta às 16h'.", xp: 25 },
      { id: "m2", title: "Ancoragem em uma negociação", desc: "Sempre lance o primeiro número alto. O cérebro ancora ali (Tversky & Kahneman) e ajusta pouco a partir do âncora.", xp: 30 },
      { id: "m3", title: "Storytelling: 1 história sua hoje", desc: "Narrativas ativam córtex sensorial — fixam 22x mais que dados (Bruner). Conte uma história, não dê uma palestra.", xp: 25 },
      { id: "m4", title: "Reciprocidade estratégica", desc: "Dê algo de valor inesperado a alguém-chave. Ativa o gatilho mais antigo do cérebro social (Cialdini).", xp: 25 },
      { id: "m5", title: "Prova social na sua bio", desc: "Atualize sua bio com 1 número, 1 conquista, 1 nome reconhecido. O cérebro confia em prova social (Asch).", xp: 30 },
    ],
  },
];

const ALL_TASKS_COUNT = MODULES.reduce((s, m) => s + m.tasks.length, 0);
const TOTAL_XP = MODULES.reduce((s, m) => s + m.tasks.reduce((t, k) => t + k.xp, 0), 0);

// ───────────────────────── Levels ─────────────────────────
const LEVELS = [
  { name: "Despertar", min: 0, color: "text-zinc-300" },
  { name: "Aprendiz da Mente", min: 100, color: "text-amber-300" },
  { name: "Estrategista Emocional", min: 250, color: "text-amber-200" },
  { name: "Mestra da Influência", min: 450, color: "text-gold" },
  { name: "Soberana da Mente", min: 650, color: "text-yellow-300" },
];

function levelFromXp(xp: number) {
  let current = LEVELS[0];
  let next: typeof LEVELS[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) current = LEVELS[i];
    if (LEVELS[i].min > xp) { next = LEVELS[i]; break; }
  }
  return { current, next };
}

// ───────────────────────── State Types ─────────────────────────
type Progress = {
  completed: Record<string, string>; // taskId -> ISO date
  xp: number;
};

type HistoryEntry = {
  id: string;
  taskId: string;
  moduleId: string;
  taskTitle: string;
  date: string;
  note?: string;
  xp: number;
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completed: {}, xp: 0 };
    return JSON.parse(raw);
  } catch { return { completed: {}, xp: 0 }; }
}
function saveProgress(p: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}
function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch {}
}

// ───────────────────────── Page ─────────────────────────
export default function MentePoderosaPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [openModule, setOpenModule] = useState<string | null>(MODULES[0].id);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { saveHistory(history); }, [history]);

  const completedCount = Object.keys(progress.completed).length;
  const overallPct = Math.round((completedCount / ALL_TASKS_COUNT) * 100);
  const { current: level, next: nextLevel } = useMemo(() => levelFromXp(progress.xp), [progress.xp]);
  const nextLevelPct = nextLevel
    ? Math.min(100, Math.round(((progress.xp - level.min) / (nextLevel.min - level.min)) * 100))
    : 100;

  const toggleTask = (mod: ModuleDef, task: Task) => {
    const isDone = !!progress.completed[task.id];
    if (isDone) {
      const { [task.id]: _, ...rest } = progress.completed;
      setProgress({ completed: rest, xp: Math.max(0, progress.xp - task.xp) });
      toast("Tarefa desmarcada.");
    } else {
      setProgress({
        completed: { ...progress.completed, [task.id]: new Date().toISOString() },
        xp: progress.xp + task.xp,
      });
      const entry: HistoryEntry = {
        id: `${task.id}-${Date.now()}`,
        taskId: task.id,
        moduleId: mod.id,
        taskTitle: task.title,
        date: new Date().toISOString(),
        xp: task.xp,
      };
      setHistory([entry, ...history]);
      toast.success(`+${task.xp} XP — ${task.title}`, { icon: "👑" });

      // Level up check
      const before = levelFromXp(progress.xp).current.name;
      const after = levelFromXp(progress.xp + task.xp).current.name;
      if (before !== after) {
        setTimeout(() => toast.success(`✨ Subiu de nível: ${after}!`, { duration: 4000 }), 400);
      }
    }
  };

  const saveNote = (entryId: string) => {
    setHistory(history.map(h => h.id === entryId ? { ...h, note: noteText.trim() } : h));
    setNoteFor(null); setNoteText("");
    toast.success("Nota salva.");
  };

  const resetAll = () => {
    if (!confirm("Apagar todo o progresso e histórico de Mente Poderosa?")) return;
    setProgress({ completed: {}, xp: 0 });
    setHistory([]);
    try {
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    toast.success("Tudo zerado. Recomece quando quiser, rainha.");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-gold">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-gold" /> Mente Poderosa
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/70">
              IE · Psicologia · Neurociência · Neuromarketing
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <section className="rounded-2xl border border-gold/30 bg-gradient-to-br from-zinc-950 via-black to-amber-950/10 p-5">
          <p className="text-xs tracking-[0.25em] uppercase text-gold/70 font-semibold mb-2">Bom dia, rainha</p>
          <h2 className="font-display text-xl text-foreground mb-2">Domine sua mente. Influencie o mundo.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Um programa em 4 trilhas para mulheres que querem regulação emocional de elite, leitura humana profunda,
            domínio neural e poder de influência ético. Tarefas diárias, gamificação real e uma IA expert ao seu lado.
          </p>
        </section>

        {/* Stats: Level + XP + Progress */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gold/30 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/70 font-semibold">Nível</p>
            </div>
            <p className={`font-display text-lg ${level.color}`}>{level.name}</p>
            {nextLevel ? (
              <>
                <Progress value={nextLevelPct} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {nextLevel.min - progress.xp} XP para {nextLevel.name}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-gold mt-2">Nível máximo atingido 👑</p>
            )}
          </div>
          <div className="rounded-2xl border border-gold/30 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/70 font-semibold">XP Total</p>
            </div>
            <p className="font-display text-2xl text-foreground">{progress.xp}<span className="text-sm text-muted-foreground"> / {TOTAL_XP}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">Pontos de experiência conquistados</p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-zinc-950/60 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/70 font-semibold">Tarefas</p>
            </div>
            <p className="font-display text-2xl text-foreground">{completedCount}<span className="text-sm text-muted-foreground"> / {ALL_TASKS_COUNT}</span></p>
            <Progress value={overallPct} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{overallPct}% do programa</p>
          </div>
        </section>

        {/* AI Chat */}
        <MentePoderosaChat />

        {/* Modules */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Trilhas</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const modDone = mod.tasks.filter(t => progress.completed[t.id]).length;
            const modPct = Math.round((modDone / mod.tasks.length) * 100);
            const isOpen = openModule === mod.id;
            return (
              <div key={mod.id} className="rounded-2xl border border-gold/20 bg-zinc-950/40 overflow-hidden">
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gold/5 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground">{mod.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{mod.tagline}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={modPct} className="h-1 flex-1" />
                      <span className="text-[10px] text-gold/70 font-mono">{modDone}/{mod.tasks.length}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gold/15 p-3 space-y-2 bg-black/30">
                    {mod.tasks.map((task) => {
                      const done = !!progress.completed[task.id];
                      return (
                        <div
                          key={task.id}
                          className={`rounded-xl border p-3 transition-all ${
                            done ? "border-gold/40 bg-gold/5" : "border-gold/15 bg-zinc-900/40"
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(mod, task)}
                            className="w-full flex items-start gap-3 text-left"
                          >
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${done ? "text-gold line-through" : "text-foreground"}`}>
                                {task.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{task.desc}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Zap className="h-3 w-3 text-gold" />
                                <span className="text-[10px] text-gold font-mono">+{task.xp} XP</span>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* History */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Histórico</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-2">
              Seu histórico aparecerá aqui conforme você completa tarefas.
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((h) => (
                <div key={h.id} className="rounded-xl border border-gold/15 bg-zinc-950/50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{h.taskTitle}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(h.date).toLocaleString("pt-BR")} · +{h.xp} XP
                      </p>
                      {h.note && (
                        <p className="text-[11px] text-foreground/80 mt-2 italic border-l-2 border-gold/40 pl-2">
                          {h.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setNoteFor(h.id);
                        setNoteText(h.note || "");
                      }}
                      className="text-[10px] text-gold/80 hover:text-gold underline"
                    >
                      {h.note ? "Editar" : "Anotar"}
                    </button>
                  </div>

                  {noteFor === h.id && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={2}
                        placeholder="Como foi praticar essa tarefa? O que sentiu?"
                        className="w-full bg-black/40 border border-gold/20 rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveNote(h.id)} className="bg-gold hover:bg-gold/90 text-black h-7 text-xs">
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setNoteFor(null); setNoteText(""); }} className="h-7 text-xs">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reset */}
        <div className="pt-4">
          <Button variant="ghost" size="sm" onClick={resetAll} className="text-[10px] text-muted-foreground hover:text-destructive">
            <Flame className="h-3 w-3 mr-1" /> Zerar progresso
          </Button>
        </div>
      </main>
    </div>
  );
}
