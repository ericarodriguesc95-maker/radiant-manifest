export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonContent {
  reading: string;
  verse: string;
  verseRef: string;
  quiz: QuizQuestion[];
}

// blockId → lessonIndex → content
export const lessonContent: Record<string, LessonContent[]> = {
  identidade: [
    {
      // Identidade formada fora de Deus
      reading:
        "Muitas mulheres crescem moldadas pela dor, pela rejeição ou pela necessidade de agradar. Esses padrões criam uma identidade que não reflete quem Deus planejou. Reconhecer esses padrões é o primeiro passo para se libertar deles. A identidade verdadeira não vem do que fizeram com você, mas do que Deus diz sobre você.",
      verse: "Antes que satisfaça eu te formei no ventre; antes que nascesses, eu te consagrei.",
      verseRef: "Jeremias 1:5",
      quiz: [
        {
          question: "O que significa ter uma identidade formada fora de Deus?",
          options: [
            "Ser quem os outros esperam que você seja",
            "Viver de acordo com seus próprios desejos",
            "Seguir uma religião diferente",
            "Não ter personalidade",
          ],
          correctIndex: 0,
          explanation:
            "Uma identidade formada fora de Deus é construída sobre expectativas externas, dores e padrões que não refletem quem você realmente foi chamada para ser.",
        },
        {
          question: "Qual é o primeiro passo para se libertar de padrões construídos na dor?",
          options: [
            "Ignorar o passado",
            "Reconhecer esses padrões",
            "Mudar de cidade",
            "Fazer mais cursos",
          ],
          correctIndex: 1,
          explanation:
            "Reconhecer os padrões é o primeiro passo. Sem consciência, não há transformação — você continua repetindo o que não enxerga.",
        },
      ],
    },
    {
      // Feminilidade distorcida
      reading:
        "A cultura atual apresenta dois extremos: a mulher que precisa ser forte demais e não pode ser vulnerável, ou a mulher passiva que aceita tudo. Ambos são distorções. A feminilidade bíblica é marcada por força e delicadeza, sabedoria e ousadia. Não é sobre se encaixar num molde, mas sobre viver a partir de quem Deus criou você para ser.",
      verse: "Força e dignidade são as suas vestes, e ela sorri diante do futuro.",
      verseRef: "Provérbios 31:25",
      quiz: [
        {
          question: "Quais são os dois extremos da feminilidade distorcida?",
          options: [
            "Força excessiva sem vulnerabilidade ou passividade total",
            "Trabalhar demais ou não trabalhar",
            "Ser religiosa demais ou não ter fé",
            "Ser independente ou ser dependente financeiramente",
          ],
          correctIndex: 0,
          explanation:
            "A distorção acontece nos extremos: ser forte demais sem permitir vulnerabilidade, ou ser passiva aceitando tudo sem posicionamento.",
        },
        {
          question: "Como a feminilidade bíblica se manifesta?",
          options: [
            "Sendo submissa em tudo",
            "Sendo independente de todos",
            "Com força e delicadeza, sabedoria e ousadia",
            "Copiando modelos de sucesso",
          ],
          correctIndex: 2,
          explanation:
            "A feminilidade bíblica integra força com delicadeza, sabedoria com ousadia — sem extremos, vivendo a partir do design de Deus.",
        },
      ],
    },
    {
      // Ciclo da mulher reativa
      reading:
        "A mulher reativa vive apagando incêndios. Ela reage às emoções, às crises e às pessoas ao redor sem nunca parar para governar sua própria vida. O governo espiritual é a capacidade de pausar, discernir e agir com intencionalidade. Sem ele, você é levada pelas circunstâncias em vez de caminhar com propósito.",
      verse: "Melhor é o que governa o seu espírito do que o que toma uma cidade.",
      verseRef: "Provérbios 16:32",
      quiz: [
        {
          question: "O que caracteriza o ciclo da mulher reativa?",
          options: [
            "Planejar demais sem agir",
            "Reagir às emoções e crises sem governar a própria vida",
            "Ser muito organizada",
            "Ter muitas responsabilidades",
          ],
          correctIndex: 1,
          explanation:
            "A mulher reativa vive no modo automático, reagindo sem intencionalidade — apagando incêndios em vez de construir com propósito.",
        },
        {
          question: "O que é governo espiritual?",
          options: [
            "Controlar todas as situações",
            "Não sentir emoções",
            "A capacidade de pausar, discernir e agir com intencionalidade",
            "Seguir regras religiosas rigorosamente",
          ],
          correctIndex: 2,
          explanation:
            "Governo espiritual não é controle, é a capacidade de pausar, ouvir a Deus, discernir e agir com propósito e intencionalidade.",
        },
      ],
    },
  ],

  sabedoria: [
    {
      // Controle vs Governo
      reading:
        "Controle é tentar forçar resultados por medo. Governo é administrar a vida com sabedoria. A mulher controladora vive ansiosa porque tenta segurar o que não está em suas mãos. A mulher que governa entrega a Deus o que não controla e administra com excelência o que está sob sua responsabilidade.",
      verse: "Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará.",
      verseRef: "Salmos 37:5",
      quiz: [
        {
          question: "Qual a diferença entre controle e governo?",
          options: [
            "São a mesma coisa",
            "Controle é forçar por medo; governo é administrar com sabedoria",
            "Governo é mais rígido que controle",
            "Controle é positivo, governo é negativo",
          ],
          correctIndex: 1,
          explanation:
            "Controle nasce do medo e tenta forçar resultados. Governo nasce da sabedoria e administra com intencionalidade o que está ao seu alcance.",
        },
      ],
    },
    {
      // Crenças vs Verdade
      reading:
        "Muitas crenças que carregamos não são verdades — são mentiras que acreditamos por repetição. 'Eu não sou boa o suficiente', 'Eu não mereço', 'Sempre vai dar errado'. A Palavra de Deus é o filtro para separar crença de verdade. Renovar a mente é trocar essas mentiras pela verdade que liberta.",
      verse: "E conhecereis a verdade, e a verdade vos libertará.",
      verseRef: "João 8:32",
      quiz: [
        {
          question: "Por que carregamos crenças que não são verdades?",
          options: [
            "Porque somos fracas",
            "Porque as acreditamos por repetição",
            "Porque não lemos o suficiente",
            "Porque não temos educação formal",
          ],
          correctIndex: 1,
          explanation:
            "Crenças limitantes se instalam pela repetição — ouvimos tantas vezes que passamos a acreditar como se fossem fatos, sem questionar.",
        },
      ],
    },
    {
      // Postura de solteira x postura de casada
      reading:
        "A postura de solteira não é sobre estado civil, é sobre mentalidade. É viver centrada em si mesma, nas próprias vontades, sem considerar aliança. A postura de casada — mesmo para quem é solteira — é sobre maturidade: pensar em aliança, em legado, em construir algo maior que você mesma.",
      verse: "Há uma diferença entre a mulher casada e a virgem: a solteira cuida das coisas do Senhor, para ser santa no corpo e no espírito.",
      verseRef: "1 Coríntios 7:34",
      quiz: [
        {
          question: "A 'postura de solteira' se refere a quê?",
          options: [
            "Não ter um relacionamento amoroso",
            "Uma mentalidade centrada em si mesma, sem visão de aliança",
            "Ser independente financeiramente",
            "Morar sozinha",
          ],
          correctIndex: 1,
          explanation:
            "Não é sobre estado civil, é mentalidade. Viver só para si, sem pensar em aliança, legado ou construção conjunta.",
        },
      ],
    },
    {
      // Vocação
      reading:
        "Vocação não é só profissão — é chamado. Muitas mulheres estão ocupadas demais fazendo coisas boas, mas não estão fazendo o que Deus as chamou para fazer. Alinhar vocação com obediência significa perguntar: 'Senhor, onde Tu queres que eu invista meu tempo e energia?'",
      verse: "Porque somos feitura sua, criados em Cristo Jesus para as boas obras, as quais Deus preparou para que andássemos nelas.",
      verseRef: "Efésios 2:10",
      quiz: [
        {
          question: "Qual a diferença entre profissão e vocação segundo a lição?",
          options: [
            "Profissão paga mais",
            "Vocação é chamado; profissão pode ser só ocupação",
            "Não há diferença",
            "Vocação não gera renda",
          ],
          correctIndex: 1,
          explanation:
            "Vocação vai além de trabalho — é o chamado de Deus para sua vida. Você pode ter uma profissão sem estar vivendo sua vocação.",
        },
      ],
    },
    {
      // Espiritualidade superficial
      reading:
        "Ir à igreja, postar versículos e orar antes de dormir pode parecer espiritualidade, mas sem transformação real, é superficial. Espiritualidade verdadeira muda comportamento, muda decisões, muda relacionamentos. Se sua fé não está transformando sua vida prática, algo precisa ser revisado.",
      verse: "Sede, pois, praticantes da palavra, e não somente ouvintes, enganando-vos a vós mesmos.",
      verseRef: "Tiago 1:22",
      quiz: [
        {
          question: "O que caracteriza uma espiritualidade superficial?",
          options: [
            "Não ir à igreja",
            "Práticas religiosas sem transformação real de vida",
            "Ler a Bíblia todos os dias",
            "Não ter uma denominação",
          ],
          correctIndex: 1,
          explanation:
            "Espiritualidade superficial é manter rituais sem que eles transformem seu comportamento, suas decisões e seus relacionamentos.",
        },
      ],
    },
    {
      // Mente renovada
      reading:
        "Renovar a mente não é pensar positivo — é pensar como alguém transformada por Deus. É trocar a lente pela qual você enxerga a vida. Quando a mente é renovada, as decisões mudam, os padrões mudam, os resultados mudam. Não é esforço humano, é rendição ao processo de Deus.",
      verse: "E não vos conformeis com este mundo, mas transformai-vos pela renovação da vossa mente.",
      verseRef: "Romanos 12:2",
      quiz: [
        {
          question: "Renovar a mente é o mesmo que pensamento positivo?",
          options: [
            "Sim, é a mesma coisa",
            "Não — é pensar como alguém transformada por Deus, não apenas positivismo",
            "É ignorar problemas",
            "É meditar em silêncio",
          ],
          correctIndex: 1,
          explanation:
            "Mente renovada vai além de positivismo. É uma transformação profunda na forma de pensar, ver e decidir — a partir da verdade de Deus.",
        },
      ],
    },
  ],

  proposito: [
    {
      // Governo na prática
      reading:
        "Governar na prática é organizar sua vida como um ato de obediência. Isso inclui sua rotina, suas finanças, seu tempo e suas prioridades. Não é sobre ser perfeita, é sobre ser intencional. Uma vida governada tem estrutura, tem ordem e tem direção — porque reflete o caráter de Deus.",
      quiz: [
        {
          question: "O que significa governar na prática?",
          options: [
            "Ser perfeccionista em tudo",
            "Organizar a vida como ato de obediência, com intencionalidade",
            "Controlar todas as pessoas ao redor",
            "Trabalhar mais horas por dia",
          ],
          correctIndex: 1,
          explanation:
            "Governo na prática é viver com intencionalidade — organizando rotina, finanças e prioridades como reflexo de obediência a Deus.",
        },
      ],
    },
    {
      // Relacionamentos
      reading:
        "Relacionamentos saudáveis exigem posicionamento. Isso significa saber dizer não sem culpa, estabelecer limites com amor e parar de aceitar menos do que Deus preparou para você. Sabedoria relacional é entender que nem todo relacionamento é para toda a vida — e tudo bem.",
      quiz: [
        {
          question: "O que é posicionamento nos relacionamentos?",
          options: [
            "Cortar todas as pessoas difíceis",
            "Aceitar tudo para manter a paz",
            "Saber dizer não sem culpa e estabelecer limites com amor",
            "Ficar sozinha para evitar problemas",
          ],
          correctIndex: 2,
          explanation:
            "Posicionamento é ter firmeza com amor — saber dizer não, estabelecer limites saudáveis e não aceitar menos do que Deus planejou.",
        },
      ],
    },
    {
      // Direção profissional
      reading:
        "Carreira e chamado nem sempre coincidem — e isso gera frustração. Muitas mulheres estão em carreiras que pagam as contas mas não alimentam a alma. Alinhar direção profissional com propósito exige coragem: às vezes é mudar de rota, às vezes é florescer onde está com uma nova perspectiva.",
      quiz: [
        {
          question: "Por que muitas mulheres se sentem frustradas profissionalmente?",
          options: [
            "Porque não ganham bem",
            "Porque carreira e chamado nem sempre coincidem",
            "Porque trabalham demais",
            "Porque não têm diploma",
          ],
          correctIndex: 1,
          explanation:
            "A frustração vem do desalinhamento entre o que você faz e o que sente que foi chamada para fazer. Alinhar carreira e propósito é essencial.",
        },
      ],
    },
    {
      // Ordem espiritual na rotina
      reading:
        "Sua rotina revela suas prioridades reais. Se Deus não está na sua agenda, Ele não está no governo da sua vida. Ordem espiritual na rotina é colocar Deus no centro de cada dia — não como um item a mais na lista, mas como o fundamento de tudo que você faz.",
      quiz: [
        {
          question: "O que a sua rotina revela sobre você?",
          options: [
            "Quanto você trabalha",
            "Suas prioridades reais",
            "Seu nível de inteligência",
            "Sua condição financeira",
          ],
          correctIndex: 1,
          explanation:
            "A rotina é o espelho das prioridades reais. O que você dedica tempo revela o que realmente governa sua vida.",
        },
      ],
    },
    {
      // Blindagem de ambiente
      reading:
        "Transformação sem blindagem é temporária. O ambiente ao seu redor influencia diretamente sua mentalidade, suas emoções e suas decisões. Blindar o ambiente significa escolher com sabedoria o que você consome, com quem convive e que vozes você permite na sua vida.",
      quiz: [
        {
          question: "Por que a blindagem de ambiente é necessária?",
          options: [
            "Para se isolar de todos",
            "Porque transformação sem blindagem é temporária",
            "Para parecer mais espiritual",
            "Para evitar conflitos",
          ],
          correctIndex: 1,
          explanation:
            "Sem blindagem do ambiente, a transformação não se sustenta. O que você consome e com quem convive precisa estar alinhado à nova identidade.",
        },
      ],
    },
  ],
};
