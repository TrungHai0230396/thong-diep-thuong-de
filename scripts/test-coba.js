/* Kiểm thử Cờ vua ba người: node scripts/test-coba.js
   Hình học bàn 96 ô (đối chiếu các điều đã biết của bàn Zubrin/Yalta: cột uốn sang nhà bên cạnh, chéo qua tâm rẽ hai
   nhánh cùng màu, tốt ở d4 có ba ô ăn, mã luôn sang ô khác màu); luật (nhập thành, phong cấp, không tự để vua bị chiếu,
   ăn vua, chiếu hết thì loại và quân hoá đá, đá không chiếu ai, hết nước thì bỏ lượt, còn vua cuối cùng thì thắng);
   máy nghĩ (nhanh, đúng luật, ăn quân bỏ không); giao diện (đi quân, hai máy đáp, hoàn tác, bàn xoay về phía mình,
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

console.log('\n— Luật Tam quốc: giết vua là chiếm cả đạo quân —');
{
  /* Người dùng: "giết vua thì được bầu 1 quân bên chết làm tướng, tướng đi yếu như vua, các quân còn sống bên chết thuộc
     về quân giết — như đánh trận lúc xưa, chiếm qua chiếm lại". Người giết tự chọn tướng (người dùng chọn). */
  const tq = (dat, luot = TRANG) => { const t = theTrong(dat, luot); t.tq = true; return t; };
  const vuaDo = o(DO, 'e', 1);
  const t = tq([[o(TRANG, 'e', 1), TRANG, LO.VUA], [vuaDo, DO, LO.VUA], [o(DO, 'a', 2), DO, LO.TOT], [o(DO, 'b', 1), DO, LO.MA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'e', 3), TRANG, LO.HAU]]);
  const ev = L.sauNuoc(t, L.diNuoc(t, L.nuocHopLe(t, TRANG).find(m => m.toi === vuaDo)));
  ok('Trắng ăn vua Đỏ: Đỏ bị loại, cả đạo quân Đỏ về tay Trắng, Trắng được chọn tướng (chưa tới lượt Đen)',
     t.song[DO] === 0 && t.chu.join() === '0,0,2' && t.cho.length === 1 && t.cho[0].ai === TRANG && t.cho[0].dao === DO && t.luot === TRANG &&
     ev.map(e => e.loai).join() === 'anvua,chiemquan,chontuong', ev.map(e => e.loai).join());
  const bau = L.nuocHopLe(t, TRANG);
  ok('lúc chờ chọn tướng: chỉ có nước phong tướng (ô đi = ô đến), đúng các quân Đỏ còn sống; nhà khác không đi được',
     bau.length === 2 && bau.every(m => m.tu === m.toi && (t.o[m.tu] >> 3) === DO) && !L.nuocHopLe(t, DEN).length);
  L.sauNuoc(t, L.diNuoc(t, bau.find(m => m.tu === o(DO, 'a', 2))));
  ok('phong tốt a2 làm tướng: quân đó thành tướng, rồi tới lượt Đen (nhà kế sau Trắng)', t.o[o(DO, 'a', 2)] === DO * 8 + LO.TG && !t.cho.length && t.luot === DEN);
  const t2 = L.chepThe(t); t2.luot = TRANG;
  const n2 = L.nuocHopLe(t2, TRANG), diTuong = n2.filter(m => m.tu === o(DO, 'a', 2)).map(m => m.toi).sort((x, y) => x - y);
  ok('Trắng đi được quân Đỏ vừa chiếm; tướng đi từng ô như vua (đúng các ô kề), không nhập thành',
     n2.some(m => m.tu === o(DO, 'b', 1)) && diTuong.join() === B.VUA[o(DO, 'a', 2)].filter(y => !t2.o[y] || t2.chu[t2.o[y] >> 3] !== TRANG).sort((x, y) => x - y).join());
  ok('quân cướp được vẫn mang đạo gốc: tốt Đỏ (giờ của Trắng) tiến theo hướng tốt Đỏ', L.TOT_TIEN[DO][o(DO, 'c', 2)] >= 0 &&
     (() => { const t3 = tq([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'c', 2), DO, LO.TOT], [o(DO, 'g', 1), DO, LO.TG]]); t3.song[DO] = 0; t3.vua[DO] = -1; t3.chu = [0, 0, 2];
       return L.nuocHopLe(t3, TRANG).some(m => m.tu === o(DO, 'c', 2) && m.toi === L.TOT_TIEN[DO][o(DO, 'c', 2)]); })());
  /* nhà thứ ba giết tướng: cướp luôn đạo quân, chọn tướng mới */
  t.o[o(DO, 'a', 4)] = DEN * 8 + LO.XE;
  const ev3 = L.sauNuoc(t, L.diNuoc(t, L.nuocHopLe(t, DEN).find(m => m.toi === o(DO, 'a', 2))));
  ok('Đen giết tướng: đạo quân Đỏ về tay Đen, Đen chọn tướng mới', t.chu.join() === '0,2,2' && t.cho[0].ai === DEN && t.luot === DEN &&
     ev3.some(e => e.loai === 'antuong' && e.cu === TRANG) && ev3.some(e => e.loai === 'chiemquan' && e.ai === DEN));
  L.sauNuoc(t, L.diNuoc(t, L.nuocHopLe(t, DEN)[0]));
  ok('Đen phong tướng xong: tới lượt Trắng (Đỏ đã bị loại thì bỏ qua)', L.coTuong(t, DO) && t.luot === TRANG);
  /* chiếu hết cũng là giết vua: vua bị bắt khỏi bàn, đạo quân về tay nhà đang chiếu; chọn tướng xong thì đi tiếp đúng thứ tự */
  const t4 = tq([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DEN, 'h', 1), DEN, LO.VUA], [o(DEN, 'a', 2), DEN, LO.TOT], [o(DO, 'e', 1), DO, LO.VUA],
                 [o(DEN, 'h', 3), TRANG, LO.XE], [o(DEN, 'g', 3), TRANG, LO.XE]], TRANG);
  const chet = L.nuocHopLe(t4, TRANG).find(m => { const t5 = L.chepThe(t4); L.diNuoc(t5, m); return L.biChieu(t5, DEN) && !L.nuocHopLe(t5, DEN).length; });
  if (chet) {
    const ev4 = L.sauNuoc(t4, L.diNuoc(t4, chet));
    ok('chiếu hết Đen: vua Đen bị bắt khỏi bàn, đạo quân Đen về tay Trắng (nhà vừa chiếu), Trắng chọn tướng',
       t4.song[DEN] === 0 && t4.o[o(DEN, 'h', 1)] === 0 && t4.chu[DEN] === TRANG && t4.cho[0] && t4.cho[0].ai === TRANG && ev4.some(e => e.loai === 'chieuhet'));
    L.sauNuoc(t4, L.diNuoc(t4, L.nuocHopLe(t4, TRANG)[0]));
    ok('Trắng phong tướng xong: tới lượt Đỏ (nhà kế sau Đen vừa bị loại), không mất lượt của ai', t4.luot === DO);
  } else ok('dựng được thế chiếu hết Đen', false);
  /* người vừa đi không phải người chiếu: Trắng rời mã cho xe Đỏ chiếu hết Đen — Đỏ được đạo quân, chọn tướng, rồi vẫn
     được đi lượt của mình (không bị nhảy sang Trắng) */
  const t8 = tq([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'h', 1), DEN, LO.VUA], [o(DEN, 'a', 2), DEN, LO.TOT],
                 [o(DEN, 'h', 4), DO, LO.XE], [o(DEN, 'h', 2), TRANG, LO.MA], [o(DEN, 'g', 3), TRANG, LO.XE]], TRANG);
  const moDuong = L.nuocHopLe(t8, TRANG).find(m => m.tu === o(DEN, 'h', 2));
  L.sauNuoc(t8, L.diNuoc(t8, moDuong));
  const doChon = t8.chu[DEN] === DO && t8.cho[0] && t8.cho[0].ai === DO && t8.luot === DO;
  L.sauNuoc(t8, L.diNuoc(t8, L.nuocHopLe(t8, DO)[0]));
  ok('Trắng mở đường cho xe Đỏ chiếu hết Đen: đạo quân Đen về tay Đỏ (nhà đang chiếu), Đỏ chọn tướng xong vẫn tới lượt Đỏ', doChon && t8.luot === DO, `lượt ${t8.luot}`);
  /* luật thường không đổi: ăn vua thì quân hoá đá, không đổi chủ */
  const t6 = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [vuaDo, DO, LO.VUA], [o(DO, 'a', 2), DO, LO.TOT], [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'e', 3), TRANG, LO.HAU]]);
  L.sauNuoc(t6, L.diNuoc(t6, L.nuocHopLe(t6, TRANG).find(m => m.toi === vuaDo)));
  ok('luật thường: ăn vua thì quân Đỏ thành đá, không về tay ai, không có chọn tướng', t6.chu.join() === '0,1,2' && !t6.cho.length && t6.luot === DEN && t6.o[o(DO, 'a', 2)] === DO * 8 + LO.TOT);
  /* máy chọn tướng: quân rẻ không bị nhắm */
  const t7 = tq([[o(TRANG, 'e', 1), TRANG, LO.VUA], [vuaDo, DO, LO.VUA], [o(DO, 'a', 2), DO, LO.TOT], [o(DO, 'b', 1), DO, LO.HAU], [o(DO, 'd', 3), DO, LO.TOT],
                 [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'c', 3), DEN, LO.XE], [o(DO, 'e', 3), TRANG, LO.HAU]]);
  L.sauNuoc(t7, L.diNuoc(t7, L.nuocHopLe(t7, TRANG).find(m => m.toi === vuaDo)));
  const kq7 = L.timNuoc(t7, TRANG, { sau: 2, ms: 300 });
  ok('máy chọn tướng: tốt a2 không bị nhắm — không lấy tốt d3 gần tâm đang bị xe Đen nhắm, cũng không lấy hậu quá quý',
     kq7.nuoc && kq7.nuoc.tu === kq7.nuoc.toi && kq7.nuoc.tu === o(DO, 'a', 2) && L.XA_TAM[o(DO, 'd', 3)] < L.XA_TAM[o(DO, 'a', 2)], kq7.nuoc && ten(kq7.nuoc.tu));
  /* đi rồi hoàn lại phải trả đúng thế cờ — kể cả lúc máy nghĩ thử tự phong tướng; máy tự đánh cả ván không lỗi */
  const chup = (x) => JSON.stringify([Array.from(x.o), x.chu, x.song, x.vua, x.cho, x.nhap, x.dem50]);
  let lech = 0, nuocLa = 0, phong = 0, cuop = 0;
  const v = L.theMoi('tq');
  for (let n = 0; n < 160 && v.thang < 0 && !v.hoa; n++) {
    const ds = L.nuocHopLe(v, v.luot);
    for (const m of ds.slice(0, 12)) { const truoc = chup(v); const lui = L.diNuoc(v, m, n % 2 === 0); L.hoanNuoc(v, lui); if (chup(v) !== truoc) lech++; }
    const kq = L.timNuoc(v, v.luot, { kieu: v.luot === DEN ? 'brs' : 'hoangtuong', sau: 2, ms: 120, nhieu: 60 });
    if (!kq.nuoc || !ds.some(m => m.tu === kq.nuoc.tu && m.toi === kq.nuoc.toi)) { nuocLa++; break; }
    if (kq.nuoc.tu === kq.nuoc.toi) phong++;
    const ev = L.sauNuoc(v, L.diNuoc(v, kq.nuoc));
    if (ev.some(e => e.loai === 'chiemquan')) cuop++;
  }
  ok('đi rồi hoàn lại (cả lúc tự phong tướng) luôn trả đúng thế cờ; máy tự đánh Tam quốc toàn nước hợp lệ', lech === 0 && nuocLa === 0, `${lech} lần lệch, ${cuop} lần cướp quân, ${phong} lần phong tướng`);
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
  /* Người dùng: "đừng làm đánh trên 1 máy" — bỏ kiểu ba người chung máy, thay bằng chơi qua mạng (scripts/test-phong.js) */
  const nguon = fs.readFileSync(path.join(goc, 'assets', 'coba.js'), 'utf8');
  ok('không còn kiểu ba người chung máy', !/chung máy'|che === 'ba'|cheDo === 'ba'/.test(nguon) && !/3 người chung máy/.test(nguon));
  C._vanMoi({ mau: DEN, kho: 1 });
  const giong = (a, b) => Math.abs(Math.cos(a) - Math.cos(b)) < 1e-9 && Math.abs(Math.sin(a) - Math.sin(b)) < 1e-9;
  ok('cầm Đen thì bàn xoay cho Đen nằm dưới, hai máy là Hổ và Rùa', giong(C._xoayDen(), C._GOC_NHIN[DEN]) && C._tenNha(DEN) === 'Bạn' && C._tenNha(DO) === 'Hổ' && C._tenNha(TRANG) === 'Rùa');
  await choTaiNguoi();
  const k = JSON.parse(luu['tdtd.coba'] || '{}');
  ok('chỉ lưu cài đặt (cách chơi, màu, mức khó, tên, phòng đang ở, đã xem hướng dẫn), không lưu ván', Object.keys(k).every(x => ['che', 'mau', 'kho', 'h', 'ten', 'phong', 'luat', 'cu'].includes(x)));
  /* Người dùng: "giờ khó hình dung nước đi quá" — mỗi lượt của mình thì hai nhà kia đã đi hai nước, bản trước chỉ tô
     nhạt hai ô của nước cuối. Giờ mỗi nhà có mũi tên nước vừa đi, theo đúng đường; chọn quân thì vẽ đường nó đi được. */
  C._vanMoi({ mau: TRANG, kho: 0 });
  const t0 = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA], [o(TRANG, 'd', 1), TRANG, LO.HAU]]);
  Object.assign(C._van().the, t0);
  const quaTam = L.nuocHopLe(C._van().the, TRANG).filter(n => n.tu === o(TRANG, 'd', 1)).map(n => ({ n, d: L.duongDi(C._van().the, n) }))
    .find(x => x.d.length >= 6 && L.nhaO(x.n.toi) !== TRANG);
  C._thucHien(quaTam.n, TRANG); C._xongHoat();
  let vt = C._van().vet;
  ok('đi xong: nhớ mũi tên của nhà vừa đi theo đúng đường (hậu đi cột d qua tâm sang nhà khác — đường uốn, không phải đoạn thẳng)',
     vt[TRANG] && vt[TRANG].duong.join() === quaTam.d.join() && vt[TRANG].duong[0] === o(TRANG, 'd', 1) && vt[TRANG].duong.slice(-1)[0] === quaTam.n.toi &&
     new Set(vt[TRANG].duong.map(c => L.nhaO(c))).size >= 2, quaTam.d.map(ten).join(' → '));
  await choTaiNguoi();
  vt = C._van().vet;
  ok('tới lượt mình lại: có mũi tên của cả ba nhà, xếp theo thứ tự đi (mình đi trước, Đen, rồi Đỏ)', vt.every(Boolean) && vt[TRANG].thu < vt[DEN].thu && vt[DEN].thu < vt[DO].thu);
  const truocHoan = JSON.stringify(vt[TRANG]);
  const m2 = L.nuocHopLe(C._van().the, TRANG)[0]; C._thucHien(m2, TRANG); C._xongHoat(); await choTaiNguoi();
  C._hoanTac(); await choTaiNguoi();
  ok('hoàn tác: mũi tên cũng lùi về như trước nước đó', JSON.stringify(C._van().vet[TRANG]) === truocHoan);
  /* chọn quân: đường đi được vẽ theo đúng đường của từng nước */
  C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
  const vua = C._van().the.vua[TRANG], [xv, yv] = C._tamO(vua); C._chamBan(xv, yv);
  C._veCanh(1e6);
  const dc = C._duongChon();
  ok('chạm chọn quân: vẽ đường đi cho từng chỗ đi được, mỗi đường bắt đầu ở quân, kết thúc ở chỗ đến',
     C._chon() === vua && dc.ds.length === C._nuocCuaChon().length && dc.ds.length > 0 && dc.ds.every((d, i) => d[0] === vua && d[d.length - 1] === C._nuocCuaChon()[i].toi));
  /* Tam quốc trên giao diện: chạm quân có vòng vàng để phong tướng */
  C._vanMoi({ mau: TRANG, kho: 0, luat: 'tq' });
  ok('ván mới chọn luật Tam quốc', C._van().the.tq === true && C._van().luat === 'tq');
  Object.assign(C._van().the, (() => { const t = theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DO, 'a', 2), DO, LO.TOT], [o(DO, 'b', 1), DO, LO.MA],
    [o(DEN, 'e', 1), DEN, LO.VUA], [o(DO, 'e', 3), TRANG, LO.HAU]]); t.tq = true; return t; })());
  C._thucHien(L.nuocHopLe(C._van().the, TRANG).find(m => m.toi === o(DO, 'e', 1)), TRANG); C._xongHoat();
  ok('bạn ăn vua Đỏ: tới lượt bạn chọn tướng', C._van().the.cho.length === 1 && C._van().the.luot === TRANG && C._laMinh(TRANG));
  C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
  const [xm, ym] = C._tamO(o(DO, 'b', 1)); C._chamBan(xm, ym);
  ok('chạm mã Đỏ: mã thành tướng đạo quân Đỏ, cầm bởi bạn; mũi tên vẫn là nước ăn vua', C._van().the.o[o(DO, 'b', 1)] === DO * 8 + LO.TG && C._van().the.chu[DO] === TRANG &&
     !C._van().the.cho.length && C._van().vet[TRANG].duong.slice(-1)[0] === o(DO, 'e', 1));
  C._veCanh(1e6);
  ok('vẽ bàn có quân đổi chủ và tướng không lỗi', true);
  ok('quân đã mất ghi đúng nhà: bạn ăn vua Đỏ thì Đỏ mất vua; phong tướng không tính là ăn quân (bản trước cộng điểm cho nước phong)',
     JSON.stringify(C._van().mat) === JSON.stringify([[], [DO * 8 + LO.VUA], []]) && C._van().an[TRANG] === 0, JSON.stringify(C._van().mat) + ' điểm ' + C._van().an[TRANG]);
  await choTaiNguoi();
  /* Tam quốc: tới lượt mình thì chạm chọn được cả quân của đạo quân vừa chiếm (bản trước chỉ cho chạm quân đạo gốc) */
  if (C._van().the.luot === TRANG && C._van().the.o[o(DO, 'a', 2)] === DO * 8 + LO.TOT) {
    C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
    const [xa, ya] = C._tamO(o(DO, 'a', 2)); C._chamBan(xa, ya);
    ok('Tam quốc: chạm tốt Đỏ vừa chiếm là chọn để đi (không phải chỉ xem), có đường đi', C._chon() === o(DO, 'a', 2) && !C._chonXem() && C._nuocCuaChon().length > 0);
  } else ok('Tam quốc: dựng được thế để chạm quân vừa chiếm', false, `lượt ${C._van().the.luot}`);
  /* hình động hướng dẫn */
  C._batDemo();
  const dau = C._demo() ? C._demo().buoc : -1;
  for (let i = 0; i < 3; i++) C._tiepDemo();
  const cuoi = C._demo() ? C._demo().buoc : -1;
  C._tiepDemo();
  ok('hình động hướng dẫn: bốn cảnh lần lượt rồi tự tắt', dau === 0 && cuoi === 3 && C._demo() === null);
  C.dong();
}

