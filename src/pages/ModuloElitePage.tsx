import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Sparkles, Target, MessageCircleQuestion, BookOpen, Save, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JOURNEY_LEVELS } from "@/data/eliteJourneyData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import LevelCelebration from "@/components/LevelCelebration";

export default function ModuloElitePage() {
  const navigate = useNavigate();
  const { levelId, moduleId } = useParams<{ levelId: string; moduleId: string }>();
  const { user } = useAuth();

  const level = useMemo(() => JOURNEY_LEVELS.find((l) => l.id === Number(levelId)), [levelId]);
  const moduleData = useMemo(() => level?.modules.find((m) => m.id === moduleId), [level, moduleId]);

  const [isDone, setIsDone] = useState(false);
  const [reflection, setReflection] = useState("");
  const [savedReflection, setSavedReflection] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!user || !level || !moduleData) {
      setLoading(false);
      return;
    }
    (async () => {
      const [{ data: progData }, { data: noteData }] = await Promise.all([
        supabase
          .from("elite_journey_progress" as any)
          .select("completed_modules")
          .eq("user_id", user.id)
          .eq("level_id", level.id)
          .maybeSingle(),
        supabase
          .from("elite_module_notes" as any)
          .select("reflection_answer, updated_at")
          .eq("user_id", user.id)
          .eq("module_id", moduleData.id)
          .maybeSingle(),
      ]);
      const mods: string[] = (progData as any)?.completed_modules || [];
      setIsDone(mods.includes(moduleData.id));
      const r = (noteData as any)?.reflection_answer || "";
      setReflection(r);
      setSavedReflection(r);
      setSavedAt((noteData as any)?.updated_at || null);
      setLoading(false);
    })();
  }, [user, level, moduleData]);

  if (!level || !moduleData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center gap-3">
        <p className="text-foreground font-display text-lg">Módulo não encontrado</p>
        <button
          onClick={() => navigate("/jornada-elite")}
          className="px-4 py-2 rounded-xl bg-gold text-primary-foreground font-body text-sm font-semibold"
        >
          Voltar para a Jornada
        </button>
      </div>
    );
  }

  const saveReflection = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("elite_module_notes" as any).upsert(
      {
        user_id: user.id,
        level_id: level.id,
        module_id: moduleData.id,
        reflection_answer: reflection,
      },
      { onConflict: "user_id,module_id" }
    );
    setSaving(false);
    if (error) {
      toast.error("Não consegui salvar agora");
      return;
    }
    setSavedReflection(reflection);
    setSavedAt(new Date().toISOString());
    toast.success("Reflexão salva 👑");
  };

  const toggleDone = async () => {
    if (!user) return;
    const { data: cur } = await supabase
      .from("elite_journey_progress" as any)
      .select("completed_modules")
      .eq("user_id", user.id)
      .eq("level_id", level.id)
      .maybeSingle();
    const current: string[] = (cur as any)?.completed_modules || [];
    const newModules = current.includes(moduleData.id)
      ? current.filter((m) => m !== moduleData.id)
      : [...current, moduleData.id];
    const isComplete = newModules.length === level.modules.length;
    const { error } = await supabase.from("elite_journey_progress" as any).upsert(
      {
        user_id: user.id,
        level_id: level.id,
        completed_modules: newModules,
        is_completed: isComplete,
        completed_at: isComplete ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,level_id" }
    );
    if (error) {
      toast.error("Erro ao atualizar progresso");
      return;
    }
    const wasDone = isDone;
    setIsDone(!wasDone);
    if (!wasDone && isComplete) {
      setShowCelebration(true);
    } else if (!wasDone) {
      toast.success("Aula concluída ✨");
    }
  };

  const reflectionChanged = reflection !== savedReflection;

  return (
    <div className="min-h-screen bg-background">
      {showCelebration && (
        <LevelCelebration
          levelId={level.id}
          levelName={level.name}
          levelSubtitle={level.subtitle}
          levelIcon={level.icon}
          onClose={() => setShowCelebration(false)}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-gold/15 px-5 py-4">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/jornada-elite")}
            className="p-2 -ml-2 rounded-xl hover:bg-muted/30 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-body tracking-[0.3em] uppercase text-gold/70 flex items-center gap-1">
              Nível {level.id} <Crown className="h-2.5 w-2.5 text-gold" /> {level.name}
            </p>
            <h1 className="text-base font-display font-bold text-foreground truncate">
              {moduleData.title}
            </h1>
          </div>
          {isDone && <CheckCircle2 className="h-5 w-5 text-gold shrink-0" />}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 pb-32 space-y-5">
        {/* Hero */}
        <div className="rounded-3xl glass border border-gold/20 p-5 relative overflow-hidden animate-stagger">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", level.color)} />
          <div className="relative z-10 flex items-start gap-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 flex items-center justify-center text-3xl shrink-0">
              {level.icon}
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/70">{moduleData.duration} · Aula</p>
              <h2 className="text-lg font-display font-bold text-foreground leading-snug">{moduleData.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{moduleData.description}</p>
            </div>
          </div>
        </div>

        {/* Aula */}
        <section className="space-y-2 animate-stagger">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">A aula</p>
          </div>
          <p className="text-[15px] font-body text-foreground/90 leading-relaxed whitespace-pre-line">
            {moduleData.content}
          </p>
        </section>

        {/* Prática */}
        <section className="rounded-2xl glass border border-gold/20 p-5 space-y-2 animate-stagger">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">Prática guiada</p>
          </div>
          <p className="text-sm font-body text-foreground leading-relaxed">{moduleData.practice}</p>
        </section>

        {/* Reflexão + anotação */}
        <section className="rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/30 p-5 space-y-3 animate-stagger">
          <div className="flex items-center gap-1.5">
            <MessageCircleQuestion className="h-3.5 w-3.5 text-gold" />
            <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold">Reflexão da rainha</p>
          </div>
          <p className="text-base font-display italic text-foreground leading-relaxed">
            "{moduleData.reflection}"
          </p>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-body tracking-[0.2em] uppercase text-gold/70 flex items-center gap-1.5">
              <BookOpen className="h-3 w-3" /> Sua resposta
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder={loading ? "Carregando..." : "Escreva aqui sem filtro. Ninguém mais lê isso — é só entre você e você."}
              disabled={loading}
              rows={6}
              className="w-full p-3 rounded-xl bg-background/60 border border-gold/15 focus:border-gold/50 focus:outline-none text-sm font-body text-foreground placeholder:text-muted-foreground/60 leading-relaxed resize-y transition-colors"
            />
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] text-muted-foreground">
                {savedAt
                  ? `Salvo em ${new Date(savedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                  : "Ainda sem registro"}
              </p>
              <button
                onClick={saveReflection}
                disabled={saving || !reflectionChanged || loading}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-body font-semibold transition-all active:scale-[0.98]",
                  reflectionChanged && !saving
                    ? "bg-gold text-primary-foreground shadow-gold"
                    : "bg-muted/30 text-muted-foreground cursor-not-allowed"
                )}
              >
                <Save className="h-3.5 w-3.5" />
                {saving ? "Salvando..." : reflectionChanged ? "Salvar reflexão" : "Salvo"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Sticky action */}
      <div className="fixed bottom-0 inset-x-0 md:left-64 z-30 glass-strong border-t border-gold/15 px-5 py-3">
        <div className="max-w-2xl mx-auto w-full">
          <button
            onClick={toggleDone}
            className={cn(
              "w-full py-3.5 rounded-xl font-body font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2",
              isDone
                ? "bg-muted/30 border border-gold/20 text-muted-foreground"
                : "bg-gold text-primary-foreground shadow-gold hover:brightness-110"
            )}
          >
            {isDone ? (
              <>Desmarcar conclusão</>
            ) : (
              <><CheckCircle2 className="h-4 w-4" /> Concluí esta aula</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
