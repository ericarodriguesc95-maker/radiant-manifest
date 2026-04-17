// Trilha de Aprendizado: 5 níveis hierárquicos
export interface JourneyLevel {
  id: number;
  name: string;
  subtitle: string;
  icon: string; // emoji
  color: string;
  modules: { id: string; title: string; duration: string; description: string }[];
}

export const JOURNEY_LEVELS: JourneyLevel[] = [
  {
    id: 1,
    name: "Autoestima",
    subtitle: "A base de tudo",
    icon: "👑",
    color: "from-rose-900/30 to-rose-700/10",
    modules: [
      { id: "auto-1", title: "Quem sou eu hoje", duration: "12 min", description: "Reconheça sua identidade atual sem julgamento" },
      { id: "auto-2", title: "Reconciliação interna", duration: "15 min", description: "Faça as pazes com versões anteriores de você" },
      { id: "auto-3", title: "O espelho da rainha", duration: "10 min", description: "Exercício diário de autopercepção" },
    ],
  },
  {
    id: 2,
    name: "Autoconhecimento",
    subtitle: "Conheça seus padrões",
    icon: "🔱",
    color: "from-amber-900/30 to-amber-700/10",
    modules: [
      { id: "conh-1", title: "Mapeamento de gatilhos", duration: "18 min", description: "Identifique o que te ativa positiva e negativamente" },
      { id: "conh-2", title: "Crenças de base", duration: "20 min", description: "Encontre as histórias que você conta a si mesma" },
      { id: "conh-3", title: "Sombra & luz", duration: "15 min", description: "Integre os opostos da sua personalidade" },
    ],
  },
  {
    id: 3,
    name: "Comunicação",
    subtitle: "Sua voz no mundo",
    icon: "💎",
    color: "from-violet-900/30 to-violet-700/10",
    modules: [
      { id: "com-1", title: "Voz que ressoa", duration: "16 min", description: "Técnicas de presença vocal" },
      { id: "com-2", title: "Diálogo difícil", duration: "22 min", description: "Como abordar conversas que você evita" },
      { id: "com-3", title: "Escuta profunda", duration: "12 min", description: "A arma secreta das mulheres influentes" },
    ],
  },
  {
    id: 4,
    name: "Influência",
    subtitle: "Impacto e magnetismo",
    icon: "⚜️",
    color: "from-emerald-900/30 to-emerald-700/10",
    modules: [
      { id: "inf-1", title: "Carisma estratégico", duration: "20 min", description: "Construa presença sem performance" },
      { id: "inf-2", title: "Storytelling pessoal", duration: "25 min", description: "Sua história como ferramenta de poder" },
      { id: "inf-3", title: "Networking de elite", duration: "18 min", description: "Conexões que multiplicam oportunidades" },
    ],
  },
  {
    id: 5,
    name: "Liderança",
    subtitle: "O topo da pirâmide",
    icon: "🏛️",
    color: "from-gold/30 to-amber-700/10",
    modules: [
      { id: "lid-1", title: "Visão & estratégia", duration: "30 min", description: "Pense como uma CEO da própria vida" },
      { id: "lid-2", title: "Decisões sob pressão", duration: "22 min", description: "Frameworks de decisão usados por líderes" },
      { id: "lid-3", title: "Legado consciente", duration: "20 min", description: "O que você deixará para trás?" },
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
