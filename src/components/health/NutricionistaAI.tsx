import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Sparkles, Apple, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  profile?: {
    goal?: string;
    current_weight?: number | null;
    target_weight?: number | null;
    height_cm?: number | null;
    age?: number | null;
    activity_level?: string;
  } | null;
}

const SUGGESTIONS = [
  { icon: Clock, label: "Como começar o jejum 16/8?", q: "Sou iniciante, quero começar o jejum intermitente 16/8. Me dê um plano prático para começar HOJE com horários, o que beber e como quebrar o jejum." },
  { icon: Apple, label: "O que quebra o jejum?", q: "O que realmente quebra o jejum? Café com leite vegetal quebra? E adoçante? Me explique tecnicamente o que mantém ou rompe a autofagia e o pico de insulina." },
  { icon: Sparkles, label: "Jejum no ciclo menstrual", q: "Como adaptar o jejum intermitente às fases do meu ciclo menstrual? Quando posso fazer jejuns longos e quando devo encurtar?" },
  { icon: Sparkles, label: "Cardápio cetogênico do dia", q: "Monte um cardápio cetogênico completo para hoje, focado em emagrecimento e energia constante, com café, almoço, lanche e jantar. Inclua macros." },
];

export default function NutricionistaAI({ profile }: Props) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Oi, rainha! 👑 Sou a **Dra. Luna**, sua nutricionista funcional especialista em **jejum intermitente** e reprogramação metabólica feminina.\n\nMe conta: qual é seu objetivo agora? Posso te ajudar com **protocolos de jejum**, **cardápios**, **quebra de jejum ideal**, **autofagia**, **cetose**, **eletrólitos**, e adaptar tudo ao seu **ciclo hormonal**. ✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("nutricionista-ai", {
        body: { messages: next, profile },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      const msg = e?.message || "Erro ao falar com a Dra. Luna";
      toast.error(msg);
      setMessages([...next, { role: "assistant", content: `⚠️ ${msg}. Tente novamente em instantes.` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-background to-gold/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-xl shadow-md">
            🥗
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Dra. Luna
              <span className="text-[10px] font-medium bg-gold/20 text-gold px-2 py-0.5 rounded-full">IA</span>
            </CardTitle>
            <CardDescription className="text-xs">Nutricionista funcional • Expert em jejum intermitente</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div
          ref={scrollRef}
          className="h-[420px] overflow-y-auto space-y-3 rounded-lg border border-border/50 bg-background/40 p-3"
        >
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-gold text-background rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                }`}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&>*]:my-1 [&_strong]:text-gold">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-2 text-sm flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-gold" />
                <span className="text-muted-foreground">Dra. Luna está pensando...</span>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.q)}
                disabled={loading}
                className="text-left text-[11px] px-2.5 py-2 rounded-lg border border-gold/30 hover:bg-gold/10 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <s.icon className="h-3 w-3 text-gold shrink-0" />
                <span className="line-clamp-2">{s.label}</span>
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre jejum, dieta, autofagia..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()} size="icon" className="bg-gold hover:bg-gold/90 text-background">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center">
          ⚠️ Conteúdo educativo. Em caso de gestação, TCA ou diabetes, consulte sua médica.
        </p>
      </CardContent>
    </Card>
  );
}
