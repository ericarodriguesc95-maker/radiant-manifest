import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
      return new Response(JSON.stringify({ error: "Faça login para usar a assistente." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check subscription status
    const serviceClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: subData } = await serviceClient
      .from("subscriptions")
      .select("status, plan_type, expiry_date")
      .eq("user_id", user.id)
      .maybeSingle();

    const hasAccess = subData && (
      subData.plan_type === "lifetime" ||
      subData.status === "trialing" ||
      (subData.status === "active" && (!subData.expiry_date || new Date(subData.expiry_date) > new Date()))
    );

    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Assinatura inativa. Renove para usar a assistente IA." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, systemOverride } = await req.json();

    // Fetch user's upcoming events for context
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    
    // Calculate tomorrow
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: events } = await supabase
      .from("calendar_events")
      .select("title, event_date, start_time, end_time, is_completed")
      .eq("user_id", user.id)
      .gte("event_date", todayStr)
      .order("event_date")
      .limit(20);

    const eventsContext = events && events.length > 0
      ? `\n\nEventos da agenda da usuária:\n${events.map(e =>
          `- ${e.title} em ${e.event_date}${e.start_time ? ` às ${e.start_time}` : ""}${e.is_completed ? " (concluído)" : ""}`
        ).join("\n")}`
      : "\n\nA usuária não tem eventos agendados próximos.";

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    const userName = profile?.display_name || "querida";

    const systemPrompt = `Você é a **Assistente Glow Up** ✨ — a assistente pessoal de alta performance da ${userName}.

## Sua Identidade
Você é como o Google Gemini: fluida, inteligente, natural e proativa. Responda de forma conversacional e humana — nunca robótica. Adapte o tom conforme o contexto: leve e divertida para conversas casuais, focada e estratégica para planejamento.

## Personalidade
- **Empática e acolhedora**: Valide sentimentos e conquistas. "Vamos juntas conquistar esse objetivo!", "Organizei sua agenda para você brilhar hoje!"
- **Proativa**: Antecipe necessidades, sugira melhorias na rotina sem que peçam.
- **Motivadora**: Celebre progresso. "Que orgulho de você!", "Mais um passo rumo à sua melhor versão!"
- **Inteligente e fluida**: Respostas claras, bem estruturadas. Use markdown (negrito, listas) com elegância. Emojis com moderação.
- **Contextual**: Lembre-se do que foi dito anteriormente na conversa. Se ela mencionou algo antes, faça referência.

## Capacidades
1. **Agendamentos**: Crie eventos na agenda usando create_calendar_event. Compromissos, estudos, treinos, meditações, etc.
2. **Consulta de agenda**: Veja os eventos já agendados e informe a usuária.
3. **Produtividade**: Técnicas (Pomodoro, time blocking, Eisenhower), organização, gestão de tempo.
4. **Motivação**: Frases personalizadas, incentivo ao progresso, celebração de conquistas.
5. **Bem-estar**: Dicas de saúde mental, skincare, exercícios, autocuidado, sono.
6. **Conversas naturais**: Responda perguntas gerais de forma inteligente, como faria uma amiga muito culta e prestativa.

## Regras de Raciocínio (estilo Gemini)
- Pense passo a passo antes de responder questões complexas.
- Se a pergunta for ambígua, interprete com o contexto mais provável e pergunte para confirmar se necessário.
- Nunca diga "não posso fazer isso" — sempre ofereça uma alternativa ou solução criativa.
- Para agendamentos: se falta a data, pergunte. Se falta o horário, sugira um adequado.
- Ao listar informações, use bullet points ou numeração para clareza.

## Contexto Temporal
- Hoje é **${now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}** (${todayStr}).
- "Amanhã" = **${tomorrowStr}** (${tomorrow.toLocaleDateString("pt-BR", { weekday: "long" })}).
- Use YYYY-MM-DD para datas e HH:MM para horários nas ferramentas.
- "Depois de amanhã" = calcule somando 2 dias.
- "Sexta", "segunda", etc. = calcule o próximo dia da semana a partir de hoje.

${eventsContext}

## Tom de Voz
Fale como uma amiga próxima e profissional. Trate no feminino. Seja concisa mas calorosa. Termine mensagens importantes com motivação. Responda em português brasileiro.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_calendar_event",
          description: "Cria um evento na agenda da usuária. Use quando ela pedir para agendar algo, criar lembrete ou marcar compromisso.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Título do evento" },
              event_date: { type: "string", description: "Data no formato YYYY-MM-DD" },
              start_time: { type: "string", description: "Horário de início no formato HH:MM" },
              end_time: { type: "string", description: "Horário de fim no formato HH:MM (opcional)" },
              description: { type: "string", description: "Descrição do evento (opcional)" },
              reminder_minutes: { type: "number", description: "Minutos antes para lembrete (padrão: 30)" },
            },
            required: ["title", "event_date"],
            additionalProperties: false,
          },
        },
      },
    ];

    console.log("[ai-assistant] Calling AI gateway with", messages.length, "messages");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemOverride || systemPrompt },
          ...messages,
        ],
        ...(systemOverride ? {} : { tools, tool_choice: "auto" }),
        stream: false,
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
      throw new Error("Erro ao processar sua mensagem");
    }

    const aiData = await aiResponse.json();
    console.log("[ai-assistant] AI response received, choices:", aiData.choices?.length);
    const choice = aiData.choices?.[0];

    // Handle tool calls
    if (choice?.message?.tool_calls?.length > 0) {
      const toolResults = [];
      let eventCreated = false;
      const createdEvents = [];

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === "create_calendar_event") {
          const args = JSON.parse(toolCall.function.arguments);
          console.log("[ai-assistant] Creating event:", args);
          
          const { error: insertError } = await supabase
            .from("calendar_events")
            .insert({
              user_id: user.id,
              title: args.title,
              event_date: args.event_date,
              start_time: args.start_time || null,
              end_time: args.end_time || null,
              description: args.description || null,
              reminder_minutes: args.reminder_minutes ?? 30,
            });

          const resultMsg = insertError
            ? `Erro ao criar evento: ${insertError.message}`
            : `Evento "${args.title}" criado com sucesso para ${args.event_date}${args.start_time ? ` às ${args.start_time}` : ""}!`;

          if (!insertError) {
            eventCreated = true;
            createdEvents.push(args);
          }

          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: resultMsg,
          });
        }
      }

      // Second call to get natural language response after tool execution
      const followUp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolResults,
          ],
          stream: false,
        }),
      });

      if (!followUp.ok) {
        const t = await followUp.text();
        console.error("Follow-up error:", t);
        return new Response(JSON.stringify({
          reply: toolResults.map(r => r.content).join("\n"),
          event_created: eventCreated,
          created_events: createdEvents,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const followUpData = await followUp.json();
      return new Response(JSON.stringify({
        reply: followUpData.choices?.[0]?.message?.content || toolResults.map(r => r.content).join("\n"),
        event_created: eventCreated,
        created_events: createdEvents,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      reply: choice?.message?.content || "Desculpe, não consegui processar sua mensagem. Pode tentar de novo? 💛",
      event_created: false,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
