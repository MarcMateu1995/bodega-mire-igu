const CACHE_NAME = 'bodega-cache-v2';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: siempre intenta traer la versión más reciente,
// y solo usa la caché si no hay conexión.
// IMPORTANTE: solo tocamos peticiones a nuestro propio origen (los archivos de la app).
// Todo lo que va a otros dominios (Firestore, Google Auth, fuentes, CDNs, mapas...)
// se deja pasar sin interceptar, porque envolverlo con fetch() puede romper
// las conexiones de streaming que usa Firestore para sincronizar en tiempo real.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});
