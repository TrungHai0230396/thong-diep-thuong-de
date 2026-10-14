/* Kiểm thử Hiệu ứng toàn cảnh: node scripts/test-toancanh.js
   Quỹ đạo đúng số liệu trạm vũ trụ và đi ngang chỗ bạn, khí quyển sáng đúng chỗ, ngày đêm đúng phía, hành trình liền
   mạch từ 30 km tới 6 tỉ km, và nút mở nằm trong phần Nhìn từ vũ trụ của Trời đêm. */
const fs = require('fs');
const path = require('path');
global.self = global; global.window = global;
global.addEventListener = () => {};
global.TDTD_ASTRO = require('../assets/astro.js');
global.TDTD_DATLIEN = require('../assets/datlien.js');
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'toancanh.js'), 'utf8'))();
const T = global.TDTD_TOANCANH, A = global.TDTD_ASTRO;
const tc = fs.readFileSync(path.join(__dirname, '..', 'assets', 'toancanh.js'), 'utf8');

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
ok('TP.HCM – Hà Nội (1.138 km) chưa tới 3 phút ở tốc độ đó, như lời dẫn', 1138 / 7.67 < 180 && T.CHANG[1].chu[1][1]().includes('chưa tới 3 phút'));
ok('một ngày 15–16 lần bình minh: 24 giờ / 92,9 phút', Math.abs(1440 / 92.9 - 15.5) < .1 && T.CHANG[1].chu[2][1]().includes('15–16 lần bình minh'));

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
  /* điểm giữa trưa trên đất liền (0°, 20° Đông): điểm 0°, 0° nằm giữa vịnh Guinea, dính loá mặt biển */
  const S = T._tuXichDao(20, 0), D = { x: -S.x, y: -S.y, z: -S.z };
  const ngay = T._mauMat(S, D, S, 0), dem = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0);
  ok('chưa có ảnh NASA: vẫn vẽ được, phía ngày sáng hơn phía đêm nhiều', ngay[0] + ngay[1] + ngay[2] > 4 * (dem[0] + dem[1] + dem[2]));
  /* ảnh giả 8×4: mặt đất đỏ, không mây, chỗ nào cũng có đèn */
  const gia = (fn) => { const d = new Uint8ClampedArray(8 * 4 * 4); for (let i = 0; i < 32; i++) { const c = fn(i); d.set(c, i * 4); } return { w: 8, h: 4, d }; };
  /* đèn mức vừa (120/255): đèn sáng nhất thì bão hoà thành trắng vàng, như ảnh chụp thật */
  T._datAnh({ ngay: gia(() => [200, 30, 30, 255]), may: gia(() => [0, 0, 0, 255]), dem: gia(() => [120, 120, 120, 255]) });
  const n2 = T._mauMat(S, D, S, 0), d2 = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0);
  ok('có ảnh: phía ngày lấy màu ảnh mặt đất', n2[0] > 150 && n2[1] < 80);
  ok('phía đêm: đèn thành phố vàng ấm (đỏ > lục > lam), sáng hơn hẳn nền đêm', d2[0] > d2[1] && d2[1] > d2[2] && d2[0] > 120, d2.map(Math.round).join(','));
  T._datAnh({ ngay: gia(() => [200, 30, 30, 255]), may: gia(() => [255, 255, 255, 255]), dem: gia(() => [120, 120, 120, 255]) });
  const d3 = T._mauMat({ x: -1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, S, 0), n3 = T._mauMat(S, D, S, 0);
  ok('mây dày che bớt đèn ban đêm', d3[0] < d2[0]);
  ok('mây ban ngày trắng', n3[0] > 200 && n3[1] > 200 && n3[2] > 200);
  /* Ảnh Blue Marble đã lọc khí quyển nên biển gần như đen; nhìn thật từ vũ trụ biển xanh lam nhờ ánh tán xạ */
  T._datAnh({ ngay: gia(() => [2, 5, 20, 255]), may: gia(() => [0, 0, 0, 255]), dem: gia(() => [0, 0, 0, 255]) });
  const bien = T._mauMat(S, D, S, 0);
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
ok('chặng đầu: bay lên từ 30 km tới 417 km ngay trên chỗ bạn', Math.abs(caoLuc(0) - 30) < .5 && Math.abs(caoLuc(T.CHANG[0].dai - .01) - 417) < 2, `${caoLuc(0).toFixed(1)} → ${caoLuc(T.CHANG[0].dai - .01).toFixed(1)} km`);
{
  const m = T._mayLuc(0, g), th = A.gioSao(A.ngayJulius(ms0)), u = T._tuXichDao(g.kinh + th, g.vi);
  const P = m.P, l = dai(P);
  ok('lúc đầu máy ở đúng trên đầu bạn', Math.abs(P.x / l - u.x) < 1e-9 && Math.abs(P.y / l - u.y) < 1e-9 && Math.abs(P.z / l - u.z) < 1e-9);
}
const q1 = T._mayLuc(T.CHANG[0].dai + 26.5, g);
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
{
  /* "Cảm giác đang bay ngang và lên chứ không phải bay lên": bản cũ cho máy cúi dần đúng nhịp chân trời chúc xuống */
  const goc = (t) => { const m = T._mayLuc(t, g), l = dai(m.P); return Math.asin((m.F.x * m.P.x + m.F.y * m.P.y + m.F.z * m.P.z) / l) / RAD; };
  const cac = [0, 5, 11, 16, 21.9].map(goc);
  ok('chặng đầu: máy quay giữ nguyên góc nhìn chếch xuống suốt chặng', cac.every(x => Math.abs(x + T.GOC_CUI_BAY) < 1e-6), cac.map(x => x.toFixed(2)).join(', '));
  const huong = (t) => { const P = T._mayLuc(t, g).P, l = dai(P); return [P.x / l, P.y / l, P.z / l]; };
  const h0 = huong(0), h1 = huong(21.9);
  ok('chặng đầu: máy chỉ đi lên, không trôi ngang', Math.hypot(h0[0] - h1[0], h0[1] - h1[1], h0[2] - h1[2]) < 1e-9);
  const tren = (km) => T.GOC_CUI_BAY - T._gocChucChanTroi(km);   // chân trời cao hơn giữa màn bao nhiêu độ
  ok('chân trời tụt dần trên màn, từ trên giữa màn xuống dưới giữa màn: dấu hiệu đang lên', tren(30) > 0 && tren(417) < 0 && tren(30) - tren(417) > 14, `${tren(30).toFixed(1)}° → ${tren(417).toFixed(1)}°`);
  ok('lời dẫn: được nâng thẳng lên; tên lửa thật bay ngang (Soyuz: quỹ đạo 205 km, cách bãi phóng 1.640 km)', T.CHANG[0].chu[1][1]({ noi: 'TP.HCM' }).includes('nâng thẳng lên') && T.CHANG[0].chu.some(([, h]) => /205 km.*1\.640 km/.test(h({}))));
}
ok('giữa hai chặng tối dần rồi sáng dần, không giật cảnh', T._mayLuc(T.CHANG[0].dai - .1, g).mo < .2 && T._mayLuc(T.CHANG[0].dai + .1, g).mo < .2 && T._mayLuc(T.CHANG[0].dai + 8, g).mo === 1);
{
  /* "Lỡ một người ở nơi khác thì có ghi TP.HCM chỗ bạn đang ngồi không?" — chưa chọn nơi thì chỉ là xem tạm */
  const dau = (c) => T.CHANG[0].chu[1][1](c), cuoi = (c) => T.CHANG[6].chu[0][1](c);
  ok('đã chọn thành phố: gọi đúng tên nơi ấy là nơi bạn ở', dau({ noi: 'Hà Nội', chon: true }).includes('từ Hà Nội') && cuoi({ noi: 'Hà Nội', chon: true }).includes('Hà Nội — nơi bạn đang ở'));
  ok('chưa chọn nơi: nói rõ là xem tạm TP.HCM, chặng cuối không gọi TP.HCM là chỗ bạn ngồi',
     dau({ noi: 'TP.HCM', chon: false }).includes('xem tạm') && !cuoi({ noi: 'TP.HCM', chon: false }).includes('TP.HCM') && cuoi({ noi: 'TP.HCM', chon: false }).includes('Dù bạn đang ngồi ở đâu'));
  ok('lấy vị trí máy: không lặp "chỗ bạn đứng — chỗ bạn đang ngồi"', dau({ noi: 'chỗ bạn đứng', chon: true, tuMay: true }).includes('ngay chỗ bạn đứng') && cuoi({ noi: 'chỗ bạn đứng', chon: true, tuMay: true }) === 'Hít một hơi thật chậm. Chỗ bạn đang ngồi lúc này nằm trên chấm sáng ấy.');
  const kho = {};
  global.localStorage = { getItem: (k) => (k in kho ? kho[k] : null) };
  const n0 = T._noiDangDung();
  kho['tdtd.troi.noi'] = JSON.stringify({ ten: 'Đà Nẵng', vi: 16.05, kinh: 108.2, tuMay: false });
  const n1 = T._noiDangDung();
  kho['tdtd.troi.noi'] = JSON.stringify({ ten: 'chỗ bạn đứng', vi: 21.03, kinh: 105.85, tuMay: true });
  const n2 = T._noiDangDung();
  ok('đọc đúng nơi Trời đêm đã lưu: chưa chọn / thành phố / vị trí máy', !n0.chon && n0.ten === 'TP.HCM' && n1.chon && !n1.tuMay && n1.ten === 'Đà Nẵng' && n2.chon && n2.tuMay && n2.vi === 21.03);
  delete global.localStorage;
}

console.log('\n— Trên quỹ đạo: bay ngang, độ cao không đổi; lời về đèn theo cái đang thấy —');
/* "Phải giải thích bay ngang chứ, vì mặc định mọi người nghĩ bay thẳng" */
ok('mở đầu chào như tiếp viên, kết thúc cảm ơn quý khách', T.CHANG[0].chu[0][0] === 0 && /^Xin chào quý khách!/.test(T.CHANG[0].chu[0][1]()) && /^Cảm ơn quý khách/.test(T.CHANG[6].chu[1][1]()));
/* "Sao không lấy tàu Apollo đi" — Apollo chỉ đúng ở chặng Mặt Trăng: không bay ở 417 km (quay vòng Trái Đất chừng 185 km),
   không đi tới 6 tỉ km (đó là Voyager 1). Người dùng chọn: mỗi chặng gắn đúng một chuyến có thật. */
ok('câu chào nêu đúng ba chuyến có thật; chặng quỹ đạo, Mặt Trăng, 6 tỉ km mở đầu bằng đúng chuyến của nó', /ba chuyến có thật: Trạm Vũ trụ Quốc tế, Apollo 8, Voyager 1/.test(T.CHANG[0].chu[0][1]()) &&
   /^Chặng của Trạm Vũ trụ Quốc tế/.test(T.CHANG[1].chu[0][1]()) && /^Chặng của tàu Apollo 8/.test(T.CHANG[4].chu[0][1]()) && /^Chặng của tàu Voyager 1/.test(T.CHANG[5].chu[0][1]()) &&
   !T.CHANG.some(c => c.chu.some(([, h]) => /TĐ-417/.test(h({ noi: 'TP.HCM' })))));
ok('chặng 6 tỉ km nói "xa bằng chỗ Voyager 1" — máy chỉ lùi ra đúng khoảng cách, không đi đúng hướng tàu đã bay', /xa bằng chỗ nó quay lại chụp/.test(T.CHANG[5].chu[0][1]()));
ok('cuối chặng 1 báo trước: tới 417 km thì thôi bay lên, chặng sau bay ngang', /thôi bay lên — chặng sau bay ngang/.test(T.CHANG[0].chu[4][1]()));
ok('ngay đầu chặng 2 giải thích vì sao bay ngang: đứng yên thì rơi, lao ngang thì rơi mãi không chạm đất', T.CHANG[1].chu[0][0] === 0 &&
   /Vì sao giờ lại bay ngang\?/.test(T.CHANG[1].chu[0][1]()) && /rơi thẳng xuống/.test(T.CHANG[1].chu[0][1]()) && /luôn trượt qua mép Trái Đất/.test(T.CHANG[1].chu[1][1]()));
{
  const so = (t) => T._dongSo(T._mayLuc(t, g).them);
  const d4 = T.CHANG.slice(0, 3).reduce((s, c) => s + c.dai, 0), d5 = d4 + T.CHANG[3].dai;
  ok('dòng số ghi đang bay kiểu gì: lên, ngang, lên, ra xa', /đang bay thẳng lên/.test(so(10)) && /đang bay ngang 7,67 km\/giây/.test(so(40)) && /tua nhanh 100 lần/.test(so(40)) &&
     /^độ cao .* · đang bay thẳng lên$/.test(so(d4 + 10)) && /cách tâm Trái Đất .* · đang bay ra xa/.test(so(d5 + 10)), [so(10), so(40), so(d4 + 10), so(d5 + 10)].join(' | '));
  /* chặng 4 nối liền: bắt đầu ở 417 km, ngay trên chỗ bạn, chỉ đi lên */
  const P0 = T._mayLuc(d4 + .01, g).P, P1 = T._mayLuc(d4 + T.CHANG[3].dai - .01, g).P, l0 = dai(P0), l1 = dai(P1);
  const th = A.gioSao(A.ngayJulius(ms0)), u = T._tuXichDao(g.kinh + th, g.vi);
  ok('chặng 4 bắt đầu ngay ở 417 km (nối liền quỹ đạo), lên tới 9.000 km', Math.abs((l0 - 1) * R - 417) < 1 && Math.abs((l1 - 1) * R - 9000) < 5, `${((l0 - 1) * R).toFixed(0)} → ${((l1 - 1) * R).toFixed(0)} km`);
  ok('chặng 4 bay thẳng lên ngay trên chỗ bạn, không trôi ngang', [P0, P1].every((P) => { const l = dai(P); return Math.hypot(P.x / l - u.x, P.y / l - u.y, P.z / l - u.z) < 1e-9; }));
  ok('đầu chặng 4 nói rõ: thôi bay ngang, giờ bay thẳng lên', /Thôi bay ngang\. Giờ bay thẳng lên/.test(T.CHANG[3].chu[0][1]()));
}
{
  /* máy nhìn thẳng xuống từ 417 km, giờ sao 0 (hệ trời trùng hệ địa lý), Mặt Trời ở phía bên kia: ban đêm */
  const nhin = (vi, kinh, ngay) => {
    const u = T._tuXichDao(kinh, vi), P = { x: u.x * (1 + 417 / R), y: u.y * (1 + 417 / R), z: u.z * (1 + 417 / R) };
    const F = { x: -u.x, y: -u.y, z: -u.z }, U = Math.abs(u.z) < .9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
    const S = ngay ? u : F;
    return T._nhinDuoi({ P, F, U, fov: 74 }, S, 0);
  };
  const bien = nhin(0, -150, false), dat = nhin(39, -97, false), ngay = nhin(39, -97, true);
  ok('đêm giữa Thái Bình Dương: đếm ra toàn biển', bien.n > 30 && bien.demBien === bien.n, JSON.stringify(bien));
  ok('đêm trên nước Mỹ: đếm ra toàn đất', dat.n > 30 && dat.demDat === dat.n, JSON.stringify(dat));
  ok('ban ngày: đếm ra ngày', ngay.ngay === ngay.n);
  ok('đêm trên biển thì nói thật là tối đen vì không có thành phố', /trên biển: không có thành phố nên tối đen/.test(T._loiDen(bien)));
  ok('đêm trên đất liền thì chỉ ánh vàng bên dưới là đèn', /Ánh vàng bên dưới là đèn/.test(T._loiDen(dat)));
  ok('ban ngày thì nói chung về phía đêm', /Ở phía đêm của Trái Đất/.test(T._loiDen(ngay)) && /Ở phía đêm/.test(T._loiDen(null)));
  ok('dòng đã hiện thì giữ nguyên chữ, không đổi qua lại khi bay qua bờ biển', /x\.khoa in chotChu \? chotChu\[x\.khoa\] : \(chotChu\[x\.khoa\] = x\.h\(boi\)\)/.test(tc));
}

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
ok('phím Esc chỉ đóng hành trình, không rơi xuống đóng luôn Trời đêm', /e\.preventDefault\(\); e\.stopImmediatePropagation\(\); dong\(\);[\s\S]{0,20}\}, true\);/.test(tc) && /e\.key === 'Escape' && !e\.defaultPrevented && tam/.test(ns));
/* cỡ ảnh JPEG đọc từ khối SOF trong tệp */
const coJpg = (f) => {
  const b = fs.readFileSync(f);
  for (let i = 2; i < b.length - 9;) {
    if (b[i] !== 0xFF) return null;
    const m = b[i + 1], dai = b.readUInt16BE(i + 2);
    if (m >= 0xC0 && m <= 0xC3) return b.readUInt16BE(i + 7) + '×' + b.readUInt16BE(i + 5);
    i += 2 + dai;
  }
  return null;
};
const anhApp = (t) => path.join(__dirname, '..', 'assets', 'traidat', t);
const co = ['ngay-4096.jpg', 'may.jpg', 'dem-3600.jpg'].map(t => fs.existsSync(anhApp(t)) ? coJpg(anhApp(t)) : null);
ok('ảnh NASA trong app giữ cỡ to nhất nguồn có: mặt đất 4096×2048, mây 2048×1024 (nguồn chỉ có vậy), đèn 3600×1800', co.join(' ') === '4096×2048 2048×1024 3600×1800', co.join(' '));
ok('app gọi đúng ba tệp ấy', ['ngay-4096.jpg', 'may.jpg', 'dem-3600.jpg'].every(t => tc.includes(`assets/traidat/${t}`)));

