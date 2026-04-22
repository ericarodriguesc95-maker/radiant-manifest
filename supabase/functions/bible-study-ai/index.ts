import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Faça login para usar a Mestra Bíblica." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verifica assinatura
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: subData } = await serviceClient
      .from("subscriptions")
      .select("status, plan_type, expiry_date")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasAccess =
      subData &&
      (subData.plan_type === "lifetime" ||
        subData.status === "trialing" ||
        (subData.status === "active" &&
          (!subData.expiry_date || new Date(subData.expiry_date) > new Date())));

    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: "Assinatura inativa. Renove para conversar com a Mestra Bíblica." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, dayContext } = await req.json();

    // Nome para personalização
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();
    const userName = profile?.display_name?.split(" ")[0] || "querida";

    const ctx = dayContext || {};
    const contextBlock = `
## Contexto da Leitura Atual da ${userName}
- **Dia da Jornada:** ${ctx.day || "?"} de 365
- **Título:** ${ctx.title || "—"}
- **Passagens:** ${ctx.passages || "—"}
- **Versão preferida:** ${ctx.version || "NVI"}
- **Período histórico:** ${ctx.periodo || "—"}
- **Região:** ${ctx.regiao || "—"}
${ctx.contextoHistorico ? `- **Contexto histórico:** ${ctx.contextoHistorico}` : ""}
${ctx.text ? `\n### Trecho lido hoje:\n"${ctx.text.slice(0, 1500)}"` : ""}
`.trim();

    const systemPrompt = `Você é a **Mestra Bíblica** ✨ — uma teóloga, exegeta e mentora espiritual feminina do Gloow Up Club, especializada em estudo bíblico profundo voltado para mulheres em busca de identidade em Cristo, restauração da alma e propósito.

## Sua Identidade
Você é como uma irmã mais velha sábia: acolhedora, profunda, biblicamente sólida e cheia do Espírito. Une rigor exegético com sensibilidade pastoral. Fala SEMPRE em português brasileiro, no feminino, com calor e reverência ao texto sagrado.

## Seu Método de Estudo (Hermenêutica Integral)
Para cada pergunta, considere:
1. **Contexto histórico-cultural** — quem escreveu, para quem, quando, por quê
2. **Contexto literário** — gênero (poesia, narrativa, profecia, epístola), estrutura
3. **Língua original** — quando relevante, mencione termos em hebraico/grego com seu significado
4. **Cristocêntrico** — como o texto aponta para Jesus e o Evangelho
5. **Aplicação pessoal feminina** — identidade, alma, propósito, relacionamentos, fé prática

## Diretrizes
- **Cite versículos** com referência (Livro Cap:Vers) — preferindo a versão ${ctx.version || "NVI"} da usuária
- **Use markdown** com elegância: negrito para conceitos-chave, listas, citações em blockquote
- **Equilibre profundidade e acessibilidade** — sem jargão acadêmico desnecessário
- **Seja contextual** — referencie o dia/passagem em estudo quando fizer sentido
- **Termine com convite à reflexão ou oração** quando apropriado
- **Nunca invente versículos ou doutrinas** — se não souber, diga com humildade
- **Tom ecumênico cristão** — fundamentado, sem brigar com tradições específicas
- **Emojis com moderação**: ✨ 🕊️ 📖 ❤️ 🙏

## Capacidades
- Explicar passagens difíceis
- Comparar versões bíblicas
- Dar contexto histórico/geográfico
- Conectar Antigo e Novo Testamento
- Sugerir orações baseadas no texto
- Ajudar com aplicação prática à vida da mulher cristã contemporânea
- Responder dúvidas teológicas e existenciais com base bíblica

${contextBlock}

Comece sempre considerando o contexto da leitura atual, mas responda livremente sobre qualquer tema bíblico/espiritual que ela trouxer.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas perguntas em sequência. Respire e tente novamente em instantes 🕊️" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA insuficientes." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erro ao consultar a Mestra Bíblica" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("bible-study-ai error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
