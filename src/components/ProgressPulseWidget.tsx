import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Target, Wallet, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Pulse {
  metasPct: number;
  metasCount: number;
  saudePct: number; // % of renda livre (saldo positivo / renda)
  saldoPositivo: boolean;
  hasFinance: boolean;
}

export default function ProgressPulseWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pulse, setPulse] = useState<Pulse | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const now = new Date();
      const [goalsRes, finRes] = await Promise.all([
        supabase.from("goals").select("progress").eq("user_id", user.id),
        supabase
          .from("finance_entries")
          .select("type, amount")
          .eq("user_id", user.id)
          .eq("year", now.getFullYear())
          .eq("month", now.getMonth()),
      ]);

      const goals = (goalsRes.data || []) as { progress: number }[];
      const metasPct = goals.length
        ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length)
        : 0;

      const fin = (finRes.data || []) as { type: string; amount: number }[];
      const renda = fin.filter(e => e.type === "renda").reduce((s, e) => s + Number(e.amount), 0);
      const gastos = fin
        .filter(e => ["fixa", "variavel", "cartao"].includes(e.type))
        .reduce((s, e) => s + Number(e.amount), 0);
      const saldo = renda - gastos;
      const saudePct = renda > 0 ? Math.max(0, Math.min(100, Math.round((saldo / renda) * 100))) : 0;

      setPulse({
        metasPct,
        metasCount: goals.length,
        saudePct,
        saldoPositivo: saldo >= 0,
        hasFinance: fin.length > 0,
      });
    })();
  }, [user]);

  if (!pulse) return null;
  if (pulse.metasCount === 0 && !pulse.hasFinance) return null;

  return (
    <div className="rounded-2xl border border-gold/15 glass p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-body uppercase tracking-[0.25em] text-gold/70 font-semibold">
          Seu pulso desta semana
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
      </div>

      {pulse.metasCount > 0 && (
        <button
          onClick={() => navigate("/metas")}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-3 mb-1.5">
            <Target className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-body text-foreground/80 flex-1">Metas em andamento</span>
            <span className="text-xs font-display font-bold text-gold">{pulse.metasPct}%</span>
            <ChevronRight className="h-3.5 w-3.5 text-gold/50 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold/80 to-gold rounded-full transition-all duration-700"
              style={{ width: `${pulse.metasPct}%` }}
            />
          </div>
          <p className="text-[10px] font-body text-muted-foreground mt-1">
            {pulse.metasCount} {pulse.metasCount === 1 ? "meta ativa" : "metas ativas"}
          </p>
        </button>
      )}

      {pulse.hasFinance && (
        <button
          onClick={() => navigate("/financas")}
          className="w-full text-left group"
        >
          <div className="flex items-center gap-3 mb-1.5">
            <Wallet className="h-3.5 w-3.5 text-gold" />
            <span className="text-xs font-body text-foreground/80 flex-1">Saúde financeira do mês</span>
            <span className={cn(
              "text-xs font-display font-bold",
              pulse.saldoPositivo ? "text-gold" : "text-amber-300/90"
            )}>
              {pulse.saudePct}%
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-gold/50 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="h-2 rounded-full bg-foreground/5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700",
                pulse.saldoPositivo
                  ? "bg-gradient-to-r from-gold/80 to-gold"
                  : "bg-gradient-to-r from-amber-700/60 to-amber-400/80"
              )}
              style={{ width: `${pulse.saudePct}%` }}
            />
          </div>
          <p className="text-[10px] font-body text-muted-foreground mt-1">
            {pulse.saldoPositivo
              ? "Renda livre após gastos"
              : "Ajuste de rota em curso"}
          </p>
        </button>
      )}
    </div>
  );
}
