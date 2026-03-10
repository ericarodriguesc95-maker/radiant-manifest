import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Bell, Check, Trash2, X, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const EVENT_COLORS = [
  { value: "#C8A45C", label: "Dourado" },
  { value: "#E87461", label: "Coral" },
  { value: "#7C5CBF", label: "Roxo" },
  { value: "#4ECDC4", label: "Turquesa" },
  { value: "#FF6B9D", label: "Rosa" },
  { value: "#45B7D1", label: "Azul" },
];

const REMINDER_OPTIONS = [
  { value: "0", label: "Na hora" },
  { value: "5", label: "5 min antes" },
  { value: "15", label: "15 min antes" },
  { value: "30", label: "30 min antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 dia antes" },
  { value: "none", label: "Sem lembrete" },
];

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  color: string;
  reminder_minutes: number | null;
  is_completed: boolean;
}

export default function MonthlyCalendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDayEvents, setShowDayEvents] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { user } = useAuth();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [color, setColor] = useState("#C8A45C");
  const [reminderMinutes, setReminderMinutes] = useState("none");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentMonth, currentYear]);

  const fetchEvents = async () => {
    if (!user) return;
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;
    
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .gte("event_date", startDate)
      .lte("event_date", endDate)
      .order("start_time", { ascending: true });
    
    if (data) setEvents(data);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.event_date === dateStr);
  };

  const openCreateForDay = (day: number) => {
    setSelectedDay(day);
    setEditingEvent(null);
    resetForm();
    setShowCreateDialog(true);
  };

  const openDayView = (day: number) => {
    setSelectedDay(day);
    setShowDayEvents(true);
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length > 0) {
      openDayView(day);
    } else {
      openCreateForDay(day);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setColor("#C8A45C");
    setReminderMinutes("none");
  };

  const openEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || "");
    setStartTime(event.start_time?.slice(0, 5) || "");
    setEndTime(event.end_time?.slice(0, 5) || "");
    setColor(event.color);
    setReminderMinutes(event.reminder_minutes !== null ? String(event.reminder_minutes) : "none");
    setShowDayEvents(false);
    setShowCreateDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!user || !title.trim() || selectedDay === null) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    const reminder = reminderMinutes === "none" ? null : parseInt(reminderMinutes);

    if (editingEvent) {
      const { error } = await supabase
        .from("calendar_events")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          event_date: dateStr,
          start_time: startTime || null,
          end_time: endTime || null,
          color,
          reminder_minutes: reminder,
        })
        .eq("id", editingEvent.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Evento atualizado!");
    } else {
      const { error } = await supabase
        .from("calendar_events")
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          event_date: dateStr,
          start_time: startTime || null,
          end_time: endTime || null,
          color,
          reminder_minutes: reminder,
        });
      if (error) { toast.error("Erro ao criar evento"); return; }
      toast.success("Evento criado!");
    }

    setShowCreateDialog(false);
    resetForm();
    fetchEvents();
  };

  const toggleComplete = async (event: CalendarEvent) => {
    await supabase
      .from("calendar_events")
      .update({ is_completed: !event.is_completed })
      .eq("id", event.id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("Evento removido");
    fetchEvents();
  };

  const formatTime = (time: string | null) => {
    if (!time) return "";
    return time.slice(0, 5);
  };

  const selectedDateStr = selectedDay
    ? `${selectedDay} de ${monthNames[currentMonth]}`
    : "";

  const dayEvents = selectedDay ? getEventsForDay(selectedDay) : [];
  const completedEvents = dayEvents.filter(e => e.is_completed);
  const pendingEvents = dayEvents.filter(e => !e.is_completed);

  return (
    <>
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-1">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-display font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <button onClick={handleNextMonth} className="p-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <span key={i} className="text-[10px] font-body text-muted-foreground font-medium py-1">
              {d}
            </span>
          ))}
          {blanks.map(i => (
            <span key={`blank-${i}`} />
          ))}
          {days.map(day => {
            const isToday = isCurrentMonth && day === today;
            const dayEvts = getEventsForDay(day);
            const hasEvents = dayEvts.length > 0;
            const allCompleted = hasEvents && dayEvts.every(e => e.is_completed);

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`relative text-xs font-body py-1.5 rounded-lg transition-colors ${
                  isToday
                    ? "bg-gold text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {day}
                {hasEvents && (
                  <div className="flex justify-center gap-[2px] mt-0.5">
                    {dayEvts.slice(0, 3).map((evt, i) => (
                      <span
                        key={i}
                        className={`block w-1 h-1 rounded-full ${allCompleted ? "opacity-50" : ""}`}
                        style={{ backgroundColor: evt.color }}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">Toque em um dia para agendar</p>
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Day Events Dialog */}
      <Dialog open={showDayEvents} onOpenChange={setShowDayEvents}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gold" />
              {selectedDateStr}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {pendingEvents.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pendentes</p>
                {pendingEvents.map(evt => (
                  <EventCard key={evt.id} event={evt} onToggle={toggleComplete} onEdit={openEditEvent} onDelete={deleteEvent} formatTime={formatTime} />
                ))}
              </div>
            )}

            {completedEvents.length > 0 && (
              <div className="space-y-2 mt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Concluídos</p>
                {completedEvents.map(evt => (
                  <EventCard key={evt.id} event={evt} onToggle={toggleComplete} onEdit={openEditEvent} onDelete={deleteEvent} formatTime={formatTime} />
                ))}
              </div>
            )}

            {dayEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum evento neste dia</p>
            )}
          </div>

          <Button
            onClick={() => { setShowDayEvents(false); openCreateForDay(selectedDay!); }}
            className="w-full mt-2 bg-gold hover:bg-gold/90 text-primary-foreground font-display"
          >
            <Plus className="h-4 w-4 mr-1" /> Novo Evento
          </Button>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              {editingEvent ? "Editar Evento" : `Agendar — ${selectedDateStr}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Título do evento"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="font-body"
            />

            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="font-body resize-none"
              rows={2}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Início</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="font-body text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Fim</label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="font-body text-sm"
                />
              </div>
            </div>

            {/* Color picker */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1.5 block">Cor</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === c.value ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            {/* Reminder */}
            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 flex items-center gap-1">
                <Bell className="h-3 w-3" /> Lembrete
              </label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger className="font-body text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="font-body">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveEvent}
              disabled={!title.trim()}
              className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-display"
            >
              {editingEvent ? "Salvar Alterações" : "Agendar Evento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventCard({
  event,
  onToggle,
  onEdit,
  onDelete,
  formatTime,
}: {
  event: CalendarEvent;
  onToggle: (e: CalendarEvent) => void;
  onEdit: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
  formatTime: (t: string | null) => string;
}) {
  return (
    <div
      className={`flex items-start gap-2 p-2.5 rounded-xl border transition-all ${
        event.is_completed ? "opacity-60 bg-muted/50" : "bg-card"
      }`}
      style={{ borderLeftColor: event.color, borderLeftWidth: 3 }}
    >
      <button
        onClick={() => onToggle(event)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          event.is_completed ? "bg-gold border-gold" : "border-muted-foreground"
        }`}
      >
        {event.is_completed && <Check className="h-3 w-3 text-primary-foreground" />}
      </button>

      <div className="flex-1 min-w-0" onClick={() => onEdit(event)}>
        <p className={`text-sm font-body font-medium truncate ${event.is_completed ? "line-through" : ""}`}>
          {event.title}
        </p>
        {(event.start_time || event.end_time) && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {formatTime(event.start_time)}
            {event.end_time && ` — ${formatTime(event.end_time)}`}
          </p>
        )}
        {event.reminder_minutes !== null && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Bell className="h-3 w-3" />
            {REMINDER_OPTIONS.find(r => r.value === String(event.reminder_minutes))?.label || "Lembrete"}
          </p>
        )}
      </div>

      <button onClick={() => onDelete(event.id)} className="text-muted-foreground hover:text-destructive p-1">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
