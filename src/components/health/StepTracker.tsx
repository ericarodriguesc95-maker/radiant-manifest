import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Footprints, Plus, Minus, Play, Pause, Target, Flame, MapPin, Trash2, Upload, Watch, Bell, Timer, Apple, Activity } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { unzip, strFromU8 } from "fflate";

const STORAGE_KEY = "saude:steps:v1";
const GOAL_KEY = "saude:steps:goal:v1";
const STRIDE_KEY = "saude:steps:stride:v1"; // cm
const TIMER_KEY = "saude:steps:timer:v1";

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

  // Chronometer (cronômetro), persists across reloads + persistent notification
  const [chronoStart, setChronoStart] = useState<number | null>(() => {
    const v = localStorage.getItem(TIMER_KEY);
    return v ? Number(v) : null;
  });
  const [chronoNow, setChronoNow] = useState(Date.now());
  const notifRef = useRef<Notification | null>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => { saveHistory(history); }, [history]);
  useEffect(() => { localStorage.setItem(GOAL_KEY, String(goal)); }, [goal]);
  useEffect(() => { localStorage.setItem(STRIDE_KEY, String(stride)); }, [stride]);

  // Chronometer ticker + persistent notification updates
  useEffect(() => {
    if (chronoStart == null) return;
    localStorage.setItem(TIMER_KEY, String(chronoStart));
    const id = setInterval(async () => {
      setChronoNow(Date.now());
      // Update persistent notification (Android / desktop). iOS web é limitado.
      if ("serviceWorker" in navigator && Notification.permission === "granted") {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          const elapsedMs = Date.now() - chronoStart;
          const h = Math.floor(elapsedMs / 3600000);
          const m = Math.floor((elapsedMs % 3600000) / 60000);
          const s = Math.floor((elapsedMs % 60000) / 1000);
          const time = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
          await reg?.showNotification("⏱️ Caminhada em andamento", {
            body: `${time} • ${todaySteps.toLocaleString("pt-BR")} passos • ${km} km`,
            tag: "steps-chrono",
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            silent: true,
            // @ts-ignore
            ongoing: true,
            // @ts-ignore
            renotify: false,
          });
        } catch {}
      }
    }, 1000);
    return () => clearInterval(id);
  }, [chronoStart, todaySteps, km]);

  const startChrono = async () => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
      // Wake Lock, mantém tela acordada enquanto caminha (Android Chrome)
      if ("wakeLock" in navigator) {
        try { wakeLockRef.current = await (navigator as any).wakeLock.request("screen"); } catch {}
      }
    } catch {}
    setChronoStart(Date.now());
    setCounting(true);
    setSessionSteps(0);
    toast.success("Cronômetro iniciado");
  };
  const stopChrono = async () => {
    setChronoStart(null);
    localStorage.removeItem(TIMER_KEY);
    setCounting(false);
    try { await wakeLockRef.current?.release?.(); } catch {}
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      const notifs = await reg?.getNotifications({ tag: "steps-chrono" });
      notifs?.forEach((n) => n.close());
    }
    toast.success("Cronômetro parado");
  };
  const chronoText = (() => {
    if (chronoStart == null) return "00:00:00";
    const e = chronoNow - chronoStart;
    const h = Math.floor(e / 3600000);
    const m = Math.floor((e % 3600000) / 60000);
    const s = Math.floor((e % 60000) / 1000);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  })();

  // --- Importadores ---
  const mergeImported = (entries: Record<string, number>, mode: "sum" | "replace" = "sum") => {
    setHistory((h) => {
      const next = { ...h };
      for (const [d, n] of Object.entries(entries)) {
        if (!d || !Number.isFinite(n)) continue;
        next[d] = mode === "sum" ? (next[d] || 0) + Math.round(n) : Math.round(n);
      }
      return next;
    });
    const days = Object.keys(entries).length;
    toast.success(`Importados ${days} dia(s) de histórico`);
  };

  // Apple Health: usuário exporta no iOS (Saúde → ícone perfil → Exportar Dados de Saúde).
  // Aceita o .zip OU o export.xml descompactado.
  const importAppleHealth = async (file: File) => {
    try {
      toast.info("Lendo arquivo… pode levar alguns segundos");
      let xml = "";
      if (file.name.endsWith(".zip")) {
        const buf = new Uint8Array(await file.arrayBuffer());
        const files: Record<string, Uint8Array> = await new Promise((res, rej) =>
          unzip(buf, (err, data) => (err ? rej(err) : res(data)))
        );
        const key = Object.keys(files).find((k) => k.endsWith("export.xml") || k.endsWith("Exportar.xml"));
        if (!key) { toast.error("export.xml não encontrado no zip"); return; }
        xml = strFromU8(files[key]);
      } else {
        xml = await file.text();
      }
      // Regex em vez de DOMParser (export.xml pode ter >100MB)
      const re = /<Record\b[^>]*type="HKQuantityTypeIdentifierStepCount"[^>]*startDate="([^"]+)"[^>]*value="([^"]+)"/g;
      const byDay: Record<string, number> = {};
      let m: RegExpExecArray | null;
      while ((m = re.exec(xml))) {
        const d = m[1].slice(0, 10); // yyyy-MM-dd
        const v = Number(m[2]) || 0;
        byDay[d] = (byDay[d] || 0) + v;
      }
      if (!Object.keys(byDay).length) { toast.error("Nenhum registro de passos encontrado"); return; }
      mergeImported(byDay, "replace");
    } catch (e: any) {
      toast.error("Falha ao importar: " + (e?.message || "arquivo inválido"));
    }
  };

  // CSV genérico (Google Fit, Mi Fit, Samsung Health exportados): "date,steps", uma linha por dia
  const importCsv = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      const byDay: Record<string, number> = {};
      for (const line of lines) {
        const parts = line.split(/[,;\t]/);
        if (parts.length < 2) continue;
        const dRaw = parts[0].replace(/"/g, "").trim();
        const v = Number(parts[1].replace(/[^\d.-]/g, ""));
        // tenta yyyy-MM-dd, dd/MM/yyyy, MM/dd/yyyy
        let d = "";
        if (/^\d{4}-\d{2}-\d{2}/.test(dRaw)) d = dRaw.slice(0, 10);
        else if (/^\d{2}\/\d{2}\/\d{4}/.test(dRaw)) {
          const [a, b, c] = dRaw.split("/");
          d = `${c}-${b}-${a}`;
        }
        if (d && Number.isFinite(v)) byDay[d] = (byDay[d] || 0) + v;
      }
      if (!Object.keys(byDay).length) { toast.error("CSV sem dados válidos (formato: data,passos)"); return; }
      mergeImported(byDay, "replace");
    } catch (e: any) {
      toast.error("Falha ao ler CSV: " + (e?.message || ""));
    }
  };

  // Capacitor nativo (quando o app rodar empacotado), usa HealthKit/Google Fit
  const importNative = async () => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) {
      toast.error("Disponível só no app nativo. Use 'Exportar do Apple Health' por enquanto.");
      return;
    }
    try {
      // Plugin sugerido: @perfood/capacitor-healthkit ou capacitor-health
      const Health = (window as any).CapacitorHealth || (window as any).CapacitorHealthkit;
      if (!Health) { toast.error("Plugin de saúde não instalado no app nativo"); return; }
      const since = new Date(); since.setDate(since.getDate() - 30);
      const res = await Health.queryHKitSampleType?.({ sampleName: "stepCount", startDate: since.toISOString(), endDate: new Date().toISOString(), limit: 0 });
      const byDay: Record<string, number> = {};
      for (const r of (res?.resultData || [])) {
        const d = String(r.startDate).slice(0, 10);
        byDay[d] = (byDay[d] || 0) + Number(r.value || 0);
      }
      mergeImported(byDay, "replace");
    } catch (e: any) {
      toast.error("Erro na sincronização: " + (e?.message || ""));
    }
  };

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

      {/* Cronômetro de caminhada */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Timer className="h-5 w-5 text-primary" /> Cronômetro de caminhada
          </CardTitle>
          <CardDescription>
            Roda em segundo plano e aparece na barra de notificações do celular (Android). No iOS web a notificação é limitada, para barra fixa, use o app nativo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold text-primary tracking-wider">{chronoText}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {chronoStart ? "🟢 Em andamento" : "⏸️ Parado"} • {sessionSteps} passos nesta sessão
            </div>
          </div>
          {chronoStart == null ? (
            <Button className="w-full" onClick={startChrono}>
              <Play className="h-4 w-4 mr-2" /> Iniciar caminhada
            </Button>
          ) : (
            <Button className="w-full" variant="destructive" onClick={stopChrono}>
              <Pause className="h-4 w-4 mr-2" /> Parar caminhada
            </Button>
          )}
          <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <Bell className="h-3 w-3" /> Permita notificações para ver o cronômetro na barra do celular.
          </p>
        </CardContent>
      </Card>

      {/* Importar histórico */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-primary" /> Importar do Apple Health / Google Fit / Smartwatch
          </CardTitle>
          <CardDescription>
            Atualiza seu histórico automaticamente com os dados do app de saúde do seu celular ou relógio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-primary/20 bg-background/60 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Apple className="h-4 w-4" /> Apple Health (iPhone)
            </div>
            <ol className="text-[11px] text-muted-foreground list-decimal pl-4 space-y-0.5">
              <li>Abra o app <b>Saúde</b> no iPhone</li>
              <li>Toque na foto de perfil → <b>Exportar Dados de Saúde</b></li>
              <li>Salve o arquivo <b>.zip</b> e selecione abaixo</li>
            </ol>
            <Input
              type="file"
              accept=".zip,.xml"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importAppleHealth(f); e.currentTarget.value = ""; }}
            />
          </div>

          <div className="rounded-lg border border-primary/20 bg-background/60 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Activity className="h-4 w-4" /> Google Fit / Mi Fit / Samsung Health / Garmin (CSV)
            </div>
            <p className="text-[11px] text-muted-foreground">
              Exporte um CSV no formato <code>data,passos</code> (ex: <code>2026-05-22,8421</code>). A maioria dos apps de relógio permite exportar.
            </p>
            <Input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importCsv(f); e.currentTarget.value = ""; }}
            />
          </div>

          <div className="rounded-lg border border-primary/20 bg-background/60 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Watch className="h-4 w-4" /> Sincronização automática (app nativo)
            </div>
            <p className="text-[11px] text-muted-foreground">
              Quando você instalar o Glow Up Club como app nativo (via Capacitor), poderá puxar passos do HealthKit/Google Fit com um clique.
            </p>
            <Button size="sm" variant="outline" onClick={importNative}>
              <Watch className="h-3 w-3 mr-1" /> Sincronizar agora
            </Button>
          </div>
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
            <label className="text-xs text-muted-foreground">Comprimento do passo (cm), usado para calcular distância</label>
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
