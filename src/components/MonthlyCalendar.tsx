import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function MonthlyCalendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear] = useState(now.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(m => Math.max(0, m - 1))} className="p-1">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <span className="text-sm font-display font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </span>
        <button onClick={() => setCurrentMonth(m => Math.min(11, m + 1))} className="p-1">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="text-[10px] font-body text-muted-foreground font-medium py-1">
            {d}
          </span>
        ))}
        {blanks.map(i => (
          <span key={`blank-${i}`} />
        ))}
        {days.map(day => {
          const isToday = isCurrentMonth && day === today;
          return (
            <button
              key={day}
              className={`text-xs font-body py-1.5 rounded-lg transition-colors ${
                isToday
                  ? "bg-gold text-primary-foreground font-bold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
