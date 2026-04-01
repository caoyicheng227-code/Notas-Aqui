// Notas Aqui - Service Worker with Auto-Update
const CACHE_NAME = 'notas-aqui-v1';

// On install: cache nothing special, just activate immediately
self.addEventListener('install', (event) => {
  // Skip waiting so the new SW activates immediately without user action
  self.skipWaiting();
});

// On activate: claim all clients immediately so updates apply right away
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Network-first with cache fallback
// This ensures users always get the latest version when online
self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache the fresh response
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => {
        // Network failed, serve from cache
        return caches.match(event.request);
      })
  );
});
