/* Kiểm thử Cờ vua ba người: node scripts/test-coba.js
   Hình học bàn 96 ô (đối chiếu các điều đã biết của bàn Zubrin/Yalta: cột uốn sang nhà bên cạnh, chéo qua tâm rẽ hai
   nhánh cùng màu, tốt ở d4 có ba ô ăn, mã luôn sang ô khác màu); luật (nhập thành, phong cấp, không tự để vua bị chiếu,
   ăn vua, chiếu hết thì loại và quân hoá đá, đá không chiếu ai, hết nước thì bỏ lượt, còn vua cuối cùng thì thắng);
   máy nghĩ (nhanh, đúng luật, ăn quân bỏ không); giao diện (đi quân, hai máy đáp, hoàn tác, ba người thì bàn xoay,
   chạm đúng ô ở mọi góc xoay, chỉ lưu cài đặt). */
'use strict';
const fs = require('fs');
const path = require('path');
const goc = path.join(__dirname, '..');

const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return () => ({ width: 10 });
    return () => {};
  },
  set: () => true,
});
const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false,
    hidden: /cb-(tin|bao|noi)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 560, bottom: 40 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d, closest: () => null,
    querySelector(sel) { const k = String(sel).replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
};
let luu = {};
global.document = { body: nut('body'), createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {}; global.removeEventListener = () => {};
global.localStorage = { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1;
new Function(fs.readFileSync(path.join(goc, 'assets', 'coba.js'), 'utf8'))();
const C = global.TDTD_COBA, L = C.L, B = L.BANG, LO = L.LOAI;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const o = (P, f, r) => L.oCua(P, 'abcdefgh'.indexOf(f), r);
const ten = (c) => ['Trắng', 'Đỏ', 'Đen'][L.nhaO(c)] + ' ' + 'abcdefgh'[L.cotO(c)] + L.hangO(c);
const TRANG = 0, DO = 1, DEN = 2;
/* thế trống: chỉ đặt những quân cần */
function theTrong(dat, luot = TRANG) {
  const t = L.theMoi();
  t.o.fill(0); t.nhap = 0; t.luot = luot; t.vua = [-1, -1, -1];
  for (const [c, P, loai] of dat) { t.o[c] = P * 8 + loai; if (loai === LO.VUA) t.vua[P] = c; }
  return t;
}
const mau = (c) => (L.cotO(c) + L.hangO(c)) & 1;

(async () => {
console.log('\n— Hình học bàn 96 ô —');
{
  let loi = 0, goc2 = 0;
  for (let c = 0; c < 96; c++) { for (const y of B.KE[c]) if (!B.KE[y].includes(c)) loi++; if (B.KE[c].length === 2) goc2++; }
  ok('96 ô, ô kề nhau đối xứng, đúng 6 ô góc ngoài', loi === 0 && goc2 === 6);
  ok('hoa thị giữa bàn là sáu ô d4, e4 của ba nhà', L.HOA_THI.map(ten).sort().join() === ['Trắng d4', 'Trắng e4', 'Đỏ d4', 'Đỏ e4', 'Đen d4', 'Đen e4'].sort().join());
  let saiMau = 0;
  for (let c = 0; c < 96; c++) { for (const y of B.KE[c]) if (mau(y) === mau(c)) saiMau++; for (const t of B.CHEO[c]) if (mau(t[0]) !== mau(c)) saiMau++; for (const y of B.MA[c]) if (mau(y) === mau(c)) saiMau++; }
  ok('ô kề khác màu, ô chéo cùng màu, mã luôn sang ô khác màu (Yalta)', saiMau === 0);
  const tia = (c) => { const d = [0, 1, 2, 3].find(d => { const s = L.buoc(c, d); return s && L.nhaO(s[0]) === L.nhaO(c) && L.hangO(s[0]) === 2; }); return B.TRUC[c][d].map(ten).join(','); };
  ok('cột h của Trắng chạy thẳng sang cột a của Đỏ', tia(o(TRANG, 'h', 1)) === 'Trắng h2,Trắng h3,Trắng h4,Đỏ a4,Đỏ a3,Đỏ a2,Đỏ a1');
  ok('cột e của Trắng uốn qua sát tâm sang cột d của Đỏ', tia(o(TRANG, 'e', 1)) === 'Trắng e2,Trắng e3,Trắng e4,Đỏ d4,Đỏ d3,Đỏ d2,Đỏ d1');
  ok('cột a, cột d của Trắng sang cột h, cột e của Đen; Đỏ, Đen cũng y như vậy',
    tia(o(TRANG, 'a', 1)).endsWith('Đen h4,Đen h3,Đen h2,Đen h1') && tia(o(TRANG, 'd', 1)).endsWith('Đen e4,Đen e3,Đen e2,Đen e1')
    && tia(o(DO, 'h', 1)).endsWith('Đen a1') && tia(o(DEN, 'h', 1)).endsWith('Trắng a1'));
  const cheoA1 = B.CHEO[o(TRANG, 'a', 1)].map(t => t.map(ten).join(','));
  ok('chéo dài từ a1 tới d4 rồi rẽ hai nhánh: sang nhà Đen hoặc nhà Đỏ', cheoA1.length === 2 && cheoA1.includes('Trắng b2,Trắng c3,Trắng d4,Đen d4,Đen c3,Đen b2,Đen a1') && cheoA1.includes('Trắng b2,Trắng c3,Trắng d4,Đỏ d4,Đỏ c3,Đỏ b2,Đỏ a1'));
  let reNhanh = 0, sai = 0;
  for (let c = 0; c < 96; c++) for (const d1 of [0, 1]) for (const d2 of [2, 3]) { const k = L.cheo(c, d1, d2); if (k.length === 2) { reNhanh++; if (!L.HOA_THI.includes(c)) sai++; } }
  ok('chỉ ở sáu ô hoa thị đường chéo mới rẽ hai nhánh', reNhanh === 6 && sai === 0, `${reNhanh} chỗ rẽ`);
  const d4 = o(TRANG, 'd', 4);
  ok('tốt Trắng ở d4: tiến sang Đen e4, ba ô ăn chéo (Đen f4, Đen d4, Đỏ d4 — Dekle)', ten(L.TOT_TIEN[TRANG][d4]) === 'Đen e4' && L.TOT_AN[TRANG][d4].map(ten).sort().join() === ['Đen f4', 'Đen d4', 'Đỏ d4'].sort().join());
  let maLoi = 0, maMax = 0;
  for (let c = 0; c < 96; c++) { maMax = Math.max(maMax, B.MA[c].length); for (const y of B.MA[c]) if (!B.MA[y].includes(c)) maLoi++; }
  ok('mã đi được thì đi ngược lại được; gần tâm tới hơn tám ô (3-chess.com)', maLoi === 0 && maMax === 10, `nhiều nhất ${maMax} ô`);
  let tiaLoi = 0;
  for (const bang of [B.TRUC, B.CHEO]) for (let c = 0; c < 96; c++) for (const t of bang[c]) for (let i = 0; i < t.length; i++) {
    const y = t[i], giua = t.slice(0, i).reverse().join();
    if (!bang[y].some(u => { const j = u.indexOf(c); return j >= 0 && u.slice(0, j).join() === giua; })) tiaLoi++;
  }
  ok('xe, tượng thấy nhau theo cả hai chiều, qua đúng những ô ấy', tiaLoi === 0);
}

console.log('\n— Luật —');
{
  const t = L.theMoi();
  ok('đầu ván: mỗi nhà 16 quân, 20 nước đi như cờ thường, hậu bên trái vua',
    [0, 1, 2].every(P => L.nuocHopLe(t, P).length === 20) && [0, 1, 2].every(P => t.o[o(P, 'd', 1)] === P * 8 + LO.HAU && t.o[o(P, 'e', 1)] === P * 8 + LO.VUA));
  ok('thứ tự Trắng → Đen → Đỏ', L.keTiep(t, TRANG) === DEN && L.keTiep(t, DEN) === DO && L.keTiep(t, DO) === TRANG);
  /* nhập thành */
  const n = L.theMoi(); n.o[o(TRANG, 'f', 1)] = 0; n.o[o(TRANG, 'g', 1)] = 0;
  const nt = L.nuocHopLe(n, TRANG).find(m => m.nhap === 1);
  let nhapDung = false;
  if (nt) { L.diNuoc(n, nt); nhapDung = n.o[o(TRANG, 'g', 1)] === LO.VUA && n.o[o(TRANG, 'f', 1)] === LO.XE && !n.o[o(TRANG, 'h', 1)] && !(n.nhap & 3); }
  ok('nhập thành cánh vua: vua sang g1, xe sang f1, mất quyền nhập thành', nhapDung);
  /* xe Đỏ ở c3 nhìn dọc cột c của Đỏ, qua đường biên sang cột f của Trắng, tới tận f1 */
  const n2 = L.theMoi(); n2.o[o(TRANG, 'f', 1)] = 0; n2.o[o(TRANG, 'g', 1)] = 0; n2.o[o(TRANG, 'f', 2)] = 0; n2.o[o(DO, 'c', 2)] = 0; n2.o[o(DO, 'c', 3)] = DO * 8 + LO.XE;
  ok('không nhập thành qua ô bị nhắm (xe Đỏ nhắm f1 qua đường biên)', L.biNham(n2, o(TRANG, 'f', 1), TRANG) && !L.biChieu(n2, TRANG) && !L.nuocHopLe(n2, TRANG).some(m => m.nhap === 1));
  /* phong cấp khi tới hàng quân của nhà khác */
  const p = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'h', 1), DO, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'b', 2), TRANG, LO.TOT]]);
  const pm = L.nuocHopLe(p, TRANG).find(m => m.tu === o(DO, 'b', 2));
  ok('tốt Trắng sang nhà Đỏ tiến về hàng quân Đỏ, tới hàng 1 thì phong cấp', pm && pm.toi === o(DO, 'b', 1) && pm.phong === LO.HAU);
  /* ghim: không được để vua mình bị chiếu */
  const g = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(TRANG, 'e', 2), TRANG, LO.TUONG], [o(DO, 'd', 2), DO, LO.XE], [o(DO, 'h', 1), DO, LO.VUA], [o(DEN, 'a', 1), DEN, LO.VUA]]);
  ok('tượng bị xe Đỏ ghim theo cột (qua tâm) thì không được rời cột', !L.nuocHopLe(g, TRANG).some(m => m.tu === o(TRANG, 'e', 2)) && L.nuocGia(g, TRANG, false, []).some(m => m.tu === o(TRANG, 'e', 2)));
  /* ăn vua: Trắng mở đường cho xe Đen, Đen đi trước Đỏ nên ăn được vua Đỏ */
  const a = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DO, 'a', 1), DO, LO.XE], [o(DEN, 'e', 1), DEN, LO.VUA],
    [o(DEN, 'd', 3), DEN, LO.XE], [o(DO, 'e', 3), TRANG, LO.MA]]);
  const moDuong = L.nuocHopLe(a, TRANG).find(m => m.tu === o(DO, 'e', 3));
  let ev = L.sauNuoc(a, L.diNuoc(a, moDuong));
  const anVua = a.luot === DEN && L.nuocHopLe(a, DEN).find(m => m.toi === o(DO, 'e', 1));
  ok('Trắng mở đường: tới lượt Đen, Đen ăn được vua Đỏ', !!anVua);
  const luiVua = L.diNuoc(a, anVua);
  const loaiNgay = !a.song[DO] && a.vua[DO] === -1;
  ev = L.sauNuoc(a, luiVua);
  ok('mất vua thì bị loại ngay (không đợi tới lượt mới tính chiếu hết); quân còn lại hoá đá, vẫn nằm trên bàn',
    loaiNgay && ev.some(e => e.loai === 'anvua' && e.bi === DO) && !ev.some(e => e.loai === 'chieuhet') && a.o[o(DO, 'a', 1)] === DO * 8 + LO.XE);
  /* vua Trắng đứng ngay cạnh xe Đỏ đã hoá đá: không bị chiếu; xe Trắng trên cột a của Đỏ ăn được xe đá */
  const da = theTrong([[o(DO, 'a', 2), TRANG, LO.VUA], [o(DO, 'a', 1), DO, LO.XE], [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'b', 4), TRANG, LO.XE]]);
  da.song[DO] = 0;
  const daSong = L.chepThe(da); daSong.song[DO] = 1; daSong.vua[DO] = -1;
  ok('quân đá không chiếu ai (xe Đỏ đá đứng cạnh vua Trắng); còn sống thì có chiếu', !L.biChieu(da, TRANG) && L.biChieu(daSong, TRANG));
  ok('quân đá vẫn ăn được', L.nuocHopLe(da, TRANG).some(m => m.toi === o(DO, 'a', 1)));
  /* chiếu hết: vua Đen ở góc a1, hậu Trắng ở b2 có xe Trắng giữ (qua đường biên sang nhà Đỏ) */
  const h = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'a', 1), DEN, LO.VUA], [o(DEN, 'b', 2), TRANG, LO.HAU], [o(DO, 'g', 2), TRANG, LO.XE], [o(TRANG, 'a', 2), TRANG, LO.TOT]]);
  ok('xe Trắng ở nhà Đỏ giữ hậu ở nhà Đen qua đường biên', L.biNham(Object.assign(L.chepThe(h), {}), o(DEN, 'b', 2), DEN));
  ev = L.sauNuoc(h, L.diNuoc(h, L.nuocHopLe(h, TRANG).find(m => m.tu === o(TRANG, 'a', 2))));
  ok('tới lượt Đen mà bị chiếu hết: Đen bị loại, tới lượt Đỏ', !h.song[DEN] && ev.some(e => e.loai === 'chieuhet' && e.bi === DEN) && h.luot === DO);
  /* hết nước mà không bị chiếu: còn ba nhà thì bỏ lượt */
  const s = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'a', 1), DEN, LO.VUA], [o(DEN, 'b', 3), TRANG, LO.HAU], [o(TRANG, 'a', 2), TRANG, LO.TOT]]);
  ev = L.sauNuoc(s, L.diNuoc(s, L.nuocHopLe(s, TRANG).find(m => m.tu === o(TRANG, 'a', 2))));
  ok('Đen hết nước mà không bị chiếu: bỏ lượt, tới Đỏ, Đen vẫn còn', s.song[DEN] && ev.some(e => e.loai === 'boluot' && e.ai === DEN) && s.luot === DO);
  /* còn vua cuối cùng thì thắng */
  const w = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DEN, 'a', 1), DEN, LO.VUA], [o(DEN, 'b', 2), TRANG, LO.HAU], [o(DO, 'g', 2), TRANG, LO.XE], [o(TRANG, 'a', 2), TRANG, LO.TOT], [o(DO, 'h', 1), DO, LO.TOT]]);
  w.song[DO] = 0;
  ev = L.sauNuoc(w, L.diNuoc(w, L.nuocHopLe(w, TRANG).find(m => m.tu === o(TRANG, 'a', 2))));
  ok('chiếu hết nhà cuối cùng: còn vua cuối cùng thì thắng', w.thang === TRANG && ev.some(e => e.loai === 'thang' && e.ai === TRANG));
  /* còn hai nhà mà chỉ còn vua: hoà */
  const k = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(TRANG, 'a', 2), TRANG, LO.MA]]);
  k.song[DO] = 0;
  ok('còn hai nhà mà không đủ quân chiếu hết: hoà', L.thieuQuan(k));
  /* báo nguy: những quân đang chiếu, kèm đường đi */
  const bn = L.aiChieu(g, TRANG);
  g.o[o(TRANG, 'e', 2)] = 0;
  const bn2 = L.aiChieu(g, TRANG);
  ok('báo nguy: lấy quân đang chiếu và đường đi tới vua (uốn qua tâm)', bn.length === 0 && bn2.length === 1 && bn2[0].o === o(DO, 'd', 2) && bn2[0].duong.map(ten).join(',') === 'Đỏ d2,Đỏ d3,Đỏ d4,Trắng e4,Trắng e3,Trắng e2,Trắng e1');
}

