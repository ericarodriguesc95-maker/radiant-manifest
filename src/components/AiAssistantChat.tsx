import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Sparkles, Calendar, Trash2, Mic, Volume2, VolumeX, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { ensureVoicesLoaded, createBrazilianUtterance } from "@/lib/voiceUtils";

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
const TTS_ENABLED_KEY = "ai-assistant-tts-enabled";

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

// ─── Voice Waveform Visualizer ──────────────────────────────────────────────

function VoiceWaveform({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-[3px] h-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gold animate-waveform"
          style={{
            animationDelay: `${i * 120}ms`,
            height: "100%",
          }}
        />
      ))}
    </div>
  );
}

// ─── TTS Helper ─────────────────────────────────────────────────────────────

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();

  // Clean markdown for speech
  const clean = text
    .replace(/[#*_~`>\-\[\]()!]/g, "")
    .replace(/\n+/g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return;

  // Split into chunks of ~200 chars at sentence boundaries for reliability
  const chunks = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const merged: string[] = [];
  let current = "";

  for (const chunk of chunks) {
    if ((current + chunk).length > 200) {
      if (current) merged.push(current.trim());
      current = chunk;
    } else {
      current += chunk;
    }
  }
  if (current) merged.push(current.trim());

  merged.forEach((chunk) => {
    const utterance = createBrazilianUtterance(chunk, "female", { rate: 1.0 });
    window.speechSynthesis.speak(utterance);
  });
}

function stopSpeaking() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function AiAssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    try { return localStorage.getItem(TTS_ENABLED_KEY) !== "false"; } catch { return true; }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  // Auto-open from floating bubble (?openAi=1)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("openAi") === "1") {
      setOpen(true);
      try { localStorage.setItem("ai-assistant-used", "1"); } catch {}
    }
  }, []);

  // Mark as used when opened
  useEffect(() => {
    if (open) {
      try { localStorage.setItem("ai-assistant-used", "1"); } catch {}
    }
  }, [open]);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(TTS_ENABLED_KEY, String(ttsEnabled));
  }, [ttsEnabled]);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Preload voices
  useEffect(() => {
    ensureVoicesLoaded();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Seu navegador não suporta reconhecimento de voz 😕", variant: "destructive" });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim = transcript;
        }
      }
      setInput(finalTranscript || interim);
    };

    recognition.onerror = (event: any) => {
      console.warn("[Voice] Error:", event.error);
      if (event.error !== "no-speech") {
        toast({ title: "Erro na captura de áudio", variant: "destructive" });
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript.trim()) {
        // Auto-send after voice capture
        setTimeout(() => {
          const sendBtn = document.querySelector("[data-voice-send]") as HTMLButtonElement;
          sendBtn?.click();
        }, 300);
      }
    };

    recognition.start();
  }, [toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    setIsListening(false);
  }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    stopSpeaking();

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: newMessages },
      });

      if (error) {
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
        setMessages(messages);
        return;
      }

      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
        setMessages(messages);
        return;
      }

      const reply = data?.reply || "Desculpe, não consegui processar. Pode tentar de novo? 💛";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);

      // TTS for AI response
      if (ttsEnabled) {
        setTimeout(() => speakText(reply), 400);
      }

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
  }, [input, loading, messages, toast, ttsEnabled]);

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_KEY);
    stopSpeaking();
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
      {/* Waveform animation keyframes */}
      <style>{`
        @keyframes waveform {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        .animate-waveform {
          animation: waveform 0.8s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

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
        <div className="fixed inset-0 z-[60] flex flex-col bg-background">
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
              {/* TTS toggle */}
              <button
                onClick={() => { setTtsEnabled(v => !v); stopSpeaking(); }}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  ttsEnabled ? "text-gold hover:bg-gold/10" : "text-muted-foreground hover:bg-muted"
                )}
                aria-label={ttsEnabled ? "Desativar voz" : "Ativar voz"}
                title={ttsEnabled ? "Voz ativada" : "Voz desativada"}
              >
                {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
              {messages.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors"
                  aria-label="Limpar histórico"
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <button onClick={() => { setOpen(false); stopSpeaking(); }} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X className="h-5 w-5 text-foreground" />
              </button>
            </div>
          </div>

          {/* Messages area */}
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
                    Fale ou digite! Estou aqui para organizar sua rotina 🎤
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

          {/* Input area */}
          <div className="px-4 py-3 border-t border-border bg-card shrink-0 pb-safe">
            <div className="flex items-center gap-2 max-w-2xl mx-auto">
              {/* Mic button */}
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={loading}
                className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                  isListening
                    ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/30"
                    : "bg-gold/15 text-gold hover:bg-gold/25"
                )}
                aria-label={isListening ? "Parar gravação" : "Gravar áudio"}
              >
                {isListening ? <VoiceWaveform active /> : <Mic className="h-4 w-4" />}
              </button>

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
                placeholder={isListening ? "🎤 Ouvindo..." : "Digite ou fale sua mensagem..."}
                disabled={loading}
                className={cn(
                  "flex-1 bg-muted/50 border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground/50 disabled:opacity-50 text-foreground transition-colors",
                  isListening ? "border-gold/50 bg-gold/5" : "border-border"
                )}
              />

              <Button
                data-voice-send
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-10 w-10 rounded-xl bg-gold text-primary-foreground hover:bg-gold/90 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {isListening && (
              <p className="text-center text-[10px] text-gold mt-2 animate-pulse font-body">
                🎤 Fale agora... a mensagem será enviada automaticamente
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
