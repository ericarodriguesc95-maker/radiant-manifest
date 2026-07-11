import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Users, Zap, Atom, ChevronRight, CheckCircle2, RotateCcw, History, Sparkles, AlertTriangle, Compass, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// ─── DISC Test ───
const discQuestions = [
  { q: "Quando enfrento um desafio, eu prefiro:", a: [
    { text: "Agir rapidamente e tomar controle", type: "D" },
    { text: "Motivar as pessoas ao meu redor", type: "I" },
    { text: "Analisar com calma antes de decidir", type: "S" },
    { text: "Seguir regras e processos já definidos", type: "C" },
  ]},
  { q: "Em um grupo, eu geralmente sou a pessoa que:", a: [
    { text: "Lidera e define a direção", type: "D" },
    { text: "Anima e conecta as pessoas", type: "I" },
    { text: "Escuta e apoia os outros", type: "S" },
    { text: "Organiza e cuida dos detalhes", type: "C" },
  ]},
  { q: "O que mais me incomoda é:", a: [
    { text: "Perder tempo com indecisões", type: "D" },
    { text: "Ser ignorada ou ficar isolada", type: "I" },
    { text: "Conflitos e mudanças bruscas", type: "S" },
    { text: "Erros e falta de qualidade", type: "C" },
  ]},
  { q: "Minha maior qualidade é:", a: [
    { text: "Determinação e foco em resultados", type: "D" },
    { text: "Entusiasmo e comunicação", type: "I" },
    { text: "Paciência e lealdade", type: "S" },
    { text: "Precisão e pensamento analítico", type: "C" },
  ]},
  { q: "Quando estou sob pressão, eu:", a: [
    { text: "Me torno mais direta e impaciente", type: "D" },
    { text: "Falo mais e busco apoio social", type: "I" },
    { text: "Me retraio e evito confrontos", type: "S" },
    { text: "Me concentro em fatos e dados", type: "C" },
  ]},
  { q: "No trabalho, eu valorizo mais:", a: [
    { text: "Autonomia e liberdade para decidir", type: "D" },
    { text: "Reconhecimento e colaboração", type: "I" },
    { text: "Estabilidade e harmonia", type: "S" },
    { text: "Excelência e padrões elevados", type: "C" },
  ]},
  { q: "Ao receber um feedback negativo, eu:", a: [
    { text: "Uso como combustível para melhorar", type: "D" },
    { text: "Fico chateada mas logo supero", type: "I" },
    { text: "Levo para o pessoal e reflito muito", type: "S" },
    { text: "Analiso se o feedback faz sentido", type: "C" },
  ]},
  { q: "Meu ritmo de trabalho ideal é:", a: [
    { text: "Rápido, com vários projetos simultâneos", type: "D" },
    { text: "Dinâmico, com interação constante", type: "I" },
    { text: "Estável, com tempo para cada tarefa", type: "S" },
    { text: "Metódico, com planejamento detalhado", type: "C" },
  ]},
];

type Profile = {
  title: string;
  emoji: string;
  desc: string;
  strengths: string[];
  tips: string[];
  neuro: string;
  daily: string[];
  tools: { label: string; route: string }[];
  cautions: string[];
};

