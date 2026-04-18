import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Youtube, CheckCircle2, AlertCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { VIDEO_TRACKS } from "@/data/eliteJourneyData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type OverrideMap = Record<string, { youtube_id: string; youtube_url?: string | null }>;

// Extracts a YouTube video ID from any common URL format or returns the input if it already looks like an ID
function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Already an 11-char id
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    // youtu.be/<id>
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").split(/[?&]/)[0];
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
    // youtube.com/embed/<id> or shorts/<id>
    const embedMatch = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[2];
  } catch {
    // not a URL, fall through
  }
  return null;
}

export default function AdminBibliotecaElitePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<string>(VIDEO_TRACKS[0].id);
  const [search, setSearch] = useState("");

  // Check admin role
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  // Load overrides
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("elite_video_overrides" as any)
        .select("video_id, youtube_id, youtube_url");
      const map: OverrideMap = {};
      const draftMap: Record<string, string> = {};
      (data as any[])?.forEach((r) => {
        map[r.video_id] = { youtube_id: r.youtube_id, youtube_url: r.youtube_url };
        draftMap[r.video_id] = r.youtube_url || r.youtube_id;
      });
      setOverrides(map);
      setDrafts(draftMap);
    })();
  }, []);

  const saveOverride = async (trackId: string, videoId: string) => {
    if (!user) return;
    const raw = (drafts[videoId] || "").trim();
    if (!raw) {
      toast.error("Cole um link ou ID do YouTube");
      return;
    }
    const ytId = extractYouTubeId(raw);
    if (!ytId) {
      toast.error("Link inválido. Use um link do YouTube ou um ID de 11 caracteres.");
      return;
    }
    setSavingId(videoId);
    const { error } = await supabase
      .from("elite_video_overrides" as any)
      .upsert(
        {
          video_id: videoId,
          track_id: trackId,
          youtube_id: ytId,
          youtube_url: raw.startsWith("http") ? raw : null,
          updated_by: user.id,
        },
        { onConflict: "video_id" }
      );
    setSavingId(null);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    setOverrides({ ...overrides, [videoId]: { youtube_id: ytId, youtube_url: raw.startsWith("http") ? raw : null } });
    toast.success("Vídeo salvo! 👑");
  };

  const removeOverride = async (videoId: string) => {
    setSavingId(videoId);
    const { error } = await supabase
      .from("elite_video_overrides" as any)
      .delete()
      .eq("video_id", videoId);
    setSavingId(null);
    if (error) {
      toast.error("Erro ao remover: " + error.message);
      return;
    }
    const next = { ...overrides };
    delete next[videoId];
    setOverrides(next);
    setDrafts({ ...drafts, [videoId]: "" });
    toast.success("Override removido. Voltou para busca automática.");
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Carregando…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center space-y-3 max-w-sm">
          <AlertCircle className="h-10 w-10 text-gold mx-auto" />
          <h2 className="text-lg font-display font-bold text-foreground">Acesso restrito</h2>
          <p className="text-sm text-muted-foreground">Esta página é exclusiva para administradoras.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-3 px-5 py-2 rounded-xl bg-gold text-primary-foreground text-sm font-body font-semibold"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  const track = VIDEO_TRACKS.find((t) => t.id === activeTrack)!;
  const filteredVideos = track.videos.filter((v) =>
    !search ||
    v.title.toLowerCase().includes(search.toLowerCase()) ||
    v.mentor.toLowerCase().includes(search.toLowerCase())
  );

  const totalOverridden = Object.keys(overrides).length;
  const totalVideos = VIDEO_TRACKS.reduce((s, t) => s + t.videos.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-gold/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/jornada-elite")} className="p-2 -ml-2 rounded-xl hover:bg-muted/30 transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-body tracking-[0.3em] uppercase text-gold/70">Admin</p>
            <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              Biblioteca Elite <Youtube className="h-4 w-4 text-gold" />
            </h1>
          </div>
        </div>
      </header>

      <div className="px-5 py-6 pb-20 space-y-5 max-w-3xl mx-auto">
        {/* Stats */}
        <div className="rounded-2xl glass border border-gold/20 p-5 text-center">
          <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">Vídeos personalizados</p>
          <p className="text-3xl font-display font-bold text-foreground mt-1">
            {totalOverridden} <span className="text-base text-muted-foreground">/ {totalVideos}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Aulas sem link colado usam <span className="text-gold">busca automática no YouTube</span>.
          </p>
        </div>

        {/* Help */}
        <div className="rounded-2xl bg-gold/5 border border-gold/20 p-4 space-y-2">
          <p className="text-xs font-body font-semibold text-gold">💡 Como usar</p>
          <ul className="text-[11px] text-muted-foreground space-y-1 pl-4 list-disc">
            <li>Cole o link completo do YouTube (ex: <code className="text-gold">https://youtu.be/abc123XYZ_w</code>) ou apenas o ID de 11 caracteres.</li>
            <li>Funciona com youtube.com/watch, youtu.be, /embed/ e /shorts/.</li>
            <li>Toque em <span className="text-gold">Salvar</span> para fixar esse vídeo na aula. As usuárias verão exatamente esse vídeo.</li>
            <li>Toque em <span className="text-gold">Remover</span> para voltar à busca automática.</li>
          </ul>
        </div>

        {/* Track tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {VIDEO_TRACKS.map((t) => {
            const trackOverrides = t.videos.filter((v) => overrides[v.id]).length;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTrack(t.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-semibold transition-all border",
                  activeTrack === t.id
                    ? "bg-gold text-primary-foreground border-gold shadow-gold"
                    : "glass border-gold/15 text-muted-foreground hover:text-foreground hover:border-gold/30"
                )}
              >
                <span>{t.icon}</span> {t.name}
                <span className={cn(
                  "ml-1 text-[10px] px-1.5 rounded-full",
                  activeTrack === t.id ? "bg-primary-foreground/20" : "bg-gold/10 text-gold"
                )}>
                  {trackOverrides}/{t.videos.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar aula ou mentor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-gold/15 text-sm font-body text-foreground placeholder:text-muted-foreground/60 focus:border-gold/40 focus:outline-none"
            maxLength={100}
          />
        </div>

        {/* Videos list */}
        <div className="space-y-3">
          {filteredVideos.map((v) => {
            const ov = overrides[v.id];
            const draft = drafts[v.id] || "";
            const previewId = extractYouTubeId(draft) || ov?.youtube_id;
            const hasOverride = !!ov;
            return (
              <div
                key={v.id}
                className={cn(
                  "rounded-2xl glass border p-4 space-y-3 transition-all",
                  hasOverride ? "border-gold/40" : "border-gold/15"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                    {previewId ? (
                      <img
                        src={`https://i.ytimg.com/vi/${previewId}/mqdefault.jpg`}
                        alt={v.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60", track.color)} />
                    )}
                    <Youtube className="relative h-6 w-6 text-gold drop-shadow" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-semibold text-foreground line-clamp-2">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{v.mentor} · {v.duration}</p>
                    {hasOverride ? (
                      <p className="text-[10px] text-gold mt-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Vídeo personalizado fixado
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground/70 mt-1 italic">Usando busca automática</p>
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDrafts({ ...drafts, [v.id]: e.target.value })}
                  placeholder="Cole link do YouTube ou ID (ex: https://youtu.be/abc123XYZ_w)"
                  className="w-full px-3 py-2 rounded-lg bg-muted/20 border border-gold/15 text-xs font-body text-foreground placeholder:text-muted-foreground/50 focus:border-gold/40 focus:outline-none"
                  maxLength={500}
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => saveOverride(track.id, v.id)}
                    disabled={savingId === v.id || !draft.trim()}
                    className="py-2 rounded-lg text-[11px] font-body font-semibold bg-gold text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingId === v.id ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => removeOverride(v.id)}
                    disabled={savingId === v.id || !hasOverride}
                    className="py-2 rounded-lg text-[11px] font-body font-semibold bg-muted/20 border border-gold/15 text-muted-foreground hover:text-destructive hover:border-destructive/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remover
                  </button>
                </div>
              </div>
            );
          })}
          {filteredVideos.length === 0 && (
            <p className="text-center text-xs text-muted-foreground py-8">Nenhuma aula encontrada</p>
          )}
        </div>
      </div>
    </div>
  );
}
