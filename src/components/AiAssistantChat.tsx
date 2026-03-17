import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistantChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: { messages: newMessages },
      });

      if (error) throw error;

      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
        setLoading(false);
        return;
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);

      if (data.event_created) {
        toast({ title: "📅 Evento criado na sua agenda!" });
      }
    } catch (err: any) {
      console.error("AI chat error:", err);
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Agendar sessão de estudo amanhã às 9h",
    "Criar lembrete para meditação diária",
    "Dicas de produtividade para hoje",
  ];

  return (
    <>
      {/* FAB */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full bg-gold text-foreground shadow-lg flex items-center justify-center hover:bg-gold/90 transition-all active:scale-95"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-foreground">Assistente IA</p>
                <p className="text-[10px] text-muted-foreground">Agendamentos & Produtividade</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-gold" />
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">Olá! Sou sua assistente ✨</p>
                  <p className="text-xs text-muted-foreground mt-1">Posso ajudar com agendamentos, lembretes e dicas de produtividade</p>
                </div>
                <div className="space-y-2 w-full max-w-xs">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); }}
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
                    ? "bg-gold text-foreground rounded-br-sm"
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
          <div className="px-4 py-3 border-t border-border bg-card">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Peça algo à sua assistente..."
                disabled={loading}
                className="flex-1 bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-1 focus:ring-gold placeholder:text-muted-foreground/50 disabled:opacity-50"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                size="icon"
                className="h-10 w-10 rounded-xl bg-gold text-foreground hover:bg-gold/90 shrink-0"
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
