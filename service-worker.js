var cacheName = 'school-app-01';
var filesToCache = [
  '/',
  '/manifest.json',
  '/index.html',
  '/scripts/app.js',
  '/styles/inline.css',
  '/styles/fonts/Raleway.ttf',
  '/images/icons/icon-144.png',
  '/__/firebase/5.7.3/firebase-app.js',
  '/__/firebase/5.7.3/firebase-auth.js',
  '/__/firebase/5.7.3/firebase-firestore.js',
  '/__/firebase/init.js',
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Installing');

  self.skipWaiting();

  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activating');

  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  console.log('[Service Worker] Fetching', e.request.url);

  e.respondWith(
    caches.match(e.request)
    .then(function(response) {
      return response || fetch(e.request);
    })
  );
});
