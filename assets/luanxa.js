/* Thiền luân xa — phần thuần: bảy luân xa theo kinh văn, tạo âm (đàn tanpura, chuông xoay) và lịch của
   một buổi thiền. Không đụng DOM hay Web Audio: chạy được trong Node (scripts/test-luanxa.js), và cùng tệp
   này chạy làm Web Worker để tạo âm ở luồng riêng.

   Cùng cách với nhạc ngủ (rungu.js): người ngồi thiền nhắm mắt, có khi tắt màn hình, nên âm thanh làm sẵn
   một lần, cả buổi hẹn trước trên đồng hồ của luồng âm thanh ngay lúc bấm Bắt đầu.

   Nguồn cho phần nội dung:
   - Bảy luân xa: Ṣaṭ-cakra-nirūpaṇa của Pūrṇānanda (1577), bản dịch Arthur Avalon (John Woodroffe) 1919,
     đọc trên wisdomlib.org; số cánh, chữ chủng tử, yếu tố đối chiếu thêm Wikipedia từng luân xa.
     Màu hoa sen trong app là màu kinh văn tả; màu cầu vồng (đỏ → tím) là quy ước thời nay — Leadbeater
     đưa ra năm 1927, ghép đủ với danh sách phẩm chất từ 1977 (Kurt Leland, dẫn trong Wikipedia "Chakra").
   - Tần số 396 … 963 Hz ("solfeggio"): Joseph Puleo tính ra từ số câu trong sách Dân Số Ký thập niên
     1970, Leonard Horowitz phổ biến; không có trong kinh sách cổ nào, không có bằng chứng chữa bệnh.
     App dùng làm cao độ chuông của từng luân xa vì đó là bảng người ta quen gặp, và nói rõ điều này.
   - Chuông xoay: tỉ lệ năm tần số riêng lấy từ số đo chuông thật (Gołaś & Filipek, Archives of Acoustics
     2016, bảng 2, chuông số 1: 472 – 1329 – 2448 – 3738 – 5165 Hz), nằm trong khoảng Inácio và cs. (2006)
     đo được trên chuông Tây Tạng. Chuông không tròn tuyệt đối nên mỗi tần số tách đôi cách nhau vài Hz
     và nghe "ngân rung" (Terwagne & Bush 2011). Độ ngân: chưa tìm được số đo, nên chọn tần số chính tắt
     dần với hằng số 4 giây ở chuông 396 Hz (T60 chừng 28 giây), chuông nhỏ tiếng cao ngân ngắn hơn, mỗi
     tần số riêng tắt theo tỉ lệ nghịch với tần số — đúng cách tắt của vật có độ tổn hao không đổi.
   - Đàn tanpura: bốn dây lên Pa – Sa – Sa – Sa thấp (kiểu 5-8-8-1), gảy lần lượt thành một vòng. Cầu
     đàn jawari làm bồi âm dâng dần lên rồi lắng (C. V. Raman nghiên cứu): app mô phỏng gần đúng bằng một
     "đỉnh" bồi âm trượt từ bậc 4 lên bậc 22 trong vài giây đầu mỗi lần gảy. Nhịp gảy chọn theo tai. */
