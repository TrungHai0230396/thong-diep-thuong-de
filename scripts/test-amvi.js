/* Kiểm thử bộ tổng hợp âm vị: node scripts/test-amvi.js

   Không nghe được bằng tai trong Node, nên kiểm bằng cách ĐO PHỔ rồi đối chiếu số liệu ngữ âm
   học. Nếu /s/ không dồn năng lượng lên vùng cao, hay /iː/ không ra F2 cao, thì thứ sinh ra
   không phải âm đó — dù phát qua loa nghe vẫn "như tiếng gì đó".

   Hai tầng kiểm, vì hai thứ có thể hỏng độc lập:
   1. VIÊN GẠCH — đưa một xung vào bộ cộng hưởng, đỉnh phải nằm đúng tần số đã đặt.
   2. ÂM HOÀN CHỈNH — đo formant bằng LPC, cách chuẩn của ngữ âm học. LPC đọc F1 hơi thấp khi
      F1 gần với cao độ giọng, nên F1 để dung sai rộng, còn F2 F3 siết chặt. Quan trọng hơn cả
      số tuyệt đối là THỨ TỰ giữa các âm: /iː/ phải khác /ɪ/, /r/ phải khác /l/. */
const A = require('../assets/amvi.js');
const SR = 44100;

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

/* Goertzel: đo biên độ tại đúng một tần số. */
function bien(x, f, sr, tu, den) {
  const w = 2 * Math.PI * f / sr, c = 2 * Math.cos(w);
  let s0 = 0, s1 = 0, s2 = 0, n = 0;
  for (let i = tu; i < den; i++) {
    const h = .5 * (1 - Math.cos(2 * Math.PI * (i - tu) / (den - tu - 1)));
    s0 = h * x[i] + c * s1 - s2; s2 = s1; s1 = s0; n++;
  }
  return Math.sqrt(Math.abs(s1 * s1 + s2 * s2 - c * s1 * s2)) / (n || 1);
}
function pho(x, hetF, buoc, tu, den) {
  if (tu === undefined) {
    const g = Math.floor(x.length / 2), n = Math.min(Math.floor(SR * .12), x.length);
    tu = Math.max(0, g - (n >> 1)); den = tu + n;
  }
  const r = [];
  for (let f = buoc; f <= hetF; f += buoc) r.push([f, bien(x, f, SR, tu, den)]);
  return r;
}
function tron(p, roi) {
  const k = Math.max(1, Math.round(roi / (p[1][0] - p[0][0])));
  return p.map(([f], i) => {
    let s = 0, m = 0;
    for (let j = Math.max(0, i - k); j <= Math.min(p.length - 1, i + k); j++) { s += p[j][1]; m++; }
    return [f, s / m];
  });
}
const trongTam = (p) => { let a = 0, b = 0; for (const [f, m] of p) { a += f * m * m; b += m * m; } return b ? a / b : 0; };
const gat = (p) => nangLuong(p, 5000, 9000) / (nangLuong(p, 1000, 4000) || 1e-9);
const nangLuong = (p, lo, hi) => p.reduce((s, [f, m]) => f >= lo && f < hi ? s + m * m : s, 0);

/* Formant bằng LPC: hạ tần số lấy mẫu xuống rồi giải Levinson–Durbin, lấy đỉnh của đường bao.
   Đường bao LPC vốn trơn nên không dính hài của giọng — đó là lý do phải dùng nó. */
