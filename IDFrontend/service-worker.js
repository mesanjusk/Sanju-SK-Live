self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Optionally intercept requests here for caching
});
