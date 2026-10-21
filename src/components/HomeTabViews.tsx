import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Target, Heart, Crown, Flame, Sparkles, ClipboardCheck, Trophy, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import MonthlyCalendar from "@/components/MonthlyCalendar";
import HormonalPhaseSuggestion from "@/components/HormonalPhaseSuggestion";
import { mainLinks, phaseLinks } from "@/lib/app-navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const trails = [
  { icon: Brain, title: "Reprogramar a Mente", sub: "Áudios e exercícios para trocar pensamentos que te travam", to: "/reprogramacao", action: "Abrir" },
  { icon: Target, title: "Metas & Manifestação", sub: "Defina o que quer e veja sua vida dos sonhos sair do papel", to: "/metas", action: "Abrir" },
  { icon: Heart, title: "Destravar Feminino", sub: "14 aulas curtas para soltar o que está te prendendo", to: "/jornada", action: "Abrir" },
  { icon: Crown, title: "Autoestima de Rainha", sub: "Construa uma confiança que ninguém consegue abalar", to: "/identidade-inabalavel", action: "Abrir" },
  { icon: Flame, title: "Reset 14.5 (5 dias)", sub: "5 dias com jejum de 14h por dia para resetar o corpo", to: "/protocolo-14-5", action: "Abrir" },
];
const programs = [
  { icon: Sparkles, title: "Gloow Movimenta", sub: "21 dias · 5 missões por dia: corpo, mente, alma, finanças e vida", action: "Iniciar", to: "/glow-move" },
  { icon: Crown, title: "Jornada Elite", sub: "Trilha completa em 5 níveis · 80+ aulas + teste de perfil", action: "Abrir", to: "/jornada-elite" },
  { icon: ClipboardCheck, title: "Descubra seu perfil", sub: "Testes rápidos: DISC, comportamento e produtividade", action: "Fazer teste", to: "/testes" },
  { icon: Trophy, title: "Desafios progressivos", sub: "Escolha um desafio de 7, 21, 30 ou 90 dias e bora", action: "Escolher", to: "/desafios" },
];

function BibleEntry() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<{ start_date: string; completed_days: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    if (!user) return;
    supabase.from("bible_reading_progress").select("start_date, completed_days").eq("user_id", user.id).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      setProgress(data); setFailed(Boolean(error)); setLoading(false);
    });
    return () => { active = false; };
  }, [user]);
  const day = progress ? Math.min(365, Math.max(1, Math.floor((Date.now() - new Date(progress.start_date).getTime()) / 86400000) + 1)) : 1;
  return <article className="ed-card p-4 sm:p-5 space-y-4">
    <div className="flex items-start gap-3"><span className="icon-circle h-10 w-10 shrink-0"><BookOpen className="h-5 w-5" /></span><div><h2 className="font-display text-xl">Bíblia em 365 dias</h2><p className="text-sm text-muted-foreground mt-1">1 leitura curta por dia + reflexão prática</p></div></div>
    {loading ? <p role="status" className="text-sm text-muted-foreground">Carregando progresso…</p> : failed ? <p role="status" className="text-sm text-muted-foreground">Não foi possível carregar o progresso.</p> : <div className="space-y-2"><div className="flex justify-between text-xs text-muted-foreground"><span>Dia {day} de 365</span><span>{progress?.completed_days?.length || 0} de 365 concluídos</span></div><Progress value={((progress?.completed_days?.length || 0) / 365) * 100} /></div>}
    <Button asChild variant="dark" size="sm"><Link to="/biblia-365">Ler hoje<ChevronRight /></Link></Button>
  </article>;
}

export default function HomeTabViews({ view }: { view: string }) {
  const { user } = useAuth();
  const title = { trilhas: "Trilhas", programas: "Explore o clube", agenda: "Seu mês de relance", biblia: "Bíblia em 365 dias", fase: "Minha fase" }[view] || "Trilhas";
  return <div className="home-tab-view px-4 py-4 sm:px-5 space-y-4">
    <header><p className="eyebrow">Gloow Up Club</p><h1 className="font-display text-2xl mt-1">{title}</h1></header>
    {view === "agenda" ? <MonthlyCalendar /> : view === "biblia" ? <BibleEntry /> : view === "fase" ? <>
      <HormonalPhaseSuggestion cardOnly />
      <div className="grid grid-cols-2 gap-2.5">{phaseLinks.map(({ icon: Icon, label, to, sub }) => <Button key={to} asChild variant="ghost" className="phase-shortcut ed-card min-h-[92px] h-auto whitespace-normal justify-start p-3 rounded-xl"><Link to={to}><span className="flex flex-col items-start gap-1.5"><Icon className="text-primary" /><span className="text-sm font-semibold">{label}</span><span className="text-xs text-muted-foreground font-normal">{sub}</span></span></Link></Button>)}</div>
      <section className="pt-2"><h2 className="text-lg font-display mb-2">Mais opções</h2>{[...mainLinks(user?.id).filter(x => ["Bíblia", "Programas", "Perfil"].includes(x.label)), { label: "Saúde", to: "/saude", icon: Heart }, { label: "Comunidade", to: "/comunidade", icon: Heart }].map(({ label, to, icon: Icon }) => <Button asChild key={to} variant="ghost" className="w-full h-11 justify-start rounded-lg"><Link to={to}><Icon className="text-primary" />{label === "Bíblia" ? "Bíblia em 365 dias" : label}<ChevronRight className="ml-auto" /></Link></Button>)}</section>
    </> : <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">{(view === "programas" ? programs : trails).map(({ icon: Icon, title: name, sub, action, to }) => <article className="ed-block" key={to}><span className="ed-row-icon h-9 w-9"><Icon className="h-4 w-4" /></span><h2 className="font-display text-base leading-tight">{name}</h2><p className="text-xs text-muted-foreground leading-snug">{sub}</p><Button asChild variant="dark" size="sm" className="mt-auto"><Link to={to}>{action}<ChevronRight /></Link></Button></article>)}</div>}
  </div>;
}