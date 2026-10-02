/* Kiểm thử Nhạc ngủ: node scripts/test-ngu.js

   Kiểm phần thuần (rungu.js): âm có đúng là thứ nó nói không (phổ ồn hồng, ồn nâu, tần số nhịp hai tai,
   hợp âm 432 Hz, nhịp sóng 10 giây, nhạc 60 phách mỗi phút), đoạn lặp có nối liền không, và lịch nhỏ
   dần — chạy lịch đó qua một bộ mô phỏng AudioParam theo đúng luật của Web Audio — có ra đúng đường
   âm lượng không. Đường âm lượng thật trong trình duyệt đã đối chiếu riêng bằng OfflineAudioContext. */
const fs = require('fs');
const path = require('path');
const X = require('../assets/rungu.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };
const dB = (x) => 20 * Math.log10(x);

/* FFT cơ số 2 tại chỗ, đủ để đo phổ */
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      }
    }
  }
}
/* Năng lượng mỗi quãng tám, trung bình trên nhiều khung 8192 mẫu */
function quangTam(x, sr, bang) {
  const N = 8192, e = bang.map(() => 0);
  for (let o = 0; o + N <= x.length; o += N) {
    const re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[o + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
    fft(re, im);
    for (let k = 1; k < N / 2; k++) {
      const f = k * sr / N, p = re[k] * re[k] + im[k] * im[k];
      bang.forEach((b, j) => { if (f >= b && f < 2 * b) e[j] += p; });
    }
  }
  return e.map(v => 10 * Math.log10(v));
}
/* Goertzel: năng lượng đúng tại một tần số, trên cả đoạn (80 giây chứa tròn chu kỳ nên không rò) */
function tai(x, f, sr) {
  const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w);
  let s1 = 0, s2 = 0;
  for (let i = 0; i < x.length; i++) { const s = x[i] + c * s1 - s2; s2 = s1; s1 = s; }
  return Math.sqrt(s1 * s1 + s2 * s2 - c * s1 * s2) / x.length;
}

console.log('\n— Danh sách âm —');
ok('sáu âm, mã không trùng', X.BAI.length === 6 && new Set(X.BAI.map(b => b.id)).size === 6, X.BAI.map(b => b.id).join(', '));
ok('âm nào cũng có tên, mô tả, lời nói rõ bằng chứng, và hàm tạo', X.BAI.every(b => b.ten && b.mo && b.bc && b.bc.length > 60 && typeof b.ham === 'function'));
ok('chỉ nhịp hai tai mới ghi "cần tai nghe"', X.BAI.filter(b => b.taiNghe).map(b => b.id).join() === 'delta');
ok('hẹn 15, 30, 45, 60, 90 phút — không có "cả đêm"', X.PHUT.join() === '15,30,45,60,90');

console.log('\n— Tạo từng âm —');
const SO = Math.round(X.SR * X.DAI), AM = {};
for (const b of X.BAI) {
  const t = Date.now(), k = X.tao(b.id), ms = Date.now() - t;
  AM[b.id] = k;
  let nan = 0, dinh = 0;
  for (const x of [k.L, k.R]) for (let i = 0; i < x.length; i++) { if (!Number.isFinite(x[i])) nan++; dinh = Math.max(dinh, Math.abs(x[i])); }
  ok(`${b.id}: hai kênh, mỗi kênh ${SO} mẫu (80 giây), không có số hỏng, đỉnh ${dinh.toFixed(2)} không vỡ tiếng`,
     k.L.length === SO && k.R.length === SO && nan === 0 && dinh <= 0.95, `${ms} ms`);
}
{
  const to = X.BAI.map(b => dB(X.doTo(AM[b.id].L, AM[b.id].R, X.SR)));
  const lech = Math.max(...to) - Math.min(...to);
  ok('sáu âm to xấp xỉ nhau: chênh không quá 8 dB (tiếng nâu, tiếng sóng nặng phần trầm nên nhỏ hơn chút)', lech <= 8,
     X.BAI.map((b, i) => `${b.id} ${to[i].toFixed(1)}`).join(', '));
  const a = X.tao('mua'), b = AM.mua;
  ok('cùng hạt thì ra cùng âm (kiểm thử lặp lại được)', a.L.every((v, i) => v === b.L[i]));
}

