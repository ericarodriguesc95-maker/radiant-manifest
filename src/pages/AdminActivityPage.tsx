import { useState, useEffect } from "react";
import { ArrowLeft, Clock, User, Activity, Search, Filter, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
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
  const PAGE_SIZE = 100;

  // Check admin role
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
      if (!isAdm) {
        navigate("/");
        return;
      }
      fetchData();
    };
    checkAdmin();
  }, [user]);

  const fetchData = async () => {
    const [{ data: actData }, { data: profData }] = await Promise.all([
      supabase.from("activity_log" as any).select("*").order("created_at", { ascending: false }).limit(PAGE_SIZE),
      supabase.from("profiles").select("user_id, display_name, avatar_url"),
    ]);

    if (actData) setActivities(actData as unknown as ActivityEntry[]);
    if (profData) {
      const map = new Map<string, UserProfile>();
      (profData as UserProfile[]).forEach(p => map.set(p.user_id, p));
      setProfiles(map);
      setAllUsers(profData as UserProfile[]);
    }
    setLoading(false);
  };

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

  const getActionInfo = (action: string) => {
    return ACTION_LABELS[action] || { label: action, emoji: "📌", color: "text-muted-foreground" };
  };

  const filteredUsers = allUsers.filter(u =>
    !searchQuery || u.display_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group activities by user for summary view
  const userActivitySummary = allUsers.map(u => {
    const userActs = activities.filter(a => a.user_id === u.user_id);
    const lastActivity = userActs[0];
    return { ...u, count: userActs.length, lastActivity };
  }).filter(u => u.count > 0 || !selectedUser).sort((a, b) => {
    if (!a.lastActivity && !b.lastActivity) return 0;
    if (!a.lastActivity) return 1;
    if (!b.lastActivity) return -1;
    return new Date(b.lastActivity.created_at).getTime() - new Date(a.lastActivity.created_at).getTime();
  });

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
            Rastreamento de Atividade
          </h1>
          <p className="text-xs font-body text-muted-foreground">Somente admin • Histórico completo</p>
        </div>
      </div>

      {/* Search & Filter */}
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
            Limpar filtro
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-12">Carregando atividades...</p>
      ) : !selectedUser ? (
        /* User list with summaries */
        <div className="space-y-2">
          <p className="text-xs font-body text-muted-foreground font-semibold uppercase tracking-wider">
            Usuárias ({filteredUsers.length})
          </p>
          {filteredUsers.map(u => {
            const summary = userActivitySummary.find(s => s.user_id === u.user_id);
            const isExpanded = expandedUser === u.user_id;
            const userActs = activities.filter(a => a.user_id === u.user_id).slice(0, 5);

            return (
              <div key={u.user_id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setExpandedUser(isExpanded ? null : u.user_id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-semibold text-foreground truncate">{u.display_name || "Sem nome"}</p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      {summary?.count || 0} atividades •{" "}
                      {summary?.lastActivity
                        ? `Última: ${format(new Date(summary.lastActivity.created_at), "dd/MM HH:mm", { locale: ptBR })}`
                        : "Sem atividade"}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border animate-fade-in">
                    {userActs.length === 0 ? (
                      <p className="text-xs text-muted-foreground p-3 text-center">Nenhuma atividade registrada ainda</p>
                    ) : (
                      <div className="divide-y divide-border">
                        {userActs.map(act => {
                          const info = getActionInfo(act.action);
                          return (
                            <div key={act.id} className="flex items-center gap-2.5 px-3 py-2">
                              <span className="text-base">{info.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-body text-foreground">
                                  <span className={cn("font-semibold", info.color)}>{info.label}</span>
                                  {act.details && <span className="text-muted-foreground"> — {act.details}</span>}
                                </p>
                              </div>
                              <span className="text-[10px] font-body text-muted-foreground/60 shrink-0">
                                {format(new Date(act.created_at), "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          );
                        })}
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
        /* Full activity timeline for selected user */
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-card rounded-2xl border border-border p-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {profiles.get(selectedUser)?.avatar_url ? (
                <img src={profiles.get(selectedUser)!.avatar_url!} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-body font-semibold text-foreground">
                {profiles.get(selectedUser)?.display_name || "Sem nome"}
              </p>
              <p className="text-[10px] font-body text-muted-foreground">{activities.length} atividades registradas</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1">
            {activities.map((act, i) => {
              const info = getActionInfo(act.action);
              const prev = activities[i - 1];
              const showDateHeader = !prev || format(new Date(act.created_at), "yyyy-MM-dd") !== format(new Date(prev.created_at), "yyyy-MM-dd");

              return (
                <div key={act.id}>
                  {showDateHeader && (
                    <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider pt-3 pb-1 px-1">
                      {format(new Date(act.created_at), "EEEE, dd 'de' MMMM", { locale: ptBR })}
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
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-body text-muted-foreground font-medium">
                        {format(new Date(act.created_at), "HH:mm:ss", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
