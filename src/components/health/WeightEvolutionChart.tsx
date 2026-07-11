import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WeightRecord = { weight: number | string; recorded_at: string };
type Range = "weekly" | "monthly";

interface Props {
  records: WeightRecord[];
  targetWeight?: number | null;
}

const toNum = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);

// ISO week key: YYYY-Www
function isoWeekKey(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+date - +yearStart) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function weekRangeLabel(d: Date) {
  // Monday-based week
  const day = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (x: Date) =>
    x.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  return `${fmt(monday)}-${fmt(sunday)}`;
}

const monthLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(".", "");

export default function WeightEvolutionChart({ records, targetWeight }: Props) {
  const [range, setRange] = useState<Range>("weekly");

  const data = useMemo(() => {
    if (!records.length) return [];
    const sorted = [...records]
      .map((r) => ({ weight: toNum(r.weight), date: new Date(r.recorded_at) }))
      .filter((r) => !isNaN(r.date.getTime()))
      .sort((a, b) => +a.date - +b.date);

    const buckets = new Map<string, { sum: number; count: number; label: string; ts: number }>();
    for (const r of sorted) {
      const key =
        range === "weekly"
          ? isoWeekKey(r.date)
          : `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
      const label = range === "weekly" ? weekRangeLabel(r.date) : monthLabel(r.date);
      const existing = buckets.get(key);
      if (existing) {
        existing.sum += r.weight;
        existing.count += 1;
      } else {
        buckets.set(key, { sum: r.weight, count: 1, label, ts: +r.date });
      }
    }
    return Array.from(buckets.values())
      .sort((a, b) => a.ts - b.ts)
      .map((b) => ({ label: b.label, peso: +(b.sum / b.count).toFixed(2) }));
  }, [records, range]);

  const first = data[0]?.peso;
  const last = data[data.length - 1]?.peso;
  const delta = first != null && last != null ? +(last - first).toFixed(2) : 0;

  return (
    <Card className="glass border-gold/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base flex items-center gap-2 text-gold">
            <TrendingUp className="h-4 w-4" /> Evolução do Peso
          </CardTitle>
          <div className="inline-flex rounded-full border border-gold/30 bg-background/40 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setRange("weekly")}
              className={`px-3 py-1 rounded-full transition-colors ${
                range === "weekly"
                  ? "bg-gold text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => setRange("monthly")}
              className={`px-3 py-1 rounded-full transition-colors ${
                range === "monthly"
                  ? "bg-gold text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Mensal
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.length < 2 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            Registre pelo menos 2 pesagens para visualizar a evolução {range === "weekly" ? "semanal" : "mensal"}.
          </p>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-foreground">{last?.toFixed(2)}Kg</span>
              <span
                className={`text-xs font-semibold ${
                  delta < 0 ? "text-emerald-500" : delta > 0 ? "text-amber-500" : "text-muted-foreground"
                }`}
              >
                {delta > 0 ? "+" : ""}
                {delta.toFixed(2)}Kg no período
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["dataMin - 1", "dataMax + 1"]}
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #D4AF37",
                      background: "hsl(var(--card))",
                    }}
                    labelStyle={{ color: "#D4AF37" }}
                    formatter={(v: number) => [`${Number(v).toFixed(2)} Kg`, "Peso"]}
                  />
                  {targetWeight && (
                    <ReferenceLine
                      y={targetWeight}
                      stroke="#D4AF37"
                      strokeDasharray="4 4"
                      label={{ value: "Meta", fontSize: 10, fill: "#D4AF37", position: "right" }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="peso"
                    stroke="#D4AF37"
                    strokeWidth={2.5}
                    fill="url(#weightGold)"
                    dot={{ r: 3, fill: "#D4AF37", stroke: "#D4AF37" }}
                    activeDot={{ r: 5, fill: "#F4D77A", stroke: "#D4AF37" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
