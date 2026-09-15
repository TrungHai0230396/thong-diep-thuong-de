/* Tổng hợp âm vị tiếng Anh bằng toán — không có tệp âm thanh nào trong dự án này.

   Vì sao phải tự tổng hợp thay vì nhờ máy đọc: máy đọc (speechSynthesis) chỉ đọc được TỪ.
   Đưa cho nó "θ" thì nó đọc tên chữ cái Hy Lạp, đưa "th" thì nó đọc "th" như trong "the".
   Mà bài học ở đây là chính cái âm, tách khỏi từ. Nên phải dựng lấy.

   Cách dựng, theo lối tổng hợp nguồn–bộ lọc (source–filter) quen thuộc trong ngữ âm học:
   - ÂM XÁT (s, sh, f, th): nguồn là nhiễu, đi qua bộ cộng hưởng đặt ở đúng vùng tần số của
     từng âm. Khác nhau giữa /s/ và /ʃ/ nằm ở CHỖ ĐẶT vùng đó, và tai người nghe ra ngay.
   - ÂM TẮC (t, d, p, b, k, g): một khoảng LẶNG (lúc ngậm hơi) rồi một tiếng nổ ngắn. Phổ của
     tiếng nổ khác nhau theo chỗ chặn: môi thì trầm và tản, lợi thì cao, vòm mềm thì gom ở giữa.
   - ÂM HỮU THANH và NGUYÊN ÂM: nguồn là chuỗi xung thanh môn, đi qua ba bộ cộng hưởng đặt ở
     F1 F2 F3. Đây là chỗ nguyên âm sinh ra, và cũng là chỗ /r/ khác /l/ (F3 tụt hẳn xuống).

   Hàm thuần, trả về Float32Array, nên kiểm thử được bằng Node: đo phổ rồi đối chiếu với số
   liệu ngữ âm học. Nhiễu dùng bộ sinh số giả ngẫu nhiên CÓ HẠT GIỐNG, để chạy lại ra y hệt. */
(function (root) {
'use strict';

/* ---------- mấy viên gạch ---------- */

/* Nhiễu trắng có hạt giống: cùng hạt thì cùng kết quả, nhờ vậy kiểm thử mới ổn định. */
function nhieu(n, hat) {
  let s = (hat || 1) >>> 0;
  const ke = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296 - .5; };
  const a = new Float32Array(n);
  /* Cộng 16 số phân bố đều để xấp xỉ phân bố Gauss. Nhiễu phân bố đều nghe hơi "rè" và khác
     chất với nhiễu thật trong tiếng nói — Klatt dùng đúng mẹo cộng 16 số này. */
  for (let i = 0; i < n; i++) {
    let v = 0;
    for (let k = 0; k < 16; k++) v += ke();
    a[i] = v / 2;
  }
  return a;
}

/* Bộ cộng hưởng có tần số CHẠY theo thời gian. Cần cái này cho âm tắc: chỗ chặn nằm ở đâu thì
   formant của nguyên âm theo sau BẮT ĐẦU từ đó rồi mới trượt về đích. Không có chuyển tiếp này
   thì /p/ /t/ /k/ nghe gần như nhau, vì tiếng nổ quá ngắn để tai kịp định vị. */
function congHuongChay(x, Fds, B, sr) {
  let y1 = 0, y2 = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const r = Math.exp(-Math.PI * B / sr), th = 2 * Math.PI * Fds[i] / sr;
    const c1 = 2 * r * Math.cos(th), c2 = -r * r, a0 = 1 - c1 - c2;
    const v = a0 * x[i] + c1 * y1 + c2 * y2;
    y[i] = v; y2 = y1; y1 = v;
  }
  return y;
}

/* Bộ cộng hưởng hai cực, kiểu vẫn dùng trong tổng hợp tiếng nói:
   F là tần số đỉnh, B là bề rộng dải. Chuẩn hoá để đỉnh không tự phình biên độ. */
