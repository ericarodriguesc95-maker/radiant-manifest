import { useEffect, useState, useCallback } from "react";
import { Check, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type Checkpoint = { key: string; label: string; emoji: string; points: number };

const CHECKPOINTS: Checkpoint[] = [
  { key: "post_do_dia", label: "Fazer um post por dia", emoji: "📸", points: 15 },
  { key: "tempo_estudo", label: "Tempo de estudo", emoji: "📚", points: 10 },
  { key: "nova_venda", label: "Nova venda", emoji: "💰", points: 5 },
  { key: "conexao_natureza", label: "Conexão com a natureza", emoji: "🌿", points: 10 },
  { key: "reduzir_redes", label: "Reduzir tempo de redes sociais", emoji: "📵", points: 15 },
  { key: "cafe_presenca", label: "Café da manhã com presença", emoji: "☕", points: 5 },
  { key: "desfrute_intencional", label: "Desfrute intencional", emoji: "🕯️", points: 8 },
  { key: "escrita_matinal", label: "Escrita matinal", emoji: "✍️", points: 5 },
  { key: "movimento_corpo", label: "Movimentar o corpo", emoji: "🧘‍♀️", points: 10 },
  { key: "leitura_biblica", label: "Leitura bíblica / devocional", emoji: "📖", points: 8 },
  { key: "gratidao_diaria", label: "Anotar 3 gratidões", emoji: "🙏", points: 5 },
  { key: "hidratacao", label: "Hidratação completa", emoji: "💧", points: 5 },
  { key: "ato_generosidade", label: "Ato de generosidade", emoji: "💛", points: 8 },
];

interface DailyCheckpointsProps {
  className?: string;
}

export default function DailyCheckpoints({ className }: DailyCheckpointsProps) {
  const { user } = useAuth();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);


  const today = new Date().toISOString().split("T")[0];

  const fetchDone = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_checkpoints" as any)
      .select("checkpoint_key")
      .eq("user_id", user.id)
      .eq("completion_date", today);
    setDone(new Set(((data as any[]) || []).map(d => d.checkpoint_key)));
    setLoading(false);
  }, [user, today]);

  useEffect(() => { fetchDone(); }, [fetchDone]);

  const toggle = async (cp: Checkpoint) => {
    if (!user) return;
    const isDone = done.has(cp.key);
    if (isDone) {
      await supabase
        .from("daily_checkpoints" as any)
        .delete()
        .eq("user_id", user.id)
        .eq("checkpoint_key", cp.key)
        .eq("completion_date", today);
      const next = new Set(done); next.delete(cp.key); setDone(next);
    } else {
      const { error } = await supabase.from("daily_checkpoints" as any).insert({
        user_id: user.id,
        checkpoint_key: cp.key,
        points: cp.points,
        completion_date: today,
      });
      if (error) return;
      // Log to activity_log so it feeds the "Top Clubbers" monthly ranking
      supabase.from("activity_log").insert({
        user_id: user.id,
        action: "checkpoint",
        details: `${cp.label} (+${cp.points} pts)`,
        page: "/",
      }).then(() => {});
      const next = new Set(done); next.add(cp.key); setDone(next);
      toast({ title: `+${cp.points} pontos ✨`, description: cp.label });
    }
  };

  const total = CHECKPOINTS.filter(c => done.has(c.key)).reduce((s, c) => s + c.points, 0);
  const max = CHECKPOINTS.reduce((s, c) => s + c.points, 0);
  const pct = Math.round((total / max) * 100);

  return (
    <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-display font-bold text-foreground">Check-points do dia</p>
            <p className="text-[11px] font-body text-muted-foreground">Pontos contam para o ranking do mês</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-display font-bold text-gold leading-none">{total}<span className="text-[10px] text-muted-foreground font-body">/{max}</span></p>
          <p className="text-[10px] text-muted-foreground font-body">pontos</p>
        </div>
      </div>

      <div className="bg-muted rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-gradient-gold rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-1 gap-1.5">
        {CHECKPOINTS.map(cp => {
          const isDone = done.has(cp.key);
          return (
            <button
              key={cp.key}
              onClick={() => toggle(cp)}
              disabled={loading}
              className={cn(
                "flex items-center gap-3 w-full p-2.5 rounded-xl border transition-all text-left",
                isDone
                  ? "bg-gold/10 border-gold/40"
                  : "bg-background/50 border-border hover:border-gold/30"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-base shrink-0 transition-all",
                isDone ? "bg-gradient-gold shadow-gold" : "bg-muted"
              )}>
                {isDone ? <Check className="h-4 w-4 text-primary-foreground" /> : <span>{cp.emoji}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-xs font-body font-semibold truncate",
                  isDone ? "text-foreground line-through decoration-gold/60" : "text-foreground"
                )}>
                  {cp.label}
                </p>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[11px] font-body font-bold shrink-0 px-2 py-0.5 rounded-full",
                isDone ? "text-gold bg-gold/10" : "text-muted-foreground bg-muted"
              )}>
                <Sparkles className="h-3 w-3" />
                +{cp.points}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
