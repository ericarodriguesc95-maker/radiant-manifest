import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Heart, Scale, Utensils, Dumbbell, Pill, Apple, Plus, Trash2, Edit2, Check, X, TrendingDown, TrendingUp, Camera, Calculator, Search, Syringe, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// ============ TYPES ============
interface HealthProfile {
  id?: string;
  goal: string;
  current_weight: number | null;
  target_weight: number | null;
  height_cm: number | null;
  age: number | null;
  sex: string;
  activity_level: string;
}

interface WeightRecord {
  id: string;
  weight: number;
  recorded_at: string;
  note: string | null;
  photo_url: string | null;
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
  photo_url: string | null;
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

interface UserSupplement {
  id: string;
  name: string;
  dose: string;
  category: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface SupplementCheckin {
  id: string;
  supplement_id: string;
  checkin_date: string;
  taken: boolean;
}

// ============ CONSTANTS ============
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
  { name: "Low Carb", desc: "Redução de carboidratos, foco em proteínas e gorduras boas", meals: { "Café": "Ovos mexidos + abacate + café sem açúcar", "Almoço": "Frango grelhado + salada + azeite", "Jantar": "Salmão + legumes assados", "Lanches": "Castanhas, queijo, iogurte natural" }, macros: { prot: "30%", carb: "20%", fat: "50%" } },
  { name: "Mediterrânea", desc: "Equilíbrio com azeite, grãos, peixes e vegetais", meals: { "Café": "Pão integral + azeite + frutas", "Almoço": "Peixe + arroz integral + salada", "Jantar": "Sopa de legumes + grão-de-bico", "Lanches": "Frutas, nozes, hummus" }, macros: { prot: "25%", carb: "45%", fat: "30%" } },
  { name: "Hiperproteica", desc: "Ideal para ganho de massa muscular", meals: { "Café": "Shake de whey + aveia + banana", "Almoço": "Peito de frango 200g + arroz + feijão + salada", "Jantar": "Carne magra + batata-doce + brócolis", "Lanches": "Whey, ovos, queijo cottage" }, macros: { prot: "40%", carb: "35%", fat: "25%" } },
  { name: "Vegana Equilibrada", desc: "Proteínas vegetais combinadas para nutrição completa", meals: { "Café": "Tofu mexido + pão integral + suco verde", "Almoço": "Arroz + lentilha + legumes salteados", "Jantar": "Grão-de-bico assado + quinoa + verduras", "Lanches": "Pasta de amendoim, frutas, granola" }, macros: { prot: "25%", carb: "50%", fat: "25%" } },
];

// Expanded food database
const foodDatabase = [
  // Proteínas
  { food: "Frango grelhado", portion: "100g", cal: 165, prot: 31, carb: 0, fat: 3.6, category: "proteína" },
  { food: "Carne bovina magra", portion: "100g", cal: 250, prot: 26, carb: 0, fat: 15, category: "proteína" },
  { food: "Salmão", portion: "100g", cal: 208, prot: 20, carb: 0, fat: 13, category: "proteína" },
  { food: "Atum", portion: "100g", cal: 130, prot: 29, carb: 0, fat: 1, category: "proteína" },
  { food: "Tilápia", portion: "100g", cal: 96, prot: 20, carb: 0, fat: 1.7, category: "proteína" },
  { food: "Camarão", portion: "100g", cal: 99, prot: 24, carb: 0.2, fat: 0.3, category: "proteína" },
  { food: "Ovo inteiro", portion: "1 un (50g)", cal: 72, prot: 6.3, carb: 0.4, fat: 4.8, category: "proteína" },
  { food: "Clara de ovo", portion: "1 un (33g)", cal: 17, prot: 3.6, carb: 0.2, fat: 0.1, category: "proteína" },
  { food: "Carne de porco", portion: "100g", cal: 242, prot: 27, carb: 0, fat: 14, category: "proteína" },
  { food: "Peru", portion: "100g", cal: 135, prot: 30, carb: 0, fat: 1, category: "proteína" },
  { food: "Queijo cottage", portion: "100g", cal: 98, prot: 11, carb: 3.4, fat: 4.3, category: "proteína" },
  { food: "Queijo minas", portion: "30g", cal: 75, prot: 5, carb: 0.5, fat: 6, category: "proteína" },
  { food: "Iogurte natural", portion: "170g", cal: 100, prot: 17, carb: 6, fat: 0.7, category: "proteína" },
  { food: "Iogurte grego", portion: "170g", cal: 145, prot: 15, carb: 8, fat: 5, category: "proteína" },
  { food: "Whey Protein", portion: "30g", cal: 120, prot: 24, carb: 3, fat: 1.5, category: "proteína" },
  { food: "Tofu firme", portion: "100g", cal: 76, prot: 8, carb: 1.9, fat: 4.8, category: "proteína" },
  // Carboidratos
  { food: "Arroz branco", portion: "100g cozido", cal: 130, prot: 2.7, carb: 28, fat: 0.3, category: "carboidrato" },
  { food: "Arroz integral", portion: "100g cozido", cal: 111, prot: 2.6, carb: 23, fat: 0.9, category: "carboidrato" },
  { food: "Batata-doce", portion: "100g", cal: 86, prot: 1.6, carb: 20, fat: 0.1, category: "carboidrato" },
  { food: "Batata inglesa", portion: "100g", cal: 77, prot: 2, carb: 17, fat: 0.1, category: "carboidrato" },
  { food: "Macarrão", portion: "100g cozido", cal: 131, prot: 5, carb: 25, fat: 1.1, category: "carboidrato" },
  { food: "Pão integral", portion: "1 fatia (25g)", cal: 62, prot: 2.5, carb: 11, fat: 1, category: "carboidrato" },
  { food: "Pão francês", portion: "1 un (50g)", cal: 135, prot: 4, carb: 25, fat: 2, category: "carboidrato" },
  { food: "Aveia", portion: "40g", cal: 152, prot: 5.3, carb: 27, fat: 2.7, category: "carboidrato" },
  { food: "Tapioca", portion: "1 un (30g)", cal: 100, prot: 0, carb: 25, fat: 0, category: "carboidrato" },
  { food: "Mandioca", portion: "100g", cal: 125, prot: 0.6, carb: 30, fat: 0.3, category: "carboidrato" },
  { food: "Feijão preto", portion: "100g cozido", cal: 132, prot: 8.9, carb: 24, fat: 0.5, category: "carboidrato" },
  { food: "Feijão carioca", portion: "100g cozido", cal: 76, prot: 4.8, carb: 14, fat: 0.5, category: "carboidrato" },
  { food: "Lentilha", portion: "100g cozida", cal: 116, prot: 9, carb: 20, fat: 0.4, category: "carboidrato" },
  { food: "Grão-de-bico", portion: "100g cozido", cal: 164, prot: 8.9, carb: 27, fat: 2.6, category: "carboidrato" },
  { food: "Quinoa", portion: "100g cozida", cal: 120, prot: 4.4, carb: 21, fat: 1.9, category: "carboidrato" },
  { food: "Milho", portion: "100g", cal: 96, prot: 3.2, carb: 21, fat: 1.2, category: "carboidrato" },
  // Frutas
  { food: "Banana", portion: "1 un (100g)", cal: 89, prot: 1.1, carb: 23, fat: 0.3, category: "fruta" },
  { food: "Maçã", portion: "1 un (130g)", cal: 68, prot: 0.4, carb: 18, fat: 0.2, category: "fruta" },
  { food: "Laranja", portion: "1 un (130g)", cal: 61, prot: 1.2, carb: 15, fat: 0.2, category: "fruta" },
  { food: "Morango", portion: "100g", cal: 32, prot: 0.7, carb: 8, fat: 0.3, category: "fruta" },
  { food: "Manga", portion: "100g", cal: 60, prot: 0.8, carb: 15, fat: 0.4, category: "fruta" },
  { food: "Abacaxi", portion: "100g", cal: 50, prot: 0.5, carb: 13, fat: 0.1, category: "fruta" },
  { food: "Uva", portion: "100g", cal: 69, prot: 0.7, carb: 18, fat: 0.2, category: "fruta" },
  { food: "Melancia", portion: "100g", cal: 30, prot: 0.6, carb: 8, fat: 0.2, category: "fruta" },
  { food: "Mamão", portion: "100g", cal: 43, prot: 0.5, carb: 11, fat: 0.3, category: "fruta" },
  { food: "Abacate", portion: "100g", cal: 160, prot: 2, carb: 8.5, fat: 14.7, category: "fruta" },
  { food: "Kiwi", portion: "1 un (75g)", cal: 46, prot: 0.8, carb: 11, fat: 0.4, category: "fruta" },
  // Verduras e Legumes
  { food: "Brócolis", portion: "100g", cal: 34, prot: 2.8, carb: 7, fat: 0.4, category: "verdura" },
  { food: "Alface", portion: "100g", cal: 15, prot: 1.4, carb: 2.9, fat: 0.2, category: "verdura" },
  { food: "Tomate", portion: "100g", cal: 18, prot: 0.9, carb: 3.9, fat: 0.2, category: "verdura" },
  { food: "Cenoura", portion: "100g", cal: 41, prot: 0.9, carb: 10, fat: 0.2, category: "verdura" },
  { food: "Espinafre", portion: "100g", cal: 23, prot: 2.9, carb: 3.6, fat: 0.4, category: "verdura" },
  { food: "Abobrinha", portion: "100g", cal: 17, prot: 1.2, carb: 3.1, fat: 0.3, category: "verdura" },
  { food: "Berinjela", portion: "100g", cal: 25, prot: 1, carb: 6, fat: 0.2, category: "verdura" },
  { food: "Cebola", portion: "100g", cal: 40, prot: 1.1, carb: 9, fat: 0.1, category: "verdura" },
  { food: "Pepino", portion: "100g", cal: 15, prot: 0.7, carb: 3.6, fat: 0.1, category: "verdura" },
  { food: "Couve-flor", portion: "100g", cal: 25, prot: 1.9, carb: 5, fat: 0.3, category: "verdura" },
  // Gorduras
  { food: "Azeite de oliva", portion: "1 colher (13ml)", cal: 117, prot: 0, carb: 0, fat: 13, category: "gordura" },
  { food: "Amendoim", portion: "30g", cal: 170, prot: 7, carb: 5, fat: 14, category: "gordura" },
  { food: "Castanha do Pará", portion: "3 un (10g)", cal: 66, prot: 1.4, carb: 1.2, fat: 6.7, category: "gordura" },
  { food: "Castanha de caju", portion: "30g", cal: 165, prot: 5, carb: 9, fat: 13, category: "gordura" },
  { food: "Amêndoas", portion: "30g", cal: 173, prot: 6, carb: 6, fat: 15, category: "gordura" },
  { food: "Pasta de amendoim", portion: "1 colher (15g)", cal: 94, prot: 3.6, carb: 3, fat: 8, category: "gordura" },
  { food: "Coco ralado", portion: "30g", cal: 100, prot: 1, carb: 3, fat: 10, category: "gordura" },
  { food: "Manteiga", portion: "10g", cal: 72, prot: 0, carb: 0, fat: 8, category: "gordura" },
  { food: "Semente de chia", portion: "15g", cal: 73, prot: 2.5, carb: 6, fat: 4.6, category: "gordura" },
  { food: "Semente de linhaça", portion: "15g", cal: 80, prot: 2.7, carb: 4.3, fat: 6.3, category: "gordura" },
  // Laticínios
  { food: "Leite integral", portion: "200ml", cal: 124, prot: 6, carb: 10, fat: 6.4, category: "laticínio" },
  { food: "Leite desnatado", portion: "200ml", cal: 68, prot: 6.6, carb: 10, fat: 0.4, category: "laticínio" },
  { food: "Queijo muçarela", portion: "30g", cal: 90, prot: 6, carb: 0.5, fat: 7, category: "laticínio" },
  { food: "Requeijão", portion: "30g", cal: 80, prot: 2, carb: 1, fat: 7.5, category: "laticínio" },
  // Bebidas
  { food: "Café sem açúcar", portion: "200ml", cal: 2, prot: 0.3, carb: 0, fat: 0, category: "bebida" },
  { food: "Suco de laranja natural", portion: "200ml", cal: 90, prot: 1.4, carb: 21, fat: 0.4, category: "bebida" },
  { food: "Refrigerante", portion: "350ml", cal: 140, prot: 0, carb: 35, fat: 0, category: "bebida" },
  { food: "Água de coco", portion: "200ml", cal: 40, prot: 0.4, carb: 9, fat: 0.2, category: "bebida" },
  // Doces e snacks
  { food: "Chocolate amargo 70%", portion: "30g", cal: 170, prot: 2.2, carb: 13, fat: 12, category: "doce" },
  { food: "Granola", portion: "40g", cal: 180, prot: 4, carb: 28, fat: 6, category: "doce" },
  { food: "Mel", portion: "1 colher (21g)", cal: 64, prot: 0, carb: 17, fat: 0, category: "doce" },
  { food: "Açaí", portion: "200ml", cal: 247, prot: 3.2, carb: 36, fat: 11, category: "doce" },
];

const supplementSuggestions = [
  { name: "Vitamina D3", dose: "2.000-5.000 UI/dia", benefit: "Imunidade, ossos, humor", tip: "Tomar com gordura para melhor absorção. Ideal pela manhã." },
  { name: "Ômega 3", dose: "1.000-2.000 mg/dia", benefit: "Anti-inflamatório, coração, cérebro", tip: "Prefira de fonte marinha. Tomar com refeições." },
  { name: "Magnésio", dose: "200-400 mg/dia", benefit: "Sono, relaxamento, cãibras", tip: "Glicinato ou bisglicinato à noite." },
  { name: "Vitamina B12", dose: "1.000-2.500 mcg/dia", benefit: "Energia, sistema nervoso", tip: "Essencial para vegetarianos. Sublingual é mais eficaz." },
  { name: "Vitamina C", dose: "500-1.000 mg/dia", benefit: "Imunidade, colágeno, antioxidante", tip: "Dividir em 2 doses." },
  { name: "Zinco", dose: "15-30 mg/dia", benefit: "Imunidade, pele, cabelo", tip: "Tomar com estômago vazio." },
  { name: "Colágeno", dose: "5-10 g/dia", benefit: "Pele, unhas, cabelo, articulações", tip: "Peptídeos hidrolisados em jejum." },
  { name: "Creatina", dose: "3-5 g/dia", benefit: "Força muscular, performance", tip: "Monoidratada, não precisa de carga." },
  { name: "Probióticos", dose: "10-50 bilhões UFC/dia", benefit: "Intestino, imunidade", tip: "Multi-cepas refrigerados." },
  { name: "Ferro", dose: "14-18 mg/dia", benefit: "Prevenção de anemia, energia", tip: "Tomar com vitamina C. Evitar com leite." },
  { name: "Cálcio", dose: "1.000 mg/dia", benefit: "Ossos e dentes", tip: "Dividir doses. Não tomar com ferro." },
  { name: "Ácido fólico", dose: "400 mcg/dia", benefit: "Formação celular, gestação", tip: "Essencial para mulheres em idade fértil." },
  { name: "Biotina", dose: "30-100 mcg/dia", benefit: "Cabelo, unhas, pele", tip: "Pode interferir em exames de tireoide." },
  { name: "Melatonina", dose: "0.5-3 mg/dia", benefit: "Regulação do sono", tip: "30min antes de dormir, em ambiente escuro." },
];

const contraceptiveOptions = [
  { name: "Pílula combinada", desc: "Contém estrogênio e progesterona", pros: "Regular ciclo, reduz cólica, acne", cons: "Deve tomar todo dia no mesmo horário", tips: "Se esquecer, tome assim que lembrar. Se >12h, use preservativo por 7 dias." },
  { name: "Pílula só de progesterona", desc: "Sem estrogênio, para quem amamenta ou tem contraindicação", pros: "Segura durante amamentação", cons: "Horário mais rigoroso (máx 3h de atraso)", tips: "Ideal para quem tem enxaqueca com aura ou >35 anos fumante." },
  { name: "DIU Hormonal (Mirena/Kyleena)", desc: "Dispositivo intrauterino com levonorgestrel", pros: "Dura 5 anos, reduz sangramento, baixa manutenção", cons: "Inserção pode ser dolorida, custo inicial alto", tips: "Ideal para quem esquece pílulas. Pode parar menstruação." },
  { name: "DIU de Cobre", desc: "Sem hormônios, ação mecânica e química", pros: "Dura 10 anos, sem hormônios, sem efeitos hormonais", cons: "Pode aumentar cólica e sangramento", tips: "Boa opção para quem quer evitar hormônios." },
  { name: "Implante subdérmico (Implanon)", desc: "Bastão no braço que libera progesterona", pros: "Dura 3 anos, muito eficaz (99.9%)", cons: "Pode causar sangramento irregular", tips: "Inserção rápida no consultório." },
  { name: "Injetável mensal", desc: "Combinação estrogênio + progesterona", pros: "Uma vez por mês, sem esquecimentos diários", cons: "Pode causar retenção de líquido", tips: "Aplicar sempre na mesma data. Margem de 3 dias." },
  { name: "Injetável trimestral", desc: "Só progesterona (Depo-Provera)", pros: "1 aplicação a cada 3 meses", cons: "Pode demorar para voltar a fertilidade", tips: "Ideal para quem não quer menstruar." },
  { name: "Adesivo anticoncepcional", desc: "Adesivo semanal com hormônios", pros: "Troca semanal, praticidade", cons: "Pode descolar, visível", tips: "Colocar em pele limpa e seca. Trocar a cada 7 dias." },
  { name: "Anel vaginal (NuvaRing)", desc: "Anel flexível com hormônios", pros: "1x por mês, dose hormonal baixa e estável", cons: "Pode causar desconforto inicial", tips: "Inserir no 1º dia da menstruação. Retirar após 21 dias." },
];

const tirzepatideInfo = {
  name: "Tirzepatida (Mounjaro)",
  description: "Agonista duplo GIP/GLP-1 para controle de peso e diabetes tipo 2",
  doses: [
    { dose: "2.5 mg", phase: "Início", duration: "Semanas 1-4", note: "Dose de adaptação" },
    { dose: "5 mg", phase: "Escalonamento", duration: "Semanas 5-8", note: "Primeira dose terapêutica" },
    { dose: "7.5 mg", phase: "Escalonamento", duration: "Semanas 9-12", note: "Ajuste conforme tolerância" },
    { dose: "10 mg", phase: "Manutenção", duration: "Semanas 13-16", note: "Dose eficaz para maioria" },
    { dose: "12.5 mg", phase: "Manutenção", duration: "Semanas 17-20", note: "Se necessário mais resultado" },
    { dose: "15 mg", phase: "Dose máxima", duration: "Semana 21+", note: "Dose máxima aprovada" },
  ],
  applicationGuide: [
    "🧼 Lavar as mãos com água e sabão",
    "📍 Escolher local: abdômen, coxa ou parte posterior do braço",
    "🔄 Alternar o local a cada aplicação (mínimo 5cm de distância)",
    "💉 Limpar a pele com álcool 70%",
    "📐 Segurar a caneta em ângulo de 90° em relação à pele",
    "⏱️ Pressionar e manter por 10 segundos até o clique",
    "🚫 NÃO massagear o local após a aplicação",
    "📅 Aplicar sempre no mesmo dia da semana",
    "🌡️ Armazenar na geladeira (2-8°C). Não congelar.",
  ],
  feedingAfter: [
    "🕐 Esperar 30-60 minutos antes de comer",
    "🥗 Iniciar com proteína leve (frango, peixe, ovo)",
    "💧 Hidratar-se bem (2-3L de água/dia)",
    "🚫 Evitar alimentos gordurosos e frituras nas primeiras 24h",
    "🍽️ Comer porções menores e mais frequentes",
    "⚠️ Evitar álcool por 48h após a aplicação",
    "🥣 Prefira alimentos leves se sentir náusea",
    "🍌 Inclua fibras e frutas para evitar constipação",
  ],
  sideEffects: ["Náusea (mais comum, melhora com o tempo)", "Diarreia ou constipação", "Dor no local da aplicação", "Perda de apetite (efeito esperado)", "Fadiga nas primeiras semanas", "Refluxo gastroesofágico"],
  contraindications: ["Histórico de câncer medular de tireoide", "Neoplasia endócrina múltipla tipo 2", "Pancreatite ativa", "Gestação e amamentação", "Alergia aos componentes"],
};

const otherInjections = [
  {
    name: "Semaglutida (Ozempic/Wegovy)",
    description: "Agonista GLP-1 para diabetes tipo 2 e obesidade",
    doses: ["0.25mg (sem 1-4)", "0.5mg (sem 5-8)", "1mg (sem 9-12)", "1.7mg (sem 13-16)", "2.4mg (sem 17+)"],
    tips: "Aplicação semanal subcutânea. Mesmo dia da semana. Pode causar náusea inicial.",
  },
  {
    name: "Liraglutida (Saxenda)",
    description: "Agonista GLP-1 para controle de peso",
    doses: ["0.6mg/dia (sem 1)", "1.2mg/dia (sem 2)", "1.8mg/dia (sem 3)", "2.4mg/dia (sem 4)", "3.0mg/dia (sem 5+)"],
    tips: "Aplicação diária subcutânea. Pode ser abdômen, coxa ou braço. Escalonamento mais gradual.",
  },
];

const activityMultipliers: Record<string, { label: string; factor: number }> = {
  sedentario: { label: "Sedentária", factor: 1.2 },
  leve: { label: "Levemente ativa", factor: 1.375 },
  moderado: { label: "Moderadamente ativa", factor: 1.55 },
  ativo: { label: "Muito ativa", factor: 1.725 },
  muito_ativo: { label: "Extremamente ativa", factor: 1.9 },
};

function calculateTMB(weight: number, height: number, age: number, sex: string): number {
  if (sex === "masculino") return 10 * weight + 6.25 * height - 5 * age + 5;
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

async function uploadPhoto(userId: string, file: File, folder: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("health-media").upload(path, file);
  if (error) { toast.error("Erro ao enviar foto"); return null; }
  const { data } = supabase.storage.from("health-media").getPublicUrl(path);
  return data.publicUrl;
}

export default function SaudePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("perfil");

  // Profile
  const [profile, setProfile] = useState<HealthProfile>({ goal: "emagrecer", current_weight: null, target_weight: null, height_cm: null, age: null, sex: "feminino", activity_level: "moderado" });
  const [editingProfile, setEditingProfile] = useState(false);

  // Weight
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightNote, setNewWeightNote] = useState("");
  const [weightPhoto, setWeightPhoto] = useState<File | null>(null);
  const weightFileRef = useRef<HTMLInputElement>(null);
  const [expandedWeightPhoto, setExpandedWeightPhoto] = useState<string | null>(null);

