/* Kiểm thử Hiệu ứng toàn cảnh: node scripts/test-toancanh.js
   Quỹ đạo đúng số liệu trạm vũ trụ và đi ngang chỗ bạn, khí quyển sáng đúng chỗ, ngày đêm đúng phía, hành trình liền
   mạch từ 30 km tới 6 tỉ km, và nút mở nằm trong phần Nhìn từ vũ trụ của Trời đêm. */
const fs = require('fs');
const path = require('path');
global.self = global; global.window = global;
global.addEventListener = () => {};
global.TDTD_ASTRO = require('../assets/astro.js');
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'toancanh.js'), 'utf8'))();
const T = global.TDTD_TOANCANH, A = global.TDTD_ASTRO;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const RAD = Math.PI / 180, R = 6371;
const dai = (a) => Math.hypot(a.x, a.y, a.z);

console.log('\n— Quỹ đạo giống Trạm Vũ trụ Quốc tế, đi ngang chỗ bạn —');
ok('số liệu trạm: 417 km, 51,64°, 92,9 phút, 7,67 km/s (Wikipedia)', T.ISS.cao === 417 && T.ISS.nghieng === 51.64 && T.ISS.chuKy === 92.9 && T.ISS.tocDo === 7.67);
const viHCM = 10.8231, raHCM = 150;
const q = T._quyDaoQua(viHCM, raHCM), o0 = T._viTriQuyDao(q, 0);
const viP = Math.asin(o0.P.z / dai(o0.P)) / RAD, raP = ((Math.atan2(o0.P.y, o0.P.x) / RAD) + 360) % 360;
ok('lúc bắt đầu, trạm ở đúng trên chỗ bạn (vĩ độ, xích kinh)', Math.abs(viP - viHCM) < 1e-6 && Math.abs(raP - raHCM) < 1e-6, `${viP.toFixed(4)}°, ${raP.toFixed(4)}°`);
ok('đang bay lên phía bắc', o0.V.z > 0);
ok('độ cao không đổi: 417 km', [0, 13, 47, 88].every(t => Math.abs((dai(T._viTriQuyDao(q, t).P) - 1) * R - 417) < 1e-6));
let viMax = 0;
for (let t = 0; t < 92.9; t += .05) { const P = T._viTriQuyDao(q, t).P; viMax = Math.max(viMax, Math.asin(P.z / dai(P)) / RAD); }
ok('vĩ độ cao nhất trạm lên tới đúng bằng góc nghiêng 51,64°', Math.abs(viMax - 51.64) < .01, viMax.toFixed(3) + '°');
const o1 = T._viTriQuyDao(q, 92.9);
ok('sau 92,9 phút về đúng chỗ cũ (trong hệ trời)', dai({ x: o1.P.x - o0.P.x, y: o1.P.y - o0.P.y, z: o1.P.z - o0.P.z }) < 1e-9);
const tocDo = 2 * Math.PI * (R + 417) / (92.9 * 60);
ok('tốc độ suy ra từ độ cao và chu kỳ khớp 7,67 km/s (lệch dưới 1%)', Math.abs(tocDo - 7.67) / 7.67 < .01, tocDo.toFixed(3) + ' km/s');
ok('TP.HCM – Hà Nội (1.138 km) chưa tới 3 phút ở tốc độ đó, như lời dẫn', 1138 / 7.67 < 180 && T.CHANG[1].chu[0][1]().includes('chưa tới 3 phút'));
ok('một ngày 15–16 lần bình minh: 24 giờ / 92,9 phút', Math.abs(1440 / 92.9 - 15.5) < .1 && T.CHANG[1].chu[1][1]().includes('15–16 lần bình minh'));

