/* Kiểm thử Bida lỗ: node scripts/test-bida.js
   Số đo bàn, bi, lỗ theo WPA; vật lý (đối chiếu các điều người chơi bida đều biết: đánh đâm thì bi chủ đứng, quy tắc 90°
   và 30°, đánh kéo, đánh đẩy, trượt rồi lăn ở 5/7 tốc độ, lăn đi đúng v²/2μg, băng ăn bớt tốc độ, xoáy phải bật lệch
   phải, lỗ góc nhận bi lệch, lỗ giữa không nhận bi vào xiên quá); cú phá tung bàn; đơn định (cùng cú ra cùng kết quả từng
   bit, mã hoá rồi đọc lại y hệt — các máy chơi qua mạng dựa vào điều này); luật 8 bi, 9 bi; máy đánh; giao diện. */
'use strict';
const fs = require('fs');
const path = require('path');
const goc = path.join(__dirname, '..');

const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return () => ({ width: 10 });
    if (k === 'createImageData') return (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w * h * 4) });
    if (k === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) });
    return () => {};
  },
  set: () => true,
});
const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false, width: 0, height: 0,
    hidden: /bd-(tin|bao|thay|xoay-bang)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {}, setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 600, bottom: 600 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d, closest: () => null,
    querySelector(sel) { const k = String(sel).split(/[ ,]/)[0].replace(/^[.#]/, ''); return o._q[k] || (o._q[k] = nut(k)); },
    querySelectorAll() { return []; },
  };
  return o;
};
let luu = {};
global.document = { body: nut('body'), hidden: false, createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
const nghe = {};                                       // giữ các hàm nghe phím để bài kiểm bấm Esc thật
global.addEventListener = (k, f) => { (nghe[k] = nghe[k] || []).push(f); }; global.removeEventListener = () => {};
global.localStorage = { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1;
global.location = { origin: 'http://x', pathname: '/', search: '', hash: '' };
global.history = { replaceState() {}, state: null };
new Function(fs.readFileSync(path.join(goc, 'assets', 'phong.js'), 'utf8'))();
new Function(fs.readFileSync(path.join(goc, 'assets', 'bida.js'), 'utf8'))();
const B = global.TDTD_BIDA, L = B.L, { R, D, DAI, RONG } = L;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const rong = () => new Array(16).fill(null);
const do_ = (r) => r * 180 / Math.PI;
const goc2 = (x, y) => do_(Math.atan2(y, x));
/* chạy tới va chạm đầu tiên (hay tới khi bi chủ thôi trượt sau va chạm) */
const toiCham = (mp) => { let k = 0; while (!mp.xong && !mp.sk.length && k++ < 20000) L.buoc(mp); return mp; };
const toiLan = (mp, i = 0) => { let k = 0; while (!mp.xong && mp.bi[i].tt === 1 && k++ < 20000) L.buoc(mp); return mp; };
/* thế bàn tự đặt: bi[] theo danh sách [số, x, y] */
function theDat(kieu, ds, them = {}) {
  const t = L.theMoi(kieu, them.so || 2, 1, 0);
  t.bi = rong();
  for (const [s, x, y] of ds) t.bi[s] = [x, y];
  return Object.assign(t, { pha: false, tuDo: 0 }, them);
}
const kqGia = (the, vao, them = {}) => {                  // kết quả cú tự đặt: bi vào lỗ, còn lại đứng yên
  const cuoi = the.bi.map((q, s) => (q && !vao.some(v => v[0] === s) ? [q[0], q[1]] : null));
  return Object.assign({ dau: -1, bang: true, soBang: 0, vao, cuoi }, them);
};

console.log('\n— Bàn, bi, lỗ theo WPA —');
{
  ok('mặt bàn 9 feet 2,54 × 1,27 m, bi 57,15 mm', DAI === 2.54 && RONG === 1.27 && Math.abs(D - 0.05715) < 1e-9);
  const goc_ = L.LO.filter(l => l.goc), giua = L.LO.filter(l => !l.goc);
  ok('miệng lỗ góc 4⅝" (117,5 mm), lỗ giữa 5⅛" (130,2 mm), đo giữa hai mỏm băng — cỡ rộng nhất WPA cho phép',
    goc_.length === 4 && giua.length === 2 && goc_.every(l => Math.abs(l.rong - 0.117475) < 1e-6) && giua.every(l => Math.abs(l.rong - 0.130175) < 1e-6));
  /* góc cắt: giữa mũi băng (hướng ra xa lỗ) và mặt hàm (hướng vào lỗ) */
  const cat = (lo, m) => {
    const h = lo.ham[m], s = L.BANG.find(b => (Math.abs(b.ax - h.ax) < 1e-9 && Math.abs(b.ay - h.ay) < 1e-9) || (Math.abs(b.bx - h.ax) < 1e-9 && Math.abs(b.by - h.ay) < 1e-9));
    const ra = Math.abs(s.ax - h.ax) < 1e-9 && Math.abs(s.ay - h.ay) < 1e-9 ? [s.ex, s.ey] : [-s.ex, -s.ey];
    return do_(Math.acos(ra[0] * h.ex + ra[1] * h.ey));
  };
  ok('hàm lỗ góc cắt 142°, lỗ giữa 104° — hàm khép dần vào trong', L.LO.every(l => l.ham.every((_, m) => Math.abs(cat(l, m) - (l.goc ? 142 : 104)) < 0.01)),
    L.LO.map(l => cat(l, 0).toFixed(1)).join(', '));
  const t8 = L.theMoi(8, 2, 77, 0), v = t8.bi, tron = [1, 2, 3, 4, 5, 6, 7], soc = [9, 10, 11, 12, 13, 14, 15];
  let chong = 0;
  for (let i = 1; i < 16; i++) for (let j = i + 1; j < 16; j++) if (Math.hypot(v[i][0] - v[j][0], v[i][1] - v[j][1]) < D) chong++;
  const xa = (s) => v[s][0], hangCuoi = [...Array(16).keys()].filter(s => s > 0 && xa(s) > L.CHAM_CHAN[0] + 3.2 * D);
  const goc3 = hangCuoi.filter(s => Math.abs(v[s][1] - RONG / 2) > 1.9 * D);
  ok('8 bi: 15 bi tam giác, đỉnh ở chấm chân bàn, bi 8 giữa hàng ba, hai góc hàng cuối một trơn một sọc, không bi nào chồng nhau',
    v.slice(1).every(Boolean) && chong === 0 && v.slice(1).some(q => Math.hypot(q[0] - L.CHAM_CHAN[0], q[1] - L.CHAM_CHAN[1]) < 0.0003) &&
    Math.abs(v[8][1] - RONG / 2) < 0.0003 && Math.abs(v[8][0] - (L.CHAM_CHAN[0] + 2 * (D + 0.0002) * Math.sqrt(3) / 2)) < 0.0003 &&
    goc3.length === 2 && goc3.some(s => tron.includes(s)) && goc3.some(s => soc.includes(s)));
  const t9 = L.theMoi(9, 2, 77, 0), v9 = t9.bi;
  ok('9 bi: chín bi hình thoi, bi 1 ở đỉnh trên chấm chân bàn, bi 9 ở giữa', v9.slice(1, 10).every(Boolean) && v9.slice(10).every(q => !q) &&
    Math.hypot(v9[1][0] - L.CHAM_CHAN[0], v9[1][1] - L.CHAM_CHAN[1]) < 0.0003 && Math.abs(v9[9][1] - RONG / 2) < 0.0003);
  const khac = new Set([1, 2, 3, 4, 5].map(h => JSON.stringify(L.xepBi(8, h))));
  ok('cùng hạt giống thì xếp y hệt (mọi máy trong phòng), khác hạt giống thì khác', JSON.stringify(L.xepBi(8, 5)) === JSON.stringify(L.xepBi(8, 5)) && khac.size === 5);
}

console.log('\n— Vật lý —');
{
  /* đánh đâm: bi chủ ở sát, đánh nhanh — chưa kịp ăn xoáy lăn khi chạm */
  const v = rong(); v[0] = [1.0, 0.6]; v[1] = [1.0 + D + 0.004, 0.6];
  const mp = toiCham(L.moPhong(v, { dx: 1, dy: 0, v: 3, a: 0, b: 0 }));
  const c = mp.bi[0], o = mp.bi[1], vc = Math.hypot(c.vx, c.vy) + Math.hypot(o.vx, o.vy);
  ok('đánh đâm thẳng: bi chủ còn chừng 2,5% tốc độ, bi đích nhận 97,5% (hồi 0,95)', Math.abs(Math.hypot(o.vx, o.vy) / vc - 0.975) < 0.003 && Math.hypot(c.vx, c.vy) / vc < 0.03);
  const v2 = rong(); v2[0] = [0.2, 0.6];
  const lan = L.chayHet(L.moPhong(v2, { dx: 1, dy: 0, v: 0.5, a: 0, b: 0.4 }));
  ok('chạm cao 2/5 bán kính thì lăn tròn ngay; lăn đi đúng v²/(2·0,01·g)', Math.abs((lan.bi[0].x - 0.2) - 0.25 / (2 * 0.0981)) < 0.004, `${(lan.bi[0].x - 0.2).toFixed(3)} m`);
  const mp3 = toiLan(L.moPhong(v2, { dx: 1, dy: 0, v: 0.5, a: 0, b: 0 }));
  ok('đánh giữa bi: trượt rồi lăn, lúc bắt đầu lăn tốc độ còn 5/7', Math.abs(mp3.bi[0].vx / 0.5 - 5 / 7) < 0.01, (mp3.bi[0].vx / 0.5).toFixed(3));
  /* quy tắc 90°: bi chủ trượt (không xoáy) chạm xiên — hai bi tách nhau vuông góc */
  const v4 = rong(); v4[0] = [1.0, 0.6]; v4[1] = [1.0 + D + 0.003, 0.6 + D * 0.5];
  const mp4 = toiCham(L.moPhong(v4, { dx: 1, dy: 0, v: 3, a: 0, b: 0 }));
  const g90 = Math.abs(goc2(mp4.bi[1].vx, mp4.bi[1].vy) - goc2(mp4.bi[0].vx, mp4.bi[0].vy));
  /* hồi 0,95 nên bi chủ giữ lại 2,5% thành phần pháp tuyến: góc tách hơi dưới 90° (ăn nửa bi: 87,5°), như ngoài đời */
  ok('quy tắc 90°: đánh đâm chạm xiên thì bi chủ và bi đích tách nhau gần vuông góc (hơi dưới 90° vì hồi 0,95)', g90 > 85 && g90 <= 90, g90.toFixed(1) + '°');
  /* quy tắc 30°: bi chủ lăn tròn ăn nửa bi — lệch chừng 30° (lý thuyết 33,7° ngay khi lăn lại) */
  const v5 = rong(); v5[0] = [0.3, 0.6]; v5[1] = [1.3, 0.6 + R];
  const mp5 = toiLan(toiCham(L.moPhong(v5, { dx: 1, dy: 0, v: 1.5, a: 0, b: 0.4 })));
  const g30 = -goc2(mp5.bi[0].vx, mp5.bi[0].vy);
  ok('quy tắc 30°: bi chủ lăn tròn ăn nửa bi thì lệch 30–35° khỏi hướng cũ', g30 > 30 && g30 < 35, g30.toFixed(1) + '°');
  const v6 = rong(); v6[0] = [0.5, 0.6]; v6[1] = [1.0, 0.6];
  const keo = L.chayHet(L.moPhong(v6, { dx: 1, dy: 0, v: 2, a: 0, b: -0.5 })), day = L.chayHet(L.moPhong(v6, { dx: 1, dy: 0, v: 1.2, a: 0, b: 0.45 }));
  ok('đánh kéo: bi chủ giật lùi qua chỗ đứng cũ; đánh đẩy: bi chủ chạy theo qua chỗ bi đích', keo.bi[0].x < 0.5 && day.bi[0].x > 1.0, `kéo về ${keo.bi[0].x.toFixed(2)}, đẩy tới ${day.bi[0].x.toFixed(2)}`);
  /* băng */
  const v7 = rong(); v7[0] = [0.8, 0.5];
  const bang = toiLan(toiCham(L.moPhong(v7, { dx: 0, dy: 1, v: 1.5, a: 0, b: 0.4 })));
  const ti = -bang.bi[0].vy / 1.5;
  ok('bi lăn tròn vào băng vuông góc: bật ra rồi lăn lại ở 45–70% tốc độ (mũi băng ăn bớt xoáy xuôi)', ti > 0.45 && ti < 0.7, ti.toFixed(2));
  const phai = toiCham(L.moPhong(v7, { dx: 0, dy: 1, v: 1.5, a: 0.4, b: 0 })), trai = toiCham(L.moPhong(v7, { dx: 0, dy: 1, v: 1.5, a: -0.4, b: 0 }));
  ok('xoáy phải (đánh lệch phải) thì bi bật băng lệch phải, xoáy trái lệch trái — tính theo người đánh', phai.bi[0].vx > 0.1 && trai.bi[0].vx < -0.1,
    `${phai.bi[0].vx.toFixed(2)} / ${trai.bi[0].vx.toFixed(2)}`);
  /* năng lượng không bao giờ tăng */
  let tang = 0;
  const r = L.mulberry32(3);
  for (let k = 0; k < 40; k++) {
    const the = L.theMoi(k % 2 ? 9 : 8, 2, k, 0), g = r() * 6.2832;
    const mp = L.moPhong(the.bi, { dx: Math.cos(g), dy: Math.sin(g), v: 1 + r() * 7, a: (r() - 0.5) * 0.9, b: (r() - 0.5) * 0.9 });
    const E = () => mp.bi.reduce((s, b) => s + (b.tt >= 0 ? b.vx * b.vx + b.vy * b.vy + 0.4 * R * R * (b.wx * b.wx + b.wy * b.wy + b.wz * b.wz) : 0), 0);
    let e0 = E();
    for (let i = 0; i < 1500 && !mp.xong; i++) { L.buoc(mp); const e = E(); if (e > e0 * 1.0001 + 1e-9) tang++; e0 = e; }
  }
  ok('động năng (cả quay) không bao giờ tăng sau mỗi bước, 40 cú ngẫu nhiên', tang === 0, `${tang} lần tăng`);
}

console.log('\n— Lỗ —');
{
  const k = Math.SQRT1_2;
  const vaoGoc = (lech, v0) => { const v = rong(), ox = DAI - 0.5 * k + lech * k, oy = RONG - 0.5 * k - lech * k; v[1] = [ox, oy]; v[0] = [ox - 0.4 * k, oy - 0.4 * k];
    return L.chayHet(L.moPhong(v, { dx: k, dy: k, v: v0, a: 0, b: -0.3 })).vao.some(x => x[0] === 1); };
  ok('lỗ góc: bi chạy thẳng vào giữa lỗ, hay lệch tới 3 cm, đều vào (lực vừa và mạnh)', [0, 0.015, 0.03].every(l => vaoGoc(l, 1.5) && vaoGoc(l, 3)));
  ok('lỗ góc: lệch 4 cm thì va mỏm, không vào', !vaoGoc(0.04, 1.5) && !vaoGoc(0.04, 3));
  const giua = (gc, v0) => { const v = rong(), g = gc * Math.PI / 180, ox = DAI / 2 - Math.sin(g) * 0.4, oy = -0.005 + Math.cos(g) * 0.4; v[1] = [ox, oy]; v[0] = [ox - Math.sin(g) * 0.3, oy + Math.cos(g) * 0.3];
    return L.chayHet(L.moPhong(v, { dx: Math.sin(g), dy: -Math.cos(g), v: v0, a: 0, b: -0.3 })).vao.some(x => x[0] === 1); };
  ok('lỗ giữa: bi vào thẳng hay xiên 45° đều vào; xiên 65° thì hàm lỗ chặn lại', giua(0, 1.5) && giua(45, 1.5) && !giua(65, 1.5) && !giua(65, 3));
  const cham = (v0) => { const v = rong(); v[0] = [DAI - 0.3 * k, RONG - 0.3 * k]; return L.chayHet(L.moPhong(v, { dx: k, dy: k, v: v0, a: 0, b: 0.4 })); };
  const c1 = cham(0.2), c2 = cham(0.3);
  ok('bi lăn chậm dừng ngay mép lỗ, nhích thêm chút lực thì rơi', !c1.vao.length && c2.vao.length === 1 && Math.hypot(c1.bi[0].x - DAI, c1.bi[0].y - RONG) < 0.12);
}

console.log('\n— Cú phá, đơn định, mã hoá —');
{
  let soBang = 0, hopLe = 0, khit = 0;
  for (let i = 0; i < 20; i++) {
    const the = L.theMoi(8, 2, 900 + i, 0), r = L.mulberry32(i + 1), y = RONG / 2 + (r() - 0.5) * 0.3;
    const tx = L.CHAM_CHAN[0] - L.KE_DAU + 0.03, ty = L.CHAM_CHAN[1] - y, n = Math.hypot(tx, ty);
    const cu = { dx: tx / n, dy: ty / n, v: 8.5, a: 0, b: -0.15, cx: L.KE_DAU - 0.03, cy: y };
    const kq = L.danh(L.viTriDanh(the, cu), cu);
    soBang += kq.soBang;
    if (!L.apCu(the, cu, kq).bao.loi || L.apCu(the, cu, kq).bao.loi === 'cai') hopLe++;
    if (kq.soBang >= 6) khit++;
  }
  ok('phá tam giác 15 bi: bi khít nhau va mềm cả chùm, trung bình ≥ 8 bi chạm băng (va từng cặp chỉ được 4)', soBang / 20 >= 8 && khit >= 16, `${(soBang / 20).toFixed(1)} bi`);
  ok('cú phá mạnh hầu như luôn đạt (đủ bốn bi chạm băng, hay có bi vào)', hopLe >= 18, `${hopLe}/20`);
  const the = L.theMoi(8, 2, 12345, 0), cu = { dx: 1, dy: 0.002, v: 8.5, a: 0.1, b: -0.2, cx: L.KE_DAU - 0.06, cy: RONG / 2 };
  const a = L.danh(L.viTriDanh(the, cu), cu), b = L.danh(L.viTriDanh(the, cu), cu);
  ok('cùng thế, cùng cú: kết quả giống nhau từng bit', L.maKq(a) === L.maKq(b) && JSON.stringify(a) === JSON.stringify(b));
  const cu2 = L.docCu(L.maCu(cu));
  ok('mã hoá cú đánh rồi đọc lại: đúng từng con số (số nguyên, mọi máy đọc ra một)', L.maCu(cu2) === L.maCu(cu) && cu2.cx === L.KE_DAU - 0.06 && /^[-0-9,]+$/.test(L.maCu(cu)) && L.maCu(cu).length <= 80);
  const kq2 = L.docKq(L.maKq(a));
  ok('mã hoá kết quả rồi đọc lại: y hệt; vị trí làm tròn 0,1 mm; dưới 400 ký tự', JSON.stringify(kq2) === JSON.stringify(a) && L.maKq(a).length < 400 &&
    a.cuoi.every(q => !q || (Math.round(q[0] * 1e4) / 1e4 === q[0] && Math.round(q[1] * 1e4) / 1e4 === q[1])));
  const hong = ['', 'abc', '1,2,3', '0,0,1000,0,0,,,', '1000000,0,99000,0,0,,,', '1000000,0,1000,0,0,5,,', '1000000,0,1000,0,0,,,9'];
  ok('cú sai khuôn thì không nhận (hướng 0, lực quá tay, đặt bi thiếu toạ độ, lỗ ngoài 0–5)', hong.every(s => L.docCu(s) === null));
  const kqHong = [L.maKq(a).replace(/^13;/, '0;'), L.maKq(a).replace(/;1;/, ';2;'), L.maKq(a) + ',1:1', '1;1;0;;' + new Array(16).fill('9999999:1').join(',')];
  ok('kết quả sai khuôn thì không nhận (chạm đầu bi chủ, cờ băng lạ, thiếu thừa bi, toạ độ ngoài bàn)', kqHong.every(s => L.docKq(s) === null));
  const t2 = theDat(8, [[0, 0.5, 0.6], [3, 1.5, 0.6]]), kqSong = kqGia(t2, []);
  kqSong.cuoi[5] = [1, 1];
  const kqMat = kqGia(t2, []); kqMat.cuoi[3] = null;
  ok('kết quả làm bi đã vào lỗ sống lại, hay bi biến mất mà không vào lỗ: không khớp thế bàn', !L.kqHopLe(t2, null, kqSong) && !L.kqHopLe(t2, null, kqMat) && L.kqHopLe(t2, null, kqGia(t2, [])));
  /* 300 cú ngẫu nhiên: không bi nào chồng lên nhau hay lọt ra ngoài bàn (bi treo ở miệng lỗ thì được) */
  const r = L.mulberry32(11);
  let loi = 0, n = 0;
  for (let van = 0; van < 25; van++) {
    let viTri = L.xepBi(van % 2 ? 9 : 8, van + 1);
    for (let k = 0; k < 12; k++) {
      if (!viTri[0]) viTri[0] = [0.5, 0.6];
      const g = r() * 6.2832, kq = L.danh(viTri, { dx: Math.cos(g), dy: Math.sin(g), v: k ? 0.3 + r() * 8 : 8.5, a: (r() - 0.5), b: (r() - 0.5) });
      n++;
      for (let i = 0; i < 16; i++) {
        const q = kq.cuoi[i];
        if (!q) continue;
        const trong = q[0] >= R - 1e-3 && q[0] <= DAI - R + 1e-3 && q[1] >= R - 1e-3 && q[1] <= RONG - R + 1e-3;
        const miengLo = L.LO.some(l => Math.hypot(q[0] - l.mx, q[1] - l.my) < l.rong / 2 + R);
        if (!trong && !miengLo) loi++;
        for (let j = i + 1; j < 16; j++) if (kq.cuoi[j] && Math.hypot(q[0] - kq.cuoi[j][0], q[1] - kq.cuoi[j][1]) < D - 0.0005) loi++;
      }
      viTri = kq.cuoi;
    }
  }
  ok(`${n} cú ngẫu nhiên: không bi nào lọt ra ngoài bàn hay chồng lên bi khác`, loi === 0, `${loi} chỗ hỏng`);
}

console.log('\n— Luật 8 bi —');
{
  const t = L.theMoi(8, 2, 5, 0), cu = { dx: 1, dy: 0, v: 8, a: 0, b: 0, cx: 0.5, cy: 0.6 };
  const v = L.viTriDanh(t, cu);
  const cai = L.apCu(t, cu, kqGia(Object.assign({}, t, { bi: v }), [[0, 2], [3, 1]], { dau: 3, soBang: 6 }));
  ok('phá rơi bi chủ: lỗi, người kế được đặt bi chủ ở đâu cũng được, bàn vẫn mở', cai.bao.loi === 'cai' && cai.the.luot === 1 && cai.the.tuDo === 1 && !cai.the.bi[0] && cai.the.nhom.every(g => g === 0));
  const yeu = L.apCu(t, cu, kqGia(Object.assign({}, t, { bi: v }), [], { dau: 3, soBang: 3, bang: true }));
  ok('phá không có bi vào mà dưới bốn bi chạm băng: lỗi phá', yeu.bao.loi === 'pha' && yeu.the.luot === 1 && yeu.the.tuDo === 1);
  const tam = L.apCu(t, cu, kqGia(Object.assign({}, t, { bi: v }), [[8, 0]], { dau: 3, soBang: 7 }));
  const b8 = tam.the.bi[8], ranh = tam.the.bi.every((q, s) => !q || s === 8 || Math.hypot(q[0] - b8[0], q[1] - b8[1]) >= D);
  ok('bi 8 vào lúc phá (không lỗi): đặt lại trên đường giữa bàn, ở chấm chân bàn hay lùi sau nó nếu bận, người phá đánh tiếp', tam.the.thang < 0 && tam.bao.datLai === 8 &&
    tam.the.luot === 0 && b8[1] === RONG / 2 && b8[0] >= L.CHAM_CHAN[0] && ranh);
  const trongCham = Object.assign(theDat(8, [[0, 0.5, 0.6], [3, 1.0, 0.3]]), { pha: true });
  const datCham = L.apCu(trongCham, null, kqGia(trongCham, [[8, 0]], { dau: 3, soBang: 6 }));
  ok('chấm chân bàn trống thì bi 8 về đúng chấm chân bàn', Math.hypot(datCham.the.bi[8][0] - L.CHAM_CHAN[0], datCham.the.bi[8][1] - L.CHAM_CHAN[1]) < 1e-9);
  const phaVao = L.apCu(t, cu, kqGia(Object.assign({}, t, { bi: v }), [[3, 1], [12, 4]], { dau: 3, soBang: 6 }));
  ok('phá vào bi: đánh tiếp, bàn vẫn mở (chưa ai nhận nhóm)', phaVao.the.luot === 0 && phaVao.the.nhom.every(g => g === 0) && !phaVao.bao.loi);
  /* bàn mở */
  const mo = theDat(8, [[0, 0.5, 0.6], [2, 1.0, 0.6], [11, 1.2, 0.3], [8, 2, 1]]);
  const nhan = L.apCu(mo, null, kqGia(mo, [[11, 2], [2, 3]], { dau: 2 }));
  ok('bàn mở, vào cả trơn lẫn sọc: nhận nhóm của bi vào trước (sọc), đối thủ nhận trơn, đánh tiếp', nhan.the.nhom[0] === 2 && nhan.the.nhom[1] === 1 && nhan.the.luot === 0 && nhan.bao.nhomMoi);
  ok('bàn mở mà chạm bi 8 trước: lỗi', L.apCu(mo, null, kqGia(mo, [], { dau: 8 })).bao.loi === 'dau8');
  const nhom = Object.assign(theDat(8, [[0, 0.5, 0.6], [2, 1.0, 0.6], [11, 1.2, 0.3], [8, 2, 1]]), { nhom: [1, 2] });
  ok('đã chia nhóm: chạm bi nhóm kia trước là lỗi; chạm xong không bi nào chạm băng, không vào bi: lỗi',
    L.apCu(nhom, null, kqGia(nhom, [], { dau: 11 })).bao.loi === 'sai' && L.apCu(nhom, null, kqGia(nhom, [], { dau: 2, bang: false })).bao.loi === 'bang');
  const vaoBan = L.apCu(nhom, null, kqGia(nhom, [[11, 0]], { dau: 2 }));
  ok('chỉ vào bi của đối thủ: mất lượt (không lỗi), bi đó vẫn tính cho đối thủ', !vaoBan.bao.loi && vaoBan.the.luot === 1 && !vaoBan.the.bi[11]);
  ok('vào bi nhóm mình: đánh tiếp', L.apCu(nhom, null, kqGia(nhom, [[2, 4]], { dau: 2 })).the.luot === 0);
  /* bi 8 */
  const het = Object.assign(theDat(8, [[0, 0.5, 0.6], [11, 1.2, 0.3], [8, 2, 1]]), { nhom: [1, 2] });
  ok('hết nhóm thì phải đánh bi 8: cú không chọn lỗ thì không hợp lệ', L.denBi8(het, 0) && !L.cuHopLe(het, { dx: 1, dy: 0, v: 1, a: 0, b: 0 }) && L.cuHopLe(het, { dx: 1, dy: 0, v: 1, a: 0, b: 0, lo: 3 }));
  const thang = L.apCu(het, { lo: 3 }, kqGia(het, [[8, 3]], { dau: 8 }));
  const saiLo = L.apCu(het, { lo: 2 }, kqGia(het, [[8, 3]], { dau: 8 }));
  const roiCai = L.apCu(het, { lo: 3 }, kqGia(het, [[8, 3], [0, 1]], { dau: 8 }));
  ok('bi 8 vào đúng lỗ đã chọn: thắng; sai lỗ: thua; vào cùng lúc bi chủ rơi: thua', thang.the.thang === 0 && thang.the.lyDo === '8dung' &&
    saiLo.the.thang === 1 && saiLo.the.lyDo === '8sai' && roiCai.the.thang === 1 && roiCai.the.lyDo === '8loi');
  const som = L.apCu(nhom, null, kqGia(nhom, [[2, 1], [8, 3]], { dau: 2 }));
  ok('bi 8 vào khi nhóm mình chưa hết (kể cả cú vào nốt bi cuối cùng của nhóm): thua', som.the.thang === 1 && som.the.lyDo === '8som');
  const roiThuong = L.apCu(het, { lo: 3 }, kqGia(het, [[0, 1]], { dau: 8 }));
  ok('đang đánh bi 8 mà rơi bi chủ (bi 8 không vào): chỉ là lỗi, chưa thua', roiThuong.the.thang < 0 && roiThuong.bao.loi === 'cai' && roiThuong.the.tuDo === 1);
}

console.log('\n— Luật 9 bi —');
{
  const t = Object.assign(theDat(9, [[0, 0.5, 0.6], [3, 1.0, 0.6], [5, 1.5, 0.3], [9, 2, 1]]), { so: 3, nhom: [0, 0, 0], loiLien: [0, 0, 0] });
  ok('phải chạm bi nhỏ nhất (bi 3) trước; chạm bi 5 trước là lỗi, người kế được đặt bi chủ', L.apCu(t, null, kqGia(t, [], { dau: 5 })).bao.loi === 'sai' &&
    L.apCu(t, null, kqGia(t, [], { dau: 5 })).the.luot === 1 && L.apCu(t, null, kqGia(t, [], { dau: 5 })).the.tuDo === 1);
  ok('vào bi nào (kể cả bi 5 do ăn ké) cũng được đánh tiếp', L.apCu(t, null, kqGia(t, [[5, 2]], { dau: 3 })).the.luot === 0);
  const ke = L.apCu(t, null, kqGia(t, [[9, 4]], { dau: 3 }));
  ok('ăn ké bi 9 trong cú đúng luật: thắng', ke.the.thang === 0 && ke.the.lyDo === '9dung');
  const loi9 = L.apCu(t, null, kqGia(t, [[9, 4]], { dau: 5 }));
  ok('bi 9 vào cùng cú lỗi: đặt lại ở chấm chân bàn, không ai thắng', loi9.the.thang < 0 && loi9.bao.datLai === 9 && !!loi9.the.bi[9]);
  const xoay = L.apCu(Object.assign({}, t, { luot: 2 }), null, kqGia(t, [], { dau: 3 }));
  ok('ba người đánh lần lượt: ghế 2 trượt thì về ghế 0', xoay.the.luot === 0);
  const t9 = L.theMoi(9, 4, 8, 3), cu = { dx: 1, dy: 0, v: 8, a: 0, b: 0, cx: 0.5, cy: 0.6 };
  const pha9 = L.apCu(t9, cu, kqGia(Object.assign({}, t9, { bi: L.viTriDanh(t9, cu) }), [[9, 2]], { dau: 1, soBang: 5 }));
  ok('bi 9 vào ngay cú phá (chạm bi 1 trước): thắng luôn', pha9.the.thang === 3 && pha9.the.lyDo === '9pha');
}

console.log('\n— Máy đánh —');
{
  /* cú thẳng dễ: bi đích cách lỗ góc 30 cm */
  const k = Math.SQRT1_2;
  let vao = 0;
  for (let i = 0; i < 10; i++) {
    const t = Object.assign(theDat(8, [[0, DAI - 0.75 * k - 0.4, RONG - 0.75 * k], [2, DAI - 0.3 * k, RONG - 0.3 * k], [8, 0.6, 0.3], [12, 0.4, 0.9]]), { nhom: [1, 2] });
    const cu = L.timCu(t, 0, 2, L.mulberry32(i + 1)), kq = L.danh(L.viTriDanh(t, cu), cu);
    if (kq.vao.some(v => v[0] === 2)) vao++;
  }
  ok('máy Khó đánh cú dễ (bi đích cách lỗ 30 cm): vào ít nhất 8/10 lần', vao >= 8, `${vao}/10`);
  const tu = Object.assign(theDat(8, [[3, 1.5, 0.6], [8, 2, 1], [12, 0.6, 0.3]]), { nhom: [1, 2], tuDo: 1 });
  const cu = L.timCu(tu, 0, 1, L.mulberry32(5));
  ok('được đặt bi chủ: máy đặt chỗ hợp lệ rồi mới đánh', cu.cx != null && L.datDuoc(tu, cu.cx, cu.cy) && L.cuHopLe(tu, L.docCu(L.maCu(cu))));
  const t8 = Object.assign(theDat(8, [[0, 1.0, 0.6], [8, 2.2, 1.0], [12, 0.6, 0.3]]), { nhom: [1, 2] });
  const c8 = L.timCu(t8, 0, 1, L.mulberry32(9));
  ok('tới bi 8: máy luôn chọn lỗ', c8.lo >= 0 && c8.lo <= 5);
  const choiHet = (kieu, so) => {
    let the = L.theMoi(kieu, so, 31, 0), k2 = 0, sai = 0;
    while (the.thang < 0 && k2++ < 160) {
      const c = L.docCu(L.maCu(L.timCu(the, the.luot, 1)));
      if (!L.cuHopLe(the, c)) { sai++; break; }
      the = L.apCu(the, c, L.danh(L.viTriDanh(the, c), c)).the;
    }
    return { the, k2, sai };
  };
  const a = choiHet(8, 2), b9 = choiHet(9, 3);
  ok('máy đấu máy hết một ván 8 bi và một ván 9 bi ba người: cú nào cũng hợp lệ, có người thắng', a.the.thang >= 0 && b9.the.thang >= 0 && !a.sai && !b9.sai,
    `8 bi ${a.k2} cú (${a.the.lyDo}), 9 bi ${b9.k2} cú (${b9.the.lyDo})`);
}

console.log('\n— Giao diện —');
{
  let loi = null;
  try { B.mo(); B._veCanh(0); B.dong(); B.mo(); } catch (e) { loi = e.message; }
  ok('mở, vẽ, đóng, mở lại không lỗi; lần đầu hiện cách chơi', loi === null && JSON.parse(luu['tdtd.bida']).h === 1, loi || '');
  B._vanMoi({ che: 'may', kieu: 8, kho: 1 });
  const van = B._van();
  ok('đấu với máy: bạn ghế 0 phá trước, được đặt bi chủ sau vạch đầu bàn, Sóc là máy', van.minh === 0 && van.the.luot === 0 && van.the.pha && van.the.tuDo === 2 && van.nguoi[1].may && van.nguoi[1].ten === 'Sóc');
  const ban = B._ban();
  ok('màn hình đứng thì bàn dựng dọc, đầu bàn (chỗ phá) ở dưới', ban.doc && B._raMH(0, RONG / 2)[1] > B._raMH(DAI, RONG / 2)[1]);
  let lech = 0;
  for (const [x, y] of [[0.3, 0.2], [2.2, 1.1], [1.27, 0.635]]) { const [X, Y] = B._raMH(x, y), [x2, y2] = B._vaoBan(X, Y); lech = Math.max(lech, Math.abs(x2 - x), Math.abs(y2 - y)); }
  ok('toạ độ bàn ↔ màn hình đổi qua đổi lại khớp nhau', lech < 1e-9);
  /* xoay phải vẫn là phải: phép đổi toạ độ là phép quay, không lật */
  const [ax, ay] = B._raMH(1, 0.6), [bx, by] = B._raMH(1.1, 0.6), [cx, cy] = B._raMH(1, 0.7);
  const cheo = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  ok('nhìn từ trên xuống không bị lật gương (xoáy phải trên màn hình vẫn là phải)', cheo < 0);
  const ev = (X, Y) => ({ clientX: X, clientY: Y, pointerId: 1 });
  const n = B._ngam(), c0 = B._viTriHien()[0], [X0, Y0] = B._raMH(c0[0], c0[1]);
  B._chamXuong(ev(X0, Y0)); B._chamKeo(ev(X0 - 30, Y0)); B._chamLen();
  ok('chạm vào bi chủ lúc được đặt thì kéo được bi chủ (chỉ trong vùng sau vạch)', Math.abs(n.cy - c0[1]) > 0.1 && n.cx <= L.KE_DAU);
  const dich = L.CHAM_CHAN, [Xd, Yd] = B._raMH(dich[0], dich[1]);
  B._chamXuong(ev(Xd + 40, Yd + 60)); B._chamKeo(ev(Xd, Yd)); B._chamLen();
  const huong = Math.atan2(dich[1] - n.cy, dich[0] - n.cx);
  ok('kéo ngón tay trên bàn: cơ chĩa tới chỗ ngón tay', Math.abs(n.goc - huong) < 1e-6);
  const v = ban, xLuc = 375 - 20, yLuc = v.y0 + 20;
  B._chamXuong(ev(xLuc, yLuc)); B._chamKeo(ev(xLuc, yLuc + 200)); const lucKeo = n.luc; B._chamKeo(ev(xLuc, yLuc - 50)); B._chamLen();
  ok('kéo thanh lực xuống thì lực tăng; kéo ngược lên hết rồi thả thì không đánh', lucKeo > 0.3 && !B._dang() && n.luc === 0);
  /* phòng qua mạng gọi lại denLuot mỗi lần máy chủ báo tin: không được đặt lại lực, hướng, chỗ bi chủ đang kéo dở */
  n.luc = 0.5; const gocCu = n.goc, choCu = [n.cx, n.cy];
  B._denLuot(); B._denLuot();
  ok('đang ngắm mà có tin mới (nhịp "còn ở đây" của người khác): lực, hướng, chỗ đặt bi chủ giữ nguyên', n.luc === 0.5 && n.goc === gocCu && n.cx === choCu[0] && n.cy === choCu[1]);
  n.luc = 0;
  B._chamXuong(ev(xLuc, yLuc)); B._chamKeo(ev(xLuc, yLuc + 400)); B._chamLen();
  ok('kéo thanh lực rồi thả: đánh, bi bắt đầu lăn', !!B._dang());
  B._tuaHet();
  ok('xong cú phá: áp luật, tới lượt người kế hay đánh tiếp', B._van().the.soCu >= 1 && !B._dang());
  for (let i = 0; i < 6 && B._van().the.thang < 0; i++) { B._tuaHet(); if (!B._laMinh(B._van().the.luot)) break; const nn = B._ngam(); nn.luc = 0.5; B._banCu(); B._tuaHet(); }
  ok('lời báo lượt luôn nói rõ ai đang đánh', /Lượt bạn|đang ngắm|đang đánh|đánh…|Hết ván|tua nhanh/.test(B._chuLuot()), B._chuLuot());
  /* bi 8: chọn lỗ bằng cách chạm vòng ở miệng lỗ */
  B._vanMoi({ che: 'may', kieu: 8, kho: 1 });
  const vv = B._van();
  vv.the = Object.assign(theDat(8, [[0, 1.0, 0.6], [8, 2.0, 0.9], [12, 0.6, 0.3]]), { nhom: [1, 2] });
  B._denLuot();
  const lo4 = L.LO[4], [Xl, Yl] = B._raMH(lo4.mx + lo4.ax * 0.02, lo4.my + lo4.ay * 0.02);
  B._chamXuong(ev(Xl, Yl)); B._chamLen();
  ok('tới bi 8: chạm vòng ở miệng lỗ là chọn lỗ đó', B._ngam().lo === 4 && B._ngam().loTay && /bi 8/.test(B._chuLuot()));
  /* chọn xoáy */
  B._datXoay(0.2, -0.35);
  ok('xoáy chọn được ghi vào cú đánh (a: lệch phải, b: cao thấp)', B._ngam().a === 0.2 && B._ngam().b === -0.35);
  B._vanMoi({ che: 'tap', kieu: 9 });
  ok('tập một mình: một ghế, không có máy, cú nào cũng của bạn', B._van().so === 1 && B._laMinh(0) && /Tập một mình/.test(B._chuLuot()));
  B._vanMoi({ che: 'may', kieu: 9, soMay: 3, kho: 0 });
  ok('9 bi với ba máy: bốn ghế, ba máy Sóc, Cú, Cáo', B._van().so === 4 && B._van().nguoi.slice(1).map(x => x.ten).join() === 'Sóc,Cú,Cáo');
  const ma = B._trichMa;
  ok('ô nhập mã nhận mã trần, link mời …/bida-lo/?phong=MÃ, link #bida/MÃ; mã sai khuôn thì không',
    ['ryxqqe', ' RYX-QQE ', 'https://thong-diep-thuong-de.vercel.app/bida-lo/?phong=RYXQQE', 'http://localhost:5179/#bida/RYXQQE'].every(x => ma(x) === 'RYXQQE') && ['ABCDE0', 'RYXQQ', ''].every(x => ma(x) === ''));
  const nguon = fs.readFileSync(path.join(goc, 'assets', 'bida.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok('không chữ nào nhắc Firebase hiện ra cho người chơi (chỉ có trong ghi chú)', !/firebase/i.test(nguon.replace(/TDTD_PHONG|sanhbida|bida\//g, '')));
  ok('chỉ lưu đúng một mục tdtd.bida: cài đặt và phòng đang ở, không lưu ván', Object.keys(luu).every(k => k === 'tdtd.bida') && !/"bi"|"the"/.test(luu['tdtd.bida']));
  B.dong();
}

console.log('\n— Bàn tặng anh Biển (bida-anh-bien/) —');
{
  /* Người dùng: "cho tôi 1 đường dẫn mới, ko tạo sao nha — bida-anh-bien, lấy hình trên làm background tặng anh Biển cho
     vui". Trang đặt self.TDTD_BIDA_CHU_DE rồi nạp bida.js; trang chính không đặt gì nên phải y như cũ. */
  const trang = fs.readFileSync(path.join(goc, 'bida-anh-bien', 'index.html'), 'utf8');
  const cauHinh = /self\.TDTD_BIDA_CHU_DE = (\{[\s\S]*?\n  \});/.exec(trang), dat = trang.indexOf('self.TDTD_BIDA_CHU_DE = ');
  const the_ = ['phong', 'maqr', 'bida'].map(t => trang.indexOf(`<script src="../assets/${t}.js"></script>`));
  ok('trang bida-anh-bien/ có thật, không cho máy tìm kiếm lập chỉ mục, đặt chủ đề trước rồi mới nạp phong.js, maqr.js, bida.js',
    !!cauHinh && /<meta name="robots" content="noindex, nofollow">/.test(trang) && dat > 0 && the_[0] > dat && the_[1] > the_[0] && the_[2] > the_[1]);
  /* Vercel trả trang ở cả …/bida-anh-bien lẫn …/bida-anh-bien/ (không chuyển): thiếu dấu / thì anh-bien.jpg đi lạc lên gốc */
  const thuChuyen = (p) => { let di = null; new Function('location', /<script>([\s\S]*?)<\/script>/.exec(trang)[1])({ pathname: p, search: '?phong=ABCDEF', hash: '', replace: (u) => { di = u; } }); return di; };
  ok('link thiếu dấu / (…/bida-anh-bien?phong=MÃ) thì chuyển sang …/bida-anh-bien/?phong=MÃ; đủ dấu / rồi thì thôi',
    thuChuyen('/bida-anh-bien') === '/bida-anh-bien/?phong=ABCDEF' && thuChuyen('/bida-anh-bien/') === null);
  ok('không thêm ngôi sao nào cho trang này (trang chính không có lối vào)', !/bida-anh-bien/.test(fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8')));
  const kichJpg = (f) => { const b = fs.readFileSync(f); for (let i = 2; i < b.length - 9;) { const m = b[i + 1], l = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5), b.length]; i += 2 + l; } return [0, 0, b.length]; };
  const og = kichJpg(path.join(goc, 'bida-anh-bien', 'og-1.jpg')), nen = kichJpg(path.join(goc, 'bida-anh-bien', 'anh-bien.jpg'));
  ok('ảnh xem trước 1200×630 dưới 300 KB, khớp thẻ og:image; ảnh nền có thật', og[0] === 1200 && og[1] === 630 && og[2] < 300000 &&
    trang.includes('content="https://thong-diep-thuong-de.vercel.app/bida-anh-bien/og-1.jpg"') && nen[0] > 0, og.join('×'));
  /* trang không có hàng nút của app (chừa 104 px bên phải) nên tự chừa chỗ tai thỏ khi xoay ngang */
  ok('đầu trang chừa chỗ tai thỏ hai bên khi xoay ngang', /\.bida \.bd-dau\{padding-right:calc\(env\(safe-area-inset-right,0px\) \+ 16px\);padding-left:calc\(env\(safe-area-inset-left,0px\) \+ 16px\)\}/.test(trang));
  const cd = global.TDTD_BIDA_CHU_DE = new Function(`return ${cauHinh[1]};`)();
  /* vạch ngắm trắng (rgba(255,255,255,.75)) phải nổi trên giữa mặt nỉ ít nhất 3:1 — mức WCAG cho hình cần thấy để chơi; nỉ xanh
     của trò gốc chừng 3,1:1. Xám sáng như bàn trong ảnh (#a3a9ae) chỉ được chừng 2:1 */
  const dSang = (c) => c.reduce((s, u, i) => { u /= 255; return s + [0.2126, 0.7152, 0.0722][i] * (u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4); }, 0);
  const tuongPhan = (hex) => { const n = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)), v = n.map(u => 0.75 * 255 + 0.25 * u); return (dSang(v) + 0.05) / (dSang(n) + 0.05); };
  ok('nỉ đủ đậm: vạch ngắm trắng nổi ít nhất 3:1 trên giữa mặt nỉ (xám sáng #a3a9ae thì không)', tuongPhan(cd.ni[0]) >= 3 && tuongPhan('#a3a9ae') < 3, tuongPhan(cd.ni[0]).toFixed(2) + ':1');

  /* mở trang lần đầu như anh Biển: một bản trò mới, máy chưa lưu gì */
  luu['tdtd.bida'] = '{}';
  const soNghe = (nghe.keydown || []).length;
  new Function(fs.readFileSync(path.join(goc, 'assets', 'bida.js'), 'utf8'))();
  const B = global.TDTD_BIDA;
  B.mo();
  const khung = document.body.children.filter(c => c.className === 'bida').pop(), tin = khung.querySelector('.bd-tin'), trongTin = tin.querySelector('.bd-tin-trong');
  const loiBao = () => khung.querySelector('.bd-bao').textContent, coCau = (chu, ds) => ds.some(c => chu.includes(c));
  const banPhim = (k) => nghe.keydown.slice(soNghe).forEach(f => f({ key: k, preventDefault() {} }));
  ok('mở lần đầu: món quà ra trước — bảng chào có ảnh anh Biển, chữ thay ảnh nói đúng ảnh; chưa hiện bảng Cách chơi',
    !tin.hidden && trongTin.innerHTML.includes('Quà tặng') && trongTin.innerHTML.includes(`alt="${cd.chuThayAnh}"`) && !trongTin.innerHTML.includes('Cách chơi') &&
    JSON.parse(luu['tdtd.bida']).h === undefined);
  B._vanMoi({ che: 'may', kieu: 9, soMay: 3, kho: 1 });
  ok('vào bàn lần đầu mới hiện Cách chơi (một lần), không kèm lời báo đè lên', !tin.hidden && trongTin.innerHTML.includes('Cách chơi') &&
    JSON.parse(luu['tdtd.bida']).h === 1 && khung.querySelector('.bd-bao').hidden);
  trongTin.scrollTop = 319;                                    // đọc tới cuối bảng Cách chơi dài
  B._moMan('chinh');
  ok('đóng Cách chơi rồi mở bảng Ván mới: bảng mới mở từ đầu (thấy ảnh, tiêu đề), không giữ chỗ cuộn cũ', trongTin.scrollTop === 0);
  B._vanMoi({ che: 'may', kieu: 9, soMay: 3, kho: 1 });
  const v = B._van();
  ok('vào bàn lần sau: không hiện lại Cách chơi, chỉ có lời báo ngắn', tin.hidden && /^Anh Biển phá trước/.test(loiBao()), loiBao().slice(0, 40));
  ok('chủ đề: người chơi là "Anh Biển", máy là Ghẹ, Cua, Mực; lượt ghi "Lượt anh Biển"', v.nguoi.map(x => x.ten).join() === 'Anh Biển,Ghẹ,Cua,Mực' && /^Lượt anh Biển/.test(B._chuLuot()), B._chuLuot());
  ok('link mời về chính trang tặng (…/bida-anh-bien/?phong=MÃ), không về trang bida chung', B._linkMoi('ABCDEF') === location.origin + location.pathname + '?phong=ABCDEF');
  banPhim('Escape');
  const conMo = khung.classList.contains('hien');
  B._moMan('chinh'); banPhim('Escape');
  ok('Esc không đóng trò (sau lưng là trang trống, không có nút quay lại); bảng đang mở thì Esc vẫn đóng bảng về bàn', conMo && khung.classList.contains('hien') && tin.hidden);
  B._baoKetQua({ P: 0, loi: 'cai', vao: [], tiep: false, ket: false }, 0);
  ok('anh Biển rơi bi chủ: lời báo lỗi kèm câu trêu "bi chủ đi tắm biển"', /^Lỗi: /.test(loiBao()) && coCau(loiBao(), cd.loi.tam), loiBao());
  for (const s of [1, 2, 3]) B._baoKetQua({ P: 0, loi: '', vao: [s], tiep: true, ket: false }, 0);
  ok('anh Biển vào liền ba cú: câu "sóng" riêng cho chuỗi', coCau(loiBao(), cd.loi.chuoi), loiBao());
  B._baoKetQua({ P: 1, loi: '', vao: [4], tiep: true, ket: false }, 1);
  ok('cú của máy (Ghẹ) không kèm câu trêu', loiBao() === 'Vào bi 4.', loiBao());
  /* thắng: pháo giấy trước, bảng hết ván sau — bắt hẹn giờ lại để khỏi chờ thật */
  const hen = [], henCu = global.setTimeout;
  global.setTimeout = (f, ms) => { hen.push({ f, ms }); return 0; };
  v.the.thang = 0; v.the.lyDo = '9dung'; v.hetVan = false;
  try { B._denLuot(); } finally { global.setTimeout = henCu; }
  const anTruoc = tin.hidden, cho = hen.some(h => h.ms >= 1500);
  hen.forEach(h => h.f());
  const bang = trongTin.innerHTML;
  ok('anh Biển thắng: pháo giấy rơi trên bàn, hơn giây sau mới hiện bảng "Anh Biển thắng!" kèm câu mừng',
    !!B._phao() && anTruoc && cho && !tin.hidden && bang.includes('Anh Biển thắng!') && coCau(bang, cd.loi.thang), bang.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 100));
  ok('dòng trạng thái lúc hết ván: "Hết ván — anh Biển thắng."', B._chuLuot() === 'Hết ván — anh Biển thắng.', B._chuLuot());
  /* máy đặt "giảm chuyển động": pháo giấy là hình động trang trí, bỏ; bảng hết ván hiện ngay */
  global.matchMedia = (q) => ({ matches: /prefers-reduced-motion: reduce/.test(q) });
  B._vanMoi({ che: 'may', kieu: 9, soMay: 3, kho: 1 });
  const p0 = B._phao(), v2 = B._van();
  v2.the.thang = 0; v2.the.lyDo = '9dung'; v2.hetVan = false;
  try { B._denLuot(); } finally { delete global.matchMedia; }
  ok('máy đặt "giảm chuyển động": không bắn pháo giấy, bảng "Anh Biển thắng!" hiện ngay', B._phao() === p0 && !tin.hidden && trongTin.innerHTML.includes('Anh Biển thắng!'));
  delete global.TDTD_BIDA_CHU_DE;
  B._vanMoi({ che: 'may', kieu: 8, kho: 1 });
  B._baoKetQua({ P: 0, loi: '', vao: [2], tiep: true, ket: false }, 0);
  ok('trang chính (không chủ đề): vẫn "Bạn" và Sóc, không câu trêu, link mời về bida-lo/',
    B._van().nguoi.map(x => x.ten).join() === 'Bạn,Sóc' && loiBao() === 'Vào bi 2.' && /\/bida-lo\/\?phong=ABCDEF$/.test(B._linkMoi('ABCDEF')), loiBao());
  banPhim('Escape');
  ok('trang chính: Esc vẫn đóng trò như cũ (về bầu trời sao)', !khung.classList.contains('hien'));
  B.dong();
}

console.log(`\n${pass} đạt, ${fail} hỏng`);
process.exit(fail ? 1 : 0);
