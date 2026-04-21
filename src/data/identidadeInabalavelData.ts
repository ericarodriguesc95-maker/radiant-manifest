// Método Identidade Inabalável - Espírito, Alma e Corpo
// Conteúdo bíblico + práticas semanais

export type Pilar = "espirito" | "alma" | "corpo";

export interface QuizQuestion {
  id: string;
  pilar: Pilar;
  question: string;
  // Escala 1-5 (5 = problema mais intenso => maior necessidade naquele pilar)
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "identidade",
    pilar: "espirito",
    question:
      "Sinto que minha conexão com Deus / minha essência depende do meu humor no dia.",
  },
  {
    id: "passado",
    pilar: "alma",
    question:
      "Com que frequência me pego repetindo erros que prometi nunca mais cometer?",
  },
  {
    id: "mascaras",
    pilar: "alma",
    question:
      "Sinto que preciso ser a 'mulher forte' o tempo todo para não decepcionar ninguém.",
  },
  {
    id: "rotina",
    pilar: "corpo",
    question: "Minha rotina atual me liberta ou me escraviza? (5 = me escraviza)",
  },
];

export const PILAR_INFO: Record<
  Pilar,
  {
    nome: string;
    subtitulo: string;
    icon: string;
    color: string;
    versiculo: string;
    referencia: string;
    descricao: string;
  }
> = {
  espirito: {
    nome: "Espírito",
    subtitulo: "Sua conexão com Deus e com sua essência",
    icon: "✝️",
    color: "from-amber-900/40 to-amber-700/15",
    versiculo:
      "“Deus é Espírito, e importa que os seus adoradores o adorem em espírito e em verdade.”",
    referencia: "João 4:24",
    descricao:
      "O Espírito é a raiz de tudo. Quando ele está bem alimentado pela Palavra e pela presença de Deus, alma e corpo se alinham naturalmente.",
  },
  alma: {
    nome: "Alma",
    subtitulo: "Mente, emoções, vontade e memórias",
    icon: "💜",
    color: "from-purple-900/40 to-purple-700/15",
    versiculo:
      "“Bendize, ó minha alma, ao Senhor, e tudo o que há em mim bendiga o seu santo nome.”",
    referencia: "Salmos 103:1",
    descricao:
      "A alma é onde moram suas feridas, máscaras e padrões. Curar a alma é permitir que Deus reescreva sua história.",
  },
  corpo: {
    nome: "Corpo",
    subtitulo: "Templo do Espírito Santo, sua rotina e seus hábitos",
    icon: "🕊️",
    color: "from-rose-900/40 to-rose-700/15",
    versiculo:
      "“Não sabeis que o vosso corpo é santuário do Espírito Santo? Glorificai, pois, a Deus no vosso corpo.”",
    referencia: "1 Coríntios 6:19-20",
    descricao:
      "O corpo é o veículo do propósito. Hábitos pequenos e inegociáveis sustentam grandes transformações.",
  },
};

export interface ExercicioSemanal {
  titulo: string;
  resumo: string;
  passos: string[];
  metrica: string;
  versiculo: string;
  referencia: string;
  duracao: string;
}

