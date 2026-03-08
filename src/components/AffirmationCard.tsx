import { useState } from "react";
import { Sparkles } from "lucide-react";

const affirmations = [
  {
    text: "Eu sou digna de amor, sucesso e abundância.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise:
      "Exercício prático: fique 2 minutos em frente ao espelho, repita a afirmação 7 vezes e escreva uma ação concreta que honre seu valor hoje.",
  },
  {
    text: "Eu sou forte, capaz e corajosa.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise:
      "Exercício prático: escolha a tarefa que você vem adiando e execute por 15 minutos sem interrupções, repetindo a afirmação antes de começar.",
  },
  {
    text: "Minha energia é magnética e positiva.",
    focus: "Direcionada para elevar presença pessoal, confiança social e abertura para oportunidades.",
    exercise:
      "Exercício prático: faça uma caminhada de 10 minutos em postura ereta, respirando profundamente e mantendo foco em pensamentos de gratidão.",
  },
  {
    text: "Eu mereço o melhor e o melhor vem até mim.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise:
      "Exercício prático: anote 3 áreas da vida em que você aceita mais qualidade e defina 1 atitude prática para elevar seu padrão hoje.",
  },
];

export default function AffirmationCard() {
  const [index] = useState(() => Math.floor(Math.random() * affirmations.length));
  const affirmation = affirmations[index];

  return (
    <section className="rounded-2xl border border-border bg-secondary p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-body tracking-[0.2em] uppercase text-primary">Guia da Afirmação Diária</p>
      </div>

      <p className="text-base font-display font-medium text-secondary-foreground leading-relaxed italic">“{affirmation.text}”</p>

      <div className="border-t border-border pt-3 space-y-3">
        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Para que é direcionada</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{affirmation.focus}</p>
        </div>

        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-muted-foreground mb-1">Exercício prático do dia</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">{affirmation.exercise}</p>
        </div>
      </div>
    </section>
  );
}

