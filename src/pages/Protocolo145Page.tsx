import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Zap, Clock, Sunrise, ShieldOff, TrendingUp, Moon, CalendarDays, Flame, Brain, Target, Check, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const STORAGE_KEY = "protocolo-14-5:progress";
const SECTION_IDS = ["tese", "codigo", "firewall", "hawkins", "subliminal", "execucao", "cta"] as const;
type SectionId = typeof SECTION_IDS[number];
type Progress = { days: boolean[]; lastSection: SectionId; updatedAt: string };

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p.days) && p.days.length === 5) return p;
    }
  } catch {}
  return { days: [false, false, false, false, false], lastSection: "tese", updatedAt: new Date().toISOString() };
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

const fiveDays = [
  { day: "Segunda", title: "Desintoxicação Bruta", body: "Cefaleia leve, fissura por açúcar e scroll. O corpo grita pelo lixo. Hidrate com 3L de água + sal rosa. Foco baixo, disciplina alta." },
  { day: "Terça", title: "Estabilização Insulínica", body: "Picos de fome desaparecem. Energia mais limpa pela manhã. Primeiros sinais de clareza após o jejum de 14h." },
  { day: "Quarta", title: "Despertar Cognitivo", body: "Cérebro entra em modo BDNF. Você lê, escreve e decide mais rápido. A vantagem das 05:00 começa a se sentir." },
  { day: "Quinta", title: "Reset Dopaminérgico", body: "Receptores resensibilizados. Tarefas simples voltam a dar prazer. Procrastinação some — o tédio vira combustível." },
  { day: "Sexta", title: "Soberania Operacional", body: "Você opera em estado de fluxo prolongado. Identidade de alta performance instalada. O protocolo virou padrão." },
];

function SectionCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="border-gold/20 bg-gradient-to-br from-background to-background/60 backdrop-blur">
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

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-black via-zinc-950 to-black p-6 mb-6">
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

      <div className="space-y-5">
        {/* 1 — TESE */}
        <SectionCard icon={<Brain className="h-4 w-4" />} title="1. A Tese do Bio-Hack" subtitle="O corpo é um sistema otimizável">
          <p>Seu organismo não é frágil — é <span className="text-foreground font-semibold">programável</span>. Cada caloria vazia, cada scroll infinito, cada estímulo de dopamina barata acumula <span className="text-foreground font-semibold">lixo sistêmico</span> que consome largura de banda do córtex pré-frontal.</p>
          <p>O Protocolo 14.5 não é dieta nem rotina motivacional. É uma <span className="text-foreground font-semibold">desfragmentação operacional</span>: remover o ruído metabólico e digital para liberar o processamento cerebral que sustenta foco, clareza e decisão estratégica.</p>
          <p className="text-xs text-foreground/70">Resultado mensurável: ↑ BDNF · ↑ sensibilidade à dopamina · ↓ inflamação sistêmica · ↑ tempo em estado de fluxo.</p>
        </SectionCard>

        {/* 2 — CÓDIGO 14.5 */}
        <SectionCard icon={<Target className="h-4 w-4" />} title="2. O Código 14.5" subtitle="As duas variáveis fundadoras">
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 14 — Jejum Metabólico</p>
            </div>
            <p>Janela de <span className="text-foreground font-semibold">14 horas sem ingestão calórica</span> (18:40 → 08:40). Ativa <span className="text-foreground font-semibold">autofagia celular</span>, estabiliza insulina e reduz inflamação de baixo grau. A fome inicial é abstinência, não necessidade.</p>
          </div>
          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 space-y-1">
            <div className="flex items-center gap-2">
              <Sunrise className="h-4 w-4 text-gold" />
              <p className="text-sm font-semibold text-foreground">Variável 5 — O Despertar Estratégico</p>
            </div>
            <p>Acordar às <span className="text-foreground font-semibold">05:00</span> sincroniza o ritmo circadiano com o pico natural de cortisol e luz azul matinal. Você ganha <span className="text-foreground font-semibold">3 horas de vantagem operacional</span> sobre um mundo que ainda dorme.</p>
          </div>
        </SectionCard>

        {/* 3 — FIREWALL */}
        <SectionCard icon={<ShieldOff className="h-4 w-4" />} title="3. O Firewall de Atenção" subtitle="Bloqueio total · Instagram · TikTok · Facebook">
          <p>Redes sociais são <span className="text-foreground font-semibold">máquinas de regulação negativa</span> de receptores D2. Cada deslize é uma microdose de dopamina que rebaixa o limiar — tarefas reais passam a parecer entediantes.</p>
          <p>Ao cortar o estímulo por <span className="text-foreground font-semibold">5 dias completos</span>, o cérebro ressensibiliza os receptores. A procrastinação não é fraqueza de caráter: é química. Remova o input, e a vontade de executar volta sozinha.</p>
          <p className="text-xs text-foreground/70">Tática: desinstale os apps do celular. Use bloqueador (One Sec, Opal, Screen Zen). Sem exceção, sem "só 5 minutos".</p>
        </SectionCard>

        {/* 4 — HAWKINS */}
        <SectionCard icon={<TrendingUp className="h-4 w-4" />} title="4. A Escala de Ascensão" subtitle="Mapa de Consciência · Dr. David R. Hawkins">
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
          <p className="text-xs text-foreground/70 mt-3">Acima de 200 você gera energia. Abaixo, você drena. O 14.5 atravessa a linha em 5 dias.</p>
        </SectionCard>

        {/* 5 — HACK SUBLIMINAL */}
        <SectionCard icon={<Moon className="h-4 w-4" />} title="5. Hack Subliminal" subtitle="Reprogramação durante o sono · ondas Delta/Teta">
          <p>Entre 22:00 e 02:00 o cérebro entra em <span className="text-foreground font-semibold">ondas Delta</span> (deep sleep) — janela natural de consolidação de memória implícita. Antes de dormir, sintonize ondas <span className="text-foreground font-semibold">Teta (4–8 Hz)</span> por 20 min para induzir hipnagogia.</p>
          <p>Execução:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>22:30 — fone de ouvido, áudio Teta + afirmações em primeira pessoa, presente.</li>
            <li>"Eu sou foco. Eu opero acima de 400. Eu não negocio com lixo."</li>
            <li>Volume baixo, suficiente para o subconsciente captar sem despertar o crítico.</li>
            <li>Repetir <span className="text-foreground font-semibold">os 5 dias</span> — a identidade nova é gravada no sistema 1.</li>
          </ul>
        </SectionCard>

        {/* 6 — 5 DIAS */}
        <SectionCard icon={<CalendarDays className="h-4 w-4" />} title="6. Guia de Execução · 5 Dias" subtitle="Segunda a Sexta — desinflamação + acuidade">
          <div className="space-y-2">
            {fiveDays.map((d, i) => (
              <div key={d.day} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-6 w-6 rounded-full bg-gold text-black text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <p className="text-sm font-semibold text-foreground">{d.day} · {d.title}</p>
                </div>
                <p className="text-xs">{d.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

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