console.log('\n— Xem nước đi từng quân, chạm xem lúc chưa tới lượt, quân đã mất —');
{
  C.mo();
  const tam = global.document.body.children.find(c => c.className === 'coba');
  const chuBao = () => tam.querySelector('.cb-bao').textContent, luot = () => tam.querySelector('.cb-luot').textContent;
  const bam = (sel, ds = {}) => C._bam({ target: { closest: (s) => (s === sel ? { dataset: ds } : null) } });
  const tq2 = (dat, l) => Object.assign(theTrong(dat, l), { tq: true });
  /* Người dùng: "trong lúc chờ cho nhấn để xem nước đi từng con (option trước khi vô phòng)". Bàn trống một quân: chọn
     loại quân, chạm chấm thì quân trượt tới, chạm ô khác thì đặt quân vào đó */
  C._vanMoi({ mau: TRANG, kho: 0 });
  await choTaiNguoi();
  bam('.cb-xemquan', { tu: 'huongdan' });
  const e1 = o(TRANG, 'e', 1), tiaXe = B.TRUC[e1].reduce((n, t) => n + t.length, 0);
  ok('mở "Xem cách đi từng quân" từ bảng Cách chơi: xe Trắng ở e1 trên bàn trống, đủ 14 ô dù ván đang có quân chắn; nút Xong thay chỗ Ván mới',
     !!C._xem() && C._xem().loai === LO.XE && C._xem().c === e1 && tam.querySelector('.cb-tin').hidden && tiaXe === 14 && luot().includes('đi được 14 ô') &&
     !tam.querySelector('.cb-xong').hidden && tam.querySelector('.cb-moi').hidden && tam.querySelector('.cb-hoan').hidden, luot());
  ok('luật thường: hàng chọn quân có sáu loại, không có Tướng', (tam.querySelector('.cb-xem').innerHTML.match(/data-xq/g) || []).length === 6 && !tam.querySelector('.cb-xem').innerHTML.includes('data-xq="7"'));
  C._chonXemQuan(LO.MA);
  const d4 = o(TRANG, 'd', 4);
  ok('chọn Mã: đặt ở d4 sát tâm, thấy đủ 10 ô', C._xem().c === d4 && B.MA[d4].length === 10 && luot().includes('đi được 10 ô'), luot());
  C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
  const toi = B.MA[d4].find(c => L.nhaO(c) !== TRANG), [xd, yd] = C._tamO(toi);
  C._chamXem(xd, yd);
  const dangTruot = !!C._xem().truot && C._xem().c === d4;
  C._veCanh(1e12);
  ok('chạm chấm: mã trượt tới, trượt xong thì đứng ở ô mới (sang nhà khác), lời giải thích theo ô mới', dangTruot && !C._xem().truot && C._xem().c === toi && luot().includes(ten(toi).split(' ')[1]), ten(toi));
  const khac = [...Array(96).keys()].find(c => c !== toi && !B.MA[toi].includes(c)), [xk, yk] = C._tamO(khac);
  C._chamXem(xk, yk);
  ok('chạm ô không có chấm: đặt quân vào đó luôn', C._xem().c === khac && !C._xem().truot);
  C._chonXemQuan(LO.TOT);
  const e2 = o(TRANG, 'e', 2);
  ok('chọn Tốt: ở e2, tiến được 2 ô, kể cả ô ăn chéo (tô đỏ)', C._xem().c === e2 && luot().includes(`tiến được 2 ô, ăn chéo ${L.TOT_AN[TRANG][e2].length} ô`), luot());
  C._veCanh(1e12);
  ok('vẽ bàn lúc đang xem không lỗi', true);
  bam('.cb-xong');
  ok('bấm Xong: về lại bảng Cách chơi, nút của ván hiện lại', !C._xem() && !tam.querySelector('.cb-tin').hidden && /Cách chơi/.test(tam.querySelector('.cb-tin').querySelector('.cb-tin-trong').innerHTML) &&
     tam.querySelector('.cb-xong').hidden && !tam.querySelector('.cb-moi').hidden && tam.querySelector('.cb-xem').hidden);
  /* ván vẫn chạy phía sau lúc đang xem: nước máy đi tới là áp ngay, khỏi kẹt chờ hình động */
  {
    const v = C._van(), truoc = v.soNuoc;
    C._thucHien(L.nuocHopLe(v.the, TRANG)[0], TRANG); C._xongHoat();
    bam('.cb-xemquan', { tu: 'huongdan' });
    for (let i = 0; i < 120 && !(v.the.luot === TRANG && v.dangNghi < 0 && !C._hoat()); i++) { await cho(50); C._veCanh(performance.now()); }
    ok('đang xem cách đi mà hai máy đi: nước máy áp ngay, tới lượt bạn như thường', v.soNuoc === truoc + 3 && v.the.luot === TRANG && !C._hoat() && !!C._xem(), `${v.soNuoc - truoc} nước`);
    bam('.cb-xong'); bam('.cb-dongtin');
  }
  /* trong ván: chưa tới lượt, hay chạm quân nhà khác — chỉ xem quân đó đi được đâu, chạm chấm không đi */
  {
    C._canhBan(); C._datXoay(C._GOC_NHIN[TRANG]);
    const v = C._van(), maDen = [...Array(96).keys()].find(c => v.the.o[c] === DEN * 8 + LO.MA), [xq, yq] = C._tamO(maDen);
    C._chamBan(xq, yq);
    const mong = L.nuocHopLe(v.the, DEN).filter(n => n.tu === maDen).map(n => n.toi).sort().join();
    ok('tới lượt mình mà chạm mã Đen: chỉ xem — đúng các nước mã đó đi được, có báo "chỉ xem"',
       C._chon() === maDen && C._chonXem() && !!mong && C._nuocCuaChon().map(n => n.toi).sort().join() === mong && /Mã đen của Hổ: \d+ nước đi được \(chỉ xem\)/.test(chuBao()), chuBao());
    const truocThe = Array.from(v.the.o).join(), oTrong = C._nuocCuaChon().find(n => !v.the.o[n.toi]);
    if (oTrong) { const [xx, yy] = C._tamO(oTrong.toi); C._chamBan(xx, yy); }
    ok('chạm chấm của quân đang xem: không đi, thế cờ giữ nguyên, thôi chọn', !!oTrong && !C._hoat() && Array.from(v.the.o).join() === truocThe && C._chon() === -1);
    const maTrang = [...Array(96).keys()].find(c => v.the.o[c] === TRANG * 8 + LO.MA && L.nuocHopLe(v.the, TRANG).some(n => n.tu === c)), [xw, yw] = C._tamO(maTrang);
    C._chamBan(xw, yw);
    ok('chạm quân mình lúc tới lượt: chọn để đi như cũ', C._chon() === maTrang && !C._chonXem() && C._nuocCuaChon().length > 0);
    const di = C._nuocCuaChon()[0];
    C._thucHien(di, TRANG); C._xongHoat();
    const [xw2, yw2] = C._tamO(di.toi);
    C._chamBan(xw2, yw2);
    ok('chưa tới lượt (máy đang nghĩ): chạm quân mình thì chỉ xem, báo chưa tới lượt bạn', C._chon() === di.toi && C._chonXem() && /chưa tới lượt bạn/.test(chuBao()), chuBao());
    await choTaiNguoi();
    ok('máy đi xong thì thôi xem (thế cờ đã đổi)', C._chon() === -1 && !C._chonXem());
  }
  /* quân đã mất: ghi cho nhà đang cầm quân lúc bị ăn; quân mình bị ăn thì có lời báo; chạm thẻ thì báo bằng chữ */
  C._vanMoi({ mau: TRANG, kho: 0 });
  await choTaiNguoi();
  Object.assign(C._van().the, theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA],
    [o(TRANG, 'a', 3), TRANG, LO.MA], [o(TRANG, 'a', 1), DEN, LO.XE]], DEN));
  C._thucHien(L.nuocHopLe(C._van().the, DEN).find(m => m.tu === o(TRANG, 'a', 1) && m.toi === o(TRANG, 'a', 3)), DEN); C._xongHoat();
  ok('Hổ ăn mã của bạn: thẻ của bạn ghi mất một mã, có lời báo', JSON.stringify(C._van().mat) === JSON.stringify([[TRANG * 8 + LO.MA], [], []]) && chuBao() === 'Hổ ăn mã của bạn.', chuBao());
  /* lời báo và câu nói của máy cùng nằm trên đầu bàn: có lời báo thì bong bóng tắt, và câu nói tới sau thì đợi báo tắt */
  {
    const noi = tam.querySelector('.cb-noi');
    noi.hidden = false; C._bam({ target: { closest: (s) => (s === '.cb-the' ? { dataset: { p: '0' } } : null) } });
    const tatKhiBao = noi.hidden;
    const r0 = Math.random; Math.random = () => 0;
    C._noi(DEN, 'an');
    Math.random = r0;
    await cho(40);
    const doiBao = noi.hidden;
    tam.querySelector('.cb-bao').hidden = true;
    await cho(400);
    ok('có lời báo thì bong bóng lời nói của máy tắt; câu nói tới lúc đang báo thì đợi báo tắt mới hiện', tatKhiBao && doiBao && !noi.hidden);
  }
  bam('.cb-the', { p: String(TRANG) });
  const baoTrang = chuBao();
  bam('.cb-the', { p: String(DO) });
  ok('chạm thẻ: báo bằng chữ quân đã mất; nhà chưa mất gì thì nói chưa mất', baoTrang === 'Bạn (Trắng) đã mất: mã.' && chuBao() === 'Rùa (Đỏ) chưa mất quân nào.', `${baoTrang} | ${chuBao()}`);
  C._vanMoi({ mau: TRANG, kho: 0 });
  await choTaiNguoi();
  Object.assign(C._van().the, theTrong([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'e', 1), DEN, LO.VUA],
    [o(TRANG, 'd', 1), TRANG, LO.HAU], [o(TRANG, 'd', 3), DEN, LO.TOT]], TRANG));
  C._thucHien(L.nuocHopLe(C._van().the, TRANG).find(m => m.tu === o(TRANG, 'd', 1) && m.toi === o(TRANG, 'd', 3)), TRANG); C._xongHoat();
  const sauAn = JSON.stringify(C._van().mat[DEN]);
  await choTaiNguoi();
  C._hoanTac(); await choTaiNguoi();
  ok('bạn ăn tốt Đen rồi hoàn tác: quân đã mất cũng lùi về', sauAn === JSON.stringify([DEN * 8 + LO.TOT]) && C._van().mat.every(a => !a.length), JSON.stringify(C._van().mat));
  /* Tam quốc: bị chiếu hết thì vua bị bắt khỏi bàn — cũng là mất vua; hàng chọn quân có thêm Tướng */
  C._vanMoi({ mau: TRANG, kho: 0, luat: 'tq' });
  await choTaiNguoi();
  Object.assign(C._van().the, tq2([[o(TRANG, 'e', 1), TRANG, LO.VUA], [o(DO, 'e', 1), DO, LO.VUA], [o(DEN, 'h', 1), DEN, LO.VUA], [o(DEN, 'a', 2), DEN, LO.TOT],
    [o(DEN, 'h', 4), DO, LO.XE], [o(DEN, 'h', 2), TRANG, LO.MA], [o(DEN, 'g', 3), TRANG, LO.XE]], TRANG));
  C._thucHien(L.nuocHopLe(C._van().the, TRANG).find(m => m.tu === o(DEN, 'h', 2)), TRANG); C._xongHoat();
  ok('Tam quốc: Đen bị chiếu hết, vua bị bắt khỏi bàn — Đen ghi mất vua', C._van().mat[DEN].includes(DEN * 8 + LO.VUA) && !C._van().the.o[o(DEN, 'h', 1)], JSON.stringify(C._van().mat));
  bam('.cb-xemquan', { tu: 'huongdan' });
  const coTuong = tam.querySelector('.cb-xem').innerHTML.includes('data-xq="7"');
  C._chonXemQuan(LO.TG);
  ok('ván Tam quốc: hàng chọn quân có Tướng, tướng ở d4 đi như vua', coTuong && C._xem().loai === LO.TG && luot().includes(`đi được ${B.VUA[o(TRANG, 'd', 4)].length} ô`), luot());
  bam('.cb-xong'); bam('.cb-dongtin');
  C.dong();
}

