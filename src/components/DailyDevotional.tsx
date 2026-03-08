import { useState } from "react";
import { BookMarked } from "lucide-react";

const devotionals = [
  {
    verse: "Porque eu sei os planos que tenho para vocês — Jeremias 29:11",
    reflection:
      "Mesmo quando o caminho parece confuso, Deus já preparou direção e futuro. Hoje, escolha confiar no processo e não apenas no resultado imediato.",
    devotional:
      "Devocional do dia: entregue suas preocupações em oração, respire fundo e dê um passo prático de fé naquilo que você já sabe que precisa fazer.",
  },
  {
    verse: "Tudo posso naquele que me fortalece — Filipenses 4:13",
    reflection:
      "Sua força não depende apenas do seu humor ou energia; ela também vem da constância espiritual. Você pode avançar com coragem, mesmo em passos pequenos.",
    devotional:
      "Devocional do dia: antes de iniciar suas tarefas, declare este versículo em voz alta e peça força para manter foco e disciplina.",
  },
  {
    verse: "Confie no Senhor de todo o coração — Provérbios 3:5",
    reflection:
      "Confiar é soltar o controle que gera ansiedade. Hoje, troque a necessidade de controlar tudo por obediência e serenidade no presente.",
    devotional:
      "Devocional do dia: escreva em um papel uma preocupação e, ao lado, uma ação simples que represente confiança prática em Deus.",
  },
];

export default function DailyDevotional() {
  const [index] = useState(() => Math.floor(Math.random() * devotionals.length));
  const devotional = devotionals[index];

  return (
    <section className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary">Guia do Versículo Diário</p>
      </div>

      <p className="text-base font-display font-medium text-card-foreground leading-relaxed italic">“{devotional.verse}”</p>

      <div className="space-y-3 border-t border-border pt-3">
        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Reflexão</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{devotional.reflection}</p>
        </div>

        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Devocional do Dia</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{devotional.devotional}</p>
        </div>
      </div>
    </section>
  );
}
