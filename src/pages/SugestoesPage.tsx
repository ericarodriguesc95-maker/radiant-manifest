import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lightbulb, Send, MessageCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Suggestion {
  id: string;
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
}

const CATEGORIES = [
  { value: "geral", label: "Geral" },
  { value: "novo-recurso", label: "Novo recurso" },
  { value: "melhoria", label: "Melhoria" },
  { value: "bug", label: "Algo não funciona" },
  { value: "conteudo", label: "Conteúdo" },
];

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  nova: { label: "Nova", color: "bg-muted text-muted-foreground" },
  em_analise: { label: "Em análise", color: "bg-blue-500/15 text-blue-400" },
  respondida: { label: "Respondida", color: "bg-green-500/15 text-green-400" },
  arquivada: { label: "Arquivada", color: "bg-zinc-500/15 text-zinc-400" },
};

export default function SugestoesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const [form, setForm] = useState({ category: "geral", title: "", content: "" });

  const fetchList = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("suggestions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setList((data as Suggestion[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchList(); }, [user?.id]);

  const fetchReplies = async (suggestionId: string) => {
    const { data } = await supabase
      .from("suggestion_replies")
      .select("*")
      .eq("suggestion_id", suggestionId)
      .order("created_at", { ascending: true });
    setReplies((prev) => ({ ...prev, [suggestionId]: (data as Reply[]) || [] }));
  };

  const handleOpen = (id: string) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (!replies[id]) fetchReplies(id);
  };

  const handleSubmit = async () => {
    if (!user) return;
    const title = form.title.trim();
    const content = form.content.trim();
    if (title.length < 4 || content.length < 10) {
      toast.error("Conte um pouco mais sobre sua ideia, rainha 💛");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("suggestions").insert({
      user_id: user.id,
      category: form.category,
      title: title.slice(0, 120),
      content: content.slice(0, 2000),
    });
    setSubmitting(false);
    if (error) { toast.error("Não conseguimos enviar. Tente novamente."); return; }
    toast.success("Sugestão enviada! A equipe vai analisar com carinho ✨");
    setForm({ category: "geral", title: "", content: "" });
    fetchList();
  };

  const handleReply = async (suggestionId: string) => {
    if (!user) return;
    const msg = replyDraft.trim();
    if (msg.length < 2) return;
    const { error } = await supabase.from("suggestion_replies").insert({
      suggestion_id: suggestionId,
      author_id: user.id,
      is_admin_reply: false,
      message: msg.slice(0, 1000),
    });
    if (error) { toast.error("Não conseguimos enviar a mensagem."); return; }
    setReplyDraft("");
    fetchReplies(suggestionId);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-gold" />
            Sugestões & Melhorias
          </h1>
          <p className="text-sm text-muted-foreground">Sua voz molda o Glow Up Club ✨</p>
        </div>
      </div>

      <Card className="border-gold/30 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base">Compartilhe sua ideia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <Input
            placeholder="Título da sua ideia"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 120) })}
            maxLength={120}
          />
          <Textarea
            placeholder="Conte com detalhes o que você gostaria de ver no app…"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value.slice(0, 2000) })}
            maxLength={2000}
            className="min-h-[120px]"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{form.content.length}/2000</span>
            <Button variant="gold" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar sugestão
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Suas sugestões
        </h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gold" /></div>
        ) : list.length === 0 ? (
          <Card className="border-dashed"><CardContent className="py-8 text-center text-muted-foreground text-sm">
            Você ainda não enviou nenhuma sugestão.
          </CardContent></Card>
        ) : (
          list.map((s) => {
            const status = STATUS_LABEL[s.status] || STATUS_LABEL.nova;
            const isOpen = openId === s.id;
            const sReplies = replies[s.id] || [];
            return (
              <Card key={s.id} className="border-border/60">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(s.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={status.color} variant="secondary">{status.label}</Badge>
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{s.content}</p>

                  <Button variant="ghost" size="sm" onClick={() => handleOpen(s.id)} className="h-8">
                    <MessageCircle className="h-4 w-4" />
                    {isOpen ? "Fechar conversa" : "Ver conversa"}
                  </Button>

                  {isOpen && (
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      {sReplies.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Nenhuma resposta ainda.</p>
                      ) : (
                        sReplies.map((r) => (
                          <div
                            key={r.id}
                            className={`p-3 rounded-md text-sm ${
                              r.is_admin_reply
                                ? "bg-gold/10 border border-gold/30"
                                : "bg-muted/50"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold">
                                {r.is_admin_reply ? "💎 Equipe Glow Up" : "Você"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap">{r.message}</p>
                          </div>
                        ))
                      )}
                      <div className="flex gap-2 pt-1">
                        <Input
                          value={openId === s.id ? replyDraft : ""}
                          onChange={(e) => setReplyDraft(e.target.value.slice(0, 1000))}
                          placeholder="Responder…"
                          onKeyDown={(e) => { if (e.key === "Enter") handleReply(s.id); }}
                        />
                        <Button size="icon" variant="gold" onClick={() => handleReply(s.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
