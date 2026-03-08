import { useState } from "react";
import { Sparkles, BookOpen, Droplets, Brain, ChevronRight, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AffirmationCard from "@/components/AffirmationCard";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import HabitTracker from "@/components/HabitTracker";
import NotificationsPanel from "@/components/NotificationsPanel";

const HomePage = () => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-body tracking-widest uppercase">Bem-vinda</p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Glow Up <span className="text-gold">✦</span>
          </h1>
        </div>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
        </button>
      </header>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}

      <div className="px-5 space-y-6 pb-6">
        {/* Daily Affirmation */}
        <AffirmationCard />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Brain, label: "Reprogramação Mental", color: "bg-secondary text-secondary-foreground" },
            { icon: Sparkles, label: "Meditação", color: "bg-secondary text-secondary-foreground" },
            { icon: BookOpen, label: "Skincare", color: "bg-secondary text-secondary-foreground" },
            { icon: Droplets, label: "Saúde & Fitness", color: "bg-secondary text-secondary-foreground" },
          ].map(({ icon: Icon, label, color }) => (
            <button
              key={label}
              className={`${color} rounded-xl p-4 flex flex-col items-start gap-2 transition-all hover:shadow-card active:scale-[0.98]`}
            >
              <Icon className="h-5 w-5 text-gold" />
              <span className="text-xs font-body font-semibold tracking-wide">{label}</span>
            </button>
          ))}
        </div>

        {/* Monthly Calendar */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold">Planejamento Mensal</h2>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <MonthlyCalendar />
        </section>

        {/* Habit Tracker */}
        <section>
          <h2 className="text-lg font-display font-semibold mb-3">Hábitos de Hoje</h2>
          <HabitTracker />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
