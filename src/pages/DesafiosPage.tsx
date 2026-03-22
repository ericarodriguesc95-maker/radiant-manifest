import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Send, Trophy, Flame, Users, Star, Crown, Diamond, Award, Sparkles, Share2, X, Brain, Heart, Dumbbell, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import FourPointStar from "@/components/FourPointStar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TaskDetail {
  name: string;
  icon: string;
  dicaPratica: string;
  neurociencia: string;
  exercicio: string[];
}

interface Challenge {
  id: string;
  days: number;
  title: string;
  theme: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  tasks: TaskDetail[];
}

interface ForumMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

// ─── Deep Content Database ───────────────────────────────────────────────────

const TASK_LIBRARY: Record<string, TaskDetail> = {
  meditacao10: {
    name: "Meditação 10min",
    icon: "🧘‍♀️",
    dicaPratica: "Não precisa de um espaço zen perfeito! Coloque o fone no ônibus ou no metrô, feche os olhos e use um app gratuito como Insight Timer. Até sentada na cama antes de levantar já conta. O segredo é consistência, não perfeição.",
    neurociencia: "A meditação reduz a atividade da amígdala (centro do medo e ansiedade) em até 50% após 8 semanas de prática. Ela também aumenta a massa cinzenta no córtex pré-frontal, responsável por decisões e autocontrole. Estudos da Harvard Medical School mostram que apenas 10 minutos diários já reduzem significativamente os níveis de cortisol.",
    exercicio: [
      "Sente-se confortavelmente (pode ser na cama, no sofá ou cadeira)",
      "Feche os olhos e respire fundo 3 vezes pelo nariz",
      "Foque na sua respiração natural — apenas observe o ar entrando e saindo",
      "Quando a mente vagar (e vai vagar!), gentilmente traga a atenção de volta",
      "Comece com 5 minutos e aumente gradualmente para 10",
      "Ao final, abra os olhos devagar e sorria por ter se dedicado a si mesma"
    ]
  },
  journaling: {
    name: "Journaling",
    icon: "📝",
    dicaPratica: "Use o bloco de notas do celular se não tiver um caderno. Escreva no almoço, no banheiro, no intervalo do trabalho. Não precisa ser bonito ou longo — 3 frases já transformam o dia. Você pode até usar o Diário aqui do app!",
    neurociencia: "A escrita expressiva ativa o córtex pré-frontal e reduz a atividade da amígdala. Um estudo publicado no Journal of Experimental Psychology mostrou que escrever sobre pensamentos e sentimentos por 15-20 minutos reduz o cortisol em até 28%. O journaling também fortalece a memória de trabalho e a regulação emocional.",
    exercicio: [
      "Escreva 3 coisas pelas quais é grata hoje (específicas, não genéricas)",
      "Descreva uma situação que te incomodou e como você lidou com ela",
      "Escreva uma intenção para amanhã (Ex: 'Vou me hidratar melhor')",
      "Se quiser ir mais fundo: 'O que eu preciso deixar ir hoje?'",
      "Tempo estimado: 5-10 minutos"
    ]
  },
  leitura15: {
    name: "Leitura 15min",
    icon: "📖",
    dicaPratica: "Leve o livro (ou Kindle/celular) no bolso. Leia na fila do banco, no consultório, antes de dormir no lugar de rolar o feed. Audiobooks contam! Ouvir no trajeto casa-trabalho é perfeito.",
    neurociencia: "A leitura fortalece as conexões neurais no sulco temporal esquerdo (processamento de linguagem) e aumenta a conectividade no córtex somatossensorial. Pesquisadores da Universidade de Sussex descobriram que apenas 6 minutos de leitura reduzem o estresse em 68% — mais eficaz que ouvir música ou caminhar.",
    exercicio: [
      "Escolha um livro que te interesse genuinamente (autodesenvolvimento, ficção, espiritualidade)",
      "Separe 15 minutos ininterruptos (coloque o celular no modo avião)",
      "Leia com atenção — se algo te marcar, sublinhe ou anote",
      "Sugestões acessíveis: 'O Poder do Agora', 'Mulheres que Correm com os Lobos', 'Hábitos Atômicos'",
      "Dica: bibliotecas públicas têm ótimos acervos gratuitos"
    ]
  },
  respiracao478: {
    name: "Respiração 4-7-8",
    icon: "🌬️",
    dicaPratica: "Perfeita para aquele momento de ansiedade no trânsito, antes de uma reunião difícil ou quando bater a vontade de descontar na comida. Pode fazer discretamente em qualquer lugar — ninguém percebe.",
    neurociencia: "A técnica 4-7-8 ativa o nervo vago, estimulando o sistema nervoso parassimpático. Isso reduz a frequência cardíaca e a pressão arterial em minutos. O Dr. Andrew Weil, que popularizou a técnica, a chama de 'tranquilizante natural do sistema nervoso'. A expiração prolongada (8 tempos) é a chave: ela sinaliza segurança ao cérebro.",
    exercicio: [
      "Inspire pelo nariz contando até 4",
      "Segure a respiração contando até 7",
      "Expire pela boca (fazendo um som de 'whoosh') contando até 8",
      "Repita o ciclo 4 vezes",
      "Faça pelo menos 2x ao dia: ao acordar e antes de dormir",
      "Em momentos de ansiedade aguda, faça de olhos fechados"
    ]
  },
  gratidao: {
    name: "Gratidão Diária",
    icon: "🙏",
    dicaPratica: "Pode ser mental, no espelho do banheiro, ou escrita no celular. Faça no café da manhã ou logo antes de dormir. O segredo é ser específica: em vez de 'sou grata pela saúde', diga 'sou grata por ter conseguido subir as escadas sem cansar hoje'.",
    neurociencia: "A gratidão ativa o núcleo accumbens e o córtex pré-frontal ventromedial, as mesmas áreas ativadas por recompensas. Pesquisadores da UC Davis mostraram que praticar gratidão por 3 semanas aumenta a dopamina e a serotonina — os 'hormônios da felicidade'. Quem pratica gratidão regularmente tem 25% menos cortisol.",
    exercicio: [
      "Ao acordar, pense em 3 coisas específicas pelas quais é grata",
      "Exemplo: 'Sou grata pelo sorriso da minha filha ontem no jantar'",
      "À noite, relembre o melhor momento do dia",
      "Opcional: envie uma mensagem de gratidão para alguém (amiga, mãe, colega)",
      "Variação avançada: agradeça por algo que ainda não aconteceu, como se já tivesse"
    ]
  },
  digitalDetox: {
    name: "Digital Detox 1h",
    icon: "📵",
    dicaPratica: "Escolha 1 hora do dia pra desligar notificações (não precisa desligar o celular). Pode ser a primeira hora acordada ou a última antes de dormir. Avise família/amigas que estará offline — elas vão entender.",
    neurociencia: "O uso excessivo de redes sociais reduz a matéria cinzenta na ínsula, área responsável pela empatia e autoconsciência. Cada notificação gera um micro-pico de dopamina que cria dependência. Pesquisadores da Universidade de Pennsylvania mostraram que limitar redes sociais a 30min/dia reduz solidão e depressão significativamente em 3 semanas.",
    exercicio: [
      "Escolha sua hora de detox (sugestão: 6h-7h da manhã ou 21h-22h)",
      "Coloque o celular em modo avião ou 'Não Perturbe'",
      "Use esse tempo para: cozinhar, conversar com alguém, ler, cuidar de si",
      "Observe como você se sente sem o celular — desconfortável? Livre?",
      "Gradualmente aumente para 2h quando se sentir confortável"
    ]
  },
  afirmacao: {
    name: "Afirmação Positiva",
    icon: "✨",
    dicaPratica: "Fale em voz alta no espelho do banheiro enquanto escova os dentes ou se arruma. Parece bobo? A ciência diz que funciona. Se sentir vergonha, comece sussurrando. O importante é ouvir sua própria voz dizendo coisas boas sobre você.",
    neurociencia: "Afirmações positivas ativam o sistema de recompensa do cérebro (estriado ventral) e o córtex pré-frontal medial, associado à autoimagem. Um estudo da Carnegie Mellon mostrou que auto-afirmações reduzem o estresse crônico e melhoram a resolução de problemas. A repetição cria novos caminhos neurais que substituem padrões negativos.",
    exercicio: [
      "Escolha 3 afirmações que ressoem com você. Exemplos:",
      "'Eu sou capaz de conquistar tudo que eu me proponho'",
      "'Meu corpo é forte, saudável e bonito como é'",
      "'Eu mereço amor, abundância e paz'",
      "Repita cada uma 3 vezes, em voz alta, olhando no espelho",
      "Sinta a emoção das palavras — não é robótico, é com intenção"
    ]
  },
  exercicio30: {
    name: "30min de Movimento",
    icon: "🏃‍♀️",
    dicaPratica: "Não precisa de academia! Caminhe 30 minutos pelo bairro, dance na sala, suba escadas, faça agachamentos assistindo TV. Use vídeos gratuitos do YouTube (Pamela Reif, Carol Borba). O movimento mais eficaz é aquele que você realmente faz.",
    neurociencia: "O exercício aeróbico aumenta o BDNF (Fator Neurotrófico Derivado do Cérebro), uma proteína que estimula o crescimento de novos neurônios. Apenas 30 minutos de caminhada elevam a serotonina e as endorfinas por até 12 horas. O exercício também reduz a inflamação sistêmica, que está ligada à depressão e à fadiga crônica.",
    exercicio: [
      "Caminhada rápida pelo bairro: 30 minutos (ideal de manhã para pegar sol)",
      "Alternativa em casa: 15min dança + 15min alongamento",
      "Alternativa treino: 3 séries de agachamento, flexão e prancha (10 rep cada)",
      "Use tênis confortável e roupas que já tem",
      "Hidrate-se antes, durante e depois",
      "Lembre: qualquer movimento é melhor que nenhum"
    ]
  },
  agua3l: {
    name: "Hidratação 3L",
    icon: "💧",
    dicaPratica: "Tenha sempre uma garrafinha por perto (de 500ml, reabastece 6x no dia). Coloque alarmes a cada 2 horas. Adicione limão, gengibre ou hortelã se achar água sem graça. App gratuitos como 'Beba Água' ajudam a lembrar.",
    neurociencia: "O cérebro é 75% água. Uma desidratação de apenas 2% já reduz a concentração, memória de curto prazo e aumenta a fadiga. Estudos da Universidade de Connecticut mostraram que a desidratação leve altera o humor e aumenta a percepção de dificuldade das tarefas. A água também é essencial para a produção de neurotransmissores.",
    exercicio: [
      "Ao acordar: beba 500ml de água (pode ser morna com limão)",
      "Tenha uma garrafa de 500ml sempre visível na mesa/bolsa",
      "Meta: 1L até o almoço, 2L até as 16h, 3L até as 20h",
      "Coloque alarmes no celular a cada 2 horas",
      "Dica: água com gás conta! Chás sem açúcar também"
    ]
  },
  alimentacaoLimpa: {
    name: "Alimentação Consciente",
    icon: "🥗",
    dicaPratica: "Não é dieta restritiva! É prestar atenção no que come. Comece tirando UMA coisa ultraprocessada por dia (refrigerante, salgadinho, biscoito). Troque por fruta, castanha ou iogurte natural. Cozinhar em casa com temperos naturais já é um grande passo.",
    neurociencia: "Alimentos ultraprocessados causam inflamação no hipotálamo, alterando os sinais de saciedade. O eixo intestino-cérebro mostra que 90% da serotonina é produzida no intestino. Uma alimentação rica em fibras, frutas e vegetais diversifica a microbiota, melhorando humor, sono e imunidade. O açúcar refinado gera picos de dopamina seguidos de crashes que simulam sintomas depressivos.",
    exercicio: [
      "Café da manhã: troque pão branco por tapioca, ovo ou frutas com aveia",
      "Almoço: monte o prato com 50% legumes/salada, 25% proteína, 25% carboidrato",
      "Lanche: castanhas, frutas, iogurte natural com mel ou banana com pasta de amendoim",
      "Jantar: sopa de legumes, omelete ou salada com frango desfiado",
      "Regra de ouro: se sua avó não reconheceria como comida, evite"
    ]
  },
  skincare: {
    name: "Skincare AM/PM",
    icon: "🧴",
    dicaPratica: "Rotina mínima = 3 passos: limpar, hidratar, proteger (de manhã) ou limpar, tratar, hidratar (à noite). Não precisa de produtos caros — Cerave, Neutrogena e até Nivea têm ótimas opções. O protetor solar é o produto anti-idade mais eficaz que existe.",
    neurociencia: "O ritual de skincare ativa o sistema de recompensa do cérebro ao criar uma rotina de autocuidado tangível. A pele e o sistema nervoso vêm da mesma camada embrionária (ectoderma), por isso o toque facial libera ocitocina e reduz cortisol. Cuidar da pele não é vaidade — é saúde e regulação emocional.",
    exercicio: [
      "Manhã: 1) Lave o rosto com sabonete suave 2) Hidratante leve 3) Protetor solar FPS 30+",
      "Noite: 1) Remova maquiagem com micelar 2) Lave o rosto 3) Sérum ou tratamento 4) Hidratante",
      "Invista em protetor solar acima de tudo — use até em dias nublados",
      "Troque a fronha do travesseiro 2x por semana",
      "Beba água! A hidratação interna reflete na pele"
    ]
  },
  alongamento: {
    name: "Alongamento",
    icon: "🤸‍♀️",
    dicaPratica: "5 minutos ao acordar já fazem diferença. Alongue no banheiro depois do banho quente (músculos mais relaxados). Se trabalha sentada, levante a cada hora e alongue pescoço e ombros. Não precisa ser ginasta — faça o que seu corpo permite.",
    neurociencia: "O alongamento reduz a rigidez muscular causada pelo cortisol cronicamente elevado (estresse). Ele ativa os proprioceptores musculares que enviam sinais de relaxamento ao cérebro. Estudos mostram que 10 minutos de alongamento reduzem a ansiedade de forma comparável a uma caminhada de 20 minutos.",
    exercicio: [
      "Pescoço: incline a cabeça para cada lado, 15 segundos cada",
      "Ombros: gire para frente e para trás, 10 vezes cada",
      "Coluna: sentada, gire o tronco para cada lado com a mão na cadeira",
      "Quadril: posição de pombo (uma perna à frente dobrada, outra esticada atrás)",
      "Pernas: em pé, segure o pé atrás por 15 segundos cada lado",
      "Mantenha cada posição por 15-30 segundos, sem pular (bouncing)"
    ]
  },
  sono7h: {
    name: "Sono 7h+",
    icon: "😴",
    dicaPratica: "Coloque um alarme para IR DORMIR, não só para acordar. Celular no silencioso às 22h. Evite café depois das 14h. Se tem filhos pequenos, tente dormir quando eles dormem (mesmo que seja às 21h). Não é preguiça — é recuperação.",
    neurociencia: "Durante o sono profundo, o sistema glinfático 'lava' o cérebro, removendo proteínas tóxicas como beta-amiloide. Dormir menos de 7h reduz a leptina (hormônio da saciedade) e aumenta a grelina (fome), levando ao ganho de peso. Uma única noite mal dormida reduz a função do córtex pré-frontal em até 60%, afetando decisões e autocontrole.",
    exercicio: [
      "Defina um horário fixo para dormir e acordar (inclusive nos fins de semana)",
      "Crie um ritual noturno: chá, skincare, leitura (sem tela)",
      "Quarto escuro, fresco e silencioso (use máscara de dormir se necessário)",
      "Evite: cafeína após 14h, refeições pesadas após 20h, telas 1h antes de dormir",
      "Se não consegue dormir em 20min, levante e faça algo calmo até ter sono",
      "Suplemento natural: melatonina 0.5-3mg (consulte médico)"
    ]
  },
  meditacaoGuiada: {
    name: "Meditação Guiada",
    icon: "🎧",
    dicaPratica: "Use apps gratuitos como Insight Timer, Lojong ou vídeos no YouTube. Coloque o fone e faça no ônibus, no intervalo do almoço ou deitada na cama. A meditação guiada é mais fácil para iniciantes porque alguém te conduz. Não existe fazer errado!",
    neurociencia: "A meditação guiada ativa a rede de modo padrão (Default Mode Network) de forma saudável, reduzindo a ruminação mental. Ela aumenta a espessura do córtex cingulado anterior, responsável pela empatia e regulação emocional. Após 4 semanas de prática diária, exames de ressonância mostram mudanças estruturais mensuráveis no cérebro.",
    exercicio: [
      "Escolha uma meditação guiada de 10-15 minutos no Insight Timer ou YouTube",
      "Sente-se ou deite-se confortavelmente com fones de ouvido",
      "Feche os olhos e simplesmente siga as instruções da voz guia",
      "Não se julgue se a mente vagar — isso é normal e faz parte do processo",
      "Experimente temas diferentes: relaxamento, autocompaixão, visualização",
      "Sugestão: 'Meditação para mulheres' no YouTube tem ótimas opções em português"
    ]
  },
  gratidaoProfunda: {
    name: "Gratidão Profunda",
    icon: "💛",
    dicaPratica: "Vá além do 'sou grata pelo dia'. Sinta no corpo a emoção de cada gratidão. Feche os olhos e reviva o momento. Pode fazer no banho, caminhando ou antes de dormir. Quando a gratidão é sentida (não só pensada), o impacto no cérebro é 3x maior.",
    neurociencia: "A gratidão profunda — sentida no corpo, não apenas racionalizada — ativa o córtex pré-frontal medial e libera ocitocina. Dr. Joe Dispenza explica que quando combinamos pensamento + emoção, criamos novos padrões neurais duradouros. Pesquisas do HeartMath Institute mostram que a gratidão sentida muda a variabilidade da frequência cardíaca em minutos.",
    exercicio: [
      "Feche os olhos e respire fundo 3 vezes",
      "Pense em uma pessoa que te ajudou recentemente — sinta a emoção",
      "Pense em uma parte do seu corpo que funciona bem — agradeça",
      "Pense em algo 'pequeno' que te trouxe alegria hoje (um café, um sorriso)",
      "Mantenha cada sentimento de gratidão por pelo menos 30 segundos",
      "Opcional: coloque a mão no coração enquanto pratica"
    ]
  },
  hooponopono: {
    name: "Ho'oponopono",
    icon: "🙏",
    dicaPratica: "Pode fazer em qualquer lugar — mentalmente no ônibus, sussurrando no banho, ou em voz alta antes de dormir. Use quando sentir mágoa, raiva ou culpa. Não precisa entender tudo sobre a técnica — apenas repita as 4 frases com intenção.",
    neurociencia: "O Ho'oponopono trabalha com o conceito de neuroplasticidade emocional. Repetir frases de perdão e amor reativa circuitos neurais associados à compaixão (ínsula anterior e córtex cingulado). Estudos sobre perdão mostram que soltar ressentimentos reduz cortisol, pressão arterial e marcadores inflamatórios no sangue.",
    exercicio: [
      "Pense em uma situação ou pessoa que cause desconforto emocional",
      "Repita mentalmente ou em voz alta, com intenção:",
      "'Sinto muito' — reconheça a dor ou situação",
      "'Me perdoe' — assuma responsabilidade pela sua experiência",
      "'Eu te amo' — envie amor incondicional (inclusive a si mesma)",
      "'Sou grata' — agradeça pela oportunidade de cura",
      "Repita o ciclo 7 vezes, respirando profundamente entre cada repetição"
    ]
  },
  visualizacao: {
    name: "Visualização Criativa",
    icon: "🌟",
    dicaPratica: "Faça deitada na cama, 5 minutos antes de dormir ou ao acordar (estados alfa do cérebro). Imagine sua vida ideal como um filme mental — com detalhes sensoriais. Quanto mais detalhes (sons, cheiros, texturas), mais poderosa a visualização.",
    neurociencia: "O cérebro não diferencia completamente uma experiência real de uma vividamente imaginada. A visualização ativa as mesmas áreas motoras e sensoriais que a ação real. Atletas olímpicos usam essa técnica porque ela fortalece as conexões neurais como se você estivesse praticando. O Dr. Joe Dispenza demonstrou que a visualização consistente muda a expressão genética.",
    exercicio: [
      "Deite-se confortavelmente e feche os olhos",
      "Respire fundo 5 vezes para relaxar corpo e mente",
      "Imagine-se vivendo sua melhor versão daqui a 1 ano",
      "Adicione detalhes: como está vestida? Onde está? Quem está ao redor?",
      "Sinta as emoções dessa versão de você: confiança, alegria, paz",
      "Mantenha a visualização por 5-10 minutos",
      "Ao abrir os olhos, sorria e diga: 'Isso já está a caminho'"
    ]
  },
  natureza20: {
    name: "20min na Natureza",
    icon: "🌿",
    dicaPratica: "Não precisa de parque! Caminhe numa praça do bairro, cuide de uma plantinha, sente num banco com árvores por perto. Se mora em apartamento, abra a janela e tome sol 10 minutos. O importante é sair do ambiente fechado e artificial.",
    neurociencia: "O conceito japonês de 'Shinrin-yoku' (banho de floresta) é respaldado por pesquisas: 20 minutos na natureza reduzem o cortisol em 13.4%, a pressão arterial e a frequência cardíaca. A exposição à luz natural regula o ritmo circadiano e a produção de melatonina. O contato com o verde aumenta as células NK (Natural Killer), fortalecendo o sistema imune.",
    exercicio: [
      "Caminhe 20 minutos em uma praça, parque ou rua arborizada",
      "Tire os fones de ouvido — ouça os sons ao redor (pássaros, vento, água)",
      "Toque em plantas, terra, árvores (grounding)",
      "Tome pelo menos 10 minutos de sol direto (braços ou rosto)",
      "Se estiver chovendo: sente perto de uma janela com vista para o verde",
      "Opcional: leve o café da manhã para tomar ao ar livre"
    ]
  },
  desapegoItem: {
    name: "Desapego de 1 Item",
    icon: "🎁",
    dicaPratica: "Abra o guarda-roupa e separe UMA peça que não usa há 6 meses. Doe para alguém ou para uma instituição. Pode ser roupa, acessório, livro, utensílio. O desapego material reflete no emocional — liberar espaço físico libera espaço mental.",
    neurociencia: "A acumulação ativa a ínsula e o córtex cingulado anterior (áreas de dor emocional) quando pensamos em nos desfazer de algo. Mas o ato de doar ativa o sistema de recompensa (estriado ventral) e libera dopamina. Ambientes organizados reduzem o cortisol e melhoram o foco — o cérebro processa menos estímulos visuais e tem mais energia para tarefas importantes.",
    exercicio: [
      "Abra o guarda-roupa ou uma gaveta",
      "Escolha 1 item que não usou nos últimos 6 meses",
      "Pergunte: 'Isso me traz alegria ou utilidade?' Se não, libere",
      "Separe em uma sacola para doação",
      "Agradeça ao item pelo tempo que serviu (método Marie Kondo)",
      "Meta semanal: 7 itens doados = 1 espaço renovado"
    ]
  },
  rotinaMatinal: {
    name: "Rotina Matinal",
    icon: "🌅",
    dicaPratica: "Não precisa acordar às 5h! Acorde 30 minutos antes do normal. Os primeiros 30 minutos do dia definem seu humor. Nada de celular nos primeiros 20 minutos — faça algo para VOCÊ primeiro (água, respiração, intenção do dia).",
    neurociencia: "Os primeiros 30-60 minutos após acordar, o cérebro está em estado alfa/teta, altamente sugestionável. O que você consome nesse período (informação, emoção, estímulo) programa o tom do dia inteiro. Verificar o celular imediatamente ativa o modo reativo; uma rotina matinal intencional ativa o modo proativo, com maior controle prefrontal.",
    exercicio: [
      "1. Ao acordar: 500ml de água (corpo desidratou 8h dormindo)",
      "2. 3 respirações profundas + 1 afirmação do dia",
      "3. 5-10min de meditação, journaling ou leitura (SEM celular)",
      "4. Skincare + café/chá com calma",
      "5. Defina a intenção/meta principal do dia",
      "6. Só depois: verificar celular e começar o dia"
    ]
  },
  metaDoDia: {
    name: "Meta do Dia",
    icon: "🎯",
    dicaPratica: "Toda manhã, escolha UMA meta principal (não três, não cinco — UMA). Escreva no post-it e cole no espelho ou na tela do celular. No final do dia, avalie: conseguiu? Se sim, celebre. Se não, sem culpa — ajuste e tente amanhã.",
    neurociencia: "O foco em uma única meta ativa o córtex pré-frontal dorsolateral e reduz a 'fadiga de decisão'. Pesquisas de Baumeister sobre força de vontade mostram que ela é um recurso limitado — dividir entre muitas metas esgota o autocontrole. Estabelecer micro-metas diárias libera dopamina a cada conclusão, criando um ciclo positivo de motivação.",
    exercicio: [
      "Pela manhã, defina UMA meta importante e alcançável para o dia",
      "Escreva no formato: 'Hoje eu vou [ação específica]'",
      "Exemplo: 'Hoje eu vou caminhar 30 minutos no almoço'",
      "Quebre em mini-passos se necessário",
      "À noite, avalie: completou? Parcialmente? O que aprendeu?",
      "Celebre qualquer progresso — grande ou pequeno"
    ]
  },
  reflexaoNoturna: {
    name: "Reflexão Noturna",
    icon: "🌙",
    dicaPratica: "Faça mentalmente na cama, ou escreva 3 linhas no celular. Não precisa ser longo — é um 'fechamento' do dia. O que deu certo? O que aprendeu? O que faria diferente? Esse hábito melhora a qualidade do sono porque 'descarrega' a mente.",
    neurociencia: "A reflexão noturna consolida a memória no hipocampo durante o sono subsequente. Processar os eventos do dia reduz a carga emocional que o cérebro carregaria para o sono (causando insônia ou sonhos agitados). A prática regular de reflexão aumenta a metacognição — capacidade de 'pensar sobre o pensamento' — fortalecendo a inteligência emocional.",
    exercicio: [
      "Antes de dormir, reflita sobre 3 perguntas:",
      "1. 'Qual foi o melhor momento do meu dia?'",
      "2. 'O que eu aprendi hoje?' (sobre mim ou o mundo)",
      "3. 'O que eu posso melhorar amanhã?'",
      "Opcional: escreva no app Diário aqui da plataforma",
      "Finalize com uma respiração profunda e intenção de descanso"
    ]
  },
  semRedes2h: {
    name: "Sem Redes 2h",
    icon: "📱",
    dicaPratica: "Escolha as 2 horas menos comprometidas do seu dia — geralmente manhã cedo ou noite. Delete os apps temporariamente se preciso (pode reinstalar depois, os dados ficam salvos). Use esse tempo para algo que nutra: conversar, cozinhar, criar, descansar.",
    neurociencia: "As redes sociais exploram o circuito de dopamina com recompensas variáveis (como caça-níqueis). Cada scroll é um 'talvez tenha algo bom' — isso vicia. 2 horas sem estímulo digital permite que o córtex pré-frontal 'descanse' e recupere capacidade de atenção profunda. Pesquisas mostram que a atenção focada está em declínio — de 12 segundos (2000) para 8 segundos (2023).",
    exercicio: [
      "Defina horário: ex. 6h-8h da manhã ou 20h-22h à noite",
      "Coloque celular no modo avião ou em outro cômodo",
      "Alternativas produtivas: ler, cozinhar, conversar, alongar, journaling",
      "Se sentir ansiedade, observe o sentimento sem agir — ele passa em 5-10min",
      "Após a primeira semana, você vai perceber que não perdeu nada importante"
    ]
  },
  treino1h: {
    name: "Treino 1h",
    icon: "💪",
    dicaPratica: "Combine 30min de cardio (caminhada, dança, pular corda) + 30min de força (agachamento, flexão, prancha com garrafas de água como peso). YouTube é sua academia gratuita. Se tiver condição, academia de bairro custa R$60-100/mês.",
    neurociencia: "1 hora de treino combinado (aeróbico + resistência) é o 'padrão ouro' para neuroplasticidade. O exercício de resistência aumenta o IGF-1, que junto com o BDNF promove neurogenesis no hipocampo. Treinos mais longos também ativam o sistema endocanabinóide (o 'barato do exercício'), gerando euforia natural que dura horas após o treino.",
    exercicio: [
      "Aquecimento: 5min de polichinelos ou caminhada rápida",
      "Cardio (20min): caminhada rápida, dança ou bicicleta",
      "Força (25min): 3 séries de cada — agachamento, flexão, prancha, abdominal, lunges",
      "Alongamento (10min): foque em quadril, ombros e coluna",
      "Use garrafas de água (2L) como halter se não tiver equipamento",
      "Playlist motivacional é obrigatória! 🎵"
    ]
  },
  coldShower: {
    name: "Banho Gelado 30s",
    icon: "🚿",
    dicaPratica: "NÃO precisa ser o banho inteiro gelado! Nos últimos 30 segundos do banho quente, vire a água para o mais frio que aguentar. Comece com 15 segundos e aumente. No calor do Brasil, isso é até gostoso. No frio, é um ato de coragem que muda seu dia.",
    neurociencia: "A exposição ao frio ativa maciçamente a norepinefrina (até 300% de aumento), neurotransmissor responsável por foco, atenção e humor. O Dr. Andrew Huberman explica que o frio também ativa a gordura marrom, que queima calorias para gerar calor. O estresse controlado do frio treina o nervo vago e melhora a resiliência ao estresse cotidiano.",
    exercicio: [
      "No final do banho quente normal, gire a água para frio",
      "Comece com 15 segundos e aumente gradualmente para 30-60 segundos",
      "Respire profundamente durante a exposição (não prenda a respiração!)",
      "Foque na respiração: inspire pelo nariz, expire pela boca",
      "Após sair, observe a sensação de energia e clareza mental",
      "Não recomendado: se tem problemas cardíacos, consulte médico antes"
    ]
  },
  semAcucar: {
    name: "Sem Açúcar Refinado",
    icon: "🍬",
    dicaPratica: "Não precisa cortar todo doce — corte o açúcar REFINADO (branco). Troque por mel, açúcar de coco ou frutas maduras. O café amargo parece impossível? Coloque canela! A vontade de doce passa em 3-5 dias quando o paladar se readapta.",
    neurociencia: "O açúcar refinado ativa os receptores de dopamina com a mesma intensidade que algumas drogas. A abstinência gera sintomas reais (irritabilidade, dor de cabeça, cansaço) nos primeiros 3-5 dias, mas depois o paladar se recalibra. Sem picos de glicose, o cortisol se estabiliza, o sono melhora e a pele fica mais limpa (menos glicação do colágeno).",
    exercicio: [
      "Substitua açúcar branco por mel, açúcar de coco ou xilitol",
      "Vontade de doce? Coma: frutas maduras, chocolate 70%, pasta de amendoim",
      "Café amargo: adicione canela em pó ou leite vegetal",
      "Leia rótulos: 'xarope de glicose', 'maltodextrina' e 'dextrose' são açúcar",
      "Primeiros 3-5 dias são os mais difíceis — depois fica fácil",
      "Permita-se um 'doce saudável' por dia para não sentir privação"
    ]
  },
  despertar5h: {
    name: "Despertar às 5h",
    icon: "⏰",
    dicaPratica: "Só faz sentido se você DORMIR antes! Deitar às 22h = acordar às 5h com 7h de sono. A mágica não é o horário, é ter tempo SÓ SEU antes do mundo acordar. Se 5h é impossível, acorde 1h mais cedo que o normal — o princípio é o mesmo.",
    neurociencia: "O cortisol tem um pico natural entre 6-8h da manhã (Cortisol Awakening Response). Acordar mais cedo aproveita esse pico hormonal para produtividade. As primeiras horas do dia têm menos interrupções externas, permitindo o 'deep work' (trabalho profundo). Acordar cedo também sincroniza o relógio circadiano com a luz solar, melhorando todo o eixo hormonal.",
    exercicio: [
      "Semana 1: acorde 30min mais cedo que o habitual",
      "Semana 2: mais 30min (agora 1h mais cedo)",
      "Gradualmente ajuste até chegar no horário desejado",
      "REGRA: deite 7-8 horas antes do alarme (5h = dormir até 22h)",
      "Coloque o despertador longe da cama (precisa levantar para desligar)",
      "Use os primeiros 30min para sua rotina matinal sagrada"
    ]
  },
  leitura30: {
    name: "Leitura 30min",
    icon: "📚",
    dicaPratica: "Dobre o tempo de leitura de 15 para 30 minutos. Divida em 2 blocos de 15min se necessário (manhã e noite). Audiobooks no trajeto contam! A chave é exposição consistente a ideias que expandam sua mente.",
    neurociencia: "30 minutos diários de leitura equivalem a ~20 livros por ano. A leitura profunda ativa o circuito de simulação cerebral — ao ler sobre experiências, o cérebro simula vivê-las, construindo empatia e modelos mentais. Pesquisas longitudinais mostram que leitores regulares têm 20% menor risco de declínio cognitivo na terceira idade.",
    exercicio: [
      "Bloco 1 (manhã): 15min de leitura de desenvolvimento pessoal ou profissional",
      "Bloco 2 (noite): 15min de ficção ou espiritualidade (relaxa antes de dormir)",
      "Alterne entre gêneros para estimular diferentes redes neurais",
      "Meta mensal: 1-2 livros completos",
      "Sugestões: 'Poder do Hábito', 'As Armas da Persuasão', 'Pai Rico Pai Pobre'",
      "Grupo de leitura: compartilhe insights no Mural da Turma!"
    ]
  },
  estudo1h: {
    name: "Estudo/Desenvolvimento 1h",
    icon: "🎓",
    dicaPratica: "1 hora por dia dedicada a CRESCER: curso online gratuito (Coursera, Sebrae, YouTube), estudar para concurso, aprender uma habilidade nova (inglês, design, finanças). Existem milhares de cursos gratuitos de qualidade no Brasil.",
    neurociencia: "O aprendizado ativo cria novas sinapses e fortalece conexões neurais existentes (neuroplasticidade). A cada nova habilidade aprendida, o cérebro se reorganiza. Pesquisas mostram que adultos que mantêm atividade intelectual regular preservam a reserva cognitiva e têm melhor saúde mental a longo prazo.",
    exercicio: [
      "Defina o que quer aprender este mês (1 tema específico)",
      "Separe 1 hora diária (pode dividir: 30min manhã + 30min noite)",
      "Recursos gratuitos: Coursera, Khan Academy, Sebrae, YouTube",
      "Use a técnica Pomodoro: 25min estudo + 5min pausa",
      "Ensine o que aprendeu para alguém — ensinar consolida o aprendizado",
      "Anote insights e dúvidas no seu diário"
    ]
  },
  sonoRegulado: {
    name: "Sono Regulado 22h",
    icon: "🛌",
    dicaPratica: "Coloque um alarme às 21:30 como aviso. Às 22h: celular no silencioso, luzes baixas, rotina de fechamento (skincare, chá, leitura). Se tem filhos que dormem tarde, negocie com o parceiro para alternar noites. Seu sono é prioridade, não luxo.",
    neurociencia: "Dormir consistentemente no mesmo horário regula o ritmo circadiano e otimiza a secreção de melatonina, GH (hormônio do crescimento) e cortisol. O pico de GH ocorre entre 22h-2h — perdê-lo afeta recuperação muscular, pele e metabolismo. A regularidade do sono é mais importante para a saúde do que a duração total.",
    exercicio: [
      "21:30 — Alarme 'hora de desacelerar'",
      "21:30-22:00 — Rotina: skincare, chá de camomila, leitura leve",
      "22:00 — Celular no modo avião, luzes baixas ou apagadas",
      "Quarto: temperatura fresca (18-22°C), escuro, silencioso",
      "Se acordar à noite: não olhe o celular (a luz azul reseta a melatonina)",
      "Fins de semana: tente não variar mais que 1h do horário normal"
    ]
  },
  rotinaCompleta: {
    name: "Rotina Completa",
    icon: "📋",
    dicaPratica: "É a integração de tudo: manhã intencional, alimentação consciente, movimento, autocuidado e noite regulada. Não precisa ser perfeita — precisa ser consistente. A rotina é sua estrutura de segurança em dias caóticos.",
    neurociencia: "Rotinas automatizam decisões nos gânglios basais, liberando o córtex pré-frontal para pensamento criativo e estratégico. Quanto mais hábitos saudáveis você automatiza, menos 'força de vontade' gasta. Pesquisas de Phillippa Lally (UCL) mostram que um hábito leva em média 66 dias para se automatizar — mas os benefícios começam desde o dia 1.",
    exercicio: [
      "Manhã: água + respiração + intenção do dia (15min)",
      "Meio da manhã: lanche saudável + hidratação",
      "Almoço: prato equilibrado + 10min caminhada digestiva",
      "Tarde: estudo/desenvolvimento + movimento",
      "Noite: skincare + reflexão + leitura (sem tela)",
      "Adapte ao SEU horário e realidade — a melhor rotina é a que você consegue manter"
    ]
  }
};