function formant(x) {
  const M = 5, sr2 = SR / M;
  const lp = new Float32Array(x.length);
  let p0 = 0; const al = Math.exp(-2 * Math.PI * 3600 / SR);
  for (let i = 0; i < x.length; i++) { p0 = al * p0 + (1 - al) * x[i]; lp[i] = p0; }
  const g = Math.floor(x.length / 2), n = Math.floor(SR * .18);
  const tu = Math.max(0, g - (n >> 1));
  const m = [];
  for (let i = tu; i < tu + n && i < x.length; i += M) m.push(lp[i]);
  const N = m.length, w = new Float64Array(N);
  for (let i = 0; i < N; i++) w[i] = m[i] * (.54 - .46 * Math.cos(2 * Math.PI * i / (N - 1)));
  const P = 12, r = new Float64Array(P + 1);
  for (let k = 0; k <= P; k++) { let s = 0; for (let i = k; i < N; i++) s += w[i] * w[i - k]; r[k] = s; }
  const a = new Float64Array(P + 1); let e = r[0];
  if (e <= 0) return [];
  for (let i = 1; i <= P; i++) {
    let acc = r[i];
    for (let j = 1; j < i; j++) acc -= a[j] * r[i - j];
    const k = acc / e, truoc = a.slice();
    a[i] = k;
    for (let j = 1; j < i; j++) a[j] = truoc[j] - k * truoc[i - j];
    e *= (1 - k * k);
    if (e <= 0) break;
  }
  const env = [];
  for (let f = 120; f <= 3600; f += 10) {
    const w0 = 2 * Math.PI * f / sr2;
    let re = 1, im = 0;
    for (let j = 1; j <= P; j++) { re -= a[j] * Math.cos(w0 * j); im += a[j] * Math.sin(w0 * j); }
    env.push([f, 1 / Math.sqrt(re * re + im * im)]);
  }
  const d = [];
  for (let i = 1; i < env.length - 1; i++)
    if (env[i][1] > env[i - 1][1] && env[i][1] >= env[i + 1][1]) d.push(Math.round(env[i][0]));
  return d;
}
const genNhat = (ds, dich) => ds.length ? ds.reduce((b, f) => Math.abs(f - dich) < Math.abs(b - dich) ? f : b, ds[0]) : 0;

console.log('\n— Viên gạch: bộ cộng hưởng có đặt đúng chỗ không —');
const xung = new Float32Array(4096); xung[0] = 1;
let lechMax = 0;
for (const F of [280, 520, 660, 1190, 1720, 2250, 2890]) {
  const y = A.congHuong(xung, F, 80, SR);
  let best = 0, bf = 0;
  for (let f = 100; f < 3600; f += 5) { const m = bien(y, f, SR, 0, y.length); if (m > best) { best = m; bf = f; } }
  lechMax = Math.max(lechMax, Math.abs(bf - F));
}
ok('đỉnh cộng hưởng nằm đúng tần số đặt vào', lechMax <= 10, `lệch nhiều nhất ${lechMax} Hz`);

console.log('\n— Dựng được và sạch —');
ok('âm nào cũng dựng ra mẫu', A.DS.every(t => { const m = A.mau(t, SR); return m && m.length > SR * .1; }));
ok('không mẫu nào có NaN', A.DS.every(t => A.mau(t, SR).every(v => Number.isFinite(v))));
ok('không mẫu nào vỡ tiếng', A.DS.every(t => A.mau(t, SR).every(v => Math.abs(v) <= 1.0001)));
ok('hai đầu mẫu êm, không nghe tiếng tách',
   A.DS.every(t => { const m = A.mau(t, SR); return Math.abs(m[0]) < .05 && Math.abs(m[m.length - 1]) < .05; }));
ok('dựng lại lần nữa ra y hệt, nhờ nhiễu có hạt giống',
   A.DS.every(t => { const a = A.mau(t, SR), b = A.mau(t, SR); return a.every((v, i) => v === b[i]); }));
ok('đổi tần số lấy mẫu vẫn ra đúng độ dài',
   Math.abs(A.mau('s', 48000).length / 48000 - A.mau('s', 22050).length / 22050) < .01);

console.log('\n— Âm xát: vùng tần số phải đúng chỗ —');
const px = {};
for (const t of ['s', 'sh', 'f', 'th', 'z', 'v']) px[t] = pho(A.mau(t, SR), 11000, 50);
const tt = {}; for (const t in px) tt[t] = trongTam(px[t]);
ok('/s/ dồn năng lượng lên vùng cao', tt.s > 5000, `trọng tâm ${Math.round(tt.s)} Hz`);
ok('/ʃ/ thấp hơn /s/ rõ rệt', tt.sh < tt.s - 1200, `sh ${Math.round(tt.sh)} so với s ${Math.round(tt.s)} Hz`);
ok('/ʃ/ nằm trong vùng của nó', tt.sh > 2000 && tt.sh < 5000, `${Math.round(tt.sh)} Hz`);
ok('/f/ tản hơn /s/, không có đỉnh gắt', gat(px.f) < gat(px.s), `f ${gat(px.f).toFixed(1)} so với s ${gat(px.s).toFixed(1)}`);
ok('/θ/ cũng tản, đúng như nó vốn mờ và khó nghe', gat(px.th) < gat(px.s));
const tram = (p) => nangLuong(p, 80, 400) / (nangLuong(p, 3000, 9000) || 1e-9);
ok('/z/ có tiếng rung trầm mà /s/ không có', tram(px.z) > tram(px.s) * 3,
   `z ${tram(px.z).toExponential(1)} so với s ${tram(px.s).toExponential(1)}`);