const discProfiles: Record<string, Profile> = {
  D: {
    title: "Dominância", emoji: "🦁",
    desc: "Você é uma líder nata! Orientada a resultados, decisiva e competitiva. Adora desafios e vai direto ao ponto.",
    strengths: ["Decisiva", "Orientada a resultados", "Líder natural", "Corajosa"],
    tips: ["Pratique escuta ativa", "Delegue com empatia", "Celebre pequenas vitórias dos outros"],
    neuro: "Seu córtex pré-frontal e amígdala trabalham em alta voltagem com forte ativação dopaminérgica de recompensa. Isso gera foco em metas, mas também eleva cortisol sob pressão, o que pode estreitar a empatia e a tomada de decisão de longo prazo.",
    daily: [
      "Respiração 4-7-8 antes de reuniões difíceis para baixar cortisol em 90s",
      "Bloco de 10 min de escuta ativa por dia (sem interromper ninguém)",
      "Anote 3 vitórias de outras pessoas no diário antes de dormir",
      "Caminhada curta entre tarefas para resetar dopamina",
    ],
    tools: [
      { label: "Mente Infalível, pausa de 6 segundos", route: "/mente-poderosa" },
      { label: "Reprogramação Mental, frequências calmantes", route: "/reprogramacao" },
      { label: "Diário, registro de gratidão", route: "/diario" },
      { label: "Metas SMART, canalizar drive", route: "/metas" },
    ],
    cautions: ["Cuidado com burnout: agende descanso como compromisso", "Evite decisões importantes com sono < 6h", "Atenção a microagressões verbais quando impaciente"],
  },
  I: {
    title: "Influência", emoji: "🌟",
    desc: "Você brilha em grupo! Comunicativa, entusiasta e carismática. Inspira os outros com sua energia positiva.",
    strengths: ["Comunicativa", "Entusiasta", "Criativa", "Persuasiva"],
    tips: ["Anote suas ideias para não perder o foco", "Estabeleça prazos realistas", "Ouça antes de falar"],
    neuro: "Alta produção de dopamina e ocitocina em contextos sociais. Seu cérebro é recompensado por conexão, mas o sistema de atenção sustentada (córtex pré-frontal dorsolateral) pode ficar instável sem estrutura externa.",
    daily: [
      "Técnica Pomodoro: 25 min foco + 5 min pausa social",
      "Brain dump de 5 min ao acordar para descarregar ideias",
      "Antes de falar em reuniões, conte até 3 e escute",
      "Limite redes sociais a 2 janelas no dia",
    ],
    tools: [
      { label: "Alta Performance, Pomodoro e Feynman", route: "/alta-performance" },
      { label: "Metas, prazos visuais", route: "/metas" },
      { label: "Mente Infalível, estrutura PREP", route: "/mente-poderosa" },
      { label: "Vision Board, ancorar foco", route: "/vision-board" },
    ],
    cautions: ["Cuidado com supercompromissos: aprenda a dizer 'deixa eu confirmar'", "Evite tomar decisões financeiras no impulso emocional", "Atenção à validação externa excessiva"],
  },
  S: {
    title: "Estabilidade", emoji: "🕊️",
    desc: "Você é o porto seguro! Paciente, leal e ótima ouvinte. Cria ambientes harmoniosos e confiáveis.",
    strengths: ["Paciente", "Leal", "Confiável", "Empática"],
    tips: ["Aprenda a dizer não quando necessário", "Expresse suas opiniões com confiança", "Abrace mudanças como oportunidades"],
    neuro: "Predomínio do sistema parassimpático e altos níveis de serotonina basal. Ótimo para vínculo e regulação, mas a amígdala pode hiper-reagir a conflitos, gerando evitação e ruminação.",
    daily: [
      "Pratique 1 'não' por dia em situação de baixo risco",
      "Power posture de 2 min antes de conversas difíceis (Amy Cuddy)",
      "Escreva sua opinião antes de reuniões para não engolir",
      "Caminhada de 20 min ao sol para serotonina",
    ],
    tools: [
      { label: "Mente Infalível, assertividade", route: "/mente-poderosa" },
      { label: "Identidade Inabalável, limites", route: "/identidade-inabalavel" },
      { label: "Diário, expressar emoções", route: "/diario" },
      { label: "Destravar Feminino, coragem", route: "/jornada" },
    ],
    cautions: ["Atenção a relacionamentos abusivos disfarçados de 'paz'", "Evite sobrecarregar-se cuidando dos outros", "Cuidado com procrastinação por medo de mudança"],
  },
  C: {
    title: "Conformidade", emoji: "🔬",
    desc: "Você é analítica e precisa! Valoriza qualidade, dados e processos bem definidos. Busca excelência em tudo.",
    strengths: ["Analítica", "Detalhista", "Precisa", "Estratégica"],
    tips: ["Não busque perfeição em tudo", "Compartilhe suas conclusões com mais frequência", "Equilibre análise com ação"],
    neuro: "Alta atividade no córtex pré-frontal dorsolateral e cingulado anterior, detecção de erros muito apurada. O custo é a ativação fácil do circuito de ansiedade (ínsula + amígdala) com cortisol elevado.",
    daily: [
      "Regra dos 80%: entregue quando estiver 80% pronto",
      "Respiração diafragmática 5 min antes de revisar trabalhos",
      "Estabeleça deadline para análise (ex: 30 min e decide)",
      "Pratique uma atividade imperfeita por prazer (dança, desenho)",
    ],
    tools: [
      { label: "Mente Infalível, sair do perfeccionismo", route: "/mente-poderosa" },
      { label: "Reprogramação Mental, relaxar mente analítica", route: "/reprogramacao" },
      { label: "Alta Performance, timeboxing", route: "/alta-performance" },
      { label: "Manifestação, soltar o controle", route: "/jornada" },
    ],
    cautions: ["Risco de ansiedade generalizada por excesso de análise", "Cuidado com isolamento social pra 'terminar tudo certo'", "Evite criticar a si mesma com dureza"],
  },
};

