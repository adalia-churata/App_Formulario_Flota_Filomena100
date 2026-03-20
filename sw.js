/**
 * FILOMENA100 — Service Worker v3
 * Cache seguro: solo archivos que existen garantizados
 */

var CACHE = 'filomena100-v3';

/* Solo cacheamos archivos que SIEMPRE existen */
var ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/config.js',
  './js/app.js',
  './manifest.json',
];

/* Instalación: addAll con manejo de error por archivo */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      /* Intentamos cachear cada archivo individualmente
         para que un fallo no rompa toda la instalación */
      var promises = ASSETS.map(function(url) {
        return cache.add(url).catch(function(err) {
          console.warn('[SW] No se pudo cachear:', url, err);
        });
      });
      return Promise.all(promises);
    })
  );
  self.skipWaiting();
});

/* Activación: limpiar caches viejos */
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

/* Fetch: Network-first, fallback a cache */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* No interceptar Microsoft Forms, Google Fonts ni externos */
  if (url.includes('forms.office.com')      ||
      url.includes('forms.microsoft.com')   ||
      url.includes('fonts.googleapis.com')  ||
      url.includes('fonts.gstatic.com')     ||
      url.includes('login.microsoftonline.com')) {
    return;
  }

  /* Solo interceptar GET */
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        /* Cachear respuesta fresca si es válida */
        if (response && response.ok) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        /* Sin red: servir desde cache */
        return caches.match(e.request).then(function(cached) {
          if (cached) return cached;
          /* Fallback a index.html para navegación */
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return new Response('', { status: 503 });
        });
      })
  );
});