console.log('\n— Máy nghĩ —');
{
  for (const kieu of ['hoangtuong', 'brs']) {
    const t = L.theMoi(), a = Date.now(), kq = L.timNuoc(t, TRANG, { kieu, sau: 4, ms: 2000 });
    ok(`${kieu === 'brs' ? 'Best-Reply Search (Hổ)' : 'hoang tưởng (Rùa)'}: đầu ván tìm sâu 4 nước, nhanh, ra nước hợp lệ`,
      kq.nuoc && L.nuocHopLe(t, TRANG).some(m => m.tu === kq.nuoc.tu && m.toi === kq.nuoc.toi) && Date.now() - a < 2500, `${Date.now() - a} ms, ${kq.nut} thế`);
  }
  const t = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(TRANG, 'c', 3), TRANG, LO.MA], [o(TRANG, 'b', 1), DEN, LO.HAU]]);
  const quanAn = ['hoangtuong', 'brs'].every(kieu => { const kq = L.timNuoc(t, TRANG, { kieu, sau: 3, ms: 1500 }); return kq.nuoc.toi === o(TRANG, 'b', 1); });
  ok('cả hai cách đều ăn hậu bỏ không', quanAn);
  /* máy đấu máy: không lỗi, nước nào cũng hợp lệ */
  const v = L.theMoi();
  let hopLe = true, n = 0;
  while (v.thang < 0 && !v.hoa && n < 36) {
    const kq = L.timNuoc(v, v.luot, { kieu: v.luot === DEN ? 'brs' : 'hoangtuong', sau: 2, ms: 300, tinhCach: v.luot === DEN ? { hang: true } : { chac: true } });
    if (!L.nuocHopLe(v, v.luot).some(m => m.tu === kq.nuoc.tu && m.toi === kq.nuoc.toi)) { hopLe = false; break; }
    L.sauNuoc(v, L.diNuoc(v, kq.nuoc)); n++;
  }
  ok('máy đấu máy 36 nước: nước nào cũng hợp lệ', hopLe && n >= 30, `${n} nước`);
  ok('ba mức khó: Dễ nông và có nhiễu, Khó tìm sâu dần tới khi hết giờ', C.KHO[0].sau < C.KHO[1].sau && C.KHO[0].nhieu > 0 && C.KHO[2].sau >= 5 && C.KHO[2].ms >= 1000);
}

