import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Droplets, Beef, Plus, Minus, RotateCcw } from "lucide-react";

interface Props {
  weight: number | null;
  goal: string;
  activityLevel: string;
}

export default function ProteinWaterCalculator({ weight, goal, activityLevel }: Props) {
  // Protein
  const proteinMultiplier = goal === "ganhar_massa" ? 2.0 : goal === "emagrecer" ? 1.6 : 1.2;
  const dailyProteinGoal = weight ? Math.round(weight * proteinMultiplier) : 0;
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const proteinPercent = dailyProteinGoal > 0 ? Math.min(100, Math.round((proteinConsumed / dailyProteinGoal) * 100)) : 0;

  // Water
  const activityWaterBonus: Record<string, number> = {
    sedentario: 0, leve: 200, moderado: 500, ativo: 700, muito_ativo: 1000,
  };
  const dailyWaterGoalMl = weight ? Math.round(weight * 35 + (activityWaterBonus[activityLevel] || 0)) : 2500;
  const dailyWaterGoalL = (dailyWaterGoalMl / 1000).toFixed(1);
  const [waterMl, setWaterMl] = useState(0);
  const waterPercent = dailyWaterGoalMl > 0 ? Math.min(100, Math.round((waterMl / dailyWaterGoalMl) * 100)) : 0;

  // Load from localStorage for today
  const todayKey = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    const saved = localStorage.getItem(`health-trackers-${todayKey}`);
    if (saved) {
      const data = JSON.parse(saved);
      setProteinConsumed(data.protein || 0);
      setWaterMl(data.water || 0);
    }
  }, [todayKey]);

  useEffect(() => {
    localStorage.setItem(`health-trackers-${todayKey}`, JSON.stringify({ protein: proteinConsumed, water: waterMl }));
  }, [proteinConsumed, waterMl, todayKey]);

  const addProtein = (amount: number) => setProteinConsumed(prev => Math.max(0, prev + amount));
  const addWater = (amount: number) => setWaterMl(prev => Math.max(0, prev + amount));

  return (
    <div className="space-y-4">
      {/* Protein Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Beef className="h-5 w-5 text-primary" />
            Meta de Proteína Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!weight ? (
            <p className="text-xs text-muted-foreground">Preencha seu peso no perfil para calcular sua meta.</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-body">Meta: <strong className="text-foreground">{dailyProteinGoal}g</strong></span>
                <span className="text-muted-foreground font-body text-xs">({proteinMultiplier}g/kg · {goal === "ganhar_massa" ? "ganho de massa" : goal === "emagrecer" ? "emagrecimento" : "manutenção"})</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-body text-muted-foreground">Consumido: {proteinConsumed}g</span>
                  <span className="font-body font-semibold text-foreground">{proteinPercent}%</span>
                </div>
                <Progress value={proteinPercent} className="h-3" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[10, 20, 30, 50].map(amt => (
                  <Button key={amt} size="sm" variant="outline" className="text-xs h-8" onClick={() => addProtein(amt)}>
                    +{amt}g
                  </Button>
                ))}
                <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => addProtein(-10)}>
                  <Minus className="h-3 w-3 mr-1" /> 10g
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-8 text-muted-foreground" onClick={() => setProteinConsumed(0)}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                <p className="text-[10px] font-body text-muted-foreground font-semibold">💡 Referência rápida de proteína:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-body text-muted-foreground">
                  <span>🍗 Frango 100g → 31g</span>
                  <span>🥚 1 ovo → 6g</span>
                  <span>🥩 Carne 100g → 26g</span>
                  <span>🥛 Whey 30g → 24g</span>
                  <span>🐟 Peixe 100g → 20g</span>
                  <span>🫘 Feijão 100g → 9g</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Water Calculator */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-400" />
            Meta de Água Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!weight ? (
            <p className="text-xs text-muted-foreground">Preencha seu peso no perfil para calcular sua meta.</p>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-body">Meta: <strong className="text-foreground">{dailyWaterGoalL}L</strong></span>
                <span className="text-muted-foreground font-body text-xs">(35ml/kg + atividade)</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-body text-muted-foreground">Consumido: {(waterMl / 1000).toFixed(1)}L ({waterMl}ml)</span>
                  <span className="font-body font-semibold text-foreground">{waterPercent}%</span>
                </div>
                <Progress value={waterPercent} className="h-3 [&>div]:bg-blue-400" />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[{ label: "🥤 200ml", ml: 200 }, { label: "🫗 300ml", ml: 300 }, { label: "🍶 500ml", ml: 500 }, { label: "💧 1L", ml: 1000 }].map(item => (
                  <Button key={item.ml} size="sm" variant="outline" className="text-xs h-8" onClick={() => addWater(item.ml)}>
                    {item.label}
                  </Button>
                ))}
                <Button size="sm" variant="ghost" className="text-xs h-8" onClick={() => addWater(-200)}>
                  <Minus className="h-3 w-3 mr-1" /> 200ml
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-8 text-muted-foreground" onClick={() => setWaterMl(0)}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>

              {waterPercent >= 100 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 text-center">
                  <p className="text-xs font-body text-blue-400 font-semibold">🎉 Meta de hidratação alcançada! Parabéns!</p>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-[10px] font-body text-muted-foreground">💡 Dica: Beba 500ml ao acordar, mantenha uma garrafinha por perto e coloque alarmes a cada 2h. Chás e água com gás também contam!</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
