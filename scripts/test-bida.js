/* Kiểm thử Bida lỗ: node scripts/test-bida.js
   Số đo bàn, bi, lỗ theo WPA; vật lý (đối chiếu các điều người chơi bida đều biết: đánh đâm thì bi chủ đứng, quy tắc 90°
   và 30°, đánh kéo, đánh đẩy, trượt rồi lăn ở 5/7 tốc độ, lăn đi đúng v²/2μg, băng ăn bớt tốc độ, xoáy phải bật lệch
   phải, lỗ góc nhận bi lệch, lỗ giữa không nhận bi vào xiên quá); cú phá tung bàn; đơn định (cùng cú ra cùng kết quả từng
   bit, mã hoá rồi đọc lại y hệt — các máy chơi qua mạng dựa vào điều này); luật 8 bi, 9 bi; máy đánh; giao diện. */
'use strict';
const fs = require('fs');
const path = require('path');
const goc = path.join(__dirname, '..');

const chuVien = [];                                            // chữ vẽ có viền (số đứng thẳng trên bi)
const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'strokeText') return (s) => chuVien.push(String(s));
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

console.log('\n— Bi bay: nâng cơ, nhảy, văng khỏi bàn —');
{
  /* người dùng: "trong thực tế có đánh bi bay ra ngoài nữa, bạn mô phỏng cách đánh đó đc ko". Số đối chiếu: hồi bi–bàn 0,6, ma
     sát 0,2 (Dr. Dave TP B.10); luật WPA 2025: 2.6, 3.1, 3.5, 4.3g, 4.7, 4.8d, 5.6 */
  const sinD = (d) => Math.round(Math.sin(d * Math.PI / 180) * 1000) / 1000;
  const chay = (viTri, cu) => { const mp = L.moPhong(viTri, cu), cao = {}; let k = 0; while (!mp.xong && k++ < 40000) { L.buoc(mp); for (const b of mp.bi) if (b.tt >= 0) cao[b.so] = Math.max(cao[b.so] || 0, b.z); } return { mp, kq: L.ketQua(mp), cao }; };
  const motBi = (x, y) => { const v = rong(); v[0] = [x, y]; return v; };
  /* 1. cú nhảy: số đo khớp phép tính tay */
  const n30 = chay(motBi(0.4, RONG / 2), { dx: 1, dy: 0, v: 4, a: 0, b: 0, nang: sinD(30) });
  const cham1 = n30.mp.sk.find(e => e.k === 4 && e.a === 0), vz0 = 0.6 * 4 * 0.5, vh = 4 * Math.sqrt(1 - 0.25) - 0.2 * 1.6 * 2;
  ok('nâng cơ 30°, bi chủ 4 m/s: nảy cao (0,6·v·sinθ)²/2g ≈ 7,3 cm, chạm bàn lần đầu cách vₙ·2v_z/g ≈ 69 cm', Math.abs(n30.cao[0] - vz0 * vz0 / 19.62) < 0.003 &&
    Math.abs(cham1.x - 0.4 - vh * 2 * vz0 / 9.81) < 0.02, `${(n30.cao[0] * 100).toFixed(1)} cm, ${((cham1.x - 0.4) * 100).toFixed(0)} cm`);
  const ngang = L.danh(motBi(0.4, RONG / 2), { dx: 1, dy: 0, v: 4, a: 0, b: 0 });
  ok('cơ ngang: bi không rời mặt bàn; mã cú vẫn đúng tám trường, mã kết quả năm phần như bản cũ', !L.chayHet(L.moPhong(motBi(0.4, RONG / 2), { dx: 1, dy: 0, v: 4, a: 0, b: 0 })).sk.some(e => e.k >= 4) &&
    L.maCu({ dx: 1, dy: 0, v: 4, a: 0, b: 0 }).split(',').length === 8 && L.maKq(ngang).split(';').length === 5);
  /* 2. nhảy qua bi chắn */
  const chan = () => { const v = motBi(0.4, RONG / 2); v[3] = [0.7, RONG / 2]; v[5] = [1.2, RONG / 2]; return v; };
  ok('bi chắn cách 30 cm: cơ ngang thì đụng bi chắn; nâng 45° đánh 4 m/s thì bay qua, chạm bi đích phía sau', L.danh(chan(), { dx: 1, dy: 0, v: 4, a: 0, b: 0 }).dau === 3 &&
    L.danh(chan(), { dx: 1, dy: 0, v: 4, a: 0, b: 0, nang: sinD(45) }).dau === 5);
  /* 3. bi bay đập từ trên xuống: bi bị đập nảy lên */
  const x1 = L.chayHet(L.moPhong(motBi(0.4, RONG / 2), { dx: 1, dy: 0, v: 5, a: 0, b: 0, nang: sinD(35) })).sk.find(e => e.k === 4 && e.a === 0).x;
  const dap = (() => { const v = motBi(0.4, RONG / 2); v[2] = [x1 - 0.005, RONG / 2]; return chay(v, { dx: 1, dy: 0, v: 5, a: 0, b: 0, nang: sinD(35) }); })();
  ok('bi chủ bay rơi trúng đầu bi khác: bi bị ép xuống mặt đá rồi nảy lên', dap.kq.dau === 2 && dap.cao[2] > 0.01, `${(dap.cao[2] * 100).toFixed(1)} cm`);
  /* 4. tới băng khi đang bay */
  const cao = L.danh(motBi(DAI - 0.9, RONG / 2), { dx: 1, dy: 0, v: 6, a: 0, b: 0, nang: sinD(45) });
  const thap = L.danh(motBi(DAI - 0.4, RONG / 2), { dx: 1, dy: 0, v: 3, a: 0, b: 0, nang: sinD(10) });
  ok('bay tới băng cao hơn mũi băng: vượt thành bàn, bay khỏi bàn; nảy thấp tới băng: bật lại như thường', cao.ra.join() === '0' && !cao.cuoi[0] && !thap.ra.length && !!thap.cuoi[0]);
  let vang = null;
  for (const d of [25, 30]) for (const vv of [5, 6]) if (!vang) {
    const e = L.chayHet(L.moPhong(motBi(0.6, RONG / 2), { dx: 1, dy: 0, v: vv, a: 0, b: 0, nang: sinD(d) })).sk.find(x => x.k === 4 && x.a === 0);
    const v = motBi(0.6, RONG / 2); v[6] = [Math.min(e.x - 0.01, DAI - R - 0.03), RONG / 2];
    const kq = L.danh(v, { dx: 1, dy: 0, v: vv, a: 0, b: 0, nang: sinD(d) });
    if (kq.ra.includes(6)) vang = `${d}° ${vv} m/s`;
  }
  ok('bi mục tiêu sát băng bị bi chủ nhảy đè lên: nảy lên, tới băng khi đang bay, văng khỏi bàn', !!vang, vang || '');
  /* mép băng cao su lún, ăn lực: bi chủ nảy thấp lao vào băng không vọt cả mét (bản đầu hồi 0,9 như mặt băng: vọt 90 cm) */
  const vot = chay(motBi(0.4, RONG / 2), { dx: 1, dy: 0, v: 9, a: 0, b: 0, nang: sinD(10) });
  ok('phá mạnh nâng 10°: bi chủ nảy thấp tới băng, có vọt lên nhưng không quá 60 cm', vot.cao[0] < 0.6 && vot.cao[0] > 0.03, `${(vot.cao[0] * 100).toFixed(0)} cm`);
  /* 5. thành gỗ, lỗ */
  const trenGo = (vx, z, vz) => { const mp = L.moPhong(motBi(0.5, 0.3), { dx: 0, dy: 1, v: 0.3, a: 0, b: 0 }), b = mp.bi[0]; Object.assign(b, { x: DAI + 0.05, y: 0.6, z, vz, vx, vy: 0, tt: 3 }); return L.ketQua(L.chayHet(mp)); };
  const nayVao = trenGo(-0.9, 0.06, -0.4), lanVao = trenGo(-0.6, 0.0445, -0.05), lanRa = trenGo(0.5, 0.0445, -0.05);
  ok('rơi lên thành gỗ rồi nảy hay lăn vào lại bàn: vẫn trong cuộc (WPA 2.6); lăn ra phía ngoài: bay khỏi bàn',
    !!nayVao.cuoi[0] && !nayVao.ra.length && !!lanVao.cuoi[0] && !lanVao.ra.length && !lanRa.cuoi[0] && lanRa.ra.join() === '0');
  const loGoc = L.danh(motBi(DAI - 0.35, RONG - 0.35), { dx: 0.7071, dy: 0.7071, v: 3, a: 0, b: 0, nang: sinD(25) });
  ok('bay thấp ngang miệng lỗ: rơi vào lỗ', loGoc.vao.length === 1 && loGoc.vao[0][0] === 0 && loGoc.vao[0][1] === 3);
  /* 6. massé: cơ dựng 55°, đánh lệch trái — bi chạy cong sang trái */
  /* đo độ lệch ngang trước lần chạm băng đầu (sau đó xoáy trái làm bi bật lệch, cơ ngang cũng vậy) */
  const lech = (cu) => { const mp = L.moPhong(motBi(0.6, RONG / 2), cu); let k = 0, y = RONG / 2; while (!mp.xong && !mp.sk.some(e => e.k === 2) && k++ < 40000) { y = mp.bi[0].y; L.buoc(mp); } return y - RONG / 2; };
  const masse = lech({ dx: 1, dy: 0, v: 2.5, a: -0.4, b: 0, nang: sinD(55) }), thang = lech({ dx: 1, dy: 0, v: 2.5, a: -0.4, b: 0 });
  ok('massé: cơ dựng mà đánh lệch trái thì bi chạy cong sang trái; cơ ngang thì đi thẳng (tới lần chạm băng đầu)', masse > 0.1 && Math.abs(thang) < 1e-9, `${(masse * 100).toFixed(0)} cm`);
  /* 7. đơn định, mã hoá */
  const phaNang = { dx: 1, dy: 0.01, v: 9, a: 0, b: 0.2, nang: sinD(12) }, vt = L.theMoi(8, 2, 123, 0).bi;
  const kqA = L.danh(vt, phaNang), kqB = L.danh(vt, L.docCu(L.maCu(phaNang)));
  ok('cú nâng cơ đơn định từng bit; mã cú chín trường (nâng cơ phần nghìn), mã kết quả có thêm phần bi bay ra, đọc lại y hệt',
    L.maKq(kqA) === L.maKq(kqB) && L.maCu(phaNang).split(',')[8] === '208' && kqA.ra.length > 0 && L.maKq(L.docKq(L.maKq(kqA))) === L.maKq(kqA) && L.docKq(L.maKq(kqA)).ra.join() === kqA.ra.join());
  const goc = L.maCu({ dx: 1, dy: 0, v: 4, a: 0, b: 0 });
  ok('chặn mã sai khuôn: nâng 0 hay quá 60° (sin > 0,866); bi bay ra mà vẫn còn vị trí trên bàn', !L.docCu(goc + ',0') && !L.docCu(goc + ',867') && !!L.docCu(goc + ',866') &&
    !L.docKq(L.maKq(ngang) + ';0'));
  const t8 = theDat(8, [[0, 0.5, 0.6], [3, 1.0, 0.3], [8, 2, 1]]);
  const kqRa = (the, ra, them = {}) => { const k = kqGia(the, [], them); k.ra = ra; for (const x of ra) k.cuoi[x] = null; return k; };
  const mat = Object.assign(kqGia(t8, [], { dau: 3 }), { ra: [] }); mat.cuoi[3] = null;
  ok('kết quả từ máy khác: bi biến mất mà không vào lỗ cũng không bay ra thì không nhận; bay ra thì nhận', !L.kqHopLe(t8, null, mat) && L.kqHopLe(t8, null, kqRa(t8, [3], { dau: 3 })));
  /* 8. luật WPA */
  const ra3 = L.apCu(t8, null, kqRa(t8, [3], { dau: 3 }));
  ok('8 bi: đánh bi 3 bay khỏi bàn — lỗi, bi 3 ra khỏi cuộc (không đặt lại), người kế đặt bi chủ', ra3.bao.loi === 'ra' && !ra3.the.bi[3] && ra3.the.luot === 1 && ra3.the.tuDo === 1 && ra3.bao.ra.join() === '3');
  const ra8 = L.apCu(t8, null, kqRa(t8, [8], { dau: 3 }));
  ok('8 bi: bi 8 bay khỏi bàn (không phải lúc phá) — thua ván (WPA 4.8d)', ra8.the.thang === 1 && ra8.the.lyDo === '8ra');
  const t8p = Object.assign(theDat(8, [[0, 0.5, 0.6], [3, 1.0, 0.3], [8, 2, 1]]), { pha: true });
  const pha8 = L.apCu(t8p, null, kqRa(t8p, [8], { dau: 3, soBang: 6 }));
  ok('8 bi: bi 8 bay ra lúc phá — lỗi, đặt lại bi 8 ở chấm chân bàn (WPA 4.3g)', pha8.the.thang < 0 && pha8.bao.loi === 'ra' && pha8.bao.datLai === 8 && pha8.bao.datLaiRa && !!pha8.the.bi[8]);
  const t9 = theDat(9, [[0, 0.5, 0.6], [1, 1.0, 0.3], [9, 2, 1]], { so: 2 });
  const ra9 = L.apCu(t9, null, kqRa(t9, [9], { dau: 1 }));
  ok('9 bi: bi 9 bay khỏi bàn — lỗi, đặt lại bi 9 (WPA 5.6), chưa ai thắng', ra9.the.thang < 0 && ra9.bao.loi === 'ra' && ra9.bao.datLai === 9 && !!ra9.the.bi[9] && ra9.the.luot === 1);
  const caiRa = L.apCu(t8, null, kqRa(t8, [0], { dau: 3 }));
  ok('bi chủ bay khỏi bàn — lỗi, người kế được đặt bi chủ ở đâu cũng được (WPA 3.1)', caiRa.bao.loi === 'caiRa' && !caiRa.the.bi[0] && caiRa.the.tuDo === 1 && caiRa.the.luot === 1);
}