// ─── Behavioral Test ───
const behavioralQuestions = [
  { q: "Ao acordar, você geralmente:", a: [
    { text: "Já pensa na lista de tarefas do dia", type: "executor" },
    { text: "Fica um tempo refletindo sobre a vida", type: "pensador" },
    { text: "Checa as redes sociais imediatamente", type: "conector" },
    { text: "Segue uma rotina fixa sem pensar muito", type: "estavel" },
  ]},
  { q: "Diante de uma decisão importante:", a: [
    { text: "Decido rápido e ajusto depois", type: "executor" },
    { text: "Pesquiso muito antes de decidir", type: "pensador" },
    { text: "Peço opinião de pessoas de confiança", type: "conector" },
    { text: "Espero o momento certo surgir", type: "estavel" },
  ]},
  { q: "Em uma festa, você:", a: [
    { text: "Organiza as coisas e toma iniciativa", type: "executor" },
    { text: "Observa as pessoas e analisa o ambiente", type: "pensador" },
    { text: "É a alma da festa, conversa com todos", type: "conector" },
    { text: "Fica em um canto com amigos próximos", type: "estavel" },
  ]},
  { q: "Quando alguém discorda de você:", a: [
    { text: "Defendo meu ponto com firmeza", type: "executor" },
    { text: "Considero o argumento racionalmente", type: "pensador" },
    { text: "Busco um meio termo que agrade a todos", type: "conector" },
    { text: "Evito o conflito e mudo de assunto", type: "estavel" },
  ]},
  { q: "Seu maior medo é:", a: [
    { text: "Fracassar e não atingir meus objetivos", type: "executor" },
    { text: "Tomar uma decisão errada por falta de informação", type: "pensador" },
    { text: "Ser rejeitada ou ficar sozinha", type: "conector" },
    { text: "Perder minha zona de conforto", type: "estavel" },
  ]},
  { q: "Quando estou estressada, eu:", a: [
    { text: "Trabalho mais para resolver tudo", type: "executor" },
    { text: "Me isolo para pensar com clareza", type: "pensador" },
    { text: "Desabafo com alguém de confiança", type: "conector" },
    { text: "Faço algo relaxante como assistir TV", type: "estavel" },
  ]},
];

const behavioralProfiles: Record<string, Profile> = {
  executor: {
    title: "Executora", emoji: "⚡",
    desc: "Você é movida pela ação! Foco em resultados, produtividade alta e mentalidade de crescimento constante.",
    strengths: ["Proativa", "Focada", "Resiliente", "Produtiva"],
    tips: ["Reserve tempo para descansar", "Valorize o processo, não só o resultado", "Pratique mindfulness"],
    neuro: "Sistema nervoso simpático predominante com picos de dopamina por conclusão de tarefas. Risco: fadiga adrenal e diminuição da neurogênese no hipocampo se não houver pausas.",
    daily: [
      "Bloco sagrado de 1 hora sem celular ao final do dia",
      "Meditação de 10 min de manhã para regular cortisol",
      "Lista de 3 prioridades MIT (Most Important Tasks)",
      "Pausa ativa a cada 90 min (ciclo ultradiano)",
    ],
    tools: [
      { label: "Reprogramação Mental, meditações", route: "/reprogramacao" },
      { label: "Sono, recuperação noturna", route: "/sono" },
      { label: "Alta Performance, ciclos focados", route: "/alta-performance" },
      { label: "Saúde, cortisol e fadiga", route: "/saude" },
    ],
    cautions: ["Sinais de burnout: insônia, irritabilidade, queda de libido", "Evite cafeína após 14h", "Não confunda autoexigência com autocuidado"],
  },
  pensador: {
    title: "Pensadora", emoji: "🧠",
    desc: "Sua mente é sua maior arma! Reflexiva, estratégica e profunda. Você enxerga o que outros não veem.",
    strengths: ["Estratégica", "Visionária", "Racional", "Profunda"],
    tips: ["Não paralise na análise", "Confie mais na sua intuição", "Compartilhe suas ideias brilhantes"],
    neuro: "Default Mode Network muito ativa, gera insights, mas também ruminação. Hipocampo trabalha intensamente armazenando padrões.",
    daily: [
      "Journaling 5 min de manhã pra esvaziar a mente",
      "Regra dos 2 minutos: se decidir leva <2min, decide agora",
      "Pratique 1 ação intuitiva por dia (sem analisar)",
      "Compartilhe 1 ideia com alguém em vez de só pensar",
    ],
    tools: [
      { label: "Diário, capturar reflexões", route: "/diario" },
      { label: "Mente Infalível, sair da paralisia", route: "/mente-poderosa" },
      { label: "Comunidade, validar ideias", route: "/comunidade" },
      { label: "Manifestação Escrita", route: "/jornada" },
    ],
    cautions: ["Ruminação excessiva pode evoluir para ansiedade ou depressão", "Cuidado com isolamento crônico", "Não use análise como desculpa pra não agir"],
  },
  conector: {
    title: "Conectora", emoji: "💫",
    desc: "Você é a cola que une tudo! Empática, comunicativa e carismática. Cria laços profundos com as pessoas.",
    strengths: ["Empática", "Comunicativa", "Inspiradora", "Adaptável"],
    tips: ["Cuide de si antes de cuidar dos outros", "Estabeleça limites saudáveis", "Foque em suas próprias metas"],
    neuro: "Neurônios-espelho hiperativos e alta liberação de ocitocina. O risco é a fadiga por compaixão e a perda do senso de identidade próprio.",
    daily: [
      "30 min/dia 'só seus' sem responder ninguém",
      "Pergunte: 'isso é meu ou da outra pessoa?' antes de absorver emoções",
      "Banho consciente como ritual de descontaminação energética",
      "1 metaa pessoal trabalhada antes de ajudar outros",
    ],
    tools: [
      { label: "Identidade Inabalável, limites", route: "/identidade-inabalavel" },
      { label: "Metas, foco pessoal", route: "/metas" },
      { label: "Reprogramação, frequências de proteção", route: "/reprogramacao" },
      { label: "Diário, descarregar emoções alheias", route: "/diario" },
    ],
    cautions: ["Cuidado com codependência e relações em que você 'salva'", "Risco de exaustão emocional", "Atenção a manipuladores que se aproveitam da sua empatia"],
  },
  estavel: {
    title: "Equilibrada", emoji: "🌿",
    desc: "Você é o centro de gravidade! Calma, ponderada e constante. Traz paz e equilíbrio para qualquer ambiente.",
    strengths: ["Calma", "Constante", "Ponderada", "Resiliente"],
    tips: ["Saia da zona de conforto com frequência", "Expresse mais suas emoções", "Não tenha medo de arriscar"],
    neuro: "Predomínio de GABA e serotonina, com baixa reatividade da amígdala. Excelente regulação, mas o circuito de recompensa pode ficar pouco estimulado, levando à acomodação.",
    daily: [
      "1 desafio novo por semana (mesmo pequeno)",
      "Pergunte 'o que eu sinto?' 3x ao dia e nomeie",
      "Faça uma escolha ousada por semana (cor, rota, prato)",
      "Compartilhe uma opinião forte em conversa",
    ],
    tools: [
      { label: "Desafios, sair da zona de conforto", route: "/desafios" },
      { label: "Vision Board, ativar desejo", route: "/vision-board" },
      { label: "Mente Infalível, assertividade", route: "/mente-poderosa" },
      { label: "Jornada Destravar Feminino", route: "/jornada" },
    ],
    cautions: ["Acomodação pode virar depressão silenciosa", "Cuidado em deixar outros decidirem sua vida", "Atenção a frustração engolida que vira somatização"],
  },
};

