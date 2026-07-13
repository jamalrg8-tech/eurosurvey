const CACHE_NAME = 'eurosurvey-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/eurosurvey.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => Promise.resolve());
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(name => name !== CACHE_NAME ? caches.delete(name) : null))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  // HTML/JSON: network first, fallback to cache
  if (event.request.url.includes('.html') || event.request.url.includes('.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  // Everything else: cache first
  event.respondWith(
    caches.match(event.request).then(r =>
      r || fetch(event.request).catch(() => new Response('Offline', { status: 503 }))
    )
  );
});
