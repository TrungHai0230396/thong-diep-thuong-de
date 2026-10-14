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
/* anhGoc: ba ảnh đã tải, card đồ hoạ nạp thẳng. anh: điểm ảnh cho đường vẽ dự phòng bằng bộ xử lý — chỉ rút ra
   khi máy không có WebGL2, thu cả ba về 2048×1024 để hàm lay() tính chỉ số một lần cho cả ba. */
let anhGoc = null, anh = null, dangNap = null;
const ANH = { ngay: 'assets/traidat/ngay-4096.jpg', may: 'assets/traidat/may.jpg', dem: 'assets/traidat/dem-3600.jpg' };
function napAnh() {
  if (anhGoc) return Promise.resolve(anhGoc);
  if (dangNap) return dangNap;
  const mot = (src) => new Promise((xong, hong) => { const im = new Image(); im.onload = () => xong(im); im.onerror = hong; im.src = src; });
  dangNap = Promise.all([mot(ANH.ngay), mot(ANH.may), mot(ANH.dem)]).then(([n, m, d]) => {
    anhGoc = { ngay: n, may: m, dem: d }; dangNap = null; return anhGoc;
  }, (e) => { dangNap = null; throw e; });
  return dangNap;
}
function soLieuAnh() {
  if (anh || !anhGoc) return anh;
  const rut = (im) => {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0, 2048, 1024);
    return { w: 2048, h: 1024, d: g.getImageData(0, 0, 2048, 1024).data };
  };
  anh = { ngay: rut(anhGoc.ngay), may: rut(anhGoc.may), dem: rut(anhGoc.dem) };
  return anh;
}
/* Ảnh chi tiết quanh chỗ bạn, xin từ GIBS của NASA lúc mở hành trình. Ảnh có sẵn trong app 10 km mỗi điểm ảnh:
   nhìn từ xa thì đủ, nhưng ở chặng đầu mặt đất ngay bên dưới chỉ cách vài chục tới vài trăm km, một điểm ảnh nguồn
   phủ cả chục điểm ảnh màn hình, nhoè. GIBS là máy chủ ảnh công khai của NASA, không cần khoá, cho trang khác dùng
   (trả Access-Control-Allow-Origin: *). Xin một ảnh 10° × 10°, 2048 điểm ảnh (chừng 540 m mỗi điểm): Blue Marble Next
   Generation 500 m cho ban ngày, Black Marble cho đèn ban đêm — chỉ loại hợp với giờ ở chỗ bạn, chạng vạng thì cả hai
   (mỗi ảnh 200–300 KB). Tâm ảnh làm tròn tới 1 độ (chừng 110 km): máy chủ chỉ biết bạn ở vùng nào. Mất mạng thì
   thôi, vẽ bằng ảnh có sẵn. */