// ─── Productivity Test ───
const productivityQuestions = [
  { q: "Como você organiza suas tarefas?", a: [
    { text: "Lista detalhada com horários", type: "planejadora" },
    { text: "Faço o que parece mais urgente", type: "reativa" },
    { text: "Uso intuição e fluxo criativo", type: "criativa" },
    { text: "Sigo uma rotina fixa todos os dias", type: "sistematica" },
  ]},
  { q: "Quando você é mais produtiva?", a: [
    { text: "De manhã bem cedo", type: "planejadora" },
    { text: "Depende do dia e do humor", type: "reativa" },
    { text: "À noite quando tudo está silencioso", type: "criativa" },
    { text: "Em horários fixos que já me acostumei", type: "sistematica" },
  ]},
  { q: "O que mais sabota sua produtividade?", a: [
    { text: "Excesso de planejamento sem ação", type: "planejadora" },
    { text: "Distrações e urgências dos outros", type: "reativa" },
    { text: "Falta de inspiração ou motivação", type: "criativa" },
    { text: "Tarefas fora da rotina habitual", type: "sistematica" },
  ]},
  { q: "Seu espaço de trabalho ideal é:", a: [
    { text: "Organizado com tudo no lugar", type: "planejadora" },
    { text: "Funcional, não precisa ser perfeito", type: "reativa" },
    { text: "Inspirador, com cores e objetos criativos", type: "criativa" },
    { text: "Minimalista e sem distrações", type: "sistematica" },
  ]},
  { q: "Quando tem muitas tarefas, você:", a: [
    { text: "Prioriza usando um método (ex: Eisenhower)", type: "planejadora" },
    { text: "Faz a mais rápida primeiro para dar sensação de progresso", type: "reativa" },
    { text: "Começa pela mais interessante", type: "criativa" },
    { text: "Segue a ordem que já estava planejada", type: "sistematica" },
  ]},
];

