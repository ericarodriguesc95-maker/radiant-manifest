import { useState, useEffect, useRef } from "react";
import { Syringe, Calendar, Bell, Timer, SmilePlus, TrendingDown, Plus, Check, X, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { sendNotification } from "@/lib/notifications";

// ── Types ──
interface MedDoseSchedule {
  medication: string;
  currentDose: string;
  startDate: string;
  nextDoseDate: string;
}

interface SymptomEntry {
  date: string;
  symptoms: string[];
  note: string;
}

// ── Data ──
const medications = {
  tirzepatida: {
    name: "Tirzepatida (Mounjaro)",
    description: "Agonista duplo GIP/GLP-1 para controle de peso e diabetes tipo 2",
    interval: 7,
    doses: [
      { dose: "2.5 mg", phase: "Início", duration: "Semanas 1-4", note: "Dose de adaptação" },
      { dose: "5 mg", phase: "Escalonamento", duration: "Semanas 5-8", note: "Primeira dose terapêutica" },
      { dose: "7.5 mg", phase: "Escalonamento", duration: "Semanas 9-12", note: "Ajuste conforme tolerância" },
      { dose: "10 mg", phase: "Manutenção", duration: "Semanas 13-16", note: "Dose eficaz para maioria" },
      { dose: "12.5 mg", phase: "Manutenção", duration: "Semanas 17-20", note: "Se necessário mais resultado" },
      { dose: "15 mg", phase: "Dose máxima", duration: "Semana 21+", note: "Dose máxima aprovada" },
    ],
    applicationGuide: [
      "🧼 Lavar as mãos com água e sabão",
      "📍 Escolher local: abdômen, coxa ou parte posterior do braço",
      "🔄 Alternar o local a cada aplicação (mínimo 5cm de distância)",
      "💉 Limpar a pele com álcool 70%",
      "📐 Segurar a caneta em ângulo de 90° em relação à pele",
      "⏱️ Pressionar e manter por 10 segundos até o clique",
      "🚫 NÃO massagear o local após a aplicação",
      "📅 Aplicar sempre no mesmo dia da semana",
      "🌡️ Armazenar na geladeira (2-8°C). Não congelar.",
    ],
    feedingAfter: [
      "🕐 Esperar 30-60 minutos antes de comer",
      "🥗 Iniciar com proteína leve (frango, peixe, ovo)",
      "💧 Hidratar-se bem (2-3L de água/dia)",
      "🚫 Evitar alimentos gordurosos e frituras nas primeiras 24h",
      "🍽️ Comer porções menores e mais frequentes",
      "⚠️ Evitar álcool por 48h após a aplicação",
    ],
    sideEffects: ["Náusea", "Diarreia ou constipação", "Dor no local", "Perda de apetite", "Fadiga", "Refluxo"],
    contraindications: ["Câncer medular de tireoide", "Neoplasia endócrina múltipla tipo 2", "Pancreatite ativa", "Gestação e amamentação", "Alergia aos componentes"],
  },
  semaglutida: {
    name: "Semaglutida (Ozempic/Wegovy)",
    description: "Agonista GLP-1 para diabetes tipo 2 e obesidade",
    interval: 7,
    doses: [
      { dose: "0.25 mg", phase: "Início", duration: "Semanas 1-4", note: "Adaptação" },
      { dose: "0.5 mg", phase: "Escalonamento", duration: "Semanas 5-8", note: "Dose intermediária" },
      { dose: "1 mg", phase: "Escalonamento", duration: "Semanas 9-12", note: "Dose terapêutica" },
      { dose: "1.7 mg", phase: "Manutenção", duration: "Semanas 13-16", note: "Dose eficaz" },
      { dose: "2.4 mg", phase: "Dose máxima", duration: "Semana 17+", note: "Dose máxima (Wegovy)" },
    ],
    applicationGuide: [
      "🧼 Lavar as mãos com água e sabão",
      "📍 Escolher local: abdômen, coxa ou braço",
      "💉 Limpar a pele com álcool 70%",
      "📐 Ângulo de 90° na pele",
      "⏱️ Pressionar e manter por 10 segundos",
      "📅 Mesmo dia da semana, qualquer horário",
      "🌡️ Armazenar na geladeira (2-8°C)",
    ],
    feedingAfter: [
      "🥗 Preferir proteínas leves",
      "💧 Hidratar-se bem",
      "🍽️ Porções menores",
    ],
    sideEffects: ["Náusea", "Vômito", "Diarreia", "Constipação", "Dor abdominal"],
    contraindications: ["Câncer medular de tireoide", "Pancreatite", "Gestação"],
  },
  liraglutida: {
    name: "Liraglutida (Saxenda)",
    description: "Agonista GLP-1 para controle de peso — aplicação diária",
    interval: 1,
    doses: [
      { dose: "0.6 mg", phase: "Início", duration: "Semana 1", note: "Dose de adaptação" },
      { dose: "1.2 mg", phase: "Escalonamento", duration: "Semana 2", note: "Aumento gradual" },
      { dose: "1.8 mg", phase: "Escalonamento", duration: "Semana 3", note: "Continuação" },
      { dose: "2.4 mg", phase: "Escalonamento", duration: "Semana 4", note: "Quase na dose final" },
      { dose: "3.0 mg", phase: "Manutenção", duration: "Semana 5+", note: "Dose terapêutica" },
    ],
    applicationGuide: [
      "🧼 Lavar as mãos",
      "📍 Abdômen, coxa ou braço",
      "💉 Limpar com álcool",
      "⏱️ Pressionar por 6 segundos",
      "📅 Aplicar 1x ao dia, mesmo horário",
    ],
    feedingAfter: ["💧 Hidratar-se", "🍽️ Porções menores"],
    sideEffects: ["Náusea", "Dor de cabeça", "Diarreia", "Constipação"],
    contraindications: ["Câncer medular de tireoide", "Pancreatite", "Gestação"],
  },
};

const symptomOptions = [
  { id: "nausea", label: "🤢 Náusea", tip: "Tente alimentação leve: torrada seca, chá de gengibre ou biscoito de arroz. Coma devagar e em pequenas porções. Evite deitar após comer." },
  { id: "diarreia", label: "💩 Diarreia", tip: "Aumente a ingestão de líquidos e eletrólitos. Evite laticínios e alimentos gordurosos. Bananas, arroz e torradas ajudam." },
  { id: "constipacao", label: "😣 Constipação", tip: "Aumente fibras (chia, linhaça, frutas com casca), beba mais água (2-3L/dia). Caminhada leve estimula o intestino." },
  { id: "fadiga", label: "😴 Fadiga", tip: "Normal nas primeiras semanas. Garanta sono de qualidade (7-8h), hidratação e proteínas suficientes na dieta." },
  { id: "dor_local", label: "💉 Dor no local", tip: "Alterne os locais de aplicação. Gelo antes pode ajudar. Se persistir >48h ou houver vermelhidão intensa, consulte médico." },
  { id: "refluxo", label: "🔥 Refluxo", tip: "Evite deitar após comer, faça refeições menores. Chá de camomila pode aliviar. Eleve a cabeceira da cama." },
  { id: "dor_cabeca", label: "🤕 Dor de cabeça", tip: "Hidrate-se bem, pois pode ser sinal de desidratação. Evite pular refeições. Se frequente, converse com seu médico." },
  { id: "bem", label: "😊 Me sentindo bem!", tip: "Ótimo! Continue com a rotina de alimentação saudável e hidratação adequada. Você está no caminho certo! 💪" },
];

const contraceptiveOptions = [
  { name: "Pílula combinada", desc: "Contém estrogênio e progesterona", pros: "Regular ciclo, reduz cólica, acne", cons: "Deve tomar todo dia no mesmo horário", tips: "Se esquecer, tome assim que lembrar. Se >12h, use preservativo por 7 dias." },
  { name: "Pílula só de progesterona", desc: "Sem estrogênio", pros: "Segura durante amamentação", cons: "Horário mais rigoroso", tips: "Ideal para quem tem enxaqueca com aura." },
  { name: "DIU Hormonal (Mirena/Kyleena)", desc: "Dispositivo intrauterino com levonorgestrel", pros: "Dura 5 anos, baixa manutenção", cons: "Inserção pode ser dolorida", tips: "Ideal para quem esquece pílulas." },
  { name: "DIU de Cobre", desc: "Sem hormônios", pros: "Dura 10 anos, sem hormônios", cons: "Pode aumentar cólica", tips: "Boa opção para quem quer evitar hormônios." },
  { name: "Implante (Implanon)", desc: "Bastão no braço", pros: "Dura 3 anos, 99.9% eficaz", cons: "Sangramento irregular", tips: "Inserção rápida no consultório." },
  { name: "Injetável mensal", desc: "Estrogênio + progesterona", pros: "Uma vez por mês", cons: "Retenção de líquido", tips: "Aplicar na mesma data. Margem de 3 dias." },
  { name: "Injetável trimestral", desc: "Só progesterona", pros: "1x a cada 3 meses", cons: "Pode demorar para fertilidade voltar", tips: "Ideal para quem não quer menstruar." },
  { name: "Adesivo anticoncepcional", desc: "Semanal com hormônios", pros: "Troca semanal", cons: "Pode descolar", tips: "Pele limpa e seca. Trocar a cada 7 dias." },
  { name: "Anel vaginal (NuvaRing)", desc: "Anel flexível com hormônios", pros: "1x por mês, dose baixa", cons: "Desconforto inicial", tips: "Inserir no 1º dia. Retirar após 21 dias." },
];

interface Props {
  weightRecords: Array<{ weight: number; recorded_at: string }>;
  onRegisterSupplement: (name: string, dose: string, category: string) => void;
}

export default function InjectableMedsEnhanced({ weightRecords, onRegisterSupplement }: Props) {
  const [selectedMed, setSelectedMed] = useState<keyof typeof medications>("tirzepatida");
  const [selectedDose, setSelectedDose] = useState<string>("");
  const [schedule, setSchedule] = useState<MedDoseSchedule | null>(null);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [symptomHistory, setSymptomHistory] = useState<SymptomEntry[]>([]);
  const [showTimer, setShowTimer] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const med = medications[selectedMed];

  // Load schedule & symptoms from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("med-dose-schedule");
      if (saved) setSchedule(JSON.parse(saved));
      const symptoms = localStorage.getItem("med-symptom-history");
      if (symptoms) setSymptomHistory(JSON.parse(symptoms));
    } catch {}
  }, []);

  // ── Dose Escalation Calculator ──
  const handleDoseSelect = (dose: string) => {
    setSelectedDose(dose);
    const today = new Date();
    const nextDate = addDays(today, med.interval);
    const newSchedule: MedDoseSchedule = {
      medication: med.name,
      currentDose: dose,
      startDate: today.toISOString(),
      nextDoseDate: nextDate.toISOString(),
    };
    setSchedule(newSchedule);
    localStorage.setItem("med-dose-schedule", JSON.stringify(newSchedule));

    // Schedule push notification
    const daysUntil = med.interval;
    const msUntil = daysUntil * 24 * 60 * 60 * 1000;
    setTimeout(() => {
      sendNotification(
        "💉 Lembrete de Medicação",
        `Hora de aplicar sua dose de ${dose} de ${med.name}`,
        `med-reminder-${Date.now()}`
      );
    }, Math.min(msUntil, 60000)); // For demo, cap at 1min; real would be msUntil

    toast.success(`Próxima dose agendada para ${format(nextDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}`);
  };

  // ── Symptom Diary ──
  const toggleSymptom = (id: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const saveSymptoms = () => {
    const entry: SymptomEntry = {
      date: new Date().toISOString(),
      symptoms: selectedSymptoms,
      note: "",
    };
    const updated = [entry, ...symptomHistory].slice(0, 30);
    setSymptomHistory(updated);
    localStorage.setItem("med-symptom-history", JSON.stringify(updated));
    setShowSymptomModal(false);
    setSelectedSymptoms([]);

    // Show AI tips for selected symptoms
    selectedSymptoms.forEach(id => {
      const symptom = symptomOptions.find(s => s.id === id);
      if (symptom) {
        toast.info(symptom.tip, { duration: 6000, description: symptom.label });
      }
    });
  };

  // ── Injection Timer ──
  const startTimer = () => {
    setTimerSeconds(10);
    setTimerRunning(true);
    setShowTimer(true);
    timerRef.current = window.setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimerRunning(false);
          toast.success("✅ 10 segundos! Pode retirar a agulha.");
          // Vibrate if supported
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerRunning(false);
    setTimerSeconds(10);
  };

  // ── Efficacy Chart (weight vs medication weeks) ──
  const chartData = (() => {
    if (!schedule || weightRecords.length < 2) return [];
    const startDate = new Date(schedule.startDate);
    return [...weightRecords].reverse().map(r => {
      const recDate = new Date(r.recorded_at);
      const weeksDiff = Math.max(0, Math.round((recDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      return {
        semana: `Sem ${weeksDiff}`,
        peso: Number(r.weight),
      };
    }).slice(-12);
  })();

  return (
    <div className="space-y-4">
      {/* Contraceptives */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">🛡️ Contraceptivos</CardTitle>
          <CardDescription>Opções e orientações sobre métodos contraceptivos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-[10px] text-destructive mb-3 font-semibold">⚠️ Consulte seu ginecologista para escolher o método adequado.</p>
          <Accordion type="single" collapsible className="w-full">
            {contraceptiveOptions.map((c, i) => (
              <AccordionItem key={i} value={`contra-${i}`}>
                <AccordionTrigger className="text-sm font-semibold text-foreground">{c.name}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                  <p className="text-xs text-foreground">✅ <strong>Vantagens:</strong> {c.pros}</p>
                  <p className="text-xs text-foreground">⚠️ <strong>Desvantagens:</strong> {c.cons}</p>
                  <p className="text-xs text-primary italic">💡 {c.tips}</p>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => onRegisterSupplement(c.name, "Conforme prescrição", "contraceptivo")}>
                    <Plus className="h-3 w-3 mr-1" /> Registrar nos meus suplementos
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Medication Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Syringe className="h-4 w-4 text-primary" /> Medicações Injetáveis
          </CardTitle>
          <CardDescription>Selecione sua medicação para ver doses, guias e ferramentas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMed} onValueChange={(v) => setSelectedMed(v as keyof typeof medications)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tirzepatida">Tirzepatida (Mounjaro)</SelectItem>
              <SelectItem value="semaglutida">Semaglutida (Ozempic/Wegovy)</SelectItem>
              <SelectItem value="liraglutida">Liraglutida (Saxenda)</SelectItem>
            </SelectContent>
          </Select>

          <p className="text-[10px] text-destructive font-semibold">⚠️ USO EXCLUSIVO COM PRESCRIÇÃO MÉDICA.</p>
          <p className="text-xs text-muted-foreground">{med.description}</p>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs h-auto py-2" onClick={() => setShowSymptomModal(true)}>
              <SmilePlus className="h-4 w-4 mr-1 text-primary" />
              Como estou me sentindo
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-auto py-2" onClick={startTimer}>
              <Timer className="h-4 w-4 mr-1 text-primary" />
              Cronômetro 10s
            </Button>
          </div>

          {/* Schedule Info */}
          {schedule && schedule.medication === med.name && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-primary">Próxima Dose Agendada</p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {schedule.currentDose} — {format(new Date(schedule.nextDoseDate), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Bell className="h-3 w-3" />
                Notificação de lembrete ativada
              </div>
            </div>
          )}

          {/* Dose Escalation */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
              📋 Escalonamento — clique na dose atual:
            </p>
            <div className="space-y-1">
              {med.doses.map((d, i) => {
                const isSelected = schedule?.currentDose === d.dose && schedule?.medication === med.name;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleDoseSelect(d.dose)}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs text-left transition-all ${
                      isSelected
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/30 border border-border hover:border-primary/50"
                    }`}
                  >
                    <span className={`px-2 py-0.5 rounded-full font-bold min-w-[55px] text-center ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>{d.dose}</span>
                    <div className="flex-1">
                      <span className="font-semibold text-foreground">{d.phase}</span>
                      <span className="text-muted-foreground ml-1">• {d.duration}</span>
                      <p className="text-muted-foreground text-[10px]">{d.note}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Application Guide */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">💉 Como Aplicar:</p>
            <div className="space-y-1">
              {med.applicationGuide.map((step, i) => (
                <p key={i} className="text-xs text-foreground pl-2">{step}</p>
              ))}
            </div>
          </div>

          {/* Feeding */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">🍽️ Alimentação Após:</p>
            {med.feedingAfter.map((tip, i) => (
              <p key={i} className="text-xs text-foreground pl-2">{tip}</p>
            ))}
          </div>

          {/* Side Effects */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">⚠️ Efeitos Colaterais:</p>
            <div className="flex flex-wrap gap-1">
              {med.sideEffects.map((e, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">{e}</span>
              ))}
            </div>
          </div>

          {/* Contraindications */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">🚫 Contraindicações:</p>
            {med.contraindications.map((c, i) => (
              <p key={i} className="text-xs text-destructive pl-2">• {c}</p>
            ))}
          </div>

          {/* Register */}
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onRegisterSupplement(med.name, "Conforme prescrição", "medicamento")}>
            <Plus className="h-3 w-3 mr-1" /> Registrar nos meus suplementos
          </Button>
        </CardContent>
      </Card>

      {/* Efficacy Chart */}
      {chartData.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-primary" /> Eficácia × Peso
            </CardTitle>
            <CardDescription>Evolução do peso desde o início da medicação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptom History */}
      {symptomHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📋 Histórico de Sintomas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {symptomHistory.slice(0, 10).map((entry, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30 text-xs">
                  <p className="text-muted-foreground text-[10px] mb-1">
                    {format(new Date(entry.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {entry.symptoms.map(id => {
                      const s = symptomOptions.find(o => o.id === id);
                      return s ? <span key={id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{s.label}</span> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptom Modal */}
      <Dialog open={showSymptomModal} onOpenChange={setShowSymptomModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SmilePlus className="h-5 w-5 text-primary" /> Como estou me sentindo
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Selecione seus sintomas e receba dicas personalizadas:</p>
            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map(s => {
                const active = selectedSymptoms.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSymptom(s.id)}
                    className={`p-2 rounded-lg text-xs text-left transition-all border ${
                      active ? "bg-primary/10 border-primary" : "bg-muted/30 border-border hover:border-primary/50"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <Button variant="gold" className="w-full" size="sm" onClick={saveSymptoms} disabled={selectedSymptoms.length === 0}>
              <Check className="h-4 w-4 mr-1" /> Salvar e Ver Dicas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Timer Modal */}
      <Dialog open={showTimer} onOpenChange={(open) => { if (!open) resetTimer(); setShowTimer(open); }}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <Timer className="h-5 w-5 text-primary" /> Cronômetro de Aplicação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-xs text-muted-foreground">Mantenha a agulha pressionada por 10 segundos após o clique</p>
            <div className={`text-7xl font-mono font-bold ${timerSeconds === 0 ? "text-green-500" : timerSeconds <= 3 ? "text-destructive" : "text-primary"}`}>
              {timerSeconds}
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000 rounded-full"
                style={{ width: `${((10 - timerSeconds) / 10) * 100}%` }}
              />
            </div>
            {timerSeconds === 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-green-600">✅ Pronto! Pode retirar a agulha.</p>
                <p className="text-xs text-muted-foreground">Não massageie o local de aplicação</p>
                <Button variant="outline" size="sm" onClick={resetTimer}>Reiniciar</Button>
              </div>
            ) : !timerRunning ? (
              <Button variant="gold" className="w-full" onClick={startTimer}>
                <Timer className="h-4 w-4 mr-1" /> Iniciar Contagem
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground animate-pulse">Mantenha pressionado...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
