import { useState, useEffect } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  requestNotificationPermission,
  getPermissionStatus,
  sendTestNotifications,
} from "@/lib/notifications";

export default function NotificationSettingsCard() {
  const [permStatus, setPermStatus] = useState(getPermissionStatus());

  const handleEnable = async () => {
    const granted = await requestNotificationPermission();
    setPermStatus(getPermissionStatus());
    if (granted) {
      toast({
        title: "Notificações ativadas! 🔔",
        description: "Você receberá a afirmação e palavra do dia às 08:00 e lembrete de hábitos às 20:00.",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Ative as notificações nas configurações do navegador.",
        variant: "destructive",
      });
    }
  };

  const handleTest = () => {
    if (permStatus !== "granted") {
      toast({
        title: "Ative as notificações primeiro",
        description: "Clique no botão acima para ativar.",
        variant: "destructive",
      });
      return;
    }
    sendTestNotifications();
    toast({
      title: "Notificações de teste enviadas! 🔔",
      description: "Verifique sua barra de notificações.",
    });
  };

  const isGranted = permStatus === "granted";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isGranted ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <CardTitle className="text-base">Notificações Push</CardTitle>
        </div>
        <CardDescription>
          {permStatus === "unsupported"
            ? "Seu navegador não suporta notificações"
            : permStatus === "denied"
            ? "Permissão negada — ative nas configurações do navegador"
            : isGranted
            ? "✅ Ativadas! Afirmação e Palavra do Dia às 08:00 · Hábitos às 20:00"
            : "Receba lembretes diários na barra de notificação"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {!isGranted && permStatus !== "denied" && permStatus !== "unsupported" && (
          <Button className="w-full gap-2" onClick={handleEnable}>
            <Bell className="h-4 w-4" />
            Ativar Notificações
          </Button>
        )}

        {isGranted && (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleTest}
          >
            <Send className="h-4 w-4" />
            Enviar notificação de teste
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
