import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LAST_SHOWN_KEY = "cp_reminder_last_shown";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export function useCheckpointReminders() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    let timerId: number | undefined;

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

        if ("Notification" in window) {
          if (Notification.permission === "default") {
            try { await Notification.requestPermission(); } catch {}
          }
          if (Notification.permission === "granted") {
            new Notification("Check-points do dia 👑", {
              body: "Bora somar pontos, rainha! Complete os seus check-points e suba no ranking.",
              icon: "/favicon.ico",
              tag: "checkpoints-reminder",
            });
          }
        }
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
    return () => { cancelled = true; if (timerId) window.clearTimeout(timerId); };
  }, [user]);
}
