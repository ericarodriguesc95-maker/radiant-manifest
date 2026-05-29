import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import depoimentoNayara from "@/assets/depoimento-nayara.png";
import depoimentoSimone from "@/assets/depoimento-simone.png";
import depoimentoKamila from "@/assets/depoimento-kamila.png";
import depoimentoGabrielly from "@/assets/depoimento-gabrielly.png";
import depoimentoWpp1 from "@/assets/depoimento-wpp1.png";
import depoimentoWpp2 from "@/assets/depoimento-wpp2.png";

const KIWIFY_URL = "https://pay.kiwify.com.br/b2qJYrZ";

const realTestimonials = [
  { name: "Nayara Moraes", img: depoimentoNayara, quote: "Ameeei demais principalmente a parte de performance. Gostei muito da dica de cursos, links e livros." },
  { name: "Simone Costa", img: depoimentoSimone, quote: "Dia produtivo: todos os hábitos feitos! (4/6 hábitos) — Achei demais! Parabéns." },
  { name: "Kamila Moreira", img: depoimentoKamila, quote: "Achei chique! Sucesso Éricaaa ✨💗" },
  { name: "Gabrielly Rosa", img: depoimentoGabrielly, quote: "Completei minha meditação e checklist hoje! (4/6 hábitos)" },
  { name: "Membra (WhatsApp)", img: depoimentoWpp1, quote: "Está muito legal 💚💚💚 ⚡ Amei aquela parte das dicas do que assistir e de conteúdo. Muito show mesmo." },
  { name: "Membra (WhatsApp)", img: depoimentoWpp2, quote: "Muito shoooooow. Legal mesmo, mente de milhões 💚" },
];

const modules = [
  {
    icon: "🎯",
    title: "Metas SMART",
    desc: "Saia do 'vou tentar' para o 'está feito'. Defina, decomponha e acompanhe suas metas com framework científico. Submetas com prazo, progresso em tempo real e a dopamina real de cada conquista marcada. Porque meta sem método é só desejo.",
    tags: ["SMART", "Submetas", "Progresso"],
  },
  {
    icon: "✨",
    title: "Manifestação Diária",
    desc: "Sua manhã nunca mais começa no automático. Ritual matinal estruturado, conversa com o Eu Superior, frequências de cura e termômetro vibracional pela Escala Hawkins. O dia que começa com intenção termina com resultado.",
    tags: ["Ritual", "Frequências Hz", "Escala Hawkins"],
  },
  {
    icon: "🧠",
    title: "Reprogramação Mental",
    desc: "Silencia a síndrome da impostora de uma vez. Meditações com frequências Hz, PNL, neurociência e Lei da Atração com exercícios práticos. Porque o maior obstáculo entre você e seus objetivos mora na sua própria cabeça.",
    tags: ["PNL", "Neurociência", "Meditação Hz"],
  },
  {
    icon: "⚡",
    title: "Alta Performance",
    desc: "Otimize como os grandes players fazem. Podcasts curados, canais YouTube de alta densidade, técnicas de estudo como Pomodoro, Feynman e Active Recall, cursos e hobbies de elite. Seu desenvolvimento intelectual em curadoria de quem já chegou lá.",
    tags: ["Podcasts", "Técnicas", "Cursos"],
  },
  {
    icon: "🤖",
    title: "IA Assistente Pessoal",
    desc: "Sua parceira de gestão de tempo, disponível 24h. Organiza sua agenda, cria rotinas personalizadas e te lembra do que importa, por texto ou por voz. Não é um chatbot genérico. É uma assistente treinada para a sua rotina.",
    tags: ["Agenda", "Voz", "Rotinas"],
  },
  {
    icon: "🏆",
    title: "Desafios Progressivos",
    desc: "De 7 a 90 dias, com fundamentação científica em cada tarefa. Despertar Mental, Corpo em Movimento, Elite Performance, Jornada Platina. Cada desafio foi desenhado para criar momentum real, não motivação passageira.",
    tags: ["7 dias", "30 dias", "90 dias"],
  },
  {
    icon: "❤️",
    title: "Saúde & Fitness",
    desc: "Seu corpo é seu ativo mais valioso. Perfil de saúde completo, gráfico de evolução, dieta, treino, suplementos e medicações integrados. Porque corpo bem cuidado é mente em alta performance.",
    tags: ["Gráficos", "Dieta", "Treino"],
  },
  {
    icon: "💰",
    title: "Gestão Financeira",
    desc: "Dinheiro que para de sumir. Controle de renda, despesas fixas e variáveis, saldo em tempo real e espaço para insights financeiros. Porque prosperidade não é sorte, é gestão.",
    tags: ["Renda", "Despesas", "Metas"],
  },
  {
    icon: "👑",
    title: "Girls Community, Rede Social Privada",
    desc: "O diferencial que nenhum app tem. Uma rede social completa (posts, stories, @menções) exclusiva para mulheres dentro do ecossistema. Networking feminino real, ranking de streak e um ambiente onde crescer juntas é o padrão. Você não precisa mais caminhar sozinha.",
    tags: ["Rede privada", "Ranking streak", "Networking", "Posts & Stories"],
  },
  {
    icon: "🌙",
    title: "IA do Sono & Eu Superior",
    desc: "Recupere sua energia onde ela começa a se perder. IA reguladora do sono com plano personalizado, IA do Eu Superior para conexão espiritual e IA de Finanças para decisões inteligentes. Porque performance começa no descanso.",
    tags: ["Sono", "Eu Superior", "Finanças"],
  },
  {
    icon: "📖",
    title: "Bíblia em 365 Dias & Diário",
    desc: "Nutra sua alma com a mesma intencionalidade que nutre seu corpo. Cronograma personalizado de leitura bíblica em 1 ano, diário pessoal para insights, listas e reflexões com cores customizáveis. Sua vida interior merece estrutura também.",
    tags: ["Bíblia", "Diário", "Espiritualidade"],
  },
];

