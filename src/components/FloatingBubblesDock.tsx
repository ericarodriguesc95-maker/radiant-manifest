import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Hash, Crown, Bot, Wallet, X, Plus, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Unified floating bubbles dock.
 * - 5 bubbles: DM, Salas, IA Assistente, Eu Superior, IA Financeira
 * - Each only appears AFTER the user uses it once (localStorage flags).
 * - Each bubble can be hidden via X — restorable via the small "+" hub button.
 * - Each bubble is independently draggable; position persisted per-user.
 * - DM bubble shows unread count + MSN-style shake when a new message arrives.
 * - Hidden on auth pages and on the page that owns the feature (avoid duplicates).
 */

type BubbleId = "dm" | "salas" | "ia" | "eu-superior" | "financeira";

interface BubbleDef {
  id: BubbleId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  /** Path to navigate to (or a special flag in route param). */
  href: string;
  /** Pages where this bubble should be hidden (already accessible there). */
  hideOnPrefix: string[];
  /** localStorage key set when the user has used this feature at least once. */
  usedFlag: string;
}

const BUBBLES: BubbleDef[] = [
  { id: "dm", label: "Mensagens diretas", shortLabel: "DM", icon: MessageCircle,
    href: "/comunidade?openDms=1", hideOnPrefix: ["/comunidade"], usedFlag: "dm-used" },
  { id: "salas", label: "Salas de chat", shortLabel: "Salas", icon: Hash,
    href: "/comunidade?openRooms=1", hideOnPrefix: ["/comunidade"], usedFlag: "chatrooms-used" },
  // IAs: SEMPRE visíveis (não exigem uso prévio) — usedFlag vazio funciona como "sempre liberado"
  { id: "ia", label: "Assistente Pessoal", shortLabel: "Tempo", icon: Clock,
    href: "/alta-performance?openAi=1", hideOnPrefix: ["/alta-performance"], usedFlag: "" },
  { id: "eu-superior", label: "Eu Superior", shortLabel: "Eu+", icon: Crown,
    href: "/metas?tab=manifestacao&openEuSuperior=1", hideOnPrefix: [], usedFlag: "" },
  { id: "financeira", label: "IA Financeira", shortLabel: "$", icon: Wallet,
    href: "/financas?openAi=1", hideOnPrefix: ["/financas"], usedFlag: "" },
];

const HIDDEN_GLOBAL_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Default vertical position offsets (mobile, above bottom nav)
const DEFAULT_BOTTOM_BASE_MOBILE = 158; // px above bottom edge for first bubble
const DEFAULT_BOTTOM_BASE_DESKTOP = 88;
const STACK_GAP = 64; // px between bubbles when stacked

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}