function congHuong(x, F, B, sr) {
  const r = Math.exp(-Math.PI * B / sr), th = 2 * Math.PI * F / sr;
  const c1 = 2 * r * Math.cos(th), c2 = -r * r, a0 = 1 - c1 - c2;
  let y1 = 0, y2 = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    const v = a0 * x[i] + c1 * y1 + c2 * y2;
    y[i] = v; y2 = y1; y1 = v;
  }
  return y;
}

/* Bộ triệt (antiformant): âm mũi có một vùng tần số bị hút mất, đó là dấu riêng của nó. */
function triet(x, F, B, sr) {
  const r = Math.exp(-Math.PI * B / sr), th = 2 * Math.PI * F / sr;
  const b1 = -2 * Math.cos(th), b2 = 1, k = 1 / (1 + b1 * r + r * r);
  let x1 = 0, x2 = 0;
  const y = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    y[i] = k * (x[i] + b1 * x1 + b2 * x2); x2 = x1; x1 = x[i];
  }
  return y;
}

const locCao = (x, f, sr) => { /* cắt bớt phần trầm cho âm xát khỏi ù */
  const a = Math.exp(-2 * Math.PI * f / sr);
  const y = new Float32Array(x.length);
  let p = 0;
  for (let i = 0; i < x.length; i++) { p = a * p + (1 - a) * x[i]; y[i] = x[i] - p; }
  return y;
};

/* Chuỗi xung thanh môn theo dạng Rosenberg: nở lên rồi đóng nhanh.
   Đóng nhanh chính là chỗ sinh ra hài bậc cao, thiếu nó thì nghe như tiếng sáo. */
function thanhMon(n, f0, sr, rung) {
  const a = new Float32Array(n);
  let pha = 0;
  for (let i = 0; i < n; i++) {
    const f = f0 * (1 + (rung ? .06 * (i / n) * -1 : 0));     // hạ giọng nhẹ ở cuối, nghe tự nhiên hơn
    pha += f / sr;
    if (pha >= 1) pha -= 1;
    const T1 = .4, T2 = .16;
    a[i] = pha < T1 ? .5 * (1 - Math.cos(Math.PI * pha / T1))
         : pha < T1 + T2 ? Math.cos(Math.PI * (pha - T1) / (2 * T2)) : 0;
  }
  /* lệch mức một chiều đi cho cân, rồi nhấn mạnh hài bậc cao */
  let tb = 0;
  for (let i = 0; i < n; i++) tb += a[i];
  tb /= n;
  const y = new Float32Array(n);
  for (let i = 1; i < n; i++) y[i] = (a[i] - tb) - .97 * (a[i - 1] - tb);
  return y;
}

/* Bao hình: lên và xuống bằng nửa hình cosin, để không nghe tiếng "tách" ở hai đầu. */
function bao(x, len, xuong, sr) {
  const nl = Math.min(Math.floor(sr * (len || .012)), x.length >> 1);
  const nx = Math.min(Math.floor(sr * (xuong || .04)), x.length >> 1);
  for (let i = 0; i < nl; i++) x[i] *= .5 * (1 - Math.cos(Math.PI * i / nl));
  for (let i = 0; i < nx; i++) {
    const k = x.length - 1 - i;
    x[k] *= .5 * (1 - Math.cos(Math.PI * i / nx));
  }
  return x;
}

const noi = (...ds) => {                                    // nối các đoạn lại thành một
  let n = 0;
  for (const d of ds) n += d.length;
  const a = new Float32Array(n);
  let o = 0;
  for (const d of ds) { a.set(d, o); o += d.length; }
  return a;
};
const lang = (giay, sr) => new Float32Array(Math.floor(sr * giay));
const nhan = (x, k) => { for (let i = 0; i < x.length; i++) x[i] *= k; return x; };
/* Đặt đỉnh của một đoạn về đúng mức mong muốn. Cần cái này để CÂN các phần của âm tắc với
   nhau: nếu chỉ chuẩn hoá cả câu ở cuối thì tiếng nổ (vốn nhọn) sẽ nuốt hết nguyên âm, nghe
   thành "tách" rồi thều thào — đúng lỗi mà bài kiểm bắt được lúc đo tỉ lệ nổ trên nguyên âm. */
