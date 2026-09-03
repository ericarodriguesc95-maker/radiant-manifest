import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Brain,
  Target,
  Zap,
  Heart,
  Wallet,
  BookOpen,
  Flag,
  Users,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import agendaLivesJulho from "@/assets/agenda-lives-julho.png.asset.json";
import appScreen1 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.26.jpeg.asset.json";
import appScreen2 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.42.jpeg.asset.json";
import appScreen3 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.23.55.jpeg.asset.json";
import appScreen4 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.13.jpeg.asset.json";
import appScreen5 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.25.jpeg.asset.json";
import appScreen7 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.46.jpeg.asset.json";
import appScreen8 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.24.55.jpeg.asset.json";
import appScreen9 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.06.jpeg.asset.json";
import appScreen10 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.16.jpeg.asset.json";
import appScreen11 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.25.44.jpeg.asset.json";
import appScreen12 from "@/assets/app-screens/WhatsApp_Image_2026-07-11_at_14.26.01.jpeg.asset.json";
import bannerConheca from "@/assets/app-screens/image-60.png.asset.json";
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

// Prints reais de cada aba do app (mantidos do site anterior, mesmo tamanho)
const APP_SCREENS = [
  { img: appScreen1.url, title: "Home da rainha", desc: "Boas-vindas, presentação e mensagem da sua versão do futuro." },
  { img: appScreen2.url, title: "Termômetro do mês", desc: "Ajusta o app pro seu momento com 3 perguntas rápidas." },
  { img: appScreen3.url, title: "Palavra do dia", desc: "Devocional personalizado com reflexão, estudo e prática." },
  { img: appScreen4.url, title: "Comece por aqui", desc: "Reprogramação, metas, Destravar Feminino e mais." },
  { img: appScreen5.url, title: "Fase menstrual", desc: "Sugestões conforme sua fase e pulso semanal da sua evolução." },
  { img: appScreen7.url, title: "Metas e Manifestação", desc: "Escreva, marque progresso e veja acontecer." },
  { img: appScreen8.url, title: "Minhas finanças", desc: "PF, CNPJ, Open Finance e visão completa do seu mês." },
  { img: appScreen9.url, title: "Consultora Financeira IA", desc: "Mentora de finanças 24h com dicas comportamentais." },
  { img: appScreen10.url, title: "Feed das Extraordinárias", desc: "Comunidade viva com stories, ranking e conexões reais." },
  { img: appScreen11.url, title: "Seu mês de relance", desc: "Calendário com hábitos, metas, saúde, finanças e desafios." },
  { img: appScreen12.url, title: "Saúde e Fitness", desc: "Peso, dieta, treinos, água, ciclo, sono e remédios num só lugar." },
];

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

const KIWIFY_URL = "https://pay.kiwify.com.br/IyO1p06";

// ===== Paleta do redesign (mockup aprovado) =====
const C = {
  cream: "#F7F1E4",
  creamDeep: "#EFE6D2",
  ink: "#2E2318",
  inkSoft: "#6B5D4C",
  gold: "#B8862F",
  goldDeep: "#96691E",
  goldPale: "#E9D6AC",
  line: "#E1D3B3",
  card: "#FFFDF8",
};

const serif = { fontFamily: "'Cormorant Garamond', serif" };
const sans = { fontFamily: "'DM Sans', system-ui, sans-serif" };

// ===== Reusable bits =====
const Eyebrow = ({ children, center = false }: { children: React.ReactNode; center?: boolean }) => (
  <p
    style={{ ...sans, color: C.goldDeep, letterSpacing: "0.6px" }}
    className={`flex items-center gap-2 text-[12px] font-bold uppercase mb-4 ${center ? "justify-center" : ""}`}
  >
    <span aria-hidden style={{ width: 6, height: 6, borderRadius: 99, background: C.gold, display: "inline-block" }} />
    {children}
  </p>
);

const BtnPrimary = ({
  children,
  href,
  className = "",
  block = false,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
  block?: boolean;
}) => (
  <a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel="noreferrer"
    style={{ ...sans, background: C.gold, color: C.cream, borderRadius: 999 }}
    className={`${block ? "flex w-full" : "flex w-full sm:w-auto sm:inline-flex"} items-center justify-center px-8 py-4 text-[14px] font-bold tracking-[0.3px] transition-all hover:opacity-90 hover:-translate-y-0.5 ${className}`}
  >
    {children}
  </a>
);