const productivityProfiles: Record<string, Profile> = {
  planejadora: {
    title: "Planejadora", emoji: "📋",
    desc: "Você é mestra em organização! Listas, agendas e metas claras são seu combustível.",
    strengths: ["Organizada", "Orientada a metas", "Disciplinada", "Previsível"],
    tips: ["Permita-se flexibilidade", "Não replaneje, execute", "Reserve tempo para criatividade livre"],
    neuro: "Córtex pré-frontal dorsolateral muito ativo (planejamento) com forte recompensa dopaminérgica em 'check-list'. Risco: rigidez cognitiva e dificuldade de adaptação.",
    daily: [
      "Bloque 30 min/semana de tempo 'sem planejamento'",
      "Regra: executar antes de re-listar",
      "Pratique uma atividade criativa sem objetivo (rabiscar)",
      "Use timeboxing em vez de listas infinitas",
    ],
    tools: [
      { label: "Metas SMART", route: "/metas" },
      { label: "Alta Performance, timeboxing", route: "/alta-performance" },
      { label: "Vision Board, soltar a criatividade", route: "/vision-board" },
      { label: "Manifestação, fluxo intuitivo", route: "/jornada" },
    ],
    cautions: ["Cuidado com paralisia por planejamento", "Atenção à autocrítica quando o plano falha", "Evite controlar a vida dos outros"],
  },
  reativa: {
    title: "Reativa", emoji: "🔥",
    desc: "Você brilha sob pressão! Adapta-se rápido e resolve problemas em tempo recorde.",
    strengths: ["Adaptável", "Rápida", "Pragmática", "Multi-tarefa"],
    tips: ["Planeje ao menos 3 prioridades por dia", "Silencie notificações por períodos", "Use blocos de tempo focado"],
    neuro: "Picos de adrenalina e cortisol viciam o cérebro em urgência (efeito 'tiranny of the urgent'). Hipocampo sofre com estresse crônico, prejudicando memória e foco.",
    daily: [
      "Defina 3 MITs antes de abrir e-mail/WhatsApp",
      "Modo avião por 2 blocos de 50 min ao dia",
      "Respiração 4-7-8 quando chega uma 'urgência'",
      "Audit semanal: o que era urgente x importante?",
    ],
    tools: [
      { label: "Alta Performance, foco profundo", route: "/alta-performance" },
      { label: "Mente Infalível, pausa de 6s", route: "/mente-poderosa" },
      { label: "Metas, clareza de prioridades", route: "/metas" },
      { label: "Reprogramação, baixar adrenalina", route: "/reprogramacao" },
    ],
    cautions: ["Vício em estresse é real e gera burnout", "Risco de doenças cardiovasculares e ansiedade", "Cuidado em deixar o importante sempre por último"],
  },
  criativa: {
    title: "Criativa", emoji: "🎨",
    desc: "Sua produtividade vem da inspiração! Quando está no fluxo, produz obras incríveis.",
    strengths: ["Inovadora", "Visionária", "Original", "Apaixonada"],
    tips: ["Crie rotinas que suportem seu fluxo criativo", "Use timers para manter o foco", "Capture ideias em um caderno sempre à mão"],
    neuro: "Default Mode Network e córtex pré-frontal medial alternam em modo divergente. Sensível à dopamina por novidade, risco de procrastinação criativa.",
    daily: [
      "Ritual de aquecimento (música, café, vela) antes de criar",
      "Pomodoro 25/5 para vencer o branco",
      "Capture ideias por voz no celular ao longo do dia",
      "Sono regular: o fluxo criativo nasce no REM",
    ],
    tools: [
      { label: "Vision Board, ativar visão", route: "/vision-board" },
      { label: "Alta Performance, Pomodoro", route: "/alta-performance" },
      { label: "Sono, proteger o REM", route: "/sono" },
      { label: "Diário, brain dump", route: "/diario" },
    ],
    cautions: ["Procrastinação disfarçada de 'esperar inspiração'", "Risco de não monetizar talentos", "Cuidado com altos e baixos emocionais sem rotina"],
  },
  sistematica: {
    title: "Sistemática", emoji: "⚙️",
    desc: "Você é uma máquina de consistência! Rotinas e sistemas são sua superpotência.",
    strengths: ["Consistente", "Confiável", "Eficiente", "Metódica"],
    tips: ["Experimente novos métodos periodicamente", "Automatize tarefas repetitivas", "Celebre sua consistência"],
    neuro: "Gânglios da base muito treinados, comportamentos viram hábitos com baixo custo cognitivo. O risco é o circuito de habituação reduzir o prazer e a flexibilidade.",
    daily: [
      "Mude 1 variável por semana (rota, playlist, café)",
      "Revise sistemas a cada 30 dias",
      "Adicione 1 'micro-aventura' à rotina",
      "Pratique algo novo por 10 min/dia (instrumento, idioma)",
    ],
    tools: [
      { label: "Desafios, romper padrões", route: "/desafios" },
      { label: "Alta Performance, novos métodos", route: "/alta-performance" },
      { label: "Mente Infalível, plasticidade", route: "/mente-poderosa" },
      { label: "Jornada Elite", route: "/jornada-elite" },
    ],
    cautions: ["Rigidez pode virar dificuldade de adaptação em crises", "Tédio crônico que vira anedonia", "Atenção a relacionamentos engessados"],
  },
};

// ─── Neuroscience Test ───
const neuroQuestions = [
  { q: "Qual atividade mais te energiza?", a: [
    { text: "Aprender algo novo e complexo", type: "cortex" },
    { text: "Conectar-se emocionalmente com alguém", type: "limbico" },
    { text: "Meditar ou ficar em silêncio", type: "parasimpatico" },
    { text: "Exercício físico intenso", type: "simpatico" },
  ]},
  { q: "Quando precisa memorizar algo, você:", a: [
    { text: "Faz mapas mentais e resumos", type: "cortex" },
    { text: "Associa a uma emoção ou história", type: "limbico" },
    { text: "Repete calmamente várias vezes", type: "parasimpatico" },
    { text: "Pratica ativamente (fazendo)", type: "simpatico" },
  ]},
  { q: "Seu estado mental mais frequente é:", a: [
    { text: "Pensando em estratégias e soluções", type: "cortex" },
    { text: "Sentindo emoções intensamente", type: "limbico" },
    { text: "Calma e serena", type: "parasimpatico" },
    { text: "Alerta e pronta para ação", type: "simpatico" },
  ]},
  { q: "O que mais te ajuda a tomar boas decisões?", a: [
    { text: "Lógica e análise de dados", type: "cortex" },
    { text: "Intuição e sentimento", type: "limbico" },
    { text: "Reflexão profunda e calma", type: "parasimpatico" },
    { text: "Experiência prática e teste rápido", type: "simpatico" },
  ]},
  { q: "Quando estou em flow (estado de fluxo):", a: [
    { text: "Estou resolvendo problemas complexos", type: "cortex" },
    { text: "Estou em uma conversa profunda e significativa", type: "limbico" },
    { text: "Estou em total paz interior", type: "parasimpatico" },
    { text: "Estou em movimento, treinando ou competindo", type: "simpatico" },
  ]},
  { q: "Meu superpoder cerebral é:", a: [
    { text: "Raciocínio lógico e resolução de problemas", type: "cortex" },
    { text: "Empatia e inteligência emocional", type: "limbico" },
    { text: "Autoconsciência e equilíbrio interior", type: "parasimpatico" },
    { text: "Energia, vitalidade e disposição", type: "simpatico" },
  ]},
];

