/* Nhạc ngủ — phần thuần: tạo âm thanh và tính hẹn giờ. Không đụng tới DOM hay Web Audio,
   chạy được trong Node để kiểm thử (scripts/test-ngu.js).

   Vì sao tạo sẵn thành một đoạn lặp, không phát từng nốt bằng JS:
   người dùng sẽ TẮT MÀN HÌNH. Lúc đó trình duyệt bóp JS (hẹn giờ chạy thưa, có khi đứng hẳn),
   nhưng luồng âm thanh vẫn chạy. Nên mọi thứ làm sẵn một lần: âm thanh thành một đoạn 80 giây
   nối đầu với đuôi liền mạch, cho nguồn phát tự lặp; còn nhỏ dần và tắt thì hẹn trước trên đồng hồ
   của luồng âm thanh. Khoá màn hình rồi, không cần JS chạy thêm dòng nào.

   Đoạn lặp liền mạch:
   - Bộ lọc chạy VÒNG: trước khi lọc từ mẫu đầu, cho bộ lọc "ấm" lên bằng 2 giây cuối mảng. Trạng
     thái bộ lọc ở mẫu đầu khi đó đúng bằng trạng thái ở mẫu cuối, nên đuôi nối vào đầu như chưa từng
     cắt. Hai giây là thừa: cực chậm nhất (lọc hồng, 0,99886) quên trạng thái cũ sau chừng 900 mẫu,
     2 giây là 48.000 mẫu, phần sót lại cỡ e mũ −55.
   - Âm có cao độ (nhịp hai tai, 432 Hz) chọn tần số để trong 80 giây có số chu kỳ TRÒN.
   - Nốt nhạc, giọt mưa ngân quá cuối đoạn thì phần thừa cộng vòng về đầu đoạn. */
