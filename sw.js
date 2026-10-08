const V = 'tdtd-v128';
/* Tiếng người đọc (assets/am, assets/tu: hơn 600 file mp3) nằm trong kho RIÊNG, không xoá khi deploy:
   gần như lần deploy nào V cũng tăng, mà xoá theo V thì mất hết tiếng đã nghe, lúc mất mạng lại phải
   lùi về máy đọc. Đường dẫn mang dấu nội dung (?v=...), nên file nào đổi thì đổi địa chỉ, không phát bản cũ. */
const TIENG = 'tdtd-tieng';
const laTieng = (u) => u.origin === location.origin && /\/assets\/(am|tu)\/[^/]+\.mp3$/.test(u.pathname);
const SHELL = ['./', 'index.html', 'assets/app.css', 'assets/core.js', 'assets/caiapp.js', 'assets/app.js', 'assets/game.js', 'assets/share.js', 'assets/lantern.js', 'assets/pond.js', 'assets/breath.js', 'assets/constellation.js', 'assets/nghe.js', 'assets/mua.js', 'assets/astro.js', 'assets/saosang.js', 'assets/nightsky.js', 'assets/datlien.js', 'assets/vutru.js', 'assets/lich.js', 'assets/almanac.js', 'assets/sohoc.js', 'assets/thanso.js', 'assets/rungu.js', 'assets/nhacngu.js', 'assets/amvi.js', 'assets/amnguoi.js', 'assets/tunguoi.js', 'assets/khauhinh.js', 'assets/dophatam.js', 'assets/ipa.js', 'data/cards.json',
               'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V && x !== TIENG).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (laTieng(new URL(e.request.url))) {
    /* tiếng: có trong kho thì dùng, không thì tải rồi cất. Tải lỗi thì để lỗi đi lên trang — ĐỪNG trả
       index.html như các file khác, trang sẽ đem một trang HTML đi giải mã thành tiếng. */
    e.respondWith(caches.open(TIENG).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) {
        const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