console.log('\n— Vẽ bằng card đồ hoạ —');
ok('có WebGL2 thì mỗi điểm ảnh màn hình một tia trên card đồ hoạ, không có thì lùi về bộ xử lý', /getContext\('webgl2'/.test(tc) && /if \(epCPU \|\| !veTraiDatGL\(/.test(tc));
ok('cùng công thức với bản bộ xử lý: ngưỡng ngày đêm, mây, loá biển, tán xạ, đèn, khí quyển', ['em(-.06, .12, mu)', 'em(70., 215.', 'pow(cc, 60.) * 150.', 'vec3(16., 38., 78.)', '* 320.', 'em(-.18, .08, nang)', 'exp(-tong * 260.)'].every(k => tc.includes(k)));
ok('ảnh lọc theo mipmap và dị hướng: ở xa không lấm tấm, sát chân trời vẫn nét', /LINEAR_MIPMAP_LINEAR/.test(tc) && /EXT_texture_filter_anisotropic/.test(tc));
ok('kinh tuyến 180° không thành đường kẻ (đạo hàm của bản uv dời nửa vòng)', tc.includes('fract(uv.x + .5) - .5') && /textureGrad\(tNgay, uv, gx, gy\)/.test(tc));
ok('máy yếu thì tự giảm số điểm ảnh phải tô, tới một nửa là thôi', /if \(tb > 26 && glTi > \.5\) glTi = Math\.max\(\.5, glTi \* \.8\)/.test(tc));
ok('lời dẫn mỗi lúc một câu (câu mới nhất), đổi câu thì mờ ra rồi hiện vào — không chồng, không nhảy', /const chu = dong\.length \? dong\[dong\.length - 1\] : '';/.test(tc) && /hop\.classList\.add\('tat'\)/.test(tc) && /\.tc-chu\.tat\{opacity:0/.test(fs.readFileSync(path.join(__dirname, '..', 'assets', 'app.css'), 'utf8')));
{
  /* "Chữ nhảy khó đọc": câu nào cũng phải đứng đủ lâu để đọc (chừng 4 từ mỗi giây + 1,2 giây), với mọi kiểu nơi ở và
     mọi câu về đèn. Bản trước: câu chào 41 từ chỉ đứng 3,5 giây. */
  const ngu = [{ noi: 'TP.HCM', chon: false }, { noi: 'Thừa Thiên Huế', chon: true }, { noi: 'chỗ bạn đứng', chon: true, tuMay: true }];
  const den = [{ n: 49, ngay: 0, demDat: 49, demBien: 0 }, { n: 49, ngay: 0, demDat: 0, demBien: 49 }, null];
  const thieu = [];
  for (const ch of T.CHANG) ch.chu.forEach(([p, h], i) => {
    const co = ((i + 1 < ch.chu.length ? ch.chu[i + 1][0] : 1) - p) * ch.dai;
    let can = 0;
    for (const c of ngu) for (const d of den) can = Math.max(can, T._docLau(h({ ...c, sangTuTrang: 100, duoi: () => d })));
    if (co < can) thieu.push(`${ch.id}#${i}: ${co.toFixed(1)}s < ${can.toFixed(1)}s`);
  });
  ok('câu nào cũng đứng đủ thời gian đọc, ở mọi chặng', !thieu.length, thieu.join('; '));
}

console.log('\n— Ảnh chi tiết quanh chỗ bạn (GIBS của NASA) —');
{
  const trua = Date.UTC(2026, 9, 14, 5, 0, 0), nuaDem = Date.UTC(2026, 9, 14, 17, 0, 0);   // 12 giờ trưa, nửa đêm ở TP.HCM
  const a = T._canChiTiet(10.8231, 106.6297, trua), b = T._canChiTiet(10.8231, 106.6297, nuaDem);
  ok('tâm ảnh làm tròn tới 1 độ: máy chủ chỉ biết vùng, không biết chỗ', a.vi === 11 && a.kinh === 107);
  ok('giữa trưa chỉ xin ảnh ban ngày, nửa đêm chỉ xin ảnh đèn — mỗi lần một ảnh', a.ngay && !a.dem && !b.ngay && b.dem);
  let cv = null;
  for (let ph = 0; ph < 150 && !cv; ph++) { const c = T._canChiTiet(10.8231, 106.6297, Date.UTC(2026, 9, 14, 10, 0, 0) + ph * 60000); if (c.ngay && c.dem) cv = c; }
  ok('chạng vạng: xin cả hai', !!cv);
  ok('sát kinh tuyến 180° (Fiji): thôi, dùng ảnh có sẵn', T._canChiTiet(-17.7, 178.4, trua) === null);
  const u = T._urlChiTiet('BlueMarble_NextGeneration', 11, 107);
  ok('địa chỉ: máy chủ GIBS của NASA, ô 10° quanh tâm (WMS 1.3.0 ghi vĩ độ trước), 2048 điểm ảnh', u.startsWith('https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?') && /&bbox=6,102,16,112&/.test(u) && /WIDTH=2048&HEIGHT=2048/.test(u) && /CRS=EPSG:4326/.test(u));
  ok('chỗ bạn lệch tâm nhiều nhất 0,5° nên luôn cách mép ô 4,5°, ngoài dải mờ dần 0,6°', T.CT.nua - .5 - .6 > 3.5 && /\/ \.6, 0\., 1\.\)/.test(tc));
  ok('ban ngày: Blue Marble Next Generation; ban đêm: Black Marble', /ngay: 'BlueMarble_NextGeneration', dem: 'VIIRS_Black_Marble'/.test(tc));
  const sw = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf8');
  ok('cất ảnh vào kho riêng, giữ qua các lần deploy, chỉ cất khi đúng là ảnh', /const NASA = 'tdtd-nasa'/.test(sw) && /x !== V && x !== TIENG && x !== NASA/.test(sw) && /startsWith\('image\/'\)\) c\.put/.test(sw));
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
