import { useState, useEffect } from "react";
import { Bell, BellOff, Clock, BookMarked, Sparkles, Target, Send, MessageCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getPermissionStatus,
  sendTestNotifications,
  type NotificationSettings,
} from "@/lib/notifications";

export default function NotificationSettingsCard() {
  const [settings, setSettings] = useState<NotificationSettings>(getNotificationSettings);
  const [permStatus, setPermStatus] = useState(getPermissionStatus());

  useEffect(() => {
    setPermStatus(getPermissionStatus());
  }, [settings.enabled]);

  const handleToggleEnabled = async () => {
    if (!settings.enabled) {
      const granted = await requestNotificationPermission();
      setPermStatus(getPermissionStatus());
      if (!granted) {
        toast({
          title: "Permissão negada",
          description: "Ative as notificações nas configurações do navegador.",
          variant: "destructive",
        });
        return;
      }
    }
    const updated = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveNotificationSettings(updated);
    toast({
      title: updated.enabled ? "Notificações ativadas! 🔔" : "Notificações desativadas",
      description: updated.enabled
        ? `Você receberá lembretes diários às ${updated.horario}`
        : "Seus lembretes foram pausados.",
    });
  };

  const handleToggle = (key: "versiculo" | "afirmacao" | "metas") => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTimeChange = (time: string) => {
    const updated = { ...settings, horario: time };
    setSettings(updated);
    saveNotificationSettings(updated);
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
    sendTestNotifications(settings);
    toast({
      title: "Notificações de teste enviadas! 🔔",
      description: "Verifique sua barra de notificações.",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {settings.enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">Lembretes Diários</CardTitle>
          </div>
          <Switch checked={settings.enabled} onCheckedChange={handleToggleEnabled} />
        </div>
        <CardDescription>
          {permStatus === "unsupported"
            ? "Seu navegador não suporta notificações"
            : permStatus === "denied"
            ? "Permissão negada — ative nas configurações do navegador"
            : "Receba na barra de notificação do seu celular"}
        </CardDescription>
      </CardHeader>

      {settings.enabled && (
        <CardContent className="space-y-4">
          {/* Horário */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Horário</span>
            </div>
            <input
              type="time"
              value={settings.horario}
              onChange={(e) => handleTimeChange(e.target.value)}
              className="bg-transparent text-sm font-medium text-foreground border border-border rounded-lg px-2 py-1"
            />
          </div>

          {/* Toggle: Versículo */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <BookMarked className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Versículo Diário</p>
                <p className="text-xs text-muted-foreground">Receba um versículo inspirador</p>
              </div>
            </div>
            <Switch checked={settings.versiculo} onCheckedChange={() => handleToggle("versiculo")} />
          </div>

          {/* Toggle: Afirmação */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Afirmação Diária</p>
                <p className="text-xs text-muted-foreground">Fortaleça sua mentalidade</p>
              </div>
            </div>
            <Switch checked={settings.afirmacao} onCheckedChange={() => handleToggle("afirmacao")} />
          </div>

          {/* Toggle: Metas */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Lembrete de Metas</p>
                <p className="text-xs text-muted-foreground">Revise seu progresso diário</p>
              </div>
            </div>
            <Switch checked={settings.metas} onCheckedChange={() => handleToggle("metas")} />
          </div>

          {/* Test button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={handleTest}
          >
            <Send className="h-4 w-4" />
            Enviar notificação de teste
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
