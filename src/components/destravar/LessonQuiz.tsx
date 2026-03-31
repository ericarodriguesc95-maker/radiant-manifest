import { useState } from "react";
import { CheckCircle2, XCircle, ChevronRight, BookOpen, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { LessonContent } from "./quizData";

interface LessonQuizProps {
  content: LessonContent;
  lessonTitle: string;
  onComplete: () => void;
  isCompleted: boolean;
}

type Phase = "reading" | "quiz" | "result";

export default function LessonQuiz({ content, lessonTitle, onComplete, isCompleted }: LessonQuizProps) {
  const [phase, setPhase] = useState<Phase>("reading");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const quiz = content.quiz;
  const q = quiz[currentQ];

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQ < quiz.length - 1) {
      setCurrentQ(i => i + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setPhase("result");
      if (!isCompleted) onComplete();
    }
  };

  const handleRestart = () => {
    setPhase("reading");
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
  };

  // ─── Reading Phase ───
  if (phase === "reading") {
    return (
      <div className="space-y-3 animate-fade-in">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4 text-gold" />
          <p className="text-[10px] font-body font-bold text-gold uppercase tracking-wider">Leitura</p>
        </div>
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          {content.reading}
        </p>
        <button
          onClick={() => setPhase("quiz")}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-body font-semibold transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Fazer o Quiz
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // ─── Result Phase ───
  if (phase === "result") {
    const pct = Math.round((score / quiz.length) * 100);
    return (
      <div className="space-y-3 animate-fade-in text-center">
        <div className="py-3">
          <p className="text-3xl font-display font-bold text-gold">{pct}%</p>
          <p className="text-xs font-body text-muted-foreground mt-1">
            {score} de {quiz.length} {quiz.length === 1 ? "resposta correta" : "respostas corretas"}
          </p>
        </div>
        <p className="text-xs font-body text-foreground font-medium">
          {pct === 100
            ? "Perfeito! Você absorveu a lição com excelência ✦"
            : pct >= 50
            ? "Bom trabalho! Revise os pontos que errou para fixar."
            : "Releia a lição com calma e tente novamente. Cada erro é aprendizado."}
        </p>
        <button
          onClick={handleRestart}
          className="w-full py-2.5 rounded-xl bg-muted hover:bg-muted/70 text-xs font-body font-semibold text-foreground transition-colors"
        >
          Refazer lição
        </button>
      </div>
    );
  }

  // ─── Quiz Phase ───
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-gold" />
          <p className="text-[10px] font-body font-bold text-gold uppercase tracking-wider">Quiz</p>
        </div>
        <p className="text-[10px] font-body text-muted-foreground">
          {currentQ + 1}/{quiz.length}
        </p>
      </div>

      <p className="text-xs font-body font-semibold text-foreground leading-snug">
        {q.question}
      </p>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correctIndex;
          const isSelected = i === selected;
          let style = "bg-muted/40 hover:bg-muted/70 border-transparent";
          if (answered) {
            if (isCorrect) style = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
            else if (isSelected && !isCorrect) style = "bg-red-500/10 border-red-500/40 text-red-400";
            else style = "bg-muted/20 border-transparent opacity-50";
          }

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={cn(
                "w-full text-left flex items-center gap-2.5 p-3 rounded-xl border text-xs font-body transition-all",
                style
              )}
            >
              {answered && isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
              {answered && isSelected && !isCorrect && <XCircle className="h-4 w-4 shrink-0 text-red-400" />}
              {!answered && (
                <span className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/40 flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </span>
              )}
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="bg-muted/30 rounded-xl p-3 animate-fade-in">
          <p className="text-[10px] font-body text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Explicação: </span>
            {q.explanation}
          </p>
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-body font-semibold transition-colors"
        >
          {currentQ < quiz.length - 1 ? "Próxima pergunta" : "Ver resultado"}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
