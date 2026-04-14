import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, Moon, Brain, Heart, Sparkles, Droplets, AlertCircle, Baby, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, differenceInDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CycleLog {
  id: string;
  period_start: string;
  period_end: string | null;
  cycle_length: number | null;
  symptoms: string[];
  mood: string | null;
  flow_intensity: string;
  notes: string | null;
}

const symptomOptions = [
  "Cólica", "Dor de cabeça", "Inchaço", "Dor nas costas", "Sensibilidade nos seios",
  "Fadiga", "Náusea", "Insônia", "Irritabilidade", "Ansiedade", "Acne", "Compulsão alimentar"
];

const moodOptions = [
  { value: "otima", label: "😊 Ótima" },
  { value: "boa", label: "🙂 Boa" },
  { value: "neutra", label: "😐 Neutra" },
  { value: "triste", label: "😢 Triste" },
  { value: "irritada", label: "😤 Irritada" },
  { value: "ansiosa", label: "😰 Ansiosa" },
];

const phaseInfo = [
  {
    name: "Menstrual (Dias 1-5)",
    icon: <Droplets className="h-5 w-5 text-red-400" />,
    color: "text-red-400",
    desc: "Queda de estrogênio e progesterona. Momento de introspecção e descanso.",
    tips: [
      "Prefira exercícios leves como caminhada e yoga",
      "Alimentos ricos em ferro: espinafre, lentilha, carne vermelha",
      "Chá de gengibre ajuda com cólicas",
      "Magnésio reduz dor e melhora o humor",
    ],
    neuro: "O cérebro tem queda de serotonina e dopamina, explicando a menor energia e possível irritabilidade. O córtex pré-frontal tem atividade reduzida — seja gentil consigo mesma.",
  },
  {
    name: "Folicular (Dias 6-13)",
    icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
    color: "text-emerald-400",
    desc: "Estrogênio em alta. Fase de energia, criatividade e motivação.",
    tips: [
      "Melhor fase para treinos intensos e HIIT",
      "Planeje projetos e metas — criatividade em alta",
      "Ótimo momento para iniciar novos hábitos",
      "Alimentos com fibras e proteínas para sustentar energia",
    ],
    neuro: "Estrogênio aumenta serotonina, dopamina e BDNF (fator neurotrófico), melhorando memória, aprendizado e humor. O hipocampo está mais ativo — aproveite para estudar.",
  },
  {
    name: "Ovulatória (Dias 14-16)",
    icon: <Heart className="h-5 w-5 text-pink-400" />,
    color: "text-pink-400",
    desc: "Pico de estrogênio e LH. Máxima energia e sociabilidade.",
    tips: [
      "Pico de força e performance física",
      "Ótimo para compromissos sociais e apresentações",
      "Atenção à hidratação — temperatura corporal aumenta",
      "Inclua vegetais crucíferos para metabolizar estrogênio",
    ],
    neuro: "Pico de estrogênio potencializa a comunicação verbal e empatia. A amígdala está mais responsiva — você se conecta melhor com outras pessoas. Ocitocina em alta.",
  },
  {
    name: "Lútea (Dias 17-28)",
    icon: <Moon className="h-5 w-5 text-violet-400" />,
    color: "text-violet-400",
    desc: "Progesterona sobe e depois cai. Fase de TPM e introspecção.",
    tips: [
      "Reduza intensidade dos treinos gradualmente",
      "Carboidratos complexos ajudam com compulsão",
      "Vitamina B6 e magnésio aliviam sintomas de TPM",
      "Priorize sono — melatonina pode estar desregulada",
    ],
    neuro: "Progesterona atua como ansiolítico natural via GABA. Quando cai no final da fase, causa irritabilidade e ansiedade (TPM). Serotonina reduz — por isso a compulsão por doces e carboidratos.",
  },
];

