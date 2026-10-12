/* Gợi ý cài app lên điện thoại — phần thuần (nhận dạng máy, khi nào tự gợi ý) và bắt hộp cài của
   trình duyệt. Giao diện nằm trong app.js (dùng chung bảng trượt). Chạy được trong Node để kiểm thử.

   Mỗi loại máy một cách cài, nên phải nhận ra đang ở đâu:
   - Chrome, Edge, Samsung… trên Android có sẵn hộp cài (sự kiện beforeinstallprompt): giữ lại sự kiện,
     bấm nút "Cài app" là gọi nó ra.
   - iPhone không có hộp cài nào cho trang web gọi: chỉ có cách hướng dẫn "Thêm vào MH chính". Nút Chia sẻ nằm
     đâu, mục "Thêm vào MH chính" nằm sau "Xem thêm" hay phải kéo xuống, tuỳ trình duyệt và đời Safari — xem
     cachChiaSe(), làm giống hệt dự án Nhớ Nha (nho-nha/src/lib/pwa.ts, shareWay) theo lời người dùng.
   - Mở link trong Zalo, Facebook, Messenger… (bạn bè gửi qua Zalo là gặp ngay): trình duyệt nhúng ở đó
     không cài được, phải mở bằng Safari hay Chrome trước.

   Chỉ ghi xuống máy một mẩu nhỏ: đã tự gợi ý mấy lần, lần cuối lúc nào, đã cài chưa — để không làm phiền. */
