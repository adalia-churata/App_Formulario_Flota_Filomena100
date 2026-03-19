/**
 * FILOMENA100 — Service Worker v1.0
 * Permite instalar la app en Android y cachear assets del menú.
 * Los iframes de Microsoft Forms requieren internet para funcionar.
 */

var CACHE = 'filomena100-v1.0';
var ASSETS = [
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/app.js',
  '/manifest.json',
];

/* ── Instalación: cachear assets ── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* ── Activación: limpiar caches viejos ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k)   { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* ── Fetch: Network-first para forms, Cache-first para assets ── */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // NUNCA interceptar Microsoft Forms ni Google Fonts
  if (url.includes('forms.office.com') ||
      url.includes('forms.microsoft.com') ||
      url.includes('fonts.googleapis.com') ||
      url.includes('fonts.gstatic.com') ||
      url.includes('login.microsoftonline.com')) {
    return; // pasa directamente a la red
  }

  // Assets propios: cache-first con fallback a red
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (response.ok && e.request.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Sin red y sin cache: devolver index.html para navegación
        if (e.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        return new Response('', { status: 503 });
      });
    })
  );
});
