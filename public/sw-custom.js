// Custom service worker for Web Push notifications + reminder snooze actions

self.addEventListener('push', (event) => {
  let data = { title: 'Gloow Up Club 🦋', body: 'Nova notificação!', tag: 'default' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: data.url || '/', kind: data.kind || 'generic' },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Show checkpoint reminder (invoked from page via postMessage OR internally after snooze)
function showCheckpointReminder(extraTag) {
  const tag = extraTag || 'checkpoints-reminder';
  return self.registration.showNotification('Check-points do dia 👑', {
    body: 'Bora somar pontos, rainha! Complete os seus check-points e suba no ranking.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag,
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: '/', kind: 'checkpoint-reminder' },
    actions: [
      { action: 'snooze-1h', title: '⏰ 1h' },
      { action: 'snooze-3h', title: '⏰ 3h' },
      { action: 'snooze-6h', title: '⏰ 6h' },
    ],
  });
}

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SHOW_CHECKPOINT_REMINDER') {
    event.waitUntil(showCheckpointReminder(msg.tag));
  }
});

self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const notif = event.notification;
  notif.close();

  // Snooze actions
  const snoozeMap = { 'snooze-1h': 1, 'snooze-3h': 3, 'snooze-6h': 6 };
  if (snoozeMap[action]) {
    const hours = snoozeMap[action];
    event.waitUntil((async () => {
      // Confirmation toast notification
      await self.registration.showNotification('Soneca ativada 💤', {
        body: `Vou te lembrar em ${hours}h.`,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: `snooze-confirm-${Date.now()}`,
        silent: true,
      });
      // Ask any open client to schedule; if none, fallback to setTimeout inside SW
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (allClients.length > 0) {
        allClients[0].postMessage({ type: 'SCHEDULE_CHECKPOINT_SNOOZE', hours });
      } else {
        // SW timers are unreliable when idle, but try as best effort
        setTimeout(() => showCheckpointReminder(`checkpoints-reminder-snooze-${Date.now()}`), hours * 60 * 60 * 1000);
      }
    })());
    return;
  }

  const url = notif.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.navigate(url).then(() => client.focus());
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