console.log('\n— Đoạn lặp nối liền —');
{
  /* Lọc vòng phải đúng bằng chạy bộ lọc trên tín hiệu lặp mãi: so với chạy trên hai bản nối nhau */
  const r = X.ngauNhien(5), n = 30000, x = new Float32Array(n);
  for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
  const y = X.locVong(x, X.locHong()), f = X.locHong();
  let sai = 0;
  for (let i = 0; i < n; i++) f(x[i]);
  for (let i = 0; i < n; i++) sai = Math.max(sai, Math.abs(f(x[i]) - y[i]));
  ok('lọc vòng = lọc trên tín hiệu lặp vô hạn (sai < 1e-5)', sai < 1e-5, sai.toExponential(1));
}
for (const b of X.BAI) {
  const k = AM[b.id];
  let tot = true, ghi = '';
  for (const x of [k.L, k.R]) {
    const n = x.length;
    /* mức mẫu: bước nhảy qua mối nối không được lớn hơn 99,9% các bước khác */
    const buoc = new Float32Array(n - 1);
    for (let i = 1; i < n; i++) buoc[i - 1] = Math.abs(x[i] - x[i - 1]);
    const p = Float32Array.from(buoc).sort()[Math.floor((n - 1) * 0.999)], noi = Math.abs(x[0] - x[n - 1]);
    /* mức độ to: RMS từng khung 20 ms; khung cuối sang khung đầu không được đổi nhiều hơn 99,9% các cặp khung liền nhau */
    const W = Math.round(X.SR * 0.02), m = Math.floor(n / W), r = [];
    for (let j = 0; j < m; j++) { let s = 0; for (let i = j * W; i < (j + 1) * W; i++) s += x[i] * x[i]; r.push(Math.sqrt(s / W) + 1e-9); }
    const doi = []; for (let j = 1; j < m; j++) doi.push(Math.abs(Math.log(r[j] / r[j - 1])));
    doi.sort((a, c) => a - c);
    const pr = doi[Math.floor(doi.length * 0.999)], qua = Math.abs(Math.log(r[0] / r[m - 1]));
    if (noi > p || qua > pr) { tot = false; ghi = `mối nối ${noi.toFixed(3)} / ${p.toFixed(3)}, độ to ${qua.toFixed(2)} / ${pr.toFixed(2)}`; }
  }
  ok(`${b.id}: cuối đoạn nối vào đầu đoạn không có tiếng "tách"`, tot, ghi);
}

