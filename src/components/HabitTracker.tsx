import { useState, useEffect, useCallback } from "react";
import { Check, Plus, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "glowup-daily-habits";
const COMPLETED_KEY_PREFIX = "glowup-completed-";

const DEFAULT_HABITS = [
  { id: "water", label: "Beber 2L de água", emoji: "💧" },
  { id: "meditate", label: "Meditar 10 min", emoji: "🧘‍♀️" },
  { id: "skincare", label: "Rotina de skincare", emoji: "✨" },
  { id: "exercise", label: "Exercício físico", emoji: "🏋️‍♀️" },
  { id: "goals", label: "Revisar metas", emoji: "🎯" },
  { id: "gratitude", label: "Gratidão", emoji: "🙏" },
];

const EMOJI_OPTIONS = ["💧", "🧘‍♀️", "✨", "🏋️‍♀️", "🎯", "🙏", "📖", "🥗", "😴", "🚶‍♀️", "💊", "🧴", "☀️", "🌙", "💪", "🧠", "❤️", "🎵", "✍️", "📵"];

interface Habit {
  id: string;
  label: string;
  emoji: string;
}

interface HabitTrackerProps {
  onCompletedChange?: (completed: Set<string>) => void;
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function HabitTracker({ onCompletedChange }: HabitTrackerProps) {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      const today = getToday();
      const saved = localStorage.getItem(`${COMPLETED_KEY_PREFIX}${today}`);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [isManaging, setIsManaging] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("✨");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editEmoji, setEditEmoji] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  // Persist completed to localStorage and sync to DB
  const syncCompletion = useCallback(async (completedSet: Set<string>) => {
    const today = getToday();
    localStorage.setItem(`${COMPLETED_KEY_PREFIX}${today}`, JSON.stringify([...completedSet]));
    
    if (!user) return;
    const completedCount = completedSet.size;
    const totalCount = habits.length;
    const allCompleted = totalCount > 0 && completedCount >= totalCount;

    await supabase
      .from("daily_completions" as any)
      .upsert({
        user_id: user.id,
        completion_date: today,
        completed_count: completedCount,
        total_count: totalCount,
        all_completed: allCompleted,
      } as any, { onConflict: "user_id,completion_date" } as any);
  }, [user, habits.length]);

  const toggle = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      syncCompletion(next);
      return next;
    });
  }, [syncCompletion]);

  useEffect(() => {
    onCompletedChange?.(completed);
  }, [completed, onCompletedChange]);

  const addHabit = () => {
    if (!newLabel.trim()) return;
    const id = `custom-${Date.now()}`;
    setHabits(prev => [...prev, { id, label: newLabel.trim(), emoji: newEmoji }]);
    setNewLabel("");
    setNewEmoji("✨");
  };

  const removeHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompleted(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const startEdit = (habit: Habit) => {
    setEditingId(habit.id);
    setEditLabel(habit.label);
    setEditEmoji(habit.emoji);
  };

  const saveEdit = () => {
    if (!editLabel.trim() || !editingId) return;
    setHabits(prev => prev.map(h => h.id === editingId ? { ...h, label: editLabel.trim(), emoji: editEmoji } : h));
    setEditingId(null);
  };

  const moveHabit = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= habits.length) return;
    const updated = [...habits];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setHabits(updated);
  };

  const progress = habits.length > 0 ? (completed.size / habits.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground font-body mt-1">
            {completed.size}/{habits.length} concluídos
          </p>
        </div>
        <Dialog open={isManaging} onOpenChange={setIsManaging}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-3 text-xs text-muted-foreground hover:text-foreground">
              <Pencil className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading text-lg">Meus Hábitos Diários</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground font-body">Adicionar novo hábito</p>
              <div className="flex gap-2">
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                  {EMOJI_OPTIONS.map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)} className={cn("w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all", newEmoji === e ? "bg-gold/20 ring-2 ring-gold" : "bg-muted hover:bg-muted/80")}>{e}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <span className="text-lg w-8 flex items-center justify-center">{newEmoji}</span>
                <Input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Ex: Ler 15 minutos" className="flex-1 text-sm" onKeyDown={e => e.key === "Enter" && addHabit()} />
                <Button size="sm" onClick={addHabit} disabled={!newLabel.trim()} className="bg-gold hover:bg-gold/90 text-primary-foreground"><Plus className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-border mt-3">
              <p className="text-xs text-muted-foreground font-body mb-2">Seus hábitos ({habits.length})</p>
              {habits.map((habit, i) => (
                <div key={habit.id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 group">
                  {editingId === habit.id ? (
                    <>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {EMOJI_OPTIONS.map(e => (
                          <button key={e} onClick={() => setEditEmoji(e)} className={cn("w-6 h-6 rounded text-xs flex items-center justify-center", editEmoji === e ? "bg-gold/20 ring-1 ring-gold" : "bg-background")}>{e}</button>
                        ))}
                      </div>
                      <Input value={editLabel} onChange={e => setEditLabel(e.target.value)} className="flex-1 text-sm h-8" onKeyDown={e => e.key === "Enter" && saveEdit()} autoFocus />
                      <Button size="sm" variant="ghost" onClick={saveEdit} className="h-7 w-7 p-0 text-emerald-500"><Check className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 p-0 text-muted-foreground"><X className="h-3.5 w-3.5" /></Button>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveHabit(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px]">▲</button>
                        <button onClick={() => moveHabit(i, 1)} disabled={i === habits.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px]">▼</button>
                      </div>
                      <span className="text-lg">{habit.emoji}</span>
                      <span className="flex-1 text-sm font-body truncate">{habit.label}</span>
                      <Button size="sm" variant="ghost" onClick={() => startEdit(habit)} className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => removeHabit(habit.id)} className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"><X className="h-3 w-3" /></Button>
                    </>
                  )}
                </div>
              ))}
              {habits.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum hábito adicionado ainda</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {habits.map(habit => {
          const done = completed.has(habit.id);
          return (
            <button key={habit.id} onClick={() => toggle(habit.id)} className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative overflow-hidden",
              done ? "bg-gold/10 border border-gold/30" : "bg-card border border-transparent hover:bg-muted"
            )}>
              {/* Star glow effect on completion */}
              {done && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gold/10 rounded-full blur-xl animate-star-pulse" />
                </div>
              )}
              <span className="text-lg relative z-10">{habit.emoji}</span>
              <span className={cn("flex-1 text-left text-sm font-body relative z-10", done && "line-through text-muted-foreground")}>{habit.label}</span>
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
                done ? "border-gold bg-gold shadow-[0_0_12px_hsl(43,72%,52%,0.5)]" : "border-muted-foreground"
              )}>
                {done && <Check className="h-3.5 w-3.5 text-white" />}
              </div>
            </button>
          );
        })}
        {habits.length === 0 && (
          <button onClick={() => setIsManaging(true)} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-gold/50 hover:text-gold transition-all">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-body">Adicionar hábitos</span>
          </button>
        )}
      </div>
    </div>
  );
}
