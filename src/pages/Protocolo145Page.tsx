import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Zap, Clock, Sunrise, ShieldOff, TrendingUp, Moon, CalendarDays,
  Flame, Brain, Target, Check, RotateCcw, Activity, Layers, Droplet, Dumbbell,
  Snowflake, Eye, Heart, Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Protocolo145Chat from "@/components/Protocolo145Chat";

const STORAGE_KEY = "protocolo-14-5:progress:v2";
const SECTION_IDS = [
  "tese", "neurociencia", "codigo", "jejuns", "firewall",
  "hawkins", "maslow", "subliminal", "execucao", "ia"
] as const;
type SectionId = typeof SECTION_IDS[number];

type DayTasks = Record<number, Record<string, boolean>>;
type Progress = {
  days: boolean[];
  dayTasks: DayTasks;
  lastSection: SectionId;
  updatedAt: string;
};

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.days) && p.days.length === 5) {
        return { ...p, dayTasks: p.dayTasks || {} };
      }
    }
  } catch {}
  return {
    days: [false, false, false, false, false],
    dayTasks: {},
    lastSection: "tese",
    updatedAt: new Date().toISOString(),
  };
}
function saveProgress(p: Progress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

const hawkinsLevels = [
  { range: "700+", name: "Iluminação", color: "from-gold to-yellow-200", low: false },
  { range: "600", name: "Paz", color: "from-gold to-amber-300", low: false },
  { range: "540", name: "Alegria", color: "from-amber-400 to-amber-200", low: false },
  { range: "500", name: "Amor", color: "from-amber-500 to-amber-300", low: false },
  { range: "400", name: "Razão / Inteligência Estratégica", color: "from-gold to-amber-400", target: true, low: false },
  { range: "350", name: "Aceitação", color: "from-amber-600/70 to-amber-500/70", low: false },
  { range: "310", name: "Disposição", color: "from-amber-700/60 to-amber-600/60", low: false },
  { range: "250", name: "Neutralidade", color: "from-zinc-500 to-zinc-400", low: false },
  { range: "200", name: "Coragem (linha de poder)", color: "from-zinc-600 to-zinc-500", line: true, low: false },
  { range: "175", name: "Orgulho", color: "from-zinc-700 to-zinc-600", low: true },
  { range: "150", name: "Raiva", color: "from-red-900/70 to-red-700/70", low: true },
  { range: "125", name: "Desejo (dopamina barata)", color: "from-red-900/80 to-orange-800/80", current: true, low: true },
  { range: "75", name: "Prostração", color: "from-red-950 to-red-900", current: true, low: true },
  { range: "20", name: "Vergonha", color: "from-black to-red-950", low: true },
];

// Pirâmide de Maslow — base larga até o topo estreito
const maslowLevels = [
  { name: "Autorrealização", desc: "Propósito · criatividade · operação no nível 400+ de Hawkins", width: "w-[40%]", color: "bg-gold", text: "text-black" },
  { name: "Estima", desc: "Confiança · respeito próprio · disciplina (Variável 5)", width: "w-[55%]", color: "bg-amber-500/80", text: "text-black" },
  { name: "Pertencimento", desc: "Conexão real · comunidade Glow Up (sem dopamina barata de redes)", width: "w-[70%]", color: "bg-amber-700/70", text: "text-white" },
  { name: "Segurança", desc: "Estabilidade insulínica · cortisol regulado · sono profundo", width: "w-[85%]", color: "bg-zinc-700", text: "text-white" },
  { name: "Fisiológico", desc: "Jejum 14h · hidratação 3L · luz solar matinal · proteína", width: "w-full", color: "bg-zinc-800", text: "text-white" },
];

const jejunsTipos = [
  { h: "14h", nome: "Janela Glow Up", uso: "Base do Protocolo 14.5. Estabiliza insulina e ativa autofagia leve.", cor: "border-gold/40 bg-gold/5" },
  { h: "16h", nome: "16:8 clássico", uso: "Próximo passo. Autofagia consistente, queima de gordura visceral.", cor: "border-amber-500/30 bg-amber-500/5" },
  { h: "18h", nome: "Avançado", uso: "Cetose leve, picos de BDNF, foco intenso para semanas de execução.", cor: "border-amber-600/30 bg-amber-700/5" },
  { h: "24h", nome: "OMAD / 24h", uso: "Reset metabólico mensal. Apenas com base sólida e eletrólitos.", cor: "border-zinc-600 bg-zinc-900/40" },
];

type DayTask = { id: string; label: string };
const fiveDays: { day: string; title: string; body: string; tasks: DayTask[] }[] = [
  {
    day: "Segunda", title: "Desintoxicação Bruta",
    body: "Cefaleia leve, fissura por açúcar e scroll. O corpo grita pelo lixo. Hidrate com 3L de água + sal rosa. Foco baixo, disciplina alta.",
    tasks: [
      { id: "agua", label: "3L de água + pitada de sal rosa" },
      { id: "desinst", label: "Desinstalar Instagram, TikTok, Facebook" },
      { id: "jejum", label: "Janela 14h fechada (18:40 → 08:40)" },
      { id: "luz", label: "10 min de luz solar matinal" },
      { id: "registro", label: "Anotar 1 sintoma de abstinência (autoconsciência)" },
    ],
  },
  {
    day: "Terça", title: "Estabilização Insulínica",
    body: "Picos de fome desaparecem. Energia mais limpa pela manhã. Primeiros sinais de clareza após o jejum de 14h.",
    tasks: [
      { id: "5h", label: "Acordar 05:00 (Variável 5)" },
      { id: "proteina", label: "Proteína acima de 1.6g/kg de peso" },
      { id: "frio", label: "1 min de água fria no banho (norepinefrina ↑)" },
      { id: "leitura", label: "20 páginas de leitura não-ficção" },
      { id: "sono", label: "Dormir até 22:30" },
    ],
  },
  {
    day: "Quarta", title: "Despertar Cognitivo",
    body: "Cérebro entra em modo BDNF. Você lê, escreve e decide mais rápido. A vantagem das 05:00 começa a se sentir.",
    tasks: [
      { id: "deep", label: "90 min de deep work sem celular por perto" },
      { id: "treino", label: "Treino de força (BDNF + IGF-1)" },
      { id: "decisao", label: "Tomar 1 decisão estratégica adiada" },
      { id: "escrita", label: "5 min de journaling — clarear o ruído mental" },
      { id: "afirm", label: "Afirmação Teta antes de dormir" },
    ],
  },
  {
    day: "Quinta", title: "Reset Dopaminérgico",
    body: "Receptores resensibilizados. Tarefas simples voltam a dar prazer. Procrastinação some — o tédio vira combustível.",
    tasks: [
      { id: "tedio", label: "30 min de tédio consciente (sem input)" },
      { id: "caminhada", label: "Caminhada de 30 min ao ar livre" },
      { id: "respira", label: "Respiração de Wim Hof (3 rodadas)" },
      { id: "execucao", label: "Concluir 1 tarefa de alto impacto" },
      { id: "gratidao", label: "3 gratidões antes de dormir" },
    ],
  },
  {
    day: "Sexta", title: "Soberania Operacional",
    body: "Você opera em estado de fluxo prolongado. Identidade de alta performance instalada. O protocolo virou padrão.",
    tasks: [
      { id: "review", label: "Revisão semanal: o que funcionou?" },
      { id: "pacto", label: "Definir pacto da próxima semana" },
      { id: "frio2", label: "Banho frio completo 2 min" },
      { id: "subli", label: "Áudio Teta + afirmações (20 min)" },
      { id: "celebra", label: "Celebrar — você atravessou a linha 200" },
    ],
  },
];

function SectionCard({ id, icon, title, subtitle, children }: { id?: string; icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card id={id} data-section={id} className="border-gold/20 bg-gradient-to-br from-background to-background/60 backdrop-blur scroll-mt-24">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
            {icon}
          </div>
          <div>
            <CardTitle className="text-base font-display">{title}</CardTitle>
            {subtitle && <CardDescription className="text-xs">{subtitle}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-2 leading-relaxed">
        {children}
      </CardContent>
    </Card>
  );
}

export default function Protocolo145Page() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [resumed, setResumed] = useState(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const id = (visible.target as HTMLElement).dataset.section as SectionId | undefined;
          if (id && SECTION_IDS.includes(id)) {
            setProgress((p) => (p.lastSection === id ? p : { ...p, lastSection: id, updatedAt: new Date().toISOString() }));
          }
        }
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.querySelector(`[data-section="${id}"]`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (resumed) return;
    const saved = loadProgress();
    if (saved.lastSection && saved.lastSection !== "tese") {
      const el = document.querySelector(`[data-section="${saved.lastSection}"]`);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          toast.info("Retomando de onde você parou ✦", { duration: 2200 });
        }, 250);
      }
    }
    setResumed(true);
  }, [resumed]);

  const completedCount = progress.days.filter(Boolean).length;
  const percent = Math.round((completedCount / 5) * 100);

  const toggleDay = (i: number) => {
    setProgress((p) => {
      const days = [...p.days];
      days[i] = !days[i];
      const now = new Date().toISOString();
      if (days[i]) toast.success(`Dia ${i + 1} concluído ✓`, { description: "Reset registrado." });
      else toast(`Dia ${i + 1} desmarcado`);
      return { ...p, days, updatedAt: now };
    });
  };

  const toggleTask = (dayIdx: number, taskId: string) => {
    setProgress((p) => {
      const dayTasks = { ...(p.dayTasks || {}) };
      const cur = { ...(dayTasks[dayIdx] || {}) };
      cur[taskId] = !cur[taskId];
      dayTasks[dayIdx] = cur;
      return { ...p, dayTasks, updatedAt: new Date().toISOString() };
    });
  };

  const dayProgress = (i: number) => {
    const total = fiveDays[i].tasks.length;
    const done = Object.values(progress.dayTasks?.[i] || {}).filter(Boolean).length;
    return { done, total, pct: Math.round((done / total) * 100) };
  };

  const resetProgress = () => {
    setProgress({
      days: [false, false, false, false, false],
      dayTasks: {},
      lastSection: "tese",
      updatedAt: new Date().toISOString(),
    });
    toast("Progresso reiniciado", { description: "Pronta para um novo ciclo." });
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-black via-zinc-950 to-black p-6 mb-4">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-gold border border-gold/40 rounded-full px-2.5 py-1 mb-3">
            <Zap className="h-3 w-3" /> Biohacking · Neurociência
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground leading-tight">
            Protocolo <span className="text-gold">14.5</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Reset Bio-Hacker · Guia Oficial Glow Up Club</p>
          <p className="text-xs text-foreground/80 mt-4 italic">"O corpo é hardware. A mente é software. Reescreva o código."</p>
        </div>
      </div>

      {/* PROGRESSO */}
      <div className="rounded-2xl border border-gold/30 bg-background/60 backdrop-blur p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Seu progresso · 5 dias</p>
          <button onClick={resetProgress} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Reiniciar
          </button>
        </div>
        <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden mb-3">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{completedCount}/5 dias · {percent}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Salvo localmente</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* 1 — TESE */}
        <SectionCard id="tese" icon={<Brain className="h-4 w-4" />} title="1. A Tese do Bio-Hack" subtitle="O corpo é um sistema otimizável">
          <p>Seu organismo não é frágil — é <span className="text-foreground font-semibold">programável</span>. Cada caloria vazia, cada scroll infinito, cada estímulo de dopamina barata acumula <span className="text-foreground font-semibold">lixo sistêmico</span> que consome largura de banda do córtex pré-frontal.</p>
          <p>O Protocolo 14.5 é uma <span className="text-foreground font-semibold">desfragmentação operacional</span>: remover o ruído metabólico e digital para liberar o processamento cerebral que sustenta foco, clareza e decisão estratégica.</p>
          <p className="text-xs text-foreground/70">Resultado mensurável: ↑ BDNF · ↑ sensibilidade à dopamina · ↓ inflamação · ↑ tempo em fluxo.</p>
        </SectionCard>

        {/* 2 — NEUROCIÊNCIA APROFUNDADA */}
        <SectionCard id="neurociencia" icon={<Activity className="h-4 w-4" />} title="2. Neurociência Aplicada" subtitle="Os 6 mecanismos que o protocolo ativa">
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { icon: <Brain className="h-4 w-4 text-gold" />, t: "BDNF", d: "Fator Neurotrófico Derivado do Cérebro. Jejum + exercício + frio elevam BDNF em até 200% — combustível direto para neuroplasticidade e memória." },
              { icon: <Star className="h-4 w-4 text-gold" />, t: "Dopamina D2", d: "Receptores ressensibilizam em 5–7 dias sem scroll. A vontade de executar volta sem esforço — não é força de vontade, é química." },
              { icon: <Sunrise className="h-4 w-4 text-gold" />, t: "Cortisol Awakening", d: "Pico natural entre 06–09h. Acordar 05:00 + luz solar = você ancora o relógio biológico no estado de alerta máximo." },
              { icon: <Moon className="h-4 w-4 text-gold" />, t: "Glinfático", d: "Sistema de limpeza cerebral ativo no sono profundo. Dormir 22:30–05:00 maximiza a remoção de beta-amiloide." },
              { icon: <Snowflake className="h-4 w-4 text-gold" />, t: "Norepinefrina", d: "Banho frio 1–2 min eleva noradrenalina em 530%. Foco e humor pelas 4h seguintes." },
              { icon: <Eye className="h-4 w-4 text-gold" />, t: "Córtex pré-frontal", d: "Sede da decisão estratégica. Sem inflamação sistêmica + dopamina regulada, ele ganha banda de processamento." },
            ].map((b) => (
              <div key={b.t} className="rounded-lg border border-gold/15 bg-muted/20 p-3">
                <div className="flex items-center gap-1.5 mb-1">{b.icon}<p className="text-xs font-semibold text-foreground">{b.t}</p></div>
                <p className="text-[11px] leading-snug">{b.d}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 3 — CÓDIGO 14.5 */}
        <SectionCard id="codigo" icon={<Target className="h-4 w-4" />} title="3. O Código 14.5" subtitle="As duas variáveis fundadoras">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 14 — Jejum Metabólico</p>
            </div>
            <p>Janela de <span className="text-foreground font-semibold">14 horas sem ingestão calórica</span> (18:40 → 08:40). Ativa <span className="text-foreground font-semibold">autofagia celular</span>, estabiliza insulina e reduz inflamação de baixo grau.</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 5 — Despertar Estratégico</p>
            </div>
            <p>Acordar às <span className="text-foreground font-semibold">05:00</span> sincroniza o ritmo circadiano com o pico natural de cortisol. Você ganha <span className="text-foreground font-semibold">3h de vantagem operacional</span> sobre um mundo que ainda dorme.</p>
          </div>
        </SectionCard>

        {/* 4 — JEJUNS */}
        <SectionCard id="jejuns" icon={<Droplet className="h-4 w-4" />} title="4. Mapa dos Jejuns" subtitle="Do iniciante ao reset metabólico">
          <p>O 14.5 começa em 14h, mas a estrada continua. Cada janela ativa uma camada diferente do organismo:</p>
          <div className="space-y-2">
            {jejunsTipos.map((j) => (
              <div key={j.h} className={`rounded-lg border p-3 ${j.cor}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-display font-bold text-gold">{j.h}</span>
                  <p className="text-sm font-semibold text-foreground">{j.nome}</p>
                </div>
                <p className="text-xs">{j.uso}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gold/30 bg-black/30 p-3 mt-2">
            <p className="text-xs"><span className="text-gold font-semibold">Eletrólitos no jejum:</span> 1g de sal rosa + magnésio 400mg + potássio. Sem isso, fadiga e dor de cabeça aparecem por mineral, não por fome.</p>
          </div>
        </SectionCard>

        {/* 5 — FIREWALL */}
        <SectionCard id="firewall" icon={<ShieldOff className="h-4 w-4" />} title="5. Firewall de Atenção" subtitle="Bloqueio total · Instagram · TikTok · Facebook">
          <p>Redes sociais são <span className="text-foreground font-semibold">máquinas de regulação negativa</span> de receptores D2. Cada deslize é uma microdose de dopamina que rebaixa o limiar — tarefas reais passam a parecer entediantes.</p>
          <p>Em <span className="text-foreground font-semibold">5 dias completos</span> sem o estímulo, o cérebro ressensibiliza os receptores. A procrastinação não é fraqueza de caráter: é química.</p>
          <p className="text-xs text-foreground/70">Tática: desinstale os apps. Use bloqueador (One Sec, Opal, Screen Zen). Sem exceção.</p>
        </SectionCard>

        {/* 6 — HAWKINS */}
        <SectionCard id="hawkins" icon={<TrendingUp className="h-4 w-4" />} title="6. Escala de Hawkins" subtitle="Mapa de Consciência · Dr. David R. Hawkins">
          <p className="mb-3">O protocolo move sua frequência operacional do território da <span className="text-foreground font-semibold">Prostração e Desejo</span> (abaixo de 200 — o homem-massa) para o nível da <span className="text-gold font-semibold">Razão e Inteligência Estratégica</span> (400+).</p>
          <div className="rounded-xl border border-gold/20 overflow-hidden">
            {hawkinsLevels.map((l) => (
              <div
                key={l.range}
                className={`flex items-center justify-between px-3 py-2 text-xs border-b border-border/40 last:border-b-0 bg-gradient-to-r ${l.color} ${
                  l.target ? "ring-2 ring-gold ring-inset" : ""
                } ${l.line ? "border-y-2 border-gold/60" : ""}`}
              >
                <span className={`font-mono font-bold ${l.low ? "text-white/90" : "text-black"}`}>{l.range}</span>
                <span className={`font-semibold ${l.low ? "text-white" : "text-black"}`}>{l.name}</span>
                {l.target && <span className="text-[10px] uppercase tracking-wider bg-black text-gold px-1.5 py-0.5 rounded">DESTINO</span>}
                {l.current && <span className="text-[10px] uppercase tracking-wider bg-white/10 text-white px-1.5 py-0.5 rounded">SAÍDA</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/70 mt-3">Acima de 200 você gera energia. Abaixo, você drena.</p>
        </SectionCard>

        {/* 7 — MASLOW */}
        <SectionCard id="maslow" icon={<Layers className="h-4 w-4" />} title="7. Pirâmide de Maslow" subtitle="Da fisiologia à autorrealização">
          <p className="mb-3">Hawkins mede <span className="text-foreground font-semibold">frequência</span>. Maslow mapeia <span className="text-foreground font-semibold">necessidade</span>. O 14.5 ataca a <span className="text-gold font-semibold">base</span> — sem fisiologia regulada, nenhum nível superior se sustenta.</p>
          <div className="space-y-1.5 flex flex-col items-center">
            {maslowLevels.map((m) => (
              <div key={m.name} className={`${m.width} ${m.color} ${m.text} rounded-lg px-3 py-2.5 transition-all hover:scale-[1.02]`}>
                <p className="text-xs font-display font-bold leading-tight">{m.name}</p>
                <p className="text-[10px] opacity-90 leading-snug mt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground/70 mt-3">Quem pula a base e tenta operar no topo entra em colapso. O 14.5 reconstrói a pirâmide de baixo para cima.</p>
        </SectionCard>

        {/* 8 — HACK SUBLIMINAL */}
        <SectionCard id="subliminal" icon={<Moon className="h-4 w-4" />} title="8. Hack Subliminal" subtitle="Reprogramação durante o sono · ondas Delta/Teta">
          <p>Entre 22:00 e 02:00 o cérebro entra em <span className="text-foreground font-semibold">ondas Delta</span> — janela natural de consolidação de memória implícita. Antes de dormir, sintonize <span className="text-foreground font-semibold">Teta (4–8 Hz)</span> por 20 min para induzir hipnagogia.</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>22:30 — fone de ouvido, áudio Teta + afirmações em primeira pessoa.</li>
            <li>"Eu sou foco. Eu opero acima de 400. Eu não negocio com lixo."</li>
            <li>Volume baixo, suficiente para o subconsciente captar sem despertar o crítico.</li>
            <li>Repetir <span className="text-foreground font-semibold">os 5 dias</span> — a identidade nova é gravada no sistema 1.</li>
          </ul>
        </SectionCard>

        {/* 9 — 5 DIAS DINÂMICO */}
        <SectionCard id="execucao" icon={<CalendarDays className="h-4 w-4" />} title="9. Execução Dinâmica · 5 Dias" subtitle="Marque cada hábito conforme realiza">
          <div className="space-y-3">
            {fiveDays.map((d, i) => {
              const done = progress.days[i];
              const dp = dayProgress(i);
              return (
                <div key={d.day} className={`rounded-xl border p-3 transition-colors ${done ? "border-gold/60 bg-gold/10" : "border-border bg-muted/30"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${done ? "bg-gold text-black" : "bg-muted text-foreground"}`}>
                      {done ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${done ? "text-gold" : "text-foreground"}`}>{d.day} · {d.title}</p>
                      <p className="text-[10px] text-muted-foreground">{dp.done}/{dp.total} hábitos · {dp.pct}%</p>
                    </div>
                  </div>
                  <p className="text-xs mb-2 text-muted-foreground">{d.body}</p>

                  {/* Mini progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-muted/40 overflow-hidden mb-3">
                    <div className="h-full bg-gold transition-all duration-500" style={{ width: `${dp.pct}%` }} />
                  </div>

                  {/* Tasks checklist */}
                  <div className="space-y-1.5 mb-3">
                    {d.tasks.map((t) => {
                      const checked = !!progress.dayTasks?.[i]?.[t.id];
                      return (
                        <button
                          key={t.id}
                          onClick={() => toggleTask(i, t.id)}
                          className={`w-full flex items-center gap-2 text-left text-xs px-2.5 py-2 rounded-lg border transition-colors ${
                            checked
                              ? "border-gold/50 bg-gold/10 text-foreground"
                              : "border-border bg-background/40 text-muted-foreground hover:border-gold/30"
                          }`}
                        >
                          <span className={`h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${checked ? "bg-gold border-gold" : "border-muted-foreground/40"}`}>
                            {checked && <Check className="h-3 w-3 text-black" />}
                          </span>
                          <span className={checked ? "line-through opacity-80" : ""}>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    size="sm"
                    variant={done ? "outline" : "default"}
                    onClick={() => toggleDay(i)}
                    className={done
                      ? "w-full border-gold/60 text-gold hover:bg-gold/10"
                      : "w-full bg-gold hover:bg-gold/90 text-black font-semibold"}
                  >
                    {done ? "✓ Dia concluído · desfazer" : "Marcar dia concluído"}
                  </Button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 10 — IA */}
        <div data-section="ia" id="ia" className="scroll-mt-24">
          <Protocolo145Chat />
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/10 via-background to-background p-6 text-center">
          <Flame className="h-8 w-8 text-gold mx-auto mb-3" />
          <p className="text-lg font-display font-bold text-foreground leading-snug">
            O sistema só muda<br />se você mudar o código.
          </p>
          <p className="text-sm text-muted-foreground mt-2 mb-5">Inicie seu reset agora.</p>
          <Button
            size="lg"
            className="w-full bg-gold hover:bg-gold/90 text-black font-bold tracking-wide uppercase"
            onClick={() => navigate("/desafios")}
          >
            Iniciar Protocolo 14.5
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3 uppercase tracking-[0.2em]">Soberania · Foco · Razão 400+</p>
        </div>
      </div>
    </div>
  );
}