console.log('\n— Giao diện —');
const cho = (ms) => new Promise(r => setTimeout(r, ms));
async function choTaiNguoi() {                                       // chạy hết hình động và lượt máy tới khi tới lượt người
  for (let i = 0; i < 200; i++) {
    if (C._hoat()) C._xongHoat();
    const v = C._van();
    if (v.the.thang >= 0 || v.the.hoa) return;
    if (v.nguoi[v.the.luot] === 'nguoi' && v.dangNghi < 0 && !C._hoat()) return;
    await cho(60);
  }
}
{
  C.mo();
  ok('mở lần đầu: hiện cách chơi', JSON.parse(luu['tdtd.coba'] || '{}').h === 1);
  C._vanMoi({ che: 'may', mau: TRANG, kho: 0 });
  let v = C._van();
  ok('đấu với máy: bạn Trắng, hai máy là Hổ và Rùa', C._tenNha(TRANG) === 'Bạn' && C._tenNha(DEN) === 'Hổ' && C._tenNha(DO) === 'Rùa' && C._cauHinhMay(DEN).kieu === 'brs' && C._cauHinhMay(DO).kieu === 'hoangtuong');
  const m = L.nuocHopLe(v.the, TRANG).find(n => n.tu === o(TRANG, 'e', 2) && n.toi === o(TRANG, 'e', 4));
  C._thucHien(m, TRANG);
  await choTaiNguoi();
  v = C._van();
  ok('bạn đi e2–e4, hai máy lần lượt đáp lại, rồi tới lượt bạn', v.soNuoc === 3 && v.the.luot === TRANG && v.the.o[o(TRANG, 'e', 4)] === LO.TOT);
  ok('nút hoàn tác dùng được', C._coTheHoan());
  C._hoanTac();
  await choTaiNguoi();
  v = C._van();
  ok('hoàn tác: về lại trước nước của bạn (bỏ cả hai nước máy)', v.soNuoc === 0 && v.the.luot === TRANG && v.the.o[o(TRANG, 'e', 2)] === LO.TOT && !v.the.o[o(TRANG, 'e', 4)]);
  /* chạm vào ô: chọn quân, chạm ô đích */
  C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
  const [x1, y1] = C._tamO(o(TRANG, 'g', 1)); C._chamBan(x1, y1);
  const daChon = C._chon() === o(TRANG, 'g', 1) && C._nuocCuaChon().length === 2;
  const [x2, y2] = C._tamO(o(TRANG, 'f', 3)); C._chamBan(x2, y2);
  ok('chạm mã g1 thấy hai ô đi được, chạm f3 là đi', daChon && !!C._hoat());
  C._xongHoat();
  await choTaiNguoi();
  /* chạm đúng ô ở cả ba góc nhìn */
  let lech = 0;
  for (const g of C._GOC_NHIN) { C._datXoay(g); for (let c = 0; c < 96; c++) { const [x, y] = C._tamO(c); if (C._oTai(x, y) !== c) lech++; } }
  ok('chạm giữa ô nào cũng ra đúng ô đó, ở cả ba góc nhìn', lech === 0);
  /* ba người chung máy: đi xong thì bàn xoay về phía người tới lượt */
  C._vanMoi({ che: 'ba' });
  v = C._van();
  const giong = (a, b) => Math.abs(Math.cos(a) - Math.cos(b)) < 1e-9 && Math.abs(Math.sin(a) - Math.sin(b)) < 1e-9;
  const truoc = giong(C._xoayDen(), C._GOC_NHIN[TRANG]);
  C._thucHien(L.nuocHopLe(v.the, TRANG)[0], TRANG); C._xongHoat();
  ok('ba người chung máy: Trắng đi xong, bàn xoay cho Đen nằm dưới', truoc && C._van().the.luot === DEN && giong(C._xoayDen(), C._GOC_NHIN[DEN]) && C._tenNha(DEN) === 'Đen');
  const k = JSON.parse(luu['tdtd.coba'] || '{}');
  ok('chỉ lưu cài đặt (cách chơi, màu, mức khó, đã xem hướng dẫn), không lưu ván', Object.keys(k).every(x => ['che', 'mau', 'kho', 'h'].includes(x)));
  /* hình động hướng dẫn */
  C._batDemo();
  const dau = C._demo() ? C._demo().buoc : -1;
  for (let i = 0; i < 3; i++) C._tiepDemo();
  const cuoi = C._demo() ? C._demo().buoc : -1;
  C._tiepDemo();
  ok('hình động hướng dẫn: bốn cảnh lần lượt rồi tự tắt', dau === 0 && cuoi === 3 && C._demo() === null);
  C.dong();
}