(function () {
'use strict';

const SR = 22050;
const PI2 = 2 * Math.PI;

/* Bảy luân xa, từ gốc lên đỉnh.
   sen: hoa sen vẽ theo kinh văn — màu cánh, hình ở giữa (yantra) và màu của nó.
   mau: màu cầu vồng thời nay, chỉ dùng cho chấm trên thân và chữ. */
const LUAN_XA = [
  { so: 1, ten: 'Mūlādhāra', nghia: 'chỗ dựa gốc', goi: 'Luân xa gốc', viTri: 'đáy cột sống, vùng đáy chậu',
    canh: 4, bija: 'LAM', deva: 'लं', doc: 'đọc gần như “lăm”, ngân dài tiếng m', yeuTo: 'đất', hz: 396, mau: '#e0584f',
    sen: { canh: '#c8323a', giua: 'vuong', mauGiua: '#f2c94c' },
    kinh: 'Hoa sen bốn cánh màu đỏ, trên cánh bốn chữ vaṃ śaṃ ṣaṃ saṃ màu vàng; giữa là hình vuông màu vàng của đất.' },
  { so: 2, ten: 'Svādhiṣṭhāna', nghia: 'chốn của riêng mình', goi: 'Luân xa xương cùng', viTri: 'bụng dưới, ngay dưới rốn',
    canh: 6, bija: 'VAM', deva: 'वं', doc: 'đọc gần như “văm”', yeuTo: 'nước', hz: 417, mau: '#ef8a3c',
    sen: { canh: '#e2553a', giua: 'liem', mauGiua: '#f4f1ea' },
    kinh: 'Sáu cánh màu đỏ son; giữa là vầng trăng lưỡi liềm trắng của nước. Nằm trên Mūlādhāra hai đốt ngón tay.' },
  { so: 3, ten: 'Maṇipūra', nghia: 'thành châu báu', goi: 'Luân xa rốn', viTri: 'vùng rốn',
    canh: 10, bija: 'RAM', deva: 'रं', doc: 'đọc gần như “răm”, r rung đầu lưỡi', yeuTo: 'lửa', hz: 528, mau: '#f2c94c',
    sen: { canh: '#26304f', giua: 'tamGiac', mauGiua: '#e0443a' },
    kinh: 'Mười cánh xanh thẫm như mây nặng mưa; giữa là tam giác đỏ chĩa xuống của lửa.' },
  { so: 4, ten: 'Anāhata', nghia: 'không bị gõ — tiếng vang lên mà không do vật chạm vật', goi: 'Luân xa tim', viTri: 'giữa ngực, ngang tim',
    canh: 12, bija: 'YAM', deva: 'यं', doc: 'đọc gần như “i-ăm” liền một hơi', yeuTo: 'gió', hz: 639, mau: '#5fbf77',
    sen: { canh: '#d8344a', giua: 'sao6', mauGiua: '#8f8a94' },
    kinh: 'Mười hai cánh màu đỏ của hoa bandhūka, chữ trên cánh màu đỏ son; giữa là hình sáu góc màu khói của gió.' },
  { so: 5, ten: 'Viśuddha', nghia: 'rất thanh tịnh', goi: 'Luân xa cổ họng', viTri: 'hõm cổ',
    canh: 16, bija: 'HAM', deva: 'हं', doc: 'đọc gần như “hăm”', yeuTo: 'không gian (ākāśa)', hz: 741, mau: '#4fa3e0',
    sen: { canh: '#6d5a7e', giua: 'tamGiacTrang', mauGiua: '#8ec9ee' },
    kinh: 'Mười sáu cánh màu tím khói, mang mười sáu nguyên âm; giữa là tam giác xanh da trời chĩa xuống, trong có vòng trắng như trăng rằm.' },
  { so: 6, ten: 'Ājñā', nghia: 'mệnh lệnh', goi: 'Luân xa trán', viTri: 'giữa hai lông mày',
    canh: 2, bija: 'OM', deva: 'ॐ', doc: 'đọc “ôm”, ngân dài tiếng m', yeuTo: 'tâm (manas)', hz: 852, mau: '#5b6ad0',
    sen: { canh: '#eeeef4', giua: 'tamGiacVien', mauGiua: '#f4f1ea' },
    kinh: 'Hai cánh trắng như trăng, mang hai chữ Ha và Kṣa màu trắng. Chủng tử thường dùng là OM (có nơi ghi kṣaṃ).' },
  { so: 7, ten: 'Sahasrāra', nghia: 'nghìn cánh', goi: 'Luân xa đỉnh đầu', viTri: 'đỉnh đầu',
    canh: 1000, bija: null, deva: '', doc: 'không tụng — ngồi yên trong im lặng', yeuTo: 'vượt ngoài các yếu tố', hz: 963, mau: '#a97ddb',
    sen: { canh: '#f7f5ff', giua: 'tron', mauGiua: '#ffffff', nhuy: '#f2a65a' },
    kinh: 'Nghìn cánh, sáng và trắng hơn trăng rằm, đầu cánh quay xuống; nhuỵ nhuốm màu mặt trời mới mọc. Nhiều dòng tantra nói luân xa này không có chủng tử mà là im lặng; có nơi tụng OM.' },
];

/* ---------- công cụ âm thanh (giống rungu.js, chép lại để tệp tự chạy được làm Worker) ----------
   Dao động viết thẳng trong từng vòng lặp bằng phép quay số phức (như daoDong của rungu.js), không gọi
   hàm mỗi mẫu: tạo âm nhanh gấp năm, trên điện thoại người dùng đỡ phải ngồi chờ. */

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

/* Cộng một mẫu âm vào mảng, phần quá cuối thì vòng về đầu — đoạn lặp liền mạch. */
function congVong(y, batDau, mau, k = 1) {
  const n = y.length;
  let j = ((batDau % n) + n) % n;
  for (let i = 0; i < mau.length; i++) { y[j] += mau[i] * k; if (++j === n) j = 0; }
}

function rms(x) { let s = 0; for (let i = 0; i < x.length; i++) s += x[i] * x[i]; return Math.sqrt(s / x.length); }
function dinh(x) { let p = 0; for (let i = 0; i < x.length; i++) p = Math.max(p, Math.abs(x[i])); return p; }

/* ---------- chuông xoay ---------- */

const DO_CHUONG = [472, 1329, 2448, 3738, 5165];          // Hz, chuông số 1, Gołaś & Filipek 2016
const TI_CHUONG = DO_CHUONG.map(f => f / DO_CHUONG[0]);    // 1 : 2,82 : 5,19 : 7,92 : 10,94
const BIEN_CHUONG = [1, 0.5, 0.28, 0.14, 0.07];            // gõ bằng dùi: tần số chính trội nhất
const TACH = [1.6, 2.4, 3.2, 4, 4.8];                      // Hz: mỗi tần số tách đôi, nghe ngân rung
const TAU_396 = 4;                                         // giây, hằng số tắt dần của chuông 396 Hz

const tauChuong = (f1) => TAU_396 * Math.sqrt(396 / f1);

/* Một tiếng chuông gõ, tần số chính f1. Hai nửa của mỗi cặp tách đôi to nhỏ khác nhau (0,62 và 0,38)
   vì dùi gõ không trúng đúng nút rung: tiếng ngân rung chứ không tắt lịm từng nhịp. */
function chuong(f1, sr = SR, r = ngauNhien(1)) {
  const tau1 = tauChuong(f1), giay = Math.min(5.5 * tau1, 24);
  const n = Math.round(giay * sr), y = new Float32Array(n);
  TI_CHUONG.forEach((ti, m) => {
    const f = f1 * ti;
    if (f + TACH[m] > 0.45 * sr) return;                   // quá nửa tần số lấy mẫu thì bỏ, kẻo vọng ngược
    const giam = Math.exp(-ti / (tau1 * sr));              // tắt nhanh gấp ti lần tần số chính
    for (const [lech, k] of [[-TACH[m] / 2, 0.62], [TACH[m] / 2, 0.38]]) {
      const d = PI2 * (f + lech) / sr, cr = Math.cos(d), sd = Math.sin(d), ph = r() * PI2;
      let c = Math.cos(ph), s = Math.sin(ph), e = BIEN_CHUONG[m] * k;
      for (let b = 0; b < n; b += 4096) {
        const het = Math.min(n, b + 4096);
        for (let i = b; i < het; i++) { const s0 = s; s = s0 * cr + c * sd; c = c * cr - s0 * sd; y[i] += e * s0; e *= giam; }
        const mm = 1 / Math.hypot(c, s); c *= mm; s *= mm;
      }
    }
  });
  /* tiếng dùi gỗ chạm: 8 mili giây ồn, nhỏ */
  const go = Math.round(0.008 * sr);
  for (let i = 0; i < go; i++) y[i] += 0.12 * (r() * 2 - 1) * Math.sin(Math.PI * i / go);
  const vao = Math.round(0.002 * sr), ra = Math.round(0.5 * sr);
  for (let i = 0; i < vao; i++) y[i] *= i / vao;
  for (let i = 0; i < ra; i++) y[n - 1 - i] *= i / ra;
  const k = 0.8 / (dinh(y) || 1);
  for (let i = 0; i < n; i++) y[i] *= k;
  return y;
}

/* ---------- đàn tanpura ---------- */

const VONG = 5, SO_VONG = 4, DAI = VONG * SO_VONG;         // đoạn lặp 20 giây = 4 vòng gảy
const GAY = [0, 1.25, 2.5, 3.6];                           // giây trong vòng: Pa, Sa, Sa, Sa thấp, rồi nghỉ
const DAY = [0.75, 1, 1, 0.5];                             // so với Sa: Pa thấp, Sa, Sa, Sa thấp một quãng tám
const TRAM = 110;                                          // Sa nằm trong [110, 220) Hz: vừa giọng tụng

/* Sa của đàn: cùng nốt với tần số luân xa, hạ (hay nâng) từng quãng tám cho vào tầm giọng. */
function goc(hz) { let f = hz; while (f >= 2 * TRAM) f /= 2; while (f < TRAM) f *= 2; return f; }

/* Một lần gảy một dây: bồi âm nguyên lần (dây đàn gần như điều hoà), biên độ 1/k như dây gảy. "Jawari":
   một đỉnh bồi âm trượt từ bậc 4 lên bậc 22 trong vài giây đầu — bồi âm nằm dưới đỉnh nổi lên gần ba
   lần, bồi âm ngoài đỉnh lùi xuống — và hơi lung linh. Nhờ cầu đàn cứ chuyển năng lượng lên trên nên
   bồi âm cao của tanpura ngân lâu, chỉ tắt nhanh hơn bồi âm thấp một chút. */
const GAY_DAI = 8;
function gay(f, sr, r, lech = 0) {
  const n = Math.round(GAY_DAI * sr), y = new Float32Array(n), KHOI = 64;
  const K = Math.max(8, Math.min(40, Math.floor(5000 / f)));
  for (let k = 1; k <= K; k++) {
    const fk = f * k * (1 + lech);
    if (fk > 0.45 * sr) break;
    const tau = 2.6 / (1 + 0.02 * k), pha = r() * PI2, d = PI2 * fk / sr, cr = Math.cos(d), sd = Math.sin(d);
    const ph = r() * PI2;
    let c = Math.cos(ph), s = Math.sin(ph);
    for (let b = 0; b < n; b += KHOI) {
      const t = (b + KHOI / 2) / sr;
      const dinhBoi = 4 + 18 * (1 - Math.exp(-t / 1.2));
      const g = Math.exp(-t / tau) / k * (0.35 + 2.4 * Math.exp(-(((k - dinhBoi) / 4) ** 2)))
        * (1 + 0.12 * Math.sin(PI2 * 0.35 * t + pha));
      const het = Math.min(n, b + KHOI);
      for (let i = b; i < het; i++) { const s0 = s; s = s0 * cr + c * sd; c = c * cr - s0 * sd; y[i] += g * s0; }
      const m = 1 / Math.hypot(c, s); c *= m; s *= m;    // chống trôi biên độ
    }
  }
  const vao = 0.004 * sr, ra = Math.round(1 * sr);
  for (let i = 0; i < 6 * vao; i++) y[i] *= 1 - Math.exp(-i / vao);
  for (let i = 0; i < ra; i++) y[n - 1 - i] *= 0.5 - 0.5 * Math.cos(Math.PI * i / ra);
  return y;
}

function tanpura(hz, sr = SR, r = ngauNhien(7)) {
  const sa = goc(hz), n = Math.round(DAI * sr), y = new Float32Array(n);
  const mau = DAY.map((ti, s) => gay(sa * ti, sr, r, s === 2 ? 0.0005 : 0));   // dây Sa thứ hai lệch 0,9 cent: hai dây thật không bao giờ trùng khít
  for (let v = 0; v < SO_VONG; v++) {
    DAY.forEach((_, s) => {
      const luc = v * VONG + GAY[s] + (r() - 0.5) * 0.06;  // tay gảy không đều tuyệt đối
      congVong(y, Math.round(luc * sr), mau[s], (s === 3 ? 1.1 : 1) * (0.82 + 0.18 * r()));
    });
  }
  const k = 0.12 / (rms(y) || 1);
  for (let i = 0; i < n; i++) {
    const v = y[i] * k, a = Math.abs(v);
    y[i] = a <= 0.6 ? v : Math.sign(v) * (0.6 + 0.35 * Math.tanh((a - 0.6) / 0.35));   // đỉnh hiếm thì nắn mềm
  }
  return y;
}

/* Tạo đủ âm cho cả buổi: bảy đoạn đàn lặp, bảy tiếng chuông. */
function taoTatCa(baoTien) {
  const nen = [], ch = [];
  LUAN_XA.forEach((lx, i) => {
    nen.push(tanpura(lx.hz, SR, ngauNhien(100 + i)));
    ch.push(chuong(lx.hz, SR, ngauNhien(200 + i)));
    if (baoTien) baoTien((i + 1) / LUAN_XA.length);
  });
  return { nen, chuong: ch };
}

/* ---------- lịch một buổi ---------- */

const PHUT = [1, 2, 3, 5];          // cả bảy: phút cho mỗi luân xa
const PHUT_MOT = [5, 10, 15, 20];   // thiền riêng một luân xa: phút cho cả buổi
const XF = 8;                       // giây chuyển đàn từ luân xa này sang luân xa kế
const VAO = 6;                      // giây to dần lúc bắt đầu
const KET = 60;                     // giây ngồi yên sau luân xa cuối
const CHUONG_CACH = 30;             // một tiếng chuông mỗi 30 giây = mỗi ba hơi thở
const SAN = 0.001;                  // −60 dB thì coi như im
const HIT = 4, THO = 6;             // hít 4 giây, thở ra 6 giây: sáu hơi mỗi phút
const CA_BAY = LUAN_XA.map((_, i) => i);

/* Một buổi đi lần lượt qua các luân xa trong ds (mặc định cả bảy, từ gốc lên đỉnh; thiền riêng thì
   chỉ một), mỗi chặng phut phút, rồi một phút ngồi yên.
   chang[k], nen[k]: chặng thứ k và lịch âm lượng đàn của nó ('dat' = setValueAtTime, 'thang' =
   linearRamp, 'mu' = exponentialRamp), tính từ lúc bắt đầu buổi; i là luân xa của chặng đó.
   chuong: mỗi tiếng chuông một mốc, i là chuông của luân xa nào. */
function lichBuoi(phut, ds = CA_BAY) {
  const D = phut * 60, n = ds.length, tong = n * D + KET;
  const chang = ds.map((i, k) => ({ k, i, batDau: k * D, ketThuc: (k + 1) * D }));
  const nen = chang.map(({ k, i, batDau, ketThuc }) => {
    const vao = k === 0 ? [{ kieu: 'dat', luc: 0, gt: 0 }, { kieu: 'thang', luc: VAO, gt: 1 }]
                        : [{ kieu: 'dat', luc: batDau - XF / 2, gt: 0 }, { kieu: 'thang', luc: batDau + XF / 2, gt: 1 }];
    const ra = k < n - 1 ? [{ kieu: 'dat', luc: ketThuc - XF / 2, gt: 1 }, { kieu: 'thang', luc: ketThuc + XF / 2, gt: 0 }]
                         : [{ kieu: 'dat', luc: ketThuc, gt: 1 }, { kieu: 'mu', luc: ketThuc + 45, gt: SAN }, { kieu: 'dat', luc: ketThuc + 45, gt: 0 }];
    const lich = [...vao, ...ra];
    return { k, i, chay: lich[0].luc, dung: lich[lich.length - 1].luc + 0.05, ds: lich };
  });
  const ch = [];
  for (const c of chang) for (let t = c.batDau + 0.3; t < c.ketThuc - 6; t += CHUONG_CACH) ch.push({ i: c.i, luc: t, to: 1 });
  for (let k = 0; k < 3; k++) ch.push({ i: ds[n - 1], luc: n * D + 0.3 + 6 * k, to: 0.8 });   // ba tiếng chuông kết
  return { phut, D, tong, ds: ds.slice(), chang, nen, chuong: ch };
}

/* Mức âm lượng ở giây t theo đúng một lịch như trên — đường luồng âm thanh sẽ chạy. */
function muc(t, ds) {
  let v = 0, truoc = null;
  for (const e of ds) {
    if (e.luc > t) {
      if (e.kieu === 'dat' || !truoc) return v;
      const p = (t - truoc.luc) / (e.luc - truoc.luc);
      return e.kieu === 'thang' ? truoc.gt + (e.gt - truoc.gt) * p : truoc.gt * (e.gt / truoc.gt) ** p;
    }
    v = e.gt; truoc = e;
  }
  return v;
}

/* Đang ở đâu trong buổi: chặng thứ k, luân xa i. */
function dangO(t, L) {
  const n = L.chang.length;
  if (t >= n * L.D) return { ket: true, con: Math.max(0, L.tong - t) };
  const k = Math.max(0, Math.min(n - 1, Math.floor(t / L.D)));
  return { k, i: L.chang[k].i, trong: t - k * L.D, conChang: (k + 1) * L.D - t, con: L.tong - t };
}

function hoiTho(t) {
  const x = ((t % (HIT + THO)) + HIT + THO) % (HIT + THO);
  return x < HIT ? { pha: 'hit', tien: x / HIT } : { pha: 'tho', tien: (x - HIT) / THO };
}

const dongHo = (giay) => {
  const s = Math.max(0, Math.ceil(giay)), m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
};

const API = { SR, LUAN_XA, DO_CHUONG, TI_CHUONG, TACH, TAU_396, VONG, SO_VONG, DAI, GAY, DAY, TRAM,
  PHUT, PHUT_MOT, CA_BAY, XF, VAO, KET, CHUONG_CACH, SAN, HIT, THO,
  ngauNhien, goc, tauChuong, chuong, gay, tanpura, taoTatCa, lichBuoi, muc, dangO, hoiTho, dongHo };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
else self.TDTD_LUANXA_AM = API;

/* Chạy làm Web Worker: tạo âm ở luồng riêng cho màn hình khỏi đứng hình. Mảng chuyển hẳn sang, không chép. */
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => {
    if (!e.data || !e.data.tao) return;
    try {
      const kq = taoTatCa((tien) => self.postMessage({ tien }));
      self.postMessage({ xong: true, nen: kq.nen, chuong: kq.chuong }, [...kq.nen, ...kq.chuong].map(x => x.buffer));
    } catch (err) { self.postMessage({ loi: String(err) }); }
  };
}
})();