console.log('\n— Bida bài —');
{
  /* người dùng: "cho chế độ chơi bài nữa" */
  const t = L.theMoi(52, 3, 77, 0, 5), t2 = L.theMoi(52, 3, 77, 0, 5), ca = [].concat(...t.bai, t.noc);
  ok('chia bài: bộ 52 lá đủ, không trùng; mỗi người 5 lá, còn 37 lá làm nọc; cùng hạt giống chia y hệt; 15 bi trên bàn',
    ca.length === 52 && new Set(ca).size === 52 && t.bai.every(b => b.length === 5) && t.noc.length === 37 && JSON.stringify(t.bai) === JSON.stringify(t2.bai) &&
    t.bi.filter((q, k) => k && q).length === 15);
  ok('chia 3 hay 7 lá theo chọn', L.theMoi(52, 2, 5, 0, 3).bai.every(b => b.length === 3) && L.theMoi(52, 4, 5, 0, 7).bai.every(b => b.length === 7));
  /* thế tự dựng: bài cố định */
  const dung = (bai, them = {}) => { const th = L.theMoi(52, bai.length, 9, 0, 5); th.bai = bai.map(b => b.slice()); th.pha = false; th.tuDo = 0; return Object.assign(th, them); };
  const la = (so, chat = 0) => chat * 13 + so - 1;               // lá số so, chất chat
  const th = dung([[la(3), la(7), la(11, 2)], [la(7, 1), la(5)], [la(9), la(12)]]);
  ok('chạm bi nào trước cũng được; bi nên đánh của người 1 là bi trùng lá (3, 7, 11) cùng bi mồi 14, 15', L.biDich(th, 0).length === 15 && L.biNen(th, 0).join() === '3,7,11,14,15');
  const vao7 = L.apCu(th, null, kqGia(th, [[7, 2]], { dau: 7 }));
  ok('vào bi 7: mình hạ lá 7, người 2 cũng cầm lá 7 thì hạ luôn; mình đánh tiếp', !vao7.bao.loi && vao7.bao.tiep && vao7.the.luot === 0 &&
    vao7.the.bai[0].length === 2 && vao7.the.bai[1].length === 1 && vao7.bao.ha.length === 2);
  const vao5 = L.apCu(th, null, kqGia(th, [[5, 1]], { dau: 5 }));
  ok('chỉ vào bi 5 của người 2: người 2 hạ lá 5, mình mất lượt (không phạt)', !vao5.bao.loi && !vao5.bao.tiep && vao5.the.luot === 1 && vao5.the.bai[1].length === 1 && vao5.bao.phat < 0);
  const moi = L.apCu(th, null, kqGia(th, [[14, 0]], { dau: 14 }));
  ok('vào bi mồi 14: không ai hạ lá, mình đánh tiếp', moi.bao.tiep && moi.the.luot === 0 && moi.the.bai.every((b, Q) => b.length === th.bai[Q].length));
  const loi = L.apCu(th, null, kqGia(th, [[7, 2], [0, 3]], { dau: 7 }));
  ok('lỗi (bi chủ rơi lỗ cùng bi 7): bi 7 đặt lại, không ai hạ lá, mình rút thêm một lá phạt, người kế đặt bi chủ', loi.bao.loi === 'cai' && !!loi.the.bi[7] &&
    loi.the.bai[0].length === 4 && loi.the.bai[1].length === 2 && loi.bao.phat >= 0 && loi.the.luot === 1 && loi.the.tuDo === 1);
  const chet = dung([[la(3)], [la(5)]]); chet.bi[2] = null; chet.bi[4] = null; chet.noc = [la(2, 1), la(4, 3), la(6, 2), la(8)];
  const rut = L.apCu(chet, null, kqGia(chet, [], { dau: -1 }));
  ok('lá phạt chỉ rút lá mà bi còn trên bàn (lá 2, 4 của bi đã xuống lỗ thì bỏ)', rut.bao.loi === 'khong' && L.soLa(rut.bao.phat) === 6 && rut.the.noc.length === 1);
  const het = dung([[la(3)], [la(5), la(3, 1)], [la(9)]]);
  const thang = L.apCu(het, null, kqGia(het, [[3, 0]], { dau: 3 }));
  ok('hạ lá cuối cùng: thắng ngay ("hạ hết bài")', thang.the.thang === 0 && thang.the.lyDo === 'baiHet');
  const giup = dung([[la(3), la(4)], [la(5)], [la(9)]]);
  const ke = L.apCu(giup, null, kqGia(giup, [[5, 0]], { dau: 5 }));
  ok('vào bi giúp người khác hạ lá cuối: người đó thắng', ke.the.thang === 1 && ke.the.lyDo === 'baiKe');
  /* máy: bi dễ vào ngang nhau thì đánh bi của mình, không giúp người khác */
  const may = dung([[la(3)], [la(5)]]);
  may.bi = new Array(16).fill(null); may.bi[0] = [1.27, 0.5]; may.bi[3] = [0.6, 0.25]; may.bi[5] = [1.94, 0.25]; may.bi[14] = [1.27, 1.1];
  const cuMay = L.timCu(may, 0, 2, L.mulberry32(3)), kqMay = L.danh(L.viTriDanh(may, cuMay), cuMay);
  ok('máy chơi bida bài: chọn đánh bi trùng lá của nó (3), không vào bi 5 giúp người kia', kqMay.dau === 3 && !kqMay.vao.some(v => v[0] === 5), `chạm ${kqMay.dau}, vào ${kqMay.vao.map(v => v[0])}`);
  let tm = L.theMoi(52, 3, 31, 0, 3), k2 = 0, sai = 0;
  while (tm.thang < 0 && k2++ < 200) { const c = L.docCu(L.maCu(L.timCu(tm, tm.luot, 1))); if (!L.cuHopLe(tm, c)) { sai++; break; } tm = L.apCu(tm, c, L.danh(L.viTriDanh(tm, c), c)).the; }
  ok('ba máy đấu nhau hết một ván bida bài 3 lá: cú nào cũng hợp lệ, có người hạ hết bài', tm.thang >= 0 && !sai && /^bai/.test(tm.lyDo), `${k2} cú (${tm.lyDo})`);
}

