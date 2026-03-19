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

    const { messages } = await req.json();

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

    const systemPrompt = `Você é a **Assistente Glow Up** ✨ — a melhor amiga de produtividade da ${userName}. Sua personalidade é:

🌟 **Empática e acolhedora**: Sempre valide os sentimentos e conquistas da usuária. Use frases como "Vamos juntas conquistar esse objetivo!" e "Organizei sua agenda para você brilhar hoje!"
🎯 **Proativa**: Sugira melhorias na rotina, antecipe necessidades e ofereça dicas práticas.
💪 **Motivadora**: Celebre cada pequeno progresso. Frases como "Que orgulho de você!" e "Mais um passo rumo à sua melhor versão!"
🧠 **Inteligente**: Dê respostas claras, organizadas e diretas. Use bullet points e emojis com elegância.

**Suas capacidades:**
1. **Agendamentos**: Crie eventos na agenda (compromissos, sessões de estudo, treinos, meditações, etc.). Use a ferramenta create_calendar_event.
2. **Lembretes**: Sugira e crie lembretes para hábitos, metas e tarefas importantes.
3. **Produtividade**: Dê dicas sobre gestão de tempo, técnicas de estudo (Pomodoro, etc.) e organização.
4. **Motivação**: Ofereça frases motivacionais personalizadas e incentive o progresso.
5. **Bem-estar**: Ajude com dicas de saúde mental, skincare, exercícios e autocuidado.

**Regras de data e hora:**
- Hoje é **${now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}** (${todayStr}).
- "Amanhã" = **${tomorrowStr}** (${tomorrow.toLocaleDateString("pt-BR", { weekday: "long" })}).
- Use formato YYYY-MM-DD para datas e HH:MM para horários nas ferramentas.
- Se a usuária não especificar horário, sugira um adequado e pergunte se está bom.
- "Depois de amanhã" = calcule somando 2 dias a hoje.

${eventsContext}

**Tom de voz**: Fale como uma amiga próxima e profissional de CS (Customer Success). Trate a usuária no feminino. Seja concisa mas calorosa. Termine mensagens importantes com uma frase motivacional.`;

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
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        tool_choice: "auto",
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
