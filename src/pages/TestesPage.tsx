import { useState } from "react";
import { ArrowLeft, Brain, Users, Zap, Atom, ChevronRight, CheckCircle2, RotateCcw } from "lucide-react";
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

const discProfiles: Record<string, { title: string; emoji: string; desc: string; strengths: string[]; tips: string[] }> = {
  D: { title: "Dominância", emoji: "🦁", desc: "Você é uma líder nata! Orientada a resultados, decisiva e competitiva. Adora desafios e vai direto ao ponto.", strengths: ["Decisiva", "Orientada a resultados", "Líder natural", "Corajosa"], tips: ["Pratique escuta ativa", "Delegue com empatia", "Celebre pequenas vitórias dos outros"] },
  I: { title: "Influência", emoji: "🌟", desc: "Você brilha em grupo! Comunicativa, entusiasta e carismática. Inspira os outros com sua energia positiva.", strengths: ["Comunicativa", "Entusiasta", "Criativa", "Persuasiva"], tips: ["Anote suas ideias para não perder o foco", "Estabeleça prazos realistas", "Ouça antes de falar"] },
  S: { title: "Estabilidade", emoji: "🕊️", desc: "Você é o porto seguro! Paciente, leal e ótima ouvinte. Cria ambientes harmoniosos e confiáveis.", strengths: ["Paciente", "Leal", "Confiável", "Empática"], tips: ["Aprenda a dizer não quando necessário", "Expresse suas opiniões com confiança", "Abrace mudanças como oportunidades"] },
  C: { title: "Conformidade", emoji: "🔬", desc: "Você é analítica e precisa! Valoriza qualidade, dados e processos bem definidos. Busca excelência em tudo.", strengths: ["Analítica", "Detalhista", "Precisa", "Estratégica"], tips: ["Não busque perfeição em tudo", "Compartilhe suas conclusões com mais frequência", "Equilibre análise com ação"] },
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

const behavioralProfiles: Record<string, { title: string; emoji: string; desc: string; strengths: string[]; tips: string[] }> = {
  executor: { title: "Executora", emoji: "⚡", desc: "Você é movida pela ação! Foco em resultados, produtividade alta e mentalidade de crescimento constante.", strengths: ["Proativa", "Focada", "Resiliente", "Produtiva"], tips: ["Reserve tempo para descansar", "Valorize o processo, não só o resultado", "Pratique mindfulness"] },
  pensador: { title: "Pensadora", emoji: "🧠", desc: "Sua mente é sua maior arma! Reflexiva, estratégica e profunda. Você enxerga o que outros não veem.", strengths: ["Estratégica", "Visionária", "Racional", "Profunda"], tips: ["Não paralise na análise", "Confie mais na sua intuição", "Compartilhe suas ideias brilhantes"] },
  conector: { title: "Conectora", emoji: "💫", desc: "Você é a cola que une tudo! Empática, comunicativa e carismática. Cria laços profundos com as pessoas.", strengths: ["Empática", "Comunicativa", "Inspiradora", "Adaptável"], tips: ["Cuide de si antes de cuidar dos outros", "Estabeleça limites saudáveis", "Foque em suas próprias metas"] },
  estavel: { title: "Equilibrada", emoji: "🌿", desc: "Você é o centro de gravidade! Calma, ponderada e constante. Traz paz e equilíbrio para qualquer ambiente.", strengths: ["Calma", "Constante", "Ponderada", "Resiliente"], tips: ["Saia da zona de conforto com frequência", "Expresse mais suas emoções", "Não tenha medo de arriscar"] },
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

const productivityProfiles: Record<string, { title: string; emoji: string; desc: string; strengths: string[]; tips: string[] }> = {
  planejadora: { title: "Planejadora", emoji: "📋", desc: "Você é mestra em organização! Listas, agendas e metas claras são seu combustível.", strengths: ["Organizada", "Orientada a metas", "Disciplinada", "Previsível"], tips: ["Permita-se flexibilidade", "Não replaneje, execute", "Reserve tempo para criatividade livre"] },
  reativa: { title: "Reativa", emoji: "🔥", desc: "Você brilha sob pressão! Adapta-se rápido e resolve problemas em tempo recorde.", strengths: ["Adaptável", "Rápida", "Pragmática", "Multi-tarefa"], tips: ["Planeje ao menos 3 prioridades por dia", "Silencie notificações por períodos", "Use blocos de tempo focado"] },
  criativa: { title: "Criativa", emoji: "🎨", desc: "Sua produtividade vem da inspiração! Quando está no fluxo, produz obras incríveis.", strengths: ["Inovadora", "Visionária", "Original", "Apaixonada"], tips: ["Crie rotinas que suportem seu fluxo criativo", "Use timers para manter o foco", "Capture ideias em um caderno sempre à mão"] },
  sistematica: { title: "Sistemática", emoji: "⚙️", desc: "Você é uma máquina de consistência! Rotinas e sistemas são sua superpotência.", strengths: ["Consistente", "Confiável", "Eficiente", "Metódica"], tips: ["Experimente novos métodos periodicamente", "Automatize tarefas repetitivas", "Celebre sua consistência"] },
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

const neuroProfiles: Record<string, { title: string; emoji: string; desc: string; strengths: string[]; tips: string[] }> = {
  cortex: { title: "Córtex Dominante", emoji: "🧩", desc: "Seu cérebro racional é poderoso! Pensamento analítico, lógica e aprendizado são suas forças.", strengths: ["Analítica", "Estratégica", "Aprendizagem rápida", "Resolução de problemas"], tips: ["Equilibre razão com emoção", "Pratique exercícios de criatividade", "Permita-se sentir sem analisar"] },
  limbico: { title: "Sistema Límbico Ativo", emoji: "💖", desc: "Seu cérebro emocional é sua bússola! Empatia, conexão e intuição guiam suas decisões.", strengths: ["Empática", "Intuitiva", "Criativa", "Sensível"], tips: ["Proteja sua energia emocional", "Use journaling para processar emoções", "Pratique grounding quando sobrecarregada"] },
  parasimpatico: { title: "Parassimpático Forte", emoji: "🧘", desc: "Você tem um dom natural para a calma! Regulação emocional e paz interior são suas marcas.", strengths: ["Calma", "Centrada", "Resiliente ao estresse", "Mindful"], tips: ["Desafie-se com atividades estimulantes", "Não confunda calma com passividade", "Use sua serenidade como superpoder de liderança"] },
  simpatico: { title: "Simpático Dominante", emoji: "⚡", desc: "Seu sistema de ação está sempre ligado! Energia, foco e performance física são excepcionais.", strengths: ["Energética", "Focada", "Competitiva", "Ativa"], tips: ["Pratique relaxamento ativo (yoga, alongamento)", "Durma o suficiente para recuperar", "Canalize sua energia em projetos significativos"] },
};

// ─── Test categories ───
const testCategories = [
  { id: "disc", title: "Teste DISC", subtitle: "Descubra seu perfil de liderança", icon: Users, gradient: "from-purple-900/40 to-purple-800/20", questions: discQuestions, profiles: discProfiles },
  { id: "behavioral", title: "Teste Comportamental", subtitle: "Entenda seus padrões de comportamento", icon: Brain, gradient: "from-rose-900/40 to-rose-800/20", questions: behavioralQuestions, profiles: behavioralProfiles },
  { id: "productivity", title: "Teste de Produtividade", subtitle: "Descubra seu estilo produtivo", icon: Zap, gradient: "from-amber-900/40 to-amber-800/20", questions: productivityQuestions, profiles: productivityProfiles },
  { id: "neuro", title: "Teste Neurociência", subtitle: "Conheça seu cérebro dominante", icon: Atom, gradient: "from-emerald-900/40 to-emerald-800/20", questions: neuroQuestions, profiles: neuroProfiles },
];

type TestState = { testId: string; step: number; answers: string[] } | null;

const TestesPage = () => {
  const navigate = useNavigate();
  const [activeTest, setActiveTest] = useState<TestState>(null);
  const [result, setResult] = useState<{ testId: string; profile: string } | null>(null);

  const handleAnswer = (type: string) => {
    if (!activeTest) return;
    const cat = testCategories.find(c => c.id === activeTest.testId)!;
    const newAnswers = [...activeTest.answers, type];

    if (newAnswers.length >= cat.questions.length) {
      // Calculate result
      const counts: Record<string, number> = {};
      newAnswers.forEach(t => { counts[t] = (counts[t] || 0) + 1; });
      const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
      setResult({ testId: activeTest.testId, profile: winner });
      setActiveTest(null);
    } else {
      setActiveTest({ ...activeTest, step: activeTest.step + 1, answers: newAnswers });
    }
  };

  const resetTest = () => { setResult(null); setActiveTest(null); };

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

        <div className="glass rounded-2xl p-5 border border-gold/10 mb-6">
          <h3 className="text-xs font-body tracking-[0.2em] uppercase text-gold/80 font-semibold mb-3">Dicas de Crescimento</h3>
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

      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-foreground mb-1">Autoconhecimento</h1>
        <p className="text-sm font-body text-muted-foreground">Descubra seu perfil através de testes cientificamente embasados</p>
      </div>

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
