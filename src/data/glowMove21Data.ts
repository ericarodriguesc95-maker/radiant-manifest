import { Heart, Brain, Sparkles, Globe, Coins, type LucideIcon } from "lucide-react";

export type Dimension = "corpo" | "mente" | "alma" | "externo" | "financas";

export interface DimensionMeta {
  id: Dimension;
  nome: string;
  subtitulo: string;
  cor: string;
  corBg: string;
  icon: LucideIcon;
}

export const DIMENSION_ORDER: Dimension[] = [
  "corpo",
  "mente",
  "alma",
  "externo",
  "financas",
];

export const DIMENSIONS: Record<Dimension, DimensionMeta> = {
  corpo: {
    id: "corpo",
    nome: "Corpo",
    subtitulo: "Templo físico",
    cor: "text-rose-300",
    corBg: "from-rose-900/30 to-rose-800/10",
    icon: Heart,
  },
  mente: {
    id: "mente",
    nome: "Mente",
    subtitulo: "Pensamentos & foco",
    cor: "text-sky-300",
    corBg: "from-sky-900/30 to-sky-800/10",
    icon: Brain,
  },
  alma: {
    id: "alma",
    nome: "Alma",
    subtitulo: "Essência & conexão",
    cor: "text-amber-300",
    corBg: "from-amber-900/30 to-amber-800/10",
    icon: Sparkles,
  },
  externo: {
    id: "externo",
    nome: "Externo",
    subtitulo: "Mundo & relações",
    cor: "text-emerald-300",
    corBg: "from-emerald-900/30 to-emerald-800/10",
    icon: Globe,
  },
  financas: {
    id: "financas",
    nome: "Finanças",
    subtitulo: "Abundância prática",
    cor: "text-yellow-300",
    corBg: "from-yellow-900/30 to-amber-900/10",
    icon: Coins,
  },
};

export interface Task {
  titulo: string;
  descricao: string;
  porque: string;
  dica: string;
  tempo: string;
}

export interface DayData {
  dia: number;
  tema: string;
  intencao: string;
  tarefas: Record<Dimension, Task>;
}

export const WEEKS = [
  { n: 1, nome: "Despertar", desc: "Reconhecer onde você está hoje", dias: [1, 7] },
  { n: 2, nome: "Expansão", desc: "Soltar o velho, ousar o novo", dias: [8, 14] },
  { n: 3, nome: "Enraizamento", desc: "Integrar e sustentar a transformação", dias: [15, 21] },
] as const;

export const POINTS_PER_TASK = 10;
export const TOTAL_DAYS = 21;
export const TASKS_PER_DAY = 5;

