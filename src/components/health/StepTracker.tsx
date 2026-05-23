import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Footprints, Plus, Minus, Play, Pause, Target, Flame, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const STORAGE_KEY = "saude:steps:v1";
const GOAL_KEY = "saude:steps:goal:v1";
const STRIDE_KEY = "saude:steps:stride:v1"; // cm

type StepHistory = Record<string, number>; // yyyy-MM-dd -> steps

function loadHistory(): StepHistory {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function saveHistory(h: StepHistory) { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)); }

export default function StepTracker() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [history, setHistory] = useState<StepHistory>(loadHistory);
  const [goal, setGoal] = useState<number>(() => Number(localStorage.getItem(GOAL_KEY)) || 8000);
  const [stride, setStride] = useState<number>(() => Number(localStorage.getItem(STRIDE_KEY)) || 70);
  const [manual, setManual] = useState("");

  // Live counter (accelerometer)
  const [counting, setCounting] = useState(false);
  const [sessionSteps, setSessionSteps] = useState(0);
  const lastPeakRef = useRef(0);
  const lastValRef = useRef(1);
  const aboveRef = useRef(false);

  const todaySteps = history[today] || 0;
  const progress = Math.min(100, Math.round((todaySteps / goal) * 100));
  const km = ((todaySteps * stride) / 100000).toFixed(2);
  const kcal = Math.round(todaySteps * 0.04);

  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { localStorage.setItem(GOAL_KEY, String(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem(STRIDE_KEY, String(stride)); }, [stride]);

  const setToday = (n: number) => {
    setHistory((h) => ({ ...h, [today]: Math.max(0, Math.round(n)) }));
  };
  const addToday = (n: number) => setToday(todaySteps + n);

  // Accelerometer step detection (peak-based on magnitude)
  useEffect(() => {
    if (!counting) return;
    let handler: (e: DeviceMotionEvent) => void;
    const start = async () => {
      try {
        const anyDM: any = (window as any).DeviceMotionEvent;
        if (anyDM && typeof anyDM.requestPermission === "function") {
          const perm = await anyDM.requestPermission();
          if (perm !== "granted") {
            toast.error("Permissão negada para sensores");
            setCounting(false);
            return;
          }
        }
        handler = (e: DeviceMotionEvent) => {
          const a = e.accelerationIncludingGravity || e.acceleration;
          if (!a || a.x == null || a.y == null || a.z == null) return;
          const mag = Math.sqrt(a.x ** 2 + a.y ** 2 + a.z ** 2);
          const now = Date.now();
          const threshold = 11.5;
          const reset = 9.5;
          if (!aboveRef.current && mag > threshold && now - lastPeakRef.current > 300) {
            aboveRef.current = true;
            lastPeakRef.current = now;
            setSessionSteps((s) => s + 1);
            setHistory((h) => ({ ...h, [today]: (h[today] || 0) + 1 }));
          } else if (aboveRef.current && mag < reset) {
            aboveRef.current = false;
          }
          lastValRef.current = mag;
        };
        window.addEventListener("devicemotion", handler);
        toast.success("Contando passos…");
      } catch {
        toast.error("Sensor indisponível neste dispositivo");
        setCounting(false);
      }
    };
    start();
    return () => { if (handler) window.removeEventListener("devicemotion", handler); };
  }, [counting, today]);

  const chartData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      return { day: format(subDays(new Date(), 6 - i), "EEE", { locale: ptBR }), passos: history[d] || 0 };
    });
  }, [history]);

  const weekTotal = chartData.reduce((s, x) => s + x.passos, 0);
  const weekAvg = Math.round(weekTotal / 7);

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Footprints className="h-5 w-5 text-primary" /> Rastreador de Passos
          </CardTitle>
          <CardDescription>Sua caminhada diária, rainha. Meta, distância e calorias em um só lugar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary">{todaySteps.toLocaleString("pt-BR")}</div>
            <div className="text-xs text-muted-foreground mt-1">de {goal.toLocaleString("pt-BR")} passos hoje</div>
          </div>
          <Progress value={progress} className="h-3" />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-background/60 p-2">
              <MapPin className="h-4 w-4 mx-auto text-primary" />
              <div className="text-sm font-semibold mt-1">{km} km</div>
              <div className="text-[10px] text-muted-foreground">distância</div>
            </div>
            <div className="rounded-lg bg-background/60 p-2">
              <Flame className="h-4 w-4 mx-auto text-primary" />
              <div className="text-sm font-semibold mt-1">{kcal}</div>
              <div className="text-[10px] text-muted-foreground">kcal</div>
            </div>
            <div className="rounded-lg bg-background/60 p-2">
              <Target className="h-4 w-4 mx-auto text-primary" />
              <div className="text-sm font-semibold mt-1">{progress}%</div>
              <div className="text-[10px] text-muted-foreground">da meta</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" onClick={() => addToday(100)}><Plus className="h-3 w-3 mr-1" />100</Button>
            <Button size="sm" variant="outline" onClick={() => addToday(500)}><Plus className="h-3 w-3 mr-1" />500</Button>
            <Button size="sm" variant="outline" onClick={() => addToday(1000)}><Plus className="h-3 w-3 mr-1" />1000</Button>
            <Button size="sm" variant="outline" onClick={() => addToday(-100)}><Minus className="h-3 w-3 mr-1" />100</Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Definir passos de hoje"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
            />
            <Button
              onClick={() => { if (manual) { setToday(Number(manual)); setManual(""); toast.success("Atualizado!"); } }}
            >Salvar</Button>
          </div>

          <Button
            className="w-full"
            variant={counting ? "destructive" : "default"}
            onClick={() => { setSessionSteps(0); setCounting((c) => !c); }}
          >
            {counting ? (<><Pause className="h-4 w-4 mr-2" /> Parar contagem automática ({sessionSteps})</>) : (<><Play className="h-4 w-4 mr-2" /> Contar passos automaticamente</>)}
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Mantenha o celular no bolso/bolsa. Funciona melhor no mobile. iOS pode pedir permissão de sensores.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimos 7 dias</CardTitle>
          <CardDescription>Média: {weekAvg.toLocaleString("pt-BR")} passos/dia • Total: {weekTotal.toLocaleString("pt-BR")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="passos" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Meta diária (passos)</label>
            <Input type="number" value={goal} onChange={(e) => setGoal(Number(e.target.value) || 0)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Comprimento do passo (cm) — usado para calcular distância</label>
            <Input type="number" value={stride} onChange={(e) => setStride(Number(e.target.value) || 0)} />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Apagar todo o histórico de passos?")) {
                setHistory({});
                toast.success("Histórico limpo");
              }
            }}
          >
            <Trash2 className="h-3 w-3 mr-1" /> Limpar histórico
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
