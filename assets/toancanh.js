/* Hiệu ứng toàn cảnh — một chức năng nhỏ trong ngôi sao Trời đêm (nút "Hiệu ứng toàn cảnh" ở phần Nhìn từ vũ trụ;
   người dùng muốn nó nằm trong phần xem Mặt Trăng, Mặt Trời chứ không thành ngôi sao riêng). Mô phỏng "hiệu ứng
   toàn cảnh" (overview effect): cảm giác nhiều phi hành gia kể lại khi
   lần đầu nhìn Trái Đất từ vũ trụ. Frank White đặt tên năm 1987, từ các cuộc phỏng vấn phi hành gia; Yaden và cs.
   (Psychology of Consciousness, 2016) mô tả nó là trạng thái kinh ngạc (awe) mang tính vượt khỏi bản thân, khởi từ
   một cảnh nhìn đặc biệt: thấy đẹp, xúc động bất ngờ, thấy mình gắn với mọi người và với cả Trái Đất.

   Dựng thành một hành trình có dẫn dắt theo gợi ý của Stepanova và cs. (Frontiers in Digital Humanities, 2019),
   nghiên cứu thực tế ảo về hiệu ứng này: người xem cần thấy an toàn, thấy nơi quen thuộc của mình, và một chút
   hồi hộp là một phần của cung bậc cảm xúc. Nên: bay lên từ chính chỗ bạn đứng, qua quỹ đạo, lùi dần ra tới
   Mặt Trăng rồi tới chỗ Voyager 1 chụp "chấm xanh mờ", rồi nhìn lại.

   Cái gì đúng, cái gì không — nói rõ trên màn:
   - Đúng lúc này: ngày đêm trên Trái Đất (Mặt Trời theo astro.js), Mặt Trăng ở đâu và Trái Đất nhìn từ đó
     khuyết bao nhiêu, chỗ bạn đứng.
   - Ảnh của NASA (Visible Earth, dùng tự do): mặt đất Blue Marble Next Generation tháng 7/2004, mây ghép từ vệ tinh
     (2002 — KHÔNG phải mây hôm nay), đèn ban đêm Black Marble 2016. Thu nhỏ còn 2048×1024 (assets/traidat/).
   - Quỹ đạo: độ cao, góc nghiêng, chu kỳ đúng của Trạm Vũ trụ Quốc tế (Wikipedia: cận điểm 413 km, viễn điểm
     422 km, 51,64°, 92,9 phút, 7,67 km/s) nhưng đặt cho đi ngang qua chỗ bạn — không phải vị trí thật của trạm.
   - Lớp khí quyển: tô theo mật độ giảm theo hàm mũ với độ cao (thang độ cao 8 km), xanh khi nắng chiếu thẳng,
     cam đỏ ở dải hoàng hôn — gần đúng, không phải mô phỏng tán xạ đầy đủ.

   Không thư viện 3D: tia chiếu tự viết, mỗi điểm ảnh một tia, tô ở nửa độ phân giải rồi phóng lên (ảnh nguồn
   chỉ 20 km mỗi điểm ảnh, tô dày hơn cũng không nét hơn). */
