import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Clock, User, Activity, Search, ChevronDown, ChevronUp, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isToday, isYesterday, startOfDay, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityEntry {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  page: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface UserSession {
  start: Date;
  end: Date;
  pages: string[];
}

const ACTION_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  page_view: { label: "Visualizou página", emoji: "👁️", color: "text-blue-400" },
  login: { label: "Fez login", emoji: "🔑", color: "text-green-400" },
  create_post: { label: "Criou post", emoji: "📝", color: "text-violet-400" },
  like_post: { label: "Curtiu post", emoji: "❤️", color: "text-red-400" },
  comment_post: { label: "Comentou", emoji: "💬", color: "text-cyan-400" },
  create_story: { label: "Criou story", emoji: "📸", color: "text-pink-400" },
  create_note: { label: "Criou nota", emoji: "📝", color: "text-amber-400" },
  update_profile: { label: "Atualizou perfil", emoji: "✏️", color: "text-indigo-400" },
  follow_user: { label: "Seguiu alguém", emoji: "👥", color: "text-emerald-400" },
};

function computeSessions(acts: ActivityEntry[]): UserSession[] {
  if (acts.length === 0) return [];
  const sorted = [...acts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  const sessions: UserSession[] = [];
  let sessionStart = new Date(sorted[0].created_at);
  let sessionEnd = sessionStart;
  let pages: string[] = sorted[0].details ? [sorted[0].details] : [];

  for (let i = 1; i < sorted.length; i++) {
    const t = new Date(sorted[i].created_at);
    // If gap > 30 min, start new session
    if (differenceInMinutes(t, sessionEnd) > 30) {
      sessions.push({ start: sessionStart, end: sessionEnd, pages });
      sessionStart = t;
      sessionEnd = t;
      pages = sorted[i].details ? [sorted[i].details] : [];
    } else {
      sessionEnd = t;
      if (sorted[i].details && !pages.includes(sorted[i].details!)) {
        pages.push(sorted[i].details!);
      }
    }
  }
  sessions.push({ start: sessionStart, end: sessionEnd, pages });
  return sessions.reverse();
}

function formatSessionDuration(session: UserSession): string {
  const mins = Math.max(1, differenceInMinutes(session.end, session.start));
  if (mins < 60) return `${mins}min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function formatDayLabel(date: Date): string {
  if (isToday(date)) return "Hoje";
  if (isYesterday(date)) return "Ontem";
  return format(date, "EEEE, dd 'de' MMMM", { locale: ptBR });
}

export default function AdminActivityPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [tab, setTab] = useState<"sessions" | "timeline">("sessions");
  const PAGE_SIZE = 200;

  useEffect(() => {
    if (!user) return;
    const checkAdmin = async () => {
      const { data } = await supabase
        .from("user_roles" as any)
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin");
      const isAdm = (data as any[])?.length > 0;
      setIsAdmin(isAdm);
      if (!isAdm) { navigate("/"); return; }
      fetchData();
    };
    checkAdmin();
  }, [user]);

  // Realtime subscription for new activities
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel("admin-activity")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "activity_log",
      }, (payload) => {
        const newEntry = payload.new as ActivityEntry;
        setActivities(prev => [newEntry, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [{ data: actData }, { data: profData }] = await Promise.all([
      supabase.from("activity_log" as any).select("*").order("created_at", { ascending: false }).limit(PAGE_SIZE),
      supabase.from("profiles_public" as any).select("user_id, display_name, avatar_url"),
    ]);
    if (actData) setActivities(actData as unknown as ActivityEntry[]);
    if (profData) {
      const map = new Map<string, UserProfile>();
      (profData as unknown as UserProfile[]).forEach(p => map.set(p.user_id, p));
      setProfiles(map);
      setAllUsers(profData as unknown as UserProfile[]);
    }
    setLoading(false);
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    let query = supabase
      .from("activity_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .range(nextPage * PAGE_SIZE, (nextPage + 1) * PAGE_SIZE - 1);
    if (selectedUser) query = query.eq("user_id", selectedUser);
    const { data } = await query;
    if (data && (data as any[]).length > 0) {
      setActivities(prev => [...prev, ...(data as unknown as ActivityEntry[])]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  const filterByUser = async (userId: string | null) => {
    setSelectedUser(userId);
    setPage(0);
    setLoading(true);
    let query = supabase
      .from("activity_log" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (userId) query = query.eq("user_id", userId);
    const { data } = await query;
    if (data) setActivities(data as unknown as ActivityEntry[]);
    setLoading(false);
  };

  const getActionInfo = (action: string) =>
    ACTION_LABELS[action] || { label: action, emoji: "📌", color: "text-muted-foreground" };

  const filteredUsers = allUsers.filter(u =>
    !searchQuery || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Build user summaries with session data
  const userSummaries = filteredUsers.map(u => {
    const userActs = activities.filter(a => a.user_id === u.user_id);
    const sessions = computeSessions(userActs);
    const todaySessions = sessions.filter(s => isToday(s.start));
    const totalMinutesToday = todaySessions.reduce((sum, s) => sum + Math.max(1, differenceInMinutes(s.end, s.start)), 0);
    const lastActivity = userActs[0];
    const isOnlineNow = lastActivity && differenceInMinutes(new Date(), new Date(lastActivity.created_at)) < 5;
    return { ...u, sessions, todaySessions, totalMinutesToday, lastActivity, isOnlineNow, actCount: userActs.length };
  }).sort((a, b) => {
    // Online first, then by last activity
    if (a.isOnlineNow && !b.isOnlineNow) return -1;
    if (!a.isOnlineNow && b.isOnlineNow) return 1;
    if (!a.lastActivity && !b.lastActivity) return 0;
    if (!a.lastActivity) return 1;
    if (!b.lastActivity) return -1;
    return new Date(b.lastActivity.created_at).getTime() - new Date(a.lastActivity.created_at).getTime();
  });

  const onlineCount = userSummaries.filter(u => u.isOnlineNow).length;

  if (!isAdmin && !loading) return null;

  return (
    <div className="p-4 pb-24 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
            <Activity className="h-5 w-5 text-gold" />
            Rastreamento
          </h1>
          <p className="text-xs font-body text-muted-foreground">
            Admin • {onlineCount > 0 && <span className="text-green-400">● {onlineCount} online agora</span>}
          </p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Atualizar">
          <RefreshCw className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-heading font-bold text-foreground">{allUsers.length}</p>
          <p className="text-[10px] font-body text-muted-foreground">Usuárias</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-heading font-bold text-green-400">{onlineCount}</p>
          <p className="text-[10px] font-body text-muted-foreground">Online</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-3 text-center">
          <p className="text-lg font-heading font-bold text-gold">{activities.length}</p>
          <p className="text-[10px] font-body text-muted-foreground">Atividades</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-muted/50 rounded-xl px-3 py-2 border border-border">
          <Search className="h-4 w-4 text-muted-foreground mr-2" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar usuária..."
            className="flex-1 bg-transparent text-sm font-body outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        {selectedUser && (
          <Button variant="ghost" size="sm" onClick={() => filterByUser(null)} className="text-xs text-muted-foreground">
            ✕ Filtro
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">Carregando...</p>
      ) : !selectedUser ? (
        /* User list */
        <div className="space-y-2">
          {userSummaries.map(u => {
            const isExpanded = expandedUser === u.user_id;
            const userActs = activities.filter(a => a.user_id === u.user_id).slice(0, 8);

            return (
              <div key={u.user_id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    {u.isOnlineNow && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-400 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-body font-semibold text-foreground truncate">{u.display_name || "Sem nome"}</p>
                      {u.isOnlineNow && (
                        <span className="text-[9px] font-body bg-green-400/20 text-green-400 px-1.5 py-0.5 rounded-full font-semibold">ONLINE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-body text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        {u.totalMinutesToday > 0
                          ? `${u.totalMinutesToday}min hoje`
                          : "Inativo hoje"}
                      </span>
                      <span>•</span>
                      <span>{u.actCount} ações</span>
                      {u.lastActivity && (
                        <>
                          <span>•</span>
                          <span>
                            {formatDistanceToNow(new Date(u.lastActivity.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border animate-fade-in">
                    {/* Session summary */}
                    {u.sessions.length > 0 && (
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider mb-2">
                          🕐 Sessões de Acesso
                        </p>
                        <div className="space-y-1.5">
                          {u.sessions.slice(0, 5).map((session, si) => (
                            <div key={si} className="flex items-center gap-2 bg-muted/30 rounded-lg px-2.5 py-1.5">
                              <Clock className="h-3 w-3 text-gold shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-body text-foreground">
                                  <span className="font-semibold">
                                    {format(session.start, "HH:mm")} — {format(session.end, "HH:mm")}
                                  </span>
                                  <span className="text-muted-foreground"> ({formatSessionDuration(session)})</span>
                                </p>
                                <p className="text-[9px] font-body text-muted-foreground/70 truncate">
                                  {formatDayLabel(session.start)} • {session.pages.join(", ")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent actions */}
                    {userActs.length > 0 && (
                      <div className="px-3 pt-3 pb-1">
                        <p className="text-[10px] font-body font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Ações Recentes
                        </p>
                        <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
                          {userActs.map(act => {
                            const info = getActionInfo(act.action);
                            return (
                              <div key={act.id} className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/10">
                                <span className="text-sm">{info.emoji}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-body">
                                    <span className={cn("font-semibold", info.color)}>{info.label}</span>
                                    {act.details && <span className="text-muted-foreground"> — {act.details}</span>}
                                  </p>
                                </div>
                                <span className="text-[9px] font-body text-muted-foreground/60 shrink-0">
                                  {format(new Date(act.created_at), "HH:mm")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="p-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => filterByUser(u.user_id)}
                        className="w-full text-xs text-gold gap-1"
                      >
                        <Eye className="h-3 w-3" /> Ver histórico completo
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Selected user full timeline */
        <div className="space-y-3">
          {/* User header */}
          <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {profiles.get(selectedUser)?.avatar_url ? (
                <img src={profiles.get(selectedUser)!.avatar_url!} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-body font-semibold text-foreground">
                {profiles.get(selectedUser)?.display_name || "Sem nome"}
              </p>
              <p className="text-[10px] font-body text-muted-foreground">{activities.length} atividades</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex bg-muted/50 rounded-xl p-1 border border-border">
            <button
              onClick={() => setTab("sessions")}
              className={cn(
                "flex-1 text-xs font-body py-1.5 rounded-lg transition-colors",
                tab === "sessions" ? "bg-card text-gold font-semibold shadow-sm" : "text-muted-foreground"
              )}
            >
              🕐 Sessões
            </button>
            <button
              onClick={() => setTab("timeline")}
              className={cn(
                "flex-1 text-xs font-body py-1.5 rounded-lg transition-colors",
                tab === "timeline" ? "bg-card text-gold font-semibold shadow-sm" : "text-muted-foreground"
              )}
            >
              📋 Timeline
            </button>
          </div>

          {tab === "sessions" ? (
            /* Sessions view */
            <div className="space-y-2">
              {(() => {
                const sessions = computeSessions(activities);
                if (sessions.length === 0) return <p className="text-xs text-muted-foreground text-center py-6">Nenhuma sessão</p>;

                let lastDay = "";
                return sessions.map((session, i) => {
                  const dayKey = format(session.start, "yyyy-MM-dd");
                  const showDay = dayKey !== lastDay;
                  lastDay = dayKey;
                  return (
                    <div key={i}>
                      {showDay && (
                        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider pt-2 pb-1 px-1">
                          {formatDayLabel(session.start)}
                        </p>
                      )}
                      <div className="bg-card rounded-xl border border-border px-3 py-2.5 flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
                          <Clock className="h-4 w-4 text-gold" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-semibold text-foreground">
                            {format(session.start, "HH:mm")} — {format(session.end, "HH:mm")}
                          </p>
                          <p className="text-[10px] font-body text-muted-foreground">
                            Duração: {formatSessionDuration(session)} • Páginas: {session.pages.length > 0 ? session.pages.join(", ") : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            /* Timeline view */
            <div className="space-y-1">
              {activities.map((act, i) => {
                const info = getActionInfo(act.action);
                const prev = activities[i - 1];
                const showDateHeader = !prev || format(new Date(act.created_at), "yyyy-MM-dd") !== format(new Date(prev.created_at), "yyyy-MM-dd");

                return (
                  <div key={act.id}>
                    {showDateHeader && (
                      <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider pt-3 pb-1 px-1">
                        {formatDayLabel(new Date(act.created_at))}
                      </p>
                    )}
                    <div className="flex items-center gap-2.5 bg-card rounded-xl border border-border px-3 py-2.5">
                      <span className="text-lg">{info.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body">
                          <span className={cn("font-semibold", info.color)}>{info.label}</span>
                          {act.details && <span className="text-muted-foreground"> — {act.details}</span>}
                        </p>
                        {act.page && (
                          <p className="text-[10px] text-muted-foreground/60 font-body">📍 {act.page}</p>
                        )}
                      </div>
                      <p className="text-[10px] font-body text-muted-foreground font-medium shrink-0">
                        {format(new Date(act.created_at), "HH:mm:ss")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activities.length >= (page + 1) * PAGE_SIZE && (
            <Button variant="ghost" size="sm" onClick={loadMore} disabled={loadingMore} className="w-full text-muted-foreground">
              {loadingMore ? "Carregando..." : "Carregar mais"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
