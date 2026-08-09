import { useState } from "react";
import { Trophy, Flame } from "lucide-react";
import DailyCheckpoints from "@/components/DailyCheckpoints";
import LiveCheckpointLeaderboard from "@/components/LiveCheckpointLeaderboard";
import SectionHeading from "@/components/SectionHeading";
import { cn } from "@/lib/utils";

export default function CheckpointsPage() {
  const [tab, setTab] = useState<"mine" | "live">("mine");

  return (
    <div className="px-4 pt-2 pb-8 space-y-5 max-w-2xl mx-auto">
      <SectionHeading eyebrow="Rotina" title="Check-points do dia" />

      <div className="flex rounded-2xl border border-border overflow-hidden bg-card">
        <button
          onClick={() => setTab("mine")}
          className={cn(
            "flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition",
            tab === "mine" ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Trophy className="h-3.5 w-3.5" /> Meus pontos
        </button>
        <button
          onClick={() => setTab("live")}
          className={cn(
            "flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition",
            tab === "live" ? "text-gold bg-gold/10" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Flame className="h-3.5 w-3.5" /> Ranking ao vivo
        </button>
      </div>

      {tab === "mine" ? <DailyCheckpoints /> : <LiveCheckpointLeaderboard limit={30} />}
    </div>
  );
}
