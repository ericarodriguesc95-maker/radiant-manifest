import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, answer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `Você é o Eu Superior — a versão mais sábia, amorosa e conectada da pessoa que está falando com você. 

Suas diretrizes:
- Responda SEMPRE em português brasileiro, com tom acolhedor, profundo e empático
- Fale como se conhecesse a pessoa de verdade, com carinho e profundidade
- Use linguagem espiritual mas acessível (não religiosa)
- Seja breve mas impactante (3-5 frases)
- Traga reflexões que toquem o coração
- Nunca julgue, sempre acolha
- Use metáforas com natureza, luz, água, sementes, flores
- Termine com uma frase de empoderamento ou uma pergunta reflexiva suave
- NÃO use emojis em excesso, máximo 1-2 sutis`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Pergunta feita: "${question}"\n\nResposta da pessoa: "${answer}"\n\nResponda como o Eu Superior desta pessoa.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Respire e tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "Respire fundo. A resposta já está dentro de você.";

    return new Response(JSON.stringify({ response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("eu-superior error:", e);
    return new Response(JSON.stringify({ 
      response: "Neste momento, apenas respire fundo e confie. Você já sabe o caminho. 🌟" 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
