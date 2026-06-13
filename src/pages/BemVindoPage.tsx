import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle, Compass, Crown, Heart, Trophy, BookOpen, Target } from "lucide-react";

const steps = [
  {
    n: 1, icon: Sparkles, title: "O que é o Gloow Up Club?",
    body: "É o seu cantinho de evolução diária: devocional personalizado, hábitos, metas SMART, finanças com IA, reprogramação mental, jornada Destravar Feminino, ciclo menstrual, vision board e muito mais — tudo pensado para mulheres que querem brilhar de verdade. 👑",
  },
  {
    n: 2, icon: Heart, title: "Apresente-se para as rainhas",
    body: "Conte quem você é, o que faz e o que sonha conquistar por aqui. É assim que a gente cria conexões reais dentro do clubinho.",
    cta: { label: "Fazer minha apresentação", to: "/apresentacoes" },
  },
  {
    n: 3, icon: MessageCircle, title: "Entre no grupo do WhatsApp",
    body: "Trocas diárias, avisos quentinhos, lives exclusivas e aquele apoio das meninas no dia a dia. Bora pra dentro?",
    cta: { label: "Entrar no grupo", href: "https://chat.whatsapp.com/KqwvIi2Ht238RoSMVCS7J0" },
  },
  {
    n: 4, icon: BookOpen, title: "Conheça nossas diretrizes",
    body: "Aqui a gente cultiva respeito, sororidade e elegância. Dá uma olhada nas regrinhas pra manter o clubinho leve e seguro pra todas.",
    cta: { label: "Ver diretrizes", to: "/sugestoes" },
  },
  {
    n: 5, icon: Compass, title: "Comece a explorar tudo",
    body: "Tem muita coisa boa esperando por você. Já dá pra começar pelo feed, pelo seu devocional do dia ou pelo ranking mensal.",
    links: [
      { label: "Ir para o feed da comunidade", to: "/comunidade" },
      { label: "Devocional de hoje", to: "/devocional" },
      { label: "Ver ranking mensal", to: "/ranking-mensal" },
      { label: "Minhas finanças", to: "/financas" },
      { label: "Vision Board", to: "/vision-board" },
    ],
  },
  {
    n: 6, icon: Trophy, title: "Participe dos desafios e suba no ranking",
    body: "A cada post, comentário e curtida você acumula pontos no ranking mensal Top Clubbers. Bora competir bonito e celebrar as vitórias juntas?",
    cta: { label: "Ver Top Clubbers", to: "/ranking-mensal" },
  },
  {
    n: 7, icon: Target, title: "Defina suas metas e sonhos",
    body: "Use Metas SMART, Vision Board e a Jornada Destravar Feminino pra transformar desejo em conquista. O clubinho caminha com você. ✨",
    cta: { label: "Criar minha primeira meta", to: "/metas" },
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
            <Crown className="h-3 w-3" /> Bom dia, rainha — bem-vinda ao
          </span>
          <h1 className="mt-5 text-5xl md:text-7xl font-display font-bold text-foreground">
            Gloow Up <span className="italic text-gold">Club</span>
          </h1>
          <p className="mt-4 text-base md:text-lg font-body text-muted-foreground max-w-2xl mx-auto">
            A comunidade premium de mulheres que escolheram brilhar todos os dias — mente, espírito, corpo e prosperidade num só lugar.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate("/comunidade")}
              className="px-6 py-3 rounded-full bg-gold text-background font-display font-semibold hover:opacity-90 transition-opacity">
              Explorar comunidade
            </button>
            <button onClick={() => navigate("/apresentacoes")}
              className="px-6 py-3 rounded-full border border-gold/40 text-foreground font-display font-semibold hover:bg-gold/10 transition-colors">
              Me apresentar
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
            Primeiros passos no <span className="italic text-gold">Clubinho</span>
          </h2>
          <p className="mt-3 text-sm font-body text-muted-foreground">
            Que alegria ter você aqui! ✨ O Gloow Up Club foi feito para mulheres como você — que querem evoluir com leveza, fé, propósito e estratégia. Siga os passos abaixo e descubra tudo o que preparamos com carinho pra sua jornada.
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
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold text-background text-xs font-display font-semibold hover:opacity-90">
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
