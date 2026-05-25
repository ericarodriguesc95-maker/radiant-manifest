import { useEffect, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Como sobrevivo à fissura por açúcar no Dia 1?",
  "Qual a diferença entre jejum 14h e 16h para mim?",
  "Como saber se já estou em autofagia?",
  "Por que minha dopamina cai sem Instagram?",
  "Como subir de 200 para 400 na escala de Hawkins?",
];

export default function Protocolo145Chat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;
    setInput("");
    const userMsg: Msg = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setIsLoading(true);

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/protocolo-145-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const errJson = await resp.json().catch(() => ({}));
        if (resp.status === 429) toast.error("Calma, rainha — muitas perguntas. Aguarde alguns segundos.");
        else if (resp.status === 402) toast.error("Créditos de IA esgotados. Adicione créditos no workspace.");
        else toast.error(errJson.error || "Erro ao chamar a IA.");
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let pushed = false;
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":")) continue;
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(json);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              assistantSoFar += delta;
              if (!pushed) {
                pushed = true;
                setMessages((prev) => [...prev, { role: "assistant", content: assistantSoFar }]);
              } else {
                setMessages((prev) =>
                  prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m))
                );
              }
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão com a IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gold/5 transition-colors"
      >
        <div className="h-10 w-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center">
          <Brain className="h-5 w-5 text-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
            Mentora Bio-Hacker IA
            <Sparkles className="h-3.5 w-3.5 text-gold" />
          </p>
          <p className="text-[11px] text-muted-foreground">Tire dúvidas sobre neurociência, jejum e o protocolo</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-gold/80">{open ? "Fechar" : "Abrir"}</span>
      </button>

      {open && (
        <div className="border-t border-gold/20 bg-black/40">
          <div ref={scrollRef} className="max-h-[420px] overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Pergunte qualquer coisa sobre o Protocolo 14.5:</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[11px] px-3 py-1.5 rounded-full border border-gold/30 bg-gold/5 hover:bg-gold/15 text-foreground/90 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    m.role === "user"
                      ? "bg-gold text-black font-medium"
                      : "bg-muted/40 text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0 prose-strong:text-gold">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="bg-muted/40 rounded-2xl px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-gold" />
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 p-3 border-t border-gold/20 bg-black/60"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte à mentora..."
              disabled={isLoading}
              className="flex-1 bg-muted/30 border border-gold/20 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-gold/50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="bg-gold hover:bg-gold/90 text-black h-9 w-9"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
