import { Trophy, Flame, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  streak: number;
  medals: number;
}

const MOCK_LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: "Marina Silva", avatar: "🦋", streak: 45, medals: 4 },
  { rank: 2, name: "Camila Santos", avatar: "🌸", streak: 32, medals: 3 },
  { rank: 3, name: "Fernanda Oliveira", avatar: "👑", streak: 28, medals: 3 },
  { rank: 4, name: "Ana Clara", avatar: "💫", streak: 21, medals: 2 },
  { rank: 5, name: "Juliana Costa", avatar: "🌺", streak: 14, medals: 2 },
  { rank: 6, name: "Beatriz Lima", avatar: "✨", streak: 9, medals: 1 },
  { rank: 7, name: "Larissa Rocha", avatar: "🌙", streak: 7, medals: 1 },
];

function getRankIcon(rank: number) {
  if (rank === 1) return <Crown className="h-4 w-4 text-gold" />;
  if (rank === 2) return <Medal className="h-4 w-4 text-gold" />;
  if (rank === 3) return <Trophy className="h-4 w-4 text-gold" />;
  return <span className="text-xs font-body font-bold text-muted-foreground w-4 text-center">{rank}</span>;
}

function getRankStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-r from-gold/20 to-transparent border-gold/30";
  if (rank === 2) return "bg-gold/10 border-gold/20";
  if (rank === 3) return "bg-gold/5 border-gold/10";
  return "bg-card border-border";
}

export default function Leaderboard() {
  const userStreak = parseInt(localStorage.getItem("glow-up-streak") || "0");

  // Insert user into leaderboard
  const allEntries = [...MOCK_LEADERBOARD];
  const userEntry: LeaderEntry = {
    rank: 0,
    name: "Você",
    avatar: "💎",
    streak: userStreak,
    medals: [7, 14, 30, 60, 90].filter(m => userStreak >= m).length,
  };

  allEntries.push(userEntry);
  allEntries.sort((a, b) => b.streak - a.streak);
  allEntries.forEach((e, i) => (e.rank = i + 1));

  const top7 = allEntries.slice(0, 7);
  const userInTop = top7.find(e => e.name === "Você");
  const userRanked = allEntries.find(e => e.name === "Você")!;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 pb-2 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h3 className="text-sm font-display font-semibold">Ranking de Streak</h3>
      </div>

      <div className="divide-y divide-border">
        {top7.map((entry) => (
          <div
            key={entry.name}
            className={cn(
              "flex items-center gap-3 px-4 py-3 border-l-2 transition-all",
              getRankStyle(entry.rank),
              entry.name === "Você" && "ring-1 ring-gold/30"
            )}
          >
            <div className="w-6 flex justify-center">{getRankIcon(entry.rank)}</div>
            <span className="text-xl">{entry.avatar}</span>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-body font-semibold truncate",
                entry.name === "Você" && "text-gold"
              )}>
                {entry.name}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                  <Flame className="h-3 w-3" /> {entry.streak} dias
                </span>
                {entry.medals > 0 && (
                  <span className="text-[10px] text-gold font-body flex items-center gap-0.5">
                    <Medal className="h-3 w-3" /> {entry.medals}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {!userInTop && (
          <>
            <div className="px-4 py-1.5 text-center text-muted-foreground text-[10px] font-body">• • •</div>
            <div
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-l-2 ring-1 ring-gold/30",
                getRankStyle(userRanked.rank)
              )}
            >
              <div className="w-6 flex justify-center">{getRankIcon(userRanked.rank)}</div>
              <span className="text-xl">{userRanked.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body font-semibold text-gold truncate">Você</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                    <Flame className="h-3 w-3" /> {userRanked.streak} dias
                  </span>
                  {userRanked.medals > 0 && (
                    <span className="text-[10px] text-gold font-body flex items-center gap-0.5">
                      <Medal className="h-3 w-3" /> {userRanked.medals}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
