import { useNavigate } from "react-router-dom";
import { BookOpen, MessageCircle, Sparkles, Compass, Crown, Heart } from "lucide-react";

const steps = [
  {
    n: 1, icon: BookOpen, title: "Como funciona a comunidade?",
    body: "Conteúdos diários, devocional, hábitos, finanças, desafios e muito papo sobre crescimento pessoal e prosperidade — tudo num lugar só.",
  },
  {
    n: 2, icon: Heart, title: "Apresente-se para as outras rainhas!",
    body: "Conte quem é você, o que faz, o que ama e seus objetivos financeiros.",
    cta: { label: "Apresente-se aqui!", to: "/apresentacoes" },
  },
  {
    n: 3, icon: MessageCircle, title: "Entre no nosso grupo do WhatsApp",
    body: "👉 Clique aqui para acessar pelo celular",
    cta: { label: "Entrar no grupo", href: "https://chat.whatsapp.com/KqwvIi2Ht238RoSMVCS7J0" },
  },
  {
    n: 4, icon: BookOpen, title: "Conheça nossas diretrizes",
    body: "👉 Leia nossas regras antes de começar",
    cta: { label: "Leia nossas regras", to: "/sugestoes" },
  },
  {
    n: 5, icon: Sparkles, title: "Comece a explorar a comunidade",
    body: "Feed, eventos, grupos temáticos e suas finanças — tudo a um clique.",
    links: [
      { label: "Ir para o feed", to: "/comunidade" },
      { label: "Ver ranking", to: "/ranking-mensal" },
      { label: "Ver finanças", to: "/financas" },
    ],
  },
  {
    n: 6, icon: Crown, title: "Tour Exclusivo do Gloow Up Club",
    body: "Descubra tudo o que o clubinho pode fazer por você. Neste tour completo, vamos te mostrar os bastidores, benefícios e oportunidades que só quem faz parte tem acesso. 👑",
    cta: { label: "Veja o tour", to: "/" },
  },
];

const BemVindoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-amber-900/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--gold)/0.25),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-gold/30 text-[10px] uppercase tracking-[0.3em] font-body text-gold">
            <Crown className="h-3 w-3" /> Bem-vinda ao
          </span>
          <h1 className="mt-5 text-5xl md:text-7xl font-display font-bold text-foreground">
            Gloow Up <span className="italic text-gold">Club</span>
          </h1>
          <p className="mt-4 text-base md:text-lg font-body text-muted-foreground max-w-2xl mx-auto">
            A melhor comunidade de finanças, autocuidado e produtividade para mulheres extraordinárias.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate("/comunidade")}
              className="px-6 py-3 rounded-full bg-gold text-background font-display font-semibold hover:opacity-90 transition-opacity">
              Explorar comunidade
            </button>
            <button onClick={() => navigate("/apresentacoes")}
              className="px-6 py-3 rounded-full border border-gold/40 text-foreground font-display font-semibold hover:bg-gold/10 transition-colors">
              Apresente-se
            </button>
          </div>
        </div>
      </div>

      {/* STEPS */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-body text-gold">
            <Compass className="h-3 w-3" /> Tour
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-display font-bold text-foreground">
            Primeiros passos na <span className="italic text-gold">Comunidade</span>
          </h2>
          <p className="mt-3 text-sm font-body text-muted-foreground">
            Oie, que incrível ter você aqui! ✨ 💗<br />
            Esse espaço foi criado para mulheres como nós — que querem aprender, crescer e se organizar financeiramente sem aquela linguagem chata e complicada. Aqui a gente fala de dinheiro, carreira, hábitos e vida real. E você nunca mais vai se sentir sozinha ou perdida nessa jornada.
          </p>
        </div>

        <ol className="space-y-5">
          {steps.map(s => {
            const Icon = s.icon;
            return (
              <li key={s.n} className="glass rounded-2xl border border-gold/15 p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gold text-background flex items-center justify-center font-display font-bold">
                    {s.n}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gold" /> {s.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-body text-muted-foreground leading-relaxed">{s.body}</p>

                    {s.cta && (
                      <div className="mt-3">
                        {"href" in s.cta && s.cta.href ? (
                          <a href={s.cta.href} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500 text-white text-xs font-display font-semibold hover:opacity-90">
                            <MessageCircle className="h-3.5 w-3.5" /> {s.cta.label}
                          </a>
                        ) : (
                          <button onClick={() => navigate((s.cta as any).to)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/40 text-foreground text-xs font-display font-semibold hover:bg-gold/10">
                            {s.cta.label}
                          </button>
                        )}
                      </div>
                    )}

                    {s.links && (
                      <ul className="mt-3 space-y-1.5">
                        {s.links.map(l => (
                          <li key={l.to}>
                            <button onClick={() => navigate(l.to)}
                              className="text-sm font-body text-gold hover:underline">
                              • {l.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export default BemVindoPage;
