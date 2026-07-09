import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Brain, Heart, Eye, Sparkles, Trophy, Flame, CheckCircle2,
  Circle, Target, History, BookOpen, Zap, Award, Mic, MessageCircle, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import MentePoderosaChat from "@/components/MentePoderosaChat";

// ───────────────────────── Storage Keys ─────────────────────────
const PROGRESS_KEY = "mente-poderosa:progress:v1";
const HISTORY_KEY = "mente-poderosa:history:v1";

// ───────────────────────── Modules (Trilhas) ─────────────────────────
type Task = { id: string; title: string; desc: string; xp: number };
type ModuleDef = {
  id: string;
  title: string;
  area: "IE" | "PSI" | "NEURO" | "MKT" | "COM" | "PER" | "CRI";
  icon: typeof Brain;
  tagline: string;
  tasks: Task[];
};

const MODULES: ModuleDef[] = [
  {
    id: "ie-fundamentos",
    title: "Inteligência Emocional — Os 5 Pilares de Goleman",
    area: "IE",
    icon: Heart,
    tagline: "Autoconsciência → Autorregulação → Motivação → Empatia → Habilidade Social",
    tasks: [
      {
        id: "ie1",
        title: "Nomeie 3 emoções do seu dia (2 min)",
        desc: "O que é: dar nome exato ao que você sente. Por quê: a neurocientista Lisa Feldman Barrett mostrou que quanto mais preciso o nome, menos a amígdala dispara — você sai do 'tô mal' e volta ao controle. Como fazer agora: pegue o celular, abra as Notas e escreva 3 frases curtas no formato 'Senti ___ quando ___'. Evite palavras genéricas (mal, estranha); use frustrada, ressentida, ansiosa, orgulhosa, aliviada. Para empreendedora com tempo curto: faça no banho ou no Uber.",
        xp: 20,
      },
      {
        id: "ie2",
        title: "Pausa de 6 segundos antes de reagir (1 min na hora)",
        desc: "O que é: criar um intervalo entre o estímulo (e-mail que te irritou, comentário do cliente, fala do parceiro) e a sua resposta. Por quê: 6 segundos é o tempo médio que o córtex pré-frontal leva para 'desligar' o piloto automático da amígdala. Como fazer: ao sentir o gatilho, feche a boca, inspire pelo nariz contando até 3, expire pela boca contando até 3. Só depois fale, responda ou clique em enviar. Dica empreendedora: deixe esse hábito atrelado ao gesto de 'tirar a mão do teclado'.",
        xp: 25,
      },
      {
        id: "ie3",
        title: "Carta de empatia para alguém que te irritou (5 min)",
        desc: "O que é: um exercício escrito que treina ver o mundo pelos olhos do outro (empatia cognitiva — Hojat). Por quê: reduz ruminação mental e devolve seu poder de decisão. Como fazer: escreva 1 parágrafo curto listando 3 motivos plausíveis pelos quais a pessoa agiu assim (cansaço, medo, história pessoal). Você NÃO precisa enviar. O ganho é interno: você para de gastar energia com a cena. Iniciante: comece pelo episódio mais leve da semana.",
        xp: 30,
      },
      {
        id: "ie4",
        title: "Mapeie seu gatilho-mestre (3 min)",
        desc: "O que é: identificar a situação que repetidamente tira você do eixo (ser interrompida, crítica pública, atraso, silêncio). Por quê: o que está consciente, você controla; o que está inconsciente, te controla. Como fazer: escreva nas Notas em 4 linhas — Gatilho: ___ / Emoção: ___ / Pensamento automático: ___ / O que costumo fazer: ___. Empreendedora: revise essa nota antes de reuniões difíceis.",
        xp: 25,
      },
      {
        id: "ie5",
        title: "Respiração 4-7-8 antes de decidir (2 min)",
        desc: "O que é: técnica de respiração do Dr. Andrew Weil que ativa o nervo vago e desliga o modo 'luta ou fuga'. Por quê: decisão tomada em ansiedade quase sempre é decisão ruim. Como fazer: inspire pelo nariz contando 4 → segure o ar contando 7 → expire bem devagar pela boca contando 8. Repita 4 vezes. Use antes de: responder cliente difícil, enviar proposta, ter conversa séria.",
        xp: 20,
      },
    ],
  },
  {
    id: "psi-sombra",
    title: "Psicologia Humana — Sombra, Apego & Arquétipos",
    area: "PSI",
    icon: Eye,
    tagline: "Jung, Bowlby e o que sua mente esconde de você mesma",
    tasks: [
      {
        id: "psi1",
        title: "Mapeie sua sombra — método Jung (5 min)",
        desc: "O que é 'sombra': tudo que existe em você mas você reprime porque julgou 'feio' (raiva, ambição, vaidade, vulnerabilidade). Por quê: o que você esconde de si, você projeta nos outros e fica refém. Como fazer: liste 3 traços que mais te incomodam em outras mulheres (ex: 'ela é interesseira', 'ela é exibida'). Depois pergunte: onde, em pequena dose, isso também existe em mim? Iniciante: não julgue a resposta, só observe. É libertador.",
        xp: 30,
      },
      {
        id: "psi2",
        title: "Descubra seu estilo de apego (4 min)",
        desc: "O que é: padrão de como você se vincula (teoria de Bowlby e Ainsworth). Os 4 estilos: Seguro (confia e dá espaço), Ansioso (precisa de confirmação constante), Evitativo (foge da intimidade), Desorganizado (oscila entre os dois). Por quê: explica 80% dos seus conflitos amorosos e profissionais. Como fazer: pense na última vez que alguém demorou para responder uma mensagem importante. O que você sentiu e fez? Anote — esse é seu padrão dominante.",
        xp: 25,
      },
      {
        id: "psi3",
        title: "Escolha o arquétipo feminino do seu dia (3 min)",
        desc: "O que é: arquétipos (Jung + Jean Bolen) são energias internas — Donzela (leveza), Mãe (cuidado), Sábia (estratégia), Guerreira (ação), Sedutora (presença magnética), Mística (intuição). Por quê: em vez de reagir no automático, você ESCOLHE qual energia ativar para a situação do dia. Como fazer: olhe sua agenda, escolha 1 arquétipo que serve melhor ao compromisso mais importante e aja a partir dele. Empreendedora: Guerreira para vendas, Sábia para negociação, Sedutora para pitch.",
        xp: 25,
      },
      {
        id: "psi4",
        title: "Identifique suas 3 distorções cognitivas (5 min)",
        desc: "O que é: 'óculos tortos' que o cérebro usa sem você perceber (TCC — Aaron Beck). As principais: Catastrofização ('vai dar tudo errado'), Leitura de mente ('ela me odeia'), Tudo-ou-nada ('ou sou perfeita ou sou fracassada'), Personalização ('é culpa minha'), Filtro mental (só vê o ruim). Como fazer: relembre 3 pensamentos negativos da semana e classifique cada um. Só nomear já tira metade da força.",
        xp: 30,
      },
      {
        id: "psi5",
        title: "Reescreva 1 pensamento negativo — modelo ABC (4 min)",
        desc: "O que é: modelo ABC do psicólogo Albert Ellis. A = situação, B = crença/pensamento, C = consequência emocional. O segredo: trocar o B muda o C. Como fazer: escolha 1 pensamento que te machuca ('não sou boa o suficiente'). Escreva 3 versões mais realistas e funcionais ('estou aprendendo', 'já entreguei X e Y', 'o que falta posso pedir ajuda'). Releia em voz alta. Iniciante: faça uma vez por dia durante 1 semana.",
        xp: 30,
      },
    ],
  },
  {
    id: "neuro-cerebro",
    title: "Neurociência — Cérebro Feminino Sob Controle",
    area: "NEURO",
    icon: Brain,
    tagline: "Amígdala, córtex pré-frontal, dopamina, nervo vago",
    tasks: [
      {
        id: "n1",
        title: "Tom vagal: cante ou cantarole 2 minutos",
        desc: "O que é: ativar o nervo vago (o principal regulador da calma) através das cordas vocais. Por quê: pesquisas de Stephen Porges mostram que cantar reduz cortisol em até 23% e desacelera os batimentos. Como fazer: escolha 1 música que você ama e cantarole no banho, no carro ou cozinhando. Não precisa ser afinada — precisa ser sentida. Empreendedora: faça antes da primeira reunião do dia.",
        xp: 20,
      },
      {
        id: "n2",
        title: "Banho frio 30 segundos no final (1 min)",
        desc: "O que é: terminar o banho com 30s de água fria do pescoço para baixo. Por quê: aumenta noradrenalina em até 530% (estudo Šrámek et al.) — efeito 'café natural' por horas, fortalece sistema imune e treina sua mente a tolerar desconforto. Como começar: semana 1, só 10 segundos. Semana 2, 20s. Semana 3, 30s. Iniciante: respire fundo antes; o desconforto passa em segundos.",
        xp: 25,
      },
      {
        id: "n3",
        title: "Caminhada bilateral de 15 minutos",
        desc: "O que é: caminhar em ritmo confortável movimentando braços alternados. Por quê: a estimulação bilateral ativa os dois hemisférios do cérebro — mesmo princípio do EMDR usado em terapia para regular emoções. Como fazer: 15 min sem celular na mão (pode ouvir música instrumental). Use para 'digerir' uma reunião difícil ou destravar uma ideia. Empreendedora: vire ligações de áudio em caminhadas.",
        xp: 25,
      },
      {
        id: "n4",
        title: "Estude 5 min sobre neuroplasticidade",
        desc: "O que é: a capacidade do cérebro de criar novas conexões a vida inteira. Princípio de Hebb: 'neurônios que disparam juntos, se conectam'. Por quê: entender isso destrói a desculpa 'eu sou assim mesmo'. Como fazer: leia o resumo abaixo e anote 1 frase que te marcou. Resumo: todo hábito repetido por 21–66 dias literalmente reorganiza sua massa cinzenta. Você não está presa à sua versão antiga.",
        xp: 30,
      },
      {
        id: "n5",
        title: "Dieta dopaminérgica de 24h (1 dia)",
        desc: "O que é: 24h sem as fontes de prazer barato que viciam o cérebro — redes sociais, açúcar, notificações, séries em maratona. Por quê: a psiquiatra Anna Lembke (Stanford) mostra que isso ressensibiliza os receptores D2 e devolve prazer às coisas simples (um café, uma conversa, um livro). Como fazer: escolha um sábado, avise a família, desative notificações no celular, troque doce por fruta. Iniciante: comece com 12h se 24h parecer demais.",
        xp: 40,
      },
    ],
  },
  {
    id: "mkt-influencia",
    title: "Neuromarketing — Arquitetura de Influência Feminina",
    area: "MKT",
    icon: Sparkles,
    tagline: "Cialdini + Kahneman aplicados à sua presença e narrativa",
    tasks: [
      {
        id: "m1",
        title: "Aplique escassez na sua agenda (3 min)",
        desc: "O que é: princípio de Cialdini — o que é raro é percebido como mais valioso. Por quê: estar 100% disponível desvaloriza seu tempo e sua entrega. Como fazer: na próxima vez que alguém pedir uma reunião, em vez de 'pode ser quando quiser', responda 'tenho uma janela quinta às 16h ou sexta às 10h, qual prefere?'. Você oferece 2 opções fechadas. Empreendedora: aplique também em propostas comerciais com prazo de validade.",
        xp: 25,
      },
      {
        id: "m2",
        title: "Use ancoragem na próxima negociação (2 min de preparo)",
        desc: "O que é: efeito descoberto por Tversky & Kahneman — o primeiro número mencionado 'ancora' toda a negociação. Por quê: quem ancora primeiro define o teto. Como fazer: antes da conversa, defina o valor IDEAL (não o mínimo) e seja você a falar primeiro. Ex: cliente pergunta 'quanto custa?' → você responde com o valor cheio, sem desconto antecipado. Iniciante: treine em voz alta no espelho antes.",
        xp: 30,
      },
      {
        id: "m3",
        title: "Conte 1 história sua hoje (3 min)",
        desc: "O que é: substituir dados/listas por uma narrativa pessoal curta. Por quê: estudos de Jerome Bruner mostram que histórias fixam até 22x mais que fatos isolados — ativam córtex sensorial, emoção e memória. Como fazer: em vez de 'meu serviço é bom', conte: 'semana passada uma cliente chegou assim ___, fizemos ___ e o resultado foi ___'. Use em stories, conversa, pitch. Estrutura: situação → desafio → virada → resultado.",
        xp: 25,
      },
      {
        id: "m4",
        title: "Reciprocidade estratégica com 1 pessoa-chave (5 min)",
        desc: "O que é: outro princípio de Cialdini — quando recebemos algo de valor inesperado, sentimos impulso de retribuir. Por quê: é o gatilho social mais antigo do cérebro humano. Como fazer: escolha 1 pessoa importante para a sua carreira/negócio e ofereça algo útil sem pedir nada em troca (uma indicação, um conteúdo relevante, uma apresentação). Empreendedora: faça isso 1x por semana — em 3 meses sua rede muda.",
        xp: 25,
      },
      {
        id: "m5",
        title: "Atualize sua bio com prova social (5 min)",
        desc: "O que é: princípio da Conformidade (Solomon Asch) — o cérebro confia em quem outros já validaram. Por quê: bio genérica = você é uma entre milhões. Bio com prova social = autoridade percebida. Como fazer: edite sua bio do Instagram/LinkedIn agora incluindo 3 elementos — 1 número (clientes atendidas, anos de mercado), 1 conquista (prêmio, formação, certificação) e 1 nome reconhecido (marca/cliente/mentor). Iniciante: se ainda não tem números, use depoimento curto.",
        xp: 30,
      },
    ],
  },
  {
    id: "com-oratoria",
    title: "Comunicação & Oratória — Voz que Comanda Atenção",
    area: "COM",
    icon: Mic,
    tagline: "Postura, voz, ritmo e presença para falar com autoridade",
    tasks: [
      {
        id: "c1",
        title: "Aquecimento vocal de 90 segundos",
        desc: "O que é: preparar voz, mandíbula e diafragma antes de falar em público, gravar story, fazer pitch ou ligação importante. Por quê: voz aquecida = grave mais profundo, menos 'quebras' e mais autoridade percebida. Como fazer: 30s soltando 'brrr' com os lábios (motorboat) + 30s mastigando o ar exagerando a boca + 30s contando de 1 a 10 alternando volume baixo/alto. Empreendedora: faça no banho ou no carro antes de reuniões.",
        xp: 20,
      },
      {
        id: "c2",
        title: "Regra da pausa: 2 segundos entre frases (treino de 5 min)",
        desc: "O que é: substituir o 'éééé', 'tipo', 'né' por silêncio breve. Por quê: pausa = sinal de quem domina o assunto. Falar rápido = sinal de insegurança. Como fazer: grave 1 minuto seu falando sobre seu trabalho. Reescute marcando cada vício de linguagem. Regrave forçando pausa de 2s onde antes vinha o 'éééé'. Iniciante: comece nas suas próprias mensagens de áudio.",
        xp: 25,
      },
      {
        id: "c3",
        title: "Postura de poder antes de falar (2 min)",
        desc: "O que é: estudo de Amy Cuddy (Harvard) — postura aberta por 2 min antes de uma exposição reduz cortisol em 25% e aumenta testosterona em 20%. Por quê: o corpo ensina o cérebro a se sentir no controle. Como fazer: vá ao banheiro, em pé, mãos na cintura, queixo levemente erguido, ombros para trás. Respire fundo 4 vezes. Saia e fale. Use antes de: reunião, gravação, palestra, conversa difícil.",
        xp: 20,
      },
      {
        id: "c4",
        title: "Estrutura PREP para qualquer resposta (3 min de treino)",
        desc: "O que é: técnica de oratória executiva — Ponto, Razão, Exemplo, Ponto. Por quê: respostas estruturadas soam 10x mais inteligentes que respostas longas e enroladas. Como fazer: pergunta 'o que você acha disso?' → P: 'Acredito que sim.' R: 'Porque os dados mostram X.' E: 'Por exemplo, semana passada vivi Y.' P: 'Por isso, defendo essa direção.' Treine respondendo 1 pergunta por dia no espelho ou no WhatsApp em áudio.",
        xp: 30,
      },
      {
        id: "c5",
        title: "Grave 1 story falando direto para a câmera (5 min)",
        desc: "O que é: exposição controlada ao desconforto de se ouvir e se ver. Por quê: quem não treina a própria imagem trava em momentos decisivos. Como fazer: grave 30s respondendo 'qual o maior aprendizado da minha semana?'. Veja sem julgar. Regrave 1 vez aplicando: olhar fixo na lente, 1 pausa proposital, sorriso no final. Publique ou apague — o ganho é o treino. Iniciante: comece com câmera selfie sem publicar.",
        xp: 25,
      },
    ],
  },
  {
    id: "per-persuasao",
    title: "Comunicação Persuasiva — Palavras que Movem Pessoas",
    area: "PER",
    icon: MessageCircle,
    tagline: "Gatilhos linguísticos, espiral SCQA e o poder da pergunta certa",
    tasks: [
      {
        id: "p1",
        title: "Substitua 'mas' por 'e' por 24 horas",
        desc: "O que é: PNL aplicada — a palavra 'mas' apaga tudo que veio antes ('gostei, mas…' = não gostei). 'E' soma. Por quê: muda a percepção de quem te ouve sem mudar o conteúdo. Como fazer: hoje, em mensagens, e-mails e conversas, monitore cada 'mas' e troque por 'e' ou 'ao mesmo tempo'. Exemplo: 'amei sua proposta, E gostaria de ajustar o prazo'. Iniciante: deixe um post-it com o lembrete na tela.",
        xp: 25,
      },
      {
        id: "p2",
        title: "Use a fórmula SCQA em uma mensagem importante (5 min)",
        desc: "O que é: estrutura de persuasão da consultoria McKinsey — Situação, Complicação, Questão, Resposta. Por quê: prende a atenção em 3 segundos e entrega solução de forma irresistível. Como aplicar: 'Hoje fazemos X (Situação). Só que enfrentamos Y (Complicação). Como resolver isso? (Questão). Proponho Z (Resposta).' Use em pitch, proposta comercial, conversa com sócio. Empreendedora: aplique no próximo e-mail de venda.",
        xp: 30,
      },
      {
        id: "p3",
        title: "Pergunta aberta no lugar de afirmação (3 min)",
        desc: "O que é: método socrático — quem pergunta conduz. Por quê: pessoas resistem a afirmações alheias e aceitam conclusões próprias. Como fazer: em vez de 'você precisa investir nisso', pergunte 'o que aconteceria se você investisse nisso por 3 meses?'. Treine reescrevendo 3 afirmações suas em perguntas abertas começando com Como, O que, Qual, Quando.",
        xp: 25,
      },
      {
        id: "p4",
        title: "Aplique o efeito 'porque' (1 min)",
        desc: "O que é: estudo clássico de Ellen Langer (Harvard) — incluir a palavra 'porque' aumenta em 34% a taxa de aceitação, mesmo quando o motivo é óbvio. Por quê: o cérebro humano associa 'porque' a justificativa válida quase no automático. Como fazer: na próxima solicitação que você fizer hoje, inclua 'porque ___' (mesmo um motivo simples). Ex: 'posso te ligar agora, porque tenho 10 min livres?'.",
        xp: 20,
      },
      {
        id: "p5",
        title: "Espelhamento (mirroring) em 1 conversa hoje",
        desc: "O que é: técnica de Chris Voss (ex-FBI) — repetir as 3 últimas palavras da pessoa com tom de pergunta. Por quê: ativa rapport profundo e faz a outra parte se abrir e dar mais informação. Como fazer: cliente diz 'tá fora do meu orçamento agora'. Você responde: '…fora do seu orçamento agora?'. Espere o silêncio. Ela vai explicar. Use em vendas, negociação salarial, conversas com parceiro.",
        xp: 30,
      },
    ],
  },
  {
    id: "cri-crise",
    title: "Gestão de Crise para Mulheres — Liderar no Caos",
    area: "CRI",
    icon: ShieldAlert,
    tagline: "Plano de 5 minutos para quando tudo desaba (financeiro, profissional, emocional)",
    tasks: [
      {
        id: "k1",
        title: "Protocolo STOP em momento de pânico (1 min)",
        desc: "O que é: técnica usada por bombeiros e profissionais de emergência. S = Stop (pare físico), T = Take a breath (respire fundo 3x), O = Observe (o que está acontecendo, o que sinto), P = Proceed (próximo passo MENOR possível). Por quê: tira do modo reativo e devolve o comando ao córtex pré-frontal em 60 segundos. Como fazer: salve a sigla STOP no papel de parede do celular. Use no próximo aperto.",
        xp: 25,
      },
      {
        id: "k2",
        title: "Mapa da crise em 1 folha (10 min)",
        desc: "O que é: escrever para sair da mente caótica. Por quê: o cérebro só resolve o que consegue VER fora dele. Como fazer: divida 1 folha em 4 quadrados. Q1 'O que aconteceu (fatos sem drama)'. Q2 'O que está sob meu controle'. Q3 'O que NÃO está sob meu controle (eu solto)'. Q4 'Próximas 3 ações de até 1 hora cada'. Empreendedora: revisite essa folha em toda crise — 80% do peso some.",
        xp: 35,
      },
      {
        id: "k3",
        title: "Pré-defina sua 'Comissão de Crise' (5 min)",
        desc: "O que é: lista das 3 pessoas que você liga em pânico — uma para a parte emocional, uma para a estratégica, uma para a prática. Por quê: em crise você não tem clareza para escolher quem ligar. Decida ANTES. Como fazer: salve 3 contatos no celular com tag CRISE: COLO, CRISE: CABEÇA, CRISE: AÇÃO. Avise as 3 pessoas que elas estão nessa lista. Iniciante: se ainda não tem as 3, identifique pelo menos 1 hoje.",
        xp: 25,
      },
      {
        id: "k4",
        title: "Reserva mínima de emergência (15 min de planejamento)",
        desc: "O que é: criar um colchão financeiro de 3 a 6 meses dos seus custos fixos. Por quê: dinheiro guardado compra tempo, e tempo é a matéria-prima das boas decisões em crise. Como fazer: 1) calcule seu custo fixo mensal real. 2) multiplique por 3. 3) abra uma conta SÓ para isso (CDB liquidez diária ou Tesouro Selic). 4) automatize transferência mensal de 5-15% da renda. Iniciante: comece com R$ 100 esta semana. Empreendedora: separe da conta do negócio.",
        xp: 40,
      },
      {
        id: "k5",
        title: "Mensagem-padrão para comunicar uma crise (10 min)",
        desc: "O que é: roteiro pronto para avisar cliente, equipe ou família sobre um problema sem se descontrolar. Por quê: na crise, você não tem energia para 'inventar tom'. Estrutura: 1) Reconheço (o problema), 2) Assumo (responsabilidade pela minha parte), 3) Plano (próximos passos com data), 4) Peço (o que preciso da outra parte). Como fazer: escreva agora 1 versão genérica em um bloco de notas. Quando precisar, é só adaptar. Empreendedora: salve como template no e-mail.",
        xp: 30,
      },
    ],
  },
];

