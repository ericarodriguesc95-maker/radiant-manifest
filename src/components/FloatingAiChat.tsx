import { useEffect, useRef, useState } from "react";
import { X, Minus, Send, Loader2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export interface AiPersona {
  id: string;
  label: string;
  emoji: string;
  greeting: string;
  functionName: string;
  systemOverride?: string;
  buildBody?: (messages: { role: string; content: string }[]) => any;
}

interface Props {
  persona: AiPersona;
  onClose: () => void;
}

type Msg = { role: "user" | "assistant"; content: string };

/**
 * Floating, draggable, minimizable AI chat panel.
 * Non-intrusive: sits bottom-right, can be minimized to a slim pill.
 */
export default function FloatingAiChat({ persona, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: persona.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ dragging: boolean; ox: number; oy: number; moved: boolean }>({
    dragging: false, ox: 0, oy: 0, moved: false,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // reset messages when persona switches
    setMessages([{ role: "assistant", content: persona.greeting }]);
  }, [persona.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, minimized]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const body = persona.buildBody
        ? persona.buildBody(next)
        : { messages: next, ...(persona.systemOverride ? { systemOverride: persona.systemOverride } : {}) };
      const { data, error } = await supabase.functions.invoke(persona.functionName, { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const reply = data?.reply || data?.text || data?.content || "…";
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e: any) {
      const msg = e?.message || "Erro ao responder";
      toast.error(msg);
      setMessages([...next, { role: "assistant", content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers on header
  // Drag using direct style writes + rAF (no state updates during move → no re-renders).
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);

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
    const h = panelRef.current?.offsetHeight || 480;
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

  if (minimized) {
    return (
      <div
        ref={panelRef}
        style={defaultStyle}
        className="fixed z-[55] will-change-transform transform-gpu animate-in fade-in-0 zoom-in-90 slide-in-from-bottom-3 duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
      >
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 rounded-full pl-2 pr-3 py-1.5 bg-background/95 backdrop-blur border border-gold/50 shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-transform duration-200 ease-out"
        >
          <span className="h-7 w-7 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-sm">
            {persona.emoji}
          </span>
          <span className="text-xs font-semibold text-foreground">{persona.label}</span>
          <Maximize2 className="h-3 w-3 text-gold" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      style={defaultStyle}
      className={cn(
        "fixed z-[55] w-[calc(100vw-24px)] max-w-[380px] h-[70vh] max-h-[560px]",
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
        className="flex items-center gap-2 px-3 py-2.5 border-b border-gold/20 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent cursor-grab active:cursor-grabbing select-none touch-none"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-base shadow">
          {persona.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-display font-bold text-foreground leading-tight truncate">{persona.label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">Chat flutuante · arraste para mover</p>
        </div>
        <button
          onClick={() => setMinimized(true)}
          className="h-7 w-7 rounded-lg hover:bg-gold/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
          aria-label="Minimizar"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="h-7 w-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-background/40">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex animate-in fade-in slide-in-from-bottom-1 duration-200", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                m.role === "user"
                  ? "bg-gold text-background rounded-br-sm shadow-sm"
                  : "bg-muted text-foreground rounded-bl-sm"
              )}
            >
              {m.role === "assistant" ? (
                <div className="prose prose-sm max-w-none [&>*]:my-1 [&_strong]:text-gold [&_p]:text-foreground [&_li]:text-foreground">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-gold" />
              <span className="text-muted-foreground text-xs">Pensando…</span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex items-end gap-2 p-2.5 border-t border-gold/20 bg-background/80"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder={`Fale com ${persona.label}…`}
          disabled={loading}
          className="flex-1 resize-none rounded-xl border border-gold/30 bg-background/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40 max-h-24"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-9 w-9 rounded-xl bg-gold hover:bg-gold/90 text-background flex items-center justify-center disabled:opacity-40 transition shadow"
          aria-label="Enviar"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
