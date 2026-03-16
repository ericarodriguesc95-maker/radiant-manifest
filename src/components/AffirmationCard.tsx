import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const affirmations = [
  {
    text: "Eu sou digna de amor, sucesso e abundância.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: fique 2 minutos em frente ao espelho, repita a afirmação 7 vezes e escreva uma ação concreta que honre seu valor hoje.",
  },
  {
    text: "Eu sou forte, capaz e corajosa.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: escolha a tarefa que você vem adiando e execute por 15 minutos sem interrupções, repetindo a afirmação antes de começar.",
  },
  {
    text: "Minha energia é magnética e positiva.",
    focus: "Direcionada para elevar presença pessoal, confiança social e abertura para oportunidades.",
    exercise: "Exercício prático: faça uma caminhada de 10 minutos em postura ereta, respirando profundamente e mantendo foco em pensamentos de gratidão.",
  },
  {
    text: "Eu mereço o melhor e o melhor vem até mim.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: anote 3 áreas da vida em que você aceita mais qualidade e defina 1 atitude prática para elevar seu padrão hoje.",
  },
  {
    text: "Eu confio no meu processo e no meu tempo.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: escreva 3 conquistas que você já alcançou e que antes pareciam impossíveis. Releia com gratidão.",
  },
  {
    text: "Eu escolho pensamentos que me fortalecem.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: durante 1 hora, observe seus pensamentos. A cada pensamento negativo, substitua conscientemente por um positivo.",
  },
  {
    text: "Eu sou a criadora da minha realidade.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: escolha uma área da vida que quer transformar e escreva 3 ações concretas que pode fazer esta semana.",
  },
  {
    text: "Meu corpo é meu templo e eu cuido dele com amor.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: prepare uma refeição nutritiva com carinho, agradeça pelo alimento e coma sem distrações.",
  },
  {
    text: "Eu libero o que não me serve e abro espaço para o novo.",
    focus: "Direcionada para desapego emocional e renovação de ciclos.",
    exercise: "Exercício prático: separe 3 objetos, hábitos ou pensamentos que não te servem mais e se comprometa a liberá-los hoje.",
  },
  {
    text: "Eu sou luz e minha presença ilumina os ambientes.",
    focus: "Direcionada para elevar autoconfiança e impacto social positivo.",
    exercise: "Exercício prático: hoje, elogie genuinamente 3 pessoas e observe como isso transforma a energia ao seu redor.",
  },
  {
    text: "A abundância flui naturalmente para mim.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: anote 10 coisas pelas quais você é grata financeiramente, desde as menores até as maiores.",
  },
  {
    text: "Eu perdoo, me liberto e sigo em paz.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: escreva uma carta de perdão (para si ou para alguém) e depois solte — queime ou rasgue como ritual de liberação.",
  },
  {
    text: "Eu sou merecedora de relacionamentos saudáveis e amorosos.",
    focus: "Direcionada para vínculos afetivos e limites emocionais.",
    exercise: "Exercício prático: identifique um relacionamento que precisa de limites e defina uma ação concreta para honrar seu bem-estar.",
  },
  {
    text: "Cada dia é uma nova oportunidade de recomeçar.",
    focus: "Direcionada para motivação, recomeços e superação de falhas.",
    exercise: "Exercício prático: escreva algo que não deu certo ontem e redefina um plano de ação positivo para hoje.",
  },
  {
    text: "Eu celebro minhas vitórias, grandes e pequenas.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: liste 5 vitórias da última semana, por menores que sejam, e celebre cada uma com um gesto de gratidão.",
  },
  {
    text: "Minha intuição me guia para as melhores decisões.",
    focus: "Direcionada para autoconfiança intuitiva e clareza mental.",
    exercise: "Exercício prático: antes de tomar uma decisão hoje, feche os olhos, respire 3 vezes e pergunte ao seu coração o que sente.",
  },
  {
    text: "Eu me amo e me aceito exatamente como sou.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: olhe-se no espelho por 2 minutos e diga 'Eu te amo' para si mesma, observando cada detalhe com ternura.",
  },
  {
    text: "Eu atraio pessoas e situações que elevam minha vida.",
    focus: "Direcionada para lei da atração e frequência vibracional.",
    exercise: "Exercício prático: visualize por 5 minutos a vida que deseja viver, sentindo as emoções como se já fosse real.",
  },
  {
    text: "Minha disciplina de hoje constrói a mulher que serei amanhã.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: escolha 1 hábito que está construindo e execute-o hoje mesmo sem motivação, apenas por compromisso.",
  },
  {
    text: "Eu sou grata por tudo que tenho e tudo que está a caminho.",
    focus: "Direcionada para gratidão profunda e confiança no futuro.",
    exercise: "Exercício prático: escreva 3 gratidões pelo presente e 3 gratidões antecipadas pelo que está vindo na sua vida.",
  },
  {
    text: "Eu tenho permissão para descansar sem culpa.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: reserve 30 minutos hoje exclusivamente para algo que te dá prazer, sem celular e sem culpa.",
  },
  {
    text: "Minha voz importa e merece ser ouvida.",
    focus: "Direcionada para expressão autêntica e assertividade.",
    exercise: "Exercício prático: expresse uma opinião ou sentimento que você vem guardando, de forma respeitosa e firme.",
  },
  {
    text: "Eu transformo desafios em aprendizados poderosos.",
    focus: "Direcionada para resiliência e mentalidade de crescimento.",
    exercise: "Exercício prático: pense em um desafio atual e escreva 3 lições que ele está te ensinando.",
  },
  {
    text: "Eu sou protagonista da minha história.",
    focus: "Direcionada para responsabilidade pessoal e empoderamento.",
    exercise: "Exercício prático: escreva o próximo capítulo da sua história como você quer que seja e dê o primeiro passo hoje.",
  },
  {
    text: "Minha paz interior é inabalável.",
    focus: "Direcionada para equilíbrio emocional e serenidade.",
    exercise: "Exercício prático: medite por 5 minutos focando apenas na respiração. A cada pensamento invasor, volte gentilmente ao ar.",
  },
  {
    text: "Eu sou suficiente exatamente como estou agora.",
    focus: "Direcionada para combater o perfeccionismo e a síndrome da impostora.",
    exercise: "Exercício prático: identifique uma cobrança interna excessiva e conscientemente a solte, dizendo 'Eu já sou suficiente'.",
  },
  {
    text: "O universo conspira a meu favor.",
    focus: "Direcionada para confiança cósmica e abertura espiritual.",
    exercise: "Exercício prático: observe 3 sinais positivos ao longo do dia e anote-os como evidências de que o universo te apoia.",
  },
  {
    text: "Eu mereço prosperidade em todas as áreas da minha vida.",
    focus: "Direcionada para expansão holística: saúde, amor, carreira e finanças.",
    exercise: "Exercício prático: para cada área (saúde, amor, carreira, finanças), defina 1 intenção clara para esta semana.",
  },
  {
    text: "Minha energia é renovada a cada respiração.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: faça 10 respirações profundas (4s inspira, 7s segura, 8s expira) e sinta a energia renovar seu corpo.",
  },
  {
    text: "Eu escolho a alegria como meu estado natural.",
    focus: "Direcionada para cultivar positividade e leveza no dia a dia.",
    exercise: "Exercício prático: dance uma música que ama por 3 minutos, sem se importar com nada ao redor. Apenas sinta a alegria.",
  },
  {
    text: "Eu honro meus limites e protejo minha energia.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: identifique 1 situação onde precisa dizer 'não' e pratique dizê-lo com firmeza e gentileza.",
  },
];

