import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { sendCycleFertileNotification, sendCyclePeriodNotification } from "@/lib/notifications";
import { differenceInDays, addDays } from "date-fns";

const CYCLE_FERTILE_KEY = "glowup_last_fertile_notif";
const CYCLE_PERIOD_KEY = "glowup_last_period_notif";

/**
 * Checks cycle logs on app load and sends push notifications
 * when the fertile window or next period is approaching (0-3 days).
 * Each alert fires at most once per day.
 */
export function useCycleNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const today = new Date().toDateString();

    async function check() {
      const { data: logs } = await supabase
        .from("cycle_logs")
        .select("period_start")
        .eq("user_id", user!.id)
        .order("period_start", { ascending: false })
        .limit(6);

      if (!logs || logs.length < 1) return;

      // Calculate average cycle length
      let avgCycleLength = 28;
      if (logs.length >= 2) {
        let totalDiff = 0;
        const count = Math.min(logs.length, 5);
        for (let i = 0; i < count - 1; i++) {
          totalDiff += differenceInDays(
            new Date(logs[i].period_start),
            new Date(logs[i + 1].period_start)
          );
        }
        avgCycleLength = Math.round(totalDiff / (count - 1));
      }

      const lastPeriodStart = new Date(logs[0].period_start);
      const currentDay = differenceInDays(new Date(), lastPeriodStart) + 1;
      const ovulationDay = avgCycleLength - 14;
      const fertileStart = ovulationDay - 4;
      const nextPeriod = addDays(lastPeriodStart, avgCycleLength);
      const daysUntilPeriod = differenceInDays(nextPeriod, new Date());
      const daysUntilFertile = fertileStart - currentDay;

      // Fertile window alert (0-3 days before)
      if (daysUntilFertile >= 0 && daysUntilFertile <= 3) {
        if (localStorage.getItem(CYCLE_FERTILE_KEY) !== today) {
          localStorage.setItem(CYCLE_FERTILE_KEY, today);
          sendCycleFertileNotification(daysUntilFertile);
        }
      }

      // Period alert (0-3 days before)
      if (daysUntilPeriod >= 0 && daysUntilPeriod <= 3) {
        if (localStorage.getItem(CYCLE_PERIOD_KEY) !== today) {
          localStorage.setItem(CYCLE_PERIOD_KEY, today);
          sendCyclePeriodNotification(daysUntilPeriod);
        }
      }
    }

    // Check on load and then every 6 hours
    check();
    const interval = setInterval(check, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);
}
