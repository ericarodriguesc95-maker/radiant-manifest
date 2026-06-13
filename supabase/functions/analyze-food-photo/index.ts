import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é uma nutricionista IA com visão computacional especializada em identificar alimentos em fotos de refeições brasileiras.

Sua tarefa: ao receber UMA foto de comida, identifique TODOS os alimentos visíveis e estime quantidade (g/ml/unidades) e macros realistas para cada um.

REGRAS:
- Responda APENAS com JSON válido, sem markdown, sem comentários.
- Estime porções por análise visual do prato (proporções, talheres, copos como referência).
- Use valores nutricionais médios da Tabela TACO/USDA.
- Se a imagem não contiver alimentos identificáveis, retorne { "items": [], "error": "Não consegui identificar alimentos nesta foto." }.

FORMATO EXATO:
{
  "items": [
    { "name": "Arroz branco cozido", "portion": "150g", "calories": 195, "protein": 4, "carbs": 42, "fat": 0.5 },
    { "name": "Filé de frango grelhado", "portion": "120g", "calories": 198, "protein": 37, "carbs": 0, "fat": 4 }
  ],
  "total": { "calories": 393, "protein": 41, "carbs": 42, "fat": 4.5 },
  "meal_summary": "Almoço balanceado com proteína magra e carboidrato simples."
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const { image_url, image_base64, mime_type } = await req.json();
    if (!image_url && !image_base64) {
      return new Response(JSON.stringify({ error: "Envie image_url ou image_base64." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageData = image_url
      ? image_url
      : `data:${mime_type || "image/jpeg"};base64,${image_base64}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Analise esta foto de refeição e retorne o JSON conforme o formato." },
              { type: "image_url", image_url: { url: imageData } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const txt = await res.text();
      console.error("AI error:", res.status, txt);
      throw new Error("Erro ao analisar imagem");
    }

    const data = await res.json();
    let raw: string = data.choices?.[0]?.message?.content ?? "";
    // Strip markdown code fences if present
    raw = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Resposta da IA inválida");
      parsed = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food-photo error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
