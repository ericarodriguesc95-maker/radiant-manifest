import { useState, useEffect } from "react";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailyStreakProps {
  completedHabits: Set<string>;
  requiredHabits?: string[];
}

const STREAK_KEY = "glow-up-streak";
const LAST_DATE_KEY = "glow-up-streak-date";

function getToday() {
  return new Date().toISOString().split("T")[0];
}

export default function DailyStreak({ completedHabits, requiredHabits = ["meditate", "goals"] }: DailyStreakProps) {
  const [streak, setStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STREAK_KEY);
    const lastDate = localStorage.getItem(LAST_DATE_KEY);
    const today = getToday();

    if (saved && lastDate) {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        setStreak(parseInt(saved));
        if (diffDays === 0) setTodayCompleted(true);
      } else {
        // Streak broken
        localStorage.setItem(STREAK_KEY, "0");
        setStreak(0);
      }
    }
  }, []);

  useEffect(() => {
    const allDone = requiredHabits.every(h => completedHabits.has(h));
    const today = getToday();
    const lastDate = localStorage.getItem(LAST_DATE_KEY);

    if (allDone && lastDate !== today) {
      const currentStreak = parseInt(localStorage.getItem(STREAK_KEY) || "0");
      const newStreak = currentStreak + 1;
      setStreak(newStreak);
      setTodayCompleted(true);
      localStorage.setItem(STREAK_KEY, newStreak.toString());
      localStorage.setItem(LAST_DATE_KEY, today);
    }
  }, [completedHabits, requiredHabits]);

  const milestones = [7, 14, 30, 60, 90];
  const nextMilestone = milestones.find(m => m > streak) || 100;

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center transition-all",
            todayCompleted 
              ? "bg-gradient-gold shadow-gold" 
              : "bg-muted"
          )}>
            <Flame className={cn(
              "h-6 w-6",
              todayCompleted ? "text-primary-foreground" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">
              {streak} <span className="text-sm font-body font-normal text-muted-foreground">dias</span>
            </p>
            <p className="text-xs font-body text-muted-foreground">
              {todayCompleted ? "Streak de hoje garantido! 🔥" : "Complete meditação + metas"}
            </p>
          </div>
        </div>
        {streak >= 7 && (
          <div className="flex items-center gap-1 bg-gold/10 px-3 py-1.5 rounded-full">
            <Trophy className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-body font-semibold text-gold">{streak}🔥</span>
          </div>
        )}
      </div>

      {/* Progress to next milestone */}
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-[10px] font-body text-muted-foreground">
          <span>Próximo marco: {nextMilestone} dias</span>
          <span>{Math.round((streak / nextMilestone) * 100)}%</span>
        </div>
        <div className="bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-gold rounded-full transition-all duration-700"
            style={{ width: `${Math.min((streak / nextMilestone) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