export default function FloatingBubblesDock() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [usedFlags, setUsedFlags] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<BubbleId, boolean>>({} as any);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [showHub, setShowHub] = useState(false);
  const [unreadDm, setUnreadDm] = useState(0);
  const [shakeId, setShakeId] = useState<BubbleId | null>(null);
  const previousUnreadRef = useRef(0);

  const userId = user?.id;
  const hiddenKey = userId ? `bubbles-hidden-${userId}` : "";
  const posKey = userId ? `bubbles-pos-${userId}` : "";

  // Load persisted state
  const refreshFromStorage = useCallback(() => {
    try {
      const flags: Record<string, boolean> = {};
      // Bubbles sem usedFlag (IAs) ficam SEMPRE visíveis
      BUBBLES.forEach((b) => { flags[b.id] = !b.usedFlag || localStorage.getItem(b.usedFlag) === "1"; });
      setUsedFlags(flags);
      if (hiddenKey) {
        const h = safeJsonParse<Record<BubbleId, boolean>>(localStorage.getItem(hiddenKey));
        if (h) setHidden(h);
      }
      if (posKey) {
        const p = safeJsonParse<Record<string, { x: number; y: number }>>(localStorage.getItem(posKey));
        if (p) setPositions(p);
      }
    } catch {}
  }, [hiddenKey, posKey]);

  useEffect(() => { refreshFromStorage(); }, [refreshFromStorage]);

  // Watch for usage flags changing (when user opens DMs/Rooms/etc.)
  useEffect(() => {
    const interval = setInterval(refreshFromStorage, 1500);
    return () => clearInterval(interval);
  }, [refreshFromStorage]);

  // Persist hidden state
  const persistHidden = (next: Record<BubbleId, boolean>) => {
    setHidden(next);
    try { if (hiddenKey) localStorage.setItem(hiddenKey, JSON.stringify(next)); } catch {}
  };
  const persistPositions = (next: Record<string, { x: number; y: number }>) => {
    setPositions(next);
    try { if (posKey) localStorage.setItem(posKey, JSON.stringify(next)); } catch {}
  };

  // Unread DM count + MSN shake on increase
  const loadUnread = useCallback(async () => {
    if (!userId) return;
    const { data: parts } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", userId);
    const convIds = (parts || []).map((p) => p.conversation_id);
    if (convIds.length === 0) {
      setUnreadDm(0);
      previousUnreadRef.current = 0;
      return;
    }
    const { count } = await supabase
      .from("direct_messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .eq("read", false)
      .neq("sender_id", userId);
    const n = count || 0;
    if (n > previousUnreadRef.current) {
      // New message arrived: shake DM bubble + un-hide it if hidden
      setShakeId("dm");
      setTimeout(() => setShakeId(null), 750);
      setHidden((prev) => {
        if (!prev?.dm) return prev;
        const next = { ...prev, dm: false };
        try { if (hiddenKey) localStorage.setItem(hiddenKey, JSON.stringify(next)); } catch {}
        return next;
      });
    }
    previousUnreadRef.current = n;
    setUnreadDm(n);
  }, [userId, hiddenKey]);

  useEffect(() => {
    if (!userId) return;
    loadUnread();
    const channel = supabase
      .channel("bubbles-dm-unread")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => loadUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, loadUnread]);

  // Drag refs
  const dragRefs = useRef<Record<string, { dragging: boolean; moved: boolean; offsetX: number; offsetY: number }>>({});

  const onPointerDown = (e: React.PointerEvent, id: BubbleId) => {
    const target = e.currentTarget as HTMLButtonElement;
    const rect = target.getBoundingClientRect();
    dragRefs.current[id] = {
      dragging: true, moved: false,
      offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top,
    };
    target.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent, id: BubbleId) => {
    const info = dragRefs.current[id];
    if (!info?.dragging) return;
    if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) info.moved = true;
    const size = 56;
    const x = Math.min(window.innerWidth - size - 8, Math.max(8, e.clientX - info.offsetX));
    const y = Math.min(window.innerHeight - size - 8, Math.max(8, e.clientY - info.offsetY));
    setPositions((prev) => ({ ...prev, [id]: { x, y } }));
  };
  const onPointerUp = (e: React.PointerEvent, id: BubbleId, href: string) => {
    const info = dragRefs.current[id];
    const wasDrag = !!info?.moved;
    if (info) info.dragging = false;
    try { (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId); } catch {}
    persistPositions({ ...positions });
    if (!wasDrag) navigate(href);
  };

  const closeBubble = (id: BubbleId) => {
    persistHidden({ ...hidden, [id]: true });
  };
  const restoreBubble = (id: BubbleId) => {
    const next = { ...hidden };
    delete (next as any)[id];
    persistHidden(next);
  };

  if (!user) return null;
  const pageHidden = HIDDEN_GLOBAL_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (pageHidden) return null;

  // Compute which bubbles to show stacked (those without saved position)
  const visibleBubbles = BUBBLES.filter((b) =>
    usedFlags[b.id] && !hidden[b.id] && !b.hideOnPrefix.some((p) => location.pathname.startsWith(p))
  );
  const hiddenBubbles = BUBBLES.filter((b) => usedFlags[b.id] && hidden[b.id]);

  return (
    <>
      {/* Hub button to restore hidden bubbles */}
      {hiddenBubbles.length > 0 && (
        <div className="fixed z-40 right-3 md:right-6 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] md:bottom-3">
          <button
            onClick={() => setShowHub((v) => !v)}
            className={cn(
              "h-9 w-9 rounded-full bg-background/80 backdrop-blur border border-gold/40",
              "flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            )}
            aria-label="Mostrar atalhos ocultos"
            title="Mostrar atalhos ocultos"
          >
            <Plus className="h-4 w-4 text-gold" />
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {hiddenBubbles.length}
            </span>
          </button>
          {showHub && (
            <div className="absolute right-0 bottom-12 w-52 rounded-xl glass border border-gold/30 p-2 shadow-xl space-y-1 animate-fade-in">
              <p className="text-[10px] text-gold/80 uppercase tracking-wider px-2 pt-1 pb-0.5">Mostrar atalho</p>
              {hiddenBubbles.map((b) => {
                const Icon = b.icon;
                return (
                  <button
                    key={b.id}
                    onClick={() => { restoreBubble(b.id); setShowHub(false); }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gold/10 text-left text-sm text-foreground"
                  >
                    <Icon className="h-4 w-4 text-gold" /> {b.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Render bubbles */}
      {visibleBubbles.map((b, idx) => {
        const Icon = b.icon;
        const customPos = positions[b.id];
        const stackOffsetMobile = DEFAULT_BOTTOM_BASE_MOBILE + idx * STACK_GAP;
        const stackOffsetDesktop = DEFAULT_BOTTOM_BASE_DESKTOP + idx * STACK_GAP;
        const isDm = b.id === "dm";
        const unread = isDm ? unreadDm : 0;
        const shouldShake = shakeId === b.id;

        const inlineStyle: React.CSSProperties = customPos
          ? { left: customPos.x, top: customPos.y, right: "auto", bottom: "auto" }
          : {
              right: 12,
              bottom: `calc(env(safe-area-inset-bottom, 0px) + ${stackOffsetMobile}px)`,
            };

        return (
          <div
            key={b.id}
            style={inlineStyle}
            className={cn(
              "fixed z-40",
              !customPos && "md:right-6",
              !customPos && `md:!bottom-[${stackOffsetDesktop}px]`
            )}
          >
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => closeBubble(b.id)}
                className="absolute -top-1.5 -left-1.5 h-5 w-5 rounded-full bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground flex items-center justify-center z-10 shadow"
                aria-label={`Esconder ${b.label}`}
                title="Esconder"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Main draggable bubble */}
              <button
                onPointerDown={(e) => onPointerDown(e, b.id)}
                onPointerMove={(e) => onPointerMove(e, b.id)}
                onPointerUp={(e) => onPointerUp(e, b.id, b.href)}
                aria-label={b.label}
                className={cn(
                  "h-12 w-12 md:h-14 md:w-14 rounded-full bg-background/90 backdrop-blur",
                  "flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing",
                  "ring-2 ring-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.55)]",
                  "hover:scale-105 active:scale-95 transition-transform",
                  unread > 0 && "animate-pulse",
                  shouldShake && "animate-msn-shake"
                )}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center border-2 border-background">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>

              {/* Label below */}
              <span className="absolute left-1/2 -translate-x-1/2 -bottom-4 text-[9px] font-body font-semibold text-gold/90 leading-none whitespace-nowrap pointer-events-none">
                {b.shortLabel}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}
