import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Sparkles, RefreshCw, ShoppingBasket, ChefHat, Flame } from "lucide-react";
import { toast } from "sonner";
import { useScrollTopOnChange } from "@/hooks/useScrollTopOnChange";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MEAL_ORDER = ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar"];
const MEAL_LABELS: Record<string, string> = {
  cafe_manha: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
};
const CATEGORY_LABELS: Record<string, string> = {
  proteinas: "Proteínas",
  carboidratos: "Carboidratos",
  hortifruti: "Hortifrúti",
  laticinios: "Laticínios",
  outros: "Outros",
};

interface Meal { name: string; items: string[]; kcal: number; prep: string; }
interface DayPlan { day: string; meals: Record<string, Meal>; total_kcal: number; }
interface Plan { days: DayPlan[]; shopping_list: Record<string, { name: string; quantity: string }[]>; }

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function PlanoAlimentarPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regenDay, setRegenDay] = useState<number | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [restrictions, setRestrictions] = useState("");
  const [preferences, setPreferences] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("plano");
  const weekStart = useMemo(getWeekStart, []);
  useScrollTopOnChange(activeTab);

  useEffect(() => { if (user) loadInitial(); }, [user]);

  async function loadInitial() {
    setLoading(true);
    const { data: hp } = await supabase.from("health_profiles").select("*").eq("user_id", user!.id).maybeSingle();
    setProfile(hp || {});
    const { data: mp } = await supabase.from("weekly_meal_plans").select("*").eq("user_id", user!.id).eq("week_start", weekStart).maybeSingle();
    if (mp) {
      setPlan({ days: (mp.plan_data as any).days || [], shopping_list: (mp.shopping_list as any) || {} });
      setRestrictions(mp.restrictions || "");
      setPreferences(mp.preferences || "");
    }
    setLoading(false);
  }

  async function generateWeek() {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-meal-plan", {
        body: { mode: "week", profile, restrictions, preferences },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newPlan: Plan = { days: data.days || [], shopping_list: data.shopping_list || {} };
      setPlan(newPlan);
      await supabase.from("weekly_meal_plans").upsert({
        user_id: user!.id, week_start: weekStart,
        plan_data: { days: newPlan.days } as any,
        shopping_list: newPlan.shopping_list as any,
        restrictions, preferences,
      }, { onConflict: "user_id,week_start" });
      toast.success("Plano semanal criado! 👑");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar plano");
    } finally { setGenerating(false); }
  }

  async function regenerateDay(idx: number) {
    if (!plan) return;
    setRegenDay(idx);
    try {
      const { data, error } = await supabase.functions.invoke("weekly-meal-plan", {
        body: { mode: "day", dayIndex: idx, profile, restrictions, preferences },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newDays = [...plan.days];
      newDays[idx] = { day: data.day || DAYS[idx], meals: data.meals || {}, total_kcal: data.total_kcal || 0 };
      const updated = { ...plan, days: newDays };
      setPlan(updated);
      await supabase.from("weekly_meal_plans").update({
        plan_data: { days: updated.days } as any,
      }).eq("user_id", user!.id).eq("week_start", weekStart);
      toast.success(`${DAYS[idx]} regenerado!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao regenerar");
    } finally { setRegenDay(null); }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-5 pb-32">
      <header className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-gold font-body">
          <ChefHat className="h-3.5 w-3.5" /> Nutrição inteligente
        </div>
        <h1 className="font-display text-3xl text-foreground">Plano Alimentar Semanal</h1>
        <p className="text-sm text-muted-foreground font-body">7 dias, 5 refeições, lista de compras pronta.</p>
        <p className="text-[11px] text-muted-foreground font-body">Semana de {new Date(weekStart).toLocaleDateString("pt-BR")}</p>
      </header>

      {!plan ? (
        <Card className="p-5 space-y-4 border-gold/30 bg-gradient-card">
          <div className="space-y-1">
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider">Restrições (opcional)</label>
            <Textarea value={restrictions} onChange={(e) => setRestrictions(e.target.value)} placeholder="Ex: intolerância a lactose, sem glúten..." rows={2} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-body text-muted-foreground uppercase tracking-wider">Preferências (opcional)</label>
            <Textarea value={preferences} onChange={(e) => setPreferences(e.target.value)} placeholder="Ex: gosto de frango, iogurte grego, frutas vermelhas..." rows={2} />
          </div>
          <Button onClick={generateWeek} disabled={generating} className="w-full h-12 bg-gold hover:bg-gold/90 text-black font-display uppercase tracking-wider">
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Criando seu plano...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gerar plano da semana</>}
          </Button>
        </Card>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full h-12 bg-cream/70 border border-gold/20">
              <TabsTrigger value="plano" className="font-display uppercase text-xs tracking-wider">Cardápio</TabsTrigger>
              <TabsTrigger value="lista" className="font-display uppercase text-xs tracking-wider">Lista de compras</TabsTrigger>
            </TabsList>

            <TabsContent value="plano" className="space-y-4 mt-4">
              {plan.days.map((d, idx) => (
                <Card key={idx} className="p-4 border-gold/20 bg-gradient-card space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-lg text-foreground">{d.day || DAYS[idx]}</h2>
                      <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
                        <Flame className="h-3 w-3 text-gold" /> {d.total_kcal} kcal
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10" onClick={() => regenerateDay(idx)} disabled={regenDay === idx}>
                      {regenDay === idx ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      <span className="ml-1 text-xs">Regerar</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {MEAL_ORDER.map((k) => {
                      const m: Meal | undefined = (d.meals as any)?.[k];
                      if (!m) return null;
                      return (
                        <div key={k} className="rounded-xl bg-white/60 border border-gold/10 p-3">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-gold font-body">{MEAL_LABELS[k]}</p>
                              <p className="font-display text-sm text-foreground">{m.name}</p>
                            </div>
                            <span className="text-[11px] text-muted-foreground font-body whitespace-nowrap">{m.kcal} kcal</span>
                          </div>
                          <ul className="mt-2 text-xs text-foreground/80 font-body space-y-0.5 list-disc list-inside">
                            {m.items?.map((it, i) => <li key={i}>{it}</li>)}
                          </ul>
                          {m.prep && <p className="mt-2 text-[11px] text-muted-foreground italic font-body">{m.prep}</p>}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="lista" className="space-y-4 mt-4">
              <Card className="p-4 border-gold/30 bg-gradient-card">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBasket className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-lg">Lista de compras da semana</h2>
                </div>
                {Object.entries(plan.shopping_list || {}).map(([cat, items]) => (
                  items?.length > 0 && (
                    <div key={cat} className="mb-4">
                      <p className="text-[10px] uppercase tracking-widest text-gold font-body mb-1.5">{CATEGORY_LABELS[cat] || cat}</p>
                      <ul className="space-y-1">
                        {items.map((it, i) => (
                          <li key={i} className="flex justify-between text-sm font-body border-b border-gold/10 py-1">
                            <span className="text-foreground">{it.name}</span>
                            <span className="text-muted-foreground">{it.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </Card>
            </TabsContent>
          </Tabs>

          <Button onClick={generateWeek} disabled={generating} variant="outline" className="w-full border-gold/40 text-gold hover:bg-gold/10">
            {generating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Recriando...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gerar novo plano da semana</>}
          </Button>
        </>
      )}
    </div>
  );
}