const CT = { nua: 5, co: 2048, may: 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi' };
const LOP_CT = { ngay: 'BlueMarble_NextGeneration', dem: 'VIIRS_Black_Marble' };
let chiTiet = null;                                                    // { vi, kinh, ngay, dem }: Image khi đã tải
function urlChiTiet(lop, vi, kinh) {
  return `${CT.may}?version=1.3.0&service=WMS&request=GetMap&format=image/jpeg&STYLE=default&CRS=EPSG:4326` +
    `&bbox=${vi - CT.nua},${kinh - CT.nua},${vi + CT.nua},${kinh + CT.nua}&WIDTH=${CT.co}&HEIGHT=${CT.co}&layers=${lop}`;
}
/* cần ảnh gì cho nơi này, lúc này: tâm làm tròn, ngày hay đêm theo độ cao Mặt Trời */
function canChiTiet(vi0, kinh0, ms) {
  const vi = Math.max(-80, Math.min(80, Math.round(vi0))), kinh = Math.round(kinh0);
  if (Math.abs(kinh) > 180 - CT.nua) return null;                     // ảnh sẽ vắt qua kinh tuyến 180°: bỏ qua
  const JD = A().ngayJulius(ms), sun = A().matTroi(JD), cao = A().docCao(sun.ra, sun.dec, vi0, kinh0, JD).cao;
  return { vi, kinh, ngay: cao > -8, dem: cao < 8 };
}
function napChiTiet(g) {
  const can = canChiTiet(g.vi, g.kinh, g.ms0);
  if (!can || typeof Image === 'undefined') return;
  if (!chiTiet || chiTiet.vi !== can.vi || chiTiet.kinh !== can.kinh) { chiTiet = { vi: can.vi, kinh: can.kinh }; glCT = { ngay: false, dem: false }; }
  const ct = chiTiet;
  ['ngay', 'dem'].forEach(k => {
    if (!can[k] || k in ct) return;
    ct[k] = null;
    const im = new Image(); im.crossOrigin = 'anonymous';
    im.onload = () => { ct[k] = im; };
    im.onerror = () => { delete ct[k]; };                             // lần mở sau thử lại
    im.src = urlChiTiet(LOP_CT[k], ct.vi, ct.kinh);
  });
}
/* đất hay biển, từ bản đồ Natural Earth có sẵn (datlien.js) — để biết chỗ nào mặt biển loá nắng */
let matNa = null;
function layMatNa() {
  if (!matNa && self.TDTD_DATLIEN) {
    const D = self.TDTD_DATLIEN, m = new Uint8Array(D.rong * D.cao);
    D.du.split('|').forEach((r, y) => { let x = 0, v = 0; for (const t of r.split('.')) { const n = parseInt(t, 36); if (v) m.fill(1, y * D.rong + x, y * D.rong + x + n); x += n; v ^= 1; } });
    matNa = { m, w: D.rong, h: D.cao };
  }
  return matNa;
}
function laBien(vi, kinh) {
  if (!layMatNa()) return 0;
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

/* ---------- vẽ Trái Đất bằng card đồ hoạ ----------
   Bản đầu tô bằng bộ xử lý, mỗi khung tối đa 60 nghìn tia rồi phóng lên: trên điện thoại mỗi tia phủ 4–7 điểm ảnh
   thật, nên mép Trái Đất, dải khí quyển, mây đều nhoè ("hình bị mờ"). Card đồ hoạ tô mỗi điểm ảnh màn hình một tia,
   lọc ảnh theo mipmap (ở xa lấy bản thu nhỏ, khỏi lấm tấm) và lọc dị hướng (mặt đất sát chân trời bị nén dẹt vẫn
   nét). Công thức y hệt mauMatSo, quaKhi, mauKhi ở trên — bản bộ xử lý giữ lại cho máy không có WebGL2 và cho bài
   kiểm. Toạ độ tính theo hướng từ máy tới tâm Trái Đất, không trừ hai số to gần bằng nhau, để số thực 32 bit của
   card đồ hoạ vẫn đủ chính xác khi máy quay lùi xa tới Mặt Trăng. */
const VS = `#version 300 es
in vec2 a;
void main() { gl_Position = vec4(a, 0., 1.); }`;
const FS = `#version 300 es
precision highp float;
uniform vec2 uCo;
uniform float uF, uL, uTh, uChiDat, uCoAnh;
uniform vec3 uFw, uRt, uUp, uC, uS;
uniform vec4 uCT;                     // ảnh chi tiết: vĩ độ, kinh độ tâm, nửa cạnh (độ)
uniform vec2 uCoCT;                   // đã có ảnh chi tiết ban ngày, ban đêm
uniform sampler2D tNgay, tMay, tDem, tBien, tNgayCT, tDemCT;
out vec4 o;
const float PI = 3.14159265, KHI = ${KHI}, H = ${THANG_CAO};
float em(float a, float b, float x) { float t = clamp((x - a) / (b - a), 0., 1.); return t * t * (3. - 2. * t); }
void main() {
  vec2 p = gl_FragCoord.xy - uCo * .5;
  vec3 D = normalize(uFw + (p.x * uRt + p.y * uUp) / uF);
  float tc = dot(D, uC), rc = uL * length(uC - D * tc);
  /* điểm trên mặt đất (tia trượt đĩa thì lấy điểm ở mép), tính cho mọi điểm ảnh để đạo hàm theo màn hình hợp lệ */
  float rcc = min(rc, 1.);
  vec3 X = D * (uL * tc - sqrt(1. - rcc * rcc)) - uC * uL, n = normalize(X);
  float vi = asin(clamp(n.z, -1., 1.)), kinh = atan(n.y, n.x) - uTh;
  vec2 uv = vec2(fract(kinh / (2. * PI) + .5), .5 - vi / PI);
  /* ở kinh tuyến 180° uv nhảy từ 1 về 0: card tưởng ảnh bị co hết cỡ, lấy bản thu nhỏ nhất, ra một đường kẻ dọc.
     Lấy thêm đạo hàm của bản uv dời nửa vòng, dùng cái nhỏ hơn (cách của Tarini). */
  vec2 uv2 = vec2(fract(uv.x + .5) - .5, uv.y);
  vec2 gx = dFdx(uv), gy = dFdy(uv), gx2 = dFdx(uv2), gy2 = dFdy(uv2);
  if (abs(gx2.x) + abs(gy2.x) < abs(gx.x) + abs(gy.x)) { gx = gx2; gy = gy2; }
  float phu = tc > 0. ? clamp((1. - rc) / max(fwidth(rc), 1e-7) + .5, 0., 1.) : 0.;   // phần điểm ảnh nằm trên đĩa: mép mịn
  vec4 dat = vec4(0.), khi = vec4(0.);
  if (phu > 0.) {
    float mu = dot(n, uS), ngay = em(-.06, .12, mu), sang = .05 + .95 * pow(max(mu, 0.), .7);
    float bien = 1. - textureLod(tBien, uv, 0.).r;
    vec3 c; float may = 0., den = 0.;
    if (uCoAnh > .5) {
      c = textureGrad(tNgay, uv, gx, gy).rgb * 255.;
      may = em(70., 215., textureGrad(tMay, uv, gx, gy).r * 255.);
      den = pow(textureGrad(tDem, uv, gx, gy).r, .75);
    } else c = bien > .5 ? vec3(14., 40., 92.) : vec3(92., 104., 62.);
    if (uCoCT.x + uCoCT.y > 0.) {     // trong ô ảnh chi tiết: dùng ảnh nét, mờ dần sang ảnh thường ở 0,6° sát mép ô
      float dl = mod(degrees(kinh) - uCT.y + 180., 360.) - 180., dv = degrees(vi) - uCT.x;
      float w = clamp((uCT.z - max(abs(dl), abs(dv))) / .6, 0., 1.);
      if (w > 0.) {
        vec2 uc = vec2(dl, -dv) / (2. * uCT.z) + .5, k = vec2(180., 90.) / uCT.z;
        /* mây trong app là ảnh ghép năm 2002, 20 km mỗi điểm ảnh — phủ nguyên lên ảnh nét thì cả vùng thành vệt nhoè.
           Trong ô ảnh chi tiết cho mây mỏng còn 30% (đằng nào cũng không phải mây hôm nay). */
        if (uCoCT.x > .5) { c = mix(c, textureGrad(tNgayCT, uc, gx * k, gy * k).rgb * 255., w); may *= 1. - .7 * w; }
        if (uCoCT.y > .5) {           // ảnh Black Marble có màu: bỏ nền đất xanh thẫm, giữ ánh đèn — như scripts/lam-traidat.py
          vec3 e = textureGrad(tDemCT, uc, gx * k, gy * k).rgb * 255.;
          float dd = clamp(((e.r * .5 + e.g * .5 - e.b * .55) * 1.6 + max(0., max(e.r, max(e.g, e.b)) - 140.) * 1.2) / 255., 0., 1.);
          den = mix(den, pow(dd, .75), w);
        }
      }
    }
    c = (c * (1. - may) + vec3(245., 245., 250.) * may) * sang;
    if (mu > 0. && may < .5 && bien > .5) {
      vec3 pr = 2. * mu * n - uS;
      float cc = -dot(pr, D), nd0 = -dot(n, D);
      if (cc > 0. && nd0 > 0.) { float lo = pow(cc, 60.) * 150. * (1. - may * 2.) * sqrt(nd0); c += vec3(lo, lo, lo * .9); }
    }
    float nd = -dot(n, D), xien = pow(1. - max(nd, 0.), 2.5) * .45 * ngay;
    c = c * (1. - xien) + vec3(120., 165., 255.) * xien;
    c += vec3(16., 38., 78.) * (ngay * sang * .9);
    float dem = (1. - ngay) * den * (1. - .6 * may) * 320.;
    c = c * ngay + vec3(4. + dem, 7. + dem * .78, 16. + dem * .45) * (1. - ngay);
    dat = vec4(min(c, vec3(255.)) / 255., 1.);
  }
  if (phu < 1. && uChiDat < .5) {
    float ds = (1. + KHI) * (1. + KHI) - rc * rc, sq = sqrt(max(ds, 0.));
    float t0 = uL * tc - sq, t1 = uL * tc + sq;
    if (ds >= 0. && t1 > 0.) {
      float tong = 0., nang = 0.;
      if (uL > 1. + KHI && tc > 0.) {
        float r = max(rc, 1.);
        tong = exp(-(r - 1.) / H) * sqrt(2. * PI * r * H);
        nang = dot(normalize(D * (uL * tc) - uC * uL), uS);
      } else {
        float a = max(0., t0), st = (t1 - a) / 12.;
        for (int k = 0; k < 12; k++) {
          vec3 Xk = D * (a + (float(k) + .5) * st) - uC * uL;
          float r = length(Xk), rho = exp(-(max(r, 1.) - 1.) / H) * st;
          tong += rho; nang += rho * dot(Xk / r, uS);
        }
        nang = tong > 0. ? nang / tong : 0.;
      }
      float sangK = em(-.18, .08, nang), xanh = em(-.02, .3, nang), loi = pow(max(0., dot(D, uS)), 8.) * .6;
      vec3 c = vec3(mix(255., 95., xanh) + loi * 160., mix(120., 160., xanh) + loi * 120., mix(60., 255., xanh) + loi * 60.);
      float al = clamp((1. - exp(-tong * 260.)) * sangK, 0., 1.);
      khi = vec4(min(c, vec3(255.)) / 255. * al, al);
    }
  }
  o = dat * phu + khi * (1. - phu);
}`;
const GL_TRAN = 2.6e6;                                                 // tối đa chừng ấy điểm ảnh mỗi khung
let gl = null, glc = null, glU = null, glTex = null, glHong = false, glAnh = false, glBien = false, glTi = 1, glCT = { ngay: false, dem: false };
function khoiGL() {
  if (gl || glHong || typeof document === 'undefined') return gl;
  try {
    glc = document.createElement('canvas');
    gl = glc.getContext && glc.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false });
    if (!gl) throw new Error('không có WebGL2');
    const sh = (loai, ma) => {
      const s = gl.createShader(loai); gl.shaderSource(s, ma); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);   // một tam giác phủ kín màn
    const la = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
    glU = {};
    ['uCo', 'uF', 'uL', 'uTh', 'uChiDat', 'uCoAnh', 'uFw', 'uRt', 'uUp', 'uC', 'uS', 'uCT', 'uCoCT', 'tNgay', 'tMay', 'tDem', 'tBien', 'tNgayCT', 'tDemCT'].forEach(k => { glU[k] = gl.getUniformLocation(pr, k); });
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    glTex = {};
    ['tNgay', 'tMay', 'tDem', 'tBien', 'tNgayCT', 'tDemCT'].forEach((k, i) => {
      glTex[k] = gl.createTexture(); gl.uniform1i(glU[k], i);
      gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, glTex[k]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 1, 1, 0, gl.RED, gl.UNSIGNED_BYTE, new Uint8Array([k === 'tBien' ? 255 : 0]));   // chưa có: coi là đất
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    });
    glc.addEventListener('webglcontextlost', (e) => { e.preventDefault(); gl = null; glHong = true; });
  } catch (e) { gl = null; glHong = true; }
  return gl;
}
function napTexAnh(k, i, im, xam, kep) {
  gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, glTex[k]);
  let nguon = im;
  const toiDa = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  if (im.naturalWidth > toiDa) {                                        // máy cũ không nạp nổi 4096: thu nhỏ trước
    nguon = document.createElement('canvas'); nguon.width = toiDa; nguon.height = Math.round(im.naturalHeight * toiDa / im.naturalWidth);
    nguon.getContext('2d').drawImage(im, 0, 0, nguon.width, nguon.height);
  }
  gl.texImage2D(gl.TEXTURE_2D, 0, xam ? gl.R8 : gl.RGBA8, xam ? gl.RED : gl.RGBA, gl.UNSIGNED_BYTE, nguon);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, kep ? gl.CLAMP_TO_EDGE : gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const ani = gl.getExtension('EXT_texture_filter_anisotropic');
  if (ani) gl.texParameterf(gl.TEXTURE_2D, ani.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ani.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
}
function veTraiDatGL(may, S, th, f, Rt, Uu, chiDat) {
  if (!khoiGL()) return false;
  if (anhGoc && !glAnh) {
    napTexAnh('tNgay', 0, anhGoc.ngay, false); napTexAnh('tMay', 1, anhGoc.may, true); napTexAnh('tDem', 2, anhGoc.dem, true);
    glAnh = true;
  }
  if (chiTiet) {
    if (chiTiet.ngay && !glCT.ngay) { napTexAnh('tNgayCT', 4, chiTiet.ngay, false, true); glCT.ngay = true; }
    if (chiTiet.dem && !glCT.dem) { napTexAnh('tDemCT', 5, chiTiet.dem, false, true); glCT.dem = true; }
  }
  if (!glBien && layMatNa()) {
    const m = matNa, d = new Uint8Array(m.m.length);
    for (let k = 0; k < d.length; k++) d[k] = m.m[k] * 255;
    gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, glTex.tBien);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, m.w, m.h, 0, gl.RED, gl.UNSIGNED_BYTE, d);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    glBien = true;
  }
  const s = Math.min(DPR, Math.sqrt(GL_TRAN / (W * H))) * glTi;
  const bw = Math.max(1, Math.round(W * s)), bh = Math.max(1, Math.round(H * s));
  if (glc.width !== bw || glc.height !== bh) { glc.width = bw; glc.height = bh; }
  gl.viewport(0, 0, bw, bh);
  const L = dai(may.P), C = nhan(may.P, -1 / L), v = (k, a) => gl.uniform3f(glU[k], a.x, a.y, a.z);
  gl.uniform2f(glU.uCo, bw, bh); gl.uniform1f(glU.uF, f * bw / W); gl.uniform1f(glU.uL, L); gl.uniform1f(glU.uTh, th * RAD);
  gl.uniform1f(glU.uChiDat, chiDat ? 1 : 0); gl.uniform1f(glU.uCoAnh, glAnh ? 1 : 0);
  const coCT = !!chiTiet && (glCT.ngay || glCT.dem);
  gl.uniform4f(glU.uCT, coCT ? chiTiet.vi : 0, coCT ? chiTiet.kinh : 0, CT.nua, 0);
  gl.uniform2f(glU.uCoCT, coCT && glCT.ngay ? 1 : 0, coCT && glCT.dem ? 1 : 0);
  v('uFw', may.F); v('uRt', Rt); v('uUp', Uu); v('uC', C); v('uS', S);
  gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  ctx.drawImage(glc, 0, 0, bw, bh, 0, 0, W, H);
  return true;
}

