import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import agendaLivesJulho from "@/assets/agenda-lives-julho.png.asset.json";
import appScreen1 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.26.jpeg.asset.json";
import appScreen2 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.42.jpeg.asset.json";
import appScreen3 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.55.jpeg.asset.json";
import appScreen4 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.13.jpeg.asset.json";
import appScreen5 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.25.jpeg.asset.json";
import appScreen6 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.35.jpeg.asset.json";
import appScreen7 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.46.jpeg.asset.json";
import appScreen8 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.55.jpeg.asset.json";
import appScreen9 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.06.jpeg.asset.json";
import appScreen10 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.16.jpeg.asset.json";
import appScreen11 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.44.jpeg.asset.json";
import appScreen12 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.26.01.jpeg.asset.json";
import bannerConheca from "@/assets/app-screens/image-60.png.asset.json";

const APP_SCREENS = [
  { img: appScreen1.url, title: "Home da rainha", desc: "Boas-vindas, presentação e mensagem da sua versão do futuro." },
  { img: appScreen2.url, title: "Termômetro do mês", desc: "Ajusta o app pro seu momento com 3 perguntas rápidas." },
  { img: appScreen3.url, title: "Palavra do dia", desc: "Devocional personalizado com reflexão, estudo e prática." },
  { img: appScreen4.url, title: "Comece por aqui", desc: "Reprogramação, estudos, metas, Destravar Feminino e mais." },
  { img: appScreen5.url, title: "Fase menstrual", desc: "Sugestões conforme sua fase e pulso semanal da sua evolução." },
  { img: appScreen6.url, title: "3 chaves para destravar", desc: "Direção Certa, Controle Interno e Jogo da Ambiência." },
  { img: appScreen7.url, title: "Metas e Manifestação", desc: "Escreva, marque progresso e veja acontecer." },
  { img: appScreen8.url, title: "Minhas finanças", desc: "PF, CNPJ, Open Finance e visão completa do seu mês." },
  { img: appScreen9.url, title: "Consultora Financeira IA", desc: "Mentora de finanças 24h com dicas comportamentais." },
  { img: appScreen10.url, title: "Feed das Extraordinárias", desc: "Comunidade viva com stories, ranking e conexões reais." },
  { img: appScreen11.url, title: "Seu mês de relance", desc: "Calendário com hábitos, metas, saúde, finanças e desafios." },
  { img: appScreen12.url, title: "Saúde e Fitness", desc: "Peso, dieta, treinos, água, ciclo, sono e remédios num só lugar." },
];
import ericaFounder from "@/assets/erica-founder.jpg";
import brandLogo from "@/assets/gloow-up-club-logo.png";
import depoimentoNayara from "@/assets/depoimento-nayara.png";
import depoimentoSimone from "@/assets/depoimento-simone.png";
import depoimentoKamila from "@/assets/depoimento-kamila.png";
import depoimentoGabrielly from "@/assets/depoimento-gabrielly.png";
import depoimentoWpp1 from "@/assets/depoimento-wpp1.png";
import depoimentoWpp2 from "@/assets/depoimento-wpp2.png";
import depoimentoNat from "@/assets/depoimento-nat.jpeg";
import depoimentoNat2 from "@/assets/depoimento-nat2.jpeg";
import depoimentoNayara2 from "@/assets/depoimento-nayara2.jpeg";
import depoimentoDaiane from "@/assets/depoimento-daiane.jpeg";
import depoimentoPatricia from "@/assets/depoimento-patricia.jpeg";
import depoimentoCristiane from "@/assets/depoimento-cristiane.jpeg";
import depoimentoNatalia from "@/assets/depoimento-natalia.jpeg";

const TESTIMONIALS = [
  { name: "Nayara Moraes", img: depoimentoNayara },
  { name: "Simone Costa", img: depoimentoSimone },
  { name: "Kamila Moreira", img: depoimentoKamila },
  { name: "Gabrielly Rosa", img: depoimentoGabrielly },
  { name: "Larissa Pereira", img: depoimentoWpp1 },
  { name: "Larissa Pereira", img: depoimentoWpp2 },
  { name: "Nat, Psicóloga", img: depoimentoNat },
  { name: "Nayara, Analista de Operações", img: depoimentoNayara2 },
  { name: "Daiane, Asunción/PY", img: depoimentoDaiane },
  { name: "Patrícia, CEO RBL", img: depoimentoPatricia },
  { name: "Cristiane, Rio de Janeiro", img: depoimentoCristiane },
  { name: "Natália, Psicóloga", img: depoimentoNatalia },
  { name: "Nat, sobre as dinâmicas", img: depoimentoNat2 },
];

const KIWIFY_URL = "https://pay.kiwify.com.br/mHzhnuA";

