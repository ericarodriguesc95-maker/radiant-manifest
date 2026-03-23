import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Check, ChevronDown, ChevronUp, Lightbulb, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
  id: string;
  title: string;
  category: "PNL" | "Neurociência";
  description: string;
  neurociencia: string;
  dicaPratica: string;
  steps: string[];
  tip: string;
}

const exercises: Exercise[] = [
  // 10 PNL
  { id: "p1", title: "Ancoragem para Falar em Público", category: "PNL", description: "Crie um gatilho físico para acessar confiança instantânea", neurociencia: "Condicionamento pavloviano: ao repetir o gesto + emoção, você cria um circuito neural que associa estímulo (pressão dos dedos) a resposta (confiança). Com 5-7 repetições, a âncora se consolida no cerebelo.", dicaPratica: "Faça 5 min antes de apresentações. No banheiro, relembre seu melhor momento e pressione polegar+indicador 3x.", steps: ["Relembre um momento de confiança máxima (uma vitória, um elogio, uma conquista)", "Reviva com todos os sentidos: o que viu, ouviu, sentiu", "Quando a emoção atingir o pico, pressione polegar + indicador da mão dominante", "Mantenha 5 segundos sentindo a emoção intensamente", "Solte e respire. Repita 3 vezes", "Teste: pressione os dedos e note se a confiança retorna"], tip: "Quanto mais detalhes sensoriais, mais forte a âncora. Adicione música que te empodere." },
  { id: "p2", title: "Reenquadramento de Crenças sobre Dinheiro", category: "PNL", description: "Transforme crenças limitantes financeiras em fortalecedoras", neurociencia: "O reenquadramento ativa o córtex pré-frontal dorsolateral, responsável pela reavaliação cognitiva. Literalmente 'reconstrói' a interpretação armazenada na memória de longo prazo.", dicaPratica: "Faça quando sentir culpa ao gastar ou medo de cobrar mais pelo seu trabalho.", steps: ["Identifique a crença: Ex: 'Ganhar muito dinheiro é errado'", "Pergunte: 'Quem me ensinou isso? É fato ou opinião?'", "Liste 3 pessoas que ganham bem E fazem o bem", "Crie a nova crença: 'Quanto mais ganho, mais impacto positivo gero'", "Repita a nova crença em voz alta 10x", "Pratique por 21 dias para criar o novo caminho neural"], tip: "O cérebro não diferencia crença de realidade — ele age baseado no que ouve repetidamente." },
  { id: "p3", title: "Modelagem de Excelência", category: "PNL", description: "Copie padrões de sucesso de mulheres que admira", neurociencia: "Neurônios-espelho no córtex pré-motor ativam quando observamos outros agindo. Modelar conscientemente acelera o aprendizado em até 300% comparado com tentativa e erro.", dicaPratica: "Escolha 1 mulher que admira na sua área. Estude 3 comportamentos dela esta semana.", steps: ["Escolha uma mulher que tem os resultados que você deseja", "Observe: como ela fala? Como se posiciona? Como negocia?", "Identifique 3 padrões específicos de comportamento", "Adote 1 padrão por semana na sua rotina", "Não é imitação — é adaptação ao seu estilo", "Avalie resultados após 30 dias"], tip: "Siga no Instagram/LinkedIn e observe stories e posts. Neurônios-espelho funcionam mesmo em vídeos." },
  { id: "p4", title: "Técnica do Espelho (Auto-imagem)", category: "PNL", description: "Reprogramação visual da autoimagem para autoestima", neurociencia: "O contato visual consigo mesma ativa o córtex fusiforme facial e a ínsula anterior, áreas ligadas ao reconhecimento de si e à empatia autodirigida. Libera ocitocina, o hormônio da conexão.", dicaPratica: "Faça toda manhã no banheiro, durante a rotina de skincare. São 2 minutos.", steps: ["Olhe-se no espelho, nos olhos, por 30 segundos", "Diga seu nome e sorria: '[Seu nome], você é incrível'", "Diga 3 qualidades suas em voz alta", "Diga: 'Eu sou digna de tudo que desejo'", "Mantenha o sorriso por mais 10 segundos", "Faça isso por 30 dias consecutivos"], tip: "Nos primeiros dias pode parecer estranho — isso é normal e prova que você precisa dessa prática." },
  { id: "p5", title: "Interrupção de Padrão (Ansiedade)", category: "PNL", description: "Quebre ciclos de ansiedade com ações inesperadas", neurociencia: "A ansiedade é um loop no circuito amígdala-córtex. A interrupção de padrão 'reseta' esse circuito ao introduzir um estímulo inesperado, forçando o córtex pré-frontal a reassumir o controle.", dicaPratica: "Use imediatamente ao sentir o primeiro sinal de ansiedade (coração acelerando, mãos suando).", steps: ["Ao sentir ansiedade crescendo, PARE", "Faça algo completamente inesperado: bata palmas 3x forte", "Ou: conte de 10 a 1 em voz alta", "Ou: nomeie 5 coisas que vê, 4 que toca, 3 que ouve (5-4-3-2-1)", "A surpresa quebra o ciclo automático", "Substitua por 3 respirações lentas e uma afirmação"], tip: "O método 5-4-3-2-1 é usado por terapeutas de trauma. Funciona em qualquer lugar, até no metrô." },
  { id: "p6", title: "Ponte para o Futuro", category: "PNL", description: "Conecte a ação de hoje com o resultado futuro desejado", neurociencia: "A visualização prospectiva ativa o hipocampo anterior e o córtex pré-frontal medial simultaneamente, criando um 'caminho temporal' neural que conecta o presente ao futuro desejado.", dicaPratica: "Faça antes de começar projetos difíceis ou que você está procrastinando.", steps: ["Feche os olhos e veja-se daqui a 6 meses", "O que você conquistou? Como se sente? Onde está?", "Agora 'volte no tempo' e veja os passos que tomou", "Identifique o PRIMEIRO passo que fez", "Abra os olhos e faça esse primeiro passo AGORA", "Repita semanalmente para manter a conexão temporal"], tip: "Quanto mais emocional a visualização do futuro, mais motivação o presente recebe." },
  { id: "p7", title: "Swish Pattern (Substituição de Hábito)", category: "PNL", description: "Substitua um hábito indesejado por um positivo visualmente", neurociencia: "O Swish Pattern utiliza a velocidade de processamento visual (300ms) para sobrescrever uma imagem mental negativa com uma positiva, enfraquecendo o circuito neural do hábito antigo.", dicaPratica: "Use para parar de checar redes sociais compulsivamente ou qualquer hábito que quer mudar.", steps: ["Pense no hábito que quer mudar. Veja a imagem mental associada", "Agora crie uma imagem da versão ideal de si mesma (sem o hábito)", "Coloque a imagem ideal pequenina no canto da imagem do hábito", "Rapidamente, 'SWISH!' — a imagem ideal cresce e cobre a negativa", "A imagem negativa encolhe e desaparece", "Repita 5 vezes rápido. Depois teste: pense no hábito e veja o que aparece"], tip: "A velocidade é essencial. Quanto mais rápido o 'swish', mais eficaz a substituição neural." },
  { id: "p8", title: "Posições Perceptuais (Empatia)", category: "PNL", description: "Veja conflitos de 3 ângulos para resolver com sabedoria", neurociencia: "Alternar perspectivas ativa a junção temporoparietal, responsável pela teoria da mente (capacidade de entender outras perspectivas). Reduz reatividade emocional em conflitos.", dicaPratica: "Use quando tiver conflitos no trabalho ou em relacionamentos. Faça antes de responder mensagens difíceis.", steps: ["Posição 1: Sua perspectiva. O que VOCÊ sente e pensa?", "Posição 2: Vista-se mentalmente como a outra pessoa. O que ELA sente?", "Posição 3: Seja uma observadora neutra. O que um terceiro veria?", "Da Posição 3, que conselho daria para ambas?", "Volte para a Posição 1 com essa nova perspectiva", "Tome a decisão mais sábia"], tip: "Use 3 cadeiras diferentes se possível — mudar de posição física reforça a mudança mental." },
  { id: "p9", title: "Calibração de Estado Emocional", category: "PNL", description: "Controle seu estado emocional como um dial de volume", neurociencia: "O estado emocional é uma combinação de postura corporal + respiração + diálogo interno. Ao alterar conscientemente esses 3 elementos, você 'hackeia' o sistema nervoso autônomo.", dicaPratica: "Use quando precisar mudar rapidamente de humor: antes de reuniões, após notícias ruins, entre tarefas.", steps: ["Note seu estado atual de 1-10", "Ajuste a POSTURA: coluna ereta, ombros abertos, queixo paralelo", "Ajuste a RESPIRAÇÃO: inspire 4s, expire 6s (ativa parassimpático)", "Ajuste o DIÁLOGO INTERNO: troque 'não consigo' por 'como posso?'", "Reavalie seu estado. Deve ter subido 2-3 pontos", "Pratique até virar automático"], tip: "A fisiologia lidera a psicologia. Mudar a postura muda o humor em menos de 2 minutos." },
  { id: "p10", title: "Rapport Instantâneo (Vendas/Networking)", category: "PNL", description: "Crie conexão instantânea espelhando linguagem corporal", neurociencia: "Espelhamento sutil ativa neurônios-espelho no observador, criando inconscientemente sensação de similaridade e confiança. Vendedores que usam rapport vendem 30% mais (pesquisa INSEAD).", dicaPratica: "Use em reuniões com clientes, entrevistas e networking. Comece espelhando gestos, depois ritmo de fala.", steps: ["Observe a postura corporal da pessoa", "Espelhe sutilmente (não copie exatamente — adapte)", "Acompanhe o ritmo de fala: rápido com rápido, calmo com calmo", "Use palavras semelhantes às dela", "Após 2-3 min de rapport, conduza: mude sua postura e veja se ela acompanha", "Se acompanhou, o rapport está estabelecido"], tip: "Nunca espelhe emoções negativas. Se a pessoa está irritada, mantenha-se calma e ela tenderá a acompanhá-la." },

  // 10 Neurociência
  { id: "n1", title: "Respiração 4-7-8 (Anti-Ansiedade)", category: "Neurociência", description: "Técnica validada para reduzir cortisol em minutos", neurociencia: "A expiração prolongada (8s vs 4s inspiração) ativa o nervo vago, principal condutor do sistema nervoso parassimpático. Reduz frequência cardíaca, pressão arterial e cortisol em 3 ciclos.", dicaPratica: "Funciona até no trânsito ou no banheiro do escritório. 3 ciclos = 1 minuto = alívio imediato.", steps: ["Inspire pelo nariz contando mentalmente até 4", "Segure o ar contando até 7", "Expire lentamente pela boca contando até 8", "Repita 4 ciclos", "Perceba os ombros descendo e o maxilar relaxando", "Use sempre que sentir ansiedade crescendo"], tip: "O Dr. Andrew Weil (Harvard) recomenda esta como a técnica mais eficaz para ansiedade aguda." },
  { id: "n2", title: "Pomodoro Neuro-Sinergético", category: "Neurociência", description: "Otimize foco alternando entre ondas Beta e Alpha", neurociencia: "O cérebro mantém foco sustentado (ondas Beta) por ~25 min antes de fadiga cognitiva. O descanso de 5 min permite transição para Alpha (criatividade/descanso), consolidando o que foi aprendido.", dicaPratica: "Use para estudar, trabalhar ou criar conteúdo. Timer no celular: 25 min trabalho + 5 min pausa ativa.", steps: ["Defina a tarefa mais importante", "Timer: 25 minutos de foco total (celular em modo avião)", "Quando tocar: PARE imediatamente", "5 min de pausa ATIVA: levante, alongue, olhe pela janela", "NÃO cheque celular na pausa (isso ativa Beta novamente)", "A cada 4 ciclos: pausa longa de 15-20 min", "Após a pausa longa: hidrate-se e defina o próximo bloco"], tip: "A pausa deve ser 'burra' — nada que exija pensamento. O cérebro está consolidando informações." },
  { id: "n3", title: "Journaling Terapêutico (Pennebaker)", category: "Neurociência", description: "Escrita expressiva que reduz estresse em 25-30%", neurociencia: "O Dr. James Pennebaker (UT Austin) provou que escrever sobre emoções por 15-20 min, 4 dias seguidos, reduz consultas médicas em 50% e melhora marcadores imunológicos. A escrita transfere experiências da memória emocional (amígdala) para a narrativa (córtex).", dicaPratica: "Faça 15 min por noite durante 4 dias. Não releia. Pode jogar fora depois.", steps: ["Encontre um lugar privado", "Escreva por 15 minutos sem parar sobre algo que te incomoda", "Não se censure. Gramática não importa", "Escreva o que sente, pensa e por que isso importa", "Se chorar, continue escrevendo. É parte do processo", "Ao final, feche o caderno. Não releia hoje", "Repita por 4 dias consecutivos"], tip: "Não precisa ser bonito ou organizado. O ato de externalizar já transforma a experiência neural." },
  { id: "n4", title: "Exposição Solar Matinal (Regulação Circadiana)", category: "Neurociência", description: "10 min de sol pela manhã para sincronizar seu relógio biológico", neurociencia: "A luz solar matinal (2.500+ lux) atinge o núcleo supraquiasmático via retina, sincronizando melatonina (sono) e cortisol (energia). O Dr. Andrew Huberman (Stanford) demonstrou que 10 min de sol matinal melhoram sono, humor e energia por até 12h.", dicaPratica: "Tome seu café/chá perto de uma janela com sol ou caminhe 10 min no quarteirão. Sem óculos escuros.", steps: ["Ao acordar (idealmente nos primeiros 30 min), saia ao sol", "Sem óculos escuros — a luz precisa atingir a retina", "10 minutos bastam (nublado: 20-30 min)", "Combine com uma caminhada leve no quarteirão", "Isso seta o 'timer' de melatonina para 14-16h depois", "Resultado: mais energia de dia + sono melhor à noite"], tip: "Se não puder sair: sente-se perto da maior janela por 20 min. Luz artificial não substitui, mas ajuda." },
  { id: "n5", title: "Técnica NSDR (Non-Sleep Deep Rest)", category: "Neurociência", description: "Descanso profundo sem dormir — recupere energia em 20 min", neurociencia: "O NSDR (popularizado pelo Dr. Huberman) induz ondas Theta sem sono, permitindo recuperação neural similar a 2h de sono. Restaura dopamina estriatal em até 65% (pesquisa Scandinavian).", dicaPratica: "Substitua o cochilo pós-almoço por 20 min de NSDR. Deite no sofá com fones.", steps: ["Deite-se confortavelmente. Feche os olhos", "Não tente dormir — apenas relaxe profundamente", "Respire naturalmente e conte cada expiração de 1 a 10", "Se perder a conta, recomece sem julgamento", "Permita que pensamentos passem como nuvens", "20 minutos. Use um timer suave", "Ao levantar, espreguice-se lentamente"], tip: "Google CEO Sundar Pichai usa NSDR diariamente. É a técnica de recuperação mais eficiente por minuto." },
  { id: "n6", title: "Dopamina Scheduling (Recompensa Intencional)", category: "Neurociência", description: "Gerencie dopamina para manter motivação sustentável", neurociencia: "A dopamina não é o 'hormônio do prazer' — é o hormônio da MOTIVAÇÃO e ANTECIPAÇÃO. Recompensas constantes (redes sociais) drenam a baseline. Espaçar recompensas mantém a motivação alta.", dicaPratica: "Não cheque redes sociais antes de completar a primeira tarefa do dia. Use como recompensa APÓS.", steps: ["Identifique suas 'fugas de dopamina': redes sociais, doces, séries", "Coloque-as APÓS tarefas importantes (não antes)", "Manhã: complete 1 tarefa → depois pode checar Instagram", "Tarde: termine o relatório → depois pode ouvir podcast", "Crie 'dopamine stacking': atividade difícil + recompensa", "Uma vez por semana: 'jejum de dopamina' — dia sem telas/estímulos"], tip: "Abrir o Instagram ao acordar é como tomar um energético antes do café da manhã — crash garantido." },
  { id: "n7", title: "Cold Exposure (Banho Frio Terapêutico)", category: "Neurociência", description: "30s de água fria para ativar norepinefrina e foco", neurociencia: "Banho frio (11-15°C por 30-60s) aumenta norepinefrina em 200-300% e dopamina em 250%, efeitos que duram 3-5 horas. Pesquisa publicada no European Journal of Applied Physiology.", dicaPratica: "Nos últimos 30 segundos do banho, vire para água fria. Comece com 15s e aumente gradualmente.", steps: ["No final do seu banho quente normal, vire para fria", "Comece com 15 segundos. Respire pelo nariz", "Aumente 5s por semana até chegar a 60s", "Foque na respiração: inspire 4s, expire 4s", "Após sair: sinta a energia e o foco imediato", "Faça 3-5x por semana para benefícios cumulativos"], tip: "Não precisa ser gelado — apenas desconfortavelmente frio. Desconforto controlado é a chave." },
  { id: "n8", title: "Regulação Emocional (Técnica RAIN)", category: "Neurociência", description: "Processamento consciente de emoções difíceis em 4 passos", neurociencia: "RAIN (Recognize, Allow, Investigate, Non-identify) ativa o córtex pré-frontal e desativa a amígdala, movendo a experiência emocional do modo reativo para o modo contemplativo. Validada em estudos de mindfulness da UCLA.", dicaPratica: "Use quando emoções fortes surgirem: frustração no trabalho, tristeza, raiva. Leva 3-5 minutos.", steps: ["R — Reconheça: 'Estou sentindo frustração/medo/tristeza'", "A — Aceite: 'Está tudo bem sentir isso. É humano'", "I — Investigue: 'Onde sinto no corpo? O que aciona isso?'", "N — Não se identifique: 'Eu tenho raiva' (não 'Eu sou raiva')", "Respire fundo 3 vezes", "Note como a emoção perde intensidade após ser observada"], tip: "Emoções não observadas duram em média 90 segundos. As que resistimos podem durar horas ou dias." },
  { id: "n9", title: "Gratidão Neural (Rewiring do Viés Negativo)", category: "Neurociência", description: "Reequilibre o viés de negatividade do cérebro com gratidão ativa", neurociencia: "O cérebro tem viés de negatividade evolutivo (5:1 — precisa de 5 experiências positivas para cada negativa). A prática de gratidão ativa aumenta a atividade no córtex pré-frontal medial e ínsula, literalmente reconectando o cérebro para positividade.", dicaPratica: "Antes de dormir, use os dedos de uma mão para contar 5 coisas boas do dia. Leva 60 segundos.", steps: ["Toda noite antes de dormir:", "Polegar: algo bom que ACONTECEU hoje", "Indicador: algo bom que eu FIZ hoje", "Médio: algo bom que APRENDI hoje", "Anelar: alguém que me fez SORRIR hoje", "Mínimo: algo que estou ANTECIPANDO com alegria", "Sinta gratidão por cada uma por 5 segundos"], tip: "Após 21 dias, seu cérebro começa a buscar automaticamente o positivo. É neuroplasticidade em ação." },
  { id: "n10", title: "Descompressão Pós-Expediente", category: "Neurociência", description: "Ritual de transição trabalho → vida pessoal", neurociencia: "Sem um ritual de transição, o córtex pré-frontal continua processando problemas do trabalho, mantendo cortisol elevado e impedindo relaxamento. Um ritual físico 'sinaliza' ao cérebro que o modo de trabalho acabou.", dicaPratica: "Crie um ritual de 5 min ao chegar em casa: troque de roupa + lave o rosto + 3 respirações profundas.", steps: ["Ao sair do trabalho/fechar o notebook:", "Escreva 3 coisas que completou hoje (fechamento cognitivo)", "Troque de roupa — sinal físico de transição", "Lave o rosto com água fria (reset sensorial)", "3 respirações profundas 4-7-8", "Declare: 'Meu tempo de trabalho acabou. Agora sou [mãe/parceira/eu mesma]'", "NÃO cheque e-mails após esse ritual"], tip: "O ato de trocar de roupa é o sinal mais poderoso para o cérebro. Executivos de alto desempenho usam isso religiosamente." },
];

