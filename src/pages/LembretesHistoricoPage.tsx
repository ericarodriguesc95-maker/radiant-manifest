import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Clock, CheckCircle2, Moon, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

type EventType = "received" | "snoozed" | "completed";

interface ReminderEvent {
  id: string;
  event_type: EventType;
  snooze_hours: number | null;
  source: string;
  metadata: any;
  created_at: string;
}

const LABELS: Record<EventType, { label: string; icon: any; className: string }> = {
  received: {
    label: "Recebido",
    icon: Bell,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  snoozed: {
    label: "Sonecado",
    icon: Moon,
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700 border-green-200",
  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupByDay(events: ReminderEvent[]) {
  const map = new Map<string, ReminderEvent[]>();
  for (const e of events) {
    const key = new Date(e.created_at).toLocaleDateString("pt-BR");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

export default function LembretesHistoricoPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ReminderEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("reminder_events")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error("Não foi possível carregar o histórico");
    setEvents((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const clearAll = async () => {
    if (!user) return;
    if (!confirm("Apagar todo o histórico de lembretes?")) return;
    const { error } = await supabase.from("reminder_events").delete().eq("user_id", user.id);
    if (error) return toast.error("Erro ao apagar");
    toast.success("Histórico apagado");
    setEvents([]);
  };

  const totals = {
    received: events.filter((e) => e.event_type === "received").length,
    snoozed: events.filter((e) => e.event_type === "snoozed").length,
    completed: events.filter((e) => e.event_type === "completed").length,
  };

  const grouped = groupByDay(events);

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de lembretes</h1>
            <p className="text-sm text-muted-foreground">Todos os lembretes de check-points, sonecas e conclusões.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={load} title="Atualizar">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {events.length > 0 && (
              <Button variant="outline" size="icon" onClick={clearAll} title="Apagar tudo">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Bell className="h-4 w-4 mx-auto text-blue-600 mb-1" />
              <p className="text-xl font-bold">{totals.received}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recebidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <Moon className="h-4 w-4 mx-auto text-purple-600 mb-1" />
              <p className="text-xl font-bold">{totals.snoozed}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Sonecados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 text-center">
              <CheckCircle2 className="h-4 w-4 mx-auto text-green-600 mb-1" />
              <p className="text-xl font-bold">{totals.completed}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Concluídos</p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p className="text-center text-sm text-muted-foreground py-10">Carregando...</p>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <BellOff className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhum lembrete registrado ainda. Ative os lembretes de check-points nas configurações.
              </p>
            </CardContent>
          </Card>
        ) : (
          grouped.map(([day, list]) => (
            <Card key={day}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{day}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {list.map((e) => {
                  const cfg = LABELS[e.event_type];
                  const Icon = cfg.icon;
                  return (
                    <div key={e.id} className="flex items-center gap-3 py-2 border-b last:border-b-0">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center border ${cfg.className}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={cfg.className}>{cfg.label}</Badge>
                          {e.event_type === "snoozed" && e.snooze_hours && (
                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> +{e.snooze_hours}h
                            </span>
                          )}
                          {e.source && e.source !== "scheduled" && (
                            <span className="text-[10px] text-muted-foreground">({e.source})</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(e.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