// ─── Challenge Definitions ───────────────────────────────────────────────────

const CHALLENGES: Challenge[] = [
  {
    id: "7-mente",
    days: 7,
    title: "Despertar Mental",
    theme: "Mente",
    description: "7 dias para clareza mental, controle da ansiedade e início do autoconhecimento.",
    icon: <Sparkles className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(43,60%,65%)]",
    borderColor: "border-[hsl(43,72%,52%)/0.4]",
    tasks: [
      TASK_LIBRARY.meditacao10,
      TASK_LIBRARY.journaling,
      TASK_LIBRARY.leitura15,
      TASK_LIBRARY.respiracao478,
      TASK_LIBRARY.gratidao,
      TASK_LIBRARY.digitalDetox,
      TASK_LIBRARY.afirmacao,
    ],
  },
  {
    id: "15-corpo",
    days: 15,
    title: "Corpo em Movimento",
    theme: "Corpo",
    description: "15 dias de movimento, hidratação e alimentação consciente para energia e disposição.",
    icon: <Flame className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(30,80%,55%)]",
    borderColor: "border-[hsl(30,80%,55%)/0.4]",
    tasks: [
      TASK_LIBRARY.exercicio30,
      TASK_LIBRARY.agua3l,
      TASK_LIBRARY.alimentacaoLimpa,
      TASK_LIBRARY.skincare,
      TASK_LIBRARY.alongamento,
      TASK_LIBRARY.sono7h,
    ],
  },
  {
    id: "21-alma",
    days: 21,
    title: "Reconexão Interior",
    theme: "Alma",
    description: "21 dias para reconectar com sua essência, curar feridas emocionais e encontrar paz.",
    icon: <Star className="h-6 w-6" />,
    gradient: "from-[hsl(43,60%,65%)] to-[hsl(0,0%,75%)]",
    borderColor: "border-[hsl(0,0%,75%)/0.5]",
    tasks: [
      TASK_LIBRARY.meditacaoGuiada,
      TASK_LIBRARY.gratidaoProfunda,
      TASK_LIBRARY.hooponopono,
      TASK_LIBRARY.visualizacao,
      TASK_LIBRARY.natureza20,
      TASK_LIBRARY.desapegoItem,
    ],
  },
  {
    id: "30-evolucao",
    days: 30,
    title: "Evolução Total",
    theme: "Evolução Pessoal",
    description: "30 dias integrando mente, corpo e alma para a mulher que você quer se tornar.",
    icon: <Trophy className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] to-[hsl(0,0%,80%)]",
    borderColor: "border-[hsl(0,0%,80%)/0.5]",
    tasks: [
      TASK_LIBRARY.rotinaMatinal,
      TASK_LIBRARY.exercicio30,
      TASK_LIBRARY.leitura15,
      TASK_LIBRARY.metaDoDia,
      TASK_LIBRARY.agua3l,
      TASK_LIBRARY.reflexaoNoturna,
      TASK_LIBRARY.semRedes2h,
    ],
  },
  {
    id: "45-diamante",
    days: 45,
    title: "Mentalidade Diamante",
    theme: "Mente & Corpo",
    description: "45 dias de disciplina intensa para forjar resiliência, foco e autoconfiança inabalável.",
    icon: <Diamond className="h-6 w-6" />,
    gradient: "from-[hsl(0,0%,70%)] to-[hsl(0,0%,85%)]",
    borderColor: "border-[hsl(0,0%,85%)/0.6]",
    tasks: [
      TASK_LIBRARY.despertar5h,
      TASK_LIBRARY.treino1h,
      TASK_LIBRARY.leitura30,
      TASK_LIBRARY.coldShower,
      TASK_LIBRARY.journaling,
      TASK_LIBRARY.semAcucar,
      TASK_LIBRARY.meditacao10,
    ],
  },
  {
    id: "60-platina",
    days: 60,
    title: "Jornada Platina",
    theme: "Corpo & Alma",
    description: "60 dias de compromisso profundo com saúde, beleza e evolução. Para quem quer resultados reais.",
    icon: <Crown className="h-6 w-6" />,
    gradient: "from-[hsl(0,0%,78%)] to-[hsl(0,0%,92%)]",
    borderColor: "border-[hsl(0,0%,90%)/0.6]",
    tasks: [
      TASK_LIBRARY.rotinaCompleta,
      TASK_LIBRARY.treino1h,
      TASK_LIBRARY.alimentacaoLimpa,
      TASK_LIBRARY.estudo1h,
      TASK_LIBRARY.skincare,
      TASK_LIBRARY.meditacaoGuiada,
      TASK_LIBRARY.sonoRegulado,
    ],
  },
  {
    id: "90-elite",
    days: 90,
    title: "Elite Performance",
    theme: "Transformação Total",
    description: "90 dias para uma transformação completa e irreversível. O desafio supremo do Glow Up.",
    icon: <Award className="h-6 w-6" />,
    gradient: "from-[hsl(43,72%,52%)] via-[hsl(0,0%,85%)] to-[hsl(0,0%,95%)]",
    borderColor: "border-[hsl(43,72%,52%)/0.3]",
    tasks: [
      TASK_LIBRARY.despertar5h,
      TASK_LIBRARY.treino1h,
      TASK_LIBRARY.leitura30,
      TASK_LIBRARY.metaDoDia,
      TASK_LIBRARY.agua3l,
      TASK_LIBRARY.skincare,
      TASK_LIBRARY.reflexaoNoturna,
      TASK_LIBRARY.sonoRegulado,
    ],
  },
];

