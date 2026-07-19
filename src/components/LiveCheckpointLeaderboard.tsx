import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trophy, Flame, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  tasks_done: number;
};

interface Props {
  className?: string;
  limit?: number;
}

export default function LiveCheckpointLeaderboard({ className, limit = 20 }: Props) {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.rpc("get_daily_checkpoint_leaderboard" as any);
    setRows(((data as any[]) || []).slice(0, limit));
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("live-checkpoints-lb")
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_checkpoints" }, () => {
        load();
      })
      .subscribe();
    const interval = window.setInterval(load, 60_000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [load]);

  const myIndex = rows.findIndex(r => r.user_id === user?.id);
  const maxPts = rows[0]?.points || 1;

  return (
    <div className={cn("bg-card rounded-2xl border border-border p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <Flame className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">Ranking ao vivo de hoje</p>
            <p className="text-[11px] font-body text-muted-foreground">Todas as extraordinárias somando pontos agora</p>
          </div>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-70"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-6">Carregando...</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          Seja a primeira a pontuar hoje 👑
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {rows.map((r, i) => {
            const isMe = r.user_id === user?.id;
            const pct = Math.round((r.points / maxPts) * 100);
            return (
              <div
                key={r.user_id}
                className={cn(
                  "relative rounded-xl border p-2.5 overflow-hidden",
                  isMe ? "border-gold bg-gold/10" : "border-border bg-muted/30"
                )}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-gold/20"
                  style={{ width: `${pct}%`, opacity: isMe ? 0.35 : 0.15 }}
                />
                <div className="relative flex items-center gap-3">
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    i === 0 ? "bg-gradient-gold text-primary-foreground" :
                    i === 1 ? "bg-muted-foreground/20 text-foreground" :
                    i === 2 ? "bg-amber-700/30 text-foreground" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {i === 0 ? <Crown className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                      {(r.display_name || "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isMe && "text-gold")}>
                      {r.display_name || "Extraordinária"} {isMe && "(você)"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.tasks_done} tarefa{r.tasks_done !== 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-display font-bold text-gold leading-none">{r.points}</p>
                    <p className="text-[9px] text-muted-foreground uppercase">pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myIndex >= limit && user && (
        <p className="text-[11px] text-center text-muted-foreground">
          Você está fora do top {limit}. Continue pontuando 🔥
        </p>
      )}
    </div>
  );
}
