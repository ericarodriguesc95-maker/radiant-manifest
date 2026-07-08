import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageCircle, Hash, Crown, Wallet, X, Plus, Clock, Sparkles, ChevronRight, Apple, Moon, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import FloatingAiChat, { type AiPersona } from "./FloatingAiChat";

/**
 * Unified floating bubbles dock.
 * - 3 bubbles: DM, Salas, IA (hub com seletor de qual IA usar)
 * - Cada bolha pode ser escondida via X — restaurável pelo botão "+".
 * - Cada bolha é arrastável; posição salva por usuário.
 */

type BubbleId = "dm" | "salas" | "ia-hub";

interface BubbleDef {
  id: BubbleId;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  href: string; // se vazio, abre menu no lugar de navegar
  hideOnPrefix: string[];
  usedFlag: string; // vazio = sempre visível
}

interface AiOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  persona: AiPersona;
}

const AI_OPTIONS: AiOption[] = [
  {
    id: "agenda", label: "Minha agenda do dia", description: "Organize sua rotina com IA", icon: Clock,
    persona: {
      id: "agenda", label: "Agenda IA", emoji: "🗓️", functionName: "ai-assistant",
      greeting: "Oi, rainha! 👑 Vamos organizar seu dia? Me conta o que você precisa fazer hoje ou me pergunte por onde começar.",
      systemOverride: "Você é uma assistente pessoal de alta performance para mulheres. Ajude a usuária a planejar sua agenda, priorizar tarefas e organizar rotinas com foco em produtividade elite. Responda em português do Brasil, com carinho e clareza. Use emojis com moderação.",
    },
  },
  {
    id: "eu-superior", label: "Falar com meu Eu Superior", description: "A melhor versão de você", icon: Crown,
    persona: {
      id: "eu-superior", label: "Eu Superior", emoji: "👑", functionName: "ai-assistant",
      greeting: "Olá, sou você — a versão mais elevada e consciente. ✨ Sobre o que você precisa de clareza agora?",
      systemOverride: "Você é o Eu Superior da usuária: a versão mais elevada, sábia e consciente dela mesma. Responda em primeira pessoa, com amor, sabedoria e verdade. Use linguagem poética e espiritual, mas prática. Português do Brasil.",
    },
  },
  {
    id: "financeira", label: "Consultora do meu dinheiro", description: "Analise suas finanças", icon: Wallet,
    persona: {
      id: "financeira", label: "Consultora Financeira", emoji: "💎", functionName: "ai-assistant",
      greeting: "Oi, rainha do próprio dinheiro! 💎 Me conta sua dúvida ou o que quer melhorar nas finanças hoje.",
      systemOverride: "Você é uma consultora financeira feminina especialista em educação financeira, investimentos, orçamento e mindset de prosperidade para mulheres. Responda em português do Brasil, prática e empática.",
    },
  },
  {
    id: "nutri", label: "Nutricionista IA", description: "Jejum, dieta e autofagia", icon: Apple,
    persona: {
      id: "nutri", label: "Dra. Luna", emoji: "🥗", functionName: "nutricionista-ai",
      greeting: "Oi, rainha! 👑 Sou a **Dra. Luna**, nutricionista funcional. Me pergunte sobre jejum intermitente, cardápios, autofagia ou seu ciclo hormonal. ✨",
    },
  },
  {
    id: "sono", label: "Regulador do sono", description: "Ajuste sua rotina de descanso", icon: Moon,
    persona: {
      id: "sono", label: "Sono IA", emoji: "🌙", functionName: "sleep-chat",
      greeting: "Oi! 🌙 Vamos regular seu sono? Me conta como está sua rotina ou o que quer melhorar.",
    },
  },
  {
    id: "biblia", label: "Estudo Bíblico IA", description: "Reflexões e interpretações", icon: BookOpen,
    persona: {
      id: "biblia", label: "Estudo Bíblico", emoji: "📖", functionName: "bible-study-ai",
      greeting: "Paz, rainha! 📖 Sobre qual passagem ou tema bíblico você quer refletir hoje?",
      buildBody: (messages) => ({ messages, dayContext: null }),
    },
  },
];

const BUBBLES: BubbleDef[] = [
  { id: "dm", label: "Conversar em particular", shortLabel: "Conversas", icon: MessageCircle,
    href: "/comunidade?openDms=1", hideOnPrefix: ["/comunidade"], usedFlag: "dm-used" },
  { id: "salas", label: "Grupos por tema", shortLabel: "Grupos", icon: Hash,
    href: "/comunidade?openRooms=1", hideOnPrefix: ["/comunidade"], usedFlag: "chatrooms-used" },
  { id: "ia-hub", label: "Assistentes de IA", shortLabel: "IA", icon: Sparkles,
    href: "", hideOnPrefix: [], usedFlag: "" },
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
  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<AiPersona | null>(null);
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
  const latestPositionsRef = useRef<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    latestPositionsRef.current = positions;
  }, [positions]);

  const onPointerDown = (e: React.PointerEvent, id: BubbleId) => {
    e.preventDefault();
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
    e.preventDefault();
    if (Math.abs(e.movementX) > 1 || Math.abs(e.movementY) > 1) info.moved = true;
    const size = window.innerWidth >= 768 ? 56 : 48;
    const x = Math.min(window.innerWidth - size - 8, Math.max(8, e.clientX - info.offsetX));
    const y = Math.min(window.innerHeight - size - 8, Math.max(8, e.clientY - info.offsetY));
    const next = { ...latestPositionsRef.current, [id]: { x, y } };
    latestPositionsRef.current = next;
    setPositions(next);
  };
  const onPointerUp = (e: React.PointerEvent, id: BubbleId, href: string) => {
    const info = dragRefs.current[id];
    const wasDrag = !!info?.moved;
    if (info) info.dragging = false;
    try { (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId); } catch {}
    if (wasDrag) { persistPositions({ ...latestPositionsRef.current }); return; }
    if (id === "ia-hub") { setAiMenuOpen((v) => !v); return; }
    if (href) navigate(href);
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

              {/* IA hub popover menu */}
              {b.id === "ia-hub" && aiMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setAiMenuOpen(false)} />
                  <div className="absolute right-0 bottom-16 md:bottom-20 w-64 rounded-2xl glass-strong border border-gold/40 p-2 shadow-2xl space-y-1 animate-fade-in z-50">
                    <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <p className="text-[10px] text-gold/90 uppercase tracking-wider font-semibold">Escolha sua IA</p>
                    </div>
                    {AI_OPTIONS.map((opt) => {
                      const OptIcon = opt.icon;
                      const isActive = activePersona?.id === opt.persona.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setAiMenuOpen(false);
                            setActivePersona(opt.persona);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                            "hover:bg-gold/10 active:scale-[0.98]",
                            isActive && "bg-gold/10 ring-1 ring-gold/40"
                          )}
                        >
                          <div className="h-9 w-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                            <OptIcon className="h-4 w-4 text-gold" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-display font-bold text-foreground leading-tight">{opt.label}</p>
                            <p className="text-[10px] font-body text-muted-foreground leading-tight mt-0.5 truncate">
                              {isActive ? "Aberta agora" : opt.description}
                            </p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 text-gold/60 flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })}

      {activePersona && (
        <FloatingAiChat persona={activePersona} onClose={() => setActivePersona(null)} />
      )}
    </>
  );
}
