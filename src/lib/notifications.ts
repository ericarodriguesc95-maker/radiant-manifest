import { supabase } from "@/integrations/supabase/client";

const LAST_MORNING_KEY = "glowup_last_morning_notification";
const LAST_HABIT_KEY = "glowup_last_habit_notification";

const VAPID_PUBLIC_KEY = 'BLd6x5tyfPzGO4-R6tpHnYD8F4BwG5cSTy7f6kK7XBYS_B7A0_ETssDQ_HUYMBrOD_pxAJ-Y3JudSMAwBn-eYxo';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

/**
 * Subscribe to Web Push via PushManager (works in any browser/APK wrapper with SW support)
 */
export async function subscribeToPush(userId: string): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (!registration?.pushManager) {
      console.log('PushManager not available');
      return false;
    }

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    if (!subscription) return false;

    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');
    if (!key || !auth) return false;

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
    const authStr = btoa(String.fromCharCode(...new Uint8Array(auth)));

    // Save to database
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: p256dh,
      auth: authStr,
    }, { onConflict: 'user_id,endpoint' });

    if (error) console.error('Error saving push subscription:', error);
    return !error;
  } catch (err) {
    console.log('Push subscription failed (may not be supported):', err);
    return false;
  }
}

/**
 * Send notification via Service Worker (better for mobile - vibrates, shows in tray)
 */
export async function sendNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const options: NotificationOptions & { vibrate?: number[]; requireInteraction?: boolean } = {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag,
    silent: false,
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  } catch {}

  const notification = new Notification(title, options);
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

/** Send social notification (like, comment, follow, etc.) — always sends */
export function sendSocialNotification(fromName: string, type: string, commentText?: string) {
  let title = "Gloow Up Club 🦋";
  let body = "";

  switch (type) {
    case "like":
      title = "❤️ Nova curtida";
      body = `${fromName} curtiu seu post!`;
      break;
    case "comment":
      title = "💬 Novo comentário";
      body = commentText
        ? `${fromName}: "${commentText}"`
        : `${fromName} comentou no seu post`;
      break;
    case "mention":
      title = "📣 Você foi mencionada";
      body = commentText
        ? `${fromName}: "${commentText}"`
        : `${fromName} mencionou você`;
      break;
    case "follow":
      title = "👤 Nova seguidora";
      body = `${fromName} começou a te seguir!`;
      break;
    case "welcome":
      title = "🦋 Nova integrante";
      body = `${fromName} entrou para o Gloow Up Club!`;
      break;
    case "new_post":
      title = "📝 Nova publicação";
      body = `${fromName} publicou na comunidade`;
      break;
    default:
      body = `${fromName} interagiu com você`;
  }

  sendNotification(title, body, `social-${type}-${Date.now()}`);
}

/** Send notification about a new app update */
export function sendAppUpdateNotification(title: string, description: string) {
  sendNotification(
    "🎁 Nova Atualização!",
    `${title}: ${description}`,
    `app-update-${Date.now()}`
  );
}

/** Send daily affirmation notification */
export function sendDailyAffirmationNotification(text: string) {
  sendNotification("✨ Afirmação do Dia", text, "daily-affirmation");
}

/** Send daily devotional / palavra do dia notification */
export function sendDailyDevotionalNotification(text: string) {
  sendNotification("✝️ Palavra do Dia", text, "daily-devotional");
}

/** Send cycle fertile window notification */
export function sendCycleFertileNotification(daysUntil: number) {
  if (daysUntil === 0) {
    sendNotification(
      "🌸 Período Fértil Hoje",
      "Sua janela fértil começa hoje! Confira o rastreador de ciclo para mais detalhes.",
      "cycle-fertile"
    );
  } else {
    sendNotification(
      "🌸 Período Fértil Próximo",
      `Sua janela fértil começa em ${daysUntil} dia${daysUntil > 1 ? "s" : ""}. Fique atenta aos sinais do seu corpo.`,
      "cycle-fertile"
    );
  }
}

/** Send next period notification */
export function sendCyclePeriodNotification(daysUntil: number) {
  if (daysUntil === 0) {
    sendNotification(
      "🩸 Menstruação Prevista para Hoje",
      "Sua menstruação está prevista para hoje. Cuide-se e prepare-se! ❤️",
      "cycle-period"
    );
  } else {
    sendNotification(
      "🩸 Menstruação Próxima",
      `Sua menstruação está prevista em ${daysUntil} dia${daysUntil > 1 ? "s" : ""}. Prepare-se e cuide do seu corpo.`,
      "cycle-period"
    );
  }
}

export function sendHabitReminderNotification() {
  sendNotification(
    "📋 Hábitos Diários",
    "Você já conferiu seus hábitos de hoje? Abra o app e marque o que já fez! 💪",
    "habit-reminder"
  );
}

// ── Scheduling ──

let morningIntervalId: ReturnType<typeof setInterval> | null = null;
let habitIntervalId: ReturnType<typeof setInterval> | null = null;

function clearAllScheduled() {
  if (morningIntervalId) { clearInterval(morningIntervalId); morningIntervalId = null; }
  if (habitIntervalId) { clearInterval(habitIntervalId); habitIntervalId = null; }
}

