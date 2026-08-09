import { useState, useEffect, useCallback } from "react";
import { Sparkles, Brain, ChevronRight, Bell, Settings, Shield, Trophy, Crown, Heart, Target, BookOpen, ClipboardCheck, Flame, MessageCircle, ThermometerSun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AffirmationCard from "@/components/AffirmationCard";
import DailyDevotional from "@/components/DailyDevotional";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import HabitTracker from "@/components/HabitTracker";
import NotificationsPanel from "@/components/NotificationsPanel";
import NotificationSettingsCard from "@/components/NotificationSettingsCard";
import DailyStreak from "@/components/DailyStreak";
import PostConquista from "@/components/PostConquista";
import { useCheckpointReminders } from "@/hooks/useCheckpointReminders";


import StreakMedals from "@/components/StreakMedals";
import AppUpdatesModal from "@/components/AppUpdatesModal";
import HormonalPhaseSuggestion from "@/components/HormonalPhaseSuggestion";
import ProgressPulseWidget from "@/components/ProgressPulseWidget";
import FutureSelfMessage from "@/components/FutureSelfMessage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/gloow-up-club-logo.png";
import SectionHeading from "@/components/SectionHeading";

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
  useCheckpointReminders();

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
    { icon: Brain, label: "Reprogramar\na Mente", description: "Áudios e exercícios para trocar pensamentos que te travam", to: "/reprogramacao", gradient: "from-violet-200 via-purple-100 to-fuchsia-100", iconBg: "bg-violet-500/15 border-violet-400/40", iconColor: "text-violet-700" },
    { icon: Target, label: "Metas &\nManifestação", description: "Defina o que quer e veja sua vida dos sonhos sair do papel", to: "/metas", gradient: "from-rose-200 via-pink-100 to-red-100", iconBg: "bg-rose-500/15 border-rose-400/40", iconColor: "text-rose-700" },
    { icon: BookOpen, label: "Bíblia em\n365 dias", description: "1 leitura curta por dia + reflexão prática para aproximar seu coração de Deus", to: "/biblia-365", gradient: "from-amber-200 via-yellow-100 to-orange-100", iconBg: "bg-amber-500/15 border-amber-500/40", iconColor: "text-amber-800" },
    { icon: Heart, label: "Destravar\nFeminino", description: "14 aulas curtas para soltar o que está te prendendo", to: "/jornada", gradient: "from-emerald-200 via-teal-100 to-green-100", iconBg: "bg-emerald-500/15 border-emerald-500/40", iconColor: "text-emerald-700" },
    { icon: Crown, label: "Autoestima\nde Rainha", description: "Construa uma confiança que ninguém consegue abalar", to: "/identidade-inabalavel", gradient: "from-yellow-200 via-amber-100 to-yellow-50", iconBg: "bg-yellow-500/20 border-yellow-500/50", iconColor: "text-yellow-800" },
    { icon: Flame, label: "Reset 14.5\n(5 dias)", description: "5 dias com jejum de 14h por dia para resetar o corpo", to: "/protocolo-14-5", gradient: "from-orange-200 via-red-100 to-amber-100", iconBg: "bg-orange-500/15 border-orange-500/40", iconColor: "text-orange-700" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ═══════════════════════════════════════════ */}
      {/* PREMIUM HEADER */}
      {/* ═══════════════════════════════════════════ */}
      <header className="relative px-5 pt-8 pb-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src={brandLogo} alt="Gloow Up Club" className="h-11 w-11 object-contain rounded-full border border-border" />
            <div>
              <p className="eyebrow">Gloow Up Club</p>
              <h1 className="font-display text-[26px] leading-none text-foreground">{greeting()}, rainha</h1>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button onClick={() => navigate("/admin/atividade")} className="p-2 rounded-full border border-border hover:bg-secondary transition-colors" title="Painel Admin">
                <Shield className="h-4 w-4 text-primary" />
              </button>
            )}
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full border border-border hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            <button onClick={() => navigate("/settings")} className="p-2 rounded-full border border-border hover:bg-secondary transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mt-5 hairline" />
      </header>


      {showUpdates && <AppUpdatesModal onClose={() => { setShowUpdates(false); setHasUnreadUpdates(false); }} />}
      {showNotifications && <NotificationsPanel onClose={() => { setShowNotifications(false); fetchUnread(); }} />}

      <div className="px-5 space-y-7 pb-8">
        {/* ═══════════════════════════════════════════ */}
        {/* WELCOME BANNER, Primeira ação da rainha */}
        {/* ═══════════════════════════════════════════ */}
        <section
          className="animate-stagger"
          style={{ "--stagger": 0 } as React.CSSProperties}
        >
          <div className="ed-hero">
            <p className="eyebrow text-[hsl(24_30%_25%)]">Comece por aqui</p>
            <h2 className="mt-1 font-display text-[30px] leading-[1.05]">
              Apresente-se para o <span className="italic">clube</span>
            </h2>
            <p className="mt-2 text-[13px] font-body max-w-md text-[hsl(24_25%_25%)]">
              Esse é o seu primeiro passo. Conte quem você é, conecte-se com outras extraordinárias e ative o seu lugar na comunidade.
            </p>

            <button
              onClick={() => navigate("/apresentacoes")}
              className="mt-5 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-foreground text-background font-body text-[13px] font-semibold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all"
            >
              <Heart className="h-4 w-4" />
              Fazer minha apresentação
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/bem-vindo")}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-background/70 border border-background/60 hover:bg-background transition-all text-left"
              >
                <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[11px] font-body font-semibold truncate">Boas-vindas</span>
              </button>
              <button
                onClick={() => navigate("/ranking-mensal")}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-background/70 border border-background/60 hover:bg-background transition-all text-left"
              >
                <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-[11px] font-body font-semibold truncate">Top clubbers</span>
              </button>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════ */}
        {/* MENSAGEM DA VERSÃO FUTURA (Bloco 6) */}
        {/* ═══════════════════════════════════════════ */}
        <FutureSelfMessage />

        {/* ═══════════════════════════════════════════ */}
        {/* COMUNIDADE, WhatsApp group CTA (logo abaixo do Comece por aqui) */}
        {/* ═══════════════════════════════════════════ */}
        <section className="animate-stagger space-y-4" style={{ "--stagger": 1 } as React.CSSProperties}>
          <SectionHeading eyebrow="Seus rituais" title="Do dia a dia" />
          <div className="ed-card px-4">
            <a
              href="https://chat.whatsapp.com/KqwvIi2Ht238RoSMVCS7J0"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-row"
            >
              <span className="ed-row-icon"><MessageCircle className="h-5 w-5" /></span>
              <span className="flex-1">
                <span className="ed-title block">Grupo do WhatsApp</span>
                <span className="ed-sub block">Conecte-se com outras rainhas e cresça junto</span>
              </span>
              <span className="ed-tag">Entrar</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>

            <button onClick={() => navigate("/meu-mes")} className="ed-row">
              <span className="ed-row-icon"><ThermometerSun className="h-5 w-5" /></span>
              <span className="flex-1">
                <span className="ed-title block">Termômetro do mês</span>
                <span className="ed-sub block">Três perguntas rápidas pra ajustar o app pro seu momento</span>
              </span>
              <span className="ed-tag">Responder</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button onClick={() => navigate("/resumo-sexta")} className="ed-row">
              <span className="ed-row-icon"><Trophy className="h-5 w-5" /></span>
              <span className="flex-1">
                <span className="ed-title block">{new Date().getDay() === 5 ? "Sexta da vitória" : "Resumo da semana"}</span>
                <span className="ed-sub block">Veja tudo que você construiu nos últimos 7 dias</span>
              </span>
              {new Date().getDay() === 5 && <span className="ed-tag">Hoje</span>}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button onClick={() => navigate("/plano-alimentar")} className="ed-row">
              <span className="ed-row-icon"><span className="text-lg">🥗</span></span>
              <span className="flex-1">
                <span className="ed-title block">Plano alimentar da semana</span>
                <span className="ed-sub block">7 dias, 5 refeições, lista de compras pronta</span>
              </span>
              <span className="ed-tag">IA</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </section>





        {/* ═══════════════════════════════════════════ */}
        {/* STREAK, Premium glass card */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 1 } as React.CSSProperties}>
          <DailyStreak completedHabits={completedHabits} requiredHabits={["meditate", "goals"]} />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* MEDALS, Elegant showcase */}

        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 1 } as React.CSSProperties}>
          <StreakMedals streak={streakCount} />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* DAILY INSPIRATION, Cinematic section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="animate-stagger" style={{ "--stagger": 2 } as React.CSSProperties}>
            <SectionHeading eyebrow="Manhã" title="Para começar o dia" />
          </div>

          <div className="animate-stagger" style={{ "--stagger": 3 } as React.CSSProperties}>
            <DailyDevotional />
          </div>
          <div className="animate-stagger" style={{ "--stagger": 4 } as React.CSSProperties}>
            <AffirmationCard />
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* CHECK-POINTS DO DIA — card direcionador      */}
        {/* ═══════════════════════════════════════════ */}
        <section className="animate-stagger" style={{ "--stagger": 5 } as React.CSSProperties}>
          <button
            onClick={() => navigate("/checkpoints")}
            className="w-full text-left group"
          >
            <div className="ed-card px-5 py-5 flex items-center gap-4 transition-all hover:shadow-lg active:scale-[0.99]">
              <div className="h-12 w-12 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold shrink-0">
                <ClipboardCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-[15px] font-semibold text-foreground">Check-points do dia</p>
                <p className="text-[12px] font-body text-muted-foreground leading-snug">
                  Pequenas vitórias diárias que transformam sua rotina. Complete tarefas, acumule pontos e suba no ranking das Extraordinárias do mês.
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-gold transition-colors shrink-0" />
            </div>
          </button>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* QUICK ACTIONS, editorial cards */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4">
          <div className="animate-stagger" style={{ "--stagger": 6 } as React.CSSProperties}>
            <SectionHeading eyebrow="Trilhas" title="Comece por aqui" />
          </div>


          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(({ icon: Icon, label, description, to }, i) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={cn(
                  "animate-stagger ed-card group flex min-h-[150px] flex-col items-start gap-2 p-4 text-left transition-all duration-300",
                  "hover:-translate-y-0.5 active:scale-[0.98]"
                )}
                style={{ "--stagger": 6 + i } as React.CSSProperties}
              >
                <span className="ed-row-icon h-10 w-10">
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="font-display text-base leading-tight whitespace-pre-line text-foreground">{label}</span>
                <span className="text-[11px] font-body leading-snug text-muted-foreground line-clamp-3">{description}</span>
                <span className="mt-auto eyebrow text-[9px]">Abrir</span>
              </button>
            ))}
          </div>
        </section>


        {/* ═══════════════════════════════════════════ */}
        {/* HORMONAL PHASE, personalização biológica */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 8 } as React.CSSProperties}>
          <HormonalPhaseSuggestion />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* PROGRESS PULSE, Metas + Finanças (dopamina visual) */}
        {/* ═══════════════════════════════════════════ */}
        <div className="animate-stagger" style={{ "--stagger": 8 } as React.CSSProperties}>
          <ProgressPulseWidget />
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* PROGRAMAS, lista editorial */}
        {/* ═══════════════════════════════════════════ */}
        <section className="animate-stagger space-y-4" style={{ "--stagger": 9 } as React.CSSProperties}>
          <SectionHeading eyebrow="Programas" title="Explore o clube" />
          <div className="ed-card px-4">
            {[
              { icon: Sparkles, title: "Gloow Movimenta", sub: "21 dias · 5 missões por dia: corpo, mente, alma, finanças e vida", to: "/glow-move", tag: "Iniciar" },
              { icon: BookOpen, title: "Bíblia em 365 dias", sub: "1 leitura curta por dia + reflexão prática", to: "/biblia-365" },
              { icon: Crown, title: "Jornada Elite", sub: "Trilha completa em 5 níveis · 80+ aulas + teste de perfil", to: "/jornada-elite" },
              { icon: ClipboardCheck, title: "Descubra seu perfil", sub: "Testes rápidos: DISC, comportamento e produtividade", to: "/testes" },
              { icon: Trophy, title: "Desafios progressivos", sub: "Escolha um desafio de 7, 21, 30 ou 90 dias e bora", to: "/desafios" },
            ].map(({ icon: Icon, title, sub, to, tag }) => (
              <button key={to} onClick={() => navigate(to)} className="ed-row">
                <span className="ed-row-icon"><Icon className="h-5 w-5" /></span>
                <span className="flex-1">
                  <span className="ed-title block">{title}</span>
                  <span className="ed-sub block">{sub}</span>
                </span>
                {tag && <span className="ed-tag">{tag}</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>






        {/* ═══════════════════════════════════════════ */}
        {/* MONTHLY CALENDAR, Elegant section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4 animate-stagger" style={{ "--stagger": 11 } as React.CSSProperties}>
          <SectionHeading eyebrow="Agenda" title="Seu mês de relance" />
          <MonthlyCalendar />
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* HABIT TRACKER, Refined section */}
        {/* ═══════════════════════════════════════════ */}
        <section className="space-y-4 animate-stagger" style={{ "--stagger": 12 } as React.CSSProperties}>
          <SectionHeading eyebrow="Hoje" title="Marque seus hábitos" />
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
        <div className="text-center pt-6 pb-2 animate-stagger" style={{ "--stagger": 15 } as React.CSSProperties}>
          <div className="hairline mb-4" />
          <p className="eyebrow text-[9px]">
            Gloow Up Club · Feito para mulheres extraordinárias
          </p>
        </div>

      </div>
    </div>
  );

};

export default HomePage;
