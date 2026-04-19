import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Brain, Sparkles, Clock, History, Trash2, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SleepDiagnostic {
  id: string;
  bed_time: string;
  sleep_time: string;
  wake_time: string;
  energy_morning: number;
  energy_afternoon: number;
  caffeine_alcohol: string | null;
  chronotype: string | null;
  ai_plan: string;
  created_at: string;
}

export default function SonoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState<"intro" | "form" | "loading" | "result">("intro");
  const [bedTime, setBedTime] = useState("23:00");
  const [sleepTime, setSleepTime] = useState("23:30");
  const [wakeTime, setWakeTime] = useState("07:00");
  const [energyMorning, setEnergyMorning] = useState([6]);
  const [energyAfternoon, setEnergyAfternoon] = useState([5]);
  const [caffeineAlcohol, setCaffeineAlcohol] = useState("");
  const [currentPlan, setCurrentPlan] = useState<{ plan: string; chronotype: string } | null>(null);
  const [history, setHistory] = useState<SleepDiagnostic[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { if (user) loadHistory(); }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("sleep_diagnostics")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    if (!error && data) setHistory(data);
  };

  const generatePlan = async () => {
    if (!user) return;
    setStep("loading");
    try {
      const { data, error } = await supabase.functions.invoke("sleep-regulator", {
        body: {
          bed_time: bedTime,
          sleep_time: sleepTime,
          wake_time: wakeTime,
          energy_morning: energyMorning[0],
          energy_afternoon: energyAfternoon[0],
          caffeine_alcohol: caffeineAlcohol,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { plan, chronotype } = data;
      setCurrentPlan({ plan, chronotype });

      await supabase.from("sleep_diagnostics").insert({
        user_id: user.id,
        bed_time: bedTime,
        sleep_time: sleepTime,
        wake_time: wakeTime,
        energy_morning: energyMorning[0],
        energy_afternoon: energyAfternoon[0],
        caffeine_alcohol: caffeineAlcohol || null,
        chronotype,
        ai_plan: plan,
      });

      await loadHistory();
      setStep("result");
      toast.success("Plano neuro-circadiano gerado!", { description: `Cronotipo identificado: ${chronotype}` });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao gerar plano");
      setStep("form");
    }
  };

  const deleteDiagnostic = async (id: string) => {
    const { error } = await supabase.from("sleep_diagnostics").delete().eq("id", id);
    if (error) return toast.error("Erro ao remover");
    toast.success("Diagnóstico removido");
    loadHistory();
  };

  const viewHistoryItem = (item: SleepDiagnostic) => {
    setCurrentPlan({ plan: item.ai_plan, chronotype: item.chronotype || "Intermediário" });
    setBedTime(item.bed_time);
    setSleepTime(item.sleep_time);
    setWakeTime(item.wake_time);
    setEnergyMorning([item.energy_morning]);
    setEnergyAfternoon([item.energy_afternoon]);
    setCaffeineAlcohol(item.caffeine_alcohol || "");
    setStep("result");
    setShowHistory(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-gold/20">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-foreground/80 hover:text-gold">
            <ArrowLeft className="h-5 w-5 mr-2" /> Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-gold" />
            <h1 className="font-serif text-xl text-gold">Regulador do Sono</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-foreground/80 hover:text-gold">
            <History className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* History Drawer */}
        {showHistory && (
          <Card className="border-gold/30 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2"><History className="h-5 w-5" /> Histórico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && <p className="text-sm text-muted-foreground">Nenhum diagnóstico ainda.</p>}
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-gold/10 hover:border-gold/40 transition">
                  <button className="text-left flex-1" onClick={() => viewHistoryItem(h)}>
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(h.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <p className="text-xs text-gold">{h.chronotype} • Dorme: {h.bed_time} → Acorda: {h.wake_time}</p>
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => deleteDiagnostic(h.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* INTRO */}
        {step === "intro" && (
          <Card className="border-gold/30 bg-gradient-to-br from-card to-background overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
            <CardHeader className="text-center pt-10">
              <div className="mx-auto h-16 w-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-gold" />
              </div>
              <CardTitle className="font-serif text-3xl text-gold">Regulador Inteligente do Sono</CardTitle>
              <CardDescription className="text-base text-foreground/70 max-w-xl mx-auto mt-2">
                Um neurocientista especializado em medicina do sono e ritmos circadianos
                irá analisar seu padrão atual e criar um plano personalizado de otimização cerebral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-10">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg border border-gold/20 bg-card/50 text-center">
                  <Clock className="h-5 w-5 text-gold mx-auto mb-2" />
                  <p className="text-xs text-foreground/70">4 perguntas rápidas</p>
                </div>
                <div className="p-4 rounded-lg border border-gold/20 bg-card/50 text-center">
                  <Brain className="h-5 w-5 text-gold mx-auto mb-2" />
                  <p className="text-xs text-foreground/70">Análise neurocientífica</p>
                </div>
                <div className="p-4 rounded-lg border border-gold/20 bg-card/50 text-center">
                  <Sparkles className="h-5 w-5 text-gold mx-auto mb-2" />
                  <p className="text-xs text-foreground/70">Plano personalizado</p>
                </div>
              </div>
              <Button onClick={() => setStep("form")} className="w-full bg-gold text-background hover:bg-gold/90 h-12 text-base font-semibold">
                Iniciar Diagnóstico Circadiano
              </Button>
            </CardContent>
          </Card>
        )}

        {/* FORM */}
        {step === "form" && (
          <Card className="border-gold/30 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gold font-serif text-2xl">Diagnóstico Circadiano</CardTitle>
              <CardDescription>Responda com sinceridade — esses dados alimentam seu plano.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">1. Vai para a cama às</Label>
                  <Input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className="bg-background border-gold/30" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Pega no sono efetivamente às</Label>
                  <Input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="bg-background border-gold/30" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">2. Acorda às (com ou sem despertador)</Label>
                <Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="bg-background border-gold/30" />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">3. Energia & foco 2h após acordar: <span className="text-gold font-bold">{energyMorning[0]}/10</span></Label>
                <Slider value={energyMorning} onValueChange={setEnergyMorning} min={1} max={10} step={1} />
              </div>

              <div className="space-y-3">
                <Label className="text-foreground">Energia & foco no meio da tarde: <span className="text-gold font-bold">{energyAfternoon[0]}/10</span></Label>
                <Slider value={energyAfternoon} onValueChange={setEnergyAfternoon} min={1} max={10} step={1} />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">4. Cafeína / álcool — horário do último consumo</Label>
                <Textarea
                  value={caffeineAlcohol}
                  onChange={(e) => setCaffeineAlcohol(e.target.value)}
                  placeholder="Ex: Café último às 16h, vinho aos finais de semana às 21h"
                  className="bg-background border-gold/30 min-h-[80px]"
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("intro")} className="flex-1 border-gold/30">Voltar</Button>
                <Button onClick={generatePlan} className="flex-1 bg-gold text-background hover:bg-gold/90 font-semibold">
                  Gerar Meu Plano <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* LOADING */}
        {step === "loading" && (
          <Card className="border-gold/30 bg-card/60 backdrop-blur">
            <CardContent className="py-16 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-gold mx-auto animate-spin" />
              <h3 className="font-serif text-xl text-gold">Analisando seu ritmo circadiano...</h3>
              <p className="text-sm text-foreground/70 max-w-md mx-auto">
                O neurocientista está calculando sua eficiência do sono, cronotipo e construindo um plano personalizado de otimização cerebral.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RESULT */}
        {step === "result" && currentPlan && (
          <>
            <Card className="border-gold/30 bg-gradient-to-br from-card to-background">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-gold font-serif text-2xl flex items-center gap-2">
                    <Brain className="h-6 w-6" /> Seu Plano Neuro-Circadiano
                  </CardTitle>
                  <span className="text-xs px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold font-medium">
                    Cronotipo: {currentPlan.chronotype}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm sm:prose-base max-w-none
                  prose-headings:text-gold prose-headings:font-serif
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gold/20 prose-h2:pb-2
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:text-gold/90
                  prose-p:text-foreground/90 prose-p:leading-relaxed
                  prose-strong:text-gold prose-strong:font-semibold
                  prose-ul:text-foreground/90 prose-li:my-1
                  prose-table:border prose-table:border-gold/20
                  prose-th:bg-gold/10 prose-th:text-gold prose-th:border-gold/20
                  prose-td:border-gold/10 prose-td:text-foreground/90">
                  <ReactMarkdown>{currentPlan.plan}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => { setStep("form"); setCurrentPlan(null); }} className="flex-1 border-gold/30">
                Refazer Diagnóstico
              </Button>
              <Button onClick={() => setStep("intro")} className="flex-1 bg-gold text-background hover:bg-gold/90 font-semibold">
                Concluir
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
