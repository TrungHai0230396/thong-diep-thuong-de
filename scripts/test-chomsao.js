/* Kiểm thử Nối sao thành chòm: node scripts/test-chomsao.js
   Người dùng: "bạn tự nối luôn đi, chứ người dùng không biết cách nối đâu". Giờ app tự nối từng nét: chờ một nhịp, chạy
   lần lượt theo thứ tự nét của chòm, xong thì hiện lời giải thích; chạm thì nối xong ngay; người dặn máy giảm chuyển
   động thì hiện cả chòm luôn; nối xong kéo được để xoay. Dữ liệu chòm (bầu trời đêm cũng dùng) phải còn nguyên. */
'use strict';
const fs = require('fs');
const path = require('path');

const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    return () => {};
  },
  set: () => true,
});
const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {}, _nghe: {}, dataset: {}, hidden: false,
    clientWidth: 380, clientHeight: 720,
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, removeEventListener() {}, remove() {}, setPointerCapture() {},
    addEventListener(ten, f) { (o._nghe[ten] = o._nghe[ten] || []).push(f); },
    phat(ten, e) { (o._nghe[ten] || []).forEach(f => f(Object.assign({ pointerId: 1, clientX: 0, clientY: 0 }, e))); },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 380, height: 720, bottom: 0 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d,
    querySelector(sel) { const k = String(sel).replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
};
let giamChuyenDong = false;
global.document = { body: nut('body'), createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {}; global.removeEventListener = () => {};
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1; global.innerWidth = 380; global.innerHeight = 720;
global.matchMedia = (q) => ({ matches: /reduce/.test(q) && giamChuyenDong, addEventListener() {} });
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'constellation.js'), 'utf8'))();
const C = global.TDTD_CHOMSAO;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const khoa = (a, b) => a < b ? a + '-' + b : b + '-' + a;

console.log('\n— Dữ liệu chòm còn nguyên (bầu trời đêm cũng dùng) —');
ok('đủ 8 chòm, nét nào cũng nối hai ngôi có thật, không nét trùng', C._chom.length === 8 && C._chom.every(c =>
  c.noi.every(([a, b]) => a !== b && c.sao[a] && c.sao[b]) && new Set(c.noi.map(([a, b]) => khoa(a, b))).size === c.noi.length));

console.log('\n— Tự nối từng nét —');
C.mo();
const khung = document.body.children.find(c => c.className === 'chomsao');
const cv = khung.querySelector('.cs-cv');
{
  const sl = C._chom.findIndex(c => c.ten === 'Sư Tử');
  C._nap(sl);
  const c = C._chom[sl], t0 = performance.now();
  C._buoc(t0 + 100);
  ok('mở ra: chờ một nhịp cho thấy đám sao, chưa nối nét nào', C._daNoi().length === 0 && !C._debug().xong);
  /* chạy từng khung 16 ms, ghi lại thứ tự các nét hiện ra */
  const thuTu = [];
  let t = t0, luc = null;
  for (; t < t0 + 30000 && !C._debug().xong; t += 16) {
    C._buoc(t);
    for (const k of C._daNoi()) if (!thuTu.includes(k)) thuTu.push(k);
    if (luc === null && C._tuNoi() && t >= C._tuNoi().t0 && C._daNoi().length === 0) luc = t;
  }
  ok('nối lần lượt đúng thứ tự nét của chòm, đủ hết rồi mới xong', C._debug().xong && thuTu.join() === c.noi.map(([a, b]) => khoa(a, b)).join(), thuTu.join(' '));
  ok('chòm nhiều nét nhất (Sư Tử, 9 nét) nối xong trong dưới 10 giây', t - t0 < 10000, `${((t - t0) / 1000).toFixed(1)} giây`);
  ok('nối xong: mọi ngôi đều sáng, hiện lời giải thích, nhắc kéo để xoay', C._diem().every(d => d.sang) && !khung.querySelector('.cs-xong').hidden && /xoay/.test(khung.querySelector('.cs-nhac').textContent));
}
{
  C._nap(0);
  C._buoc(performance.now() + 1300);                              // đang chạy giữa chừng
  const dangDo = C._daNoi().length < C._chom[0].noi.length && !C._debug().xong;
  cv.phat('pointerdown', { clientX: 10, clientY: 10 });
  ok('đang nối mà chạm màn hình: nối xong ngay cả chòm', dangDo && C._debug().xong && C._daNoi().length === C._chom[0].noi.length);
  const truoc = C._diem().map(d => d.x).join();
  cv.phat('pointerup', {});
  cv.phat('pointerdown', { clientX: 100, clientY: 300 });
  cv.phat('pointermove', { clientX: 220, clientY: 260 });
  cv.phat('pointerup', {});
  C._buoc(performance.now() + 5000);
  ok('nối xong thì kéo để xoay: các ngôi dời chỗ', C._diem().map(d => d.x).join() !== truoc);
}
{
  giamChuyenDong = true;
  C._nap(2);
  ok('máy dặn giảm chuyển động: hiện cả chòm luôn, không chạy từng nét', C._debug().xong && C._daNoi().length === C._chom[2].noi.length);
  giamChuyenDong = false;
}
{
  C._nap(3);
  ok('sang chòm khác: bắt đầu nối lại từ đầu', !C._debug().xong && C._daNoi().length === 0 && C._tuNoi() && C._tuNoi().k === 0);
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'constellation.js'), 'utf8');
  ok('không còn bắt người xem tự kéo nối', !/Kéo từ ngôi sao này sang ngôi sao kia/.test(src) && !/banKinhBam/.test(src));
}
C.dong();

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
