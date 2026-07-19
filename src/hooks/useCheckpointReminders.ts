import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LAST_SHOWN_KEY = "cp_reminder_last_shown";

async function logEvent(
  user_id: string,
  event_type: "received" | "snoozed" | "completed",
  extra: { snooze_hours?: number; source?: string; metadata?: any } = {},
) {
  try {
    await supabase.from("reminder_events").insert({
      user_id,
      event_type,
      snooze_hours: extra.snooze_hours ?? null,
      source: extra.source ?? "scheduled",
      metadata: extra.metadata ?? {},
    });
  } catch {}
}

async function triggerReminder(tag?: string) {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch {}
  }
  if (Notification.permission !== "granted") return false;

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: "SHOW_CHECKPOINT_REMINDER", tag });
      return true;
    }
  } catch {}

  new Notification("Check-points do dia 👑", {
    body: "Bora somar pontos, rainha! Complete os seus check-points e suba no ranking.",
    icon: "/icon-192.png",
    tag: tag || "checkpoints-reminder",
  });
  return true;
}

export function useCheckpointReminders() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timerId: number | undefined;
    const snoozeTimers: number[] = [];
    let completedLoggedToday = false;
    let lastCompletedDay = "";

    const onSwMessage = (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type === "SCHEDULE_CHECKPOINT_SNOOZE" && typeof msg.hours === "number") {
        const hours: number = msg.hours;
        logEvent(user.id, "snoozed", { snooze_hours: hours, source: "notification-action" });
        const ms = hours * 60 * 60 * 1000;
        const id = window.setTimeout(async () => {
          const shown = await triggerReminder(`checkpoints-reminder-snooze-${Date.now()}`);
          if (shown) logEvent(user.id, "received", { source: "snooze" });
        }, ms);
        snoozeTimers.push(id);
      }
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", onSwMessage);
    }

    const tick = async () => {
      try {
        const { data: prof } = await supabase
          .from("profiles")
          .select("checkpoint_reminder_enabled, checkpoint_reminder_times")
          .eq("user_id", user.id)
          .maybeSingle();
        if (cancelled || !prof?.checkpoint_reminder_enabled) return;

        const times: string[] = (prof.checkpoint_reminder_times as any) || [];
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        if (!times.includes(hhmm)) return;

        const lastRaw = localStorage.getItem(LAST_SHOWN_KEY);
        const key = `${now.toISOString().split("T")[0]}_${hhmm}`;
        if (lastRaw === key) return;
        localStorage.setItem(LAST_SHOWN_KEY, key);

        const shown = await triggerReminder();
        if (shown) logEvent(user.id, "received", { source: "scheduled", metadata: { time: hhmm } });
      } catch {}
    };

    const schedule = () => {
      const now = new Date();
      const msToNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
      timerId = window.setTimeout(async () => {
        if (cancelled) return;
        await tick();
        schedule();
      }, msToNextMinute + 50);
    };
    schedule();

    // Log "completed" once per day when the user marks any checkpoint AFTER a reminder was received today
    const channel = supabase
      .channel(`cp-completed-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "daily_checkpoints", filter: `user_id=eq.${user.id}` },
        async () => {
          const today = new Date().toISOString().split("T")[0];
          if (lastCompletedDay !== today) {
            completedLoggedToday = false;
            lastCompletedDay = today;
          }
          if (completedLoggedToday) return;
          try {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const { data } = await supabase
              .from("reminder_events")
              .select("id,event_type")
              .eq("user_id", user.id)
              .gte("created_at", startOfDay.toISOString());
            const hasReceived = (data || []).some((e) => e.event_type === "received" || e.event_type === "snoozed");
            const alreadyCompleted = (data || []).some((e) => e.event_type === "completed");
            if (hasReceived && !alreadyCompleted) {
              await logEvent(user.id, "completed", { source: "auto" });
              completedLoggedToday = true;
            }
          } catch {}
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      snoozeTimers.forEach((id) => window.clearTimeout(id));
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage);
      }
      supabase.removeChannel(channel);
    };
  }, [user]);
}
