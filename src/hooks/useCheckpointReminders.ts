import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LAST_SHOWN_KEY = "cp_reminder_last_shown";

async function triggerReminder(tag?: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch {}
  }
  if (Notification.permission !== "granted") return;

  // Prefer SW notification (supports action buttons for snooze)
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.active?.postMessage({ type: "SHOW_CHECKPOINT_REMINDER", tag });
      return;
    }
  } catch {}

  // Fallback (no actions)
  new Notification("Check-points do dia 👑", {
    body: "Bora somar pontos, rainha! Complete os seus check-points e suba no ranking.",
    icon: "/icon-192.png",
    tag: tag || "checkpoints-reminder",
  });
}

export function useCheckpointReminders() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timerId: number | undefined;
    const snoozeTimers: number[] = [];

    const onSwMessage = (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type === "SCHEDULE_CHECKPOINT_SNOOZE" && typeof msg.hours === "number") {
        const ms = msg.hours * 60 * 60 * 1000;
        const id = window.setTimeout(() => {
          triggerReminder(`checkpoints-reminder-snooze-${Date.now()}`);
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

        await triggerReminder();
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
    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
      snoozeTimers.forEach((id) => window.clearTimeout(id));
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", onSwMessage);
      }
    };
  }, [user]);
}