const SectionHead = ({
  eyebrow,
  children,
  desc,
}: {
  eyebrow: string;
  children: React.ReactNode;
  desc?: string;
}) => (
  <div className="text-center max-w-[640px] mx-auto mb-11">
    <Eyebrow center>{eyebrow}</Eyebrow>
    <h2 style={{ ...serif, color: C.ink, lineHeight: 1.2 }} className="text-[30px] md:text-[36px] font-semibold">
      {children}
    </h2>
    {desc && (
      <p style={{ color: C.inkSoft, lineHeight: 1.6 }} className="mt-4 text-[14.5px]">
        {desc}
      </p>
    )}
  </div>
);

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
  { icon: Brain, name: "Reprogramação Mental", desc: "Meditações guiadas, PNL e neurociência aplicada ao dia a dia." },
  { icon: Target, name: "Metas e Manifestação", desc: "Defina metas, acompanhe submetas e veja o progresso em tempo real." },
  { icon: Zap, name: "Alta Performance", desc: "Curadoria de podcasts, técnicas de estudo e cursos." },
  { icon: Heart, name: "Saúde e Fitness", desc: "Dieta, treino, sono e ciclo menstrual integrados, com a IA Nutri Luna." },
  { icon: Wallet, name: "Gestão Financeira", desc: "Controle de renda, despesas e saldo com IA financeira." },
  { icon: BookOpen, name: "Espiritualidade e Diário", desc: "Leitura em 365 dias, devocional diário e diário pessoal." },
  { icon: Flag, name: "Desafios Progressivos", desc: "De 7 a 90 dias, com fundamentação científica em cada tarefa." },
  { icon: Users, name: "Comunidade das Extraordinárias", desc: "Rede social privada e exclusiva para membras do Club." },
  { icon: Sparkles, name: "IA Assistente Pessoal", desc: "Gestão de agenda e rotina por texto ou voz, disponível 24h." },
];

const BENEFITS = [
  "Acesso vitalício, sem mensalidade",
  "Todos os 10+ módulos: saúde, finanças, mente, espiritualidade, Bíblia 365 e diário",
  "5 assistentes de IA: Nutri Luna, Sono, Eu Superior, Finanças e Assistente geral",
  "Comunidade Extraordinárias, a rede social privada do clube",
  "Reprogramação mental e alta performance",
  "Desafios progressivos de 7 a 90 dias",
  "Acesso pelo navegador, no celular, tablet ou computador",
  "Atualizações e novos módulos sem custo extra",
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
    a: "R$27,90 à vista no crédito ou pix. Pagamento único, sem mensalidade. Acesso vitalício completo, sem renovação automática.",
  },
  {
    q: "Posso cancelar?",
    a: "R$27,90 à vista no crédito ou pix. Como é pagamento único, não há renovação automática. Você tem 7 dias de garantia e pode solicitar reembolso direto na plataforma de pagamento, caso o Club não faça sentido para você no momento.",
  },
  {
    q: "Recebo atualizações sem pagar mais?",
    a: "Sim. Quem entra agora garante acesso a todos os novos módulos e conteúdos sem custo adicional.",
  },
];