console.log('\n— Chân trời và khí quyển —');
const chuc = T._gocChucChanTroi(417);
ok('ở 417 km, chân trời chúc xuống chừng 20°', Math.abs(chuc - Math.acos(R / (R + 417)) / RAD) < 1e-9 && chuc > 19.5 && chuc < 21, chuc.toFixed(2) + '°');
{
  /* một tia chúc đúng góc đó từ trạm phải sượt qua mép Trái Đất */
  const P = { x: 1 + 417 / R, y: 0, z: 0 }, c = Math.cos(chuc * RAD), s = Math.sin(chuc * RAD);
  const D = { x: -s, y: c, z: 0 }, b = P.x * D.x, dsc = b * b - (P.x * P.x - 1);
  ok('tia nhìn theo góc chúc ấy sượt đúng mép Trái Đất', Math.abs(dsc) < 1e-9);
  const S = { x: 1, y: 0, z: 0 };                                     // nắng chiếu thẳng xuống chỗ tia sượt
  const tia = (caoKm) => { const rc = 1 + caoKm / R, PP = { x: rc, y: -3, z: 0 }; return T._quaKhi(PP, { x: 0, y: 1, z: 0 }, S, null); };
  const k5 = tia(5), k60 = tia(60), k120 = tia(120);
  /* mật độ giảm e lần mỗi 8 km: hai tia sượt cách nhau 55 km chênh nhau e^(55/8) ≈ 968 lần lượng khí */
  ok('tia sượt ở 5 km đi qua lượng khí gấp e^(55/8) ≈ 968 lần tia sượt ở 60 km (thang độ cao 8 km)', k5 && k60 && Math.abs(k5.tong / k60.tong / Math.exp(55 / 8) - 1) < .02, (k5.tong / k60.tong).toFixed(0));
  ok('trên 100 km không còn khí để sáng', k120 === null);
  const c5 = T._mauKhi(k5, { x: 0, y: 1, z: 0 }, S), c60 = T._mauKhi(k60, { x: 0, y: 1, z: 0 }, S);
  ok('dải khí sát mặt đất đục hẳn, lên cao thì mờ dần — dải sáng mỏng ở mép như ảnh chụp từ trạm', c5[3] > .95 && c60[3] < .05, `${c5[3].toFixed(2)} → ${c60[3].toFixed(3)}`);
  ok('nắng chiếu cao: khí xanh', c5[2] > c5[0]);
  const hoang = T._mauKhi({ tong: k5.tong, nang: 0 }, { x: 0, y: 1, z: 0 }, S), dem = T._mauKhi({ tong: k5.tong, nang: -.6 }, { x: 0, y: 1, z: 0 }, S);
  ok('Mặt Trời sát chân trời ở chỗ ấy: khí cam đỏ (hoàng hôn, bình minh)', hoang[0] > hoang[2] && hoang[3] > .2);
  ok('phía đêm: khí tắt', dem[3] < .01);
  const len = T._quaKhi({ x: 1 + 417 / R, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, null);
  ok('nhìn thẳng ra ngoài vũ trụ từ trạm: không có khí (trạm ở trên vỏ khí quyển)', len === null);
}

console.log('\n— Ngày, đêm, đèn thành phố —');
{
  const S = { x: 1, y: 0, z: 0 }, D = { x: -1, y: 0, z: 0 };
  const ngay = T._mauMat({ x: 1, y: 0, z: 0 }, D, S, 0), dem = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0);
  ok('chưa có ảnh NASA: vẫn vẽ được, phía ngày sáng hơn phía đêm nhiều', ngay[0] + ngay[1] + ngay[2] > 4 * (dem[0] + dem[1] + dem[2]));
  /* ảnh giả 8×4: mặt đất đỏ, không mây, chỗ nào cũng có đèn */
  const gia = (fn) => { const d = new Uint8ClampedArray(8 * 4 * 4); for (let i = 0; i < 32; i++) { const c = fn(i); d.set(c, i * 4); } return { w: 8, h: 4, d }; };
  /* đèn mức vừa (120/255): đèn sáng nhất thì bão hoà thành trắng vàng, như ảnh chụp thật */
  T._datAnh({ ngay: gia(() => [200, 30, 30, 255]), may: gia(() => [0, 0, 0, 255]), dem: gia(() => [120, 120, 120, 255]) });
  const n2 = T._mauMat({ x: 1, y: 0, z: 0 }, D, S, 0), d2 = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0);
  ok('có ảnh: phía ngày lấy màu ảnh mặt đất', n2[0] > 150 && n2[1] < 80);
  ok('phía đêm: đèn thành phố vàng ấm (đỏ > lục > lam), sáng hơn hẳn nền đêm', d2[0] > d2[1] && d2[1] > d2[2] && d2[0] > 120, d2.map(Math.round).join(','));
  T._datAnh({ ngay: gia(() => [200, 30, 30, 255]), may: gia(() => [255, 255, 255, 255]), dem: gia(() => [120, 120, 120, 255]) });
  const d3 = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0), n3 = T._mauMat({ x: 1, y: 0, z: 0 }, D, S, 0);
  ok('mây dày che bớt đèn ban đêm', d3[0] < d2[0]);
  ok('mây ban ngày trắng', n3[0] > 200 && n3[1] > 200 && n3[2] > 200);
  /* Ảnh Blue Marble đã lọc khí quyển nên biển gần như đen; nhìn thật từ vũ trụ biển xanh lam nhờ ánh tán xạ */
  T._datAnh({ ngay: gia(() => [2, 5, 20, 255]), may: gia(() => [0, 0, 0, 255]), dem: gia(() => [0, 0, 0, 255]) });
  const bien = T._mauMat({ x: 1, y: 0, z: 0 }, D, S, 0);
  ok('biển ban ngày xanh lam nhờ ánh tán xạ của khí quyển, không đen như ảnh gốc', bien[2] > 60 && bien[2] > bien[0] * 2, bien.map(Math.round).join(','));
  T._datAnh(null);
}