// Daily cycle guide: mood, symptoms, tips per day range
const dailyCycleGuide: Record<string, { days: string; moods: string[]; symptoms: string[]; tips: string[]; energy: string; libido: string }> = {
  "1-2": {
    days: "Dias 1-2",
    moods: ["😢 Sensível", "😴 Cansada", "😤 Irritada"],
    symptoms: ["Cólica forte", "Fadiga intensa", "Dor lombar", "Inchaço"],
    tips: ["Descanse sem culpa — seu corpo está trabalhando", "Bolsa de água quente na barriga", "Chá de camomila ou gengibre para cólica", "Evite cafeína em excesso"],
    energy: "🔋 Muito baixa",
    libido: "❄️ Baixa",
  },
  "3-5": {
    days: "Dias 3-5",
    moods: ["😐 Neutra", "🙂 Melhorando", "😌 Aliviada"],
    symptoms: ["Cólica leve", "Fadiga moderada", "Sensibilidade nos seios diminuindo"],
    tips: ["Caminhada leve ajuda com o humor", "Alimentos ricos em ferro: espinafre, feijão, carne", "Vitamina C para absorver melhor o ferro", "Hidrate-se bastante"],
    energy: "🔋 Baixa → média",
    libido: "🌡️ Aumentando",
  },
  "6-9": {
    days: "Dias 6-9 (Folicular inicial)",
    moods: ["😊 Animada", "✨ Motivada", "🧠 Focada"],
    symptoms: ["Poucos ou nenhum", "Energia crescente", "Pele melhorando"],
    tips: ["Comece projetos novos — criatividade em alta!", "Ótimo momento para treinos mais intensos", "Planeje compromissos sociais", "Estrogênio sobe = serotonina sobe = humor ótimo"],
    energy: "🔋🔋 Média-alta",
    libido: "🌡️ Crescente",
  },
  "10-13": {
    days: "Dias 10-13 (Folicular tardio)",
    moods: ["🤩 Confiante", "💪 Empoderada", "🗣️ Comunicativa"],
    symptoms: ["Muco cervical aumentando", "Energia no pico", "Pele brilhante"],
    tips: ["Pico de performance física — melhor fase para HIIT e musculação", "Estrogênio alto = memória e aprendizado no máximo", "Tome decisões importantes agora", "Apresentações e reuniões: você está no seu melhor verbal"],
    energy: "🔋🔋🔋 Alta",
    libido: "🔥 Alta",
  },
  "14-16": {
    days: "Dias 14-16 (Ovulação)",
    moods: ["🥰 Sociável", "💃 Atraente", "😊 Eufórica"],
    symptoms: ["Dor leve no ovário (mittelschmerz)", "Muco cervical 'clara de ovo'", "Temperatura basal subindo", "Libido no pico"],
    tips: ["Pico de fertilidade — atenção se não deseja engravidar", "Ocitocina e dopamina em alta = maior conexão social", "Beba bastante água — temperatura corporal sobe", "Vegetais crucíferos ajudam a metabolizar o estrogênio extra"],
    energy: "🔋🔋🔋 Máxima",
    libido: "🔥🔥 Pico",
  },
  "17-21": {
    days: "Dias 17-21 (Lútea inicial)",
    moods: ["😌 Calma", "🧘 Introspectiva", "😴 Sonolenta"],
    symptoms: ["Fome aumentada", "Sono mais profundo", "Leve inchaço"],
    tips: ["Progesterona sobe = efeito calmante natural via GABA", "Prefira treinos moderados: pilates, yoga, natação", "Carboidratos complexos: batata-doce, aveia, arroz integral", "Prepare-se para possível TPM nos próximos dias"],
    energy: "🔋🔋 Média",
    libido: "🌡️ Diminuindo",
  },
  "22-25": {
    days: "Dias 22-25 (Lútea média — TPM)",
    moods: ["😤 Irritável", "😢 Emotiva", "😰 Ansiosa", "🤬 Frustrada"],
    symptoms: ["Inchaço", "Compulsão por doces", "Sensibilidade nos seios", "Dor de cabeça", "Acne", "Retenção de líquido"],
    tips: ["Serotonina caindo = compulsão por carboidratos é biológica, não fraqueza", "Magnésio (400mg) reduz irritabilidade e cólica", "Vitamina B6 ajuda com retenção e humor", "Chocolate amargo 70%+ libera endorfina sem excesso de açúcar"],
    energy: "🔋 Baixa-média",
    libido: "❄️ Baixa",
  },
  "26-28": {
    days: "Dias 26-28 (Pré-menstrual)",
    moods: ["😔 Melancólica", "😤 Impaciente", "😢 Chorosa"],
    symptoms: ["Cólica antecipada", "Fadiga", "Insônia", "Inchaço máximo", "Mudança de apetite"],
    tips: ["Progesterona e estrogênio caem juntos = maior desregulação emocional", "Priorize sono — melatonina pode estar desregulada", "Evite álcool e ultraprocessados", "Isso vai passar — seu cérebro estará renovado em 2-3 dias"],
    energy: "🔋 Muito baixa",
    libido: "❄️ Muito baixa",
  },
};

