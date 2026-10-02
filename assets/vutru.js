/* Nhìn từ ngoài vũ trụ — cảnh thứ hai của ngôi sao Trời đêm.

   Hai cảnh, đều đúng vị trí THẬT lúc này:
   - Trái Đất – Mặt Trăng: quả địa cầu có lục địa (Natural Earth, assets/datlien.js), nửa quay về
     Mặt Trời là ban ngày, có chấm chỗ bạn đứng; Mặt Trăng ở đúng hướng của nó, nửa quay về Mặt Trời
     sáng — nhìn là hiểu vì sao đêm nay trăng khuyết. Mặt Trăng luôn quay một mặt về Trái Đất, nên
     các biển của nó (cùng bản đồ với trăng ngoài trời) luôn hướng vào trong.
   - Hệ Mặt Trời: sáu hành tinh trên quỹ đạo theo bảng phần tử Kepler của JPL (assets/astro.js).

   Vì sao phải nén: khoảng cách thật Trái Đất – Mặt Trăng là 60 lần bán kính Trái Đất, vẽ đúng thì
   Mặt Trăng chỉ còn một chấm. Nên kéo nó lại gần 15 lần, và nói rõ trên màn. Hệ Mặt Trời thì nén
   khoảng cách theo căn bậc hai (Sao Thổ xa gấp 25 lần Sao Thuỷ, vẽ thành 5 lần) và phóng to hành tinh.

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

let canh = 'traiDat';               // 'traiDat' | 'heMatTroi'
const cam = { traiDat: { yaw: 0, pitch: 18, xa: 9 }, heMatTroi: { yaw: -90, pitch: 58, xa: 30 } };
let daDatCam = false;
let tua = 0, lech = 0, lucTruoc = 0;          // tua nhanh: 0 thật, 1 một giờ mỗi giây, 2 một ngày mỗi giây
const TUA = [{ k: 0, ten: 'Giờ thật' }, { k: 3600, ten: '1 giờ mỗi giây' }, { k: 86400, ten: '1 ngày mỗi giây' }];
const TUA_HMT = [{ k: 0, ten: 'Giờ thật' }, { k: 86400, ten: '1 ngày mỗi giây' }, { k: 864000, ten: '10 ngày mỗi giây' }];
let keo = null;

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

let W = 360, H = 640, DPR = 1, f = 500, P = { x: 0, y: 0, z: 0 }, F, Rt, U;
function datMay(dich, c) {
  const p = Math.max(-85, Math.min(85, c.pitch)) * RAD, y = c.yaw * RAD;
  P = cong(dich, { x: c.xa * Math.cos(p) * Math.cos(y), y: c.xa * Math.cos(p) * Math.sin(y), z: c.xa * Math.sin(p) });
  F = don(tru(dich, P));
  Rt = don(cheo(F, { x: 0, y: 0, z: 1 }));
  U = cheo(Rt, F);
  f = (Math.min(W, H) / 2) / Math.tan(22 * RAD); // góc nhìn 44° theo cạnh ngắn của màn
}
function chieu(X) {
  const d = tru(X, P), z = cham(d, F);
  if (z < .05) return null;
  return { x: W / 2 + cham(d, Rt) / z * f, y: H / 2 - cham(d, U) / z * f, z };
}
function chieuHuong(v) {                           // điểm ở vô cực (sao, Mặt Trời)
  const z = cham(v, F);
  if (z < .05) return null;
  return { x: W / 2 + cham(v, Rt) / z * f, y: H / 2 - cham(v, U) / z * f, z };
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
      const a = (sx - W / 2) / f, b = -(sy - H / 2) / f;
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
  if (pD && pD.rs) {
    const g = ctx.createRadialGradient(pD.x, pD.y, pD.rs * .98, pD.x, pD.y, pD.rs * 1.12);
    g.addColorStop(0, 'rgba(120,170,255,.35)'); g.addColorStop(1, 'rgba(120,170,255,0)');
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

const HANH = [
  ['thuy', 'Sao Thuỷ', '#c8bda8', 3], ['kim', 'Sao Kim', '#f2e2b4', 5], ['dat', 'Trái Đất', '#6fa0e8', 5.5],
  ['hoa', 'Sao Hoả', '#e08b6a', 4], ['moc', 'Sao Mộc', '#e9d6ae', 9], ['tho', 'Sao Thổ', '#e8d9a0', 8],
];
const nen2 = (p) => { const r = Math.hypot(p.x, p.y, p.z) || 1e-9, k = 3 * Math.sqrt(r) / r; return nhan(p, k); };   // nén căn bậc hai

function veHeMatTroi(ctx, JD) {
  datMay({ x: 0, y: 0, z: 0 }, cam.heMatTroi);
  const e = A().nghieng(JD - 2451545) * RAD;
  veNen(ctx, (v) => ({ x: v.x, y: v.y * Math.cos(e) + v.z * Math.sin(e), z: -v.y * Math.sin(e) + v.z * Math.cos(e) }));   // sao nền trong hệ hoàng đạo
  /* Mặt Trời */
  const p0 = chieu({ x: 0, y: 0, z: 0 });
  if (p0) {
    const g = ctx.createRadialGradient(p0.x, p0.y, 2, p0.x, p0.y, 46);
    g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(.3, 'rgba(255,200,110,.5)'); g.addColorStop(1, 'rgba(255,180,90,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p0.x, p0.y, 46, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fff3cc'; ctx.beginPath(); ctx.arc(p0.x, p0.y, 9, 0, 6.2832); ctx.fill();
  }
  const vt = [];
  for (const [ma, ten, mau, r] of HANH) {
    ctx.strokeStyle = ma === 'dat' ? 'rgba(111,160,232,.5)' : 'rgba(200,210,235,.22)'; ctx.lineWidth = 1;
    ctx.beginPath();
    let dau = true;
    for (const q of A().quyDao(ma, JD, 160).concat([A().quyDao(ma, JD, 160)[0]])) {
      const p = chieu(nen2(q));
      if (!p) { dau = true; continue; }
      if (dau) { ctx.moveTo(p.x, p.y); dau = false; } else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    const X = nen2(A().nhatTamJD(ma, JD)), p = chieu(X);
    if (p) vt.push({ ma, ten, mau, r, p, X });
  }
  vt.sort((a, b) => b.p.z - a.p.z);                        // xa vẽ trước
  for (const h of vt) {
    const { p } = h, r = h.r * Math.max(.7, Math.min(1.6, 26 / p.z));
    /* nửa quay về Mặt Trời sáng: gradient lệch về phía Mặt Trời trên màn */
    const ve = p0 ? don({ x: p0.x - p.x, y: p0.y - p.y, z: 0 }) : { x: 0, y: -1 };
    const g = ctx.createRadialGradient(p.x + ve.x * r * .5, p.y + ve.y * r * .5, r * .1, p.x, p.y, r * 1.05);
    g.addColorStop(0, h.mau); g.addColorStop(.75, h.mau); g.addColorStop(1, 'rgba(20,24,40,1)');
    if (h.ma === 'tho') {                                  // vành Sao Thổ
      ctx.strokeStyle = 'rgba(232,217,160,.55)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 2, r * .7, -.35, 0, 6.2832); ctx.stroke();
    }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.2832); ctx.fill();
    h.rv = r;
  }
  const THU_TU = ['dat', 'kim', 'hoa', 'moc', 'tho', 'thuy'];
  for (const h of vt.slice().sort((a, b) => THU_TU.indexOf(a.ma) - THU_TU.indexOf(b.ma)))
    chu(ctx, h.ma === 'dat' ? 'Trái Đất · bạn ở đây' : h.ten, h.p.x, h.p.y + h.rv + 14, h.ma === 'dat' ? 'rgba(190,215,250,.95)' : 'rgba(235,228,210,.85)');
  if (p0) chu(ctx, 'Mặt Trời', p0.x, p0.y + 26, 'rgba(255,232,180,.95)');
}

