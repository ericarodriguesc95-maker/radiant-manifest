import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, date } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY ausente");

    const displayName = (name && String(name).trim()) || "rainha";
    const today = date || new Date().toISOString().slice(0, 10);

    const prompt = `Você é a "Rainha do Futuro": a versão de ${displayName} daqui a 1 ano, já vivendo a vida que ela está construindo hoje no Gloow Up Club (autoconhecimento, hábitos, metas, saúde, finanças, espiritualidade e comunidade feminina).

Escreva UMA mensagem curta (máximo 240 caracteres), em português do Brasil, dirigida a ela hoje (${today}), assinada implicitamente como "Você daqui a 1 ano". Fale como se você já tivesse alcançado o que ela sonha: com carinho, força e verdade. Cite algo específico e sensorial (uma cena, um sentimento, um lugar, uma conquista) que faça ela querer continuar hoje. Não use travessões, hashtags, emojis excessivos (no máximo 1) nem clichês genéricos. Não repita o nome dela mais que uma vez.

Responda apenas em JSON puro no formato: {"message": "...", "title": "Uma pequena cena da sua vida daqui a 1 ano"}. O "title" deve ser evocativo e específico ao conteúdo da mensagem, no máximo 60 caracteres.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você escreve mensagens da versão futura da usuária, sempre em português do Brasil e em JSON puro." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error", aiResp.status, errText);
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    const message = String(parsed?.message ?? "").trim();
    const title = String(parsed?.title ?? "Uma cena da sua vida daqui a 1 ano").trim();
    if (!message) throw new Error("Resposta da IA inválida");

    return new Response(JSON.stringify({ message, title, date: today }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("future-self-message error", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
