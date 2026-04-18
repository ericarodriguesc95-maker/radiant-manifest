import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

/**
 * Floating bubble shown on Home (/) for both regular users and admins.
 * - Admin: shows count of suggestions awaiting reply (status: 'nova' or 'em_analise').
 * - User: shows count of admin replies on their suggestions newer than the last
 *   time the user opened the Suggestions page (tracked in localStorage).
 */
export default function SuggestionsFloatingButton() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const [count, setCount] = useState(0);

  // Only show on home
  const onHome = location.pathname === "/";

  const lastSeenKey = user ? `sugestoes-last-seen-${user.id}` : "";

  const loadCount = async () => {
    if (!user) return setCount(0);

    if (isAdmin) {
      // Admin: pending suggestions to reply
      const { count: pending } = await supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .in("status", ["nova", "em_analise"]);
      setCount(pending || 0);
      return;
    }

    // User: count admin replies newer than lastSeen on user's suggestions
    const lastSeen = localStorage.getItem(lastSeenKey) || "1970-01-01T00:00:00Z";
    const { data: mySuggestions } = await supabase
      .from("suggestions")
      .select("id")
      .eq("user_id", user.id);
    const ids = (mySuggestions || []).map((s) => s.id);
    if (ids.length === 0) return setCount(0);
    const { count: unread } = await supabase
      .from("suggestion_replies")
      .select("id", { count: "exact", head: true })
      .in("suggestion_id", ids)
      .eq("is_admin_reply", true)
      .gt("created_at", lastSeen);
    setCount(unread || 0);
  };

  useEffect(() => {
    loadCount();
    if (!user) return;
    // Realtime: refresh on changes to suggestions or replies
    const channel = supabase
      .channel("sugestoes-bubble")
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestion_replies" }, () => loadCount())
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestions" }, () => loadCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  if (!onHome || !user) return null;

  const href = isAdmin ? "/admin/sugestoes" : "/sugestoes";
  const label = isAdmin ? "Sugestões para responder" : "Sugestões e respostas";

  return (
    <Link
      to={href}
      aria-label={label}
      onClick={() => {
        if (!isAdmin) localStorage.setItem(lastSeenKey, new Date().toISOString());
      }}
      className={cn(
        "fixed z-40 right-4 bottom-24 md:bottom-6 md:right-6",
        "h-14 w-14 rounded-full bg-gold text-primary-foreground",
        "flex items-center justify-center shadow-[0_8px_30px_-4px_rgba(212,175,55,0.55)]",
        "hover:scale-105 active:scale-95 transition-transform",
        "border border-gold/40"
      )}
    >
      <Lightbulb className="h-6 w-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center border-2 border-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
