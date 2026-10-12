/* Kiểm thử Thiền luân xa: node scripts/test-luanxa.js
   Nội dung đúng kinh văn, âm thanh đúng số đo (chuông, đàn), lịch buổi thiền đúng từng giây, và trình phát
   hẹn đúng lịch đó lên luồng âm thanh. */
const L = require('../assets/luanxa.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

/* Biên độ của một tần số trong đoạn [a, b) — thuật toán Goertzel. */
function bien(x, f, sr, a = 0, b = x.length) {
  const w = 2 * Math.cos(2 * Math.PI * f / sr);
  let s1 = 0, s2 = 0;
  for (let i = a; i < b; i++) { const s0 = x[i] + w * s1 - s2; s2 = s1; s1 = s0; }
  return 2 * Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - w * s1 * s2)) / (b - a);
}

console.log('\n— Bảy luân xa theo kinh văn —');
const LX = L.LUAN_XA;
ok('đủ bảy, đánh số 1 tới 7 từ gốc lên đỉnh', LX.length === 7 && LX.every((l, i) => l.so === i + 1));
ok('tên đúng thứ tự: Mūlādhāra … Sahasrāra',
   LX.map(l => l.ten).join(' ') === 'Mūlādhāra Svādhiṣṭhāna Maṇipūra Anāhata Viśuddha Ājñā Sahasrāra');
ok('số cánh sen 4, 6, 10, 12, 16, 2, 1000', LX.map(l => l.canh).join(',') === '4,6,10,12,16,2,1000');
ok('chủng tử LAM VAM RAM YAM HAM OM, đỉnh đầu là im lặng', LX.map(l => l.bija || '—').join(' ') === 'LAM VAM RAM YAM HAM OM —');
ok('chữ Devanagari khớp chủng tử', LX.map(l => l.deva).join(' ') === 'लं वं रं यं हं ॐ ');
ok('năm yếu tố đất, nước, lửa, gió, không gian ở năm luân xa đầu',
   ['đất', 'nước', 'lửa', 'gió', 'không gian'].every((y, i) => LX[i].yeuTo.startsWith(y)));
ok('hình ở giữa hoa sen theo kinh văn: vuông, lưỡi liềm, tam giác, sáu góc, tam giác có trăng',
   LX.slice(0, 5).map(l => l.sen.giua).join(',') === 'vuong,liem,tamGiac,sao6,tamGiacTrang');
const toi = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255; };
ok('cánh sen Maṇipūra xanh thẫm như mây mưa (không phải màu vàng cầu vồng)', toi(LX[2].sen.canh) < 0.25 && LX[2].mau === '#f2c94c');
ok('cánh sen Anāhata đỏ (không phải màu lục cầu vồng)', parseInt(LX[3].sen.canh.slice(1, 3), 16) > 180 && LX[3].mau === '#5fbf77');
ok('Ājñā và Sahasrāra cánh trắng', toi(LX[5].sen.canh) > 0.9 && toi(LX[6].sen.canh) > 0.9);
ok('màu cầu vồng thời nay chỉ dùng cho chấm: đủ bảy màu khác nhau', new Set(LX.map(l => l.mau)).size === 7);
ok('bảng tần số solfeggio 396 417 528 639 741 852 963', LX.map(l => l.hz).join(' ') === '396 417 528 639 741 852 963');

console.log('\n— Đàn lấy cùng nốt với chuông, hạ quãng tám cho vừa giọng tụng —');
ok('Sa của đàn nằm trong 110–220 Hz', LX.every(l => L.goc(l.hz) >= 110 && L.goc(l.hz) < 220), LX.map(l => L.goc(l.hz).toFixed(1)).join(' '));
ok('Sa cách tần số chuông đúng một số nguyên quãng tám', LX.every(l => Number.isInteger(Math.log2(l.hz / L.goc(l.hz)))));
ok('lên dây 5-8-8-1: Pa thấp, Sa, Sa, Sa thấp một quãng tám', L.DAY.join(',') === '0.75,1,1,0.5');

