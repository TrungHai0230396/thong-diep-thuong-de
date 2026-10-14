/* Nhìn từ ngoài vũ trụ — cảnh thứ hai của ngôi sao Trời đêm.

   Ba cảnh. Hai cảnh đầu đúng vị trí THẬT lúc này:
   - Trái Đất – Mặt Trăng: quả địa cầu có lục địa (Natural Earth, assets/datlien.js), nửa quay về
     Mặt Trời là ban ngày, có chấm chỗ bạn đứng; Mặt Trăng ở đúng hướng của nó, nửa quay về Mặt Trời
     sáng — nhìn là hiểu vì sao đêm nay trăng khuyết. Mặt Trăng luôn quay một mặt về Trái Đất, nên
     các biển của nó (cùng bản đồ với trăng ngoài trời) luôn hướng vào trong.
   - Hệ Mặt Trời: đủ tám hành tinh trên quỹ đạo theo bảng phần tử Kepler của JPL (assets/astro.js), và
     vành đai tiểu hành tinh. Chạm vào một hành tinh là ra thông tin của nó.
   Cảnh thứ ba, So kích thước, không có vị trí: chỉ đúng tỉ lệ to nhỏ của Mặt Trời, tám hành tinh, hai hành
   tinh lùn và ba mặt trăng lớn.

   Vì sao phải nén: khoảng cách thật Trái Đất – Mặt Trăng là 60 lần bán kính Trái Đất, vẽ đúng thì
   Mặt Trăng chỉ còn một chấm. Nên kéo nó lại gần 15 lần, và nói rõ trên màn. Hệ Mặt Trời thì nén
   khoảng cách theo luỹ thừa 0,4 (Hải Vương xa gấp 78 lần Sao Thuỷ, vẽ thành chưa tới 6 lần) và phóng to
   hành tinh theo căn bậc ba.

   Không thư viện 3D: phép chiếu phối cảnh tự viết, quả cầu tô từng điểm ảnh bằng tia chiếu. */
