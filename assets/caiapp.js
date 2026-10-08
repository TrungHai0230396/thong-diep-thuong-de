/* Gợi ý cài app lên điện thoại — phần thuần (nhận dạng máy, khi nào tự gợi ý) và bắt hộp cài của
   trình duyệt. Giao diện nằm trong app.js (dùng chung bảng trượt). Chạy được trong Node để kiểm thử.

   Mỗi loại máy một cách cài, nên phải nhận ra đang ở đâu:
   - Chrome, Edge, Samsung… trên Android có sẵn hộp cài (sự kiện beforeinstallprompt): giữ lại sự kiện,
     bấm nút "Cài app" là gọi nó ra.
   - iPhone không có hộp cài nào cho trang web gọi: chỉ có cách hướng dẫn "Thêm vào MH chính". Từ iOS 26,
     nút Chia sẻ của Safari nằm trong nút ⋯ cạnh thanh địa chỉ; đời cũ hơn thì ở thanh dưới — ghi cả hai.
   - Mở link trong Zalo, Facebook, Messenger… (bạn bè gửi qua Zalo là gặp ngay): trình duyệt nhúng ở đó
     không cài được, phải mở bằng Safari hay Chrome trước.

   Chỉ ghi xuống máy một mẩu nhỏ: đã tự gợi ý mấy lần, lần cuối lúc nào, đã cài chưa — để không làm phiền. */
(function (root) {
'use strict';

const KEY = 'tdtd.caiApp';
const NGAY = 864e5;
const TRONG_APP = /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Zalo|Line\/|TikTok|musical_ly|BytedanceWebview|Messenger|MicroMessenger/i;

/* Loại máy: 'daCai' | 'nhacCai' | 'iosSafari' | 'iosKhac' | 'trongAppIos' | 'trongAppAndroid' | 'trongApp'
   | 'androidTay' | 'mayTinh'. chamDuoc: màn cảm ứng nhiều điểm — iPad đời mới tự xưng là Mac. */
function loaiMay(ua = '', { standalone = false, coNhacCai = false, chamDuoc = false } = {}) {
  if (standalone) return 'daCai';
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && chamDuoc);
  const android = /Android/.test(ua);
  if (TRONG_APP.test(ua)) return ios ? 'trongAppIos' : android ? 'trongAppAndroid' : 'trongApp';
  if (ios) return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? 'iosKhac' : 'iosSafari';
  if (coNhacCai) return 'nhacCai';
  if (android) return 'androidTay';
  return 'mayTinh';
}

/* Có tự gợi ý không (người dùng tự mở từ nút "?" thì luôn được). Chỉ trên điện thoại; tối đa 3 lần,
   cách nhau ít nhất 7 ngày; đã cài thì thôi. Lần gợi ý nào cũng tính, dù người dùng đóng hay không. */
function nenTuHien(loai, tt, bayGio) {
  if (loai === 'daCai' || loai === 'mayTinh' || loai === 'trongApp') return false;
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
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); nhacCai = e; });
  addEventListener('appinstalled', () => { nhacCai = null; ghiTT({ ...(docTT() || {}), daCai: true }); });
}

const API = { KEY, loaiMay, nenTuHien, linkChrome, docTT, ghiTT,
  nhacCai: () => nhacCai, xoaNhacCai: () => { nhacCai = null; } };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_CAIAPP = API;
})(typeof self !== 'undefined' ? self : this);
