import { useState } from "react";
import { BookOpen, ChevronRight, CheckCircle2, Circle, Sparkles, Target, Eye, Brain, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  prompts: string[];
  color: string;
}

const chapters: Chapter[] = [
  {
    id: "reflexao-2025",
    number: 1,
    title: "Reflexão Sobre 2025",
    subtitle: "O Que Aprendemos?",
    description: "Faça uma pausa para refletir sobre 2025: os momentos bons, os desafios, as conquistas e os aprendizados.",
    icon: BookOpen,
    prompts: [
      "Quais momentos você se orgulha? Que metas você alcançou?",
      "Quais foram os momentos mais difíceis? Como você os superou?",
      "Quais lições valiosas você tirou de 2025?",
      "Quais hábitos te ajudaram? Quais te atrapalharam?",
      "O que você faria diferente?",
    ],
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    id: "nova-era",
    number: 2,
    title: "Definindo Sua Nova Era",
    subtitle: "Quem Você Quer Ser em 2026?",
    description: "A sua Nova Era é uma transformação completa: de quem você é, como se sente, e o que decide fazer com seu tempo e energia.",
    icon: Sparkles,
    prompts: [
      "Quais novos valores vão te guiar em 2026?",
      "Que tipo de energia você quer emanar?",
      "Quais hábitos farão parte do seu dia a dia?",
      "Como você se sentirá ao viver essa versão mais autêntica?",
      "Que crenças limitantes você vai deixar para trás?",
    ],
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "vision-board",
    number: 3,
    title: "Vision Board 2026",
    subtitle: "Visualize Seus Sonhos",
    description: "Um Vision Board é uma ferramenta poderosa para visualizar seus sonhos e metas, mantendo o foco e a motivação.",
    icon: Eye,
    prompts: [
      "Defina suas metas: pessoal, profissional, saúde, relacionamentos, diversão.",
      "Reúna imagens e frases que representem seus objetivos.",
      "Adicione afirmações: 'Eu sou capaz', 'Eu mereço prosperar'.",
      "Coloque seu Vision Board em um lugar visível.",
      "Revise e atualize conforme o ano avança.",
    ],
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    id: "metas-smart",
    number: 4,
    title: "Metas SMART",
    subtitle: "Metas Que Funcionam",
    description: "Use o método SMART para criar metas Específicas, Mensuráveis, Alcançáveis, Relevantes e com Prazo.",
    icon: Target,
    prompts: [
      "1º Trimestre (Jan-Mar): Fundação e início — quais são suas metas?",
      "2º Trimestre (Abr-Jun): Desenvolvimento — como vai avançar?",
      "3º Trimestre (Jul-Set): Consolidação — o que vai fortalecer?",
      "4º Trimestre (Out-Dez): Finalização — como vai concluir o ano?",
    ],
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    id: "reflexao-final",
    number: 5,
    title: "Reflexão Final",
    subtitle: "Carta Para Si Mesma",
    description: "Escreva uma carta para você mesma, para ser lida em dezembro de 2026. Descreva quem você será.",
    icon: PenLine,
    prompts: [
      "Como é a versão de mim que viveu 2026 com propósito?",
      "O que essa nova versão conquistou?",
      "Como me sinto em relação ao meu corpo, mente e relacionamentos?",
      "Quais hábitos saudáveis fazem parte da minha rotina?",
    ],
    color: "from-rose-500/20 to-amber-500/20",
  },
];

const STORAGE_KEY = "glow-up-jornada";

function getSavedAnswers(): Record<string, Record<number, string>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export default function JornadaPage() {
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, Record<number, string>>>(getSavedAnswers);

  const saveAnswer = (chapterId: string, promptIndex: number, value: string) => {
    setAnswers(prev => {
      const updated = {
        ...prev,
        [chapterId]: { ...(prev[chapterId] || {}), [promptIndex]: value },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const getChapterProgress = (chapter: Chapter) => {
    const chapterAnswers = answers[chapter.id] || {};
    const answered = Object.values(chapterAnswers).filter(v => v.trim().length > 0).length;
    return Math.round((answered / chapter.prompts.length) * 100);
  };

  const totalProgress = Math.round(
    chapters.reduce((sum, ch) => sum + getChapterProgress(ch), 0) / chapters.length
  );

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Minha</p>
        <h1 className="text-2xl font-display font-bold">
          Jornada 2026 <span className="text-gold">✦</span>
        </h1>
      </header>

      <div className="px-5 space-y-4 pb-28">
        {/* Overall progress */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-body font-semibold text-foreground">Progresso geral</p>
            <span className="text-sm font-body font-bold text-gold">{totalProgress}%</span>
          </div>
          <div className="bg-muted rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-700"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-body mt-2">
            Baseado no ebook "Meu Propósito 2026"
          </p>
        </div>

        {/* Chapters */}
        {chapters.map((chapter) => {
          const isExpanded = expandedChapter === chapter.id;
          const progress = getChapterProgress(chapter);
          const chapterAnswers = answers[chapter.id] || {};

          return (
            <div key={chapter.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Chapter header */}
              <button
                onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div className={cn(
                  "h-11 w-11 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
                  chapter.color
                )}>
                  <chapter.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">
                      Capítulo {chapter.number}
                    </span>
                    {progress === 100 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold" />
                    )}
                  </div>
                  <p className="text-sm font-display font-semibold truncate">{chapter.title}</p>
                  <p className="text-xs font-body text-muted-foreground">{chapter.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-body text-muted-foreground">{progress}%</span>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </button>

              {/* Chapter content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border pt-4">
                  <p className="text-xs font-body text-muted-foreground leading-relaxed">
                    {chapter.description}
                  </p>

                  {chapter.prompts.map((prompt, i) => {
                    const hasAnswer = (chapterAnswers[i] || "").trim().length > 0;
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-start gap-2">
                          {hasAnswer ? (
                            <CheckCircle2 className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <p className="text-xs font-body font-medium text-foreground">{prompt}</p>
                        </div>
                        <textarea
                          value={chapterAnswers[i] || ""}
                          onChange={(e) => saveAnswer(chapter.id, i, e.target.value)}
                          placeholder="Escreva sua reflexão..."
                          rows={3}
                          className="w-full bg-muted/50 border border-border rounded-xl p-3 text-xs font-body outline-none resize-none placeholder:text-muted-foreground focus:border-gold/50 transition-colors"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
