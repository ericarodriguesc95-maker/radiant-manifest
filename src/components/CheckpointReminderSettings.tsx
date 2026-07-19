import { useEffect, useState } from "react";
import { Bell, Plus, X, BellRing, History } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export default function CheckpointReminderSettings() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [times, setTimes] = useState<string[]>(["09:00", "15:00", "21:00"]);
  const [newTime, setNewTime] = useState("12:00");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("checkpoint_reminder_enabled, checkpoint_reminder_times")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setEnabled(!!data.checkpoint_reminder_enabled);
        if (Array.isArray(data.checkpoint_reminder_times) && data.checkpoint_reminder_times.length) {
          setTimes(data.checkpoint_reminder_times as string[]);
        }
      });
  }, [user]);

  const save = async (next: { enabled?: boolean; times?: string[] }) => {
    if (!user) return;
    setSaving(true);
    const payload: any = {};
    if (next.enabled !== undefined) payload.checkpoint_reminder_enabled = next.enabled;
    if (next.times !== undefined) payload.checkpoint_reminder_times = next.times;
    const { error } = await supabase.from("profiles").update(payload).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    }
  };

  const toggleEnabled = async (v: boolean) => {
    setEnabled(v);
    if (v && "Notification" in window && Notification.permission === "default") {
      try { await Notification.requestPermission(); } catch {}
    }
    save({ enabled: v });
  };

  const addTime = () => {
    if (!/^\d{2}:\d{2}$/.test(newTime)) return;
    if (times.includes(newTime)) return;
    const next = [...times, newTime].sort();
    setTimes(next);
    save({ times: next });
  };

  const removeTime = (t: string) => {
    const next = times.filter(x => x !== t);
    setTimes(next);
    save({ times: next });
  };

  const permission = typeof Notification !== "undefined" ? Notification.permission : "unsupported";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
            <BellRing className="h-4 w-4 text-primary-foreground" />
          </div>
          Lembretes de check-points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Ativar lembretes diários</p>
            <p className="text-xs text-muted-foreground">Receba notificações para completar seus pontos.</p>
          </div>
          <Switch checked={enabled} onCheckedChange={toggleEnabled} disabled={saving} />
        </div>

        {permission === "denied" && (
          <p className="text-xs text-destructive">
            As notificações estão bloqueadas no navegador. Habilite nas configurações do site para receber os lembretes.
          </p>
        )}

        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Horários personalizados</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {times.map(t => (
              <span key={t} className="inline-flex items-center gap-1 bg-gold/10 border border-gold/30 text-foreground rounded-full pl-3 pr-1 py-1 text-sm">
                <Bell className="h-3 w-3 text-gold" />
                {t}
                <button
                  aria-label={`Remover ${t}`}
                  onClick={() => removeTime(t)}
                  className="ml-1 h-5 w-5 rounded-full hover:bg-destructive/20 flex items-center justify-center"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {times.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum horário configurado.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="w-32" />
            <Button size="sm" onClick={addTime} className="gap-1">
              <Plus className="h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>

        <Link to="/lembretes-historico" className="block">
          <Button variant="outline" className="w-full gap-2">
            <History className="h-4 w-4" /> Ver histórico de lembretes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
