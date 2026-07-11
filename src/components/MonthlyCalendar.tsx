import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Bell, Check, Trash2, Pencil, Repeat, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { requestNotificationPermission, sendNotification } from "@/lib/notifications";

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

type CategoryKey = "habitos" | "metas" | "saude" | "financas" | "espiritual" | "outros";

const CATEGORIES: Record<CategoryKey, { label: string; color: string; text: string }> = {
  habitos:    { label: "Hábitos",             color: "#E8C97A", text: "#5a4416" },
  metas:      { label: "Metas",               color: "#C9A45A", text: "#4a3810" },
  saude:      { label: "Saúde",               color: "#8CA068", text: "#2f3a1e" },
  financas:   { label: "Finanças",            color: "#8B5A2B", text: "#ffffff" },
  espiritual: { label: "Espiritual / Diário", color: "#7A6080", text: "#ffffff" },
  outros:     { label: "Outros",              color: "#6A5040", text: "#ffffff" },
};

const REMINDER_OPTIONS = [
  { value: "0", label: "Na hora" },
  { value: "5", label: "5 min antes" },
  { value: "15", label: "15 min antes" },
  { value: "30", label: "30 min antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 dia antes" },
  { value: "none", label: "Sem lembrete" },
];

const RECURRENCE_OPTIONS = [
  { value: "none", label: "Não repetir" },
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
];

interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  color: string;
  category: CategoryKey;
  reminder_minutes: number | null;
  is_completed: boolean;
  recurrence: string | null;
  recurrence_parent_id: string | null;
}

function normalizeCategory(c: any): CategoryKey {
  return (c && (CATEGORIES as any)[c]) ? c as CategoryKey : "outros";
}

