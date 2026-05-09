import { useState } from "react";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, subDays, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

const affirmations = [
  {
    text: "Eu sou digna de amor, sucesso e abundância.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Fique 2 minutos em frente ao espelho, repita a afirmação 7 vezes e escreva uma ação que honre seu valor hoje.",
  },
  {
    text: "Eu sou forte, capaz e corajosa.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Escolha a tarefa que você vem adiando e execute por 15 minutos sem interrupção, repetindo a afirmação antes.",
  },
  {
    text: "A abundância flui naturalmente para mim.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Anote 10 motivos pelos quais é grata financeiramente, do menor ao maior.",
  },
  {
    text: "Eu sou grata por tudo que tenho e tudo que está a caminho.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Escreva 3 gratidões pelo presente e 3 antecipadas pelo que está vindo.",
  },
  {
    text: "Eu perdoo, me liberto e sigo em paz.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Escreva uma carta de perdão (para si ou alguém) e depois rasgue ou queime como ritual de liberação.",
  },
  {
    text: "Minha energia é magnética e positiva.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Faça uma caminhada de 10 minutos em postura ereta, respirando fundo, com foco em gratidão.",
  },
  {
    text: "Eu mereço o melhor e o melhor vem até mim.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Anote 3 áreas em que aceita mais qualidade e defina 1 atitude concreta para elevar seu padrão hoje.",
  },
  {
    text: "Eu confio no meu processo e no meu tempo.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Escreva 3 conquistas que já alcançou e que antes pareciam impossíveis. Releia com gratidão.",
  },
  {
    text: "Eu escolho pensamentos que me fortalecem.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Por 1 hora, observe seus pensamentos e a cada um negativo substitua conscientemente por um positivo.",
  },
  {
    text: "Eu sou a criadora da minha realidade.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escolha uma área da vida para transformar e escreva 3 ações concretas para esta semana.",
  },
  {
    text: "Meu corpo é meu templo e eu cuido dele com amor.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Prepare uma refeição nutritiva com carinho, agradeça pelo alimento e coma sem distrações.",
  },
  {
    text: "Eu libero o que não me serve e abro espaço para o novo.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Separe 3 objetos, hábitos ou pensamentos que não te servem mais e se comprometa a liberá-los hoje.",
  },
  {
    text: "Minha intuição me guia para as melhores decisões.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Antes de tomar uma decisão hoje, feche os olhos, respire 3 vezes e pergunte ao coração o que sente.",
  },
  {
    text: "Eu me amo e me aceito exatamente como sou.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Olhe-se no espelho por 2 minutos e diga 'eu te amo' para si mesma com ternura.",
  },
  {
    text: "Eu atraio pessoas e situações que elevam minha vida.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Identifique um relacionamento que precisa de limites e defina uma ação concreta para honrar seu bem-estar.",
  },
  {
    text: "Eu celebro minhas vitórias, grandes e pequenas.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Liste 5 vitórias da última semana, por menores que sejam, e celebre cada uma com um gesto de gratidão.",
  },
  {
    text: "Eu escolho a alegria como meu estado natural.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Dance uma música que ama por 3 minutos, sem se importar com nada ao redor.",
  },
  {
    text: "Eu honro meus limites e protejo minha energia.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Identifique 1 situação onde precisa dizer 'não' e pratique dizê-lo com firmeza e gentileza.",
  },
  {
    text: "Minha paz interior é inabalável.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Medite por 5 minutos focando apenas na respiração — a cada pensamento invasor, volte ao ar.",
  },
  {
    text: "Eu sou suficiente exatamente como estou agora.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Identifique uma cobrança interna excessiva e conscientemente solte, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "O universo conspira a meu favor.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Observe 3 sinais positivos ao longo do dia e anote-os como evidências de que algo maior te apoia.",
  },
  {
    text: "Minha energia é renovada a cada respiração.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Faça 10 respirações profundas (4s inspira, 7s segura, 8s expira) e sinta a energia renovar.",
  },
  {
    text: "Minha disciplina de hoje constrói a mulher que serei amanhã.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Escolha 1 hábito que está construindo e execute-o hoje sem motivação, apenas por compromisso.",
  },
  {
    text: "Eu transformo desafios em aprendizados poderosos.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Pense em um desafio atual e escreva 3 lições que ele está te ensinando.",
  },
  {
    text: "Minha voz importa e merece ser ouvida.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Expresse uma opinião ou sentimento que vinha guardando, de forma respeitosa e firme.",
  },
  {
    text: "Eu tenho permissão para descansar sem culpa.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Reserve 30 minutos hoje exclusivamente para algo prazeroso, sem celular e sem culpa.",
  },
  {
    text: "Eu atraio pessoas e situações que elevam minha vida — dia 27.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Visualize por 5 minutos a vida que deseja, sentindo as emoções como se já fosse real.",
  },
  {
    text: "Eu confio no fluxo da vida.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Solte uma 'micro-tarefa' que você está controlando demais e veja o que acontece.",
  },
  {
    text: "Eu sou foco em movimento.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Faça 1 ciclo Pomodoro (25 min foco, 5 min pausa) na sua tarefa mais importante.",
  },
  {
    text: "Eu honro a mulher poderosa que vive em mim.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Identifique em qual fase do ciclo você está e adapte sua agenda a essa energia.",
  },
  {
    text: "Eu me amo e me aceito exatamente como sou — dia 31.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Liste 10 qualidades suas que você admira e mantenha a lista visível durante o dia.",
  },
  {
    text: "Eu transformo medo em movimento.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Faça uma ligação ou envie uma mensagem que vem evitando há mais de 7 dias.",
  },
  {
    text: "Eu sou um ímã de prosperidade.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Organize uma área da sua casa hoje — abundância gosta de espaço claro.",
  },
  {
    text: "A gratidão amplia tudo o que toca.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Envie uma mensagem de agradecimento sincera para alguém hoje.",
  },
  {
    text: "Eu solto o passado e abro espaço para o novo.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Sente-se em silêncio por 5 minutos visualizando a pessoa em luz e dizendo: 'eu te liberto'.",
  },
  {
    text: "Eu estou inteira em cada instante que vivo.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Coloque o celular no modo avião por 30 minutos e esteja inteira no que estiver fazendo.",
  },
  {
    text: "Eu recebo com naturalidade tudo que é meu por direito.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Reveja seu valor (preço, hora, salário) e ajuste mentalmente para o que você merece.",
  },
  {
    text: "Cada etapa tem seu propósito.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Reduza o tempo nas redes sociais por 24h para silenciar a comparação.",
  },
  {
    text: "Minha mente trabalha a meu favor.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Identifique uma frase autossabotadora recorrente e escreva sua versão reprogramada.",
  },
  {
    text: "Eu sou protagonista da minha história.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escreva o próximo capítulo da sua história como gostaria que fosse e dê o primeiro passo hoje.",
  },
  {
    text: "Meu corpo é forte, saudável e cheio de vitalidade.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Beba 2 litros de água ao longo do dia, com lembretes a cada 1 hora.",
  },
  {
    text: "Cada dia é uma nova oportunidade de recomeçar.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Escreva o que não dá mais certo e dê um destino simbólico (queimar, rasgar, enterrar).",
  },
  {
    text: "Eu confio na voz que mora dentro de mim.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Anote uma decisão recente em que sua intuição acertou — relembre como foi a sensação no corpo.",
  },
  {
    text: "Meu amor por mim é incondicional.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Faça um programa solo hoje — um café, um passeio, um cinema sozinha.",
  },
  {
    text: "Eu sou merecedora de relacionamentos saudáveis e amorosos.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Mande uma mensagem genuína para alguém que você admira.",
  },
  {
    text: "Eu reconheço o quanto já caminhei.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Marque uma comemoração simples para uma conquista que passou em branco.",
  },
  {
    text: "Leveza é meu padrão.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Faça algo prazeroso por 15 minutos sem culpa e sem propósito de produtividade.",
  },
  {
    text: "Meu 'não' é um sim para mim mesma.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Bloqueie uma janela do dia só sua e proteja como compromisso inadiável.",
  },
  {
    text: "Eu encontro calma mesmo no caos externo.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Faça 4-7-8 (4s inspira, 7s segura, 8s expira) por 5 ciclos.",
  },
  {
    text: "Eu pertenço aos espaços que ocupo.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Liste 5 evidências objetivas que provam que você merece seu lugar.",
  },
  {
    text: "Eu sou guiada por uma força maior.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Acenda uma vela e faça um pedido sincero, sentindo gratidão antecipada.",
  },
  {
    text: "Eu sou cheia de vida e disposição.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Caminhe por 15 minutos ao ar livre, de preferência ao sol da manhã.",
  },
  {
    text: "Eu sou consistente mesmo quando ninguém está olhando.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Defina 3 não-negociáveis para a semana e marque na agenda.",
  },
  {
    text: "Eu sou maior que qualquer dificuldade.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Liste 3 desafios que você superou no passado e reconheça sua força.",
  },
  {
    text: "Eu falo com clareza e firmeza.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Peça algo que você precisa hoje sem suavizar com excesso de palavras.",
  },
  {
    text: "Descanso é parte da minha alta performance.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Tire uma soneca de 20 minutos hoje, mesmo que pareça improdutivo.",
  },
  {
    text: "Eu vibro na frequência do que desejo.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Escreva uma cena específica do futuro como se ela já tivesse acontecido.",
  },
  {
    text: "Eu danço com o que vem em vez de lutar contra.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Por 24h, evite reclamar do imprevisto — apenas adapte-se.",
  },
  {
    text: "Eu protejo minha atenção como capital escasso.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Coloque o celular em outro cômodo enquanto trabalha por 50 minutos.",
  },
  {
    text: "Eu abraço minha sensibilidade como força.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Use uma roupa, joia ou ritual que conecte com sua feminilidade hoje.",
  },
  {
    text: "Eu sou suficiente exatamente como estou agora — dia 61.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Anote uma cobrança interna excessiva e a solte conscientemente, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "Eu ajo mesmo com medo, porque o medo não decide por mim.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Anote o pior cenário possível, releia e veja que você sobreviveria a ele.",
  },
  {
    text: "Dinheiro vem com facilidade e propósito para a minha vida.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Defina 1 meta financeira e a primeira ação concreta para esta semana.",
  },
  {
    text: "Eu encontro motivos de gratidão até nos pequenos detalhes.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Antes de dormir, liste mentalmente 5 coisas boas do dia.",
  },
  {
    text: "Perdoar é um presente que dou a mim mesma.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Identifique uma mágoa e pergunte: o que essa dor veio me ensinar?",
  },
  {
    text: "Minha presença transforma os ambientes que ocupo.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Coma uma refeição em silêncio, prestando atenção em cada sabor e textura.",
  },
  {
    text: "Eu sou digna de relacionamentos saudáveis e amorosos.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Aceite um elogio hoje sem desconversar — apenas diga 'obrigada'.",
  },
  {
    text: "Eu confio que o que é meu não me perde.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Liste 1 coisa que aconteceu no tempo certo na sua vida e agradeça por ela.",
  },
  {
    text: "Eu instalo crenças que me elevam.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Antes de dormir, repita 7 vezes uma afirmação que represente quem você quer se tornar.",
  },
  {
    text: "Minhas escolhas constroem minha vida.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Defina uma intenção para o dia em uma única frase e leia em voz alta.",
  },
  {
    text: "Eu honro meu corpo com escolhas conscientes.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Movimente-se por 20 minutos hoje — caminhada, dança ou alongamento.",
  },
  {
    text: "Eu solto o velho com gratidão.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Limpe uma gaveta ou pasta digital — entregue espaço para o novo entrar.",
  },
  {
    text: "Eu escuto meu coração antes de seguir.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Por 10 minutos, fique em silêncio sem celular e apenas escute o que vem.",
  },
  {
    text: "Eu sou minha primeira prioridade saudável.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Escreva uma carta de amor para si mesma e leia em voz alta.",
  },
  {
    text: "Eu cultivo conexões verdadeiras.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Faça uma lista das suas 5 pessoas-luz e dedique tempo de qualidade a uma delas hoje.",
  },
  {
    text: "Cada conquista merece ser comemorada.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Compartilhe uma vitória sua com alguém de confiança hoje.",
  },
  {
    text: "Eu rio mais e me preocupo menos.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Liste 5 coisas pequenas que te dão prazer e faça pelo menos 1 hoje.",
  },
  {
    text: "Eu não preciso me explicar para preservar minha paz.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Silencie 1 grupo, perfil ou notificação que te drena.",
  },
  {
    text: "Eu cultivo paz como prática diária.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Saia para 10 minutos de silêncio sem celular ao ar livre.",
  },
  {
    text: "Eu mereço estar onde estou.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Compartilhe uma ideia ou opinião num espaço onde costuma se silenciar.",
  },
  {
    text: "Eu confio na inteligência divina da vida.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Leia um trecho de um livro espiritual ou religioso que te inspire por 10 minutos.",
  },
  {
    text: "Vitalidade pulsa em mim.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Tome um copo de água com limão ao acordar amanhã.",
  },
  {
    text: "Eu honro meus compromissos comigo.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Coloque um lembrete diário no celular para o hábito mais importante.",
  },
  {
    text: "Cada queda me torna mais forte.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Pergunte: como esse problema pode ser uma oportunidade?",
  },
  {
    text: "Eu defendo minhas ideias com elegância.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Grave um áudio de 1 minuto compartilhando uma ideia sua e ouça depois.",
  },
  {
    text: "Eu sei que o descanso me torna mais produtiva.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Programe um banho longo e em silêncio hoje à noite.",
  },
  {
    text: "Eu sou um ímã para o bem.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Defina 1 desejo claro e dê 1 passo físico em direção a ele hoje.",
  },
  {
    text: "Eu permito que tudo se ajuste.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Quando algo der errado hoje, pergunte 'e o que isso me ensina?' antes de reagir.",
  },
  {
    text: "Eu termino o que começo.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Defina a tarefa mais importante do dia e a faça antes de tudo amanhã.",
  },
  {
    text: "Eu sou potente em minha feminilidade.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Acenda uma vela e dance descalça por 5 minutos.",
  },
  {
    text: "Eu sou luz e minha presença ilumina os ambientes.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Escolha uma roupa que te faz sentir poderosa e use sem ocasião especial.",
  },
  {
    text: "Eu enfrento o desconhecido com confiança.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Tome uma decisão pequena em até 60 segundos, sem pesquisar mais.",
  },
  {
    text: "Eu mereço prosperidade em todas as áreas.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Ofereça algo de valor (tempo, conhecimento, ajuda) sem esperar retorno.",
  },
  {
    text: "Meu coração agradece em silêncio e em voz alta.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Coloque uma mão no peito por 1 minuto e agradeça pela respiração.",
  },
  {
    text: "Eu liberto mágoas que pesavam no meu coração.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Liste 3 situações em que você precisa se perdoar e diga em voz alta: 'eu me perdoo'.",
  },
  {
    text: "Eu respiro o agora com profundidade.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Por 3 minutos, observe os 5 sentidos: o que você vê, ouve, sente, cheira, prova.",
  },
  {
    text: "Eu mereço espaço, voz e respeito.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Faça uma pequena mimo gentileza para si: flor, chá especial, banho demorado.",
  },
  {
    text: "Eu solto a pressa e abraço a constância.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Faça uma única tarefa hoje sem pressa, com presença e cuidado total.",
  },
  {
    text: "Eu reescrevo histórias que me limitam.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Coloque um lembrete no celular com uma crença nova para olhar 3x ao dia.",
  },
  {
    text: "Eu não espero — eu crio.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Identifique uma área onde você se vê como vítima e reescreva como criadora.",
  },
  {
    text: "Cada célula do meu corpo trabalha em harmonia.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Olhe-se no espelho e agradeça uma parte do seu corpo que você costuma criticar.",
  },
  {
    text: "Eu me permito recomeçar quantas vezes precisar.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Liste o que você está pronta para encerrar e o que está pronta para começar.",
  },
  {
    text: "Minha sabedoria interior é precisa.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Faça 3 perguntas ao seu coração hoje e escreva a primeira resposta que surgir.",
  },
  {
    text: "Eu cuido de mim com a ternura que ofereço aos outros.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Diga 'não' a um pedido que vai contra suas necessidades hoje.",
  },
  {
    text: "Eu valorizo quem me valoriza.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Pratique escuta profunda em uma conversa hoje — sem interromper, sem aconselhar.",
  },
  {
    text: "Eu me orgulho da minha trajetória.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Escreva 'eu sou orgulhosa de mim porque...' e complete com 5 motivos.",
  },
  {
    text: "A vida pode ser leve e plena ao mesmo tempo.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Coloque uma playlist favorita enquanto realiza uma tarefa do dia.",
  },
  {
    text: "Eu protejo meu tempo como recurso sagrado.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Antes de aceitar algo hoje, respire 3 vezes e pergunte: isso é meu sim?",
  },
  {
    text: "Eu volto ao centro com facilidade.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Coloque uma mão no peito e outra no ventre por 3 minutos, respirando profundo.",
  },
  {
    text: "Eu sou competente e capaz, mesmo aprendendo ainda.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Anote 3 conquistas e ao lado o nome da habilidade real que te levou a elas.",
  },
  {
    text: "Eu sou parte de algo maior que mim.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Faça uma oração ou intenção pela manhã antes de começar o dia.",
  },
  {
    text: "Eu nutro minha energia com escolhas conscientes.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Faça 3 minutos de polichinelos ou dança vibrante.",
  },
  {
    text: "Disciplina é a forma mais alta de amor próprio.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Marque um pacto comigo: 30 dias seguidos de 1 ação que muda meu jogo.",
  },
  {
    text: "Eu me reergo quantas vezes for preciso.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Escreva uma carta de você-do-futuro agradecendo por ter atravessado essa fase.",
  },
  {
    text: "Eu não me silencio para acomodar ninguém.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Compartilhe uma opinião sincera em uma conversa importante.",
  },
  {
    text: "Eu honro meu corpo com pausas reais.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Leia um livro por 30 minutos sem produtividade nenhuma.",
  },
  {
    text: "Aquilo que cultivo dentro, atraio para fora.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Crie uma 'evidência futura' — um objeto, foto ou frase que represente o que vem.",
  },
  {
    text: "O imprevisto também faz parte do plano.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Marque a semana sem agenda fechada por 1 tarde para fluir.",
  },
  {
    text: "Eu escolho profundidade em vez de dispersão.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Liste 3 prioridades e elimine o resto da to-do de hoje.",
  },
  {
    text: "Minhas curvas, ciclos e instintos são sagrados.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Escreva uma carta para a mulher que você está se tornando.",
  },
  {
    text: "Eu sou rara, valiosa e insubstituível.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Envie uma mensagem para si mesma reconhecendo um talento que você costuma diminuir.",
  },
  {
    text: "Eu sou maior que qualquer obstáculo no meu caminho.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Identifique 1 medo e dê 1 passo concreto que vai na direção dele hoje.",
  },
  {
    text: "Eu recebo com leveza tudo que é meu por direito.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Revise um gasto e renegocie ou cancele o que não te serve mais.",
  },
  {
    text: "Cada manhã é um presente que recebo com reverência.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Tire uma foto de algo que te alegrou hoje e relembre antes de dormir.",
  },
  {
    text: "Eu me perdoo por tudo que fiz sem saber o que sei hoje.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Escreva 'eu solto' seguido de algo que carrega há tempos. Repita 7 vezes.",
  },
  {
    text: "O presente é onde minha força acontece.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Antes de cada tarefa, pare e respire 3 vezes — só depois comece.",
  },
  {
    text: "Eu mereço ser cuidada com a mesma intensidade com que cuido.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Identifique uma situação em que você aceita menos do que merece e crie um plano de saída.",
  },
  {
    text: "O tempo certo está construindo minha base.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Escreva uma carta da sua versão futura te dizendo: 'eu estou orgulhosa do seu ritmo'.",
  },
  {
    text: "Eu observo meus pensamentos sem ser deles refém.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Escreva no espelho com batom uma frase que reprograma sua manhã.",
  },
  {
    text: "Eu sou autora, diretora e atriz da minha jornada.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Visualize por 5 minutos o final do seu dia ideal — depois aja para que aconteça.",
  },
  {
    text: "Eu agradeço meu corpo por tudo que ele faz por mim.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Durma com 8 horas de janela hoje — coloque um alarme para começar a se preparar.",
  },
  {
    text: "Eu sou um ciclo de renovação constante.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Cancele uma assinatura, uma rotina ou um compromisso que não vibra mais com você.",
  },
  {
    text: "Eu reconheço quando algo é meu pelo coração.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Diga 'não' a algo hoje só porque seu corpo pediu, sem precisar justificar.",
  },
  {
    text: "Eu mereço o tipo de amor que dou.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Marque na agenda 30 minutos para você, intransferíveis.",
  },
  {
    text: "Eu escolho com quem compartilho minha energia.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Defina um limite que você vinha adiando e comunique com firmeza e gentileza.",
  },
  {
    text: "Eu honro cada passo dado.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Celebre uma micro-meta com uma pausa especial — música, dança, café.",
  },
  {
    text: "Eu permito a alegria ser comum no meu dia.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Sorria sem motivo por 60 segundos — observe o efeito no seu humor.",
  },
  {
    text: "Limites saudáveis criam relações saudáveis.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Reescreva 1 'sim' que você dá por automatismo em um 'não' consciente.",
  },
  {
    text: "Minha respiração é meu refúgio.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Antes de responder algo difícil, respire 3 vezes e só depois fale.",
  },
  {
    text: "Eu confio na minha trajetória.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Substitua 'eu acho' por 'eu sei' em uma conversa hoje.",
  },
  {
    text: "Sinais aparecem para quem está atenta.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Pratique 5 minutos de silêncio contemplativo conectada ao sagrado.",
  },
  {
    text: "Cada dia eu desperto com mais vigor.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Reduza 1 hora de tela hoje e durma 30 minutos mais cedo.",
  },
  {
    text: "Eu prefiro a dor da disciplina à dor do arrependimento.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Faça 10 minutos do que você procrastina antes de qualquer outra coisa hoje.",
  },
  {
    text: "Eu encontro flexibilidade no meio da pressão.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Faça hoje 1 ação concreta para resolver parte de um problema atual.",
  },
  {
    text: "Eu compartilho o que sei com generosidade.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Diga em voz alta, no espelho, uma verdade que você costuma esconder.",
  },
  {
    text: "Eu não confundo cansaço com fraqueza.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Cancele um compromisso não essencial hoje e descanse no lugar.",
  },
  {
    text: "Eu manifesto com clareza e fé.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Diga 'já é meu' 3 vezes ao olhar para um desejo seu.",
  },
  {
    text: "Eu solto o controle e sigo guiada.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Improvise sua tarde de hoje sem planos rígidos, só pelo que pedir.",
  },
  {
    text: "Eu sou capaz de focar por longos períodos.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Trabalhe com música instrumental ou silêncio por 1 hora.",
  },
  {
    text: "Eu confio nas fases do meu corpo.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Faça um automassagem com óleo nos pés ou nos ombros antes de dormir.",
  },
  {
    text: "Eu reconheço minha grandeza sem precisar provar nada.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Fique 2 minutos em frente ao espelho, repita a afirmação 7 vezes e escreva uma ação que honre seu valor hoje.",
  },
  {
    text: "Cada passo que dou expande minha coragem.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Escolha a tarefa que você vem adiando e execute por 15 minutos sem interrupção, repetindo a afirmação antes.",
  },
  {
    text: "Minha mente está aberta para novas formas de receber.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Anote 10 motivos pelos quais é grata financeiramente, do menor ao maior.",
  },
  {
    text: "Eu agradeço pela mulher que estou me tornando.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Escreva 3 gratidões pelo presente e 3 antecipadas pelo que está vindo.",
  },
  {
    text: "Eu escolho leveza em vez de ressentimento.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Escreva uma carta de perdão (para si ou alguém) e depois rasgue ou queime como ritual de liberação.",
  },
  {
    text: "Eu não me perco no passado nem no futuro.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Faça uma caminhada de 10 minutos em postura ereta, respirando fundo, com foco em gratidão.",
  },
  {
    text: "Eu aceito o bem que chega até mim sem culpa.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Anote 3 áreas em que aceita mais qualidade e defina 1 atitude concreta para elevar seu padrão hoje.",
  },
  {
    text: "Eu confio em mim mesma mesmo quando não vejo o caminho inteiro.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Escreva 3 conquistas que já alcançou e que antes pareciam impossíveis. Releia com gratidão.",
  },
  {
    text: "Eu sou a editora da minha narrativa interna.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Por 1 hora, observe seus pensamentos e a cada um negativo substitua conscientemente por um positivo.",
  },
  {
    text: "Eu modelo a vida que quero viver.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escolha uma área da vida para transformar e escreva 3 ações concretas para esta semana.",
  },
  {
    text: "Eu nutro meu corpo com alimentos vivos e amorosos.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Prepare uma refeição nutritiva com carinho, agradeça pelo alimento e coma sem distrações.",
  },
  {
    text: "Eu encerro capítulos com elegância.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Separe 3 objetos, hábitos ou pensamentos que não te servem mais e se comprometa a liberá-los hoje.",
  },
  {
    text: "Eu sigo o sim e respeito o não que vem de dentro.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Antes de tomar uma decisão hoje, feche os olhos, respire 3 vezes e pergunte ao coração o que sente.",
  },
  {
    text: "Eu honro minhas necessidades sem culpa.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Olhe-se no espelho por 2 minutos e diga 'eu te amo' para si mesma com ternura.",
  },
  {
    text: "Minhas relações refletem o amor que cultivo dentro de mim.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Identifique um relacionamento que precisa de limites e defina uma ação concreta para honrar seu bem-estar.",
  },
  {
    text: "Festejo o progresso, não só o destino.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Liste 5 vitórias da última semana, por menores que sejam, e celebre cada uma com um gesto de gratidão.",
  },
  {
    text: "Eu sou fonte de alegria para mim mesma.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Dance uma música que ama por 3 minutos, sem se importar com nada ao redor.",
  },
  {
    text: "Eu posso amar e dizer não ao mesmo tempo.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Identifique 1 situação onde precisa dizer 'não' e pratique dizê-lo com firmeza e gentileza.",
  },
  {
    text: "Eu não permito que o externo decida minha paz.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Medite por 5 minutos focando apenas na respiração — a cada pensamento invasor, volte ao ar.",
  },
  {
    text: "Minha voz tem valor mesmo entre vozes mais experientes.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Identifique uma cobrança interna excessiva e conscientemente solte, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "Eu sou canal de luz e propósito.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Observe 3 sinais positivos ao longo do dia e anote-os como evidências de que algo maior te apoia.",
  },
  {
    text: "Eu cuido das minhas fontes de energia.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Faça 10 respirações profundas (4s inspira, 7s segura, 8s expira) e sinta a energia renovar.",
  },
  {
    text: "Eu construo a vida que quero, um dia de cada vez.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Escolha 1 hábito que está construindo e execute-o hoje sem motivação, apenas por compromisso.",
  },
  {
    text: "Eu sou resiliente sem ser rígida.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Pense em um desafio atual e escreva 3 lições que ele está te ensinando.",
  },
  {
    text: "Eu uso minha voz para inspirar.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Expresse uma opinião ou sentimento que vinha guardando, de forma respeitosa e firme.",
  },
  {
    text: "Eu permito meu sistema se restaurar.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Reserve 30 minutos hoje exclusivamente para algo prazeroso, sem celular e sem culpa.",
  },
  {
    text: "Eu sou alvo natural de oportunidades.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Visualize por 5 minutos a vida que deseja, sentindo as emoções como se já fosse real.",
  },
  {
    text: "Eu colaboro com a vida em vez de forçá-la.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Solte uma 'micro-tarefa' que você está controlando demais e veja o que acontece.",
  },
  {
    text: "Foco é meu superpoder.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Faça 1 ciclo Pomodoro (25 min foco, 5 min pausa) na sua tarefa mais importante.",
  },
  {
    text: "Eu sou doce e firme, suave e poderosa.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Identifique em qual fase do ciclo você está e adapte sua agenda a essa energia.",
  },
  {
    text: "Eu honro a mulher poderosa que vive em mim — dia 181.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Liste 10 qualidades suas que você admira e mantenha a lista visível durante o dia.",
  },
  {
    text: "Eu confio na minha capacidade de me adaptar.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Faça uma ligação ou envie uma mensagem que vem evitando há mais de 7 dias.",
  },
  {
    text: "Quanto mais eu prospero, mais eu posso servir.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Organize uma área da sua casa hoje — abundância gosta de espaço claro.",
  },
  {
    text: "Gratidão é o portal da minha próxima conquista.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Envie uma mensagem de agradecimento sincera para alguém hoje.",
  },
  {
    text: "Eu honro minhas dores e sigo em frente.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Sente-se em silêncio por 5 minutos visualizando a pessoa em luz e dizendo: 'eu te liberto'.",
  },
  {
    text: "Estar presente é meu superpoder.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Coloque o celular no modo avião por 30 minutos e esteja inteira no que estiver fazendo.",
  },
  {
    text: "Eu permito que a vida me presenteie.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Reveja seu valor (preço, hora, salário) e ajuste mentalmente para o que você merece.",
  },
  {
    text: "Minha jornada não precisa ser igual à de ninguém.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Reduza o tempo nas redes sociais por 24h para silenciar a comparação.",
  },
  {
    text: "Pensamento bom é hábito que eu cultivo.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Identifique uma frase autossabotadora recorrente e escreva sua versão reprogramada.",
  },
  {
    text: "Eu transformo intenção em ação.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escreva o próximo capítulo da sua história como gostaria que fosse e dê o primeiro passo hoje.",
  },
  {
    text: "Movimento é amor que ofereço ao meu corpo.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Beba 2 litros de água ao longo do dia, com lembretes a cada 1 hora.",
  },
  {
    text: "O fim de algo é o início de outra coisa.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Escreva o que não dá mais certo e dê um destino simbólico (queimar, rasgar, enterrar).",
  },
  {
    text: "Eu confio nas mensagens que recebo.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Anote uma decisão recente em que sua intuição acertou — relembre como foi a sensação no corpo.",
  },
  {
    text: "Eu escolho me colocar em primeiro lugar quando preciso.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Faça um programa solo hoje — um café, um passeio, um cinema sozinha.",
  },
  {
    text: "Eu honro minhas amizades como tesouros.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Mande uma mensagem genuína para alguém que você admira.",
  },
  {
    text: "Eu reconheço meu esforço e me parabenizo.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Marque uma comemoração simples para uma conquista que passou em branco.",
  },
  {
    text: "Eu cultivo o belo nas pequenas coisas.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Faça algo prazeroso por 15 minutos sem culpa e sem propósito de produtividade.",
  },
  {
    text: "Eu cuido da minha energia com clareza.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Bloqueie uma janela do dia só sua e proteja como compromisso inadiável.",
  },
  {
    text: "Eu escolho serenidade em vez de reação.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Faça 4-7-8 (4s inspira, 7s segura, 8s expira) por 5 ciclos.",
  },
  {
    text: "Eu não preciso ser perfeita para ser excelente.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Liste 5 evidências objetivas que provam que você merece seu lugar.",
  },
  {
    text: "Eu coopero com o fluxo da existência.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Acenda uma vela e faça um pedido sincero, sentindo gratidão antecipada.",
  },
  {
    text: "Eu durmo bem, como bem, vivo bem.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Caminhe por 15 minutos ao ar livre, de preferência ao sol da manhã.",
  },
  {
    text: "Eu cumpro o combinado comigo.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Defina 3 não-negociáveis para a semana e marque na agenda.",
  },
  {
    text: "Eu confio na minha capacidade de superar.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Liste 3 desafios que você superou no passado e reconheça sua força.",
  },
  {
    text: "Eu peço o que preciso sem rodeios.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Peça algo que você precisa hoje sem suavizar com excesso de palavras.",
  },
  {
    text: "Pausar é também construir.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Tire uma soneca de 20 minutos hoje, mesmo que pareça improdutivo.",
  },
  {
    text: "Eu visualizo e ajo, e a vida coopera.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Escreva uma cena específica do futuro como se ela já tivesse acontecido.",
  },
  {
    text: "Eu encontro graça nos desvios.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Por 24h, evite reclamar do imprevisto — apenas adapte-se.",
  },
  {
    text: "Eu finalizo projetos com excelência.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Coloque o celular em outro cômodo enquanto trabalha por 50 minutos.",
  },
  {
    text: "Eu honro o feminino em todas as fases.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Use uma roupa, joia ou ritual que conecte com sua feminilidade hoje.",
  },
  {
    text: "Eu valorizo cada parte da minha jornada.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Anote uma cobrança interna excessiva e a solte conscientemente, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "Eu sou destemida diante das minhas escolhas.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Anote o pior cenário possível, releia e veja que você sobreviveria a ele.",
  },
  {
    text: "Eu cuido bem do que tenho e atraio mais.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Defina 1 meta financeira e a primeira ação concreta para esta semana.",
  },
  {
    text: "Eu vejo bênçãos onde antes via problemas.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Antes de dormir, liste mentalmente 5 coisas boas do dia.",
  },
  {
    text: "O perdão me devolve a minha energia.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Identifique uma mágoa e pergunte: o que essa dor veio me ensinar?",
  },
  {
    text: "Eu honro o agora com atenção plena.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Coma uma refeição em silêncio, prestando atenção em cada sabor e textura.",
  },
  {
    text: "Eu reconheço meu valor e cobro o que mereço.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Aceite um elogio hoje sem desconversar — apenas diga 'obrigada'.",
  },
  {
    text: "Eu honro meu ritmo sem culpa.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Liste 1 coisa que aconteceu no tempo certo na sua vida e agradeça por ela.",
  },
  {
    text: "Eu escolho o que ocupa minha mente.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Antes de dormir, repita 7 vezes uma afirmação que represente quem você quer se tornar.",
  },
  {
    text: "Eu construo, tijolo por tijolo, a vida dos meus sonhos.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Defina uma intenção para o dia em uma única frase e leia em voz alta.",
  },
  {
    text: "Eu escuto os sinais do meu corpo com respeito.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Movimente-se por 20 minutos hoje — caminhada, dança ou alongamento.",
  },
  {
    text: "Eu solto o que pesa e voo mais alto.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Limpe uma gaveta ou pasta digital — entregue espaço para o novo entrar.",
  },
  {
    text: "Eu sinto antes de pensar e isso me guia bem.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Por 10 minutos, fique em silêncio sem celular e apenas escute o que vem.",
  },
  {
    text: "Eu sou minha melhor companhia.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Escreva uma carta de amor para si mesma e leia em voz alta.",
  },
  {
    text: "Eu não preciso convencer ninguém a me amar.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Faça uma lista das suas 5 pessoas-luz e dedique tempo de qualidade a uma delas hoje.",
  },
  {
    text: "Eu transformo conquista em combustível.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Compartilhe uma vitória sua com alguém de confiança hoje.",
  },
  {
    text: "Alegria é uma escolha que faço todos os dias.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Liste 5 coisas pequenas que te dão prazer e faça pelo menos 1 hoje.",
  },
  {
    text: "Eu escolho o que entra na minha vida.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Silencie 1 grupo, perfil ou notificação que te drena.",
  },
  {
    text: "A paz mora em mim e me acompanha.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Saia para 10 minutos de silêncio sem celular ao ar livre.",
  },
  {
    text: "Eu reconheço que conquistei meu lugar.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Compartilhe uma ideia ou opinião num espaço onde costuma se silenciar.",
  },
  {
    text: "Minha fé sustenta meus passos.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Leia um trecho de um livro espiritual ou religioso que te inspire por 10 minutos.",
  },
  {
    text: "Eu sou ativa e descansada na medida certa.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Tome um copo de água com limão ao acordar amanhã.",
  },
  {
    text: "Eu sou disciplinada com leveza, não com rigidez.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Coloque um lembrete diário no celular para o hábito mais importante.",
  },
  {
    text: "Eu cresço com o que tenta me derrubar.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Pergunte: como esse problema pode ser uma oportunidade?",
  },
  {
    text: "Eu digo o que penso com respeito.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Grave um áudio de 1 minuto compartilhando uma ideia sua e ouça depois.",
  },
  {
    text: "Eu protejo meu sono como prioridade.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Programe um banho longo e em silêncio hoje à noite.",
  },
  {
    text: "Eu confio nos sinais que recebo.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Defina 1 desejo claro e dê 1 passo físico em direção a ele hoje.",
  },
  {
    text: "Tudo que vem, vem para somar.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Quando algo der errado hoje, pergunte 'e o que isso me ensina?' antes de reagir.",
  },
  {
    text: "Eu uso meu tempo para o que importa.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Defina a tarefa mais importante do dia e a faça antes de tudo amanhã.",
  },
  {
    text: "Eu me conecto com minha intuição feminina.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Acenda uma vela e dance descalça por 5 minutos.",
  },
  {
    text: "Eu confio na minha beleza única.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Escolha uma roupa que te faz sentir poderosa e use sem ocasião especial.",
  },
  {
    text: "Eu tenho a coragem de começar, recomeçar e continuar.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Tome uma decisão pequena em até 60 segundos, sem pesquisar mais.",
  },
  {
    text: "Eu sou rica em propósito, presença e potencial.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Ofereça algo de valor (tempo, conhecimento, ajuda) sem esperar retorno.",
  },
  {
    text: "Eu honro o que recebo cuidando bem do que tenho.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Coloque uma mão no peito por 1 minuto e agradeça pela respiração.",
  },
  {
    text: "Eu permito que a cura comece agora.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Liste 3 situações em que você precisa se perdoar e diga em voz alta: 'eu me perdoo'.",
  },
  {
    text: "Minha consciência ilumina cada escolha.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Por 3 minutos, observe os 5 sentidos: o que você vê, ouve, sente, cheira, prova.",
  },
  {
    text: "Eu não me contento com o pouco quando sei que mereço o melhor.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Faça uma pequena mimo gentileza para si: flor, chá especial, banho demorado.",
  },
  {
    text: "Tudo se ajeita no tempo de Deus e no meu.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Faça uma única tarefa hoje sem pressa, com presença e cuidado total.",
  },
  {
    text: "Eu desinstalo crenças velhas e instalo novas.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Coloque um lembrete no celular com uma crença nova para olhar 3x ao dia.",
  },
  {
    text: "Minha realidade reflete minhas escolhas.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Identifique uma área onde você se vê como vítima e reescreva como criadora.",
  },
  {
    text: "Meu corpo merece descanso, prazer e cuidado.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Olhe-se no espelho e agradeça uma parte do seu corpo que você costuma criticar.",
  },
  {
    text: "Eu permito a transformação acontecer.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Liste o que você está pronta para encerrar e o que está pronta para começar.",
  },
  {
    text: "Minha intuição é uma bússola confiável.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Faça 3 perguntas ao seu coração hoje e escreva a primeira resposta que surgir.",
  },
  {
    text: "Eu sustento minha própria felicidade.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Diga 'não' a um pedido que vai contra suas necessidades hoje.",
  },
  {
    text: "Eu atraio pessoas alinhadas com a minha frequência.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Pratique escuta profunda em uma conversa hoje — sem interromper, sem aconselhar.",
  },
  {
    text: "Celebrar é gasolina para o que vem.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Escreva 'eu sou orgulhosa de mim porque...' e complete com 5 motivos.",
  },
  {
    text: "Eu danço com a vida em vez de lutar contra ela.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Coloque uma playlist favorita enquanto realiza uma tarefa do dia.",
  },
  {
    text: "Eu não sustento o que me esgota.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Antes de aceitar algo hoje, respire 3 vezes e pergunte: isso é meu sim?",
  },
  {
    text: "Eu solto o que tenta me tirar do eixo.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Coloque uma mão no peito e outra no ventre por 3 minutos, respirando profundo.",
  },
  {
    text: "Eu sou autoridade da minha história.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Anote 3 conquistas e ao lado o nome da habilidade real que te levou a elas.",
  },
  {
    text: "Eu sou guardada em todos os caminhos.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Faça uma oração ou intenção pela manhã antes de começar o dia.",
  },
  {
    text: "Eu protejo minha energia como recurso vital.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Faça 3 minutos de polichinelos ou dança vibrante.",
  },
  {
    text: "Eu transformo intenção em hábito.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Marque um pacto comigo: 30 dias seguidos de 1 ação que muda meu jogo.",
  },
  {
    text: "Eu transformo dor em sabedoria.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Escreva uma carta de você-do-futuro agradecendo por ter atravessado essa fase.",
  },
  {
    text: "Eu me posiciono mesmo quando é difícil.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Compartilhe uma opinião sincera em uma conversa importante.",
  },
  {
    text: "Eu mereço descansar mesmo sem ter feito tudo.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Leia um livro por 30 minutos sem produtividade nenhuma.",
  },
  {
    text: "Eu sintonizo com meus desejos com fé.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Crie uma 'evidência futura' — um objeto, foto ou frase que represente o que vem.",
  },
  {
    text: "Eu sou flexível e firme ao mesmo tempo.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Marque a semana sem agenda fechada por 1 tarde para fluir.",
  },
  {
    text: "Eu não me deixo capturar pelas distrações.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Liste 3 prioridades e elimine o resto da to-do de hoje.",
  },
  {
    text: "Eu acolho minha emoção como bússola.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Escreva uma carta para a mulher que você está se tornando.",
  },
  {
    text: "Eu sou a versão mais autêntica de mim mesma.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Envie uma mensagem para si mesma reconhecendo um talento que você costuma diminuir.",
  },
  {
    text: "A coragem mora em mim e cresce com a prática.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Identifique 1 medo e dê 1 passo concreto que vai na direção dele hoje.",
  },
  {
    text: "A vida me oferece abundância em múltiplas formas.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Revise um gasto e renegocie ou cancele o que não te serve mais.",
  },
  {
    text: "Minha vida é cheia de motivos para celebrar.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Tire uma foto de algo que te alegrou hoje e relembre antes de dormir.",
  },
  {
    text: "Eu perdoo sem precisar concordar.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Escreva 'eu solto' seguido de algo que carrega há tempos. Repita 7 vezes.",
  },
  {
    text: "Eu sou inteira aqui, agora.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Antes de cada tarefa, pare e respire 3 vezes — só depois comece.",
  },
  {
    text: "Eu mereço amor recíproco e profundo.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Identifique uma situação em que você aceita menos do que merece e crie um plano de saída.",
  },
  {
    text: "Eu não me comparo, eu me construo.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Escreva uma carta da sua versão futura te dizendo: 'eu estou orgulhosa do seu ritmo'.",
  },
  {
    text: "Minha mente é fértil para ideias poderosas.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Escreva no espelho com batom uma frase que reprograma sua manhã.",
  },
  {
    text: "Eu desenho minha próxima fase.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Visualize por 5 minutos o final do seu dia ideal — depois aja para que aconteça.",
  },
  {
    text: "Eu sou amiga do meu corpo, não algoz.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Durma com 8 horas de janela hoje — coloque um alarme para começar a se preparar.",
  },
  {
    text: "Eu acolho mudanças como aliadas.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Cancele uma assinatura, uma rotina ou um compromisso que não vibra mais com você.",
  },
  {
    text: "Eu valido o que sinto sem precisar provar.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Diga 'não' a algo hoje só porque seu corpo pediu, sem precisar justificar.",
  },
  {
    text: "Amor próprio é minha base, não meu luxo.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Marque na agenda 30 minutos para você, intransferíveis.",
  },
  {
    text: "Eu solto vínculos que me drenam.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Defina um limite que você vinha adiando e comunique com firmeza e gentileza.",
  },
  {
    text: "Eu não minimizo o que conquistei.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Celebre uma micro-meta com uma pausa especial — música, dança, café.",
  },
  {
    text: "Eu rio com facilidade e profundidade.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Sorria sem motivo por 60 segundos — observe o efeito no seu humor.",
  },
  {
    text: "Meu bem-estar é meu compromisso primeiro.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Reescreva 1 'sim' que você dá por automatismo em um 'não' consciente.",
  },
  {
    text: "Eu sou a calma no olho do furacão.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Antes de responder algo difícil, respire 3 vezes e só depois fale.",
  },
  {
    text: "Minhas conquistas são minhas, não acidentes.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Substitua 'eu acho' por 'eu sei' em uma conversa hoje.",
  },
  {
    text: "Conexão com o sagrado me orienta.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Pratique 5 minutos de silêncio contemplativo conectada ao sagrado.",
  },
  {
    text: "Eu recarrego antes de drenar.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Reduza 1 hora de tela hoje e durma 30 minutos mais cedo.",
  },
  {
    text: "Eu apareço para mim mesma todos os dias.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Faça 10 minutos do que você procrastina antes de qualquer outra coisa hoje.",
  },
  {
    text: "Eu não desisto de mim.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Faça hoje 1 ação concreta para resolver parte de um problema atual.",
  },
  {
    text: "Eu uso minha palavra como ponte.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Diga em voz alta, no espelho, uma verdade que você costuma esconder.",
  },
  {
    text: "Cuidar de mim é estratégia, não preguiça.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Cancele um compromisso não essencial hoje e descanse no lugar.",
  },
  {
    text: "Eu sou parte do fluxo da abundância.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Diga 'já é meu' 3 vezes ao olhar para um desejo seu.",
  },
  {
    text: "Eu confio no caminho mesmo na curva.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Improvise sua tarde de hoje sem planos rígidos, só pelo que pedir.",
  },
  {
    text: "Eu protejo a janela mais nobre do meu dia.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Trabalhe com música instrumental ou silêncio por 1 hora.",
  },
  {
    text: "Minha feminilidade é vasta e plural.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Faça um automassagem com óleo nos pés ou nos ombros antes de dormir.",
  },
  {
    text: "Minha autoestima vem de dentro, não de fora.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Fique 2 minutos em frente ao espelho, repita a afirmação 7 vezes e escreva uma ação que honre seu valor hoje.",
  },
  {
    text: "Eu escolho a ação em vez da paralisia.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Escolha a tarefa que você vem adiando e execute por 15 minutos sem interrupção, repetindo a afirmação antes.",
  },
  {
    text: "Eu solto a mentalidade de escassez e abraço a expansão.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Anote 10 motivos pelos quais é grata financeiramente, do menor ao maior.",
  },
  {
    text: "Eu reconheço a abundância que já está aqui.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Escreva 3 gratidões pelo presente e 3 antecipadas pelo que está vindo.",
  },
  {
    text: "Eu solto o que me prende ao que já passou.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Escreva uma carta de perdão (para si ou alguém) e depois rasgue ou queime como ritual de liberação.",
  },
  {
    text: "Eu escolho atenção em vez de dispersão.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Faça uma caminhada de 10 minutos em postura ereta, respirando fundo, com foco em gratidão.",
  },
  {
    text: "Eu mereço viver com leveza e prazer.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Anote 3 áreas em que aceita mais qualidade e defina 1 atitude concreta para elevar seu padrão hoje.",
  },
  {
    text: "Cada dia me aproxima de quem eu quero ser.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Escreva 3 conquistas que já alcançou e que antes pareciam impossíveis. Releia com gratidão.",
  },
  {
    text: "Eu programo minha mente para o sucesso.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Por 1 hora, observe seus pensamentos e a cada um negativo substitua conscientemente por um positivo.",
  },
  {
    text: "O que eu acredito, eu manifesto.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escolha uma área da vida para transformar e escreva 3 ações concretas para esta semana.",
  },
  {
    text: "Beleza começa pela saúde que cultivo.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Prepare uma refeição nutritiva com carinho, agradeça pelo alimento e coma sem distrações.",
  },
  {
    text: "Eu deixo morrer o que precisa morrer em mim.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Separe 3 objetos, hábitos ou pensamentos que não te servem mais e se comprometa a liberá-los hoje.",
  },
  {
    text: "Meu corpo fala antes da minha mente.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Antes de tomar uma decisão hoje, feche os olhos, respire 3 vezes e pergunte ao coração o que sente.",
  },
  {
    text: "Eu me trato com gentileza nos dias difíceis.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Olhe-se no espelho por 2 minutos e diga 'eu te amo' para si mesma com ternura.",
  },
  {
    text: "Eu construo intimidade com vulnerabilidade segura.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Identifique um relacionamento que precisa de limites e defina uma ação concreta para honrar seu bem-estar.",
  },
  {
    text: "Eu vejo grandeza no pequeno.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Liste 5 vitórias da última semana, por menores que sejam, e celebre cada uma com um gesto de gratidão.",
  },
  {
    text: "Eu permito a felicidade habitar em mim sem culpa.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Dance uma música que ama por 3 minutos, sem se importar com nada ao redor.",
  },
  {
    text: "Eu sou responsável pela minha paz.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Identifique 1 situação onde precisa dizer 'não' e pratique dizê-lo com firmeza e gentileza.",
  },
  {
    text: "Tranquilidade é meu padrão emocional.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Medite por 5 minutos focando apenas na respiração — a cada pensamento invasor, volte ao ar.",
  },
  {
    text: "Eu cresço e isso não me torna fraude.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Identifique uma cobrança interna excessiva e conscientemente solte, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "Eu sou amada pelo divino.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Observe 3 sinais positivos ao longo do dia e anote-os como evidências de que algo maior te apoia.",
  },
  {
    text: "Eu sou disposta para o que importa.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Faça 10 respirações profundas (4s inspira, 7s segura, 8s expira) e sinta a energia renovar.",
  },
  {
    text: "Eu sou consistente, e isso me leva longe.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Escolha 1 hábito que está construindo e execute-o hoje sem motivação, apenas por compromisso.",
  },
  {
    text: "Eu sou cana flexível, raiz profunda.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Pense em um desafio atual e escreva 3 lições que ele está te ensinando.",
  },
  {
    text: "Eu sou ouvida porque eu me escuto primeiro.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Expresse uma opinião ou sentimento que vinha guardando, de forma respeitosa e firme.",
  },
  {
    text: "Eu paro antes de quebrar.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Reserve 30 minutos hoje exclusivamente para algo prazeroso, sem celular e sem culpa.",
  },
  {
    text: "Eu manifesto o que mereço com naturalidade.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Visualize por 5 minutos a vida que deseja, sentindo as emoções como se já fosse real.",
  },
  {
    text: "Eu solto a rigidez e abro mão do controle excessivo.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Solte uma 'micro-tarefa' que você está controlando demais e veja o que acontece.",
  },
  {
    text: "Eu escolho 1 prioridade e a executo.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Faça 1 ciclo Pomodoro (25 min foco, 5 min pausa) na sua tarefa mais importante.",
  },
  {
    text: "Eu uso minha intuição como estratégia.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Identifique em qual fase do ciclo você está e adapte sua agenda a essa energia.",
  },
  {
    text: "Eu sou minha maior aliada e melhor amiga.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Liste 10 qualidades suas que você admira e mantenha a lista visível durante o dia.",
  },
  {
    text: "Eu encaro a verdade com leveza e firmeza.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Faça uma ligação ou envie uma mensagem que vem evitando há mais de 7 dias.",
  },
  {
    text: "Prosperidade é meu estado natural.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Organize uma área da sua casa hoje — abundância gosta de espaço claro.",
  },
  {
    text: "Gratidão é minha frequência base.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Envie uma mensagem de agradecimento sincera para alguém hoje.",
  },
  {
    text: "Minha paz vale mais que qualquer razão.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Sente-se em silêncio por 5 minutos visualizando a pessoa em luz e dizendo: 'eu te liberto'.",
  },
  {
    text: "Cada respiração me ancora no presente.",
    focus: "Direcionada para elevar presença pessoal, atenção plena e abertura para oportunidades.",
    exercise: "Exercício prático: Coloque o celular no modo avião por 30 minutos e esteja inteira no que estiver fazendo.",
  },
  {
    text: "Eu sou alvo natural do que há de bom.",
    focus: "Direcionada para prosperidade, merecimento e expansão emocional/financeira.",
    exercise: "Exercício prático: Reveja seu valor (preço, hora, salário) e ajuste mentalmente para o que você merece.",
  },
  {
    text: "Eu confio na inteligência da vida.",
    focus: "Direcionada para ansiedade por resultados e comparação com outras pessoas.",
    exercise: "Exercício prático: Reduza o tempo nas redes sociais por 24h para silenciar a comparação.",
  },
  {
    text: "Cada pensamento positivo abre uma porta.",
    focus: "Direcionada para reprogramação mental e controle de pensamentos negativos.",
    exercise: "Exercício prático: Identifique uma frase autossabotadora recorrente e escreva sua versão reprogramada.",
  },
  {
    text: "Eu tenho poder sobre o que cultivo.",
    focus: "Direcionada para empoderamento pessoal e responsabilidade sobre a própria vida.",
    exercise: "Exercício prático: Escreva o próximo capítulo da sua história como gostaria que fosse e dê o primeiro passo hoje.",
  },
  {
    text: "Meu corpo é o lar mais importante que tenho.",
    focus: "Direcionada para autoestima corporal e hábitos saudáveis.",
    exercise: "Exercício prático: Beba 2 litros de água ao longo do dia, com lembretes a cada 1 hora.",
  },
  {
    text: "Eu renasço quantas vezes for necessário.",
    focus: "Direcionada para desapego emocional, renovação de ciclos e recomeços.",
    exercise: "Exercício prático: Escreva o que não dá mais certo e dê um destino simbólico (queimar, rasgar, enterrar).",
  },
  {
    text: "Eu honro minhas percepções sutis.",
    focus: "Direcionada para autoconfiança intuitiva, escuta interna e clareza de decisão.",
    exercise: "Exercício prático: Anote uma decisão recente em que sua intuição acertou — relembre como foi a sensação no corpo.",
  },
  {
    text: "Eu sou suficiente, com ou sem aplausos.",
    focus: "Direcionada para autoaceitação radical e amor-próprio.",
    exercise: "Exercício prático: Faça um programa solo hoje — um café, um passeio, um cinema sozinha.",
  },
  {
    text: "Eu sou amada de formas reais, profundas e respeitosas.",
    focus: "Direcionada para vínculos afetivos, limites emocionais e qualidade das relações.",
    exercise: "Exercício prático: Mande uma mensagem genuína para alguém que você admira.",
  },
  {
    text: "Cada vitória interna conta.",
    focus: "Direcionada para reconhecimento pessoal e gratidão por conquistas.",
    exercise: "Exercício prático: Marque uma comemoração simples para uma conquista que passou em branco.",
  },
  {
    text: "Eu sou capaz de transformar qualquer dia com presença.",
    focus: "Direcionada para cultivar positividade, leveza e prazer no dia a dia.",
    exercise: "Exercício prático: Faça algo prazeroso por 15 minutos sem culpa e sem propósito de produtividade.",
  },
  {
    text: "Eu coloco filtros sem culpa.",
    focus: "Direcionada para estabelecer limites saudáveis e proteção energética.",
    exercise: "Exercício prático: Bloqueie uma janela do dia só sua e proteja como compromisso inadiável.",
  },
  {
    text: "Eu acolho o silêncio como remédio.",
    focus: "Direcionada para equilíbrio emocional, serenidade e ancoragem interna.",
    exercise: "Exercício prático: Faça 4-7-8 (4s inspira, 7s segura, 8s expira) por 5 ciclos.",
  },
  {
    text: "Eu sou capaz mesmo quando sinto medo.",
    focus: "Direcionada para combater perfeccionismo e síndrome da impostora.",
    exercise: "Exercício prático: Liste 5 evidências objetivas que provam que você merece seu lugar.",
  },
  {
    text: "Eu vejo o sagrado no comum.",
    focus: "Direcionada para confiança espiritual, conexão com o sagrado e abertura intuitiva.",
    exercise: "Exercício prático: Acenda uma vela e faça um pedido sincero, sentindo gratidão antecipada.",
  },
  {
    text: "Minha energia trabalha a meu favor.",
    focus: "Direcionada para vitalidade, energia e disposição diária.",
    exercise: "Exercício prático: Caminhe por 15 minutos ao ar livre, de preferência ao sol da manhã.",
  },
  {
    text: "Pequenas ações repetidas geram grandes resultados.",
    focus: "Direcionada para consistência, disciplina e visão de longo prazo.",
    exercise: "Exercício prático: Defina 3 não-negociáveis para a semana e marque na agenda.",
  },
  {
    text: "Eu sou treinada pela vida para vencer.",
    focus: "Direcionada para resiliência, mentalidade de crescimento e superação.",
    exercise: "Exercício prático: Liste 3 desafios que você superou no passado e reconheça sua força.",
  },
  {
    text: "Minha verdade tem espaço no mundo.",
    focus: "Direcionada para expressão autêntica, assertividade e comunicação.",
    exercise: "Exercício prático: Peça algo que você precisa hoje sem suavizar com excesso de palavras.",
  },
  {
    text: "Eu desacelero quando preciso, sem culpa.",
    focus: "Direcionada para combater a culpa do descanso e a produtividade tóxica.",
    exercise: "Exercício prático: Tire uma soneca de 20 minutos hoje, mesmo que pareça improdutivo.",
  },
  {
    text: "Eu acredito antes de ver, e por isso vejo.",
    focus: "Direcionada para Lei da Atração e frequência vibracional.",
    exercise: "Exercício prático: Escreva uma cena específica do futuro como se ela já tivesse acontecido.",
  },
  {
    text: "Eu me deixo levar quando é seguro me deixar levar.",
    focus: "Direcionada para confiança no fluxo, leveza e desapego do controle.",
    exercise: "Exercício prático: Por 24h, evite reclamar do imprevisto — apenas adapte-se.",
  },
  {
    text: "Foco é o que separa eu da minha versão maior.",
    focus: "Direcionada para foco profundo, gestão da atenção e produtividade saudável.",
    exercise: "Exercício prático: Coloque o celular em outro cômodo enquanto trabalha por 50 minutos.",
  },
  {
    text: "Eu celebro ser mulher.",
    focus: "Direcionada para conexão com a feminilidade, ciclos e potência feminina.",
    exercise: "Exercício prático: Use uma roupa, joia ou ritual que conecte com sua feminilidade hoje.",
  },
  {
    text: "Eu sou digna de amor, sucesso e abundância — dia 361.",
    focus: "Direcionada para fortalecer autoestima e quebrar padrões de autossabotagem.",
    exercise: "Exercício prático: Anote uma cobrança interna excessiva e a solte conscientemente, dizendo 'eu já sou suficiente'.",
  },
  {
    text: "Eu sou forte, capaz e corajosa — dia 362.",
    focus: "Direcionada para momentos de insegurança, medo de decisão e procrastinação por ansiedade.",
    exercise: "Exercício prático: Anote o pior cenário possível, releia e veja que você sobreviveria a ele.",
  },
  {
    text: "A abundância flui naturalmente para mim — dia 363.",
    focus: "Direcionada para mentalidade de abundância e prosperidade financeira.",
    exercise: "Exercício prático: Defina 1 meta financeira e a primeira ação concreta para esta semana.",
  },
  {
    text: "Eu sou grata por tudo que tenho e tudo que está a caminho — dia 364.",
    focus: "Direcionada para gratidão profunda e reconhecimento das bênçãos do presente.",
    exercise: "Exercício prático: Antes de dormir, liste mentalmente 5 coisas boas do dia.",
  },
  {
    text: "Eu perdoo, me liberto e sigo em paz — dia 365.",
    focus: "Direcionada para cura emocional, perdão e leveza interior.",
    exercise: "Exercício prático: Identifique uma mágoa e pergunte: o que essa dor veio me ensinar?",
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