// ─── Persistence Helpers ─────────────────────────────────────────────────────

function getParticipantCount(challengeId: string): number {
  const stored = localStorage.getItem(`challenge-participants-${challengeId}`);
  if (stored) return parseInt(stored);
  const base: Record<string, number> = { "7-mente": 127, "15-corpo": 89, "21-alma": 214, "30-evolucao": 156, "45-diamante": 67, "60-platina": 43, "90-elite": 31 };
  const initial = base[challengeId] || 50;
  localStorage.setItem(`challenge-participants-${challengeId}`, String(initial));
  return initial;
}

function joinChallenge(challengeId: string) {
  const key = `challenge-joined-${challengeId}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, new Date().toISOString());
  const count = getParticipantCount(challengeId);
  localStorage.setItem(`challenge-participants-${challengeId}`, String(count + 1));
}

function isJoined(challengeId: string): boolean {
  return !!localStorage.getItem(`challenge-joined-${challengeId}`);
}

function getChallengeProgress(challengeId: string): Set<number> {
  try {
    const data = localStorage.getItem(`challenge-progress-${challengeId}`);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch { return new Set(); }
}

function saveChallengeProgress(challengeId: string, days: Set<number>) {
  localStorage.setItem(`challenge-progress-${challengeId}`, JSON.stringify([...days]));
}

function getForumMessages(challengeId: string): ForumMessage[] {
  try {
    const data = localStorage.getItem(`challenge-forum-${challengeId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function saveForumMessage(challengeId: string, msg: ForumMessage) {
  const msgs = getForumMessages(challengeId);
  msgs.push(msg);
  localStorage.setItem(`challenge-forum-${challengeId}`, JSON.stringify(msgs));
}

// ─── Task Detail Modal ───────────────────────────────────────────────────────

function TaskDetailModal({ task, open, onClose }: { task: TaskDetail | null; open: boolean; onClose: () => void }) {
  if (!task) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-lg">
            <span className="text-2xl">{task.icon}</span>
            {task.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Dica Prática */}
          <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">💡</span>
              <h4 className="font-display font-semibold text-sm text-amber-800 dark:text-amber-300">Dica Prática</h4>
            </div>
            <p className="text-xs leading-relaxed font-body text-amber-900/80 dark:text-amber-200/80">{task.dicaPratica}</p>
          </div>

          {/* Neurociência */}
          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/20 border border-purple-200/50 dark:border-purple-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-display font-semibold text-sm text-purple-800 dark:text-purple-300">O Que Diz a Neurociência</h4>
            </div>
            <p className="text-xs leading-relaxed font-body text-purple-900/80 dark:text-purple-200/80">{task.neurociencia}</p>
          </div>

          {/* Exercício */}
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200/50 dark:border-emerald-800/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-display font-semibold text-sm text-emerald-800 dark:text-emerald-300">Como Fazer (Passo a Passo)</h4>
            </div>
            <ol className="space-y-1.5">
              {task.exercicio.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-body text-emerald-900/80 dark:text-emerald-200/80">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── NPS Modal ───────────────────────────────────────────────────────────────

function NPSModal({ open, onClose, challengeTitle }: { open: boolean; onClose: () => void; challengeTitle: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [shared, setShared] = useState(false);

  const handleShare = () => {
    const text = `🏆 Completei o desafio "${challengeTitle}" no Performance Glow Up! ✨🔥 #GlowUp #Desafio`;
    if (navigator.share) {
      navigator.share({ title: "Conquista Glow Up", text });
    } else {
      navigator.clipboard.writeText(text);
    }
    setShared(true);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center font-display">🎉 Parabéns!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <p className="text-sm font-body text-muted-foreground">
            Você concluiu o desafio <strong className="text-foreground">{challengeTitle}</strong>!
          </p>
          <div className="space-y-2">
            <p className="text-xs font-body text-muted-foreground">De 0 a 10, qual a chance de recomendar este desafio?</p>
            <div className="flex gap-1 justify-center flex-wrap">
              {Array.from({ length: 11 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setScore(i)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    score === i
                      ? "bg-gold text-white shadow-brand scale-110"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
            {score !== null && (
              <p className="text-xs text-gold font-body animate-fade-in">
                {score >= 9 ? "Incrível! 💛" : score >= 7 ? "Obrigada! ✨" : "Vamos melhorar! 🙏"}
              </p>
            )}
          </div>
          <Button onClick={handleShare} className="w-full bg-gold hover:bg-gold/90 text-white gap-2">
            <Share2 className="h-4 w-4" />
            {shared ? "Copiado! ✨" : "Compartilhar Conclusão"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DesafiosPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showForum, setShowForum] = useState(false);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [forumMsg, setForumMsg] = useState("");
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [showNPS, setShowNPS] = useState(false);
  const [justCompletedDay, setJustCompletedDay] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);
  const [, forceUpdate] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChallenge) {
      setCompletedDays(getChallengeProgress(selectedChallenge.id));
      setForumMessages(getForumMessages(selectedChallenge.id));
    }
  }, [selectedChallenge]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [forumMessages]);

  const handleJoin = (challenge: Challenge) => {
    joinChallenge(challenge.id);
    forceUpdate(n => n + 1);
    setSelectedChallenge(challenge);
  };

  const toggleDay = (day: number) => {
    if (!selectedChallenge) return;
    const next = new Set(completedDays);
    if (next.has(day)) {
      next.delete(day);
    } else {
      next.add(day);
      setJustCompletedDay(day);
      setTimeout(() => setJustCompletedDay(null), 1200);
    }
    setCompletedDays(next);
    saveChallengeProgress(selectedChallenge.id, next);

    if (next.size >= selectedChallenge.days && !completedDays.has(day)) {
      setTimeout(() => setShowNPS(true), 800);
    }
  };

  const sendForumMessage = () => {
    if (!forumMsg.trim() || !selectedChallenge || !user) return;
    const msg: ForumMessage = {
      id: `${Date.now()}`,
      userId: user.id,
      userName: profile?.display_name || "Anônima",
      text: forumMsg.trim(),
      timestamp: Date.now(),
    };
    saveForumMessage(selectedChallenge.id, msg);
    setForumMessages(getForumMessages(selectedChallenge.id));
    setForumMsg("");
  };

  // ─── Forum View ─────────────────────────────────────────────────────────────

  if (showForum && selectedChallenge) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setShowForum(false)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold font-body">Mural: {selectedChallenge.title}</p>
            <p className="text-[10px] text-muted-foreground font-body">
              🔥 {getParticipantCount(selectedChallenge.id)} participando
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {forumMessages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8 font-body">
              Seja a primeira a enviar uma mensagem! 💬
            </p>
          )}
          {forumMessages.map(msg => {
            const isMe = msg.userId === user?.id;
            return (
              <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[75%] rounded-2xl px-3 py-2",
                  isMe ? "bg-gold text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                )}>
                  {!isMe && <p className="text-[10px] font-semibold text-gold mb-0.5">{msg.userName}</p>}
                  <p className="text-sm font-body">{msg.text}</p>
                  <p className={cn("text-[10px] mt-0.5", isMe ? "text-white/60" : "text-muted-foreground")}>
                    {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="fixed bottom-16 left-0 right-0 flex items-center gap-2 p-3 border-t border-border bg-card max-w-2xl mx-auto">
          <input
            value={forumMsg}
            onChange={e => setForumMsg(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") sendForumMessage(); }}
            placeholder="Mensagem para o grupo..."
            className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm font-body outline-none"
          />
          <button onClick={sendForumMessage} disabled={!forumMsg.trim()} className="text-gold disabled:text-muted-foreground">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // ─── Challenge Detail View ──────────────────────────────────────────────────

  if (selectedChallenge) {
    const progress = (completedDays.size / selectedChallenge.days) * 100;
    return (
      <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedChallenge(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Desafios
          </button>
          <button
            onClick={() => setShowForum(true)}
            className="flex items-center gap-1.5 text-sm font-body text-gold hover:text-gold/80 transition-colors"
          >
            <Users className="h-4 w-4" /> Mural da Turma
          </button>
        </div>

        <div className={cn("rounded-2xl p-6 mb-6 bg-gradient-to-br text-white", selectedChallenge.gradient)}>
          <div className="flex items-center gap-3 mb-3">
            {selectedChallenge.icon}
            <div>
              <h2 className="text-lg font-display font-bold">{selectedChallenge.title}</h2>
              <p className="text-xs opacity-80">{selectedChallenge.theme} · {selectedChallenge.days} dias</p>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden mb-2">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs opacity-80">{completedDays.size}/{selectedChallenge.days} dias concluídos</p>
        </div>

        <div className="flex items-center gap-2 mb-4 text-sm font-body text-muted-foreground">
          <Flame className="h-4 w-4 text-orange-400" />
          <span>{getParticipantCount(selectedChallenge.id)} meninas participando</span>
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {Array.from({ length: selectedChallenge.days }, (_, i) => {
            const day = i + 1;
            const done = completedDays.has(day);
            const justDone = justCompletedDay === day;
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={cn(
                  "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 relative",
                  done
                    ? "bg-gold text-white shadow-[0_0_12px_hsl(43,72%,52%/0.5)]"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 border border-border"
                )}
              >
                {done ? (
                  <FourPointStar
                    size={16}
                    fill="white"
                    className={cn("text-white", justDone && "animate-star-pulse")}
                  />
                ) : (
                  day
                )}
                {justDone && (
                  <div className="absolute inset-0 rounded-xl animate-ping bg-gold/30 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Daily tasks - clickable */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="text-sm font-display font-semibold mb-1">Tarefas do Dia</h3>
          <p className="text-[10px] text-muted-foreground font-body mb-3">Toque em cada tarefa para ver a explicação científica e o passo a passo</p>
          <div className="space-y-2">
            {selectedChallenge.tasks.map((task, i) => (
              <button
                key={i}
                onClick={() => setSelectedTask(task)}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 w-full text-left hover:bg-gold/10 hover:border-gold/30 border border-transparent transition-all group"
              >
                <span className="text-lg shrink-0">{task.icon}</span>
                <span className="text-sm font-body flex-1">{task.name}</span>
                <span className="text-[10px] text-muted-foreground group-hover:text-gold transition-colors">ver mais →</span>
              </button>
            ))}
          </div>
        </div>

        <TaskDetailModal task={selectedTask} open={!!selectedTask} onClose={() => setSelectedTask(null)} />
        <NPSModal open={showNPS} onClose={() => setShowNPS(false)} challengeTitle={selectedChallenge.title} />
      </div>
    );
  }

  // ─── Challenge Selection ────────────────────────────────────────────────────

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="h-5 w-5 text-gold" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Desafios</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Escolha sua jornada de transformação. Cada tarefa tem fundamentação científica e exercícios práticos para a mulher brasileira moderna.</p>
      </div>

      <div className="space-y-4">
        {CHALLENGES.map((challenge, idx) => {
          const joined = isJoined(challenge.id);
          const participants = getParticipantCount(challenge.id);
          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-brand cursor-pointer animate-fade-in",
                challenge.borderColor
              )}
              style={{ animationDelay: `${idx * 80}ms` }}
              onClick={() => joined ? setSelectedChallenge(challenge) : undefined}
            >
              <div className={cn("bg-gradient-to-r p-5 text-white", challenge.gradient)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {challenge.icon}
                    <div>
                      <h3 className="font-display font-bold text-base">{challenge.title}</h3>
                      <p className="text-xs opacity-80">{challenge.theme} · {challenge.days} dias</p>
                    </div>
                  </div>
                  {challenge.days >= 60 && (
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-body">ELITE</span>
                  )}
                </div>
                <p className="text-xs opacity-80 mt-2 font-body leading-relaxed">{challenge.description}</p>
              </div>
              <div className="bg-card px-5 py-3 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
                  <Flame className="h-3.5 w-3.5 text-orange-400" />
                  {participants} meninas participando
                </span>
                {joined ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs border-gold text-gold hover:bg-gold/10"
                    onClick={(e) => { e.stopPropagation(); setSelectedChallenge(challenge); }}
                  >
                    Continuar
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs bg-gold hover:bg-gold/90 text-white"
                    onClick={(e) => { e.stopPropagation(); handleJoin(challenge); }}
                  >
                    Participar também
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
