import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, BookOpen, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bibleBooks, parseReference, normalize, type BibleBook } from "./bibleBooks";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Verse {
  verse: number;
  text: string;
}

const BibleReader = () => {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [book, setBook] = useState<BibleBook>(bibleBooks.find((b) => b.name === "João")!);
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [highlight, setHighlight] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const suggestions = useMemo(() => {
    const q = normalize(query.replace(/[\d:.\-]/g, ""));
    if (!q) return [];
    return bibleBooks.filter((b) => normalize(b.name).startsWith(q)).slice(0, 6);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://bible-api.com/${encodeURIComponent(`${book.name} ${chapter}`)}?translation=almeida`
        );
        if (!res.ok) throw new Error("Não foi possível carregar o capítulo.");
        const data = await res.json();
        if (cancelled) return;
        setVerses(
          (data.verses || []).map((v: { verse: number; text: string }) => ({
            verse: v.verse,
            text: (v.text || "").trim(),
          }))
        );
      } catch {
        if (!cancelled) setError("Não conseguimos carregar agora. Verifique sua conexão e tente novamente.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [book, chapter]);

  const goSearch = (raw?: string) => {
    const parsed = parseReference(raw ?? query);
    if (!parsed) {
      toast({ title: "Referência não encontrada", description: "Tente algo como 'João 3' ou 'Salmos 23:1-6'." });
      return;
    }
    setBook(parsed.book);
    setChapter(parsed.chapter);
    if (parsed.verses) {
      const nums: number[] = [];
      parsed.verses.split(",").forEach((part) => {
        const [a, b] = part.split("-").map((n) => parseInt(n, 10));
        if (!isNaN(a)) {
          if (!isNaN(b)) for (let i = a; i <= b; i++) nums.push(i);
          else nums.push(a);
        }
      });
      setHighlight(nums);
    } else {
      setHighlight([]);
    }
  };

  const copyChapter = async () => {
    const text = `${book.name} ${chapter}\n\n${verses.map((v) => `${v.verse}. ${v.text}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="glass rounded-2xl p-3 border border-gold/10 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goSearch()}
              placeholder="Buscar: João 3:16, Salmos 23, 1 Coríntios 13"
              aria-label="Buscar livro, capítulo e versículo"
              className="pl-9 rounded-xl bg-background/60 border-gold/20 text-sm font-body"
            />
          </div>
          <Button onClick={() => goSearch()} className="rounded-xl px-4">
            Ler
          </Button>
        </div>

        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map((b) => (
              <button
                key={b.name}
                onClick={() => {
                  setQuery(b.name + " 1");
                  goSearch(b.name + " 1");
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-body bg-gold/10 text-gold hover:bg-gold/20 transition-colors"
              >
                {b.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Seletores */}
      <div className="flex gap-2">
        <select
          value={book.name}
          onChange={(e) => {
            const b = bibleBooks.find((x) => x.name === e.target.value)!;
            setBook(b);
            setChapter(1);
            setHighlight([]);
          }}
          aria-label="Selecionar livro"
          className="flex-1 rounded-xl bg-background/60 border border-gold/20 px-3 py-2 text-sm font-body text-foreground"
        >
          <optgroup label="Antigo Testamento">
            {bibleBooks.filter((b) => b.testament === "AT").map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </optgroup>
          <optgroup label="Novo Testamento">
            {bibleBooks.filter((b) => b.testament === "NT").map((b) => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </optgroup>
        </select>
        <select
          value={chapter}
          onChange={(e) => {
            setChapter(parseInt(e.target.value, 10));
            setHighlight([]);
          }}
          aria-label="Selecionar capítulo"
          className="w-28 rounded-xl bg-background/60 border border-gold/20 px-3 py-2 text-sm font-body text-foreground"
        >
          {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
            <option key={c} value={c}>Cap. {c}</option>
          ))}
        </select>
      </div>

      {/* Texto */}
      <div className="glass rounded-2xl border border-gold/10 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg text-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            {book.name} {chapter}
          </h2>
          <button
            onClick={copyChapter}
            aria-label="Copiar capítulo"
            className="p-2 rounded-lg hover:bg-gold/10 text-gold transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gold">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm font-body text-muted-foreground py-6 text-center">{error}</p>
        ) : (
          <div className="space-y-2.5">
            {verses.map((v) => (
              <p
                key={v.verse}
                className={cn(
                  "text-sm font-body leading-relaxed text-foreground/85 rounded-lg px-2 py-1 -mx-2 transition-colors",
                  highlight.includes(v.verse) && "bg-gold/15 text-foreground"
                )}
              >
                <span className="text-gold font-semibold text-xs mr-1.5 align-super">{v.verse}</span>
                {v.text}
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gold/10">
          <button
            onClick={() => setChapter((c) => Math.max(1, c - 1))}
            disabled={chapter <= 1}
            aria-label="Capítulo anterior"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold text-gold hover:bg-gold/10 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          <button
            onClick={() => setChapter((c) => Math.min(book.chapters, c + 1))}
            disabled={chapter >= book.chapters}
            aria-label="Próximo capítulo"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold text-gold hover:bg-gold/10 disabled:opacity-30 transition-all"
          >
            Próximo <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BibleReader;