const neuroProfiles: Record<string, Profile> = {
  cortex: {
    title: "Córtex Dominante", emoji: "🧩",
    desc: "Seu cérebro racional é poderoso! Pensamento analítico, lógica e aprendizado são suas forças.",
    strengths: ["Analítica", "Estratégica", "Aprendizagem rápida", "Resolução de problemas"],
    tips: ["Equilibre razão com emoção", "Pratique exercícios de criatividade", "Permita-se sentir sem analisar"],
    neuro: "Forte ativação do córtex pré-frontal e baixa modulação límbica. Você processa o mundo top-down, risco de dissociação emocional e somatização.",
    daily: [
      "Nomear 3 emoções por dia (RAIN: Reconhecer, Aceitar, Investigar, Nutrir)",
      "5 min de body scan ao acordar para reativar a ínsula",
      "Dança livre 3 min ao chegar em casa",
      "Pergunte 'como me sinto?' antes de 'o que devo fazer?'",
    ],
    tools: [
      { label: "Reprogramação Mental, frequências", route: "/reprogramacao" },
      { label: "Mente Infalível, inteligência emocional", route: "/mente-poderosa" },
      { label: "Diário, nomear emoções", route: "/diario" },
      { label: "Manifestação, sentir o desejo", route: "/jornada" },
    ],
    cautions: ["Sintomas físicos sem causa podem ser emoções reprimidas", "Cuidado com frieza percebida em relações", "Não confunda controle com segurança"],
  },
  limbico: {
    title: "Sistema Límbico Ativo", emoji: "💖",
    desc: "Seu cérebro emocional é sua bússola! Empatia, conexão e intuição guiam suas decisões.",
    strengths: ["Empática", "Intuitiva", "Criativa", "Sensível"],
    tips: ["Proteja sua energia emocional", "Use journaling para processar emoções", "Pratique grounding quando sobrecarregada"],
    neuro: "Amígdala e ínsula muito reativas, você sente antes de pensar. Ótimo para conexão, mas vulnerável a sequestros emocionais e ansiedade.",
    daily: [
      "Grounding 5-4-3-2-1 quando sobrecarregada (5 coisas que vê, 4 toca…)",
      "Respiração 4-7-8 ao primeiro sinal de gatilho",
      "Journaling expressivo 10 min antes de dormir",
      "Limite consumo de notícias e dramas",
    ],
    tools: [
      { label: "Reprogramação Mental, regulação", route: "/reprogramacao" },
      { label: "Mente Infalível, gestão emocional", route: "/mente-poderosa" },
      { label: "Diário, descarga emocional", route: "/diario" },
      { label: "Saúde, ciclo menstrual e humor", route: "/saude" },
    ],
    cautions: ["Risco de transtornos de ansiedade e TPM intensa", "Cuidado com relações intensas demais cedo demais", "Atenção a decisões financeiras no auge emocional"],
  },
  parasimpatico: {
    title: "Parassimpático Forte", emoji: "🧘",
    desc: "Você tem um dom natural para a calma! Regulação emocional e paz interior são suas marcas.",
    strengths: ["Calma", "Centrada", "Resiliente ao estresse", "Mindful"],
    tips: ["Desafie-se com atividades estimulantes", "Não confunda calma com passividade", "Use sua serenidade como superpoder de liderança"],
    neuro: "Tônus vagal alto, ótima variabilidade da frequência cardíaca (HRV). Risco: hipo-ativação dopaminérgica leva à letargia e procrastinação.",
    daily: [
      "Exercício cardio 20 min, 3x/semana",
      "Banho gelado 30 segundos ao final do banho",
      "Defina prazo curto para 1 decisão por dia",
      "Cante alto ou faça respiração de fogo pra ativar simpático",
    ],
    tools: [
      { label: "Desafios, ativar drive", route: "/desafios" },
      { label: "Saúde, exercício e energia", route: "/saude" },
      { label: "Metas, ambição saudável", route: "/metas" },
      { label: "Alta Performance, ritmo", route: "/alta-performance" },
    ],
    cautions: ["Calma demais pode mascarar depressão atípica", "Cuidado em deixar oportunidades passarem", "Atenção a relações onde você é 'a paciente'"],
  },
  simpatico: {
    title: "Simpático Dominante", emoji: "⚡",
    desc: "Seu sistema de ação está sempre ligado! Energia, foco e performance física são excepcionais.",
    strengths: ["Energética", "Focada", "Competitiva", "Ativa"],
    tips: ["Pratique relaxamento ativo (yoga, alongamento)", "Durma o suficiente para recuperar", "Canalize sua energia em projetos significativos"],
    neuro: "SNS dominante: noradrenalina e cortisol elevados. Alta performance hoje, mas hipocampo encolhe com estresse crônico e o sono REM sofre.",
    daily: [
      "Yoga restaurativa 15 min antes de dormir",
      "Respiração coerente 5-5 (5s inspira, 5s expira) 3x ao dia",
      "Sem telas 60 min antes de dormir",
      "Banho morno e magnésio à noite",
    ],
    tools: [
      { label: "Sono, proteção do REM", route: "/sono" },
      { label: "Reprogramação, relaxamento", route: "/reprogramacao" },
      { label: "Saúde, cortisol e recuperação", route: "/saude" },
      { label: "Mente Infalível, regulação", route: "/mente-poderosa" },
    ],
    cautions: ["Risco real de burnout, insônia e arritmia", "Cuidado com dependência de cafeína", "Atenção a sintomas de ciclo menstrual irregular por estresse"],
  },
};