ok('/v/ cũng có tiếng rung trầm mà /f/ không có', tram(px.v) > tram(px.f) * 3);

console.log('\n— Nguyên âm: formant đo bằng LPC phải khớp số liệu đặt vào —');
for (const [t, ten] of [['ii', '/iː/'], ['i', '/ɪ/'], ['ae', '/æ/'], ['uh', '/ə/']]) {
  const d = formant(A.mau(t, SR)), dat = A.VANG[t].F;
  const f2 = genNhat(d, dat[1]), f3 = genNhat(d, dat[2]);
  ok(`${ten} ra F2 F3 đúng chỗ`,
     Math.abs(f2 - dat[1]) <= 220 && Math.abs(f3 - dat[2]) <= 320,
     `F2 ${f2} (đặt ${dat[1]}), F3 ${f3} (đặt ${dat[2]})`);
}
const F2 = (t) => genNhat(formant(A.mau(t, SR)), A.VANG[t].F[1]);
ok('F2 giảm dần đúng thứ tự iː > ɪ > æ > ə, tức lưỡi lùi dần về sau',
   F2('ii') > F2('i') && F2('i') > F2('ae') && F2('ae') > F2('uh'),
   [F2('ii'), F2('i'), F2('ae'), F2('uh')].join(' > '));
ok('/iː/ và /ɪ/ khác nhau đủ để tai nghe ra', Math.abs(F2('ii') - F2('i')) > 200,
   `lệch ${Math.abs(F2('ii') - F2('i'))} Hz`);

console.log('\n— /r/ nhận ra được nhờ F3 tụt xuống —');
const dr = formant(A.mau('r', SR)), dl = formant(A.mau('l', SR));
const r3 = genNhat(dr, 1600), l3 = genNhat(dl, 2800);
ok('/r/ có F3 dưới 2000 Hz, dấu riêng của r tiếng Anh Mỹ', r3 < 2000, `F3 ${r3} Hz`);
ok('/l/ giữ F3 cao hơn /r/ rất nhiều', l3 > r3 + 700, `l ${l3} so với r ${r3} Hz`);
const dt = formant(A.mau('l-toi', SR));
ok('/l/ cuối từ tối hơn /l/ đầu từ, F2 thấp hơn',
   genNhat(dt, 850) < genNhat(dl, 1300) - 200, `${genNhat(dt, 850)} so với ${genNhat(dl, 1300)} Hz`);

console.log('\n— Âm mũi có vùng bị hút mất —');
const pn = pho(A.mau('n', SR), 3000, 25);
ok('/n/ hụt hẳn năng lượng quanh 1450 Hz', nangLuong(pn, 1300, 1600) < nangLuong(pn, 200, 500) * .25);
const pm = pho(A.mau('m', SR), 3000, 25);
ok('/m/ hụt ở chỗ khác /n/, vì chặn ở môi chứ không ở lợi',
   nangLuong(pm, 800, 1050) < nangLuong(pm, 200, 500) * .25);

console.log('\n— Âm tắc: lặng, rồi nổ, rồi mới tới tiếng —');
const manh = (x, tu, den) => { let s = 0; for (let i = tu; i < den; i++) s += x[i] * x[i]; return Math.sqrt(s / (den - tu)); };
for (const t of ['p', 't', 'k']) {
  const m = A.mau(t, SR, 'dau');
  ok(`/${t}/ vô thanh: lúc ngậm hơi phải gần như lặng hẳn`,
     manh(m, 0, Math.floor(SR * .03)) < manh(m, 0, m.length) * .08);
}
/* Âm tắc hữu thanh KHÔNG lặng lúc ngậm: miệng chặn kín rồi mà dây thanh vẫn rung, còn một
   tiếng ù rất trầm. Đó là dấu để tai biết /d/ khác /t/ ngay trước khi có tiếng nổ. */
