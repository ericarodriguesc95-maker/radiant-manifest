import { useState } from "react";
import { PenLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "glow-manifestacao-escrita";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getSaved(): { date: string; text: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date !== getToday()) return null;
    return data;
  } catch { return null; }
}

export default function ManifestacaoEscrita() {
  const [text, setText] = useState(getSaved()?.text || "");
  const [saved, setSaved] = useState(!!getSaved());

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getToday(), text }));
    setSaved(true);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
          <PenLine className="h-7 w-7 text-gold" />
        </div>
        <h3 className="text-lg font-display font-bold">Manifestação Escrita</h3>
        <p className="text-xs font-body text-muted-foreground">Escreva como se já tivesse acontecido</p>
      </div>

      <div className="glass-gold rounded-2xl p-4 space-y-2">
        <p className="text-[10px] font-body font-semibold text-gold uppercase tracking-wider">Minha Manifestação de Hoje</p>
        <p className="text-[10px] font-body text-muted-foreground italic">
          Escreva como se já tivesse acontecido. Descreva a vida dos seus sonhos no presente, mesmo que ainda não seja realidade.
        </p>
      </div>

      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setSaved(false); }}
        placeholder="Hoje eu manifestei... Eu sinto gratidão porque... Minha vida é..."
        rows={6}
        className="w-full glass rounded-xl p-4 text-sm font-body outline-none resize-none placeholder:text-muted-foreground focus:border-gold/50 transition-colors border border-border"
      />

      <Button
        onClick={save}
        disabled={!text.trim()}
        className="w-full bg-gold hover:bg-gold/90 text-background font-body font-semibold"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {saved ? "✓ Manifestação salva" : "Salvar manifestação"}
      </Button>

      {saved && (
        <p className="text-center text-[10px] font-body text-muted-foreground italic">
          Todos os direitos reservados — Eu Espiritual
        </p>
      )}
    </div>
  );
}