const testimonials = [
  { name: "Membro da Comunidade", text: "Amei demais, principalmente a parte de performance. As dicas de cursos, links e livros são ouro. Finalmente um lugar que cuida da minha mente e da minha carreira ao mesmo tempo." },
  { name: "Membro da Comunidade", text: "Mais um dia de hábitos saudáveis concluídos! 6/6 hábitos! Nunca tinha conseguido isso antes de entrar no sistema." },
  { name: "Membro da Comunidade", text: "Muito show. Legal mesmo. Mente de milhões, e agora eu sei o que isso significa na prática." },
  { name: "Membro da Comunidade", text: "Armei aquela parte das dicas do que assistir e de conteúdo. Muito show mesmo. Parece que alguém finalmente entendeu o que eu precisava." },
];

type PreviewKey = "home" | "metas" | "habitos" | "manifestacao" | "financas" | "saude" | "ciclo" | "biblia" | "comunidade" | "ia";

const previews: { key: PreviewKey; tab: string; icon: string; title: string; subtitle: string; render: () => JSX.Element }[] = [
  {
    key: "home",
    tab: "Home",
    icon: "👑",
    title: "Sua manhã começa em modo rainha",
    subtitle: "Saudação personalizada, palavra do dia, afirmação, devocional e seu progresso visível. Streak, hábitos e metas em uma tela só, porque você precisa ver o quanto já avançou para continuar avançando.",
    render: () => (
      <div className="space-y-3">
        <div className="rounded-xl p-4" style={{ background: "linear-gradient(145deg, hsl(43 72% 52% / 0.12), rgba(0,0,0,0.4))", border: "1px solid hsl(43 72% 52% / 0.25)" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "hsl(43 72% 52%)" }}>Bom dia, rainha ✦</p>
          <p className="text-base font-semibold">Hoje é dia de executar, não de tentar.</p>
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
    subtitle: "Decomponha objetivos grandes em passos executáveis e veja o progresso subir.",
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
    title: "Hábitos customizáveis com heat map de 30 dias",
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
        <p className="text-[11px] italic" style={{ color: "rgba(255,255,255,0.55)" }}>"Eu sou o canal pelo qual a abundância flui." (diário de hoje)</p>
      </div>
    ),
  },
  {
    key: "financas",
    tab: "Finanças",
    icon: "💰",
    title: "Controle financeiro com Consultora IA comportamental",
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
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Dia 8 do ciclo · Energia alta, bom para criar e socializar</p>
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
    title: "Feed Elite com Stories e Direct Messages",
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
    title: "Sua mentora 24/7 em voz e texto em pt-BR",
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
          Ótima pergunta. <strong>Negociação não é confronto, é apresentação de valor.</strong> Liste 3 entregas mensuráveis dos últimos 6 meses, traga benchmarks de mercado e abra com dados, não com pedido. Quer que eu monte o roteiro?
        </div>
      </div>
    ),
  },
];

