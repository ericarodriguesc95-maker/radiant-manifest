// Trilha de Aprendizado: 5 níveis hierárquicos
export interface JourneyModule {
  id: string;
  title: string;
  duration: string;
  description: string;
  content: string; // Aula completa em markdown leve
  practice: string; // Exercício prático
  reflection: string; // Pergunta para reflexão
}

export interface JourneyLevel {
  id: number;
  name: string;
  subtitle: string;
  icon: string; // emoji
  color: string;
  modules: JourneyModule[];
}

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    id: 1,
    name: "Autoestima",
    subtitle: "A base de tudo",
    icon: "👑",
    color: "from-rose-900/30 to-rose-700/10",
    modules: [
      {
        id: "auto-1",
        title: "Quem sou eu hoje",
        duration: "12 min",
        description: "Reconheça sua identidade atual sem julgamento",
        content: "Antes de mudar quem você é, é preciso ENXERGAR quem você é hoje — sem máscara, sem filtro, sem comparação. Autoestima não nasce de afirmações vazias, nasce de auto-honestidade radical. Hoje você vai tirar uma fotografia interna da mulher que existe agora: suas forças reais, suas fraquezas reais, seus desejos reais. Não a versão que sua mãe quer, não a do Instagram, não a que seu chefe espera. A SUA.",
        practice: "Pegue papel e caneta. Em 7 minutos, responda sem editar: 1) Três adjetivos que me descrevem hoje. 2) Três coisas que eu finjo que não sinto. 3) Uma verdade que estou evitando admitir. Guarde esse papel — você vai voltar a ele no nível 2.",
        reflection: "Se ninguém estivesse julgando, quem eu seria amanhã de manhã?",
      },
      {
        id: "auto-2",
        title: "Reconciliação interna",
        duration: "15 min",
        description: "Faça as pazes com versões anteriores de você",
        content: "Toda mulher carrega dentro de si versões anteriores: a menina ferida, a adolescente perdida, a jovem que errou feio, a mulher que se calou. Você não pode amar quem você é HOJE enquanto envergonha quem você foi ONTEM. Reconciliação interna é o ato de virar para essas versões e dizer: 'Você fez o que pôde com o que tinha. Eu te amo. Eu te perdoo. Vamos juntas.'",
        practice: "Feche os olhos. Visualize você aos 7, aos 15 e aos 25 anos. Diga em voz alta para cada uma: 'Eu te vejo. Eu te entendo. Você está segura comigo agora.' Escreva uma carta curta para a versão de você que mais precisa ouvir isso hoje.",
        reflection: "Qual versão de mim eu ainda não perdoei — e o que ela precisa ouvir?",
      },
      {
        id: "auto-3",
        title: "O espelho da rainha",
        duration: "10 min",
        description: "Exercício diário de autopercepção",
        content: "Rainhas não desviam do próprio reflexo. Você sim — quase todo dia. Olha no espelho rápido, julga, corre. Hoje você vai aprender o ritual do Espelho da Rainha: olhar-se nos olhos por 60 segundos, sem mexer no rosto, sem sorrir forçado, apenas se receber. Esse exercício, repetido diariamente, reprograma a relação inconsciente que você tem consigo mesma.",
        practice: "Vá até um espelho AGORA. Coloque cronômetro de 60 segundos. Olhe nos seus próprios olhos. Sem julgar, sem analisar pele/cabelo. Apenas: olho no olho. Ao final, diga: 'Eu te escolho.' Repita por 7 dias seguidos ao acordar.",
        reflection: "O que mudou no meu olhar do segundo 1 para o segundo 60?",
      },
    ],
  },
  {
    id: 2,
    name: "Autoconhecimento",
    subtitle: "Conheça seus padrões",
    icon: "🔱",
    color: "from-amber-900/30 to-amber-700/10",
    modules: [
      {
        id: "conh-1",
        title: "Mapeamento de gatilhos",
        duration: "18 min",
        description: "Identifique o que te ativa positiva e negativamente",
        content: "Gatilho é qualquer estímulo (palavra, tom de voz, situação, cheiro) que dispara uma reação automática em você — antes mesmo da razão entrar. Mulheres de alta performance não eliminam gatilhos: elas os MAPEIAM. Quando você sabe o que te tira do eixo, você para de ser refém. O objetivo aqui não é virar 'imune', é virar consciente.",
        practice: "Liste 5 situações dos últimos 30 dias em que você reagiu de forma desproporcional (raiva, choro, silêncio, fuga). Para cada uma, responda: O que aconteceu? Que emoção surgiu? Que memória/crença foi ativada? Procure o padrão — geralmente são 2 ou 3 gatilhos centrais que se repetem.",
        reflection: "Qual é o gatilho mais frequente da minha vida — e o que ele está tentando me ensinar?",
      },
      {
        id: "conh-2",
        title: "Crenças de base",
        duration: "20 min",
        description: "Encontre as histórias que você conta a si mesma",
        content: "Crenças de base são frases-âncora que você herdou (família, religião, escola, traumas) e que operam silenciosamente como sistema operacional. Exemplos: 'dinheiro é sujo', 'mulher inteligente assusta homem', 'eu não mereço descanso'. Você não escolheu essas frases — mas elas estão tomando 80% das suas decisões. Hoje você vai trazê-las para a luz.",
        practice: "Complete sem pensar: Dinheiro é ___. Homens são ___. Sucesso exige ___. Eu sou ___. Mulheres bem-sucedidas são ___. Olhe as respostas. Quais delas são SUAS verdades adultas — e quais foram instaladas em você antes dos 12 anos? Marque cada crença limitante com um X.",
        reflection: "Qual crença, se eu deletasse hoje, mudaria minha vida nos próximos 6 meses?",
      },
      {
        id: "conh-3",
        title: "Sombra & luz",
        duration: "15 min",
        description: "Integre os opostos da sua personalidade",
        content: "Sombra (conceito junguiano) é tudo aquilo que você rejeita em si: agressividade, ambição, ciúme, vaidade, preguiça. Você empurra para o subconsciente — e ele te governa de lá. Mulheres maduras não cortam a sombra: integram. A ambiciosa que se chama de 'gananciosa' nunca vai prosperar. A sensual que se chama de 'vulgar' nunca vai amar o próprio corpo. Integrar = nomear sem julgar.",
        practice: "Liste 3 características que você JULGA em outras mulheres (ex: 'fulana é convencida'). Agora reconheça: essas características também existem em você, em alguma medida. Reescreva cada uma como qualidade ('convencida' → 'tem autoestima firme'). Adote 1 dessas qualidades essa semana.",
        reflection: "O que eu mais critico nas outras é exatamente o que eu mais reprimo em mim?",
      },
    ],
  },
  {
    id: 3,
    name: "Comunicação",
    subtitle: "Sua voz no mundo",
    icon: "💎",
    color: "from-violet-900/30 to-violet-700/10",
    modules: [
      {
        id: "com-1",
        title: "Voz que ressoa",
        duration: "16 min",
        description: "Técnicas de presença vocal",
        content: "Sua voz é o instrumento mais subestimado do seu poder. Pesquisas mostram que pessoas com voz grave, ritmada e com pausas são percebidas como 38% mais autoridades. Mulheres tendem a falar agudo (nervosismo) e rápido (medo de tomar tempo). Hoje você aprende 3 ajustes: respiração diafragmática, pausa estratégica e ancoragem vocal no peito.",
        practice: "Grave 1 minuto de áudio falando sobre seu dia. Escute. Note: você fala do peito ou da garganta? Faz pausas? Termina frases firme ou subindo o tom (estilo pergunta)? Refaça a gravação aplicando: respire fundo antes, fale 20% mais devagar, termine cada frase descendo o tom.",
        reflection: "Como minha voz mudaria se eu acreditasse 100% no que estou dizendo?",
      },
      {
        id: "com-2",
        title: "Diálogo difícil",
        duration: "22 min",
        description: "Como abordar conversas que você evita",
        content: "Há uma conversa que você está adiando há semanas (ou anos). Cada dia que passa sem ela, você paga em ansiedade, ressentimento ou ruído mental. Conversas difíceis bem feitas usam o framework DESC: Descrever o fato (sem julgar), Expressar a emoção (sem culpar), Solicitar a mudança (clara), Consequência (real). Não é confronto — é clareza com afeto.",
        practice: "Identifique 1 conversa pendente. Escreva no formato DESC: 'Quando você [fato], eu sinto [emoção], porque [necessidade]. Eu peço que [pedido específico]. Se não rolar, [consequência].' Marque a conversa para os próximos 7 dias. Real. Não adia.",
        reflection: "Qual conversa, se eu tivesse hoje, libertaria mais espaço mental na minha semana?",
      },
      {
        id: "com-3",
        title: "Escuta profunda",
        duration: "12 min",
        description: "A arma secreta das mulheres influentes",
        content: "A maioria das pessoas não escuta — espera para falar. Escuta profunda é uma habilidade rara: ouvir não só o que é dito, mas o que NÃO é dito. O subtexto, a emoção por trás, o medo escondido. Quem escuta assim ganha confiança absoluta dos outros. É o superpoder de líderes, terapeutas e mulheres magnéticas.",
        practice: "Na próxima conversa importante, aplique: 1) Não interrompa por 3 minutos seguidos. 2) Antes de responder, pergunte: 'Posso ter entendido certo? Você está dizendo que [reformule].' 3) Faça 1 pergunta de aprofundamento ('e como isso te fez sentir?') antes de dar sua opinião.",
        reflection: "Quando foi a última vez que alguém me escutou de verdade — e como isso me fez sentir?",
      },
    ],
  },
  {
    id: 4,
    name: "Influência",
    subtitle: "Impacto e magnetismo",
    icon: "⚜️",
    color: "from-emerald-900/30 to-emerald-700/10",
    modules: [
      {
        id: "inf-1",
        title: "Carisma estratégico",
        duration: "20 min",
        description: "Construa presença sem performance",
        content: "Carisma não é nascimento, é construção. Pesquisa de Olivia Fox Cabane mostra 3 pilares: presença (estar 100% no momento), poder (postura corporal de quem ocupa espaço) e calor (transmitir cuidado genuíno). Falta um pilar = parece arrogante (poder sem calor) ou apagada (calor sem poder). Os 3 juntos = magnetismo.",
        practice: "Hoje, na primeira interação importante: 1) Antes de entrar no ambiente, respire e centre-se (presença). 2) Ombros para trás, queixo paralelo ao chão, ocupe seu espaço (poder). 3) Sorria com os olhos antes da boca, faça uma pergunta genuína sobre a outra pessoa (calor).",
        reflection: "Qual desses 3 pilares (presença, poder, calor) eu mais negligencio — e por quê?",
      },
      {
        id: "inf-2",
        title: "Storytelling pessoal",
        duration: "25 min",
        description: "Sua história como ferramenta de poder",
        content: "Dados convencem, histórias transformam. Você tem uma história — de virada, de queda, de reconstrução — que pode abrir portas, fechar negócios, inspirar pessoas. A maioria das mulheres minimiza sua própria história ('não foi nada demais'). É hora de estruturar a sua usando o arco clássico: Era uma vez (você antes) → Até que (o ponto de virada) → Agora (você hoje) → Por isso (o que você ensina).",
        practice: "Escreva sua história em 4 parágrafos curtos seguindo o arco acima. Limite: 250 palavras totais. Leia em voz alta. Sinta onde trava. Refaça até fluir. Essa será sua 'história-âncora' para usar em entrevistas, redes, palestras, primeiros encontros profissionais.",
        reflection: "Qual capítulo da minha história eu ainda escondo — e como ele poderia inspirar outras mulheres?",
      },
      {
        id: "inf-3",
        title: "Networking de elite",
        duration: "18 min",
        description: "Conexões que multiplicam oportunidades",
        content: "Networking de baixo nível: trocar cartão e pedir favor. Networking de elite: SERVIR primeiro, pedir depois (ou nunca). A regra é simples: para cada pedido que você faz, ofereça 5 valores antes (apresentação, conteúdo útil, oportunidade, elogio público, conexão). Mulheres de elite cultivam relacionamentos com gratuidade — e quando precisam, têm um exército.",
        practice: "Liste 10 pessoas que você admira ou de quem precisa em algum momento. Para cada uma, defina 1 forma de servir essa semana (compartilhar artigo dela, indicá-la, comentar com substância um post, enviar um cliente). Execute pelo menos 3.",
        reflection: "Quem eu posso elevar essa semana — sem esperar nada em troca?",
      },
    ],
  },
  {
    id: 5,
    name: "Liderança",
    subtitle: "O topo da pirâmide",
    icon: "🏛️",
    color: "from-gold/30 to-amber-700/10",
    modules: [
      {
        id: "lid-1",
        title: "Visão & estratégia",
        duration: "30 min",
        description: "Pense como uma CEO da própria vida",
        content: "CEOs operam com 3 horizontes simultâneos: hoje (execução), 90 dias (projetos) e 3 anos (visão). A maioria das pessoas vive só no hoje — e por isso vive correndo. Liderar a própria vida começa em desenhar onde você quer estar em 3 anos (com clareza de carreira, finanças, corpo, relacionamentos) e ENGENHAR ATRÁS: o que precisa estar pronto em 1 ano? Em 90 dias? Esta semana?",
        practice: "Reserve 30 min sem celular. Em 1 página, escreva: 'Em abril de 2029 eu sou ___. Tenho ___. Faço ___. Minha rotina é ___. Meu corpo está ___. Meu dinheiro é ___.' Depois faça engenharia reversa: 1 marco para 1 ano, 1 ação para 90 dias, 1 ação para essa semana.",
        reflection: "Qual decisão de hoje a CEO de 2029 me agradeceria por ter tomado?",
      },
      {
        id: "lid-2",
        title: "Decisões sob pressão",
        duration: "22 min",
        description: "Frameworks de decisão usados por líderes",
        content: "Sob pressão, o cérebro emocional sequestra o raciocínio. Líderes treinam frameworks que destravam decisão mesmo no caos. Use o WRAP de Chip Heath: Widen options (não decida entre 2 — busque uma 3ª), Reality-test (busque dado contrário ao que você quer), Attain distance (decida como decidiria por uma amiga), Prepare to be wrong (qual o plano B se der ruim?).",
        practice: "Pegue UMA decisão que você está adiando. Aplique WRAP: 1) Liste 3 opções (não 2). 2) Pergunte a alguém que discordaria de você. 3) 'Se minha melhor amiga estivesse nesse lugar, o que eu aconselharia?' 4) Defina o pior cenário e como reagiria. DECIDA ATÉ AMANHÃ.",
        reflection: "Estou adiando essa decisão por falta de dados — ou por medo de assumir o resultado?",
      },
      {
        id: "lid-3",
        title: "Legado consciente",
        duration: "20 min",
        description: "O que você deixará para trás?",
        content: "Legado não é o que você acumula — é o que continua acontecendo depois que você sai da sala. Pode ser uma filha mais segura, uma equipe mais corajosa, um livro, um método, uma comunidade, uma cura geracional. Mulheres conscientes não deixam legado por acaso: elas DESENHAM. Pergunta central: o que do meu trabalho/vida sobreviveria a mim?",
        practice: "Escreva seu próprio elogio fúnebre — versão idealizada — em 1 página. Como você quer ser lembrada? Por quem? Por quais frases? Quais histórias contariam de você? Identifique a maior LACUNA entre essa versão e a você de hoje. Defina 1 ação trimestral para fechar essa lacuna.",
        reflection: "Se eu morresse em 5 anos, do que mais me arrependeria de não ter começado hoje?",
      },
    ],
  },
];

