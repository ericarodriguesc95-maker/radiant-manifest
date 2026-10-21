import { useEffect, useState } from "react";
import { Bell, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { requestNotificationPermission, getPermissionStatus, initNotifications } from "@/lib/notifications";
import { normalizeSchedule, DEFAULT_NOTIFICATION_SCHEDULE, NotificationSchedule } from "@/lib/notification-preferences";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const slots = [
  ["morning", "Afirmação e Palavra do Dia"], ["noon", "Pausa e autocuidado"],
  ["afternoon", "Metas e movimento"], ["evening", "Hábitos e gratidão"], ["night", "Sono e descanso"],
] as const;

export default function NotificationSettingsCard() {
  const { user } = useAuth();
  const [permission, setPermission] = useState(getPermissionStatus());
  const [schedule, setSchedule] = useState<NotificationSchedule>({ ...DEFAULT_NOTIFICATION_SCHEDULE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!user) return;
    let active = true;
    supabase.from("profiles").select("notification_schedule").eq("user_id", user.id).single().then(({ data, error }) => {
      if (!active) return;
      setFailed(Boolean(error));
      if (data) setSchedule(normalizeSchedule(data.notification_schedule));
      setLoading(false);
    });
    return () => { active = false; };
  }, [user]);
  const enablePermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(getPermissionStatus());
    if (granted) { await initNotifications(user?.id); toast({ title: "Notificações autorizadas! 🔔" }); }
    else toast({ title: "Notificações não autorizadas", description: "Permita as notificações nas configurações do navegador.", variant: "destructive" });
  };
  const save = async () => {
    if (!user) return;
    setSaving(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const next = { ...schedule, timezone };
    const { error } = await supabase.from("profiles").update({ notification_schedule: next }).eq("user_id", user.id).select("user_id").single();
    setSaving(false);
    if (error) toast({ title: "Não foi possível salvar os horários", variant: "destructive" });
    else { setSchedule(next); toast({ title: "Horários salvos! 🔔" }); }
  };
  return <Card><CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Bell className="h-5 w-5 text-primary" />Notificações automáticas</CardTitle><CardDescription>
    {permission === "denied" ? "Notificações bloqueadas. Permita nas configurações do navegador." : permission === "unsupported" ? "Este navegador não permite notificações." : permission === "granted" ? "Notificações autorizadas neste dispositivo." : "Autorize as notificações neste dispositivo para receber os lembretes."}
  </CardDescription></CardHeader><CardContent className="space-y-4">
    {permission === "default" && <Button onClick={enablePermission} className="w-full"><Bell />Permitir notificações</Button>}
    {failed && <p role="alert" className="text-sm text-destructive">Não foi possível carregar seus horários. Reabra as configurações.</p>}
    <div className="flex items-center justify-between gap-3"><Label htmlFor="automatic-reminders">Lembretes padrão</Label><Switch id="automatic-reminders" checked={schedule.enabled} disabled={loading || saving || failed} onCheckedChange={enabled => setSchedule({ ...schedule, enabled })} /></div>
    <div className="space-y-3">{slots.map(([slot, label]) => <div key={slot} className="flex items-center justify-between gap-3"><Label htmlFor={`notification-${slot}`} className="text-sm">{label}</Label><Input id={`notification-${slot}`} type="time" required value={schedule[slot]} disabled={loading || saving || failed} onChange={e => { if (e.target.value) setSchedule({ ...schedule, [slot]: e.target.value }); }} className="w-28 shrink-0" /></div>)}</div>
    <Button onClick={save} disabled={loading || saving || failed} className="w-full"><Save />{saving ? "Salvando..." : "Salvar horários"}</Button>
  </CardContent></Card>;
}