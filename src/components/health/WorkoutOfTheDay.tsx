import { useState } from "react";
import { Dumbbell, Brain, Clock, ChevronRight, Flame, Target, Zap, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  neuroDica: string;
  dicaCS: string;
  muscleGroup: string;
  calBurn: string;
}

interface WorkoutPlan {
  focus: string;
  icon: string;
  description: string;
  duration: string;
  exercises: Exercise[];
}

const workoutPlans: Record<string, WorkoutPlan[]> = {
  hipertrofia: [
    {
      focus: "Superior A — Peito & Costas",
      icon: "💪",
      description: "Hipertrofia com foco em volume e conexão mente-músculo",
      duration: "45-55 min",
      exercises: [
        { name: "Supino com Halteres", sets: "4", reps: "10-12", rest: "90s", muscleGroup: "Peitoral", calBurn: "~80 kcal", neuroDica: "O supino ativa o córtex motor primário intensamente. A conexão mente-músculo (focar na contração) aumenta a ativação das fibras em até 20%, segundo estudos de EMG.", dicaCS: "Leve halteres leves na bolsa e faça no banco do parque na hora do almoço. Sem banco? Faça no chão — a amplitude é menor, mas funciona." },
        { name: "Remada Curvada", sets: "4", reps: "10-12", rest: "90s", muscleGroup: "Costas", calBurn: "~75 kcal", neuroDica: "Exercícios de puxada melhoram a postura e ativam o sistema proprioceptivo, reduzindo dores crônicas de quem passa muito tempo sentada.", dicaCS: "Use uma mochila com livros ou garrafas d'água como peso improvisado. 2 séries antes do banho = resultados reais." },
        { name: "Desenvolvimento com Halteres", sets: "3", reps: "12", rest: "60s", muscleGroup: "Ombros", calBurn: "~55 kcal", neuroDica: "O movimento overhead ativa o cerebelo (equilíbrio) e melhora a coordenação motora, beneficiando a postura ao longo do dia.", dicaCS: "Faça sentada na cadeira do escritório com garrafas de 1.5L. Ninguém vai perceber e seus ombros agradecem." },
        { name: "Crucifixo Inclinado", sets: "3", reps: "12-15", rest: "60s", muscleGroup: "Peitoral Superior", calBurn: "~45 kcal", neuroDica: "O alongamento sob carga promove a hipertrofia sarcomérica — criação real de novos sarcômeros nas fibras musculares.", dicaCS: "Substitua por flexão inclinada (mãos no sofá) em casa. 3x15 antes do café da manhã = rotina criada." },
        { name: "Pulldown (ou Puxada)", sets: "3", reps: "12", rest: "60s", muscleGroup: "Dorsais", calBurn: "~50 kcal", neuroDica: "A puxada estimula a liberação de BDNF, o 'fertilizante cerebral' que melhora memória e aprendizado.", dicaCS: "Sem máquina? Faixa elástica presa na porta funciona perfeitamente. Leva 5min e cabe na gaveta." },
      ],
    },
    {
      focus: "Inferior — Glúteos & Pernas",
      icon: "🦵",
      description: "Foco em glúteos e posteriores com carga progressiva",
      duration: "50-60 min",
      exercises: [
        { name: "Agachamento Sumô", sets: "4", reps: "12-15", rest: "90s", muscleGroup: "Glúteos/Adutores", calBurn: "~100 kcal", neuroDica: "O agachamento sumô recruta mais fibras do glúteo médio que o convencional. Isso fortalece a estabilidade pélvica e melhora a biomecânica da caminhada.", dicaCS: "Faça com mochila nas costas ou segurando uma mala de viagem. No escritório? 3x15 na hora do café resolve." },
        { name: "Stiff (Levantamento Terra Romeno)", sets: "4", reps: "10-12", rest: "90s", muscleGroup: "Posteriores/Glúteos", calBurn: "~90 kcal", neuroDica: "Exercícios de cadeia posterior ativam o sistema nervoso parassimpático, reduzindo cortisol e ansiedade pós-treino.", dicaCS: "Use duas garrafas de 5L como peso. O importante é sentir o alongamento nos posteriores. Faça antes do banho noturno." },
        { name: "Búlgaro (Avanço)", sets: "3", reps: "12/perna", rest: "60s", muscleGroup: "Quadríceps/Glúteos", calBurn: "~85 kcal", neuroDica: "Exercícios unilaterais corrigem assimetrias neuromotoras entre os hemisférios cerebrais, melhorando o equilíbrio geral.", dicaCS: "Use o sofá como apoio traseiro. Segure uma panela pesada como carga. 5 minutos por perna = treino feito." },
        { name: "Elevação Pélvica (Hip Thrust)", sets: "4", reps: "15-20", rest: "60s", muscleGroup: "Glúteos", calBurn: "~70 kcal", neuroDica: "O hip thrust é o exercício com maior ativação eletromiográfica do glúteo máximo — superior ao agachamento.", dicaCS: "Faça no chão da sala com as costas apoiadas no sofá. Coloque a mochila no quadril como peso. Netflix + treino." },
        { name: "Panturrilha em Pé", sets: "4", reps: "20", rest: "45s", muscleGroup: "Panturrilha", calBurn: "~30 kcal", neuroDica: "Panturrilhas fortes melhoram o retorno venoso, reduzindo inchaço e fadiga nas pernas após longas horas sentada.", dicaCS: "Faça na escada do prédio ou na fila do café. Suba nas pontas dos pés 20x. Ninguém percebe e é super eficaz." },
      ],
    },
  ],
  emagrecimento: [
    {
      focus: "HIIT Full Body — Queima Máxima",
      icon: "🔥",
      description: "Circuito metabólico para maximizar EPOC (queima pós-treino)",
      duration: "25-30 min",
      exercises: [
        { name: "Burpees", sets: "4", reps: "10", rest: "30s", muscleGroup: "Full Body", calBurn: "~120 kcal", neuroDica: "Burpees elevam o EPOC (consumo excessivo de oxigênio pós-exercício) em até 48h, fazendo seu corpo queimar calorias dormindo.", dicaCS: "Versão office: agache, apoie as mãos na mesa, dê um passo atrás e volte. 10x no banheiro = meta batida." },
        { name: "Mountain Climbers", sets: "4", reps: "20/lado", rest: "20s", muscleGroup: "Core/Cardio", calBurn: "~90 kcal", neuroDica: "Ativa o córtex pré-frontal (tomada de decisão) por exigir coordenação rápida entre membros opostos.", dicaCS: "Faça apoiada na borda da cama ao acordar. 30 segundos = café da manhã com mais energia." },
        { name: "Jump Squat", sets: "4", reps: "15", rest: "30s", muscleGroup: "Pernas/Glúteos", calBurn: "~100 kcal", neuroDica: "O impacto do salto estimula osteoblastos, fortalecendo a densidade óssea — crucial para mulheres.", dicaCS: "Sem espaço para pular? Agachamento rápido na ponta dos pés tem 70% do mesmo efeito metabólico." },
        { name: "Prancha com Toque no Ombro", sets: "3", reps: "20", rest: "30s", muscleGroup: "Core/Ombros", calBurn: "~50 kcal", neuroDica: "A instabilidade ativa a musculatura profunda do core (transverso do abdômen), protegendo a coluna lombar.", dicaCS: "Faça enquanto espera o micro-ondas esquentar a comida. 40 segundos é suficiente para ativar o core." },
        { name: "Polichinelos", sets: "3", reps: "30", rest: "20s", muscleGroup: "Cardio/Full Body", calBurn: "~80 kcal", neuroDica: "Movimentos rítmicos e bilaterais sincronizam os hemisférios cerebrais, melhorando foco e clareza mental.", dicaCS: "Substitua por 'step touch' lateral se mora em apartamento. Sem barulho, mesmo efeito cardio." },
      ],
    },
    {
      focus: "Cardio + Core — Definição",
      icon: "⚡",
      description: "Treino focado em core e cardio moderado para definição",
      duration: "30-35 min",
      exercises: [
        { name: "Corrida Estacionária", sets: "1", reps: "5 min", rest: "60s", muscleGroup: "Cardio", calBurn: "~60 kcal", neuroDica: "Apenas 5 minutos de cardio já liberam endorfinas e dopamina suficientes para melhorar o humor por 2-3 horas.", dicaCS: "Corra no lugar enquanto escova os dentes de manhã. Parece bobeira, mas ativa o metabolismo instantaneamente." },
        { name: "Abdominal Bicicleta", sets: "4", reps: "20/lado", rest: "30s", muscleGroup: "Oblíquos", calBurn: "~45 kcal", neuroDica: "É o exercício abdominal com maior ativação EMG do reto abdominal e oblíquos combinados (estudo ACE).", dicaCS: "Faça na cama antes de levantar. Deitar → 20 bicicletas → levantar. Rotina de 1 minuto." },
        { name: "Escalador Cruzado", sets: "4", reps: "15/lado", rest: "30s", muscleGroup: "Core/Cardio", calBurn: "~70 kcal", neuroDica: "O cruzamento joelho-cotovelo oposto ativa intensamente as conexões inter-hemisféricas do corpo caloso.", dicaCS: "Faça no tapete da sala durante comerciais ou entre episódios. 45 segundos é suficiente." },
        { name: "Prancha Lateral", sets: "3", reps: "30s/lado", rest: "30s", muscleGroup: "Oblíquos", calBurn: "~35 kcal", neuroDica: "Fortalece o quadrado lombar, prevenindo dores na região lombar — o vilão de quem trabalha sentada.", dicaCS: "Apoie o cotovelo no braço do sofá para uma versão mais fácil. Aumente a dificuldade gradualmente." },
        { name: "Swing com Peso", sets: "4", reps: "15", rest: "45s", muscleGroup: "Posteriores/Core", calBurn: "~85 kcal", neuroDica: "O movimento de hip hinge ativa o reflexo miotático dos glúteos, criando força explosiva e queima calórica intensa.", dicaCS: "Use uma mochila com livros ou galão de água. O balanço do quadril é o segredo — não force os braços." },
      ],
    },
  ],
  resistencia: [
    {
      focus: "Endurance — Resistência Muscular",
      icon: "🏃‍♀️",
      description: "Alto volume, baixo descanso para resistência cardiovascular",
      duration: "40-50 min",
      exercises: [
        { name: "Agachamento Livre", sets: "5", reps: "20", rest: "45s", muscleGroup: "Pernas", calBurn: "~110 kcal", neuroDica: "Séries longas de agachamento aumentam a capilarização muscular, melhorando o transporte de oxigênio para o cérebro.", dicaCS: "Faça 20 agachamentos cada vez que for ao banheiro no trabalho. 4 idas = 80 agachamentos no dia." },
        { name: "Flexão de Braço", sets: "4", reps: "15-20", rest: "45s", muscleGroup: "Peitoral/Tríceps", calBurn: "~60 kcal", neuroDica: "A posição de push-up ativa a fáscia toracolombar, melhorando a estabilidade postural global.", dicaCS: "Comece na parede, evolua para a mesa, depois o chão. Progressão sem vergonha = resultado real." },
        { name: "Afundo Alternado", sets: "4", reps: "16/perna", rest: "45s", muscleGroup: "Pernas/Glúteos", calBurn: "~90 kcal", neuroDica: "Afundos melhoram a propriocepção do tornozelo e joelho, reduzindo risco de lesões em corridas e caminhadas.", dicaCS: "Faça afundos caminhando pelo corredor de casa. Ida = 8 passos, volta = 8 passos. Treino funcional doméstico." },
        { name: "Remada com Elástico", sets: "4", reps: "20", rest: "45s", muscleGroup: "Costas", calBurn: "~50 kcal", neuroDica: "A tensão constante do elástico mantém a ativação muscular durante toda a amplitude, diferente dos pesos livres.", dicaCS: "Prenda o elástico na maçaneta da porta. Faixa de R$15 substitui a academia perfeitamente para costas." },
        { name: "Prancha Dinâmica", sets: "3", reps: "45s", rest: "30s", muscleGroup: "Core", calBurn: "~40 kcal", neuroDica: "Prancha com movimento (quadril alto-baixo) ativa mais fibras do transverso abdominal que a prancha estática.", dicaCS: "Faça durante a chamada de vídeo com câmera desligada. Multitasking fitness no home office." },
      ],
    },
  ],
};