// ===== Design tokens (inline to keep this page self-contained) =====
// Light premium palette, off-white pérola + gold (matches app theme)
const C = {
  bg: "#FAF7F0",
  bgSoft: "#F3EDE0",
  bgCard: "#FFFFFF",
  border: "rgba(201,148,41,0.28)",
  borderSoft: "rgba(201,148,41,0.14)",
  gold: "#C99429",
  goldLight: "#E0B85A",
  goldMuted: "#8A6820",
  cream: "#2A2317",
  creamDim: "rgba(42,35,23,0.70)",
  creamFaint: "rgba(42,35,23,0.45)",
};

const serif = { fontFamily: "'Cormorant Garamond', serif" };
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ===== Reusable bits =====
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col items-center gap-3 mb-4">
    <span
      style={{ ...sans, color: C.gold, letterSpacing: "0.2em" }}
      className="text-[11px] font-medium uppercase"
    >
      {children}
    </span>
    <span
      aria-hidden
      style={{
        width: 36,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
        display: "block",
      }}
    />
  </div>
);

const H2 = ({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: React.ReactNode;
}) => (
  <h2
    style={{ ...serif, color: C.cream, lineHeight: 1.1 }}
    className="text-[34px] md:text-[48px] font-light tracking-tight text-center"
  >
    {children}
    {highlight && (
      <>
        <br />
        <em style={{ color: C.gold, fontStyle: "italic" }}>{highlight}</em>
      </>
    )}
  </h2>
);