function getDailyGuide(day: number | null): typeof dailyCycleGuide[string] | null {
  if (!day || day < 1) return null;
  if (day <= 2) return dailyCycleGuide["1-2"];
  if (day <= 5) return dailyCycleGuide["3-5"];
  if (day <= 9) return dailyCycleGuide["6-9"];
  if (day <= 13) return dailyCycleGuide["10-13"];
  if (day <= 16) return dailyCycleGuide["14-16"];
  if (day <= 21) return dailyCycleGuide["17-21"];
  if (day <= 25) return dailyCycleGuide["22-25"];
  if (day <= 35) return dailyCycleGuide["26-28"];
  return null;
}

const neuroscienceFacts = [
  {
    title: "Cérebro e Hormônios",
    icon: <Brain className="h-5 w-5 text-primary" />,
    content: "O cérebro feminino muda estruturalmente ao longo do ciclo. O hipocampo (memória) cresce na fase folicular e o córtex pré-frontal (decisões) é mais ativo com estrogênio alto. Na fase lútea, a amígdala (emoções) fica hiperativa.",
  },
  {
    title: "Serotonina e Ciclo",
    icon: <Sparkles className="h-5 w-5 text-primary" />,
    content: "O estrogênio é o maior aliado da serotonina. Quando cai na fase lútea/menstrual, a serotonina cai junto — por isso a tristeza, compulsão alimentar e irritabilidade da TPM. Exercício e luz solar ajudam a compensar.",
  },
  {
    title: "Dor e Neuroplasticidade",
    icon: <AlertCircle className="h-5 w-5 text-primary" />,
    content: "Estudos mostram que o limiar de dor é menor na fase menstrual e lútea. As prostaglandinas que causam cólica também afetam o sistema nervoso central. Ômega-3 e magnésio reduzem inflamação neural.",
  },
  {
    title: "Sono e Progesterona",
    icon: <Moon className="h-5 w-5 text-primary" />,
    content: "A progesterona tem efeito sedativo via receptores GABA. Na fase lútea alta, sono mais profundo. Quando cai antes da menstruação, insônia e sono fragmentado. Melatonina e rotina de sono ajudam.",
  },
];