// 7 Trilhas de Aulas (vídeos curados YouTube)
export interface VideoTrack {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  videos: { id: string; title: string; mentor: string; youtubeId: string; duration: string }[];
}

export const VIDEO_TRACKS: VideoTrack[] = [
  {
    id: "oratoria",
    name: "Oratória",
    icon: "🎙️",
    color: "from-rose-900/40 to-rose-700/10",
    description: "Fale com presença, clareza e impacto",
    videos: [
      { id: "or-1", title: "Como falar em público sem medo", mentor: "Tiago Brunet", youtubeId: "lTwlvVN_PRQ", duration: "15 min" },
      { id: "or-2", title: "A arte de se comunicar bem", mentor: "Leandro Karnal", youtubeId: "g_Kb0YJtNqU", duration: "22 min" },
      { id: "or-3", title: "Técnicas de oratória profissional", mentor: "Reinaldo Polito", youtubeId: "hjIXTIpC8c8", duration: "18 min" },
      { id: "or-4", title: "Como fazer uma apresentação memorável", mentor: "Mario Sergio Cortella", youtubeId: "NXk_qxpUBrA", duration: "25 min" },
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    icon: "💼",
    color: "from-blue-900/40 to-blue-700/10",
    description: "Construa autoridade na maior rede profissional",
    videos: [
      { id: "li-1", title: "Como crescer no LinkedIn em 2025", mentor: "Maira Habimorad", youtubeId: "Y_HbS4VNzHM", duration: "20 min" },
      { id: "li-2", title: "Personal branding no LinkedIn", mentor: "Gisele Paula", youtubeId: "TugQYQ3eGtI", duration: "18 min" },
      { id: "li-3", title: "Posts que viralizam no LinkedIn", mentor: "Rafa Casarin", youtubeId: "Wn8DGc3EtYM", duration: "12 min" },
      { id: "li-4", title: "Estratégia de conteúdo profissional", mentor: "Camila Farani", youtubeId: "5TYBEVJ5dYc", duration: "30 min" },
    ],
  },
  {
    id: "lideranca",
    name: "Liderança",
    icon: "👑",
    color: "from-amber-900/40 to-amber-700/10",
    description: "Lidere com presença feminina e firmeza",
    videos: [
      { id: "ld-1", title: "Liderança feminina no século 21", mentor: "Luiza Helena Trajano", youtubeId: "Q2bM6hz9I2I", duration: "28 min" },
      { id: "ld-2", title: "Líder de alta performance", mentor: "Geronimo Theml", youtubeId: "k6Pj_zR8FmM", duration: "20 min" },
      { id: "ld-3", title: "Como ser uma chefe respeitada", mentor: "Cris Arcangeli", youtubeId: "hKYkz9eRXRk", duration: "15 min" },
      { id: "ld-4", title: "Inteligência de líder", mentor: "Mario Sergio Cortella", youtubeId: "DoEFTYsUM-c", duration: "22 min" },
    ],
  },
  {
    id: "leitura-cenario",
    name: "Leitura de Cenário",
    icon: "🔭",
    color: "from-cyan-900/40 to-cyan-700/10",
    description: "Antecipe movimentos antes que aconteçam",
    videos: [
      { id: "lc-1", title: "Como ler pessoas em segundos", mentor: "Ana Beatriz Barbosa", youtubeId: "sdt0p4zFPjw", duration: "18 min" },
      { id: "lc-2", title: "Linguagem corporal no trabalho", mentor: "Paulo Sergio de Camargo", youtubeId: "WAVmfk0-VWo", duration: "20 min" },
      { id: "lc-3", title: "Sun Tzu para mulheres", mentor: "Clóvis de Barros Filho", youtubeId: "AFmXqM-5MBE", duration: "25 min" },
      { id: "lc-4", title: "Pensamento estratégico", mentor: "Vicente Falconi", youtubeId: "FPFSBR3F8jM", duration: "30 min" },
    ],
  },
  {
    id: "branding",
    name: "Branding Pessoal",
    icon: "✨",
    color: "from-pink-900/40 to-pink-700/10",
    description: "Sua marca pessoal que abre portas",
    videos: [
      { id: "br-1", title: "Construa sua marca pessoal", mentor: "Arthur Bender", youtubeId: "kzVKRzPxJ7w", duration: "22 min" },
      { id: "br-2", title: "Posicionamento que vende", mentor: "Camila Coutinho", youtubeId: "gOnrQv03kKE", duration: "18 min" },
      { id: "br-3", title: "Imagem profissional feminina", mentor: "Costanza Pascolato", youtubeId: "v2cJzFDh-8Q", duration: "15 min" },
      { id: "br-4", title: "Branding emocional", mentor: "Walter Longo", youtubeId: "f_8R6NTl7hg", duration: "28 min" },
    ],
  },
  {
    id: "produtividade",
    name: "Produtividade",
    icon: "⚡",
    color: "from-emerald-900/40 to-emerald-700/10",
    description: "Faça mais com menos esforço",
    videos: [
      { id: "pr-1", title: "Foco total em 25 minutos", mentor: "Geronimo Theml", youtubeId: "VUWIu5KlJbA", duration: "12 min" },
      { id: "pr-2", title: "Hábitos de pessoas produtivas", mentor: "Pedro Calabrez", youtubeId: "Lp7E973zozc", duration: "20 min" },
      { id: "pr-3", title: "Gestão do tempo feminino", mentor: "Christian Barbosa", youtubeId: "p3ulRoZ5I2I", duration: "25 min" },
      { id: "pr-4", title: "Deep work na prática", mentor: "Vinicius Possebon", youtubeId: "kpgRn8eYJfE", duration: "18 min" },
    ],
  },
  {
    id: "inteligencia-emocional",
    name: "Inteligência Emocional",
    icon: "💖",
    color: "from-purple-900/40 to-purple-700/10",
    description: "Domine suas emoções, domine sua vida",
    videos: [
      { id: "ie-1", title: "O que é inteligência emocional", mentor: "Augusto Cury", youtubeId: "NToGTb4kxMQ", duration: "22 min" },
      { id: "ie-2", title: "Como controlar a ansiedade", mentor: "Ana Beatriz Barbosa", youtubeId: "rRxuDqEM2t0", duration: "18 min" },
      { id: "ie-3", title: "Autocompaixão e autocrítica", mentor: "Monja Coen", youtubeId: "BgnLxU4qmiA", duration: "15 min" },
      { id: "ie-4", title: "Resiliência emocional", mentor: "Rossandro Klinjey", youtubeId: "fGxd9TQrCPM", duration: "20 min" },
    ],
  },
];

// Quiz de Diagnóstico Comportamental
export interface DiagnosticQuestion {
  q: string;
  options: { text: string; archetype: "estrategista" | "visionaria" | "executora" | "conectora" }[];
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    q: "Quando você recebe um projeto novo, sua primeira reação é:",
    options: [
      { text: "Fazer um plano detalhado com etapas claras", archetype: "estrategista" },
      { text: "Imaginar o resultado final no maior tamanho possível", archetype: "visionaria" },
      { text: "Começar a executar imediatamente", archetype: "executora" },
      { text: "Pensar em quem pode me ajudar nessa jornada", archetype: "conectora" },
    ],
  },
  {
    q: "Em uma reunião, você costuma ser a pessoa que:",
    options: [
      { text: "Faz as perguntas mais analíticas", archetype: "estrategista" },
      { text: "Traz ideias inovadoras e disruptivas", archetype: "visionaria" },
      { text: "Define prazos e divide tarefas", archetype: "executora" },
      { text: "Cria clima e une o grupo", archetype: "conectora" },
    ],
  },
  {
    q: "Seu maior medo profissional é:",
    options: [
      { text: "Errar uma decisão importante por falta de dados", archetype: "estrategista" },
      { text: "Estagnar e não evoluir", archetype: "visionaria" },
      { text: "Perder tempo com algo que não dá resultado", archetype: "executora" },
      { text: "Trabalhar em ambiente sem propósito", archetype: "conectora" },
    ],
  },
  {
    q: "Quando algo dá errado, você:",
    options: [
      { text: "Analisa o que falhou para nunca mais repetir", archetype: "estrategista" },
      { text: "Reformula e tenta uma abordagem totalmente nova", archetype: "visionaria" },
      { text: "Resolve rapidamente e segue em frente", archetype: "executora" },
      { text: "Conversa com pessoas de confiança para processar", archetype: "conectora" },
    ],
  },
  {
    q: "Sua maior força é:",
    options: [
      { text: "Pensamento estratégico e visão sistêmica", archetype: "estrategista" },
      { text: "Criatividade e capacidade de imaginar o futuro", archetype: "visionaria" },
      { text: "Disciplina e capacidade de entregar", archetype: "executora" },
      { text: "Empatia e habilidade de mobilizar pessoas", archetype: "conectora" },
    ],
  },
  {
    q: "O que mais te energiza em um dia de trabalho?",
    options: [
      { text: "Resolver um problema complexo", archetype: "estrategista" },
      { text: "Criar algo do zero", archetype: "visionaria" },
      { text: "Bater uma meta ambiciosa", archetype: "executora" },
      { text: "Construir relacionamentos significativos", archetype: "conectora" },
    ],
  },
  {
    q: "Como você toma decisões importantes?",
    options: [
      { text: "Analiso prós, contras e cenários antes de decidir", archetype: "estrategista" },
      { text: "Sigo minha intuição e visão de longo prazo", archetype: "visionaria" },
      { text: "Decido rápido e ajusto no caminho", archetype: "executora" },
      { text: "Consulto pessoas que confio e considero o impacto humano", archetype: "conectora" },
    ],
  },
];