const dinhVe = (x, muc) => {
  let d = 0;
  for (let i = 0; i < x.length; i++) d = Math.max(d, Math.abs(x[i]));
  return d > 0 ? nhan(x, muc / d) : x;
};

/* ---------- số liệu từng âm ----------
   Âm xát: vùng tần số chính. /s/ cao và gắt, /ʃ/ thấp hơn và dày, /f/ và /θ/ tản và yếu —
   chính vì hai âm sau tản và yếu nên tai người vốn đã khó phân biệt, không riêng gì máy. */
const XAT = {
  s:  { F: [6200, 8000], B: [900, 1400], cao: 3800, muc: 1,   von: 0 },
  z:  { F: [6200, 8000], B: [900, 1400], cao: 3800, muc: .40, von: 1.15 },
  sh: { F: [2600, 3800], B: [700, 1200], cao: 1600, muc: 1,   von: 0 },
  zh: { F: [2600, 3800], B: [700, 1200], cao: 1600, muc: .40, von: 1.15 },
  f:  { F: [4200, 7000], B: [5200, 5600], cao: 1400, muc: .40, von: 0, phang: true },
  v:  { F: [4200, 7000], B: [5200, 5600], cao: 1400, muc: .22, von: 1.2, phang: true },
  th: { F: [4600, 7400], B: [5200, 5600], cao: 1500, muc: .33, von: 0, phang: true },
  dh: { F: [4600, 7400], B: [5200, 5600], cao: 1500, muc: .20, von: 1.25, phang: true },
};

/* Âm tắc: phổ của tiếng nổ theo chỗ chặn, và thời gian từ lúc nhả tới lúc dây thanh rung (VOT).
   Tiếng Anh Mỹ: âm vô thanh đầu từ bật hơi mạnh (VOT dài), âm hữu thanh gần như không. */
/* neo = điểm xuất phát của F1 F2 F3 ngay sau khi nhả, gọi là "locus". Chặn ở môi thì F2 xuất
   phát thấp, chặn ở lợi thì cao hơn, chặn ở vòm mềm thì cao nhất. Đây mới là thứ tai dùng để
   biết chỗ chặn ở đâu — tiếng nổ quá ngắn, một mình nó không đủ. */
const TAC = {
  p: { F: [800, 1600], B: [900, 1400], vot: .055, huu: false, neo: [190, 720, 2100] },
  b: { F: [800, 1600], B: [900, 1400], vot: .012, huu: true,  neo: [190, 720, 2100] },
  t: { F: [4000, 5200], B: [800, 1200], vot: .065, huu: false, neo: [190, 1780, 2680] },
  d: { F: [4000, 5200], B: [800, 1200], vot: .014, huu: true,  neo: [190, 1780, 2680] },
  k: { F: [1800, 2600], B: [700, 1000], vot: .075, huu: false, neo: [190, 2300, 2500] },
  g: { F: [1800, 2600], B: [700, 1000], vot: .018, huu: true,  neo: [190, 2300, 2500] },
};

/* Nguyên âm và âm vang: F1 F2 F3 theo giọng nam trưởng thành.
   Chú ý /r/: dấu hiệu nhận ra nó là F3 TỤT hẳn xuống gần F2 — không âm nào khác làm vậy. */
const VANG = {
  ii:  { F: [280, 2250, 2890], B: [50, 90, 160] },
  i:   { F: [400, 1920, 2560], B: [60, 100, 170] },
  ae:  { F: [660, 1720, 2410], B: [80, 120, 180] },
  uh:  { F: [520, 1190, 2390], B: [70, 110, 180] },
  l:   { F: [360, 1300, 2800], B: [60, 110, 200] },
  'l-toi': { F: [400, 850, 2700], B: [70, 120, 220] },
  r:   { F: [330, 1100, 1600], B: [70, 110, 160] },
  w:   { F: [300, 610, 2200], B: [60, 100, 200] },
  n:   { F: [280, 1400, 2600], B: [90, 180, 250], triet: 1450 },
  m:   { F: [280, 1100, 2400], B: [90, 180, 250], triet: 900 },
};

const F0 = 118;

