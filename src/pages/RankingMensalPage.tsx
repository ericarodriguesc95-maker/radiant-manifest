import { useEffect, useState } from "react";
import { Crown, Users, Calendar, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface RankingRow {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  posts_count: number;
  comments_count: number;
  likes_received: number;
  likes_given: number;
}

const monthLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { month: "long" });

const RankingMensalPage = () => {
  const [rows, setRows] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  useEffect(() => {
    const load = async () => {
      const iso = monthStart.toISOString().slice(0, 10);
      const { data, error } = await (supabase as any).rpc("get_monthly_ranking", {
        _month_start: iso,
      });
      if (!error && data) setRows(data as RankingRow[]);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    const tick = () => {
      const end = new Date(monthEnd.getFullYear(), monthEnd.getMonth(), monthEnd.getDate(), 23, 59, 59);
      const diff = end.getTime() - Date.now();
      if (diff <= 0) return setCountdown("Encerrada");
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const totalPoints = rows.reduce((s, r) => s + Number(r.points), 0);
  const podium = rows.slice(0, 3);
  const rest = rows.slice(3, 20);

  const initials = (name?: string | null) =>
    (name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-gold/20">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/15 via-amber-900/10 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,hsl(var(--gold)/0.15),transparent_60%)]" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-8 bg-gold/60" />
                <span className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/80 font-semibold">
                  Ranking mensal · {monthLabel(now)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
                Top <span className="italic text-gold">clubbers</span><br />
                de {monthLabel(now)}.
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-5 text-xs font-body">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-gold/20">
                  <Users className="h-3.5 w-3.5 text-gold" />
                  <strong className="text-foreground">{rows.length}</strong>
                  <span className="text-muted-foreground">participantes</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-gold/20">
                  <Calendar className="h-3.5 w-3.5 text-gold" />
                  <span className="text-muted-foreground">
                    {monthStart.toLocaleDateString("pt-BR", { day: "numeric" })} a {monthEnd.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-gold/20">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                  <strong className="text-foreground">{totalPoints.toLocaleString("pt-BR")}</strong>
                  <span className="text-muted-foreground">pontos distribuídos</span>
                </span>
              </div>
            </div>
            <div className="glass rounded-2xl p-5 border border-gold/20 min-w-[240px]">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-body tracking-[0.2em] uppercase text-emerald-400/90">Edição encerra em</span>
              </div>
              <div className="font-display text-2xl text-foreground tracking-tight">{countdown}</div>
            </div>
          </div>
        </div>

        {/* PODIUM */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-body text-sm">Carregando ranking…</div>
        ) : podium.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground font-body text-sm">
            Ainda não há pontuação registrada neste mês. Crie um post, comente ou curta para começar!
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:gap-6 items-end">
            {/* 2nd */}
            <PodiumCard rank={2} row={podium[1]} initials={initials} heightClass="pt-10" />
            {/* 1st */}
            <PodiumCard rank={1} row={podium[0]} initials={initials} heightClass="pt-4" highlighted />
            {/* 3rd */}
            <PodiumCard rank={3} row={podium[2]} initials={initials} heightClass="pt-12" />
          </div>
        )}

        {/* REST */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass rounded-2xl border border-gold/15 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-display font-bold text-foreground">
                Outras <span className="italic text-gold">clubbers</span> destaque
              </h2>
              <span className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">
                Posições 4 — {Math.min(rest.length + 3, 20)}
              </span>
            </div>
            {rest.length === 0 ? (
              <p className="text-sm font-body text-muted-foreground text-center py-8">Nenhuma posição extra ainda.</p>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-[40px_1fr_auto] gap-3 px-2 py-2 text-[10px] font-body uppercase tracking-wider text-muted-foreground border-b border-gold/10">
                  <span>#</span><span>Membra</span><span>Pontos</span>
                </div>
                {rest.map((r, i) => (
                  <div key={r.user_id} className="grid grid-cols-[40px_1fr_auto] gap-3 items-center px-2 py-3 rounded-xl hover:bg-gold/5 transition-colors">
                    <span className="text-2xl font-display text-gold/40 tabular-nums">{String(i + 4).padStart(2, "0")}</span>
                    <div className="flex items-center gap-3 min-w-0">
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt={r.display_name || ""} className="h-9 w-9 rounded-full object-cover border border-gold/30" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-xs font-display text-gold">
                          {initials(r.display_name)}
                        </div>
                      )}
                      <span className="font-body text-sm text-foreground truncate">{r.display_name || "Anônima"}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg text-foreground tabular-nums">{Number(r.points).toLocaleString("pt-BR")}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="glass rounded-2xl border border-gold/15 p-6 self-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <h3 className="font-display font-bold text-foreground">
                Como você <span className="italic text-gold">soma</span> pontos
              </h3>
            </div>
            <p className="text-xs font-body text-muted-foreground mb-4 leading-relaxed">
              Cada interação no clubinho conta. Quanto mais você participa, mais alto chega.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Rule pts="+10" label="Criar post" />
              <Rule pts="+5" label="Comentar" />
              <Rule pts="+2" label="Receber curtida" />
              <Rule pts="+2" label="Dar curtida" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const PodiumCard = ({
  rank, row, initials, heightClass, highlighted,
}: {
  rank: 1 | 2 | 3;
  row?: RankingRow;
  initials: (n?: string | null) => string;
  heightClass: string;
  highlighted?: boolean;
}) => {
  if (!row) return <div className={cn(heightClass)} />;
  const labels = { 1: "Primeiro Lugar", 2: "Segundo Lugar", 3: "Terceiro Lugar" } as const;
  return (
    <div className={cn("flex flex-col items-center text-center", heightClass)}>
      <span className={cn(
        "text-[9px] md:text-[10px] font-body tracking-[0.3em] uppercase mb-2",
        rank === 1 ? "text-gold" : "text-muted-foreground"
      )}>
        {labels[rank]}
      </span>
      <div className={cn(
        "relative rounded-full p-1 transition-transform hover:scale-105",
        highlighted ? "ring-4 ring-gold/60 shadow-glow" : "ring-2 ring-gold/30"
      )}>
        {row.avatar_url ? (
          <img src={row.avatar_url} alt={row.display_name || ""} className={cn("rounded-full object-cover", highlighted ? "h-24 w-24 md:h-32 md:w-32" : "h-20 w-20 md:h-24 md:w-24")} />
        ) : (
          <div className={cn(
            "rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-display text-gold",
            highlighted ? "h-24 w-24 md:h-32 md:w-32 text-3xl" : "h-20 w-20 md:h-24 md:w-24 text-2xl"
          )}>
            {initials(row.display_name)}
          </div>
        )}
        {highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Crown className="h-6 w-6 text-gold fill-gold/40" />
          </div>
        )}
      </div>
      <div className="mt-3 font-display font-bold text-foreground text-sm md:text-base truncate max-w-full px-2">
        {row.display_name || "Anônima"}
      </div>
      <div className={cn(
        "mt-3 rounded-xl px-4 py-2 border",
        highlighted ? "bg-gold/10 border-gold/40" : "border-gold/15"
      )}>
        <div className="font-display text-xl md:text-2xl text-foreground tabular-nums">
          {Number(row.points).toLocaleString("pt-BR")}
        </div>
        <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">pontos</div>
      </div>
    </div>
  );
};

const Rule = ({ pts, label }: { pts: string; label: string }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gold/15 bg-gold/5">
    <span className="text-xs font-display font-bold text-gold tabular-nums">{pts}</span>
    <span className="text-xs font-body text-foreground/80">{label}</span>
  </div>
);

export default RankingMensalPage;
