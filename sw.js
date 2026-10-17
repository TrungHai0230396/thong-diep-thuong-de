const V = 'tdtd-v198';
/* Tiếng người đọc (assets/am, assets/tu: hơn 600 file mp3) nằm trong kho RIÊNG, không xoá khi deploy:
   gần như lần deploy nào V cũng tăng, mà xoá theo V thì mất hết tiếng đã nghe, lúc mất mạng lại phải
   lùi về máy đọc. Đường dẫn mang dấu nội dung (?v=...), nên file nào đổi thì đổi địa chỉ, không phát bản cũ. */
const TIENG = 'tdtd-tieng';
const laTieng = (u) => u.origin === location.origin && /\/assets\/(am|tu)\/[^/]+\.mp3$/.test(u.pathname);
/* Ảnh chi tiết của NASA (máy chủ GIBS) cho Hiệu ứng toàn cảnh: cũng kho riêng, giữ qua các lần deploy. Địa chỉ ảnh
   chỉ đổi khi đổi nơi (tâm làm tròn tới 1 độ), nên mở lại ở cùng chỗ thì khỏi tải lại 200–300 KB. */
const NASA = 'tdtd-nasa';
const laNasa = (u) => u.hostname === 'gibs.earthdata.nasa.gov';
const SHELL = ['./', 'index.html', 'assets/app.css', 'assets/core.js', 'assets/caiapp.js', 'assets/thongke.js', 'assets/app.js', 'assets/game.js', 'assets/share.js', 'assets/lantern.js', 'assets/pond.js', 'assets/breath.js', 'assets/constellation.js', 'assets/nghe.js', 'assets/mua.js', 'assets/astro.js', 'assets/saosang.js', 'assets/nightsky.js', 'assets/datlien.js', 'assets/vutru.js', 'assets/toancanh.js', 'assets/lich.js', 'assets/almanac.js', 'assets/sohoc.js', 'assets/thanso.js', 'assets/rungu.js', 'assets/nhacngu.js', 'assets/luanxa.js', 'assets/thienluanxa.js', 'assets/baicode.js', 'assets/laptrinh.js', 'assets/mansoko.js', 'assets/sokoban.js', 'assets/phong.js', 'assets/maqr.js', 'assets/coba.js', 'assets/bida.js', 'assets/monan.js', 'assets/angi.js', 'assets/buonlau.js', 'assets/amvi.js', 'assets/amnguoi.js', 'assets/tunguoi.js', 'assets/khauhinh.js', 'assets/dophatam.js', 'assets/ipa.js', 'data/cards.json',
               'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png',
               /* trang riêng của từng trò: lúc trò mở, thanh địa chỉ là trang này (app.js datDiaChiTrang), nên mất mạng mà
                  tải lại thì trang phải có sẵn trong kho — xem nhánh mode navigate bên dưới */
               'mua-chin/', 'tha-den-hoa-dang/', 'ho-sen/', 'hop-tho/', 'noi-sao-thanh-chom/', 'bau-troi-dem-nay/', 'luyen-phat-am/',
               'xem-ngay-tot-xau/', 'than-so-hoc/', 'nhac-ngu/', 'thien-luan-xa/', 'robot-thap-sao/', 'day-thung-sao/',
               'co-vua-ba-nguoi/', 'bida-lo/', 'an-gi/', 'buon-lau-pho-co/'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V && x !== TIENG && x !== NASA).map(x => caches.delete(x))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  /* Bộ đếm lượt truy cập của Vercel (assets/thongke.js): để trình duyệt tự tải, không cất, không trả
     index.html thay — mất mạng thì thôi không đếm. */
  if (u.origin === location.origin && u.pathname.startsWith('/_vercel/')) return;
  /* Firebase (cờ ba người chơi qua mạng): để trình duyệt nói chuyện thẳng — luồng sự kiện mà rớt mạng thì đừng trả
     index.html thay, EventSource sẽ nhận một trang HTML. */
  if (u.hostname.endsWith('.firebasedatabase.app')) return;
  if (laTieng(u)) {
    /* tiếng: có trong kho thì dùng, không thì tải rồi cất. Tải lỗi thì để lỗi đi lên trang — ĐỪNG trả
       index.html như các file khác, trang sẽ đem một trang HTML đi giải mã thành tiếng. */
    e.respondWith(caches.open(TIENG).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  if (laNasa(u)) {
    /* tải lỗi thì để lỗi đi lên trang: app tự lùi về ảnh có sẵn */
    e.respondWith(caches.open(NASA).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && (res.headers.get('content-type') || '').startsWith('image/')) c.put(e.request, res.clone());
      return res;
    }))));
    return;
  }
  /* Mở trang (gõ địa chỉ, tải lại, bấm link): khớp bỏ qua phần ?… — trong trò, thanh địa chỉ là trang riêng mang ?phong=,
     ?tro=, ?ngay= (app.js datDiaChiTrang) mà trang thì vẫn là một. Khớp cả ?… thì mỗi mã phòng một bản trong kho, và mất
     mạng mà tải lại …/bida-lo/?phong=MÃ thì nhận index.html ở thư mục /bida-lo/: thẻ <base> tính theo đó, app trắng trơn. */
  const moTrang = e.request.mode === 'navigate';
  e.respondWith(
    caches.match(e.request, { ignoreSearch: moTrang }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && u.origin === location.origin && !(moTrang && u.search)) {
        const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() => caches.match('index.html')))
  );
});