const TRUST = [
  { icon: BadgeCheck, label: "7 dias de garantia" },
  { icon: ShieldCheck, label: "Compra segura" },
  { icon: Zap, label: "Acesso imediato" },
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
    <>
      <Helmet>
        <title>Gloow Up Club — Comunidade para evolução feminina</title>
        <meta name="description" content="Ecossistema completo para mulheres: reprogramação mental, metas, saúde, finanças, espiritualidade e uma comunidade que te mantém em movimento. Acesso vitalício." />
        <meta property="og:title" content="Gloow Up Club — Comunidade para evolução feminina" />
        <meta property="og:description" content="Mente, metas, saúde, finanças e espiritualidade em um só app, com a comunidade das Extraordinárias." />
        <meta property="og:url" content="https://www.gloowupclub.com/" />
        <link rel="canonical" href="https://www.gloowupclub.com/" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>

      <div style={{ background: C.cream, color: C.ink, ...sans }} className="min-h-screen overflow-x-hidden">
        {/* NAV */}
        <header
          style={{
            background: scrolled ? `${C.cream}E6` : "transparent",
            backdropFilter: scrolled ? "blur(14px)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
            borderBottom: scrolled ? `1px solid ${C.line}` : "1px solid transparent",
          }}
          className="fixed top-0 left-0 right-0 z-50 transition-all"
        >
          <div className="max-w-[1180px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <img src={brandLogo} alt="Gloow Up Club" className="h-9 w-9 object-contain rounded-lg" />
              <span style={{ ...serif, color: C.ink }} className="text-[20px] font-semibold hidden sm:inline">
                Gloow Up Club
              </span>
            </Link>
            <Link
              to="/login"
              style={{ background: C.ink, color: C.cream, borderRadius: 999 }}
              className="px-5 py-2.5 text-[13.5px] font-semibold transition-all hover:opacity-90"
            >
              Já sou membra →
            </Link>
          </div>
        </header>

        {/* HERO */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-24 overflow-hidden">
          <div
            aria-hidden
            className="absolute pointer-events-none"
            style={{
              top: "-10%",
              right: "-10%",
              width: 700,
              height: 700,
              background: `radial-gradient(circle, ${C.goldPale} 0%, ${C.creamDeep} 45%, transparent 72%)`,
              filter: "blur(10px)",
            }}
          />
          <div className="relative max-w-[1180px] mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div className="text-center md:text-left flex flex-col items-center md:items-start">
              <Eyebrow>Ecossistema feminino de alta performance</Eyebrow>
              <h1
                style={{ ...serif, lineHeight: 1.15, letterSpacing: "-0.3px" }}
                className="text-[36px] md:text-[48px] font-semibold"
              >
                <span style={{ color: C.inkSoft }}>Você não tem falta de motivação.</span>
                <br />
                <span style={{ color: C.ink }}>Você tem falta de sistema.</span>
              </h1>
              <p style={{ color: C.inkSoft, lineHeight: 1.65 }} className="mt-5 text-[15.5px] max-w-[460px] mx-auto md:mx-0">
                Enquanto você tenta se organizar sozinha, outra mulher com os mesmos objetivos que os seus já está executando. A diferença não é talento. É estrutura. O Gloow Up Club é esse sistema.
              </p>
              <div className="mt-8 flex items-center gap-5 flex-wrap">
                <BtnPrimary href={KIWIFY_URL}>Quero entrar no Club</BtnPrimary>
              </div>
              <div className="mt-7 flex gap-x-5 gap-y-2.5 flex-wrap justify-center md:justify-start">
                {TRUST.map((t) => (
                  <span key={t.label} className="flex items-center gap-1.5 text-[12.5px]" style={{ color: C.inkSoft }}>
                    <t.icon size={15} style={{ color: C.goldDeep }} />
                    {t.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Visual: logo do Gloow Up Club em destaque + cards flutuantes */}
            <div className="relative h-[340px] sm:h-[420px] md:h-[460px] flex items-center justify-center">
              <div
                aria-hidden
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  style={{
                    width: 320,
                    height: 320,
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${C.goldPale} 0%, ${C.creamDeep} 55%, transparent 72%)`,
                    filter: "blur(8px)",
                  }}
                />
              </div>
              <div className="relative w-[240px] md:w-[280px]">
                <div
                  style={{
                    borderRadius: 32,
                    padding: 18,
                    background: `linear-gradient(160deg, ${C.gold}40, ${C.goldPale}30)`,
                    boxShadow: `0 30px 60px rgba(150,105,30,0.22), 0 0 0 1px ${C.line}`,
                  }}
                >
                  <img
                    src={brandLogo}
                    alt="Gloow Up Club"
                    className="w-full h-auto object-contain rounded-2xl"
                    style={{ background: C.card }}
                  />
                </div>
              </div>
              {[
                { label: "Módulos inclusos", value: "10+", cls: "top-[6%] left-0" },
                { label: "Acesso", value: "Vitalício", cls: "bottom-[18%] left-[4%]" },
                { label: "Pagamento", value: "Único", cls: "bottom-[2%] right-[6%]" },
              ].map((c) => (
                <div
                  key={c.label}
                  style={{ background: C.card, borderRadius: 16, boxShadow: "0 14px 30px rgba(46,35,24,0.12)" }}
                  className={`absolute ${c.cls} px-4 py-3.5 flex items-center gap-2.5 min-w-[150px]`}
                >
                  <div
                    style={{ background: C.creamDeep }}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  >
                    <Check size={15} style={{ color: C.goldDeep }} />
                  </div>
                  <div>
                    <p style={{ color: C.inkSoft, letterSpacing: "0.3px" }} className="text-[10.5px] uppercase">
                      {c.label}
                    </p>
                    <p style={{ color: C.ink }} className="text-[14.5px] font-bold">
                      {c.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PARA QUEM É */}
        <section className="py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-[1180px] mx-auto">
            <SectionHead eyebrow="Para quem é">
              O Club é{" "}
              <em style={{ color: C.goldDeep, fontStyle: "italic" }}>para você</em> se…
            </SectionHead>
            <div className="max-w-[720px] mx-auto flex flex-col">
              {FOR_YOU.map((t) => (
                <div
                  key={t}
                  style={{ borderBottom: `1px solid ${C.line}`, color: C.ink }}
                  className="flex items-start gap-3.5 py-[18px] text-[15px]"
                >
                  <ArrowRight size={16} style={{ color: C.goldDeep }} className="shrink-0 mt-[3px]" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* QUEM CRIOU O CLUB — foto original no café, mesmo tamanho do site anterior */}
        <section style={{ background: C.creamDeep }} className="py-20 md:py-24 px-6 md:px-8">
          <div className="max-w-[1080px] mx-auto grid md:grid-cols-[420px_1fr] gap-12 md:gap-16 items-center">
            <div
              style={{ border: `1px solid ${C.line}`, borderRadius: 16, overflow: "hidden" }}
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
              <Eyebrow>Quem criou o Club</Eyebrow>
              <h2 style={{ ...serif, color: C.ink, lineHeight: 1.2 }} className="text-[30px] md:text-[36px] font-semibold">
                Érica <em style={{ color: C.goldDeep, fontStyle: "italic" }}>Carvalho</em>
              </h2>
              <div className="mt-6 space-y-4">
                <p style={{ color: C.inkSoft, lineHeight: 1.75 }} className="text-[14.5px]">
                  <strong style={{ color: C.ink }}>Érica Carvalho</strong> é a criadora do Gloow Up Club, graduanda em Gestão de Recursos Humanos, apaixonada por performance feminina e desenvolvimento pessoal com base em neurociência.
                </p>
                <p style={{ color: C.inkSoft, lineHeight: 1.75 }} className="text-[14.5px]">
                  Supervisora de Atendimento em uma das maiores empresas de educação jurídica do Brasil, ela entendeu na prática o que separa as mulheres que performam em alto nível das que vivem no ciclo de começar e parar: não é talento, não é força de vontade. É estrutura.
                </p>
                <p style={{ color: C.inkSoft, lineHeight: 1.75 }} className="text-[14.5px]">
                  O Gloow Up Club nasceu dessa percepção. Foi construído do zero, com neurociência, neuromarketing e muita vivência real. Não é teoria. É o sistema que ela mesma precisava e não existia.
                </p>
                <p style={{ color: C.goldDeep }} className="text-[13px] font-semibold">
                  Por @erica.carvalhor
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* A VIRADA */}
        <section className="py-20 md:py-24 px-6 md:px-8 text-center">
          <div className="max-w-[680px] mx-auto">
            <Eyebrow center>A virada</Eyebrow>
            <h2 style={{ ...serif, lineHeight: 1.2 }} className="text-[30px] md:text-[36px] font-semibold">
              <span style={{ color: C.inkSoft }}>Você não falhou.</span>
              <br />
              <span style={{ color: C.goldDeep, fontStyle: "italic" }}>Você só tentou do jeito mais difícil.</span>
            </h2>
            <p style={{ color: C.inkSoft, lineHeight: 1.7 }} className="mt-6 text-[14.5px] max-w-[560px] mx-auto">
              A gente foi ensinada que evoluir depende de querer mais, de se esforçar mais, de ter mais disciplina. Só que força de vontade é um recurso limitado. O que cria constância de verdade é outra coisa: é ambiente, é método, é comunidade.
            </p>
            <div className="mt-8">
              <BtnPrimary href={KIWIFY_URL}>Quero entrar no Club</BtnPrimary>
            </div>
          </div>
        </section>

        {/* O QUE MUDA COM O TEMPO */}
        <section style={{ background: C.creamDeep }} className="py-16 md:py-24 px-6 md:px-8">
          <div className="max-w-[1180px] mx-auto">
            <SectionHead
              eyebrow="Evolução real"
              desc="O Club não te transforma da noite para o dia. Ele constrói você aos poucos, com pequenas vitórias que se acumulam até virarem uma nova versão de quem você é."
            >
              <span style={{ color: C.inkSoft }}>O que muda</span>
              <br />
              <em style={{ color: C.goldDeep, fontStyle: "italic" }}>com o tempo.</em>
            </SectionHead>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  phase: "1ª semana",
                  title: "Clareza",
                  desc: "Você para de viver no piloto automático e começa a enxergar seus padrões com os olhos de quem pode mudá-los.",
                },
                {
                  phase: "30 dias",
                  title: "Constância",
                  desc: "A reprogramação mental e os check-points diários viram rotina. Você sente que está no controle do próprio dia.",
                },
                {
                  phase: "90 dias",
                  title: "Resultados",
                  desc: "Metas em andamento, finanças organizadas, corpo e mente mais alinhados. A diferença já é visível para você e para quem te conhece.",
                },
                {
                  phase: "6 meses",
                  title: "Nova identidade",
                  desc: "Você não faz mais o que precisa fazer. Você passou a ser a mulher que faz. E a comunidade das Extraordinárias te lembra disso todo dia.",
                },
              ].map((item, i) => (
                <article
                  key={item.phase}
                  style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18 }}
                  className="p-6 transition-all hover:-translate-y-0.5 relative overflow-hidden"
                >
                  <span
                    style={{ ...serif, color: C.goldPale }}
                    className="absolute -top-2 -right-2 text-[64px] font-semibold leading-none opacity-40 select-none"
                  >
                    0{i + 1}
                  </span>
                  <span
                    style={{ background: `${C.gold}18`, color: C.goldDeep, border: `1px solid ${C.gold}44`, letterSpacing: "0.15em" }}
                    className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold mb-4"
                  >
                    {item.phase}
                  </span>
                  <h3 style={{ ...serif, color: C.ink }} className="text-[20px] font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p style={{ color: C.inkSoft, lineHeight: 1.6 }} className="text-[13.5px]">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MÓDULOS */}
        <section id="modulos" style={{ background: C.creamDeep }} className="py-16 md:py-24 px-6 md:px-8">
          <div className="max-w-[1180px] mx-auto">
            <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-end mb-12">
              <div>
                <Eyebrow>Mais que um app</Eyebrow>
                <h2 style={{ ...serif, lineHeight: 1.2 }} className="text-[30px] md:text-[36px] font-semibold">
                  <span style={{ color: C.inkSoft }}>Toda a sua evolução,</span>
                  <br />
                  <span style={{ color: C.ink }}>num único sistema.</span>
                </h2>
              </div>
              <p style={{ color: C.inkSoft, lineHeight: 1.6 }} className="text-[14.5px]">
                Uma plataforma única que organiza mente, corpo, dinheiro e espiritualidade. Tudo conectado, sem depender de dez apps diferentes.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MODULES.map((m) => (
                <article
                  key={m.name}
                  style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18 }}
                  className="p-6 transition-all hover:-translate-y-0.5"
                >
                  <div
                    style={{ background: C.creamDeep, borderRadius: 12 }}
                    className="w-11 h-11 flex items-center justify-center mb-4"
                  >
                    <m.icon size={20} style={{ color: C.goldDeep }} />
                  </div>
                  <h3 style={{ color: C.ink }} className="text-[16px] font-bold mb-1.5">
                    {m.name}
                  </h3>
                  <p style={{ color: C.inkSoft, lineHeight: 1.55 }} className="text-[13px]">
                    {m.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CONHEÇA NOSSO APP — prints reais de cada aba, mesmo tamanho do site anterior */}
        <section className="py-20 md:py-24 px-6 md:px-8">
          <div className="max-w-[1200px] mx-auto">
            <SectionHead
              eyebrow="Por dentro do Club"
              desc="Veja como é a experiência real das Extraordinárias. Tudo funciona pelo navegador: celular, tablet ou computador. Não precisa baixar em loja de apps."
            >
              <span style={{ color: C.inkSoft }}>Conheça o universo</span>
              <br />
              Gloow Up por dentro.
            </SectionHead>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-7">
              {APP_SCREENS.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center group">
                  <div
                    style={{
                      borderRadius: 42,
                      padding: 8,
                      background: `linear-gradient(160deg, ${C.gold}55, ${C.gold}15)`,
                      boxShadow: `0 20px 40px -20px ${C.gold}55, 0 0 0 1px ${C.line}`,
                    }}
                    className="w-full transition-transform duration-500 group-hover:-translate-y-2"
                  >
                    <div
                      style={{
                        borderRadius: 36,
                        overflow: "hidden",
                        background: C.cream,
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
                  <div style={{ ...serif, color: C.ink }} className="mt-5 text-[15px] font-semibold">
                    {s.title}
                  </div>
                  <p style={{ color: C.inkSoft }} className="mt-1.5 text-[12px] leading-relaxed px-1">
                    {s.desc}
                  </p>
                </div>
              ))}
              {/* Banner standalone — sem moldura de celular */}
              <div className="flex flex-col items-center text-center group col-span-2 md:col-span-1 lg:col-span-2">
                <div
                  style={{
                    borderRadius: 24,
                    padding: 8,
                    background: `linear-gradient(160deg, ${C.gold}55, ${C.gold}15)`,
                    boxShadow: `0 20px 40px -20px ${C.gold}55, 0 0 0 1px ${C.line}`,
                  }}
                  className="w-full transition-transform duration-500 group-hover:-translate-y-2"
                >
                  <div
                    style={{ borderRadius: 18, overflow: "hidden", background: C.cream, border: `2px solid ${C.gold}88` }}
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
                <div style={{ ...serif, color: C.ink }} className="mt-5 text-[15px] font-semibold">
                  Bem-vinda ao Club
                </div>
                <p style={{ color: C.inkSoft }} className="mt-1.5 text-[12px] leading-relaxed px-1">
                  Sua melhor versão começa aqui: comunidade, app e desenvolvimento pessoal feminino.
                </p>
              </div>
            </div>
            <div className="text-center mt-14">
              <BtnPrimary href={KIWIFY_URL}>Quero acessar o app ✦</BtnPrimary>
            </div>
          </div>
        </section>

        {/* DEPOIMENTOS — fotos originais mantidas */}
        <section style={{ background: C.creamDeep }} className="py-16 md:py-20 px-6 md:px-8">
          <div className="max-w-[1080px] mx-auto">
            <SectionHead eyebrow="Quem já está lá dentro">
              Resultados <em style={{ color: C.goldDeep, fontStyle: "italic" }}>reais.</em>
            </SectionHead>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <figure
                  key={i}
                  style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}
                  className="flex flex-col"
                >
                  <div className="w-full overflow-hidden" style={{ background: C.cream }}>
                    <img
                      src={t.img}
                      alt={`Depoimento de ${t.name}`}
                      className="w-full h-auto object-contain"
                      loading="lazy"
                    />
                  </div>
                  <figcaption style={{ borderTop: `1px solid ${C.line}` }} className="px-5 py-4 text-center">
                    <span style={{ ...serif, color: C.goldDeep }} className="italic text-[15px]">
                      {t.name}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
            <p style={{ color: C.inkSoft, lineHeight: 1.6 }} className="mt-10 text-center text-[14px] max-w-[480px] mx-auto">
              Elas não tinham mais tempo, mais dinheiro ou mais talento. Tinham o mesmo sistema que você está prestes a ter.
            </p>
            <div className="mt-6 text-center">
              <BtnPrimary href={KIWIFY_URL}>Quero viver isso também</BtnPrimary>
            </div>
          </div>
        </section>

        {/* PREÇO */}
        <section className="py-20 md:py-24 px-6 md:px-8">
          <div className="max-w-[1180px] mx-auto">
            <SectionHead eyebrow="Acesso ao ecossistema">
              Comece sua <em style={{ color: C.goldDeep, fontStyle: "italic" }}>transformação.</em>
            </SectionHead>
            <p style={{ color: C.inkSoft, lineHeight: 1.7 }} className="max-w-[560px] mx-auto text-center text-[14.5px] mb-10">
              Uma sessão de coaching custa R$300. Um planner premium custa R$150. Um app de meditação custa R$40 por mês. Um curso de finanças custa R$200. Somado, isso passa de R$1.100. O Gloow Up Club entrega tudo isso integrado, atualizado e disponível onde você estiver.
            </p>

            <div
              style={{ background: C.card, border: `1px solid ${C.gold}`, borderRadius: 26 }}
              className="max-w-[520px] mx-auto px-8 py-10 md:px-10 text-center"
            >
              <p style={{ color: C.goldDeep, letterSpacing: "0.4px" }} className="text-[12px] font-bold uppercase mb-3.5">
                Acesso vitalício
              </p>
              <p style={{ ...serif, color: C.ink }} className="text-[52px] font-semibold leading-none">
                R$27,90
              </p>
              <p style={{ color: C.inkSoft }} className="mt-2 text-[12.5px]">
                pagamento único, à vista no crédito ou pix
              </p>
              <p style={{ color: C.inkSoft, fontStyle: "italic" }} className="mt-1 mb-7 text-[13px]">
                Pagamento único. Sem mensalidade, para sempre.
              </p>

              <ul className="grid sm:grid-cols-2 gap-3 text-left mb-8">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <Check size={15} style={{ color: C.goldDeep }} className="mt-0.5 shrink-0" />
                    <span style={{ color: C.ink, lineHeight: 1.4 }} className="text-[12.5px]">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              <BtnPrimary href={KIWIFY_URL} block>
                Quero entrar no Club
              </BtnPrimary>
              <p style={{ color: C.inkSoft }} className="mt-5 text-[12px]">
                Já é membra?{" "}
                <Link to="/login" style={{ color: C.goldDeep }} className="font-semibold">
                  Faça login →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* FECHAMENTO */}
        <section style={{ background: C.creamDeep }} className="py-20 md:py-24 px-6 md:px-8 text-center">
          <div className="max-w-[680px] mx-auto">
            <h2 style={{ ...serif, lineHeight: 1.2 }} className="text-[30px] md:text-[36px] font-semibold">
              <span style={{ color: C.inkSoft }}>Você já sabe que quer mudar.</span>
              <br />
              <span style={{ color: C.goldDeep, fontStyle: "italic" }}>Você só precisa parar de fazer isso sozinha.</span>
            </h2>
            <p style={{ color: C.inkSoft, lineHeight: 1.7 }} className="mt-5 text-[14.5px] max-w-[520px] mx-auto">
              O Gloow Up Club não promete perfeição. Promete estrutura, comunidade e um sistema que funciona mesmo nos dias difíceis. A próxima versão de você começa com uma escolha consciente.
            </p>
            <div className="mt-7">
              <BtnPrimary href={KIWIFY_URL}>Quero entrar no Club ✦</BtnPrimary>
            </div>
            <div className="mt-5 flex gap-5 flex-wrap justify-center">
              {TRUST.map((t) => (
                <span key={t.label} className="flex items-center gap-1.5 text-[12.5px]" style={{ color: C.inkSoft }}>
                  <t.icon size={15} style={{ color: C.goldDeep }} />
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-24 px-6 md:px-8">
          <div className="max-w-[720px] mx-auto">
            <SectionHead eyebrow="Perguntas frequentes">
              Tire suas <em style={{ color: C.goldDeep, fontStyle: "italic" }}>dúvidas.</em>
            </SectionHead>
            <div style={{ borderTop: `1px solid ${C.line}` }}>
              {FAQ.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div key={f.q} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full px-1 py-5 flex items-center justify-between gap-4 text-left"
                    >
                      <span style={{ color: C.ink }} className="text-[15px] font-semibold">
                        {f.q}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{ color: C.goldDeep, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s" }}
                        className="shrink-0"
                      />
                    </button>
                    {open && (
                      <p style={{ color: C.inkSoft, lineHeight: 1.65 }} className="px-1 pb-5 text-[13.5px]">
                        {f.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CONECTE-SE + AGENDA DE LIVES */}
        <section style={{ background: C.creamDeep }} className="py-20 md:py-24 px-6 md:px-8">
          <div className="max-w-[980px] mx-auto">
            <SectionHead
              eyebrow="Conecte-se com o Club"
              desc="Acompanhe conteúdos, veja a agenda de lives do mês com convidadas especiais e fale direto com a fundadora."
            >
              <span style={{ color: C.inkSoft }}>Conheça o universo Gloow Up</span>
              <br />
              <em style={{ color: C.goldDeep, fontStyle: "italic" }}>antes mesmo de entrar.</em>
            </SectionHead>

            {/* Agenda de lives */}
            <div className="mb-10 max-w-[620px] mx-auto space-y-6">
              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18 }} className="p-5">
                <span
                  style={{ background: `${C.gold}18`, color: C.goldDeep, border: `1px solid ${C.gold}44`, letterSpacing: "0.15em" }}
                  className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold"
                >
                  Em breve
                </span>
                <h4 style={{ ...serif, color: C.ink }} className="mt-3 text-[20px] font-semibold">
                  Próximas lives
                </h4>
                <p style={{ color: C.inkSoft, lineHeight: 1.7 }} className="mt-2 text-[14px]">
                  A nova agenda de lives com convidadas especiais é divulgada dentro do app e no Instagram do Club. Membras recebem o aviso antes de cada transmissão.
                </p>
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18 }} className="p-4 md:p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    style={{ background: "rgba(46,35,24,0.06)", color: C.inkSoft, border: `1px solid ${C.line}`, letterSpacing: "0.15em" }}
                    className="inline-block px-3 py-1 rounded-full text-[10px] uppercase font-bold"
                  >
                    Realizada · Julho
                  </span>
                  <span style={{ color: C.inkSoft }} className="text-[12px]">
                    Já rolou
                  </span>
                </div>
                <img
                  src={agendaLivesJulho.url}
                  alt="Agenda de lives já realizadas em julho, Gloow Up Club"
                  className="w-full h-auto rounded-xl"
                  loading="lazy"
                />
                <p style={{ color: C.inkSoft }} className="mt-4 text-center text-[13px]">
                  Uma amostra do que já rolou ao vivo para as Extraordinárias do Club. Todas as lives ficam gravadas no app.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "YouTube", desc: "Canal oficial com conteúdos, aulas e cortes.", href: "https://youtube.com/@guclubapp?si=yzjSHrcwIKf892Xz", label: "Assinar canal", icon: "▶" },
                { title: "Instagram", desc: "Bastidores, inspirações e novidades diárias.", href: "https://www.instagram.com/guclub.app/", label: "Seguir @hub.extraordinarias", icon: "◎" },
                { title: "Fale com a fundadora", desc: "Tirar dúvidas ou conversar direto no WhatsApp.", href: "https://wa.me/message/M64TKGTEYIZRK1", label: "Chamar no WhatsApp", icon: "whatsapp" },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 18 }}
                  className="p-6 flex flex-col transition-all hover:-translate-y-0.5"
                >
                  <div
                    style={{ background: C.creamDeep }}
                    className="h-10 w-10 rounded-full flex items-center justify-center mb-3.5"
                  >
                    {item.icon === "whatsapp" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill={C.goldDeep} aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.695.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 21.785h-.004a9.87 9.87 0 01-5.03-1.378l-.36-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.003 5.45-4.437 9.888-9.887 9.888zM20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.335.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.893 0-3.176-1.24-6.165-3.495-8.413z" />
                      </svg>
                    ) : (
                      <span style={{ color: C.goldDeep }} className="text-lg">{item.icon}</span>
                    )}
                  </div>
                  <p style={{ color: C.ink }} className="text-[14.5px] font-bold mb-1">
                    {item.title}
                  </p>
                  <p style={{ color: C.inkSoft, lineHeight: 1.5 }} className="text-[12.5px] mb-3 flex-1">
                    {item.desc}
                  </p>
                  <span style={{ color: C.goldDeep }} className="text-[12px] font-bold inline-flex items-center gap-1">
                    {item.label} <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${C.line}` }} className="py-8 px-6 md:px-8 text-center">
          <p style={{ color: C.inkSoft }} className="text-[12px]">
            Gloow Up Club, feito para Mulheres Extraordinárias ·{" "}
            <a href="https://www.instagram.com/guclub.app/" target="_blank" rel="noopener noreferrer" style={{ color: C.goldDeep }} className="font-semibold">
              @hub.extraordinarias
            </a>{" "}
            · Site criado por{" "}
            <a href="https://www.ericacarvalhor.com" target="_blank" rel="noopener noreferrer" style={{ color: C.goldDeep }} className="font-semibold">
              Érica Carvalho
            </a>{" "}
            · © 2026 Gloow Up Club
          </p>
        </footer>
      </div>
    </>
  );
}
