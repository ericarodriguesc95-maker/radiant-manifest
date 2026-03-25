import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Square, MapPin, Clock, Zap, Camera, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityRecord {
  id: string;
  type: "corrida" | "caminhada";
  startTime: string;
  endTime: string;
  durationMs: number;
  distanceKm: number;
  paceMinKm: string;
  photoUrl: string | null;
  note: string;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function calcPace(distKm: number, durationMs: number): string {
  if (distKm <= 0) return "--:--";
  const totalMin = durationMs / 60000;
  const pace = totalMin / distKm;
  const m = Math.floor(pace);
  const s = Math.round((pace - m) * 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function ActivityTracker() {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [activityType, setActivityType] = useState<"corrida" | "caminhada">("corrida");
  const [manualDistance, setManualDistance] = useState("");
  const [geoDistance, setGeoDistance] = useState(0);
  const [geoSupported, setGeoSupported] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [history, setHistory] = useState<ActivityRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [lastActivity, setLastActivity] = useState<ActivityRecord | null>(null);

  const intervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPosRef = useRef<GeolocationPosition | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGeoSupported("geolocation" in navigator);
    const saved = localStorage.getItem("activity-history");
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const startActivity = useCallback(() => {
    const now = new Date();
    setStartTime(now);
    setElapsed(0);
    setGeoDistance(0);
    setManualDistance("");
    setPhoto(null);
    setIsRunning(true);
    setIsPaused(false);
    setLastActivity(null);
    lastPosRef.current = null;

    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);

    if (geoSupported) {
      try {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            if (lastPosRef.current) {
              const d = haversine(
                lastPosRef.current.coords.latitude,
                lastPosRef.current.coords.longitude,
                pos.coords.latitude,
                pos.coords.longitude
              );
              if (d > 0.005) {
                setGeoDistance((prev) => prev + d);
              }
            }
            lastPosRef.current = pos;
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
      } catch {}
    }

    toast.success(`${activityType === "corrida" ? "🏃‍♀️ Corrida" : "🚶‍♀️ Caminhada"} iniciada!`);
  }, [activityType, geoSupported]);

  const pauseActivity = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPaused(true);
  };

  const resumeActivity = () => {
    setIsPaused(false);
    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
  };

  const stopActivity = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

    const dist = manualDistance ? parseFloat(manualDistance) : geoDistance;
    const record: ActivityRecord = {
      id: Date.now().toString(),
      type: activityType,
      startTime: startTime?.toISOString() || new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMs: elapsed,
      distanceKm: Math.round(dist * 100) / 100,
      paceMinKm: calcPace(dist, elapsed),
      photoUrl: photo,
      note: "",
    };

    const updated = [record, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("activity-history", JSON.stringify(updated));
    setLastActivity(record);
    setIsRunning(false);
    setIsPaused(false);
    toast.success("Atividade finalizada! 🎉");
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const distance = manualDistance ? parseFloat(manualDistance) || 0 : geoDistance;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-4 w-4 text-secondary" />
          Rastreador de Atividade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isRunning && !lastActivity && (
          <>
            <div className="flex gap-2">
              <Button
                variant={activityType === "corrida" ? "gold" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setActivityType("corrida")}
              >
                🏃‍♀️ Corrida
              </Button>
              <Button
                variant={activityType === "caminhada" ? "gold" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setActivityType("caminhada")}
              >
                🚶‍♀️ Caminhada
              </Button>
            </div>
            <Button variant="gold" className="w-full h-14 text-lg font-bold" onClick={startActivity}>
              <Play className="h-6 w-6 mr-2" />
              Iniciar {activityType === "corrida" ? "Corrida" : "Caminhada"}
            </Button>
            {!geoSupported && (
              <p className="text-[10px] text-muted-foreground text-center">
                📍 GPS indisponível — insira a distância manualmente ao finalizar
              </p>
            )}
          </>
        )}

        {isRunning && (
          <div className="space-y-4">
            {/* Timer Display */}
            <div className="text-center py-4">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-semibold mb-1">
                {activityType === "corrida" ? "🏃‍♀️ Corrida" : "🚶‍♀️ Caminhada"} em andamento
              </p>
              <p className="text-5xl font-mono font-bold text-foreground tracking-wider">
                {formatDuration(elapsed)}
              </p>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-lg bg-secondary/10">
                <MapPin className="h-4 w-4 text-secondary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{distance.toFixed(2)}</p>
                <p className="text-[10px] text-muted-foreground">Km</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{calcPace(distance, elapsed)}</p>
                <p className="text-[10px] text-muted-foreground">Pace (min/km)</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <Zap className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">
                  {Math.round(distance * (activityType === "corrida" ? 70 : 50))}
                </p>
                <p className="text-[10px] text-muted-foreground">kcal est.</p>
              </div>
            </div>

            {/* Manual distance input */}
            {!geoSupported && (
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Distância manual (km)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 3.5"
                  value={manualDistance}
                  onChange={(e) => setManualDistance(e.target.value)}
                  className="text-sm"
                />
              </div>
            )}

            {/* Photo */}
            <div>
              <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => photoRef.current?.click()}>
                <Camera className="h-3 w-3 mr-1" />
                {photo ? "📸 Foto capturada!" : "Tirar foto da atividade"}
              </Button>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!isPaused ? (
                <Button variant="outline" size="sm" className="flex-1" onClick={pauseActivity}>
                  <Pause className="h-4 w-4 mr-1" /> Pausar
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="flex-1" onClick={resumeActivity}>
                  <Play className="h-4 w-4 mr-1" /> Retomar
                </Button>
              )}
              <Button variant="gold" size="sm" className="flex-1" onClick={stopActivity}>
                <Square className="h-4 w-4 mr-1" /> Finalizar
              </Button>
            </div>
          </div>
        )}

        {/* Last Activity Result */}
        {lastActivity && !isRunning && (
          <div className="space-y-3 p-4 rounded-xl border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-secondary/10">
            <div className="text-center">
              <Trophy className="h-8 w-8 text-secondary mx-auto mb-1" />
              <p className="text-sm font-bold text-secondary">Atividade Concluída! 🔥</p>
              <p className="text-[10px] text-muted-foreground">
                {lastActivity.type === "corrida" ? "🏃‍♀️ Corrida" : "🚶‍♀️ Caminhada"} •{" "}
                {format(new Date(lastActivity.startTime), "dd/MM HH:mm", { locale: ptBR })}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-background/80">
                <p className="text-lg font-bold text-foreground">{formatDuration(lastActivity.durationMs)}</p>
                <p className="text-[10px] text-muted-foreground">Duração</p>
              </div>
              <div className="p-2 rounded-lg bg-background/80">
                <p className="text-lg font-bold text-foreground">{lastActivity.distanceKm} km</p>
                <p className="text-[10px] text-muted-foreground">Distância</p>
              </div>
              <div className="p-2 rounded-lg bg-background/80">
                <p className="text-lg font-bold text-foreground">{lastActivity.paceMinKm}</p>
                <p className="text-[10px] text-muted-foreground">Pace</p>
              </div>
            </div>
            {lastActivity.photoUrl && (
              <img src={lastActivity.photoUrl} alt="Atividade" className="w-full h-40 object-cover rounded-lg" />
            )}
            <Button variant="outline" size="sm" className="w-full" onClick={() => setLastActivity(null)}>
              Nova Atividade
            </Button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && !isRunning && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
            >
              {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              Histórico ({history.length} atividades)
            </button>
            {showHistory && (
              <div className="space-y-1.5 mt-2 max-h-60 overflow-y-auto">
                {history.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">
                        {r.type === "corrida" ? "🏃‍♀️" : "🚶‍♀️"} {r.distanceKm} km
                      </span>
                      <span className="text-muted-foreground ml-2">{formatDuration(r.durationMs)}</span>
                      <span className="text-secondary ml-2">Pace {r.paceMinKm}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(r.startTime), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