/* NĂM GIỌNG KHÁC NHAU. Lý do không phải cho vui: nghe mãi một mẫu thì người học nhớ MẪU chứ
   không học được ÂM, điểm đẹp lên mà tai không khá hơn. Đổi giọng ép người ta nghe ra cái chung
   giữa các giọng — đó mới là cái âm.
   ty = tỉ lệ co giãn ống phát âm: ống ngắn thì mọi formant dịch lên cao. Nam trầm ty=1,
   nữ và trẻ em ty lớn hơn. keo = kéo dài hay rút ngắn, vì mỗi người nói một nhịp. */
const GIONG = [
  { f0: 108, ty: 1.00, keo: 1.00 },
  { f0: 132, ty: 1.07, keo: .92 },
  { f0: 158, ty: 1.13, keo: 1.09 },
  { f0: 196, ty: 1.20, keo: .95 },
  { f0: 224, ty: 1.27, keo: 1.06 },
];
const layGiong = (i) => GIONG[((i | 0) % GIONG.length + GIONG.length) % GIONG.length];

function keuVang(ten, giay, sr, hat, g, tu) {
  g = g || GIONG[0];
  const v = VANG[ten], n = Math.floor(sr * giay);
  let x = thanhMon(n, g.f0, sr, true);
  if (v.triet) x = triet(x, v.triet * g.ty, 250, sr);
  let y = new Float32Array(n);
  const muc = [1, .6, .35];
  const nCh = tu ? Math.min(n, Math.floor(sr * .045)) : 0;   // 45 ms trượt từ điểm xuất phát về đích
  for (let k = 0; k < v.F.length; k++) {
    const dich = v.F[k] * g.ty;
    let r;
    if (nCh && tu[k]) {
      const Fds = new Float32Array(n);
      const dau = tu[k] * g.ty;
      for (let i = 0; i < n; i++) {
        const t = i < nCh ? i / nCh : 1;
        Fds[i] = dau + (dich - dau) * (t * t * (3 - 2 * t));
      }
      r = congHuongChay(x, Fds, v.B[k] * g.ty, sr);
    } else r = congHuong(x, dich, v.B[k] * g.ty, sr);
    for (let i = 0; i < n; i++) y[i] += r[i] * muc[k];
  }
  if (v.triet) nhan(y, .8);                                  // âm mũi vốn nhỏ tiếng hơn
  return y;
}

function keuXat(ten, giay, sr, hat, g) {
  g = g || GIONG[0];
  /* Ống ngắn thì chỗ xát cũng dịch lên, nhưng ít hơn nguyên âm — nên lấy căn của tỉ lệ. */
  const ty = Math.sqrt(g.ty);
  const c = XAT[ten], n = Math.floor(sr * giay);
  let x = locCao(nhieu(n, hat), c.cao * ty, sr);
  let y = new Float32Array(n);
  for (let k = 0; k < c.F.length; k++) {
    const r = congHuong(x, c.F[k] * ty, c.B[k], sr);
    for (let i = 0; i < n; i++) y[i] += r[i];
  }
  nhan(y, c.muc);
  if (c.von) {
    /* Âm xát hữu thanh có một VẠCH RUNG quanh cao độ giọng — thứ tai bắt để tách /z/ khỏi /s/.
       Ngoài ra tiếng xát bị NGẮT QUÃNG theo nhịp dây thanh: mỗi lần thanh môn khép thì luồng
       hơi yếu đi. Klatt điều biên nhiễu 50% theo chu kỳ F0, và thiếu nó thì nghe như hai âm
       rời chồng lên nhau chứ không phải một âm. */
    for (let i = 0; i < n; i++) y[i] *= .75 + .25 * (((i * g.f0 / sr) % 1) < .5 ? 1 : -1);
    const b = congHuong(thanhMon(n, g.f0, sr, true), g.f0 * 1.27, 70, sr);
    for (let i = 0; i < n; i++) y[i] += b[i] * c.von;
  }
  return y;
}

/* Âm tắc phải nghe thấy chỗ NHẢ, nên bao giờ cũng dựng kèm một nguyên âm:
   'dau'  = bật rồi tới nguyên âm, như chữ p trong "pat"
   'cuoi' = nguyên âm rồi ngậm rồi bật, như chữ t trong "seat" — đây là chỗ người Việt hay nuốt mất. */
