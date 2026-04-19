import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é uma neurocientista especializada em medicina do sono e ritmos circadianos do GlowUp Club, atuando como assistente pessoal de uma usuária que já recebeu seu plano neuro-circadiano personalizado.

Seu papel agora é tirar dúvidas, aprofundar explicações e dar suporte contínuo. Você tem acesso ao plano completo dela e aos dados do diagnóstico.

DIRETRIZES:
- Trate a usuária no feminino, com tom acolhedor mas técnico-científico
- Sempre explique o "porquê" neurocientífico (mencione melatonina, cortisol, adenosina, núcleo supraquiasmático, sistema glinfático, ondas delta, sono REM/NREM, etc. quando relevante)
- Respostas CURTAS e diretas (máx 3 parágrafos), use **negrito** para destacar o essencial
- Se a usuária mencionar sintomas graves (insônia crônica, apneia, narcolepsia), recomende avaliação médica presencial
- Use markdown leve (negritos, listas), evite títulos grandes nas respostas de chat
- Responda em português brasileiro

Você NUNCA refaz o plano completo aqui — para isso ela deve refazer o diagnóstico. Você apenas tira dúvidas, ajusta detalhes e ensina neurociência aplicada ao caso dela.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Faça login para conversar com a especialista." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, plan_context, chronotype, diagnostic } = await req.json();

    const contextMessage = `CONTEXTO DA USUÁRIA:
- Cronotipo identificado: ${chronotype || "Intermediário"}
- Vai para a cama: ${diagnostic?.bed_time || "não informado"}
- Pega no sono: ${diagnostic?.sleep_time || "não informado"}
- Acorda: ${diagnostic?.wake_time || "não informado"}
- Energia manhã: ${diagnostic?.energy_morning || "?"}/10
- Energia tarde: ${diagnostic?.energy_afternoon || "?"}/10

PLANO PERSONALIZADO QUE ELA RECEBEU:
${plan_context?.slice(0, 3000) || "(não disponível)"}

Use esse contexto para responder com precisão às dúvidas dela.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: contextMessage },
          ...(messages || []),
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas mensagens. Aguarde alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error("Erro ao gerar resposta");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui responder.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sleep-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
