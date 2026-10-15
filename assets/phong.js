/* Phòng chơi qua mạng (Cờ vua ba người): đọc ghi Firebase Realtime Database bằng REST, nghe thay đổi bằng luồng sự
   kiện (EventSource) — không cần thư viện. Firebase gửi "put" (thay hẳn dữ liệu ở một chỗ) và "patch" (thay vài khoá),
   kèm đường dẫn tính từ chỗ đang nghe; trình duyệt tự nối lại khi rớt mạng, và lúc nối lại Firebase gửi lại cả cây.
   Luật bảo vệ ở firebase-rules.json: ai có mã thì xem được phòng; nước đi chỉ thêm vào cuối, không sửa được nước cũ;
   ghế đã có người thì không giành được. */
(function (root) {
'use strict';
/* Địa chỉ database, không phải mật khẩu: ai mở app cũng thấy, quyền ghi do luật quyết định. Bài kiểm thử đặt
   TDTD_FB_THU để chạy trên máy chủ giả (scripts/fb-gia.js). */
const DB = root.TDTD_FB_THU || 'https://gen-lang-client-0558705221-default-rtdb.asia-southeast1.firebasedatabase.app';
const KY_TU = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';     // không có I, O, 0, 1 cho khỏi đọc nhầm khi đọc mã cho nhau
const GIO = { '.sv': 'timestamp' };                    // máy chủ tự điền giờ của nó (luật đòi đúng giờ máy chủ)
const maMoi = (r = Math.random) => Array.from({ length: 6 }, () => KY_TU[Math.floor(r() * KY_TU.length)]).join('');
const idMoi = (r = Math.random) => Array.from({ length: 12 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(r() * 36)]).join('');
const laMa = (s) => /^[A-HJ-NP-Z2-9]{6}$/.test(String(s || ''));

/* Firebase trả khoá số liền nhau (0, 1, 2…) thành mảng, chỗ trống là null (đo thật: "ghe":[{…},null,{…}]), còn khoá
   lẻ thì thành đối tượng. Đổi hết về đối tượng, bỏ null, cho chỗ đọc khỏi phải đoán. */
function chuan(v) {
  if (Array.isArray(v)) { const o = {}; v.forEach((x, i) => { if (x != null) o[i] = chuan(x); }); return Object.keys(o).length ? o : null; }
  if (v && typeof v === 'object') {
    const o = {};
    for (const k of Object.keys(v)) { const x = chuan(v[k]); if (x != null) o[k] = x; }
    return Object.keys(o).length ? o : null;
  }
  return v;
}
/* đặt giá trị tại một đường dẫn, trả cây mới; null là xoá, nhánh rỗng thì mất (như Firebase) */
function datTai(cay, k, gt) {
  if (!k.length) return gt == null ? null : gt;
  const goc = cay && typeof cay === 'object' ? Object.assign({}, cay) : {};
  const con = datTai(goc[k[0]], k.slice(1), gt);
  if (con == null) delete goc[k[0]]; else goc[k[0]] = con;
  return Object.keys(goc).length ? goc : null;
}
const tach = (duong) => String(duong || '').split('/').filter(Boolean);
function ap(cay, loai, duong, du) {
  if (loai === 'put') return datTai(cay, tach(duong), chuan(du));
  if (loai === 'patch' && du && typeof du === 'object') {
    let c = cay;
    for (const k of Object.keys(du)) c = datTai(c, tach(duong).concat(tach(k)), chuan(du[k]));
    return c;
  }
  return cay;
}

/* gọi REST: trả { ok, ma (mã HTTP, 0 khi mất mạng), du }. Luật từ chối thì Firebase trả 401 "Permission denied". */
async function goi(duong, cach = 'GET', gt) {
  try {
    const r = await fetch(`${DB}/${duong}.json`, { method: cach, cache: 'no-store', body: gt === undefined ? undefined : JSON.stringify(gt) });
    let du = null;
    try { du = await r.json(); } catch (e) {}
    return { ok: r.ok, ma: r.status, du };
  } catch (e) {
    return { ok: false, ma: 0, du: null };
  }
}

/* nghe một chỗ: khiDoi(cay) mỗi lần dữ liệu đổi (cay là null khi chỗ đó trống). Trả { dung, noiLai }. */
function nghe(duong, khiDoi, khiLoi) {
  let cay = null, es = null, thoi = false;
  const mo = () => {
    es = new EventSource(`${DB}/${duong}.json`);
    const nhan = (loai) => (e) => {
      let d;
      try { d = JSON.parse(e.data); } catch (x) { return; }
      if (!d || typeof d.path !== 'string') return;
      cay = ap(cay, loai, d.path, d.data);
      khiDoi(cay);
    };
    es.addEventListener('put', nhan('put'));
    es.addEventListener('patch', nhan('patch'));
    es.addEventListener('cancel', () => { if (khiLoi) khiLoi('cancel'); });
    es.onerror = () => { if (khiLoi) khiLoi('mang'); };       // EventSource tự nối lại; báo để giao diện biết đang rớt mạng
  };
  mo();
  return {
    dung() { thoi = true; if (es) es.close(); },
    noiLai() { if (!thoi && es && es.readyState === 2) mo(); },   // máy ngủ dậy mà luồng đã đóng hẳn
  };
}

const API = { DB, GIO, KY_TU, maMoi, idMoi, laMa, chuan, ap, goi, nghe };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_PHONG = API;
})(typeof self !== 'undefined' ? self : this);
