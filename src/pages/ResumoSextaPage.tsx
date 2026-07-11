import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Trophy, Sparkles, Flame, CheckCircle2, MessageCircle, Target, Activity, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function startOfWeek(d = new Date()) {
  const day = d.getDay(); // 0=Sun ... 5=Fri
  const diff = (day === 0 ? -6 : 1 - day); // week starts Monday
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  s.setHours(0, 0, 0, 0);
  return s;
}
function endOfWeek(d = new Date()) {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 7);
  return e;
}

interface WeekStats {
  habitDays: number;
  fullDays: number;
  activities: number;
  posts: number;
  comments: number;
  likesGiven: number;
  goalUpdates: number;
  exercises: number;
  diary: number;
  streak: number;
}

const MOTIVATIONS = [
  "Você não parou. Você construiu. Isso é o que separa quem sonha de quem realiza.",
  "Cada pequena ação dessa semana está fazendo você virar uma versão que a antiga não reconheceria.",
  "Consistência silenciosa vira resultado inevitável. E você provou isso essa semana.",
  "A mulher que você quer ser está sendo construída todos os dias. Essa semana ela ficou mais nítida.",
];

export default function ResumoSextaPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WeekStats | null>(null);
  const [topWin, setTopWin] = useState<{ label: string; value: number } | null>(null);

  const weekStart = useMemo(() => startOfWeek(), []);
  const weekEnd = useMemo(() => endOfWeek(), []);

  const rangeLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    const end = new Date(weekEnd.getTime() - 1);
    return `${fmt(weekStart)} a ${fmt(end)}`;
  }, [weekStart, weekEnd]);

  const motivation = useMemo(() => {
    const idx = Math.floor(weekStart.getTime() / (7 * 86400000)) % MOTIVATIONS.length;
    return MOTIVATIONS[idx];
  }, [weekStart]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const startISO = weekStart.toISOString();
      const endISO = weekEnd.toISOString();
      const startDate = weekStart.toISOString().slice(0, 10);
      const endDate = new Date(weekEnd.getTime() - 1).toISOString().slice(0, 10);

      const [dc, act, posts, comments, likes, goals, ex, diary] = await Promise.all([
        supabase.from("daily_completions").select("all_completed, completion_date").eq("user_id", user.id).gte("completion_date", startDate).lte("completion_date", endDate),
        supabase.from("activity_log").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("community_posts").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("post_comments").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("goal_updates").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("exercise_entries").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
        supabase.from("diary_notes").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", startISO).lt("created_at", endISO),
      ]);

      const dcRows = (dc.data as any[]) ?? [];
      const habitDays = new Set(dcRows.map((r) => r.completion_date)).size;
      const fullDays = dcRows.filter((r) => r.all_completed).length;

      const { data: streakData } = await supabase.rpc("calculate_streak", { _user_id: user.id });

      const stats: WeekStats = {
        habitDays,
        fullDays,
        activities: act.count ?? 0,
        posts: posts.count ?? 0,
        comments: comments.count ?? 0,
        likesGiven: likes.count ?? 0,
        goalUpdates: goals.count ?? 0,
        exercises: ex.count ?? 0,
        diary: diary.count ?? 0,
        streak: (streakData as any) ?? 0,
      };
      setStats(stats);

      // pick top win
      const candidates = [
        { label: "dias com hábitos", value: stats.habitDays, icon: "✅" },
        { label: "ações registradas", value: stats.activities, icon: "⚡" },
        { label: "treinos concluídos", value: stats.exercises, icon: "💪" },
        { label: "publicações na comunidade", value: stats.posts, icon: "💬" },
        { label: "atualizações em metas", value: stats.goalUpdates, icon: "🎯" },
      ].sort((a, b) => b.value - a.value);
      setTopWin(candidates[0]?.value ? candidates[0] : null);

      setLoading(false);
    })();
  }, [user, weekStart, weekEnd]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const cards = stats
    ? [
        { icon: CheckCircle2, label: "Dias com hábitos", value: stats.habitDays, suffix: "/7", tone: "from-emerald-50 to-lime-50 border-emerald-200 text-emerald-700" },
        { icon: Flame, label: "Dias 100% completos", value: stats.fullDays, suffix: "/7", tone: "from-amber-50 to-orange-50 border-amber-200 text-amber-700" },
        { icon: Activity, label: "Ações registradas", value: stats.activities, tone: "from-sky-50 to-cyan-50 border-sky-200 text-sky-700" },
        { icon: Target, label: "Metas atualizadas", value: stats.goalUpdates, tone: "from-violet-50 to-fuchsia-50 border-violet-200 text-violet-700" },
        { icon: MessageCircle, label: "Interações na comunidade", value: stats.posts + stats.comments + stats.likesGiven, tone: "from-pink-50 to-rose-50 border-pink-200 text-pink-700" },
        { icon: Sparkles, label: "Notas no diário", value: stats.diary, tone: "from-yellow-50 to-amber-50 border-yellow-200 text-yellow-700" },
      ]
    : [];

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="max-w-2xl mx-auto px-4 pt-2 pb-24 space-y-6">
      <header className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
          <PartyPopper className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
            {isFriday ? "Sexta da Vitória" : "Resumo da Semana"}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          Olha o que você construiu essa semana 👑
        </h1>
        <p className="text-xs font-body text-muted-foreground">{rangeLabel}</p>
      </header>

      {topWin && topWin.value > 0 && (
        <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-gold/30 shadow-card text-center space-y-2">
          <Trophy className="h-8 w-8 text-gold mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-gold">
            Sua maior vitória
          </p>
          <p className="text-2xl font-display font-bold text-foreground">
            {topWin.value} {topWin.label}
          </p>
          <p className="text-xs font-body text-foreground/80 italic max-w-sm mx-auto">
            {motivation}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={cn(
                "rounded-2xl p-4 border bg-gradient-to-br shadow-sm flex flex-col items-start gap-2",
                c.tone
              )}
            >
              <Icon className="h-5 w-5" />
              <p className="text-2xl font-display font-bold text-foreground">
                {c.value}
                {c.suffix && <span className="text-sm text-muted-foreground font-body">{c.suffix}</span>}
              </p>
              <p className="text-[11px] font-body text-foreground/70 leading-tight">{c.label}</p>
            </div>
          );
        })}
      </div>

      {stats && stats.streak > 0 && (
        <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-50 to-rose-50 border border-orange-200 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center">
            <Flame className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-display font-bold text-foreground">
              {stats.streak} {stats.streak === 1 ? "dia" : "dias"} de streak ativa
            </p>
            <p className="text-[11px] font-body text-muted-foreground">
              Continue amanhã para não quebrar o embalo.
            </p>
          </div>
        </div>
      )}

      <div className="rounded-2xl p-5 bg-card border border-border space-y-3">
        <p className="text-[10px] uppercase tracking-[0.2em] font-body font-bold text-gold">
          Ritual da Vitória
        </p>
        <p className="text-sm font-body text-foreground/90 leading-relaxed">
          Antes de fechar o app, faça três coisas: <br />
          <span className="font-semibold">1.</span> Escreva uma vitória da semana no seu diário. <br />
          <span className="font-semibold">2.</span> Envie um audio ou mensagem no grupo comemorando. <br />
          <span className="font-semibold">3.</span> Escolha uma meta pra dar prioridade na próxima semana.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => navigate("/diario")}
            className="flex-1 h-11 rounded-xl bg-gold text-background font-display font-bold text-sm hover:brightness-105 active:scale-[0.98] transition"
          >
            Registrar no diário
          </button>
          <button
            onClick={() => navigate("/comunidade")}
            className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm hover:bg-muted transition"
          >
            Ir para comunidade
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => navigate("/metas")}
          className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm hover:bg-muted transition"
        >
          Planejar próxima semana
        </button>
        <button
          onClick={() => navigate("/evolucao")}
          className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm hover:bg-muted transition"
        >
          Ver evolução completa
        </button>
      </div>
    </div>
  );
}
