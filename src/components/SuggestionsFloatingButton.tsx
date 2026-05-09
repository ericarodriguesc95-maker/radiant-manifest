import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

/**
 * Draggable floating bubble for Suggestions.
 * - Press & hold to drag, tap to navigate.
 * - Position persisted per-user in localStorage.
 */
export default function SuggestionsFloatingButton() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const HIDDEN_PREFIXES = [
    "/login", "/signup", "/forgot-password", "/reset-password",
    "/sugestoes", "/admin/sugestoes",
  ];
  const isHidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));

  const lastSeenKey = user ? `sugestoes-last-seen-${user.id}` : "";
  const posKey = user ? `sugestoes-bubble-pos-${user.id}` : "";

  useEffect(() => {
    if (!posKey) return;
    try {
      const raw = localStorage.getItem(posKey);
      if (raw) setPos(JSON.parse(raw));
    } catch {}
  }, [posKey]);

  const loadCount = async () => {
    if (!user) return setCount(0);
    if (isAdmin) {
      const { count: pending } = await supabase
        .from("suggestions")
        .select("id", { count: "exact", head: true })
        .in("status", ["nova", "em_analise"]);
      setCount(pending || 0);
      return;
    }
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
    const channel = supabase
      .channel("sugestoes-bubble")
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestion_replies" }, () => loadCount())
      .on("postgres_changes", { event: "*", schema: "public", table: "suggestions" }, () => loadCount())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  // Drag
  const dragRef = useRef<{ dragging: boolean; moved: boolean; offsetX: number; offsetY: number }>({
    dragging: false, moved: false, offsetX: 0, offsetY: 0,
  });
  const latestPosRef = useRef<{ x: number; y: number } | null>(pos);
  useEffect(() => { latestPosRef.current = pos; }, [pos]);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLButtonElement;
    const rect = target.getBoundingClientRect();
    dragRef.current = {
      dragging: true, moved: false,
      offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
    };
    target.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const info = dragRef.current;
    if (!info.dragging) return;
    e.preventDefault();
    if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) info.moved = true;
    const size = window.innerWidth >= 768 ? 56 : 48;
    const x = Math.min(window.innerWidth - size - 8, Math.max(8, e.clientX - info.offsetX));
    const y = Math.min(window.innerHeight - size - 8, Math.max(8, e.clientY - info.offsetY));
    const next = { x, y };
    latestPosRef.current = next;
    setPos(next);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const info = dragRef.current;
    const wasDrag = info.moved;
    info.dragging = false;
    try { (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId); } catch {}
    if (wasDrag && latestPosRef.current) {
      try { if (posKey) localStorage.setItem(posKey, JSON.stringify(latestPosRef.current)); } catch {}
      return;
    }
    if (!isAdmin) localStorage.setItem(lastSeenKey, new Date().toISOString());
    navigate(isAdmin ? "/admin/sugestoes" : "/sugestoes");
  };

  if (isHidden || !user) return null;

  const label = isAdmin ? "Sugestões para responder" : "Sugestões e respostas";

  const inlineStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
    : {};

  return (
    <button
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={label}
      style={inlineStyle}
      className={cn(
        "fixed z-40",
        !pos && "right-3 md:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+88px)] md:bottom-6",
        "h-12 w-12 md:h-14 md:w-14 rounded-full bg-gold text-primary-foreground",
        "flex items-center justify-center shadow-[0_8px_30px_-4px_rgba(212,175,55,0.55)]",
        "hover:scale-105 active:scale-95 transition-transform touch-none select-none cursor-grab active:cursor-grabbing",
        "border border-gold/40",
        count > 0 && "animate-pulse ring-2 ring-gold/50 ring-offset-2 ring-offset-background"
      )}
    >
      <Lightbulb className="h-5 w-5 md:h-6 md:w-6" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center border-2 border-background">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
