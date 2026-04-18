import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, CheckCircle2, Crown, Play, ClipboardCheck, BookOpen, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JOURNEY_LEVELS, VIDEO_TRACKS, DIAGNOSTIC_QUESTIONS, ARCHETYPE_PLANS, AccelerationPlan } from "@/data/eliteJourneyData";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "trilha" | "diagnostico" | "aulas";

export default function JornadaElitePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("trilha");

  // Trilha
  const [progress, setProgress] = useState<Record<number, { completed_modules: string[]; is_completed: boolean }>>({});
  // Diagnóstico
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [plan, setPlan] = useState<AccelerationPlan | null>(null);
  // Aulas
  const [activeTrack, setActiveTrack] = useState<string>("oratoria");
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [activeVideo, setActiveVideo] = useState<{ id: string; title: string; mentor: string } | null>(null);

  const openYouTubeExternal = (title: string, mentor: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${mentor}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Load data
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: progData }, { data: diagData }, { data: vidData }] = await Promise.all([
        supabase.from("elite_journey_progress" as any).select("*").eq("user_id", user.id),
        supabase.from("elite_diagnostic_results" as any).select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("elite_video_completions" as any).select("video_id").eq("user_id", user.id),
      ]);
      const p: Record<number, any> = {};
      (progData as any[])?.forEach((r) => { p[r.level_id] = { completed_modules: r.completed_modules, is_completed: r.is_completed }; });
      setProgress(p);
      if (diagData && (diagData as any).archetype) setPlan(ARCHETYPE_PLANS[(diagData as any).archetype]);
      setCompletedVideos(new Set((vidData as any[])?.map((v) => v.video_id) || []));
    })();
  }, [user]);

  const isLevelUnlocked = (levelId: number) => {
    if (levelId === 1) return true;
    return progress[levelId - 1]?.is_completed === true;
  };

  const toggleModule = async (levelId: number, moduleId: string) => {
    if (!user) return;
    const current = progress[levelId]?.completed_modules || [];
    const newModules = current.includes(moduleId) ? current.filter((m) => m !== moduleId) : [...current, moduleId];
    const level = JOURNEY_LEVELS.find((l) => l.id === levelId)!;
    const isComplete = newModules.length === level.modules.length;
    setProgress({ ...progress, [levelId]: { completed_modules: newModules, is_completed: isComplete } });
    await supabase.from("elite_journey_progress" as any).upsert({
      user_id: user.id,
      level_id: levelId,
      completed_modules: newModules,
      is_completed: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
    }, { onConflict: "user_id,level_id" });
    if (isComplete) toast.success(`Nível ${level.name} concluído! 👑`);
  };

  const submitQuiz = async (lastAnswer: number) => {
    if (!user) return;
    const finalAnswers = { ...quizAnswers, [quizStep]: lastAnswer };
    const counts: Record<string, number> = { estrategista: 0, visionaria: 0, executora: 0, conectora: 0 };
    DIAGNOSTIC_QUESTIONS.forEach((q, i) => {
      const ans = finalAnswers[i];
      if (ans !== undefined) counts[q.options[ans].archetype]++;
    });
    const archetype = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const newPlan = ARCHETYPE_PLANS[archetype];
    setPlan(newPlan);
    await supabase.from("elite_diagnostic_results" as any).upsert({
      user_id: user.id,
      archetype,
      scores: counts,
      acceleration_plan: newPlan as any,
    }, { onConflict: "user_id" });
    toast.success("Plano de Aceleração gerado!");
  };

  const toggleVideo = async (trackId: string, videoId: string) => {
    if (!user) return;
    const next = new Set(completedVideos);
    if (next.has(videoId)) {
      next.delete(videoId);
      await supabase.from("elite_video_completions" as any).delete().eq("user_id", user.id).eq("video_id", videoId);
    } else {
      next.add(videoId);
      await supabase.from("elite_video_completions" as any).insert({ user_id: user.id, track_id: trackId, video_id: videoId });
    }
    setCompletedVideos(next);
  };

  const totalVideos = VIDEO_TRACKS.reduce((sum, t) => sum + t.videos.length, 0);
  const totalLevelsDone = Object.values(progress).filter((p) => p.is_completed).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b border-gold/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-xl hover:bg-muted/30 transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1">
            <p className="text-[9px] font-body tracking-[0.3em] uppercase text-gold/70">Programa Elite</p>
            <h1 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
              Jornada Elite <Crown className="h-4 w-4 text-gold" />
            </h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl glass border border-gold/15">
          {([
            { id: "trilha" as Tab, label: "Trilha", icon: Crown },
            { id: "diagnostico" as Tab, label: "Diagnóstico", icon: ClipboardCheck },
            { id: "aulas" as Tab, label: "Aulas", icon: Play },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-body font-semibold transition-all",
                tab === id ? "bg-gold text-primary-foreground shadow-gold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-6 pb-20 space-y-6">
        {/* TRILHA */}
        {tab === "trilha" && (
          <>
            <div className="text-center space-y-2 animate-stagger">
              <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">Pirâmide da Elite</p>
              <h2 className="text-xl font-display font-bold text-foreground">5 Níveis até a Liderança</h2>
              <p className="text-xs text-muted-foreground">{totalLevelsDone} de {JOURNEY_LEVELS.length} níveis concluídos</p>
            </div>

            <div className="space-y-3">
              {[...JOURNEY_LEVELS].reverse().map((level) => {
                const unlocked = isLevelUnlocked(level.id);
                const lvlProgress = progress[level.id];
                const completedCount = lvlProgress?.completed_modules.length || 0;
                const isDone = lvlProgress?.is_completed;
                return (
                  <div
                    key={level.id}
                    className={cn(
                      "animate-stagger relative rounded-2xl p-5 border transition-all overflow-hidden",
                      unlocked ? "glass border-gold/20" : "bg-muted/10 border-muted/20 opacity-60",
                      isDone && "border-gold/50 shadow-gold"
                    )}
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", level.color)} />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gold/30 to-gold/5 border border-gold/30 flex items-center justify-center text-2xl">
                            {unlocked ? level.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-body tracking-[0.25em] uppercase text-gold/70">Nível {level.id}</p>
                            <h3 className="text-base font-display font-bold text-foreground">{level.name}</h3>
                            <p className="text-[10px] text-muted-foreground">{level.subtitle}</p>
                          </div>
                        </div>
                        {isDone && <CheckCircle2 className="h-5 w-5 text-gold" />}
                      </div>

                      {unlocked && (
                        <div className="space-y-2 mt-4">
                          <div className="flex items-center justify-between text-[10px] font-body text-gold/80">
                            <span>{completedCount}/{level.modules.length} módulos</span>
                            <span>{Math.round((completedCount / level.modules.length) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all" style={{ width: `${(completedCount / level.modules.length) * 100}%` }} />
                          </div>
                          <div className="space-y-1.5 mt-3">
                            {level.modules.map((mod) => {
                              const done = lvlProgress?.completed_modules.includes(mod.id);
                              return (
                                <button
                                  key={mod.id}
                                  onClick={() => navigate(`/jornada-elite/modulo/${level.id}/${mod.id}`)}
                                  className={cn(
                                    "w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all active:scale-[0.98]",
                                    done ? "bg-gold/10 border border-gold/30" : "bg-muted/20 border border-transparent hover:border-gold/30"
                                  )}
                                >
                                  <div className={cn("h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0", done ? "bg-gold border-gold" : "border-muted-foreground")}>
                                    {done && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={cn("text-[12px] font-body font-semibold", done ? "text-gold" : "text-foreground")}>{mod.title}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{mod.description} · {mod.duration}</p>
                                  </div>
                                  <BookOpen className="h-3.5 w-3.5 text-gold/60 shrink-0" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {!unlocked && (
                        <p className="text-[11px] text-muted-foreground italic mt-2">Complete o nível anterior para desbloquear</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* DIAGNÓSTICO */}
        {tab === "diagnostico" && (
          <>
            {!plan ? (
              <div className="space-y-5">
                <div className="text-center space-y-2 animate-stagger">
                  <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">Quiz Diagnóstico</p>
                  <h2 className="text-xl font-display font-bold text-foreground">Descubra seu Arquétipo</h2>
                  <p className="text-xs text-muted-foreground">{quizStep + 1} de {DIAGNOSTIC_QUESTIONS.length}</p>
                  <div className="h-1 bg-muted/30 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className="h-full bg-gradient-to-r from-gold to-amber-400 transition-all" style={{ width: `${((quizStep + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl glass border border-gold/20 p-5 space-y-4">
                  <h3 className="text-base font-display font-semibold text-foreground">{DIAGNOSTIC_QUESTIONS[quizStep].q}</h3>
                  <div className="space-y-2">
                    {DIAGNOSTIC_QUESTIONS[quizStep].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newAnswers = { ...quizAnswers, [quizStep]: i };
                          setQuizAnswers(newAnswers);
                          if (quizStep < DIAGNOSTIC_QUESTIONS.length - 1) {
                            setQuizStep(quizStep + 1);
                          } else {
                            submitQuiz(i);
                          }
                        }}
                        className="w-full p-3 rounded-xl bg-muted/20 border border-gold/10 hover:border-gold/40 hover:bg-muted/30 text-left text-sm font-body text-foreground transition-all active:scale-[0.98]"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-stagger">
                <div className="rounded-3xl glass-gold border border-gold/30 p-6 text-center space-y-3 shadow-brand">
                  <div className="text-6xl">{plan.emoji}</div>
                  <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold">Seu arquétipo</p>
                  <h2 className="text-2xl font-display font-bold text-foreground">{plan.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                </div>

                <div className="rounded-2xl glass border border-gold/20 p-5 space-y-2">
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">⚡ Seu Superpoder</p>
                  <p className="text-sm text-foreground">{plan.superpower}</p>
                </div>

                <div className="rounded-2xl glass border border-gold/20 p-5 space-y-2">
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">🌑 Sua Sombra</p>
                  <p className="text-sm text-foreground">{plan.shadowSide}</p>
                </div>

                <div className="rounded-2xl glass border border-gold/20 p-5 space-y-3">
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">🎯 Foco da Semana</p>
                  {plan.weeklyFocus.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-[10px] font-bold text-gold shrink-0 mt-0.5">{i + 1}</div>
                      <p className="text-sm text-foreground">{f}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl glass border border-gold/20 p-5 space-y-3">
                  <p className="text-[10px] font-body tracking-[0.25em] uppercase text-gold/80">📚 Trilhas Recomendadas</p>
                  <div className="space-y-2">
                    {plan.recommendedTracks.map((tid) => {
                      const track = VIDEO_TRACKS.find((t) => t.id === tid);
                      if (!track) return null;
                      return (
                        <button
                          key={tid}
                          onClick={() => { setActiveTrack(tid); setTab("aulas"); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-gold/10 hover:border-gold/40 transition-all active:scale-[0.98]"
                        >
                          <span className="text-2xl">{track.icon}</span>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-body font-semibold text-foreground">{track.name}</p>
                            <p className="text-[10px] text-muted-foreground">{track.description}</p>
                          </div>
                          <Play className="h-4 w-4 text-gold" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => { setPlan(null); setQuizStep(0); setQuizAnswers({}); }}
                  className="w-full py-3 rounded-xl border border-gold/20 text-xs font-body text-gold/80 hover:bg-gold/5 transition-colors"
                >
                  Refazer diagnóstico
                </button>
              </div>
            )}
          </>
        )}

        {/* AULAS */}
        {tab === "aulas" && (
          <>
            <div className="text-center space-y-1 animate-stagger">
              <p className="text-[10px] font-body tracking-[0.3em] uppercase text-gold/70">Biblioteca Elite</p>
              <h2 className="text-xl font-display font-bold text-foreground">{totalVideos}+ Aulas em 7 Trilhas</h2>
              <p className="text-xs text-muted-foreground">{completedVideos.size} aulas concluídas</p>
            </div>

            {/* Track tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {VIDEO_TRACKS.map((track) => (
                <button
                  key={track.id}
                  onClick={() => setActiveTrack(track.id)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-semibold transition-all border",
                    activeTrack === track.id
                      ? "bg-gold text-primary-foreground border-gold shadow-gold"
                      : "glass border-gold/15 text-muted-foreground hover:text-foreground hover:border-gold/30"
                  )}
                >
                  <span>{track.icon}</span> {track.name}
                </button>
              ))}
            </div>

            {(() => {
              const track = VIDEO_TRACKS.find((t) => t.id === activeTrack)!;
              return (
                <div className="space-y-3">
                  <div className={cn("rounded-2xl p-5 glass border border-gold/20 relative overflow-hidden")}>
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", track.color)} />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="text-4xl">{track.icon}</div>
                      <div>
                        <h3 className="text-lg font-display font-bold text-foreground">{track.name}</h3>
                        <p className="text-[11px] text-muted-foreground">{track.description}</p>
                      </div>
                    </div>
                  </div>

                  {track.videos.map((v, i) => {
                    const done = completedVideos.has(v.id);
                    return (
                      <div
                        key={v.id}
                        className={cn(
                          "animate-stagger rounded-2xl glass border p-4 transition-all",
                          done ? "border-gold/40" : "border-gold/15"
                        )}
                        style={{ "--stagger": i } as React.CSSProperties}
                      >
                        <button
                          onClick={() => setActiveVideo({ id: v.id, title: v.title, mentor: v.mentor })}
                          className="w-full flex items-center gap-3 text-left"
                        >
                          <div className="relative h-16 w-24 rounded-lg overflow-hidden bg-muted/30 shrink-0 flex items-center justify-center">
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", track.color)} />
                            <div className="absolute inset-0 bg-black/30" />
                            <Play className="relative h-6 w-6 text-gold fill-gold drop-shadow" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-semibold text-foreground line-clamp-2">{v.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{v.mentor} · {v.duration}</p>
                            <p className="text-[9px] text-gold/70 mt-0.5 font-body tracking-wider uppercase">▶ Assistir aqui</p>
                          </div>
                        </button>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            onClick={() => toggleVideo(track.id, v.id)}
                            className={cn(
                              "py-2 rounded-lg text-[11px] font-body font-semibold transition-all flex items-center justify-center gap-1.5",
                              done ? "bg-gold/10 border border-gold/30 text-gold" : "bg-muted/20 border border-gold/10 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {done ? <><CheckCircle2 className="h-3.5 w-3.5" /> Concluída</> : "Marcar concluída"}
                          </button>
                          <button
                            onClick={() => openYouTubeExternal(v.title, v.mentor)}
                            className="py-2 rounded-lg text-[11px] font-body font-semibold bg-muted/20 border border-gold/10 text-muted-foreground hover:text-gold hover:border-gold/30 transition-all flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> YouTube
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

          </>
        )}
      </div>

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-background rounded-2xl border border-gold/20 overflow-hidden shadow-gold"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold/15 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-display font-bold text-foreground truncate">{activeVideo.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{activeVideo.mentor}</p>
              </div>
              <button
                onClick={() => openYouTubeExternal(activeVideo.title, activeVideo.mentor, activeVideo.youtubeId)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-[11px] font-body font-semibold text-gold hover:bg-gold/20 transition-all"
              >
                <ExternalLink className="h-3.5 w-3.5" /> YouTube
              </button>
              <button
                onClick={() => setActiveVideo(null)}
                className="shrink-0 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4 text-foreground" />
              </button>
            </div>
            <div className="relative aspect-video bg-black">
              <iframe
                key={activeVideo.id}
                src={`https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(`${activeVideo.title} ${activeVideo.mentor}`)}&autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={activeVideo.title}
                className="absolute inset-0 h-full w-full"
                frameBorder={0}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="px-4 py-3 text-[10px] text-muted-foreground text-center border-t border-gold/10 space-y-1">
              <p>Buscamos automaticamente o melhor vídeo sobre <span className="text-gold">{activeVideo.title}</span>.</p>
              <p>Se o YouTube estiver bloqueado na sua rede (Wi-Fi do trabalho, controle parental), use dados móveis ou toque em <span className="text-gold font-semibold">YouTube</span>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
