import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface Question {
  q: string;
  options: { text: string; type: "gastadora" | "acumuladora" | "equilibrada" | "impulsiva" }[];
}

const questions: Question[] = [
  {
    q: "Quando você recebe seu salário, qual é sua primeira reação?",
    options: [
      { text: "Já penso no que quero comprar 🛍️", type: "gastadora" },
      { text: "Transfiro tudo para a poupança e fico com o mínimo 🏦", type: "acumuladora" },
      { text: "Separo as contas, investimento e o que sobra é livre 📊", type: "equilibrada" },
      { text: "Gasto sem perceber e no fim do mês não sei pra onde foi 🤷‍♀️", type: "impulsiva" },
    ],
  },
  {
    q: "Você vê uma promoção incrível de algo que não precisava. O que faz?",
    options: [
      { text: "Compro na hora — promoção assim não volta! 🔥", type: "impulsiva" },
      { text: "Ignoro completamente, promoção é armadilha 🚫", type: "acumuladora" },
      { text: "Avalio se cabe no orçamento e se realmente preciso 🤔", type: "equilibrada" },
      { text: "Compro e me sinto culpada depois 😅", type: "gastadora" },
    ],
  },
  {
    q: "Como você se sente ao verificar seu extrato bancário?",
    options: [
      { text: "Evito olhar, prefiro não saber 🙈", type: "impulsiva" },
      { text: "Confiro obsessivamente, várias vezes ao dia 📱", type: "acumuladora" },
      { text: "Verifico semanalmente com tranquilidade 📋", type: "equilibrada" },
      { text: "Só olho quando preciso pagar algo 💳", type: "gastadora" },
    ],
  },
  {
    q: "Uma amiga te convida para um jantar caro. Sua reação:",
    options: [
      { text: "Vou sem pensar, a vida é curta! 🥂", type: "gastadora" },
      { text: "Recuso — prefiro economizar esse dinheiro 💰", type: "acumuladora" },
      { text: "Aceito se estiver dentro do meu orçamento do mês 📅", type: "equilibrada" },
      { text: "Vou e parcelo no cartão sem pensar muito 💳", type: "impulsiva" },
    ],
  },
  {
    q: "Qual frase mais te representa em relação ao dinheiro?",
    options: [
      { text: "Dinheiro foi feito pra gastar e aproveitar a vida 🌴", type: "gastadora" },
      { text: "Cada centavo guardado é um passo para a segurança 🔐", type: "acumuladora" },
      { text: "Dinheiro é ferramenta — uso com consciência e prazer 🎯", type: "equilibrada" },
      { text: "Dinheiro some da minha mão, não sei como 🌪️", type: "impulsiva" },
    ],
  },
  {
    q: "Como você lida com dívidas?",
    options: [
      { text: "Tenho várias e finjo que não existem 😶", type: "impulsiva" },
      { text: "NUNCA faço dívida — pago tudo à vista 💵", type: "acumuladora" },
      { text: "Uso crédito estrategicamente e pago em dia 📈", type: "equilibrada" },
      { text: "Às vezes parcelo mais do que deveria, mas dou um jeito 🤞", type: "gastadora" },
    ],
  },
  {
    q: "Quando algo te deixa triste ou estressada, você:",
    options: [
      { text: "Faço compras para me sentir melhor 🛒", type: "gastadora" },
      { text: "Fico mais restritiva ainda com gastos — medo de perder controle 😰", type: "acumuladora" },
      { text: "Busco atividades que não envolvem gastar 🧘‍♀️", type: "equilibrada" },
      { text: "Compro por impulso e depois me arrependo 😩", type: "impulsiva" },
    ],
  },
  {
    q: "Sobre investimentos, qual sua postura?",
    options: [
      { text: "Nunca sobra dinheiro para investir 💸", type: "gastadora" },
      { text: "Invisto mas só em coisas ultra seguras, tenho medo de perder 😟", type: "acumuladora" },
      { text: "Diversifico entre renda fixa e variável com estratégia 📊", type: "equilibrada" },
      { text: "Não entendo nada disso e nunca pesquisei 🤷‍♀️", type: "impulsiva" },
    ],
  },
];