(function () {
'use strict';

const A = () => self.TDTD_ASTRO;
const RAD = Math.PI / 180, R_KM = 6371;
const ISS = { cao: 417, nghieng: 51.64, chuKy: 92.9, tocDo: 7.67 };   // km, độ, phút, km/s
const KHI = 100 / R_KM, THANG_CAO = 8 / R_KM;                         // vỏ khí quyển 100 km, thang độ cao 8 km
const KC_TRANG = 384400, KC_VOYAGER = 6.06e9;                          // km

/* ---------- vector ---------- */
const v3 = (x, y, z) => ({ x, y, z });
const cong = (a, b) => v3(a.x + b.x, a.y + b.y, a.z + b.z);
const tru = (a, b) => v3(a.x - b.x, a.y - b.y, a.z - b.z);
const nhan = (a, k) => v3(a.x * k, a.y * k, a.z * k);
const cham = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cheo = (a, b) => v3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
const dai = (a) => Math.hypot(a.x, a.y, a.z);
const don = (a) => { const l = dai(a) || 1; return v3(a.x / l, a.y / l, a.z / l); };
const tuXichDao = (ra, dec) => v3(Math.cos(dec * RAD) * Math.cos(ra * RAD), Math.cos(dec * RAD) * Math.sin(ra * RAD), Math.sin(dec * RAD));
const em = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };   // smoothstep
const tron = (a, b, t) => a + (b - a) * t;
const muLog = (a, b, t) => a * Math.pow(b / a, t);                    // nội suy theo thang log: bay lên đều mắt

/* ---------- quỹ đạo giống ISS, đi ngang qua một điểm ----------
   Mặt phẳng quỹ đạo nghiêng i so với xích đạo. Muốn đi qua điểm có vĩ độ φ, xích kinh α (trong hệ trời) lúc
   đang bay lên phía bắc: góc tính từ nút lên u0 = asin(sin φ / sin i), nút lên Ω = α − atan2(cos i·sin u0, cos u0). */
function quyDaoQua(vi, xichKinh, nghieng = ISS.nghieng) {
  const i = nghieng * RAD, s = Math.max(-1, Math.min(1, Math.sin(vi * RAD) / Math.sin(i)));
  const u0 = Math.asin(s);
  return { Om: xichKinh * RAD - Math.atan2(Math.cos(i) * Math.sin(u0), Math.cos(u0)), u0, i };
}
/* vị trí (bán kính Trái Đất = 1, hệ trời) và hướng bay, sau dt phút */
function viTriQuyDao(q, dtPhut, cao = ISS.cao, chuKy = ISS.chuKy) {
  const u = q.u0 + 2 * Math.PI * dtPhut / chuKy, r = 1 + cao / R_KM;
  const cO = Math.cos(q.Om), sO = Math.sin(q.Om), ci = Math.cos(q.i), si = Math.sin(q.i);
  const tai = (uu) => v3(cO * Math.cos(uu) - sO * ci * Math.sin(uu), sO * Math.cos(uu) + cO * ci * Math.sin(uu), si * Math.sin(uu));
  const p = tai(u);
  return { P: nhan(p, r), V: don(tru(tai(u + 1e-4), tai(u - 1e-4))) };
}

/* góc chân trời chúc xuống khi ở độ cao h (km): đứng càng cao càng phải cúi mới thấy mép Trái Đất */
const gocChucChanTroi = (cao) => Math.acos(1 / (1 + cao / R_KM)) / RAD;
/* bề rộng (độ) của Trái Đất nhìn từ khoảng cách d (km, tính từ tâm) */
const goc_TraiDat = (d) => 2 * Math.asin(Math.min(1, R_KM / d)) / RAD;

/* ---------- tia chiếu ---------- */
/* giao tia P + tD với cầu bán kính r tâm gốc: trả [t vào, t ra] hoặc null */
function giaoCau(P, D, r) {
  const b = cham(P, D), c = cham(P, P) - r * r, ds = b * b - c;
  if (ds < 0) return null;
  const s = Math.sqrt(ds);
  return [-b - s, -b + s];
}
/* Lượng khí tia đi qua trong vỏ khí quyển (tới mặt đất nếu chạm), mật độ e^(−độ cao/8 km), kèm "nắng" ở chỗ dày
   nhất để biết tô xanh, cam hay tối. Đơn vị: bán kính Trái Đất × mật độ mặt đất.
   Máy ở ngoài vỏ, tia lướt qua không chạm đất: dùng công thức gần đúng Chapman — lượng khí dọc một tia có điểm gần
   tâm nhất ở bán kính rc là e^(−(rc−1)/H)·√(2π·rc·H) — vì lấy mẫu vài điểm trên quãng 2.000 km thì trượt mất lớp
   khí dày chỉ vài chục km sát mép, ra vằn. Máy ở trong khí quyển (lúc mới bay lên): lấy mẫu 12 điểm. */
function quaKhi(P, D, S, tDat) {
  const g = giaoCau(P, D, 1 + KHI);
  if (!g || g[1] <= 0) return null;
  const tc = -cham(P, D);
  if (tDat == null && dai(P) > 1 + KHI && tc > 0) {
    const X = cong(P, nhan(D, tc)), rc = dai(X);
    if (rc >= 1 + KHI) return null;
    return { tong: Math.exp(-(rc - 1) / THANG_CAO) * Math.sqrt(2 * Math.PI * rc * THANG_CAO), nang: cham(nhan(X, 1 / rc), S) };
  }
  const a = Math.max(0, g[0]), b = tDat != null ? Math.min(g[1], tDat) : g[1];
  if (b <= a) return null;
  const n = 12, ds = (b - a) / n;
  let tong = 0, nang = 0;
  for (let k = 0; k < n; k++) {
    const X = cong(P, nhan(D, a + (k + .5) * ds)), r = dai(X);
    const rho = Math.exp(-(r - 1) / THANG_CAO) * ds;
    tong += rho; nang += rho * cham(nhan(X, 1 / r), S);
  }
  return { tong, nang: tong ? nang / tong : 0 };
}
/* màu khí: nắng cao → xanh, sát chân trời → cam đỏ, khuất → tắt; tia nhìn gần hướng Mặt Trời thì sáng trắng hơn */
function mauKhi(k, D, S) {
  const m = k.nang, sang = em(-.18, .08, m), xanh = em(-.02, .3, m);
  const toi = 1 - Math.exp(-k.tong * 260);                              // càng dày càng đục, tới mức bão hoà
  const loi = Math.pow(Math.max(0, cham(D, S)), 8) * .6;
  const r = tron(255, 95, xanh) + loi * 160, g = tron(120, 160, xanh) + loi * 120, b = tron(60, 255, xanh) + loi * 60;
  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), toi * sang];
}

/* ---------- ảnh NASA ---------- */
let anh = null, dangNap = null;
const ANH = { ngay: 'assets/traidat/ngay.jpg', may: 'assets/traidat/may.jpg', dem: 'assets/traidat/dem.jpg' };
function napAnh() {
  if (anh) return Promise.resolve(anh);
  if (dangNap) return dangNap;
  const mot = (src) => new Promise((xong, hong) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(im, 0, 0);
      xong({ w: c.width, h: c.height, d: g.getImageData(0, 0, c.width, c.height).data });
    };
    im.onerror = hong;
    im.src = src;
  });
  dangNap = Promise.all([mot(ANH.ngay), mot(ANH.may), mot(ANH.dem)]).then(([n, m, d]) => {
    anh = { ngay: n, may: m, dem: d }; dangNap = null; return anh;
  }, (e) => { dangNap = null; throw e; });
  return dangNap;
}
/* đất hay biển, từ bản đồ Natural Earth có sẵn (datlien.js) — để biết chỗ nào mặt biển loá nắng */
let matNa = null;
function laBien(vi, kinh) {
  if (!matNa && self.TDTD_DATLIEN) {
    const D = self.TDTD_DATLIEN, m = new Uint8Array(D.rong * D.cao);
    D.du.split('|').forEach((r, y) => { let x = 0, v = 0; for (const t of r.split('.')) { const n = parseInt(t, 36); if (v) m.fill(1, y * D.rong + x, y * D.rong + x + n); x += n; v ^= 1; } });
    matNa = { m, w: D.rong, h: D.cao };
  }
  if (!matNa) return 0;
  const x = Math.floor(((kinh + 180) % 360 + 360) % 360 * 2) % matNa.w, y = Math.max(0, Math.min(matNa.h - 1, Math.floor((90 - vi) * 2)));
  return matNa.m[y * matNa.w + x] ? 0 : 1;
}