console.log('\n— Chuông xoay: đúng số đo của chuông thật —');
ok('tỉ lệ tần số riêng 1 : 2,82 : 5,19 : 7,92 : 10,94 (Gołaś & Filipek 2016)',
   [1, 2.816, 5.186, 7.919, 10.943].every((r, i) => Math.abs(L.TI_CHUONG[i] - r) < 0.002), L.TI_CHUONG.map(x => x.toFixed(3)).join(' '));
ok('nằm trong khoảng đo của Inácio và cs. 2006 (2,7–2,9; 4,8–5,7; 7,5–9,1; 10,6–13,1)',
   [[2.7, 2.9], [4.8, 5.7], [7.5, 9.1], [10.6, 13.1]].every(([a, b], i) => L.TI_CHUONG[i + 1] >= a && L.TI_CHUONG[i + 1] <= b));
const SR = L.SR;
for (const lx of [LX[0], LX[3], LX[6]]) {
  const c = L.chuong(lx.hz);
  const dinh = [];
  L.TI_CHUONG.forEach((ti) => {
    const f = lx.hz * ti;
    if (f > 0.45 * SR) return;
    let tot = 0, fTot = 0;
    for (let g = f * 0.97; g <= f * 1.03; g += 0.5) { const v = bien(c, g, SR, 0, 2 * SR); if (v > tot) { tot = v; fTot = g; } }
    dinh.push(Math.abs(fTot - f) / f);
  });
  ok(`chuông ${lx.hz} Hz: mỗi đỉnh phổ nằm đúng tần số riêng (lệch dưới 0,5%)`, dinh.length >= 3 && dinh.every(d => d < 0.005),
     `${dinh.length} đỉnh, lệch nhiều nhất ${(Math.max(...dinh) * 100).toFixed(2)}%`);
}
{
  /* Ngân rung: biên độ tần số chính đo theo từng khúc 0,1 giây phải phập phồng đúng nhịp tách đôi 1,6 Hz. */
  const f1 = 396, c = L.chuong(f1), buoc = Math.round(0.05 * SR), cua = Math.round(0.1 * SR), env = [];
  for (let a = Math.round(0.5 * SR); a + cua < 6 * SR; a += buoc) env.push(bien(c, f1, SR, a, a + cua));
  const tb = env.reduce((s, v) => s + v, 0) / env.length, e = env.map(v => v - tb);
  let totTre = 0, tot = -Infinity;
  for (let tre = 6; tre < 30; tre++) {                     // 0,3 – 1,5 giây
    let s = 0; for (let i = 0; i + tre < e.length; i++) s += e[i] * e[i + tre];
    if (s > tot) { tot = s; totTre = tre; }
  }
  const nhip = 1 / (totTre * 0.05);
  ok('chuông ngân rung đúng nhịp tách đôi (1,6 Hz, sai dưới 10%)', Math.abs(nhip - L.TACH[0]) / L.TACH[0] < 0.1, `${nhip.toFixed(2)} Hz`);
  /* Tắt dần: biên độ đo bằng cửa sổ ngắn 0,1 giây (gom được cả hai nửa của cặp tách đôi), bình phương
     rồi lấy trung bình trọn hai nhịp rung — phần phập phồng triệt tiêu, còn lại đúng đường tắt dần.
     (Đo bằng một cửa sổ dài thì sai: cửa sổ 1,25 giây có điểm triệt đúng ở ±0,8 Hz, nuốt mất cả cặp.) */
  const nangLuong = (f, ky, a) => {
    let s = 0, d = 0;
    for (let t = a; t < a + 2 * ky; t += 0.01) { const i = Math.round(t * SR), v = bien(c, f, SR, i, i + Math.round(0.1 * SR)); s += v * v; d++; }
    return Math.sqrt(s / d);
  };
  const ky1 = 1 / L.TACH[0], ky2 = 1 / L.TACH[1], f2 = f1 * L.TI_CHUONG[1];
  const r1 = nangLuong(f1, ky1, 5) / nangLuong(f1, ky1, 1), mong = Math.exp(-4 / L.tauChuong(f1));
  ok('tần số chính tắt dần đúng hằng số đã chọn (4 giây ở 396 Hz, sai dưới 10%)', Math.abs(r1 - mong) / mong < 0.1,
     `4 giây còn ${(r1 * 100).toFixed(1)}%, mong ${(mong * 100).toFixed(1)}%`);
  const r2 = nangLuong(f2, ky2, 2) / nangLuong(f2, ky2, 1), mong2 = Math.exp(-L.TI_CHUONG[1] / L.tauChuong(f1));
  ok('tần số riêng thứ hai tắt nhanh hơn, đúng theo tỉ lệ tần số (sai dưới 10%)', Math.abs(r2 - mong2) / mong2 < 0.1,
     `1 giây còn ${(r2 * 100).toFixed(1)}%, mong ${(mong2 * 100).toFixed(1)}%`);
  let p = 0, nan = false; for (const v of c) { p = Math.max(p, Math.abs(v)); if (!Number.isFinite(v)) nan = true; }
  ok('không vỡ tiếng, không có số hỏng, cuối tiếng về 0', !nan && p <= 0.8001 && Math.abs(c[c.length - 1]) < 1e-3, `đỉnh ${p.toFixed(3)}`);
  const dai = LX.map(l => L.chuong(l.hz).length);
  ok('chuông nhỏ tiếng cao ngân ngắn hơn chuông lớn tiếng trầm', dai.every((d, i) => i === 0 || d <= dai[i - 1]),
     dai.map(d => (d / SR).toFixed(1) + 's').join(' '));
}