console.log('\n— Âm có đúng là thứ nó nói —');
{
  const r = X.ngauNhien(9), n = 1 << 19, w = new Float32Array(n);
  for (let i = 0; i < n; i++) w[i] = r() * 2 - 1;
  const BANG = [63, 125, 250, 500, 1000, 2000];
  const hong = quangTam(X.locVong(w, X.locHong()), X.SR, BANG);
  const lechHong = Math.max(...hong) - Math.min(...hong);
  ok('ồn hồng: năng lượng các quãng tám 63 Hz–4 kHz bằng nhau (lệch dưới 1,5 dB)', lechHong < 1.5,
     hong.map(v => (v - hong[0]).toFixed(1)).join(' '));
  const nau = quangTam(AM.nau.L, X.SR, [63, 125, 250, 500]);
  const doc = (nau[3] - nau[0]) / 3;
  ok('ồn nâu: mỗi quãng tám bớt khoảng 3 dB năng lượng (dốc −6 dB/quãng tám của phổ)', doc < -2 && doc > -4, `${doc.toFixed(2)} dB mỗi quãng tám`);
}
{
  const { L, R } = AM.delta, sr = X.SR;
  const L250 = tai(L, 250, sr), L253 = tai(L, 253, sr), R250 = tai(R, 250, sr), R253 = tai(R, 253, sr);
  ok('nhịp hai tai: tai trái 250 Hz, tai phải 253 Hz, không lẫn sang nhau', dB(L250 / L253) > 40 && dB(R253 / R250) > 40,
     `trái ${dB(L250 / L253).toFixed(0)} dB, phải ${dB(R253 / R250).toFixed(0)} dB`);
  ok('chênh 3 Hz — dải delta (dưới 4 Hz), đúng thông số Jirakittayakorn & Wongsawat 2018', X.DELTA.phai - X.DELTA.trai === 3 && X.DELTA.trai === 250);
  ok('80 giây chứa tròn chu kỳ của cả hai tần số (lặp không lệch pha)', Number.isInteger(250 * X.DAI) && Number.isInteger(253 * X.DAI));
}
{
  const { L, R } = AM.tan432, sr = X.SR, m = new Float32Array(L.length);
  for (let i = 0; i < m.length; i++) m[i] = L[i] + R[i];
  const co = X.LA432.map(f => tai(m, f, sr) + tai(m, f - 0.05, sr) + tai(m, f + 0.05, sr));
  const khong = [110, 220, 440].map(f => tai(m, f, sr));
  ok('432 Hz: có đủ La 108, Mi 162, La 216, Đô♯ 270, Mi 324, La 432', co.every(v => v > 1e-3), co.map(v => v.toExponential(1)).join(' '));
  ok('không có La chuẩn 440 Hz (và 110, 220) — chỉnh đúng theo 432', Math.max(...khong) < Math.min(...co) / 100);
  ok('các quãng là tỉ lệ nguyên: quãng năm 3/2, quãng ba 5/4', X.LA432[1] / X.LA432[0] === 1.5 && X.LA432[3] / X.LA432[2] === 1.25);
}
{
  const { nhip, chuKy } = AM.songBien;
  ok('sóng biển: mỗi con sóng 10 giây = 6 nhịp thở mỗi phút', chuKy === 10 && 60 / chuKy === 6);
  const n = nhip.length, tb = nhip.reduce((a, b) => a + b, 0) / n;
  const tuongQuan = (lag) => { let s = 0, s0 = 0; for (let i = 0; i < n; i++) { s += (nhip[i] - tb) * (nhip[(i + lag) % n] - tb); s0 += (nhip[i] - tb) ** 2; } return s / s0; };
  ok('nhịp sóng lặp đúng 10 giây (tự tương quan ở 10 giây > 0,9, ở 5 giây âm)', tuongQuan(200) > 0.9 && tuongQuan(100) < 0, `${tuongQuan(200).toFixed(2)} / ${tuongQuan(100).toFixed(2)}`);
  let dinh = 0; for (let i = 0; i < n; i++) if (nhip[i] > 0.5 && nhip[i] >= nhip[(i + n - 1) % n] && nhip[i] > nhip[(i + 1) % n]) dinh++;
  ok('đúng 8 đỉnh sóng trong 80 giây', dinh === 8, `${dinh}`);
  const { L } = AM.songBien, S = X.SR;
  let toNhat = 0, nhoNhat = Infinity;
  for (let j = 0; j < 80; j++) { let s = 0; for (let i = j * S; i < (j + 1) * S; i++) s += L[i] * L[i]; const v = Math.sqrt(s / S); toNhat = Math.max(toNhat, v); nhoNhat = Math.min(nhoNhat, v); }
  ok('không bao giờ im hẳn giữa hai con sóng (giây nhỏ nhất vẫn trên 1/6 giây to nhất)', nhoNhat > toNhat / 6, `${dB(nhoNhat / toNhat).toFixed(1)} dB`);
}
{
  const { giai } = AM.nhacRu;
  ok('nhạc ru: 60 phách mỗi phút', X.PHACH === 1);
  ok('mọi nốt giai điệu rơi đúng phách', giai.every(g => Number.isInteger(g.phach) && g.phach >= 0 && g.phach < 80));
  ok('giai điệu chỉ dùng năm nốt ngũ cung Fa Sol La Đô Rê', giai.every(g => [5, 7, 9, 0, 2].includes(g.midi % 12)));
  ok('thưa, có chỗ nghỉ: 15–60 nốt trong 80 phách', giai.length >= 15 && giai.length <= 60, `${giai.length} nốt`);
  ok('nốt không chồng lên nhau, không quá 4 phách', giai.every((g, i) => g.dai >= 1 && g.dai <= 4 && (i === 0 || giai[i - 1].phach + giai[i - 1].dai <= g.phach)));
  ok('vòng hợp âm kết ở Đô (át) để dẫn về Fa (chủ) khi lặp lại', X.HOP_AM[X.HOP_AM.length - 1].ten === 'C' && X.HOP_AM[0].ten === 'F' && X.HOP_AM.length * 8 === 80);
  ok('nốt cao nhất không quá La 5 (880 Hz): dải giữa, không chói', Math.max(...giai.map(g => X.tanSo(g.midi))) <= 880.01);
}

