import { useState } from "react";
import { ChevronRight, CheckCircle2, Circle, Lock, Unlock, BookOpen, Brain, Compass, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { lessonContent } from "@/components/destravar/quizData";
import LessonQuiz from "@/components/destravar/LessonQuiz";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Lesson {
  title: string;
  subtitle: string;
}

interface Block {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  closingLine: string;
  icon: React.ElementType;
  color: string;
  lessons: Lesson[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const painPoints = [
  "Você trabalha, se esforça, faz tudo certo e mesmo assim sente que a vida não anda.",
  "Você toma decisões no impulso e depois se arrepende.",
  "Seus relacionamentos drenam mais energia do que dão.",
  "Você compensa no trabalho o que não resolve nas outras áreas.",
  "Ganha dinheiro mas não prospera de verdade.",
  "Já tentou terapia, curso, livro e continua travada.",
  "Sente que perdeu a conexão com quem você realmente é.",
];

const forYouIf = [
  "Sente que tá vivendo no piloto automático e quer retomar o controle.",
  "Sabe que o problema não é falta de esforço, é algo mais profundo.",
  "Quer parar de reagir e começar a decidir com clareza.",
  "Tá disposta a olhar pra dentro de verdade, mesmo que doa.",
  "Quer prosperar no dinheiro, nos relacionamentos e na carreira.",
];

const blocks: Block[] = [
  {
    id: "identidade",
    number: 1,
    title: "Identidade",
    subtitle: "Quem Você Se Tornou vs. Quem Deus Te Chamou Para Ser",
    summary: "Você vai entender quem se tornou e quem Deus te chamou para ser.",
    closingLine: "Você vai parar de se enxergar pela dor e começar a se enxergar pela paternidade de Deus.",
    icon: BookOpen,
    color: "from-rose-500/20 to-pink-500/20",
    lessons: [
      { title: "Identidade formada fora de Deus", subtitle: "Reconhecer padrões construídos na dor" },
      { title: "Feminilidade distorcida", subtitle: "Identificar excessos e desalinhamento bíblico" },
      { title: "Ciclo da mulher reativa", subtitle: "Identificar ausência de governo espiritual" },
    ],
  },
  {
    id: "sabedoria",
    number: 2,
    title: "Sabedoria",
    subtitle: "Alinhe Sua Mente à Verdade",
    summary: "Você vai alinhar sua mente à verdade e parar de viver guiada por emoções.",
    closingLine: "Você vai discernir o que vem de Deus e o que está te prendendo.",
    icon: Brain,
    color: "from-amber-500/20 to-yellow-500/20",
    lessons: [
      { title: "Controle vs Governo", subtitle: "Substituir controle por sabedoria" },
      { title: "Crenças vs Verdade", subtitle: "Confrontar mentiras com a Palavra" },
      { title: "Postura de solteira x postura de casada", subtitle: "Posicionamento relacional" },
      { title: "Vocação", subtitle: "Alinhar chamado com obediência" },
      { title: "Espiritualidade superficial", subtitle: "Sair da vida espiritual sem transformação" },
      { title: "Mente renovada", subtitle: "Pensar como alguém transformada" },
    ],
  },
  {
    id: "proposito",
    number: 3,
    title: "Propósito",
    subtitle: "Viva Alinhada e Governada Por Deus",
    summary: "Você vai viver uma vida estruturada, alinhada e governada por Deus.",
    closingLine: "Você vai sair com uma vida alinhada e estrutura para permanecer.",
    icon: Compass,
    color: "from-emerald-500/20 to-teal-500/20",
    lessons: [
      { title: "Governo na prática", subtitle: "Organizar vida como obediência" },
      { title: "Relacionamentos", subtitle: "Posicionamento com sabedoria e firmeza" },
      { title: "Direção profissional", subtitle: "Carreira vs chamado" },
      { title: "Ordem espiritual na rotina", subtitle: "Viver alinhada diariamente" },
      { title: "Blindagem de ambiente", subtitle: "Sustentar transformação" },
    ],
  },
];

const STORAGE_KEY = "destravar-feminino-progress";

function getSavedProgress(): Record<string, boolean[]> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function JornadaPage() {
  const [expandedBlock, setExpandedBlock] = useState<string | null>(null);
  const [openLesson, setOpenLesson] = useState<string | null>(null); // "blockId-lessonIdx"
  const [progress, setProgress] = useState<Record<string, boolean[]>>(getSavedProgress);

  const toggleLesson = (blockId: string, lessonIdx: number) => {
    setProgress(prev => {
      const block = blocks.find(b => b.id === blockId)!;
      const arr = [...(prev[blockId] || new Array(block.lessons.length).fill(false))];
      arr[lessonIdx] = !arr[lessonIdx];
      const updated = { ...prev, [blockId]: arr };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getBlockProgress = (block: Block) => {
    const arr = progress[block.id] || [];
    const done = arr.filter(Boolean).length;
    return Math.round((done / block.lessons.length) * 100);
  };

  const totalLessons = blocks.reduce((s, b) => s + b.lessons.length, 0);
  const totalDone = blocks.reduce((s, b) => (progress[b.id] || []).filter(Boolean).length + s, 0);
  const totalProgress = Math.round((totalDone / totalLessons) * 100);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-5 pt-12 pb-2">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Jornada do</p>
        <h1 className="text-2xl font-display font-bold">
          Destravar Feminino <span className="text-gold">✦</span>
        </h1>
      </header>

      <div className="px-5 space-y-5 pb-28">
        {/* Hero */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <p className="text-sm font-display font-semibold text-foreground leading-snug">
            Reencontre a sua verdadeira identidade.
          </p>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            Você vai aprender a governar suas emoções, tomar decisões com clareza e sair com um plano real para prosperar na vida financeira, nos relacionamentos e na carreira.
          </p>
        </div>

        {/* Pain points */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-display font-bold text-gold uppercase tracking-wider">
            Quais dessas situações você vive hoje?
          </p>
          <ul className="space-y-2.5">
            {painPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{point}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Insight */}
        <div className="bg-gradient-to-br from-gold/10 to-gold/5 rounded-2xl border border-gold/20 p-5 space-y-3">
          <p className="text-xs font-body text-foreground leading-relaxed">
            Isso não é falta de esforço. <span className="font-bold text-gold">É falta de autogoverno.</span>
          </p>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            O problema não é a sua vida. É a identidade que você tá vivendo. Você foi construindo uma versão de si mesma em cima do que te disseram pra ser. Do que esperavam de você, do que parecia seguro.
          </p>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            E essa versão não dá conta. Ela trava nos relacionamentos. Compensa no trabalho. Se sabota com dinheiro. Porque não é você de verdade. É uma identidade montada — e identidade montada não sustenta uma vida próspera.
          </p>
          <div className="pt-2 border-t border-gold/20">
            <p className="text-sm font-display font-bold text-center text-foreground italic">
              "Enquanto você não governa, você é governada."
            </p>
            <p className="text-[10px] font-body text-center text-muted-foreground mt-1">
              Pelas emoções. Pelas expectativas dos outros. Pelo medo. Pela culpa.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-body font-semibold text-foreground">Seu progresso</p>
            <span className="text-sm font-body font-bold text-gold">{totalProgress}%</span>
          </div>
          <div className="bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-body mt-2">
            {totalDone} de {totalLessons} lições concluídas
          </p>
        </div>

        {/* Blocks */}
        {blocks.map(block => {
          const isExpanded = expandedBlock === block.id;
          const blockProgress = getBlockProgress(block);
          const blockArr = progress[block.id] || [];

          return (
            <div key={block.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setExpandedBlock(isExpanded ? null : block.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                  block.color
                )}>
                  <block.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">
                      Bloco {block.number}
                    </span>
                    {blockProgress === 100 && <CheckCircle2 className="h-3.5 w-3.5 text-gold" />}
                  </div>
                  <p className="text-sm font-display font-semibold truncate">{block.title}</p>
                  <p className="text-xs font-body text-muted-foreground">{block.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-body text-muted-foreground">{blockProgress}%</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in border-t border-border pt-4">
                  <p className="text-xs font-body text-muted-foreground leading-relaxed italic">
                    {block.summary}
                  </p>

                  {block.lessons.map((lesson, i) => {
                    const done = blockArr[i] || false;
                    const lessonKey = `${block.id}-${i}`;
                    const isLessonOpen = openLesson === lessonKey;
                    const content = lessonContent[block.id]?.[i];

                    return (
                      <div key={i} className="space-y-0">
                        <button
                          onClick={() => setOpenLesson(isLessonOpen ? null : lessonKey)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-left"
                        >
                          {done ? (
                            <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs font-body font-semibold", done && "text-muted-foreground")}>
                              {lesson.title}
                            </p>
                            <p className="text-[10px] font-body text-muted-foreground">{lesson.subtitle}</p>
                          </div>
                          <ChevronRight className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform shrink-0",
                            isLessonOpen && "rotate-90"
                          )} />
                        </button>

                        {isLessonOpen && content && (
                          <div className="ml-8 mt-2 p-3 rounded-xl border border-border/50 bg-background/50">
                            <LessonQuiz
                              content={content}
                              lessonTitle={lesson.title}
                              isCompleted={done}
                              onComplete={() => {
                                if (!done) toggleLesson(block.id, i);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <p className="text-xs font-body text-gold font-medium pt-1 italic">
                    ✦ {block.closingLine}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* For you if */}
        <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
          <p className="text-xs font-display font-bold text-gold uppercase tracking-wider">
            É pra você se:
          </p>
          <ul className="space-y-2.5">
            {forYouIf.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <Sparkles className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-gold/15 to-gold/5 rounded-2xl border border-gold/30 p-5 text-center space-y-2">
          <Unlock className="h-6 w-6 text-gold mx-auto" />
          <p className="text-sm font-display font-bold text-foreground">
            O botão de Destravar é o que muda.
          </p>
          <p className="text-[10px] font-body text-muted-foreground">
            Leituras curtas · Exercícios práticos · Quizzes com lições
          </p>
        </div>
      </div>
    </div>
  );
}