type ProfileType = "gastadora" | "acumuladora" | "equilibrada" | "impulsiva";

const profiles: Record<ProfileType, { emoji: string; title: string; color: string; desc: string; strengths: string[]; challenges: string[]; tips: string[] }> = {
  gastadora: {
    emoji: "🛍️",
    title: "Gastadora Emocional",
    color: "text-orange-400",
    desc: "Você usa o dinheiro como fonte de prazer e recompensa emocional. Comprar te dá uma sensação de poder e alegria momentânea, mas depois pode vir a culpa.",
    strengths: [
      "Sabe aproveitar a vida e se dar presentes",
      "É generosa com quem ama",
      "Não tem medo de investir em experiências",
    ],
    challenges: [
      "Dificuldade em poupar consistentemente",
      "Compras por impulso emocional",
      "Pode acumular dívidas sem perceber",
    ],
    tips: [
      "Crie uma 'conta de prazer' com valor fixo mensal para gastar sem culpa",
      "Antes de comprar, espere 48h — se ainda quiser, compre",
      "Automatize transferências para investimento no dia do pagamento",
      "Identifique seus gatilhos emocionais de compra e crie alternativas",
    ],
  },
  acumuladora: {
    emoji: "🏦",
    title: "Acumuladora Ansiosa",
    color: "text-blue-400",
    desc: "Você tem medo de gastar e vive em modo de escassez. Guardar dinheiro te traz segurança, mas às vezes deixa de viver por medo de perder o que conquistou.",
    strengths: [
      "Disciplina financeira admirável",
      "Sempre tem reserva de emergência",
      "Planejamento de longo prazo sólido",
    ],
    challenges: [
      "Dificuldade em aproveitar o próprio dinheiro",
      "Ansiedade quando precisa gastar",
      "Pode viver abaixo do padrão que poderia",
    ],
    tips: [
      "Reserve um valor mensal OBRIGATÓRIO para autocuidado e prazer",
      "Lembre-se: dinheiro parado perde valor com a inflação — invista!",
      "Pratique gratidão pelo que já conquistou financeiramente",
      "Permita-se gastar com experiências — memórias valem mais que números",
    ],
  },
  equilibrada: {
    emoji: "⚖️",
    title: "Equilibrada Consciente",
    color: "text-green-400",
    desc: "Você tem uma relação saudável com dinheiro. Sabe quando gastar, quando poupar e quando investir. Seu desafio é manter essa consistência e evoluir.",
    strengths: [
      "Relação saudável com dinheiro",
      "Decisões financeiras racionais",
      "Equilíbrio entre prazer e responsabilidade",
    ],
    challenges: [
      "Pode se acomodar e parar de evoluir",
      "Às vezes falta ousadia para investimentos maiores",
      "Precisa manter a disciplina em momentos difíceis",
    ],
    tips: [
      "Desafie-se com metas financeiras mais ambiciosas",
      "Estude investimentos de maior risco/retorno",
      "Mentore outras mulheres sobre finanças",
      "Crie fontes de renda passiva para próximo nível",
    ],
  },
  impulsiva: {
    emoji: "🌪️",
    title: "Impulsiva Desconectada",
    color: "text-red-400",
    desc: "Você gasta sem planejamento e evita olhar para sua realidade financeira. O dinheiro 'desaparece' e você não sabe para onde foi. A boa notícia: consciência é o primeiro passo.",
    strengths: [
      "Espontaneidade e coragem",
      "Não vive presa ao medo",
      "Capacidade de se reinventar",
    ],
    challenges: [
      "Falta de controle e visibilidade dos gastos",
      "Dívidas acumuladas sem perceber",
      "Evita confrontar a realidade financeira",
    ],
    tips: [
      "Comece HOJE: anote TODO gasto por 30 dias, sem julgamento",
      "Delete apps de compra do celular por 1 mês",
      "Congele o cartão de crédito (literalmente, no freezer!)",
      "Estabeleça 1 meta financeira simples: guardar R$100 este mês",
      "Busque apoio — fale sobre dinheiro com alguém de confiança",
    ],
  },
};

