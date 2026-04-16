// Custom service worker for Web Push notifications

// Handle push events (from server-side web push)
self.addEventListener('push', (event) => {
  let data = { title: 'Gloow Up Club 🦋', body: 'Nova notificação!', tag: 'default' };
  
  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: data.url || '/' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.navigate(url).then(() => client.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
