// ═══════════════════════════════════════════════════════════
//  SERVICE WORKER — Ramadan 2026 India
//  Caches entire app for offline use
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'ramadan2026-v1';

// All files to cache for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Google Fonts (cached on first fetch)
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
];

// ── INSTALL: cache all static assets ──────────────────────
self.addEventListener('install', function (event) {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('[SW] Caching app shell');
      // Cache local files (required), fonts may fail — that's ok
      return cache.addAll(['/index.html', '/manifest.json'])
        .then(function () {
          return cache.add('/').catch(function () {});
        });
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: remove old caches ───────────────────────────
self.addEventListener('activate', function (event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) { return k !== CACHE_NAME; })
          .map(function (k) {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// ── FETCH: serve from cache, fallback to network ──────────
self.addEventListener('fetch', function (event) {
  // Skip non-GET and browser-extension requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        // Serve from cache, update in background (stale-while-revalidate)
        var networkFetch = fetch(event.request)
          .then(function (response) {
            if (response && response.status === 200 && response.type !== 'opaque') {
              var clone = response.clone();
              caches.open(CACHE_NAME).then(function (cache) {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(function () { /* offline, use cache */ });
        return cached || networkFetch;
      }

      // Not in cache — fetch from network and cache it
      return fetch(event.request)
        .then(function (response) {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(function () {
          // Offline fallback — return cached index.html
          if (event.request.headers.get('accept') &&
              event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// ── PUSH NOTIFICATIONS (for future Sehri/Iftar alerts) ────
self.addEventListener('push', function (event) {
  if (!event.data) return;
  var data = event.data.json();
  self.registration.showNotification(data.title || 'Ramadan 2026', {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