(function () {
'use strict';

const SR = 24000;        // nghe được tới 12 kHz, đủ cho tiếng ru ngủ; nhẹ bằng nửa 48 kHz
const DAI = 80;          // giây: 8 con sóng 10 giây, 80 phách nhạc ở 60 phách/phút
const PI2 = 2 * Math.PI;

function ngauNhien(hat) {                       // mulberry32: cùng hạt ra cùng âm, kiểm thử được
  let a = hat >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- bộ lọc ---------- */

const thongThap = (fc, sr) => { const a = Math.exp(-PI2 * fc / sr); let y = 0; return (x) => (y = (1 - a) * x + a * y); };
const thongCao = (fc, sr) => { const l = thongThap(fc, sr); return (x) => x - l(x); };
const noi = (...ds) => ds.reduce((f, g) => (x) => g(f(x)), (x) => x);   // lồng hàm: nhanh hơn vòng for mỗi mẫu

/* Hồng: lọc của Paul Kellet, sai số chừng 0,05 dB so với dốc −3 dB mỗi quãng tám. */
function locHong() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return (w) => {
    b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
    b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
    const p = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
    return p;
  };
}

function trang(n, r) { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = r() * 2 - 1; return x; }

/* Lọc vòng — xem giải thích ở đầu tệp. */
const AM = 48000;
function locVong(x, loc) {
  const n = x.length, y = new Float32Array(n);
  for (let i = Math.max(0, n - AM); i < n; i++) loc(x[i]);
  for (let i = 0; i < n; i++) y[i] = loc(x[i]);
  return y;
}

function rms(x) { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / x.length); }
function veMot(x) { const k = 1 / (rms(x) || 1); for (let i = 0; i < x.length; i++) x[i] *= k; return x; }   // về RMS 1 để dễ trộn

const onHong = (n, r, ...loc) => veMot(locVong(trang(n, r), noi(locHong(), ...loc)));
/* Nâu: thông thấp 8 Hz trên tiếng ồn trắng là dốc −6 dB mỗi quãng tám; cắt dưới 20 Hz cho khỏi ù. */
const onNau = (n, r, sr, ...loc) => veMot(locVong(trang(n, r), noi(thongThap(8, sr), thongCao(20, sr), ...loc)));

/* Cộng một mẫu âm vào mảng, phần quá cuối thì vòng về đầu. */
function congVong(y, batDau, mau, k = 1) {
  const n = y.length;
  let j = ((batDau % n) + n) % n;
  for (let i = 0; i < mau.length; i++) { y[j] += mau[i] * k; if (++j === n) j = 0; }
}

/* Dao động bằng phép quay số phức thay cho Math.sin mỗi mẫu: nhanh gấp nhiều lần. Từ sin, cos của
   góc ra luôn sin 2θ = 2 sin θ cos θ và sin 3θ = sin θ (3 − 4 sin² θ) cho bồi âm 2 và 3. */
function daoDong(f, sr, pha = 0) {
  const d = PI2 * f / sr, cr = Math.cos(d), sd = Math.sin(d);
  let c = Math.cos(pha), s = Math.sin(pha), dem = 0;
  const o = { s: 0, c: 0 };                     // sin, cos của mẫu vừa lấy; không tạo mảng mới mỗi mẫu
  o.buoc = () => {
    o.s = s; o.c = c;
    const s0 = s;
    s = s0 * cr + c * sd; c = c * cr - s0 * sd;
    if (++dem === 4096) { const m = 1 / Math.hypot(c, s); c *= m; s *= m; dem = 0; }   // chống trôi
    return o.s;
  };
  return o;
}

/* ---------- sáu âm ---------- */

/* Sóng biển: 8 con sóng, mỗi con đúng 10 giây — 6 nhịp thở mỗi phút. Sóng dâng 3,6–4,4 giây rồi rút
   chậm; tiếng bọt (dải cao) chỉ trào lên ở đỉnh sóng. Không bao giờ im hẳn: luôn có một lớp nền. */
function songBien(sr, dai, r) {
  const n = Math.round(sr * dai), chuKy = 10, soSong = Math.round(dai / chuKy), nen = 0.22;
  const e = new Float32Array(n);
  for (let k = 0; k < soSong; k++) {
    const A = 0.75 + 0.25 * r(), len = 3.6 + 0.8 * r(), tat = 1.7, a0 = Math.round(k * chuKy * sr);
    const cuoi = Math.exp(-(chuKy - len) / tat);
    for (let i = 0; i < chuKy * sr; i++) {
      const t = i / sr;
      const v = t < len ? Math.sin(Math.PI / 2 * t / len) ** 2
                        : (Math.exp(-(t - len) / tat) - cuoi) / (1 - cuoi);
      e[(a0 + i) % n] = nen + (A - nen) * v;
    }
  }
  const kenh = () => {
    /* thân sóng và bọt là hai dải của CÙNG một luồng ồn hồng: đỉnh sóng sáng lên như sóng thật vỡ bọt */
    const hong = locVong(trang(n, r), locHong());
    const than = veMot(locVong(hong, thongThap(700, sr))), bot = veMot(locVong(hong, noi(thongCao(2500, sr), thongCao(2500, sr))));
    const day = onNau(n, r, sr);
    const y = new Float32Array(n);
    for (let i = 0; i < n; i++) { const v = e[i]; y[i] = 0.35 * day[i] + v * than[i] + 0.6 * v * v * v * bot[i]; }
    return y;
  };
  const L = kenh(), R = kenh();
  const buoc = Math.round(sr / 20), nhip = new Float32Array(Math.floor(n / buoc));      // 20 điểm mỗi giây cho vòng thở
  for (let i = 0; i < nhip.length; i++) nhip[i] = (e[i * buoc] - nen) / (1 - nen);
  return { L, R, nhip, chuKy };
}

/* Mưa nhẹ: tiếng rào rào (hồng, lấy dải 500 Hz–7 kHz) lúc to lúc nhỏ theo từng cơn, tiếng ầm xa,
   và chừng 6 giọt mỗi giây gõ ở gần, mỗi giọt một cao độ, một bên tai. */
function mua(sr, dai, r) {
  const n = Math.round(sr * dai);
  const pha1 = r() * PI2, pha2 = r() * PI2, con = new Float32Array(n);
  for (let i = 0; i < n; i++) con[i] = 1 + 0.12 * Math.sin(PI2 * 3 * i / n + pha1) + 0.08 * Math.sin(PI2 * 7 * i / n + pha2);   // từng cơn, chung hai tai
  const kenh = () => {
    const rao = onHong(n, r, thongCao(500, sr), thongCao(500, sr), thongThap(7000, sr));
    const am = onNau(n, r, sr, thongThap(250, sr));
    const y = new Float32Array(n);
    for (let i = 0; i < n; i++) y[i] = 0.8 * con[i] * rao[i] + 0.35 * am[i];
    return y;
  };
  const L = kenh(), R = kenh();
  const soGiot = Math.round(dai * 6), dai40 = Math.round(0.04 * sr);
  for (let g = 0; g < soGiot; g++) {
    const f = 1200 + 2300 * r(), tau = 0.002 + 0.004 * r(), to = (r() < 0.08 ? 2 : 0.8) * (0.4 + 0.6 * r());
    const lech = r() * Math.PI / 2, mau = new Float32Array(dai40);
    for (let i = 0; i < dai40; i++) { const t = i / sr; mau[i] = Math.sin(PI2 * f * t) * Math.exp(-t / tau) * Math.min(1, t / 0.001); }
    const o = Math.floor(r() * n);
    congVong(L, o, mau, to * Math.cos(lech)); congVong(R, o, mau, to * Math.sin(lech));
  }
  return { L, R };
}

/* Tiếng ồn nâu: trầm, đều; hai tai hai luồng riêng cho rộng. */
function nau(sr, dai, r) {
  const n = Math.round(sr * dai);
  return { L: onNau(n, r, sr, thongThap(1200, sr)), R: onNau(n, r, sr, thongThap(1200, sr)) };
}

/* Nhịp hai tai 3 Hz trên nền 250 Hz: đúng thông số Jirakittayakorn & Wongsawat (2018) dùng.
   Tai trái 250 Hz, tai phải 253 Hz; 80 giây chứa tròn 20.000 và 20.240 chu kỳ. Lót tiếng nâu nhỏ. */
const DELTA = { trai: 250, phai: 253 };
function delta(sr, dai, r) {
  const n = Math.round(sr * dai), L = new Float32Array(n), R = new Float32Array(n);
  const a = daoDong(DELTA.trai, sr), b = daoDong(DELTA.phai, sr);
  const nL = onNau(n, r, sr, thongThap(600, sr)), nR = onNau(n, r, sr, thongThap(600, sr));
  for (let i = 0; i < n; i++) { L[i] = a.buoc() + 0.5 * nL[i]; R[i] = b.buoc() + 0.5 * nR[i]; }
  return { L, R };
}

/* 432 Hz: hợp âm La trưởng chỉnh theo La = 432 Hz, các quãng là tỉ lệ nguyên (quãng năm 3/2,
   quãng ba 5/4) nên không có tiếng "đập". Mọi tần số là bội của 54 Hz, nên 80 giây chứa tròn chu kỳ.
   Mỗi giọng là hai dao động lệch nhau 0,1 Hz (gợn chậm 10 giây một lần) và tự phồng xẹp rất chậm. */
const LA432 = [108, 162, 216, 270, 324, 432];
function tan432(sr, dai, r) {
  const n = Math.round(sr * dai), L = new Float32Array(n), R = new Float32Array(n);
  const to = [1, 0.7, 0.6, 0.45, 0.35, 0.18], k = [2, 3, 4, 5, 3, 2];
  LA432.forEach((f, v) => {
    const o1 = daoDong(f - 0.05, sr, r() * PI2), o2 = daoDong(f + 0.05, sr, r() * PI2);
    const pha = r() * PI2, lech = 0.5 + (v % 2 ? 0.18 : -0.18), gL = Math.cos(lech * Math.PI / 2), gR = Math.sin(lech * Math.PI / 2);
    for (let i = 0; i < n; i++) {
      const s1 = o1.buoc(), c1 = o1.c, s2 = o2.buoc(), c2 = o2.c;
      const x = s1 + 0.22 * 2 * s1 * c1 + 0.06 * s1 * (3 - 4 * s1 * s1)
              + s2 + 0.22 * 2 * s2 * c2 + 0.06 * s2 * (3 - 4 * s2 * s2);
      const g = to[v] * (0.65 + 0.35 * Math.sin(PI2 * k[v] * i / n + pha));
      L[i] += x * g * gL; R[i] += x * g * gR;
    }
  });
  return { L, R };
}

/* Nhạc ru: 60 phách mỗi phút, nhẹ, không lời, không trống, cấu trúc đơn giản — đúng những nét chung
   của nhạc giúp ngủ trong các nghiên cứu (Pan và cs. 2025). Fa trưởng, giai điệu chỉ đi trên năm nốt
   ngũ cung (Fa Sol La Đô Rê) nên nốt nào chồng lên hợp âm cũng êm. Mười hợp âm, mỗi cái 8 phách,
   vòng cuối (Đô) dẫn về đầu (Fa) nên lặp lại nghe như bài chưa hết. */
const HOP_AM = [
  { ten: 'F', not: [53, 57, 60] }, { ten: 'Dm', not: [50, 53, 57] }, { ten: 'B♭', not: [46, 50, 53] }, { ten: 'C', not: [48, 52, 55] },
  { ten: 'F', not: [53, 57, 60] }, { ten: 'Am', not: [45, 48, 52] }, { ten: 'B♭', not: [46, 50, 53] }, { ten: 'C', not: [48, 52, 55] },
  { ten: 'Dm', not: [50, 53, 57] }, { ten: 'C', not: [48, 52, 55] },
];
const NGU_CUNG = [65, 67, 69, 72, 74, 77, 79, 81];        // F4 G4 A4 C5 D5 F5 G5 A5
const PHACH = 1;                                          // giây mỗi phách: 60 phách/phút
const tanSo = (m) => 440 * 2 ** ((m - 69) / 12);

function viet(r, soPhach) {                               // giai điệu: trả về danh sách nốt
  const ds = [];
  let vt = 2, b = 0;
  while (b < soPhach) {
    const dai = [1, 2, 2, 3, 4][Math.floor(r() * 5)];
    if (r() < 0.3) { b += dai; continue; }                // nghỉ
    const hop = HOP_AM[Math.floor(b / 8) % HOP_AM.length];
    if (b % 8 === 0) {                                    // đầu hợp âm: ưu tiên nốt thuộc hợp âm
      const hop12 = hop.not.map(m => m % 12), gan = NGU_CUNG.map((m, i) => i).filter(i => hop12.includes(NGU_CUNG[i] % 12));
      if (gan.length) vt = gan.reduce((a, i) => Math.abs(i - vt) < Math.abs(a - vt) ? i : a, gan[0]);
    } else vt = Math.max(0, Math.min(NGU_CUNG.length - 1, vt + Math.floor(r() * 5) - 2));
    ds.push({ phach: b, midi: NGU_CUNG[vt], dai: Math.min(dai, soPhach - b), luc: 0.5 + 0.25 * r() });
    b += dai;
  }
  return ds;
}

function not(sr, f, giay, luc, kieu) {                    // một nốt: mảng mẫu
  const m = Math.round(giay * sr), y = new Float32Array(m), o = daoDong(f, sr);
  for (let i = 0; i < m; i++) {
    const t = i / sr, s = o.buoc(), c = o.c;
    let v;
    if (kieu === 'dan') {                                 // giai điệu: tiếng chuông mềm, vào 30 ms, không có tiếng gõ
      const env = Math.min(1, t / 0.03) * Math.exp(-t / 1.4);
      v = env * (s + 0.35 * Math.exp(-t / 0.5) * 2 * s * c + 0.1 * Math.exp(-t / 0.25) * s * (3 - 4 * s * s));
    } else if (kieu === 'tram') {                         // bè trầm
      v = Math.min(1, t / 0.08) * Math.exp(-t / 3) * (s + 0.2 * 2 * s * c);
    } else {                                              // nền hợp âm: vào 1,5 giây, ngân, buông 2,5 giây
      const giu = giay - 2.5;
      v = Math.min(1, t / 1.5) * (t > giu ? Math.max(0, 1 - (t - giu) / 2.5) : 1) * (s + 0.15 * 2 * s * c);
    }
    y[i] = v * luc;
  }
  return y;
}

function nhacRu(sr, dai, r) {
  const n = Math.round(sr * dai), L = new Float32Array(n), R = new Float32Array(n), M = new Float32Array(n);
  const soPhach = Math.round(dai / PHACH);
  HOP_AM.forEach((h, k) => {
    const o = Math.round(k * 8 * PHACH * sr);
    for (const m of h.not) { const x = not(sr, tanSo(m), 8 * PHACH + 2.5, 0.16, 'nen'); congVong(L, o, x); congVong(R, o, x); }
    const tram = not(sr, tanSo(h.not[0] - 12), 7, 0.32, 'tram');
    congVong(L, o, tram); congVong(R, o, tram);
  });
  const giai = viet(r, soPhach);
  for (const g of giai) congVong(M, Math.round(g.phach * PHACH * sr), not(sr, tanSo(g.midi), Math.min(g.dai * PHACH + 2.5, 5), g.luc, 'dan'));
  /* Vang: vài tiếng dội trễ, xen kẽ hai tai, cũng cộng vòng */
  const doi = [[0.23, 0.30, 'R'], [0.41, 0.22, 'L'], [0.67, 0.15, 'R'], [1.03, 0.09, 'L']];
  for (let i = 0; i < n; i++) { L[i] += 0.62 * M[i]; R[i] += 0.62 * M[i]; }
  for (const [tre, k, ben] of doi) {
    const d = Math.round(tre * sr), y = ben === 'L' ? L : R;
    for (let i = 0; i < n; i++) y[(i + d) % n] += k * M[i];
  }
  return { L, R, giai };
}

/* ---------- độ to ---------- */

/* Đo độ to thô: RMS sau khi cắt bớt dải dưới 150 Hz, vì tai nghe tiếng trầm nhỏ hơn thực. Không phải
   chuẩn đo độ to nào, chỉ để sáu âm nghe xấp xỉ to bằng nhau khi chuyển qua lại. */
function doTo(L, R, sr) {
  let s = 0;
  for (const x of [L, R]) {
    const f = noi(thongCao(150, sr), thongCao(150, sr));
    for (let i = 0; i < x.length; i++) { const v = f(x[i]); s += v * v; }
  }
  return Math.sqrt(s / (L.length + R.length));
}
/* Đưa về cùng độ to. Tiếng ồn có vài đỉnh rất hiếm (cỡ 5 lần RMS); nếu hạ cả bài cho lọt đỉnh
   thì tiếng nâu, tiếng sóng nhỏ hơn các âm khác tới 8 dB. Nên chỉ lấy mức mà 99,9% mẫu nằm dưới
   làm trần, phần đỉnh hiếm còn lại thì nắn mềm (tanh) cho khỏi vỡ — một phần nghìn mẫu, tai không nhận ra. */
const MUC = 0.14, TRAN = 0.8, DINH = 0.95, GOI = 0.6;
function phanVi(L, R, q) {                                 // |x| mà q phần mẫu nằm dưới, đếm bằng biểu đồ tần suất
  let p = 0;
  for (const x of [L, R]) for (let i = 0; i < x.length; i++) p = Math.max(p, Math.abs(x[i]));
  const ngan = 4000, dem = new Uint32Array(ngan + 1), tong = L.length + R.length;
  for (const x of [L, R]) for (let i = 0; i < x.length; i++) dem[Math.floor(Math.abs(x[i]) / p * ngan)]++;
  let tich = 0;
  for (let b = 0; b <= ngan; b++) { tich += dem[b]; if (tich >= q * tong) return (b + 1) / ngan * p; }
  return p;
}
function chuanHoa(L, R, sr) {
  const k = Math.min(MUC / (doTo(L, R, sr) || 1), TRAN / (phanVi(L, R, 0.999) || 1));
  const nan = (v) => {                                     // dưới GOI giữ nguyên, trên đó cong mềm, không bao giờ quá DINH
    const a = Math.abs(v);
    return a <= GOI ? v : Math.sign(v) * (GOI + (DINH - GOI) * Math.tanh((a - GOI) / (DINH - GOI)));
  };
  for (const x of [L, R]) for (let i = 0; i < x.length; i++) x[i] = nan(x[i] * k);
}

/* ---------- danh sách âm ---------- */

const BAI = [
  { id: 'nhacRu', ten: 'Nhạc ru', mo: 'Chậm 60 phách mỗi phút, nhẹ, không lời', hat: 7, ham: nhacRu,
    bc: 'Có bằng chứng nhất: tổng hợp Cochrane 2022 gồm 13 nghiên cứu, 1.007 người, thấy nghe nhạc trước khi ngủ giúp ngủ ngon hơn. Nhạc dùng trong các nghiên cứu thường chậm 60–80 phách mỗi phút, nhẹ, không lời, đơn giản.' },
  { id: 'songBien', ten: 'Sóng biển', mo: 'Mỗi con sóng 10 giây — thở theo sóng', hat: 11, ham: songBien,
    bc: 'Sóng dâng thì hít vào, sóng rút thì thở ra: 6 nhịp thở mỗi phút. Thở chậm làm tim dịu lại ngay, nhưng tác dụng lên giấc ngủ chưa chắc (thử nghiệm nhỏ 20 người, Scientific Reports 2020).' },
  { id: 'mua', ten: 'Mưa nhẹ', mo: 'Che bớt tiếng xe, tiếng ồn bên ngoài', hat: 23, ham: mua,
    bc: 'Tiếng ồn nền giúp ngủ chưa được chứng minh: tổng quan 38 nghiên cứu (Riedy 2021) xếp bằng chứng vào loại rất thấp. Để nhỏ và hẹn giờ tắt.' },
  { id: 'nau', ten: 'Tiếng ồn nâu', mo: 'Trầm và đều, như gió thổi xa', hat: 31, ham: nau,
    bc: 'Giống mưa: dùng để che tiếng ồn bên ngoài, chưa có bằng chứng tốt là giúp ngủ. Để nhỏ và hẹn giờ tắt.' },
  { id: 'delta', ten: 'Sóng delta 3 Hz', mo: 'Nhịp hai tai: trái 250 Hz, phải 253 Hz', hat: 41, ham: delta, taiNghe: true,
    bc: 'Phải đeo tai nghe thì hai tai mới nghe hai âm khác nhau. Một nghiên cứu (2018) phát đúng âm này lúc người ta đã ngủ, thấy giấc ngủ sâu đến sớm và dài hơn; nhìn chung các nghiên cứu còn trái chiều.' },
  { id: 'tan432', ten: 'Tần số 432 Hz', mo: 'Hợp âm La trưởng, chỉnh theo La = 432 Hz', hat: 43, ham: tan432,
    bc: 'Mới có một nghiên cứu nhỏ 12 người (Acta Biomedica 2020) so nhạc 432 Hz với 440 Hz — chưa đủ để nói 432 Hz tốt hơn. Nghe thấy êm thì dùng.' },
];

function tao(id, { sr = SR, dai = DAI } = {}) {
  const b = BAI.find(x => x.id === id);
  if (!b) return null;
  const kq = b.ham(sr, dai, ngauNhien(b.hat));
  chuanHoa(kq.L, kq.R, sr);
  return kq;
}

/* ---------- hẹn giờ ---------- */

/* Nhỏ dần trong 1/6 thời gian, ít nhất 2 phút, nhiều nhất 10 phút; hẹn 30 phút thì nhỏ dần từ phút 25.
   Nhỏ theo hàm mũ: mỗi giây bớt một số dB như nhau, tai nghe đều đều, không có lúc tụt hẫng. */
const SAN = 0.001;                                       // −60 dB thì coi như im, rồi tắt hẳn
const VAO = 6;                                           // giây to dần lúc bắt đầu, khỏi giật mình
const PHUT = [15, 30, 45, 60, 90];
function henGio(phut) {
  const tong = phut * 60, giam = Math.min(600, Math.max(120, tong / 6));
  return { tong, giam, batDauGiam: tong - giam, vao: VAO };
}
const keoDai = (h, phut) => ({ ...h, tong: h.tong + phut * 60, batDauGiam: h.batDauGiam + phut * 60 });

/* Hệ số âm lượng ở giây t: đúng đường mà luồng âm thanh sẽ chạy theo lich() bên dưới. */
function amLuong(t, h) {
  if (t <= 0 || t >= h.tong) return 0;
  if (t < h.vao) return t / h.vao;
  if (t < h.batDauGiam) return 1;
  return SAN ** ((t - h.batDauGiam) / h.giam);
}

/* Lịch cho AudioParam, tính từ giây t (đang ở mức g). 'dat' = setValueAtTime, 'thang' =
   linearRampToValueAtTime, 'mu' = exponentialRampToValueAtTime. Lúc bắt đầu: t = 0, g = 0.
   Lúc kéo dài giữa chừng: đứng ở mức hiện tại, lên lại mức đủ trong 5 giây. */
function lich(h, t = 0, g = 0) {
  const ds = [{ kieu: 'dat', luc: t, gt: g }];
  if (t < h.vao) ds.push({ kieu: 'thang', luc: h.vao, gt: 1 });
  else if (g < 1) ds.push({ kieu: 'thang', luc: Math.min(t + 5, h.batDauGiam), gt: 1 });
  ds.push({ kieu: 'dat', luc: h.batDauGiam, gt: 1 },
          { kieu: 'mu', luc: h.tong, gt: SAN },
          { kieu: 'dat', luc: h.tong, gt: 0 });
  return ds;
}

const dongHo = (giay) => {
  const s = Math.max(0, Math.ceil(giay)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
  return (h ? `${h}:${String(m).padStart(2, '0')}` : `${m}`) + ':' + String(ss).padStart(2, '0');
};

const API = { SR, DAI, BAI, PHUT, SAN, VAO, DELTA, LA432, HOP_AM, NGU_CUNG, PHACH,
  ngauNhien, locVong, locHong, thongThap, thongCao, tao, doTo, henGio, keoDai, amLuong, lich, dongHo, tanSo };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_RUNGU = API;

/* Cùng tệp này chạy làm Web Worker: tạo âm ở luồng riêng cho màn hình khỏi đứng hình một hai giây
   trên điện thoại. Mảng kết quả chuyển hẳn sang (transfer), không chép. */
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => {
    const id = e.data && e.data.id, kq = tao(id);
    if (!kq) { self.postMessage({ id, loi: true }); return; }
    const gui = [kq.L.buffer, kq.R.buffer];
    if (kq.nhip) gui.push(kq.nhip.buffer);
    self.postMessage({ id, L: kq.L, R: kq.R, nhip: kq.nhip || null }, gui);
  };
}
})();
