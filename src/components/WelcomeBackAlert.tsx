import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const LAST_VISIT_KEY = "glowup-last-visit";

export default function WelcomeBackAlert() {
  const { user, profile } = useAuth();
  const [show, setShow] = useState(false);
  const [newUpdatesCount, setNewUpdatesCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const now = Date.now();
    localStorage.setItem(LAST_VISIT_KEY, String(now));

    // Only show if last visit was >1h ago
    if (!lastVisit || now - parseInt(lastVisit) < 60 * 60 * 1000) return;

    // Check for new updates since last visit
    const checkUpdates = async () => {
      const since = new Date(parseInt(lastVisit)).toISOString();
      const [{ count: totalNew }, { data: reads }] = await Promise.all([
        supabase
          .from("app_updates")
          .select("*", { count: "exact", head: true })
          .gt("created_at", since),
        supabase
          .from("app_update_reads")
          .select("update_id")
          .eq("user_id", user.id),
      ]);

      setNewUpdatesCount(totalNew || 0);
      setShow(true);

      // Auto dismiss after 5s
      setTimeout(() => setShow(false), 5000);
    };

    checkUpdates();
  }, [user]);

  if (!show) return null;

  const name = profile?.display_name?.split(" ")[0] || "Girl";

  return (
    <div className="fixed top-4 left-3 right-3 z-50 animate-slide-down">
      <div className="bg-card border border-gold/30 rounded-2xl shadow-[0_8px_32px_hsl(43_72%_52%/0.12)] p-3 flex items-center gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-heading font-bold text-foreground">
            Bem-vinda de volta, {name}! 🦋
          </p>
          <p className="text-[11px] font-body text-muted-foreground">
            {newUpdatesCount > 0
              ? `${newUpdatesCount} novidade${newUpdatesCount > 1 ? "s" : ""} te esperando ✨`
              : "Continue sua jornada de transformação ✨"}
          </p>
        </div>
        <button onClick={() => setShow(false)} className="p-1 text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