function generateRecurringInstances(events: CalendarEvent[], year: number, month: number): CalendarEvent[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStart = new Date(year, month, 1);
  const result: CalendarEvent[] = [];
  const existingDates = new Set(events.map(e => e.event_date));

  for (const evt of events) {
    result.push(evt);
    if (!evt.recurrence || evt.recurrence === "none" || evt.recurrence_parent_id) continue;
    const eventDate = new Date(evt.event_date + "T00:00:00");

    if (evt.recurrence === "daily") {
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const checkDate = new Date(dateStr + "T00:00:00");
        if (checkDate > eventDate && !existingDates.has(dateStr)) {
          result.push({ ...evt, id: `${evt.id}_r_${dateStr}`, event_date: dateStr, is_completed: false, recurrence_parent_id: evt.id });
        }
      }
    } else if (evt.recurrence === "weekly") {
      const eventDow = eventDate.getDay();
      for (let d = 1; d <= daysInMonth; d++) {
        const checkDate = new Date(year, month, d);
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        if (checkDate.getDay() === eventDow && checkDate > eventDate && !existingDates.has(dateStr)) {
          result.push({ ...evt, id: `${evt.id}_r_${dateStr}`, event_date: dateStr, is_completed: false, recurrence_parent_id: evt.id });
        }
      }
    } else if (evt.recurrence === "monthly") {
      const eventDay = eventDate.getDate();
      if (eventDate < monthStart && eventDay <= daysInMonth) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(eventDay).padStart(2, "0")}`;
        if (!existingDates.has(dateStr)) {
          result.push({ ...evt, id: `${evt.id}_r_${dateStr}`, event_date: dateStr, is_completed: false, recurrence_parent_id: evt.id });
        }
      }
    }
  }
  return result;
}

export default function MonthlyCalendar() {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [rawEvents, setRawEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [dayDialogDay, setDayDialogDay] = useState<number | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<CategoryKey>("outros");
  const [reminderMinutes, setReminderMinutes] = useState("none");
  const [recurrence, setRecurrence] = useState("none");

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const today = now.getDate();
  const isCurrentMonth = currentMonth === now.getMonth() && currentYear === now.getFullYear();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const events = generateRecurringInstances(rawEvents, currentYear, currentMonth);

  useEffect(() => {
    if (user) fetchEvents();
  }, [user, currentMonth, currentYear]);

  useEffect(() => {
    if (!user) return;
    const checkReminders = () => {
      const nowDate = new Date();
      const todayStr = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;
      const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();
      const sentKey = "glowup_cal_reminders_sent";
      const sent: string[] = JSON.parse(localStorage.getItem(sentKey) || "[]");

      for (const evt of events) {
        if (evt.event_date !== todayStr || evt.reminder_minutes === null || !evt.start_time || evt.is_completed) continue;
        const [h, m] = evt.start_time.split(":").map(Number);
        const eventMinutes = h * 60 + m;
        const triggerMinutes = eventMinutes - evt.reminder_minutes;
        const reminderId = `${evt.id}_${todayStr}`;

        if (nowMinutes >= triggerMinutes && nowMinutes <= triggerMinutes + 2 && !sent.includes(reminderId)) {
          sendNotification("📅 " + evt.title, `${evt.start_time.slice(0, 5)}${evt.description ? " — " + evt.description : ""}`, `cal-${evt.id}`);
          sent.push(reminderId);
          localStorage.setItem(sentKey, JSON.stringify(sent));
        }
      }

      if (sent.length > 200) localStorage.setItem(sentKey, JSON.stringify(sent.slice(-50)));
    };

    requestNotificationPermission();
    const interval = setInterval(checkReminders, 30_000);
    checkReminders();
    return () => clearInterval(interval);
  }, [events, user]);

  const fetchEvents = async () => {
    if (!user) return;
    const startDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-01`;
    const endDate = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .or(`and(event_date.gte.${startDate},event_date.lte.${endDate}),recurrence.neq.none`)
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (data) {
      const normalized = (data as any[]).map(e => ({ ...e, category: normalizeCategory(e.category) })) as CalendarEvent[];
      setRawEvents(normalized);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const dateStrFor = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const getEventsForDay = useCallback((day: number) => {
    const dateStr = dateStrFor(day);
    return events.filter(e => e.event_date === dateStr);
  }, [events, currentYear, currentMonth]);

  const resetForm = () => {
    setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
    setCategory("outros"); setReminderMinutes("none"); setRecurrence("none");
  };

  const openCreateForDay = (day?: number) => {
    const d = day ?? (isCurrentMonth ? today : 1);
    setSelectedDay(d);
    setEditingEvent(null);
    resetForm();
    setEventDate(dateStrFor(d));
    setShowCreateDialog(true);
  };

  const openDayDetail = (day: number) => {
    const dayEvts = getEventsForDay(day);
    if (dayEvts.length === 0) {
      openCreateForDay(day);
      return;
    }
    setDayDialogDay(day);
    setShowDayDialog(true);
  };

  const openEditEvent = (event: CalendarEvent) => {
    if (event.id.includes("_r_")) {
      toast.info("Edite o evento original para alterar todas as repetições");
      return;
    }
    setEditingEvent(event);
    setSelectedDay(parseInt(event.event_date.split("-")[2]));
    setEventDate(event.event_date);
    setTitle(event.title);
    setDescription(event.description || "");
    setStartTime(event.start_time?.slice(0, 5) || "");
    setEndTime(event.end_time?.slice(0, 5) || "");
    setCategory(normalizeCategory(event.category));
    setReminderMinutes(event.reminder_minutes !== null ? String(event.reminder_minutes) : "none");
    setRecurrence(event.recurrence || "none");
    setShowDayDialog(false);
    setShowCreateDialog(true);
  };

  const handleSaveEvent = async () => {
    if (!user || !title.trim() || !eventDate) return;
    const reminder = reminderMinutes === "none" ? null : parseInt(reminderMinutes);
    const cat = CATEGORIES[category];

    const payload: any = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: eventDate,
      start_time: startTime || null,
      end_time: endTime || null,
      color: cat.color,
      category,
      reminder_minutes: reminder,
      recurrence,
    };

    if (editingEvent) {
      const { error } = await supabase.from("calendar_events").update(payload).eq("id", editingEvent.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Evento atualizado!");
    } else {
      const { error } = await supabase.from("calendar_events").insert({ ...payload, user_id: user.id });
      if (error) { toast.error("Erro ao criar evento"); return; }
      toast.success("Evento criado!");
    }

    // If saved into a different month, navigate to it
    const [y, m] = eventDate.split("-").map(Number);
    if (y !== currentYear || m - 1 !== currentMonth) {
      setCurrentYear(y);
      setCurrentMonth(m - 1);
    }

    setShowCreateDialog(false);
    resetForm();
    fetchEvents();
  };

  const toggleComplete = async (event: CalendarEvent) => {
    if (event.id.includes("_r_")) {
      if (!user) return;
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        start_time: event.start_time,
        end_time: event.end_time,
        color: event.color,
        category: event.category,
        reminder_minutes: event.reminder_minutes,
        is_completed: true,
        recurrence: "none",
        recurrence_parent_id: event.recurrence_parent_id,
      });
      if (!error) fetchEvents();
      return;
    }
    await supabase.from("calendar_events").update({ is_completed: !event.is_completed }).eq("id", event.id);
    fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    if (id.includes("_r_")) {
      toast.info("Apague o evento original para remover todas as repetições");
      return;
    }
    await supabase.from("calendar_events").delete().eq("id", id);
    toast.success("Evento removido");
    fetchEvents();
  };

  const formatTime = (time: string | null) => time ? time.slice(0, 5) : "";
  const selectedDateStr = selectedDay ? `${selectedDay} de ${monthNames[currentMonth]}` : "";
  const dayDialogEvts = dayDialogDay !== null ? getEventsForDay(dayDialogDay) : [];

  return (
    <>
      <div className="bg-card rounded-2xl p-4 shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={handlePrevMonth} className="p-1">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-display font-semibold">
            {monthNames[currentMonth]} {currentYear}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => openCreateForDay()} className="p-1 text-gold hover:text-gold/80" title="Agendar evento">
              <Plus className="h-4 w-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <span key={i} className="text-[10px] font-body text-muted-foreground font-medium py-1">{d}</span>
          ))}
        </div>

        {/* Calendar Grid — Google Calendar style */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map(i => <div key={`blank-${i}`} className="min-h-[74px]" />)}
          {days.map(day => {
            const isToday = isCurrentMonth && day === today;
            const dayEvts = getEventsForDay(day);
            const visible = dayEvts.slice(0, 3);
            const extra = dayEvts.length - visible.length;

            return (
              <button
                key={day}
                onClick={() => openDayDetail(day)}
                className={`relative min-h-[74px] p-1 rounded-lg text-left transition-colors border ${
                  isToday
                    ? "border-gold/60 bg-gold/5"
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <span className={`block text-[11px] font-body font-semibold leading-none mb-1 ${
                  isToday ? "text-gold" : "text-foreground"
                }`}>
                  {day}
                </span>
                <div className="space-y-[2px]">
                  {visible.map(evt => {
                    const cat = CATEGORIES[normalizeCategory(evt.category)];
                    return (
                      <div
                        key={evt.id}
                        className="truncate rounded-[3px] px-1 text-[9px] leading-[13px] font-body font-medium"
                        style={{
                          backgroundColor: cat.color,
                          color: cat.text,
                          textDecoration: evt.is_completed ? "line-through" : "none",
                          opacity: evt.is_completed ? 0.7 : 1,
                        }}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    );
                  })}
                  {extra > 0 && (
                    <div className="text-[9px] leading-[13px] font-body text-muted-foreground px-1">
                      +{extra} mais
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Category legend */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORIES) as CategoryKey[]).map(k => (
            <span key={k} className="inline-flex items-center gap-1 text-[10px] font-body text-muted-foreground">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: CATEGORIES[k].color }} />
              {CATEGORIES[k].label}
            </span>
          ))}
        </div>

        {events.length === 0 && (
          <button
            onClick={() => openCreateForDay()}
            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-gold hover:border-gold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="text-xs font-body">Agendar evento</span>
          </button>
        )}
      </div>

      {/* Day detail dialog */}
      <Dialog open={showDayDialog} onOpenChange={setShowDayDialog}>
        <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              {dayDialogDay} de {monthNames[currentMonth]}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {dayDialogEvts.map(evt => {
              const cat = CATEGORIES[normalizeCategory(evt.category)];
              return (
                <div key={evt.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 group">
                  <button
                    onClick={() => toggleComplete(evt)}
                    className={`flex-shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
                      evt.is_completed ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/40 hover:border-gold"
                    }`}
                    style={{ width: 18, height: 18 }}
                  >
                    {evt.is_completed && <Check className="h-2.5 w-2.5 text-white" />}
                  </button>
                  <span className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-body font-semibold truncate ${evt.is_completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {evt.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-body px-1.5 py-0.5 rounded" style={{ backgroundColor: cat.color, color: cat.text }}>
                        {cat.label}
                      </span>
                      {evt.start_time && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {formatTime(evt.start_time)}{evt.end_time && ` – ${formatTime(evt.end_time)}`}
                        </span>
                      )}
                      {evt.recurrence && evt.recurrence !== "none" && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Repeat className="h-2.5 w-2.5" />
                          {RECURRENCE_OPTIONS.find(o => o.value === evt.recurrence)?.label}
                        </span>
                      )}
                      {evt.reminder_minutes !== null && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Bell className="h-2.5 w-2.5" />
                          {REMINDER_OPTIONS.find(r => r.value === String(evt.reminder_minutes))?.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button onClick={() => openEditEvent(evt)} className="p-1 text-muted-foreground hover:text-gold">
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button onClick={() => deleteEvent(evt.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            <Button
              onClick={() => { setShowDayDialog(false); openCreateForDay(dayDialogDay ?? undefined); }}
              variant="outline"
              className="w-full font-body"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar evento neste dia
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Event Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-base">
              {editingEvent ? "Editar Evento" : `Agendar — ${selectedDateStr}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input placeholder="Título do evento" value={title} onChange={e => setTitle(e.target.value)} className="font-body" />
            <Textarea placeholder="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} className="font-body resize-none" rows={2} />

            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">Data</label>
              <Input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="font-body text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Início</label>
                <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="font-body text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-body mb-1 block">Fim</label>
                <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="font-body text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 block">Categoria</label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryKey)}>
                <SelectTrigger className="font-body text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORIES) as CategoryKey[]).map(k => (
                    <SelectItem key={k} value={k} className="font-body">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CATEGORIES[k].color }} />
                        {CATEGORIES[k].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 flex items-center gap-1">
                <Repeat className="h-3 w-3" /> Repetir
              </label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger className="font-body text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="font-body">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground font-body mb-1 flex items-center gap-1">
                <Bell className="h-3 w-3" /> Lembrete (push)
              </label>
              <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                <SelectTrigger className="font-body text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REMINDER_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="font-body">{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveEvent} disabled={!title.trim() || !eventDate} className="w-full bg-gold hover:bg-gold/90 text-primary-foreground font-display">
              {editingEvent ? "Salvar Alterações" : "Agendar Evento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
