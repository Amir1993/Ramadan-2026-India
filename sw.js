// SERVICE WORKER — Ramadan 2026 India
// Scope: /Ramadan-2026-India/

const CACHE = 'ramadan2026-v4';
const BASE = '/Ramadan-2026-India/';
const FILES = [
  BASE,
  BASE + 'index.html',
  BASE + 'manifest.json',
  BASE + 'icon-192.png',
  BASE + 'icon-512.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return Promise.allSettled(
        FILES.map(function(f){ return c.add(f).catch(function(err){ console.warn('Cache skip:', f, err); }); })
      );
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      var net = fetch(e.request).then(function(r) {
        if (r && r.status === 200) {
          var clone = r.clone();
          caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
        }
        return r;
      }).catch(function() {
        return caches.match(BASE + 'index.html').then(function(r) {
          return r || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
        });
      });
      return cached || net;
    })
  );
});
