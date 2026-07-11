import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MEALS = ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar"];
const MEAL_LABELS: Record<string, string> = {
  cafe_manha: "Café da manhã",
  lanche_manha: "Lanche da manhã",
  almoco: "Almoço",
  lanche_tarde: "Lanche da tarde",
  jantar: "Jantar",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const {
      mode = "week", // "week" | "day"
      dayIndex, // 0..6 quando mode = "day"
      profile = {},
      restrictions = "",
      preferences = "",
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const {
      goal = "manter peso",
      current_weight,
      target_weight,
      height_cm,
      age,
      sex = "feminino",
      activity_level = "moderado",
    } = profile;

    const profileText = [
      `objetivo: ${goal}`,
      current_weight ? `peso atual: ${current_weight}kg` : null,
      target_weight ? `peso meta: ${target_weight}kg` : null,
      height_cm ? `altura: ${height_cm}cm` : null,
      age ? `idade: ${age} anos` : null,
      `sexo: ${sex}`,
      `nível de atividade: ${activity_level}`,
      restrictions ? `restrições: ${restrictions}` : null,
      preferences ? `preferências: ${preferences}` : null,
    ].filter(Boolean).join(", ");

    let userPrompt: string;

    if (mode === "day") {
      const day = DAYS[Math.max(0, Math.min(6, Number(dayIndex) || 0))];
      userPrompt = `Gere um plano alimentar completo para ${day} com 5 refeições (cafe_manha, lanche_manha, almoco, lanche_tarde, jantar).

Perfil da usuária: ${profileText}.

Cada refeição deve ter: "name" (nome curto e apetitoso da refeição), "items" (array com 3 a 5 alimentos incluindo porções em gramas ou medidas caseiras), "kcal" (número inteiro estimado) e "prep" (uma frase curta, máximo 100 caracteres, de preparo).

Use ingredientes brasileiros acessíveis, variados e saudáveis. Priorize proteínas magras, fibras, vegetais coloridos e boas gorduras. Não use travessões nos textos.

Responda em JSON puro no formato:
{"day": "${day}", "meals": {"cafe_manha": {...}, "lanche_manha": {...}, "almoco": {...}, "lanche_tarde": {...}, "jantar": {...}}, "total_kcal": <int>}`;
    } else {
      userPrompt = `Gere um plano alimentar semanal completo (7 dias: Segunda a Domingo) com 5 refeições por dia (cafe_manha, lanche_manha, almoco, lanche_tarde, jantar).

Perfil da usuária: ${profileText}.

Regras:
- Cada refeição deve ter: "name", "items" (3 a 5 alimentos com porções em gramas ou medidas caseiras), "kcal" (int) e "prep" (frase curta, máx 100 caracteres).
- Varie ao máximo entre os dias, sem repetir a mesma refeição na semana.
- Use ingredientes brasileiros acessíveis, saudáveis e coloridos.
- Priorize proteínas magras, fibras, vegetais e boas gorduras.
- Não use travessões nos textos.
- Também gere uma "shopping_list" agrupada por categoria (proteinas, carboidratos, hortifruti, laticinios, outros), com cada item contendo "name" e "quantity" (soma aproximada para a semana).

Responda em JSON puro:
{"days": [{"day":"Segunda","meals":{...},"total_kcal":<int>}, ...], "shopping_list": {"proteinas":[{"name":"...","quantity":"..."}], "carboidratos":[...], "hortifruti":[...], "laticinios":[...], "outros":[...]}}`;
    }

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é uma nutricionista brasileira especializada em saúde feminina. Responde sempre em português do Brasil e em JSON puro, sem markdown, sem travessões." },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Erro AI: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "";
    let parsed: any;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      const m = String(raw).match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    }
    if (!parsed) throw new Error("Resposta da IA inválida");

    return new Response(JSON.stringify({ ...parsed, meal_labels: MEAL_LABELS, meal_order: MEALS }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("weekly-meal-plan error", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