const QUIZ_RESULT_KEY = "finance-quiz-result";

export default function FinanceProfileQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<ProfileType[]>([]);
  const [result, setResult] = useState<ProfileType | null>(() => {
    try { const r = localStorage.getItem(QUIZ_RESULT_KEY); return r as ProfileType | null; } catch { return null; }
  });
  const [started, setStarted] = useState(false);

  const handleAnswer = (type: ProfileType) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      // Calculate result
      const counts: Record<ProfileType, number> = { gastadora: 0, acumuladora: 0, equilibrada: 0, impulsiva: 0 };
      newAnswers.forEach(a => counts[a]++);
      const winner = (Object.entries(counts) as [ProfileType, number][]).sort((a, b) => b[1] - a[1])[0][0];
      setResult(winner);
      try { localStorage.setItem(QUIZ_RESULT_KEY, winner); } catch {}
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setStarted(false);
    try { localStorage.removeItem(QUIZ_RESULT_KEY); } catch {}
  };

  // Show result
  if (result) {
    const p = profiles[result];
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
        <div className="p-5 text-center border-b border-border bg-gradient-to-b from-gold/5 to-transparent">
          <span className="text-5xl">{p.emoji}</span>
          <h3 className={cn("text-lg font-display font-bold mt-2", p.color)}>
            {p.title}
          </h3>
          <p className="text-xs font-body text-muted-foreground mt-2 leading-relaxed max-w-sm mx-auto">
            {p.desc}
          </p>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-display font-semibold text-green-400 mb-2">✅ Seus Pontos Fortes</h4>
            <div className="space-y-1.5">
              {p.strengths.map((s, i) => (
                <p key={i} className="text-[11px] font-body text-muted-foreground flex items-start gap-1.5">
                  <span className="text-green-400 shrink-0">•</span> {s}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-display font-semibold text-orange-400 mb-2">⚠️ Seus Desafios</h4>
            <div className="space-y-1.5">
              {p.challenges.map((c, i) => (
                <p key={i} className="text-[11px] font-body text-muted-foreground flex items-start gap-1.5">
                  <span className="text-orange-400 shrink-0">•</span> {c}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-display font-semibold text-gold mb-2">💡 Dicas Para Você</h4>
            <div className="space-y-2">
              {p.tips.map((t, i) => (
                <div key={i} className="bg-gold/5 rounded-lg p-2.5 border border-gold/10">
                  <p className="text-[11px] font-body text-foreground leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={restart}>
            <RotateCcw className="h-3.5 w-3.5 mr-2" /> Refazer o Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (!started) {
    return (
      <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
        <div className="p-6 text-center">
          <span className="text-5xl">🧠</span>
          <h3 className="text-lg font-display font-bold mt-3">Quiz: Seu Perfil Financeiro</h3>
          <p className="text-xs font-body text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
            Descubra qual é o seu padrão comportamental com dinheiro e receba dicas personalizadas para evoluir financeiramente.
          </p>
          <p className="text-[10px] font-body text-muted-foreground mt-3">
            📝 {questions.length} perguntas · ⏱️ ~2 minutos
          </p>
          <Button variant="gold" className="mt-4" onClick={() => setStarted(true)}>
            Começar Quiz ✨
          </Button>
        </div>
      </div>
    );
  }

  // Quiz questions
  const q = questions[currentQ];
  const progress = ((currentQ) / questions.length) * 100;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden mt-3">
      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-body text-muted-foreground">
            Pergunta {currentQ + 1} de {questions.length}
          </span>
          <span className="text-[10px] font-body text-gold font-medium">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gold rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="p-4">
        <h3 className="text-sm font-display font-semibold text-foreground mb-4 leading-relaxed">
          {q.q}
        </h3>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt.type)}
              className="w-full text-left p-3 rounded-xl border border-border bg-muted/20 hover:bg-gold/10 hover:border-gold/30 transition-all text-xs font-body text-foreground leading-relaxed active:scale-[0.98]"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
