import { useState } from "react";
import { Sparkles, BookOpen, Droplets, Brain, ChevronRight, Bell, Zap, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AffirmationCard from "@/components/AffirmationCard";
import DailyDevotional from "@/components/DailyDevotional";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import HabitTracker from "@/components/HabitTracker";
import NotificationsPanel from "@/components/NotificationsPanel";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";

const HomePage = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold" />
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </header>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}

      <div className="px-5 space-y-6 pb-6">
        {/* Guias do Dia */}
        <section className="space-y-3">
          <DailyDevotional />
          <AffirmationCard />
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Brain, label: "Reprogramação Mental", color: "bg-secondary text-secondary-foreground", to: "/reprogramacao" },
            { icon: Zap, label: "Alta Performance", color: "bg-secondary text-secondary-foreground", to: "/alta-performance" },
            { icon: BookOpen, label: "Skincare", color: "bg-secondary text-secondary-foreground", to: "/guias" },
            { icon: Droplets, label: "Saúde & Fitness", color: "bg-secondary text-secondary-foreground", to: "/guias" },
          ].map(({ icon: Icon, label, color, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
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

        {/* Notification Settings */}
        <section>
          <NotificationSettingsCard />
        </section>
      </div>
    </div>
  );
};

export default HomePage;

