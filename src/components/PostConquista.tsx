import { useState } from "react";
import { Award, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface PostConquistaProps {
  completedCount: number;
  totalCount: number;
  streak: number;
}

const conquistas = [
  "Completei minha meditação e checklist hoje! 🧘‍♀️✨",
  "Mais um dia de hábitos saudáveis concluídos! 💪🔥",
  "Dia produtivo: todos os hábitos feitos! 🌟",
  "Mantendo o foco na minha evolução! 🦋✨",
];

export default function PostConquista({ completedCount, totalCount, streak }: PostConquistaProps) {
  const [posted, setPosted] = useState(false);
  const navigate = useNavigate();

  const handlePost = () => {
    const randomMsg = conquistas[Math.floor(Math.random() * conquistas.length)];
    const streakMsg = streak > 1 ? ` | 🔥 ${streak} dias seguidos!` : "";
    const fullMsg = `${randomMsg}${streakMsg} (${completedCount}/${totalCount} hábitos)`;

    // Store in sessionStorage for ComunidadePage to pick up
    sessionStorage.setItem("pending-conquista", fullMsg);
    setPosted(true);

    setTimeout(() => {
      navigate("/comunidade");
    }, 800);
  };

  if (completedCount < 2) return null;

  return (
    <div className={cn(
      "bg-card rounded-2xl border border-border p-4 transition-all duration-300",
      posted && "bg-gold/10 border-gold/30"
    )}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
          <Award className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-body font-semibold text-foreground">Conquista do dia!</p>
          <p className="text-xs font-body text-muted-foreground">
            {completedCount}/{totalCount} hábitos • Compartilhe com as girls
          </p>
        </div>
        <Button
          variant="gold"
          size="sm"
          onClick={handlePost}
          disabled={posted}
          className="gap-1.5"
        >
          {posted ? (
            <><Sparkles className="h-3.5 w-3.5" /> Postado!</>
          ) : (
            <><Send className="h-3.5 w-3.5" /> Postar</>
          )}
        </Button>
      </div>
    </div>
  );
}
