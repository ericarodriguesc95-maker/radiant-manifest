import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const KIWIFY_URL = "https://pay.kiwify.com.br/sjdEC0h";

const modules = [
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
  { name: "Nayara Moraes", text: "Ameeei demais principalmente a parte de performance gostei muito da dica de cursos, links e livros." },
  { name: "Simone Costa", text: "Mais um dia de hábitos saudáveis concluídos! 💪🔥 6/6 hábitos!" },
  { name: "Membro da comunidade", text: "Muito shoooooow 💚 Legal mesmo, mente de milhões 💚" },
  { name: "Membro da comunidade", text: "Está muito legal 💚💚💚 Armei aquela parte das dicas do que assistir e de conteúdo. Muito show mesmo." },
];

export default function LandingPage() {
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
          Quero acessar →
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
          <p className="mt-6 text-lg italic" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "Georgia, serif" }}>
            Para a mulher que faz tudo — e quer fazer ainda melhor.
          </p>
          <p className="mt-6 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
            CLT no corporativo, PJ ou empreendedora. Você já tem potencial. O que faltava era uma plataforma que cuidasse de tudo —{" "}
            <strong className="text-white">rotina, mente, carreira, saúde, finanças e networking</strong> — em um único ecossistema.
          </p>
          <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
            Acesse como app no celular ou como site no computador.
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
              Quero meu ecossistema ✦
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
            9 módulos. Uma plataforma.
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
            Uma assinatura. Acesso completo aos 9 módulos — como app no celular e como site no computador.
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
              <span className="text-7xl md:text-8xl font-bold tracking-tight">19,90</span>
            </div>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
              pagamento único · 12 meses de acesso completo
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: "hsl(43 72% 60%)" }}>
              ✦ Inclui todas as atualizações de conteúdos e ferramentas
            </p>
          </div>

          <ul className="space-y-3 mb-10 max-w-md mx-auto">
            {[
              "Acesso completo aos 9 módulos",
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