  // Diet
  const [dietEntries, setDietEntries] = useState<DietEntry[]>([]);
  const [showDietForm, setShowDietForm] = useState(false);
  const [dietForm, setDietForm] = useState({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" });
  const [editingDietId, setEditingDietId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [dietPhoto, setDietPhoto] = useState<File | null>(null);
  const dietFileRef = useRef<HTMLInputElement>(null);
  const [foodSearch, setFoodSearch] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<Array<{ food: typeof foodDatabase[0]; qty: number }>>([]);

  // Exercise
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({ exercise_name: "", category: "cardio", duration_minutes: "", sets: "", reps: "", weight_kg: "", calories_burned: "", notes: "" });
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [exerciseDate, setExerciseDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Supplements
  const [userSupplements, setUserSupplements] = useState<UserSupplement[]>([]);
  const [checkins, setCheckins] = useState<SupplementCheckin[]>([]);
  const [showAddSupplement, setShowAddSupplement] = useState(false);
  const [suppForm, setSuppForm] = useState({ name: "", dose: "", category: "suplemento", notes: "" });
  const [suppDate, setSuppDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Load data
  useEffect(() => { if (user) { loadProfile(); loadWeightRecords(); loadUserSupplements(); } }, [user]);
  useEffect(() => { if (user) loadDietEntries(); }, [user, selectedDate]);
  useEffect(() => { if (user) loadExerciseEntries(); }, [user, exerciseDate]);
  useEffect(() => { if (user) loadCheckins(); }, [user, suppDate]);

  // ====== DATA FUNCTIONS ======
  const parseNumberOrNull = (value: unknown): number | null => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseNumber = (value: unknown): number => parseNumberOrNull(value) ?? 0;

  const formatDateLabel = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  async function loadProfile() {
    if (!user) return;
    const { data, error } = await supabase.from("health_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (error) {
      toast.error("Erro ao carregar perfil: " + error.message);
      return;
    }
    if (data) {
      setProfile({
        id: data.id,
        goal: data.goal,
        current_weight: parseNumberOrNull(data.current_weight),
        target_weight: parseNumberOrNull(data.target_weight),
        height_cm: parseNumberOrNull(data.height_cm),
        age: parseNumberOrNull(data.age),
        sex: data.sex,
        activity_level: data.activity_level,
      });
    }
  }

  async function saveProfile() {
    if (!user) return;

    const payload = {
      user_id: user.id,
      goal: profile.goal,
      current_weight: parseNumberOrNull(profile.current_weight),
      target_weight: parseNumberOrNull(profile.target_weight),
      height_cm: parseNumberOrNull(profile.height_cm),
      age: parseNumberOrNull(profile.age),
      sex: profile.sex,
      activity_level: profile.activity_level,
    };

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
    if (!user) return;
    const { data, error } = await supabase
      .from("weight_records")
      .select("*")
      .eq("user_id", user.id)
      .order("recorded_at", { ascending: false })
      .limit(90);

    if (error) {
      toast.error("Erro ao carregar registros de peso: " + error.message);
      return;
    }

    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      weight: parseNumber(row.weight),
    })) as WeightRecord[];

    setWeightRecords(normalized);
  }

  async function addWeightRecord() {
    if (!user || !newWeight) return;

    const parsedWeight = Number.parseFloat(newWeight);
    if (!Number.isFinite(parsedWeight)) {
      toast.error("Informe um peso válido");
      return;
    }

    let photoUrl: string | null = null;
    if (weightPhoto) {
      photoUrl = await uploadPhoto(user.id, weightPhoto, "weight");
    }

    const { error } = await supabase.from("weight_records").insert({
      user_id: user.id,
      weight: parsedWeight,
      note: newWeightNote || null,
      photo_url: photoUrl,
    });

    if (error) {
      toast.error("Erro ao registrar peso: " + error.message);
      return;
    }

    setNewWeight("");
    setNewWeightNote("");
    setWeightPhoto(null);
    if (weightFileRef.current) weightFileRef.current.value = "";

    await loadWeightRecords();
    await supabase.from("health_profiles").update({ current_weight: parsedWeight }).eq("user_id", user.id);
    await loadProfile();
    toast.success("Peso registrado!");
  }

  async function deleteWeightRecord(id: string) {
    const { error } = await supabase.from("weight_records").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover peso: " + error.message);
      return;
    }
    await loadWeightRecords();
    toast.success("Registro removido!");
  }

  async function loadDietEntries() {
    if (!user) return;

    const { data, error } = await supabase
      .from("diet_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", selectedDate)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar refeições: " + error.message);
      return;
    }

    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      calories: parseNumberOrNull(row.calories),
      protein: parseNumberOrNull(row.protein),
      carbs: parseNumberOrNull(row.carbs),
      fat: parseNumberOrNull(row.fat),
    })) as DietEntry[];

    setDietEntries(normalized);
  }

  async function saveDietEntry() {
    if (!user) return;

    let description = dietForm.description.trim();
    let calories = parseNumberOrNull(dietForm.calories);
    let protein = parseNumberOrNull(dietForm.protein);
    let carbs = parseNumberOrNull(dietForm.carbs);
    let fat = parseNumberOrNull(dietForm.fat);

    if (selectedFoods.length > 0) {
      const foodDescs = selectedFoods.map((f) => `${f.food.food} x${f.qty}`);
      description = description ? `${description}\n${foodDescs.join(", ")}` : foodDescs.join(", ");
      calories = parseNumber(calories) + selectedFoods.reduce((a, f) => a + f.food.cal * f.qty, 0);
      protein = parseNumber(protein) + selectedFoods.reduce((a, f) => a + f.food.prot * f.qty, 0);
      carbs = parseNumber(carbs) + selectedFoods.reduce((a, f) => a + f.food.carb * f.qty, 0);
      fat = parseNumber(fat) + selectedFoods.reduce((a, f) => a + f.food.fat * f.qty, 0);
    }

    if (!description) {
      toast.error("Preencha a descrição ou selecione alimentos");
      return;
    }

    let photoUrl: string | null = null;
    if (dietPhoto) {
      photoUrl = await uploadPhoto(user.id, dietPhoto, "diet");
    }

    const payload: any = {
      user_id: user.id,
      meal_type: dietForm.meal_type,
      description,
      calories: calories !== null ? Math.round(calories) : null,
      protein: protein !== null ? Math.round(protein * 10) / 10 : null,
      carbs: carbs !== null ? Math.round(carbs * 10) / 10 : null,
      fat: fat !== null ? Math.round(fat * 10) / 10 : null,
      entry_date: selectedDate,
    };

    if (photoUrl) payload.photo_url = photoUrl;

    const isEditing = Boolean(editingDietId);
    let error;
    if (isEditing) {
      ({ error } = await supabase.from("diet_entries").update(payload).eq("id", editingDietId));
      setEditingDietId(null);
    } else {
      ({ error } = await supabase.from("diet_entries").insert(payload));
    }

    if (error) {
      toast.error("Erro ao salvar refeição: " + error.message);
      return;
    }

    setDietForm({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" });
    setDietPhoto(null);
    setSelectedFoods([]);
    setFoodSearch("");
    if (dietFileRef.current) dietFileRef.current.value = "";
    setShowDietForm(false);

    await loadDietEntries();
    toast.success(isEditing ? "Refeição atualizada!" : "Refeição registrada!");
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
    setSelectedFoods([]);
    setShowDietForm(true);
  }

  async function deleteDietEntry(id: string) {
    const { error } = await supabase.from("diet_entries").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover refeição: " + error.message);
      return;
    }
    await loadDietEntries();
    toast.success("Refeição removida!");
  }

  async function loadExerciseEntries() {
    if (!user) return;

    const { data, error } = await supabase
      .from("exercise_entries")
      .select("*")
      .eq("user_id", user.id)
      .eq("entry_date", exerciseDate)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar exercícios: " + error.message);
      return;
    }

    const normalized = (data ?? []).map((row: any) => ({
      ...row,
      duration_minutes: parseNumberOrNull(row.duration_minutes),
      sets: parseNumberOrNull(row.sets),
      reps: parseNumberOrNull(row.reps),
      weight_kg: parseNumberOrNull(row.weight_kg),
      calories_burned: parseNumberOrNull(row.calories_burned),
    })) as ExerciseEntry[];

    setExerciseEntries(normalized);
  }

  async function saveExerciseEntry() {
    if (!user || !exerciseForm.exercise_name.trim()) {
      toast.error("Preencha o nome do exercício");
      return;
    }

    const payload = {
      user_id: user.id,
      exercise_name: exerciseForm.exercise_name.trim(),
      category: exerciseForm.category,
      duration_minutes: parseNumberOrNull(exerciseForm.duration_minutes),
      sets: parseNumberOrNull(exerciseForm.sets),
      reps: parseNumberOrNull(exerciseForm.reps),
      weight_kg: parseNumberOrNull(exerciseForm.weight_kg),
      calories_burned: parseNumberOrNull(exerciseForm.calories_burned),
      entry_date: exerciseDate,
      notes: exerciseForm.notes || null,
    };

    const isEditing = Boolean(editingExerciseId);
    let error;
    if (isEditing) {
      ({ error } = await supabase.from("exercise_entries").update(payload).eq("id", editingExerciseId));
      setEditingExerciseId(null);
    } else {
      ({ error } = await supabase.from("exercise_entries").insert(payload));
    }

    if (error) {
      toast.error("Erro ao salvar exercício: " + error.message);
      return;
    }

    setExerciseForm({
      exercise_name: "",
      category: "cardio",
      duration_minutes: "",
      sets: "",
      reps: "",
      weight_kg: "",
      calories_burned: "",
      notes: "",
    });
    setShowExerciseForm(false);

    await loadExerciseEntries();
    toast.success(isEditing ? "Exercício atualizado!" : "Exercício registrado!");
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
    const { error } = await supabase.from("exercise_entries").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover exercício: " + error.message);
      return;
    }
    await loadExerciseEntries();
    toast.success("Exercício removido!");
  }

  // Supplements
  async function loadUserSupplements() {
    if (!user) return;
    const { data, error } = await supabase.from("user_supplements").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (error) {
      toast.error("Erro ao carregar suplementos: " + error.message);
      return;
    }
    if (data) setUserSupplements(data as any);
  }

  async function loadCheckins() {
    if (!user) return;
    const { data, error } = await supabase.from("supplement_checkins").select("*").eq("user_id", user.id).eq("checkin_date", suppDate);
    if (error) {
      toast.error("Erro ao carregar check-ins: " + error.message);
      return;
    }
    if (data) setCheckins(data as any);
  }

  async function addUserSupplement() {
    if (!user || !suppForm.name.trim()) {
      toast.error("Preencha o nome do suplemento");
      return;
    }

    const { error } = await supabase.from("user_supplements").insert({
      user_id: user.id,
      name: suppForm.name.trim(),
      dose: suppForm.dose,
      category: suppForm.category,
      notes: suppForm.notes || null,
    });

    if (error) {
      toast.error("Erro ao adicionar: " + error.message);
      return;
    }

    setSuppForm({ name: "", dose: "", category: "suplemento", notes: "" });
    setShowAddSupplement(false);
    await loadUserSupplements();
    toast.success("Suplemento adicionado!");
  }

  async function deleteUserSupplement(id: string) {
    const { error } = await supabase.from("user_supplements").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao remover suplemento: " + error.message);
      return;
    }
    await loadUserSupplements();
    toast.success("Suplemento removido!");
  }

  async function toggleCheckin(supplementId: string) {
    if (!user) return;

    const existing = checkins.find((c) => c.supplement_id === supplementId);

    if (existing) {
      const { error } = await supabase.from("supplement_checkins").delete().eq("id", existing.id);
      if (error) {
        toast.error("Erro ao atualizar check-in: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("supplement_checkins").insert({
        user_id: user.id,
        supplement_id: supplementId,
        checkin_date: suppDate,
        taken: true,
      });
      if (error) {
        toast.error("Erro ao atualizar check-in: " + error.message);
        return;
      }
    }

    await loadCheckins();
  }

  function addFoodToList(food: typeof foodDatabase[0]) {
    setSelectedFoods((prev) => {
      const existing = prev.find((f) => f.food.food === food.food);
      if (existing) return prev.map((f) => (f.food.food === food.food ? { ...f, qty: f.qty + 1 } : f));
      return [...prev, { food, qty: 1 }];
    });
    setFoodSearch("");
  }

  function updateFoodQty(foodName: string, qty: number) {
    if (qty <= 0) {
      setSelectedFoods((prev) => prev.filter((f) => f.food.food !== foodName));
      return;
    }
    setSelectedFoods((prev) => prev.map((f) => (f.food.food === foodName ? { ...f, qty } : f)));
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

  const dailyTotals = dietEntries.reduce(
    (acc, e) => ({
      calories: acc.calories + parseNumber(e.calories),
      protein: acc.protein + parseNumber(e.protein),
      carbs: acc.carbs + parseNumber(e.carbs),
      fat: acc.fat + parseNumber(e.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const bmi = profile.current_weight && profile.height_cm ? (profile.current_weight / Math.pow(profile.height_cm / 100, 2)).toFixed(1) : null;
  const tmb = profile.current_weight && profile.height_cm && profile.age ? calculateTMB(profile.current_weight, profile.height_cm, profile.age, profile.sex) : null;
  const dailyCalories = tmb ? Math.round(tmb * (activityMultipliers[profile.activity_level]?.factor || 1.55)) : null;
  const goalCalories = dailyCalories ? (profile.goal === "emagrecer" ? Math.round(dailyCalories - 500) : profile.goal === "ganhar_massa" ? Math.round(dailyCalories + 300) : dailyCalories) : null;

  const chartData = [...weightRecords].reverse().map((r) => ({
    date: formatDateLabel(r.recorded_at),
    peso: parseNumber(r.weight),
  }));

  const filteredFoods = foodSearch.length >= 2 ? foodDatabase.filter(f => f.food.toLowerCase().includes(foodSearch.toLowerCase())).slice(0, 8) : [];

  const foodTotals = selectedFoods.reduce((a, f) => ({
    cal: a.cal + f.food.cal * f.qty, prot: a.prot + f.food.prot * f.qty, carb: a.carb + f.food.carb * f.qty, fat: a.fat + f.food.fat * f.qty,
  }), { cal: 0, prot: 0, carb: 0, fat: 0 });

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-2xl mx-auto">
      <div className="mb-6">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-display font-semibold text-foreground">Saúde & Fitness</h1>
        </div>
        <p className="text-sm text-muted-foreground font-body">Dieta, peso, exercícios, suplementos e medicações</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full h-auto p-1">
          <TabsTrigger value="perfil" className="text-[10px] px-1 py-1.5">⚖️ Perfil</TabsTrigger>
          <TabsTrigger value="dieta" className="text-[10px] px-1 py-1.5">🍽️ Dieta</TabsTrigger>
          <TabsTrigger value="treino" className="text-[10px] px-1 py-1.5">💪 Treino</TabsTrigger>
          <TabsTrigger value="suplem" className="text-[10px] px-1 py-1.5">💊 Suplem.</TabsTrigger>
          <TabsTrigger value="medic" className="text-[10px] px-1 py-1.5">💉 Medic.</TabsTrigger>
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Sexo</label>
                      <Select value={profile.sex} onValueChange={(v) => setProfile({ ...profile, sex: v })}>
                        <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Idade</label>
                      <Input type="number" value={profile.age || ""} onChange={(e) => setProfile({ ...profile, age: e.target.value ? parseInt(e.target.value) : null })} placeholder="Idade" />
                    </div>
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
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nível de Atividade</label>
                    <Select value={profile.activity_level} onValueChange={(v) => setProfile({ ...profile, activity_level: v })}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(activityMultipliers).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={saveProfile} className="w-full" size="sm">
                    <Check className="h-4 w-4 mr-1" /> Salvar Perfil
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {profile.goal === "emagrecer" ? "🔥 Emagrecer" : profile.goal === "ganhar_massa" ? "💪 Ganhar Massa" : profile.goal === "manter" ? "⚖️ Manter" : "❤️ Saúde"}
                    </span>
                    {bmi && <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">IMC: {bmi}</span>}
                    {profile.age && <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs">{profile.age} anos</span>}
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
                  {!profile.id && <p className="text-xs text-muted-foreground italic">Clique no ícone de edição para configurar seu perfil</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {tmb && dailyCalories && goalCalories && (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calculator className="h-4 w-4 text-primary" /> Calculadora TMB & Calorias</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{Math.round(tmb)}</p>
                    <p className="text-[10px] text-muted-foreground">TMB (kcal)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{dailyCalories}</p>
                    <p className="text-[10px] text-muted-foreground">Gasto Diário</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <p className="text-lg font-bold text-primary">{goalCalories}</p>
                    <p className="text-[10px] text-muted-foreground">Meta kcal/dia</p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {profile.goal === "emagrecer" ? "🔥 Déficit de 500 kcal (~0.5 kg/semana)" : profile.goal === "ganhar_massa" ? "💪 Superávit de 300 kcal para ganho de massa" : "⚖️ Manutenção do peso atual"}
                </p>
              </CardContent>
            </Card>
          )}

          {chartData.length >= 2 && (
            <Card>
              <CardHeader><CardTitle className="text-base">📈 Evolução do Peso</CardTitle></CardHeader>
              <CardContent>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                      {profile.target_weight && <ReferenceLine y={profile.target_weight} stroke="hsl(var(--primary))" strokeDasharray="5 5" label={{ value: "Meta", fontSize: 10, fill: "hsl(var(--primary))" }} />}
                      <Line type="monotone" dataKey="peso" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Scale className="h-4 w-4 text-primary" /> Registro de Peso</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input type="number" step="0.1" placeholder="Peso (kg)" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="flex-1" />
                  <Input placeholder="Nota (opcional)" value={newWeightNote} onChange={(e) => setNewWeightNote(e.target.value)} className="flex-1" />
                </div>
                <div className="flex gap-2">
                  <input ref={weightFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setWeightPhoto(e.target.files?.[0] || null)} />
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => weightFileRef.current?.click()}>
                    <Camera className="h-3 w-3 mr-1" /> {weightPhoto ? weightPhoto.name.slice(0, 15) + "…" : "Foto evolução"}
                  </Button>
                  <Button size="sm" onClick={addWeightRecord} disabled={!newWeight}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {weightRecords.map((r) => (
                  <div key={r.id} className="p-2 rounded-lg bg-muted/30 space-y-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-foreground text-sm">{Number(r.weight).toFixed(1)} kg</span>
                        <span className="text-muted-foreground text-xs ml-2">{format(new Date(r.recorded_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {r.note && <span className="text-xs text-muted-foreground ml-2">— {r.note}</span>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteWeightRecord(r.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                    </div>
                    {r.photo_url && (
                      <img src={r.photo_url} alt="Evolução" className={`w-full rounded-lg cursor-pointer object-cover ${expandedWeightPhoto === r.id ? "" : "max-h-32"}`} onClick={() => setExpandedWeightPhoto(expandedWeightPhoto === r.id ? null : r.id)} />
                    )}
                  </div>
                ))}
                {weightRecords.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhum registro ainda</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== DIETA ====== */}
        <TabsContent value="dieta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Apple className="h-4 w-4 text-primary" /> Planos de Dieta</CardTitle>
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
                          <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase">{k}: {v}</span>
                        ))}
                      </div>
                      <div className="space-y-1 mt-2">
                        {Object.entries(plan.meals).map(([meal, desc]) => (
                          <div key={meal} className="text-xs"><span className="font-semibold text-foreground">{meal}:</span> <span className="text-muted-foreground">{desc}</span></div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-4 w-4 text-primary" /> Registro Diário</CardTitle>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-36 text-xs" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
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

              {goalCalories && dietEntries.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Calorias consumidas / meta</span>
                    <span className="font-semibold text-primary">{dailyTotals.calories} / {goalCalories} kcal</span>
                  </div>
                  <Progress value={Math.min(100, (dailyTotals.calories / goalCalories) * 100)} className="h-2" />
                </div>
              )}

              {!showDietForm && (
                <Button variant="outline" className="w-full" size="sm" onClick={() => { setShowDietForm(true); setEditingDietId(null); setDietForm({ meal_type: "almoço", description: "", calories: "", protein: "", carbs: "", fat: "" }); setDietPhoto(null); setSelectedFoods([]); }}>
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

                  {/* Food search */}
                  <div className="relative">
                    <div className="flex items-center gap-1">
                      <Search className="h-3 w-3 text-muted-foreground" />
                      <Input placeholder="Buscar alimento no banco de dados..." value={foodSearch} onChange={(e) => setFoodSearch(e.target.value)} className="text-xs" />
                    </div>
                    {filteredFoods.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredFoods.map((f) => (
                          <button key={f.food} className="w-full text-left px-3 py-2 hover:bg-muted/50 text-xs flex justify-between items-center border-b border-border/50 last:border-0" onClick={() => addFoodToList(f)}>
                            <div>
                              <span className="font-semibold text-foreground">{f.food}</span>
                              <span className="text-muted-foreground ml-1">({f.portion})</span>
                            </div>
                            <span className="text-primary font-semibold">{f.cal} kcal</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected foods */}
                  {selectedFoods.length > 0 && (
                    <div className="space-y-1 p-2 rounded bg-muted/30">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Alimentos selecionados:</p>
                      {selectedFoods.map((sf) => (
                        <div key={sf.food.food} className="flex items-center justify-between text-xs">
                          <span className="text-foreground flex-1">{sf.food.food}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateFoodQty(sf.food.food, sf.qty - 1)}>-</Button>
                            <span className="w-6 text-center font-semibold text-foreground">{sf.qty}</span>
                            <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => updateFoodQty(sf.food.food, sf.qty + 1)}>+</Button>
                            <span className="text-primary ml-1 w-14 text-right">{(sf.food.cal * sf.qty)} kcal</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 text-[10px] text-primary font-semibold mt-1 pt-1 border-t border-border/50">
                        <span>{Math.round(foodTotals.cal)} kcal</span>
                        <span>{Math.round(foodTotals.prot)}g prot</span>
                        <span>{Math.round(foodTotals.carb)}g carb</span>
                        <span>{Math.round(foodTotals.fat)}g gord</span>
                      </div>
                    </div>
                  )}

                  <Textarea placeholder="Descrição adicional (opcional)" value={dietForm.description} onChange={(e) => setDietForm({ ...dietForm, description: e.target.value })} className="text-sm min-h-[40px]" />
                  
                  <p className="text-[10px] text-muted-foreground">Ajuste manual (sobrescreve se preenchido):</p>
                  <div className="grid grid-cols-4 gap-2">
                    <Input type="number" placeholder="kcal" value={dietForm.calories} onChange={(e) => setDietForm({ ...dietForm, calories: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Prot (g)" value={dietForm.protein} onChange={(e) => setDietForm({ ...dietForm, protein: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Carb (g)" value={dietForm.carbs} onChange={(e) => setDietForm({ ...dietForm, carbs: e.target.value })} className="text-xs" />
                    <Input type="number" placeholder="Gord (g)" value={dietForm.fat} onChange={(e) => setDietForm({ ...dietForm, fat: e.target.value })} className="text-xs" />
                  </div>

                  <div>
                    <input ref={dietFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setDietPhoto(e.target.files?.[0] || null)} />
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => dietFileRef.current?.click()}>
                      <Camera className="h-3 w-3 mr-1" /> {dietPhoto ? dietPhoto.name.slice(0, 20) + "…" : "📸 Foto da refeição"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveDietEntry} className="flex-1">
                      <Check className="h-4 w-4 mr-1" /> {editingDietId ? "Atualizar" : "Salvar"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setShowDietForm(false); setEditingDietId(null); setSelectedFoods([]); }}>
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
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editDietEntry(entry)}><Edit2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteDietEntry(entry.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-line">{entry.description}</p>
                      {entry.photo_url && <img src={entry.photo_url} alt="Refeição" className="w-full max-h-40 object-cover rounded-lg" />}
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

          {/* Tabela nutricional inline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📊 Tabela Nutricional</CardTitle>
              <CardDescription>Valores dos alimentos mais comuns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-2 font-semibold text-foreground">Alimento</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">kcal</th>
                      <th className="text-right py-2 px-1 font-semibold text-primary">Prot</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">Carb</th>
                      <th className="text-right py-2 px-1 font-semibold text-foreground">Gord</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foodDatabase.map((item) => (
                      <tr key={item.food} className="border-b border-border/50">
                        <td className="py-1.5 pr-2 text-foreground">{item.food} <span className="text-muted-foreground">({item.portion})</span></td>
                        <td className="text-right py-1.5 px-1 text-muted-foreground">{item.cal}</td>
                        <td className="text-right py-1.5 px-1 text-primary font-semibold">{item.prot}g</td>
                        <td className="text-right py-1.5 px-1 text-muted-foreground">{item.carb}g</td>
                        <td className="text-right py-1.5 px-1 text-muted-foreground">{item.fat}g</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== TREINO ====== */}
        <TabsContent value="treino" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Dumbbell className="h-4 w-4 text-primary" /> Meus Exercícios</CardTitle>
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
                    <Button variant="ghost" size="sm" onClick={() => { setShowExerciseForm(false); setEditingExerciseId(null); }}><X className="h-4 w-4" /></Button>
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
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => editExerciseEntry(entry)}><Edit2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteExerciseEntry(entry.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
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

        {/* ====== SUPLEMENTAÇÃO ====== */}
        <TabsContent value="suplem" className="space-y-4">
          {/* My supplements tracker */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Pill className="h-4 w-4 text-primary" /> Meus Suplementos</CardTitle>
                <Input type="date" value={suppDate} onChange={(e) => setSuppDate(e.target.value)} className="w-36 text-xs" />
              </div>
              <CardDescription>Registre e acompanhe seus suplementos diários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userSupplements.filter(s => s.is_active).length > 0 ? (
                <div className="space-y-2">
                  {userSupplements.filter(s => s.is_active).map((s) => {
                    const taken = checkins.some(c => c.supplement_id === s.id);
                    return (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 flex-1">
                          <Checkbox checked={taken} onCheckedChange={() => toggleCheckin(s.id)} />
                          <div>
                            <p className={`text-sm font-semibold ${taken ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.name}</p>
                            {s.dose && <p className="text-[10px] text-muted-foreground">{s.dose}</p>}
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteUserSupplement(s.id)}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="text-xs text-muted-foreground text-center">
                    ✅ {checkins.length}/{userSupplements.filter(s => s.is_active).length} tomados hoje
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum suplemento cadastrado ainda</p>
              )}

              {!showAddSupplement ? (
                <Button variant="outline" className="w-full" size="sm" onClick={() => setShowAddSupplement(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Suplemento
                </Button>
              ) : (
                <div className="space-y-2 p-3 rounded-lg border border-border">
                  <Input placeholder="Nome do suplemento" value={suppForm.name} onChange={(e) => setSuppForm({ ...suppForm, name: e.target.value })} className="text-sm" />
                  <Input placeholder="Dose (ex: 1000mg/dia)" value={suppForm.dose} onChange={(e) => setSuppForm({ ...suppForm, dose: e.target.value })} className="text-xs" />
                  <Select value={suppForm.category} onValueChange={(v) => setSuppForm({ ...suppForm, category: v })}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suplemento">💊 Suplemento</SelectItem>
                      <SelectItem value="vitamina">🌟 Vitamina</SelectItem>
                      <SelectItem value="medicamento">💉 Medicamento</SelectItem>
                      <SelectItem value="contraceptivo">🛡️ Contraceptivo</SelectItem>
                      <SelectItem value="fitoterápico">🌿 Fitoterápico</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="Observações (opcional)" value={suppForm.notes} onChange={(e) => setSuppForm({ ...suppForm, notes: e.target.value })} className="text-sm min-h-[40px]" />
                  
                  {/* Quick add from suggestions */}
                  <div>
                    <p className="text-[10px] text-muted-foreground mb-1">Adicionar rápido:</p>
                    <div className="flex flex-wrap gap-1">
                      {supplementSuggestions.slice(0, 6).map((s) => (
                        <button key={s.name} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] hover:bg-primary/20 transition-colors" onClick={() => setSuppForm({ ...suppForm, name: s.name, dose: s.dose })}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={addUserSupplement} className="flex-1">
                      <Check className="h-4 w-4 mr-1" /> Salvar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddSupplement(false)}><X className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Supplement guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📚 Guia de Suplementação</CardTitle>
              <CardDescription>Dicas baseadas em evidências científicas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-destructive mb-3 font-semibold">⚠️ Consulte um profissional antes de iniciar qualquer suplementação.</p>
              <Accordion type="multiple" className="w-full">
                {supplementSuggestions.map((s, i) => (
                  <AccordionItem key={i} value={`sup-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold text-foreground">{s.name}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">{s.dose}</span>
                      <p className="text-xs text-foreground"><strong>Benefícios:</strong> {s.benefit}</p>
                      <p className="text-xs text-muted-foreground italic">💡 {s.tip}</p>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSuppForm({ name: s.name, dose: s.dose, category: "suplemento", notes: "" }); setShowAddSupplement(true); }}>
                        <Plus className="h-3 w-3 mr-1" /> Adicionar aos meus
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ====== MEDICAÇÕES (Contraceptivos + Tirzepatida) ====== */}
        <TabsContent value="medic" className="space-y-4">
          {/* Contraceptives */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Contraceptivos</CardTitle>
              <CardDescription>Opções, orientações e dicas sobre métodos contraceptivos</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-destructive mb-3 font-semibold">⚠️ Consulte seu ginecologista para escolher o método mais adequado para você.</p>
              <Accordion type="single" collapsible className="w-full">
                {contraceptiveOptions.map((c, i) => (
                  <AccordionItem key={i} value={`contra-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold text-foreground">{c.name}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-foreground">✅ <strong>Vantagens:</strong> {c.pros}</p>
                        <p className="text-xs text-foreground">⚠️ <strong>Desvantagens:</strong> {c.cons}</p>
                        <p className="text-xs text-primary italic">💡 {c.tips}</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSuppForm({ name: c.name, dose: "Conforme prescrição", category: "contraceptivo", notes: "" }); setShowAddSupplement(true); setActiveTab("suplem"); }}>
                        <Plus className="h-3 w-3 mr-1" /> Registrar nos meus suplementos
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Tirzepatide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Syringe className="h-4 w-4 text-primary" /> {tirzepatideInfo.name}</CardTitle>
              <CardDescription>{tirzepatideInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[10px] text-destructive font-semibold">⚠️ USO EXCLUSIVO COM PRESCRIÇÃO MÉDICA. Nunca use sem orientação profissional.</p>

              {/* Doses */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">📋 Escalonamento de Doses:</p>
                <div className="space-y-1">
                  {tirzepatideInfo.doses.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded bg-muted/30 text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold min-w-[50px] text-center">{d.dose}</span>
                      <div className="flex-1">
                        <span className="font-semibold text-foreground">{d.phase}</span>
                        <span className="text-muted-foreground ml-1">• {d.duration}</span>
                        <p className="text-muted-foreground text-[10px]">{d.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Application guide */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">💉 Como Aplicar:</p>
                <div className="space-y-1">
                  {tirzepatideInfo.applicationGuide.map((step, i) => (
                    <p key={i} className="text-xs text-foreground pl-2">{step}</p>
                  ))}
                </div>
              </div>

              {/* Feeding after */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">🍽️ Alimentação Após a Aplicação:</p>
                <div className="space-y-1">
                  {tirzepatideInfo.feedingAfter.map((tip, i) => (
                    <p key={i} className="text-xs text-foreground pl-2">{tip}</p>
                  ))}
                </div>
              </div>

              {/* Side effects */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">⚠️ Efeitos Colaterais Possíveis:</p>
                <div className="flex flex-wrap gap-1">
                  {tirzepatideInfo.sideEffects.map((e, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">{e}</span>
                  ))}
                </div>
              </div>

              {/* Contraindications */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">🚫 Contraindicações:</p>
                <div className="space-y-1">
                  {tirzepatideInfo.contraindications.map((c, i) => (
                    <p key={i} className="text-xs text-destructive pl-2">• {c}</p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Other injections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Syringe className="h-4 w-4 text-primary" /> Outras Medicações Injetáveis</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {otherInjections.map((med, i) => (
                  <AccordionItem key={i} value={`med-${i}`}>
                    <AccordionTrigger className="text-sm font-semibold text-foreground">{med.name}</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                      <p className="text-xs text-muted-foreground">{med.description}</p>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Doses:</p>
                        {med.doses.map((d, j) => (
                          <p key={j} className="text-xs text-foreground pl-2">• {d}</p>
                        ))}
                      </div>
                      <p className="text-xs text-primary italic">💡 {med.tips}</p>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => { setSuppForm({ name: med.name, dose: "Conforme prescrição", category: "medicamento", notes: "" }); setShowAddSupplement(true); setActiveTab("suplem"); }}>
                        <Plus className="h-3 w-3 mr-1" /> Registrar nos meus suplementos
                      </Button>
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
