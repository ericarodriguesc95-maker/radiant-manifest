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
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, action } = await req.json();

    // If action is "create_event", create a calendar event
    if (action === "create_event") {
      const { title, event_date, start_time, end_time, description, reminder_minutes } = await req.json().catch(() => ({}));
      // This is handled via tool calling below
    }

    // Fetch user's upcoming events for context
    const today = new Date().toISOString().split("T")[0];
    const { data: events } = await supabase
      .from("calendar_events")
      .select("title, event_date, start_time, end_time, is_completed")
      .eq("user_id", user.id)
      .gte("event_date", today)
      .order("event_date")
      .limit(20);

    const eventsContext = events && events.length > 0
      ? `\n\nEventos da agenda da usuária:\n${events.map(e =>
          `- ${e.title} em ${e.event_date}${e.start_time ? ` às ${e.start_time}` : ""}${e.is_completed ? " (concluído)" : ""}`
        ).join("\n")}`
      : "\n\nA usuária não tem eventos agendados próximos.";

    const systemPrompt = `Você é a assistente de Alta Performance do app "Performance Glow Up". Seu papel é ajudar a usuária com:

1. **Agendamentos**: Ajude a criar eventos na agenda (compromissos, sessões de estudo, treinos, etc.)
2. **Lembretes**: Sugira lembretes para hábitos, metas e tarefas importantes
3. **Produtividade**: Dê dicas sobre gestão de tempo, técnicas de estudo e organização
4. **Motivação**: Ofereça frases motivacionais e incentive o progresso

Quando a usuária pedir para agendar algo, use a ferramenta create_calendar_event com os dados extraídos.
Se ela não especificar a data, pergunte. Se não especificar horário, sugira um horário adequado.
Hoje é ${new Date().toLocaleDateString("pt-BR")}.
${eventsContext}

Seja concisa, acolhedora e use emojis com moderação. Trate a usuária no feminino.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_calendar_event",
          description: "Cria um evento na agenda da usuária",
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
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error("Erro ao processar sua mensagem");
    }

    const aiData = await aiResponse.json();
    const choice = aiData.choices?.[0];

    // Handle tool calls
    if (choice?.message?.tool_calls?.length > 0) {
      const toolResults = [];

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.function.name === "create_calendar_event") {
          const args = JSON.parse(toolCall.function.arguments);
          const { data: newEvent, error: insertError } = await supabase
            .from("calendar_events")
            .insert({
              user_id: user.id,
              title: args.title,
              event_date: args.event_date,
              start_time: args.start_time || null,
              end_time: args.end_time || null,
              description: args.description || null,
              reminder_minutes: args.reminder_minutes || 30,
            })
            .select()
            .single();

          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            content: insertError
              ? `Erro ao criar evento: ${insertError.message}`
              : `Evento "${args.title}" criado com sucesso para ${args.event_date}${args.start_time ? ` às ${args.start_time}` : ""}!`,
          });
        }
      }

      // Second call to get final response after tool execution
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
        // Return the tool result directly
        return new Response(JSON.stringify({
          reply: toolResults.map(r => r.content).join("\n"),
          event_created: true,
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const followUpData = await followUp.json();
      return new Response(JSON.stringify({
        reply: followUpData.choices?.[0]?.message?.content || toolResults.map(r => r.content).join("\n"),
        event_created: true,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      reply: choice?.message?.content || "Desculpe, não consegui processar sua mensagem.",
      event_created: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
