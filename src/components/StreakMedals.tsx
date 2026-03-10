import { Medal, Award, Crown, Star, Gem } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedalInfo {
  days: number;
  label: string;
  icon: React.ElementType;
  gradient: string;
  glow: string;
}

const MEDALS: MedalInfo[] = [
  { days: 7, label: "7 Dias", icon: Medal, gradient: "from-amber-600 to-amber-400", glow: "shadow-[0_0_12px_hsl(43_56%_52%/0.4)]" },
  { days: 14, label: "14 Dias", icon: Award, gradient: "from-amber-500 to-yellow-300", glow: "shadow-[0_0_16px_hsl(43_56%_52%/0.5)]" },
  { days: 30, label: "30 Dias", icon: Crown, gradient: "from-yellow-400 to-amber-200", glow: "shadow-[0_0_20px_hsl(43_56%_52%/0.6)]" },
  { days: 60, label: "60 Dias", icon: Star, gradient: "from-rose-400 to-pink-300", glow: "shadow-[0_0_20px_hsl(350_70%_60%/0.4)]" },
  { days: 90, label: "90 Dias", icon: Gem, gradient: "from-violet-400 to-purple-300", glow: "shadow-[0_0_20px_hsl(270_60%_60%/0.4)]" },
];

interface StreakMedalsProps {
  streak: number;
}

export default function StreakMedals({ streak }: StreakMedalsProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-4">
      <h3 className="text-sm font-display font-semibold mb-3">Medalhas Conquistadas</h3>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {MEDALS.map((medal) => {
          const Icon = medal.icon;
          const unlocked = streak >= medal.days;
          return (
            <div key={medal.days} className="flex flex-col items-center gap-1.5 min-w-[56px]">
              <div
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-500",
                  unlocked
                    ? `bg-gradient-to-br ${medal.gradient} ${medal.glow}`
                    : "bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    unlocked ? "text-primary-foreground" : "text-muted-foreground/40"
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-body font-semibold",
                  unlocked ? "text-gold" : "text-muted-foreground/40"
                )}
              >
                {medal.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