/* Màu một điểm trên mặt đất. (nx,ny,nz): pháp tuyến (hệ trời), (dx,dy,dz): hướng tia, S: hướng Mặt Trời,
   th: giờ sao (độ). Ban ngày: ảnh Blue Marble, mây phủ trắng; ban đêm: đèn thành phố vàng ấm, mây che bớt đèn.
   Viết bằng số thực, ghi vào mảng ra có sẵn: hàm này chạy chừng 60 nghìn lần mỗi khung hình, tạo vector mới mỗi
   lần là bộ dọn rác chạy liên tục, điện thoại giật. Ba ảnh cùng cỡ nên tính chỉ số, trọng số một lần. */
const RA = new Float64Array(5);
function lay(vi, kinh) {
  const N = anh.ngay, w = N.w, h = N.h;
  const fx = ((kinh + 180) / 360 * w % w + w) % w - .5, fy = Math.max(0, Math.min(h - 1.001, (90 - vi) / 180 * h - .5));
  const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
  const xa = (x0 + w) % w, xb = (x0 + 1) % w, y1 = Math.min(h - 1, y0 + 1);
  const i00 = (y0 * w + xa) * 4, i10 = (y0 * w + xb) * 4, i01 = (y1 * w + xa) * 4, i11 = (y1 * w + xb) * 4;
  const k00 = (1 - tx) * (1 - ty), k10 = tx * (1 - ty), k01 = (1 - tx) * ty, k11 = tx * ty;
  const n = N.d, m = anh.may.d, d = anh.dem.d;
  RA[0] = n[i00] * k00 + n[i10] * k10 + n[i01] * k01 + n[i11] * k11;
  RA[1] = n[i00 + 1] * k00 + n[i10 + 1] * k10 + n[i01 + 1] * k01 + n[i11 + 1] * k11;
  RA[2] = n[i00 + 2] * k00 + n[i10 + 2] * k10 + n[i01 + 2] * k01 + n[i11 + 2] * k11;
  RA[3] = m[i00] * k00 + m[i10] * k10 + m[i01] * k01 + m[i11] * k11;
  RA[4] = d[i00] * k00 + d[i10] * k10 + d[i01] * k01 + d[i11] * k11;
}
function mauMatSo(nx, ny, nz, dx, dy, dz, S, th, ra, o) {
  const vi = Math.asin(nz > 1 ? 1 : nz < -1 ? -1 : nz) / RAD, kinh = Math.atan2(ny, nx) / RAD - th;
  const mu = nx * S.x + ny * S.y + nz * S.z, ngay = em(-.06, .12, mu), sang = .05 + .95 * Math.pow(mu > 0 ? mu : 0, .7);
  let r, g, b, may = 0, den = 0;
  const bien = laBien(vi, kinh);
  if (anh) {
    lay(vi, kinh);
    r = RA[0]; g = RA[1]; b = RA[2]; may = em(70, 215, RA[3]); den = Math.pow(RA[4] / 255, .75);
  } else {                                                          // chưa có ảnh (mất mạng lần đầu): đất, biển đơn giản
    r = bien ? 14 : 92; g = bien ? 40 : 104; b = bien ? 92 : 62;
  }
  r = (r * (1 - may) + 245 * may) * sang; g = (g * (1 - may) + 245 * may) * sang; b = (b * (1 - may) + 250 * may) * sang;
  if (mu > 0 && may < .5 && bien) {                                 // mặt biển loá nắng: tia phản xạ gần hướng nhìn
    const px = 2 * mu * nx - S.x, py = 2 * mu * ny - S.y, pz = 2 * mu * nz - S.z;
    const c = -(px * dx + py * dy + pz * dz);
    const nd0 = -(nx * dx + ny * dy + nz * dz);                     // nhìn quá xiên ở sát mép thì thôi loá, kẻo ra chấm trắng
    if (c > 0 && nd0 > 0) { const lo = Math.pow(c, 60) * 150 * (1 - may * 2) * Math.sqrt(nd0); r += lo; g += lo; b += lo * .9; }
  }
  const nd = -(nx * dx + ny * dy + nz * dz), xien = Math.pow(1 - (nd > 0 ? nd : 0), 2.5) * .45 * ngay;   // nhìn xiên ra mép: khí quyển phủ xanh
  r = r * (1 - xien) + 120 * xien; g = g * (1 - xien) + 165 * xien; b = b * (1 - xien) + 255 * xien;
  /* Ánh tán xạ của khí quyển phủ cả nửa ban ngày. Ảnh Blue Marble đã lọc bỏ khí quyển (chỉ còn mặt đất, mặt biển),
     nên biển gần như đen; nhìn thật từ vũ trụ biển xanh lam là nhờ lớp ánh này. Thiếu nó, Trái Đất nhìn từ Mặt
     Trăng lúc đang sáng 88% lại trông như đang đêm (thử thật: giữa đĩa rơi vào Thái Bình Dương, ra màu 2,4,17). */
  const tx = ngay * sang * .9;
  r += 16 * tx; g += 38 * tx; b += 78 * tx;
  const dem = (1 - ngay) * den * (1 - .6 * may) * 320;              // đèn chỉ thấy phía đêm
  r = r * ngay + (4 + dem) * (1 - ngay); g = g * ngay + (7 + dem * .78) * (1 - ngay); b = b * ngay + (16 + dem * .45) * (1 - ngay);
  ra[o] = r > 255 ? 255 : r; ra[o + 1] = g > 255 ? 255 : g; ra[o + 2] = b > 255 ? 255 : b;
}
/* bản dùng vector, cho bài kiểm */
function mauMat(n, D, S, th) { const ra = [0, 0, 0]; mauMatSo(n.x, n.y, n.z, D.x, D.y, D.z, S, th, ra, 0); return ra; }

