import { useState } from "react";
import { ArrowLeft, Brain, Check, ChevronDown, ChevronUp, Lightbulb, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  title: string;
  category: string;
  description: string;
  steps: string[];
  tip: string;
}

const exercises: Exercise[] = [
  {
    id: "1",
    title: "Ancoragem Positiva",
    category: "PNL",
    description: "Associe um gesto físico a um estado emocional positivo",
    steps: [
      "Lembre de um momento em que se sentiu extremamente confiante",
      "Reviva esse momento: veja, ouça e sinta tudo novamente",
      "Quando a emoção estiver no pico, pressione o polegar e indicador juntos",
      "Repita 3 vezes para fortalecer a âncora",
      "Use o gesto sempre que precisar acessar esse estado",
    ],
    tip: "Quanto mais detalhes sensoriais, mais forte a âncora",
  },
  {
    id: "2",
    title: "Reestruturação Cognitiva",
    category: "Neurociência",
    description: "Transforme pensamentos negativos em crenças fortalecedoras",
    steps: [
      "Identifique um pensamento negativo recorrente",
      "Questione: 'Isso é um fato ou uma interpretação?'",
      "Liste 3 evidências que contradizem esse pensamento",
      "Crie uma frase alternativa positiva e realista",
      "Repita a nova frase por 21 dias para criar novo caminho neural",
    ],
    tip: "O cérebro leva cerca de 21 dias para formar um novo hábito neural",
  },
  {
    id: "3",
    title: "Técnica do Espelho",
    category: "PNL",
    description: "Reprogramação de autoimagem para elevar autoestima",
    steps: [
      "Olhe-se no espelho nos olhos por 30 segundos",
      "Diga seu nome e uma qualidade: 'Eu, [nome], sou incrível'",
      "Sorria para si mesma e mantenha contato visual",
      "Repita 3 afirmações positivas sobre você",
      "Faça isso todas as manhãs por 30 dias",
    ],
    tip: "No início pode ser desconfortável, mas persista — é transformador",
  },
  {
    id: "4",
    title: "Visualização de Processo",
    category: "Neurociência",
    description: "Ative os mesmos circuitos neurais da ação real",
    steps: [
      "Escolha um objetivo que deseja alcançar",
      "Feche os olhos e visualize cada passo do processo",
      "Imagine-se executando cada ação com maestria",
      "Sinta as emoções de progresso e conquista",
      "Pratique 5 minutos por dia antes de dormir",
    ],
    tip: "Estudos mostram que visualização ativa 70% dos mesmos neurônios da ação real",
  },
  {
    id: "5",
    title: "Interrupção de Padrão",
    category: "PNL",
    description: "Quebre hábitos negativos com uma ação inesperada",
    steps: [
      "Identifique um hábito que quer mudar",
      "Note o gatilho que inicia o comportamento",
      "Quando sentir o gatilho, faça algo completamente diferente",
      "Ex: ao sentir ansiedade, bata palmas 3 vezes e sorria",
      "Substitua por um comportamento positivo consistentemente",
    ],
    tip: "A surpresa quebra o ciclo automático e abre espaço para escolha consciente",
  },
];

export default function NeurocienciaPNL({ onBack }: { onBack: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>({});

  const toggleStep = (exerciseId: string, stepIdx: number) => {
    setCompletedSteps(prev => {
      const current = prev[exerciseId] || new Set();
      const next = new Set(current);
      if (next.has(stepIdx)) next.delete(stepIdx);
      else next.add(stepIdx);
      return { ...prev, [exerciseId]: next };
    });
  };

  const getProgress = (exerciseId: string, totalSteps: number) => {
    const completed = completedSteps[exerciseId]?.size || 0;
    return Math.round((completed / totalSteps) * 100);
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Neurociência & PNL <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Exercícios práticos para reprogramar sua mente</p>
      </header>

      <div className="px-5 space-y-3 pb-6">
        {exercises.map(ex => {
          const isExpanded = expandedId === ex.id;
          const progress = getProgress(ex.id, ex.steps.length);

          return (
            <div key={ex.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <button
                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  ex.category === "PNL" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  <Brain className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-body font-semibold">{ex.title}</p>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded-full font-body font-medium",
                      ex.category === "PNL" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {ex.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-body">{ex.description}</p>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {/* Progress bar */}
              {progress > 0 && (
                <div className="px-4 pb-2">
                  <div className="bg-muted rounded-full h-1">
                    <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  {ex.steps.map((step, i) => {
                    const done = completedSteps[ex.id]?.has(i) || false;
                    return (
                      <button
                        key={i}
                        onClick={() => toggleStep(ex.id, i)}
                        className="w-full flex items-start gap-2 py-1"
                      >
                        <div className={cn(
                          "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          done ? "border-gold bg-gold" : "border-muted-foreground"
                        )}>
                          {done && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className={cn("text-sm font-body text-left leading-relaxed", done && "line-through text-muted-foreground")}>
                          {step}
                        </span>
                      </button>
                    );
                  })}

                  {/* Tip */}
                  <div className="bg-gold/5 rounded-xl p-3 flex items-start gap-2 mt-2">
                    <Lightbulb className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <p className="text-xs font-body text-muted-foreground italic">{ex.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