const ALL_TASKS_COUNT = MODULES.reduce((s, m) => s + m.tasks.length, 0);
const TOTAL_XP = MODULES.reduce((s, m) => s + m.tasks.reduce((t, k) => t + k.xp, 0), 0);

// ───────────────────────── Levels ─────────────────────────
const LEVELS = [
  { name: "Despertar", min: 0, color: "text-foreground" },
  { name: "Aprendiz da Mente", min: 100, color: "text-amber-600" },
  { name: "Estrategista Emocional", min: 250, color: "text-amber-600" },
  { name: "Mestra da Influência", min: 450, color: "text-gold" },
  { name: "Soberana da Mente", min: 650, color: "text-amber-600" },
];

function levelFromXp(xp: number) {
  let current = LEVELS[0];
  let next: typeof LEVELS[number] | null = null;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].min) current = LEVELS[i];
    if (LEVELS[i].min > xp) { next = LEVELS[i]; break; }
  }
  return { current, next };
}

// ───────────────────────── State Types ─────────────────────────
type Progress = {
  completed: Record<string, string>; // taskId -> ISO date
  xp: number;
};

type HistoryEntry = {
  id: string;
  taskId: string;
  moduleId: string;
  taskTitle: string;
  date: string;
  note?: string;
  xp: number;
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return { completed: {}, xp: 0 };
    return JSON.parse(raw);
  } catch { return { completed: {}, xp: 0 }; }
}
function saveProgress(p: Progress) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch {}
}
function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(h: HistoryEntry[]) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 200))); } catch {}
}