/* ---------- hành trình ---------- */
/* Mỗi chặng: tên, thời lượng (giây), các dòng chữ hiện dần (mốc phần trăm của chặng) */
const CHANG = [
  { id: 'bay', ten: 'Rời mặt đất', dai: 22, chu: [
    [0, (c) => `Bạn đang ở ngay trên ${c.noi}. Lên tới 30 km, bầu trời đã đen, đường chân trời bắt đầu cong.`],
    [.45, () => '100 km: ranh giới quy ước của vũ trụ (đường Kármán).'],
    [.8, () => '417 km: độ cao của Trạm Vũ trụ Quốc tế.']] },
  { id: 'quyDao', ten: 'Trên quỹ đạo', dai: 53, chu: [
    [0, () => 'Trạm bay 7,67 km mỗi giây — từ TP.HCM ra Hà Nội chưa tới 3 phút.'],
    [.3, () => 'Một vòng quanh Trái Đất mất 92,9 phút: một ngày thấy chừng 15–16 lần bình minh. Đang tua nhanh 100 lần.'],
    [.62, () => 'Ánh vàng phía đêm là đèn các thành phố — hàng tỉ người đang ở dưới đó.']] },
  { id: 'khi', ten: 'Lớp áo mỏng', dai: 25, chu: [
    [0, () => 'Dải sáng ở mép Trái Đất là toàn bộ bầu không khí ta thở.'],
    [.45, () => 'Nếu Trái Đất to bằng quả bóng đá, lớp không khí tới độ cao 100 km dày chưa tới 2 mm.']] },
  { id: 'bienGioi', ten: 'Không có biên giới', dai: 26, chu: [
    [0, () => 'Từ trên này không thấy một đường biên giới nào.'],
    [.3, () => 'Một phi hành gia Ả Rập Xê Út bay năm 1985 kể: ngày đầu ai cũng chỉ về nước mình, ngày thứ ba, thứ tư chỉ về châu lục — tới ngày thứ năm, chỉ còn thấy một Trái Đất.'],
    [.72, () => 'Cảm giác kinh ngạc, thấy mình gắn với mọi người ấy được gọi là hiệu ứng toàn cảnh.']] },
  { id: 'trang', ten: 'Từ phía Mặt Trăng', dai: 25, chu: [
    [0, () => '384.400 km — xa bằng Mặt Trăng.'],
    [.35, (c) => `Trái Đất lúc này nhìn từ Mặt Trăng: sáng ${c.sangTuTrang}%. Ngày 24/12/1968, William Anders (Apollo 8) chụp Trái Đất mọc lên trên chân trời Mặt Trăng.`]] },
  { id: 'cham', ten: 'Chấm xanh mờ', dai: 28, chu: [
    [0, () => '6 tỉ km — chỗ Voyager 1 quay lại chụp Trái Đất ngày 14/2/1990.'],
    [.4, () => 'Trong tấm ảnh ấy, Trái Đất chỉ chiếm 0,12 điểm ảnh.'],
    [.7, () => 'Carl Sagan viết: mọi người ta từng yêu, từng biết, từng nghe tên, đều sống trên chấm nhỏ ấy.']] },
  { id: 've', ten: 'Nhìn lại', dai: 16, chu: [
    [0, (c) => `Hít một hơi thật chậm. ${c.noi[0].toUpperCase() + c.noi.slice(1)} — chỗ bạn đang ngồi — nằm trên chấm sáng ấy.`]] },
];
const TONG = CHANG.reduce((s, c) => s + c.dai, 0);
const MO_CHUYEN = .8;                                                  // giây tối dần / sáng dần giữa hai chặng

/* đang ở chặng nào, bao xa trong chặng (0..1) */
function chang(t) {
  let a = 0;
  for (let k = 0; k < CHANG.length; k++) {
    if (t < a + CHANG[k].dai || k === CHANG.length - 1) return { k, c: CHANG[k], p: Math.max(0, Math.min(1, (t - a) / CHANG[k].dai)), batDau: a };
    a += CHANG[k].dai;
  }
  return null;
}

/* Máy quay lúc t (giây kể từ đầu hành trình). g: bối cảnh cố định của lần xem (giờ bắt đầu, nơi ở).
   Trả { P, F, U, fov, ms (giờ mô phỏng), mo (độ tối khi chuyển chặng), them } */