function getAffirmationForDate(date: Date) {
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  return affirmations[dayOfYear % affirmations.length];
}

export default function AffirmationCard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const affirmation = getAffirmationForDate(selectedDate);

  const goBack = () => setSelectedDate((d) => subDays(d, 1));
  const goForward = () => {
    if (!isToday(selectedDate)) setSelectedDate((d) => addDays(d, 1));
  };

  const dateLabel = isToday(selectedDate)
    ? "Hoje"
    : format(selectedDate, "dd 'de' MMMM", { locale: ptBR });

  return (
    <section className="rounded-2xl border border-border bg-foreground p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-gold">Guia da Afirmação Diária</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="p-1 rounded-full hover:bg-background/10 transition-colors" aria-label="Dia anterior">
            <ChevronLeft className="h-4 w-4 text-background/60" />
          </button>
          <span className="text-xs font-body text-background/60 min-w-[80px] text-center">{dateLabel}</span>
          <button
            onClick={goForward}
            disabled={isToday(selectedDate)}
            className="p-1 rounded-full hover:bg-background/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Próximo dia"
          >
            <ChevronRight className="h-4 w-4 text-background/60" />
          </button>
        </div>
      </div>

      <p className="text-base font-display font-medium text-background leading-relaxed italic">"{affirmation.text}"</p>

      <div className="border-t border-background/20 pt-3 space-y-3">
        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-background/50 mb-1">Para que é direcionada</p>
          <p className="text-sm font-body text-background/70 leading-relaxed">{affirmation.focus}</p>
        </div>

        <div>
          <p className="text-[10px] font-body tracking-[0.2em] uppercase text-background/50 mb-1">Exercício prático do dia</p>
          <p className="text-sm font-body text-background/70 leading-relaxed">{affirmation.exercise}</p>
        </div>
      </div>
    </section>
  );
}
