import { useState, useEffect, useRef } from "react";
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Brain,
  Sparkles,
  ArrowLeft,
  CalendarDays,
  ScrollText,
  MapPin,
  Heart,
  PenLine,
  Clock,
  Languages,
  Save,
  
  RotateCcw,
} from "lucide-react";
import biblicalJourneyMap from "@/assets/biblical-journey-map.jpg";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { bibleReadingPlan } from "@/components/bible/bibleReadingPlan";
import {
  getDayEnrichment,
  BIBLE_VERSIONS,
  type BibleVersion,
} from "@/components/bible/bibleJourneyEnrichment";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import BibleHistoryCalendar from "@/components/bible/BibleHistoryCalendar";
import { cn } from "@/lib/utils";

const Biblia365Page = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [version, setVersion] = useState<BibleVersion>("NVI");
  const [loading, setLoading] = useState(true);
  const [showSparkles, setShowSparkles] = useState(false);

  // Diary
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Section refs for tab quick-jump
  const palavraRef = useRef<HTMLDivElement>(null);
  const menteRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<HTMLDivElement>(null);
  const coracaoRef = useRef<HTMLDivElement>(null);
  const diarioRef = useRef<HTMLDivElement>(null);

  const currentDay = startDate
    ? Math.min(
        Math.max(
          1,
          Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1
        ),
        365
      )
    : 1;

  const [selectedDay, setSelectedDay] = useState(currentDay);

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user]);

  useEffect(() => {
    if (startDate) setSelectedDay(currentDay);
  }, [startDate]);

  useEffect(() => {
    if (user) loadDayNote(selectedDay);
  }, [selectedDay, user]);

  const loadProgress = async () => {
    const { data } = await supabase
      .from("bible_reading_progress" as any)
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setStartDate((data as any).start_date);
      setCompletedDays((data as any).completed_days || []);
      if ((data as any).preferred_version) {
        setVersion((data as any).preferred_version as BibleVersion);
      }
    }
    setLoading(false);
  };

  const loadDayNote = async (day: number) => {
    const { data } = await supabase
      .from("bible_journey_notes" as any)
      .select("content")
      .eq("user_id", user!.id)
      .eq("day", day)
      .maybeSingle();
    setNoteContent((data as any)?.content || "");
  };

  const handleStart = async () => {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("bible_reading_progress" as any).insert({
      user_id: user!.id,
      start_date: today,
      completed_days: [],
      preferred_version: version,
    } as any);
    setStartDate(today);
    setCompletedDays([]);
  };

  const handleVersionChange = async (newVersion: BibleVersion) => {
    setVersion(newVersion);
    if (user && startDate) {
      await supabase
        .from("bible_reading_progress" as any)
        .update({ preferred_version: newVersion } as any)
        .eq("user_id", user.id);
    }
  };

  const toggleDay = async (day: number) => {
    let updated: number[];
    const wasCompleted = completedDays.includes(day);
    if (wasCompleted) {
      updated = completedDays.filter((d) => d !== day);
    } else {
      updated = [...completedDays, day].sort((a, b) => a - b);
      // Sparkles celebration
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1400);
    }
    setCompletedDays(updated);
    await supabase
      .from("bible_reading_progress" as any)
      .update({
        completed_days: updated,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("user_id", user!.id);
  };

  const handleSaveNote = async () => {
    if (!user) return;
    setSavingNote(true);
    const { error } = await supabase.from("bible_journey_notes" as any).upsert(
      {
        user_id: user.id,
        day: selectedDay,
        content: noteContent,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: "user_id,day" }
    );
    setSavingNote(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Anotações salvas ✨", description: "Sua jornada foi registrada." });
    }
  };

  const handleRestart = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];
    const { error } = await supabase
      .from("bible_reading_progress" as any)
      .update({
        start_date: today,
        completed_days: [],
        updated_at: new Date().toISOString(),
      } as any)
      .eq("user_id", user.id);
    if (error) {
      toast({
        title: "Erro ao reiniciar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    setStartDate(today);
    setCompletedDays([]);
    setSelectedDay(1);
    toast({
      title: "Jornada reiniciada ✨",
      description: "Você está de volta ao Dia 1. Um novo começo te espera.",
    });
  };

  const reading = bibleReadingPlan[selectedDay - 1];
  const enrichment = reading
    ? getDayEnrichment(selectedDay, reading)
    : null;
  const percentage = Math.round((completedDays.length / 365) * 100);
  const isDayCompleted = completedDays.includes(selectedDay);

  // Choose text by version (fallback: base text)
  const versionText =
    enrichment?.versions?.[version] || reading?.text || "";

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 text-gold animate-pulse" />
      </div>
    );
  }

  // Onboarding screen with version picker
  if (!startDate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/20 via-transparent to-transparent animate-pulse" />
          <Compass className="h-10 w-10 text-gold relative z-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Bíblia em 365
          </h1>
          <p className="text-xs font-body tracking-[0.3em] uppercase text-gold/70">
            Jornada Identidade & Mente
          </p>
        </div>
        <p className="text-sm text-muted-foreground max-w-xs font-body">
          Leia a Bíblia inteira em um ano com contexto histórico, neurociência,
          devocional e diário pessoal — tudo em um só lugar.
        </p>

        <div className="w-full max-w-xs space-y-2">
          <label className="text-[10px] font-body tracking-widest uppercase text-gold/60">
            Escolha sua tradução
          </label>
          <Select value={version} onValueChange={(v) => setVersion(v as BibleVersion)}>
            <SelectTrigger className="rounded-xl bg-muted/30 border-gold/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BIBLE_VERSIONS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  <span className="font-body">
                    <strong className="text-gold">{v.label}</strong>{" "}
                    <span className="text-muted-foreground text-xs">— {v.full}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button variant="gold" size="lg" onClick={handleStart} className="rounded-2xl">
          Iniciar Minha Jornada
        </Button>
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-muted-foreground hover:text-gold transition-colors font-body"
        >
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 relative">
      {/* Golden sparkles celebration overlay */}
      {showSparkles && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {Array.from({ length: 18 }).map((_, i) => (
            <Sparkles
              key={i}
              className="absolute text-gold animate-ping"
              style={{
                left: `${50 + (Math.random() - 0.5) * 60}%`,
                top: `${50 + (Math.random() - 0.5) * 60}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: "1.2s",
                width: `${16 + Math.random() * 16}px`,
                height: `${16 + Math.random() * 16}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-8 pb-4 space-y-4 sticky top-0 bg-background/95 backdrop-blur-xl z-30 border-b border-gold/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-muted/30 transition-all"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-display font-bold text-foreground flex items-center gap-2 truncate">
              <Compass className="h-5 w-5 text-gold flex-shrink-0 animate-[spin_8s_linear_infinite]" />
              <span className="truncate">
                Dia {selectedDay}: {reading?.title}
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5 truncate">
              {reading?.passages} • {version}
            </p>
          </div>
          <Select value={version} onValueChange={(v) => handleVersionChange(v as BibleVersion)}>
            <SelectTrigger className="w-[72px] h-8 rounded-lg bg-muted/30 border-gold/20 text-xs font-body">
              <Languages className="h-3 w-3 text-gold mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {BIBLE_VERSIONS.map((v) => (
                <SelectItem key={v.value} value={v.value}>
                  <span className="text-xs">
                    <strong>{v.label}</strong>{" "}
                    <span className="text-muted-foreground">— {v.full}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Year progress */}
        <div className="space-y-1.5">
          <Progress
            value={percentage}
            className="h-2 bg-muted/30 [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:via-amber-300 [&>div]:to-gold"
          />
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-body">
            <span>{completedDays.length} de 365 leituras</span>
            <div className="flex items-center gap-2">
              <span className="text-gold font-semibold">{percentage}% do ano</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40 hover:bg-coral/10 hover:text-coral border border-gold/10 hover:border-coral/30 transition-all text-[10px] font-body"
                    aria-label="Reiniciar jornada do Dia 1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reiniciar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-background border-gold/20">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display text-foreground flex items-center gap-2">
                      <RotateCcw className="h-5 w-5 text-coral" />
                      Reiniciar do Dia 1?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body text-muted-foreground leading-relaxed">
                      Sua jornada será zerada: todas as <strong className="text-foreground">{completedDays.length} leituras concluídas</strong> serão apagadas e você voltará ao <strong className="text-gold">Dia 1</strong>, com data de início hoje.
                      <br /><br />
                      Suas anotações no diário serão preservadas. Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRestart}
                      className="rounded-xl bg-coral text-background hover:bg-coral/90"
                    >
                      Sim, reiniciar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Quick section tabs */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1 pb-1">
          {[
            { icon: ScrollText, label: "Palavra", ref: palavraRef, color: "text-gold" },
            { icon: Brain, label: "Mente", ref: menteRef, color: "text-blue-400" },
            { icon: MapPin, label: "História", ref: mapaRef, color: "text-olive" },
            { icon: Heart, label: "Prática", ref: coracaoRef, color: "text-coral" },
            { icon: PenLine, label: "Notas", ref: diarioRef, color: "text-gold" },
          ].map(({ icon: Icon, label, ref, color }) => (
            <button
              key={label}
              onClick={() => scrollToSection(ref)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 hover:bg-muted/50 border border-gold/10 transition-all"
            >
              <Icon className={cn("h-3 w-3", color)} />
              <span className="text-[10px] font-body font-semibold text-foreground/80 uppercase tracking-wider">
                {label}
              </span>
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 pt-4">
        <Tabs defaultValue="leitura" className="w-full">
          <TabsList className="w-full bg-muted/30 rounded-2xl p-1 mb-4">
            <TabsTrigger
              value="leitura"
              className="flex-1 rounded-xl text-xs font-body data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
            >
              <Compass className="h-3.5 w-3.5 mr-1.5" />
              Leitura do Dia
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="flex-1 rounded-xl text-xs font-body data-[state=active]:bg-gold/20 data-[state=active]:text-gold"
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Histórico
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leitura" className="space-y-5 mt-0">
            {/* Day navigator */}
            <div className="flex items-center justify-between glass rounded-2xl p-3 border border-gold/10">
              <button
                onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
                disabled={selectedDay <= 1}
                className="p-2 rounded-lg hover:bg-muted/30 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="text-center flex-1">
                <p className="text-[10px] font-body tracking-widest uppercase text-gold/70">
                  Dia {selectedDay} / 365
                </p>
                <p className="text-sm font-display font-bold text-foreground mt-0.5">
                  {reading?.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedDay((d) => Math.min(currentDay, d + 1))}
                disabled={selectedDay >= currentDay}
                className="p-2 rounded-lg hover:bg-muted/30 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {/* A. PALAVRA */}
            <div ref={palavraRef} className="glass rounded-2xl p-5 border border-gold/15 space-y-4 scroll-mt-44">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold/15 flex items-center justify-center border border-gold/20">
                  <ScrollText className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-gold">
                    A Palavra
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body">
                    {reading?.passages} • Versão {version}
                  </p>
                </div>
              </div>
              <p className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-line">
                {versionText}
              </p>

              {/* Historical context */}
              {enrichment && (
                <div className="mt-4 pt-4 border-t border-gold/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-olive" />
                    <h4 className="text-[10px] font-body font-semibold tracking-widest uppercase text-olive">
                      Contexto & Cronologia
                    </h4>
                  </div>
                  <p className="text-xs font-body text-foreground/75 leading-relaxed">
                    {enrichment.contextoHistorico}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[10px] font-body px-2 py-1 rounded-full bg-olive/10 text-olive border border-olive/20">
                      📅 {enrichment.periodo}
                    </span>
                    <span className="text-[10px] font-body px-2 py-1 rounded-full bg-olive/10 text-olive border border-olive/20">
                      📍 {enrichment.regiao}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* B. MENTE REVELADA */}
            <div ref={menteRef} className="glass rounded-2xl p-5 border border-blue-400/20 bg-blue-500/[0.03] space-y-3 scroll-mt-44">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center border border-blue-400/30">
                  <Brain className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-blue-400">
                    Mente Revelada
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body">
                    Neurociência aplicada
                  </p>
                </div>
              </div>
              <p className="text-sm font-body text-foreground/85 leading-relaxed">
                {reading?.neuroscience}
              </p>
            </div>

            {/* C. MAPEANDO A JORNADA */}
            {enrichment && (
              <div ref={mapaRef} className="glass rounded-2xl p-5 border border-olive/25 bg-olive/[0.03] space-y-4 scroll-mt-44">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-olive/15 flex items-center justify-center border border-olive/30">
                    <MapPin className="h-4 w-4 text-olive" />
                  </div>
                  <div>
                    <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-olive">
                      Mapeando a Jornada
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-body">
                      Mapa mental & geográfico
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-olive/20 bg-muted/30">
                  <img
                    src={biblicalJourneyMap}
                    alt={`Mapa da jornada bíblica — ${enrichment.regiao}`}
                    loading="lazy"
                    width={1280}
                    height={736}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] font-body text-foreground/90 flex items-center gap-1.5 backdrop-blur-sm bg-background/40 rounded-md px-2 py-1 w-fit border border-olive/20">
                      <MapPin className="h-3 w-3 text-olive" />
                      {enrichment.regiao}
                    </p>
                  </div>
                </div>

                {/* Mental map flow */}
                <div className="space-y-2">
                  <p className="text-[10px] font-body tracking-widest uppercase text-olive/70 font-semibold">
                    Fluxo da passagem
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {enrichment.jornadaMental.map((step, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="text-[11px] font-body px-2.5 py-1 rounded-lg bg-olive/10 text-foreground/85 border border-olive/20">
                          {step}
                        </span>
                        {i < enrichment.jornadaMental.length - 1 && (
                          <ChevronRight className="h-3 w-3 text-olive/50" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* D. CORAÇÃO E PRÁTICA */}
            {enrichment && (
              <div ref={coracaoRef} className="glass rounded-2xl p-5 border border-coral/25 bg-coral/[0.03] space-y-4 scroll-mt-44">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-coral/15 flex items-center justify-center border border-coral/30">
                    <Heart className="h-4 w-4 text-coral" />
                  </div>
                  <div>
                    <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-coral">
                      Coração & Prática
                    </h3>
                    <p className="text-[10px] text-muted-foreground font-body">
                      Devocional · Identidade Inabalável
                    </p>
                  </div>
                </div>

                <p className="text-sm font-body text-foreground/90 leading-relaxed italic">
                  {enrichment.devocional}
                </p>

                {/* Activation questions */}
                <div className="space-y-2 pt-2 border-t border-coral/10">
                  <p className="text-[10px] font-body tracking-widest uppercase text-coral/80 font-semibold">
                    ✨ Perguntas de Ativação
                  </p>
                  <ol className="space-y-2.5">
                    {enrichment.perguntas.map((p, i) => (
                      <li key={i} className="flex gap-2.5">
                        <span className="text-coral font-display font-bold text-sm flex-shrink-0">
                          {i + 1}.
                        </span>
                        <p className="text-xs font-body text-foreground/80 leading-relaxed">
                          {p}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* E. DIÁRIO */}
            <div ref={diarioRef} className="glass rounded-2xl p-5 border border-gold/15 space-y-3 scroll-mt-44">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gold/15 flex items-center justify-center border border-gold/20">
                  <PenLine className="h-4 w-4 text-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-gold">
                    Meu Diário da Jornada
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-body">
                    Anotações, orações e insights do Dia {selectedDay}
                  </p>
                </div>
              </div>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="O que Deus está falando comigo hoje? Quais insights, orações ou decisões nascem desta leitura..."
                className="min-h-[140px] bg-muted/20 border-gold/15 rounded-xl text-sm font-body text-foreground/90 leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-gold/30"
              />
              <Button
                onClick={handleSaveNote}
                disabled={savingNote}
                variant="gold"
                className="w-full rounded-xl"
              >
                <Save className="h-4 w-4 mr-2" />
                {savingNote ? "Salvando..." : "Salvar Notas"}
              </Button>
            </div>

            {/* Mark as read — final action */}
            <button
              onClick={() => toggleDay(selectedDay)}
              className={cn(
                "w-full flex items-center justify-center gap-3 rounded-2xl p-5 font-body font-semibold text-sm transition-all border-2 relative overflow-hidden",
                isDayCompleted
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
                  : "bg-gradient-to-r from-gold/15 via-amber-300/20 to-gold/15 text-gold border-gold/40 hover:from-gold/25 hover:to-gold/25 shadow-lg shadow-gold/10"
              )}
            >
              {isDayCompleted ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Leitura do Dia {selectedDay} Concluída ✓
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Marcar Dia {selectedDay} como Lido
                </>
              )}
            </button>

            {/* Recent days strip */}
            <div className="space-y-2">
              <p className="text-[10px] font-body tracking-widest uppercase text-gold/60 font-semibold">
                Saltar para outro dia
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {Array.from(
                  { length: Math.min(currentDay, 21) },
                  (_, i) => currentDay - i
                ).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center text-xs font-body font-semibold transition-all border",
                      d === selectedDay
                        ? "bg-gold/20 text-gold border-gold/40"
                        : completedDays.includes(d)
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-muted/20 text-muted-foreground border-transparent hover:border-gold/20"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="historico" className="mt-0">
            <BibleHistoryCalendar
              startDate={startDate}
              completedDays={completedDays}
              currentDay={currentDay}
              onSelectDay={(day) => setSelectedDay(day)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom navigation: Anterior / Próximo */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-gold/15 px-4 py-4 pb-24">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
          {/* Botão Anterior */}
          <button
            onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
            disabled={selectedDay <= 1}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-body font-semibold text-foreground/90 bg-muted/40 hover:bg-muted/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-gold/10"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Dia {Math.max(1, selectedDay - 1)}</span>
            <span className="sm:hidden">Anterior</span>
          </button>
          
          {/* Dia Atual Badge */}
          <div className="flex-shrink-0 flex flex-col items-center px-4">
            <span className="text-[10px] font-body tracking-widest uppercase text-gold/60">Dia Atual</span>
            <span className="text-lg font-display font-bold text-gold">{selectedDay}</span>
          </div>
          
          {/* Botão Próximo */}
          <button
            onClick={() => setSelectedDay((d) => Math.min(currentDay, d + 1))}
            disabled={selectedDay >= currentDay}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-body font-semibold bg-gold text-background hover:bg-gold/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-gold/20"
          >
            <span className="hidden sm:inline">Dia {Math.min(currentDay, selectedDay + 1)}</span>
            <span className="sm:hidden">Próximo</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Biblia365Page;