console.log('\n— Hình quân —');
{
  /* Người dùng: "làm UIUX quân cờ đẹp hơn". Chuẩn thiết bị cờ của FIDE (bản từ 1/3/2026): vua > hậu > tượng > mã > xe > tốt,
     chuẩn 95 / 85 / 70 / 60 / 55 / 50 mm, được lệch tối đa 10% */
  const CAO = C._CAO, FIDE = { 6: 95, 5: 85, 3: 70, 2: 60, 4: 55, 1: 50 }, thuTu = [6, 5, 3, 2, 4, 1];
  const mm = (l) => CAO[l] / CAO[6] * 95;
  ok('chiều cao quân đúng thứ tự FIDE: vua > hậu > tượng > mã > xe > tốt (bản trước tốt cao gần bằng hậu)', thuTu.every((l, i) => !i || CAO[thuTu[i - 1]] > CAO[l]));
  ok('đổi ra mm với vua 95 mm: quân nào cũng trong khoảng FIDE cho phép (chuẩn ± 10%)', thuTu.every(l => mm(l) >= FIDE[l] * .9 - 1e-9 && mm(l) <= FIDE[l] * 1.1 + 1e-9),
     thuTu.map(l => mm(l).toFixed(1)).join(' / '));
  /* vẽ thử mọi loại quân, mọi màu, quân đá, vành đạo gốc, quân nhấc lên vào một khung ghi lại: không có số hỏng (NaN, vô cực),
     save/restore cân nhau */
  const ghi = { goi: 0, loi: [], muc: 0 };
  const kiem = (k, a) => { if (a.some(x => typeof x === 'number' && !Number.isFinite(x))) ghi.loi.push(k); };
  const khung = new Proxy({}, { get: (_, k) => {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return (...a) => { kiem(k, a); return { addColorStop: (...b) => kiem('addColorStop', b) }; };
    if (k === 'save') return () => { ghi.muc++; };
    if (k === 'restore') return () => { ghi.muc--; };
    return (...a) => { ghi.goi++; kiem(k, a); };
  }, set: () => true });
  for (const l of [1, 2, 3, 4, 5, 6, 7]) for (const m of C._MAU.concat([C._DA])) for (const goc of [null, C._MAU[1]]) for (const nang of [0, 1])
    C._vePhan(khung, l, 50, 80, 40, m, m === C._DA, goc, nang);
  ok('vẽ đủ bảy loại quân × ba màu và quân đá × có/không vành đạo gốc × nhấc lên: không số hỏng, save/restore cân nhau',
     !ghi.loi.length && ghi.muc === 0 && ghi.goi > 7 * 4 * 2 * 2 * 10, ghi.loi.slice(0, 3).join() || `${ghi.goi} lệnh vẽ`);
}

