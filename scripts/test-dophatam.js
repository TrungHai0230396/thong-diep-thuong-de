/* Kiểm thử bộ đo phát âm: node scripts/test-dophatam.js

   Phần 1 chạy ở mọi máy: tín hiệu dựng bằng toán, kiểm các viên gạch (FFT, nhận nguyên âm, kiểm
   chất lượng bản thu). Phần 2 cần máy đọc của macOS (lệnh `say`): tám giọng tiếng Anh đọc từng từ
   trong cặp, từ đúng phải đạt, từ còn lại phải trượt. Điều kiện gắt nhất là KHÔNG BAO GIỜ chấm đạt
   cho từ sai — báo "đúng rồi" khi người ta nói sai là hỏng cả bài học. Chấm trượt oan thì còn đỡ,
   và ở chỗ ồn thì phải báo "chỗ ồn" thay vì chấm trượt. */
const D = require('../assets/dophatam.js');
const M = require('./mau-am.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

/* ---------- phần 1: tín hiệu dựng ---------- */
console.log('\n— Viên gạch —');
{
  const n = 1024, re = new Float64Array(n), im = new Float64Array(n);
  for (let i = 0; i < n; i++) re[i] = Math.sin(2 * Math.PI * 37 * i / n);
  D.fft(re, im);
  let top = 0;
  for (let k = 1; k < n / 2; k++) if (re[k] ** 2 + im[k] ** 2 > re[top] ** 2 + im[top] ** 2) top = k;
  ok('FFT: sóng sin 37 chu kỳ ra đỉnh ở ô 37', top === 37, `ô ${top}`);
}
const SR = 22050;
let hat = 7;
const ngau = () => { hat = (hat * 1664525 + 1013904223) >>> 0; return hat / 4294967296 * 2 - 1; };
function dung(ph) {                                   // ghép các khúc: { lang | nguyen | rit, dai }
  const ds = [];
  for (const [loai, dai, f0 = 150] of ph) {
    const m = Math.round(dai * SR);
    for (let i = 0; i < m; i++) {
      const t = i / SR, vo = Math.min(1, t / .01, (dai - t) / .01);
      let v = 0;
      if (loai === 'nguyen') for (let h = 1; h <= 12; h++) v += Math.sin(2 * Math.PI * f0 * h * t) / h * (h < 4 ? 1 : .3);
      if (loai === 'rit') { v = ngau(); }
      ds.push((loai === 'nguyen' ? .25 * v : loai === 'rit' ? .05 * v : 0) * vo);
    }
  }
  let x = Float32Array.from(ds);
  x = M.tronPhong(x, 45, 3);
  return M.tronOn(x, 70, 4);
}
/* tiếng rít dựng bằng nhiễu thì phải lọc cho dồn lên dải cao như /s/ thật */
function locCao(x) { const y = new Float32Array(x.length); let a = 0; const k = Math.exp(-2 * Math.PI * 4000 / SR);
  for (let i = 1; i < x.length; i++) { a = k * (a + x[i] - x[i - 1]); y[i] = a; } return y; }
{
  const x = dung([['lang', .3], ['nguyen', .3], ['lang', .3]]);
  const v = D.nguyenAm(D.phanTich(x, SR));
  ok('nguyên âm dựng dài 300 ms thì đo ra quanh 300 ms', v && Math.abs(v.dai - 300) <= 25, v ? `${v.dai} ms` : 'không thấy');
  const q = D.chatLuong(D.phanTich(M.tronOn(new Float32Array(SR), 60, 9), SR));
  ok('bản thu chỉ có tiếng ồn thì báo chưa nghe thấy gì, không chấm', q && ['khong', 'nho', 'on'].includes(q.loi), q && q.loi);
  const vo = Float32Array.from(x, v => Math.max(-1, Math.min(1, v * 30)));
  ok('bản thu bị rè vì quá to thì báo, không chấm', (D.chatLuong(D.phanTich(vo, SR)) || {}).loi === 'vo');
  const s = dung([['lang', .3], ['nguyen', .25], ['lang', .3]]);
  const r = locCao(dung([['lang', .3 + .25], ['rit', .16], ['lang', .14]]));
  const coS = s.map((v, i) => v + (r[i] || 0) * 6);
  ok('nguyên âm rồi tiếng rít dải cao 160 ms: có đuôi /s/', D.cham('duoiS', [coS], SR).dat === true, D.cham('duoiS', [coS], SR).chu);
  ok('chỉ có nguyên âm: không có đuôi /s/', D.cham('duoiS', [s], SR).dat === false);
  ok('một từ và hai từ', D.soTu('duoiS') === 1 && D.soTu('xuyt') === 2 && D.soTu('khong-co') === 0);
}

/* ---------- phần 2: giọng mẫu ---------- */
if (!M.sayDuoc()) {
  console.log('\n(máy này không có lệnh `say` của macOS — bỏ qua phần giọng mẫu)');
} else {
  const MOT = {
    duoiS: [['books', 'book'], ['cats', 'cat'], ['eyes', 'eye'], ['dogs', 'dog']],
    bat: [['seat', 'sea'], ['night', 'nigh'], ['made', 'may'], ['back', 'bah'], ['like', 'lie'], ['week', 'we']],
    cumS: [['stop', 'top'], ['spin', 'pin'], ['school', 'cool'], ['star', 'tar']],
  };
  const HAI = {
    xuyt: [['she', 'see'], ['ship', 'sip'], ['sheet', 'seat'], ['shoe', 'sue']],
    vot: [['pat', 'bat'], ['pie', 'buy'], ['pea', 'bee'], ['pack', 'back']],
    doDai: [['sheep', 'ship'], ['feet', 'fit'], ['cheap', 'chip'], ['seat', 'sit'], ['leave', 'live']],
  };
  /* Giọng mẫu không dùng được cho một phép đo thì bỏ, và nói rõ vì sao — không bỏ để cho đẹp số:
     - vot: Rishi là tiếng Anh Ấn Độ, vốn KHÔNG bật hơi ở /p/; giọng Daniel của máy đọc thì rung cổ
       ngay từ khung đầu của "pat", không có tiếng bật lẫn luồng hơi (đã in từng khung ra xem).
     - doDai: giọng Karen của máy đọc đọc "sheep" và "ship" dài bằng nhau (đo ra 225 và 220 ms). */
  const BO = { vot: ['Daniel', 'Rishi'], doDai: ['Karen'] };
  const CAN = { duoiS: 31, bat: 43, cumS: 31, xuyt: 31, vot: 24, doDai: 33 };
  const kq = {};

  console.log('\n— Tám giọng mẫu, phòng yên —');
  for (const [k, cap] of Object.entries(MOT)) {
    let d = 0, s = 0, t = 0;
    for (const [a, b] of cap) for (const g of M.GIONG) {
      const A = M.mau(a, g), B = M.mau(b, g);
      const ra = D.cham(k, [A.x], A.sr), rb = D.cham(k, [B.x], B.sr);
      t++; if (ra.dat) d++; if (rb.dat) s++;
      (kq[k] = kq[k] || []).push({ a, b, g, dat: !!ra.dat });
    }
    ok(`${k}: không bao giờ chấm đạt cho từ sai`, s === 0, `${s}/${t} lọt`);
    ok(`${k}: từ đúng đạt từ ${CAN[k]}/${t}`, d >= CAN[k], `${d}/${t}`);
  }
  for (const [k, cap] of Object.entries(HAI)) {
    let d = 0, s = 0, t = 0;
    for (const [a, b] of cap) for (const g of M.GIONG) {
      if ((BO[k] || []).includes(g)) continue;
      const A = M.mau(a, g), B = M.mau(b, g);
      const r1 = D.cham(k, [A.x, B.x], A.sr), r2 = D.cham(k, [B.x, A.x], A.sr);
      t++; if (r1.dat) d++; if (r2.dat) s++;
    }
    ok(`${k}: nói đảo thứ tự hai từ thì không bao giờ đạt`, s === 0, `${s}/${t} lọt`);
    ok(`${k}: nói đúng thứ tự thì đạt từ ${CAN[k]}/${t}`, d >= CAN[k], `${d}/${t}`);
  }

  console.log('\n— Chen âm "ơ" vào giữa (sờ-top) —');
  {
    let chen = 0, dat = 0, t = 0;
    for (const w of ['suh top', 'suh pin', 'suh cool']) for (const g of M.GIONG) {
      const A = M.mau(w, g), r = D.cham('cumS', [A.x], A.sr);
      t++; if (r.dat) dat++; if (r.chen >= 40) chen++;
    }
    ok('nói "sờ-top" thì không bao giờ được chấm đạt', dat === 0, `${dat}/${t}`);
    ok('và phần lớn được chỉ đúng lỗi là chen âm "ơ"', chen >= 20, `${chen}/${t}`);
  }

  console.log('\n— Nói nhỏ —');
  {
    let giong = 0, t = 0;
    for (const [k, ds] of Object.entries(kq)) for (const m of ds.filter((_, i) => i % 3 === 0)) {
      const A = M.mau(m.a, m.g);
      const r = D.cham(k, [M.nhan(A.x, .05)], A.sr);
      t++; if (!!r.dat === m.dat) giong++;
    }
    ok('nhỏ đi 20 lần (−26 dB) vẫn chấm y như cũ', giong === t, `${giong}/${t}`);
  }

  console.log('\n— Chỗ ồn: báo ồn chứ không chấm trượt oan, và không bao giờ chấm đạt cho từ sai —');
  for (const [ten, bien] of [
    ['nhiễu trắng 35 dB', (w, g) => M.mau(w, g, 35)],
    ['tiếng ù trong phòng 28 dB', (w, g) => ({ ...M.mau(w, g), x: M.tronPhong(M.mau(w, g).x, 28, w.length) })],
  ]) {
    let lot = 0, dung2 = 0, cham2 = 0, bao = 0, t = 0;
    for (const [k, cap] of Object.entries(MOT)) for (const [a, b] of cap) for (const g of M.GIONG.slice(0, 4)) {
      const A = bien(a, g), B = bien(b, g);
      const ra = D.cham(k, [A.x], A.sr), rb = D.cham(k, [B.x], B.sr);
      t++; if (rb.dat) lot++;
      if (ra.loi) bao++; else { cham2++; if (ra.dat) dung2++; }
    }
    ok(`${ten}: không chấm đạt cho từ sai`, lot === 0, `${lot}/${t}`);
    ok(`${ten}: lần nào đã chấm thì đúng từ 85%`, cham2 === 0 || dung2 / cham2 >= .85,
       `chấm ${cham2} lần, đúng ${dung2}; báo ồn ${bao} lần`);
  }
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi\n`);
process.exit(fail ? 1 : 0);
