import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Scale, Utensils, Dumbbell, Pill, Apple, Plus, Trash2, Edit2, Check, X, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HealthProfile {
  id?: string;
  goal: string;
  current_weight: number | null;
  target_weight: number | null;
  height_cm: number | null;
}

interface WeightRecord {
  id: string;
  weight: number;
  recorded_at: string;
  note: string | null;
  created_at: string;
}

interface DietEntry {
  id: string;
  meal_type: string;
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  entry_date: string;
}

interface ExerciseEntry {
  id: string;
  exercise_name: string;
  category: string;
  duration_minutes: number | null;
  sets: number | null;
  reps: number | null;
  weight_kg: number | null;
  calories_burned: number | null;
  entry_date: string;
  notes: string | null;
}

const mealTypes = [
  { value: "café_da_manhã", label: "☀️ Café da Manhã" },
  { value: "lanche_manhã", label: "🍎 Lanche da Manhã" },
  { value: "almoço", label: "🍽️ Almoço" },
  { value: "lanche_tarde", label: "🥤 Lanche da Tarde" },
  { value: "jantar", label: "🌙 Jantar" },
  { value: "ceia", label: "🍵 Ceia" },
];

const exerciseCategories = [
  { value: "cardio", label: "🏃‍♀️ Cardio" },
  { value: "musculação", label: "💪 Musculação" },
  { value: "yoga", label: "🧘‍♀️ Yoga/Pilates" },
  { value: "funcional", label: "⚡ Funcional" },
  { value: "alongamento", label: "🤸‍♀️ Alongamento" },
  { value: "outro", label: "🏋️ Outro" },
];

const dietPlans = [
  {
    name: "Low Carb",
    desc: "Redução de carboidratos, foco em proteínas e gorduras boas",
    meals: {
      "Café": "Ovos mexidos + abacate + café sem açúcar",
      "Almoço": "Frango grelhado + salada + azeite",
      "Jantar": "Salmão + legumes assados",
      "Lanches": "Castanhas, queijo, iogurte natural"
    },
    macros: { prot: "30%", carb: "20%", fat: "50%" }
  },
  {
    name: "Mediterrânea",
    desc: "Equilíbrio com azeite, grãos, peixes e vegetais",
    meals: {
      "Café": "Pão integral + azeite + frutas",
      "Almoço": "Peixe + arroz integral + salada",
      "Jantar": "Sopa de legumes + grão-de-bico",
      "Lanches": "Frutas, nozes, hummus"
    },
    macros: { prot: "25%", carb: "45%", fat: "30%" }
  },
  {
    name: "Hiperproteica",
    desc: "Ideal para ganho de massa muscular",
    meals: {
      "Café": "Shake de whey + aveia + banana",
      "Almoço": "Peito de frango 200g + arroz + feijão + salada",
      "Jantar": "Carne magra + batata-doce + brócolis",
      "Lanches": "Whey, ovos, queijo cottage"
    },
    macros: { prot: "40%", carb: "35%", fat: "25%" }
  },
  {
    name: "Vegana Equilibrada",
    desc: "Proteínas vegetais combinadas para nutrição completa",
    meals: {
      "Café": "Tofu mexido + pão integral + suco verde",
      "Almoço": "Arroz + lentilha + legumes salteados",
      "Jantar": "Grão-de-bico assado + quinoa + verduras",
      "Lanches": "Pasta de amendoim, frutas, granola"
    },
    macros: { prot: "25%", carb: "50%", fat: "25%" }
  },
];

