import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedEmoji from "@/components/ui/animated-emoji";

export default function StreakSidebarCard() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<number | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.rpc("calculate_streak" as any, { _user_id: user.id }).then(({ data }) => setStreak((data as number) ?? 0));
  }, [user]);
  return (
    <div className="rounded-card bg-highlight-butter p-4 shadow-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">Sequência</p>
      <p className="mt-1 flex items-center gap-2 font-display text-2xl text-foreground">
        <AnimatedEmoji name="fire" motion="pop" /> {streak ?? "–"} <span className="title-accent text-lg">dias</span>
      </p>
    </div>
  );
}
