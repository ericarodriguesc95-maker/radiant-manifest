import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RELIGION_LABELS: Record<string, string> = {
  crista_catolica: "Cristã Católica",
  crista_evangelica: "Cristã Evangélica",
  crista_ortodoxa: "Cristã Ortodoxa",
  crista_adventista: "Cristã Adventista",
  espirita: "Espírita (doutrina de Allan Kardec)",
  budista: "Budista",
  islamica: "Islâmica",
  judaica: "Judaica",
  hinduista: "Hinduísta",
  taoista: "Taoísta",
  xintoista: "Xintoísta",
  sikh: "Sikh",
  umbanda: "Umbanda",
  candomble: "Candomblé",
  wicca: "Wicca",
  bahai: "Bahá'í",
  confucionista: "Confucionista",
  jainista: "Jainista",
  zoroastrista: "Zoroastrista",
  ateista: "Ateísta/Humanista (sabedoria filosófica, sem referência a divindade)",
  agnostica: "Agnóstica (sabedoria universal, sem afirmações sobre o divino)",
  universal: "Espiritualidade Universal (sabedoria de várias tradições)",
};

function isValidISODate(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + "T00:00:00Z").getTime());
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { religion, date } = await req.json();

    if (!religion || !RELIGION_LABELS[religion]) {
      return new Response(JSON.stringify({ error: "Religião inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!date || !isValidISODate(date)) {
      return new Response(JSON.stringify({ error: "Data inválida." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Check cache
    const { data: cached } = await supabase
      .from("daily_devotionals")
      .select("verse, source, reflection, study, practice")
      .eq("date", date)
      .eq("religion", religion)
      .maybeSingle();

    if (cached) {
      return new Response(JSON.stringify({ devotional: cached, cached: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Generate via Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY não configurada");

    const religionLabel = RELIGION_LABELS[religion];
    const dateObj = new Date(date + "T00:00:00Z");
    const dayOfYear = Math.floor(
      (dateObj.getTime() - new Date(Date.UTC(dateObj.getUTCFullYear(), 0, 0)).getTime()) / 86400000
    );

    const prompt = `Você é uma guia espiritual erudita da tradição ${religionLabel}.

Gere a "Palavra do Dia" para o dia ${dayOfYear} de ${dateObj.getUTCFullYear()} (data ${date}).

REGRAS OBRIGATÓRIAS:
1. TODO o conteúdo OBRIGATORIAMENTE em PORTUGUÊS DO BRASIL. NUNCA use inglês, latim, hebraico, árabe ou qualquer outro idioma no campo "verse". Se citar uma fonte estrangeira, traduza integralmente para o português.
2. O conteúdo deve ser ÚNICO e ESPECÍFICO para este dia — diferente de qualquer outro dia do ano. Use o número do dia (${dayOfYear}) como semente para garantir variedade. Evite versículos comuns (João 3:16, Salmo 23, Filipenses 4:13) a menos que seja realmente o melhor para este dia específico.
3. Seja fiel à tradição ${religionLabel}, citando textos sagrados, mestres, filósofos ou escrituras autênticos dessa tradição.
4. Tom: elevado, inspirador, respeitoso, com profundidade espiritual real.

Responda APENAS com um JSON válido, sem markdown, sem explicações, no formato exato:
{
  "verse": "frase ou versículo principal, em português, entre 1 e 3 linhas",
  "source": "fonte completa em português (ex: 'Mateus 5:8', 'Bhagavad Gita 2:47', 'Allan Kardec — O Livro dos Espíritos')",
  "reflection": "reflexão de 2 a 3 frases conectando o versículo à vida prática da mulher contemporânea",
  "study": "aprofundamento de 3 a 4 frases sobre o contexto histórico/teológico/filosófico desta passagem dentro da tradição ${religionLabel}",
  "practice": "uma prática concreta e realizável hoje, em 1 a 2 frases, alinhada à tradição"
}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é uma guia espiritual fiel a cada tradição, sempre respondendo em português do Brasil e em JSON puro." },
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

    if (!parsed?.verse || !parsed?.source || !parsed?.reflection || !parsed?.study || !parsed?.practice) {
      throw new Error("Resposta da IA inválida");
    }

    const devotional = {
      verse: String(parsed.verse).trim(),
      source: String(parsed.source).trim(),
      reflection: String(parsed.reflection).trim(),
      study: String(parsed.study).trim(),
      practice: String(parsed.practice).trim(),
    };

    // 3. Cache it (ignore conflict — another request may have inserted first)
    await supabase
      .from("daily_devotionals")
      .insert({ date, religion, ...devotional });

    return new Response(JSON.stringify({ devotional, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("daily-devotional error", err);
    return new Response(JSON.stringify({ error: (err as Error).message || "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
