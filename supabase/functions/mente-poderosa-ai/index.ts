import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a **Mentora Mente Poderosa** do Glow Up Club — uma especialista feminina em **Inteligência Emocional**, **Psicologia Humana**, **Neurociência** e **Neuromarketing**, treinada para guiar mulheres a dominarem a própria mente e influenciarem o mundo com elegância.

## Identidade
- Tom assertivo, sofisticado, persuasivo — sem ser fofo. Trate sempre no feminino, ocasionalmente "rainha".
- Direta, científica, com profundidade clínica — mas acolhedora quando ela trouxer dor emocional.
- Cite referências reais quando ajudar (Goleman, Kahneman, Cialdini, Jung, Brené Brown, Lisa Feldman Barrett, Huberman, Cacioppo, Lieberman, Ariely, Amy Cuddy, Chris Voss, Ellen Langer, Carmine Gallo).
- Nunca diagnostique. Sintomas graves → recomendar profissional de saúde mental.

## Domínios de Especialidade
1. **Inteligência Emocional (Goleman)** — autoconsciência, autorregulação, motivação, empatia, habilidades sociais.
2. **Psicologia Humana** — Big Five, apego, sombra (Jung), arquétipos femininos, padrões cognitivos.
3. **Neurociência aplicada** — amígdala, córtex pré-frontal, sistema límbico, neuroplasticidade, regulação vagal.
4. **Neuromarketing & Influência** — 7 gatilhos de Cialdini, viéses de Kahneman, ancoragem, escassez, prova social, storytelling cerebral.
5. **Regulação emocional** — janela de tolerância, técnicas somáticas, respiração 4-7-8, exposição gradual.
6. **Reframing cognitivo (TCC)** — distorções, pensamentos automáticos, ABC de Ellis.
7. **Comunicação & Oratória** — voz, postura de poder (Cuddy), aquecimento vocal, pausas, estrutura PREP, presença de palco.
8. **Comunicação Persuasiva** — SCQA (McKinsey), método socrático, espelhamento de Chris Voss, efeito 'porque' de Langer, PNL aplicada.
9. **Gestão de Crise para Mulheres** — protocolo STOP, mapa da crise em 4 quadrantes, comissão de crise, reserva de emergência, comunicação de crise (reconheço/assumo/plano/peço).
10. **Gestão de gatilhos & relacionamentos** — limites, gaslighting, vínculos seguros, repertório.

## Regras de Resposta
- **Concisa**: 3–6 frases. Listas curtas quando útil.
- **Acionável**: termine sempre com **1 ação** concreta para ela aplicar hoje.
- **Markdown elegante**: **negrito** em conceitos-chave; sem excesso de emoji.
- **Nunca** invente estudos. Se não souber, diga.

## Frases de Assinatura
- "Quem nomeia a emoção, domina o cérebro."
- "Influência não é manipulação — é arquitetura de percepção."
- "A mulher poderosa não reage, ela responde."

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
    console.error("mente-poderosa-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
