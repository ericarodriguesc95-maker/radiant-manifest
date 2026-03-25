import { useState } from "react";
import { Watch, Bluetooth, CheckCircle2, Loader2, AlertCircle, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WatchDevice {
  id: string;
  name: string;
  brand: string;
  icon: string;
  connected: boolean;
}

const supportedDevices: Omit<WatchDevice, "connected">[] = [
  { id: "apple", name: "Apple Watch", brand: "Apple", icon: "⌚" },
  { id: "samsung", name: "Galaxy Watch", brand: "Samsung", icon: "⌚" },
  { id: "garmin", name: "Garmin", brand: "Garmin", icon: "⌚" },
  { id: "fitbit", name: "Fitbit", brand: "Google", icon: "⌚" },
  { id: "xiaomi", name: "Mi Band / Amazfit", brand: "Xiaomi", icon: "⌚" },
];

export default function SmartWatchConnect() {
  const [devices, setDevices] = useState<WatchDevice[]>(() => {
    try {
      const saved = localStorage.getItem("connected-watches");
      if (saved) return JSON.parse(saved);
    } catch {}
    return supportedDevices.map((d) => ({ ...d, connected: false }));
  });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [bluetoothSupported] = useState(() => "bluetooth" in navigator);

  const connectDevice = async (deviceId: string) => {
    setConnecting(deviceId);

    if (bluetoothSupported) {
      try {
        // @ts-ignore — Web Bluetooth API
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["heart_rate", "battery_service"],
        });
        if (device) {
          updateDeviceStatus(deviceId, true);
          toast.success(`${device.name || "Dispositivo"} conectado com sucesso! ⌚`);
          setConnecting(null);
          return;
        }
      } catch (err: any) {
        if (err.name !== "NotFoundError") {
          // Fallback to simulation
        }
      }
    }

    // Simulated connection
    await new Promise((r) => setTimeout(r, 2500));
    updateDeviceStatus(deviceId, true);
    toast.success("Dispositivo conectado (simulação)! ⌚");
    setConnecting(null);
  };

  const disconnectDevice = (deviceId: string) => {
    updateDeviceStatus(deviceId, false);
    toast.info("Dispositivo desconectado");
  };

  const updateDeviceStatus = (deviceId: string, connected: boolean) => {
    setDevices((prev) => {
      const updated = prev.map((d) => (d.id === deviceId ? { ...d, connected } : d));
      localStorage.setItem("connected-watches", JSON.stringify(updated));
      return updated;
    });
  };

  const connectedCount = devices.filter((d) => d.connected).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Watch className="h-4 w-4 text-secondary" />
          Conectar Dispositivo
        </CardTitle>
        <CardDescription className="text-xs">
          Sincronize seu smartwatch para métricas automáticas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!bluetoothSupported && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-secondary/10 text-xs">
            <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              Web Bluetooth não disponível neste navegador. A conexão será simulada para demonstração.
            </p>
          </div>
        )}

        {connectedCount > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/10">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            <span className="text-xs font-semibold text-secondary">{connectedCount} dispositivo(s) conectado(s)</span>
          </div>
        )}

        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                device.connected ? "border-secondary/30 bg-secondary/5" : "border-border bg-muted/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{device.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{device.name}</p>
                  <p className="text-[10px] text-muted-foreground">{device.brand}</p>
                </div>
              </div>
              {connecting === device.id ? (
                <Button variant="outline" size="sm" disabled className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" /> Conectando...
                </Button>
              ) : device.connected ? (
                <Button variant="outline" size="sm" className="text-xs" onClick={() => disconnectDevice(device.id)}>
                  <CheckCircle2 className="h-3 w-3 mr-1 text-secondary" /> Conectado
                </Button>
              ) : (
                <Button variant="gold" size="sm" className="text-xs" onClick={() => connectDevice(device.id)}>
                  <Bluetooth className="h-3 w-3 mr-1" /> Conectar
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-xs">
          <Smartphone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            💡 <strong>Dica:</strong> Conecte seu smartwatch para sincronizar automaticamente batimentos cardíacos, passos e calorias queimadas com sua rotina de treino.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
