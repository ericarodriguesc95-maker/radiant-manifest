import { useEffect, useState } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CachedMessage {
  message: string;
  title: string;
  date: string;
}

export default function FutureSelfMessage() {
  const { user } = useAuth();
  const [data, setData] = useState<CachedMessage | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const cacheKey = user ? `future-self:${user.id}:${today}` : null;

  const fetchMessage = async (force = false) => {
    if (!user || !cacheKey) return;
    if (!force) {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          return;
        } catch {
          /* ignore */
        }
      }
    }
    setLoading(true);
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      const { data: resp, error } = await supabase.functions.invoke("future-self-message", {
        body: { name: profile?.display_name || null, date: today },
      });
      if (error) throw error;
      if (resp?.message) {
        const payload: CachedMessage = {
          message: resp.message,
          title: resp.title || "Uma cena da sua vida daqui a 1 ano",
          date: today,
        };
        setData(payload);
        localStorage.setItem(cacheKey, JSON.stringify(payload));
      }
    } catch (err) {
      console.error("future-self fetch", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <div
      className={cn(
        "animate-stagger relative overflow-hidden rounded-3xl p-5 border border-gold/40 shadow-brand",
        "bg-gradient-to-br from-[#fff8e1] via-[#fdf3d0] to-[#f7e5b8]"
      )}
      style={{ "--stagger": 1 } as React.CSSProperties}
    >
      {/* Holographic sheen */}
      <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-screen bg-[conic-gradient(from_120deg_at_50%_50%,rgba(255,220,150,0.35),rgba(255,255,255,0),rgba(212,175,55,0.35),rgba(255,255,255,0),rgba(255,220,150,0.35))] animate-[spin_18s_linear_infinite]" />
      <div className="pointer-events-none absolute -inset-1 bg-[radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.35),transparent_55%)]" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gold/20 border border-gold/50 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-gold" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] font-body font-bold text-gold">
              Mensagem de você daqui a 1 ano
            </p>
            <p className="text-[10px] font-body text-foreground/60">Renova todos os dias</p>
          </div>
        </div>
        <button
          onClick={() => fetchMessage(true)}
          disabled={loading}
          aria-label="Gerar nova mensagem"
          className="h-8 w-8 rounded-full bg-white/60 border border-gold/40 flex items-center justify-center hover:bg-white transition disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-gold", loading && "animate-spin")} />
        </button>
      </div>

      <div className="relative z-10 mt-4 space-y-2">
        {loading && !data ? (
          <div className="space-y-2">
            <div className="h-3 w-2/3 bg-gold/20 rounded animate-pulse" />
            <div className="h-3 w-full bg-gold/20 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-gold/20 rounded animate-pulse" />
          </div>
        ) : data ? (
          <>
            <p className="text-sm font-display font-bold text-foreground italic">
              "{data.title}"
            </p>
            <p className="text-[13px] font-body leading-relaxed text-foreground/90">
              {data.message}
            </p>
            <p className="text-[10px] font-body text-foreground/60 pt-1">
              Com amor, você daqui a 1 ano 👑
            </p>
          </>
        ) : (
          <button
            onClick={() => fetchMessage(true)}
            className="text-xs font-body text-foreground/70 underline underline-offset-2"
          >
            Toque para receber sua mensagem de hoje
          </button>
        )}
      </div>
    </div>
  );
}