function mayLuc(t, g) {
  const ch = chang(t), p = ch.p, tc = t - ch.batDau, th0 = A().gioSao(A().ngayJulius(g.ms0));
  const conLai = ch.c.dai - tc, mo = Math.min(1, tc / MO_CHUYEN, ch.k === CHANG.length - 1 ? 1 : conLai / MO_CHUYEN);
  const viTriNguoi = (ms) => tuXichDao(g.kinh + A().gioSao(A().ngayJulius(ms)), g.vi);
  const khung = (u) => { const dong = don(cheo(v3(0, 0, 1), u)); return { len: u, dong, bac: cheo(u, dong) }; };
  let P, F, U, fov = 62, ms = g.ms0, them = null;
  if (ch.c.id === 'bay') {
    const u = viTriNguoi(ms), k = khung(u), h = muLog(30, ISS.cao, em(0, 1, p));
    const cui = tron(9, 30, em(0, 1, p)) * RAD;                      // cúi dần xuống cho thấy mặt đất lẫn chân trời
    P = nhan(u, 1 + h / R_KM); F = don(cong(nhan(k.bac, Math.cos(cui)), nhan(u, -Math.sin(cui)))); U = u; fov = 70;
    them = { cao: h };
  } else if (ch.c.id === 'quyDao' || ch.c.id === 'khi') {
    const q = quyDaoQua(g.vi, g.kinh + th0);
    const phutQD = ch.c.id === 'quyDao' ? tc * 100 / 60 : CHANG[1].dai * 100 / 60 + tc * 10 / 60;   // tua 100 lần, rồi 10 lần
    ms = g.ms0 + phutQD * 60000;
    const o = viTriQuyDao(q, phutQD), ra = don(o.P);
    if (ch.c.id === 'quyDao') {
      const cui = 24 * RAD;
      F = don(cong(nhan(o.V, Math.cos(cui)), nhan(ra, -Math.sin(cui)))); fov = 74;
    } else {
      /* nhìn thẳng vào mép Trái Đất phía có Mặt Trời: dải khí quyển ở đó luôn sáng (ngày) hay đỏ (hoàng hôn) */
      const S = tuXichDao(A().matTroi(A().ngayJulius(ms)).ra, A().matTroi(A().ngayJulius(ms)).dec);
      let ngang = tru(S, nhan(ra, cham(S, ra)));
      if (dai(ngang) < 1e-3) ngang = o.V;
      ngang = don(ngang);
      const chuc = gocChucChanTroi(ISS.cao) * RAD;
      F = don(cong(nhan(ngang, Math.cos(chuc)), nhan(ra, -Math.sin(chuc)))); fov = tron(60, 16, em(0, .5, p));
    }
    P = o.P; U = ra; them = { cao: ISS.cao, tua: ch.c.id === 'quyDao' ? 100 : 10 };
  } else {
    /* bienGioi → trang → cham: lùi ra xa theo thang log, nhìn thẳng vào tâm Trái Đất */
    const u = viTriNguoi(ms), m = A().matTrang(A().ngayJulius(ms)), vM = tuXichDao(m.ra, m.dec);
    let huong, d;
    if (ch.c.id === 'bienGioi') { huong = u; d = muLog(R_KM + 1200, R_KM + 9000, em(0, 1, p)); fov = 64; }   // từ 1.200 km: thấp hơn ảnh nguồn nhoè
    else if (ch.c.id === 'trang') {
      const s = em(0, .6, p); huong = don(cong(nhan(u, 1 - s), nhan(vM, s))); d = muLog(R_KM + 9000, m.kc, em(0, .6, p)); fov = tron(64, 14, em(0, .6, p));
      them = { sangTuTrang: Math.round((1 + cham(vM, tuXichDao(A().matTroi(A().ngayJulius(ms)).ra, A().matTroi(A().ngayJulius(ms)).dec))) / 2 * 100) };
    } else { huong = vM; d = muLog(m.kc, KC_VOYAGER, ch.c.id === 'cham' ? em(0, .7, p) : 1); fov = 14; }
    P = nhan(huong, d / R_KM); F = nhan(huong, -1);
    const bac = tru(v3(0, 0, 1), nhan(huong, huong.z));
    U = dai(bac) > 1e-3 ? don(bac) : v3(1, 0, 0);
    them = { ...(them || {}), d };
  }
  return { P, F, U, fov, ms, mo, ch, them };
}

/* ---------- vẽ ---------- */
let tam = null, cv = null, ctx = null, phu = null, W = 360, H = 640, DPR = 1, raf = 0;
let batDau = 0, dung = false, dungLuc = 0, tGio = 0, g0 = null, chuCu = '', changCu = -1;
let nenSao = null;
function napSao() {
  if (nenSao || !self.TDTD_SAOSANG || !A()) return nenSao;
  const S = self.TDTD_SAOSANG, gs = A().giaiSao(S.du, Math.min(1200, S.dem));
  nenSao = [];
  for (let i = 0; i < gs.v.length; i++) nenSao.push({ v: tuXichDao(gs.ra[i], gs.dec[i]), m: gs.v[i] });
  return nenSao;
}

function chieuHuong(D, may, f) {
  const z = cham(D, may.F);
  if (z < .02) return null;
  const Rt = don(cheo(may.F, may.U)), Uu = cheo(Rt, may.F);
  return { x: W / 2 + cham(D, Rt) / z * f, y: H / 2 - cham(D, Uu) / z * f };
}