console.log('\n— Đàn tanpura —');
{
  const t0 = Date.now(), all = L.taoTatCa(), ms = Date.now() - t0;
  ok('tạo đủ âm cho cả buổi trong chưa tới 3 giây (máy tính; điện thoại chậm hơn vài lần)', ms < 3000, `${ms} ms`);
  const n = Math.round(L.DAI * SR);
  ok('mỗi đoạn đàn dài đúng 20 giây = 4 vòng gảy', all.nen.every(x => x.length === n));
  /* Đoạn lặp 20 giây có phổ là các vạch cách nhau 0,05 Hz: đo đúng trên vạch. Đỉnh của một nốt so với
     TRUNG VỊ các vạch trong dải giữa hai nốt (3–6% trên nốt đó, chỗ không có dây nào) — đo một điểm thì
     dễ trúng chân của vạch lớn bên cạnh. */
  const vach = (y, k) => bien(y, k / L.DAI, SR);
  const dinhNot = (y, f) => { const k = Math.round(f * L.DAI); return Math.max(vach(y, k - 1), vach(y, k), vach(y, k + 1)); };
  const nenGiua = (y, f) => {
    const ds = [];
    for (let k = Math.round(f * 1.03 * L.DAI); k <= Math.round(f * 1.06 * L.DAI); k++) ds.push(vach(y, k));
    ds.sort((a, b) => a - b);
    return ds[ds.length >> 1];
  };
  LX.forEach((lx, i) => {
    const y = all.nen[i], sa = L.goc(lx.hz);
    const co = [sa, sa * 0.75, sa * 0.5].map(f => dinhNot(y, f) / nenGiua(y, f));
    /* 8 lần = 18 dB trên nền: một vạch nốt rõ. Âm cơ bản của dây Sa thấp yếu nhất (jawari đẩy năng lượng
       lên bồi âm, tai vẫn nghe ra nốt từ chuỗi bồi âm), thấp nhất đo được chừng 9 lần. */
    ok(`luân xa ${lx.so}: nghe rõ Sa ${sa.toFixed(1)} Hz, Pa thấp và Sa thấp (đỉnh mỗi nốt cao hơn nền giữa hai nốt ít nhất 8 lần)`,
       co.every(v => v > 8), co.map(v => v.toFixed(0) + '×').join(' '));
  });
  const y = all.nen[0];
  let p = 0, s = 0; for (const v of y) { p = Math.max(p, Math.abs(v)); s += v * v; }
  ok('độ to đều: RMS 0,12, đỉnh không quá 0,95', Math.abs(Math.sqrt(s / y.length) - 0.12) < 0.01 && p <= 0.95, `RMS ${Math.sqrt(s / y.length).toFixed(3)}, đỉnh ${p.toFixed(2)}`);
  /* Liền mạch: tiếng ngân của các lần gảy cuối đoạn đã cộng vòng về đầu, nên nửa giây đầu không hề lặng. */
  const rmsDoan = (a, b) => { let q = 0; for (let i = a; i < b; i++) q += y[i] * y[i]; return Math.sqrt(q / (b - a)); };
  ok('đoạn lặp liền mạch: nửa giây đầu không lặng', rmsDoan(0, SR / 2) > 0.5 * Math.sqrt(s / y.length));
  /* Jawari: đỉnh bồi âm trượt lên. Biên độ bồi âm của dây gảy giảm theo 1/k, nên nhân lại với k cho
     phẳng rồi tìm bậc cao nhất — đó là chỗ đỉnh đang nằm. */
  const g = L.gay(150, SR, L.ngauNhien(3)), cua = Math.round(0.2 * SR);
  const dinhBac = (t) => { const a = Math.round(t * SR); let tot = 0, kTot = 0;
    for (let k = 1; k <= 30; k++) { const v = k * bien(g, 150 * k, SR, a, a + cua); if (v > tot) { tot = v; kTot = k; } } return kTot; };
  const dau = dinhBac(0.02), sau = dinhBac(2.5);
  ok('jawari: đỉnh bồi âm trượt từ bậc thấp (≤ 7) lúc mới gảy lên bậc cao (≥ 16) sau 2,5 giây', dau <= 7 && sau >= 16, `bậc ${dau} → bậc ${sau}`);
}

