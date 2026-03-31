import { useState, useEffect } from "react";
import { Award, Crown, Sparkles, X, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Badge {
  id: string;
  blockNumber: number;
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
}

const badges: Badge[] = [
  {
    id: "identidade",
    blockNumber: 1,
    title: "Identidade Restaurada",
    subtitle: "Você reconheceu quem Deus te chamou para ser",
    emoji: "🦋",
    gradient: "from-rose-500/30 to-pink-500/30",
  },
  {
    id: "sabedoria",
    blockNumber: 2,
    title: "Mente Renovada",
    subtitle: "Você alinhou seus pensamentos à verdade",
    emoji: "💡",
    gradient: "from-amber-500/30 to-yellow-500/30",
  },
  {
    id: "proposito",
    blockNumber: 3,
    title: "Mulher Governada",
    subtitle: "Você vive alinhada e com propósito",
    emoji: "👑",
    gradient: "from-emerald-500/30 to-teal-500/30",
  },
];

const MASTER_BADGE = {
  title: "Destravada",
  subtitle: "Você completou toda a jornada. Sua identidade foi restaurada.",
  emoji: "✦",
  verse: "Aquele que em vós começou a boa obra a aperfeiçoará até ao Dia de Cristo Jesus.",
  verseRef: "Filipenses 1:6",
};

interface BlockBadgesProps {
  completedBlocks: string[]; // array of block ids that are 100%
}

export default function BlockBadges({ completedBlocks }: BlockBadgesProps) {
  const { user } = useAuth();
  const [sharing, setSharing] = useState(false);
  const allComplete = badges.every(b => completedBlocks.includes(b.id));

  const shareToCommmunity = async () => {
    if (!user || sharing) return;
    setSharing(true);
    try {
      const unlockedBadges = badges.filter(b => completedBlocks.includes(b.id));
      const badgeEmojis = unlockedBadges.map(b => b.emoji).join(" ");
      const badgeNames = unlockedBadges.map(b => b.title).join(", ");

      let text: string;
      if (allComplete) {
        text = `${MASTER_BADGE.emoji} Completei a Jornada do Destravar Feminino! ${MASTER_BADGE.emoji}\n\n${badgeEmojis} Todas as conquistas desbloqueadas: ${badgeNames}\n\n"${MASTER_BADGE.verse}" — ${MASTER_BADGE.verseRef}\n\n#DestravadaFeminino #JornadaCompleta ✨`;
      } else {
        text = `${badgeEmojis} Desbloqueei ${unlockedBadges.length === 1 ? "uma conquista" : `${unlockedBadges.length} conquistas`} na Jornada do Destravar Feminino!\n\n🏆 ${badgeNames}\n\n#DestravadaFeminino #GlowUp ✨`;
      }

      await supabase.from("community_posts").insert({
        user_id: user.id,
        text,
      });
      toast.success("Conquista compartilhada na comunidade! ✨");
    } catch {
      toast.error("Erro ao compartilhar. Tente novamente.");
    } finally {
      setSharing(false);
    }
  };

  if (completedBlocks.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-gold" />
          <p className="text-xs font-display font-bold text-gold uppercase tracking-wider">
            Suas Conquistas
          </p>
        </div>
        <button
          onClick={shareToCommmunity}
          disabled={sharing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 text-gold text-[10px] font-body font-semibold transition-colors disabled:opacity-50"
        >
          <Share2 className="h-3 w-3" />
          {sharing ? "Postando..." : "Compartilhar"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {badges.map(badge => {
          const unlocked = completedBlocks.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={cn(
                "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                unlocked
                  ? `bg-gradient-to-br ${badge.gradient} border-gold/30`
                  : "bg-muted/20 border-border opacity-40 grayscale"
              )}
            >
              <span className="text-2xl">{badge.emoji}</span>
              <p className="text-[10px] font-display font-bold text-foreground leading-tight">
                {badge.title}
              </p>
              {unlocked && (
                <p className="text-[9px] font-body text-muted-foreground leading-tight">
                  {badge.subtitle}
                </p>
              )}
              {!unlocked && (
                <p className="text-[9px] font-body text-muted-foreground">Bloqueada</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Master badge */}
      {allComplete && (
        <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-xl border border-gold/40 p-4 text-center space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-gold" />
            <span className="text-lg">{MASTER_BADGE.emoji}</span>
            <Crown className="h-5 w-5 text-gold" />
          </div>
          <p className="text-sm font-display font-bold text-gold">{MASTER_BADGE.title}</p>
          <p className="text-[10px] font-body text-muted-foreground">{MASTER_BADGE.subtitle}</p>
          <div className="bg-gold/5 border border-gold/15 rounded-lg p-2.5 mt-1 space-y-0.5">
            <p className="text-[11px] font-body text-foreground italic leading-relaxed">
              "{MASTER_BADGE.verse}"
            </p>
            <p className="text-[10px] font-body font-semibold text-gold">— {MASTER_BADGE.verseRef}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Celebration Modal ───────────────────────────────────────────────────────

interface BadgeCelebrationProps {
  blockId: string | null;
  onClose: () => void;
}

export function BadgeCelebration({ blockId, onClose }: BadgeCelebrationProps) {
  const badge = badges.find(b => b.id === blockId);
  const isMaster = blockId === "master";

  useEffect(() => {
    if (!blockId) return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [blockId, onClose]);

  if (!blockId || (!badge && !isMaster)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-card border border-gold/30 rounded-2xl p-8 max-w-xs mx-4 text-center space-y-3 animate-scale-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-gold animate-pulse" />
        </div>

        <span className="text-5xl block">
          {isMaster ? MASTER_BADGE.emoji : badge!.emoji}
        </span>

        <p className="text-[10px] font-body font-bold text-gold uppercase tracking-wider">
          {isMaster ? "Jornada Completa!" : "Nova Conquista!"}
        </p>

        <p className="text-lg font-display font-bold text-foreground">
          {isMaster ? MASTER_BADGE.title : badge!.title}
        </p>

        <p className="text-xs font-body text-muted-foreground">
          {isMaster ? MASTER_BADGE.subtitle : badge!.subtitle}
        </p>

        {isMaster && (
          <div className="bg-gold/5 border border-gold/15 rounded-xl p-3 mt-2 space-y-1">
            <p className="text-[11px] font-body text-foreground italic leading-relaxed">
              "{MASTER_BADGE.verse}"
            </p>
            <p className="text-[10px] font-body font-semibold text-gold">— {MASTER_BADGE.verseRef}</p>
          </div>
        )}
      </div>
    </div>
  );
}