function veKhung() {
  if (!ctx) return;
  const t = dung ? tGio : Math.min(TONG, (performance.now() - batDau) / 1000);
  tGio = t;
  const may = mayLuc(t, g0), JD = A().ngayJulius(may.ms), sun = A().matTroi(JD), S = tuXichDao(sun.ra, sun.dec), th = A().gioSao(JD);
  const f = (W / 2) / Math.tan(may.fov / 2 * RAD) * (W > H ? H / W : 1);
  const Rt = don(cheo(may.F, may.U)), Uu = cheo(Rt, may.F);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  /* sao nền */
  const sao = napSao();
  if (sao) for (const s of sao) {
    const p = chieuHuong(s.v, may, f);
    if (!p || p.x < 0 || p.y < 0 || p.x > W || p.y > H) continue;
    const a = Math.max(.12, Math.min(1, 1.15 - s.m * .2)) * .75;
    ctx.fillStyle = `rgba(230,236,255,${a.toFixed(2)})`; ctx.fillRect(p.x, p.y, s.m < 1.5 ? 1.6 : 1, s.m < 1.5 ? 1.6 : 1);
  }
  /* Mặt Trời: chỉ khi không bị Trái Đất che */
  const giaoTroi = giaoCau(may.P, S, 1);
  const pS = chieuHuong(S, may, f);
  if (pS && !(giaoTroi && giaoTroi[0] > 0)) {
    const gr = ctx.createRadialGradient(pS.x, pS.y, 0, pS.x, pS.y, 70);
    gr.addColorStop(0, 'rgba(255,255,250,1)'); gr.addColorStop(.08, 'rgba(255,250,230,.95)'); gr.addColorStop(.3, 'rgba(255,230,180,.25)'); gr.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(pS.x, pS.y, 70, 0, 6.2832); ctx.fill();
  }
  /* Trái Đất và khí quyển: mỗi điểm ảnh một tia, ở độ phân giải thấp rồi phóng lên */
  const cachTam = dai(may.P), rGoc = Math.asin(Math.min(1, (1 + KHI) / cachTam));
  const rMan = Math.tan(Math.min(rGoc, 1.45)) * f;                     // bán kính trên màn (gần đúng)
  if (rMan < 1.2) {                                                    // xa quá, Trái Đất nhỏ hơn một điểm ảnh
    const pE = chieuHuong(don(nhan(may.P, -1)), may, f);
    if (pE) {
      const a = Math.max(.35, Math.min(1, rMan));
      ctx.fillStyle = `rgba(150,190,255,${a.toFixed(2)})`; ctx.fillRect(pE.x - .7, pE.y - .7, 1.4, 1.4);
      ctx.strokeStyle = 'rgba(255,225,160,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pE.x, pE.y, 12, 0, 6.2832); ctx.stroke();
    }
  } else {
    /* Từ quỹ đạo, dải khí quyển dày nhiều điểm ảnh: tô từng tia. Lùi ra xa (trên chừng 640 km), dải chỉ còn chưa tới
       một điểm ảnh — tia lúc trúng lúc trượt, mép Trái Đất lấm tấm chấm cam chấm trắng. Khi đó vẽ thành viền liền. */
    const xa = cachTam > 1.1;
    veTraiDat(may, S, th, f, Rt, Uu, xa);
    if (xa) veVanhKhi(may, S, f, Rt, Uu, rMan);
  }
  /* chỗ bạn đứng */
  const u = tuXichDao(g0.kinh + th, g0.vi), huongU = tru(u, may.P);
  if (cham(u, don(nhan(huongU, -1))) > .05 && !['bay', 've'].includes(may.ch.c.id)) {
    const pU = chieuHuong(don(huongU), may, f);
    if (pU && pU.x > 0 && pU.y > 0 && pU.x < W && pU.y < H) {
      ctx.strokeStyle = 'rgba(255,215,140,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(pU.x, pU.y, 5, 0, 6.2832); ctx.stroke();
    }
  }
  /* chuyển chặng: tối dần, sáng dần */
  if (may.mo < 1) { ctx.fillStyle = `rgba(0,0,0,${(1 - may.mo).toFixed(3)})`; ctx.fillRect(0, 0, W, H); }
  veChu(may);
  if (!dung && t < TONG) raf = requestAnimationFrame(veKhung);
  else if (t >= TONG) xong();
}

let dem = null, demCtx = null;
function veTraiDat(may, S, th, f, Rt, Uu, chiDat) {
  const q = Math.min(.5, Math.sqrt(60000 / (W * H)));                   // ≤ 60 nghìn tia mỗi khung
  const w = Math.max(1, Math.ceil(W * q)), h = Math.max(1, Math.ceil(H * q));
  if (!dem) dem = document.createElement('canvas');
  if (dem.width !== w || dem.height !== h) { dem.width = w; dem.height = h; demCtx = dem.getContext('2d'); }
  if (!demCtx || !demCtx.createImageData) return;
  const img = demCtx.createImageData(w, h);
  if (!img || !img.data) return;                                        // trình duyệt (hay bộ thử) không cho đọc điểm ảnh
  const d = img.data, P = may.P, F = may.F;
  const px = P.x, py = P.y, pz = P.z, cP = px * px + py * py + pz * pz, rK = (1 + KHI) * (1 + KHI);
  for (let j = 0; j < h; j++) {
    const b = -((j + .5) / q - H / 2) / f;
    for (let i = 0; i < w; i++) {
      const a = ((i + .5) / q - W / 2) / f;
      let dx = F.x + a * Rt.x + b * Uu.x, dy = F.y + a * Rt.y + b * Uu.y, dz = F.z + a * Rt.z + b * Uu.z;
      const l = Math.sqrt(dx * dx + dy * dy + dz * dz); dx /= l; dy /= l; dz /= l;
      const bb = px * dx + py * dy + pz * dz, dsK = bb * bb - (cP - rK);
      if (dsK < 0 || -bb + Math.sqrt(dsK) <= 0) continue;           // không chạm vỏ khí quyển: để trong suốt
      const o = (j * w + i) * 4, ds = bb * bb - (cP - 1);
      if (ds >= 0 && -bb - Math.sqrt(ds) > 0) {                      // chạm đất
        const t = -bb - Math.sqrt(ds);
        mauMatSo(px + t * dx, py + t * dy, pz + t * dz, dx, dy, dz, S, th, d, o);
        d[o + 3] = 255;
        continue;
      }
      if (chiDat) continue;                                         // ở xa: dải khí quyển vẽ thành viền liền (veVanhKhi)
      const k = quaKhi(P, v3(dx, dy, dz), S, null);                 // trời: chỉ dải khí quyển
      if (k) { const c = mauKhi(k, v3(dx, dy, dz), S); d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = c[3] * 255 > 255 ? 255 : c[3] * 255; }
    }
  }
  demCtx.putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(dem, 0, 0, w, h, 0, 0, W, H);
}