const faqItems = [
  { q: "O que são as Metas SMART e como funcionam aqui?", a: "Metas SMART é um framework científico que transforma objetivos vagos em planos executáveis: Específico, Mensurável, Atingível, Relevante e Temporal. Dentro do Gloow Up Club, você define sua meta, cria submetas com prazos, acompanha o progresso visualmente e recebe lembretes. É o fim do 'vou tentar'." },
  { q: "O que é a Reprogramação Mental?", a: "É o módulo que trabalha o que nenhum planner resolve: sua mente. Com meditações guiadas em frequências Hz, técnicas de PNL, neurociência aplicada e exercícios da Lei da Atração, você desmonta padrões que te sabotam e instala novos programas mentais, de forma prática, não teórica." },
  { q: "Como funciona a Girls Community?", a: "É uma rede social privada dentro do ecossistema, exclusiva para membros. Você posta, vê stories, faz @menções, compartilha conquistas e se conecta com mulheres que falam a sua língua. Não é um grupo de WhatsApp. É um espaço estruturado para networking feminino real." },
  { q: "O que tem na Alta Performance?", a: "Podcasts curados por tema, canais YouTube de alta densidade de valor, técnicas de estudo como Pomodoro, Método Feynman e Active Recall, cursos e hobbies selecionados. Tudo que os grandes players usam para continuar crescendo, em um lugar só." },
  { q: "Funciona como app no celular?", a: "Sim. Você instala como PWA (Progressive Web App) direto no celular, sem precisar da App Store ou Google Play. Acessa como site no computador e como app no celular, com a mesma conta." },
  { q: "Tem assistente de IA?", a: "Sim, são múltiplos assistentes especializados: IA Assistente Pessoal para agenda e rotina, IA do Sono para regulação do descanso, IA do Eu Superior para conexão espiritual e IA de Finanças para decisões financeiras inteligentes. Cada um com foco e contexto específico." },
  { q: "O que são os Desafios Progressivos?", a: "São jornadas estruturadas de 7, 30 ou 90 dias com tarefas diárias fundamentadas em ciência. Os programas disponíveis são: Despertar Mental, Corpo em Movimento, Elite Performance e Jornada Platina. Cada tarefa tem o 'porquê' científico explicado, porque entender o mecanismo aumenta a adesão." },
  { q: "Tem leitura da Bíblia?", a: "Sim. O módulo Bíblia em 365 Dias oferece um cronograma personalizado de leitura completa em um ano, com diário integrado para insights, listas e reflexões com cores customizáveis." },
  { q: "Como recebo notificações?", a: "Após instalar o app no celular, você habilita as notificações push e recebe lembretes personalizados conforme seus hábitos, desafios e agenda configurada." },
  { q: "Quanto custa e como pago?", a: "R$ 27,90 em pagamento único, 12 meses de acesso completo. Você também pode parcelar em até 6x de R$ 5,24 no cartão. Pagamento seguro via Kiwify." },
  { q: "Posso cancelar?", a: "Como o plano é anual com pagamento único, o acesso fica garantido pelos 12 meses contratados. Não há cobrança recorrente." },
  { q: "Recebo atualizações sem pagar mais?", a: "Sim. Todas as atualizações de conteúdo e novas ferramentas lançadas durante o seu período de acesso estão incluídas sem custo adicional. É um dos maiores diferenciais do plano." },
];