for (const t of ['b', 'd', 'g']) {
  const m = A.mau(t, SR, 'dau');
  const im = manh(m, Math.floor(SR * .006), Math.floor(SR * .03)), ca = manh(m, 0, m.length);
  ok(`/${t}/ hữu thanh: lúc ngậm hơi có vạch rung, khẽ nhưng không lặng`,
     im > ca * .012 && im < ca * .3, `${(im / ca).toFixed(3)} lần mức trung bình`);
}
ok('vạch rung chỉ có ở âm hữu thanh, không có ở âm vô thanh',
   ['b', 'd', 'g'].every(t => manh(A.mau(t, SR, 'dau'), Math.floor(SR * .006), Math.floor(SR * .03))
     > manh(A.mau({ b: 'p', d: 't', g: 'k' }[t], SR, 'dau'), Math.floor(SR * .006), Math.floor(SR * .03)) * 3));
ok('/t/ bật hơi lâu hơn /d/, đúng kiểu tiếng Anh Mỹ', A.TAC.t.vot > A.TAC.d.vot * 3,
   `${Math.round(A.TAC.t.vot * 1000)} ms so với ${Math.round(A.TAC.d.vot * 1000)} ms`);
/* Đo riêng tiếng nổ, không đo cả mẫu — giữa mẫu là nguyên âm, đo vào đó thì vô nghĩa. */
const noTu = Math.floor(SR * .045), noDen = Math.floor(SR * .056);
const phoNo = (t) => trongTam(pho(A.mau(t, SR, 'dau'), 9000, 60, noTu, noDen));
ok('tiếng nổ /t/ (chặn ở lợi) cao hơn /p/ (chặn ở môi)', phoNo('t') > phoNo('p') + 500,
   `t ${Math.round(phoNo('t'))} so với p ${Math.round(phoNo('p'))} Hz`);
ok('tiếng nổ /k/ (vòm mềm) nằm giữa /p/ và /t/',
   phoNo('k') > phoNo('p') && phoNo('k') < phoNo('t'),
   `p ${Math.round(phoNo('p'))} < k ${Math.round(phoNo('k'))} < t ${Math.round(phoNo('t'))} Hz`);
const cuoi = A.mau('t', SR, 'cuoi');
ok('kiểu "cuối" có nguyên âm đứng trước rồi mới ngậm và bật', cuoi.length > A.mau('t', SR, 'dau').length);
ok('kiểu "cuối" mở đầu bằng tiếng chứ không bằng khoảng lặng',
   manh(cuoi, Math.floor(SR * .02), Math.floor(SR * .1)) > manh(cuoi, 0, cuoi.length) * .3);

console.log('\n— Âm tắc phải có chuyển tiếp formant, nếu không /p/ /t/ /k/ nghe giống nhau —');
/* Đo F2 ngay ĐẦU nguyên âm theo sau, chỗ formant còn nằm gần điểm xuất phát.
   Chặn ở môi thì F2 xuất phát thấp, ở lợi thì cao hơn, ở vòm mềm thì cao nhất — đó mới là thứ
   tai dùng để định vị chỗ chặn, vì tiếng nổ quá ngắn. */
function f2Dau(t) {
  const m = A.mau(t, SR, 'dau');
  const tu = Math.floor(SR * (.045 + A.TAC[t].vot + .004)), den = tu + Math.floor(SR * .035);
  const p = [];
  for (let f = 500; f <= 3000; f += 20) p.push([f, bien(m, f, SR, tu, Math.min(den, m.length))]);
  const e = tron(p, 260);
  let best = 0, bf = 0;
  for (const [f, v] of e) if (v > best) { best = v; bf = f; }
  return bf;
}
const fp = f2Dau('p'), ft = f2Dau('t'), fk = f2Dau('k');
ok('F2 đầu nguyên âm xếp đúng theo chỗ chặn: môi < lợi ≤ vòm mềm',
   fp < ft && fp < fk, `p ${fp} | t ${ft} | k ${fk} Hz`);
