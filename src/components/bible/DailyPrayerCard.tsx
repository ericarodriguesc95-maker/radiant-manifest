import { useMemo, useState } from "react";
import { HandHeart, Copy, Check, Share2, RefreshCw } from "lucide-react";
import { getDailyPrayer, dailyPrayers } from "./dailyPrayers";
import { useToast } from "@/hooks/use-toast";

const DailyPrayerCard = () => {
  const { toast } = useToast();
  const today = useMemo(() => getDailyPrayer(), []);
  const [index, setIndex] = useState(() => dailyPrayers.indexOf(today));
  const [copied, setCopied] = useState(false);

  const prayer = dailyPrayers[index] ?? today;

  const fullText = `🙏 Oração do dia — ${prayer.theme}\n\n"${prayer.verse}" (${prayer.reference})\n\n${prayer.prayer}`;

  const copy = async () => {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Oração do dia", text: fullText });
        return;
      } catch {
        /* usuária cancelou */
      }
    }
    await copy();
    toast({ title: "Oração copiada", description: "Cole onde quiser compartilhar." });
  };

  const dateLabel = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });

  return (
    <div className="space-y-4">
      <article className="glass rounded-3xl border border-gold/20 p-5 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gold/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <HandHeart className="h-4 w-4 text-gold" />
            <span className="text-[10px] font-body uppercase tracking-[0.2em] text-gold/90">
              Oração do dia
            </span>
          </div>
          <p className="text-[11px] font-body text-muted-foreground capitalize mb-4">{dateLabel}</p>

          <h2 className="font-display text-2xl text-foreground mb-3">{prayer.theme}</h2>

          <blockquote className="border-l-2 border-gold/40 pl-3 mb-4">
            <p className="text-sm font-body italic text-foreground/80 leading-relaxed">
              “{prayer.verse}”
            </p>
            <cite className="not-italic text-[11px] font-body text-gold/80">{prayer.reference}</cite>
          </blockquote>

          <p className="text-sm font-body leading-relaxed text-foreground/85 whitespace-pre-line">
            {prayer.prayer}
          </p>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gold/10">
            <button
              onClick={copy}
              aria-label="Copiar oração"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold text-gold hover:bg-gold/10 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiada" : "Copiar"}
            </button>
            <button
              onClick={share}
              aria-label="Compartilhar oração"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold text-gold hover:bg-gold/10 transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              Compartilhar
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % dailyPrayers.length)}
              aria-label="Ver outra oração"
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-body font-semibold text-gold hover:bg-gold/10 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Outra oração
            </button>
          </div>
        </div>
      </article>

      <p className="text-[11px] font-body text-muted-foreground text-center px-6">
        Ore com calma, em voz alta se puder. Depois respire fundo e siga o dia confiando.
      </p>
    </div>
  );
};

export default DailyPrayerCard;
