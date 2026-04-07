import { useState, useEffect } from "react";
import { BookOpen, ChevronLeft, ChevronRight, CheckCircle2, Circle, Brain, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { bibleReadingPlan } from "@/components/bible/bibleReadingPlan";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Biblia365Page = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string | null>(null);
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNeuro, setShowNeuro] = useState(false);

  // Calculate which day the user is on
  const currentDay = startDate
    ? Math.min(Math.max(1, Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000) + 1), 365)
    : 1;

  const [selectedDay, setSelectedDay] = useState(currentDay);

  useEffect(() => {
    if (!user) return;
    loadProgress();
  }, [user]);

  useEffect(() => {
    if (startDate) setSelectedDay(currentDay);
  }, [startDate]);

  const loadProgress = async () => {
    const { data } = await supabase
      .from("bible_reading_progress" as any)
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data) {
      setStartDate((data as any).start_date);
      setCompletedDays((data as any).completed_days || []);
    }
    setLoading(false);
  };

  const handleStart = async () => {
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("bible_reading_progress" as any).insert({ user_id: user!.id, start_date: today, completed_days: [] } as any);
    setStartDate(today);
    setCompletedDays([]);
  };

  const toggleDay = async (day: number) => {
    let updated: number[];
    if (completedDays.includes(day)) {
      updated = completedDays.filter((d) => d !== day);
    } else {
      updated = [...completedDays, day].sort((a, b) => a - b);
    }
    setCompletedDays(updated);
    await supabase
      .from("bible_reading_progress" as any)
      .update({ completed_days: updated, updated_at: new Date().toISOString() } as any)
      .eq("user_id", user!.id);
  };

  const reading = bibleReadingPlan[selectedDay - 1];
  const percentage = Math.round((completedDays.length / 365) * 100);
  const isDayCompleted = completedDays.includes(selectedDay);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Sparkles className="h-8 w-8 text-gold animate-pulse" />
      </div>
    );
  }

  // Start screen
  if (!startDate) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-gold/10 flex items-center justify-center border border-gold/20">
          <BookOpen className="h-10 w-10 text-gold" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground">Bíblia em 365 Dias</h1>
        <p className="text-sm text-muted-foreground max-w-xs">
          Leia a Bíblia inteira em um ano com reflexões diárias de neurociência aplicada à sua vida.
        </p>
        <Button variant="gold" size="lg" onClick={handleStart} className="rounded-2xl">
          Começar Minha Jornada
        </Button>
        <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground hover:text-gold transition-colors">
          ← Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted/30 transition-all">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gold" />
              Bíblia em 365 Dias
            </h1>
          </div>
          <span className="text-xs font-body text-gold font-semibold">{percentage}%</span>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <Progress value={percentage} className="h-2.5 bg-muted/30 [&>div]:bg-gradient-to-r [&>div]:from-gold [&>div]:to-amber-400" />
          <div className="flex justify-between text-[10px] text-muted-foreground font-body">
            <span>{completedDays.length} de 365 leituras</span>
            <span>Dia {currentDay} da jornada</span>
          </div>
        </div>
      </header>

      {/* Day navigation */}
      <div className="px-5 mb-4">
        <div className="flex items-center justify-between glass rounded-2xl p-3 border border-gold/10">
          <button
            onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
            disabled={selectedDay <= 1}
            className="p-1.5 rounded-lg hover:bg-muted/30 disabled:opacity-30 transition-all"
          >
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="text-center">
            <p className="text-[10px] font-body tracking-widest uppercase text-gold/70">Dia {selectedDay}</p>
            <p className="text-sm font-display font-bold text-foreground">{reading?.title}</p>
            <p className="text-[10px] text-muted-foreground font-body mt-0.5">{reading?.passages}</p>
          </div>
          <button
            onClick={() => setSelectedDay((d) => Math.min(currentDay, d + 1))}
            disabled={selectedDay >= currentDay}
            className="p-1.5 rounded-lg hover:bg-muted/30 disabled:opacity-30 transition-all"
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Reading content */}
      <div className="px-5 space-y-4">
        {/* Bible text */}
        <div className="glass rounded-2xl p-5 border border-gold/10 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gold" />
            <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-gold/80">Leitura do Dia</h3>
          </div>
          <p className="text-sm font-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {reading?.text}
          </p>
        </div>

        {/* Neuroscience insight */}
        <button
          onClick={() => setShowNeuro(!showNeuro)}
          className={cn(
            "w-full glass rounded-2xl p-5 border text-left transition-all",
            showNeuro ? "border-purple-500/30 bg-purple-500/5" : "border-gold/10 hover:border-purple-500/20"
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-4 w-4 text-purple-400" />
            <h3 className="text-xs font-body font-semibold tracking-widest uppercase text-purple-400/80">
              Visão da Neurociência
            </h3>
            <ChevronRight className={cn("h-4 w-4 text-purple-400/50 ml-auto transition-transform", showNeuro && "rotate-90")} />
          </div>
          {showNeuro && (
            <p className="text-sm font-body text-foreground/80 leading-relaxed mt-3 animate-fade-in">
              {reading?.neuroscience}
            </p>
          )}
          {!showNeuro && (
            <p className="text-[11px] text-muted-foreground font-body">Toque para revelar o insight científico</p>
          )}
        </button>

        {/* Mark as complete */}
        <button
          onClick={() => toggleDay(selectedDay)}
          className={cn(
            "w-full flex items-center justify-center gap-3 rounded-2xl p-4 font-body font-semibold text-sm transition-all",
            isDayCompleted
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
              : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20"
          )}
        >
          {isDayCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Leitura Concluída ✓
            </>
          ) : (
            <>
              <Circle className="h-5 w-5" />
              Marcar como Lida
            </>
          )}
        </button>

        {/* Quick day selector */}
        <div className="space-y-2">
          <p className="text-[10px] font-body tracking-widest uppercase text-gold/60 font-semibold">Últimos dias</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: Math.min(currentDay, 14) }, (_, i) => currentDay - i).map((d) => (
              <button
                key={d}
                onClick={() => { setSelectedDay(d); setShowNeuro(false); }}
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
      </div>
    </div>
  );
};

export default Biblia365Page;
