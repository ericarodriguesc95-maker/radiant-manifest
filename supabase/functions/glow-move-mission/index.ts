import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PILLAR_CONTEXT: Record<string, { nome: string; conceito: string }> = {
  "recablea": { nome: "Recablea", conceito: "Reprogramar padrões mentais com base em neuroplasticidade, dopamina, ciclos de atenção e formação de hábitos." },
  "quem-sou-eu": { nome: "Quem sou eu", conceito: "Autoconceito, arquétipos femininos, presença, voz, como a mulher se percebe e se posiciona no mundo." },
  "dentro-de-mim": { nome: "Dentro de mim", conceito: "Regulação emocional, crenças limitantes, autocompaixão, padrões relacionais, sombra psicológica." },
  "a-que-aparece": { nome: "A que aparece", conceito: "Consistência sem motivação, micro-hábitos, identidade de ação, responsabilidade radical, presença mesmo nos dias difíceis." },
  "abundo": { nome: "Abundo", conceito: "Mentalidade financeira, relação com dinheiro, educação financeira prática, consciência de abundância e ações concretas de gestão." },
  "conecto": { nome: "Conecto", conceito: "Propósito, gratidão, fé, intuição feminina, rituais de conexão interna, presença plena." },
  "meu-templo": { nome: "Meu templo", conceito: "Movimento, alimentação consciente, descanso, escuta corporal, relação de cuidado com o próprio corpo." },
};

const PHASES = ["Reconhecer", "Soltar", "Construir", "Enraizar"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { pillar_id, phase } = await req.json();
    const ctx = PILLAR_CONTEXT[pillar_id];
    if (!ctx || phase < 1 || phase > 4) {
      return new Response(JSON.stringify({ error: "pilar ou fase inválida" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const fase = PHASES[phase - 1];
    const system = "Você é uma guia de alta performance para mulheres ambiciosas e sensíveis. Sua linguagem é direta, poética e ativadora. Nada genérico. Cada missão deve caber em 2 linhas e ser possível de fazer hoje.";
    const user = `Gere a missão do dia para uma mulher na Fase ${phase} — ${fase} do pilar "${ctx.nome}" do programa Glow Move. Contexto do pilar: ${ctx.conceito}.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        tools: [{
          type: "function",
          function: {
            name: "missao_do_dia",
            description: "Retorna a missão do dia",
            parameters: {
              type: "object",
              properties: {
                missao: { type: "string", description: "Máx 2 linhas, imperativo feminino" },
                frase_ancora: { type: "string", description: "Máx 1 linha, poética" },
                tempo_estimado: { type: "string", description: "Ex: 5 minutos" },
              },
              required: ["missao", "frase_ancora", "tempo_estimado"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "missao_do_dia" } },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI error", resp.status, t);
      if (resp.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições, tente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "Falha na IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : null;
    if (!parsed) throw new Error("Resposta inválida da IA");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "erro" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
