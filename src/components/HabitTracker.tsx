import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const defaultHabits = [
  { id: "water", label: "Beber 2L de água", emoji: "💧" },
  { id: "meditate", label: "Meditar 10 min", emoji: "🧘‍♀️" },
  { id: "skincare", label: "Rotina de skincare", emoji: "✨" },
  { id: "exercise", label: "Exercício físico", emoji: "🏋️‍♀️" },
  { id: "goals", label: "Revisar metas", emoji: "🎯" },
  { id: "gratitude", label: "Gratidão", emoji: "🙏" },
];

interface HabitTrackerProps {
  onCompletedChange?: (completed: Set<string>) => void;
}

export default function HabitTracker({ onCompletedChange }: HabitTrackerProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    onCompletedChange?.(completed);
  }, [completed, onCompletedChange]);

  const progress = (completed.size / defaultHabits.length) * 100;

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-gold rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-body">
        {completed.size}/{defaultHabits.length} concluídos
      </p>

      <div className="space-y-2">
        {defaultHabits.map(habit => {
          const done = completed.has(habit.id);
          return (
            <button
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                done ? "bg-gold/10 border border-gold/30" : "bg-card border border-transparent hover:bg-muted"
              )}
            >
              <span className="text-lg">{habit.emoji}</span>
              <span className={cn(
                "flex-1 text-left text-sm font-body",
                done && "line-through text-muted-foreground"
              )}>
                {habit.label}
              </span>
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                done ? "border-gold bg-gold" : "border-muted-foreground"
              )}>
                {done && <Check className="h-3 w-3 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
