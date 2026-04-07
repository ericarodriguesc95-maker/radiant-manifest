import { useState, useEffect, useCallback } from "react";
import { Sparkles, Brain, ChevronRight, Bell, Zap, Settings, Gift, MapPin, Shield, Trophy, Crown, Star, Heart, Target, BookOpen } from "lucide-react";
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
import { cn } from "@/lib/utils";

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

  // Listen for global event to open updates modal (from push notification toast)
  useEffect(() => {
    const handler = () => setShowUpdates(true);
    window.addEventListener("glowup:show-updates", handler);
    return () => window.removeEventListener("glowup:show-updates", handler);
  }, []);

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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const quickActions = [
    { icon: Brain, label: "Reprogramação\nMental", to: "/reprogramacao", gradient: "from-purple-900/40 to-purple-800/20" },
    { icon: Zap, label: "Alta\nPerformance", to: "/alta-performance", gradient: "from-amber-900/40 to-amber-800/20" },
    { icon: Target, label: "Metas &\nManifestação", to: "/metas", gradient: "from-rose-900/40 to-rose-800/20" },
    { icon: Heart, label: "Destravar\nFeminino", to: "/jornada", gradient: "from-emerald-900/40 to-emerald-800/20" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════ */}
      {/* PREMIUM HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <header className="relative px-5 pt-10 pb-6">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[120px] bg-gradient-to-b from-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">{greeting()}, rainha</p>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              Glow Up
              <Crown className="h-5 w-5 text-gold animate-pulse" />
            </h1>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button onClick={() => navigate("/admin/atividade")} className="p-2.5 rounded-xl glass hover:bg-muted/30 transition-all" title="Painel Admin">
                <Shield className="h-4 w-4 text-gold" />
              </button>
            )}
            <button onClick={() => (window as any).__startGlowTour?.()} className="p-2.5 rounded-xl hover:bg-muted/30 transition-all" title="Tour guiado">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </button>
            <button onClick={() => setShowUpdates(true)} className="relative p-2.5 rounded-xl hover:bg-muted/30 transition-all" title="Novidades">
              <Gift className="h-4 w-4 text-muted-foreground" />
              {hasUnreadUpdates && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold animate-pulse" />}
            </button>
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2.5 rounded-xl hover:bg-muted/30 transition-all">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gold text-[8px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            <button onClick={() => navigate("/settings")} className="p-2.5 rounded-xl hover:bg-muted/30 transition-all">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Thin gold separator */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </header>

      {showUpdates && <AppUpdatesModal onClose={() => { setShowUpdates(false); setHasUnreadUpdates(false); }} />}
      {showNotifications && <NotificationsPanel onClose={() => { setShowNotifications(false); fetchUnread(); }} />}

      <div className="px-5 space-y-7 pb-8">
        {/* ═══════════════════════════════════════════ */}
        {/* STREAK — Premium glass card */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 0 } as React.CSSProperties}>
          <DailyStreak completedHabits={completedHabits} requiredHabits={["meditate", "goals"]} />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* MEDALS — Elegant showcase */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 1 } as React.CSSProperties}>
          <StreakMedals streak={streakCount} />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* DAILY INSPIRATION — Cinematic section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-stagger" style={{ "--stagger": 2 } as React.CSSProperties}>
            <Star className="h-3.5 w-3.5 text-gold" />
            <h2 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Sua Inspiração Diária</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          <div className="animate-stagger" style={{ "--stagger": 3 } as React.CSSProperties}>
            <DailyDevotional />
          </div>
          <div className="animate-stagger" style={{ "--stagger": 4 } as React.CSSProperties}>
            <AffirmationCard />
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* QUICK ACTIONS — Netflix-style cards */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 animate-stagger" style={{ "--stagger": 5 } as React.CSSProperties}>
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <h2 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Acesso Rápido</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, to, gradient }, i) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={cn(
                  "animate-stagger group relative overflow-hidden rounded-2xl p-4 flex flex-col items-start gap-3 transition-all duration-300",
                  "glass border border-gold/10 hover:border-gold/30",
                  "hover:shadow-glow active:scale-[0.97]"
                )}
                style={{ "--stagger": 6 + i } as React.CSSProperties}
              >
                {/* Background gradient */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-100", gradient)} />

                <div className="relative z-10 h-10 w-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-colors">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <span className="relative z-10 text-xs font-body font-semibold text-foreground/90 leading-tight whitespace-pre-line text-left">{label}</span>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-gold/5 to-transparent rounded-bl-3xl" />
              </button>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* BIBLE 365 — Premium CTA */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 10 } as React.CSSProperties}>
          <button
            onClick={() => navigate("/biblia-365")}
            className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-brand active:scale-[0.98] group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 via-amber-800/15 to-amber-700/5" />
            <div className="absolute inset-0 glass-gold" />
            <div className="relative z-10 h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center border border-gold/30 group-hover:bg-gold/25 transition-all">
              <BookOpen className="h-6 w-6 text-gold" />
            </div>
            <div className="relative z-10 flex-1 text-left">
              <p className="text-sm font-display font-bold text-foreground">Bíblia em 365 Dias</p>
              <p className="text-[11px] font-body text-muted-foreground mt-0.5">Leitura diária + neurociência aplicada</p>
            </div>
            <ChevronRight className="relative z-10 h-5 w-5 text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* CHALLENGES — Premium CTA */}
        {/* ═══════════════════════════════════════════ */}

        <div className="animate-stagger" style={{ "--stagger": 11 } as React.CSSProperties}>
          <button
            onClick={() => navigate("/desafios")}
            className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-brand active:scale-[0.98] group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gold/20 via-gold/10 to-gold/5" />
            <div className="absolute inset-0 glass-gold" />
            <div className="relative z-10 h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center border border-gold/30 group-hover:bg-gold/25 transition-all">
              <Trophy className="h-6 w-6 text-gold" />
            </div>
            <div className="relative z-10 flex-1 text-left">
              <p className="text-sm font-display font-bold text-foreground">Desafios Progressivos</p>
              <p className="text-[11px] font-body text-muted-foreground mt-0.5">Jornadas transformadoras de 7 a 90 dias</p>
            </div>
            <ChevronRight className="relative z-10 h-5 w-5 text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* MONTHLY CALENDAR — Elegant section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4 animate-stagger" style={{ "--stagger": 11 } as React.CSSProperties}>
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-gold" />
            <h2 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Planejamento Mensal</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>
          <MonthlyCalendar />
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* HABIT TRACKER — Refined section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4 animate-stagger" style={{ "--stagger": 12 } as React.CSSProperties}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <h2 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Hábitos de Hoje</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>
          <HabitTracker onCompletedChange={setCompletedHabits} />
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* POST CONQUISTA */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 13 } as React.CSSProperties}>
          <PostConquista
            completedCount={completedHabits.size}
            totalCount={HABITS_COUNT}
            streak={streakCount}
          />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* NOTIFICATION SETTINGS */}
        {/* ═══════════════════════════════════════════ */}
        <section className="animate-stagger" style={{ "--stagger": 14 } as React.CSSProperties}>
          <NotificationSettingsCard />
        </section>

        {/* Bottom signature */}
        <div className="text-center pt-4 pb-2 animate-stagger" style={{ "--stagger": 15 } as React.CSSProperties}>
          <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-4" />
          <p className="text-[9px] font-body tracking-[0.3em] uppercase text-gold/30">
            Glow Up · Feito para mulheres extraordinárias
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
