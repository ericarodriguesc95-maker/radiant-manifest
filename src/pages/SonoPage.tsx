import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Brain, Sparkles, Clock, History, Trash2, Loader2, Send, MessageCircle, Calendar, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";
import { PlanSections } from "@/components/sono/PlanSections";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, ReferenceLine } from "recharts";
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

interface ChatMsg { role: "user" | "assistant"; content: string }

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
  const [currentDiagnostic, setCurrentDiagnostic] = useState<SleepDiagnostic | null>(null);
  const [history, setHistory] = useState<SleepDiagnostic[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user) loadHistory(); }, [user]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);

  // Load most recent plan automatically when arriving with no current selection
  useEffect(() => {
    if (history.length > 0 && step === "intro" && !currentDiagnostic) {
      // Don't auto-jump, but make it available in history. User can choose.
    }
  }, [history, step, currentDiagnostic]);

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

      const { data: inserted, error: insertError } = await supabase
        .from("sleep_diagnostics")
        .insert({
          user_id: user.id,
          bed_time: bedTime,
          sleep_time: sleepTime,
          wake_time: wakeTime,
          energy_morning: energyMorning[0],
          energy_afternoon: energyAfternoon[0],
          caffeine_alcohol: caffeineAlcohol || null,
          chronotype,
          ai_plan: plan,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCurrentDiagnostic(inserted as SleepDiagnostic);
      setChatMessages([]);
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
    if (currentDiagnostic?.id === id) {
      setCurrentDiagnostic(null);
      setStep("intro");
    }
    loadHistory();
  };

  const viewHistoryItem = (item: SleepDiagnostic) => {
    setCurrentDiagnostic(item);
    setBedTime(item.bed_time);
    setSleepTime(item.sleep_time);
    setWakeTime(item.wake_time);
    setEnergyMorning([item.energy_morning]);
    setEnergyAfternoon([item.energy_afternoon]);
    setCaffeineAlcohol(item.caffeine_alcohol || "");
    setChatMessages([]);
    setStep("result");
    setShowHistory(false);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentDiagnostic || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput.trim() };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInput("");
    setChatLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sleep-chat", {
        body: {
          messages: newMessages,
          plan_context: currentDiagnostic.ai_plan,
          chronotype: currentDiagnostic.chronotype,
          diagnostic: {
            bed_time: currentDiagnostic.bed_time,
            sleep_time: currentDiagnostic.sleep_time,
            wake_time: currentDiagnostic.wake_time,
            energy_morning: currentDiagnostic.energy_morning,
            energy_afternoon: currentDiagnostic.energy_afternoon,
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro no chat");
      setChatMessages(chatMessages); // rollback
    } finally {
      setChatLoading(false);
    }
  };

  const suggestedQuestions = [
    "Por que devo evitar luz azul à noite?",
    "Como melhorar minha eficiência do sono?",
    "O que é jetlag social?",
    "Como o café afeta meu sono?",
  ];

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
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)} className="text-foreground/80 hover:text-gold relative">
            <History className="h-5 w-5" />
            {history.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-background text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {history.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* History Drawer */}
        {showHistory && (
          <Card className="border-gold/30 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-gold flex items-center gap-2 text-lg">
                <History className="h-5 w-5" /> Sua Evolução ({history.length})
              </CardTitle>
              <CardDescription>Acompanhe seus diagnósticos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.length === 0 && <p className="text-sm text-muted-foreground">Nenhum diagnóstico ainda.</p>}
              {history.map((h, idx) => (
                <div key={h.id} className={`flex items-center justify-between p-3 rounded-lg border transition ${currentDiagnostic?.id === h.id ? "border-gold bg-gold/5" : "border-gold/10 hover:border-gold/40"}`}>
                  <button className="text-left flex-1" onClick={() => viewHistoryItem(h)}>
                    <div className="flex items-center gap-2 mb-1">
                      {idx === 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold text-background font-bold">MAIS RECENTE</span>}
                      <p className="text-sm font-semibold text-foreground">
                        {format(new Date(h.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-xs text-foreground/60">
                      {format(new Date(h.created_at), "HH:mm", { locale: ptBR })} • {h.chronotype} • Energia manhã: {h.energy_morning}/10
                    </p>
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
          <>
            <Card className="border-gold/30 bg-gradient-to-br from-card to-background overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent pointer-events-none" />
              <CardHeader className="text-center pt-10">
                <div className="mx-auto h-16 w-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-gold" />
                </div>
                <CardTitle className="font-serif text-3xl text-gold">Regulador Inteligente do Sono</CardTitle>
                <CardDescription className="text-base text-foreground/70 max-w-xl mx-auto mt-2">
                  Uma neurocientista especializada em medicina do sono e ritmos circadianos
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
                    <MessageCircle className="h-5 w-5 text-gold mx-auto mb-2" />
                    <p className="text-xs text-foreground/70">Chat com especialista</p>
                  </div>
                </div>
                <Button onClick={() => setStep("form")} className="w-full bg-gold text-background hover:bg-gold/90 h-12 text-base font-semibold">
                  {history.length > 0 ? "Fazer Novo Diagnóstico" : "Iniciar Diagnóstico Circadiano"}
                </Button>
                {history.length > 0 && (
                  <Button variant="outline" onClick={() => viewHistoryItem(history[0])} className="w-full border-gold/30 text-gold hover:bg-gold/10">
                    <Calendar className="mr-2 h-4 w-4" /> Ver Último Plano ({format(new Date(history[0].created_at), "dd/MM", { locale: ptBR })})
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Quick history preview */}
            {history.length > 1 && (() => {
              const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
              const diffMin = (s: string, e: string) => { let d = toMin(e) - toMin(s); if (d <= 0) d += 1440; return d; };
              const chartData = [...history].reverse().map((h, i) => {
                const tst = diffMin(h.sleep_time, h.wake_time);
                const tib = diffMin(h.bed_time, h.wake_time);
                const eff = tib > 0 ? Math.round((tst / tib) * 100) : 0;
                return { idx: i + 1, eff, date: format(new Date(h.created_at), "dd/MM", { locale: ptBR }) };
              });
              const avg = Math.round(chartData.reduce((s, d) => s + d.eff, 0) / chartData.length);
              const last = chartData[chartData.length - 1].eff;
              const trend = last - chartData[0].eff;
              return (
              <Card className="border-gold/20 bg-card/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gold flex items-center gap-2">
                    <Sparkles className="h-4 w-4" /> Sua Evolução
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-foreground/60">
                    Você já fez <span className="text-gold font-bold">{history.length} diagnósticos</span>.
                    Acompanhe a evolução da sua eficiência do sono.
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-card/60 border border-gold/15 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-gold/70">Atual</p>
                      <p className="text-base font-bold text-foreground">{last}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-card/60 border border-gold/15 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-gold/70">Média</p>
                      <p className="text-base font-bold text-foreground">{avg}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-card/60 border border-gold/15 text-center">
                      <p className="text-[9px] uppercase tracking-wider text-gold/70">Tendência</p>
                      <p className={`text-base font-bold ${trend > 0 ? "text-emerald-400" : trend < 0 ? "text-red-400" : "text-foreground"}`}>
                        {trend > 0 ? "+" : ""}{trend}%
                      </p>
                    </div>
                  </div>

                  <div className="h-32 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <XAxis dataKey="date" stroke="hsl(var(--foreground) / 0.4)" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} stroke="hsl(var(--foreground) / 0.4)" fontSize={9} tickLine={false} axisLine={false} width={28} ticks={[0, 50, 85, 100]} />
                        <ReferenceLine y={85} stroke="hsl(var(--gold) / 0.4)" strokeDasharray="3 3" />
                        <RTooltip
                          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--gold) / 0.3)", borderRadius: 8, fontSize: 11 }}
                          labelStyle={{ color: "hsl(var(--gold))" }}
                          formatter={(v: any) => [`${v}%`, "Eficiência"]}
                        />
                        <Line type="monotone" dataKey="eff" stroke="hsl(var(--gold))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--gold))" }} activeDot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)} className="text-gold hover:bg-gold/10 p-0 h-auto">
                    Ver histórico completo →
                  </Button>
                </CardContent>
              </Card>
              );
            })()}
          </>
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
                A neurocientista está calculando sua eficiência do sono, cronotipo e construindo um plano personalizado de otimização cerebral.
              </p>
            </CardContent>
          </Card>
        )}

        {/* RESULT */}
        {step === "result" && currentDiagnostic && (() => {
          const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
          const diffMin = (start: string, end: string) => { let d = toMin(end) - toMin(start); if (d <= 0) d += 24 * 60; return d; };
          const tst = diffMin(currentDiagnostic.sleep_time, currentDiagnostic.wake_time);
          const tib = diffMin(currentDiagnostic.bed_time, currentDiagnostic.wake_time);
          const efficiency = tib > 0 ? Math.round((tst / tib) * 100) : 0;
          const effColor = efficiency >= 85 ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10" : efficiency >= 70 ? "text-amber-400 border-amber-400/40 bg-amber-400/10" : "text-red-400 border-red-400/40 bg-red-400/10";
          const effLabel = efficiency >= 85 ? "Excelente" : efficiency >= 70 ? "Razoável" : "Baixa";
          const effDot = efficiency >= 85 ? "bg-emerald-400" : efficiency >= 70 ? "bg-amber-400" : "bg-red-400";
          return (
          <>
            {/* Hero header card */}
            <div className="relative rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-card via-background to-card">
              <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gold/5 blur-2xl pointer-events-none" />

              <div className="relative p-6 sm:p-8">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gold/10 border border-gold/30 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-medium mb-1">Plano Personalizado</p>
                      <h2 className="font-serif text-2xl sm:text-3xl text-gold leading-tight">Seu Plano Neuro-Circadiano</h2>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-full bg-gold text-background font-bold shadow-gold">
                    {currentDiagnostic.chronotype}
                  </span>
                </div>

                {/* Sleep Efficiency Highlight */}
                <div className={`mb-4 p-4 rounded-xl border-2 ${effColor} backdrop-blur flex items-center justify-between gap-4 flex-wrap`}>
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${effDot} opacity-60`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${effDot}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[10px] uppercase tracking-[0.25em] opacity-80 font-medium">Eficiência do Sono</p>
                        <TooltipProvider delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" aria-label="O que é TST e TIB?" className="opacity-70 hover:opacity-100 transition-opacity">
                                <Info className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={8} className="z-[100] max-w-xs bg-card border border-gold/40 text-foreground shadow-2xl shadow-black/60">
                              <p className="text-[11px] leading-relaxed">
                                <strong className="text-gold">TST</strong> (Total Sleep Time): tempo real dormindo, da hora em que você pega no sono até acordar.
                              </p>
                              <p className="text-[11px] leading-relaxed mt-1.5">
                                <strong className="text-gold">TIB</strong> (Time In Bed): tempo total na cama, desde que se deita até levantar.
                              </p>
                              <p className="text-[11px] leading-relaxed mt-1.5 text-foreground/70">
                                Eficiência ideal: ≥ 85% (Excelente) · 70–84% (Razoável) · &lt; 70% (Baixa).
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <p className="text-[11px] opacity-70">TST {Math.floor(tst/60)}h{(tst%60).toString().padStart(2,"0")} / TIB {Math.floor(tib/60)}h{(tib%60).toString().padStart(2,"0")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-3xl sm:text-4xl font-bold leading-none">{efficiency}<span className="text-lg">%</span></p>
                    <p className="text-[10px] uppercase tracking-wider font-bold mt-1">{effLabel}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <div className="p-3 rounded-xl bg-card/60 border border-gold/15 backdrop-blur">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                      <Calendar className="h-3 w-3" /> Gerado em
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {format(new Date(currentDiagnostic.created_at), "dd MMM yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-[10px] text-foreground/50">
                      {format(new Date(currentDiagnostic.created_at), "HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-card/60 border border-gold/15 backdrop-blur">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                      <Moon className="h-3 w-3" /> Dorme
                    </div>
                    <p className="text-sm font-semibold text-foreground">{currentDiagnostic.bed_time}</p>
                    <p className="text-[10px] text-foreground/50">Cama</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card/60 border border-gold/15 backdrop-blur">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                      <Sparkles className="h-3 w-3" /> Acorda
                    </div>
                    <p className="text-sm font-semibold text-foreground">{currentDiagnostic.wake_time}</p>
                    <p className="text-[10px] text-foreground/50">Despertar</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card/60 border border-gold/15 backdrop-blur">
                    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold/70 mb-1">
                      <Brain className="h-3 w-3" /> Energia
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {currentDiagnostic.energy_morning}/{currentDiagnostic.energy_afternoon}
                    </p>
                    <p className="text-[10px] text-foreground/50">Manhã/Tarde</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan content split into themed sections */}
            <PlanSections plan={currentDiagnostic.ai_plan} />

            {/* AI CHAT — Specialist follow-up */}
            <Card className="border-gold/30 bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-gold font-serif text-xl flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" /> Tire suas dúvidas com a Especialista
                </CardTitle>
                <CardDescription>
                  Converse com a neurocientista do sono sobre seu plano. Ela conhece seus dados e pode aprofundar qualquer ponto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Suggested questions (only if no chat yet) */}
                {chatMessages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-foreground/60 uppercase tracking-wide">Sugestões para começar:</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => setChatInput(q)}
                          className="text-left text-xs p-3 rounded-lg border border-gold/20 bg-card/40 hover:border-gold/50 hover:bg-gold/5 transition text-foreground/80"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat messages */}
                {chatMessages.length > 0 && (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                          msg.role === "user"
                            ? "bg-gold text-background"
                            : "bg-card border border-gold/20 text-foreground/90"
                        }`}>
                          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-strong:text-gold prose-ul:my-1">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-card border border-gold/20 rounded-2xl px-4 py-2.5">
                          <Loader2 className="h-4 w-4 text-gold animate-spin" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}

                {/* Chat input */}
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); } }}
                    placeholder="Pergunte sobre seu plano..."
                    disabled={chatLoading}
                    className="bg-background border-gold/30"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-gold text-background hover:bg-gold/90"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => { setStep("form"); setCurrentDiagnostic(null); setChatMessages([]); }} className="flex-1 border-gold/30">
                Refazer Diagnóstico
              </Button>
              <Button onClick={() => setShowHistory(true)} variant="outline" className="flex-1 border-gold/30 text-gold">
                <History className="mr-2 h-4 w-4" /> Ver Evolução
              </Button>
              <Button onClick={() => setStep("intro")} className="flex-1 bg-gold text-background hover:bg-gold/90 font-semibold">
                Concluir
              </Button>
            </div>
          </>
          );
        })()}
      </div>
    </div>
  );
}
