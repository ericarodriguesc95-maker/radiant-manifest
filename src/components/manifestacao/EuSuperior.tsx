import { useState, useCallback } from "react";
import { Crown, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const questions = [
  "O que você deseja de verdade?",
  "O que te impede de ser quem você quer ser?",
  "Que medo você precisa enfrentar hoje?",
  "O que seu coração está tentando te dizer?",
  "Se você não tivesse medo, o que faria agora?",
  "O que você precisa perdoar em si mesma?",
  "Qual versão de você está pronta pra nascer?",
  "O que você está resistindo a aceitar?",
  "O que te conecta com sua essência?",
  "Que crença limitante você quer soltar hoje?",
];

function getRandomQuestion(exclude?: string) {
  const filtered = exclude ? questions.filter(q => q !== exclude) : questions;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default function EuSuperior() {
  const [question, setQuestion] = useState(getRandomQuestion);
  const [answer, setAnswer] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const newQuestion = () => {
    setQuestion(prev => getRandomQuestion(prev));
    setAnswer("");
    setResponse("");
  };

  const getResponse = useCallback(async () => {
    if (!answer.trim()) return;
    try { localStorage.setItem("eu-superior-used", "1"); } catch {}
    setLoading(true);
    setResponse("");

    try {
      const res = await supabase.functions.invoke("eu-superior", {
        body: { question, answer: answer.trim() },
      });

      if (res.error) throw res.error;
      setResponse(res.data?.response || "Respire fundo. A resposta já está em você.");
    } catch {
      setResponse("Neste momento, apenas respire fundo e confie no processo. A clareza virá. 🌟");
    } finally {
      setLoading(false);
    }
  }, [question, answer]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
          <Sparkles className="h-7 w-7 text-gold" />
        </div>
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-widest">Conexão Interior</p>
        <h3 className="text-lg font-display font-bold">Conversa com o Eu Superior</h3>
        <p className="text-xs font-body text-muted-foreground">Um espaço de escuta e clareza</p>
      </div>

      {/* Question */}
      <div className="glass-gold rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">Eu Superior pergunta</span>
          <button onClick={newQuestion} className="p-1 text-muted-foreground hover:text-gold transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-sm font-display font-semibold text-foreground italic">
          "{question}"
        </p>
      </div>

      {/* Answer */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-gold" />
          <span className="text-xs font-body font-semibold">Sua resposta</span>
        </div>
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="Escreva livremente o que surge em você..."
          rows={4}
          className="w-full glass rounded-xl p-4 text-sm font-body outline-none resize-none placeholder:text-muted-foreground focus:border-gold/50 transition-colors border border-border"
        />
      </div>

      {/* Submit */}
      <Button
        onClick={getResponse}
        disabled={loading || !answer.trim()}
        className="w-full bg-gold hover:bg-gold/90 text-background font-body font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Recebendo resposta...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Receber resposta
          </>
        )}
      </Button>

      {/* Response */}
      {response && (
        <div className="glass-gold rounded-2xl p-5 space-y-2 animate-fade-in">
          <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">Mensagem do Eu Superior</p>
          <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}
