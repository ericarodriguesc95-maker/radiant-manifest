import { useState } from "react";
import { ArrowLeft, Pen, Send, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const prompts = [
  { title: "Carta ao Universo", instruction: "Escreva uma carta ao universo descrevendo exatamente a vida que você deseja viver. Seja específica e use o presente, como se já fosse real." },
  { title: "Eu sou...", instruction: "Complete 10 frases começando com 'Eu sou...'. Escreva qualidades que você quer manifestar em sua vida." },
  { title: "Gratidão Antecipada", instruction: "Agradeça por 5 coisas que ainda não aconteceram, mas que você deseja manifestar. Sinta como se já fossem reais." },
  { title: "Meu Dia Perfeito", instruction: "Descreva em detalhes como seria seu dia perfeito, do amanhecer ao anoitecer." },
  { title: "Liberando Bloqueios", instruction: "Escreva crenças limitantes que te impedem de alcançar seus sonhos. Depois, reescreva cada uma como uma crença fortalecedora." },
];

interface Entry {
  id: string;
  promptTitle: string;
  text: string;
  date: string;
}

export default function LeiAtracaoExercises({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activePrompt, setActivePrompt] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [view, setView] = useState<"prompts" | "journal">("prompts");

  const saveEntry = () => {
    if (!text.trim() || activePrompt === null) return;
    const entry: Entry = {
      id: Date.now().toString(),
      promptTitle: prompts[activePrompt].title,
      text,
      date: new Date().toLocaleDateString("pt-BR"),
    };
    setEntries(prev => [entry, ...prev]);
    setText("");
    setActivePrompt(null);
  };

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-4">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Lei da Atração <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Exercícios de escrita para manifestar seus sonhos</p>
      </header>

      <div className="px-5 space-y-4 pb-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["prompts", "journal"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setView(t); setActivePrompt(null); }}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-body font-medium transition-all",
                view === t ? "bg-gold text-primary-foreground" : "bg-card text-muted-foreground border border-border"
              )}
            >
              {t === "prompts" ? "Exercícios" : `Diário (${entries.length})`}
            </button>
          ))}
        </div>

        {view === "prompts" && activePrompt === null && (
          <div className="space-y-3">
            {prompts.map((p, i) => (
              <button
                key={i}
                onClick={() => setActivePrompt(i)}
                className="w-full bg-card rounded-2xl border border-border p-4 text-left shadow-card hover:shadow-gold/10 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-gold" />
                  <span className="text-sm font-body font-semibold">{p.title}</span>
                </div>
                <p className="text-xs text-muted-foreground font-body leading-relaxed">{p.instruction}</p>
              </button>
            ))}
          </div>
        )}

        {view === "prompts" && activePrompt !== null && (
          <div className="bg-card rounded-2xl border border-border p-4 space-y-3 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <Pen className="h-4 w-4 text-gold" />
              <span className="text-sm font-body font-semibold">{prompts[activePrompt].title}</span>
            </div>
            <p className="text-xs text-muted-foreground font-body leading-relaxed italic">
              {prompts[activePrompt].instruction}
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Comece a escrever aqui..."
              rows={8}
              className="w-full bg-muted/50 rounded-xl p-3 text-sm font-body outline-none resize-none placeholder:text-muted-foreground"
              autoFocus
            />
            <div className="flex gap-2">
              <Button variant="gold" size="sm" onClick={saveEntry} disabled={!text.trim()}>
                <Send className="h-3.5 w-3.5 mr-1" /> Salvar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setActivePrompt(null); setText(""); }}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {view === "journal" && (
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-12">
                <Pen className="h-8 w-8 text-gold/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Nenhuma entrada ainda</p>
                <p className="text-xs text-muted-foreground font-body">Complete um exercício para começar seu diário</p>
              </div>
            ) : (
              entries.map(entry => (
                <div key={entry.id} className="bg-card rounded-2xl border border-border p-4 shadow-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-body font-semibold text-gold">{entry.promptTitle}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground font-body">{entry.date}</span>
                      <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}>
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-body text-foreground leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