(() => {
'use strict';

const A = () => self.TDTD_ASTRO;
const RAD = Math.PI / 180;
const DS_TRANG = 4;                 // Mặt Trăng vẽ cách tâm Trái Đất 4 bán kính (thật: ~60)
const R_TRANG = 1737.4 / 6371.0;    // bán kính Mặt Trăng so với Trái Đất: đúng tỉ lệ thật

const cong = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
const tru = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const nhan = (a, k) => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const cham = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const cheo = (a, b) => ({ x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x });
const don = (a) => { const l = Math.hypot(a.x, a.y, a.z) || 1; return { x: a.x / l, y: a.y / l, z: a.z / l }; };
const tuXichDao = (ra, dec) => ({ x: Math.cos(dec * RAD) * Math.cos(ra * RAD), y: Math.cos(dec * RAD) * Math.sin(ra * RAD), z: Math.sin(dec * RAD) });

/* ---------- trạng thái ---------- */

let canh = 'traiDat';               // 'traiDat' | 'heMatTroi' | 'kichThuoc'
const cam = { traiDat: { yaw: 0, pitch: 18, xa: 9 }, heMatTroi: { yaw: -90, pitch: 58, xa: 30 }, kichThuoc: { k: 0, dy: 0 } };
const THU_TU_CANH = ['traiDat', 'heMatTroi', 'kichThuoc'];
const TEN_CANH = { traiDat: 'Trái Đất', heMatTroi: 'Hệ Mặt Trời', kichThuoc: 'So kích thước' };

/* Đường kính thật, km — bảng Planetary Fact Sheet của NASA (đường kính xích đạo); Mặt Trời: bán kính
   695.700 km theo Sun Fact Sheet của NASA; Diêm Vương: Pluto Fact Sheet của NASA. Ceres, Ganymede, Titan:
   bán kính trung bình theo bảng thông số vệ tinh và tiểu hành tinh của JPL (469,7; 2631,2; 2574,7 km). */
const DUONG_KINH = { troi: 1391400, thuy: 4879, kim: 12104, dat: 12756, trang: 3475, hoa: 6792, moc: 142984, tho: 120536,
  thien: 51118, hai: 49528, diem: 2376, ceres: 939, gany: 5262, titan: 5149 };
const soTD = (ma) => DUONG_KINH[ma] / DUONG_KINH.dat;     // gấp bao nhiêu lần Trái Đất
let daDatCam = false;
let tua = 0, lech = 0, lucTruoc = 0;          // tua nhanh: 0 thật, 1 một giờ mỗi giây, 2 một ngày mỗi giây
const TUA = [{ k: 0, ten: 'Giờ thật' }, { k: 3600, ten: '1 giờ mỗi giây' }, { k: 86400, ten: '1 ngày mỗi giây' }];
/* Hải Vương đi một vòng mất 165 năm: ở 10 ngày mỗi giây vẫn phải chờ một tiếng rưỡi, nên có thêm mức 100 ngày
   (mười phút một vòng). Quá năm 2050 thì astro.js tự đổi sang bảng dài hạn của JPL, dùng được tới năm 3000. */
const TUA_HMT = [{ k: 0, ten: 'Giờ thật' }, { k: 86400, ten: '1 ngày mỗi giây' }, { k: 864000, ten: '10 ngày mỗi giây' },
  { k: 8640000, ten: '100 ngày mỗi giây' }];
let keo = null;
let quay = null;                     // đích quay máy (yaw, pitch) khi chạm mũi tên Mặt Trời
let muiTen = null;                   // chỗ mũi tên Mặt Trời trên màn ở khung vừa vẽ, để chạm vào
let huongTroi = null;                // hướng Mặt Trời ở khung vừa vẽ

/* ---------- dữ liệu ---------- */

let matNa = null;                    // mặt nạ đất 720×360, 1 = đất
function napDat() {
  if (matNa || !self.TDTD_DATLIEN) return matNa;
  const D = self.TDTD_DATLIEN, m = new Uint8Array(D.rong * D.cao);
  D.du.split('|').forEach((r, y) => {
    let x = 0, v = 0;
    for (const t of r.split('.')) { const n = parseInt(t, 36); if (v) m.fill(1, y * D.rong + x, y * D.rong + x + n); x += n; v ^= 1; }
  });
  matNa = { m, w: D.rong, h: D.cao };
  return matNa;
}
/* Phần đất quanh một điểm, nội suy song tuyến tính cho bờ biển khỏi răng cưa. */
function laDat(vi, kinh) {
  const M = napDat();
  if (!M) return 0;
  const fx = ((kinh + 180) % 360 + 360) % 360 * 2 - .5, fy = (90 - vi) * 2 - .5;
  const x0 = Math.floor(fx), y0 = Math.max(0, Math.min(M.h - 1, Math.floor(fy))), y1 = Math.min(M.h - 1, y0 + 1);
  const tx = fx - x0, ty = Math.max(0, Math.min(1, fy - y0));
  const xa = (x0 + M.w) % M.w, xb = (x0 + 1 + M.w) % M.w;
  const g = (x, y) => M.m[y * M.w + x];
  return (g(xa, y0) * (1 - tx) + g(xb, y0) * tx) * (1 - ty) + (g(xa, y1) * (1 - tx) + g(xb, y1) * tx) * ty;
}

let nenSao = null;                   // sao nền: 1.500 sao sáng nhất, chỉ cần hướng
function napNenSao() {
  if (nenSao || !self.TDTD_SAOSANG) return nenSao;
  const S = self.TDTD_SAOSANG, g = A().giaiSao(S.du, Math.min(1500, S.dem));
  nenSao = [];
  for (let i = 0; i < g.v.length; i++) nenSao.push({ v: tuXichDao(g.ra[i], g.dec[i]), m: g.v[i] });
  return nenSao;
}

/* ---------- máy quay ---------- */

let W = 360, H = 640, DPR = 1, f = 500, P = { x: 0, y: 0, z: 0 }, F, Rt, U, CY = 320;
let duoiMan = 290;                   // khối chữ + hàng nút ở đáy cao bao nhiêu (nightsky.js đo rồi đưa vào)
/* coSo: cạnh dùng để đặt góc nhìn — mặc định cạnh ngắn của màn; cảnh Hệ Mặt Trời đưa vào khoảng trống thật. */
function datMay(dich, c, coSo) {
  const p = Math.max(-85, Math.min(85, c.pitch)) * RAD, y = c.yaw * RAD;
  P = cong(dich, { x: c.xa * Math.cos(p) * Math.cos(y), y: c.xa * Math.cos(p) * Math.sin(y), z: c.xa * Math.sin(p) });
  F = don(tru(dich, P));
  Rt = don(cheo(F, { x: 0, y: 0, z: 1 }));
  U = cheo(Rt, F);
  f = ((coSo || Math.min(W, H)) / 2) / Math.tan(22 * RAD); // góc nhìn 44° theo cạnh ngắn của màn
}
function chieu(X) {
  const d = tru(X, P), z = cham(d, F);
  if (z < .05) return null;
  return { x: W / 2 + cham(d, Rt) / z * f, y: CY - cham(d, U) / z * f, z };
}
function chieuHuong(v) {                           // điểm ở vô cực (sao, Mặt Trời)
  const z = cham(v, F);
  if (z < .05) return null;
  return { x: W / 2 + cham(v, Rt) / z * f, y: CY - cham(v, U) / z * f, z };
}

/* ---------- tô một quả cầu từng điểm ảnh ---------- */

let tamVe = null;
function toCau(ctx, C, r, mau) {
  const pc = chieu(C);
  if (!pc) return null;
  const rs = r * f / pc.z * 1.08 + 2;
  let k = Math.min(2, DPR);
  if ((2 * rs * k) ** 2 > 360000) k = Math.sqrt(360000) / (2 * rs);
  const x0 = Math.floor(pc.x - rs), y0 = Math.floor(pc.y - rs), n = Math.ceil(2 * rs * k);
  if (n < 2 || x0 > W || y0 > H || x0 + 2 * rs < 0 || y0 + 2 * rs < 0) return pc;
  if (!tamVe) tamVe = document.createElement('canvas');
  if (tamVe.width < n) tamVe.width = n;
  if (tamVe.height < n) tamVe.height = n;
  const g = tamVe.getContext('2d');
  const img = g && g.createImageData ? g.createImageData(n, n) : null;
  if (!img || !img.data) {                         // trình duyệt giả trong bài kiểm: một hình tròn là đủ
    ctx.fillStyle = '#456'; ctx.beginPath(); ctx.arc(pc.x, pc.y, rs, 0, 6.2832); ctx.fill();
    return pc;
  }
  const d = img.data, L = tru(P, C), cL = cham(L, L) - r * r;
  for (let j = 0; j < n; j++) {
    const sy = y0 + (j + .5) / k;
    for (let i = 0; i < n; i++) {
      const sx = x0 + (i + .5) / k;
      const a = (sx - W / 2) / f, b = -(sy - CY) / f;
      const D = don({ x: F.x + a * Rt.x + b * U.x, y: F.y + a * Rt.y + b * U.y, z: F.z + a * Rt.z + b * U.z });
      const bb = cham(D, L), ds = bb * bb - cL;
      if (ds < 0) continue;
      const t = -bb - Math.sqrt(ds);
      const X = { x: P.x + t * D.x, y: P.y + t * D.y, z: P.z + t * D.z };
      const nrm = { x: (X.x - C.x) / r, y: (X.y - C.y) / r, z: (X.z - C.z) / r };
      const c = mau(nrm, D);
      const o = (j * n + i) * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
      d[o + 3] = 255 * Math.min(1, Math.sqrt(ds) / r * rs * 2.2);    // mép mịn
    }
  }
  g.clearRect(0, 0, tamVe.width, tamVe.height);
  g.putImageData(img, 0, 0);
  ctx.drawImage(tamVe, 0, 0, n, n, x0, y0, n / k, n / k);
  return { ...pc, rs: r * f / pc.z };
}

/* ---------- cảnh Trái Đất – Mặt Trăng ---------- */

function traiDatMatTrang(JD, noi) {
  const t = A().matTroi(JD), m = A().matTrang(JD), m2 = A().matTrang(JD + .25);
  const s = tuXichDao(t.ra, t.dec), vM = tuXichDao(m.ra, m.dec), vM2 = tuXichDao(m2.ra, m2.dec);
  const th = A().gioSao(JD);
  const u = tuXichDao(noi.kinh + th, noi.vi);              // chỗ bạn đứng, trong hệ trời (Trái Đất đã quay)
  return { s, vM, vM2, th, u, M: nhan(vM, DS_TRANG), kc: m.kc, sang: m.sang, tuoi: m.tuoi };
}

function veTraiDat(ctx, JD, noi, luc) {
  const c = traiDatMatTrang(JD, noi);
  if (!daDatCam) {                                        // lần đầu: quay máy về phía có chỗ bạn đứng, hơi nghiêng về phía trăng
    const h = don(cong(nhan(c.u, 1), nhan(c.vM, .5)));
    cam.traiDat.yaw = Math.atan2(h.y, h.x) / RAD; cam.traiDat.pitch = Math.max(-40, Math.min(50, Math.asin(h.z) / RAD + 10));
    daDatCam = true;
  }
  const dich = nhan(c.vM, DS_TRANG * .3);                 // nhìn vào giữa, lệch về phía Mặt Trăng
  datMay(dich, cam.traiDat);
  veNen(ctx, (v) => v);
  /* Mặt Trời ở rất xa: vẽ quầng nếu nó trong khung, không thì một mũi tên ở mép chỉ về phía nó */
  veMatTroiXa(ctx, c.s);
  /* quỹ đạo Mặt Trăng: mặt phẳng qua hai vị trí cách nhau sáu tiếng */
  const nPl = don(cheo(c.vM, c.vM2)), e1 = c.vM, e2 = cheo(nPl, e1);
  ctx.strokeStyle = 'rgba(200,210,235,.22)'; ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
  ctx.beginPath();
  let dau = true;
  for (let k = 0; k <= 120; k++) {
    const a = k / 120 * 2 * Math.PI, X = nhan(cong(nhan(e1, Math.cos(a)), nhan(e2, Math.sin(a))), DS_TRANG);
    const p = chieu(X);
    if (!p) { dau = true; continue; }
    if (dau) { ctx.moveTo(p.x, p.y); dau = false; } else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke(); ctx.setLineDash([]);
  /* hai quả cầu: vẽ cái xa trước */
  const O = { x: 0, y: 0, z: 0 };
  const xaDat = Math.hypot(P.x, P.y, P.z), xaTrang = Math.hypot(P.x - c.M.x, P.y - c.M.y, P.z - c.M.z);
  const veD = () => toCau(ctx, O, 1, (n, D) => mauDat(n, D, c));
  const veT = () => toCau(ctx, c.M, R_TRANG, (n) => mauTrang(n, c));
  let pD, pT;
  if (xaDat > xaTrang) { pD = veD(); pT = veT(); } else { pT = veT(); pD = veD(); }
  /* khí quyển: viền xanh mỏng quanh Trái Đất */
  /* Gradient tròn tô cả phần BÊN TRONG vòng đầu bằng màu của mốc 0 — bản đầu để mốc 0 là xanh 35% nên
     cả quả địa cầu bị phủ một lớp mờ, mặt đêm ra xanh nhạt. Giờ mốc 0 trong suốt, chỉ còn viền ở mép. */
  if (pD && pD.rs) {
    const g = ctx.createRadialGradient(pD.x, pD.y, pD.rs * .9, pD.x, pD.y, pD.rs * 1.12);
    g.addColorStop(0, 'rgba(120,170,255,0)'); g.addColorStop(.45, 'rgba(120,170,255,.3)'); g.addColorStop(1, 'rgba(120,170,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(pD.x, pD.y, pD.rs * 1.12, 0, 6.2832); ctx.fill();
  }
  /* chỗ bạn đứng */
  const nhin = cham(c.u, don(tru(P, c.u))) > 0;
  const pU = chieu(c.u);
  const ngay = cham(c.u, c.s) > 0;
  if (pU && nhin) {
    ctx.fillStyle = '#ffd27a'; ctx.beginPath(); ctx.arc(pU.x, pU.y, 3.5, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,122,.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(pU.x, pU.y, 7, 0, 6.2832); ctx.stroke();
    chu(ctx, `${noi.ten === 'chỗ bạn đứng' ? 'Bạn ở đây' : noi.ten} · ${ngay ? 'ban ngày' : 'ban đêm'}`, pU.x, pU.y - 12, 'rgba(255,226,170,.95)');
  }
  if (pT) chu(ctx, 'Mặt Trăng', pT.x, pT.y + (pT.rs || 10) + 16, 'rgba(240,236,220,.9)');
  if (pD) chu(ctx, 'Trái Đất', pD.x, pD.y + (pD.rs || 40) + 18, 'rgba(190,215,250,.9)');
  return { ...c, ngay, thayCho: !!(pU && nhin) };
}

function mauDat(n, D, c) {
  const vi = Math.asin(Math.max(-1, Math.min(1, n.z))) / RAD;
  const kinh = Math.atan2(n.y, n.x) / RAD - c.th;
  const dat = laDat(vi, kinh);
  const bang = vi < -60 || vi > 70 ? 1 : 0;                // băng: Nam Cực, và vùng cực Bắc (Greenland, các đảo)
  const nen = [22 + (bang ? 200 : 0) * dat + (1 - bang) * 66 * dat, 64 + (bang ? 170 : 0) * dat + (1 - bang) * 52 * dat, 122 + (bang ? 115 : 0) * dat - (1 - bang) * 54 * dat];
  const ns = cham(n, c.s);
  const sang = ns > 0 ? .22 + .78 * Math.pow(ns, .8) : .22;
  const ban = Math.max(0, Math.min(1, (ns + .1) / .22));  // dải chạng vạng mềm, chừng 12°
  let r = nen[0] * sang, g = nen[1] * sang, b = nen[2] * sang;
  if (dat < .5 && ns > 0) {                                // mặt biển loá nắng
    const rf = nhan(n, 2 * ns), refl = tru(rf, c.s), lo = Math.pow(Math.max(0, -cham(refl, D)), 40) * 120 * (1 - dat);
    r += lo; g += lo; b += lo;
  }
  const vien = Math.pow(1 - Math.abs(cham(n, D)), 3) * 70 * ban;   // khí quyển sáng ở mép phía ngày
  const dem = [6 + 10 * dat, 10 + 12 * dat, 22 + 8 * dat];
  return [dem[0] + (r + vien * .6 - dem[0]) * ban, dem[1] + (g + vien * .8 - dem[1]) * ban, dem[2] + (b + vien - dem[2]) * ban].map(v => Math.min(255, v));
}

/* Mặt Trăng trong hệ của chính nó: trục "về Trái Đất" là kinh độ 0, Bắc theo cực Bắc hoàng đạo
   (trục quay Mặt Trăng chỉ lệch cực đó 1,5°). Nhìn từ Trái Đất, phía Đông của Mặt Trăng (Biển Nguy
   hiểm) ở bên phải — nên trục Đông = hướng nhìn × trục Bắc. */
const CUC_HD = (() => { const e = 23.4393 * RAD; return { x: 0, y: -Math.sin(e), z: Math.cos(e) }; })();
function mauTrang(n, c) {
  const v = c.vM, zl = nhan(v, -1);
  const yl = don(tru(CUC_HD, nhan(zl, cham(CUC_HD, zl)))), xl = cheo(v, yl);
  const X = cham(n, xl), Y = cham(n, yl), Z = cham(n, zl);
  let alb = 1;
  const BIEN = self.TDTD_TROIDEM && self.TDTD_TROIDEM._bien;
  if (BIEN) for (const m of BIEN) {
    const gc = Math.acos(Math.max(-1, Math.min(1, X * m.x + Y * m.y + Z * m.z)));
    if (gc < m.gocNgoai) { const q = Math.min(1, (m.gocNgoai - gc) / (m.gocNgoai * .16)); alb *= 1 - .45 * m.toi * q * q * (3 - 2 * q); }
  }
  alb = Math.max(.45, alb);
  const ns = cham(n, c.s), I = ns > 0 ? Math.pow(ns, .55) : 0;
  return [18 + 225 * I * alb, 18 + 220 * I * alb, 22 + 200 * I * alb];
}

/* ---------- cảnh Hệ Mặt Trời ---------- */

/* Khoảng cách: Hải Vương xa gấp 78 lần Sao Thuỷ, vẽ đúng thì hoặc Sao Thuỷ lọt vào trong Mặt Trời, hoặc Hải
   Vương ra khỏi màn. Bản trước chỉ có sáu hành tinh, nén theo căn bậc hai; thêm Thiên Vương, Hải Vương thì quỹ
   đạo Hải Vương tràn cả hai mép điện thoại. Giờ nén theo luỹ thừa 0,4: Hải Vương vẽ xa gấp 5,7 lần Sao Thuỷ,
   vẫn đúng thứ tự, và Sao Hoả – vành đai tiểu hành tinh – Sao Mộc vẫn tách bạch.
   Kích cỡ: theo CĂN BẬC BA của đường kính thật — một quy tắc cho Mặt Trời và cả tám hành tinh — và đo bằng
   CÙNG đơn vị với khoảng cách, nên phóng to thu nhỏ thì cả hệ co giãn theo nhau. Bản trước vẽ Mặt Trời một
   cỡ cố định bằng điểm ảnh: thu nhỏ là nó che hết quỹ đạo Sao Thuỷ. Giờ Mặt Trời (bán kính 1,17 đơn vị cảnh)
   luôn nằm trong chỗ gần nhất của quỹ đạo Sao Thuỷ (1,71), dù phóng thế nào. Cỡ không thể đúng tỉ lệ: Trái
   Đất chỉ bằng chừng 1/23.500 bề rộng quỹ đạo của nó. */
const KC_MU = .4, KC_HE = 2.74;                            // khoảng cách vẽ = 2,74 × (đơn vị thiên văn)^0,4
const nenKC = (r) => KC_HE * Math.pow(r, KC_MU);
const nen2 = (p) => { const r = Math.hypot(p.x, p.y, p.z) || 1e-9; return nhan(p, nenKC(r) / r); };
const CO_TD = .2457;                                       // bán kính Trái Đất trong cảnh, cùng đơn vị với khoảng cách
const coNen = (ma) => CO_TD * Math.cbrt(soTD(ma));
const HANH = [
  ['thuy', 'Sao Thuỷ', '#c8bda8'], ['kim', 'Sao Kim', '#f2e2b4'], ['dat', 'Trái Đất', '#6fa0e8'],
  ['hoa', 'Sao Hoả', '#e08b6a'], ['moc', 'Sao Mộc', '#e9d6ae'], ['tho', 'Sao Thổ', '#e8d9a0'],
  ['thien', 'Sao Thiên Vương', '#b5e3ea'], ['hai', 'Sao Hải Vương', '#7193ea'],
].map(([ma, ten, mau]) => [ma, ten, mau, coNen(ma)]);
const TEN = Object.fromEntries(HANH.map(h => [h[0], h[1]]));

/* Vành đai tiểu hành tinh chính: giữa Sao Hoả và Sao Mộc, từ khe Kirkwood 4:1 (2,06 đvtv) tới khe 2:1 (3,28).
   Không vẽ từng tiểu hành tinh thật — 700 chấm đặt ngẫu nhiên (cố định giữa các lần mở) trong vành đó, mỗi
   chấm đi quanh Mặt Trời đúng tốc độ của quỹ đạo ở khoảng cách của nó (định luật Kepler 3), nên bấm Tua là
   thấy vành trong quay nhanh hơn vành ngoài. */
const VANH_DAI = (() => {
  let a = 20261014 >>> 0;
  const r = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ds = [];
  for (let i = 0; i < 700; i++) {
    const kc = 2.06 + 1.22 * Math.pow(r(), .85), goc = r() * 360, nghieng = (r() - .5) * 2 * 10 * RAD;
    ds.push({ kc, goc, z: Math.sin(nghieng), n: .9856076686 / Math.pow(kc, 1.5) });   // n: độ mỗi ngày
  }
  return ds;
})();

/* Số liệu để chạm vào xem: fact sheet của NASA cho từng hành tinh và Diêm Vương; Ceres theo JPL. Một vòng quanh
   Mặt Trời là chu kỳ so với các sao (sidereal) — đúng cái hành tinh trên màn đi hết khi tua. Bản trước chép cột
   chu kỳ của bảng tổng hợp, là chu kỳ chí tuyến (tropical): Hải Vương ra 163,7 năm trong khi một vòng thật là
   164,8. Độ dài một ngày — giờ; nhiệt độ trung bình — °C, với hành tinh khí là ở mức áp suất 1 bar. */
const TT = {
  troi: { loai: 'ngôi sao ở tâm hệ' },
  thuy: { loai: 'hành tinh đá', nam: 87.969, ngay: 4222.6, nhiet: 167 },
  kim: { loai: 'hành tinh đá', nam: 224.701, ngay: 2802.0, nhiet: 464 },
  dat: { loai: 'hành tinh đá · bạn ở đây', nam: 365.256, ngay: 24.0, nhiet: 15 },
  hoa: { loai: 'hành tinh đá', nam: 686.980, ngay: 24.7, nhiet: -65 },
  moc: { loai: 'hành tinh khí khổng lồ', nam: 4332.589, ngay: 9.9, nhiet: -110 },
  tho: { loai: 'hành tinh khí khổng lồ', nam: 10755.70, ngay: 10.7, nhiet: -140 },
  thien: { loai: 'hành tinh băng khổng lồ', nam: 30685.4, ngay: 17.2, nhiet: -195 },
  hai: { loai: 'hành tinh băng khổng lồ, xa nhất', nam: 60189, ngay: 16.1, nhiet: -200 },
  diem: { loai: 'hành tinh lùn, ngoài quỹ đạo Hải Vương', nam: 90560, ngay: 153.3, nhiet: -225 },
  ceres: { loai: 'hành tinh lùn, lớn nhất vành đai tiểu hành tinh', nam: 1681.6 },
  gany: { loai: 'mặt trăng của Sao Mộc, mặt trăng lớn nhất hệ Mặt Trời' },
  titan: { loai: 'mặt trăng lớn nhất của Sao Thổ, có bầu khí quyển dày' },
  trang: { loai: 'mặt trăng của Trái Đất' },
};
const soVN = (x, so = 1) => x.toLocaleString('vi-VN', { maximumFractionDigits: so });
const chuKy = (d) => d < 1000 ? `${soVN(d, 0)} ngày` : `${soVN(d / 365.25)} năm`;
const doDaiNgay = (h) => h < 48 ? `${soVN(h)} giờ` : `${soVN(h / 24, h / 24 < 10 ? 1 : 0)} ngày Trái Đất`;
const thuocTinh = (t) => [t.nam && `một vòng quanh Mặt Trời: ${chuKy(t.nam)}`, t.ngay && `một ngày: ${doDaiNgay(t.ngay)}`,
  t.nhiet !== undefined && `nhiệt độ trung bình ${t.nhiet < 0 ? '−' + Math.abs(t.nhiet) : t.nhiet} °C`].filter(Boolean);

let chonVT = null;                   // vật thể đang chọn (chạm vào) ở cảnh Hệ Mặt Trời hay So kích thước
let diemCham = [];                   // chỗ các vật thể trên màn ở khung vừa vẽ, để chạm vào dò ra
let hHMT = null;                     // chiều cao khoảng trống của cảnh Hệ Mặt Trời, trượt êm khi khối chữ dưới đáy đổi cao thấp

function veHeMatTroi(ctx, JD) {
  /* Đặt cả hệ vào khoảng trống giữa nút đóng ở trên và khối chữ + hàng nút ở dưới (duoiMan, đo từ trang). */
  /* Trượt êm cả chiều cao (nên cả tâm dọc lẫn độ phóng), không riêng tâm: trên màn thấp, bấm Tua làm hàng nút
     xuống thêm một dòng, bản trước để độ phóng nhảy 24% ngay trong một khung. */
  const tren = 56, hMuc = Math.max(160, H - tren - duoiMan);
  hHMT = hHMT === null ? hMuc : hHMT + (hMuc - hHMT) * .15;
  CY = tren + hHMT / 2;
  datMay({ x: 0, y: 0, z: 0 }, cam.heMatTroi, Math.min(W, hHMT));
  const e = A().nghieng(JD - 2451545) * RAD;
  veNen(ctx, (v) => ({ x: v.x, y: v.y * Math.cos(e) + v.z * Math.sin(e), z: -v.y * Math.sin(e) + v.z * Math.cos(e) }));   // sao nền trong hệ hoàng đạo
  /* quỹ đạo */
  for (const [ma] of HANH) {
    ctx.strokeStyle = ma === 'dat' ? 'rgba(111,160,232,.5)' : ma === chonVT ? 'rgba(255,214,140,.55)' : 'rgba(200,210,235,.22)'; ctx.lineWidth = 1;
    ctx.beginPath();
    const qd = A().quyDao(ma, JD, 160);
    let dau = true;
    for (const q of qd.concat([qd[0]])) {
      const p = chieu(nen2(q));
      if (!p) { dau = true; continue; }
      if (dau) { ctx.moveTo(p.x, p.y); dau = false; } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }
  /* vành đai tiểu hành tinh */
  const ngay = JD - 2451545;
  ctx.fillStyle = 'rgba(196,186,166,.42)';
  const giua = [];
  for (const d of VANH_DAI) {
    const g = (d.goc + d.n * ngay) * RAD, X = nen2({ x: d.kc * Math.cos(g), y: d.kc * Math.sin(g), z: d.kc * d.z * .5 });
    const p = chieu(X);
    if (!p) continue;
    ctx.fillRect(p.x - .6, p.y - .6, 1.2, 1.2);
  }
  for (let k = 0; k < 16; k++) {                           // chỗ có thể ghi tên vành đai: giữa vành, 16 hướng
    const g = k / 16 * 2 * Math.PI, p = chieu(nen2({ x: 2.7 * Math.cos(g), y: 2.7 * Math.sin(g), z: 0 }));
    if (p) giua.push(p);
  }
  /* Mặt Trời và hành tinh: vẽ cái xa trước. Mặt Trời cũng xếp theo độ xa — bản trước luôn vẽ nó trước tiên,
     nên hành tinh ở PHÍA SAU Mặt Trời vẫn đè lên đĩa của nó. */
  const p0 = chieu({ x: 0, y: 0, z: 0 });
  const vt = [];
  if (p0) vt.push({ ma: 'troi', ten: 'Mặt Trời', p: p0, rv: Math.max(3, coNen('troi') * f / p0.z) });
  for (const [ma, ten, mau, r] of HANH) {
    const X = nen2(A().nhatTamJD(ma, JD)), p = chieu(X);
    if (p) vt.push({ ma, ten, mau, p, X, rv: Math.max(1.4, r * f / p.z) });
  }
  vt.sort((a, b) => b.p.z - a.p.z);
  for (const h of vt) {
    const { p } = h, r = h.rv;
    if (h.ma === 'troi') {
      const g = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 1.9);
      g.addColorStop(0, 'rgba(255,220,140,.45)'); g.addColorStop(1, 'rgba(255,180,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 1.9, 0, 6.2832); ctx.fill();
      ctx.fillStyle = '#fff3cc'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
      continue;
    }
    /* nửa quay về Mặt Trời sáng: gradient lệch về phía Mặt Trời trên màn */
    const ve = p0 ? don({ x: p0.x - p.x, y: p0.y - p.y, z: 0 }) : { x: 0, y: -1 };
    const g = ctx.createRadialGradient(p.x + ve.x * r * .5, p.y + ve.y * r * .5, r * .1, p.x, p.y, r * 1.05);
    g.addColorStop(0, h.mau); g.addColorStop(.75, h.mau); g.addColorStop(1, 'rgba(20,24,40,1)');
    const vanh = h.ma === 'tho' ? vanhThoTren(h.X, r, p) : null;
    if (vanh) veVanh(ctx, vanh, false);                    // nửa vành phía sau hành tinh
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    if (vanh) veVanh(ctx, vanh, true);                     // nửa vành phía trước
  }
  /* chỗ chạm: rộng hơn hình cho vừa đầu ngón tay */
  diemCham = vt.map(h => { const r = Math.max(16, h.rv + 8); return { ma: h.ma, x: h.p.x, y: h.p.y, rx: r, ry: r, rv: h.rv, z: h.p.z }; });
  const chon = vt.find(h => h.ma === chonVT);
  if (chon) {
    ctx.strokeStyle = 'rgba(255,214,140,.9)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(chon.p.x, chon.p.y, chon.rv + (chon.ma === 'tho' ? chon.rv * 1.4 : 0) + 6, 0, 6.2832); ctx.stroke();
  }
  /* Ghi tên: coi các hành tinh và Mặt Trời là chỗ đã chiếm, rồi thử dưới, trên, phải, trái của từng
     hành tinh theo thứ tự ưu tiên. Tên nào phải dời khỏi chỗ ngay dưới thì kẻ một vạch nối về hành tinh
     của nó — lúc Sao Kim đứng sát Trái Đất, bản đầu để chữ "Trái Đất" nằm ngay dưới chấm Sao Kim. */
  for (const h of vt) daGhi.push({ x0: h.p.x - h.rv - 2, x1: h.p.x + h.rv + 2, y0: h.p.y - h.rv - 2, y1: h.p.y + h.rv + 2 });
  const THU_TU = [chonVT, 'dat', 'kim', 'hoa', 'moc', 'tho', 'thien', 'hai', 'thuy', 'troi'];
  for (const h of vt.slice().sort((a, b) => THU_TU.indexOf(a.ma) - THU_TU.indexOf(b.ma))) {
    if (h.ma === 'troi') {
      ghiTen(ctx, 'Mặt Trời', choQuanh(h.p.x, h.p.y, h.rv, rong(ctx, 'Mặt Trời')), 'rgba(255,232,180,.95)');
      continue;
    }
    const ten = h.ma === 'dat' ? 'Trái Đất · bạn ở đây' : h.ten, { x, y } = h.p, r = h.rv;
    const w = rong(ctx, ten);
    const cho = choQuanh(x, y, r, w);
    const o = ghiTen(ctx, ten, cho, h.ma === 'dat' ? 'rgba(190,215,250,.95)' : h.ma === chonVT ? 'rgba(255,226,170,.98)' : 'rgba(235,228,210,.85)', h.ma === 'dat' || h.ma === chonVT);
    if (o && o !== cho[0] && Math.hypot(o[0] - x, o[1] - y) > r + 24) {   // dời xa: kẻ vạch nối về hành tinh
      ctx.strokeStyle = 'rgba(220,225,240,.35)'; ctx.lineWidth = 1;
      const dx = o[0] - x, dy = o[1] - 4 - y, l = Math.hypot(dx, dy) || 1;
      ctx.beginPath(); ctx.moveTo(x + dx / l * (r + 2), y + dy / l * (r + 2)); ctx.lineTo(o[0] - dx / l * 10, o[1] - 4 - dy / l * 8); ctx.stroke();
    }
  }
  /* tên vành đai: chỗ trống đầu tiên dọc giữa vành, ưu tiên phía dưới (gần người xem) */
  giua.sort((a, b) => b.y - a.y);
  ghiTen(ctx, 'vành đai tiểu hành tinh', giua.map(p => [p.x, p.y + 4]), 'rgba(205,196,176,.62)');
}

/* Thông tin của vật thể đang chọn ở cảnh Hệ Mặt Trời: những thứ tính được lúc này, cộng số liệu NASA. */
/* "Gấp 0,38 lần" là cách nói ngược: nhỏ hơn Trái Đất thì nói "chỉ bằng". */
const soVoiDat = (ma) => soTD(ma) >= 1 ? `gấp ${so2(soTD(ma))} lần Trái Đất` : `chỉ bằng ${so2(soTD(ma))} lần Trái Đất`;
/* ngay: ngày đang xem khi đang tua (Date), null khi xem giờ thật — tua sang năm 2043 mà vẫn ghi "lúc này" là sai. */
function thongTinHT(ma, JD, ngay) {
  const t = TT[ma], ten = ma === 'troi' ? 'Mặt Trời' : TEN[ma];
  const AU = 149597870.7, C = 299792.458, luc = ngay ? `Ngày ${ngay.toLocaleDateString('vi-VN')}` : 'Lúc này';
  if (ma === 'troi') {
    const kc = A().matTroi(JD).kc, giay = kc * AU / C;
    return { ten, loai: t.loai, dong: [`Rộng ${soVoiDat('troi')}. ${luc} cách Trái Đất ${soVN(kc * AU / 1e6, 1)} triệu km — ánh sáng của nó đi tới mắt bạn mất ${Math.floor(giay / 60)} phút ${Math.round(giay % 60)} giây.`] };
  }
  const p = ma === 'dat' ? null : A().hanhTinh(ma, JD);
  const kcTroi = ma === 'dat' ? A().matTroi(JD).kc : p.kcTroi, phut = kcTroi * AU / C / 60;
  const cach = `${luc} cách Mặt Trời ${soVN(kcTroi, 2)} đơn vị thiên văn (${soVN(kcTroi * AU / 1e6, 0)} triệu km) — nắng đi tới đó mất ${phut < 60 ? soVN(phut, 0) + ' phút' : soVN(phut / 60, 1) + ' giờ'}` +
    (p ? `; cách Trái Đất ${soVN(p.kc, 2)} đơn vị thiên văn.` : '.');
  return { ten, loai: t.loai, dong: [cach, [ma === 'dat' ? 'Mốc để so cỡ' : `Rộng ${soVoiDat(ma)}`, ...thuocTinh(t)].join(' · ')] };
}

const rong = (ctx, s) => { ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif'; return ctx.measureText ? (ctx.measureText(s).width || s.length * 6.5) : s.length * 6.5; };
/* Các chỗ có thể ghi tên quanh một vật: ngay dưới, ngay trên, rồi phải, trái, dưới, trên xa dần. */
function choQuanh(x, y, r, w) {
  const cho = [[x, y + r + 14], [x, y - r - 7]];
  for (const d of [0, 18, 36, 54, 72]) cho.push([x + r + 8 + w / 2, y + 4 - d], [x + r + 8 + w / 2, y + 4 + d],
    [x - r - 8 - w / 2, y + 4 - d], [x - r - 8 - w / 2, y + 4 + d], [x, y + r + 30 + d], [x, y - r - 23 - d]);
  return cho;
}
/* Ghi chữ vào chỗ đầu tiên còn trống trong danh sách; trả về chỗ đã chọn, hoặc null nếu chật hết.
   ep = true: chật hết thì vẫn ghi ở chỗ thứ hai (ngay trên) — dùng cho tên Trái Đất, không được mất. */
function ghiTen(ctx, s, cho, mau, ep) {
  const w = rong(ctx, s);
  for (const c of cho) {
    const o = { x0: c[0] - w / 2 - 3, x1: c[0] + w / 2 + 3, y0: c[1] - 12, y1: c[1] + 3 };
    if (o.x0 < 2 || o.x1 > W - 2 || daGhi.some(d => o.x0 < d.x1 && o.x1 > d.x0 && o.y0 < d.y1 && o.y1 > d.y0)) continue;
    daGhi.push(o);
    ctx.textAlign = 'center'; ctx.fillStyle = mau; ctx.fillText(s, c[0], c[1]);
    return c;
  }
  if (ep && cho[1]) { ctx.textAlign = 'center'; ctx.fillStyle = mau; ctx.fillText(s, cho[1][0], cho[1][1]); return cho[1]; }
  return null;
}

/* ---------- cảnh So kích thước: đúng tỉ lệ to nhỏ, không có khoảng cách ----------
   Xếp dọc: Mặt Trời to tới mức chỉ thấy một cung ở trên cùng, rồi Sao Mộc, Sao Thổ (cả vành, đúng cỡ theo
   bảng vành của NASA), hàng Thiên Vương – Hải Vương, rồi ba hàng vật thể nhỏ xếp từ to tới nhỏ: Trái Đất,
   Sao Kim, Sao Hoả · Ganymede, Titan, Sao Thuỷ · Mặt Trăng, Diêm Vương, Ceres. Mọi bán kính là CÙNG MỘT tỉ lệ
   k điểm ảnh cho mỗi bán kính Trái Đất. Kéo lên xuống, chụm để phóng.
   Bản trước thiếu Thiên Vương và Hải Vương — hai hành tinh to thứ ba, thứ tư, mỗi cái rộng gấp 4 lần Trái
   Đất — nên nhìn vào tưởng sau Sao Thổ là tới Trái Đất. Hai mặt trăng Ganymede, Titan đưa vào vì chúng to hơn
   cả Sao Thuỷ; Diêm Vương, Ceres là hai hành tinh lùn quen tên nhất. */
const VANH = { bTrong: 1.526, bNgoai: 1.950, aTrong: 2.030, aNgoai: 2.270 };   // NASA, Saturnian Rings Fact Sheet
const BANG_TO = [['thien', 'Sao Thiên Vương', ['#d2f1f5', '#5f9fac']], ['hai', 'Sao Hải Vương', ['#9ab9f4', '#2c4a9a']]];
const NHO = [
  [['dat', 'Trái Đất', ['#9cc4f5', '#2c5ea8']], ['kim', 'Sao Kim', ['#fbf0cf', '#c9b37a']], ['hoa', 'Sao Hoả', ['#f0a07c', '#9c4a2c']]],
  /* dòng phụ ngắn: ba chữ cạnh nhau phải vừa một phần ba bề ngang điện thoại, không thì chữ sau đè chữ trước và mất */
  [['gany', 'Ganymede', ['#ddd3c4', '#7b7165'], 'trăng Sao Mộc'], ['titan', 'Titan', ['#f3d08a', '#a77a3a'], 'trăng Sao Thổ'],
   ['thuy', 'Sao Thuỷ', ['#d9d2c4', '#8a8275']]],
  [['trang', 'Mặt Trăng', ['#e8e6e0', '#8d8c88'], 'trăng Trái Đất'], ['diem', 'Diêm Vương', ['#ead8c2', '#8c7561'], 'hành tinh lùn'],
   ['ceres', 'Ceres', ['#c4c1bb', '#6e6b66'], 'hành tinh lùn']],
];
const MAU_KT = Object.fromEntries([...BANG_TO, ...NHO.flat()].map(n => [n[0], n[2]]));
const so2 = (x) => (x >= 10 ? Math.round(x).toString() : x.toFixed(x >= 1 ? 1 : 2)).replace('.', ',');

/* Xếp các quả cầu theo tỉ lệ k. Mọi toạ độ dọc là hàm bậc nhất của k (cộng các khoảng hở cố định), nên đo
   ở hai giá trị k là suy ra được k nào thì vừa khít chiều cao màn. */
function xepKichThuoc(w, k, dy) {
  const R = (ma) => k * soTD(ma), ds = [], x = w / 2;
  let y = 92 + dy;                                         // cung Mặt Trời dưới hàng nút đóng
  ds.push({ ma: 'troi', ten: 'Mặt Trời', x, y: y - R('troi'), r: R('troi') });
  y += 34 + R('moc');
  ds.push({ ma: 'moc', ten: 'Sao Mộc', x, y, r: R('moc') });
  const ryVanh = R('tho') * VANH.aNgoai * .42;
  y += R('moc') + 40 + Math.max(R('tho'), ryVanh);
  ds.push({ ma: 'tho', ten: 'Sao Thổ', x, y, r: R('tho') });
  y += Math.max(R('tho'), ryVanh) + 40 + R('thien');
  const cachTo = Math.max(w / 4.4, R('thien') + 46);
  BANG_TO.forEach(([ma, ten], i) => ds.push({ ma, ten, x: x + (i ? 1 : -1) * cachTo, y, r: R(ma) }));
  let duoi = R('thien') + 36;                              // phần dưới hàng trước: nửa quả cầu + hai dòng chữ
  const buoc = Math.max(w / 3.3, R('dat') * 2.6);
  for (const hang of NHO) {
    const to = Math.max(4, R(hang[0][0]));
    y += duoi + 10 + to;
    hang.forEach(([ma, ten, , phu], i) => ds.push({ ma, ten, phu, x: x + (i - 1) * buoc, y, r: R(ma) }));
    duoi = to + (hang.some(n => n[3]) ? 52 : 36);
  }
  return { ds, day: y + duoi };
}
/* Cỡ nhỏ nhất: Trái Đất không dưới 2,5 điểm ảnh. Bản trước cố nhét cả 14 quả cầu vào một màn bằng mọi giá — trên
   màn thấp (iPhone SE, 375×667) cỡ bị ép về 0,5: Trái Đất còn nửa điểm ảnh, Sao Mộc 11 điểm ảnh, chẳng còn gì để
   so. Giờ màn thấp quá thì giữ cỡ tối thiểu, phần dưới nằm ngoài màn, và có dòng gợi ý kéo lên để xem tiếp. */
const K_SAN = 2.5;
const kVuaMan = (w, h) => {
  const kRong = .44 * w / (2 * soTD('moc'));              // Sao Mộc chiếm chừng 44% bề ngang
  const a = xepKichThuoc(w, 0, 0).day, b = xepKichThuoc(w, 1, 0).day - a;
  const kCao = (h - duoiMan - 10 - a) / b;                 // cả khối vừa khoảng trống trên khối chữ ở đáy, chừa 10px
  return Math.max(K_SAN, Math.min(kRong, kCao));
};
function boKichThuoc(w, h) {
  const c = cam.kichThuoc;
  /* Đổi cỡ màn (xoay máy, kéo cửa sổ): tính lại từ đầu, kể cả khi đã tự chụm phóng — cỡ cũ hết hợp. */
  if (c.w !== w || c.h !== h) { c.w = w; c.h = h; c.k = 0; c.dy = 0; c.tuPhong = false; }
  if (!c.k) { c.k = kVuaMan(w, h); c.duoi = duoiMan; }
  /* Khoảng trống đổi (khung đầu chưa đo được khối chữ ở đáy nên đoán 290px; chọn rồi bỏ chọn làm chữ cao thấp):
     trượt dần tới cỡ mới thay vì nhảy — trừ khi người dùng đã tự chụm phóng, hay đang chọn một quả cầu. */
  else if (!c.tuPhong && !chonVT && Math.abs(c.duoi - duoiMan) > 12) {
    const muc = kVuaMan(w, h);
    c.k += (muc - c.k) * .2;
    if (Math.abs(muc - c.k) < .01) { c.k = muc; c.duoi = duoiMan; }
  }
  return xepKichThuoc(w, c.k, c.dy).ds;
}

function cauPhang(ctx, x, y, r, sang, toi) {              // quả cầu đơn giản, nắng từ phía trên trái
  const g = ctx.createRadialGradient(x - r * .35, y - r * .4, r * .1, x, y, r);
  g.addColorStop(0, sang); g.addColorStop(1, toi);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, Math.max(.6, r), 0, 6.2832); ctx.fill();
}

function veKichThuoc(ctx) {
  CY = H / 2;
  ctx.fillStyle = '#03050b'; ctx.fillRect(0, 0, W, H);
  const ds = boKichThuoc(W, H), c = cam.kichThuoc, day = xepKichThuoc(W, c.k, c.dy).day, mep = H - duoiMan;
  /* Sao Thổ: chỗ chạm là hình elip ôm vành, không phải hình tròn rộng bằng vành — hình tròn đó trùm lên cả dòng
     chữ và nửa dưới Sao Mộc phía trên, chạm vào chữ "Sao Mộc" lại ra Sao Thổ. */
  diemCham = ds.map(b => b.ma === 'troi' ? { ma: b.ma, x: b.x, y: b.y, rx: b.r, ry: b.r }
    : b.ma === 'tho' ? { ma: b.ma, x: b.x, y: b.y, rx: b.r * VANH.aNgoai + 4, ry: Math.max(b.r, b.r * VANH.aNgoai * .42) + 4 }
    : { ma: b.ma, x: b.x, y: b.y, rx: Math.max(18, b.r + 6), ry: Math.max(18, b.r + 6) });
  for (const b of ds) {
    const { x, y, r } = b;
    if (b.ma === 'troi') {
      const g = ctx.createRadialGradient(x, y, r * .9, x, y, r * 1.03);
      g.addColorStop(0, '#ffe7a3'); g.addColorStop(.85, '#ffc861'); g.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.03, 0, 6.2832); ctx.fill();
      ghiTen(ctx, `Mặt Trời · rộng gấp ${so2(soTD('troi'))} lần Trái Đất`, [[x, y + r - 14]], chonVT === 'troi' ? 'rgba(120,60,0,1)' : 'rgba(90,50,10,.9)');
      continue;
    }
    if (b.ma === 'moc') {
      cauPhang(ctx, x, y, r, '#f4e6c8', '#a58a62');
      ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.clip();            // các dải mây của Sao Mộc
      for (const [v, m] of [[-.62, 'rgba(150,110,80,.35)'], [-.28, 'rgba(170,120,85,.4)'], [.18, 'rgba(160,115,80,.38)'], [.52, 'rgba(150,110,80,.3)']]) {
        ctx.fillStyle = m; ctx.fillRect(x - r, y + v * r, 2 * r, r * .12);
      }
      ctx.restore();
    } else if (b.ma === 'tho') {
      const vanh = (truoc) => {
        ctx.save();
        if (truoc) { ctx.beginPath(); ctx.rect(x - r * 3, y, r * 6, r * 3); ctx.clip(); }
        for (const [a, b2, m] of [[VANH.bTrong, VANH.bNgoai, 'rgba(232,214,165,.85)'], [VANH.aTrong, VANH.aNgoai, 'rgba(214,196,150,.7)']]) {
          ctx.fillStyle = m; ctx.beginPath();
          ctx.ellipse(x, y, r * b2, r * b2 * .42, 0, 0, 6.2832);
          ctx.ellipse(x, y, r * a, r * a * .42, 0, 0, 6.2832, true);
          ctx.fill('evenodd');
        }
        ctx.restore();
      };
      vanh(false);
      cauPhang(ctx, x, y, r, '#f6e7bd', '#a8915a');
      vanh(true);
    } else {
      const m = MAU_KT[b.ma];
      cauPhang(ctx, x, y, r, m[0], m[1]);
    }
    if (b.ma === chonVT) {
      ctx.strokeStyle = 'rgba(255,214,140,.9)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, (b.ma === 'tho' ? r * VANH.aNgoai : Math.max(r, 3)) + 6, 0, 6.2832); ctx.stroke();
    }
    const lan = b.ma === 'dat' ? 'mốc so sánh' : `${so2(soTD(b.ma))} lần`;
    const yChu = b.ma === 'tho' ? y + Math.max(r, r * VANH.aNgoai * .42) + 16 : y + Math.max(r, 4) + 15;
    ghiTen(ctx, b.ten, [[x, yChu]], b.ma === chonVT ? 'rgba(255,226,170,.98)' : 'rgba(235,232,220,.92)');
    ghiTen(ctx, lan, [[x, yChu + 16]], 'rgba(235,232,220,.55)');
    if (b.phu) ghiTen(ctx, b.phu, [[x, yChu + 32]], 'rgba(200,196,186,.42)');
  }
  /* Còn quả cầu nằm dưới khối chữ (màn thấp, hay vừa kéo xuống): làm tối dần mép dưới và nhắc kéo lên */
  if (day > mep + 4) {
    const g = ctx.createLinearGradient(0, mep - 46, 0, mep + 6);
    g.addColorStop(0, 'rgba(3,5,11,0)'); g.addColorStop(1, 'rgba(3,5,11,1)');
    ctx.fillStyle = g; ctx.fillRect(0, mep - 46, W, H - mep + 46);
    /* vẽ thẳng, không qua ghiTen: chỗ này đã có tên các quả cầu hàng dưới (đang mờ đi), ghiTen sẽ nhường mất */
    ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255,226,170,.9)'; ctx.fillText('kéo lên để xem tiếp ↑', W / 2, mep - 8);
  }
  tranKT = day > mep + 4;
}
let tranKT = false;

/* Thông tin vật thể đang chọn ở cảnh So kích thước: đường kính thật và số liệu NASA, không có gì tính theo giờ. */
function thongTinKT(ma) {
  const t = TT[ma], ten = ma === 'troi' ? 'Mặt Trời' : (([...BANG_TO, ...NHO.flat()].find(n => n[0] === ma) || [])[1] || TEN[ma]);
  const dk = `Đường kính ${soVN(DUONG_KINH[ma], 0)} km` + (ma === 'dat' ? ' — mốc để so.' : ` — ${soVoiDat(ma)}.`);
  const them = thuocTinh(t).join(' · ');
  return { ten, loai: t.loai, dong: [dk, them && them[0].toUpperCase() + them.slice(1)].filter(Boolean) };
}

/* Vành Sao Thổ nằm trong mặt phẳng xích đạo của nó, trục quay chỉ về xích kinh 40,589°, xích vĩ 83,537°
   (J2000, theo IAU) — nghiêng 26,7° so với quỹ đạo, và giữ nguyên hướng trong không gian khi Sao Thổ đi
   quanh Mặt Trời. Vì thế từ Trái Đất có năm thấy vành mở rộng, có năm thấy nó gần như một vạch.
   Mép ngoài vành A rộng 2,27 lần bán kính hành tinh. */
const TRUC_THO = (() => {
  const e = 23.4393 * RAD, v = tuXichDao(40.589, 83.537);
  return { x: v.x, y: v.y * Math.cos(e) + v.z * Math.sin(e), z: -v.y * Math.sin(e) + v.z * Math.cos(e) };   // sang hệ hoàng đạo
})();
function vanhThoTren(X, rPx, p) {
  const rThe = rPx * p.z / f;                             // bán kính hành tinh trên màn, đổi ra đơn vị cảnh
  const e1 = don(cheo(TRUC_THO, { x: 0, y: 0, z: 1 })), e2 = cheo(TRUC_THO, e1);
  const ds = [];
  for (let k = 0; k <= 72; k++) {
    const a = k / 72 * 2 * Math.PI;
    for (const m of [1.52, 2.27]) {                       // mép trong vành B, mép ngoài vành A
      const Q = cong(X, nhan(cong(nhan(e1, Math.cos(a)), nhan(e2, Math.sin(a))), m * rThe));
      const q = chieu(Q);
      if (q) ds.push({ k, m, x: q.x, y: q.y, gan: q.z < p.z });
    }
  }
  return ds;
}
function veVanh(ctx, ds, truoc) {
  ctx.strokeStyle = 'rgba(232,217,160,.6)'; ctx.lineWidth = 1.3;
  for (const m of [1.52, 2.27]) {
    const vong = ds.filter(d => d.m === m);
    ctx.beginPath();
    for (let i = 1; i < vong.length; i++) {
      if (vong[i].gan !== truoc || vong[i - 1].gan !== truoc) continue;
      ctx.moveTo(vong[i - 1].x, vong[i - 1].y); ctx.lineTo(vong[i].x, vong[i].y);
    }
    ctx.stroke();
  }
}

/* Sao Kim, Sao Thuỷ ở phía Đông hay phía Tây Mặt Trời (nhìn từ Trái Đất): phía Đông thì thấy lúc
   chiều tối sau khi Mặt Trời lặn — Sao Hôm; phía Tây thì thấy lúc rạng sáng — Sao Mai.
   Nhưng đứng quá sát Mặt Trời thì chìm trong nắng, không ai thấy. Bản trước không xét chuyện đó: quanh
   24/10/2026 Sao Kim đi ngang giữa Trái Đất và Mặt Trời mà app vẫn ghi "thấy lúc rạng sáng (Sao Mai)" ở 0°.
   Con số độ cũng chỉ là hiệu kinh độ hoàng đạo, lúc đó lệch xa góc thật (vĩ độ của Sao Kim tới 6–8°).
   Giờ: goc là góc THẬT giữa hành tinh và Mặt Trời trên bầu trời; dưới 10° (Sao Kim) hay 14° (Sao Thuỷ,
   mờ hơn và luôn thấp) thì coi như chưa thấy được. lech (hiệu kinh độ) chỉ còn dùng để biết Đông hay Tây. */
const NGUONG_THAY = { kim: 10, thuy: 14 };
function homMai(JD) {
  const t = A().matTroi(JD), vT = tuXichDao(t.ra, t.dec);
  return [['kim', 'Sao Kim'], ['thuy', 'Sao Thuỷ']].map(([ma, ten]) => {
    const p = A().hanhTinh(ma, JD), goc = Math.acos(Math.max(-1, Math.min(1, cham(tuXichDao(p.ra, p.dec), vT)))) / RAD;
    return { ma, ten, lech: A().quanh(p.kinh - t.kinh), goc, thay: goc >= NGUONG_THAY[ma], truoc: p.kc < t.kc };
  });
}
function cauHomMai(h) {
  const dong = h.lech > 0, goc = Math.round(h.goc);
  /* "đi ngang phía trước Mặt Trời" dễ hiểu thành đi qua đĩa Mặt Trời — chuyện hiếm hơn nhiều; nói thẳng vị trí. */
  if (!h.thay) return `${h.ten} đang ở ${h.truoc ? 'giữa Trái Đất và Mặt Trời' : 'phía bên kia Mặt Trời'} (cách ${goc}°) — chìm trong nắng, không thấy được`;
  if (h.ma === 'kim') return `${h.ten} cách Mặt Trời ${goc}° về phía ${dong ? 'Đông' : 'Tây'} — ${dong ? 'thấy lúc chiều tối (Sao Hôm)' : 'thấy lúc rạng sáng (Sao Mai)'}`;
  return `${h.ten} cách Mặt Trời ${goc}° về phía ${dong ? 'Đông' : 'Tây'} — tìm thấp ở chân trời phía ${dong ? 'Tây lúc chập tối' : 'Đông lúc rạng sáng'}`;
}

/* ---------- phần chung ---------- */

function veNen(ctx, doi) {
  const S = napNenSao();
  ctx.fillStyle = '#03050b'; ctx.fillRect(0, 0, W, H);
  if (!S) return;
  ctx.fillStyle = '#e8ecff';
  for (const s of S) {
    const p = chieuHuong(doi(s.v));
    if (!p || p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue;
    const r = Math.max(.45, 1.9 - .32 * s.m);
    ctx.globalAlpha = Math.max(.15, Math.min(1, (5.2 - s.m) / 3.5));
    ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
  }
  ctx.globalAlpha = 1;
}

/* Mặt Trời cách 150 triệu km — 23.500 lần bán kính Trái Đất — nên ở cảnh này nó là một hướng, không
   kéo lại gần được như Mặt Trăng. Vẽ ĐÚNG CỠ nhìn thấy: đường kính 0,53°, bằng Mặt Trăng nhìn từ Trái Đất
   (Mặt Trời to gấp chừng 400 lần Mặt Trăng mà cũng xa gấp chừng 400 lần). Quầng sáng quanh nó là ánh chói
   như khi chụp ảnh, không phải kích thước. */
function veMatTroiXa(ctx, s) {
  huongTroi = s; muiTen = null;
  const p = chieuHuong(s);
  if (p && p.x > -60 && p.x < W + 60 && p.y > -60 && p.y < H + 60) {
    const r = Math.max(2.5, f * Math.tan(.2666 * RAD) / p.z);
    const g = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r + 46);
    g.addColorStop(0, 'rgba(255,240,200,.75)'); g.addColorStop(.25, 'rgba(255,214,130,.28)'); g.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r + 46, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fffbea'; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    chu(ctx, 'Mặt Trời · cách 150 triệu km', p.x, p.y + r + 22, 'rgba(255,232,180,.95)', true);
    return;
  }
  /* ngoài khung: mũi tên ở mép, chỉ đúng hướng của nó trên mặt phẳng màn */
  let dx = cham(s, Rt), dy = -cham(s, U);
  const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
  /* chỉ trong vùng trống: dưới nút đóng, trên khối chữ giải thích và hàng nút ở đáy */
  const tren = 80, duoi = H - 290, cy = (tren + duoi) / 2;
  const k = Math.min((W / 2 - 34) / Math.abs(dx || 1e-9), Math.max(20, (duoi - tren) / 2) / Math.abs(dy || 1e-9));
  const x = W / 2 + dx * k, y = cy + dy * k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(dy, dx));
  ctx.fillStyle = 'rgba(255,214,130,.9)';
  ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath(); ctx.fill();
  ctx.restore();
  const lx = x - dx * 52, ly = y - dy * 30;             // chữ lùi vào trong, khỏi đè lên mũi tên
  chu(ctx, 'Mặt Trời', lx, ly - 2, 'rgba(255,226,170,.95)', true);
  chu(ctx, 'chạm để nhìn', lx, ly + 13, 'rgba(255,226,170,.6)', true);
  muiTen = { x, y };
}

/* Quay máy để thấy cả Mặt Trời lẫn Trái Đất: máy vẫn nhìn vào Trái Đất, nhưng đứng ở phía sau nó, lệch
   16° so với hướng Mặt Trời — Mặt Trời hiện trong khung, và Trái Đất lúc đó là hình lưỡi liềm (nửa
   ngày quay về phía Mặt Trời, gần như quay lưng lại với ta). */
function quayVeMatTroi() {
  const s = huongTroi;
  if (!s) return false;
  let w = tru(F, nhan(s, cham(F, s)));
  if (Math.hypot(w.x, w.y, w.z) < 1e-3) w = cheo(s, { x: 0, y: 0, z: 1 });
  w = don(w);
  const v = don(cong(nhan(s, Math.cos(16 * RAD)), nhan(w, Math.sin(16 * RAD))));   // hướng máy nhìn
  quay = { yaw: Math.atan2(-v.y, -v.x) / RAD, pitch: Math.max(-85, Math.min(85, Math.asin(-v.z) / RAD)) };
  return true;
}

/* Ghi chữ, tránh đè lên chữ đã ghi trong khung này: thử dưới, trên, phải, trái; chật quá thì thôi. */
let daGhi = [];
function chu(ctx, s, x, y, mau, uuTien) {
  ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
  const w = ctx.measureText ? (ctx.measureText(s).width || s.length * 6.5) : s.length * 6.5;
  const thu = uuTien ? [[x, y]] : [[x, y], [x, y - 40], [x + w / 2 + 12, y - 14], [x - w / 2 - 12, y - 14]];
  for (const [cx, cy] of thu) {
    const o = { x0: cx - w / 2 - 3, x1: cx + w / 2 + 3, y0: cy - 12, y1: cy + 3 };
    if (!uuTien && daGhi.some(d => o.x0 < d.x1 && o.x1 > d.x0 && o.y0 < d.y1 && o.y1 > d.y0)) continue;
    daGhi.push(o);
    ctx.textAlign = 'center'; ctx.fillStyle = mau;
    ctx.fillText(s, cx, cy);
    return true;
  }
  return false;
}

/* ---------- cửa ra vào cho nightsky.js ---------- */

function ve(ctx, w, h, dpr, lucThat, noi, duoi) {
  W = w; H = h; DPR = dpr; CY = H / 2;
  if (duoi) duoiMan = duoi;
  const dt = lucTruoc ? Math.min(100, lucThat - lucTruoc) : 0;
  lucTruoc = lucThat;
  const ds = canh === 'traiDat' ? TUA : TUA_HMT;
  lech += dt * ds[tua].k;
  /* Bảng JPL dài hạn chỉ dùng tới năm 3000: tua quá đó thì quay về hôm nay, khỏi vẽ sai dần mà không biết */
  if (lucThat + lech > Date.UTC(2999, 0, 1)) lech = 0;
  const luc = lucThat + lech, JD = A().ngayJulius(luc);
  daGhi = []; diemCham = [];
  if (quay && canh === 'traiDat') {
    const c = cam.traiDat, k = 1 - Math.pow(.86, Math.max(1, dt) / 16.7);
    const dy = ((quay.yaw - c.yaw) % 360 + 540) % 360 - 180;
    c.yaw += dy * k; c.pitch += (quay.pitch - c.pitch) * k;
    if (Math.abs(dy) < .3 && Math.abs(quay.pitch - c.pitch) < .3) quay = null;
  }
  if (canh === 'traiDat') return { canh, luc, ...veTraiDat(ctx, JD, noi, luc) };
  if (canh === 'kichThuoc') { veKichThuoc(ctx); return { canh, luc, chon: chonVT && thongTinKT(chonVT) }; }
  veHeMatTroi(ctx, JD);
  return { canh, luc, hm: homMai(JD), chon: chonVT && thongTinHT(chonVT, JD, tua ? new Date(luc) : null) };
}

/* Dòng chữ giải thích dưới đáy: nói đúng điều người dùng đang nhìn thấy. */
function giaiThich(kq, noi) {
  if (!kq) return '';
  const gio = new Date(kq.luc).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', ...(tua ? { year: 'numeric' } : {}) });
  /* Đang chọn một vật thể (chạm vào nó): thay chữ giải thích bằng thông tin của nó */
  if (kq.chon) return `<p class="td-dong1">${kq.chon.ten} · ${kq.chon.loai}</p>
    ${kq.chon.dong.map((d, i) => `<p class="${i ? 'td-dong3' : 'td-dong2'}">${d}</p>`).join('')}
    <p class="td-dong3">Chạm chỗ trống để bỏ chọn.</p>`;
  const tuaChu = tua ? ` · đang tua ${ (kq.canh === 'traiDat' ? TUA : TUA_HMT)[tua].ten }` : '';
  if (kq.canh === 'traiDat') {
    const pt = Math.round(kq.sang * 100);
    return `<p class="td-dong1">Nhìn từ vũ trụ · ${gio}${tuaChu}</p>
      <p class="td-dong2">Nửa Trái Đất quay về Mặt Trời là ban ngày — ${noi.ten === 'chỗ bạn đứng' ? 'chỗ bạn' : noi.ten} đang là <b>${kq.ngay ? 'ban ngày' : 'ban đêm'}</b>.
      Mặt Trăng cũng luôn sáng một nửa; từ Trái Đất ta thấy được ${pt}% đĩa sáng, nên hôm nay là ${A().tenTrang(kq.tuoi)}.</p>
      <p class="td-dong3">Mặt Trăng có tự quay: mỗi vòng quanh Trái Đất (27,3 ngày) nó tự quay đúng một vòng, nên luôn quay một mặt về phía ta — bấm Tua để xem. Trăng kéo lại gần 15 lần (thật: ${Math.round(kq.kc / 1000)} nghìn km), kích cỡ đúng tỉ lệ.</p>`;
  }
  if (kq.canh === 'kichThuoc')
    return `<p class="td-dong1">So kích thước · đúng tỉ lệ to nhỏ</p>
      <p class="td-dong2">Mặt Trời rộng gấp 109 lần Trái Đất — chứa vừa khoảng 1,3 triệu Trái Đất. Sao Mộc gấp 11 lần, Sao Thổ 9,4, Thiên Vương 4, Hải Vương 3,9. Hai mặt trăng Ganymede và Titan còn to hơn Sao Thuỷ.</p>
      <p class="td-dong3">Đường kính theo NASA. Đúng to nhỏ, không có khoảng cách. Chạm một quả cầu để xem thêm; kéo lên xuống, chụm để phóng.</p>`;
  return `<p class="td-dong1">Hệ Mặt Trời · ${gio}${tuaChu}</p>
    <p class="td-dong2">${kq.hm.map(cauHomMai).join('.<br>')}.</p>
    <p class="td-dong3">Vị trí thật lúc này (bảng JPL). Khoảng cách và kích cỡ đều đã nén: Hải Vương xa gấp 78 lần Sao Thuỷ mà chỉ vẽ xa gấp 6. Chạm một hành tinh để xem thêm.</p>`;
}

self.TDTD_VUTRU = {
  ve, giaiThich,
  canh: () => canh,
  doiCanh: () => { canh = THU_TU_CANH[(THU_TU_CANH.indexOf(canh) + 1) % 3]; tua = 0; lech = 0; chonVT = null; return canh; },
  tenCanhSau: () => TEN_CANH[THU_TU_CANH[(THU_TU_CANH.indexOf(canh) + 1) % 3]],
  tua: () => (canh === 'traiDat' ? TUA : TUA_HMT)[tua].ten,
  doiTua: () => { const ds = canh === 'traiDat' ? TUA : TUA_HMT; tua = (tua + 1) % ds.length; if (!tua) lech = 0; return ds[tua].ten; },
  vao: () => { tua = 0; lech = 0; lucTruoc = 0; daDatCam = false; chonVT = null; hHMT = null; },
  batDauKeo: (x, y) => { keo = { x, y, ...cam[canh] }; quay = null; },
  /* Chạm (không kéo). Cảnh Trái Đất: trúng mũi tên Mặt Trời thì quay máy về phía nó. Hai cảnh kia: trúng một
     vật thể thì chọn nó (chữ dưới đáy đổi thành thông tin của nó); chạm lại nó hay chạm chỗ trống thì bỏ chọn.
     Trả về true khi có gì đổi, để nightsky.js vẽ lại chữ ngay. */
  cham: (x, y) => {
    if (canh === 'traiDat') return muiTen && Math.hypot(x - muiTen.x, y - muiTen.y) < 44 ? quayVeMatTroi() : false;
    const xa = (d) => Math.hypot((x - d.x) / d.rx, (y - d.y) / d.ry);
    /* Bỏ vật đang bị một vật gần hơn che (tâm nó nằm trong đĩa vật kia): nhìn nghiêng thì Sao Thuỷ có lúc nấp sau
       Mặt Trời — chạm lên đĩa Mặt Trời mà ra Sao Thuỷ là sai. */
    const biChe = (d) => d.z !== undefined && diemCham.some(e => e !== d && e.z !== undefined && e.z < d.z && Math.hypot(d.x - e.x, d.y - e.y) < e.rv);
    const trung = diemCham.filter(d => xa(d) < 1 && !biChe(d)).sort((a, b) => xa(a) - xa(b))[0];
    const moi = trung && trung.ma !== chonVT ? trung.ma : null;
    const doi = moi !== chonVT;
    chonVT = moi;
    return doi;
  },
  keo: (x, y) => {
    if (!keo) return;
    const c = cam[canh];
    if (canh === 'kichThuoc') { c.dy = keo.dy + (y - keo.y); return; }      // kéo lên xuống
    c.yaw = keo.yaw - (x - keo.x) * .4; c.pitch = Math.max(-85, Math.min(85, keo.pitch + (y - keo.y) * .4));
  },
  thaKeo: () => { keo = null; },
  phong: (k) => {
    const c = cam[canh];
    if (canh === 'kichThuoc') { if (!c.k) boKichThuoc(W, H); c.k = Math.max(.5, Math.min(400, c.k / k)); c.tuPhong = true; return c.k; }
    c.xa = Math.max(canh === 'traiDat' ? 2.4 : 6, Math.min(canh === 'traiDat' ? 30 : 60, c.xa * k)); return c.xa;
  },
  /* móc cho kiểm thử */
  _laDat: laDat,
  _canhTD: (JD, noi) => traiDatMatTrang(JD, noi),
  _mauTrang: mauTrang,
  _homMai: homMai,
  _cam: () => cam,
  _datMay: (dich, c, w, h) => { W = w || W; H = h || H; CY = H / 2; datMay(dich, c); return { P, F, Rt, U, f }; },
  _chieu: (X) => chieu(X),
  _chieuHuong: (v) => chieuHuong(v),
  _quayVeMatTroi: () => quayVeMatTroi(),
  _quay: () => quay,
  _muiTen: () => muiTen,
  _trucTho: TRUC_THO,
  _boKichThuoc: (w, h) => boKichThuoc(w, h),
  _coNen: coNen,
  _soTD: soTD,
  _nenKC: nenKC,
  _diemCham: () => diemCham.slice(),
  _chon: (ma) => { if (ma !== undefined) chonVT = ma; return chonVT; },
  _thongTinHT: thongTinHT,
  _thongTinKT: thongTinKT,
  _cauHomMai: cauHomMai,
  _HANH: HANH.map(h => h[0]),
  _CY: () => CY,
  _tranKT: () => tranKT,
};
})();