console.log('\n— Hành trình: 30 km → quỹ đạo → Mặt Trăng → 6 tỉ km → nhìn lại —');
ok('bảy chặng, chặng nào cũng có lời dẫn', T.CHANG.length === 7 && T.CHANG.every(c => c.chu.length && c.dai > 10), T.CHANG.map(c => c.ten).join(' · '));
ok(`cả hành trình ${Math.round(T.TONG / 60 * 10) / 10} phút`, T.TONG === T.CHANG.reduce((s, c) => s + c.dai, 0) && T.TONG > 150 && T.TONG < 260);
let a = 0, lien = true;
for (const [k, c] of T.CHANG.entries()) { const x = T._chang(a + c.dai / 2); if (x.k !== k) lien = false; a += c.dai; }
ok('mốc thời gian nào cũng rơi đúng một chặng', lien && T._chang(T.TONG + 5).k === 6);
const ms0 = Date.UTC(2026, 9, 14, 13, 0, 0), g = { ms0, vi: viHCM, kinh: 106.6297, noi: 'TP.HCM' };
const caoLuc = (t) => (dai(T._mayLuc(t, g).P) - 1) * R;
ok('chặng đầu: bay lên từ 30 km tới 417 km ngay trên chỗ bạn', Math.abs(caoLuc(0) - 30) < .5 && Math.abs(caoLuc(21.99) - 417) < 2, `${caoLuc(0).toFixed(1)} → ${caoLuc(21.99).toFixed(1)} km`);
{
  const m = T._mayLuc(0, g), th = A.gioSao(A.ngayJulius(ms0)), u = T._tuXichDao(g.kinh + th, g.vi);
  const P = m.P, l = dai(P);
  ok('lúc đầu máy ở đúng trên đầu bạn', Math.abs(P.x / l - u.x) < 1e-9 && Math.abs(P.y / l - u.y) < 1e-9 && Math.abs(P.z / l - u.z) < 1e-9);
}
const q1 = T._mayLuc(22 + 26.5, g);
ok('trên quỹ đạo: đúng độ cao trạm, tua nhanh 100 lần', Math.abs(caoLuc(40) - 417) < 1e-6 && Math.abs((q1.ms - ms0) / 60000 - 26.5 * 100 / 60) < 1e-6 && q1.them.tua === 100);
{
  const m = A.matTrang(A.ngayJulius(ms0));
  const batDauTrang = T.CHANG.slice(0, 4).reduce((s, c) => s + c.dai, 0), batDauCham = batDauTrang + T.CHANG[4].dai;
  const dT = T._mayLuc(batDauTrang + T.CHANG[4].dai * .8, g).them.d, dC = T._mayLuc(batDauCham + T.CHANG[5].dai * .85, g).them.d;
  ok('chặng Mặt Trăng: máy lùi tới đúng chỗ Mặt Trăng lúc này', Math.abs(dT - m.kc) < 1, `${Math.round(dT)} km`);
  ok('chặng chấm xanh: lùi tới 6,06 tỉ km như Voyager 1', Math.abs(dC - 6.06e9) / 6.06e9 < 1e-6);
  ok('từ khoảng cách Mặt Trăng, Trái Đất rộng chừng 1,9°', Math.abs(T._gocTraiDat(384400) - 1.9) < .02, T._gocTraiDat(384400).toFixed(2) + '°');
  const mt = T._mayLuc(batDauTrang + T.CHANG[4].dai * .8, g), sun = A.matTroi(A.ngayJulius(ms0));
  const vM = T._tuXichDao(m.ra, m.dec), S = T._tuXichDao(sun.ra, sun.dec), mong = Math.round((1 + vM.x * S.x + vM.y * S.y + vM.z * S.z) / 2 * 100);
  ok('Trái Đất nhìn từ Mặt Trăng sáng bao nhiêu phần trăm: tính từ vị trí thật', mt.them.sangTuTrang === mong, mong + '%');
  const F = T._mayLuc(batDauCham + 5, g).F, Pm = T._mayLuc(batDauCham + 5, g).P, l = dai(Pm);
  ok('lùi ra xa thì máy luôn nhìn thẳng vào Trái Đất', Math.abs(F.x + Pm.x / l) < 1e-9 && Math.abs(F.y + Pm.y / l) < 1e-9 && Math.abs(F.z + Pm.z / l) < 1e-9);
}
ok('giữa hai chặng tối dần rồi sáng dần, không giật cảnh', T._mayLuc(21.9, g).mo < .2 && T._mayLuc(22.1, g).mo < .2 && T._mayLuc(30, g).mo === 1);
ok('lời dẫn chặng cuối gọi đúng nơi của bạn', T.CHANG[6].chu[0][1]({ noi: 'TP.HCM' }).includes('TP.HCM'));

