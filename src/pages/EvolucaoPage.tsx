import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2,
  LineChart as LineIcon,
  BarChart3,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Letter = "A" | "B" | "C";
const LETTER_TO_SCORE: Record<Letter, number> = { A: 3, B: 6, C: 10 };
const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const DIMENSIONS = [
  { key: "mentalidade", label: "Mentalidade", color: "#9A84A8" },
  { key: "rotina", label: "Rotina e Hábitos", color: "#C9913A" },
  { key: "energia", label: "Energia e Saúde", color: "#8CA068" },
] as const;

interface CheckinRow {
  month_start: string;
  answer_1: Letter;
  answer_2: Letter;
  answer_3: Letter;
}

interface ChartPoint {
  monthKey: string;
  label: string;
  mentalidade: number | null;
  rotina: number | null;
  energia: number | null;
}

interface ToolUsage {
  name: string;
  count: number;
}

const PERIODS = [
  { key: "3", label: "3 meses", months: 3 },
  { key: "6", label: "6 meses", months: 6 },
  { key: "12", label: "12 meses", months: 12 },
] as const;

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function firstOfCurrentMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default function EvolucaoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<CheckinRow[]>([]);
  const [usage, setUsage] = useState<ToolUsage[]>([]);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("6");

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const monthsBack = new Date();
      monthsBack.setMonth(monthsBack.getMonth() - 11);
      monthsBack.setDate(1);

      const [{ data: checkins }, { data: activity }] = await Promise.all([
        supabase
          .from("monthly_routine_checkins" as any)
          .select("month_start, answer_1, answer_2, answer_3")
          .eq("user_id", user.id)
          .gte("month_start", monthsBack.toISOString().slice(0, 10))
          .order("month_start", { ascending: true }),
        supabase
          .from("activity_log")
          .select("details, page, created_at")
          .eq("user_id", user.id)
          .eq("action", "page_view")
          .gte("created_at", firstOfCurrentMonth().toISOString()),
      ]);

      setRows(((checkins ?? []) as unknown as CheckinRow[]) ?? []);

      const counts = new Map<string, number>();
      (activity ?? []).forEach((r: any) => {
        const name = (r.details as string) || (r.page as string) || "Outros";
        if (!name || name === "Home") return;
        counts.set(name, (counts.get(name) ?? 0) + 1);
      });
      const list = Array.from(counts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      setUsage(list);
      setLoading(false);
    })();
  }, [user]);

  const chartData: ChartPoint[] = useMemo(() => {
    const months = PERIODS.find((p) => p.key === period)!.months;
    const byKey = new Map<string, CheckinRow>();
    rows.forEach((r) => {
      const d = new Date(r.month_start);
      byKey.set(monthKey(d), r);
    });
    const points: ChartPoint[] = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = monthKey(d);
      const row = byKey.get(key);
      points.push({
        monthKey: key,
        label: MONTHS_PT[d.getMonth()],
        mentalidade: row ? LETTER_TO_SCORE[row.answer_1] : null,
        rotina: row ? LETTER_TO_SCORE[row.answer_2] : null,
        energia: row ? LETTER_TO_SCORE[row.answer_3] : null,
      });
    }
    return points;
  }, [rows, period]);

  const currentScores = useMemo(() => {
    const currentKey = monthKey(new Date());
    const current = chartData.find((p) => p.monthKey === currentKey);
    return {
      mentalidade: current?.mentalidade ?? 0,
      rotina: current?.rotina ?? 0,
      energia: current?.energia ?? 0,
    };
  }, [chartData]);

  const maxUsage = Math.max(1, ...usage.map((u) => u.count));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  const hasCheckins = rows.length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-2 space-y-6">
      <header className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/10 border border-gold/30 px-3 py-1">
          <LineIcon className="h-3.5 w-3.5 text-gold" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-body font-semibold text-gold">
            Minha Evolução
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Como você tem evoluído
        </h1>
        <p className="text-xs font-body text-muted-foreground max-w-md mx-auto">
          Acompanhe suas 3 dimensões mês a mês e veja quais ferramentas mais usou este mês.
        </p>
      </header>

      {/* Period pills */}
      <div className="flex justify-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all border",
              period === p.key
                ? "bg-gold text-background border-gold shadow-brand"
                : "bg-background text-foreground/70 border-border hover:border-gold/50"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Evolution chart */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
            Evolução das dimensões
          </h2>
        </div>

        {!hasCheckins ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm font-body text-muted-foreground">
              Ainda não temos dados suficientes. Responda o Termômetro deste mês para começar sua linha do tempo.
            </p>
            <button
              type="button"
              onClick={() => navigate("/meu-mes")}
              className="h-10 px-5 rounded-xl bg-gold text-background font-display font-bold text-xs shadow-brand hover:brightness-105 active:scale-[0.98] transition"
            >
              Responder Termômetro
            </button>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  {DIMENSIONS.map((d) => (
                    <linearGradient key={d.key} id={`grad-${d.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={d.color} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={d.color} stopOpacity={0.02} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} ticks={[0, 3, 6, 10]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number | null) => (v === null ? "sem registro" : v)}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" />
                {DIMENSIONS.map((d) => (
                  <Area
                    key={d.key}
                    type="monotone"
                    dataKey={d.key}
                    name={d.label}
                    stroke={d.color}
                    strokeWidth={2.5}
                    fill={`url(#grad-${d.key})`}
                    connectNulls
                    dot={{ r: 3, fill: d.color, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Current dimension bars */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-4">
        <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
          Sua pontuação este mês
        </h2>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => {
            const value = currentScores[d.key as keyof typeof currentScores];
            const pct = Math.round((value / 10) * 100);
            return (
              <div key={d.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-body">
                  <span className="font-semibold text-foreground/85 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                    {d.label}
                  </span>
                  <span className="text-muted-foreground font-semibold">
                    {value > 0 ? `${pct}%` : "sem registro"}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tools usage */}
      <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-gold" />
          <h2 className="text-sm font-display font-bold text-foreground uppercase tracking-wider">
            Ferramentas mais usadas este mês
          </h2>
        </div>
        {usage.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground text-center py-6">
            Ainda não há dados de uso neste mês. Continue navegando pelo app e volte aqui.
          </p>
        ) : (
          <>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usage} margin={{ top: 8, right: 8, left: -20, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v} acessos`, "Sessões"]}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {usage.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#C9913A" : "#E8C97A"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="space-y-1.5">
              {usage.map((u, i) => (
                <li key={u.name} className="flex items-center gap-3 text-xs font-body">
                  <span className="w-5 text-muted-foreground font-semibold">{i + 1}.</span>
                  <span className="flex-1 truncate text-foreground/85">{u.name}</span>
                  <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gold rounded-full"
                      style={{ width: `${(u.count / maxUsage) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground font-semibold">{u.count}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => navigate("/perfil-do-mes")}
        className="w-full h-11 rounded-xl border border-border bg-background text-foreground font-body font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o Perfil do Mês
      </button>
    </div>
  );
}