const PrimaryCTA = ({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    style={{
      ...sans,
      background: C.gold,
      color: "#FFFFFF",
      letterSpacing: "0.08em",
      borderRadius: 50,
    }}
    className={`inline-flex items-center justify-center px-10 py-4 text-[13px] font-medium uppercase transition-all hover:opacity-90 hover:-translate-y-0.5 ${className}`}
  >
    {children}
  </a>
);

const GhostLink = ({
  children,
  to,
  href,
}: {
  children: React.ReactNode;
  to?: string;
  href?: string;
}) => {
  const cls =
    "inline-flex items-center gap-1.5 text-[13px] font-light pb-0.5 transition-colors";
  const style = {
    ...sans,
    color: C.creamDim,
    borderBottom: `1px solid ${C.border}`,
  };
  if (to)
    return (
      <Link to={to} style={style} className={`${cls} hover:text-[#2A2317]`}>
        {children}
      </Link>
    );
  return (
    <a href={href} style={style} className={`${cls} hover:text-[#2A2317]`}>
      {children}
    </a>
  );
};

// ===== Data =====
const FOR_YOU = [
  "Você vive no ciclo de começar, parar e recomeçar toda segunda-feira",
  "Você sente que o dia acontece com você, não através de você",
  "Você quer evoluir mas não sabe por onde começar de verdade",
  "Você está sempre ocupada mas raramente realizada",
  "Você quer cuidar da mente, do dinheiro e do corpo, mas tudo separado demais para funcionar",
  "Você quer fazer parte de uma comunidade de mulheres que te entende e te mantém em movimento",
];

const MODULES = [
  {
    n: "01",
    title: "Reprogramação Mental",
    desc: "Você não vai mais travar antes de agir. Meditações guiadas com frequências Hz, PNL, neurociência aplicada e Lei da Atração com base científica. O maior obstáculo entre você e seus objetivos mora na sua própria cabeça. Aqui ele deixa de ser obstáculo.",
  },
  {
    n: "02",
    title: "Metas e Manifestação",
    desc: "Saia do \"vou tentar\" para o \"está feito\". Defina, decomponha e acompanhe suas metas com framework científico. Submetas com prazo, progresso em tempo real e a dopamina real de cada conquista marcada. Meta sem método é só desejo.",
  },
  {
    n: "03",
    title: "Alta Performance",
    desc: "Otimize como as pessoas que você admira fazem. Podcasts curados, técnicas de estudo como Pomodoro, Feynman e Active Recall, cursos e desenvolvimento intelectual em curadoria de quem já chegou lá.",
  },
  {
    n: "04",
    title: "Saúde e Fitness",
    desc: "Seu corpo é seu ativo mais valioso. Acompanhe dieta, treino, suplementos, sono e ciclo menstrual integrados. Conte com a IA Nutri Luna, nutricionista funcional especialista em jejum intermitente e reprogramação metabólica feminina. O regulador inteligente do sono usa IA para criar um plano personalizado. E a aba de ciclo adapta sua rotina à sua biologia.",
  },
  {
    n: "05",
    title: "Gestão Financeira",
    desc: "Dinheiro que para de sumir. Controle de renda, despesas fixas e variáveis, saldo em tempo real e IA especializada em finanças para te direcionar. Prosperidade não é sorte, é gestão.",
  },
  {
    n: "06",
    title: "Espiritualidade e Diário",
    desc: "Nutra sua alma com a mesma intencionalidade que nutre seu corpo. Cronograma personalizado de leitura em 365 dias, devocional diário e diário pessoal com reflexões. Dentro do app você escolhe entre 22 orientações religiosas, cristã, católica, espírita, umbanda, candomblé, judaica, budista e mais. Respeitamos todas.",
  },
  {
    n: "07",
    title: "Desafios Progressivos",
    desc: "De 7 a 90 dias, com fundamentação científica em cada tarefa. Cada desafio foi desenhado para criar momentum real, não motivação passageira.",
  },
  {
    n: "08",
    title: "Comunidade das Extraordinárias",
    desc: "Uma rede social privada completa e exclusiva para membras do Club. Networking feminino real, ranking de streak e um ambiente para crescerem juntas. Você não precisa mais caminhar sozinha.",
  },
  {
    n: "09",
    title: "IA Assistente Pessoal",
    desc: "Sua parceira de gestão de tempo, disponível 24h. Organiza sua agenda, cria rotinas personalizadas e te lembra do que importa. Por texto ou por voz. Treinada para a sua rotina.",
  },
];

const JOURNEY = [
  {
    label: "Ao entrar",
    text:
      "Sua rotina é uma sequência de obrigações. Sua mente está sobrecarregada tentando lembrar de tudo. O cuidado com você mesma sempre fica para depois.",
  },
  {
    label: "30 dias",
    text:
      "Você começa a perceber que está pensando antes de agir. O app se torna o primeiro lugar que você abre pela manhã, antes das redes sociais.",
  },
  {
    label: "3 meses",
    text:
      "Suas finanças têm clareza pela primeira vez. Suas metas saíram do papel. A comunidade te mantém em movimento nos dias em que você travaria sozinha.",
  },
  {
    label: "6 meses",
    text:
      "Você conhece seu corpo de um jeito que não conhecia antes. Entende seus ciclos, sua energia, seus limites. Mente forte e paz interior deixaram de ser opostos.",
  },
  {
    label: "1 ano",
    text:
      "A identidade mudou. As escolhas conscientes deixaram de ser esforço e viraram padrão. Crescer sem se perder virou quem você é.",
  },
];

const BENEFITS = [
  "Acesso completo aos 10+ módulos",
  "Acesso pelo navegador no celular, tablet e computador",
  "Comunidade das Extraordinárias, rede social privada exclusiva",
  "IA Assistente, IA Nutri Luna, IA do Sono, IA do Eu Superior, IA de Finanças",
  "Reprogramação Mental e Alta Performance",
  "Desafios progressivos de 7 a 90 dias",
  "Saúde, Finanças, Bíblia 365 e Diário",
  "Atualizações constantes sem custo adicional",
];

const FAQ = [
  {
    q: "Não tenho tempo para acompanhar tudo.",
    a: "O Club foi feito para a mulher ocupada. Cinco minutos por dia já mantém a conexão. O restante você acessa quando quiser, no seu ritmo.",
  },
  {
    q: "Já tentei outros apps e não funcionou.",
    a: "Você tentou sozinha, com começo e fim. O Club é contínuo e funciona exatamente nos dias em que a motivação some.",
  },
  {
    q: "Funciona como app no celular?",
    a: "O Gloow Up Club é acessado pelo navegador, sem precisar baixar nada em loja de apps. Funciona no celular, tablet e computador, basta acessar pelo site. Você ainda pode adicionar o atalho à tela inicial do celular para abrir como se fosse um app.",
  },
  {
    q: "O que são os Desafios Progressivos?",
    a: "São jornadas de transformação de 7 a 90 dias, com fundamentação científica em cada tarefa. Cada desafio foi desenhado para criar momentum real.",
  },
  {
    q: "Tem leitura da Bíblia? E quem não é cristã?",
    a: "Sim, com cronograma personalizado de 365 dias e devocional diário. E dentro do app você escolhe entre 22 orientações religiosas, cristã, católica, espírita, umbanda, candomblé, judaica, budista, entre outras. O conteúdo se adapta à sua crença. Respeitamos todas.",
  },
  {
    q: "Tem IA?",
    a: "Sim. O Club tem IA Assistente Pessoal, IA Nutri Luna (nutricionista funcional especialista em jejum intermitente e reprogramação metabólica feminina), IA do Sono com diagnóstico circadiano, IA do Eu Superior para conexão espiritual e IA de Finanças.",
  },
  {
    q: "Quanto custa e como pago?",
    a: "R$67,90 no ano, pagamento único, ou em até 12x de R$7,02 no cartão. Não há renovação automática.",
  },
  {
    q: "Posso cancelar?",
    a: "R$ 67,90 no ano, pagamento único à vista ou em até 12x de R$ 7,02 no cartão. A sua assinatura é anual e a renovação é automática após 12 meses, mas você pode cancelar a renovação quando quiser direto na plataforma de pagamento.",
  },
  {
    q: "Recebo atualizações sem pagar mais?",
    a: "Sim. Quem entra agora garante acesso a todos os novos módulos e conteúdos sem custo adicional.",
  },
];

// ===== Page =====
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ background: C.bg, color: C.cream, ...sans }}
      className="min-h-screen overflow-x-hidden"
    >
      {/* HEADER */}
      <header
        style={{
          background: scrolled ? "rgba(250,247,240,0.90)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? `1px solid ${C.borderSoft}` : "1px solid transparent",
        }}
        className="fixed top-0 left-0 right-0 z-50 transition-all"
      >
        <div className="max-w-[1080px] mx-auto px-5 md:px-12 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={brandLogo} alt="Gloow Up Club" className="h-9 w-9 object-contain rounded-lg" />
            <span style={{ ...serif, color: C.cream }} className="text-[18px] font-light hidden sm:inline">
              Gloow Up <span style={{ color: C.gold }}>Club</span>
            </span>
          </Link>
          <GhostLink to="/login">Já sou membra →</GhostLink>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-36 pb-24 md:pt-44 md:pb-32 px-5 md:px-12">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(201,148,41,0.12), transparent 60%)",
          }}
        />
        <div className="relative max-w-[1080px] mx-auto text-center">
          <p
            style={{ ...sans, color: C.gold, letterSpacing: "0.2em" }}
            className="text-[11px] font-medium uppercase mb-6"
          >
            Ecossistema feminino de alta performance
          </p>
          <h1
            style={{ ...serif, color: C.cream, lineHeight: 1.05 }}
            className="text-[44px] md:text-[72px] font-light tracking-tight"
          >
            Você não tem falta de motivação.
            <br />
            Você tem falta de{" "}
            <em style={{ color: C.gold, fontStyle: "italic" }}>sistema.</em>
          </h1>
          <p
            style={{ color: C.creamDim, lineHeight: 1.75 }}
            className="mt-8 max-w-[640px] mx-auto text-[16px] md:text-[17px] font-light"
          >
            Enquanto você tenta se organizar sozinha, outra mulher com os mesmos
            objetivos que os seus já está executando. A diferença não é talento.
            É estrutura.
          </p>
          <p
            style={{ color: C.creamDim, lineHeight: 1.75 }}
            className="mt-4 max-w-[640px] mx-auto text-[16px] md:text-[17px] font-light"
          >
            O Gloow Up Club é esse sistema.
          </p>
          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-5">
            <PrimaryCTA href={KIWIFY_URL}>Quero entrar no Club</PrimaryCTA>
            <GhostLink href="#modulos">Ver o que tem dentro →</GhostLink>
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section
        style={{
          background: C.bgSoft,
          borderTop: `1px solid ${C.borderSoft}`,
          borderBottom: `1px solid ${C.borderSoft}`,
        }}
        className="py-20 md:py-28 px-5 md:px-12"
      >
        <div className="max-w-[880px] mx-auto">
          <div className="text-center">
            <SectionLabel>Para quem é</SectionLabel>
            <H2 highlight={undefined}>
              O Club é <em style={{ color: C.gold, fontStyle: "italic" }}>para você</em> se...
            </H2>
          </div>
          <ul className="mt-12 space-y-5 max-w-[720px] mx-auto">
            {FOR_YOU.map((t) => (
              <li
                key={t}
                style={{ color: C.cream, borderBottom: `1px solid ${C.borderSoft}` }}
                className="pb-5 text-[16px] md:text-[17px] font-light flex gap-4"
              >
                <span style={{ color: C.gold }} className="shrink-0">-</span>
                <span style={{ color: C.creamDim, lineHeight: 1.75 }}>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FUNDADORA, movida para logo após a primeira dobra */}
      <section className="py-24 md:py-32 px-5 md:px-12">
        <div className="max-w-[1080px] mx-auto grid md:grid-cols-[420px_1fr] gap-12 md:gap-16 items-center">
          <div
            style={{ border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}
            className="aspect-[3/4] w-full max-w-[420px] mx-auto"
          >
            <img
              src={ericaFounder}
              alt="Érica Carvalho, fundadora do Gloow Up Club"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <SectionLabel>Quem está do outro lado</SectionLabel>
            <h2
              style={{ ...serif, color: C.cream, lineHeight: 1.1 }}
              className="text-[34px] md:text-[48px] font-light tracking-tight"
            >
              Quem criou o <em style={{ color: C.gold, fontStyle: "italic" }}>Club</em>
            </h2>
            <div className="mt-8 space-y-4">
              <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] font-light">
                <span style={{ color: C.cream, fontWeight: 400 }}>Érica Carvalho</span> é a criadora do Gloow Up Club, graduanda em Gestão de Recursos Humanos, apaixonada por performance feminina e desenvolvimento pessoal com base em neurociência.
              </p>
              <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] font-light">
                Supervisora de Atendimento em uma das maiores empresas de educação jurídica do Brasil, ela entendeu na prática o que separa as mulheres que performam em alto nível das que vivem no ciclo de começar e parar: não é talento, não é força de vontade. É estrutura.
              </p>
              <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] font-light">
                O Gloow Up Club nasceu dessa percepção. Foi construído do zero, com neurociência, neuromarketing e muita vivência real. Não é teoria. É o sistema que ela mesma precisava e não existia.
              </p>
              <p style={{ ...serif, color: C.gold }} className="italic text-[18px] pt-2">
                Por @erica.carvalhor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A VIRADA */}
      <section className="py-24 md:py-32 px-5 md:px-12">
        <div className="max-w-[820px] mx-auto text-center">
          <SectionLabel>A virada</SectionLabel>
          <H2 highlight="Você só tentou do jeito mais difícil.">Você não falhou.</H2>
          <div className="mt-10 space-y-5 max-w-[640px] mx-auto">
            <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] md:text-[17px] font-light">
              A gente foi ensinada que evoluir depende de querer mais. De se esforçar mais. De ter mais disciplina.
            </p>
            <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] md:text-[17px] font-light">
              Só que força de vontade é um recurso limitado. Acaba. E quando acaba, a culpa aparece. E a culpa não muda nada.
            </p>
            <p style={{ color: C.cream, lineHeight: 1.75 }} className="text-[16px] md:text-[17px] font-normal">
              O que cria constância de verdade é outra coisa: é ambiente, é método, é comunidade.
            </p>
          </div>
          <div className="mt-10">
            <PrimaryCTA href={KIWIFY_URL}>Quero entrar no Club</PrimaryCTA>
          </div>
        </div>
      </section>

      {/* O CONCEITO */}
      <section
        style={{ background: C.bgSoft, borderTop: `1px solid ${C.borderSoft}`, borderBottom: `1px solid ${C.borderSoft}` }}
        className="py-24 md:py-32 px-5 md:px-12"
      >
        <div className="max-w-[880px] mx-auto text-center">
          <SectionLabel>O conceito</SectionLabel>
          <H2 highlight="É o seu segundo cérebro.">Não é mais um app.</H2>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-10 text-[16px] md:text-[17px] font-light max-w-[680px] mx-auto">
            Sua vida não funciona em compartimentos. Sua saúde afeta sua produtividade. Sua mente afeta suas finanças. Tudo está conectado, e o seu sistema também precisa ser.
          </p>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-4 text-[16px] md:text-[17px] font-light max-w-[680px] mx-auto">
            O Gloow Up Club une o que os grandes players separam: neurociência aplicada, gestão de metas, saúde, finanças, espiritualidade e comunidade real, numa única plataforma construída para a mulher inteira.
          </p>

          <div className="mt-14 grid md:grid-cols-3 gap-5 text-left">
            {[
              "Não é mais um app de lista de tarefas.",
              "Não é motivação que dura três dias.",
              "Não é conteúdo que você consome e esquece.",
            ].map((t) => (
              <div
                key={t}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderTop: `2px solid ${C.gold}`,
                  borderRadius: 16,
                }}
                className="p-7"
              >
                <p style={{ ...serif, color: C.cream }} className="text-[20px] font-normal italic leading-snug">
                  {t}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* O QUE VOCÊ ENCONTRA */}
      <section id="modulos" className="py-24 md:py-32 px-5 md:px-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>O que você encontra no Club</SectionLabel>
            <H2 highlight="não o contrário.">Uma estrutura que sustenta você,</H2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map((m) => (
              <article
                key={m.n}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderTop: `2px solid ${C.gold}`,
                  borderRadius: 16,
                }}
                className="p-8 transition-all hover:-translate-y-1"
              >
                <div
                  style={{ ...sans, color: C.goldMuted, letterSpacing: "0.2em" }}
                  className="text-[11px] font-medium uppercase mb-3"
                >
                  {m.n}
                </div>
                <h3 style={{ ...serif, color: C.cream }} className="text-[22px] font-normal mb-3">
                  {m.title}
                </h3>
                <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[15px] font-light">
                  {m.desc}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-14 text-center">
            <PrimaryCTA href={KIWIFY_URL}>Quero entrar no Club</PrimaryCTA>
          </div>
        </div>
      </section>

      {/* JORNADA */}
      <section
        style={{ background: C.bgSoft, borderTop: `1px solid ${C.borderSoft}`, borderBottom: `1px solid ${C.borderSoft}` }}
        className="py-24 md:py-32 px-5 md:px-12"
      >
        <div className="max-w-[820px] mx-auto">
          <div className="text-center mb-16">
            <SectionLabel>Jornada de transformação</SectionLabel>
            <H2>O que muda com o tempo</H2>
          </div>
          <ol className="space-y-10 relative">
            <div
              aria-hidden
              className="absolute left-[7px] top-2 bottom-2 hidden md:block"
              style={{ width: 1, background: C.border }}
            />
            {JOURNEY.map((j) => (
              <li key={j.label} className="md:pl-12 relative">
                <span
                  aria-hidden
                  className="hidden md:block absolute left-0 top-2"
                  style={{ width: 15, height: 15, borderRadius: 99, background: C.gold, boxShadow: `0 0 0 4px ${C.bgSoft}` }}
                />
                <div
                  style={{ ...sans, color: C.gold, letterSpacing: "0.2em" }}
                  className="text-[11px] font-medium uppercase mb-2"
                >
                  {j.label}
                </div>
                <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="text-[16px] md:text-[17px] font-light">
                  {j.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>


      {/* CONHEÇA O APP */}
      <section className="py-20 md:py-28 px-5 md:px-12" style={{ background: `linear-gradient(180deg, transparent, ${C.gold}08, transparent)` }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Conheça nosso app</SectionLabel>
            <H2 highlight="por dentro do Club.">Um tour visual</H2>
            <p style={{ color: C.creamDim }} className="mt-5 text-[15px] font-light max-w-[600px] mx-auto">
              Veja como é a experiência real das Extraordinárias. Tudo funciona pelo navegador: celular, tablet ou computador. Não precisa baixar em loja de apps.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-7">
            {APP_SCREENS.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div
                  style={{
                    borderRadius: 42,
                    padding: 8,
                    background: `linear-gradient(160deg, ${C.gold}55, ${C.gold}15)`,
                    boxShadow: `0 20px 40px -20px ${C.gold}55, 0 0 0 1px ${C.border}`,
                  }}
                  className="w-full transition-transform duration-500 group-hover:-translate-y-2"
                >
                  <div
                    style={{
                      borderRadius: 36,
                      overflow: "hidden",
                      background: C.bg,
                      aspectRatio: "9 / 19.5",
                      border: `2px solid ${C.gold}88`,
                    }}
                    className="w-full relative"
                  >
                    <img
                      src={s.img}
                      alt={s.title}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div style={{ ...serif, color: C.cream }} className="mt-5 text-[15px]">{s.title}</div>
                <p style={{ color: C.creamDim }} className="mt-1.5 text-[12px] font-light leading-relaxed px-1">
                  {s.desc}
                </p>
              </div>
            ))}
            {/* Banner standalone — sem moldura de celular */}
            <div className="flex flex-col items-center text-center group md:col-span-1 lg:col-span-2">
              <div
                style={{
                  borderRadius: 24,
                  padding: 8,
                  background: `linear-gradient(160deg, ${C.gold}55, ${C.gold}15)`,
                  boxShadow: `0 20px 40px -20px ${C.gold}55, 0 0 0 1px ${C.border}`,
                }}
                className="w-full transition-transform duration-500 group-hover:-translate-y-2"
              >
                <div
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    background: C.bg,
                    border: `2px solid ${C.gold}88`,
                  }}
                  className="w-full relative"
                >
                  <img
                    src={bannerConheca.url}
                    alt="Gloow Up Club - Sua melhor versão começa aqui"
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
              <div style={{ ...serif, color: C.cream }} className="mt-5 text-[15px]">Bem-vinda ao Club</div>
              <p style={{ color: C.creamDim }} className="mt-1.5 text-[12px] font-light leading-relaxed px-1">
                Sua melhor versão começa aqui: comunidade, app e desenvolvimento pessoal feminino.
              </p>
            </div>
          </div>
          <div className="text-center mt-14">
            <PrimaryCTA href={KIWIFY_URL}>Quero acessar o app ✦</PrimaryCTA>
          </div>
        </div>
      </section>

      {/* ACESSO PELO NAVEGADOR */}
      <section
        className="py-16 md:py-24 px-5 md:px-12"
        style={{ background: `linear-gradient(180deg, ${C.gold}08, transparent)` }}
      >
        <div className="max-w-[720px] mx-auto text-center">
          <SectionLabel>Acesso pelo navegador</SectionLabel>
          <h2
            style={{ ...serif, color: C.cream, lineHeight: 1.2 }}
            className="text-[28px] md:text-[36px] font-light tracking-tight"
          >
            Não precisa instalar nada
          </h2>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-6 text-[16px] md:text-[17px] font-light">
            O Gloow Up Club é uma plataforma web. Você acessa direto pelo navegador do seu celular, tablet ou computador, sem baixar nada em loja de apps. Basta fazer login no site e começar.
          </p>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-4 text-[16px] md:text-[17px] font-light">
            Quer ainda mais praticidade no celular? É só adicionar o site à tela inicial. Ele abre rápido, como se fosse um app.
          </p>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-24 md:py-32 px-5 md:px-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Resultados reais</SectionLabel>
            <H2 highlight="sistema substitui tentativa.">O que acontece quando</H2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={i}
                style={{
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  overflow: "hidden",
                }}
                className="flex flex-col"
              >
                <div className="w-full overflow-hidden" style={{ background: C.bg }}>
                  <img
                    src={t.img}
                    alt={`Depoimento de ${t.name}`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <figcaption
                  style={{ borderTop: `1px solid ${C.borderSoft}`, color: C.cream }}
                  className="px-5 py-4 text-center"
                >
                  <span style={{ ...serif, color: C.gold }} className="italic text-[15px]">
                    {t.name}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p
            style={{ color: C.creamDim, lineHeight: 1.75 }}
            className="mt-12 text-center text-[15px] md:text-[16px] font-light max-w-[600px] mx-auto"
          >
            Elas não tinham mais tempo, mais dinheiro ou mais talento.
            <br />
            Tinham o mesmo sistema que você está prestes a ter.
          </p>
          <div className="mt-10 text-center">
            <PrimaryCTA href={KIWIFY_URL}>Quero viver isso também</PrimaryCTA>
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section
        style={{ background: C.bgSoft, borderTop: `1px solid ${C.borderSoft}`, borderBottom: `1px solid ${C.borderSoft}` }}
        className="py-24 md:py-32 px-5 md:px-12"
      >
        <div className="max-w-[720px] mx-auto">
          <div className="text-center">
            <SectionLabel>Acesso ao ecossistema</SectionLabel>
            <H2>Comece sua transformação.</H2>
            <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-8 text-[15px] font-light max-w-[560px] mx-auto">
              Uma sessão de coaching custa R$300. Um planner premium R$150. Um app de meditação R$40/mês. Um curso de finanças R$200.
              O Gloow Up Club entrega tudo isso: integrado, atualizado e disponível onde você estiver.
            </p>
          </div>

          <div
            style={{
              background: C.bgCard,
              border: `1px solid ${C.border}`,
              borderTop: `2px solid ${C.gold}`,
              borderRadius: 16,
            }}
            className="mt-12 p-8 md:p-12"
          >
            <div className="text-center">
              <p style={{ ...sans, color: C.gold, letterSpacing: "0.2em" }} className="text-[11px] font-medium uppercase mb-4">
                ✦ Plano Anual, Preço de lançamento
              </p>
              <div style={{ ...serif, color: C.cream }} className="text-[64px] md:text-[80px] font-light leading-none">
                R$67<span style={{ color: C.goldMuted }}>,90</span>
              </div>
              <p style={{ color: C.creamDim }} className="mt-3 text-[14px] font-light">
                pagamento único · 12 meses de acesso completo
              </p>
              <p style={{ color: C.creamFaint }} className="text-[13px] font-light">
                ou em até 12x de R$7,02 no cartão
              </p>
              <p style={{ ...serif, color: C.gold }} className="mt-6 italic text-[16px]">
                Menos de R$8 por mês.
              </p>
              <p style={{ color: C.creamDim, lineHeight: 1.7 }} className="mt-3 text-[13px] font-light max-w-[440px] mx-auto">
                O valor de <span style={{ color: C.gold }}>um café com leite</span> por mês para reprogramar sua mente, seu corpo e sua rotina inteira.
              </p>
            </div>

            <ul className="mt-10 space-y-3">
              {BENEFITS.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <Check size={16} style={{ color: C.gold }} className="mt-0.5 shrink-0" />
                  <span style={{ color: C.cream }} className="text-[15px] font-light">
                    {b}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 text-center">
              <PrimaryCTA href={KIWIFY_URL} className="w-full md:w-auto">
                Quero meu acesso anual ✦
              </PrimaryCTA>
              <p style={{ color: C.creamFaint }} className="mt-5 text-[12px] font-light">
                Já é membra? <Link to="/login" style={{ color: C.gold }}>Faça login →</Link>
              </p>
            </div>
          </div>

          <p style={{ color: C.creamFaint, lineHeight: 1.75 }} className="mt-8 text-center text-[12px] font-light italic max-w-[560px] mx-auto">
            O preço atual é de lançamento. Quando os próximos módulos forem lançados, o valor será reajustado. Quem entrar agora garante o acesso às atualizações sem pagar mais.
          </p>
        </div>
      </section>

      {/* GARANTIA */}
      <section className="py-20 px-5 md:px-12">
        <div
          style={{ border: `1px solid ${C.border}`, borderRadius: 16, background: C.bgCard }}
          className="max-w-[720px] mx-auto p-10 text-center"
        >
          <p style={{ ...sans, color: C.gold, letterSpacing: "0.2em" }} className="text-[11px] font-medium uppercase mb-4">
            Garantia
          </p>
          <h3 style={{ ...serif, color: C.cream }} className="text-[26px] md:text-[32px] font-light">
            7 dias para sentir se é <em style={{ color: C.gold, fontStyle: "italic" }}>para você</em>
          </h3>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-5 text-[15px] font-light">
            Se nesse período você perceber que o Club não faz sentido para o momento que está vivendo, devolvemos seu investimento. Sem perguntas, sem burocracia.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section
        style={{ background: C.bgSoft, borderTop: `1px solid ${C.borderSoft}`, borderBottom: `1px solid ${C.borderSoft}` }}
        className="py-24 md:py-32 px-5 md:px-12"
      >
        <div className="max-w-[760px] mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Perguntas frequentes</SectionLabel>
            <H2>Tire suas dúvidas.</H2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14 }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                  >
                    <span style={{ color: C.cream }} className="text-[15px] md:text-[16px] font-normal">
                      {f.q}
                    </span>
                    <ChevronDown
                      size={18}
                      style={{ color: C.gold, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                    />
                  </button>
                  {open && (
                    <div
                      style={{ color: C.creamDim, lineHeight: 1.75, borderTop: `1px solid ${C.borderSoft}` }}
                      className="px-6 py-5 text-[15px] font-light"
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FECHAMENTO */}
      <section className="py-28 md:py-36 px-5 md:px-12 text-center">
        <div className="max-w-[820px] mx-auto">
          <H2 highlight="Você só precisa parar de fazer isso sozinha.">Você já sabe que quer mudar.</H2>
          <p style={{ color: C.creamDim, lineHeight: 1.75 }} className="mt-8 text-[16px] md:text-[17px] font-light max-w-[600px] mx-auto">
            O Gloow Up Club não promete perfeição. Promete estrutura, comunidade e um sistema que funciona mesmo nos dias difíceis.
          </p>
          <p style={{ color: C.cream, lineHeight: 1.75 }} className="mt-4 text-[16px] md:text-[17px]">
            A próxima versão de você começa com uma escolha consciente.
          </p>
          <div className="mt-12">
            <PrimaryCTA href={KIWIFY_URL}>Quero entrar no Club ✦</PrimaryCTA>
          </div>
          <p style={{ color: C.creamFaint }} className="mt-6 text-[12px] font-light">
            7 dias de garantia · Compra segura · Acesso imediato
          </p>
        </div>
      </section>

      {/* CONECTE-SE */}
      <section className="py-20 md:py-24 px-5 md:px-12">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>Conecte-se com o Club</SectionLabel>
            <H2 highlight="antes mesmo de entrar.">Conheça o universo Gloow Up</H2>
            <p style={{ color: C.creamDim }} className="mt-5 text-[15px] font-light max-w-[560px] mx-auto">
              Acompanhe conteúdos, veja a agenda de lives do mês com convidadas especiais e fale direto com a fundadora.
            </p>
          </div>

          {/* Agenda de lives do mês */}
          <div className="mb-10 max-w-[560px] mx-auto">
            <div
              style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 18 }}
              className="p-4 md:p-5"
            >
              <img
                src={agendaLivesJulho.url}
                alt="Agenda de lives do mês, Gloow Up Club"
                className="w-full h-auto rounded-xl"
                loading="lazy"
              />
              <p style={{ color: C.creamDim }} className="mt-4 text-center text-[13px] font-light">
                Como foi a agenda de lives do mês para as Extraordinárias do Club.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: "YouTube", desc: "Canal oficial com conteúdos, aulas e cortes", href: "https://youtube.com/@guclubapp?si=yzjSHrcwIKf892Xz", label: "Assinar canal", icon: "▶" },
              { title: "Instagram", desc: "Bastidores, inspirações e novidades diárias", href: "https://www.instagram.com/guclub.app/", label: "Seguir @guclub.app", icon: "◎" },
              { title: "Fale com a fundadora", desc: "Tirar dúvidas ou conversar direto no WhatsApp", href: "https://wa.me/message/M64TKGTEYIZRK1", label: "Chamar no WhatsApp", icon: "whatsapp" },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14 }}
                className="p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-[color:var(--gold-h)]"
              >
                <div
                  style={{ background: `${C.gold}18`, color: C.gold, border: `1px solid ${C.gold}44` }}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                >
                  {item.icon === "whatsapp" ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.695.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.03-1.378l-.36-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.003 5.45-4.437 9.888-9.887 9.888zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.335.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.893 0-3.176-1.24-6.165-3.495-8.413z" />
                    </svg>
                  ) : (
                    item.icon
                  )}
                </div>
                <div style={{ ...serif, color: C.cream }} className="text-[18px]">{item.title}</div>
                <p style={{ color: C.creamDim, lineHeight: 1.55 }} className="text-[13px] font-light flex-1">
                  {item.desc}
                </p>
                <span style={{ color: C.gold }} className="text-[12px] uppercase tracking-[0.15em] font-light inline-flex items-center gap-1">
                  {item.label} <ArrowRight className="h-3 w-3" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>



      {/* FOOTER */}
      <footer
        style={{ borderTop: `1px solid ${C.borderSoft}` }}
        className="py-12 px-5 md:px-12"
      >
        <div className="max-w-[1080px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={brandLogo} alt="Gloow Up Club" className="h-8 w-8 object-contain rounded-lg" />
            <span style={{ ...serif, color: C.cream }} className="text-[18px] font-light">
              Gloow Up <span style={{ color: C.gold }}>Club</span>
            </span>
          </div>
          <div style={{ color: C.creamFaint }} className="text-[12px] font-light text-center">
            Gloow Up Club, Feito para Mulheres Extraordinárias · @gloowupclub
          </div>
          <div style={{ color: C.creamFaint }} className="text-[12px] font-light">
            © 2026 Gloow Up Club
          </div>
        </div>
      </footer>
    </div>
  );
}
