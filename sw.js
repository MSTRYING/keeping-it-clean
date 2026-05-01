const CACHE_NAME = 'katazuke-v1';
const ASSETS = [
  '/index.html',
  '/css/main.css',
  '/css/theme.css',
  '/js/app.js',
  '/js/storage.js',
  '/js/data-tasks.js',
  '/js/data-recipes.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
  )));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((resp) => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return resp;
      });
      return cached || fetchPromise;
    })
  );
});