export interface AccelerationPlan {
  archetype: string;
  title: string;
  emoji: string;
  description: string;
  superpower: string;
  shadowSide: string;
  weeklyFocus: string[];
  recommendedTracks: string[]; // ids de VIDEO_TRACKS
  recommendedLevel: number;
}

export const ARCHETYPE_PLANS: Record<string, AccelerationPlan> = {
  estrategista: {
    archetype: "estrategista",
    title: "A Estrategista",
    emoji: "♟️",
    description: "Você é a mente que vê o tabuleiro inteiro. Pensa em sistemas, antecipa movimentos e domina a arte do planejamento.",
    superpower: "Visão analítica e capacidade de antecipar cenários complexos.",
    shadowSide: "Pode travar na análise excessiva. Aprenda a agir mesmo sem 100% dos dados.",
    weeklyFocus: [
      "Tomar 1 decisão importante em até 24h sem checklist completo",
      "Praticar storytelling para humanizar suas análises",
      "Delegar 20% do que normalmente você controla",
    ],
    recommendedTracks: ["leitura-cenario", "lideranca", "linkedin"],
    recommendedLevel: 4,
  },
  visionaria: {
    archetype: "visionaria",
    title: "A Visionária",
    emoji: "🔮",
    description: "Você enxerga o futuro antes dos outros. Sua mente está sempre 10 passos à frente, criando o que ainda não existe.",
    superpower: "Imaginação estratégica e capacidade de inspirar mudança.",
    shadowSide: "Pode se perder no abstrato. Aprenda a aterrissar suas ideias em ações concretas.",
    weeklyFocus: [
      "Transformar 1 ideia em projeto com prazo e métricas",
      "Praticar disciplina diária com mini-rotinas",
      "Comunicar suas visões em formato simples e digerível",
    ],
    recommendedTracks: ["branding", "oratoria", "produtividade"],
    recommendedLevel: 3,
  },
  executora: {
    archetype: "executora",
    title: "A Executora",
    emoji: "⚡",
    description: "Você é a força que faz acontecer. Onde outros planejam, você entrega. Disciplina é seu segundo nome.",
    superpower: "Capacidade brutal de execução e foco em resultado.",
    shadowSide: "Pode atropelar pessoas e processos. Aprenda a parar para refinar a estratégia.",
    weeklyFocus: [
      "Reservar 30 min/dia para pensar antes de fazer",
      "Praticar escuta ativa em todas as reuniões",
      "Cuidar do corpo: descanso é parte da performance",
    ],
    recommendedTracks: ["inteligencia-emocional", "lideranca", "produtividade"],
    recommendedLevel: 4,
  },
  conectora: {
    archetype: "conectora",
    title: "A Conectora",
    emoji: "🌸",
    description: "Você é a ponte entre pessoas, ideias e mundos. Sua superpotência é fazer todos se sentirem vistos e valorizados.",
    superpower: "Empatia magnética e habilidade de construir comunidades.",
    shadowSide: "Pode se perder cuidando dos outros. Aprenda a colocar limites e priorizar você.",
    weeklyFocus: [
      "Dizer 'não' a pelo menos 1 pedido por semana",
      "Reservar 2h semanais só para você (sem culpa)",
      "Praticar autoafirmação antes de buscar validação externa",
    ],
    recommendedTracks: ["lideranca", "branding", "inteligencia-emocional"],
    recommendedLevel: 3,
  },
};