console.log('\n— Nằm trong Trời đêm, phần Nhìn từ vũ trụ —');
const ns = fs.readFileSync(path.join(__dirname, '..', 'assets', 'nightsky.js'), 'utf8');
const app = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.js'), 'utf8');
ok('không phải ngôi sao riêng (người dùng muốn nó nằm trong phần xem Mặt Trăng, Mặt Trời)', !/TDTD_TOANCANH/.test(app));
ok('nút "Hiệu ứng toàn cảnh" chỉ hiện khi đang Nhìn từ vũ trụ', /class="td-toancanh" type="button" hidden>Hiệu ứng toàn cảnh</.test(ns) &&
   /q\('\.td-toancanh'\)\.hidden = !bat \|\| !self\.TDTD_TOANCANH;/.test(ns));
ok('mở hành trình thì dừng vòng vẽ của Trời đêm, đóng thì chạy lại', /function moToanCanh\(\) \{[\s\S]{0,200}cancelAnimationFrame\(raf\); raf = null;[\s\S]{0,200}khiDong: \(\) => \{[\s\S]{0,120}requestAnimationFrame\(vong\)/.test(ns));
ok('đóng Trời đêm thì đóng luôn hành trình', /function dong\(\) \{\s*if \(self\.TDTD_TOANCANH && self\.TDTD_TOANCANH\.dangMo\(\)\) self\.TDTD_TOANCANH\.dong\(\);/.test(ns));
const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8');
const z = (lop) => +((css.match(new RegExp(`\\.${lop}\\{[^}]*z-index:(\\d+)`)) || [])[1] || 0);
ok('hành trình nằm trên Trời đêm', z('toancanh') > z('troidem'), `${z('toancanh')} > ${z('troidem')}`);
const tc = fs.readFileSync(path.join(__dirname, '..', 'assets', 'toancanh.js'), 'utf8');
ok('phím Esc chỉ đóng hành trình, không rơi xuống đóng luôn Trời đêm', /e\.preventDefault\(\); e\.stopImmediatePropagation\(\); dong\(\);[\s\S]{0,20}\}, true\);/.test(tc) && /e\.key === 'Escape' && !e\.defaultPrevented && tam/.test(ns));
ok('ảnh NASA có trong app, cỡ 2048×1024', ['ngay', 'may', 'dem'].every(t => fs.existsSync(path.join(__dirname, '..', 'assets', 'traidat', t + '.jpg'))));

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
