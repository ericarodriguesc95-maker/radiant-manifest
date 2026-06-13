import { useEffect, useState } from "react";
import { Smile, Heart, MessageCircle, UserPlus, RefreshCw, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Intro {
  id: string;
  user_id: string;
  text: string;
  objetivos: string | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profile?: { display_name: string | null; avatar_url: string | null };
}

const ApresentacoesPage = () => {
  const { user } = useAuth();
  const [intros, setIntros] = useState<Intro[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"recentes" | "populares">("recentes");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("community_posts")
      .select("id,user_id,text,objetivos,created_at,likes_count,comments_count")
      .eq("kind", "introduction")
      .order(tab === "populares" ? "likes_count" : "created_at", { ascending: false })
      .limit(50);
    const list = (data as any[]) || [];
    if (list.length) {
      const ids = [...new Set(list.map(i => i.user_id))];
      const { data: profs } = await (supabase as any).rpc("get_public_profiles");
      const map = new Map<string, any>();
      (profs as any[] || []).forEach(p => map.set(p.user_id, p));
      list.forEach((i: any) => (i.profile = map.get(i.user_id)));
    }
    setIntros(list as Intro[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [tab]);

  const fmt = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const initials = (n?: string | null) => (n || "?").split(" ").map(x => x[0]).slice(0, 2).join("").toUpperCase();

  const handleFollow = async (targetId: string) => {
    if (!user) return;
    const { error } = await (supabase as any).from("user_follows").insert({ follower_id: user.id, following_id: targetId });
    if (error) toast.error("Já está seguindo ou erro ao conectar.");
    else toast.success("Conectada! 💜");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/40 via-fuchsia-400/30 to-purple-500/40" />
        <div className="absolute top-6 left-6 opacity-30"><Smile className="h-10 w-10 text-white" /></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-14 text-center">
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white">Apresentações da comunidade</h1>
          <p className="mt-3 text-sm md:text-base font-body text-white/80 max-w-2xl mx-auto">
            Conheça outras membras, compartilhe seus objetivos e mostre pro clube que você chegou pra ficar!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 inline-flex items-center gap-2 bg-white text-purple-700 font-display font-semibold px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            <Plus className="h-4 w-4" /> Faça sua apresentação
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            Apresentações {tab === "recentes" ? "recentes" : "populares"}
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full glass border border-gold/20 p-1">
              {(["recentes", "populares"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn("px-4 py-1.5 text-xs font-body rounded-full transition-all capitalize",
                    tab === t ? "bg-gold text-background font-semibold" : "text-muted-foreground hover:text-foreground")}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded-full border border-gold/20 hover:bg-gold/10 transition-colors">
              <RefreshCw className="h-3 w-3" /> Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-body text-sm">Carregando…</div>
        ) : intros.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-gold/15">
            <p className="font-body text-muted-foreground">Nenhuma apresentação ainda. Seja a primeira! ✨</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {intros.map(i => (
              <article key={i.id} className="glass rounded-2xl border border-gold/15 p-5 hover:border-gold/30 transition-colors">
                <header className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {i.profile?.avatar_url ? (
                      <img src={i.profile.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover border border-gold/30" />
                    ) : (
                      <div className="h-11 w-11 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-xs font-display text-gold">
                        {initials(i.profile?.display_name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-display font-bold text-foreground truncate">{i.profile?.display_name || "Anônima"}</div>
                      <div className="text-[11px] font-body text-muted-foreground">{fmt(i.created_at)}</div>
                    </div>
                  </div>
                  {user && user.id !== i.user_id && (
                    <button onClick={() => handleFollow(i.user_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-body rounded-full border border-gold/30 hover:bg-gold/10 transition-colors">
                      <UserPlus className="h-3.5 w-3.5" /> Conectar
                    </button>
                  )}
                </header>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-display font-semibold text-foreground text-sm mb-1">Sobre mim:</h4>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">{i.text}</p>
                  </div>
                  {i.objetivos && (
                    <div className="pt-3 border-t border-gold/10">
                      <h4 className="font-display font-semibold text-foreground text-sm mb-1">Meus objetivos no clube:</h4>
                      <p className="text-sm font-body text-muted-foreground leading-relaxed whitespace-pre-wrap">{i.objetivos}</p>
                    </div>
                  )}
                </div>

                <footer className="flex items-center gap-4 mt-4 pt-3 border-t border-gold/10 text-xs font-body text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {i.likes_count}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {i.comments_count}</span>
                </footer>
              </article>
            ))}
          </div>
        )}
      </div>

      {showModal && <IntroModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />}
    </div>
  );
};

const IntroModal = ({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) => {
  const { user } = useAuth();
  const [sobre, setSobre] = useState("");
  const [obj, setObj] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!user) return;
    if (!sobre.trim()) { toast.error("Conte algo sobre você."); return; }
    setSaving(true);
    const { error } = await (supabase as any).from("community_posts").insert({
      user_id: user.id, text: sobre.trim(), objetivos: obj.trim() || null, kind: "introduction",
    });
    setSaving(false);
    if (error) toast.error("Erro ao publicar.");
    else { toast.success("Apresentação publicada! 💜"); onSaved(); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-gold/20 rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold text-foreground">Faça sua apresentação</h3>
            <p className="text-xs font-body text-muted-foreground mt-1">Compartilhe um pouco sobre você e o que espera viver no clube.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted"><X className="h-5 w-5" /></button>
        </div>

        <label className="block mt-4">
          <span className="text-sm font-display font-semibold text-foreground">Sobre mim</span>
          <textarea value={sobre} onChange={e => setSobre(e.target.value.slice(0, 1000))} rows={4}
            placeholder="Conte um pouco sobre você, seus interesses, profissão, hobbies…"
            className="mt-1 w-full rounded-xl bg-background border border-gold/20 p-3 text-sm font-body focus:border-gold focus:outline-none resize-none" />
          <div className="text-[10px] text-right text-muted-foreground">{sobre.length}/1000</div>
        </label>

        <label className="block mt-3">
          <span className="text-sm font-display font-semibold text-foreground">Meus objetivos no clube</span>
          <textarea value={obj} onChange={e => setObj(e.target.value.slice(0, 1000))} rows={4}
            placeholder="O que você quer alcançar por aqui? Sonhos, metas pessoais, espirituais, profissionais, hábitos…"
            className="mt-1 w-full rounded-xl bg-background border border-gold/20 p-3 text-sm font-body focus:border-gold focus:outline-none resize-none" />
          <div className="text-[10px] text-right text-muted-foreground">{obj.length}/1000</div>
        </label>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-body rounded-full border border-gold/20 hover:bg-muted">Cancelar</button>
          <button onClick={submit} disabled={saving} className="px-5 py-2 text-sm font-display font-semibold rounded-full bg-gold text-background hover:opacity-90 disabled:opacity-50">
            {saving ? "Publicando…" : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApresentacoesPage;