/* ---------- hành trình ---------- */
/* Mỗi chặng: tên, thời lượng (giây), các dòng chữ hiện dần (mốc phần trăm của chặng) */
const CHANG = [
  { id: 'bay', ten: 'Rời mặt đất', dai: 22, chu: [
    [0, (c) => `Bạn đang được nâng thẳng lên từ ${c.noi}. Lên tới 30 km, bầu trời đã đen, đường chân trời bắt đầu cong.`],
    [.4, () => '100 km: ranh giới quy ước của vũ trụ (đường Kármán).'],
    [.62, () => 'Tên lửa thật không bay thẳng như vầy: Soyuz lên tới quỹ đạo 205 km thì đã bay ngang 1.640 km.'],
    [.86, () => '417 km: độ cao của Trạm Vũ trụ Quốc tế.']] },
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
const GOC_CUI_BAY = 10;                                                // độ, máy quay chặng bay lên nhìn chếch xuống
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
    /* Bay thẳng lên, máy quay GIỮ NGUYÊN góc cúi. Bản đầu cho máy cúi dần từ 9° xuống 30° đúng lúc chân trời chúc
       xuống (từ 5,6° ở 30 km tới 20,2° ở 417 km): hai cái bù nhau, chân trời đứng yên trên màn, chỉ mặt đất trôi
       xuống — mắt hiểu là đang bay tới ("cảm giác bay ngang chứ không phải bay lên"). Giữ góc thì chân trời tụt dần
       và cong dần, mặt đất co về phía dưới: đúng cảm giác đi lên. */
    const u = viTriNguoi(ms), k = khung(u), h = muLog(30, ISS.cao, em(0, 1, p));
    const cui = GOC_CUI_BAY * RAD;
    P = nhan(u, 1 + h / R_KM); F = don(cong(nhan(k.bac, Math.cos(cui)), nhan(u, -Math.sin(cui)))); U = u; fov = 56;
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

let khungTruoc = 0, doKhung = [], epCPU = false;                    // epCPU: bài kiểm ép vẽ bằng bộ xử lý để so
/* máy yếu (dưới chừng 38 khung mỗi giây) thì giảm số điểm ảnh card đồ hoạ phải tô, tới một nửa là thôi */
function doNhip() {
  const bay = performance.now(), dt = bay - khungTruoc;
  if (khungTruoc && !dung && dt < 250) {
    doKhung.push(dt);
    if (doKhung.length >= 40) {
      const tb = doKhung.reduce((a, b) => a + b, 0) / doKhung.length;
      doKhung = [];
      if (tb > 26 && glTi > .5) glTi = Math.max(.5, glTi * .8);
    }
  }
  khungTruoc = bay;
}
function veKhung() {
  if (!ctx) return;
  doNhip();
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
    if (epCPU || !veTraiDatGL(may, S, th, f, Rt, Uu, xa)) veTraiDat(may, S, th, f, Rt, Uu, xa);
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
  soLieuAnh();
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
  /* chỉ giữ hai dòng mới nhất: bốn dòng chồng lên nhau che mất Trái Đất trên màn điện thoại */
  const dong = c.c.chu.filter(([p]) => c.p >= p).map(([, h]) => h(boi)).slice(-2);
  const chu = dong.join('\n');
  if (c.k !== changCu) {
    changCu = c.k;
    phu.querySelector('.tc-ten').textContent = c.c.ten;
    phu.querySelectorAll('.tc-cham i').forEach((n, k) => n.classList.toggle('dang', k <= c.k));
  }
  if (chu !== chuCu) {
    const truoc = chuCu.split('\n');                                   // dòng đã hiện thì đừng cho hiện dần lại
    chuCu = chu;
    phu.querySelector('.tc-chu').innerHTML = dong.map(s => `<p${truoc.includes(s) ? ' class="cu"' : ''}>${esc(s)}</p>`).join('');
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
  napChiTiet(g0);
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
            Vùng quanh chỗ bạn dùng ảnh chi tiết 500 m tải từ máy chủ GIBS của NASA lúc mở (chỉ gửi vị trí làm tròn tới 1 độ).
            Quỹ đạo có độ cao, góc nghiêng, chu kỳ, tốc độ thật của Trạm Vũ trụ Quốc tế nhưng được đặt cho đi ngang qua chỗ bạn — không phải
            vị trí thật của trạm. Lớp khí quyển tô gần đúng theo mật độ không khí.</p>
          <p>Hiệu ứng toàn cảnh: Frank White, The Overview Effect (1987); Yaden và cs., Psychology of Consciousness (2016); cách dựng
            hành trình theo Stepanova và cs., Frontiers in Digital Humanities (2019). Lời kể của phi hành gia Ả Rập Xê Út: sách The Home Planet
            (1988). Ảnh Trái Đất mọc: William Anders, Apollo 8, 24/12/1968. Chấm xanh mờ: Voyager 1, 14/2/1990, 6,06 tỉ km; Carl Sagan,
            Pale Blue Dot (1994). Số liệu trạm: Wikipedia, International Space Station. Đường bay Soyuz: RussianSpaceWeb.</p>
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
  _tuXichDao: tuXichDao, _tGio: () => tGio, _dung: () => dung, _g0: () => g0, _co: () => !!(anhGoc || anh), _gl: () => !!gl, _glTi: () => glTi,
  _epCPU: (b) => { epCPU = !!b; }, _toi: (t) => { tGio = t; batDau = performance.now() - t * 1000; if (dung && ctx) veKhung(); }, _canChiTiet: canChiTiet, _urlChiTiet: urlChiTiet, _chiTiet: () => chiTiet, CT, GOC_CUI_BAY };
})();