const nutritionTable = [
  { food: "Frango (100g)", cal: 165, prot: 31, carb: 0, fat: 3.6 },
  { food: "Arroz integral (100g)", cal: 111, prot: 2.6, carb: 23, fat: 0.9 },
  { food: "Ovo (1 un)", cal: 72, prot: 6.3, carb: 0.4, fat: 4.8 },
  { food: "Batata-doce (100g)", cal: 86, prot: 1.6, carb: 20, fat: 0.1 },
  { food: "Abacate (100g)", cal: 160, prot: 2, carb: 8.5, fat: 14.7 },
  { food: "Banana (1 un)", cal: 89, prot: 1.1, carb: 23, fat: 0.3 },
  { food: "Whey Protein (30g)", cal: 120, prot: 24, carb: 3, fat: 1.5 },
  { food: "Salmão (100g)", cal: 208, prot: 20, carb: 0, fat: 13 },
  { food: "Aveia (40g)", cal: 152, prot: 5.3, carb: 27, fat: 2.7 },
  { food: "Feijão preto (100g)", cal: 132, prot: 8.9, carb: 24, fat: 0.5 },
  { food: "Brócolis (100g)", cal: 34, prot: 2.8, carb: 7, fat: 0.4 },
  { food: "Iogurte natural (170g)", cal: 100, prot: 17, carb: 6, fat: 0.7 },
  { food: "Amendoim (30g)", cal: 170, prot: 7, carb: 5, fat: 14 },
  { food: "Queijo cottage (100g)", cal: 98, prot: 11, carb: 3.4, fat: 4.3 },
];

const supplements = [
  { name: "Vitamina D3", dose: "2.000-5.000 UI/dia", benefit: "Imunidade, ossos, humor, absorção de cálcio", tip: "Tomar com gordura para melhor absorção. Ideal pela manhã." },
  { name: "Ômega 3 (EPA/DHA)", dose: "1.000-2.000 mg/dia", benefit: "Anti-inflamatório, coração, cérebro, pele", tip: "Prefira de fonte marinha (óleo de peixe). Tomar com refeições." },
  { name: "Magnésio", dose: "200-400 mg/dia", benefit: "Sono, relaxamento muscular, ansiedade, cãibras", tip: "Glicinato ou bisglicinato são as melhores formas. Tomar à noite." },
  { name: "Vitamina B12", dose: "1.000-2.500 mcg/dia", benefit: "Energia, sistema nervoso, formação de sangue", tip: "Essencial para vegetarianos/veganos. Sublingual é mais eficaz." },
  { name: "Vitamina C", dose: "500-1.000 mg/dia", benefit: "Imunidade, colágeno, antioxidante, absorção de ferro", tip: "Evitar doses muito altas (>2g). Dividir em 2 doses é melhor." },
  { name: "Zinco", dose: "15-30 mg/dia", benefit: "Imunidade, pele, cabelo, cicatrização", tip: "Tomar com estômago vazio. Evitar tomar junto com cálcio." },
  { name: "Colágeno", dose: "5-10 g/dia", benefit: "Pele, unhas, cabelo, articulações", tip: "Peptídeos hidrolisados são melhor absorvidos. Tomar em jejum." },
  { name: "Creatina", dose: "3-5 g/dia", benefit: "Força muscular, performance, cognição", tip: "Monoidratada é a mais estudada. Não precisa de fase de carga." },
  { name: "Probióticos", dose: "10-50 bilhões UFC/dia", benefit: "Intestino, imunidade, absorção de nutrientes", tip: "Escolha multi-cepas. Refrigerados são geralmente melhores." },
];