export default function NeurocienciaPNL({ onBack }: { onBack: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<"all" | "PNL" | "Neurociência">("all");
  const [completedSteps, setCompletedSteps] = useState<Record<string, Set<number>>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("neuro-pnl-progress") || "{}");
      const result: Record<string, Set<number>> = {};
      for (const [k, v] of Object.entries(saved)) { result[k] = new Set(v as number[]); }
      return result;
    } catch { return {}; }
  });

  useEffect(() => {
    const serializable: Record<string, number[]> = {};
    for (const [k, v] of Object.entries(completedSteps)) { serializable[k] = Array.from(v); }
    localStorage.setItem("neuro-pnl-progress", JSON.stringify(serializable));
  }, [completedSteps]);

  const toggleStep = (id: string, idx: number) => {
    setCompletedSteps(prev => {
      const current = prev[id] || new Set();
      const next = new Set(current);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return { ...prev, [id]: next };
    });
  };

  const getProgress = (id: string, total: number) => {
    return Math.round(((completedSteps[id]?.size || 0) / total) * 100);
  };

  const filtered = filterCat === "all" ? exercises : exercises.filter(e => e.category === filterCat);
  const totalCompleted = exercises.filter(e => getProgress(e.id, e.steps.length) === 100).length;

  return (
    <div className="min-h-screen">
      <header className="px-5 pt-12 pb-2">
        <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground text-sm font-body mb-2">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <h1 className="text-xl font-display font-bold">Neurociência & PNL <span className="text-gold">✦</span></h1>
        <p className="text-xs text-muted-foreground font-body mt-1">10 PNL + 10 Neurociência — exercícios práticos para o dia a dia</p>
        <p className="text-[10px] text-gold font-body">{totalCompleted}/20 completados</p>
      </header>

      <div className="px-5 mb-3">
        <div className="flex gap-2">
          {(["all", "PNL", "Neurociência"] as const).map(c => (
            <button key={c} onClick={() => setFilterCat(c)} className={cn("text-[10px] font-body px-3 py-1.5 rounded-full border transition-all", filterCat === c ? "bg-gold/20 border-gold text-gold" : "border-border text-muted-foreground")}>
              {c === "all" ? "Todos (20)" : c === "PNL" ? "🧠 PNL (10)" : "⚡ Neuro (10)"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-2.5 pb-6">
        {filtered.map(ex => {
          const isExpanded = expandedId === ex.id;
          const progress = getProgress(ex.id, ex.steps.length);

          return (
            <div key={ex.id} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : ex.id)} className="w-full p-3.5 flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", ex.category === "PNL" ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500")}>
                  {ex.category === "PNL" ? <Brain className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-body font-semibold truncate">{ex.title}</p>
                    {progress === 100 && <span className="text-gold text-xs">✦</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-body truncate">{ex.description}</p>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
              </button>

              {progress > 0 && progress < 100 && (
                <div className="px-3.5 pb-2">
                  <div className="bg-muted rounded-full h-1">
                    <div className="h-full bg-gradient-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {isExpanded && (
                <div className="px-3.5 pb-3.5 space-y-2.5 animate-fade-in">
                  {/* Neurociência explanation */}
                  <div className="bg-purple-500/5 rounded-lg p-2.5 border border-purple-500/10">
                    <p className="text-[10px] font-body font-semibold text-purple-500 mb-0.5">🧠 Neurociência</p>
                    <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{ex.neurociencia}</p>
                  </div>

                  {/* Dica prática */}
                  <div className="bg-gold/5 rounded-lg p-2.5 border border-gold/10">
                    <p className="text-[10px] font-body font-semibold text-gold mb-0.5">💡 Dica prática</p>
                    <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{ex.dicaPratica}</p>
                  </div>

                  {/* Steps */}
                  {ex.steps.map((step, i) => {
                    const done = completedSteps[ex.id]?.has(i) || false;
                    return (
                      <button key={i} onClick={() => toggleStep(ex.id, i)} className="w-full flex items-start gap-2 py-0.5">
                        <div className={cn("h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all", done ? "border-gold bg-gold" : "border-muted-foreground")}>
                          {done && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className={cn("text-xs font-body text-left leading-relaxed", done && "line-through text-muted-foreground")}>{step}</span>
                      </button>
                    );
                  })}

                  <div className="bg-gold/5 rounded-lg p-2.5 flex items-start gap-2">
                    <Lightbulb className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                    <p className="text-[10px] font-body text-muted-foreground italic">{ex.tip}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