console.log('\n— Hẹn giờ —');
{
  const h30 = X.henGio(30), h15 = X.henGio(15), h90 = X.henGio(90);
  ok('30 phút: nhỏ dần 5 phút cuối, từ phút 25', h30.tong === 1800 && h30.giam === 300 && h30.batDauGiam === 1500);
  ok('15 phút: nhỏ dần 2,5 phút; 90 phút: không quá 10 phút', h15.giam === 150 && h90.giam === 600);
  ok('to dần 6 giây lúc đầu, khỏi giật mình', X.amLuong(0, h30) === 0 && Math.abs(X.amLuong(3, h30) - 0.5) < 1e-9 && X.amLuong(6, h30) === 1);
  ok('giữa lúc nhỏ dần là −30 dB: nhỏ đều theo dB', Math.abs(dB(X.amLuong(1650, h30)) + 30) < 1e-6);
  ok('hết giờ là im hẳn', X.amLuong(1800, h30) === 0 && X.amLuong(5000, h30) === 0);
  let giam = true;
  for (let t = 6; t < 1800; t += 0.5) if (X.amLuong(t + 0.5, h30) > X.amLuong(t, h30) + 1e-12) giam = false;
  ok('sau lúc to dần, âm lượng chỉ đứng yên hoặc nhỏ đi, không bao giờ to lại', giam);
  const k = X.keoDai(h30, 15);
  ok('+15 phút: giờ tắt lùi 15 phút, đoạn nhỏ dần giữ nguyên dài', k.tong === 2700 && k.giam === 300 && k.batDauGiam === 2400);
}
{
  /* Mô phỏng AudioParam theo luật Web Audio: setValueAtTime, linearRamp, exponentialRamp — dốc tính từ
     sự kiện ngay trước nó. Chạy lịch qua đây phải ra đúng amLuong. */
  const giaTri = (ds, t) => {
    let v = 0, tr = { luc: 0, gt: 0 };
    for (let i = 0; i < ds.length; i++) {
      const e = ds[i];
      if (t < e.luc) {
        if (e.kieu === 'thang') return tr.gt + (e.gt - tr.gt) * (t - tr.luc) / (e.luc - tr.luc);
        if (e.kieu === 'mu') return tr.gt * (e.gt / tr.gt) ** ((t - tr.luc) / (e.luc - tr.luc));
        return v;
      }
      v = e.gt; tr = e;
    }
    return v;
  };
  const h = X.henGio(30), ds = X.lich(h);
  ok('lịch có thứ tự thời gian', ds.every((e, i) => i === 0 || e.luc >= ds[i - 1].luc));
  let sai = 0;
  for (let t = 0; t < 1799.9; t += 0.25) sai = Math.max(sai, Math.abs(giaTri(ds, t) - X.amLuong(t, h)));
  ok('chạy lịch theo luật Web Audio ra đúng đường âm lượng (sai < 1e-9)', sai < 1e-9, sai.toExponential(1));
  const t = 1650, g = X.amLuong(t, h), h2 = X.keoDai(h, 15), ds2 = X.lich(h2, t, g);
  ok('kéo dài giữa lúc nhỏ dần: đứng ở đúng mức hiện tại, lên lại mức đủ trong 5 giây',
     ds2[0].luc === t && ds2[0].gt === g && ds2[1].kieu === 'thang' && ds2[1].luc === t + 5 && ds2[1].gt === 1);
  let sai2 = 0;
  for (let u = t + 5; u < h2.tong - 0.1; u += 0.25) sai2 = Math.max(sai2, Math.abs(giaTri(ds2, u) - X.amLuong(u, h2)));
  ok('sau khi kéo dài thì theo đúng đường mới', sai2 < 1e-9, sai2.toExponential(1));
}
ok('đồng hồ đếm ngược: 30:00, 1:00, 0:00, 1:01:40', [1800, 59.2, 0, 3700].map(X.dongHo).join(' ') === '30:00 1:00 0:00 1:01:40',
   [1800, 59.2, 0, 3700].map(X.dongHo).join(' '));

console.log('\n— Chạy làm Web Worker —');
{
  const src = fs.readFileSync(path.join(__dirname, '..', 'assets', 'rungu.js'), 'utf8');
  const giuSelf = global.self;
  global.WorkerGlobalScope = function () {};
  const nhan = [];
  global.self = Object.create(global.WorkerGlobalScope.prototype);
  global.self.postMessage = (m, chuyen) => nhan.push({ m, chuyen });
  new Function(src)();
  const coNghe = typeof global.self.onmessage === 'function';
  ok('trong worker thì tự nghe tin nhắn', coNghe);
  if (coNghe) {
    global.self.onmessage({ data: { id: 'songBien' } });
    global.self.onmessage({ data: { id: 'khong-co' } });
    const [a, b] = nhan;
    ok('trả về hai kênh và nhịp sóng, chuyển hẳn bộ nhớ thay vì chép',
       a && a.m.id === 'songBien' && a.m.L.length === SO && a.m.nhip && a.chuyen.length === 3);
    ok('âm không có thì báo lỗi, không treo', b && b.m.loi === true);
  }
  global.self = giuSelf; delete global.WorkerGlobalScope;
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
