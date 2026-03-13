const devotionals = [
  "Porque eu sei os planos que tenho para vocês — Jeremias 29:11",
  "Tudo posso naquele que me fortalece — Filipenses 4:13",
  "Confie no Senhor de todo o coração — Provérbios 3:5",
  "O Senhor é meu pastor, nada me faltará — Salmos 23:1",
  "Sede fortes e corajosos — Josué 1:9",
  "Deus é o nosso refúgio e fortaleza — Salmos 46:1",
  "Entrega o teu caminho ao Senhor — Salmos 37:5",
];

const affirmations = [
  "Eu sou digna de amor, sucesso e abundância.",
  "Eu sou forte, capaz e corajosa.",
  "Minha energia é magnética e positiva.",
  "Eu mereço o melhor e o melhor vem até mim.",
];

const NOTIFICATION_SETTINGS_KEY = "glowup_notification_settings";
const LAST_NOTIFICATION_KEY = "glowup_last_notification";

export interface NotificationSettings {
  enabled: boolean;
  versiculo: boolean;
  afirmacao: boolean;
  metas: boolean;
  social: boolean;
  horario: string; // HH:MM
}

export function getNotificationSettings(): NotificationSettings {
  try {
    const stored = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure social field exists for existing users
      if (parsed.social === undefined) parsed.social = true;
      return parsed;
    }
  } catch {}
  return {
    enabled: false,
    versiculo: true,
    afirmacao: true,
    metas: true,
    social: true,
    horario: "08:00",
  };
}

export function saveNotificationSettings(settings: NotificationSettings) {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  if (settings.enabled) {
    scheduleNotifications(settings);
  } else {
    clearScheduledNotifications();
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function getPermissionStatus(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Send notification via Service Worker (better for mobile - vibrates, shows in tray)
 * Falls back to basic Notification API if SW not available
 */
export async function sendNotification(title: string, body: string, tag: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const options: NotificationOptions & { vibrate?: number[]; requireInteraction?: boolean } = {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag,
    silent: false,
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  // Try Service Worker first (works better on mobile, even when app is in background)
  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, options);
      return;
    }
  } catch {
    // Fallback below
  }

  // Fallback to basic Notification API
  const notification = new Notification(title, options);
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
}

export function sendVerseNotification() {
  const verse = getRandomItem(devotionals);
  sendNotification("✝️ Versículo do Dia", verse, "daily-verse");
}

export function sendAffirmationNotification() {
  const affirmation = getRandomItem(affirmations);
  sendNotification("✨ Afirmação do Dia", affirmation, "daily-affirmation");
}

export function sendGoalsNotification() {
  sendNotification(
    "🎯 Lembrete de Metas",
    "Hora de revisar suas metas! Abra o app e verifique seu progresso.",
    "goals-reminder"
  );
}

/** Send social notification (like, comment, follow, etc.) */
export function sendSocialNotification(fromName: string, type: string, commentText?: string) {
  const settings = getNotificationSettings();
  if (!settings.enabled || !settings.social) return;

  let title = "Glow Up 🦋";
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
      body = `${fromName} entrou para o Glow Up!`;
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

let notificationIntervalId: ReturnType<typeof setInterval> | null = null;

function clearScheduledNotifications() {
  if (notificationIntervalId) {
    clearInterval(notificationIntervalId);
    notificationIntervalId = null;
  }
}

function scheduleNotifications(settings: NotificationSettings) {
  clearScheduledNotifications();

  // Check every minute if it's time to send
  notificationIntervalId = setInterval(() => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const today = now.toDateString();
    const lastSent = localStorage.getItem(LAST_NOTIFICATION_KEY);

    if (currentTime === settings.horario && lastSent !== today) {
      localStorage.setItem(LAST_NOTIFICATION_KEY, today);

      if (settings.versiculo) {
        sendVerseNotification();
      }
      if (settings.afirmacao) {
        setTimeout(() => sendAffirmationNotification(), 3000);
      }
      if (settings.metas) {
        setTimeout(() => sendGoalsNotification(), 6000);
      }
    }
  }, 30_000); // check every 30s
}

export function initNotifications() {
  const settings = getNotificationSettings();
  if (settings.enabled && Notification.permission === "granted") {
    scheduleNotifications(settings);
  }
}

// Send test notifications immediately
export function sendTestNotifications(settings: NotificationSettings) {
  if (settings.versiculo) sendVerseNotification();
  if (settings.afirmacao) setTimeout(() => sendAffirmationNotification(), 1500);
  if (settings.metas) setTimeout(() => sendGoalsNotification(), 3000);
  if (settings.social) setTimeout(() => sendSocialNotification("Teste", "like"), 4500);
}