function getAffirmationForDate(date: Date): string {
  const affirmations = [
    "Eu sou digna de amor, sucesso e abundância.",
    "Eu sou forte, capaz e corajosa.",
    "Minha energia é magnética e positiva.",
    "Eu mereço o melhor e o melhor vem até mim.",
    "Eu confio no processo da minha vida.",
    "Cada dia eu me torno uma versão melhor de mim mesma.",
    "Eu atraio oportunidades incríveis.",
    "Minha mente é poderosa e criativa.",
    "Eu sou grata por tudo que tenho e tudo que virá.",
    "Eu irradio confiança e luz.",
    "Eu escolho pensamentos que me elevam.",
    "Meu potencial é ilimitado.",
    "Eu sou merecedora de todas as coisas boas.",
    "A abundância flui naturalmente para mim.",
    "Eu me amo e me aceito completamente.",
    "Cada desafio é uma oportunidade de crescimento.",
    "Eu estou criando a vida dos meus sonhos.",
    "Minha intuição me guia com sabedoria.",
    "Eu sou uma força da natureza.",
    "O universo conspira a meu favor.",
    "Eu libero o que não me serve mais.",
    "Minha jornada é única e valiosa.",
    "Eu celebro cada pequena conquista.",
    "Minha presença faz diferença no mundo.",
    "Eu acolho mudanças com coragem e fé.",
    "Minha paz interior é inabalável.",
    "Eu sou a protagonista da minha história.",
    "Eu transformo obstáculos em trampolins.",
    "Minha gratidão multiplica minhas bênçãos.",
    "Eu brilho com minha luz própria.",
    "Hoje é um dia perfeito para recomeçar.",
  ];
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return affirmations[dayOfYear % affirmations.length];
}

function getDevotionalForDate(date: Date): string {
  const devotionals = [
    "Porque eu sei os planos que tenho para vocês — Jeremias 29:11",
    "Tudo posso naquele que me fortalece — Filipenses 4:13",
    "Confie no Senhor de todo o coração — Provérbios 3:5",
    "O Senhor é meu pastor, nada me faltará — Salmos 23:1",
    "Sede fortes e corajosos — Josué 1:9",
    "Deus é o nosso refúgio e fortaleza — Salmos 46:1",
    "Entrega o teu caminho ao Senhor — Salmos 37:5",
    "O amor é paciente, o amor é bondoso — 1 Coríntios 13:4",
    "Busquem primeiro o Reino de Deus — Mateus 6:33",
    "Não temas, porque eu sou contigo — Isaías 41:10",
    "Alegrem-se sempre no Senhor — Filipenses 4:4",
    "Lâmpada para os meus pés é a tua palavra — Salmos 119:105",
    "Deus é amor — 1 João 4:8",
    "A fé é a certeza das coisas que se esperam — Hebreus 11:1",
    "Em tudo dai graças — 1 Tessalonicenses 5:18",
    "Eu sou o caminho, a verdade e a vida — João 14:6",
    "O Senhor é a minha luz e a minha salvação — Salmos 27:1",
    "Tudo tem o seu tempo — Eclesiastes 3:1",
    "Não se amoldem ao padrão deste mundo — Romanos 12:2",
    "A esperança não nos decepciona — Romanos 5:5",
    "Bem-aventurados os que têm fome de justiça — Mateus 5:6",
    "O Senhor é bom para todos — Salmos 145:9",
    "Pedi e vos será dado — Mateus 7:7",
    "Porque Deus amou o mundo de tal maneira — João 3:16",
    "Descansem em mim — Mateus 11:28",
    "Tudo coopera para o bem — Romanos 8:28",
    "Quem está em Cristo, nova criatura é — 2 Coríntios 5:17",
    "O Senhor é fiel — 2 Tessalonicenses 3:3",
    "Sejam fortes e não desanimem — 2 Crônicas 15:7",
    "A paz vos deixo, a minha paz vos dou — João 14:27",
    "Grandes coisas fez o Senhor — Salmos 126:3",
  ];
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return devotionals[dayOfYear % devotionals.length];
}

function scheduleAllNotifications() {
  clearAllScheduled();

  morningIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = now.toDateString();

    if (currentTime === "08:00" && localStorage.getItem(LAST_MORNING_KEY) !== today) {
      localStorage.setItem(LAST_MORNING_KEY, today);
      sendDailyAffirmationNotification(getAffirmationForDate(now));
      setTimeout(() => sendDailyDevotionalNotification(getDevotionalForDate(now)), 3000);
    }
  }, 30_000);

  habitIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = now.toDateString();

    if (currentTime === "20:00" && localStorage.getItem(LAST_HABIT_KEY) !== today) {
      localStorage.setItem(LAST_HABIT_KEY, today);
      sendHabitReminderNotification();
    }
  }, 30_000);
}

/**
 * Initialize notification system — requests permission, subscribes to push, schedules local.
 */
export async function initNotifications(userId?: string) {
  const granted = await requestNotificationPermission();
  if (granted) {
    scheduleAllNotifications();
    // Subscribe to Web Push if userId available
    if (userId) {
      subscribeToPush(userId).catch(console.error);
    }
  }
}

/** Send test notifications immediately */
export function sendTestNotifications() {
  const now = new Date();
  sendDailyAffirmationNotification(getAffirmationForDate(now));
  setTimeout(() => sendDailyDevotionalNotification(getDevotionalForDate(now)), 1500);
  setTimeout(() => sendHabitReminderNotification(), 3000);
  setTimeout(() => sendSocialNotification("Teste", "like"), 4500);
}
