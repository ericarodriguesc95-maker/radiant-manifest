import { useState, useEffect } from "react";
import { Plus, CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Pencil, X, Check, History, TrendingUp, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ManifestacaoHub from "@/components/manifestacao/ManifestacaoHub";

interface GoalTask {
  id: string;
  goal_id: string;
  text: string;
  done: boolean;
}

interface GoalUpdate {
  id: string;
  goal_id: string;
  previous_progress: number;
  new_progress: number;
  note: string | null;
  created_at: string;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
  created_at: string;
  tasks: GoalTask[];
  updates: GoalUpdate[];
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
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editTitle, setEditTitle] = useState("");
  // Progress update form
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  const [updateNote, setUpdateNote] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"manifestacao" | "metas">("manifestacao");

  const fetchGoals = async () => {
    if (!user) return;
    const { data: goalsData } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!goalsData) { setLoading(false); return; }

    const [{ data: tasksData }, { data: updatesData }] = await Promise.all([
      supabase.from("goal_tasks").select("*").eq("user_id", user.id),
      supabase.from("goal_updates" as any).select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    const mapped = goalsData.map((g: any) => ({
      ...g,
      tasks: (tasksData || []).filter((t: any) => t.goal_id === g.id),
      updates: ((updatesData || []) as any[]).filter((u: any) => u.goal_id === g.id),
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
    setGoals(prev => [{ ...data, tasks: [], updates: [] }, ...prev]);
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

  const startProgressUpdate = (goal: Goal) => {
    setUpdatingGoalId(goal.id);
    setUpdateProgress(goal.progress);
    setUpdateNote("");
  };

  const saveProgressUpdate = async (goalId: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const previousProgress = goal.progress;
    const newProgress = updateProgress;

    // Save update history
    const { data: updateData, error: updateError } = await supabase
      .from("goal_updates" as any)
      .insert({
        goal_id: goalId,
        user_id: user.id,
        previous_progress: previousProgress,
        new_progress: newProgress,
        note: updateNote.trim() || null,
      } as any)
      .select()
      .single();

    if (updateError) { toast.error("Erro ao salvar progresso"); return; }

    // Update goal progress
    await supabase.from("goals").update({ progress: newProgress, updated_at: new Date().toISOString() }).eq("id", goalId);

    setGoals(prev => prev.map(g => g.id === goalId ? {
      ...g,
      progress: newProgress,
      updates: [updateData as any, ...g.updates],
    } : g));

    setUpdatingGoalId(null);
    setUpdateNote("");
    toast.success(newProgress >= 100 ? "🎉 Meta concluída! Parabéns!" : "Progresso atualizado!");
  };

  const toggleTask = async (goalId: string, taskId: string) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const task = goal.tasks.find(t => t.id === taskId);
    if (!task) return;
    const newDone = !task.done;

    setGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      const newTasks = g.tasks.map(t => t.id === taskId ? { ...t, done: newDone } : t);
      const doneCount = newTasks.filter(t => t.done).length;
      const progress = newTasks.length > 0 ? Math.round((doneCount / newTasks.length) * 100) : g.progress;
      return { ...g, tasks: newTasks };
    }));

    await supabase.from("goal_tasks").update({ done: newDone }).eq("id", taskId);
  };

  const addTask = async (goalId: string) => {
    const text = newTaskText[goalId];
    if (!text?.trim() || !user) return;
    const { data, error } = await supabase
      .from("goal_tasks")
      .insert({ goal_id: goalId, user_id: user.id, text: text.trim() })
      .select()
      .single();
    if (error) { toast.error("Erro ao adicionar passo"); return; }
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, tasks: [...g.tasks, data as GoalTask] } : g));
    setNewTaskText(prev => ({ ...prev, [goalId]: "" }));
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
        <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Sua jornada</p>
        <h1 className="text-2xl font-display font-bold">Metas & <span className="text-gold">Manifestação</span></h1>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-muted/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab("manifestacao")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-body font-semibold transition-all",
              activeTab === "manifestacao" ? "bg-gold text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Manifestação
          </button>
          <button
            onClick={() => setActiveTab("metas")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-body font-semibold transition-all",
              activeTab === "metas" ? "bg-gold text-background shadow-lg" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className="h-3.5 w-3.5" />
            Metas SMART
          </button>
        </div>

        {activeTab === "manifestacao" ? (
          <ManifestacaoHub />
        ) : (
        <>
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
            const isUpdating = updatingGoalId === goal.id;
            const isShowingHistory = showHistory === goal.id;
            const remaining = 100 - goal.progress;
            const doneTasksCount = goal.tasks.filter(t => t.done).length;

            return (
              <div key={goal.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
                {/* Header */}
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

                {/* Progress bar + remaining */}
                <div className="px-4 pb-2">
                  <div className="flex items-center justify-between mb-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input type="range" min={0} max={100} value={editProgress} onChange={e => setEditProgress(Number(e.target.value))} className="flex-1 accent-gold" />
                        <span className="text-xs font-body text-gold font-semibold w-10 text-right">{editProgress}%</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-body font-semibold text-gold">{goal.progress}%</span>
                        <span className="text-[10px] text-muted-foreground font-body">
                          {goal.progress >= 100 ? "✅ Meta concluída!" : `Faltam ${remaining}%`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="bg-muted rounded-full h-2">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        goal.progress >= 100 ? "bg-green-500" : "bg-gradient-gold"
                      )}
                      style={{ width: `${Math.min(isEditing ? editProgress : goal.progress, 100)}%` }}
                    />
                  </div>
                  {goal.tasks.length > 0 && (
                    <p className="text-[10px] text-muted-foreground font-body mt-1">
                      {doneTasksCount}/{goal.tasks.length} passos concluídos
                    </p>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 animate-fade-in border-t border-border pt-3">
                    {/* Update progress button */}
                    {!isUpdating ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-gold/30 text-gold hover:bg-gold/10"
                        onClick={() => startProgressUpdate(goal)}
                      >
                        <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                        Atualizar Progresso
                      </Button>
                    ) : (
                      <div className="bg-muted/50 rounded-xl p-3 space-y-3">
                        <p className="text-xs font-body font-semibold text-foreground">Atualizar progresso</p>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={updateProgress}
                            onChange={e => setUpdateProgress(Number(e.target.value))}
                            className="flex-1 accent-gold"
                          />
                          <span className="text-sm font-body font-bold text-gold w-12 text-right">{updateProgress}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-body text-muted-foreground">
                          <span>Atual: {goal.progress}%</span>
                          <span>→</span>
                          <span className="text-gold font-semibold">Novo: {updateProgress}%</span>
                          {updateProgress > goal.progress && (
                            <span className="text-green-500 ml-auto">+{updateProgress - goal.progress}%</span>
                          )}
                        </div>
                        <textarea
                          value={updateNote}
                          onChange={e => setUpdateNote(e.target.value)}
                          placeholder="O que você fez para avançar? (opcional)"
                          rows={2}
                          className="w-full bg-background rounded-lg px-3 py-2 text-xs font-body outline-none resize-none placeholder:text-muted-foreground border border-border"
                        />
                        <div className="flex gap-2">
                          <Button variant="gold" size="sm" className="text-xs" onClick={() => saveProgressUpdate(goal.id)}>Salvar</Button>
                          <Button variant="ghost" size="sm" className="text-xs" onClick={() => setUpdatingGoalId(null)}>Cancelar</Button>
                        </div>
                      </div>
                    )}

                    {/* Steps / Tasks */}
                    <div>
                      <p className="text-xs font-body font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-gold" />
                        Passo a passo
                      </p>
                      {goal.tasks.length === 0 && (
                        <p className="text-[10px] text-muted-foreground font-body mb-2">Adicione os passos para alcançar sua meta</p>
                      )}
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
                      <div className="flex gap-2 mt-2">
                        <input
                          value={newTaskText[goal.id] || ""}
                          onChange={e => setNewTaskText(prev => ({ ...prev, [goal.id]: e.target.value }))}
                          placeholder="Adicionar passo..."
                          className="flex-1 bg-muted rounded-lg px-3 py-1.5 text-xs font-body outline-none placeholder:text-muted-foreground"
                          onKeyDown={e => e.key === "Enter" && addTask(goal.id)}
                        />
                        <Button variant="gold" size="sm" className="text-xs h-7" onClick={() => addTask(goal.id)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* History */}
                    <div>
                      <button
                        onClick={() => setShowHistory(isShowingHistory ? null : goal.id)}
                        className="flex items-center gap-1.5 text-xs font-body font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <History className="h-3.5 w-3.5" />
                        Histórico de progresso
                        {goal.updates.length > 0 && (
                          <span className="bg-muted px-1.5 py-0.5 rounded-full text-[10px]">{goal.updates.length}</span>
                        )}
                        {isShowingHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {isShowingHistory && (
                        <div className="mt-2 space-y-2 animate-fade-in">
                          {goal.updates.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground font-body py-2">Nenhuma atualização registrada ainda</p>
                          ) : (
                            goal.updates.map(update => (
                              <div key={update.id} className="bg-muted/50 rounded-lg p-2.5 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={cn(
                                      "text-[10px] font-body font-semibold px-1.5 py-0.5 rounded",
                                      (update as any).new_progress > (update as any).previous_progress
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-muted text-muted-foreground"
                                    )}>
                                      {(update as any).previous_progress}% → {(update as any).new_progress}%
                                    </div>
                                    {(update as any).new_progress > (update as any).previous_progress && (
                                      <span className="text-[10px] text-green-500 font-body">
                                        +{(update as any).new_progress - (update as any).previous_progress}%
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground font-body">
                                    {format(new Date(update.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                  </span>
                                </div>
                                {update.note && (
                                  <p className="text-xs font-body text-foreground/80">{update.note}</p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
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
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default MetasPage;
