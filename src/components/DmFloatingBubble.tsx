import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Draggable floating bubble linking to DMs (Comunidade).
 * - Only shows after the user has opened DMs at least once (localStorage flag "dm-used").
 * - Hidden on auth pages and on Comunidade itself (where DM button already exists).
 * - Position is persisted in localStorage per-user.
 * - Shows unread DM count with a gold pulse when > 0.
 */
const HIDDEN_PREFIXES = [
  "/login", "/signup", "/forgot-password", "/reset-password",
  "/comunidade",
];

export default function DmFloatingBubble() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [enabled, setEnabled] = useState(false);
  const [unread, setUnread] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragInfo = useRef<{ dragging: boolean; moved: boolean; offsetX: number; offsetY: number }>({
    dragging: false, moved: false, offsetX: 0, offsetY: 0,
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  const posKey = user ? `dm-bubble-pos-${user.id}` : "";

  // Init enabled flag + position
  useEffect(() => {
    try {
      setEnabled(localStorage.getItem("dm-used") === "1");
      if (posKey) {
        const raw = localStorage.getItem(posKey);
        if (raw) setPos(JSON.parse(raw));
      }
    } catch {}
  }, [posKey]);

  // Watch storage changes (when user opens DMs in Comunidade)
  useEffect(() => {
    const onStorage = () => setEnabled(localStorage.getItem("dm-used") === "1");
    window.addEventListener("storage", onStorage);
    const interval = setInterval(onStorage, 1500);
    return () => { window.removeEventListener("storage", onStorage); clearInterval(interval); };
  }, []);

  // Load unread DM count + realtime
  const loadUnread = async () => {
    if (!user) return;
    // Get conversations the user participates in
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);
    const convIds = (parts || []).map((p) => p.conversation_id);
    if (convIds.length === 0) return setUnread(0);
    const { count } = await supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("read", false)
      .neq("sender_id", user.id);
    setUnread(count || 0);
  };

  useEffect(() => {
    if (!user || !enabled) return;
    loadUnread();
    const channel = supabase
      .channel("dm-bubble-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => loadUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, enabled]);

  // Drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragInfo.current = {
      dragging: true,
      moved: false,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragInfo.current.dragging) return;
    const dx = Math.abs(e.movementX), dy = Math.abs(e.movementY);
    if (dx > 1 || dy > 1) dragInfo.current.moved = true;
    const size = 56;
    const x = Math.min(window.innerWidth - size - 8, Math.max(8, e.clientX - dragInfo.current.offsetX));
    const y = Math.min(window.innerHeight - size - 8, Math.max(8, e.clientY - dragInfo.current.offsetY));
    setPos({ x, y });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = dragInfo.current.moved;
    dragInfo.current.dragging = false;
    try { btnRef.current?.releasePointerCapture(e.pointerId); } catch {}
    if (pos && posKey) {
      try { localStorage.setItem(posKey, JSON.stringify(pos)); } catch {}
    }
    if (!wasDrag) {
      navigate("/comunidade?openDms=1");
    }
  };

  const isHidden = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (!user || !enabled || isHidden) return null;

  // Default position (above bottom nav, left of suggestions bubble)
  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
    : {};

  return (
    <button
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={style}
      aria-label="Mensagens diretas"
      className={cn(
        "fixed z-40 h-12 w-12 md:h-14 md:w-14 rounded-full bg-background/90 backdrop-blur",
        "flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing",
        "ring-2 ring-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.55)]",
        "hover:scale-105 active:scale-95 transition-transform",
        !pos && "right-3 md:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+158px)] md:bottom-24",
        unread > 0 && "animate-pulse"
      )}
    >
      <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-gold" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center border-2 border-background">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </button>
  );
}
