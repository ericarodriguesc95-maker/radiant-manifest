import { useState, useEffect } from "react";
import { Activity, Flame, MapPin, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WeeklyStats {
  totalWorkouts: number;
  totalKm: number;
  totalCalories: number;
  streakDays: number;
  activeDays: string[];
}

export default function WeeklyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<WeeklyStats>({
    totalWorkouts: 0,
    totalKm: 0,
    totalCalories: 0,
    streakDays: 0,
    activeDays: [],
  });

  useEffect(() => {
    if (user) loadWeeklyStats();
  }, [user]);

  async function loadWeeklyStats() {
    if (!user) return;

    const now = new Date();
    const weekStart = format(startOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");
    const weekEnd = format(endOfWeek(now, { weekStartsOn: 1 }), "yyyy-MM-dd");

    // Fetch exercises this week
    const { data: exercises } = await supabase
      .from("exercise_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("entry_date", weekStart)
      .lte("entry_date", weekEnd);

    const totalWorkouts = exercises?.length || 0;
    const totalCalories = exercises?.reduce((sum, e) => sum + (Number(e.calories_burned) || 0), 0) || 0;

    // Get km from localStorage activity history
    let totalKm = 0;
    try {
      const saved = localStorage.getItem("activity-history");
      if (saved) {
        const history = JSON.parse(saved);
        const weekStartDate = new Date(weekStart);
        const weekEndDate = new Date(weekEnd);
        weekEndDate.setHours(23, 59, 59, 999);
        history.forEach((r: any) => {
          const rDate = new Date(r.startTime);
          if (rDate >= weekStartDate && rDate <= weekEndDate) {
            totalKm += r.distanceKm || 0;
          }
        });
      }
    } catch {}

    // Calculate streak: consecutive days with exercise
    const activeDaysSet = new Set<string>();
    exercises?.forEach(e => activeDaysSet.add(e.entry_date));

    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = format(subDays(now, i), "yyyy-MM-dd");
      if (activeDaysSet.has(day) || i === 0) {
        // For today, check if there's activity or give benefit of doubt
        if (activeDaysSet.has(day)) streak++;
        else if (i > 0) break;
      } else {
        break;
      }
    }

    setStats({
      totalWorkouts,
      totalKm: Math.round(totalKm * 100) / 100,
      totalCalories,
      streakDays: streak,
      activeDays: Array.from(activeDaysSet),
    });
  }

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Resumo Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 rounded-lg bg-primary/10">
            <Flame className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalWorkouts}</p>
            <p className="text-[10px] text-muted-foreground">Treinos</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <MapPin className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalKm}</p>
            <p className="text-[10px] text-muted-foreground">Km</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <TrendingUp className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{stats.totalCalories}</p>
            <p className="text-[10px] text-muted-foreground">kcal</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/10">
            <Trophy className="h-4 w-4 text-secondary mx-auto mb-1" />
            <p className="text-lg font-bold text-secondary">{stats.streakDays}</p>
            <p className="text-[10px] text-muted-foreground">Streak</p>
          </div>
        </div>

        {/* Week Activity Dots */}
        <div className="flex justify-between items-center">
          {weekDays.map((day, i) => {
            const dayDate = format(new Date(weekStart.getTime() + i * 86400000), "yyyy-MM-dd");
            const isActive = stats.activeDays.includes(dayDate);
            const isToday = dayDate === format(now, "yyyy-MM-dd");
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <span className={`text-[10px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                  {day}
                </span>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : isToday
                    ? "border-2 border-primary text-primary"
                    : "bg-muted/50 text-muted-foreground"
                }`}>
                  {isActive ? "✓" : format(new Date(weekStart.getTime() + i * 86400000), "d")}
                </div>
              </div>
            );
          })}
        </div>

        {stats.totalWorkouts === 0 && (
          <p className="text-xs text-muted-foreground text-center py-2">
            Nenhuma atividade registrada esta semana. Comece agora! 💪
          </p>
        )}
      </CardContent>
    </Card>
  );
}