export const EXERCICIOS: Record<Pilar, ExercicioSemanal[]> = {
  espirito: [
    {
      titulo: "O Jejum da Validação",
      resumo:
        "24h sem postar nas redes sociais ou buscar elogios. O foco é falar com Deus e consigo mesma.",
      passos: [
        "Avise quem precisa que você ficará offline por 24h.",
        "Substitua cada impulso de checar redes por uma oração curta.",
        "Ao fim do dia, escreva no Diário 3 coisas que Deus te mostrou.",
      ],
      metrica: "Conclusão das 24h + 1 registro de insight no Diário.",
      versiculo:
        "“Aquietai-vos, e sabei que eu sou Deus.”",
      referencia: "Salmos 46:10",
      duracao: "24 horas",
    },
    {
      titulo: "Tempo a Sós com o Pai",
      resumo:
        "15 minutos diários, sem celular, com a Bíblia aberta e um caderno.",
      passos: [
        "Escolha um Salmo (comece pelos 23, 27, 91, 139).",
        "Leia em voz alta. Sublinhe o verso que mais tocar.",
        "Escreva o que Deus quer te dizer através dele.",
      ],
      metrica: "7 check-ins consecutivos no Habit Tracker.",
      versiculo:
        "“Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.”",
      referencia: "Mateus 6:33",
      duracao: "15 min/dia",
    },
  ],
  alma: [
    {
      titulo: "Ressignificando Ciclos",
      resumo:
        "Escreva em um papel um erro do passado e o transforme em uma frase de aprendizado (Testemunho).",
      passos: [
        "Escreva o erro/ferida em uma folha.",
        "Pergunte: 'O que isso me ensinou sobre Deus, sobre mim e sobre amor?'",
        "Reescreva em UMA frase de poder. Cole no espelho.",
      ],
      metrica: "Transformar a 'ferida' em 'frase de poder' no perfil.",
      versiculo:
        "“Eis que faço uma coisa nova; agora sairá à luz; porventura não a percebeis?”",
      referencia: "Isaías 43:19",
      duracao: "30 min",
    },
    {
      titulo: "Tirando as Máscaras",
      resumo:
        "Identifique as 3 máscaras que você mais usa (a forte, a perfeita, a engraçada, a 'tô bem'…).",
      passos: [
        "Liste as máscaras e quando você as coloca.",
        "Pergunte: 'Quem eu protejo me escondendo atrás disso?'",
        "Escolha 1 pessoa segura para mostrar uma versão real essa semana.",
      ],
      metrica: "1 conversa real registrada + reflexão no Diário.",
      versiculo:
        "“Conhecereis a verdade, e a verdade vos libertará.”",
      referencia: "João 8:32",
      duracao: "1 semana",
    },
  ],
  corpo: [
    {
      titulo: "Rotina Leve – 1 Hábito Inegociável",
      resumo:
        "Escolha 1 hábito (15 min de leitura, 2L de água, 20 min de caminhada) e segure por 7 dias.",
      passos: [
        "Defina o hábito de forma específica e simples.",
        "Marque um horário fixo no dia.",
        "Faça check-in diário no Habit Tracker.",
      ],
      metrica: "7 check-ins no Habit Tracker.",
      versiculo:
        "“Tudo posso naquele que me fortalece.”",
      referencia: "Filipenses 4:13",
      duracao: "7 dias",
    },
    {
      titulo: "Templo Renovado",
      resumo:
        "Cuide do corpo como santuário: sono, água, movimento e silêncio.",
      passos: [
        "Durma 7-8h por 5 noites consecutivas.",
        "Beba 2L de água por dia.",
        "Movimente-se 20 min/dia (caminhada serve).",
      ],
      metrica: "Pelo menos 5 dias com os 3 itens completos.",
      versiculo:
        "“Amada, desejo que te vá bem em todas as coisas, e que tenhas saúde, assim como bem vai a tua alma.”",
      referencia: "3 João 1:2",
      duracao: "1 semana",
    },
  ],
};

export interface ResultadoQuiz {
  espirito: number;
  alma: number;
  corpo: number;
  pilarFoco: Pilar;
  data: string;
}

export function calcularResultado(respostas: Record<string, number>): ResultadoQuiz {
  const scores: Record<Pilar, number> = { espirito: 0, alma: 0, corpo: 0 };
  const counts: Record<Pilar, number> = { espirito: 0, alma: 0, corpo: 0 };

  QUIZ_QUESTIONS.forEach((q) => {
    const v = respostas[q.id] ?? 0;
    scores[q.pilar] += v;
    counts[q.pilar] += 1;
  });

  // normalizar (0-100)
  const norm = (p: Pilar) =>
    counts[p] === 0 ? 0 : Math.round((scores[p] / (counts[p] * 5)) * 100);

  const result = {
    espirito: norm("espirito"),
    alma: norm("alma"),
    corpo: norm("corpo"),
  };

  const pilarFoco = (Object.entries(result) as [Pilar, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  return { ...result, pilarFoco, data: new Date().toISOString() };
}
