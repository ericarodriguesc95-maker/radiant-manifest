import { useMemo, useState } from "react";
import { Search, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import { bibleDictionary, dictionaryCategories } from "./bibleDictionary";
import { normalize } from "./bibleBooks";
import { cn } from "@/lib/utils";

const BibleDictionary = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Todos");

  const results = useMemo(() => {
    const q = normalize(query);
    return bibleDictionary
      .filter((e) => (category === "Todos" ? true : e.category === category))
      .filter((e) => !q || normalize(e.term).includes(q) || normalize(e.meaning).includes(q))
      .sort((a, b) => a.term.localeCompare(b.term, "pt-BR"));
  }, [query, category]);

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-3 border border-gold/10 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar palavra: graça, aliança, jubileu..."
            aria-label="Buscar palavra no dicionário bíblico"
            className="pl-9 rounded-xl bg-background/60 border-gold/20 text-sm font-body"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {dictionaryCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-body font-semibold transition-colors",
                category === c ? "bg-gold text-background" : "bg-gold/10 text-gold hover:bg-gold/20"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] font-body text-muted-foreground px-1">
        {results.length} palavra{results.length === 1 ? "" : "s"} encontrada{results.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-2.5">
        {results.map((e) => (
          <article key={e.term} className="glass rounded-2xl border border-gold/10 p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className="font-display text-base text-foreground flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-gold" />
                {e.term}
              </h3>
              <span className="text-[10px] font-body uppercase tracking-wider text-gold/80 bg-gold/10 px-2 py-0.5 rounded-full">
                {e.category}
              </span>
            </div>
            <p className="text-sm font-body leading-relaxed text-foreground/80">{e.meaning}</p>
            {e.reference && (
              <p className="text-[11px] font-body text-gold/80 mt-2">{e.reference}</p>
            )}
          </article>
        ))}
        {results.length === 0 && (
          <p className="text-sm font-body text-muted-foreground text-center py-8">
            Nenhuma palavra encontrada. Tente outro termo.
          </p>
        )}
      </div>
    </div>
  );
};

export default BibleDictionary;
