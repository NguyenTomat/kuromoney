// Kuromi PWA Service Worker for iOS Native Push Notifications & Offline Support
const CACHE_NAME = 'kuromoney-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('./index.html');
    })
  );
});

self.addEventListener('push', (event) => {
  let data = { title: 'Kuromi Nhắc Nhở 🎀', body: 'Bạn ơi, hôm nay đã ghi chi tiêu chưa nè? 🐾' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  const options = {
    body: data.body,
    icon: 'assets/chibi_clean.png',
    badge: 'assets/chibi_clean.png',
    vibrate: [200, 100, 200],
    data: { dateOfArrival: Date.now() }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
