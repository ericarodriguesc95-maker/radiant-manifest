import { useState, useEffect } from "react";
import { Flame, Trophy, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DailyStreakProps {
  completedHabits: Set<string>;
  requiredHabits?: string[];
}

interface CompletionDay {
  date: string;
  completed_count: number;
  total_count: number;
  all_completed: boolean;
}

export default function DailyStreak({ completedHabits }: DailyStreakProps) {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<CompletionDay[]>([]);

  const fetchStreak = async () => {
    if (!user) return;

    const { data } = await supabase.rpc("calculate_streak" as any, { _user_id: user.id });
    const dbStreak = typeof data === "number" ? data : 0;
    setStreak(dbStreak);

    const today = new Date().toISOString().split("T")[0];
    const { data: todayData } = await supabase
      .from("daily_completions" as any)
      .select("all_completed")
      .eq("user_id", user.id)
      .eq("completion_date", today)
      .maybeSingle();
    setTodayCompleted((todayData as any)?.all_completed || false);
  };

  const fetchHistory = async () => {
    if (!user) return;
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString().split("T")[0];
    const { data } = await supabase
      .from("daily_completions" as any)
      .select("completion_date, completed_count, total_count, all_completed")
      .eq("user_id", user.id)
      .gte("completion_date", thirtyDaysAgo)
      .order("completion_date", { ascending: false });
    setHistory((data as any[] || []).map((d: any) => ({
      date: d.completion_date,
      completed_count: d.completed_count,
      total_count: d.total_count,
      all_completed: d.all_completed,
    })));
  };

  useEffect(() => { fetchStreak(); }, [user]);

  useEffect(() => {
    const timeout = setTimeout(fetchStreak, 500);
    return () => clearTimeout(timeout);
  }, [completedHabits, user]);

  useEffect(() => {
    if (showHistory) fetchHistory();
  }, [showHistory, user]);

  useEffect(() => {
    localStorage.setItem("glow-up-streak", streak.toString());
  }, [streak]);

  const milestones = [7, 14, 30, 60, 90];
  const nextMilestone = milestones.find(m => m > streak) || 100;

  // Build last 30 days grid
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = date.toISOString().split("T")[0];
    const record = history.find(h => h.date === dateStr);
    return { date, dateStr, record };
  });

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

      {/* History toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mt-3 flex items-center gap-1.5 text-[11px] font-body text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Flame className="h-3 w-3" />
        <span>Histórico dos últimos 30 dias</span>
        {showHistory ? <ChevronUp className="h-3 w-3 ml-auto" /> : <ChevronDown className="h-3 w-3 ml-auto" />}
      </button>

      {showHistory && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {/* Heat map grid */}
          <div className="grid grid-cols-10 gap-1">
            {last30Days.map(({ dateStr, record }) => {
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={dateStr}
                  title={`${format(new Date(dateStr), "dd/MM")} — ${record?.all_completed ? "✅ Completo" : record ? `${record.completed_count}/${record.total_count}` : "Sem registro"}`}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-[8px] font-body font-semibold transition-all",
                    record?.all_completed
                      ? "bg-gold/80 text-primary-foreground"
                      : record && record.completed_count > 0
                        ? "bg-gold/20 text-gold"
                        : "bg-muted text-muted-foreground",
                    isToday && "ring-1 ring-gold"
                  )}
                >
                  {format(new Date(dateStr), "dd")}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[10px] font-body text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gold/80" />
              <span>Completo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gold/20" />
              <span>Parcial</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-muted" />
              <span>Sem registro</span>
            </div>
          </div>

          {/* Day-by-day list */}
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {last30Days.map(({ date, dateStr, record }) => {
              const isToday = dateStr === new Date().toISOString().split("T")[0];
              return (
                <div
                  key={dateStr}
                  className={cn(
                    "flex items-center justify-between py-1.5 px-2 rounded-lg text-xs font-body",
                    record?.all_completed ? "bg-gold/5" : ""
                  )}
                >
                  <div className="flex items-center gap-2">
                    {record?.all_completed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                    )}
                    <span className={cn("text-foreground", isToday && "font-semibold")}>
                      {isToday ? "Hoje" : format(date, "EEEE, dd MMM", { locale: ptBR })}
                    </span>
                  </div>
                  <span className={cn(
                    "text-[10px] font-semibold",
                    record?.all_completed ? "text-gold" : "text-muted-foreground"
                  )}>
                    {record ? `${record.completed_count}/${record.total_count}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
