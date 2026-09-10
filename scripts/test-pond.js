/* Kiểm thử hồ nước: node scripts/test-pond.js
   pond.js viết cho trình duyệt, nên ở đây dựng sẵn một bộ DOM và canvas giả vừa đủ để nó chạy,
   rồi quay tay từng khung hình qua hook _khung. Không vẽ được gì thật, nhưng toàn bộ phần
   tính toán — lá, ếch, nòng nọc, cá, chạy bù thời gian — chạy y như trên máy người dùng. */
const fs = require('fs');
const path = require('path');

/* ---- DOM giả ---- */
const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'canvas') return { width: 380, height: 720 };
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return () => ({ width: 10 });
    return () => {};
  },
  set: () => true,
});

const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {},
    clientWidth: 380, clientHeight: 720, width: 380, height: 720,
    classList: {
      _s: new Set(cls.split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); },
      remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); },
      contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 380, height: 720 }),
    appendChild(c) { o.children.push(c); return c; },
    getContext: () => ve2d,
    querySelector(sel) { const k = sel.replace('.', ''); return o._q[k] || (o._q[k] = nut(k)); },
  };
  return o;
};

const than = nut('body');
global.document = { body: than, hidden: false, documentElement: nut(),
                    createElement: () => nut(), querySelector: () => null, addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
global.requestAnimationFrame = () => 1;
global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1; global.innerWidth = 380; global.innerHeight = 720;
global.matchMedia = () => ({ matches: false, addEventListener() {} });

/* Đồng hồ: mặc định chỉ nhích khi mình bảo, cho kết quả lặp lại được.
   Bật gioThuc thì cộng thêm thời gian thật đã trôi — cần cho chỗ đo ngân sách mỗi khung. */
let dongHo = 0, thuc = false, mocThuc = 0;
global.performance = { now: () => dongHo + (thuc ? Date.now() - mocThuc : 0) };
const gioThuc = (b) => { thuc = b; mocThuc = Date.now(); };
const themGio = (v) => (dongHo += v);

new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'pond.js'), 'utf8'))();
const HO = global.TDTD_HO;
const chay = (giay, buoc = 33) => {
  const n = Math.round(giay * 1000 / buoc);
  for (let i = 0; i < n; i++) HO._khung(themGio(buoc));
  return n;
};

let pass = 0, fail = 0;
const ok = (n, cond, extra = '') => { cond ? pass++ : fail++; console.log(`${cond ? '  ✓' : '  ✗'} ${n}${extra ? ' — ' + extra : ''}`); };
const suc = (r) => r < 22 ? 1 : Math.max(2, Math.min(5, 2 + Math.floor((r - 26) / 6)));

/* Lá chở quá sức là chuyện thường và chỉ thoáng qua: con nào giật mình cũng có quyền nhảy bừa
   lên một chiếc lá đông, lá lún xuống rồi hất con lên sau cùng. Cái phải kiểm là nó tự gỡ ra. */
const quaSuc = () => {
  const la = HO._la(), dem = new Map();
  for (const e of HO._ech()) if (!e.nhay && !e.boi && e.tan === null && la[e.la]) dem.set(e.la, (dem.get(e.la) || 0) + 1);
  return [...dem].filter(([i, n]) => n > suc(la[i].r)).map(([i, n]) => `lá#${i} ${n}/${suc(la[i].r)}`);
};

const soatBatBien = (nhan) => {
  const la = HO._la(), loi = [];
  HO._ech().forEach((e, i) => {
    if (!e.nhay && !e.boi && e.tan === null && !la[e.la]) loi.push(`ếch #${i} ngồi trên lá ${e.la} không có thật`);
    if (!Number.isFinite(e.x) || !Number.isFinite(e.y)) loi.push(`ếch #${i} toạ độ NaN`);
    if (e.boi && e.la >= 0) loi.push(`ếch #${i} vừa bơi vừa bám lá`);
  });
  let qua = quaSuc();
  if (qua.length) { chay(10); qua = quaSuc(); if (qua.length) loi.push(`quá sức kéo dài: ${qua.join(', ')}`); }
  ok(nhan, loi.length === 0, loi.slice(0, 3).join('; '));
};

