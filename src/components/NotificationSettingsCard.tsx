import { useState } from "react";
import { Bell, BellOff, Send, Cloud } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  requestNotificationPermission,
  getPermissionStatus,
  sendTestNotifications,
  subscribeToPush,
} from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function NotificationSettingsCard() {
  const [permStatus, setPermStatus] = useState(getPermissionStatus());
  const [sendingPush, setSendingPush] = useState(false);
  const { user } = useAuth();

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

  const handleTestWebPush = async () => {
    if (permStatus !== "granted") {
      toast({ title: "Ative as notificações primeiro", variant: "destructive" });
      return;
    }
    if (!user?.id) {
      toast({ title: "Faça login primeiro", variant: "destructive" });
      return;
    }
    setSendingPush(true);
    try {
      // Garante subscription registrada antes de enviar
      await subscribeToPush(user.id);
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: {
          title: "👑 Teste de Web Push",
          body: "Funcionou, rainha! Suas notificações estão ativas ✨",
          tag: "test-" + Date.now(),
          url: "/",
          user_ids: [user.id],
        },
      });
      if (error) throw error;
      const sent = (data as any)?.sent ?? 0;
      if (sent > 0) {
        toast({
          title: "Push enviado! 📨",
          description: `Enviado para ${sent} dispositivo(s). Aguarde alguns segundos.`,
        });
      } else {
        toast({
          title: "Nenhum dispositivo registrado",
          description: "Recarregue a página com permissão concedida e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro ao enviar push",
        description: e?.message ?? "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setSendingPush(false);
    }
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
          <>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={handleTest}
            >
              <Send className="h-4 w-4" />
              Teste local (instantâneo)
            </Button>
            <Button
              size="sm"
              disabled={sendingPush}
              className="w-full gap-2 bg-[#D4AF37] text-black hover:bg-[#b8941f] font-semibold"
              onClick={handleTestWebPush}
            >
              <Cloud className="h-4 w-4" />
              {sendingPush ? "Enviando..." : "Testar Web Push real (servidor)"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              O teste real envia push do servidor — funciona com app fechado.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
