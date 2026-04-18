// Edge function: dispara notificações push agendadas baseadas no slot do dia.
// Chamada por cron jobs do pg_cron em 5 horários fixos.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Slot = 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';

const POOLS: Record<Slot, { title: string; body: string }[]> = {
  morning: [
    { title: '🌅 Bom dia, rainha', body: 'Comece o dia com 1 afirmação poderosa. Seu glow começa agora ✨' },
    { title: '👑 Hoje você brilha', body: 'Marque seus hábitos da manhã e ative o modo elite 🔥' },
    { title: '☀️ Acorde e manifeste', body: 'Defina sua intenção do dia no Hub de Manifestação 💫' },
    { title: '🦋 Nova versão sua', body: 'Que tal abrir a Bíblia 365 e nutrir sua alma agora?' },
    { title: '💎 Disciplina = liberdade', body: 'Seu streak está esperando. Mantenha o ritmo!' },
  ],
  noon: [
    { title: '💧 Hidratação check', body: 'Bebeu água suficiente? Registre na aba Saúde agora 🥤' },
    { title: '🍽️ Pausa consciente', body: 'Coma com presença. Anote sua refeição no diário alimentar.' },
    { title: '⚡ Recarregue', body: '5 min de respiração consciente mudam seu dia inteiro.' },
    { title: '📊 Como vai a meta?', body: 'Atualize o progresso de uma meta. Pequenos passos = grande glow.' },
    { title: '🧘‍♀️ Reset do meio-dia', body: 'Abra o Reprogramação Mental e ouça uma frequência de cura.' },
  ],
  afternoon: [
    { title: '🔥 Não desacelera agora', body: 'Volte para sua Jornada Elite e desbloqueie o próximo módulo.' },
    { title: '💪 Treino calling', body: 'Já se mexeu hoje? Registre seu workout em Saúde.' },
    { title: '🎯 Foque no que importa', body: 'Use o Pomodoro em Alta Performance e produza com elite.' },
    { title: '✨ Visualize seu sonho', body: 'Abra seu Vision Board por 60s. Sinta como se já fosse seu.' },
    { title: '👯 Conecte com as girls', body: 'Sua comunidade tem novidades te esperando 💛' },
  ],
  evening: [
    { title: '📝 Como foi seu dia?', body: 'Registre uma nota no Diário antes de tudo se perder.' },
    { title: '🙏 3 gratidões', body: 'Anote 3 coisas pelas quais é grata hoje. Eleva sua vibração.' },
    { title: '💖 Check-in emocional', body: 'Como você está se sentindo? Use o Termômetro Vibracional.' },
    { title: '🦋 Você foi incrível', body: 'Marque seus hábitos do dia e celebre cada vitória.' },
    { title: '📿 Palavra do dia', body: 'Termine o dia com sua devocional personalizada 🌙' },
  ],
  night: [
    { title: '🌙 Hora de descansar', body: 'Sono = beleza + mente afiada. Desligue as telas, rainha.' },
    { title: '✨ Programe o subconsciente', body: 'Ouça uma meditação guiada antes de dormir. Reprograme-se.' },
    { title: '💫 Manhã começa hoje', body: 'Defina 1 intenção para amanhã. Acorde com propósito.' },
    { title: '🌸 Boa noite, rainha', body: 'Você plantou hoje. Amanhã colhe. Descanse com fé.' },
    { title: '🕯️ Ritual de fechamento', body: 'Respire fundo 7x. Solte o dia. Você é amor e luz.' },
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const slot: Slot = body.slot || 'morning';

    const pool = POOLS[slot] || POOLS.morning;
    const message = pickRandom(pool);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Pega todas as subscriptions ativas
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({
      title: message.title,
      body: message.body,
      tag: `scheduled-${slot}`,
      url: '/',
    });

    // Envia em paralelo (best-effort)
    const results = await Promise.allSettled(
      (subscriptions || []).map((sub) =>
        fetch(sub.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', TTL: '86400' },
          body: payload,
        })
      )
    );

    const sent = results.filter((r) => r.status === 'fulfilled').length;

    return new Response(
      JSON.stringify({ slot, sent, total: subscriptions?.length || 0, message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