ok('chặn ở môi kéo F2 xuống thấp rõ rệt', fp < 1300, `${fp} Hz`);
ok('âm tắc dựng ra có nguyên âm theo sau, không phải chỉ một tiếng tách',
   ['p', 't', 'k'].every(t => A.mau(t, SR, 'dau').length > SR * .18));

console.log('\n— Nói thật về chỗ máy lẫn cả người cũng lẫn —');
const pf = pho(A.mau('f', SR), 11000, 50), pth = pho(A.mau('th', SR), 11000, 50);
ok('/f/ và /θ/ phổ gần như phẳng, không âm nào có đỉnh trội',
   gat(pf) < 3.5 && gat(pth) < 3.5, `f ${gat(pf).toFixed(1)}, th ${gat(pth).toFixed(1)}`);
ok('/f/ và /θ/ giống nhau tới mức không nên bắt ai phân biệt bằng tai',
   Math.abs(trongTam(pf) - trongTam(pth)) < 1200,
   `lệch ${Math.round(Math.abs(trongTam(pf) - trongTam(pth)))} Hz`);

console.log('\n— Năm giọng phải khác nhau thật —');
const kh = (a, b) => { let s = 0; for (let i = 0; i < Math.min(a.length, b.length); i++) s += Math.abs(a[i] - b[i]); return s / Math.min(a.length, b.length); };
ok('đổi giọng thì tín hiệu đổi theo', [1, 2, 3, 4].every(v => kh(A.mau('ii', SR, null, 0), A.mau('ii', SR, null, v)) > .05));
ok('giọng cao có F2 cao hơn giọng trầm, vì ống phát âm ngắn hơn',
   genNhat(formant(A.mau('ii', SR, null, 4)), 2600) > genNhat(formant(A.mau('ii', SR, null, 0)), 2250),
   `${genNhat(formant(A.mau('ii', SR, null, 4)), 2600)} so với ${genNhat(formant(A.mau('ii', SR, null, 0)), 2250)} Hz`);
ok('mỗi giọng một cao độ riêng', new Set(A.GIONG.map(g => g.f0)).size === A.GIONG.length);

/* Đây là bài kiểm quan trọng nhất của cả tệp.
   Nghiên cứu cảnh báo: nếu hai âm trong bài nghe KHÔNG thật sự khác nhau thì ta đang dạy một
   tương phản không tồn tại, và người học "đúng" nhờ đoán chứ không nhờ nghe. Với giọng máy
   đọc thì không kiểm được điều đó. Với âm tự dựng thì kiểm được — và phải kiểm.

   Cách kiểm: lấy dấu vân phổ của từng âm ở từng giọng, rồi thử NHẬN DẠNG một âm ở giọng này
   bằng mẫu lấy từ CÁC GIỌNG KHÁC. Nếu nhận ra đúng, nghĩa là cái phân biệt hai âm nằm ở bản
   thân cái âm chứ không nằm ở giọng — tức tương phản có thật và khái quát được. */
console.log('\n— Tương phản có còn khi đổi giọng không —');
/* Dấu vân phổ. Bản đầu tôi lấy 16 dải từ 200 Hz trở lên và nó BÁO HỎNG hàng loạt cặp
   rung/không rung — nhưng đó là lỗi của cái thước, không phải của cái âm: vạch rung nằm DƯỚI
   200 Hz nên bị bỏ ngoài, còn dải thì thô tới mức /iː/ và /ɪ/ rơi chung một ô.
   Bản này thêm hai thứ tai người vốn dùng để nghe ra rung: năng lượng vùng trầm, và ĐỘ TUẦN
   HOÀN của sóng — âm hữu thanh thì sóng lặp lại đều, âm vô thanh thì không. */