console.log('\n— Lịch một buổi —');
for (const phut of L.PHUT) {
  const lich = L.lichBuoi(phut), D = phut * 60;
  ok(`${phut} phút mỗi luân xa: cả buổi ${lich.tong / 60} phút = 7 × ${phut} + 1`, lich.tong === 7 * D + 60);
  const soChuong = Math.floor((D - 6 - 0.3) / 30) + 1;
  ok(`${phut} phút: mỗi luân xa ${soChuong} tiếng chuông, mỗi 30 giây, cộng 3 tiếng kết`,
     lich.chuong.length === 7 * soChuong + 3 && LX.every((_, i) => lich.chuong.filter(c => c.i === i).length === soChuong + (i === 6 ? 3 : 0)));
  ok(`${phut} phút: mốc trong lịch âm lượng của từng đoạn đàn không lùi`, lich.nen.every(n => n.ds.every((e, k) => k === 0 || e.luc >= n.ds[k - 1].luc)));
  ok(`${phut} phút: mỗi đoạn đàn bắt đầu trước mốc đầu, dừng sau mốc cuối`, lich.nen.every(n => n.chay <= n.ds[0].luc && n.dung > n.ds[n.ds.length - 1].luc));
  let saiGiua = 0, saiChuyen = 0;
  for (const c of lich.chang) {
    const giua = c.batDau + D / 2, m = lich.nen.map(n => L.muc(giua, n.ds));
    if (m.filter(v => v === 1).length !== 1 || m[c.i] !== 1 || m.reduce((a, b) => a + b, 0) !== 1) saiGiua++;
    if (c.i > 0) {
      const t = c.batDau + 1, a = L.muc(t, lich.nen[c.i - 1].ds), b = L.muc(t, lich.nen[c.i].ds);
      if (!(a > 0 && a < 1 && b > 0 && b < 1 && Math.abs(a + b - 1) < 1e-9)) saiChuyen++;
    }
  }
  ok(`${phut} phút: giữa mỗi chặng chỉ đàn của luân xa đó kêu; lúc chuyển, hai đàn đan nhau, cộng lại vẫn đủ`, saiGiua === 0 && saiChuyen === 0);
  ok(`${phut} phút: 45 giây sau luân xa cuối, đàn đã tắt hẳn; chuông kết ngân xong trước khi hết buổi`,
     lich.nen.every(n => L.muc(7 * D + 46, n.ds) === 0) && Math.max(...lich.chuong.map(c => c.luc + L.chuong(LX[c.i].hz).length / SR)) < lich.tong);
}
{
  const lich = L.lichBuoi(2);
  ok('to dần 6 giây lúc bắt đầu, không giật mình', L.muc(0, lich.nen[0].ds) === 0 && Math.abs(L.muc(3, lich.nen[0].ds) - 0.5) < 1e-9 && L.muc(6, lich.nen[0].ds) === 1);
  ok('đàn luân xa cuối nhỏ dần theo hàm mũ: 22,5 giây sau còn khoảng −30 dB', Math.abs(20 * Math.log10(L.muc(7 * 120 + 22.5, lich.nen[6].ds)) + 30) < 0.5);
  ok('chuông luôn rơi đúng đầu một nhịp hít vào', lich.chuong.filter(c => c.luc < 7 * 120).every(c => L.hoiTho(c.luc).pha === 'hit' && L.hoiTho(c.luc).tien < 0.1));
  ok('nhịp thở 4 – 6: sáu hơi mỗi phút', L.HIT + L.THO === 10 && L.hoiTho(3.9).pha === 'hit' && L.hoiTho(4.1).pha === 'tho' && L.hoiTho(10.1).pha === 'hit');
  const o = L.dangO(125, lich);
  ok('biết đang ở chặng nào, còn bao lâu', o.i === 1 && o.conChang === 115 && o.con === lich.tong - 125);
  ok('qua bảy chặng là phần ngồi yên', L.dangO(7 * 120 + 1, lich).ket === true && L.dangO(7 * 120 - 0.01, lich).i === 6);
  ok('đồng hồ đếm ngược', L.dongHo(75) === '1:15' && L.dongHo(0.2) === '0:01' && L.dongHo(-3) === '0:00');
}