// ─── Test categories ───
const testCategories = [
  { id: "disc", title: "Teste DISC", subtitle: "Descubra seu perfil de liderança", icon: Users, gradient: "from-purple-900/40 to-purple-800/20", questions: discQuestions, profiles: discProfiles },
  { id: "behavioral", title: "Teste Comportamental", subtitle: "Entenda seus padrões de comportamento", icon: Brain, gradient: "from-rose-900/40 to-rose-800/20", questions: behavioralQuestions, profiles: behavioralProfiles },
  { id: "productivity", title: "Teste de Produtividade", subtitle: "Descubra seu estilo produtivo", icon: Zap, gradient: "from-amber-900/40 to-amber-800/20", questions: productivityQuestions, profiles: productivityProfiles },
  { id: "neuro", title: "Teste Neurociência", subtitle: "Conheça seu cérebro dominante", icon: Atom, gradient: "from-emerald-900/40 to-emerald-800/20", questions: neuroQuestions, profiles: neuroProfiles },
];

type TestState = { testId: string; step: number; answers: string[] } | null;
type HistoryEntry = { testId: string; profile: string; date: string };

const HISTORY_KEY = "testes:history:v1";

const loadHistory = (): HistoryEntry[] => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
};
const saveHistory = (h: HistoryEntry[]) => localStorage.setItem(HISTORY_KEY, JSON.stringify(h));

