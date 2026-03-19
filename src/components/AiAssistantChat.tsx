import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ScheduledEvent {
  title: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  created_at: string;
}

const MESSAGES_KEY = "ai-assistant-messages";
const SCHEDULES_KEY = "ai-assistant-schedules";

function loadMessages(): Message[] {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveMessages(msgs: Message[]) {
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
  } catch {}
}

function saveSchedule(events: ScheduledEvent[]) {
  try {
    const existing = loadSchedules();
    localStorage.setItem(SCHEDULES_KEY, JSON.stringify([...existing, ...events]));
  } catch {}
}

function loadSchedules(): ScheduledEvent[] {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export default function AiAssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Persist messages to localStorage
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom on new messages or loading state
  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    console.log("[AiAssistant] Enviando:", msg);

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: newMessages },
      });

      console.log("[AiAssistant] Resposta:", { data, error });

      if (error) {
        console.error("[AiAssistant] Erro:", error);
        let errMsg = "Erro ao enviar mensagem";
        try {
          if (error.context && typeof error.context.json === "function") {
            const body = await error.context.json();
            errMsg = body?.error || errMsg;
          } else {
            errMsg = error.message || errMsg;
          }
        } catch {
          errMsg = error.message || errMsg;
        }
        toast({ title: errMsg, variant: "destructive" });
        // Remove the user message on error so they can retry
        setMessages(messages);
        return;
      }

      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
        setMessages(messages);
        return;
      }

      const reply = data?.reply || "Desculpe, não consegui processar. Pode tentar de novo? 💛";
      console.log("[AiAssistant] Reply:", reply.substring(0, 120));
      
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      // Save created events to localStorage for persistence
      if (data?.event_created && data?.created_events?.length > 0) {
        const scheduledEvents: ScheduledEvent[] = data.created_events.map((e: any) => ({
          ...e,
          created_at: new Date().toISOString(),
        }));
        saveSchedule(scheduledEvents);
        toast({ title: "📅 Evento criado na sua agenda!" });
      }
    } catch (err: any) {
      console.error("[AiAssistant] Erro de conexão:", err);
      toast({ title: "Erro de conexão. Tente novamente.", variant: "destructive" });
      setMessages(messages);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, toast]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_KEY);
    toast({ title: "Histórico limpo ✨" });
  };

  const suggestions = [
    "Agendar sessão de estudo amanhã às 9h",
    "Criar lembrete para meditação diária",
    "Dicas de produtividade para hoje",
    "Como organizar minha rotina da semana?",
  ];

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gold text-primary-foreground shadow-gold flex items-center justify-center hover:opacity-90 transition-all active:scale-95"
          aria-label="Abrir assistente IA"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">Assistente Glow Up ✨</p>
                <p className="text-[10px] text-muted-foreground">Sua parceira de alta performance</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                  aria-label="Limpar histórico"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">
                    Olá! Sou sua Assistente Glow Up ✨
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vamos juntas organizar sua rotina e conquistar seus objetivos!
                  </p>
                </div>
                <div className="space-y-2 w-full max-w-xs">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-xs p-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-muted-foreground"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-gold text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full bg-gold animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Peça algo à sua assistente..."
                disabled={loading}
                className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground/50 disabled:opacity-50"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-10 w-10 rounded-xl bg-gold text-primary-foreground hover:bg-gold/90 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