console.log('\n— Gắn vào app —');
{
  const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8'), sw = fs.readFileSync(path.join(goc, 'sw.js'), 'utf8');
  const app = fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8'), css = fs.readFileSync(path.join(goc, 'assets', 'app.css'), 'utf8');
  ok('index.html nạp coba.js trước app.js; sw.js cất sẵn để chơi khi mất mạng', html.indexOf('src="assets/coba.js"') > 0 && html.indexOf('src="assets/coba.js"') < html.indexOf('src="assets/app.js"') && sw.includes("'assets/coba.js'"));
  ok('có ngôi sao trên trang chính, mở bằng #co-ba-nguoi', /id: 'sao-coba'[\s\S]*?duong: 'co-ba-nguoi', khung: '\.coba', mun: 'TDTD_COBA'/.test(app) && /\n  coba: +'M/.test(app));
  ok('có kiểu dáng cho khung trò', css.includes('.coba{') && css.includes('.coba.hien{display:flex}'));
  /* người dùng: "khi ở cờ vua, chưa vô ván thì không bấm chia sẻ link được vì lúc nào cũng có popup" — bảng Ván mới phủ cả
     khung, từng nằm trên hàng nút đóng / chép link / Cài app của app */
  const zIndex = (khoa) => { const i = css.indexOf(khoa + '{'), m = i >= 0 && css.slice(i).match(/^[^}]*?z-index:(\d+)/); return m ? +m[1] : NaN; };
  const [, tren, cao] = (css.match(/\.xn-dong\{[^}]*?top:calc\(env\(safe-area-inset-top,0px\) \+ (\d+)px\)[^}]*?;height:(\d+)px/) || []).map(Number);
  const chua = +(css.match(/\.cb-tin\{[^}]*?padding:calc\(env\(safe-area-inset-top,0px\) \+ (\d+)px\)/) || [])[1];
  ok('nút đóng, chép link, Cài app nằm trên bảng Ván mới, bấm được lúc chưa vào ván; bảng chừa hàng nút ở trên, không đè lên nút',
     zIndex('.coba .xn-dong,.coba .nut-link,.coba .nut-cai') > zIndex('.cb-tin') && chua >= tren + cao && /\.cb-tin-trong\{[^}]*?max-height:100%/.test(css),
     `nút ${zIndex('.coba .xn-dong,.coba .nut-link,.coba .nut-cai')} / bảng ${zIndex('.cb-tin')}, chừa ${chua} / hàng nút tới ${tren + cao}`);
  const src = fs.readFileSync(path.join(goc, 'assets', 'coba.js'), 'utf8');
  ok('máy nghĩ chạy ở luồng riêng dựng từ chính mã lõi, không tải tệp nào thêm', /new Worker\(URL\.createObjectURL\(new Blob/.test(src) && /LOI\.toString\(\)/.test(src));
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
})();