function tuanHoan(x) {
  const g = Math.floor(x.length / 2), n = Math.min(Math.floor(SR * .08), x.length);
  const tu = Math.max(0, g - (n >> 1));
  let n0 = 0;
  for (let i = tu; i < tu + n; i++) n0 += x[i] * x[i];
  if (n0 <= 0) return 0;
  let best = 0;
  for (let lag = Math.floor(SR / 320); lag <= Math.floor(SR / 70); lag++) {
    let s = 0, e = 0;
    for (let i = tu; i < tu + n - lag; i++) { s += x[i] * x[i + lag]; e += x[i + lag] * x[i + lag]; }
    const r = s / (Math.sqrt(n0 * e) || 1e-9);
    if (r > best) best = r;
  }
  return best;
}
function vanPho(x, cua) {
  const SO = 24, LO = 120, HI = 9000, bs = [];
  for (let k = 0; k < SO; k++) bs.push(LO * Math.pow(HI / LO, k / (SO - 1)));
  const p = cua ? pho(x, 9600, 30, cua[0], cua[1]) : pho(x, 9600, 30);
  const v = bs.map((f, i) => {
    const lo = i ? Math.sqrt(bs[i - 1] * f) : f * .85, hi = i < SO - 1 ? Math.sqrt(f * bs[i + 1]) : f * 1.15;
    return Math.log10(nangLuong(p, lo, hi) + 1e-12);
  });
  const tb = v.reduce((a, b) => a + b, 0) / v.length;
  const ra = v.map(z => z - tb);
  ra.push(tuanHoan(cua ? x.subarray(cua[0], cua[1]) : x) * 6);                                  // rung hay không, nhân lên cho đủ cân
  ra.push((Math.log10(nangLuong(p, 70, 320) + 1e-12) - tb) * 1.5);
  return ra;
}
const cosXa = (a, b) => {
  let t = 0, x = 0, y = 0;
  for (let i = 0; i < a.length; i++) { t += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; }
  return 1 - t / (Math.sqrt(x * y) || 1e-9);
};
const CAP = [['l-toi', 'n'], ['s', 'z'], ['t', 'd'], ['k', 'g'], ['f', 'p'], ['s', 't'],
             ['p', 'b'], ['p', 'f'], ['n', 'l'], ['r', 'l'], ['v', 'w'], ['sh', 's'],
             ['th', 'dh'], ['ii', 'i']];
let tot = 0, tong = 0, kem = [];
for (const [a, b] of CAP) {
  const van = {};
    /* Âm tắc: chỗ phân biệt nằm ở lúc NGẬM và BẬT, còn nguyên âm phía sau thì hai bên giống
       hệt nhau — soi vào giữa mẫu là soi đúng vào chỗ không mang thông tin. */
    const cua = (A.TAC[a] || A.TAC[b]) ? [0, Math.floor(SR * .14)] : null;
    for (const t of [a, b])
      van[t] = A.GIONG.map((_, v) => vanPho(A.mau(t, SR, A.TAC[t] ? 'dau' : null, v), cua));
  let dung = 0, lan = 0;
  for (let v = 0; v < A.GIONG.length; v++) {
    const mau = (t) => {                                   // mẫu lấy từ các giọng KHÁC
      const ds = van[t].filter((_, i) => i !== v);
      return ds[0].map((_, k) => ds.reduce((s, d) => s + d[k], 0) / ds.length);
    };
    for (const that of [a, b]) {
      lan++;
      if (cosXa(van[that][v], mau(that)) < cosXa(van[that][v], mau(that === a ? b : a))) dung++;
    }
  }
  tot += dung; tong += lan;
  if (dung < lan) kem.push(`${a}/${b} ${dung}/${lan}`);
}
ok('mỗi cặp âm trong bài nghe đều phân biệt được dù đổi giọng',
   tot >= tong * .9, `${tot}/${tong} lượt nhận đúng` + (kem.length ? ` — yếu: ${kem.join(', ')}` : ''));
ok('không cặp nào tệ tới mức chỉ đoán bừa', kem.every(k => {
  const m = k.match(/(\d+)\/(\d+)/); return +m[1] >= +m[2] * .6;
}), kem.join(', ') || 'cặp nào cũng ổn');

console.log(`\n${fail ? '✗' : '✓'} Tất cả: ${pass} đạt, ${fail} hỏng\n`);
process.exit(fail ? 1 : 0);