function keuTac(ten, kieu, sr, hat, g) {
  g = g || GIONG[0];
  const ty = Math.sqrt(g.ty);
  const c = TAC[ten];
  const no = Math.floor(sr * .008);
  let b = nhieu(no, hat);
  let bb = new Float32Array(no);
  for (let k = 0; k < c.F.length; k++) {
    const r = congHuong(b, c.F[k] * ty, c.B[k], sr);
    for (let i = 0; i < no; i++) bb[i] += r[i];
  }
  for (let i = 0; i < no; i++) bb[i] *= Math.exp(-i / (no * .35));   // tiếng nổ tắt rất nhanh
  dinhVe(bb, .52);                       // nghe rõ, nhưng không được át nguyên âm phía sau

  const nv = Math.floor(sr * Math.max(0, c.vot - .008));
  let hoi = new Float32Array(nv);
  if (nv > 0 && !c.huu) {
    let h = locCao(nhieu(nv, (hat || 1) + 7), 1200, sr);
    h = congHuong(h, 1800 * ty, 1400, sr);
    dinhVe(h, .26);
    for (let i = 0; i < nv; i++) hoi[i] = h[i] * (1 - i / nv);
  }
  const na = dinhVe(bao(keuVang('uh', .17 * g.keo, sr, hat, g, c.neo), .014, .07, sr), .95);

  /* VẠCH RUNG LÚC NGẬM HƠI. Miệng đã chặn kín rồi mà dây thanh vẫn rung, nên vẫn còn một tiếng
     ù rất trầm lọt qua thịt cổ. Đó là thứ tai bắt được để biết /d/ khác /t/ NGAY TRƯỚC khi có
     tiếng nổ. Bản đầu tôi để lặng hoàn toàn cho cả hai, và bài kiểm nhận giọng chéo bắt đúng
     lỗi này: /t/ với /d/ gần như không phân biệt nổi. */
  const ngam = (giay) => {
    const n = Math.floor(sr * giay);
    if (!c.huu) return new Float32Array(n);
    const b = congHuong(thanhMon(n, g.f0, sr, false), g.f0, 60, sr);
    let d = 0;
    for (let i = 0; i < n; i++) d = Math.max(d, Math.abs(b[i]));
    return dinhVe(bao(b, .01, .01, sr), .075);
  };

  if (kieu === 'cuoi') {
    const truoc = dinhVe(bao(keuVang('ae', .2 * g.keo, sr, hat, g), .02, .03, sr), .95);
    return noi(truoc, ngam(.065), bb, hoi, dinhVe(keuVang('uh', .05, sr, hat, g, c.neo), .2));
  }
  return noi(ngam(.045), bb, hoi, na);
}

/* ---------- cửa ra ---------- */
const DS = ['s', 'z', 'sh', 'zh', 'f', 'v', 'th', 'dh', 'p', 'b', 't', 'd', 'k', 'g',
            'n', 'm', 'l', 'l-toi', 'r', 'w', 'ii', 'i', 'ae', 'uh'];

function mau(ten, sr, kieu, giong) {
  sr = sr || 44100;
  const g = layGiong(giong || 0);
  const hat = 1 + ten.length * 31 + ten.charCodeAt(0) + (giong | 0) * 101;
  let a;
  if (XAT[ten]) a = bao(keuXat(ten, .42 * g.keo, sr, hat, g), .02, .09, sr);
  else if (TAC[ten]) a = keuTac(ten, kieu || 'dau', sr, hat, g);
  else if (VANG[ten]) a = bao(keuVang(ten, (ten.length > 2 || 'iiiaeuh'.includes(ten) ? .45 : .34) * g.keo, sr, hat, g), .018, .1, sr);
  else return null;
  let d = 0;
  for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i]));
  if (d > 0) nhan(a, .92 / d);
  return a;
}

const API = { mau, DS, GIONG, XAT, TAC, VANG, nhieu, congHuong, congHuongChay, thanhMon, F0 };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_AMVI = API;
})(typeof self !== 'undefined' ? self : this);
