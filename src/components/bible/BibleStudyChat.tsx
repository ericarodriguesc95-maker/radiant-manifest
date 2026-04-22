import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BookOpen, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Msg = { role: "user" | "assistant"; content: string };

interface DayContext {
  day: number;
  title?: string;
  passages?: string;
  version?: string;
  text?: string;
  periodo?: string;
  regiao?: string;
  contextoHistorico?: string;
}

interface BibleStudyChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayContext: DayContext;
}

const SUGGESTIONS = [
  "Qual o contexto histórico desta passagem?",
  "Como aplicar este texto à minha vida hoje?",
  "Como esta leitura aponta para Jesus?",
  "Me ajude a orar com base nesta passagem",
];

export default function BibleStudyChat({ open, onOpenChange, dayContext }: BibleStudyChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  // Carrega histórico do dia ao abrir / mudar de dia
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      setLoadingHistory(true);
      const { data, error } = await supabase
        .from("bible_study_chat_messages" as any)
        .select("role, content")
        .eq("user_id", user.id)
        .eq("day", dayContext.day)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (!error && data) {
        setMessages(
          (data as any[]).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))
        );
      } else {
        setMessages([]);
      }
      setLoadingHistory(false);
    })();
    return () => {
      cancelled = true;
      abortRef.current?.abort();
    };
  }, [open, user, dayContext.day]);

  const persistMessage = async (role: "user" | "assistant", content: string) => {
    if (!user || !content.trim()) return;
    await supabase.from("bible_study_chat_messages" as any).insert({
      user_id: user.id,
      day: dayContext.day,
      role,
      content,
    } as any);
  };

  const handleClearHistory = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("bible_study_chat_messages" as any)
      .delete()
      .eq("user_id", user.id)
      .eq("day", dayContext.day);
    if (error) {
      toast({ title: "Erro ao limpar", description: error.message, variant: "destructive" });
      return;
    }
    setMessages([]);
    toast({ title: "Histórico limpo ✨", description: `Conversa do Dia ${dayContext.day} apagada.` });
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Msg = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // Persiste a mensagem da usuária
    persistMessage("user", trimmed);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-study-ai`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: newMessages,
          dayContext,
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast({
            title: "Muitas perguntas seguidas",
            description: "Respire e tente em alguns segundos 🕊️",
            variant: "destructive",
          });
        } else if (resp.status === 402) {
          toast({
            title: "Créditos de IA esgotados",
            description: "Recarregue para continuar.",
            variant: "destructive",
          });
        } else {
          const data = await resp.json().catch(() => ({}));
          toast({
            title: "Não foi possível conversar agora",
            description: data?.error || "Tente novamente em instantes.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
        return;
      }

      if (!resp.body) throw new Error("Sem corpo na resposta");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            /* ignora */
          }
        }
      }

      // Persiste a resposta completa da IA
      if (assistantSoFar.trim()) {
        persistMessage("assistant", assistantSoFar);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error(err);
        toast({
          title: "Erro ao conversar",
          description: "Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-background border-l border-gold/20 p-0 flex flex-col z-[60]"
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b border-gold/15 bg-gradient-to-br from-gold/10 via-background to-background">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gold/15 border border-gold/25 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/30 via-transparent to-transparent animate-pulse" />
              <BookOpen className="h-5 w-5 text-gold relative z-10" />
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="font-display text-foreground text-base flex items-center gap-1.5">
                Mestra Bíblica
                <Sparkles className="h-3.5 w-3.5 text-gold" />
              </SheetTitle>
              <p className="text-[10px] font-body tracking-wider uppercase text-gold/70">
                Dia {dayContext.day} • {dayContext.passages || "Estudo livre"}
              </p>
            </div>
            {messages.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-2 rounded-lg hover:bg-coral/10 text-muted-foreground hover:text-coral transition-all"
                    aria-label="Limpar histórico do dia"
                    title="Limpar histórico"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-gold/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-foreground">
                      Limpar conversa do Dia {dayContext.day}?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body text-muted-foreground">
                      Todas as mensagens trocadas com a Mestra Bíblica neste dia serão apagadas. Conversas de outros dias continuam salvas.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearHistory}
                      className="rounded-xl bg-coral text-background hover:bg-coral/90"
                    >
                      Limpar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </SheetHeader>

        {/* Mensagens */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 text-gold animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="space-y-4 mt-2">
              <div className="rounded-2xl bg-gold/5 border border-gold/15 p-4 space-y-2">
                <p className="text-sm font-body text-foreground/90 leading-relaxed">
                  Paz, irmã ✨ Sou sua <strong className="text-gold">Mestra Bíblica</strong>.
                  Estou aqui para te ajudar a mergulhar fundo na <strong>{dayContext.title || "Palavra"}</strong> de hoje.
                </p>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">
                  Pergunte qualquer coisa: contexto histórico, hebraico/grego, aplicações para sua vida, oração baseada no texto… <strong className="text-gold/80">Toda conversa fica salva por dia</strong>.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-body tracking-widest uppercase text-gold/60 px-1">
                  Comece por aqui
                </p>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={isLoading}
                    className="w-full text-left text-xs font-body px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-gold/10 border border-gold/10 hover:border-gold/30 text-foreground/85 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!loadingHistory &&
            messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm font-body leading-relaxed",
                    msg.role === "user"
                      ? "bg-gold text-background rounded-br-md"
                      : "bg-muted/40 border border-gold/10 text-foreground/90 rounded-bl-md"
                  )}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-headings:text-gold prose-strong:text-gold prose-blockquote:border-l-gold prose-blockquote:text-foreground/75 prose-blockquote:not-italic prose-ul:my-1.5 prose-li:my-0.5">
                      <ReactMarkdown>{msg.content || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="bg-muted/40 border border-gold/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-gold animate-spin" />
                <span className="text-xs font-body text-muted-foreground">
                  Consultando as Escrituras…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gold/15 bg-background/95 backdrop-blur-xl p-3 pb-6">
          <div className="flex items-end gap-2 bg-muted/30 border border-gold/15 rounded-2xl p-2 focus-within:border-gold/40 transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Pergunte sobre o texto, peça uma oração, contexto…"
              disabled={isLoading}
              rows={1}
              className="flex-1 min-h-[36px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-body p-2"
            />
            <Button
              onClick={() => send(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="gold"
              className="rounded-xl h-9 w-9 flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-[9px] font-body text-muted-foreground/60 text-center mt-2 tracking-wide">
            Mestra Bíblica • Histórico salvo por dia • Sempre confirme com sua Bíblia
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
