import { useState } from "react";
import { Plus, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  category: "carreira" | "saude" | "relacionamento" | "financeiro" | "pessoal";
  progress: number;
  tasks: { id: string; text: string; done: boolean }[];
}

const categoryColors: Record<string, string> = {
  carreira: "bg-gold/20 text-gold",
  saude: "bg-green-500/20 text-green-600",
  relacionamento: "bg-pink-500/20 text-pink-600",
  financeiro: "bg-blue-500/20 text-blue-600",
  pessoal: "bg-purple-500/20 text-purple-600",
};

const categoryLabels: Record<string, string> = {
  carreira: "Carreira",
  saude: "Saúde",
  relacionamento: "Relacionamentos",
  financeiro: "Financeiro",
  pessoal: "Pessoal",
};

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Conseguir promoção no trabalho",
    category: "carreira",
    progress: 60,
    tasks: [
      { id: "1a", text: "Atualizar currículo", done: true },
      { id: "1b", text: "Fazer curso de liderança", done: true },
      { id: "1c", text: "Conversar com gestor", done: false },
    ],
  },
  {
    id: "2",
    title: "Perder 5kg até junho",
    category: "saude",
    progress: 40,
    tasks: [
      { id: "2a", text: "Treinar 4x/semana", done: true },
      { id: "2b", text: "Seguir dieta balanceada", done: false },
      { id: "2c", text: "Beber 2L água/dia", done: false },
    ],
  },
  {
    id: "3",
    title: "Economizar R$5.000",
    category: "financeiro",
    progress: 25,
    tasks: [
      { id: "3a", text: "Cortar gastos desnecessários", done: true },
      { id: "3b", text: "Guardar 20% do salário", done: false },
    ],
  },
];

const MetasPage = () => {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<Goal["category"]>("pessoal");

  const toggleTask = (goalId: string, taskId: string) => {
    setGoals(prev =>
      prev.map(g =>
        g.id === goalId
          ? {
              ...g,
              tasks: g.tasks.map(t =>
                t.id === taskId ? { ...t, done: !t.done } : t
              ),
              progress: Math.round(
                (g.tasks.filter(t => (t.id === taskId ? !t.done : t.done)).length /
                  g.tasks.length) *
                  100
              ),
            }
          : g
      )
    );
  };

  const addGoal = () => {
    if (!newTitle.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      progress: 0,
      tasks: [],
    };
    setGoals(prev => [...prev, newGoal]);
    setNewTitle("");
    setShowAdd(false);
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Suas</p>
        <h1 className="text-2xl font-display font-bold">Metas <span className="text-gold">SMART</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Dream Map Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <span
              key={key}
              className={cn(
                "shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium",
                categoryColors[key]
              )}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Goals */}
        {goals.map(goal => {
          const isExpanded = expandedGoal === goal.id;
          return (
            <div key={goal.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <button
                className="w-full p-4 flex items-center gap-3"
                onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
              >
                <div className={cn("shrink-0 px-2 py-1 rounded-md text-[10px] font-body font-semibold uppercase tracking-wider", categoryColors[goal.category])}>
                  {categoryLabels[goal.category]}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-body font-semibold">{goal.title}</p>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground font-body">{goal.progress}%</span>
                </div>
                <div className="bg-muted rounded-full h-1.5">
                  <div
                    className="h-full bg-gradient-gold rounded-full transition-all duration-500"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-2 animate-fade-in">
                  {goal.tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => toggleTask(goal.id, task.id)}
                      className="w-full flex items-center gap-2 py-1.5"
                    >
                      {task.done ? (
                        <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span className={cn("text-sm font-body text-left", task.done && "line-through text-muted-foreground")}>
                        {task.text}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Goal */}
        {showAdd ? (
          <div className="bg-card rounded-2xl p-4 border border-border space-y-3 animate-fade-in">
            <input
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Qual é sua nova meta?"
              className="w-full bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(categoryLabels) as Goal["category"][]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setNewCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-body font-medium transition-all",
                    newCategory === cat ? categoryColors[cat] + " ring-1 ring-current" : "bg-muted text-muted-foreground"
                  )}
                >
                  {categoryLabels[cat]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={addGoal}>Adicionar</Button>
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full border-dashed" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Meta
          </Button>
        )}
      </div>
    </div>
  );
};

export default MetasPage;
