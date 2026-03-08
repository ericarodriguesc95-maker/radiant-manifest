import { useState } from "react";

const affirmations = [
  "Eu sou digna de amor, sucesso e abundância.",
  "Eu atraio tudo que é bom para minha vida.",
  "Eu sou forte, capaz e corajosa.",
  "Minha energia é magnética e positiva.",
  "Eu mereço o melhor e o melhor vem até mim.",
  "Eu estou em constante evolução e crescimento.",
  "Eu sou grata por tudo que tenho e tudo que virá.",
  "Minha beleza interior reflete no exterior.",
];

const verses = [
  "Porque eu sei os planos que tenho para vocês — Jeremias 29:11",
  "Tudo posso naquele que me fortalece — Filipenses 4:13",
  "O Senhor é meu pastor, nada me faltará — Salmos 23:1",
  "Confie no Senhor de todo o coração — Provérbios 3:5",
  "Deus é nosso refúgio e fortaleza — Salmos 46:1",
];

export default function AffirmationCard() {
  const [index] = useState(() => Math.floor(Math.random() * affirmations.length));
  const [verseIndex] = useState(() => Math.floor(Math.random() * verses.length));

  return (
    <div className="bg-secondary rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold mb-2">
          ✦ Afirmação do Dia
        </p>
        <p className="text-base font-display font-medium text-secondary-foreground leading-relaxed italic">
          "{affirmations[index]}"
        </p>
      </div>
      <div className="border-t border-border pt-3">
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold mb-1">
          Versículo do Dia
        </p>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          {verses[verseIndex]}
        </p>
      </div>
    </div>
  );
}