export default function LandingPage() {
  const [activePreview, setActivePreview] = useState<PreviewKey>("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.title = "Gloow Up Club ✦ Ecossistema Feminino de Alta Performance";
    const meta = document.querySelector('meta[name="description"]');
    const content = "Você não tem falta de motivação. Você tem falta de sistema. O ecossistema feminino de alta performance que transforma intenção em execução.";
    if (meta) meta.setAttribute("content", content);
    else {
      const m = document.createElement("meta");
      m.name = "description"; m.content = content;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen text-[#F5F5F5]" style={{ background: "#0A0A0A" }}>
      {/* Ambient glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.3), transparent 70%)" }} />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, hsl(43 72% 52% / 0.2), transparent 70%)" }} />

      {/* STICKY HEADER (aparece após o primeiro scroll) */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}
        style={{
          background: "rgba(10,10,10,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid hsl(43 72% 52% / 0.15)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <span className="text-sm md:text-base font-bold tracking-tight">
            Gloow Up <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>Club</span> <span style={{ color: "hsl(43 72% 52%)" }}>✦</span>
          </span>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="hidden sm:inline text-[11px] md:text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              R$ 27,90 <span style={{ color: "hsl(43 72% 60%)" }}>· preço de lançamento</span>
            </span>
            <a
              href={KIWIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-4 md:px-5 py-2 text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, hsl(43 72% 60%), hsl(43 72% 45%))",
                color: "#0A0A0A",
                boxShadow: "0 6px 24px -8px hsl(43 72% 52% / 0.6)",
              }}
            >
              Quero meu acesso ✦
            </a>
          </div>
        </div>
      </div>

      {/* NAV */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          Gloow Up <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>Club</span> <span style={{ color: "hsl(43 72% 52%)" }}>✦</span>
        </h1>
        <Link
          to="/login"
          className="text-sm font-medium transition-colors hover:text-white inline-flex items-center gap-1.5"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          Já sou membra <span style={{ color: "hsl(43 72% 60%)" }}>→ Login</span>
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
            Você não tem falta de motivação.
            <br />
            Você tem falta de{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              sistema.
            </span>
          </h2>
          <p className="mt-6 text-lg italic" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Georgia, serif" }}>
            Enquanto você tenta se organizar sozinha, outra mulher com os mesmos objetivos que os seus já está executando. A diferença não é talento. É estrutura.
          </p>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Você já sabe o que quer. Já tentou mil métodos, comprou planner, instalou app de hábitos, assistiu talk motivacional às 23h. E na segunda-feira seguinte, estava no mesmo lugar.
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Não é culpa sua. O problema nunca foi sua disciplina. Foi a ausência de um sistema que trabalha por você enquanto você vive.
          </p>
          <p className="mt-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
            O Gloow Up Club é esse sistema.
          </p>

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
              QUERO MEU SISTEMA AGORA ✦
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

      {/* AGITAÇÃO DA DOR */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Pare e respire
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            Você reconhece esse{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              ciclo?
            </span>
          </h3>
        </div>

        <div className="space-y-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
          <p>
            Segunda-feira com energia total. Você planeja, anota, define metas. Quinta-feira o dia virou e nada saiu do papel. Domingo com aquela sensação de que a semana foi intensa, mas nada de importante avançou.
          </p>
          <p>
            Seu potencial existe. Sua intenção é real. Mas sem estrutura, intenção vira culpa.
          </p>

          <div className="rounded-2xl p-6 border" style={{ background: "linear-gradient(145deg, rgba(30,22,8,0.5), rgba(12,12,12,0.6))", borderColor: "hsl(43 72% 52% / 0.2)" }}>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "hsl(43 72% 52%)" }}>
              As perguntas que você evita responder
            </p>
            <p style={{ color: "rgba(255,255,255,0.85)" }}>
              Onde estão seus planos de 5 anos? Sua saúde mental está em primeiro lugar, ou sobra pra depois? Você está crescendo ou apenas sobrevivendo cada semana?
            </p>
          </div>

          <div>
            <p className="text-sm uppercase tracking-widest mb-3" style={{ color: "hsl(43 72% 52%)" }}>
              O custo invisível da desorganização
            </p>
            <p>
              Cada dia sem sistema é um dia que você gasta energia sem acumular resultado. Isso tem um preço. Não em dinheiro, mas em tempo. E tempo é a única coisa que você não recupera.
            </p>
          </div>
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            A solução
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            Não é mais um app.
            <br />
            É o seu{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              sistema operacional pessoal.
            </span>
          </h3>
          <p className="mt-6 text-lg italic max-w-3xl mx-auto" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "Georgia, serif" }}>
            Enquanto outros apps resolvem uma coisa, o Gloow Up Club cuida de tudo que importa: integrado, conectado e disponível onde você estiver.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 text-base leading-relaxed mb-12" style={{ color: "rgba(255,255,255,0.75)" }}>
          <p>
            Sua vida não funciona em compartimentos. Sua saúde afeta sua produtividade. Sua mente afeta suas finanças. Seus hábitos noturnos determinam sua manhã. Tudo está conectado, e seu sistema também precisa ser.
          </p>
          <p>
            O Gloow Up Club une o que os grandes players separam: neurociência aplicada, gestão de metas, saúde, finanças, espiritualidade e comunidade real, numa única plataforma construída para a mulher inteira.
          </p>
        </div>

        {/* Comparison table */}
        <div className="rounded-3xl p-6 md:p-8 border overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.8))", borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>App comum</p>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                <li>Rastreia um hábito</li>
                <li>Te lembra de tarefas</li>
                <li>Você usa sozinha</li>
                <li>Motiva por 3 dias</li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "hsl(43 72% 52%)" }}>Gloow Up Club</p>
              <ul className="space-y-3 text-sm font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
                <li>Transforma sua rotina completa</li>
                <li>Organiza sua agenda com IA</li>
                <li>Você cresce em comunidade</li>
                <li>Cria sistema para o ano inteiro</li>
              </ul>
            </div>
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
            Cada aba é uma área da sua vida sob seu comando.
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

      {/* TESTIMONIALS — prints reais das membras */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Prints reais · Membras da comunidade
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            O que acontece quando{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              sistema substitui tentativa.
            </span>
          </h3>
          <p className="mt-5 max-w-2xl mx-auto text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
            Feedbacks reais publicados dentro do app e enviados no WhatsApp por mulheres que já estão dentro.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {realTestimonials.map((t, i) => (
            <figure
              key={i}
              className="rounded-2xl p-4 border flex flex-col"
              style={{
                background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.8))",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="rounded-xl overflow-hidden mb-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <img
                  src={t.img}
                  alt={`Depoimento real de ${t.name} — membra do Gloow Up Club`}
                  loading="lazy"
                  className="w-full h-auto object-contain"
                />
              </div>
              <blockquote className="text-sm italic leading-relaxed mb-3 flex-1" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "Georgia, serif" }}>
                "{t.quote}"
              </blockquote>
              <figcaption className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "hsl(43 72% 60%)" }}>
                — {t.name}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 text-center max-w-2xl mx-auto">
          <p className="text-xl md:text-2xl font-semibold leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
            Elas não tinham mais tempo, mais dinheiro ou mais talento.
            <br />
            Tinham o{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              mesmo sistema
            </span>{" "}
            que você está prestes a ter.
          </p>
        </div>
      </section>


      {/* INSIDE THE APP, INTERACTIVE PREVIEW */}
      <section id="por-dentro" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Veja por dentro
          </p>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tight">
            Cada aba é um pedaço da sua{" "}
            <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
              vida sob seu comando.
            </span>
          </h3>
          <p className="mt-5 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Explore como cada área do app funciona, sem precisar criar conta.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {previews.map((p) => (
            <button
              key={p.key}
              onClick={() => setActivePreview(p.key)}
              className="rounded-full px-4 py-2 text-xs font-medium transition-all"
              style={{
                background: activePreview === p.key ? "hsl(43 72% 52%)" : "rgba(255,255,255,0.04)",
                color: activePreview === p.key ? "#0A0A0A" : "rgba(255,255,255,0.7)",
                border: `1px solid ${activePreview === p.key ? "hsl(43 72% 52%)" : "rgba(255,255,255,0.08)"}`,
              }}
            >
              <span className="mr-1.5">{p.icon}</span>{p.tab}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
          <div className="order-2 md:order-1">
            {previews.filter(p => p.key === activePreview).map(p => (
              <div key={p.key}>
                <div className="text-5xl mb-4">{p.icon}</div>
                <h4 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{p.title}</h4>
                <p className="text-base leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {p.subtitle}
                </p>
                <a
                  href={KIWIFY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: "hsl(43 72% 52%)" }}
                >
                  Quero acessar essa aba <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>

          <div className="order-1 md:order-2 flex justify-center">
            <div
              className="relative rounded-[2.5rem] p-3 w-full max-w-[320px]"
              style={{
                background: "linear-gradient(145deg, #1a1a1a, #0a0a0a)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 30px 80px -20px hsl(43 72% 52% / 0.25), 0 0 0 1px rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="rounded-[2rem] p-4 min-h-[440px]"
                style={{ background: "#0D0D0D", border: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex justify-between items-center mb-4 text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>9:41</span>
                  <span>👑 Gloow Up</span>
                  <span>100%</span>
                </div>
                {previews.filter(p => p.key === activePreview).map(p => (
                  <div key={p.key}>{p.render()}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
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
            Uma assinatura. Acesso completo aos 10+ módulos, como app no celular e como site no computador.
          </p>
        </div>

        {/* Ancoragem */}
        <div className="mb-10 rounded-3xl p-7 border" style={{ background: "linear-gradient(145deg, rgba(20,20,20,0.6), rgba(12,12,12,0.8))", borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "hsl(43 72% 52%)" }}>
            Pense bem
          </p>
          <p className="text-base leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.75)" }}>
            Uma sessão de coaching custa R$ 300. Um planner premium custa R$ 150. Um app de meditação custa R$ 40 por mês. Um curso de finanças pessoais custa R$ 200.
          </p>
          <p className="text-base leading-relaxed font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
            O Gloow Up Club entrega tudo isso: integrado, atualizado e disponível onde você estiver.
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
            <p className="mt-4 text-sm italic" style={{ color: "rgba(255,255,255,0.7)" }}>
              Menos de R$ 2,33 por mês para ter um sistema completo de alta performance.
            </p>
          </div>

          <ul className="space-y-3 mb-10 max-w-md mx-auto">
            {[
              "Acesso completo aos 10+ módulos",
              "App no celular + site no computador",
              "Girls Community (rede privada exclusiva)",
              "IA Assistente, IA do Sono, IA do Eu Superior, IA de Finanças",
              "Reprogramação Mental + Alta Performance",
              "Desafios progressivos de 7 a 90 dias",
              "Saúde, Finanças, Bíblia 365 e Diário",
              "Atualizações constantes (novos conteúdos e ferramentas sem custo adicional)",
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

        {/* Urgência */}
        <div className="mt-8 rounded-2xl p-6 border text-center" style={{ background: "hsl(43 72% 52% / 0.08)", borderColor: "hsl(43 72% 52% / 0.3)" }}>
          <p className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: "hsl(43 72% 60%)" }}>
            ✦ Preço de lançamento
          </p>
          <p className="text-base md:text-lg leading-relaxed font-semibold" style={{ color: "rgba(255,255,255,0.95)" }}>
            Quando os próximos módulos entrarem, o valor sobe.
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            Quem entrar agora <span className="font-bold" style={{ color: "hsl(43 72% 60%)" }}>trava R$ 27,90 para sempre</span> — com todas as atualizações futuras incluídas, sem pagar mais.
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
          {faqItems.map((item, i) => (
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
      </section>

      {/* CTA FINAL POR IDENTIDADE */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <h3 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
          Você é o tipo de mulher que vai continuar tentando,
          <br />
          ou que vai{" "}
          <span className="italic" style={{ color: "hsl(43 72% 52%)", fontFamily: "Georgia, serif" }}>
            começar a executar?
          </span>
        </h3>

        <div className="mt-10 max-w-2xl mx-auto space-y-5 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
          <p>
            Existe uma versão sua que acorda com clareza, sabe exatamente o que está perseguindo, cuida do corpo com a mesma atenção que cuida da carreira, tem uma comunidade que cresce junto, e chega no fim do ano sabendo exatamente o quanto avançou.
          </p>
          <p className="font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>
            Essa versão não aparece com mais força de vontade.
          </p>
          <p className="text-lg italic" style={{ color: "hsl(43 72% 60%)", fontFamily: "Georgia, serif" }}>
            Ela aparece com o sistema certo.
          </p>
        </div>

        <div className="mt-12">
          <a
            href={KIWIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-full px-10 py-5 text-base font-bold uppercase tracking-wider transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, hsl(43 72% 60%), hsl(43 72% 45%))",
              color: "#0A0A0A",
              boxShadow: "0 10px 40px -10px hsl(43 72% 52% / 0.6)",
            }}
          >
            Quero garantir meu acesso ✦
          </a>
          <p className="mt-6 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Já é membro?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: "hsl(43 72% 60%)" }}>
              Faça login →
            </Link>
          </p>
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
