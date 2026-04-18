import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2, MessageSquare, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Suggestion {
  id: string;
  user_id: string;
  category: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}
interface Reply {
  id: string;
  message: string;
  is_admin_reply: boolean;
  created_at: string;
  author_id: string;
}
interface ProfileLite { user_id: string; display_name: string | null; avatar_url: string | null; }
interface NpsRow { id: string; user_id: string; score: number; comment: string | null; created_at: string; }

const STATUSES = [
  { value: "nova", label: "Nova" },
  { value: "em_analise", label: "Em análise" },
  { value: "respondida", label: "Respondida" },
  { value: "arquivada", label: "Arquivada" },
];

export default function AdminSugestoesPage() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();

  const [tab, setTab] = useState<"sugestoes" | "nps">("sugestoes");
  const [list, setList] = useState<Suggestion[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [nps, setNps] = useState<NpsRow[]>([]);

  const loadAll = async () => {
    setLoading(true);
    const { data: sData } = await supabase
      .from("suggestions").select("*").order("created_at", { ascending: false });
    const items = (sData as Suggestion[]) || [];
    setList(items);

    const userIds = Array.from(new Set(items.map((s) => s.user_id)));
    if (userIds.length) {
      const { data: pData } = await supabase
        .from("profiles_public")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const map: Record<string, ProfileLite> = {};
      (pData || []).forEach((p: any) => { if (p.user_id) map[p.user_id] = p; });
      setProfiles(map);
    }
    setLoading(false);
  };

  const loadNps = async () => {
    const { data } = await supabase.from("nps_responses").select("*").order("created_at", { ascending: false });
    setNps((data as NpsRow[]) || []);
  };

  useEffect(() => {
    if (isAdmin) { loadAll(); loadNps(); }
  }, [isAdmin]);

  const fetchReplies = async (id: string) => {
    const { data } = await supabase
      .from("suggestion_replies").select("*")
      .eq("suggestion_id", id).order("created_at", { ascending: true });
    setReplies((prev) => ({ ...prev, [id]: (data as Reply[]) || [] }));
  };

  const handleOpen = (id: string) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (!replies[id]) fetchReplies(id);
  };

  const handleReply = async (s: Suggestion) => {
    if (!user) return;
    const msg = draft.trim();
    if (msg.length < 2) return;
    const { error } = await supabase.from("suggestion_replies").insert({
      suggestion_id: s.id,
      author_id: user.id,
      is_admin_reply: true,
      message: msg.slice(0, 2000),
    });
    if (error) { toast.error("Erro ao enviar resposta"); return; }
    if (s.status === "nova") {
      await supabase.from("suggestions").update({ status: "respondida" }).eq("id", s.id);
    }
    setDraft("");
    toast.success("Resposta enviada à usuária ✨");
    fetchReplies(s.id);
    loadAll();
  };

  const handleStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("suggestions").update({ status }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    setList((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
  };

  if (roleLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filtered = list.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const author = profiles[s.user_id]?.display_name?.toLowerCase() || "";
      return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q) || author.includes(q);
    }
    return true;
  });

  // NPS analytics
  const npsScore = nps.length
    ? Math.round(((nps.filter((n) => n.score >= 9).length - nps.filter((n) => n.score <= 6).length) / nps.length) * 100)
    : 0;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild><Link to="/"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Painel Admin · Feedback</h1>
          <p className="text-sm text-muted-foreground">Sugestões e avaliações NPS das usuárias</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab("sugestoes")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === "sugestoes" ? "border-gold text-gold" : "border-transparent text-muted-foreground"}`}
        >
          <MessageSquare className="h-4 w-4 inline mr-1" /> Sugestões ({list.length})
        </button>
        <button
          onClick={() => setTab("nps")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition ${tab === "nps" ? "border-gold text-gold" : "border-transparent text-muted-foreground"}`}
        >
          <Star className="h-4 w-4 inline mr-1" /> NPS ({nps.length})
        </button>
      </div>

      {tab === "sugestoes" && (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Buscar por usuária, título ou conteúdo…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">Todos status</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-gold" /></div>
          ) : filtered.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">Nenhuma sugestão encontrada.</CardContent></Card>
          ) : filtered.map((s) => {
            const author = profiles[s.user_id];
            const isOpen = openId === s.id;
            const sReplies = replies[s.id] || [];
            return (
              <Card key={s.id} className="border-border/60">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Por <span className="text-gold">{author?.display_name || "Usuária"}</span> · {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: ptBR })} · <Badge variant="secondary" className="text-[10px]">{s.category}</Badge>
                      </p>
                    </div>
                    <select value={s.status} onChange={(e) => handleStatus(s.id, e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
                      {STATUSES.map((st) => <option key={st.value} value={st.value}>{st.label}</option>)}
                    </select>
                  </div>
                  <p className="text-sm whitespace-pre-wrap text-foreground/80">{s.content}</p>

                  <Button variant="ghost" size="sm" onClick={() => handleOpen(s.id)} className="h-8">
                    <MessageSquare className="h-4 w-4" /> {isOpen ? "Fechar" : `Conversar (${sReplies.length})`}
                  </Button>

                  {isOpen && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      {sReplies.map((r) => (
                        <div key={r.id} className={`p-3 rounded-md text-sm ${r.is_admin_reply ? "bg-gold/10 border border-gold/30" : "bg-muted/50"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold">{r.is_admin_reply ? "💎 Equipe (você)" : author?.display_name || "Usuária"}</span>
                            <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ptBR })}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{r.message}</p>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Textarea
                          value={openId === s.id ? draft : ""}
                          onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
                          placeholder={`Responder para ${author?.display_name || "a usuária"}…`}
                          className="min-h-[60px]"
                        />
                        <Button variant="gold" onClick={() => handleReply(s)}><Send className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      {tab === "nps" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">NPS Score</p><p className="text-3xl font-bold text-gold">{npsScore}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Promotoras (9-10)</p><p className="text-3xl font-bold text-green-400">{nps.filter(n => n.score >= 9).length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Neutras (7-8)</p><p className="text-3xl font-bold text-yellow-400">{nps.filter(n => n.score >= 7 && n.score <= 8).length}</p></CardContent></Card>
            <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Detratoras (0-6)</p><p className="text-3xl font-bold text-red-400">{nps.filter(n => n.score <= 6).length}</p></CardContent></Card>
          </div>
          <div className="space-y-2">
            {nps.length === 0 ? (
              <Card className="border-dashed"><CardContent className="py-12 text-center text-muted-foreground">Nenhuma avaliação ainda.</CardContent></Card>
            ) : nps.map((n) => (
              <Card key={n.id}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${
                    n.score >= 9 ? "bg-green-500/20 text-green-400" :
                    n.score >= 7 ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-red-500/20 text-red-400"
                  }`}>{n.score}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}</p>
                    {n.comment ? <p className="text-sm mt-1">{n.comment}</p> : <p className="text-sm italic text-muted-foreground mt-1">Sem comentário</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
