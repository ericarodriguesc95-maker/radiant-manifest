import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const KIWIFY_URL = "https://pay.kiwify.com.br/b2qJYrZ";

const modules = [
  {
    icon: "🎯",
    title: "Metas SMART",
    desc: "Defina, decomponha e acompanhe suas metas com framework científico. Submetas, passos práticos, prazos e progresso em tempo real.",
    tags: ["SMART", "Submetas", "Progresso"],
  },
  {
    icon: "✨",
    title: "Manifestação Diária",
    desc: "Ritual matinal, conversa com o Eu Superior, frequências de cura, termômetro vibracional (Escala de Hawkins) e diário de manifestações escritas.",
    tags: ["Ritual", "Frequências Hz", "Escala Hawkins"],
  },
  {
    icon: "🧠",
    title: "Reprogramação Mental",
    desc: "Meditações com frequências Hz, Ho'oponopono, PNL, neurociência, Lei da Atração com exercícios práticos.",
    tags: ["PNL", "Neurociência", "Meditação Hz"],
  },
  {
    icon: "⚡",
    title: "Alta Performance",
    desc: "Podcasts curados, canais YouTube de alta densidade, técnicas de estudo (Pomodoro, Feynman, Active Recall), cursos e hobbies de elite.",
    tags: ["Podcasts", "Técnicas", "Cursos"],
  },
  {
    icon: "🤖",
    title: "IA Assistente Pessoal",
    desc: "Sua parceira de gestão de tempo. Organiza sua agenda, cria rotinas e te lembra do que importa — por texto ou por voz.",
    tags: ["Agenda", "Voz", "Rotinas"],
  },
  {
    icon: "🏆",
    title: "Desafios Progressivos",
    desc: "De 7 a 90 dias. Despertar Mental, Corpo em Movimento, Elite Performance, Jornada Platina. Cada tarefa tem fundamentação científica.",
    tags: ["7 dias", "30 dias", "90 dias"],
  },
  {
    icon: "❤️",
    title: "Saúde & Fitness",
    desc: "Perfil de saúde, gráfico de evolução de peso, dieta, treino, suplementos e medicações. Seu corpo como ativo.",
    tags: ["Gráficos", "Dieta", "Treino"],
  },
  {
    icon: "💰",
    title: "Gestão Financeira",
    desc: "Controle de renda, despesas fixas e variáveis, saldo em tempo real e espaço para insights financeiros. Dinheiro que para de sumir.",
    tags: ["Renda", "Despesas", "Metas"],
  },
  {
    icon: "👑",
    title: "Girls Community — Rede Social Privada",
    desc: "O diferencial que nenhum app tem. Uma rede social completa — posts, stories, @menções — exclusiva para mulheres dentro do ecossistema. Networking feminino real, ranking de streak, e um ambiente onde crescer juntas é o padrão.",
    tags: ["Rede privada", "Ranking streak", "Networking", "Posts & Stories"],
  },
  {
    icon: "🌙",
    title: "IA do Sono & Eu Superior",
    desc: "IA reguladora do sono com plano personalizado, IA do Eu Superior para conexão espiritual e IA de Finanças para decisões inteligentes.",
    tags: ["Sono", "Eu Superior", "Finanças"],
  },
  {
    icon: "📖",
    title: "Bíblia em 365 Dias & Diário",
    desc: "Cronograma personalizado de leitura bíblica em 1 ano + diário pessoal para insights, listas e reflexões com cores customizáveis.",
    tags: ["Bíblia", "Diário", "Espiritualidade"],
  },
];

const testimonials = [
  { name: "Membro da comunidade", text: "Ameeei demais principalmente a parte de performance gostei muito da dica de cursos, links e livros." },
  { name: "Membro da comunidade", text: "Mais um dia de hábitos saudáveis concluídos! 💪🔥 6/6 hábitos!" },
  { name: "Membro da comunidade", text: "Muito shoooooow 💚 Legal mesmo, mente de milhões 💚" },
  { name: "Membro da comunidade", text: "Está muito legal 💚💚💚 Armei aquela parte das dicas do que assistir e de conteúdo. Muito show mesmo." },
];

type PreviewKey = "home" | "metas" | "habitos" | "manifestacao" | "financas" | "saude" | "ciclo" | "biblia" | "comunidade" | "ia";