// ───────────────────────── Page ─────────────────────────
export default function MentePoderosaPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [openModule, setOpenModule] = useState<string | null>(MODULES[0].id);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { saveHistory(history); }, [history]);

  const completedCount = Object.keys(progress.completed).length;
  const overallPct = Math.round((completedCount / ALL_TASKS_COUNT) * 100);
  const { current: level, next: nextLevel } = useMemo(() => levelFromXp(progress.xp), [progress.xp]);
  const nextLevelPct = nextLevel
    ? Math.min(100, Math.round(((progress.xp - level.min) / (nextLevel.min - level.min)) * 100))
    : 100;

  const toggleTask = (mod: ModuleDef, task: Task) => {
    const isDone = !!progress.completed[task.id];
    if (isDone) {
      const { [task.id]: _, ...rest } = progress.completed;
      setProgress({ completed: rest, xp: Math.max(0, progress.xp - task.xp) });
      toast("Tarefa desmarcada.");
    } else {
      setProgress({
        completed: { ...progress.completed, [task.id]: new Date().toISOString() },
        xp: progress.xp + task.xp,
      });
      const entry: HistoryEntry = {
        id: `${task.id}-${Date.now()}`,
        taskId: task.id,
        moduleId: mod.id,
        taskTitle: task.title,
        date: new Date().toISOString(),
        xp: task.xp,
      };
      setHistory([entry, ...history]);
      toast.success(`+${task.xp} XP — ${task.title}`, { icon: "👑" });

      // Level up check
      const before = levelFromXp(progress.xp).current.name;
      const after = levelFromXp(progress.xp + task.xp).current.name;
      if (before !== after) {
        setTimeout(() => toast.success(`✨ Subiu de nível: ${after}!`, { duration: 4000 }), 400);
      }
    }
  };

  const saveNote = (entryId: string) => {
    setHistory(history.map(h => h.id === entryId ? { ...h, note: noteText.trim() } : h));
    setNoteFor(null); setNoteText("");
    toast.success("Nota salva.");
  };

  const resetAll = () => {
    if (!confirm("Apagar todo o progresso e histórico de Mente Infalível?")) return;
    setProgress({ completed: {}, xp: 0 });
    setHistory([]);
    try {
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    toast.success("Tudo zerado. Recomece quando quiser, rainha.");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-xl border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-gold">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-base font-display font-bold text-foreground flex items-center gap-2">
              <Brain className="h-4 w-4 text-gold" /> Mente Infalível
            </h1>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold/70">
              IE · Psicologia · Neurociência · Neuromarketing
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Intro */}
        <section className="rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-background to-amber-50 p-5">
          <p className="text-xs tracking-[0.25em] uppercase text-gold/70 font-semibold mb-2">Bom dia, rainha</p>
          <h2 className="font-display text-xl text-foreground mb-2">Treine sua mente. Conquiste o que quer.</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            4 trilhas para você controlar emoções, entender pessoas, focar de verdade e influenciar com elegância. Tarefas curtas todo dia, pontos por cada conclusão e uma IA expert te guiando.
          </p>
        </section>

        {/* Stats: Level + XP + Progress */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-gold/30 bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Award className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">Nível</p>
            </div>
            <p className={`font-display text-lg ${level.color}`}>{level.name}</p>
            {nextLevel ? (
              <>
                <Progress value={nextLevelPct} className="h-1.5 mt-2" />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {nextLevel.min - progress.xp} XP para {nextLevel.name}
                </p>
              </>
            ) : (
              <p className="text-[10px] text-gold mt-2">Nível máximo atingido 👑</p>
            )}
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">XP Total</p>
            </div>
            <p className="font-display text-2xl text-foreground">{progress.xp}<span className="text-sm text-muted-foreground"> / {TOTAL_XP}</span></p>
            <p className="text-[10px] text-muted-foreground mt-1">Pontos de experiência conquistados</p>
          </div>
          <div className="rounded-2xl border border-gold/30 bg-gradient-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-gold" />
              <p className="text-[10px] uppercase tracking-wider text-gold/80 font-semibold">Tarefas</p>
            </div>
            <p className="font-display text-2xl text-foreground">{completedCount}<span className="text-sm text-muted-foreground"> / {ALL_TASKS_COUNT}</span></p>
            <Progress value={overallPct} className="h-1.5 mt-2" />
            <p className="text-[10px] text-muted-foreground mt-1">{overallPct}% do programa</p>
          </div>
        </section>

        {/* AI Chat */}
        <MentePoderosaChat />

        {/* Modules */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Trilhas</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          {MODULES.map((mod) => {
            const Icon = mod.icon;
            const modDone = mod.tasks.filter(t => progress.completed[t.id]).length;
            const modPct = Math.round((modDone / mod.tasks.length) * 100);
            const isOpen = openModule === mod.id;
            return (
              <div key={mod.id} className="rounded-2xl border border-gold/20 bg-gradient-card overflow-hidden">
                <button
                  onClick={() => setOpenModule(isOpen ? null : mod.id)}
                  className="w-full p-4 flex items-center gap-3 text-left hover:bg-gold/5 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-bold text-foreground">{mod.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{mod.tagline}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={modPct} className="h-1 flex-1" />
                      <span className="text-[10px] text-gold/80 font-mono">{modDone}/{mod.tasks.length}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gold/15 p-3 space-y-2 bg-card/80">
                    {mod.tasks.map((task) => {
                      const done = !!progress.completed[task.id];
                      return (
                        <div
                          key={task.id}
                          className={`rounded-xl border p-3 transition-all ${
                            done ? "border-gold/40 bg-gold/5" : "border-gold/15 bg-card"
                          }`}
                        >
                          <button
                            onClick={() => toggleTask(mod, task)}
                            className="w-full flex items-start gap-3 text-left"
                          >
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 text-gold mt-0.5 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${done ? "text-gold line-through" : "text-foreground"}`}>
                                {task.title}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{task.desc}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Zap className="h-3 w-3 text-gold" />
                                <span className="text-[10px] text-gold font-mono">+{task.xp} XP</span>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* History */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-gold" />
            <h3 className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80 font-semibold">Histórico</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gold/20 to-transparent" />
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground italic px-2">
              Seu histórico aparecerá aqui conforme você completa tarefas.
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 20).map((h) => (
                <div key={h.id} className="rounded-xl border border-gold/15 bg-gradient-card p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm text-foreground font-medium">{h.taskTitle}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(h.date).toLocaleString("pt-BR")} · +{h.xp} XP
                      </p>
                      {h.note && (
                        <p className="text-[11px] text-foreground/80 mt-2 italic border-l-2 border-gold/40 pl-2">
                          {h.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setNoteFor(h.id);
                        setNoteText(h.note || "");
                      }}
                      className="text-[10px] text-gold/80 hover:text-gold underline"
                    >
                      {h.note ? "Editar" : "Anotar"}
                    </button>
                  </div>

                  {noteFor === h.id && (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={2}
                        placeholder="Como foi praticar essa tarefa? O que sentiu?"
                        className="w-full bg-muted/50 border border-gold/20 rounded-lg px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-gold/50"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveNote(h.id)} className="bg-gold hover:bg-gold/90 text-black h-7 text-xs">
                          Salvar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setNoteFor(null); setNoteText(""); }} className="h-7 text-xs">
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reset */}
        <div className="pt-4">
          <Button variant="ghost" size="sm" onClick={resetAll} className="text-[10px] text-muted-foreground hover:text-destructive">
            <Flame className="h-3 w-3 mr-1" /> Zerar progresso
          </Button>
        </div>
      </main>
    </div>
  );
}