export default function CycleTracker() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    period_start: format(new Date(), "yyyy-MM-dd"),
    period_end: "",
    flow_intensity: "medio",
    mood: "",
    symptoms: [] as string[],
    notes: "",
  });

  useEffect(() => { if (user) loadLogs(); }, [user]);

  async function loadLogs() {
    if (!user) return;
    const { data } = await supabase
      .from("cycle_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("period_start", { ascending: false });
    if (data) setLogs(data as unknown as CycleLog[]);
  }

  async function saveLog() {
    if (!user) return;
    const cycleLength = form.period_end && form.period_start
      ? differenceInDays(new Date(form.period_end), new Date(form.period_start)) + 1
      : null;

    const payload = {
      user_id: user.id,
      period_start: form.period_start,
      period_end: form.period_end || null,
      cycle_length: cycleLength,
      flow_intensity: form.flow_intensity,
      mood: form.mood || null,
      symptoms: form.symptoms,
      notes: form.notes || null,
    };

    if (editingId) {
      const { error } = await supabase.from("cycle_logs").update(payload).eq("id", editingId);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Registro atualizado!");
    } else {
      const { error } = await supabase.from("cycle_logs").insert(payload);
      if (error) { toast.error("Erro ao salvar"); return; }
      toast.success("Ciclo registrado!");
    }
    resetForm();
    loadLogs();
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ period_start: format(new Date(), "yyyy-MM-dd"), period_end: "", flow_intensity: "medio", mood: "", symptoms: [], notes: "" });
  }

  function startEdit(log: CycleLog) {
    setEditingId(log.id);
    setForm({
      period_start: log.period_start,
      period_end: log.period_end || "",
      flow_intensity: log.flow_intensity,
      mood: log.mood || "",
      symptoms: log.symptoms || [],
      notes: log.notes || "",
    });
    setShowForm(true);
  }

  async function deleteLog(id: string) {
    await supabase.from("cycle_logs").delete().eq("id", id);
    toast.success("Registro removido");
    loadLogs();
  }

  function toggleSymptom(s: string) {
    setForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(s) ? prev.symptoms.filter(x => x !== s) : [...prev.symptoms, s],
    }));
  }

  // Predict next period
  const avgCycleLength = logs.length >= 2
    ? Math.round(logs.slice(0, 5).reduce((acc, log, i, arr) => {
        if (i === 0) return acc;
        const diff = differenceInDays(new Date(arr[i - 1].period_start), new Date(log.period_start));
        return acc + diff;
      }, 0) / (Math.min(logs.length, 5) - 1))
    : 28;

  const nextPeriod = logs.length > 0
    ? addDays(new Date(logs[0].period_start), avgCycleLength)
    : null;

  const daysUntilNext = nextPeriod ? differenceInDays(nextPeriod, new Date()) : null;

  // Current phase estimation
  const currentDay = logs.length > 0
    ? differenceInDays(new Date(), new Date(logs[0].period_start)) + 1
    : null;

  const getCurrentPhase = () => {
    if (!currentDay || currentDay < 1 || currentDay > 35) return null;
    if (currentDay <= 5) return 0;
    if (currentDay <= 13) return 1;
    if (currentDay <= 16) return 2;
    return 3;
  };

  const currentPhaseIndex = getCurrentPhase();

  // Fertility window: ovulation ~day 14, fertile window days 10-16
  const ovulationDay = avgCycleLength - 14;
  const fertileStart = ovulationDay - 4;
  const fertileEnd = ovulationDay + 1;

  const isFertileNow = currentDay ? currentDay >= fertileStart && currentDay <= fertileEnd : false;
  const isOvulationNow = currentDay ? currentDay === ovulationDay : false;

  // Days until fertile window
  const daysUntilFertile = currentDay && currentDay < fertileStart ? fertileStart - currentDay : null;

  // Build cycle timeline data for chart
  const cycleTimelineData = logs.slice(0, 8).reverse().map((log, i, arr) => {
    const periodDays = log.period_end
      ? differenceInDays(new Date(log.period_end + "T12:00:00"), new Date(log.period_start + "T12:00:00")) + 1
      : 5;
    const cycleDays = i < arr.length - 1
      ? differenceInDays(new Date(arr[i + 1].period_start + "T12:00:00"), new Date(log.period_start + "T12:00:00"))
      : avgCycleLength;
    return {
      label: format(new Date(log.period_start + "T12:00:00"), "MMM yy", { locale: ptBR }),
      cycleLength: cycleDays,
      periodDays,
      fertileStart: cycleDays - 14 - 4,
      fertileEnd: cycleDays - 14 + 1,
    };
  });

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-5 w-5 text-primary" />
            Seu Ciclo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Ciclo médio</p>
                  <p className="text-lg font-bold text-primary">{avgCycleLength}d</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Próx. menstruação</p>
                  <p className="text-lg font-bold text-primary">
                    {daysUntilNext !== null ? (daysUntilNext > 0 ? `${daysUntilNext}d` : "Hoje!") : "—"}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">Ovulação (dia)</p>
                  <p className="text-lg font-bold text-primary">{ovulationDay}</p>
                </div>
              </div>

              {/* Current Phase */}
              {currentPhaseIndex !== null && (
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-3">
                  {phaseInfo[currentPhaseIndex].icon}
                  <div>
                    <p className={`text-sm font-semibold ${phaseInfo[currentPhaseIndex].color}`}>
                      Fase atual: {phaseInfo[currentPhaseIndex].name}
                    </p>
                    <p className="text-xs text-muted-foreground">{phaseInfo[currentPhaseIndex].desc}</p>
                  </div>
                </div>
              )}

              {/* Fertility Status */}
              <div className={`flex items-center gap-2 rounded-lg p-3 ${isFertileNow ? "bg-pink-500/10 border border-pink-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                {isFertileNow ? (
                  <>
                    <Baby className="h-5 w-5 text-pink-500" />
                    <div>
                      <p className="text-sm font-semibold text-pink-500">
                        {isOvulationNow ? "🔴 Dia da Ovulação — Pico de fertilidade" : "Período Fértil"}
                      </p>
                      <p className="text-xs text-muted-foreground">Dias {fertileStart}-{fertileEnd} do ciclo (você está no dia {currentDay})</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-500">Período Não Fértil</p>
                      <p className="text-xs text-muted-foreground">
                        {daysUntilFertile ? `Janela fértil em ${daysUntilFertile} dias` : `Janela fértil: dias ${fertileStart}-${fertileEnd}`}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Registre seu primeiro ciclo para ver previsões e insights
            </p>
          )}
          <Button onClick={() => setShowForm(true)} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Registrar Ciclo
          </Button>
        </CardContent>
      </Card>

      {/* Visual Cycle Map */}
      {logs.length > 0 && currentDay && currentDay > 0 && currentDay <= 40 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Mapa do Ciclo Atual</CardTitle>
            <CardDescription>Dia {currentDay} de ~{avgCycleLength}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Phase bar */}
              <div className="flex rounded-full overflow-hidden h-6 bg-muted/30">
                <div className="bg-red-400/70 flex items-center justify-center" style={{ width: `${(5 / avgCycleLength) * 100}%` }}>
                  <span className="text-[8px] text-white font-medium">Menstrual</span>
                </div>
                <div className="bg-emerald-400/70 flex items-center justify-center" style={{ width: `${((fertileStart - 6) / avgCycleLength) * 100}%` }}>
                  <span className="text-[8px] text-white font-medium">Folicular</span>
                </div>
                <div className="bg-pink-400/80 flex items-center justify-center" style={{ width: `${((fertileEnd - fertileStart + 1) / avgCycleLength) * 100}%` }}>
                  <span className="text-[8px] text-white font-medium">Fértil</span>
                </div>
                <div className="bg-violet-400/70 flex items-center justify-center" style={{ width: `${((avgCycleLength - fertileEnd) / avgCycleLength) * 100}%` }}>
                  <span className="text-[8px] text-white font-medium">Lútea</span>
                </div>
              </div>
              {/* Current day marker */}
              <div
                className="absolute top-0 h-6 flex items-end justify-center"
                style={{ left: `${((currentDay - 0.5) / avgCycleLength) * 100}%`, transform: "translateX(-50%)" }}
              >
                <div className="w-0.5 h-full bg-foreground rounded-full" />
              </div>
              <div
                className="absolute -bottom-4"
                style={{ left: `${((currentDay - 0.5) / avgCycleLength) * 100}%`, transform: "translateX(-50%)" }}
              >
                <span className="text-[9px] font-bold text-foreground">Dia {currentDay}</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-7">
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><span className="text-[9px] text-muted-foreground">Menstrual</span></div>
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" /><span className="text-[9px] text-muted-foreground">Folicular</span></div>
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-pink-400/80" /><span className="text-[9px] text-muted-foreground">Fértil</span></div>
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-violet-400/70" /><span className="text-[9px] text-muted-foreground">Lútea</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cycle History Chart */}
      {cycleTimelineData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Histórico de Ciclos</CardTitle>
            <CardDescription>Duração do ciclo e período ao longo dos meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cycleTimelineData.map((d, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-medium text-muted-foreground w-14">{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{d.cycleLength}d</span>
                  </div>
                  <div className="relative h-4 bg-muted/20 rounded-full overflow-hidden">
                    {/* Period days */}
                    <div
                      className="absolute h-full bg-red-400/70 rounded-l-full"
                      style={{ left: 0, width: `${(d.periodDays / d.cycleLength) * 100}%` }}
                    />
                    {/* Fertile window */}
                    <div
                      className="absolute h-full bg-pink-400/60"
                      style={{
                        left: `${(d.fertileStart / d.cycleLength) * 100}%`,
                        width: `${((d.fertileEnd - d.fertileStart + 1) / d.cycleLength) * 100}%`,
                      }}
                    />
                    {/* Luteal */}
                    <div
                      className="absolute h-full bg-violet-400/40 rounded-r-full"
                      style={{
                        left: `${(d.fertileEnd / d.cycleLength) * 100}%`,
                        width: `${((d.cycleLength - d.fertileEnd) / d.cycleLength) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t border-border/50">
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-red-400/70" /><span className="text-[9px] text-muted-foreground">Menstruação</span></div>
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-pink-400/60" /><span className="text-[9px] text-muted-foreground">Janela Fértil</span></div>
              <div className="flex items-center gap-1"><div className="h-2.5 w-2.5 rounded-full bg-violet-400/40" /><span className="text-[9px] text-muted-foreground">Fase Lútea</span></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fertility Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Baby className="h-5 w-5 text-primary" />
            Fertilidade & Ciclo
          </CardTitle>
          <CardDescription>Entenda seus períodos férteis e não férteis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-pink-500/5 rounded-lg p-3 border border-pink-500/10">
            <p className="text-sm font-semibold text-pink-500 flex items-center gap-1 mb-1">
              <Baby className="h-4 w-4" /> Período Fértil
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              A janela fértil dura cerca de 6 dias: 5 dias antes da ovulação + o dia da ovulação.
              O óvulo sobrevive 12-24h após a ovulação, e os espermatozoides até 5 dias.
            </p>
            <ul className="space-y-1">
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Ovulação ocorre ~14 dias antes da próxima menstruação</li>
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Muco cervical fica transparente e elástico ("clara de ovo")</li>
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Temperatura basal sobe 0.2-0.5°C após ovulação</li>
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Libido naturalmente aumenta neste período</li>
            </ul>
          </div>
          <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
            <p className="text-sm font-semibold text-emerald-500 flex items-center gap-1 mb-1">
              <ShieldCheck className="h-4 w-4" /> Período Não Fértil
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              Fora da janela fértil, a probabilidade de gravidez é muito baixa, mas nenhum método de calendário é 100% confiável.
            </p>
            <ul className="space-y-1">
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Fase lútea tardia e menstrual são as menos férteis</li>
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Ciclos irregulares tornam a previsão menos precisa</li>
              <li className="text-xs text-muted-foreground flex gap-1.5"><span>•</span> Consulte seu ginecologista para contracepção segura</li>
            </ul>
          </div>
          <div className="bg-primary/5 rounded-lg p-2.5">
            <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
              <Brain className="h-3.5 w-3.5" /> Neurociência da Fertilidade
            </p>
            <p className="text-xs text-muted-foreground">
              Durante a janela fértil, estrogênio e LH em pico aumentam dopamina e ocitocina, 
              elevando a atração social, confiança e desejo. O cérebro literalmente muda a percepção de rostos 
              e cheiros. Após a ovulação, progesterona ativa GABA, favorecendo recolhimento e nesting.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{editingId ? "Editar" : "Novo"} Registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Início</label>
                <Input type="date" value={form.period_start} onChange={e => setForm(f => ({ ...f, period_start: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fim (opcional)</label>
                <Input type="date" value={form.period_end} onChange={e => setForm(f => ({ ...f, period_end: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Intensidade do fluxo</label>
              <Select value={form.flow_intensity} onValueChange={v => setForm(f => ({ ...f, flow_intensity: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">🩸 Leve</SelectItem>
                  <SelectItem value="medio">🩸🩸 Médio</SelectItem>
                  <SelectItem value="intenso">🩸🩸🩸 Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Humor</label>
              <Select value={form.mood} onValueChange={v => setForm(f => ({ ...f, mood: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {moodOptions.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sintomas</label>
              <div className="flex flex-wrap gap-1.5">
                {symptomOptions.map(s => (
                  <Badge
                    key={s}
                    variant={form.symptoms.includes(s) ? "default" : "outline"}
                    className="cursor-pointer text-[10px]"
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="Observações..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
            />

            <div className="flex gap-2">
              <Button onClick={saveLog} size="sm" className="flex-1">
                <Check className="h-4 w-4 mr-1" /> Salvar
              </Button>
              <Button variant="outline" onClick={resetForm} size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {logs.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Histórico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {logs.slice(0, 6).map(log => (
              <div key={log.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium">
                    {format(new Date(log.period_start + "T12:00:00"), "dd MMM yyyy", { locale: ptBR })}
                    {log.period_end && ` — ${format(new Date(log.period_end + "T12:00:00"), "dd MMM", { locale: ptBR })}`}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-[9px]">
                      {log.flow_intensity === "leve" ? "🩸 Leve" : log.flow_intensity === "intenso" ? "🩸🩸🩸 Intenso" : "🩸🩸 Médio"}
                    </Badge>
                    {log.mood && <Badge variant="outline" className="text-[9px]">{moodOptions.find(m => m.value === log.mood)?.label || log.mood}</Badge>}
                    {log.symptoms?.slice(0, 2).map(s => <Badge key={s} variant="outline" className="text-[9px]">{s}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(log)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteLog(log.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Phases Guide */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Moon className="h-5 w-5 text-primary" />
            Fases do Ciclo & Dicas
          </CardTitle>
          <CardDescription>Entenda cada fase e como se cuidar melhor</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {phaseInfo.map((phase, i) => (
              <AccordionItem key={i} value={`phase-${i}`}>
                <AccordionTrigger className="text-sm">
                  <span className="flex items-center gap-2">
                    {phase.icon} {phase.name}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{phase.desc}</p>
                  <div className="space-y-1">
                    {phase.tips.map((tip, j) => (
                      <div key={j} className="flex gap-2 items-start">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-primary/5 rounded-lg p-2.5 mt-2">
                    <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                      <Brain className="h-3.5 w-3.5" /> Neurociência
                    </p>
                    <p className="text-xs text-muted-foreground">{phase.neuro}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Neuroscience Deep Dive */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-primary" />
            Neurociência do Ciclo
          </CardTitle>
          <CardDescription>O que a ciência diz sobre seu cérebro e ciclo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {neuroscienceFacts.map((fact, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-3">
              <p className="text-sm font-semibold flex items-center gap-2 mb-1">{fact.icon} {fact.title}</p>
              <p className="text-xs text-muted-foreground">{fact.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