export default function SaudePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");

  // Health profile
  const [profile, setProfile] = useState<HealthProfile>({ goal: "emagrecer", current_weight: null, target_weight: null, height_cm: null });
  const [editingProfile, setEditingProfile] = useState(false);

  // Weight records
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightNote, setNewWeightNote] = useState("");

  // Diet
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietForm, setDietForm] = useState({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" });
  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Exercise
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ exercise_name: "", category: "cardio", duration_minutes: "", sets: "", reps: "", weight_kg: "", calories_burned: "", notes: "" });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseDate, setExerciseDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    if (user) {
      loadProfile();
      loadWeightRecords();
    }
  }, [user]);

  useEffect(() => {
    if (user) loadDietEntries();
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) loadExerciseEntries();
  }, [user, exerciseDate]);

  async function loadProfile() {
    const { data } = await supabase.from("health_profiles").select("*").eq("user_id", user!.id).maybeSingle();
    if (data) setProfile(data as any);
  }

  async function saveProfile() {
    if (!user) return;
    const payload = { user_id: user.id, goal: profile.goal, current_weight: profile.current_weight, target_weight: profile.target_weight, height_cm: profile.height_cm };
    let error;
    if (profile.id) {
      ({ error } = await supabase.from("health_profiles").update(payload).eq("id", profile.id));
    } else {
      ({ error } = await supabase.from("health_profiles").insert(payload));
    }
    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
      return;
    }
    await loadProfile();
    setEditingProfile(false);
    toast.success("Perfil salvo!");
  }

  async function loadWeightRecords() {
    const { data } = await supabase.from("weight_records").select("*").eq("user_id", user!.id).order("recorded_at", { ascending: false }).limit(30);
    if (data) setWeightRecords(data as any);
  }

  async function addWeightRecord() {
    if (!user || !newWeight) return;
    const { error } = await supabase.from("weight_records").insert({ user_id: user.id, weight: parseFloat(newWeight), note: newWeightNote || null });
    if (error) { toast.error("Erro ao registrar peso: " + error.message); return; }
    setNewWeight("");
    setNewWeightNote("");
    await loadWeightRecords();
    await supabase.from("health_profiles").update({ current_weight: parseFloat(newWeight) }).eq("user_id", user.id);
    await loadProfile();
    toast.success("Peso registrado!");
  }

  async function deleteWeightRecord(id: string) {
    await supabase.from("weight_records").delete().eq("id", id);
    await loadWeightRecords();
    toast.success("Registro removido!");
  }

  async function loadDietEntries() {
    const { data } = await supabase.from("diet_entries").select("*").eq("user_id", user!.id).eq("entry_date", selectedDate).order("created_at", { ascending: true });
    if (data) setDietEntries(data as any);
  }

  async function saveDietEntry() {
    if (!user || !dietForm.description.trim()) { toast.error("Preencha a descrição da refeição"); return; }
    const payload = {
      user_id: user.id,
      meal_type: dietForm.meal_type,
      description: dietForm.description.trim(),
      calories: dietForm.calories ? parseInt(dietForm.calories) : null,
      protein: dietForm.protein ? parseFloat(dietForm.protein) : null,
      carbs: dietForm.carbs ? parseFloat(dietForm.carbs) : null,
      fat: dietForm.fat ? parseFloat(dietForm.fat) : null,
      entry_date: selectedDate,
    };
    let error;
    if (editingDietId) {
      ({ error } = await supabase.from("diet_entries").update(payload).eq("id", editingDietId));
      setEditingDietId(null);
    } else {
      ({ error } = await supabase.from("diet_entries").insert(payload));
    }
    if (error) { toast.error("Erro ao salvar refeição: " + error.message); return; }
    setDietForm({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" });
    setShowDietForm(false);
    await loadDietEntries();
    toast.success(editingDietId ? "Refeição atualizada!" : "Refeição registrada!");
  }

  function editDietEntry(entry: DietEntry) {
    setDietForm({
      meal_type: entry.meal_type,
      description: entry.description,
      calories: entry.calories?.toString() || "",
      protein: entry.protein?.toString() || "",
      carbs: entry.carbs?.toString() || "",
      fat: entry.fat?.toString() || "",
    });
    setEditingDietId(entry.id);
    setShowDietForm(true);
  }

  async function deleteDietEntry(id: string) {
    await supabase.from("diet_entries").delete().eq("id", id);
    await loadDietEntries();
    toast.success("Refeição removida!");
  }

  async function loadExerciseEntries() {
    const { data } = await supabase.from("exercise_entries").select("*").eq("user_id", user!.id).eq("entry_date", exerciseDate).order("created_at", { ascending: true });
    if (data) setExerciseEntries(data as any);
  }

  async function saveExerciseEntry() {
    if (!user || !exerciseForm.exercise_name.trim()) return;
    const payload = {
      user_id: user.id,
      exercise_name: exerciseForm.exercise_name.trim(),
      category: exerciseForm.category,
      duration_minutes: exerciseForm.duration_minutes ? parseInt(exerciseForm.duration_minutes) : null,
      sets: exerciseForm.sets ? parseInt(exerciseForm.sets) : null,
      reps: exerciseForm.reps ? parseInt(exerciseForm.reps) : null,
      weight_kg: exerciseForm.weight_kg ? parseFloat(exerciseForm.weight_kg) : null,
      calories_burned: exerciseForm.calories_burned ? parseInt(exerciseForm.calories_burned) : null,
      entry_date: exerciseDate,
      notes: exerciseForm.notes || null,
    };
    if (editingExerciseId) {
      await supabase.from("exercise_entries").update(payload).eq("id", editingExerciseId);
      setEditingExerciseId(null);
    } else {
      await supabase.from("exercise_entries").insert(payload);
    }
    setExerciseForm({ exercise_name: "", category: "cardio", duration_minutes: "", sets: "", reps: "", weight_kg: "", calories_burned: "", notes: "" });
    setShowExerciseForm(false);
    await loadExerciseEntries();
    toast.success(editingExerciseId ? "Exercício atualizado!" : "Exercício registrado!");
  }

  function editExerciseEntry(entry: ExerciseEntry) {
    setExerciseForm({
      exercise_name: entry.exercise_name,
      category: entry.category,
      duration_minutes: entry.duration_minutes?.toString() || "",
      sets: entry.sets?.toString() || "",
      reps: entry.reps?.toString() || "",
      weight_kg: entry.weight_kg?.toString() || "",
      calories_burned: entry.calories_burned?.toString() || "",
      notes: entry.notes || "",
    });
    setEditingExerciseId(entry.id);
    setShowExerciseForm(true);
  }

  async function deleteExerciseEntry(id: string) {
    await supabase.from("exercise_entries").delete().eq("id", id);
    await loadExerciseEntries();
    toast.success("Exercício removido!");
  }

  // Calculations
  const weightProgress = (() => {
    if (!profile.current_weight || !profile.target_weight) return null;
    const start = weightRecords.length > 0 ? weightRecords[weightRecords.length - 1].weight : profile.current_weight;
    const diff = Math.abs(start - profile.target_weight);
    if (diff === 0) return 100;
    const currentDiff = Math.abs(profile.current_weight - profile.target_weight);
    return Math.min(100, Math.max(0, Math.round(((diff - currentDiff) / diff) * 100)));
  })();

  const dailyTotals = dietEntries.reduce((acc, e) => ({
    calories: acc.calories + (e.calories || 0),
    protein: acc.protein + (e.protein || 0),
    carbs: acc.carbs + (e.carbs || 0),
    fat: acc.fat + (e.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const bmi = profile.current_weight && profile.height_cm
    ? (profile.current_weight / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
    : null;

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Saúde & Fitness</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Dieta, peso, exercícios e nutrição</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1">
          <TabsTrigger value="perfil" className="text-[10px] px-1 py-1.5">⚖️ Perfil</TabsTrigger>
          <TabsTrigger value="dieta" className="text-[10px] px-1 py-1.5">🍽️ Dieta</TabsTrigger>
          <TabsTrigger value="treino" className="text-[10px] px-1 py-1.5">💪 Treino</TabsTrigger>
          <TabsTrigger value="tabela" className="text-[10px] px-1 py-1.5">📊 Tabela</TabsTrigger>
          <TabsTrigger value="suplem" className="text-[10px] px-1 py-1.5">💊 Suplem.</TabsTrigger>
        </TabsList>

        {/* ====== PERFIL & PESO ====== */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Meu Perfil de Saúde</CardTitle>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
                  {editingProfile ? <X className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Objetivo</label>
                    <Select value={profile.goal} onValueChange={(v) => setProfile({ ...profile, goal: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emagrecer">🔥 Emagrecer</SelectItem>
                        <SelectItem value="ganhar_massa">💪 Ganhar Massa</SelectItem>
                        <SelectItem value="manter">⚖️ Manter Peso</SelectItem>
                        <SelectItem value="saude">❤️ Saúde Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Peso atual (kg)</label>
                      <Input type="number" step="0.1" value={profile.current_weight || ""} onChange={(e) => setProfile({ ...profile, current_weight: e.target.value ? parseFloat(e.target.value) : null })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Meta (kg)</label>
                      <Input type="number" step="0.1" value={profile.target_weight || ""} onChange={(e) => setProfile({ ...profile, target_weight: e.target.value ? parseFloat(e.target.value) : null })} />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Altura (cm)</label>
                      <Input type="number" value={profile.height_cm || ""} onChange={(e) => setProfile({ ...profile, height_cm: e.target.value ? parseFloat(e.target.value) : null })} />
                    </div>
                  </div>
                  <Button onClick={saveProfile} className="w-full" size="sm">
                    <Check className="h-4 w-4 mr-1" /> Salvar Perfil
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {profile.goal === "emagrecer" ? "🔥 Emagrecer" : profile.goal === "ganhar_massa" ? "💪 Ganhar Massa" : profile.goal === "manter" ? "⚖️ Manter" : "❤️ Saúde"}
                    </span>
                    {bmi && (
                      <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                        IMC: {bmi}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{profile.current_weight || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Peso Atual</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{profile.target_weight || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Meta</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="text-lg font-bold text-foreground">{profile.height_cm || "—"}</p>
                      <p className="text-[10px] text-muted-foreground">Altura cm</p>
                    </div>
                  </div>
                  {weightProgress !== null && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso para meta</span>
                        <span className="font-semibold text-primary">{weightProgress}%</span>
                      </div>
                      <Progress value={weightProgress} className="h-2" />
                      {profile.current_weight && profile.target_weight && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          {profile.goal === "emagrecer" ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                          Faltam {Math.abs(profile.current_weight - profile.target_weight).toFixed(1)} kg
                        </p>
                      )}
                    </div>
                  )}
                  {!profile.id && (
                    <p className="text-xs text-muted-foreground italic">Clique no ícone de edição para configurar seu perfil</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weight Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" /> Registro de Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input type="number" step="0.1" placeholder="Peso (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="flex-1" />
                <Input placeholder="Nota (opcional)" value={newWeightNote} onChange={(e) => setNewWeightNote(e.target.value)} className="flex-1" />
                <Button size="sm" onClick={addWeightRecord} disabled={!newWeight}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {weightRecords.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                    <div>
                      <span className="font-semibold text-foreground">{Number(r.weight).toFixed(1)} kg</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        {format(new Date(r.recorded_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {r.note && <span className="text-xs text-muted-foreground ml-2">— {r.note}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteWeightRecord(r.id)}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
                {weightRecords.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro ainda</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== DIETA ====== */}
        <TabsContent value="dieta" className="space-y-4">
          {/* Diet Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Apple className="h-4 w-4 text-primary" /> Opções de Dieta
              </CardTitle>
              <CardDescription>Escolha um plano base e adapte ao seu perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {dietPlans.map((plan, i) => (
                  <AccordionItem key={i} value={`plan-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold text-foreground">{plan.name}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{plan.desc}</p>
                      <div className="flex gap-2">
                        {Object.entries(plan.macros).map(([k, v]) => (
                          <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                      <div className="space-y-1 mt-2">
                        {Object.entries(plan.meals).map(([meal, desc]) => (
                          <div key={meal} className="text-xs">
                            <span className="font-semibold text-foreground">{meal}:</span>{" "}
                            <span className="text-muted-foreground">{desc}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Daily Diet Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-primary" /> Registro Diário
                </CardTitle>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-36 text-xs" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Daily totals */}
              {dietEntries.length > 0 && (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <p className="text-sm font-bold text-primary">{dailyTotals.calories}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{dailyTotals.protein.toFixed(0)}g</p>
                    <p className="text-[10px] text-muted-foreground">Proteína</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{dailyTotals.carbs.toFixed(0)}g</p>
                    <p className="text-[10px] text-muted-foreground">Carbs</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{dailyTotals.fat.toFixed(0)}g</p>
                    <p className="text-[10px] text-muted-foreground">Gordura</p>
                  </div>
                </div>
              )}

              {!showDietForm && (
                <Button variant="outline" className="w-full" size="sm" onClick={() => { setShowDietForm(true); setEditingDietId(null); setDietForm({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" }); }}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Refeição
                </Button>
              )}

              {showDietForm && (
                <div className="space-y-2 p-3 rounded-lg border border-border">
                  <Select value={dietForm.meal_type} onValueChange={(v) => setDietForm({ ...dietForm, meal_type: v })}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {mealTypes.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="O que você comeu?" value={dietForm.description} onChange={(e) => setDietForm({ ...dietForm, description: e.target.value })} className="text-sm min-h-[60px]" />
                  <div className="grid grid-cols-4 gap-2">
                    <Input type="number" placeholder="kcal" value={dietForm.calories} onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Prot (g)" value={dietForm.protein} onChange={(e) => setDietForm({ ...dietForm, protein: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Carb (g)" value={dietForm.carbs} onChange={(e) => setDietForm({ ...dietForm, carbs: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Gord (g)" value={dietForm.fat} onChange={(e) => setDietForm({ ...dietForm, fat: e.target.value })} className="text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDietEntry} className="flex-1">
                      <Check className="h-4 w-4 mr-1" /> {editingDietId ? "Atualizar" : "Salvar"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowDietForm(false); setEditingDietId(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {dietEntries.map((entry) => {
                  const mealLabel = mealTypes.find((m) => m.value === entry.meal_type)?.label || entry.meal_type;
                  return (
                    <div key={entry.id} className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary">{mealLabel}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editDietEntry(entry)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteDietEntry(entry.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground">{entry.description}</p>
                      {(entry.calories || entry.protein || entry.carbs || entry.fat) && (
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          {entry.calories && <span>{entry.calories} kcal</span>}
                          {entry.protein && <span>{Number(entry.protein).toFixed(0)}g prot</span>}
                          {entry.carbs && <span>{Number(entry.carbs).toFixed(0)}g carb</span>}
                          {entry.fat && <span>{Number(entry.fat).toFixed(0)}g gord</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
                {dietEntries.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma refeição registrada para este dia</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TREINO ====== */}
        <TabsContent value="treino" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" /> Meus Exercícios
                </CardTitle>
                <Input type="date" value={exerciseDate} onChange={(e) => setExerciseDate(e.target.value)} className="w-36 text-xs" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showExerciseForm && (
                <Button variant="outline" className="w-full" size="sm" onClick={() => { setShowExerciseForm(true); setEditingExerciseId(null); setExerciseForm({ exercise_name: "", category: "cardio", duration_minutes: "", sets: "", reps: "", weight_kg: "", calories_burned: "", notes: "" }); }}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Exercício
                </Button>
              )}

              {showExerciseForm && (
                <div className="space-y-2 p-3 rounded-lg border border-border">
                  <Input placeholder="Nome do exercício" value={exerciseForm.exercise_name} onChange={(e) => setExerciseForm({ ...exerciseForm, exercise_name: e.target.value })} className="text-sm" />
                  <Select value={exerciseForm.category} onValueChange={(v) => setExerciseForm({ ...exerciseForm, category: v })}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {exerciseCategories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-3 gap-2">
                    <Input type="number" placeholder="Min" value={exerciseForm.duration_minutes} onChange={(e) => setExerciseForm({ ...exerciseForm, duration_minutes: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Séries" value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Reps" value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value })} className="text-xs" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" step="0.5" placeholder="Carga (kg)" value={exerciseForm.weight_kg} onChange={(e) => setExerciseForm({ ...exerciseForm, weight_kg: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="kcal queimadas" value={exerciseForm.calories_burned} onChange={(e) => setExerciseForm({ ...exerciseForm, calories_burned: e.target.value })} className="text-xs" />
                  </div>
                  <Textarea placeholder="Observações (opcional)" value={exerciseForm.notes} onChange={(e) => setExerciseForm({ ...exerciseForm, notes: e.target.value })} className="text-sm min-h-[40px]" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveExerciseEntry} className="flex-1">
                      <Check className="h-4 w-4 mr-1" /> {editingExerciseId ? "Atualizar" : "Salvar"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowExerciseForm(false); setEditingExerciseId(null); }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {exerciseEntries.map((entry) => {
                  const catLabel = exerciseCategories.find((c) => c.value === entry.category)?.label || entry.category;
                  return (
                    <div key={entry.id} className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-semibold text-foreground">{entry.exercise_name}</span>
                          <span className="text-[10px] text-primary ml-2">{catLabel}</span>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editExerciseEntry(entry)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteExerciseEntry(entry.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-3 text-[10px] text-muted-foreground flex-wrap">
                        {entry.duration_minutes && <span>⏱️ {entry.duration_minutes} min</span>}
                        {entry.sets && entry.reps && <span>📋 {entry.sets}x{entry.reps}</span>}
                        {entry.weight_kg && <span>🏋️ {Number(entry.weight_kg).toFixed(1)} kg</span>}
                        {entry.calories_burned && <span>🔥 {entry.calories_burned} kcal</span>}
                      </div>
                      {entry.notes && <p className="text-xs text-muted-foreground italic">{entry.notes}</p>}
                    </div>
                  );
                })}
                {exerciseEntries.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum exercício registrado para este dia</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TABELA NUTRICIONAL ====== */}
        <TabsContent value="tabela" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                📊 Tabela Nutricional
              </CardTitle>
              <CardDescription>Valores nutricionais dos alimentos mais comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-2 font-semibold text-foreground">Alimento</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">kcal</th>
                      <th className="text-right py-2 px-1 font-semibold text-primary">Prot</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">Carb</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">Gord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nutritionTable.map((item) => (
                      <tr key={item.food} className="border-b border-border/50">
                        <td className="py-2 pr-2 text-foreground">{item.food}</td>
                        <td className="text-right py-2 px-1 text-muted-foreground">{item.cal}</td>
                        <td className="text-right py-2 px-1 text-primary font-semibold">{item.prot}g</td>
                        <td className="text-right py-2 px-1 text-muted-foreground">{item.carb}g</td>
                        <td className="text-right py-2 px-1 text-muted-foreground">{item.fat}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== SUPLEMENTAÇÃO ====== */}
        <TabsContent value="suplem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" /> Suplementação & Vitaminas
              </CardTitle>
              <CardDescription>Dicas baseadas em evidências científicas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-destructive mb-3 font-semibold">⚠️ Consulte um profissional de saúde antes de iniciar qualquer suplementação.</p>
              <Accordion type="multiple" className="w-full">
                {supplements.map((s, i) => (
                  <AccordionItem key={i} value={`sup-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold text-foreground">{s.name}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{s.dose}</span>
                      </div>
                      <p className="text-xs text-foreground"><strong>Benefícios:</strong> {s.benefit}</p>
                      <p className="text-xs text-muted-foreground italic">💡 {s.tip}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
