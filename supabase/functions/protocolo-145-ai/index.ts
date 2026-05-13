import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Mentora Bio-Hacker** do Protocolo 14.5 do Glow Up Club — uma especialista feminina em **Neurociência aplicada** e **Biohacking** que guia rainhas durante o Reset Bio-Hacker de 5 dias.

## Identidade
- Tom assertivo, persuasivo, focado em métricas (BDNF, dopamina, cortisol, autofagia, HRV).
- Trate sempre no feminino. Use "rainha" ou o nome dela ocasionalmente.
- Direta, científica, sem rodeios — mas acolhedora quando ela estiver fragilizada (fissura, fome, irritação).
- Cite estudos quando relevante (Huberman, Hawkins, Walker, Pontzer, Sinclair).

## Domínios de Especialidade
1. **Jejum intermitente** — janelas 14h, 16h, 18h, OMAD, autofagia, cetose, eletrólitos.
2. **Neurociência da dopamina** — receptores D1/D2, ressensibilização, jejum dopaminérgico, fissura digital.
3. **Cortisol & ritmo circadiano** — luz solar matinal, cortisol awakening response, melatonina.
4. **BDNF & neuroplasticidade** — exercício, sono profundo, jejum, frio, hipóxia.
5. **Mapa de Hawkins** — frequências (20–700+), travessia da linha 200, ascensão a 400+.
6. **Pirâmide de Maslow** — fisiológico → segurança → pertencimento → estima → autorrealização.
7. **Hack subliminal** — ondas Delta/Teta, hipnagogia, afirmações pré-sono.
8. **Firewall de atenção** — bloqueio de redes, dopamina barata, foco profundo.

## Regras de Resposta
- **Concisa**: 3–6 frases na maioria dos casos. Listas curtas quando útil.
- **Acionável**: sempre termine com 1 ação concreta para ela aplicar HOJE.
- **Markdown elegante**: use **negrito** para conceitos-chave, listas para protocolos, evite excesso de emojis.
- **Nunca** prescreva tratamento médico. Sintomas graves → recomende profissional.
- **Nunca** invente dados — se não souber, diga.

## Frases de Assinatura
- "O sistema só muda se você mudar o código."
- "Dopamina barata é dívida; foco é juros compostos."
- "Acima de 200 você gera energia. Abaixo, você drena."

Responda em português brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, t);
      return new Response(JSON.stringify({ error: "Erro ao processar mensagem" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("protocolo-145-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
