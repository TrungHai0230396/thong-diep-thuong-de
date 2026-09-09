const V = 'tdtd-v40';
const SHELL = ['./', 'index.html', 'assets/app.css', 'assets/core.js', 'assets/app.js', 'assets/game.js', 'assets/share.js', 'assets/lantern.js', 'assets/pond.js', 'assets/breath.js', 'assets/constellation.js', 'assets/infinite.js', 'data/cards.json',
               'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