/* Sao Kim, Sao Thuỷ ở phía Đông hay phía Tây Mặt Trời (nhìn từ Trái Đất): phía Đông thì thấy lúc
   chiều tối sau khi Mặt Trời lặn — Sao Hôm; phía Tây thì thấy lúc rạng sáng — Sao Mai. */
function homMai(JD) {
  const t = A().matTroi(JD);
  return [['kim', 'Sao Kim'], ['thuy', 'Sao Thuỷ']].map(([ma, ten]) => ({ ten, lech: A().quanh(A().hanhTinh(ma, JD).kinh - t.kinh) }));
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

function veMatTroiXa(ctx, s) {
  const p = chieuHuong(s);
  if (p && p.x > -60 && p.x < W + 60 && p.y > -60 && p.y < H + 60) {
    const g = ctx.createRadialGradient(p.x, p.y, 3, p.x, p.y, 80);
    g.addColorStop(0, 'rgba(255,244,205,1)'); g.addColorStop(.18, 'rgba(255,214,130,.55)'); g.addColorStop(1, 'rgba(255,190,100,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 80, 0, 6.2832); ctx.fill();
    chu(ctx, 'Mặt Trời (rất xa)', p.x, p.y + 30, 'rgba(255,232,180,.95)');
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
  chu(ctx, 'Mặt Trời', x - dx * 24, y - dy * 24 + 4, 'rgba(255,226,170,.9)');
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

function ve(ctx, w, h, dpr, lucThat, noi) {
  W = w; H = h; DPR = dpr;
  const dt = lucTruoc ? Math.min(100, lucThat - lucTruoc) : 0;
  lucTruoc = lucThat;
  const ds = canh === 'traiDat' ? TUA : TUA_HMT;
  lech += dt * ds[tua].k;
  const luc = lucThat + lech, JD = A().ngayJulius(luc);
  daGhi = [];
  if (canh === 'traiDat') return { canh, luc, ...veTraiDat(ctx, JD, noi, luc) };
  veHeMatTroi(ctx, JD);
  return { canh, luc, hm: homMai(JD) };
}

/* Dòng chữ giải thích dưới đáy: nói đúng điều người dùng đang nhìn thấy. */
function giaiThich(kq, noi) {
  if (!kq) return '';
  const gio = new Date(kq.luc).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  const tuaChu = tua ? ` · đang tua ${ (kq.canh === 'traiDat' ? TUA : TUA_HMT)[tua].ten }` : '';
  if (kq.canh === 'traiDat') {
    const pt = Math.round(kq.sang * 100);
    return `<p class="td-dong1">Nhìn từ vũ trụ · ${gio}${tuaChu}</p>
      <p class="td-dong2">Nửa Trái Đất quay về Mặt Trời là ban ngày — ${noi.ten === 'chỗ bạn đứng' ? 'chỗ bạn' : noi.ten} đang là <b>${kq.ngay ? 'ban ngày' : 'ban đêm'}</b>.
      Mặt Trăng cũng luôn sáng một nửa; từ Trái Đất ta thấy được ${pt}% đĩa sáng, nên đêm nay là trăng ${pt > 97 ? 'tròn' : pt < 3 ? 'non' : pt > 50 ? 'khuyết' : 'lưỡi liềm'}.</p>
      <p class="td-dong3">Mặt Trăng kéo lại gần 15 lần (thật: ${Math.round(kq.kc / 1000)} nghìn km), kích cỡ đúng tỉ lệ. Kéo để xoay, chụm để phóng.</p>`;
  }
  const hm = kq.hm.map(h => `${h.ten} đang ở phía ${h.lech > 0 ? 'Đông' : 'Tây'} Mặt Trời ${Math.abs(Math.round(h.lech))}° — ${h.lech > 0 ? 'thấy lúc chiều tối (Sao Hôm)' : 'thấy lúc rạng sáng (Sao Mai)'}`);
  return `<p class="td-dong1">Hệ Mặt Trời · ${gio}${tuaChu}</p>
    <p class="td-dong2">${hm[0]}.</p>
    <p class="td-dong3">Vị trí thật lúc này (bảng JPL); khoảng cách nén theo căn bậc hai, hành tinh phóng to cho dễ thấy.</p>`;
}

self.TDTD_VUTRU = {
  ve, giaiThich,
  canh: () => canh,
  doiCanh: () => { canh = canh === 'traiDat' ? 'heMatTroi' : 'traiDat'; tua = 0; lech = 0; return canh; },
  tua: () => (canh === 'traiDat' ? TUA : TUA_HMT)[tua].ten,
  doiTua: () => { tua = (tua + 1) % 3; if (!tua) lech = 0; return (canh === 'traiDat' ? TUA : TUA_HMT)[tua].ten; },
  vao: () => { tua = 0; lech = 0; lucTruoc = 0; daDatCam = false; },
  batDauKeo: (x, y) => { keo = { x, y, ...cam[canh] }; },
  keo: (x, y) => {
    if (!keo) return;
    const c = cam[canh];
    c.yaw = keo.yaw - (x - keo.x) * .4; c.pitch = Math.max(-85, Math.min(85, keo.pitch + (y - keo.y) * .4));
  },
  thaKeo: () => { keo = null; },
  phong: (k) => { const c = cam[canh]; c.xa = Math.max(canh === 'traiDat' ? 2.4 : 6, Math.min(canh === 'traiDat' ? 30 : 60, c.xa * k)); return c.xa; },
  /* móc cho kiểm thử */
  _laDat: laDat,
  _canhTD: (JD, noi) => traiDatMatTrang(JD, noi),
  _mauTrang: mauTrang,
  _homMai: homMai,
  _cam: () => cam,
  _datMay: (dich, c, w, h) => { W = w || W; H = h || H; datMay(dich, c); return { P, F, Rt, U, f }; },
  _chieu: (X) => chieu(X),
};
})();
