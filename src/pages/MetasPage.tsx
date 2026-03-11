import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface GoalTask {
  id: string;
  goal_id: string;
  text: string;
  done: boolean;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  created_at: string;
  tasks: GoalTask[];
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

const MetasPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("pessoal");
  const [newTaskText, setNewTaskText] = useState("");
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editTitle, setEditTitle] = useState("");

  const fetchGoals = async () => {
    if (!user) return;
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!goalsData) { setLoading(false); return; }

    const { data: tasksData } = await supabase
      .from("goal_tasks")
      .select("*")
      .eq("user_id", user.id);

    const mapped = goalsData.map((g: any) => ({
      ...g,
      tasks: (tasksData || []).filter((t: any) => t.goal_id === g.id),
    }));
    setGoals(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user]);

  const addGoal = async () => {
    if (!newTitle.trim() || !user) return;
    const { data, error } = await supabase
      .from("goals")
      .insert({ user_id: user.id, title: newTitle, category: newCategory, progress: 0 })
      .select()
      .single();
    if (error) { toast.error("Erro ao criar meta"); return; }
    setGoals(prev => [{ ...data, tasks: [] }, ...prev]);
    setNewTitle("");
    setShowAdd(false);
    toast.success("Meta criada!");
  };

  const deleteGoal = async (id: string) => {
    const prev = goals;
    setGoals(g => g.filter(x => x.id !== id));
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) { setGoals(prev); toast.error("Erro ao excluir meta"); }
    else toast.success("Meta excluída");
  };

  const startEdit = (goal: Goal) => {
    setEditingGoalId(goal.id);
    setEditProgress(goal.progress);
    setEditTitle(goal.title);
  };

  const saveEdit = async () => {
    if (!editingGoalId) return;
    const prev = goals;
    setGoals(g => g.map(x => x.id === editingGoalId ? { ...x, title: editTitle, progress: editProgress } : x));
    const { error } = await supabase
      .from("goals")
      .update({ title: editTitle, progress: editProgress, updated_at: new Date().toISOString() })
      .eq("id", editingGoalId);
    if (error) { setGoals(prev); toast.error("Erro ao salvar"); }
    else toast.success("Meta atualizada!");
    setEditingGoalId(null);
  };

  const toggleTask = async (goalId: string, taskId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const task = goal.tasks.find(t => t.id === taskId);
    if (!task) return;
    const newDone = !task.done;
    
    // Optimistic update
    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newTasks = g.tasks.map(t => t.id === taskId ? { ...t, done: newDone } : t);
      const doneCount = newTasks.filter(t => t.done).length;
      const progress = newTasks.length > 0 ? Math.round((doneCount / newTasks.length) * 100) : 0;
      return { ...g, tasks: newTasks, progress };
    }));

    await supabase.from("goal_tasks").update({ done: newDone }).eq("id", taskId);
    // Update goal progress
    const updatedGoal = goals.find(g => g.id === goalId)!;
    const newTasks = updatedGoal.tasks.map(t => t.id === taskId ? { ...t, done: newDone } : t);
    const doneCount = newTasks.filter(t => t.done).length;
    const progress = newTasks.length > 0 ? Math.round((doneCount / newTasks.length) * 100) : 0;
    await supabase.from("goals").update({ progress }).eq("id", goalId);
  };

  const addTask = async (goalId: string) => {
    if (!newTaskText.trim() || !user) return;
    const { data, error } = await supabase
      .from("goal_tasks")
      .insert({ goal_id: goalId, user_id: user.id, text: newTaskText })
      .select()
      .single();
    if (error) { toast.error("Erro ao adicionar tarefa"); return; }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tasks: [...g.tasks, data as GoalTask] } : g));
    setNewTaskText("");
  };

  const deleteTask = async (goalId: string, taskId: string) => {
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tasks: g.tasks.filter(t => t.id !== taskId) } : g));
    await supabase.from("goal_tasks").delete().eq("id", taskId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground font-body">Faça login para ver suas metas.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Suas</p>
        <h1 className="text-2xl font-display font-bold">Metas <span className="text-gold">SMART</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <span key={key} className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-body font-medium", categoryColors[key])}>
              {label}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground text-sm font-body">Carregando...</div>
        ) : goals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm font-body">Nenhuma meta criada ainda. Comece agora!</div>
        ) : (
          goals.map(goal => {
            const isExpanded = expandedGoal === goal.id;
            const isEditing = editingGoalId === goal.id;
            return (
              <div key={goal.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="p-4 flex items-center gap-3">
                  <div className={cn("shrink-0 px-2 py-1 rounded-md text-[10px] font-body font-semibold uppercase tracking-wider", categoryColors[goal.category])}>
                    {categoryLabels[goal.category] || goal.category}
                  </div>
                  <button className="flex-1 text-left" onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                    {isEditing ? (
                      <input
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className="w-full bg-transparent text-sm font-body font-semibold outline-none border-b border-gold"
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <p className="text-sm font-body font-semibold">{goal.title}</p>
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <button onClick={saveEdit} className="p-1 text-green-500 hover:text-green-600"><Check className="h-4 w-4" /></button>
                        <button onClick={() => setEditingGoalId(null)} className="p-1 text-muted-foreground"><X className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(goal)} className="p-1 text-muted-foreground hover:text-gold"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => deleteGoal(goal.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                      </>
                    )}
                    <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={editProgress}
                          onChange={e => setEditProgress(Number(e.target.value))}
                          className="flex-1 accent-gold"
                        />
                        <span className="text-xs font-body text-gold font-semibold w-10 text-right">{editProgress}%</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-body">{goal.progress}%</span>
                    )}
                  </div>
                  <div className="bg-muted rounded-full h-1.5">
                    <div
                      className="h-full bg-gradient-gold rounded-full transition-all duration-500"
                      style={{ width: `${isEditing ? editProgress : goal.progress}%` }}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 animate-fade-in">
                    {goal.tasks.map(task => (
                      <div key={task.id} className="flex items-center gap-2 py-1.5">
                        <button onClick={() => toggleTask(goal.id, task.id)} className="flex items-center gap-2 flex-1">
                          {task.done ? (
                            <CheckCircle2 className="h-4 w-4 text-gold shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <span className={cn("text-sm font-body text-left", task.done && "line-through text-muted-foreground")}>
                            {task.text}
                          </span>
                        </button>
                        <button onClick={() => deleteTask(goal.id, task.id)} className="p-1 text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {/* Add task */}
                    <div className="flex gap-2 mt-2">
                      <input
                        value={newTaskText}
                        onChange={e => setNewTaskText(e.target.value)}
                        placeholder="Nova tarefa..."
                        className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-xs font-body outline-none placeholder:text-muted-foreground"
                        onKeyDown={e => e.key === "Enter" && addTask(goal.id)}
                      />
                      <Button variant="gold" size="sm" className="text-xs h-7" onClick={() => addTask(goal.id)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

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
              {Object.keys(categoryLabels).map(cat => (
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