export default function WorkoutOfTheDay() {
  const [focus, setFocus] = useState<string>("hipertrofia");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("workout-completed-today");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === new Date().toISOString().split("T")[0]) {
          return new Set(parsed.exercises);
        }
      }
    } catch {}
    return new Set();
  });

  const plans = workoutPlans[focus] || [];

  const toggleComplete = (exerciseName: string) => {
    setCompletedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(exerciseName)) next.delete(exerciseName);
      else next.add(exerciseName);
      localStorage.setItem("workout-completed-today", JSON.stringify({
        date: new Date().toISOString().split("T")[0],
        exercises: Array.from(next),
      }));
      return next;
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-secondary" />
              Treino do Dia
            </CardTitle>
            <Select value={focus} onValueChange={setFocus}>
              <SelectTrigger className="w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hipertrofia">💪 Hipertrofia</SelectItem>
                <SelectItem value="emagrecimento">🔥 Emagrecimento</SelectItem>
                <SelectItem value="resistencia">🏃‍♀️ Resistência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {plans.map((plan, pi) => (
            <div key={pi} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{plan.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{plan.focus}</p>
                  <p className="text-[10px] text-muted-foreground">{plan.description} • {plan.duration}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {plan.exercises.map((ex) => {
                  const done = completedExercises.has(ex.name);
                  return (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => setSelectedExercise(ex)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all duration-200 text-left ${
                        done
                          ? "bg-secondary/10 border-secondary/30"
                          : "bg-muted/30 border-border hover:border-secondary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleComplete(ex.name); }}
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            done ? "bg-secondary border-secondary" : "border-muted-foreground/30"
                          }`}
                        >
                          {done && <span className="text-secondary-foreground text-[10px]">✓</span>}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                            {ex.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {ex.sets}x{ex.reps} • {ex.rest} descanso • {ex.muscleGroup}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Flame className="h-3 w-3 text-secondary" />
                <span>Total estimado: {plan.exercises.reduce((a, e) => a + parseInt(e.calBurn.replace(/\D/g, "")), 0)} kcal</span>
                <span>•</span>
                <span>{completedExercises.size}/{plan.exercises.length} feitos</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedExercise} onOpenChange={() => setSelectedExercise(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          {selectedExercise && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg">
                  <Dumbbell className="h-5 w-5 text-secondary" />
                  {selectedExercise.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <p className="text-sm font-bold text-secondary">{selectedExercise.sets}</p>
                    <p className="text-[10px] text-muted-foreground">Séries</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{selectedExercise.reps}</p>
                    <p className="text-[10px] text-muted-foreground">Reps</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{selectedExercise.rest}</p>
                    <p className="text-[10px] text-muted-foreground">Descanso</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-bold text-foreground">{selectedExercise.calBurn}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                </div>

                {/* Neuro-Dica */}
                <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-secondary" />
                    <p className="text-xs font-bold text-secondary">🧠 Neuro-Dica</p>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{selectedExercise.neuroDica}</p>
                </div>

                {/* Dica CS */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <p className="text-xs font-bold text-primary">⏱️ Dica de CS — Encaixe na Rotina</p>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{selectedExercise.dicaCS}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={completedExercises.has(selectedExercise.name) ? "outline" : "gold"}
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      toggleComplete(selectedExercise.name);
                    }}
                  >
                    {completedExercises.has(selectedExercise.name) ? "✓ Feito!" : "Marcar como feito"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
