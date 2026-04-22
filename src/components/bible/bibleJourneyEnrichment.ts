// Enrichment layer for the 365-day journey.
// Provides multi-version text snippets, historical context, devotional reflections,
// activation questions, and visual map references per day.
// Days without explicit enrichment fall back to generated content from base plan.

export type BibleVersion = "NVI" | "NVT" | "ACR";

export interface DayEnrichment {
  // Optional alternative version texts. If absent for a version, the base text from
  // bibleReadingPlan is used (assumed NVI-style).
  versions?: Partial<Record<BibleVersion, string>>;
  // Historical context: "where we are" in the timeline of Scripture.
  contextoHistorico: string;
  // Approximate period (e.g. "~1400 a.C." or "Período do Reino Unido")
  periodo: string;
  // Geographic region — used to display a map hint
  regiao: string;
  // Mind map / journey flow (short steps)
  jornadaMental: string[];
  // Heart & practice — devotional applied to woman's identity today
  devocional: string;
  // 2-3 activation questions
  perguntas: string[];
  // Optional unsplash query for the contextual photo
  imagemQuery?: string;
}

// Specific, hand-crafted enrichment for the most pivotal days.
// All other days receive a smart generated fallback (see helper below).
const enrichmentMap: Record<number, DayEnrichment> = {
  15: {
    versions: {
      NVI: "Estes são os nomes dos filhos de Israel que entraram no Egito com Jacó... Surgiu então no Egito um novo rei, que nada sabia sobre José. E disse ao seu povo: 'Vejam! O povo israelita é agora numeroso e mais forte do que nós.' [...] Moisés conduziu o rebanho para o outro lado do deserto e chegou a Horebe, o monte de Deus. Ali o Anjo do Senhor apareceu numa chama de fogo no meio de uma sarça. Moisés viu que, embora a sarça estivesse em chamas, não era consumida pelo fogo.",
      NVT: "Estes são os nomes dos filhos de Israel que foram para o Egito com seu pai Jacó... Por fim, subiu ao trono do Egito um novo rei, que nada sabia a respeito de José nem de seus feitos. Esse rei disse a seu povo: 'Estes israelitas se tornaram uma ameaça; são numerosos demais para nós.' [...] Certo dia, Moisés conduzia o rebanho de seu sogro Jetro até o outro lado do deserto e chegou a Horebe, o monte de Deus. Lá, o Anjo do Senhor lhe apareceu numa chama ardente, no meio de uma sarça. Moisés ficou maravilhado: a sarça ardia em chamas, mas não se consumia.",
      ACR: "Estes, pois, são os nomes dos filhos de Israel, que entraram no Egito com Jacó... Depois, levantou-se um novo rei sobre o Egito, que não conhecera a José. O qual disse ao seu povo: Eis que o povo dos filhos de Israel é muito, e mais poderoso do que nós. [...] E apascentando Moisés o rebanho de Jetro, seu sogro, sacerdote em Midiã, levou o rebanho atrás do deserto, e veio ao monte de Deus, a Horebe. E apareceu-lhe o Anjo do Senhor em uma chama de fogo, do meio de uma sarça; e olhou, e eis que a sarça ardia no fogo, e a sarça não se consumia.",
    },
    contextoHistorico:
      "Estamos no período da Escravidão no Egito. Cerca de 400 anos se passaram desde José. Israel multiplicou-se de 70 pessoas para uma nação. Um novo Faraó (provavelmente da XIX dinastia) iniciou a opressão. Moisés nasce neste contexto, é criado no palácio, foge para Midiã e, aos 80 anos, encontra Deus na sarça ardente — o início da maior libertação da história.",
    periodo: "~1500–1400 a.C. (Império Novo do Egito)",
    regiao: "Egito (Delta do Nilo) → Deserto do Sinai (Horebe)",
    jornadaMental: [
      "Opressão (medo coletivo)",
      "Moisés foge (vergonha + identidade quebrada)",
      "Deserto (40 anos de silêncio)",
      "Sarça ardente (encontro)",
      "EU SOU (revelação da identidade de Deus e da sua)",
      "Chamado (propósito ativado)",
    ],
    devocional:
      "Mulher, há um Egito interno em todas nós — lugares onde nos sentimos pequenas, escravas das expectativas, do medo do que vão pensar, da voz do passado dizendo 'você não serve'. Mas Deus não te encontra no palácio nem na fuga: Ele te encontra no deserto, no lugar onde você se calou. A sarça ardia e não se consumia — e essa é a profecia da sua vida: o fogo de Deus pode arder em você sem te destruir. Quando Ele disse 'EU SOU', estava te dando permissão para também SER. Não a versão que te impuseram. A original. A inabalável.",
    perguntas: [
      "Em que área da sua vida você ainda se sente escrava do medo das expectativas alheias?",
      "Qual 'deserto' Deus está usando hoje para revelar quem você realmente é?",
      "Se a sarça do seu coração arde e não se consome, qual chamado você está fingindo não ouvir?",
    ],
    imagemQuery: "sinai desert mountain golden sunset",
  },
  1: {
    contextoHistorico:
      "O início absoluto. Antes do tempo, antes da história. Deus, em soberania, cria do nada. O texto hebraico Bereshit ('No princípio') marca o ponto zero da existência criada — fundamento de toda identidade, propósito e dignidade humana.",
    periodo: "Antes da história registrada",
    regiao: "Universo / Éden (provavelmente região da Mesopotâmia)",
    jornadaMental: [
      "Caos (sem forma e vazio)",
      "Espírito de Deus paira",
      "Palavra (haja luz)",
      "Ordem e propósito",
      "Imagem e semelhança",
      "Descanso (shabat)",
    ],
    devocional:
      "Você não foi um acidente. Antes de existir, já existia uma intenção em você. Foi feita à imagem de Deus — isso significa que sua identidade não é negociável, não depende de aprovação, não pode ser editada por opinião alheia. E note: depois de criar, Deus descansou. Você também precisa aprender que sua produtividade não define seu valor. Descansar é santo.",
    perguntas: [
      "O que precisa ser 'separado' (luz das trevas) na sua vida nesta semana?",
      "Em que área você esqueceu que foi criada à imagem de Deus?",
      "Como seria viver um dia inteiro de descanso intencional, sem culpa?",
    ],
    imagemQuery: "creation universe stars cosmic light",
  },
  18: {
    contextoHistorico:
      "Israel sai do Egito após 430 anos. Encurralados no Mar Vermelho, vivem o milagre fundador da nação. Esta passagem é citada mais de 100 vezes no restante da Bíblia como o protótipo de toda libertação.",
    periodo: "~1446 a.C.",
    regiao: "Saída do Egito → Mar Vermelho (Golfo de Suez)",
    jornadaMental: [
      "Saída (fé inicial)",
      "Encurralamento (crise)",
      "Murmuração (medo retorna)",
      "Cajado erguido (decisão)",
      "Águas se abrem (provisão sobrenatural)",
      "Cântico (celebração que sela)",
    ],
    devocional:
      "Toda libertação tem um Mar Vermelho. O lugar onde parece que você saiu de uma escravidão só para morrer afogada em outra. Mas é exatamente ali — onde a lógica acaba — que Deus mostra quem é. Não retroceda. Erga seu cajado (sua fé, sua palavra, sua oração). E quando atravessar, CANTE. Celebrar a vitória é o que sela a transformação no seu cérebro e na sua história.",
    perguntas: [
      "Qual 'Mar Vermelho' está te encurralando agora?",
      "O que seria 'erguer o cajado' nessa situação — qual ato de fé você precisa praticar?",
      "Quando foi a última vez que você celebrou uma vitória de Deus na sua vida em voz alta?",
    ],
    imagemQuery: "red sea parting biblical waters",
  },
};

