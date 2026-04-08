import { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  startDate: string;
  completedDays: number[];
  currentDay: number;
  onSelectDay: (day: number) => void;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const BibleHistoryCalendar = ({ startDate, completedDays, currentDay, onSelectDay }: Props) => {
  const start = new Date(startDate + "T00:00:00");
  const [viewMonth, setViewMonth] = useState(() => {
    const today = new Date();
    return { month: today.getMonth(), year: today.getFullYear() };
  });

  const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewMonth.year, viewMonth.month, 1).getDay();

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const prevMonth = () => {
    setViewMonth((v) => v.month === 0 ? { month: 11, year: v.year - 1 } : { month: v.month - 1, year: v.year });
  };
  const nextMonth = () => {
    setViewMonth((v) => v.month === 11 ? { month: 0, year: v.year + 1 } : { month: v.month + 1, year: v.year });
  };

  // Map calendar date → reading day number
  const getDayNumber = (dateOfMonth: number): number | null => {
    const cellDate = new Date(viewMonth.year, viewMonth.month, dateOfMonth);
    const diff = Math.floor((cellDate.getTime() - start.getTime()) / 86400000) + 1;
    if (diff < 1 || diff > 365) return null;
    return diff;
  };

  const totalCompleted = completedDays.length;
  const percentage = Math.round((totalCompleted / 365) * 100);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-3 border border-gold/10 text-center">
          <p className="text-lg font-display font-bold text-gold">{totalCompleted}</p>
          <p className="text-[10px] text-muted-foreground font-body">Dias lidos</p>
        </div>
        <div className="glass rounded-2xl p-3 border border-gold/10 text-center">
          <p className="text-lg font-display font-bold text-foreground">{365 - totalCompleted}</p>
          <p className="text-[10px] text-muted-foreground font-body">Restantes</p>
        </div>
        <div className="glass rounded-2xl p-3 border border-emerald-500/10 text-center">
          <p className="text-lg font-display font-bold text-emerald-400">{percentage}%</p>
          <p className="text-[10px] text-muted-foreground font-body">Concluído</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="glass rounded-2xl p-4 border border-gold/10">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-muted/30 transition-all">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-display font-semibold text-foreground capitalize">{monthName}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-muted/30 transition-all">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-body text-muted-foreground font-semibold">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dateOfMonth = i + 1;
            const dayNum = getDayNumber(dateOfMonth);
            const isCompleted = dayNum !== null && completedDays.includes(dayNum);
            const isCurrent = dayNum !== null && dayNum === currentDay;
            const isFuture = dayNum !== null && dayNum > currentDay;
            const isInPlan = dayNum !== null;

            return (
              <button
                key={dateOfMonth}
                onClick={() => dayNum && !isFuture && onSelectDay(dayNum)}
                disabled={!isInPlan || isFuture}
                className={cn(
                  "h-9 w-full rounded-lg flex items-center justify-center text-xs font-body transition-all relative",
                  !isInPlan && "text-muted-foreground/30",
                  isInPlan && !isCompleted && !isCurrent && !isFuture && "text-muted-foreground hover:bg-muted/30",
                  isCompleted && "bg-emerald-500/15 text-emerald-400 font-semibold",
                  isCurrent && !isCompleted && "ring-1 ring-gold/50 text-gold font-semibold",
                  isFuture && "opacity-30"
                )}
              >
                {dateOfMonth}
                {isCompleted && (
                  <CheckCircle2 className="h-2.5 w-2.5 absolute bottom-0.5 right-0.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-body text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-emerald-500/15 border border-emerald-500/30" />
          <span>Lido</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded ring-1 ring-gold/50" />
          <span>Hoje</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-muted/20" />
          <span>Pendente</span>
        </div>
      </div>
    </div>
  );
};

export default BibleHistoryCalendar;