console.log('\n— Gắn vào app —');
{
  const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(goc, 'sw.js'), 'utf8');
  const app = fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8'), css = fs.readFileSync(path.join(goc, 'assets', 'app.css'), 'utf8');
  ok('index.html nạp coba.js trước app.js; sw.js cất sẵn để chơi khi mất mạng', html.indexOf('src="assets/coba.js"') > 0 && html.indexOf('src="assets/coba.js"') < html.indexOf('src="assets/app.js"') && sw.includes("'assets/coba.js'"));
  ok('có ngôi sao trên trang chính, mở bằng #co-ba-nguoi', /id: 'sao-coba'[\s\S]*?duong: 'co-ba-nguoi', khung: '\.coba', mun: 'TDTD_COBA'/.test(app) && /\n  coba: +'M/.test(app));
  ok('có kiểu dáng cho khung trò', css.includes('.coba{') && css.includes('.coba.hien{display:flex}'));
  const src = fs.readFileSync(path.join(goc, 'assets', 'coba.js'), 'utf8');
  ok('máy nghĩ chạy ở luồng riêng dựng từ chính mã lõi, không tải tệp nào thêm', /new Worker\(URL\.createObjectURL\(new Blob/.test(src) && /LOI\.toString\(\)/.test(src));
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
})();