console.log('\n— Thiền riêng một luân xa —');
/* Người dùng hỏi "người dùng không thiền riêng một luân xa đang tắc nghẽn được hả". */
for (const phut of L.PHUT_MOT) {
  const D = phut * 60, sai = [];
  LX.forEach((lx, i) => {
    const lich = L.lichBuoi(phut, [i]), soChuong = Math.floor((D - 6 - 0.3) / 30) + 1;
    if (lich.tong !== D + 60) sai.push(`${lx.so}: dài ${lich.tong}`);
    if (lich.nen.length !== 1 || lich.nen[0].i !== i) sai.push(`${lx.so}: đàn`);
    if (lich.chuong.length !== soChuong + 3 || lich.chuong.some(c => c.i !== i)) sai.push(`${lx.so}: chuông`);
    if (L.muc(D / 2, lich.nen[0].ds) !== 1 || L.muc(D + 46, lich.nen[0].ds) !== 0) sai.push(`${lx.so}: âm lượng`);
    if (L.dangO(D / 2, lich).i !== i || L.dangO(D / 2, lich).k !== 0 || !L.dangO(D + 1, lich).ket) sai.push(`${lx.so}: chặng`);
  });
  ok(`${phut} phút: luân xa nào cũng chỉ có đàn và chuông của chính nó, ${D / 60 + 1} phút gồm phút ngồi yên`, !sai.length, sai.join(', '));
}