/* Viền khí quyển quanh mép Trái Đất khi nhìn từ xa. Điểm mép có pháp tuyến n thoả n·P = 1 (tia từ máy sượt qua):
   n = e/d + √(1 − 1/d²)·(cos φ·a + sin φ·b), e là hướng từ tâm tới máy. Màu theo nắng ở đúng điểm ấy. */
function veVanhKhi(may, S, f, Rt, Uu, rMan) {
  const P = may.P, d = dai(P), e = nhan(P, 1 / d);
  const a = don(tru(Rt, nhan(e, cham(Rt, e)))), b = cheo(e, a), s = Math.sqrt(1 - 1 / (d * d));
  const day = .0047 * f / Math.sqrt(d * d - 1);                       // bề dày chừng 30 km trên màn
  const chieuDiem = (X) => { const q = tru(X, P), z = cham(q, may.F); return z > .01 ? { x: W / 2 + cham(q, Rt) / z * f, y: H / 2 - cham(q, Uu) / z * f } : null; };
  const N = 180;
  let truoc = null;
  ctx.save(); ctx.lineCap = 'round';
  for (let k = 0; k <= N; k++) {
    const ph = k / N * 2 * Math.PI;
    const n = cong(nhan(e, 1 / d), nhan(cong(nhan(a, Math.cos(ph)), nhan(b, Math.sin(ph))), s));
    const X = nhan(n, 1 + 12 / R_KM), p = chieuDiem(X);
    if (p && truoc) {
      const c = mauKhi({ tong: 1, nang: cham(n, S) }, don(tru(X, P)), S);
      if (c[3] > .01) {
        const mau = `${c[0] | 0},${c[1] | 0},${c[2] | 0}`;
        ctx.strokeStyle = `rgba(${mau},${(c[3] * .22).toFixed(3)})`; ctx.lineWidth = Math.max(1.5, Math.min(14, day * 5, rMan * .06));
        ctx.beginPath(); ctx.moveTo(truoc.x, truoc.y); ctx.lineTo(p.x, p.y); ctx.stroke();
        ctx.strokeStyle = `rgba(${mau},${(c[3] * .85).toFixed(3)})`; ctx.lineWidth = Math.max(1, Math.min(5, day * 1.6, rMan * .025));
        ctx.beginPath(); ctx.moveTo(truoc.x, truoc.y); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    }
    truoc = p;
  }
  ctx.restore();
}

function veChu(may) {
  if (!phu) return;
  const c = may.ch, boi = { noi: g0.noi, sangTuTrang: (may.them && may.them.sangTuTrang) || 0 };
  const dong = c.c.chu.filter(([p]) => c.p >= p).map(([, h]) => h(boi));
  const chu = dong.join('\n');
  if (c.k !== changCu) {
    changCu = c.k;
    phu.querySelector('.tc-ten').textContent = c.c.ten;
    phu.querySelectorAll('.tc-cham i').forEach((n, k) => n.classList.toggle('dang', k <= c.k));
  }
  if (chu !== chuCu) {
    chuCu = chu;
    phu.querySelector('.tc-chu').innerHTML = dong.map(s => `<p>${esc(s)}</p>`).join('');
  }
  const so = phu.querySelector('.tc-so');
  const th = may.them || {};
  so.textContent = th.d ? `cách tâm Trái Đất ${fmtKm(th.d)}` : th.cao ? `độ cao ${Math.round(th.cao)} km${th.tua ? ` · tua nhanh ${th.tua} lần` : ''}` : '';
}
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function fmtKm(d) {
  if (d >= 1e9) return `${(d / 1e9).toFixed(2).replace('.', ',')} tỉ km`;
  if (d >= 1e6) return `${(d / 1e6).toFixed(1).replace('.', ',')} triệu km`;
  return `${Math.round(d).toLocaleString('vi-VN')} km`;
}

/* ---------- điều khiển ---------- */
function batDauLai() {
  const noi = noiDangDung();
  g0 = { ms0: Date.now(), vi: noi.vi, kinh: noi.kinh, noi: noi.ten };
  batDau = performance.now(); dung = false; tGio = 0; changCu = -1; chuCu = '';
  phu.querySelector('.tc-xong').hidden = true;
  phu.querySelector('.tc-nut').hidden = false;
  phu.querySelector('.tc-dung').textContent = 'Tạm dừng';
  cancelAnimationFrame(raf); raf = requestAnimationFrame(veKhung);
}
/* nơi ở: lấy chỗ đã chọn ở Trời đêm nếu có, không thì TP.HCM */
function noiDangDung() {
  try {
    const l = JSON.parse(localStorage.getItem('tdtd.troi.noi') || 'null');
    if (l && Number.isFinite(l.vi) && Number.isFinite(l.kinh)) return { vi: l.vi, kinh: l.kinh, ten: l.ten === 'chỗ bạn đứng' ? 'chỗ bạn đang đứng' : l.ten };
  } catch (e) {}
  return { vi: 10.8231, kinh: 106.6297, ten: 'TP.HCM' };
}
function tamDung() {
  if (!g0) return;
  if (!dung) { dung = true; cancelAnimationFrame(raf); phu.querySelector('.tc-dung').textContent = 'Tiếp tục'; }
  else { dung = false; batDau = performance.now() - tGio * 1000; phu.querySelector('.tc-dung').textContent = 'Tạm dừng'; raf = requestAnimationFrame(veKhung); }
}
function changSau() {
  if (!g0) return;
  const c = chang(tGio);
  const toi = Math.min(TONG - .01, c.batDau + c.c.dai + .01);
  tGio = toi; batDau = performance.now() - toi * 1000;
  if (dung) veKhung();
}
function xong() {
  phu.querySelector('.tc-xong').hidden = false;
  phu.querySelector('.tc-nut').hidden = true;                          // hết hành trình: không còn gì để dừng hay qua
}

function doCo() {
  if (!tam) return;
  DPR = Math.min(self.devicePixelRatio || 1, 2);
  W = tam.clientWidth || self.innerWidth || 360; H = tam.clientHeight || self.innerHeight || 640;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  if (dung && g0) veKhung();
}

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'toancanh';
  tam.innerHTML = `
    <canvas class="tc-cv"></canvas>
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="tc-phu">
      <div class="tc-dau"><p class="tc-ten"></p><div class="tc-cham" aria-hidden="true">${CHANG.map(() => '<i></i>').join('')}</div><p class="tc-so"></p></div>
      <div class="tc-chu" aria-live="polite"></div>
      <div class="tc-xong" hidden>
        <button class="tc-lai" type="button">Xem lại từ đầu</button>
        <details class="tc-nguon"><summary>Cái gì thật, nguồn ở đâu</summary>
          <p>Ngày đêm trên Trái Đất, chỗ Mặt Trời, Mặt Trăng: tính đúng lúc bạn xem. Ảnh mặt đất, mây, đèn ban đêm của NASA
            (Visible Earth: Blue Marble Next Generation 2004, mây ghép từ vệ tinh 2002 — không phải mây hôm nay, Black Marble 2016).
            Quỹ đạo có độ cao, góc nghiêng, chu kỳ, tốc độ thật của Trạm Vũ trụ Quốc tế nhưng được đặt cho đi ngang qua chỗ bạn — không phải
            vị trí thật của trạm. Lớp khí quyển tô gần đúng theo mật độ không khí.</p>
          <p>Hiệu ứng toàn cảnh: Frank White, The Overview Effect (1987); Yaden và cs., Psychology of Consciousness (2016); cách dựng
            hành trình theo Stepanova và cs., Frontiers in Digital Humanities (2019). Lời kể của phi hành gia Ả Rập Xê Út: sách The Home Planet
            (1988). Ảnh Trái Đất mọc: William Anders, Apollo 8, 24/12/1968. Chấm xanh mờ: Voyager 1, 14/2/1990, 6,06 tỉ km; Carl Sagan,
            Pale Blue Dot (1994). Số liệu trạm: Wikipedia, International Space Station.</p>
          <p>Thấy chóng mặt khi xem thì dừng lại, nhìn ra xa một lúc.</p>
        </details>
      </div>
      <div class="tc-nut">
        <button class="tc-dung" type="button">Tạm dừng</button>
        <button class="tc-sau" type="button">Chặng sau →</button>
      </div>
    </div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.tc-cv'); ctx = cv.getContext('2d'); phu = tam.querySelector('.tc-phu');
  tam.querySelector('.xn-dong').onclick = dong;
  tam.querySelector('.tc-dung').onclick = tamDung;
  tam.querySelector('.tc-sau').onclick = changSau;
  tam.querySelector('.tc-lai').onclick = batDauLai;
  addEventListener('resize', doCo);
}

let khiDong = null;
/* moi.khiDong: gọi lại khi người dùng đóng hành trình — Trời đêm dừng vòng vẽ của nó trong lúc này cho đỡ nặng máy */
function mo(moi = {}) {
  khiDong = moi.khiDong || null;
  dungKhung();
  tam.classList.add('hien');
  doCo();
  /* ảnh NASA tải trong nền; chưa có thì vẽ bằng bản đồ đất–biển, có rồi tự đẹp lên */
  napAnh().catch(() => {});
  batDauLai();
}

function dong() {
  const coMo = !!(tam && tam.classList.contains('hien'));
  cancelAnimationFrame(raf); raf = 0; dung = true;
  if (tam) tam.classList.remove('hien');
  const f = khiDong; khiDong = null;
  if (coMo && f) f();
}
const dangMo = () => !!(tam && tam.classList.contains('hien'));

/* Esc: chỉ đóng hành trình, đừng để nó rơi xuống Trời đêm bên dưới mà đóng luôn cả ngôi sao */
addEventListener('keydown', e => {
  if (e.key === 'Escape' && dangMo()) { e.preventDefault(); e.stopImmediatePropagation(); dong(); }
}, true);

self.TDTD_TOANCANH = { mo, dong, dangMo,
  ISS, CHANG, TONG, KHI, KC_TRANG, KC_VOYAGER,
  _quyDaoQua: quyDaoQua, _viTriQuyDao: viTriQuyDao, _gocChucChanTroi: gocChucChanTroi, _gocTraiDat: goc_TraiDat,
  _giaoCau: giaoCau, _quaKhi: quaKhi, _mauKhi: mauKhi, _mauMat: mauMat, _datAnh: (a) => { anh = a; }, _chang: chang, _mayLuc: mayLuc,
  _tuXichDao: tuXichDao, _tGio: () => tGio, _dung: () => dung, _g0: () => g0, _co: () => !!anh };
})();
