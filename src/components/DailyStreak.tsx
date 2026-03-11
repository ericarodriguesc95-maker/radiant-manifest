import { useState, useEffect } from "react";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DailyStreakProps {
  completedHabits: Set<string>;
  requiredHabits?: string[];
}

export default function DailyStreak({ completedHabits }: DailyStreakProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);

  const fetchStreak = async () => {
    if (!user) return;

    // Get streak from DB function
    const { data } = await supabase.rpc("calculate_streak" as any, { _user_id: user.id });
    const dbStreak = typeof data === "number" ? data : 0;
    setStreak(dbStreak);

    // Check if today is completed
    const today = new Date().toISOString().split("T")[0];
    const { data: todayData } = await supabase
      .from("daily_completions" as any)
      .select("all_completed")
      .eq("user_id", user.id)
      .eq("completion_date", today)
      .maybeSingle();
    setTodayCompleted((todayData as any)?.all_completed || false);
  };

  useEffect(() => {
    fetchStreak();
  }, [user]);

  // Re-fetch when habits change (completion synced)
  useEffect(() => {
    const timeout = setTimeout(fetchStreak, 500);
    return () => clearTimeout(timeout);
  }, [completedHabits, user]);

  // Store streak in localStorage for other components
  useEffect(() => {
    localStorage.setItem("glow-up-streak", streak.toString());
  }, [streak]);

  const milestones = [7, 14, 30, 60, 90];
  const nextMilestone = milestones.find(m => m > streak) || 100;

  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center transition-all",
            todayCompleted ? "bg-gradient-gold shadow-gold" : "bg-muted"
          )}>
            <Flame className={cn("h-6 w-6", todayCompleted ? "text-primary-foreground" : "text-muted-foreground")} />
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-foreground">
              {streak} <span className="text-sm font-body font-normal text-muted-foreground">dias</span>
            </p>
            <p className="text-xs font-body text-muted-foreground">
              {todayCompleted ? "Streak de hoje garantido! 🔥" : "Complete todos os hábitos"}
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
