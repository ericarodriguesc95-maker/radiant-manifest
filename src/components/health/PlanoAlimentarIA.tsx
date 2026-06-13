import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Calendar, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Props {
  profile?: {
    goal?: string;
    current_weight?: number | null;
    target_weight?: number | null;
    height_cm?: number | null;
    age?: number | null;
    activity_level?: string;
  } | null;
}

const STYLES = [
  { value: "equilibrado", label: "🥗 Equilibrado" },
  { value: "lowcarb", label: "🥑 Low Carb" },
  { value: "cetogenico", label: "🧈 Cetogênico" },
  { value: "mediterraneo", label: "🫒 Mediterrâneo" },
  { value: "hiperproteico", label: "💪 Hiperproteico" },
  { value: "vegano", label: "🌱 Vegano" },
  { value: "jejum168", label: "⏱️ Jejum 16/8" },
];

export default function PlanoAlimentarIA({ profile }: Props) {
  const [style, setStyle] = useState("equilibrado");
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const prompt = `Monte um PLANO ALIMENTAR DE ${days} DIAS no estilo **${STYLES.find(s => s.value === style)?.label}** personalizado para mim.

Para CADA dia, entregue:
- Café da manhã (com horário sugerido)
- Lanche da manhã
- Almoço
- Lanche da tarde
- Jantar
- (se aplicável) Ceia

Para cada refeição: lista de alimentos com PORÇÕES em gramas/ml e KCAL aproximada por refeição. Ao final de cada dia: total de kcal, proteína (g), carbo (g), gordura (g).

Use markdown com títulos de dia (### Dia 1 — Segunda), tabelas curtas ou listas. Inclua uma seção final "🛒 Lista de compras consolidada" e "💡 Dicas de preparo e substituições".

Seja PRÁTICA, com comida brasileira real, sem ingredientes raros.`;

      const { data, error } = await supabase.functions.invoke("nutricionista-ai", {
        body: { messages: [{ role: "user", content: prompt }], profile },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setPlan(data.reply);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao gerar plano");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-gold/30 bg-gradient-to-br from-background to-gold/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-xl shadow-md">
            📋
          </div>
          <div>
            <CardTitle className="flex items-center gap-2">
              Plano Alimentar IA
              <span className="text-[10px] font-medium bg-gold/20 text-gold px-2 py-0.5 rounded-full">NOVO</span>
            </CardTitle>
            <CardDescription className="text-xs">Cardápio personalizado pela Dra. Luna em segundos</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
              <Utensils className="h-3 w-3" /> Estilo
            </label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map(s => <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" /> Duração
            </label>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3" className="text-xs">3 dias</SelectItem>
                <SelectItem value="5" className="text-xs">5 dias</SelectItem>
                <SelectItem value="7" className="text-xs">7 dias (semana)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generate} disabled={loading} className="w-full bg-gold hover:bg-gold/90 text-background">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Montando seu plano...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gerar plano personalizado</>}
        </Button>

        {!profile?.current_weight && (
          <p className="text-[10px] text-muted-foreground text-center">💡 Preencha seu perfil de saúde para um plano mais preciso.</p>
        )}

        {plan && (
          <div className="mt-3 max-h-[500px] overflow-y-auto rounded-lg border border-border/50 bg-background/40 p-4">
            <div className="prose prose-sm prose-invert max-w-none [&>*]:my-1.5 [&_strong]:text-gold [&_h3]:text-gold [&_h3]:mt-3 [&_h2]:text-gold [&_table]:text-xs">
              <ReactMarkdown>{plan}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