// Chaves do Sucesso — exercícios diários
export interface SuccessKey {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  exercises: { day: string; title: string; instruction: string; duration: string }[];
}

export const SUCCESS_KEYS: SuccessKey[] = [
  {
    id: "direcao-certa",
    name: "Direção Certa",
    icon: "🧭",
    color: "from-amber-900/40 to-amber-700/10",
    description: "Bússola interna para escolhas alinhadas",
    exercises: [
      { day: "Domingo", title: "Visão da semana", instruction: "Escreva em 1 frase o resultado que você quer ver até domingo que vem.", duration: "5 min" },
      { day: "Segunda", title: "Pergunta-bússola", instruction: "Pergunte-se: 'Esta ação me aproxima ou me afasta da mulher que quero ser?'", duration: "3 min" },
      { day: "Terça", title: "Mapa de prioridades", instruction: "Liste suas 3 prioridades de hoje. Faça apenas elas — sem culpa do resto.", duration: "5 min" },
      { day: "Quarta", title: "Norte verdadeiro", instruction: "Releia seus valores essenciais. Cancele 1 compromisso que não conversa com eles.", duration: "10 min" },
      { day: "Quinta", title: "Decisão consciente", instruction: "Tome 1 decisão pendente hoje. A pior decisão é não decidir.", duration: "5 min" },
      { day: "Sexta", title: "Auditoria semanal", instruction: "Revise: o que andei fazendo realmente importa? Ajuste o rumo.", duration: "8 min" },
      { day: "Sábado", title: "Permissão de descanso", instruction: "Descansar também é direção certa. Faça nada — propositalmente.", duration: "30 min" },
    ],
  },
  {
    id: "controle-interno",
    name: "Controle Interno",
    icon: "🗝️",
    color: "from-violet-900/40 to-violet-700/10",
    description: "Domine sua mente antes que ela te domine",
    exercises: [
      { day: "Domingo", title: "Inventário emocional", instruction: "Nomeie as 3 emoções que mais sentiu na semana. Não julgue, apenas note.", duration: "8 min" },
      { day: "Segunda", title: "Pausa de 4 segundos", instruction: "Antes de reagir hoje, respire por 4 segundos. Toda vez.", duration: "Dia todo" },
      { day: "Terça", title: "Diálogo interno", instruction: "Substitua 1 frase autocrítica por 1 frase compassiva. Anote.", duration: "5 min" },
      { day: "Quarta", title: "Limite consciente", instruction: "Diga 'não' a algo que normalmente você diria 'sim' por obrigação.", duration: "Imediato" },
      { day: "Quinta", title: "Reframe de gatilho", instruction: "Identifique 1 gatilho do dia e reescreva o que ele significa para você.", duration: "10 min" },
      { day: "Sexta", title: "Estado mental escolhido", instruction: "Escolha proativamente seu estado emocional pela manhã. Defenda-o.", duration: "5 min" },
      { day: "Sábado", title: "Soltura consciente", instruction: "Liste 3 coisas fora do seu controle. Solte cada uma simbolicamente.", duration: "10 min" },
    ],
  },
  {
    id: "jogo-ambiencia",
    name: "Jogo da Ambiência",
    icon: "♟️",
    color: "from-emerald-900/40 to-emerald-700/10",
    description: "Leia o ambiente, jogue com inteligência",
    exercises: [
      { day: "Domingo", title: "Mapa de aliados", instruction: "Liste 5 pessoas que te elevam. Planeje 1 conexão com cada nesta semana.", duration: "10 min" },
      { day: "Segunda", title: "Observação silenciosa", instruction: "Em 1 reunião hoje, fale 30% menos e observe 70% mais.", duration: "Reunião" },
      { day: "Terça", title: "Linguagem corporal", instruction: "Note a postura de quem te cerca. O corpo fala antes da boca.", duration: "Dia todo" },
      { day: "Quarta", title: "Espelho social", instruction: "Adapte sutilmente seu tom à pessoa com quem está falando.", duration: "Dia todo" },
      { day: "Quinta", title: "Pergunta poderosa", instruction: "Faça 1 pergunta que ninguém esperava em uma conversa importante.", duration: "Conversa" },
      { day: "Sexta", title: "Saída elegante", instruction: "Identifique 1 ambiente que te drena e planeje sua retirada estratégica.", duration: "15 min" },
      { day: "Sábado", title: "Curadoria de presença", instruction: "Quem você quer ser no ambiente onde estará amanhã? Vista-se dessa energia.", duration: "10 min" },
    ],
  },
];
