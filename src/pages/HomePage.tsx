import { useState, useEffect, useCallback } from "react";
import { Sparkles, BookOpen, Droplets, Brain, ChevronRight, Bell, Zap, Settings, Gift, MapPin, Shield, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AffirmationCard from "@/components/AffirmationCard";
import DailyDevotional from "@/components/DailyDevotional";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import HabitTracker from "@/components/HabitTracker";
import NotificationsPanel from "@/components/NotificationsPanel";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";
import DailyStreak from "@/components/DailyStreak";
import PostConquista from "@/components/PostConquista";
import StreakMedals from "@/components/StreakMedals";
import AppUpdatesModal from "@/components/AppUpdatesModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HABITS_COUNT = 6;

const HomePage = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [hasUnreadUpdates, setHasUnreadUpdates] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check admin role
  useEffect(() => {
    if (!user) return;
    supabase.from("user_roles" as any).select("role").eq("user_id", user.id).eq("role", "admin").then(({ data }) => {
      setIsAdmin((data as any[])?.length > 0);
    });
  }, [user]);

  const streakCount = parseInt(localStorage.getItem("glow-up-streak") || "0");

  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  // Check for unread app updates and auto-show
  useEffect(() => {
    if (!user) return;
    const checkUpdates = async () => {
      const [{ count: totalUpdates }, { count: readCount }] = await Promise.all([
        supabase.from("app_updates").select("*", { count: "exact", head: true }),
        supabase.from("app_update_reads").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const unread = (totalUpdates || 0) - (readCount || 0);
      setHasUnreadUpdates(unread > 0);
      if (unread > 0) setShowUpdates(true);
    };
    checkUpdates();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-count")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnread]);

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
          {isAdmin && (
            <button
              onClick={() => navigate("/admin/atividade")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              title="Painel Admin"
            >
              <Shield className="h-5 w-5 text-gold" />
            </button>
          )}
          <button
            onClick={() => (window as any).__startGlowTour?.()}
            className="p-2 rounded-full hover:bg-muted transition-colors"
            title="Tour guiado"
          >
            <MapPin className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => setShowUpdates(true)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
            title="Novidades do App"
          >
            <Gift className="h-5 w-5 text-foreground" />
            {hasUnreadUpdates && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-gold animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <Settings className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </header>

      {showUpdates && <AppUpdatesModal onClose={() => { setShowUpdates(false); setHasUnreadUpdates(false); }} />}
      {showNotifications && <NotificationsPanel onClose={() => { setShowNotifications(false); fetchUnread(); }} />}

      <div className="px-5 space-y-6 pb-6">
        {/* Daily Streak */}
        <DailyStreak completedHabits={completedHabits} requiredHabits={["meditate", "goals"]} />

        {/* Streak Medals */}
        <StreakMedals streak={streakCount} />

        {/* Guias do Dia */}
        <section className="space-y-3">
          <DailyDevotional />
          <AffirmationCard />
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Brain, label: "Reprogramação Mental", to: "/reprogramacao" },
            { icon: Zap, label: "Alta Performance", to: "/alta-performance" },
            { icon: BookOpen, label: "Diário", to: "/diario" },
            { icon: Droplets, label: "Saúde & Fitness", to: "/guias" },
          ].map(({ icon: Icon, label, to }) => (
            <button
              key={label}
              onClick={() => navigate(to)}
              className="bg-foreground text-background rounded-xl p-4 flex flex-col items-start gap-2 transition-all hover:shadow-card active:scale-[0.98]"
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
          <HabitTracker onCompletedChange={setCompletedHabits} />
        </section>

        {/* Post Conquista */}
        <PostConquista
          completedCount={completedHabits.size}
          totalCount={HABITS_COUNT}
          streak={streakCount}
        />

        {/* Notification Settings */}
        <section>
          <NotificationSettingsCard />
        </section>
      </div>
    </div>
  );
};

export default HomePage;
