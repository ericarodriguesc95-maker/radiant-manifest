import { useState, useRef } from "react";
import { Share2, Download, Instagram, MessageCircle, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareData {
  type: "corrida" | "caminhada" | "treino";
  duration?: string;
  distance?: string;
  pace?: string;
  calories?: string;
  exercises?: number;
}

export default function ShareGlowUp() {
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getLatestActivity = (): ShareData | null => {
    try {
      const saved = localStorage.getItem("activity-history");
      if (saved) {
        const history = JSON.parse(saved);
        if (history.length > 0) {
          const latest = history[0];
          const totalSec = Math.floor(latest.durationMs / 1000);
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          const s = totalSec % 60;
          return {
            type: latest.type,
            duration: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
            distance: `${latest.distanceKm} km`,
            pace: `${latest.paceMinKm} min/km`,
            calories: `${Math.round(latest.distanceKm * (latest.type === "corrida" ? 70 : 50))} kcal`,
          };
        }
      }
      const workoutSaved = localStorage.getItem("workout-completed-today");
      if (workoutSaved) {
        const workout = JSON.parse(workoutSaved);
        if (workout.exercises?.length > 0) {
          return { type: "treino", exercises: workout.exercises.length };
        }
      }
    } catch {}
    return null;
  };

  const generateShareText = (data: ShareData): string => {
    if (data.type === "treino") {
      return `🔥 Performance Glow Up\n\n💪 Completei ${data.exercises} exercícios hoje!\n\n✨ Cada treino me aproxima da minha melhor versão.\n\n#PerformanceGlowUp #GlowUp #Fitness`;
    }
    return `🔥 Performance Glow Up\n\n${data.type === "corrida" ? "🏃‍♀️" : "🚶‍♀️"} ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} concluída!\n\n⏱️ ${data.duration}\n📍 ${data.distance}\n⚡ Pace: ${data.pace}\n🔥 ${data.calories}\n\n✨ Cada passo conta!\n\n#PerformanceGlowUp #GlowUp #Running`;
  };

  const generateImage = async (data: ShareData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, "#1a1a1a");
    grad.addColorStop(0.5, "#0d0d0d");
    grad.addColorStop(1, "#1a1a1a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    // Gold accent line
    const goldGrad = ctx.createLinearGradient(0, 0, 1080, 0);
    goldGrad.addColorStop(0, "#c8962e");
    goldGrad.addColorStop(0.5, "#e8b94a");
    goldGrad.addColorStop(1, "#c8962e");
    ctx.fillStyle = goldGrad;
    ctx.fillRect(0, 380, 1080, 4);

    // Brand name
    ctx.fillStyle = "#e8b94a";
    ctx.font = "bold 36px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("PERFORMANCE GLOW UP", 540, 340);

    // Fire emoji
    ctx.font = "80px system-ui";
    ctx.fillText("🔥", 540, 550);

    // Activity type
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px system-ui";
    if (data.type === "treino") {
      ctx.fillText(`${data.exercises} EXERCÍCIOS`, 540, 680);
      ctx.fillText("COMPLETADOS!", 540, 750);
    } else {
      ctx.fillText(`${data.type.toUpperCase()} CONCLUÍDA`, 540, 680);
    }

    if (data.type !== "treino") {
      // Metrics cards
      const metrics = [
        { label: "DURAÇÃO", value: data.duration || "--" },
        { label: "DISTÂNCIA", value: data.distance || "--" },
        { label: "PACE", value: data.pace || "--" },
        { label: "CALORIAS", value: data.calories || "--" },
      ];

      metrics.forEach((m, i) => {
        const y = 850 + i * 180;
        ctx.fillStyle = "rgba(232, 185, 74, 0.1)";
        ctx.beginPath();
        ctx.roundRect(140, y, 800, 140, 20);
        ctx.fill();

        ctx.strokeStyle = "rgba(232, 185, 74, 0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#e8b94a";
        ctx.font = "bold 16px system-ui";
        ctx.textAlign = "left";
        ctx.fillText(m.label, 200, y + 45);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 52px system-ui";
        ctx.fillText(m.value, 200, y + 105);
      });
    }

    // Bottom tagline
    ctx.fillStyle = "#e8b94a";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("✨ Cada passo me aproxima da minha melhor versão", 540, 1750);

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "18px system-ui";
    ctx.fillText("#PerformanceGlowUp", 540, 1810);

    // Download
    const link = document.createElement("a");
    link.download = `glowup-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Imagem gerada! Compartilhe nos seus Stories 🔥");
  };

  const shareToWhatsApp = (text: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Texto copiado!");
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const data = getLatestActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Share2 className="h-4 w-4 text-secondary" />
          Compartilhar Glow Up
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data ? (
          <>
            <p className="text-xs text-muted-foreground">
              Compartilhe sua conquista! Gere uma imagem premium para Stories ou copie o texto.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="gold"
                size="sm"
                className="text-xs"
                onClick={() => generateImage(data)}
              >
                <Download className="h-3 w-3 mr-1" />
                Gerar Story
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => shareToWhatsApp(generateShareText(data))}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => copyToClipboard(generateShareText(data))}
            >
              {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
              {copied ? "Copiado!" : "Copiar texto para Instagram"}
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">
            Complete uma atividade ou treino para compartilhar seu Glow Up! 💪
          </p>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
}
