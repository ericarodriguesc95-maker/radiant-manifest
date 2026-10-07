import { Medal, Award, Crown, Star, Gem } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedEmoji from "@/components/ui/animated-emoji";

const MEDALS = [
  { days: 7, label: "7 Dias", icon: Medal },
  { days: 14, label: "14 Dias", icon: Award },
  { days: 30, label: "30 Dias", icon: Crown },
  { days: 60, label: "60 Dias", icon: Star },
  { days: 90, label: "90 Dias", icon: Gem },
];

export default function StreakMedals({ streak }: { streak: number }) {
  const lastUnlocked = [...MEDALS].reverse().find((m) => streak >= m.days)?.days;
  return (
    <div className="bg-card rounded-card border border-border p-4 shadow-card">
      <h3 className="mb-3 flex items-center gap-2 font-display text-base font-normal">
        Medalhas <span className="title-accent">conquistadas</span>
      </h3>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {MEDALS.map((medal) => {
          const Icon = medal.icon;
          const unlocked = streak >= medal.days;
          return (
            <div key={medal.days} className="flex min-w-[56px] flex-col items-center gap-1.5">
              <div className={cn("relative flex h-12 w-12 items-center justify-center rounded-full bg-muted", unlocked && "shine bg-highlight-butter shadow-card")}>
                {unlocked && medal.days === lastUnlocked ? (
                  <AnimatedEmoji name={medal.days >= 30 ? "crown" : "trophy"} size={26} motion="pop" />
                ) : (
                  <Icon className={cn("h-5 w-5", unlocked ? "text-primary" : "text-muted-foreground/40")} strokeWidth={1.6} />
                )}
              </div>
              <span className={cn("text-[10px] font-body font-semibold", unlocked ? "text-primary" : "text-muted-foreground/50")}>{medal.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