export const DAYS: DayData[] = [
  // SEMANA 1, DESPERTAR
  {
    dia: 1,
    tema: "Ponto zero",
    intencao: "Hoje você reconhece o ponto de partida sem julgamento.",
    tarefas: {
      corpo: {
        titulo: "Foto de partida + medidas",
        descricao: "Tire uma foto sua (frente e perfil) e anote peso, medidas e como o corpo se sente hoje.",
        porque: "O que não é medido não é transformado. Você precisa de um marco real para celebrar o quanto avançou em 21 dias.",
        dica: "Faça em jejum, com roupa leve, mesma hora do dia. Guarde no app, sem postar.",
        tempo: "10 min",
      },
      mente: {
        titulo: "Mapa mental do que pesa",
        descricao: "Escreva tudo o que está pesando na sua mente agora, preocupações, dívidas mentais, pensamentos repetitivos.",
        porque: "Despejar no papel libera memória de trabalho do cérebro e reduz cortisol em até 30%.",
        dica: "Não filtre. Escreva por 7 minutos sem parar, mesmo se virar bagunça.",
        tempo: "7 min",
      },
      alma: {
        titulo: "Carta para você mesma",
        descricao: "Escreva uma carta de hoje para a você de daqui 21 dias. Diga o que precisa mudar e por quê.",
        porque: "Compromisso por escrito ativa o córtex pré-frontal e aumenta em 42% a chance de você cumprir.",
        dica: "Releia no dia 21. Comece com 'Querida eu, hoje eu escolho...'",
        tempo: "15 min",
      },
      externo: {
        titulo: "Limpe 1 metro quadrado",
        descricao: "Escolha um pequeno espaço (mesa, gaveta, criado-mudo) e deixe impecável.",
        porque: "Ambiente externo espelha o estado interno. Começar pequeno ensina o cérebro que mudança é possível.",
        dica: "Cronometre 15 minutos. Pare quando tocar.",
        tempo: "15 min",
      },
      financas: {
        titulo: "Mapa financeiro de partida",
        descricao: "Anote saldo em conta, d\u00edvidas, gastos fixos mensais e renda atual em um caderno ou planilha.",
        porque: "Voc\u00ea s\u00f3 transforma o que enxerga. Encarar os n\u00fameros reais desativa a ansiedade do n\u00e3o-saber.",
        dica: "Sem julgamento. \u00c9 s\u00f3 um raio-X \u2014 n\u00e3o um veredicto sobre voc\u00ea.",
        tempo: "15 min",
      },
    },
  },
  {
    dia: 2,
    tema: "Escuta corporal",
    intencao: "Hoje você volta a habitar o próprio corpo.",
    tarefas: {
      corpo: {
        titulo: "2 litros de água + alongamento matinal",
        descricao: "Beba 2L de água ao longo do dia e faça 10 minutos de alongamento ao acordar.",
        porque: "Hidratação melhora foco em 14%. Alongamento matinal libera fáscia e reduz inflamação.",
        dica: "Garrafa marcada por horário. Alongue gato-vaca, dobra do quadril e pescoço.",
        tempo: "10 min",
      },
      mente: {
        titulo: "Respiração 4-7-8 (3 ciclos)",
        descricao: "Inspire em 4s, segure 7s, expire em 8s. Repita 3 vezes ao acordar e antes de dormir.",
        porque: "Ativa o nervo vago e desliga o modo luta-fuga em menos de 1 minuto.",
        dica: "Sentada, coluna ereta, ponta da língua atrás dos dentes da frente.",
        tempo: "5 min",
      },
      alma: {
        titulo: "5 minutos de silêncio",
        descricao: "Sente em silêncio, sem celular, sem música. Apenas observe o que vier.",
        porque: "O silêncio regenera neurônios no hipocampo (memória) e abre espaço para intuição.",
        dica: "Se a mente disparar, volte para a respiração. Sem julgar.",
        tempo: "5 min",
      },
      externo: {
        titulo: "1 elogio sincero a alguém",
        descricao: "Mande uma mensagem ou diga ao vivo um elogio verdadeiro e específico a alguém.",
        porque: "Elogiar libera ocitocina em quem fala E em quem recebe. Você treina seu olhar para o belo.",
        dica: "Específico vence genérico. Em vez de 'você é incrível', diga o quê e por quê.",
        tempo: "3 min",
      },
      financas: {
        titulo: "Anote cada gasto do dia",
        descricao: "Hoje registre TODO valor que sair, mesmo R$2 do caf\u00e9. Use app, notas ou papel.",
        porque: "Consci\u00eancia financeira come\u00e7a na visibilidade do micro. 70% dos gastos invis\u00edveis acontecem em valores baixos.",
        dica: "Foto do recibo + nota r\u00e1pida no celular. Final do dia: some.",
        tempo: "Dia inteiro",
      },
    },
  },
  {
    dia: 3,
    tema: "Detox de ruído",
    intencao: "Hoje você silencia o que rouba sua energia.",
    tarefas: {
      corpo: {
        titulo: "Pare açúcar refinado por 24h",
        descricao: "Hoje, zero açúcar branco, refrigerante, doce industrializado. Fruta liberada.",
        porque: "Em 24h sem açúcar, picos de insulina caem e o cérebro começa a recuperar sensibilidade dopaminérgica.",
        dica: "Se bater fome de doce, beba água com limão ou coma uma fruta com castanhas.",
        tempo: "Dia inteiro",
      },
      mente: {
        titulo: "Caixa de entrada zero",
        descricao: "Arquive, delete ou responda todos os e-mails pendentes. Deixe a caixa em zero.",
        porque: "Loops abertos consomem energia mental mesmo quando você não está pensando neles.",
        dica: "Use a regra 2 minutos: se responder em até 2 min, responde já. Senão, arquiva ou agenda.",
        tempo: "30 min",
      },
      alma: {
        titulo: "Detox digital de 1 hora",
        descricao: "Escolha 1 hora hoje totalmente offline. Sem celular, TV, computador.",
        porque: "Pausa de tela reset o sistema dopaminérgico e devolve presença real.",
        dica: "Avise quem precisa antes. Deixe o celular em outro cômodo, não só virado para baixo.",
        tempo: "1 hora",
      },
      externo: {
        titulo: "Deixe de seguir 10 contas",
        descricao: "Abra as redes e deixe de seguir 10 contas que te fazem comparar, sentir menos ou consumir mal.",
        porque: "Seu feed é seu inconsciente coletivo. O que você consome vira pensamento automático.",
        dica: "Critério: depois de ver o post, eu me sinto inspirada ou drenada?",
        tempo: "10 min",
      },
      financas: {
        titulo: "Cancele 1 assinatura inativa",
        descricao: "Revise apps, streamings e servi\u00e7os. Cancele 1 que voc\u00ea n\u00e3o usa de verdade.",
        porque: "Vazamentos silenciosos consomem em m\u00e9dia R$150/m\u00eas. Pequenos cortes financiam grandes sonhos.",
        dica: "Procure no extrato dos \u00faltimos 60 dias por cobran\u00e7as recorrentes.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 4,
    tema: "Movimento que liberta",
    intencao: "Hoje você prova que disciplina é prazer disfarçado.",
    tarefas: {
      corpo: {
        titulo: "30 minutos de movimento",
        descricao: "Caminhada, dança, treino, yoga. O que importa é mover por 30 min seguidos.",
        porque: "30 min de movimento liberam BDNF (fertilizante do cérebro) e endorfina por 12h.",
        dica: "Se preguiça vencer, comece com 5 min. Você não para depois.",
        tempo: "30 min",
      },
      mente: {
        titulo: "Pomodoro: 1 tarefa difícil",
        descricao: "Escolha a tarefa que você mais está adiando e execute por 25 min sem interrupção.",
        porque: "Procrastinação alimenta ansiedade. Atacar primeiro o difícil cria energia para o dia inteiro.",
        dica: "Celular no modo avião. Cronômetro à vista. Quando tocar, pode parar.",
        tempo: "25 min",
      },
      alma: {
        titulo: "Playlist da sua versão poderosa",
        descricao: "Monte uma playlist com 7 músicas que te conectam com sua versão mais confiante.",
        porque: "Música atalha estado emocional em segundos. Você cria uma âncora sonora pra acessar quando quiser.",
        dica: "Salve no app de música como 'Versão rainha'. Use antes de reuniões e treinos.",
        tempo: "15 min",
      },
      externo: {
        titulo: "Faça a cama com capricho",
        descricao: "Assim que acordar, arrume a cama com cuidado, como se fosse de hotel.",
        porque: "Primeira vitória do dia ativa neuroquímica de conquista. Você volta para um santuário à noite.",
        dica: "Estique lençóis, alinhe travesseiros, jogue almofadas com intenção.",
        tempo: "3 min",
      },
      financas: {
        titulo: "Defina sua meta financeira dos 21 dias",
        descricao: "Escreva 1 meta concreta: poupar X, quitar Y, faturar Z. Com prazo claro.",
        porque: "Meta vaga vira nada. Meta escrita com prazo aumenta 42% a chance de ser cumprida.",
        dica: "Formato: 'At\u00e9 o dia 21 eu vou ___ no valor de R$___'.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 5,
    tema: "Verdade emocional",
    intencao: "Hoje você nomeia o que sente sem fugir.",
    tarefas: {
      corpo: {
        titulo: "Banho consciente de 5 minutos",
        descricao: "No banho, sinta a água em cada parte do corpo. Sem pensar em mais nada.",
        porque: "Volta para o presente desliga ruminação. Banho consciente reduz cortisol em 20%.",
        dica: "Finalize com 30s de água fria nas pernas. Ativa circulação e clareza mental.",
        tempo: "5 min",
      },
      mente: {
        titulo: "Diário das 3 perguntas",
        descricao: "Escreva: O que estou sentindo? Por quê? Do que eu preciso agora?",
        porque: "Nomear emoção reduz sua intensidade em 50% (estudo UCLA, affect labeling).",
        dica: "Vai além de 'mal' ou 'bem'. Use palavras precisas: frustrada, decepcionada, eufórica.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Chore se precisar (ou ria à toa)",
        descricao: "Permita-se uma emoção plena hoje, sem julgar. Chore, ria, dance.",
        porque: "Emoção não expressa vira tensão no corpo. Liberar limpa o canal energético.",
        dica: "Use música ou um filme que destrava. Está tudo bem sentir tudo.",
        tempo: "10 min",
      },
      externo: {
        titulo: "Diga 'não' a algo hoje",
        descricao: "Negue um pedido, convite ou demanda que não está alinhada com você agora.",
        porque: "Cada 'sim' falso é um 'não' para você mesma. Negar treina seu sistema nervoso.",
        dica: "Não precisa justificar. 'Não vou conseguir, obrigada' basta.",
        tempo: "1 min",
      },
      financas: {
        titulo: "Identifique 1 cren\u00e7a sobre dinheiro",
        descricao: "Complete: 'Dinheiro para mim \u00e9 ___.' Essa frase guia suas decis\u00f5es inconscientes.",
        porque: "Sua rela\u00e7\u00e3o com dinheiro espelha sua rela\u00e7\u00e3o com merecimento e seguran\u00e7a.",
        dica: "Geralmente vem do que voc\u00ea ouviu em casa antes dos 10 anos.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 6,
    tema: "Combustível certo",
    intencao: "Hoje você nutre tudo o que entra em você.",
    tarefas: {
      corpo: {
        titulo: "1 refeição com 30g de proteína",
        descricao: "Inclua pelo menos uma refeição com 30g de proteína (ovo, frango, peixe, tofu, whey).",
        porque: "Proteína mantém saciedade por 4h e preserva massa magra essencial para metabolismo feminino.",
        dica: "Café da manhã proteico = menos vontade de doce à tarde.",
        tempo: "-",
      },
      mente: {
        titulo: "Leia 10 páginas",
        descricao: "Pegue um livro que te eleva (não rede social) e leia 10 páginas sem interrupção.",
        porque: "Leitura cria conexões neuronais novas e baixa estresse em 68% em 6 minutos.",
        dica: "Tenha o livro físico no criado-mudo. Antes de pegar o celular, pega o livro.",
        tempo: "20 min",
      },
      alma: {
        titulo: "Lista de 10 gratidões",
        descricao: "Escreva 10 coisas pelas quais você é grata hoje. Vá além do óbvio.",
        porque: "Gratidão recablea o cérebro para notar o bom. 21 dias de prática cria caminho neural novo.",
        dica: "Detalhe: 'sou grata pelo café quente da manhã' vence 'sou grata pela vida'.",
        tempo: "10 min",
      },
      externo: {
        titulo: "Cozinhe algo do zero",
        descricao: "Prepare uma refeição completa em casa, do zero. Sem entrega, sem pronto.",
        porque: "Cozinhar é meditação ativa. Você decide o que entra no corpo e a quem está alimentando.",
        dica: "Receita simples, ingredientes vivos. Mesa posta, mesmo sozinha.",
        tempo: "45 min",
      },
      financas: {
        titulo: "Cozinhe em casa em vez de pedir",
        descricao: "Substitua 1 refei\u00e7\u00e3o entregue por uma feita por voc\u00ea. Anote o valor economizado.",
        porque: "Pedir delivery 3x/semana custa em m\u00e9dia R$600/m\u00eas. Cozinhar \u00e9 ato de auto-cuidado e economia.",
        dica: "Receita simples, ingredientes da feira. Fa\u00e7a em quantidade pra render.",
        tempo: "45 min",
      },
    },
  },
  {
    dia: 7,
    tema: "Marco da primeira semana",
    intencao: "Hoje você celebra: 7 dias é hábito formado.",
    tarefas: {
      corpo: {
        titulo: "Hora de dormir 1h mais cedo",
        descricao: "Vá para a cama 1 hora antes do seu horário habitual. Tela desligada 30 min antes.",
        porque: "Sono profundo entre 22h-2h é quando 80% do hormônio de regeneração é liberado.",
        dica: "Banho morno + chá de camomila + ambiente escuro. Sem celular ao lado.",
        tempo: "8h",
      },
      mente: {
        titulo: "Revisão dos 7 dias",
        descricao: "Reveja sua jornada da semana: o que ficou mais leve? Onde travou?",
        porque: "Refletir transforma experiência em aprendizado. Sem revisão, você repete o ciclo.",
        dica: "Responda no app: 'Esta semana eu descobri que...'",
        tempo: "15 min",
      },
      alma: {
        titulo: "Ritual de fechamento",
        descricao: "Acenda uma vela, faça uma intenção, agradeça os 7 primeiros dias.",
        porque: "Rituais marcam o cérebro como 'algo importante aconteceu' e criam memória emocional.",
        dica: "Crie seu próprio. Vela + frase + 3 respirações já basta.",
        tempo: "10 min",
      },
      externo: {
        titulo: "Compartilhe sua conquista",
        descricao: "Conte para uma pessoa de confiança que você está nos 21 dias e como está se sentindo.",
        porque: "Contar para alguém aumenta em 65% a chance de continuar. Você se torna pública para si mesma.",
        dica: "Não precisa ser nas redes. Uma amiga, mãe ou parceiro já basta.",
        tempo: "10 min",
      },
      financas: {
        titulo: "Revis\u00e3o financeira da semana",
        descricao: "Some os gastos da semana e categorize: essenciais, sup\u00e9rfluos, vazamentos.",
        porque: "Sem revis\u00e3o, voc\u00ea repete o mesmo padr\u00e3o por anos. Reflex\u00e3o semanal vira controle real.",
        dica: "Use 3 cores: verde (essencial), amarelo (sup\u00e9rfluo), vermelho (vazamento).",
        tempo: "20 min",
      },
    },
  },
  // SEMANA 2, EXPANSÃO
  {
    dia: 8,
    tema: "Vibração mais alta",
    intencao: "Hoje você sobe a frequência em que opera.",
    tarefas: {
      corpo: {
        titulo: "Banho frio de 30 segundos",
        descricao: "No final do banho, gire para frio total e fique 30 segundos.",
        porque: "Frio libera noradrenalina (+530%) e dopamina (+250%) por até 5h. Foco e euforia natural.",
        dica: "Respire fundo enquanto a água gela. Sai do banho com sensação de invencível.",
        tempo: "1 min",
      },
      mente: {
        titulo: "Visualização de 5 minutos",
        descricao: "Feche os olhos e imagine em detalhes você vivendo a vida que quer daqui a 1 ano.",
        porque: "O cérebro não distingue imaginado de vivido. Visualizar prepara a ação inconsciente.",
        dica: "Use os 5 sentidos. O que você veste, sente, ouve, cheira?",
        tempo: "5 min",
      },
      alma: {
        titulo: "Afirmação no espelho (3x)",
        descricao: "Olhe nos seus olhos no espelho e diga 3x: 'Eu sou aquela que escolho ser hoje.'",
        porque: "Auto-contato visual + afirmação verbal grava no inconsciente bem mais forte que pensar.",
        dica: "Sem rir. Olhos firmes. A voz pode tremer no início, é normal.",
        tempo: "3 min",
      },
      externo: {
        titulo: "Vista-se como sua melhor versão",
        descricao: "Mesmo em casa, vista hoje algo que te faça sentir poderosa.",
        porque: "Enclothed cognition: a roupa que você usa muda como você pensa e age.",
        dica: "Brinco, batom, perfume. Detalhe pequeno, impacto grande.",
        tempo: "5 min",
      },
      financas: {
        titulo: "Negocie 1 d\u00edvida ou conta",
        descricao: "Ligue para um credor, plano de sa\u00fade, internet \u2014 pe\u00e7a desconto, prazo melhor ou portabilidade.",
        porque: "Empresas t\u00eam margem de 15-30% para negociar. Quem pede, recebe. Quem cala, paga caro.",
        dica: "Frase: 'Preciso renegociar essa conta. Que condi\u00e7\u00e3o voc\u00eas conseguem para eu continuar cliente?'",
        tempo: "20 min",
      },
    },
  },
  {
    dia: 9,
    tema: "Crença que prende",
    intencao: "Hoje você identifica a frase que te limita.",
    tarefas: {
      corpo: {
        titulo: "5 minutos de prancha (em séries)",
        descricao: "Faça 5 minutos totais de prancha hoje, dividido em quantas séries precisar.",
        porque: "Prancha ativa core completo, melhora postura e libera tensão emocional acumulada no diafragma.",
        dica: "30s x 10 vezes ao longo do dia funciona. Conte respiração, não tempo.",
        tempo: "5 min",
      },
      mente: {
        titulo: "Identifique 1 crença limitante",
        descricao: "Complete: 'Eu não consigo ___ porque ___.' Essa frase é sua crença atual.",
        porque: "Crença inconsciente vira realidade. Trazê-la para a luz é o primeiro passo para reescrever.",
        dica: "Geralmente vem da infância ou de uma figura de autoridade. Procure a voz original.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Reescreva a crença",
        descricao: "Pegue a crença de hoje e escreva 3 versões opostas verdadeiras para você.",
        porque: "O cérebro precisa de evidência. Frases novas só funcionam se você acreditar minimamente.",
        dica: "Em vez de 'eu sou rica', use 'eu sou capaz de aprender a gerar mais'.",
        tempo: "10 min",
      },
      externo: {
        titulo: "Ouça alguém sem interromper",
        descricao: "Em uma conversa hoje, ouça sem cortar, dar conselho ou planejar resposta.",
        porque: "Presença plena é o presente raro que constrói confiança real em qualquer relação.",
        dica: "Olhe nos olhos. Repita o que ouviu antes de responder.",
        tempo: "-",
      },
      financas: {
        titulo: "Liste 5 fontes de renda poss\u00edveis",
        descricao: "Escreva 5 formas diferentes que voc\u00ea poderia gerar dinheiro com o que j\u00e1 sabe.",
        porque: "Mentalidade de renda \u00fanica gera medo. Mentalidade de m\u00faltiplas fontes gera coragem.",
        dica: "Vale freela, aula, venda de algo parado em casa, consultoria, conte\u00fado.",
        tempo: "15 min",
      },
    },
  },
  {
    dia: 10,
    tema: "Espelho da abundância",
    intencao: "Hoje você organiza sua relação com o dinheiro.",
    tarefas: {
      corpo: {
        titulo: "Caminhada de 20 min ao ar livre",
        descricao: "Caminhe 20 minutos em contato com a natureza (parque, rua arborizada, praia).",
        porque: "Verde reduz frequência cardíaca, aumenta criatividade em 50% e regula ritmo circadiano.",
        dica: "Sem fone. Ouça sons reais. Olhe para o céu pelo menos 3 vezes.",
        tempo: "20 min",
      },
      mente: {
        titulo: "Diagnóstico financeiro express",
        descricao: "Abra seu app do banco. Anote: saldo, dívidas, próximas entradas e saídas.",
        porque: "Você não controla o que não vê. Encarar o número real desativa pânico imaginado.",
        dica: "Sem julgamento. Você está aqui para mudar, não para se castigar.",
        tempo: "20 min",
      },
      alma: {
        titulo: "3 afirmações de prosperidade",
        descricao: "Escreva 3 frases sobre dinheiro como mereceria escrever. Releia em voz alta.",
        porque: "Sua relação com dinheiro espelha sua relação com merecimento.",
        dica: "Exemplo: 'Dinheiro chega até mim de formas esperadas e inesperadas'.",
        tempo: "5 min",
      },
      externo: {
        titulo: "Cancele 1 assinatura desnecessária",
        descricao: "Revise assinaturas e cancele 1 que você não usa ou não traz valor real.",
        porque: "Vazamento financeiro silencioso. Pequenos cortes liberam centenas no fim do ano.",
        dica: "Streaming, app, academia que você não vai. Sem culpa.",
        tempo: "10 min",
      },
      financas: {
        titulo: "Diagn\u00f3stico financeiro express",
        descricao: "Calcule: quanto voc\u00ea precisa por m\u00eas para viver com dignidade? Quanto entra hoje? Qual o gap?",
        porque: "Quem n\u00e3o sabe o n\u00famero-base vive sempre na escassez emocional, mesmo ganhando bem.",
        dica: "Inclua tudo: moradia, comida, transporte, lazer m\u00ednimo, reserva.",
        tempo: "20 min",
      },
    },
  },
  {
    dia: 11,
    tema: "Pedido claro",
    intencao: "Hoje você pratica pedir o que quer.",
    tarefas: {
      corpo: {
        titulo: "Pule a corda (ou polichinelos) por 3 min",
        descricao: "Faça 3 minutos de pular corda ou polichinelos em casa.",
        porque: "Movimento curto e intenso libera mais BDNF que treino longo moderado.",
        dica: "Sem corda? Polichinelos funcionam igual. Conte tempo, não repetições.",
        tempo: "3 min",
      },
      mente: {
        titulo: "Escreva o que você quer (de verdade)",
        descricao: "Liste 7 coisas que você quer nos próximos 12 meses. Sem filtro de viabilidade.",
        porque: "Maioria não conquista por nunca ter formulado o pedido com clareza.",
        dica: "Escreva no presente: 'Eu tenho ___', não 'eu quero ___'.",
        tempo: "15 min",
      },
      alma: {
        titulo: "Reze, peça, manifeste",
        descricao: "Em silêncio, peça à sua espiritualidade (Deus, universo, intuição) o que mais quer.",
        porque: "O ato de pedir alinha o subconsciente. Você passa a notar oportunidades invisíveis antes.",
        dica: "Peça em voz alta, baixinho, ou só pensando. Pedido sentido vence pedido perfeito.",
        tempo: "5 min",
      },
      externo: {
        titulo: "Faça 1 pedido difícil hoje",
        descricao: "Peça desconto, peça ajuda, peça aumento, peça atenção. Algo que você costuma evitar.",
        porque: "'Não' você já tem. Pedir treina o músculo do merecimento.",
        dica: "Mensagem ou ao vivo. Mesmo um pedido pequeno conta.",
        tempo: "5 min",
      },
      financas: {
        titulo: "Pe\u00e7a aumento, desconto ou or\u00e7amento melhor",
        descricao: "Fa\u00e7a 1 pedido financeiro hoje que voc\u00ea costuma evitar.",
        porque: "'N\u00e3o' voc\u00ea j\u00e1 tem. Pedir treina o m\u00fasculo do merecimento financeiro.",
        dica: "Mensagem curta, valor claro, sem desculpa longa.",
        tempo: "5 min",
      },
    },
  },
  {
    dia: 12,
    tema: "Limites como amor",
    intencao: "Hoje você protege sua energia.",
    tarefas: {
      corpo: {
        titulo: "Auto-massagem de 10 min",
        descricao: "Com creme ou óleo, massageie pernas, braços, pescoço e pés.",
        porque: "Toque próprio libera ocitocina e regula nervo vago tanto quanto receber massagem.",
        dica: "Movimentos sempre em direção ao coração. Pés com pressão firme.",
        tempo: "10 min",
      },
      mente: {
        titulo: "Identifique 1 limite ausente",
        descricao: "Onde na sua vida você sabe que precisa colocar um limite mas evita?",
        porque: "Falta de limite é cansaço crônico. Identificar é metade da cura.",
        dica: "Pode ser trabalho, família, parceiro, redes. Escolha 1 só.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Mantra do limite",
        descricao: "Crie 1 frase curta que defenda esse limite. Repita 5x antes de dormir.",
        porque: "Frase pronta evita que você gele na hora. Você fica preparada para o momento real.",
        dica: "'Eu não estou disponível pra isso.' simples e firme.",
        tempo: "3 min",
      },
      externo: {
        titulo: "Estabeleça o limite na prática",
        descricao: "Comunique o limite a quem precisa hoje, com firmeza e sem rodeios.",
        porque: "Limite não comunicado não existe. Só vira raiva interna.",
        dica: "Frase curta, sem justificativa longa. 'A partir de hoje, eu...'",
        tempo: "5 min",
      },
      financas: {
        titulo: "Defina seu limite de gasto n\u00e3o-essencial",
        descricao: "Estabele\u00e7a quanto pode gastar por semana em n\u00e3o-essenciais. Acima disso = n\u00e3o.",
        porque: "Limite financeiro pr\u00e9-decidido elimina culpa e impulsividade nas compras pequenas.",
        dica: "Valor realista. Anote no celular e cheque antes de comprar.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 13,
    tema: "Criação livre",
    intencao: "Hoje você cria sem cobrar perfeição.",
    tarefas: {
      corpo: {
        titulo: "Dance 1 música inteira",
        descricao: "Coloque uma música que ama e dance do início ao fim, sem espelho.",
        porque: "Dança livre libera trauma armazenado no quadril e recoloca o feminino em movimento.",
        dica: "Sozinha, em casa. Olhos fechados. Deixe o corpo guiar.",
        tempo: "4 min",
      },
      mente: {
        titulo: "Brainstorm de 10 ideias",
        descricao: "Sobre um tema que você quer evoluir, escreva 10 ideias rápidas. Boas ou ruins.",
        porque: "Quantidade gera qualidade. A 10ª ideia é onde mora a originalidade.",
        dica: "Cronômetro de 5 min. Vale ideia maluca. Depois você filtra.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Crie algo com as mãos",
        descricao: "Desenhe, escreva poema, cozinhe receita inventada. Qualquer coisa fora da rotina.",
        porque: "Criar com as mãos ativa hemisfério direito e cura o crítico interno.",
        dica: "Resultado feio é parte. Quem está olhando é só você.",
        tempo: "20 min",
      },
      externo: {
        titulo: "Compartilhe algo seu",
        descricao: "Mostre o que você criou, fez ou pensou para alguém. Sem desculpa.",
        porque: "Visibilidade é o oposto do bloqueio criativo. Mesmo 1 pessoa vendo já conta.",
        dica: "Não precisa nas redes. Mande para uma amiga.",
        tempo: "5 min",
      },
      financas: {
        titulo: "Venda algo parado em casa",
        descricao: "Liste algo que voc\u00ea n\u00e3o usa h\u00e1 6 meses no Enjoei, OLX ou grupo de WhatsApp.",
        porque: "Dinheiro parado em objeto vira energia parada. Vender solta espa\u00e7o e renda.",
        dica: "Foto boa, descri\u00e7\u00e3o honesta, pre\u00e7o 30% abaixo do novo.",
        tempo: "20 min",
      },
    },
  },
  {
    dia: 14,
    tema: "Marco da segunda semana",
    intencao: "Hoje você sente: já é outra mulher.",
    tarefas: {
      corpo: {
        titulo: "Foto de checkpoint",
        descricao: "Tire uma nova foto nas mesmas condições do Dia 1 e compare.",
        porque: "Você muda mais rápido do que percebe. Comparação visual desbloqueia continuidade.",
        dica: "Compare sem julgar. Olhe brilho dos olhos, postura, não só forma.",
        tempo: "5 min",
      },
      mente: {
        titulo: "O que aprendi sobre mim",
        descricao: "Liste 5 descobertas sobre você nesses 14 dias.",
        porque: "Auto-conhecimento explicitado vira identidade nova. Sem isso, você esquece.",
        dica: "Começo: 'Em 14 dias, descobri que eu...'",
        tempo: "10 min",
      },
      alma: {
        titulo: "Carta de gratidão a você mesma",
        descricao: "Escreva agradecendo à você do dia 1 por ter começado.",
        porque: "Reconhecimento próprio constrói amor próprio sustentável.",
        dica: "Fale com você como falaria com uma amiga querida.",
        tempo: "10 min",
      },
      externo: {
        titulo: "Convide alguém para uma jornada",
        descricao: "Inspire 1 mulher a também começar uma transformação (de 21 dias ou qualquer outra).",
        porque: "Ensinar/inspirar fixa o aprendizado em você mesma em outro nível.",
        dica: "Não pregue. Conte sua experiência real e como você está se sentindo.",
        tempo: "10 min",
      },
      financas: {
        titulo: "Revis\u00e3o da segunda semana financeira",
        descricao: "Compare seus gastos da semana 1 e 2. O que mudou? Onde ainda h\u00e1 vazamento?",
        porque: "Compara\u00e7\u00e3o semanal mostra padr\u00e3o real. Sem isso, voc\u00ea acha que est\u00e1 bem quando n\u00e3o est\u00e1.",
        dica: "Anote 1 vit\u00f3ria e 1 ponto de aten\u00e7\u00e3o.",
        tempo: "15 min",
      },
    },
  },
  // SEMANA 3, ENRAIZAMENTO
  {
    dia: 15,
    tema: "Identidade nova",
    intencao: "Hoje você declara quem você é agora.",
    tarefas: {
      corpo: {
        titulo: "Treino de força (20 min)",
        descricao: "Faça 20 minutos de musculação ou treino com peso (incluindo o do corpo).",
        porque: "Força física constrói massa muscular = metabolismo + longevidade + autoestima.",
        dica: "3 exercícios: agachamento, flexão (joelhos) e remada com garrafa. 3 séries.",
        tempo: "20 min",
      },
      mente: {
        titulo: "Defina sua nova identidade em 1 frase",
        descricao: "Complete: 'Eu sou uma mulher que ___.' Essa é sua identidade agora.",
        porque: "Identidade direciona hábito muito mais que disciplina. Quem você é faz o que faz.",
        dica: "Frase curta, presente, verdadeira para você HOJE (não no futuro).",
        tempo: "10 min",
      },
      alma: {
        titulo: "Visualize o impacto que você quer ter",
        descricao: "Feche os olhos e visualize a pegada que você quer deixar no mundo.",
        porque: "Propósito ancora a transformação. Sem ele, você volta ao velho na primeira tempestade.",
        dica: "Pense nas pessoas que serão tocadas pelo que você fizer.",
        tempo: "5 min",
      },
      externo: {
        titulo: "Aja como ela 1 vez hoje",
        descricao: "Faça 1 escolha do dia COMO a mulher que você acabou de descrever faria.",
        porque: "Identidade só vira realidade através de evidência. Cada ação alinhada é prova.",
        dica: "Pode ser uma resposta, uma compra, um pedido. Pequeno conta.",
        tempo: "-",
      },
      financas: {
        titulo: "Abra ou organize sua reserva de emerg\u00eancia",
        descricao: "Se ainda n\u00e3o tem, abra uma conta separada hoje. Se j\u00e1 tem, deposite qualquer valor (at\u00e9 R$10).",
        porque: "Reserva \u00e9 liberdade emocional. Mulher com reserva diz 'n\u00e3o' com mais firmeza.",
        dica: "Tesouro Selic, CDB liquidez di\u00e1ria ou conta digital com rendimento.",
        tempo: "15 min",
      },
    },
  },
  {
    dia: 16,
    tema: "Rotina sagrada",
    intencao: "Hoje você desenha a rotina que sustenta sua nova versão.",
    tarefas: {
      corpo: {
        titulo: "Acorde 30 min mais cedo",
        descricao: "Programe o despertador para 30 min antes do habitual. Sem snooze.",
        porque: "Esses 30 min são seus. Antes da rotina te capturar, você se captura.",
        dica: "Pé no chão na 1ª vez que o alarme tocar. Levantar é decisão, não vontade.",
        tempo: "30 min",
      },
      mente: {
        titulo: "Defina os 3 ritos da manhã",
        descricao: "Escolha 3 práticas que farão TODA manhã da sua nova rotina.",
        porque: "Manhã pré-decidida elimina decisão na hora cansada e protege a meta principal.",
        dica: "Exemplos: água + meditação + 1 página de leitura. Simples e repetível.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Crie um ritual matinal",
        descricao: "Execute pela 1ª vez os 3 ritos que você acabou de definir.",
        porque: "Ritual é hábito com sentido. Sentido sustenta nos dias difíceis.",
        dica: "Faça hoje exatamente como faria amanhã, sem perfeicionismo.",
        tempo: "20 min",
      },
      externo: {
        titulo: "Prepare o ambiente para amanhã",
        descricao: "Deixe roupa, água e qualquer item dos 3 ritos prontos para a manhã.",
        porque: "Ambiente preparado vence força de vontade. Você cria estrutura para a versão de amanhã.",
        dica: "Garrafa cheia, tênis ao lado da cama, livro aberto na mesa.",
        tempo: "5 min",
      },
      financas: {
        titulo: "Defina rotina financeira semanal",
        descricao: "Marque na agenda 1 momento fixo por semana para revisar finan\u00e7as (30 min).",
        porque: "Sem rotina, voc\u00ea s\u00f3 olha quando a conta aperta. Rotina constr\u00f3i paz financeira.",
        dica: "Domingo de manh\u00e3 com caf\u00e9 funciona pra maioria. Escolha o seu.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 17,
    tema: "Auto-confiança em ação",
    intencao: "Hoje você arrisca o que antes evitava.",
    tarefas: {
      corpo: {
        titulo: "Postura de poder por 2 min",
        descricao: "Em pé, ombros para trás, mãos na cintura, queixo erguido. 2 minutos.",
        porque: "Postura de poder por 2 min aumenta testosterona em 20% e reduz cortisol em 25%.",
        dica: "Faça antes de algo desafiador. Aumenta confiança real, mensurada.",
        tempo: "2 min",
      },
      mente: {
        titulo: "Liste 10 vitórias da sua vida",
        descricao: "Escreva 10 coisas que você já conquistou e que tinha medo de não conseguir.",
        porque: "Cérebro esquece vitórias e amplifica fracassos. Lista escrita devolve a verdade.",
        dica: "Volte na infância, escola, trabalho, vida pessoal.",
        tempo: "15 min",
      },
      alma: {
        titulo: "Faça algo que sua versão antiga não faria",
        descricao: "Quebre 1 padrão antigo hoje. Algo que pareceria 'fora de você'.",
        porque: "Identidade nova precisa de evidência ousada. Repetir sempre o mesmo te mantém igual.",
        dica: "Pode ser jantar sozinha, falar em público, vestir cor diferente.",
        tempo: "-",
      },
      externo: {
        titulo: "Inicie 1 conversa nova",
        descricao: "Fale com alguém que você queria ter contato e nunca iniciou.",
        porque: "Networking real começa onde o medo do ridículo termina.",
        dica: "DM honesta, comentário genuíno, ligação direta. Sem agenda escondida.",
        tempo: "10 min",
      },
      financas: {
        titulo: "Fa\u00e7a 1 investimento (mesmo pequeno)",
        descricao: "Aplique qualquer valor (R$10 j\u00e1 vale) em renda fixa, fundo ou a\u00e7\u00f5es.",
        porque: "O primeiro investimento desbloqueia identidade de investidora. Valor importa menos que o ato.",
        dica: "Tesouro Direto a partir de R$30. Foco em fazer, n\u00e3o em acertar valor.",
        tempo: "20 min",
      },
    },
  },
  {
    dia: 18,
    tema: "Beleza como ato sagrado",
    intencao: "Hoje você se cuida como cuida de quem ama.",
    tarefas: {
      corpo: {
        titulo: "Skincare completo + hidratante no corpo",
        descricao: "Faça sua rotina completa de skincare e passe hidratante em todo o corpo.",
        porque: "Tocar a própria pele com presença é uma das formas mais subestimadas de auto-amor.",
        dica: "Sem pressa. Cada produto é um momento de presença.",
        tempo: "20 min",
      },
      mente: {
        titulo: "Olhe-se com olhar de quem te ama",
        descricao: "Por 2 min no espelho, observe-se como quem te ama observaria.",
        porque: "Você passa o dia se olhando com olhar crítico. Mudar o olhar muda a auto-percepção.",
        dica: "Procure beleza específica: o desenho do sorriso, o brilho do olho.",
        tempo: "2 min",
      },
      alma: {
        titulo: "Vista-se para você",
        descricao: "Escolha sua roupa de hoje pensando apenas em como VOCÊ quer se sentir.",
        porque: "Vestir-se para si reverte a programação de existir para ser olhada.",
        dica: "Pergunte: 'Isso me faz sentir EU?' não 'isso me faz parecer bonita?'",
        tempo: "10 min",
      },
      externo: {
        titulo: "Compre algo que celebre você",
        descricao: "Compre algo pequeno (flor, doce favorito, livro) só para celebrar você.",
        porque: "Auto-presente sem culpa reprograma a relação com merecimento.",
        dica: "Valor não importa. Intenção importa. Embrulhe pra você se quiser.",
        tempo: "-",
      },
      financas: {
        titulo: "Invista em voc\u00ea (curso, livro, sess\u00e3o)",
        descricao: "Compre algo que aumenta seu conhecimento ou autoridade.",
        porque: "O melhor investimento de retorno \u00e9 em capacidade pr\u00f3pria. Voc\u00ea nunca perde esse ativo.",
        dica: "Pode ser livro, mentoria curta, curso, terapia. Valor n\u00e3o importa, inten\u00e7\u00e3o importa.",
        tempo: "\u2014",
      },
    },
  },
  {
    dia: 19,
    tema: "Perdão que liberta",
    intencao: "Hoje você solta o peso que não é seu.",
    tarefas: {
      corpo: {
        titulo: "10 min de yoga ou alongamento profundo",
        descricao: "Faça uma sequência de yoga ou alongamento focando em quadril e ombros.",
        porque: "Quadril armazena emoção feminina; ombros, peso de cuidar de tudo. Soltar libera ambos.",
        dica: "Procure 'yoga para quadril' no YouTube. 10 min basta.",
        tempo: "10 min",
      },
      mente: {
        titulo: "Liste 3 pessoas a perdoar (inclusive você)",
        descricao: "Escreva 3 nomes para quem você ainda guarda mágoa. Inclua seu nome se for o caso.",
        porque: "Mágoa não punida adoece quem carrega, não quem causou.",
        dica: "Perdoar não é concordar. É soltar o veneno que você bebe esperando o outro morrer.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Carta de perdão (que não será enviada)",
        descricao: "Escreva uma carta a 1 dessas pessoas dizendo tudo o que precisa dizer.",
        porque: "Expressar sem enviar libera a emoção sem reabrir a ferida do contato.",
        dica: "Queime, rasgue ou guarde depois. O ato de escrever já cura.",
        tempo: "20 min",
      },
      externo: {
        titulo: "Ato simbólico de soltura",
        descricao: "Faça um gesto físico de soltura: jogue um papel no vaso, queime um bilhete, lave as mãos com intenção.",
        porque: "Corpo precisa de gesto para registrar o fim de um ciclo emocional.",
        dica: "Diga em voz alta: 'Está feito. Eu solto.'",
        tempo: "5 min",
      },
      financas: {
        titulo: "Perdoe-se por 1 escolha financeira passada",
        descricao: "Identifique 1 erro financeiro que ainda pesa. Escreva: 'Eu me perdoo por ___.'",
        porque: "Culpa financeira paralisa. Perd\u00e3o liberta para decidir o pr\u00f3ximo passo limpa.",
        dica: "Sem justificar. Sem voltar a viver de novo. Solte para construir agora.",
        tempo: "10 min",
      },
    },
  },
  {
    dia: 20,
    tema: "Promessa de continuidade",
    intencao: "Hoje você desenha como essa transformação continua.",
    tarefas: {
      corpo: {
        titulo: "Sua nova prática mínima diária",
        descricao: "Escolha 1 prática física não-negociável para os próximos 90 dias.",
        porque: "Hábito mantido por 90 dias vira automatismo. Você precisa de 1, não de 10.",
        dica: "Pequeno e diário vence grande e ocasional. 10 min de movimento por dia, por exemplo.",
        tempo: "5 min",
      },
      mente: {
        titulo: "Top 3 aprendizados dos 20 dias",
        descricao: "Resuma sua jornada em 3 aprendizados-chave que ficam para sempre.",
        porque: "Conteúdo não consolidado se perde. 3 lições é o que cérebro humano retém.",
        dica: "Anote em local fixo. Releia no dia 90.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Defina sua próxima missão",
        descricao: "Qual é o próximo nível? Escreva 1 grande objetivo para os 90 dias seguintes.",
        porque: "Sem próxima montanha, você volta para o vale conhecido.",
        dica: "Específico, mensurável, com prazo. Algo que te incomode levemente.",
        tempo: "15 min",
      },
      externo: {
        titulo: "Conte para alguém o que vem agora",
        descricao: "Compartilhe seus aprendizados e próximo objetivo com alguém de confiança.",
        porque: "Pacto público gera responsabilidade. Você se torna a mulher da sua palavra.",
        dica: "Mensagem, ligação, jantar. Verbalizar grava.",
        tempo: "15 min",
      },
      financas: {
        titulo: "Plano financeiro dos pr\u00f3ximos 90 dias",
        descricao: "Defina 3 metas financeiras claras para os pr\u00f3ximos 90 dias com valor e data.",
        porque: "Sem pr\u00f3ximo plano, voc\u00ea desmonta o avan\u00e7o. Continuidade exige pr\u00f3xima meta vis\u00edvel.",
        dica: "Espec\u00edfico: 'At\u00e9 dd/mm, eu terei R$___ poupados e R$___ a menos em d\u00edvida'.",
        tempo: "20 min",
      },
    },
  },
  {
    dia: 21,
    tema: "Renascimento",
    intencao: "Hoje você se reconhece. A jornada virou identidade.",
    tarefas: {
      corpo: {
        titulo: "Foto final + medidas + sensações",
        descricao: "Foto final nas mesmas condições, com medidas e como o corpo se sente agora.",
        porque: "Marco visual fecha o ciclo e prepara o cérebro para o próximo nível.",
        dica: "Compare lado a lado com a foto do dia 1. Veja o que mudou além do físico.",
        tempo: "10 min",
      },
      mente: {
        titulo: "Releia sua carta do dia 1",
        descricao: "Releia a carta que você escreveu no dia 1 para a você de hoje.",
        porque: "Provar para você mesma que você cumpriu a promessa é o presente mais poderoso.",
        dica: "Leia em voz alta. Sinta o trajeto.",
        tempo: "10 min",
      },
      alma: {
        titulo: "Ritual de celebração",
        descricao: "Crie um ritual seu de fechamento: vela, dança, oração, banho cerimonial. O que pedir o coração.",
        porque: "Celebrar é gravar no inconsciente que você é capaz. Sem celebração, você desvaloriza a jornada.",
        dica: "Sozinha ou com quem amar. Faça com a seriedade de um casamento com você mesma.",
        tempo: "30 min",
      },
      externo: {
        titulo: "Inspire outra rainha",
        descricao: "Conte sua jornada completa para outra mulher. Inspire-a a também começar.",
        porque: "Quem vive transformação real e não compartilha, perde 50% do impacto que poderia ter.",
        dica: "Pode ser publicamente nas redes ou em privado. O que importa é honrar a história.",
        tempo: "15 min",
      },
      financas: {
        titulo: "Celebre + decida a pr\u00f3xima meta financeira",
        descricao: "Some quanto economizou, ganhou ou organizou nos 21 dias. Defina a pr\u00f3xima meta de 90 dias.",
        porque: "Celebrar conquista financeira reprograma a identidade de mulher pr\u00f3spera.",
        dica: "Pode ser pequeno. R$50 economizado j\u00e1 \u00e9 prova de que voc\u00ea sabe gerir.",
        tempo: "15 min",
      },
    },
  },
];

export const getDay = (n: number) => DAYS.find((d) => d.dia === n);
