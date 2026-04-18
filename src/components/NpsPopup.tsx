import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "glow-nps-state";
const COOLDOWN_DAYS = 60; // ask again only after 60 days

interface NpsState {
  lastAskedAt?: string;
  dismissedCount?: number;
  submittedAt?: string;
}

function getState(): NpsState {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}
function setState(s: NpsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export default function NpsPopup() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const state = getState();
    const now = Date.now();

    // Already submitted recently → skip
    if (state.submittedAt) {
      const days = (now - new Date(state.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days < COOLDOWN_DAYS) return;
    }
    // Recently dismissed → wait 7 days
    if (state.lastAskedAt) {
      const days = (now - new Date(state.lastAskedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days < 7) return;
    }
    // Show after 25s of session
    const timer = setTimeout(() => setOpen(true), 25_000);
    return () => clearTimeout(timer);
  }, [user?.id]);

  const handleClose = (reason: "dismiss" | "submit") => {
    const s = getState();
    if (reason === "submit") {
      setState({ ...s, submittedAt: new Date().toISOString() });
    } else {
      setState({ ...s, lastAskedAt: new Date().toISOString(), dismissedCount: (s.dismissedCount || 0) + 1 });
    }
    setOpen(false);
    setScore(null);
    setComment("");
  };

  const handleSubmit = async () => {
    if (score === null || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("nps_responses").insert({
      user_id: user.id,
      score,
      comment: comment.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Não conseguimos registrar sua nota. Tente novamente.");
      return;
    }
    toast.success("Obrigada, rainha! Sua opinião faz o Glow Up brilhar ainda mais ✨");
    handleClose("submit");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose("dismiss"); }}>
      <DialogContent className="max-w-md bg-background border-gold/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gold">
            <Sparkles className="h-5 w-5" />
            Como está sua experiência?
          </DialogTitle>
          <DialogDescription>
            De 0 a 10, qual a chance de você indicar o Glow Up Club para uma amiga?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-11 gap-1 py-2">
          {Array.from({ length: 11 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScore(i)}
              className={cn(
                "h-9 rounded-md border text-sm font-semibold transition-all",
                score === i
                  ? "bg-gold text-primary-foreground border-gold scale-110 shadow-gold"
                  : "border-border hover:border-gold/60 hover:bg-gold/5"
              )}
              aria-label={`Nota ${i}`}
            >
              {i}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground -mt-1">
          <span>Nada provável</span>
          <span>Muito provável</span>
        </div>

        {score !== null && (
          <div className="space-y-2 pt-2">
            <label className="text-sm text-muted-foreground">
              {score >= 9 ? "O que você mais ama? 💛" : score >= 7 ? "O que poderíamos melhorar?" : "O que está faltando para você?"}
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Sua opinião (opcional)"
              maxLength={500}
              className="min-h-[80px]"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => handleClose("dismiss")} disabled={submitting}>
            Agora não
          </Button>
          <Button
            variant="gold"
            onClick={handleSubmit}
            disabled={score === null || submitting}
          >
            <Star className="h-4 w-4" />
            Enviar avaliação
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
