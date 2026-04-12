import { useState, useEffect } from "react";
import { Trophy, Flame, Medal, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderEntry {
  rank: number;
  name: string;
  avatar: string;
  streak: number;
  medals: number;
  isUser: boolean;
}

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
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      // Get all users who have completions
      const { data: completions } = await supabase
        .from("daily_completions" as any)
        .select("user_id, completion_date, all_completed")
        .eq("all_completed", true)
        .order("completion_date", { ascending: false });

      if (!completions) { setLoading(false); return; }

      // Group by user and calculate streaks
      const userDates: Record<string, string[]> = {};
      (completions as any[]).forEach((c: any) => {
        if (!userDates[c.user_id]) userDates[c.user_id] = [];
        userDates[c.user_id].push(c.completion_date);
      });

      // Calculate streak for each user
      const userStreaks: { userId: string; streak: number }[] = [];
      for (const [userId, dates] of Object.entries(userDates)) {
        const sorted = dates.sort((a, b) => b.localeCompare(a)); // newest first
        let streak = 0;
        const today = new Date().toISOString().split("T")[0];
        let checkDate = new Date(today);

        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split("T")[0];
          if (sorted.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (dateStr === today) {
            // Today might not be completed yet, skip
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
        if (streak > 0) userStreaks.push({ userId, streak });
      }

      // Get profiles
      const userIds = userStreaks.map(u => u.userId);
      const { data: profiles } = await supabase
        .from("profiles_public" as any)
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds.length > 0 ? userIds : ["none"]);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.user_id] = p; });

      const leaderEntries: LeaderEntry[] = userStreaks
        .sort((a, b) => b.streak - a.streak)
        .map((u, i) => {
          const profile = profileMap[u.userId];
          return {
            rank: i + 1,
            name: u.userId === user.id ? "Você" : (profile?.display_name || "Usuária"),
            avatar: profile?.avatar_url ? "👤" : "💎",
            streak: u.streak,
            medals: [7, 14, 30, 60, 90].filter(m => u.streak >= m).length,
            isUser: u.userId === user.id,
          };
        });

      // If current user not in list, add with 0 streak
      if (!leaderEntries.find(e => e.isUser)) {
        leaderEntries.push({
          rank: leaderEntries.length + 1,
          name: "Você",
          avatar: "💎",
          streak: 0,
          medals: 0,
          isUser: true,
        });
      }

      setEntries(leaderEntries);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [user]);

  const top7 = entries.slice(0, 7);
  const userInTop = top7.find(e => e.isUser);
  const userRanked = entries.find(e => e.isUser);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="p-4 pb-2 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-gold" />
        <h3 className="text-sm font-display font-semibold">Ranking de Streak</h3>
      </div>

      {loading ? (
        <div className="p-4 text-center text-muted-foreground text-sm font-body">Carregando...</div>
      ) : entries.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground text-sm font-body">Complete seus hábitos para aparecer no ranking!</div>
      ) : (
        <div className="divide-y divide-border">
          {top7.map((entry) => (
            <div
              key={entry.name + entry.rank}
              className={cn(
                "flex items-center gap-3 px-4 py-3 border-l-2 transition-all",
                getRankStyle(entry.rank),
                entry.isUser && "ring-1 ring-gold/30"
              )}
            >
              <div className="w-6 flex justify-center">{getRankIcon(entry.rank)}</div>
              <span className="text-xl">{entry.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-body font-semibold truncate", entry.isUser && "text-gold")}>{entry.name}</p>
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

          {!userInTop && userRanked && (
            <>
              <div className="px-4 py-1.5 text-center text-muted-foreground text-[10px] font-body">• • •</div>
              <div className={cn("flex items-center gap-3 px-4 py-3 border-l-2 ring-1 ring-gold/30", getRankStyle(userRanked.rank))}>
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
      )}
    </div>
  );
}