// Fallback generator for days without explicit enrichment.
// Uses the base plan's title/passages/text/neuroscience to compose meaningful content.
export function getDayEnrichment(
  day: number,
  base: { title: string; passages: string; text: string; neuroscience: string }
): DayEnrichment {
  if (enrichmentMap[day]) return enrichmentMap[day];

  return {
    contextoHistorico: `Esta passagem (${base.passages}) é parte da grande narrativa de Deus se revelando à humanidade. Cada palavra é fio de uma tapeçaria maior — entendendo o contexto, você compreende a si mesma dentro da história eterna.`,
    periodo: "Período bíblico",
    regiao: "Terra Santa e arredores",
    jornadaMental: [
      "Contexto",
      "Conflito ou chamado",
      "Resposta humana",
      "Intervenção divina",
      "Transformação",
      "Aprendizado para hoje",
    ],
    devocional: `${base.title} não é apenas uma história antiga — é um espelho. Toda passagem da Palavra revela algo da sua identidade em Deus. Hoje, deixe que esse texto fale com a mulher que você está se tornando. A Palavra não retorna vazia: ela reescreve narrativas de dentro para fora.`,
    perguntas: [
      `O que essa passagem revela sobre o caráter de Deus?`,
      `Como esta verdade desafia uma crença antiga sobre você mesma?`,
      `Qual ação concreta você pode tomar nas próximas 24h alinhada a esse texto?`,
    ],
    imagemQuery: "biblical landscape ancient holy land",
  };
}

// Bible version labels (for the picker UI)
export const BIBLE_VERSIONS: { value: BibleVersion; label: string; full: string }[] = [
  { value: "NVI", label: "NVI", full: "Nova Versão Internacional" },
  { value: "NVT", label: "NVT", full: "Nova Versão Transformadora" },
  { value: "ACR", label: "ACR", full: "Almeida Corrigida e Revisada" },
];
