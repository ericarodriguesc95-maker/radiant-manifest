import { useCallback, useEffect, useState } from "react";
import { Highlighter, Loader2, Trash2, Copy, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { highlightColors, colorBg, colorChip } from "./highlightColors";
import { cn } from "@/lib/utils";

interface HighlightRow {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  verse_text: string;
  color: string;
  created_at: string;
}

const BibleHighlights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<HighlightRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("bible_highlights")
      .select("id, book, chapter, verse, verse_text, color, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Não conseguimos carregar seus grifos", variant: "destructive" });
    } else {
      setRows((data as HighlightRow[]) || []);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    load();
    const onChange = () => load();
    window.addEventListener("bible:highlights-updated", onChange);
    return () => window.removeEventListener("bible:highlights-updated", onChange);
  }, [load]);

  const remove = async (id: string) => {
    const { error } = await supabase.from("bible_highlights").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", variant: "destructive" });
      return;
    }
    setRows((r) => r.filter((x) => x.id !== id));
    window.dispatchEvent(new CustomEvent("bible:highlights-updated"));
  };

  const copy = async (r: HighlightRow) => {
    await navigator.clipboard.writeText(`"${r.verse_text}" — ${r.book} ${r.chapter}:${r.verse}`);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  const filtered = rows.filter((r) => {
    if (filter && r.color !== filter) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      r.verse_text.toLowerCase().includes(q) ||
      `${r.book} ${r.chapter}:${r.verse}`.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3 border border-gold/10 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nos seus versículos grifados"
            aria-label="Buscar versículos grifados"
            className="pl-9 rounded-xl bg-background/60 border-gold/20 text-sm font-body"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter(null)}
            className={cn(
              "px-2.5 py-1 rounded-full text-[11px] font-body transition-colors",
              filter === null ? "bg-gold/20 text-gold" : "bg-muted/40 text-muted-foreground"
            )}
          >
            Todos ({rows.length})
          </button>
          {highlightColors.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(filter === c.key ? null : c.key)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-body inline-flex items-center gap-1.5 transition-colors",
                filter === c.key ? "bg-gold/20 text-gold" : "bg-muted/40 text-muted-foreground"
              )}
            >
              <span className={cn("h-2.5 w-2.5 rounded-full", c.chip)} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-gold">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl border border-gold/10 p-8 text-center">
          <Highlighter className="h-6 w-6 text-gold mx-auto mb-2" />
          <p className="text-sm font-body text-muted-foreground">
            Você ainda não grifou nenhum versículo. Abra a aba Bíblia e toque em um versículo para grifar.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <article key={r.id} className={cn("rounded-2xl border border-gold/10 p-3.5", colorBg(r.color))}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[11px] font-body font-semibold text-gold mb-1 flex items-center gap-1.5">
                    <span className={cn("h-2 w-2 rounded-full", colorChip(r.color))} />
                    {r.book} {r.chapter}:{r.verse}
                  </p>
                  <p className="text-sm font-body leading-relaxed text-foreground/90">{r.verse_text}</p>
                  <p className="text-[10px] font-body text-muted-foreground mt-1.5">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => copy(r)}
                    aria-label="Copiar versículo"
                    className="p-1.5 rounded-lg hover:bg-gold/10 text-gold transition-colors"
                  >
                    {copiedId === r.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    aria-label="Remover grifo"
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive/80 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BibleHighlights;
