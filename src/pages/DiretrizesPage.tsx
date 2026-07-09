import { useNavigate } from "react-router-dom";
import { Crown, ShieldCheck, Heart, Lock, Megaphone, TrendingUp, AlertTriangle, ArrowLeft, HelpCircle } from "lucide-react";

const guidelines = [
  {
    icon: Heart,
    title: "Respeito e Proteção da Energia",
    body: "Opiniões divergentes são acolhidas, mas julgamentos, desrespeito ou qualquer forma de agressividade não serão tolerados. Nós protegemos a frequência e a energia deste espaço.",
  },
  {
    icon: Crown,
    title: "Autenticidade sem Comparação",
    body: "Compartilhe a sua jornada real. Este é um ambiente de troca genuína e vulnerabilidade estratégica, não de aparências ou comparações destrutivas.",
  },
  {
    icon: Lock,
    title: "Privacidade Coletiva (Sigilo Absoluto)",
    body: "O que é compartilhado no Club, fica no Club. Respeite a intimidade, os desabafos e as histórias das outras membras. O sigilo aqui dentro é inegociável.",
  },
  {
    icon: Megaphone,
    title: "Proibição de Divulgação Comercial",
    body: "Não é permitida a panfletagem digital. É proibido divulgar produtos, serviços, links externos ou convites sem a autorização prévia e explícita da administração.",
  },
  {
    icon: TrendingUp,
    title: "Foco no Crescimento Comportamental",
    body: "Comentários negativos, fofocas ou conteúdos que diminuam o ecossistema e suas membras não fazem parte da nossa cultura. Nossa meta é puramente elevar e construir o seu legado.",
  },
  {
    icon: ShieldCheck,
    title: "Segurança de Dados e Infraestrutura",
    body: "A administração jamais solicitará dados pessoais, senhas ou confirmações de pagamento por mensagem privada. Caso receba qualquer abordagem suspeita, ignore e reporte imediatamente.",
  },
];

const DiretrizesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-amber-900/30 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--gold)/0.25),transparent_60%)]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-14 text-center">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full glass border border-gold/30 hover:bg-gold/10 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gold" />
          </button>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-gold/30 text-[10px] uppercase tracking-[0.3em] font-body text-gold">
            <Crown className="h-3 w-3" /> Regras do nosso ecossistema
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-display font-bold text-foreground">
            Diretrizes da Comunidade <span className="italic text-gold">👑</span>
          </h1>
          <p className="mt-4 text-base md:text-lg font-body text-muted-foreground max-w-2xl mx-auto">
            Bem-vinda ao Gloow Up Club. Este espaço foi desenhado exclusivamente para mulheres extraordinárias que decidiram assumir o comando da própria rotina e crescer com intencionalidade.
          </p>
        </div>
      </div>

      {/* GUIDELINES */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="glass rounded-2xl border border-gold/15 p-6 md:p-8 space-y-6">
          <p className="text-sm md:text-base font-body text-foreground leading-relaxed">
            Para garantir um ambiente seguro, produtivo e de alto valor, seguimos rigorosamente os seguintes combinados:
          </p>

          <ol className="space-y-5">
            {guidelines.map((g, idx) => {
              const Icon = g.icon;
              return (
                <li key={idx} className="rounded-xl border border-gold/10 bg-card/60 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-foreground text-base">
                        {idx + 1}. {g.title}
                      </h3>
                      <p className="mt-1.5 text-sm md:text-base font-body text-muted-foreground leading-relaxed">
                        {g.body}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="rounded-xl border border-gold/20 bg-gold/5 p-5 text-center">
            <p className="text-sm md:text-base font-body text-foreground leading-relaxed">
              Ao utilizar a plataforma do Gloow Up Club, você concorda com estas diretrizes e assume o compromisso de manter este ecossistema seguro e transformador para todas As Extraordinárias.
            </p>
          </div>

          <div className="rounded-xl border border-gold/10 bg-card/40 p-5">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-display font-bold text-foreground text-sm">Dúvidas ou suporte técnico?</h4>
                <p className="mt-1 text-sm font-body text-muted-foreground">
                  Entre em contato com a administração diretamente pelo canal oficial de suporte do aplicativo.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/bem-vindo")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-background font-display font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para boas-vindas
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiretrizesPage;
