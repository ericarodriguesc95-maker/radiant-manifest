import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { normalizeSchedule, dueNotificationSlots, scheduleClock } from '../_shared/notification-schedule.ts';
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
    { title: '🎯 Foque no que importa', body: 'Atualize suas metas e avance um passo hoje.' },
    { title: '✨ Visualize seu sonho', body: 'Abra seu Vision Board por 60s. Sinta como se já fosse seu.' },
    { title: '👯 Conecte com a comunidade', body: 'Sua comunidade tem novidades te esperando 💛' },
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


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const response = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return response({ error: 'Missing configuration' }, 500);
    const db = createClient(url, key);
    const { data: config, error: configError } = await db.from('notification_scheduler_config').select('secret,vapid_keys').eq('id', true).single();
    if (configError || !config || req.headers.get('x-scheduler-secret') !== config.secret) return response({ error: 'Unauthorized' }, 401);
    if (!config.vapid_keys) {
      const keys = webpush.generateVAPIDKeys();
      const { error: keyError } = await db.from('notification_scheduler_config').update({ vapid_keys: keys }).eq('id', true).is('vapid_keys', null);
      if (keyError) throw keyError;
    }
    const { data: signing, error: signingError } = await db.from('notification_scheduler_config').select('vapid_keys').eq('id', true).single();
    if (signingError || !signing?.vapid_keys) throw new Error('Signing configuration unavailable');
    webpush.setVapidDetails('mailto:contato@gloowupclub.com', signing.vapid_keys.publicKey, signing.vapid_keys.privateKey);
    const { data: subscriptions, error } = await db.from('push_subscriptions').select('id,user_id,endpoint,p256dh,auth');
    if (error) throw error;
    const users = [...new Set((subscriptions || []).map(s => s.user_id))];
    if (!users.length) return response({ sent: 0 });
    const { data: profiles, error: profileError } = await db.from('profiles').select('user_id,notification_schedule,checkpoint_reminder_enabled,checkpoint_reminder_times').in('user_id', users);
    if (profileError) throw profileError;
    const now = new Date();
    let sent = 0; let failed = 0;
    for (const profile of profiles || []) {
      const schedule = normalizeSchedule(profile.notification_schedule);
      const clock = scheduleClock(now, schedule.timezone);
      const messages = dueNotificationSlots(schedule, now).map(slot => ({ key: `${clock.day}-${slot}-${clock.time}`, tag: `scheduled-${slot}`, ...POOLS[slot][Math.floor(Math.random() * POOLS[slot].length)] }));
      if (profile.checkpoint_reminder_enabled && profile.checkpoint_reminder_times?.includes(clock.time)) messages.push({ key: `${clock.day}-checkpoint-${clock.time}`, tag: 'checkpoints-reminder', title: 'Check-points do dia 👑', body: 'Bora somar pontos, rainha! Complete os seus check-points e suba no ranking.' });
      for (const message of messages) {
        const { error: claimError } = await db.from('notification_deliveries').insert({ user_id: profile.user_id, delivery_key: message.key });
        if (claimError?.code === '23505') continue;
        if (claimError) throw claimError;
        let delivered = false;
        for (const sub of (subscriptions || []).filter(s => s.user_id === profile.user_id)) {
          try {
            await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ title: message.title, body: message.body, tag: message.tag, url: message.tag === 'checkpoints-reminder' ? '/checkpoints' : '/', kind: message.tag === 'checkpoints-reminder' ? 'checkpoint-reminder' : 'generic' }), { TTL: 300 });
            sent++; delivered = true;
          } catch (err) {
            failed++;
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410) await db.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
        if (!delivered) await db.from('notification_deliveries').delete().eq('user_id', profile.user_id).eq('delivery_key', message.key);
        else if (message.tag === 'checkpoints-reminder') await db.from('reminder_events').insert({ user_id: profile.user_id, event_type: 'received', source: 'scheduled', metadata: { time: clock.time } });
      }
    }
    return response({ sent, failed });
  } catch { return response({ error: 'Scheduled delivery failed' }, 500); }
});
