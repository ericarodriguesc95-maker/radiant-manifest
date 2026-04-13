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
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Ciclo médio</p>
                  <p className="text-xl font-bold text-primary">{avgCycleLength} dias</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Próxima menstruação</p>
                  <p className="text-xl font-bold text-primary">
                    {daysUntilNext !== null ? (daysUntilNext > 0 ? `${daysUntilNext}d` : "Hoje!") : "—"}
                  </p>
                </div>
              </div>
              {currentPhaseIndex !== null && (
                <div className={`flex items-center gap-2 bg-muted/30 rounded-lg p-3`}>
                  {phaseInfo[currentPhaseIndex].icon}
                  <div>
                    <p className={`text-sm font-semibold ${phaseInfo[currentPhaseIndex].color}`}>
                      Fase atual: {phaseInfo[currentPhaseIndex].name}
                    </p>
                    <p className="text-xs text-muted-foreground">{phaseInfo[currentPhaseIndex].desc}</p>
                  </div>
                </div>
              )}
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