console.log('\n— Lá hết chỗ thì ếch ở lại dưới nước —');
HO.mo(); chay(3);
const chuaNhoi = HO._debug();
HO._themEch(190, 400, chuaNhoi.cho + 10);               // nhồi nhiều hơn hẳn tổng chỗ ngồi
chay(45);
let d = HO._debug();
ok('có ếch nổi dưới nước', d.boi > 0, `${d.boi}/${d.ech} con`);
ok('số con ngồi không vượt tổng chỗ', d.ech - d.boi - d.bay <= d.cho + 2, `ngồi ${d.ech - d.boi - d.bay} / chỗ ${d.cho}`);
ok('mấy con nổi không chồng lên nhau', (() => {
  const n = HO._ech().filter(e => e.boi && e.tan === null);
  return !n.some(a => n.some(b => b !== a && Math.hypot(a.x - b.x, a.y - b.y) < 12));
})());
soatBatBien('bất biến sau khi nhồi ếch');
ok('bảng đếm ghi số con dưới nước', /^\d+ ếch · \d+ dưới nước$/.test(HO._dem()), `"${HO._dem()}"`);

console.log('\n— Không quẩn vòng trèo lên rồi tuột xuống —');
let nhay = 0, truoc = HO._ech().map(e => e.nhay);
for (let i = 0; i < 900; i++) {
  chay(1 / 30, 33);
  const g = HO._ech().map(e => e.nhay);
  for (let k = 0; k < Math.min(g.length, truoc.length); k++) if (g[k] && !truoc[k]) nhay++;
  truoc = g;
}
ok('không nhảy loạn trong hồ chật', nhay < 60, `${nhay} cú trong 30 giây với ${HO._debug().ech} con`);

console.log('\n— Ếch nổi dưới nước vẫn già, vẫn chết —');
HO.mo(); chay(2);
HO._themEch(190, 400, 14); chay(20);
const truocGia = HO._debug().ech;
HO._giaDi(400000); chay(30);
ok('quá tuổi thì chết, kể cả con dưới nước', HO._debug().ech < truocGia, `${truocGia} → ${HO._debug().ech} con`);

console.log('\n— Chạy bù thời gian ẩn tab —');
HO.mo(); chay(3);
HO._buTru(8 * 3600 * 1000);
const no0 = HO._debug().noTua;
ok('nhận đủ tám tiếng, không cắt bớt', no0 > 7.5 * 3600 * 1000, `${(no0 / 3600000).toFixed(1)} giờ`);
gioThuc(true);
let dinh = 0, tong = 0, khung = 0;
while (HO._debug().noTua > 0 && khung < 200000) {
  const a = Date.now(); chay(1 / 30, 33); const b = Date.now() - a;
  dinh = Math.max(dinh, b); tong += b; khung++;
}
gioThuc(false);
ok('trả hết nợ', HO._debug().noTua === 0, `${khung} khung, tổng ${tong} ms`);
ok('chia ra nhiều khung chứ không dồn một cục', khung > 20, `${khung} khung`);
ok('không khung nào đơ quá 40 ms', dinh <= 40, `nặng nhất ${dinh} ms`);

HO.mo(); chay(3);
HO._buTru(30 * 60 * 1000);
gioThuc(true);
const x0 = HO._ech().map(e => e.x);
chay(1 / 30, 33);
const x1 = HO._ech().map(e => e.x);
gioThuc(false);
ok('còn nợ sau một khung', HO._debug().noTua > 0);
ok('khung có vẽ vẫn tiến trong lúc trả nợ', x0.length !== x1.length || x0.some((v, i) => v !== x1[i]));
ok('đóng hồ thì xoá sạch phần còn nợ', (HO.dong(), HO._debug().noTua === 0));

console.log('\n— Chạy dài một tiếng —');
HO.mo(); chay(3);
const batDau = Date.now();
for (let p = 0; p < 12; p++) { chay(290); soatBatBien(`bất biến ở phút ${(p + 1) * 5}`); }
d = HO._debug();
console.log(`  một tiếng mô phỏng tốn ${Date.now() - batDau} ms — ếch ${d.ech}, lá ${d.la}, nòng nọc ${d.nong}`);

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