const previews: { key: PreviewKey; tab: string; icon: string; title: string; subtitle: string; render: () => JSX.Element }[] = [
  {
    key: "home",
    tab: "Home",
    icon: "👑",
    title: "Sua manhã começa em modo rainha",
    subtitle: "Saudação personalizada, palavra do dia, afirmação, devocional e seu progresso visível.",
    render: () => (
      <div className="space-y-3">
        <div className="rounded-xl p-4" style={{ background: "linear-gradient(145deg, hsl(43 72% 52% / 0.12), rgba(0,0,0,0.4))", border: "1px solid hsl(43 72% 52% / 0.25)" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "hsl(43 72% 52%)" }}>Bom dia, rainha ✦</p>
          <p className="text-base font-semibold">Hoje é dia de executar — não de tentar.</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{l:"Streak",v:"42d",c:"🔥"},{l:"Hábitos",v:"5/6",c:"✅"},{l:"Metas",v:"73%",c:"🎯"}].map((s)=>(
            <div key={s.l} className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-base">{s.c}</div>
              <div className="text-sm font-bold mt-0.5">{s.v}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(43 60% 65%)" }}>Palavra do dia</p>
          <p className="text-sm font-semibold">Soberania</p>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>Afirmação: Eu comando minha rotina com clareza e disciplina.</p>
        </div>
      </div>
    ),
  },
  {
    key: "metas",
    tab: "Metas",
    icon: "🎯",
    title: "Metas SMART com submetas que dão dopamina",
    subtitle: "Decomponha objetivos grandes em passos executáveis — e veja o progresso subir.",
    render: () => (
      <div className="space-y-2.5">
        {[
          { t: "Investir R$ 10.000 até dez/2026", p: 64, sub: ["Aporte mensal R$ 800 ✓", "Estudar Tesouro Direto ✓", "Abrir conta corretora"] },
          { t: "Inglês fluente em 6 meses", p: 38, sub: ["30min/dia ✓", "1 livro/mês", "Conversation club"] },
        ].map((g)=>(
          <div key={g.t} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-semibold">{g.t}</p>
              <span className="text-xs font-bold" style={{ color: "hsl(43 72% 52%)" }}>{g.p}%</span>
            </div>
            <div className="h-1.5 rounded-full mb-2.5" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: `${g.p}%`, background: "hsl(43 72% 52%)" }} />
            </div>
            <div className="space-y-1">
              {g.sub.map((s)=>(<p key={s} className="text-[11px]" style={{ color: "rgba(255,255,255,0.6)" }}>• {s}</p>))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: "habitos",
    tab: "Hábitos",
    icon: "✅",
    title: "Hábitos customizáveis + heat map de 30 dias",
    subtitle: "Crie seus próprios hábitos, marque diariamente e veja a constância pintar a tela.",
    render: () => (
      <div className="space-y-3">
        <div className="space-y-1.5">
          {[{n:"💧 2L de água",d:true},{n:"🏋️ Treino",d:true},{n:"📖 Leitura 30min",d:true},{n:"🧘 Meditação",d:false},{n:"📝 Diário noturno",d:false}].map((h)=>(
            <div key={h.n} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className={`text-xs ${h.d?"line-through":""}`} style={{ color: h.d?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.85)" }}>{h.n}</span>
              <div className="h-4 w-4 rounded" style={{ background: h.d?"hsl(142 71% 45%)":"transparent", border: "1px solid rgba(255,255,255,0.2)" }}>{h.d && <Check className="h-3 w-3 text-black m-0.5"/>}</div>
            </div>
          ))}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>Últimos 30 dias</p>
          <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: "repeat(15, 1fr)" }}>
            {Array.from({length:30}).map((_,i)=>{
              const lvl = [0,0.15,0.3,0.6,0.9][Math.floor(Math.random()*5)];
              return <div key={i} className="aspect-square rounded-sm" style={{ background: lvl===0?"rgba(255,255,255,0.05)":`hsl(43 72% 52% / ${lvl})` }} />;
            })}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "manifestacao",
    tab: "Manifestação",
    icon: "✨",
    title: "Termômetro vibracional & Frequências de cura",
    subtitle: "Escala de Hawkins, ritual matinal, conversa com o Eu Superior e diário de manifestações.",
    render: () => (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(145deg, hsl(280 60% 30% / 0.3), hsl(43 72% 52% / 0.1))", border: "1px solid hsl(43 72% 52% / 0.2)" }}>
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "hsl(43 60% 65%)" }}>Vibração agora</p>
          <p className="text-3xl font-bold" style={{ color: "hsl(43 72% 52%)" }}>540 Hz</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>Amor incondicional</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[{f:"432Hz",l:"Calma"},{f:"528Hz",l:"DNA"},{f:"963Hz",l:"Conexão"}].map((x)=>(
            <button key={x.f} className="rounded-lg py-2.5 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid hsl(43 72% 52% / 0.15)" }}>
              <p className="text-xs font-bold" style={{ color: "hsl(43 72% 52%)" }}>▶ {x.f}</p>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{x.l}</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.55)" }}>"Eu sou o canal pelo qual a abundância flui." — diário de hoje</p>
      </div>
    ),
  },
  {
    key: "financas",
    tab: "Finanças",
    icon: "💰",
    title: "Controle financeiro + Consultora IA comportamental",
    subtitle: "Renda, despesas fixas, variáveis, cartão e poupança. Com IA que entende psicologia do dinheiro.",
    render: () => (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {[{l:"Renda",v:"R$ 8.500",c:"hsl(142 71% 45%)"},{l:"Saldo",v:"R$ 2.140",c:"hsl(43 72% 52%)"},{l:"Cartão",v:"R$ 1.820",c:"hsl(280 60% 60%)"},{l:"Poupança",v:"R$ 1.200",c:"hsl(210 80% 60%)"}].map((s)=>(
            <div key={s.l} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>{s.l}</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: s.c }}>{s.v}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3" style={{ background: "hsl(43 72% 52% / 0.08)", border: "1px solid hsl(43 72% 52% / 0.2)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(43 72% 52%)" }}>🤖 Consultora IA</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>"Identifiquei R$ 480 em compras impulsivas no mercado. Quer um plano de 7 dias para reduzir 30%?"</p>
        </div>
      </div>
    ),
  },
  {
    key: "saude",
    tab: "Saúde",
    icon: "🏃‍♀️",
    title: "Calculadoras de proteína, água e evolução",
    subtitle: "Treinos do dia, dieta, peso ao longo do tempo e integração com smartwatch.",
    render: () => (
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Proteína</p>
            <p className="text-sm font-bold" style={{ color: "hsl(43 72% 52%)" }}>112g / 130g</p>
          </div>
          <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] uppercase" style={{ color: "rgba(255,255,255,0.5)" }}>Água</p>
            <p className="text-sm font-bold" style={{ color: "hsl(210 80% 60%)" }}>1.8L / 2.5L</p>
          </div>
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>Evolução do peso (90d)</p>
          <div className="flex items-end gap-1 h-12">
            {[60,58,57,56,55,54,53,52,51,50].map((v,i)=>(<div key={i} className="flex-1 rounded-sm" style={{ height: `${v}%`, background: "hsl(43 72% 52% / 0.6)" }} />))}
          </div>
        </div>
        <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[11px]"><span style={{color:"hsl(43 60% 65%)"}}>Treino do dia:</span> Inferiores + glúteo • 45min</p>
        </div>
      </div>
    ),
  },
  {
    key: "ciclo",
    tab: "Ciclo",
    icon: "🌸",
    title: "Mapa do ciclo menstrual com previsão hormonal",
    subtitle: "Fases, sintomas, fertilidade e histórico de até 8 ciclos para entender seu corpo.",
    render: () => (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-center" style={{ background: "linear-gradient(145deg, hsl(340 70% 30% / 0.3), hsl(43 72% 52% / 0.08))", border: "1px solid hsl(340 60% 50% / 0.2)" }}>
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "hsl(340 60% 75%)" }}>Fase atual</p>
          <p className="text-2xl font-bold">🌷 Folicular</p>
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Dia 8 do ciclo · Energia alta — bom para criar e socializar</p>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[{n:"Mens.",a:false},{n:"Folic.",a:true},{n:"Ovul.",a:false},{n:"Lútea",a:false}].map((p)=>(
            <div key={p.n} className="rounded-lg py-2 text-center text-[10px] font-semibold" style={{ background: p.a?"hsl(340 60% 50% / 0.25)":"rgba(255,255,255,0.03)", border: `1px solid ${p.a?"hsl(340 60% 50% / 0.4)":"rgba(255,255,255,0.06)"}`, color: p.a?"hsl(340 60% 80%)":"rgba(255,255,255,0.5)" }}>{p.n}</div>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: "biblia",
    tab: "Bíblia 365",
    icon: "📖",
    title: "Plano de leitura de 365 dias com Visão de Neurociência",
    subtitle: "Devocional do dia, estudo guiado por IA e calendário do que você já leu.",
    render: () => (
      <div className="space-y-2.5">
        <div className="rounded-xl p-4" style={{ background: "linear-gradient(145deg, hsl(43 72% 52% / 0.12), rgba(0,0,0,0.4))", border: "1px solid hsl(43 72% 52% / 0.2)" }}>
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: "hsl(43 72% 52%)" }}>Dia 73 / 365</p>
          <p className="text-sm font-semibold mb-1">Filipenses 4:13</p>
          <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.7)" }}>"Posso todas as coisas naquele que me fortalece."</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "hsl(43 60% 65%)" }}>🧠 Visão neurocientífica</p>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.7)" }}>Afirmações de capacidade ativam o córtex pré-frontal e reduzem cortisol em 23%.</p>
        </div>
        <div className="flex justify-between text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>
          <span>Streak de leitura: 19 dias 🔥</span><span style={{ color: "hsl(43 72% 52%)" }}>20% completo</span>
        </div>
      </div>
    ),
  },
  {
    key: "comunidade",
    tab: "Comunidade",
    icon: "💬",
    title: "Feed Elite + Stories + Direct Messages",
    subtitle: "Conecte-se com mulheres que falam a língua do sucesso. Sem julgamento.",
    render: () => (
      <div className="space-y-2.5">
        <div className="flex gap-2 overflow-hidden">
          {["A","M","C","J","R"].map((n,i)=>(
            <div key={i} className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "linear-gradient(135deg, hsl(43 72% 52%), hsl(340 60% 50%))", color: "#0A0A0A" }}>{n}</div>
          ))}
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-full" style={{ background: "hsl(43 72% 52%)" }} />
            <div><p className="text-xs font-semibold">Marina S.</p><p className="text-[9px]" style={{ color: "rgba(255,255,255,0.4)" }}>há 2h • 👑 Streak 90d</p></div>
          </div>
          <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.8)" }}>Bati minha meta de poupança trimestral hoje! 6 meses atrás eu era a mulher das compras impulsivas. ✦</p>
          <div className="flex gap-3 mt-2 text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>♥ 47 · 💬 12 · 👁 312</div>
        </div>
      </div>
    ),
  },
  {
    key: "ia",
    tab: "Assistente IA",
    icon: "🤖",
    title: "Sua mentora 24/7 — voz e texto em pt-BR",
    subtitle: "Pergunte sobre carreira, finanças, saúde, espiritualidade. Resposta personalizada.",
    render: () => (
      <div className="space-y-2">
        <div className="rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] max-w-[85%]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          Olá rainha ✦ Sobre o que você quer conversar hoje?
        </div>
        <div className="rounded-2xl rounded-br-sm px-3 py-2 text-[11px] max-w-[85%] ml-auto" style={{ background: "hsl(43 72% 52%)", color: "#0A0A0A" }}>
          Como negociar um aumento sem parecer arrogante?
        </div>
        <div className="rounded-2xl rounded-bl-sm px-3 py-2 text-[11px] max-w-[90%]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          Ótima pergunta. <strong>Negociação não é confronto, é apresentação de valor.</strong> Liste 3 entregas mensuráveis dos últimos 6 meses, traga benchmarks de mercado e abra com dados — não com pedido. Quer que eu monte o roteiro?
        </div>
      </div>
    ),
  },
];

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState<PreviewKey>("home");

  useEffect(() => {
    document.title = "Gloow Up Club ✦ Ecossistema Feminino de Alta Performance";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Não é um app. É o seu sistema operacional. Para a mulher que faz tudo — e quer fazer ainda melhor. Plano anual com atualizações constantes.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <div className="min-h-screen text-[#F5F5F5]" style={{ background: "#0A0A0A" }}>
      {/* Ambient glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.3), transparent 70%)" }} />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.2), transparent 70%)" }} />

      {/* NAV */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Gloow Up <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>Club</span> <span style={{ color: "hsl(43 72% 52%)" }}>✦</span>
        </h1>
        <Link
          to="/login"
          className="rounded-full px-5 py-2.5 text-sm font-medium border transition-all hover:scale-105"
          style={{ borderColor: "hsl(43 72% 52% / 0.3)", color: "#F5F5F5" }}
        >
          Já sou uma rainha do Gloow Up Club e quero fazer meu login ✦
        </Link>
      </header>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-10" style={{ background: "hsl(43 72% 52%)" }} />
            <span className="text-xs tracking-[0.25em] uppercase" style={{ color: "hsl(43 72% 52%)" }}>
              Ecossistema Feminino de Alta Performance
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
            Não é um app.
            <br />
            É o seu{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              sistema operacional.
            </span>
          </h2>
          <p className="mt-6 text-lg italic" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Georgia, serif" }}>
            Cansada de carregar o mundo nas costas e sentir que sua rotina é um caos silencioso?
          </p>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Você não precisa de mais uma lista de tarefas. Você precisa de <strong className="text-white">ordem</strong>. O Gloow Up Club é o fim da fragmentação mental: o ecossistema que transforma sua sobrecarga em uma <strong className="text-white">execução de elite</strong>.
          </p>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            O mundo exige que você seja uma líder impecável, mantenha o corpo dos sonhos e a mente inabalável. Mas a verdade? Sem um sistema, você está apenas gastando energia. Onde estão seus planos de 5 anos? Sua saúde mental está em segundo plano?
          </p>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Nós blindamos sua jornada com o que há de mais avançado em comportamento humano:
          </p>
          <ul className="mt-4 space-y-3 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
            <li><span style={{ color: "hsl(43 72% 60%)" }}>✦</span> <strong className="text-white">Metas SMART:</strong> Saia do "vou tentar" para o "está feito" com submetas que geram dopamina real.</li>
            <li><span style={{ color: "hsl(43 72% 60%)" }}>✦</span> <strong className="text-white">Reprogramação Mental:</strong> Use PNL e Neurociência para silenciar a síndrome da impostora.</li>
            <li><span style={{ color: "hsl(43 72% 60%)" }}>✦</span> <strong className="text-white">Alta Performance:</strong> Otimize sua carreira com técnicas de gestão que os grandes players usam.</li>
            <li><span style={{ color: "hsl(43 72% 60%)" }}>✦</span> <strong className="text-white">Girls Community:</strong> Pare de caminhar sozinha. Conecte-se com mulheres que falam a língua do sucesso.</li>
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={KIWIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-7 py-4 text-sm font-bold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, hsl(43 72% 60%), hsl(43 72% 45%))",
                color: "#0A0A0A",
                boxShadow: "0 10px 40px -10px hsl(43 72% 52% / 0.5)",
              }}
            >
              CHEGA DE DESCULPAS. QUERO MEU COMANDO. ✦
            </a>
            <a
              href="#modulos"
              className="rounded-full px-7 py-4 text-sm font-medium border transition-all hover:scale-105"
              style={{ borderColor: "rgba(255,255,255,0.15)", color: "#F5F5F5" }}
            >
              Ver o que tem dentro →
            </a>
          </div>
        </div>

        {/* Hero card preview */}
        <div
          className="rounded-3xl p-6 border"
          style={{
            background: "linear-gradient(145deg, rgba(20,20,20,0.95), rgba(12,12,12,0.98))",
            borderColor: "hsl(43 72% 52% / 0.15)",
            boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold">Gloow Up Club ✦</span>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: "hsl(43 72% 52% / 0.1)", color: "hsl(43 72% 52%)" }}>
              🔥 Streak: 14 dias
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {modules.slice(0, 4).map((m) => (
              <div key={m.title} className="rounded-2xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="text-2xl mb-2">{m.icon}</div>
                <p className="text-sm font-semibold leading-tight">{m.title}</p>
                <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {m.tags.join(" · ")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl p-4 border flex items-center gap-3" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="text-2xl">👑</div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Girls Community</p>
              <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Rede social privada · Networking feminino real</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full border" style={{ borderColor: "hsl(43 72% 52% / 0.4)", color: "hsl(43 72% 52%)" }}>
              Exclusivo
            </span>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modulos" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            O que você acessa
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            10+ módulos. Uma plataforma.
            <br />
            A mulher{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              inteira.
            </span>
          </h3>
          <p className="mt-5 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Enquanto outros apps resolvem uma coisa, o Gloow Up Club cuida de tudo que importa — integrado, conectado e disponível onde você estiver.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl p-6 border transition-all hover:scale-[1.02] hover:border-[hsl(43_72%_52%/0.3)]"
              style={{
                background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.8))",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-3xl mb-4">{m.icon}</div>
              <h4 className="text-lg font-bold mb-2">{m.title}</h4>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                {m.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t} className="text-[10px] px-2.5 py-1 rounded-full" style={{ background: "hsl(43 72% 52% / 0.08)", color: "hsl(43 60% 65%)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Resultados Reais
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            O que acontece quando{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              sistema substitui tentativa.
            </span>
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 border"
              style={{
                background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.8))",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <p className="italic mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Georgia, serif" }}>
                "{t.text}"
              </p>
              <p className="text-xs uppercase tracking-widest" style={{ color: "hsl(43 72% 52%)" }}>
                — {t.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING - SINGLE PLAN */}
      <section id="planos" className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Acesso ao Ecossistema
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            Comece sua{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              transformação.
            </span>
          </h3>
          <p className="mt-5 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Uma assinatura. Acesso completo aos 10+ módulos — como app no celular e como site no computador.
          </p>
        </div>

        <div
          className="relative rounded-3xl p-10 md:p-12 border-2 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, rgba(30,22,8,0.9), rgba(12,12,12,0.98))",
            borderColor: "hsl(43 72% 52% / 0.5)",
            boxShadow: "0 30px 80px -20px hsl(43 72% 52% / 0.3), 0 0 60px -20px hsl(43 72% 52% / 0.2)",
          }}
        >
          {/* Badge */}
          <div className="absolute top-6 right-6">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full" style={{ background: "hsl(43 72% 52%)", color: "#0A0A0A" }}>
              <Sparkles className="w-3 h-3" /> Plano Único
            </span>
          </div>

          <div className="text-center mb-8">
            <p className="text-xs tracking-[0.3em] uppercase mb-3" style={{ color: "hsl(43 72% 52%)" }}>
              Plano Anual com Atualizações
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>R$</span>
              <span className="text-7xl md:text-8xl font-bold tracking-tight">27,90</span>
            </div>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              pagamento único · 12 meses de acesso completo
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: "hsl(43 72% 60%)" }}>
              ✦ Inclui todas as atualizações de conteúdos e ferramentas
            </p>
            <p className="mt-2 text-sm" style={{ color: "hsl(43 72% 52%)" }}>
              ou em até <strong>6x de R$ 5,24</strong> no cartão
            </p>
          </div>

          <ul className="space-y-3 mb-10 max-w-md mx-auto">
            {[
              "Acesso completo aos 10+ módulos",
              "App no celular + site no computador",
              "Girls Community — rede privada",
              "IA Assistente, IA do Sono, IA do Eu Superior, IA de Finanças",
              "Reprogramação Mental + Alta Performance",
              "Desafios progressivos de 7 a 90 dias",
              "Saúde, Finanças, Bíblia 365 e Diário",
              "Atualizações constantes — novos conteúdos e ferramentas",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(43 72% 52%)" }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.85)" }}>{item}</span>
              </li>
            ))}
          </ul>

          <a
            href={KIWIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-full px-8 py-5 text-base font-bold uppercase tracking-wider transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, hsl(43 72% 60%), hsl(43 72% 45%))",
              color: "#0A0A0A",
              boxShadow: "0 10px 40px -10px hsl(43 72% 52% / 0.6)",
            }}
          >
            Quero meu acesso anual ✦
          </a>

          <p className="mt-6 text-center text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            Pagamento seguro via Kiwify · Acesso liberado em até 5 minutos
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Já é membro?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "hsl(43 72% 60%)" }}>
              Faça login →
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Perguntas Frequentes
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            Tire suas{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              dúvidas.
            </span>
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { q: "O que são as Metas SMART e como funcionam aqui?", a: "Você define metas Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais. Cada meta vira submetas e tarefas com progresso automático e dopamina a cada conquista." },
            { q: "O que é a Reprogramação Mental?", a: "Mais de 60 exercícios baseados em PNL, neurociência, Lei da Atração, Ho'oponopono, meditações guiadas e frequências (432Hz, 528Hz) para silenciar a síndrome da impostora e instalar crenças de elite." },
            { q: "Como funciona a Girls Community?", a: "Rede privada só para mulheres com feed estilo Instagram, salas temáticas, mensagens diretas, stories de 24h, comentários, curtidas e ranking de hábitos. Conexões reais e seguras." },
            { q: "O que tem na Alta Performance?", a: "Pomodoro, técnica Feynman, podcasts e cursos curados, biblioteca elite e jornadas estruturadas para gestão de carreira de quem quer crescer rápido." },
            { q: "Tem rastreador de Saúde e Fitness?", a: "Sim. Calculadora de proteína e água, registro de dieta com calorias, peso e evolução, exercícios, e o ciclo menstrual com previsões hormonais." },
            { q: "Como funciona o módulo de Finanças?", a: "Quiz comportamental que identifica seu arquétipo financeiro, IA Financeira pessoal, controle de receitas/despesas por mês e plano de prosperidade." },
            { q: "Funciona como app no celular?", a: "Sim. É um PWA (instala no iPhone e Android) e também temos o APK Android. No computador, abre como site completo." },
            { q: "Tem assistente de IA?", a: "Quatro: IA Assistente Pessoal (alta performance), IA do Eu Superior (manifestação), IA do Sono e IA Financeira. Todas em português, com voz e texto." },
            { q: "O que são os Desafios Progressivos?", a: "Jornadas de 7, 14, 30, 60 e 90 dias com check-ins diários, contador de participantes e medalhas. Hábito vira identidade." },
            { q: "Tem leitura da Bíblia?", a: "Plano Bíblia 365 personalizado por dia, com estudo guiado por IA, anotações pessoais e histórico — combina espiritualidade com neurociência." },
            { q: "Como recebo notificações?", a: "Push notifications no navegador e celular para devocional do dia, lembretes de hábitos, ciclo menstrual, mensagens diretas e novos conteúdos." },
            { q: "Quanto custa e como pago?", a: "R$ 27,90 anual (ou 6x de R$ 5,24 no cartão). Pagamento único via Kiwify, acesso liberado em até 5 minutos. Inclui todas as atualizações de conteúdo." },
            { q: "Posso cancelar?", a: "Sim, a qualquer momento. O acesso permanece ativo até o fim do período pago e você pode pedir reembolso em até 7 dias após a compra." },
            { q: "Recebo atualizações sem pagar mais?", a: "Sim. Toda nova ferramenta, módulo ou conteúdo lançado durante seu plano anual já vem incluso, sem custo adicional." },
          ].map((item, i) => (
            <details
              key={i}
              className="group rounded-2xl border px-5 py-4 transition-all open:shadow-lg"
              style={{
                background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.85))",
                borderColor: "rgba(255,255,255,0.07)",
              }}
            >
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-base pr-4" style={{ color: "rgba(255,255,255,0.92)" }}>
                  {item.q}
                </span>
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-lg leading-none transition-transform group-open:rotate-45"
                  style={{ background: "hsl(43 72% 52% / 0.15)", color: "hsl(43 72% 60%)" }}
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#planos"
            className="inline-block rounded-full px-7 py-3.5 text-sm font-semibold transition-all hover:scale-105"
            style={{
              background: "hsl(43 72% 52%)",
              color: "#0A0A0A",
              boxShadow: "0 10px 30px -10px hsl(43 72% 52% / 0.5)",
            }}
          >
            Quero garantir meu acesso ✦
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t mt-10" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            © {new Date().getFullYear()} Gloow Up Club ✦ Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <a href={KIWIFY_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Assinar</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
