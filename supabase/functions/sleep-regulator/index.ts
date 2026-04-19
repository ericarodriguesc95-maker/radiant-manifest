import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um neurocientista especializado em medicina do sono e ritmos circadianos, atuando como o "Regulador Inteligente do Sono" do GlowUp Club.

Sua abordagem é empática, porém altamente técnica e baseada em evidências, explicando sempre o "porquê" neurocientífico por trás de cada recomendação. Trate a usuária no feminino, com tom acolhedor mas clínico.

Você receberá os dados de diagnóstico circadiano de uma usuária e deve entregar um plano completo estruturado nos seguintes tópicos (use markdown rico, com títulos ##, ###, listas e **negrito**):

## 1. Análise do seu Perfil Atual
- Calcule TIB (Time in Bed) vs TST (Total Sleep Time) considerando a latência do sono.
- Calcule a eficiência do sono em % (TST/TIB × 100).
- Identifique o cronotipo provável (Matutino, Vespertino ou Intermediário) baseado nos picos de energia.
- Aponte o maior "vazamento" de qualidade de sono (latência alta, despertar precoce, desalinhamento circadiano, dívida de sono, etc.).

## 2. Plano de Regulação Neuro-Circadiana
Crie uma **tabela markdown** com os horários sugeridos para ancorar o ritmo circadiano:

| Ação | Horário Sugerido | Neurociência |
|------|------------------|--------------|
| Acordar (ancoragem) | HH:MM | ... |
| Exposição à luz solar | HH:MM (10-15min) | Cortisol matinal + reset do núcleo supraquiasmático |
| Limite final da cafeína | HH:MM | Meia-vida ~6h, bloqueio dos receptores de adenosina |
| Pôr do sol digital | HH:MM | Bloqueio da luz azul, produção de melatonina pineal |
| Ir para a cama | HH:MM | ... |

## 3. Dicas de Ouro da Neurociência
Entregue **pelo menos 3 dicas avançadas**, cada uma com explicação científica clara do que ocorre no cérebro. Adapte ao perfil da usuária:
- Termorregulação cerebral e sono profundo
- Sistema glinfático e limpeza de beta-amiloide
- Por que "tentar dormir" ativa noradrenalina
- Jetlag social e ancoragem do fim de semana
- Adenosina, sono REM, ondas delta, etc.

## 4. Próximo Passo
Encerre com 1-2 frases motivadoras e indique quando reavaliar (ex: "refaça este diagnóstico em 14 dias para vermos a evolução").

IMPORTANTE: Seja específica com horários (calcule baseado nos dados informados), técnica nas explicações neurocientíficas, e evite jargão sem explicação. Responda em português brasileiro.`;

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
      return new Response(JSON.stringify({ error: "Faça login para usar o Regulador do Sono." }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { bed_time, sleep_time, wake_time, energy_morning, energy_afternoon, caffeine_alcohol } = await req.json();

    const userPrompt = `Dados do diagnóstico circadiano da usuária:

- **Vai para a cama:** ${bed_time}
- **Pega no sono (efetivo):** ${sleep_time}
- **Acorda:** ${wake_time}
- **Energia 2h após acordar (1-10):** ${energy_morning}
- **Energia no meio da tarde (1-10):** ${energy_afternoon}
- **Cafeína/Álcool:** ${caffeine_alcohol || "Não informado"}

Gere agora o plano completo de otimização neuro-circadiana seguindo rigorosamente a estrutura definida.`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns segundos." }), {
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
      throw new Error("Erro ao gerar plano de sono");
    }

    const aiData = await aiResponse.json();
    const plan = aiData.choices?.[0]?.message?.content || "Não foi possível gerar o plano.";

    // Detect chronotype heuristically from energy pattern
    let chronotype = "Intermediário";
    if (energy_morning >= 7 && energy_afternoon < energy_morning) chronotype = "Matutino";
    else if (energy_afternoon >= 7 && energy_morning < energy_afternoon) chronotype = "Vespertino";

    return new Response(JSON.stringify({ plan, chronotype }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sleep-regulator error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
