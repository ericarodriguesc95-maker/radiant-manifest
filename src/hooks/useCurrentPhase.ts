import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type Phase = "menstrual" | "folicular" | "ovulatoria" | "lutea";
export const phaseNames: Record<Phase, string> = { menstrual: "Menstrual", folicular: "Folicular", ovulatoria: "Ovulatória", lutea: "Lútea" };

export function useCurrentPhase() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase | null>(null);
  useEffect(() => {
    let active = true;
    setPhase(null);
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from("cycle_logs").select("period_start").eq("user_id", user.id).order("period_start", { ascending: false }).limit(6);
      if (!active || !data?.length) return;
      let avg = 28;
      if (data.length >= 2) {
        let total = 0;
        const n = Math.min(data.length, 5);
        for (let i = 0; i < n - 1; i++) total += differenceInDays(new Date(`${data[i].period_start}T12:00:00`), new Date(`${data[i + 1].period_start}T12:00:00`));
        avg = Math.max(21, Math.min(35, Math.round(total / (n - 1)) || 28));
      }
      const day = (differenceInDays(new Date(), new Date(`${data[0].period_start}T12:00:00`)) % avg + avg) % avg + 1;
      setPhase(day <= 5 ? "menstrual" : day <= 13 ? "folicular" : day <= 16 ? "ovulatoria" : "lutea");
    };
    void load();
    window.addEventListener("cycle:updated", load);
    return () => { active = false; window.removeEventListener("cycle:updated", load); };
  }, [user]);
  return phase;
}