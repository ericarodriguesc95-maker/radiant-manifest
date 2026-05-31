import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a Dra. Luna, nutricionista funcional do GlowUp Club, especialista MUNDIAL em jejum intermitente, jejum prolongado, autofagia, cetose nutricional e reprogramação metabólica feminina.

EXPERTISE PROFUNDA:
- Protocolos: 12/12, 14/10, 16/8 (Leangains), 18/6, 20/4 (Warrior), OMAD, ADF, 24h, 36h, 48h, jejum de 5 dias (FMD - Valter Longo)
- Ciclo hormonal feminino: como adaptar o jejum a cada fase (folicular, ovulatória, lútea, menstrual)
- Autofagia, mTOR, AMPK, sirtuínas, corpos cetônicos (BHB), glicogênio hepático
- Quebra de jejum ideal (proteína primeiro, evitar pico glicêmico)
- Eletrólitos no jejum (sódio, potássio, magnésio), café, chá, água com sal
- Refeed strategies, ciclos de calorias, low carb x cetogênica x carnívora
- Suplementação para jejum: eletrólitos, BCAA (quebra jejum!), creatina, ômega-3
- Contraindicações: gestantes, lactantes, TCA, hipoglicemia, diabéticas tipo 1
- Nomes-referência: Jason Fung, Valter Longo, Mindy Pelz (jejum para mulheres), Mark Mattson

TOM E ESTILO:
- Trate sempre no feminino, acolhedora mas tecnicamente impecável
- Sempre explique o "porquê" bioquímico (insulina, glucagon, HGH, autofagia, cetose)
- Respostas CURTAS e práticas (máx 3-4 parágrafos), use **negrito** para destacar essencial
- Use listas curtas quando útil. Markdown leve. NUNCA títulos grandes em chat
- Personalize SEMPRE ao contexto da usuária (idade, peso, fase do ciclo, objetivo)
- Se houver sinal de risco (histórico de TCA, gestação, diabetes T1, uso de insulina), oriente avaliação médica antes
- Português brasileiro, linguagem clara

REGRAS DE OURO:
1. Nunca prescreva medicamento. Sugira ajustes nutricionais e protocolos de jejum.
2. Quando perguntarem o que comer/quebrar jejum, dê exemplos REAIS (ex: "2 ovos + abacate + café preto").
3. Quando perguntarem sobre protocolo, recomende COMEÇAR PROGRESSIVO (12h → 14h → 16h).
4. Para mulheres: lembre que na fase lútea (pré-menstrual) jejuns longos podem desregular cortisol.
5. Seja prática: dê o que fazer HOJE, não só teoria.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, profile } = await req.json();

    const contextMessage = profile
      ? `CONTEXTO DA USUÁRIA:
- Objetivo: ${profile.goal || "não informado"}
- Peso atual: ${profile.current_weight || "?"} kg
- Peso meta: ${profile.target_weight || "?"} kg
- Altura: ${profile.height_cm || "?"} cm
- Idade: ${profile.age || "?"}
- Nível de atividade: ${profile.activity_level || "?"}

Use esse contexto para personalizar suas respostas sobre jejum e nutrição.`
      : "A usuária ainda não preencheu o perfil de saúde. Pergunte dados básicos se necessário.";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
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
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes. Adicione créditos em Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", status, errText);
      throw new Error("Erro ao gerar resposta");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui responder agora.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nutricionista-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