console.log('\n— Trình phát: hẹn đúng lịch lên luồng âm thanh —');
(async () => {
  /* DOM giả tối thiểu, như test-sao.js */
  const nut = (cls = '') => {
    const o = {
      className: cls, innerHTML: '', textContent: '', style: { setProperty() {} }, children: [], _q: {}, dataset: {}, hidden: false, id: '',
      classList: { _s: new Set(cls.split(' ').filter(Boolean)), add(...a) { a.forEach(x => this._s.add(x)); },
        remove(...a) { a.forEach(x => this._s.delete(x)); }, toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); },
        contains(x) { return this._s.has(x); } },
      setAttribute() {}, addEventListener() {}, removeEventListener() {},
      appendChild(c) { o.children.push(c); return c; },
      querySelector(sel) { const k = String(sel).replace(/[.#]/g, ''); return o._q[k] || (o._q[k] = nut(k)); },
      querySelectorAll() { return []; },
    };
    return o;
  };
  const suKien = [];
  global.self = global; global.window = global;
  global.document = { body: nut('body'), hidden: false, createElement: () => nut(), addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = (e) => suKien.push(e.type);
  global.Event = function (t) { this.type = t; };
  const kho = new Map();
  global.localStorage = { getItem: (k) => (kho.has(k) ? kho.get(k) : null), setItem: (k, v) => kho.set(k, String(v)) };
  global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
  const ghi = { nguon: [], gain: [] };
  const thamSo = () => {
    const p = { value: 1, su: [] };
    for (const k of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues'])
      p[k] = (...a) => { p.su.push([k, ...a]); return p; };
    return p;
  };
  global.AudioContext = function () {
    const ac = { currentTime: 1.5, state: 'running', destination: {},
      createGain() { const g = { gain: thamSo(), connect() {}, disconnect() {} }; ghi.gain.push(g); return g; },
      createBuffer(ch, n, sr) { const d = Array.from({ length: ch }, () => new Float32Array(n)); return { length: n, sampleRate: sr, getChannelData: (i) => d[i] }; },
      createBufferSource() { const s = { buffer: null, loop: false, connect() {}, start(t) { s.batDau = t; }, stop(t) { if (t !== undefined) s.dung = t; else s.dungNgay = true; }, onended: null }; ghi.nguon.push(s); return s; },
      resume() { ac.state = 'running'; return Promise.resolve(); }, suspend() { ac.state = 'suspended'; return Promise.resolve(); }, close() { ac.state = 'closed'; } };
    return ac;
  };
  global.TDTD_LUANXA_AM = L;
  require('../assets/thienluanxa.js');
  const P = global.TDTD_LUANXA;
  P.mo();
  ghi.nguon.length = 0; ghi.gain.length = 0;
  P._batDau();
  ok('bấm Bắt đầu: chuẩn bị âm thanh', P._trangThai() === 'chuanBi');
  for (let k = 0; k < 200 && P._trangThai() !== 'phat'; k++) await new Promise(r => setTimeout(r, 20));
  ok('âm thanh xong thì phát', P._trangThai() === 'phat');
  const lich = P._lich(), t0 = 1.6;
  const nguon = ghi.nguon.slice(1);                       // bỏ mẫu lặng mở tiếng
  const dan = nguon.filter(s => s.loop), chuong = nguon.filter(s => !s.loop && s.buffer && s.buffer.length > 1);
  ok('bảy đoạn đàn lặp, mỗi đoạn chạy đúng khoảng của nó', dan.length === 7 &&
     dan.every((s, i) => Math.abs(s.batDau - (t0 + lich.nen[i].chay)) < 1e-9 && Math.abs(s.dung - (t0 + lich.nen[i].dung)) < 1e-9));
  ok('mọi tiếng chuông hẹn sẵn đúng giây, đúng chuông của luân xa đó', chuong.length === lich.chuong.length &&
     chuong.every((s, k) => Math.abs(s.batDau - (t0 + lich.chuong[k].luc)) < 1e-9 && s.buffer.length === L.chuong(LX[lich.chuong[k].i].hz).length));
  const kieu = { dat: 'setValueAtTime', thang: 'linearRampToValueAtTime', mu: 'exponentialRampToValueAtTime' };
  const gDan = ghi.gain.filter((g, k) => k >= 1 && k <= 14 && k % 2 === 1);   // sau gain tổng: mỗi đoạn đàn một gain lịch, một gain mức
  ok('lịch âm lượng từng đoạn đàn đặt đúng từng mốc lên luồng âm thanh', gDan.length === 7 && gDan.every((g, i) =>
     g.gain.value === 0 && g.gain.su.length === lich.nen[i].ds.length &&
     g.gain.su.every(([k, v, t], j) => k === kieu[lich.nen[i].ds[j].kieu] && v === lich.nen[i].ds[j].gt && Math.abs(t - (t0 + lich.nen[i].ds[j].luc)) < 1e-9)));
  const moc = nguon.find(s => s.buffer && s.buffer.length === 1);
  ok('mốc hết buổi đặt đúng giây cuối', moc && Math.abs(moc.batDau - (t0 + lich.tong)) < 1e-9);
  ok('tổng số nguồn: 7 đàn + chuông + 1 mốc', P._soNut() === 7 + lich.chuong.length + 1);
  P._tamDung();
  ok('tạm dừng: đứng cả đồng hồ âm thanh', P._trangThai() === 'dung' && P._ac() === 'suspended');
  P._tiepTuc();
  ok('tiếp tục', P._trangThai() === 'phat' && P._ac() === 'running');
  moc.onended();
  ok('hết buổi: tự về màn chọn, báo cho app biết tiếng đã tắt', P._trangThai() === 'nghi' && suKien.includes('tdtd-ngu-het') && P._soNut() === 0);
  ok('mọi nguồn đã được dừng', nguon.every(s => s === moc || s.dungNgay || s.dung !== undefined));

  P._batDau();
  for (let k = 0; k < 200 && P._trangThai() !== 'phat'; k++) await new Promise(r => setTimeout(r, 20));
  P._tat();
  ok('bấm Tắt: nhỏ dần 1,5 giây rồi mới dừng', P._trangThai() === 'tat');
  await new Promise(r => setTimeout(r, 1700));
  ok('…rồi dừng hẳn', P._trangThai() === 'nghi');
  P._batDau();
  for (let k = 0; k < 200 && P._trangThai() !== 'phat'; k++) await new Promise(r => setTimeout(r, 20));
  P.dong();
  ok('đóng ngôi sao là dừng ngay, không để tiếng chạy ngầm', P._trangThai() === 'nghi' && !P.dangPhat());

  /* Thiền riêng: chọn Anāhata, 5 phút (như người dùng bấm chọn rồi đóng mở lại ngôi sao) */
  kho.set('tdtd.luanxa', JSON.stringify({ che: 'mot', lx: 3, phutMot: 5, phut: 2, am: 40 }));
  P.mo();
  const manChon = (global.document.body.children.find(c => c.className === 'luanxa') || nut())._q['lx-chon'].innerHTML;
  ok('màn chọn: có ô chọn luân xa, nút ghi rõ thiền luân xa nào, và nói thẳng app không đo được luân xa nào "tắc"',
     manChon.includes('lx-chonlx') && manChon.includes('Bắt đầu thiền Anāhata') && manChon.includes('không đo được luân xa nào đang “tắc”'));
  ok('mỗi luân xa trong danh sách có nút "Thiền riêng luân xa này"', (manChon.match(/class="lx-rieng"/g) || []).length === 7);
  ghi.nguon.length = 0; ghi.gain.length = 0;
  P._batDau();
  for (let k = 0; k < 200 && P._trangThai() !== 'phat'; k++) await new Promise(r => setTimeout(r, 20));
  const lichMot = P._lich(), ngMot = ghi.nguon.slice(1);
  const danMot = ngMot.filter(s => s.loop), chMot = ngMot.filter(s => !s.loop && s.buffer && s.buffer.length > 1);
  const mau = L.tanpura(LX[3].hz, SR, L.ngauNhien(103)), duLieu = danMot[0] && danMot[0].buffer.getChannelData(0);
  ok('thiền riêng Anāhata 5 phút: buổi dài 6 phút, đúng một đoạn đàn', lichMot.tong === 360 && lichMot.ds.join() === '3' && danMot.length === 1);
  ok('đoạn đàn đó đúng là đàn của Anāhata (Sa 159,75 Hz), không phải luân xa gốc',
     !!duLieu && [0, 1000, 99999, 300000].every(j => duLieu[j] === mau[j]));
  ok('mọi tiếng chuông đều là chuông 639 Hz của Anāhata', chMot.length === lichMot.chuong.length && chMot.every(s => s.buffer.length === L.chuong(639).length));
  P.dong();

  console.log('\n— Hình —');
  const canh = (svg) => ((svg.match(/<g class="lx-canh"[^>]*>([\s\S]*?)<\/g>/) || [])[1] || '').split('<path').length - 1;
  ok('hoa sen vẽ đúng số cánh 4, 6, 10, 12, 16, 2; nghìn cánh vẽ ba vòng', [0, 1, 2, 3, 4, 5].every(i => canh(P._veSen(i)) === LX[i].canh) && canh(P._veSen(6)) === 96,
     [0, 1, 2, 3, 4, 5, 6].map(i => canh(P._veSen(i))).join(','));
  ok('giữa hoa sen có chữ chủng tử Devanagari; đỉnh đầu không có', [0, 1, 2, 3, 4, 5].every(i => P._veSen(i).includes(LX[i].deva)) && !/<text/.test(P._veSen(6)));
  /* Cung tròn SVG có bán kính nhỏ hơn nửa dây cung thì trình duyệt tự nới bán kính ra — lưỡi liềm của
     Svādhiṣṭhāna từng dẹt thành không vì vậy. Mọi cung trong mọi hoa sen phải đủ bán kính. */
  const cungHong = [];
  for (let i = 0; i < 7; i++) for (const d of (P._veSen(i).match(/d="([^"]*A[^"]*)"/g) || [])) {
    const so = d.slice(3, -1).match(/[MA]|-?[\d.]+/g); let x = 0, y = 0;
    for (let k = 0; k < so.length;) {
      if (so[k] === 'M') { x = +so[k + 1]; y = +so[k + 2]; k += 3; }
      else if (so[k] === 'A') { const r = +so[k + 1], x1 = +so[k + 6], y1 = +so[k + 7]; if (r < Math.hypot(x1 - x, y1 - y) / 2 - 1e-6) cungHong.push(`${LX[i].ten}: r${r}`); x = x1; y = y1; k += 8; }
      else k++;
    }
  }
  ok('mọi cung tròn trong hoa sen đủ bán kính (lưỡi liềm không bị dẹt)', cungHong.length === 0, cungHong.join(', '));
  ok('chữ chủng tử giữa lưỡi liềm tô trắng trên nền tối', /<text[^>]*fill="#fff">वं<\/text>/.test(P._veSen(1).replace(/\s+/g, ' ')));
  ok('cánh sen tô màu kinh văn', [0, 1, 2, 3, 4, 5, 6].every(i => P._veSen(i).includes(`fill="${LX[i].sen.canh}"`)));
  ok('thân người: chấm của luân xa đang tới sáng lên, phát quang theo màu cầu vồng', [0, 3, 6].every(i => P._veThan(i).includes(`class="lx-quang" cx="50" cy="${[96, 85, 75, 59, 41, 20, 8][i]}" r="10" fill="${LX[i].mau}"`)) &&
     (P._veThan(3).match(/lx-quang/g) || []).length === 1);
  ok('hình ở màn chọn: đủ bảy chấm chạm được, có số thứ tự; hình lúc thiền thì không chạm', (P._veThan(2, 'chon').match(/data-lx="\d"/g) || []).length === 7 &&
     (P._veThan(2, 'chon').match(/<text/g) || []).length === 7 && !/data-lx/.test(P._veThan(2)));
  ok('hình minh hoạ hiện đều cả bảy vị trí (không mờ hẳn chấm chưa tới như lúc đang thiền)',
     (P._veThan(0, 'xem').match(/opacity="0\.5"/g) || []).length === 6 && (P._veThan(0).match(/opacity="0\.25"/g) || []).length === 6);
  /* Màn chọn: hình người ở đầu màn sáng đúng luân xa đang chọn; trong danh sách, mỗi luân xa có hình riêng sáng chỗ của nó */
  kho.set('tdtd.luanxa', JSON.stringify({ che: 'mot', lx: 4, phutMot: 10, phut: 2, am: 40 }));
  P.mo();
  const man = (global.document.body.children.find(c => c.className === 'luanxa') || nut())._q['lx-chon'].innerHTML;
  const dau = (man.match(/<div class="lx-hinh-ve">([\s\S]*?)<\/svg>/) || [])[1] || '';
  ok('đầu màn chọn có hình người, sáng đúng luân xa đang chọn (Viśuddha, hõm cổ)', /class="lx-cham sang" data-lx="4"/.test(dau) && (dau.match(/lx-quang/g) || []).length === 1 &&
     man.includes('<p class="lx-ten">Viśuddha</p>'));
  const nho = man.split('class="lx-mot-nguoi"').slice(1);
  ok('mỗi luân xa trong danh sách có hình người riêng, sáng đúng chỗ của luân xa đó', nho.length === 7 &&
     nho.every((h, k) => h.includes(`class="lx-quang" cx="50" cy="${[96, 85, 75, 59, 41, 20, 8][k]}"`)));
  P.dong();

  console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
  process.exit(fail ? 1 : 0);
})();
