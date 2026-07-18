import { useEffect, useRef, useState } from "react";
import { X, Minus, Maximize2, ClipboardCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import DailyCheckpoints from "./DailyCheckpoints";

const STORAGE_KEY = "gloow-checkpoints-panel-state";

interface PanelState {
  isOpen: boolean;
  isMinimized: boolean;
}

function loadState(): PanelState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PanelState>;
      if (typeof parsed.isOpen === "boolean" && typeof parsed.isMinimized === "boolean") {
        return parsed as PanelState;
      }
    }
  } catch {}
  return { isOpen: false, isMinimized: false };
}

function saveState(state: PanelState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/**
 * Floating, draggable, minimizable Daily Checkpoints window.
 * Non-intrusive: sits bottom-right, can be minimized to a slim pill.
 * State is persisted across reloads via localStorage.
 */
export default function FloatingDailyCheckpoints() {
  const initialState = useRef(loadState()).current;
  const [open, setOpen] = useState(initialState.isOpen);
  const [minimized, setMinimized] = useState(initialState.isMinimized);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ dragging: boolean; ox: number; oy: number; moved: boolean }>({
    dragging: false, ox: 0, oy: 0, moved: false,
  });
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

  // Persist open/minimized state across reloads
  useEffect(() => {
    saveState({ isOpen: open, isMinimized: minimized });
  }, [open, minimized]);

  const flushDrag = () => {
    rafRef.current = null;
    const p = pendingRef.current;
    const el = panelRef.current;
    if (!p || !el) return;
    el.style.left = `${p.x}px`;
    el.style.top = `${p.y}px`;
    el.style.right = "auto";
    el.style.bottom = "auto";
  };

  const onDown = (e: React.PointerEvent) => {
    const rect = panelRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = { dragging: true, ox: e.clientX - rect.left, oy: e.clientY - rect.top, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.moved = true;
    const w = panelRef.current?.offsetWidth || 360;
    const h = panelRef.current?.offsetHeight || 520;
    const x = Math.min(window.innerWidth - w - 8, Math.max(8, e.clientX - dragRef.current.ox));
    const y = Math.min(window.innerHeight - h - 8, Math.max(8, e.clientY - dragRef.current.oy));
    pendingRef.current = { x, y };
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(flushDrag);
  };
  const onUp = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;
    try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (pendingRef.current) setPos(pendingRef.current);
  };

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const defaultStyle: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto" }
    : { right: 12, bottom: "calc(env(safe-area-inset-bottom, 0px) + 96px)" };

  if (!open || minimized) {
    return (
      <div
        ref={panelRef}
        style={defaultStyle}
        className="fixed z-[55] will-change-transform transform-gpu animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-3 duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="flex flex-col items-center gap-1 group"
          aria-label="Abrir check-points do dia"
        >
          <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-background/90 backdrop-blur flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing ring-2 ring-gold/60 shadow-[0_0_20px_rgba(212,175,55,0.55)] hover:scale-110 active:scale-90 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <ClipboardCheck className="h-5 w-5 md:h-6 md:w-6 text-gold" />
          </div>
          <span className="text-[9px] font-body font-semibold text-gold/90 leading-none whitespace-nowrap pointer-events-none">
            Check-points
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      style={defaultStyle}
      className={cn(
        "fixed z-[55] w-[calc(100vw-24px)] max-w-[380px] h-[72vh] max-h-[580px]",
        "rounded-2xl overflow-hidden flex flex-col",
        "bg-background/95 backdrop-blur-xl border border-gold/40",
        "shadow-[0_20px_60px_-15px_rgba(212,175,55,0.45)]",
        "will-change-transform transform-gpu",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      )}
    >
      {/* Header (drag handle) */}
      <div
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        className="flex items-center gap-2 px-3 py-2.5 border-b border-gold/20 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent cursor-grab active:cursor-grabbing select-none touch-none shrink-0"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-base shadow">
          <Trophy className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-display font-bold text-foreground leading-tight truncate">Check-points do dia</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Janela suspensa · arraste para mover</p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="h-7 w-7 rounded-lg hover:bg-gold/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Minimizar"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-7 w-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 bg-background/40">
        <DailyCheckpoints className="!bg-transparent !border-0 !shadow-none !p-0" showHeader={false} />
      </div>
    </div>
  );
}