const TestesPage = () => {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState<TestState>(null);
  const [result, setResult] = useState<{ testId: string; profile: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const handleAnswer = (type: string) => {
    if (!activeTest) return;
    const cat = testCategories.find(c => c.id === activeTest.testId)!;
    const newAnswers = [...activeTest.answers, type];

    if (newAnswers.length >= cat.questions.length) {
      const counts: Record<string, number> = {};
      newAnswers.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult({ testId: activeTest.testId, profile: winner });
      setActiveTest(null);
      const entry: HistoryEntry = { testId: activeTest.testId, profile: winner, date: new Date().toISOString() };
      const updated = [entry, ...loadHistory()].slice(0, 50);
      saveHistory(updated);
      setHistory(updated);
    } else {
      setActiveTest({ ...activeTest, step: activeTest.step + 1, answers: newAnswers });
    }
  };

  const resetTest = () => { setResult(null); setActiveTest(null); };
  const clearHistory = () => {
    if (!confirm("Apagar todo o histórico de testes?")) return;
    saveHistory([]); setHistory([]);
  };

  // ─── History Screen ───
  if (showHistory) {
    return (
      <div className="min-h-screen bg-background px-5 pt-10 pb-8">
        <button onClick={() => setShowHistory(false)} className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 text-sm font-body">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">Histórico de Respostas</h1>
          {history.length > 0 && (
            <button onClick={clearHistory} className="flex items-center gap-1 text-xs text-destructive/80 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground text-center py-12">Nenhum teste realizado ainda. Volte e faça o primeiro!</p>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => {
              const cat = testCategories.find(c => c.id === h.testId);
              const profile = cat?.profiles[h.profile];
              if (!cat || !profile) return null;
              return (
                <button
                  key={i}
                  onClick={() => { setResult({ testId: h.testId, profile: h.profile }); setShowHistory(false); }}
                  className="w-full text-left glass rounded-2xl p-4 border border-gold/10 hover:border-gold/30 transition-all flex items-center gap-3"
                >
                  <div className="text-3xl">{profile.emoji}</div>
                  <div className="flex-1">
                    <p className="text-sm font-display font-bold text-foreground">{profile.title}</p>
                    <p className="text-[11px] font-body text-muted-foreground">{cat.title} • {new Date(h.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gold/50" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── Result Screen ───
  if (result) {
    const cat = testCategories.find(c => c.id === result.testId)!;
    const profile = cat.profiles[result.profile];
    return (
      <div className="min-h-screen bg-background px-5 pt-10 pb-8">
        <button onClick={resetTest} className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 text-sm font-body">
          <ArrowLeft className="h-4 w-4" /> Voltar aos testes
        </button>

        <div className="text-center space-y-4 mb-8">
          <div className="text-6xl">{profile.emoji}</div>
          <h1 className="text-2xl font-display font-bold text-foreground">{profile.title}</h1>
          <p className="text-sm font-body text-muted-foreground leading-relaxed max-w-sm mx-auto">{profile.desc}</p>
        </div>

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-5">
          <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold mb-3">Seus Pontos Fortes</h3>
          <div className="flex flex-wrap gap-2">
            {profile.strengths.map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-xs font-body text-gold font-medium">{s}</span>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">Neurociência por trás</h3>
          </div>
          <p className="text-sm font-body text-foreground/80 leading-relaxed">{profile.neuro}</p>
        </div>

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">Dicas para o dia a dia</h3>
          </div>
          <div className="space-y-2.5">
            {profile.daily.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm font-body text-foreground/80">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Compass className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold">Ferramentas do app pra você</h3>
          </div>
          <div className="space-y-2">
            {profile.tools.map((tool, i) => (
              <button
                key={i}
                onClick={() => navigate(tool.route)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-gold/10 hover:border-gold/30 hover:bg-muted/30 transition-all text-left"
              >
                <span className="text-sm font-body text-foreground/90">{tool.label}</span>
                <ChevronRight className="h-4 w-4 text-gold/60" />
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-destructive/20 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="text-xs font-body tracking-[0.2em] uppercase text-destructive/90 font-semibold">Cuidados importantes</h3>
          </div>
          <div className="space-y-2.5">
            {profile.cautions.map((c, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive/80 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-body text-foreground/80">{c}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-6">
          <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold mb-3">Dicas Gerais de Crescimento</h3>
          <div className="space-y-2.5">
            {profile.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm font-body text-foreground/80">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <button onClick={resetTest} className="w-full py-3.5 rounded-2xl bg-gold text-primary-foreground font-display font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.97]">
          <RotateCcw className="h-4 w-4" /> Fazer outro teste
        </button>
      </div>
    );
  }

  // ─── Active Test Screen ───
  if (activeTest) {
    const cat = testCategories.find(c => c.id === activeTest.testId)!;
    const question = cat.questions[activeTest.step];
    const progress = ((activeTest.step) / cat.questions.length) * 100;

    return (
      <div className="min-h-screen bg-background px-5 pt-10 pb-8">
        <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 text-sm font-body">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-display font-bold text-foreground">{cat.title}</h2>
            <span className="text-xs font-body text-muted-foreground">{activeTest.step + 1}/{cat.questions.length}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="text-base font-body font-semibold text-foreground mb-5 leading-relaxed">{question.q}</p>

        <div className="space-y-3">
          {question.a.map((answer, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(answer.type)}
              className="w-full text-left p-4 rounded-2xl glass border border-gold/10 hover:border-gold/30 hover:bg-muted/20 transition-all active:scale-[0.98] group"
            >
              <span className="text-sm font-body text-foreground/90 group-hover:text-foreground transition-colors">{answer.text}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── Main Menu ───
  return (
    <div className="min-h-screen bg-background px-5 pt-10 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gold/70 hover:text-gold mb-6 text-sm font-body">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Autoconhecimento</h1>
        <p className="text-sm font-body text-muted-foreground">Descubra seu perfil através de testes cientificamente embasados</p>
      </div>

      <button
        onClick={() => setShowHistory(true)}
        className="w-full mb-5 flex items-center justify-between p-4 rounded-2xl glass border border-gold/15 hover:border-gold/35 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center border border-gold/30">
            <History className="h-5 w-5 text-gold" />
          </div>
          <div className="text-left">
            <p className="text-sm font-display font-bold text-foreground">Histórico de Respostas</p>
            <p className="text-[11px] font-body text-muted-foreground">{history.length} {history.length === 1 ? "teste salvo" : "testes salvos"}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gold/50" />
      </button>

      <div className="space-y-4">
        {testCategories.map(({ id, title, subtitle, icon: Icon, gradient }) => (
          <button
            key={id}
            onClick={() => setActiveTest({ testId: id, step: 0, answers: [] })}
            className="w-full relative overflow-hidden rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-brand active:scale-[0.98] group glass border border-gold/10 hover:border-gold/25"
          >
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 group-hover:opacity-100 transition-opacity", gradient)} />
            <div className="relative z-10 h-12 w-12 rounded-2xl bg-gold/15 flex items-center justify-center border border-gold/30 group-hover:bg-gold/25 transition-all">
              <Icon className="h-6 w-6 text-gold" />
            </div>
            <div className="relative z-10 flex-1 text-left">
              <p className="text-sm font-display font-bold text-foreground">{title}</p>
              <p className="text-[11px] font-body text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
            <ChevronRight className="relative z-10 h-5 w-5 text-gold/50 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default TestesPage;