(function (root) {
'use strict';

const KEY = 'tdtd.caiApp';
const NGAY = 864e5;

/* Ứng dụng mở link bằng trình duyệt riêng của nó — ở đó không cài được app. Đặt tên để lời nhắn nói đúng người
   dùng đang ở đâu. Chỉ dùng dấu hiệu riêng của từng hãng (FBAN, FB_IAB, Zalo…), không dùng chữ mà Safari hay
   Chrome thật có thể mang. Messenger đứng trước: chuỗi của nó mang cả dấu hiệu của Facebook, và Orca-Android là
   Messenger trên Android mà không có chữ Messenger. Cùng danh sách với Nhớ Nha (inAppName), thêm WeChat. */
const TRONG_APP = [
  ['Messenger', /FBAN\/Messenger|MessengerForiOS|Messenger[Ll]ite|Orca-Android/],
  ['Facebook', /FBAN|FBAV|FB_IAB|FB4A|FBIOS/],
  ['Zalo', /\bZalo\b/i],
  ['Instagram', /\bInstagram\b/],
  ['TikTok', /BytedanceWebview|musical_ly|\bTikTok\b/i],
  ['LINE', /\bLine\/\d/],
  ['WeChat', /MicroMessenger/],
];
const tenTrongApp = (ua = '') => { const a = TRONG_APP.find(([, re]) => re.test(ua)); return a ? a[0] : null; };
const laIpad = (ua = '', chamDuoc = false) => /iPad/.test(ua) || (/Macintosh/.test(ua) && !/Android/i.test(ua) && chamDuoc);

/* Loại máy: 'daCai' | 'daCaiTrinhDuyet' | 'nhacCai' | 'iosSafari' | 'iosKhac' | 'iosKhacCu' | 'trongAppIos'
   | 'trongAppAndroid' | 'trongApp' | 'androidTay' | 'mayTinh'. chamDuoc: màn cảm ứng nhiều điểm — iPad đời mới tự
   xưng là Mac. daCaiNho: máy này đã cài (nhớ lại). */
function loaiMay(ua = '', { standalone = false, coNhacCai = false, chamDuoc = false, daCaiNho = false } = {}) {
  if (standalone) return 'daCai';
  const ios = /iPhone|iPod/.test(ua) || laIpad(ua, chamDuoc);
  const android = /Android/.test(ua);
  if (tenTrongApp(ua)) return ios ? 'trongAppIos' : android ? 'trongAppAndroid' : 'trongApp';
  if (ios) {
    if (!/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)) return 'iosSafari';
    /* Chrome, Firefox, Edge trên iPhone chỉ cài được từ iOS 16.4 (WebKit cho trình duyệt khác thêm web app
       ra màn hình chính từ bản đó). Máy cũ hơn thì phải mở bằng Safari. */
    const m = /OS (\d+)_(\d+)/.exec(ua);
    return m && (+m[1] < 16 || (+m[1] === 16 && +m[2] < 4)) ? 'iosKhacCu' : 'iosKhac';
  }
  /* Chỉ cho điện thoại, máy tính bảng. Chrome trên máy tính cũng có hộp cài — bản đầu thấy hộp cài là
     gợi ý luôn, nên bảng hiện cả trên máy tính; người dùng chỉ muốn nó ở bản điện thoại. */
  if (!android && !/Mobi|Tablet/i.test(ua)) return 'mayTinh';
  if (coNhacCai) return 'nhacCai';
  /* Đã cài thì Chrome thôi đưa hộp cài; bày các bước cài tay lúc đó là bắt người ta đi tìm một mục menu không
     còn nữa (Nhớ Nha gặp đúng chuyện này). Báo là đã cài, mở từ biểu tượng. */
  if (daCaiNho) return 'daCaiTrinhDuyet';
  return 'androidTay';
}

/* Nút Chia sẻ và chỗ của "Thêm vào MH chính" trên iPhone, iPad — giống hệt Nhớ Nha (shareWay).
   nut:  'baCham' nằm trong nút ⋯ ở thanh dưới (Safari 26), 'thanhDuoi' ngay trên thanh dưới (Safari cũ hơn),
         'tren' góc trên bên phải (Chrome, iPad), 'menu' menu riêng của trình duyệt (Firefox, Edge, Opera).
   bang: 'xemThem' mục nằm sau "Xem thêm" (Safari 26), 'keo' kéo xuống danh sách (Safari cũ hơn), 'caHai' chưa
         biết (trình duyệt khác không nói đời iOS, bảng Chia sẻ có thể là kiểu nào cũng được).
   Safari 26 dồn Chia sẻ vào ⋯ và giấu mục cài sau "Xem thêm" — các bước viết cho Safari 18 không biết điều đó
   (người dùng thử trên iPhone, 12/10/2026). Safari ghi Version/ theo đời iOS (iOS 26 vẫn ghi "OS 18_6"). */
function cachChiaSe(ua = '', ipad = false) {
  if (/CriOS\//.test(ua)) return { nut: 'tren', bang: 'caHai' };
  if (/FxiOS\/|EdgiOS\/|OPiOS\/|OPT\//.test(ua)) return { nut: 'menu', bang: 'caHai' };
  const v = +((/Version\/(\d+)/.exec(ua) || [])[1] || 0);
  const bang = v >= 26 ? 'xemThem' : v > 0 ? 'keo' : 'caHai';
  if (ipad) return { nut: 'tren', bang };
  return { nut: v > 0 && v < 26 ? 'thanhDuoi' : 'baCham', bang };
}

/* Mở chính trang này bằng Safari từ trình duyệt của Zalo, Facebook… trên iPhone: iOS 17 mở Safari cho địa chỉ
   x-safari-https://. Ứng dụng bọc ngoài có cho đi qua hay không là tuỳ nó, nên chỉ là một nút thử — link để chép
   và các bước bằng menu vẫn để trên màn (như Nhớ Nha). */
const linkSafari = (url) => (/^https:\/\//.test(String(url)) ? 'x-safari-' + url : null);

/* Có tự gợi ý không (người dùng tự mở từ nút "?" thì luôn được). Chỉ trên điện thoại; tối đa 3 lần,
   cách nhau ít nhất 7 ngày; đã cài thì thôi. Lần gợi ý nào cũng tính, dù người dùng đóng hay không. */
function nenTuHien(loai, tt, bayGio) {
  if (['daCai', 'daCaiTrinhDuyet', 'mayTinh', 'trongApp'].includes(loai)) return false;
  if (!tt) return true;
  if (tt.daCai || (tt.lan || 0) >= 3) return false;
  return !(tt.luc && bayGio - tt.luc < 7 * NGAY);
}

/* Link mở thẳng trang này bằng Chrome từ trình duyệt nhúng trên Android (Zalo, Facebook…); máy không
   có Chrome thì Android tự mở link thường. */
function linkChrome(url) {
  const u = String(url).replace(/#.*$/, '');
  return 'intent://' + u.replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=' +
    encodeURIComponent(u) + ';end';
}

const docTT = () => { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
const ghiTT = (tt) => { try { localStorage.setItem(KEY, JSON.stringify(tt)); } catch (e) {} };

/* Bắt hộp cài của trình duyệt ngay khi tệp này chạy (trước app.js), kẻo sự kiện tới trước khi có ai nghe. */
let nhacCai = null;
if (typeof addEventListener === 'function') {
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); nhacCai = e;
    const tt = docTT();
    if (tt && tt.daCai) ghiTT({ ...tt, daCai: false });   // Chrome lại đưa hộp cài: app đã bị gỡ, thôi nhớ là đã cài
  });
  addEventListener('appinstalled', () => { nhacCai = null; ghiTT({ ...(docTT() || {}), daCai: true }); });
}

const API = { KEY, loaiMay, nenTuHien, linkChrome, linkSafari, cachChiaSe, tenTrongApp, laIpad, docTT, ghiTT,
  nhacCai: () => nhacCai, xoaNhacCai: () => { nhacCai = null; } };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_CAIAPP = API;
})(typeof self !== 'undefined' ? self : this);