console.log('\n— Bida 3 bi (bida phăng) —');
{
  /* người dùng: "chế độ chơi bida 3 bi nữa". Quy cách UMB: bàn 2,84 × 1,42 m, bi 61,5 mm, mũi băng 37 mm; khai cuộc (USBA theo chấm
     UMB): bi đỏ ở chấm chân bàn, bi đối thủ ở chấm đầu bàn, bi người khai cuộc cách chấm đó 18,25 cm, phải chạm bi đỏ trước */
  const P3 = B.L3;
  ok('bàn phăng: 2,84 × 1,42 m, bi 61,5 mm, không lỗ, bốn băng liền', P3.PHANG && P3.DAI === 2.84 && P3.RONG === 1.42 && Math.abs(P3.D - 0.0615) < 1e-12 && P3.LO.length === 0 && P3.BANG.length === 4);
  const t = P3.theMoi(3, 2, 1, 0, { luat: 3, dich: 5 });
  ok('khai cuộc: bi đỏ ở chấm chân bàn, bi vàng (đối thủ) ở chấm đầu bàn, bi trắng cách đó 18,25 cm; 3 băng, chơi tới 5',
    t.bi[2][0] === P3.CHAM_CHAN[0] && t.bi[1][0] === P3.KE_DAU && t.bi[1][1] === P3.RONG / 2 && Math.abs(t.bi[0][1] - (P3.RONG / 2 - 0.1825)) < 1e-9 && t.luat === 3 && t.dich === 5 && !t.bi[3]);
  const t2 = P3.theMoi(3, 2, 1, 1, {});
  ok('ghế 2 khai cuộc thì bi vàng ở chỗ khai cuộc, bi trắng ở chấm đầu bàn; mặc định tự do, tới 10 điểm', t2.bi[1][1] < t2.bi[0][1] && t2.bi[0][1] === P3.RONG / 2 && t2.luat === 0 && t2.dich === 10);
  /* luật, với kết quả dựng tay */
  const kq3 = (the, them) => Object.assign({ dau: 2, bang: false, soBang: 0, vao: [], ra: [], cuoi: the.bi.map(q => (q ? [q[0], q[1]] : null)), hai: true, bangHai: 0 }, them);
  const tt = (luat, them = {}) => Object.assign(P3.theMoi(3, 2, 1, 0, { luat, dich: 5 }), { pha: false }, them);
  const a = P3.apCu(tt(0), {}, kq3(tt(0), {}));
  ok('tự do: bi chủ chạm cả hai bi là ăn điểm, đánh tiếp', a.bao.diem && a.the.diem[0] === 1 && a.the.luot === 0);
  const b0 = P3.apCu(tt(1), {}, kq3(tt(1), { bangHai: 0 })), b1 = P3.apCu(tt(1), {}, kq3(tt(1), { bangHai: 1 }));
  ok('1 băng: chưa chạm băng trước bi thứ hai thì không ăn (mất lượt); chạm một băng thì ăn', !b0.bao.diem && b0.the.luot === 1 && b1.bao.diem && b1.the.luot === 0);
  const c2 = P3.apCu(tt(3), {}, kq3(tt(3), { bangHai: 2 })), c3 = P3.apCu(tt(3), {}, kq3(tt(3), { bangHai: 3 }));
  ok('3 băng: hai băng chưa ăn; ba băng mới ăn', !c2.bao.diem && c3.bao.diem);
  const truot = P3.apCu(tt(0), {}, kq3(tt(0), { hai: false, bangHai: -1 }));
  ok('chỉ chạm một bi: trượt, mất lượt', !truot.bao.diem && !truot.bao.loi && truot.the.luot === 1);
  const pha = P3.apCu(Object.assign(tt(0), { pha: true }), {}, kq3(tt(0), { dau: 1 }));
  ok('khai cuộc chạm bi vàng trước: lỗi, không tính điểm, mất lượt', pha.bao.loi === 'do' && !pha.bao.diem && pha.the.luot === 1);
  const raDo = (() => { const th = tt(0), k = kq3(th, { hai: false, ra: [2] }); k.cuoi[2] = null; return P3.apCu(th, {}, k); })();
  ok('bi đỏ bay khỏi bàn: lỗi, mất lượt, đặt lại bi đỏ ở chấm chân bàn', raDo.bao.loi === 'ra' && raDo.the.luot === 1 && raDo.the.bi[2][0] === P3.CHAM_CHAN[0]);
  const gan = P3.apCu(tt(0, { diem: [4, 2] }), {}, kq3(tt(0), {}));
  ok('đủ điểm (5) thì thắng', gan.the.thang === 0 && gan.the.lyDo === 'du');
  /* vật lý: một cú thật chạm bi đỏ rồi bi vàng */
  /* quét 360 hướng ở cùng một thế: đánh bằng bi trắng, rồi đổi chỗ trắng–vàng và đánh bằng bi vàng — phải ra y như nhau */
  const quet = (ca) => { const vt = new Array(16).fill(null), kia = 1 - ca; vt[ca] = [0.9, 0.5]; vt[2] = [1.5, 0.6]; vt[kia] = [1.62, 0.75]; let n = 0, mot = null;
    for (let k = 0; k < 360; k++) { const g = k * Math.PI / 180, kq = P3.danh(vt, { dx: Math.cos(g), dy: Math.sin(g), v: 2.4, a: 0, b: 0.2, ca }); if (kq.hai) { n++; if (!mot) mot = kq; } } return { n, mot }; };
  const qTrang = quet(0), qVang = quet(1);
  ok('cú thật: quét 360 hướng có cú bi chủ chạm đủ hai bi (đỏ trước rồi bi kia, hay ngược lại); đánh bằng bi vàng ở thế đổi chỗ ra đúng y như vậy',
    qTrang.n > 0 && qTrang.n === qVang.n && [1, 2].includes(qTrang.mot.dau) && qTrang.mot.bangHai >= 0, `${qTrang.n} hướng`);
  /* mã hoá: bi vàng đánh thẳng vào bi trắng — chạm đầu là bi 0 (bàn lỗ thì bi 0 là chính bi chủ, không thể có). Trước đây máy
     nhận đọc hỏng cú này rồi bỏ qua, hai máy lệch nhau cả ván */
  const vtV = new Array(16).fill(null); vtV[1] = [0.9, 0.5]; vtV[0] = [1.5, 0.5]; vtV[2] = [1.6, 1.1];
  const kqV = P3.danh(vtV, { dx: 1, dy: 0, v: 2, a: 0, b: 0, ca: 1 }), chuV = P3.maKq(kqV);
  ok('bida 3 bi: cú bi vàng chạm bi trắng trước mã hoá rồi đọc lại y hệt (đủ bảy phần); bàn lỗ thì chạm đầu bi 0 vẫn không nhận',
    kqV.dau === 0 && chuV.split(';').length === 7 && !!P3.docKq(chuV) && P3.docKq(chuV).dau === 0 && P3.maKq(P3.docKq(chuV)) === chuV && L.docKq(L.maKq(L.danh(L.viTriDanh(L.theMoi(8, 2, 1, 0), { dx: 1, dy: 0, v: 3, a: 0, b: 0, cx: 0.5, cy: 0.635 }), { dx: 1, dy: 0, v: 3, a: 0, b: 0, cx: 0.5, cy: 0.635 })).replace(/^\d+;/, '0;')) === null, chuV);
  /* máy: thế dễ thì tìm được cú ăn điểm */
  const de = Object.assign(P3.theMoi(3, 2, 3, 0, { luat: 0, dich: 5 }), { pha: false });
  de.bi[0] = [0.9, 0.5]; de.bi[2] = [1.5, 0.6]; de.bi[1] = [1.62, 0.75];
  const t0 = Date.now(), cuMay = P3.timCu(de, 0, 1, P3.mulberry32(5)), kqMay = P3.danh(P3.viTriDanh(de, cuMay), cuMay);
  ok('máy bida 3 bi (Vừa): thế dễ thì đánh được cú chạm đủ hai bi, nghĩ trong vài giây', kqMay.hai && Date.now() - t0 < 15000, `${Date.now() - t0} ms`);
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
  const nguon = fs.readFileSync(path.join(goc, 'assets', 'bida.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  ok('không chữ nào nhắc Firebase hiện ra cho người chơi (chỉ có trong ghi chú)', !/firebase/i.test(nguon.replace(/TDTD_PHONG|sanhbida|bida\//g, '')));
  /* người dùng: "những lúc ko thấy số, ko biết bi số mấy luôn" */
  B._vanMoi({ che: 'may', kieu: 9, soMay: 1, kho: 1 });
  chuVien.length = 0; B._veCanh(0);
  const soYen = chuVien.slice().sort((a, b) => a - b).join();
  const vs = B._van(), ns = B._ngam(), cs = B._viTriHien()[0], ms = vs.the.bi[1];
  ns.goc = Math.atan2(ms[1] - cs[1], ms[0] - cs[0]); ns.luc = 0.8; B._banCu();
  chuVien.length = 0; const dangLan = !!B._dang(); B._veCanh(0);
  const soLan = chuVien.length;
  B._tuaHet();
  /* nâng cơ trong bảng Xoáy */
  B._vanMoi({ che: 'tap', kieu: 8 });
  B._datNang(35);
  const nn = B._ngam(); nn.luc = 0.5; nn.duKhoa = ''; B._capNhatDuDoan();
  const du = nn.du, coDuong = !!(du && du.duong && du.duong.length > 10 && du.chamBan && du.chamBan.length >= 1);
  B._datNang(99); const kep = B._ngam().nang;
  B._datNang(35); nn.luc = 0.4; B._banCu();
  const cuBay = B._dang() && B._dang().cu;
  B._tuaHet();
  ok('nâng cơ 35°: đường ngắm vẽ đường bay và chỗ bi chạm bàn; tối đa 60°; cú đánh mang sin 35° (phần nghìn); lượt sau cơ về nằm ngang',
    coDuong && kep === 60 && !!cuBay && cuBay.nang === 0.574 && B._ngam().nang === 0, `${coDuong} ${kep} ${cuBay && cuBay.nang} ${B._ngam().nang}`);
  ok('bi đứng yên: số đứng thẳng trên từng bi (cả chín bi, không vẽ cho bi chủ); bi đang lăn thì thôi', soYen === '1,2,3,4,5,6,7,8,9' && dangLan && soLan === 0, soYen);
  ok('chỉ lưu đúng một mục tdtd.bida: cài đặt và phòng đang ở, không lưu ván', Object.keys(luu).every(k => k === 'tdtd.bida') && !/"bi"|"the"/.test(luu['tdtd.bida']));
  B.dong();
}

console.log('\n— Chơi chung một máy (2–4 người chuyền tay) —');
{
  /* người dùng: "cho chơi 3,4 người 1 bàn nữa" */
  const bamNut = (sel) => B._bam({ target: { closest: (s) => (s === sel ? {} : null) } });
  const tinTrong = () => document.body.children.filter(c => c.className === 'bida').pop().querySelector('.bd-tin').querySelector('.bd-tin-trong').innerHTML;
  const baoChu = () => document.body.children.filter(c => c.className === 'bida').pop().querySelector('.bd-bao').textContent;
  B._vanMoi({ che: 'chung', kieu: 9, so: 4, ten: ['An', 'Bình', '', 'Dũng'] });
  const v = B._van();
  ok('9 bi bốn người chung một máy: đủ bốn ghế, tên đã gõ (để trống thì "Người 3"), không ghế nào là máy, ai cũng đánh được trên máy này',
    v.cheDo === 'chung' && v.nguoi.map(x => x.ten).join() === 'An,Bình,Người 3,Dũng' && [0, 1, 2, 3].every(P => B._laMinh(P)) && !B._mayNgam());
  ok('dòng trạng thái gọi đúng tên người đang đánh', /^Lượt An · phá/.test(B._chuLuot()), B._chuLuot());
  v.the.luot = 1;
  B._baoKetQua({ P: 0, loi: '', vao: [], tiep: false, ket: false }, 0);
  const baoTrot = baoChu();
  v.the.luot = 2;
  B._baoKetQua({ P: 1, loi: 'cai', vao: [], tiep: false, ket: false }, 1);
  ok('hết lượt thì gọi người kế cầm máy ("Tới lượt Bình."); phạm lỗi thì gọi tên người được đặt bi chủ', baoTrot === 'Tới lượt Bình.' && /Người 3 được đặt bi chủ\.$/.test(baoChu()), baoChu());
  v.the.thang = 3; v.the.lyDo = '9dung';
  ok('hết ván: "Hết ván — Dũng thắng.", bảng hết ván ghi "Dũng thắng!"', B._chuLuot() === 'Hết ván — Dũng thắng.' && (B._ketThucVan(), /Dũng thắng!/.test(tinTrong())), B._chuLuot());
  bamNut('.bd-lai');
  const v2 = B._van();
  ok('"Ván mới, như cũ": giữ bốn người với tên, người kế phá (Bình)', v2 !== v && v2.cheDo === 'chung' && v2.nguoi.map(x => x.ten).join() === 'An,Bình,Người 3,Dũng' && /^Lượt Bình/.test(B._chuLuot()), B._chuLuot());
  B._vanMoi({ che: 'chung', kieu: 8, so: 4, ten: ['An', 'Bình'] });
  ok('8 bi chung một máy: luôn hai người', B._van().so === 2 && B._van().nguoi.map(x => x.ten).join() === 'An,Bình');
  luu['tdtd.bida'] = JSON.stringify(Object.assign(JSON.parse(luu['tdtd.bida'] || '{}'), { kieu: 9, soChung: 4, tenChung: ['Lan', 'Minh'] }));
  B._moMan('chinh');
  const coLoi = tinTrong().includes('Chơi chung một máy');
  B._moMan('chung');
  const o = (tinTrong().match(/data-tenchung="\d"/g) || []).length;
  ok('bảng Ván mới có lối "Chơi chung một máy"; màn đó nhớ số người, tên đã gõ (ô trống gợi "Người 3")', coLoi && o === 4 && /value="Lan"/.test(tinTrong()) && /placeholder="Người 3"/.test(tinTrong()) && /Bắt đầu — Lan phá trước/.test(tinTrong()));
  bamNut('.bd-batdau-chung');
  ok('bấm Bắt đầu: vào ván 9 bi bốn người với tên đã nhớ', B._van().cheDo === 'chung' && B._van().nguoi.map(x => x.ten).join() === 'Lan,Minh,Người 3,Người 4');
  B.dong();
}

console.log('\n— Bida 3 bi trên màn hình —');
{
  B._vanMoi({ che: 'may', kieu: 3, kho: 1, luat: 3, dich: 5 });
  const v = B._van();
  ok('đấu máy 3 bi: đổi sang lõi bàn phăng, hai người, dòng trạng thái ghi bi trắng 0/5, chạm bi đỏ trước', B._L().PHANG && v.so === 2 && /bi trắng · 0\/5 · chạm bi đỏ trước/.test(B._chuLuot()), B._chuLuot());
  B._vanMoi({ che: 'may', kieu: 8, kho: 1 });
  ok('vào lại 8 bi: về lõi bàn lỗ', !B._L().PHANG && B._van().the.bi.filter((q, k) => k && q).length === 15);
  B._vanMoi({ che: 'chung', kieu: 3, ten: ['An', 'Bình'], luat: 0, dich: 5 });
  const vc = B._van();
  vc.the.pha = false; vc.the.luot = 1; B._denLuot();
  const n = B._ngam(); n.luc = 0.4; B._banCu();
  ok('chơi chung 3 bi: tới lượt người thứ hai thì bi chủ là bi vàng (cú đánh mang bi 1)', B._caHien() === 1 && !!B._dang() && B._dang().cu.ca === 1);
  B._tuaHet();
  B._vanMoi({ che: 'may', kieu: 8, kho: 1 });
}

console.log('\n— Bida bài trên màn hình —');
{
  const khung = document.body.children.filter(c => c.className === 'bida').pop(), bai = khung.querySelector('.bd-bai');
  const bamNut = (sel) => B._bam({ target: { closest: (x) => (x === sel ? {} : null) } });
  B._vanMoi({ che: 'may', kieu: 52, soMay: 2, kho: 1, la: 3 });
  const v = B._van();
  ok('đấu với hai máy, 3 lá: ba người, dải bài hiện 3 lá của mình, dòng trạng thái "còn 3 lá", thẻ máy ghi số lá', v.so === 3 && v.the.bai[0].length === 3 && !bai.hidden &&
    (bai.innerHTML.match(/class="bd-la/g) || []).length === 3 && /còn 3 lá/.test(B._chuLuot()) && /3 lá/.test(khung.querySelector('.bd-nguoi').innerHTML), B._chuLuot());
  const s0 = L.soLa(v.the.bai[0][0]);
  v.the.luot = 0;
  B._baoKetQua({ P: 0, loi: '', vao: [s0], tiep: true, ket: false, ha: [[0, s0, 1]], phat: -1, datLaiDs: [] }, 0);
  ok('lời báo khi hạ lá: "Bạn hạ lá …"', new RegExp(`^Vào bi ${s0}\\. Bạn hạ lá`).test(khung.querySelector('.bd-bao').textContent), khung.querySelector('.bd-bao').textContent);
  bamNut('.bd-lai');
  ok('"Ván mới, như cũ": vẫn bida bài 3 lá', B._van().kieu === 52 && B._van().the.bai.every(b => b.length === 3));
  B._vanMoi({ che: 'chung', kieu: 52, so: 3, ten: ['An', 'Bình', 'Chi'], la: 5 });
  const up = bai.innerHTML;
  bamNut('.bd-xem-bai');
  const lat = bai.innerHTML;
  const vc = B._van(); vc.the.luot = 1; B._denLuot();
  ok('chơi chung một máy: bài người đang đánh úp, chạm mới lật; sang lượt người kế thì úp lại', /An: chạm để xem bài \(5 lá\)/.test(up) && (lat.match(/class="bd-la/g) || []).length === 5 &&
    /Bình: chạm để xem bài/.test(bai.innerHTML));
  luu['tdtd.bida'] = JSON.stringify(Object.assign(JSON.parse(luu['tdtd.bida'] || '{}'), { kieu: 52 }));
  const tin = () => khung.querySelector('.bd-tin').querySelector('.bd-tin-trong').innerHTML;
  B._moMan('may'); const may = tin(); B._moMan('chung'); const chungM = tin(); B._moMan('tap'); const tap = tin(); B._moMan('chinh'); const chinh = tin();
  ok('bảng chọn: "Bida bài" có ở đấu với máy, chơi chung; không có ở tập một mình', /data-kieu="52"/.test(may) && /data-sola="5"/.test(may) &&
    /data-kieu="52"/.test(chungM) && !/data-kieu="52"/.test(tap));
  /* người dùng: "bỏ chức năng tạo phòng đi, vì tôi muốn giới hạn 16 bàn này thôi" */
  ok('bảng Ván mới: chơi qua mạng chỉ còn Vào quán bida — không còn tạo phòng, vào bằng mã, tìm phòng nhanh, xem phòng đang chờ',
    /data-man="quan"/.test(chinh) && !/data-man="(tao|vao|nhanh|tim)"/.test(chinh) && !/Tạo phòng|Vào phòng|Tìm phòng|phòng đang chờ/.test(chinh));
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
  ok('trang chính (không chủ đề): vẫn "Bạn" và Sóc, không câu trêu',
    B._van().nguoi.map(x => x.ten).join() === 'Bạn,Sóc' && loiBao() === 'Vào bi 2.', loiBao());
  banPhim('Escape');
  ok('trang chính: Esc vẫn đóng trò như cũ (về bầu trời sao)', !khung.classList.contains('hien'));
  B.dong();
}

console.log(`\n${pass} đạt, ${fail} hỏng`);
process.exit(fail ? 1 : 0);
