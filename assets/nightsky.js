/* Bầu trời đêm nay — bầu trời thật, ở chỗ bạn đang đứng, vào đúng lúc này.

   Toàn bộ vị trí lấy từ assets/astro.js: Mặt Trời, Mặt Trăng, năm hành tinh mắt thường
   thấy được, 5.080 sao của Danh mục sao sáng Yale (assets/saosang.js), và tám chòm sao mượn lại
   toạ độ thật của trò Nối sao.

   Phần thiên văn KHÔNG gọi mạng: máy tự giải phương trình nên ngoại tuyến vẫn đúng từng độ.
   Riêng phần DỰ BÁO MƯA thì có gọi mạng, ra dịch vụ Open-Meteo — nói rõ ở đây vì trước đó
   tệp này hứa "không gọi mạng", mà để một lời hứa sai nằm lại cũng là một dạng bịa.
   Chỉ hỏi vị trí của máy nếu người dùng bấm cho phép; không thì chọn
   thành phố trong danh sách. Vị trí đã chọn giữ lại trong máy để lần sau khỏi chọn nữa. */
(() => {
'use strict';

const A = () => self.TDTD_ASTRO;
const RAD = Math.PI / 180;
const NOI_KEY = 'tdtd.troi.noi';

/* Vài thành phố cho ai không muốn bật định vị. Vĩ độ, kinh độ. */
const THANH_PHO = [
  ['Hà Nội', 21.0278, 105.8342], ['Hải Phòng', 20.8449, 106.6881],
  ['Huế', 16.4637, 107.5909], ['Đà Nẵng', 16.0544, 108.2022],
  ['Quy Nhơn', 13.7829, 109.2196], ['Đà Lạt', 11.9404, 108.4583],
  ['Nha Trang', 12.2388, 109.1967], ['TP.HCM', 10.8231, 106.6297],
  ['Cần Thơ', 10.0452, 105.7469], ['Cà Mau', 9.1769, 105.1524],
];

/* Năm hành tinh mắt thường nhìn thấy được: tên, màu, độ sáng biểu kiến điển hình. */
const HANH_TINH = [
  ['thuy', 'Sao Thuỷ', '#c8bda8', 0.0],
  ['kim',  'Sao Kim',  '#fff3d0', -4.0],
  ['hoa',  'Sao Hoả',  '#e08b6a', 0.5],
  ['moc',  'Sao Mộc',  '#f0e0b8', -2.2],
  ['tho',  'Sao Thổ',  '#e8d9a0', 0.6],
];

const TAM_HUONG = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];

/* Tên gọi tuần trăng theo tuổi trăng, tính bằng ngày kể từ mùng một. */
function tenTrang(tuoi, sang) {
  if (tuoi < 1.5 || tuoi > 28.0) return 'trăng non';
  if (tuoi < 6.5) return 'trăng lưỡi liềm đầu tháng';
  if (tuoi < 8.5) return 'trăng thượng huyền';
  if (tuoi < 13.5) return 'trăng khuyết đầu tháng';
  if (tuoi < 16.5) return 'trăng tròn';
  if (tuoi < 21.5) return 'trăng khuyết cuối tháng';
  if (tuoi < 23.5) return 'trăng hạ huyền';
  return 'trăng lưỡi liềm cuối tháng';
}

let tam, cv, ctx, W, H, DPR, raf = null;
let noi = { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297, tuMay: false };
/* Người dùng đã tự chọn nơi chưa. Chưa thì TP.HCM ở trên chỉ là chỗ tạm để vẽ bầu trời, và
   KHÔNG xin dự báo mưa cho nó: người ở Hà Nội mở ra mà thấy mưa của TP.HCM thì tệ hơn là không
   thấy gì. Vị trí Mặt Trời, Mặt Trăng trong nước lệch nhau không đáng kể, còn mưa thì khác hẳn. */
let daChon = false;
let huongNhin = 180, caoNhin = 25, goc = 75;             // đang nhìn về đâu, và mở góc bao nhiêu
let theoMay = false, batTheoMay = null;
let vuTru = false;       // đang ở cảnh "nhìn từ vũ trụ" (assets/vutru.js)
const V = () => self.TDTD_VUTRU;
let keo = null, chon = null;
let mucMay = null;       // hướng cảm biến vừa đọc; màn hình trôi dần về đó chứ không nhảy theo
let quanTinh = null;     // vận tốc còn lại sau khi nhấc ngón, độ mỗi mili giây
/* Mốc chạm: mỗi khung vẽ ghi lại thiên thể nào nằm ở đâu trên màn, để chạm vào là dò ra được.
   Trước đây biến `chon` khai báo rồi bỏ không, tức app chưa hề có chức năng chạm chọn —
   người dùng bấm vào Mặt Trăng mà không có gì xảy ra là vì thế. */
let moc = [], ngam = null;
/* Ngón tay đang chạm (để nhận ra cú chụm hai ngón phóng to), và cú chụm đang diễn ra. */
const chamTay = new Map();
let chum = null;
const GOC_THUONG = 75;                                   // góc nhìn mặc định, độ
const giamDong = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();

try {
  const l = JSON.parse(localStorage.getItem(NOI_KEY) || 'null');
  if (l && typeof l.vi === 'number') { noi = l; daChon = true; }
} catch (e) {}

/* ---------- chiếu từ bầu trời xuống mặt kính ---------- */

const vecto = (cao, huong) => ({
  x: Math.cos(cao * RAD) * Math.sin(huong * RAD),        // đông
  y: Math.cos(cao * RAD) * Math.cos(huong * RAD),        // bắc
  z: Math.sin(cao * RAD),                                 // lên
});
const cham = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

/* Góc thật giữa hai điểm trên thiên cầu, tính bằng độ. */
const gocGiua = (c1, h1, c2, h2) => {
  const a = vecto(c1, h1), b = vecto(c2, h2);
  return Math.acos(Math.max(-1, Math.min(1, cham(a, b)))) / RAD;
};

/* Khung nhìn: hướng nhìn thẳng (f), trục phải (ph), trục lên (tr) của mặt kính, và tỉ lệ ti.
   Tính MỘT lần cho mỗi hướng nhìn rồi nhớ lại: giờ mỗi khung hình chiếu cả nghìn ngôi sao, tính
   lại ba vector cho từng sao là phí. */
let co = null;
function coSo() {
  if (co && co.h === huongNhin && co.c === caoNhin && co.g === goc && co.W === W && co.H === H) return co;
  const f = vecto(caoNhin, huongNhin);
  const len = { x: 0, y: 0, z: 1 };
  let ph = { x: f.y * len.z - f.z * len.y, y: f.z * len.x - f.x * len.z, z: f.x * len.y - f.y * len.x };
  let d = Math.hypot(ph.x, ph.y, ph.z);
  if (d < 1e-6) { ph = { x: 1, y: 0, z: 0 }; d = 1; }     // nhìn thẳng lên thì chọn bừa một hướng
  ph = { x: ph.x / d, y: ph.y / d, z: ph.z / d };
  const tr = { x: ph.y * f.z - ph.z * f.y, y: ph.z * f.x - ph.x * f.z, z: ph.x * f.y - ph.y * f.x };
  co = { h: huongNhin, c: caoNhin, g: goc, W, H, f, ph, tr, ti: (W / 2) / Math.tan(goc / 2 * RAD) };
  return co;
}

/* Phép chiếu tâm: điểm nào ở sau lưng thì bỏ. Trả về toạ độ trên mặt kính, hoặc null. */
function chieuV(v) {
  const k = coSo(), s = cham(v, k.f);
  if (s <= .12) return null;                              // sau lưng hoặc sát mép, bỏ
  return { x: W / 2 + cham(v, k.ph) / s * k.ti, y: H / 2 - cham(v, k.tr) / s * k.ti, s };
}
const chieu = (cao, huong) => chieuV(vecto(cao, huong));

/* ---------- gom hết mọi thứ đang ở trên trời ---------- */

function bauTroi(luc) {
  const JD = A().ngayJulius(luc);
  const dat = (o) => A().docCao(o.ra, o.dec, noi.vi, noi.kinh, JD);

  const t = A().matTroi(JD), vtTroi = dat(t);
  const tr = A().matTrang(JD), vtTrang = dat(tr);
  const toi = A().doToi(vtTroi.cao);

  const ht = HANH_TINH.map(([ma, ten, mau, sang]) => {
    const p = A().hanhTinh(ma, JD);
    return { ma, ten, mau, sang, ...dat(p), kc: p.kc };
  });

  const chom = [];
  const nguon = self.TDTD_CHOMSAO && self.TDTD_CHOMSAO._chom;
  if (nguon) for (const c of nguon) {
    const sao = c.sao.map(([ten, raGio, dec]) => ({ ten: ten.split(' (')[0], ...dat(A().tueSai(raGio * 15, dec, JD)) }));
    chom.push({ ten: c.ten, sao, noi: c.noi || null });
  }

  /* Có hôm Mặt Trăng đi ngang sát một hành tinh. Lúc đó hành tinh nấp sau đĩa trăng nên
     nhìn màn hình chẳng thấy gì — phải nói ra thì mới biết mà ngước lên xem.
     Đúng hôm viết chỗ này, 14/9/2026, Mặt Trăng che Sao Kim thật, và máy tính ra 0,48 độ. */
  const gapTrang = ht
    .filter(p => p.cao > -2)
    .map(p => ({ ten: p.ten, cach: gocGiua(p.cao, p.huong, vtTrang.cao, vtTrang.huong) }))
    .filter(g => g.cach < 3)
    .sort((a, b) => a.cach - b.cach);

  return { JD, troi: { ...t, ...vtTroi }, trang: { ...tr, ...vtTrang }, toi, ht, chom, gapTrang };
}

/* ---------- sao thật và Ngân Hà ----------
   5.080 sao tới cấp 6 của Danh mục sao sáng Yale (assets/saosang.js). Mỗi sao: toạ độ J2000 đã tính
   tuế sai về hôm nay, rồi cứ hai giây đổi sang vector chân trời một lần — sao trôi 0,008° mỗi giây,
   hai giây là chưa tới một phần mười điểm ảnh. Mỗi khung hình chỉ còn phép chiếu.

   Sao xếp từ sáng tới mờ và chia theo màu, nên mỗi màu chỉ đặt fillStyle một lần, và gặp sao mờ
   hơn ngưỡng là dừng luôn cả nhóm. */
const KHI = 0.25;                       // cấp sáng mất đi mỗi khối khí quyển, mức thường gặp ở vùng thấp, ẩm
function ngauNhien(hat) {
  let a = hat >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

let saoThat = null, nganHa = null;
function taoTap(ra, dec, JD) {          // một tập điểm trên thiên cầu, kèm chỗ chứa vector chân trời
  const n = ra.length, ra2 = new Float64Array(n), de2 = new Float64Array(n);
  for (let i = 0; i < n; i++) { const p = A().tueSai(ra[i], dec[i], JD); ra2[i] = p.ra; de2[i] = p.dec; }
  return { n, ra: ra2, dec: de2, x: new Float32Array(n), y: new Float32Array(n), z: new Float32Array(n), luc: -1e15, noi: '' };
}
function napSao(luc) {
  if (saoThat || !self.TDTD_SAOSANG) return saoThat;
  const S = self.TDTD_SAOSANG, g = A().giaiSao(S.du, S.dem), JD = A().ngayJulius(luc);
  saoThat = taoTap(g.ra, g.dec, JD);
  saoThat.v = g.v;
  const r = ngauNhien(7), ph = new Float32Array(g.v.length);
  for (let i = 0; i < ph.length; i++) ph[i] = r();
  saoThat.ph = ph;                                       // pha lấp lánh riêng của từng sao
  /* Chia theo màu: B−V làm tròn 0,3 — mắt không phân biệt nổi mịn hơn thế */
  const nhom = new Map();
  for (let i = 0; i < g.v.length; i++) {
    const k = Math.max(-0.3, Math.min(1.8, Math.round(g.bv[i] / 0.3) * 0.3));
    if (!nhom.has(k)) nhom.set(k, []);
    nhom.get(k).push(i);
  }
  saoThat.nhom = [...nhom.entries()].map(([bv, ds]) => ({ mau: `rgb(${A().mauSao(bv).join(',')})`, ds: Int32Array.from(ds) }));
  return saoThat;
}

/* Ngân Hà: không có ảnh chụp nào ở đây. Rải 1.500 đám mờ dọc đường xích đạo thiên hà (b = 0), dày và
   sáng dần về phía tâm thiên hà ở chòm Nhân Mã, sáng thêm ở mây sao Thiên Nga, và bị vệt bụi tối
   Great Rift chẻ đôi từ Thiên Nga qua tâm tới Bán Nhân Mã (l từ 80° xuống −50°, một phần ba dải).
   Vị trí đúng theo toạ độ thiên hà; còn độ sáng từng vùng là phỏng theo mô tả, không phải đo. */
function napNganHa(luc) {
  if (nganHa) return nganHa;
  const r = ngauNhien(2026), ra = [], dec = [], to = [], co2 = [];
  const gauss = () => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());
  while (ra.length < 1500) {
    const l = r() * 360, dl = ((l + 180) % 360) - 180;
    const b = gauss() * (3.5 + 7 * Math.exp(-(((dl / 35)) ** 2)));
    let w = 0.3 + 0.7 * Math.exp(-(((dl / 45)) ** 2)) + 0.35 * Math.exp(-(((dl - 75) / 16) ** 2));
    if (dl > -50 && dl < 80) w *= 1 - 0.6 * Math.exp(-(((b - 1) / 1.8) ** 2)) * Math.min(1, (dl + 50) / 15, (80 - dl) / 15);
    if (r() * 1.35 > w) continue;
    const q = A().tuThienHa(l, b);
    ra.push(q.ra); dec.push(q.dec); to.push(0.6 + 0.4 * r()); co2.push(2 + 2 * r());
  }
  nganHa = taoTap(ra, dec, A().ngayJulius(luc));
  nganHa.to = to; nganHa.co = co2;
  return nganHa;
}

/* Vector chân trời (đông, bắc, lên) của cả tập, tính lại mỗi hai giây hoặc khi đổi nơi. */
function capNhatTap(T, luc) {
  const khoa = noi.vi + ',' + noi.kinh;
  if (Math.abs(luc - T.luc) < 2000 && T.noi === khoa) return T;
  const gst = A().gioSao(A().ngayJulius(luc)), phi = noi.vi * RAD, sp = Math.sin(phi), cp = Math.cos(phi);
  for (let i = 0; i < T.n; i++) {
    const Hg = (gst + noi.kinh - T.ra[i]) * RAD, d = T.dec[i] * RAD;
    const sd = Math.sin(d), cd = Math.cos(d), ch = Math.cos(Hg);
    T.x[i] = -cd * Math.sin(Hg); T.y[i] = sd * cp - cd * sp * ch; T.z[i] = sd * sp + cd * cp * ch;
  }
  T.luc = luc; T.noi = khoa;
  return T;
}

/* Mẫu chấm mờ vẽ sẵn một lần: quầng của sao sáng và đám mây Ngân Hà dùng chung, khỏi tạo
   gradient mới cho từng cái mỗi khung hình. */
let mauMo = null;
function chamMo() {
  if (mauMo) return mauMo;
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d');
  if (g && g.createRadialGradient) {
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (rg) { rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(.35, 'rgba(255,255,255,.45)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; }
    g.fillRect && g.fillRect(0, 0, 64, 64);
  }
  return (mauMo = c);
}

/* Ngưỡng cấp sáng còn thấy được: phóng to thì thấy thêm sao mờ (như cầm ống nhòm), trời còn sáng
   hay trăng sáng trên cao thì mất sao mờ. */
function nguongSao(sangTroi, b) {
  const trangSang = b.trang.cao > 0 ? b.trang.sang * Math.min(1, b.trang.cao / 20) : 0;
  return { lim: Math.min(6, 5 + 1.3 * Math.log2(GOC_THUONG / goc)) - 7 * Math.sqrt(sangTroi) - 1.3 * trangSang, trangSang };
}

function veNganHa(luc, sangTroi, trangSang) {
  const dam = Math.max(0, 1 - sangTroi * 9) * (1 - 0.75 * trangSang);
  if (dam < .03) return;
  const T = capNhatTap(napNganHa(luc), luc), k = coSo(), anh = chamMo();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < T.n; i++) {
    const z = T.z[i];
    if (z < 0) continue;
    const vx = T.x[i], vy = T.y[i];
    const s = vx * k.f.x + vy * k.f.y + z * k.f.z;
    if (s <= .2) continue;
    const r = Math.tan(T.co[i] * RAD) * k.ti / s;
    const px = W / 2 + (vx * k.ph.x + vy * k.ph.y + z * k.ph.z) / s * k.ti;
    const py = H / 2 - (vx * k.tr.x + vy * k.tr.y + z * k.tr.z) / s * k.ti;
    if (px < -r || px > W + r || py < -r || py > H + r) continue;
    ctx.globalAlpha = 0.034 * T.to[i] * dam * Math.min(1, z / 0.25);     // sát chân trời thì chìm vào khí quyển
    ctx.drawImage(anh, px - r, py - r, 2 * r, 2 * r);
  }
  ctx.restore();
}

function veSaoThat(luc, sangTroi, b) {
  const S0 = napSao(luc);
  if (!S0) return false;
  const { lim } = nguongSao(sangTroi, b);
  if (lim < -1.6) return true;
  const S = capNhatTap(S0, luc), k = coSo(), phong = Math.pow(GOC_THUONG / goc, .3), anh = chamMo();
  const nhap = giamDong ? 0 : luc * 0.0055;
  const sang = [];
  for (const nh of S.nhom) {
    ctx.fillStyle = nh.mau;
    const ds = nh.ds;
    for (let j = 0; j < ds.length; j++) {
      const i = ds[j], v0 = S.v[i];
      if (v0 > lim) break;                              // từ đây trở đi trong nhóm đều mờ hơn
      const z = S.z[i];
      if (z < 0) continue;
      const vx = S.x[i], vy = S.y[i];
      const s = vx * k.f.x + vy * k.f.y + z * k.f.z;
      if (s <= .12) continue;
      const px = W / 2 + (vx * k.ph.x + vy * k.ph.y + z * k.ph.z) / s * k.ti;
      if (px < -4 || px > W + 4) continue;
      const py = H / 2 - (vx * k.tr.x + vy * k.tr.y + z * k.tr.z) / s * k.ti;
      if (py < -4 || py > H + 4) continue;
      const X = A().khoiKhi(Math.max(.5, Math.asin(z) / RAD));
      const m = v0 + KHI * (X - 1);                     // sát chân trời mờ đi vì xuyên nhiều khí quyển
      if (m > lim) continue;
      let a = Math.min(1, (lim - m) / 1.2);
      /* Lấp lánh: chỉ sao sáng mới thấy rõ, và càng sát chân trời càng mạnh (nhiều lớp khí rung) */
      if (nhap && m < 3) a *= 1 + Math.min(.35, .08 + .05 * X) * Math.sin(nhap * (1 + S.ph[i]) + S.ph[i] * 40) * Math.sin(nhap * .37 + S.ph[i] * 9);
      const r = (0.5 + 0.42 * Math.max(0, 4.6 - m)) * phong;
      ctx.globalAlpha = Math.max(0, Math.min(1, a));
      if (r < 1.15) ctx.fillRect(px - r, py - r, 2 * r, 2 * r);
      else { ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fill(); }
      if (m < 1.3) sang.push(px, py, r, a);
    }
  }
  ctx.globalAlpha = 1;
  if (sang.length) {                                    // quầng sáng của mười mấy sao sáng nhất
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let j = 0; j < sang.length; j += 4) {
      const R = sang[j + 2] * 5;
      ctx.globalAlpha = .22 * sang[j + 3];
      ctx.drawImage(anh, sang[j] - R, sang[j + 1] - R, 2 * R, 2 * R);
    }
    ctx.restore();
  }
  return true;
}

/* ---------- Mặt Trăng hình cầu ----------
   Vẽ từng điểm ảnh của một quả cầu: điểm nào quay về Mặt Trời thì sáng, theo định luật Lommel–
   Seeliger (bề mặt bụi như Mặt Trăng: trăng tròn trông phẳng đều chứ không tối dần ra mép như quả
   bóng). Mặt tối có ánh đất hắt lên mờ mờ, rõ nhất lúc trăng lưỡi liềm.
   Các biển (mare) — vệt tối người Việt nhìn ra chú Cuội ngồi gốc cây đa — lấy vị trí và đường kính
   từ bài "List of maria on the Moon" trên Wikipedia; mỗi biển vẽ thành một vùng tròn mờ mép. Biển
   méo dài như Biển Lạnh, Đại dương Bão tố thì ghép vài vùng tròn: hình dạng gần đúng, vị trí đúng.
   Kết cấu vẽ theo khung của chính Mặt Trăng (Bắc lên trên) rồi xoay theo hướng cực Bắc hoàng đạo
   trên màn — trục quay Mặt Trăng chỉ lệch cực đó 1,5°. */
const BIEN = [   // vĩ độ (+Bắc), kinh độ (+Đông), bán kính km, độ tối (1 = tối như biển lớn)
  [34.72, -14.91, 573, 1], [27.29, 18.36, 337, 1], [8.35, 30.83, 438, 1], [16.18, 59.10, 278, 1],
  [-7.83, 53.67, 420, .9], [-15.19, 34.60, 170, .9], [-20.59, -17.29, 357, .85], [-24.48, -38.57, 210, .9],
  [-10.53, -22.31, 175, .8], [7.79, -30.64, 256, .8], [13.20, 4.09, 121, .8],
  [56, -36, 200, .75], [58, -12, 210, .75], [58, 12, 210, .75], [56, 36, 190, .7],              // Biển Lạnh
  [36, -55, 380, .95], [22, -62, 430, .95], [8, -58, 400, .95], [-4, -50, 300, .9], [28, -44, 260, .9],   // Đại dương Bão tố
  [1.63, 1.03, 143, .6], [12.1, -8.34, 158, .7], [45.01, -31.67, 125, .8], [37.56, 30.8, 212, .45],
  [27.36, 0, 90, .6], [22.43, 67.58, 73, .8], [1.3, 65.3, 72, .8], [7.49, 68.66, 122, .75],
  [12.7, 86.52, 179, .7], [-1.71, 87.05, 187, .7],
].map(([vi, kinh, km, toi]) => ({
  x: Math.cos(vi * RAD) * Math.sin(kinh * RAD), y: Math.sin(vi * RAD), z: Math.cos(vi * RAD) * Math.cos(kinh * RAD),
  goc: km / 1737.4, gocNgoai: km / 1737.4 * .95, toi,      // mép mềm nằm gọn trong đường kính
}));

let khoTrang = null;
function ketCauTrang(R, cosI, gocSang, dem) {
  const n = Math.max(8, Math.round(R * 2 * DPR));
  const khoa = `${n}|${cosI.toFixed(2)}|${Math.round(gocSang * 40)}|${dem.toFixed(2)}`;
  if (khoTrang && khoTrang.khoa === khoa) return khoTrang.c;
  const c = document.createElement('canvas'); c.width = c.height = n;
  const g = c.getContext('2d');
  const img = g && g.createImageData ? g.createImageData(n, n) : null;
  if (!img || !img.data) return null;                  // trình duyệt giả trong bài kiểm: vẽ kiểu cũ
  const sinI = Math.sqrt(Math.max(0, 1 - cosI * cosI));
  const sx = sinI * Math.sin(gocSang), sy = sinI * Math.cos(gocSang), sz = cosI;   // hướng Mặt Trời (phải, lên, về phía ta)
  const anhDat = 0.05 * Math.pow(Math.max(0, 1 - (1 + cosI) / 2), 1.5);
  const d = img.data, bk = n / 2;
  for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
    const x = (px + .5 - bk) / bk, y = -(py + .5 - bk) / bk, rr = x * x + y * y;
    const o = (py * n + px) * 4;
    if (rr > 1.02) { d[o + 3] = 0; continue; }
    const zz = Math.sqrt(Math.max(0, 1 - rr));
    let alb = 1;
    /* mép biển gồ ghề: co giãn bán kính theo một nhiễu chậm trên mặt cầu, cho khỏi tròn vo như compa */
    const gg = 1 + .16 * (Math.sin(9 * x + 4 * zz) + Math.sin(7 * y - 5 * x) + Math.sin(11 * zz + 3 * y)) / 3
             + .06 * Math.sin(23 * x - 17 * y) * Math.sin(19 * zz + 13 * x);
    for (const m of BIEN) {
      const goc2 = Math.acos(Math.max(-1, Math.min(1, x * m.x + y * m.y + zz * m.z))) * gg;
      if (goc2 < m.gocNgoai) {
        const u = Math.min(1, (m.gocNgoai - goc2) / (m.gocNgoai * .16)), mem = u * u * (3 - 2 * u);  // mép mềm vừa đủ
        alb *= 1 - 0.45 * m.toi * mem;
      }
    }
    alb = Math.max(.45, alb);
    alb *= 0.97 + 0.03 * Math.sin(px * 1.7 + py * 2.3) * Math.sin(px * .9 - py * 1.3);   // sần nhẹ
    const mu0 = x * sx + y * sy + zz * sz, mu = Math.max(.02, zz);
    const I = mu0 > 0 ? Math.min(1.25, 2 * mu0 / (mu0 + mu)) : 0;
    const vien = Math.max(0, Math.min(1, (1 - Math.sqrt(rr)) * bk + .5));             // mép mịn
    /* Bù gamma cho độ chiếu sáng (màn hình không hiện tuyến tính): không bù thì dải gần ranh giới sáng
       tối tối quá, trăng 59% trông như chưa được một nửa. Độ tối của biển thì giữ tuyến tính. */
    const sang = Math.pow(I, .5) * alb, toiMo = anhDat * alb;
    d[o] = Math.min(255, 246 * sang + 120 * toiMo);
    d[o + 1] = Math.min(255, 240 * sang + 130 * toiMo);
    d[o + 2] = Math.min(255, 214 * sang + 160 * toiMo);
    d[o + 3] = 255 * vien * Math.max(dem, Math.min(1, I * 4));          // phần được chiếu luôn đục; mặt tối ban ngày trong suốt như thật
  }
  g.putImageData(img, 0, 0);
  khoTrang = { khoa, c };
  return c;
}

/* Hướng trên màn (góc tính theo chiều kim đồng hồ từ "lên") từ điểm v tới phía điểm w trên thiên cầu. */
function gocTrenMan(v, w) {
  const d = cham(v, w);
  let t = { x: w.x - d * v.x, y: w.y - d * v.y, z: w.z - d * v.z };
  const l = Math.hypot(t.x, t.y, t.z) || 1;
  const q = { x: v.x + .002 * t.x / l, y: v.y + .002 * t.y / l, z: v.z + .002 * t.z / l };
  const a = chieuV(v), b = chieuV(q);
  if (!a || !b) return 0;
  return Math.atan2(b.x - a.x, -(b.y - a.y));
}

function veTrang3D(p, b, R, sangTroi) {
  const vT = vecto(b.trang.cao, b.trang.huong);
  const JD = b.JD, cucHD = A().docCao(270, 66.56, noi.vi, noi.kinh, JD);   // cực Bắc hoàng đạo
  const gocBac = gocTrenMan(vT, vecto(cucHD.cao, cucHD.huong));
  const gocTroi = gocTrenMan(vT, vecto(b.troi.cao, b.troi.huong));
  const cosI = 2 * Math.max(0, Math.min(1, b.trang.sang)) - 1;              // góc pha từ phần đĩa sáng
  const dem = 0.92 * (1 - Math.min(1, sangTroi * 3));
  const tex = ketCauTrang(R, cosI, gocTroi - gocBac, dem);
  /* quầng */
  const g = ctx.createRadialGradient(p.x, p.y, R * .2, p.x, p.y, R * 4.5);
  const quang = .1 + .2 * b.trang.sang;
  g.addColorStop(0, `rgba(246,240,214,${quang})`); g.addColorStop(1, 'rgba(246,240,214,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, R * 4.5, 0, 6.284); ctx.fill();
  if (!tex) { veTrang(p, chieu(b.troi.cao, b.troi.huong), R, b.trang.sang); return; }
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(gocBac);
  ctx.drawImage(tex, -R, -R, 2 * R, 2 * R);
  ctx.restore();
}

/* ---------- chân trời: viền cây đồi, sương mù ----------
   Viền cây và đồi chỉ để có chiều sâu khi xoay — không phải cảnh thật chỗ bạn đứng. Cao nhất chừng
   2,7°, nên che rất ít trời. */
const VIEN = (() => {
  const r = ngauNhien(1975), n = 720, h = new Float32Array(n);
  const p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
  for (let i = 0; i < n; i++) {
    const a = i / n * 2 * Math.PI;
    h[i] = Math.max(.12, .45 + .35 * Math.sin(3 * a + p1) + .22 * Math.sin(7 * a + p2) + .12 * Math.sin(13 * a + p3));
  }
  for (let c = 0; c < 64; c++) {                        // các cụm tán cây tròn
    const tam = Math.floor(r() * n), rong = 2 + Math.floor(r() * 6), cao = .45 + r() * 1.4;
    for (let j = -rong; j <= rong; j++) {
      const i = ((tam + j) % n + n) % n, u = j / rong;
      h[i] = Math.max(h[i], h[i] * .6 + cao * Math.sqrt(1 - u * u));
    }
  }
  return h;
})();
const vienTai = (huong) => VIEN[Math.round(A().chuan(huong) * 2) % 720];

/* Sương mù sát chân trời: trời luôn sáng hơn ở gần chân trời vì nhìn qua nhiều lớp khí. Vẽ thành
   ba dải theo ĐỘ CAO thật nên ngẩng đầu thì nó lùi xuống, cúi xuống thì nó dâng lên. Lúc chạng vạng
   thêm vầng sáng cam ở phía Mặt Trời vừa lặn. */
function veSuongMu(sangTroi, b) {
  const dai = [[0, 4, .16], [4, 10, .09], [10, 20, .045]];
  const mau = sangTroi > .3 ? '225,236,250' : sangTroi > .05 ? '150,170,205' : '70,90,125';
  /* Mỗi dải vẽ thành nhiều mảnh liền nhau, chỉ lấy điểm nằm rõ ở phía trước (s > 0,3). Lấy cả điểm sát
     mép tầm nhìn thì phép chiếu ném nó ra xa hàng vạn điểm ảnh, và mảnh nối tới đó phủ kín nửa màn hình —
     lỗi thấy được ngay khi phóng to rồi ngẩng lên. */
  const toManh = (duoi, tren) => {
    if (duoi.length < 2) return;
    ctx.beginPath(); ctx.moveTo(duoi[0].x, duoi[0].y);
    for (const p of duoi) ctx.lineTo(p.x, p.y);
    for (let i = tren.length - 1; i >= 0; i--) ctx.lineTo(tren[i].x, tren[i].y);
    ctx.closePath(); ctx.fill();
  };
  for (const [c1, c2, a] of dai) {
    ctx.fillStyle = `rgba(${mau},${a * (sangTroi > .3 ? 1.6 : 1)})`;
    let duoi = [], tren = [];
    for (let h = 0; h <= 360; h += 3) {
      const p = chieu(c1, h), q = chieu(c2, h);
      if (!p || !q || p.s < .3 || q.s < .3) { toManh(duoi, tren); duoi = []; tren = []; continue; }
      duoi.push(p); tren.push(q);
    }
    toManh(duoi, tren);
  }
  const ct = b.troi.cao;
  if (ct > -14 && ct < 4) {
    const s = chieu(0, b.troi.huong);
    if (s) {
      const manh = Math.max(0, 1 - Math.abs(ct + 3) / 11);
      const R = W * .7, g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, R);
      g.addColorStop(0, `rgba(255,150,80,${.32 * manh})`); g.addColorStop(.5, `rgba(240,120,90,${.12 * manh})`);
      g.addColorStop(1, 'rgba(200,100,120,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, R, 0, 6.284); ctx.fill();
    }
  }
}

/* ---------- vẽ ---------- */

/* Màu nền đổi theo độ cao Mặt Trời: ban ngày xanh, chạng vạng chuyển dần, đêm thì đen. */
function veNen(caoTroi) {
  /* Trời tối nhanh hơn tuyến tính: mặt trời vừa lặn là đã sẫm hẳn, xuống -12 độ thì tối.
     Bình phương để đường cong dốc đúng như mắt thấy. */
  const p = Math.pow(Math.max(0, Math.min(1, (caoTroi + 12) / 18)), 2);
  const tren = [Math.round(8 + 82 * p), Math.round(12 + 122 * p), Math.round(26 + 176 * p)];
  const duoi = [Math.round(14 + 116 * p), Math.round(20 + 140 * p), Math.round(38 + 168 * p)];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${tren.join(',')})`);
  g.addColorStop(1, `rgb(${duoi.join(',')})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  return p;
}

/* Đường chân trời và nền đất, vẽ theo đúng phép chiếu nên nó cong khi ngẩng đầu. Mép đất là viền
   cây đồi, mỗi nửa độ một điểm; đường chân trời thật vẫn vẽ mảnh bên dưới để biết đâu là độ cao 0. */
function veChanTroi() {
  ctx.save();
  let dau = true, diem = [];
  ctx.beginPath();
  for (let h = 0; h <= 360; h += 2) {
    const p = chieu(0, h);
    if (!p) { dau = true; continue; }
    if (dau) { ctx.moveTo(p.x, p.y); dau = false; } else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = 'rgba(190,215,235,.25)'; ctx.lineWidth = 1; ctx.stroke();
  const buoc = goc < 40 ? .5 : 1;                         // phóng to thì viền cây phải mịn hơn
  for (let h = 0; h <= 360; h += buoc) {
    const p = chieu(vienTai(h), h);
    if (p) diem.push(p);
  }
  if (diem.length > 1) {                                  // tô đất và viền cây
    ctx.beginPath();
    ctx.moveTo(diem[0].x, diem[0].y);
    for (const p of diem) ctx.lineTo(p.x, p.y);
    ctx.lineTo(diem[diem.length - 1].x, H); ctx.lineTo(diem[0].x, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(5,8,13,.94)'; ctx.fill();
  }
  ctx.restore();

  ctx.font = '600 12px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < 8; i++) {
    const p = chieu(vienTai(i * 45) + 1.2, i * 45);
    if (!p) continue;
    ctx.fillStyle = i === 0 ? 'rgba(240,196,138,.95)' : 'rgba(190,215,235,.6)';
    ctx.fillText(TAM_HUONG[i], p.x, p.y - 9);            // ghi phía trên chân trời, kẻo nền đất che mất
  }
}

/* Mã màu ở đây là hex, nên phải tự đổi ra rgba mới đặt được độ mờ. Lúc đầu tôi viết
   mau.replace('rgb','rgba') — với chuỗi hex thì phép thay đó không ăn gì cả, gradient
   bắt đầu bằng màu đặc và quầng sáng ra thành một cục tròn chứ không mờ dần. */
const moDi = (hex, a) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${a})`;
};

function veSao(p, doSang, mau) {
  const r = Math.max(.7, doSang);
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.284);
  ctx.fillStyle = mau; ctx.fill();
  if (doSang > 2) {                                       // vật sáng thì có quầng
    const g = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 5);
    g.addColorStop(0, mau.startsWith('#') ? moDi(mau, .3) : mau);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 5, 0, 6.284); ctx.fill();
  }
}

/* Mặt Trăng: vẽ đúng phần khuyết, và quay sao cho bề sáng hướng về phía Mặt Trời.
   Ở gần xích đạo lưỡi liềm nằm ngang như cái thuyền chứ không dựng đứng — cái đó ra
   được là nhờ chỗ quay này, chứ không phải vẽ sẵn. */
function veTrang(p, pTroi, r, sang) {
  const q = pTroi ? Math.atan2(pTroi.y - p.y, pTroi.x - p.x) : -Math.PI / 2;
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(q);                 // trục x giờ chỉ về phía Mặt Trời

  const g = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 4.5);
  g.addColorStop(0, 'rgba(246,240,214,.28)'); g.addColorStop(1, 'rgba(246,240,214,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 4.5, 0, 6.284); ctx.fill();

  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.284);            // phần tối, vẫn thấy mờ mờ
  ctx.fillStyle = 'rgba(74,78,96,.5)'; ctx.fill();

  const k = Math.max(0, Math.min(1, sang));
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);            // nửa đĩa phía Mặt Trời luôn sáng
  /* Ranh giới sáng tối là nửa elip đi qua điểm x = (1 - 2k)·r.
     Trăng lưỡi liềm (k nhỏ) thì nó cong về **phía Mặt Trời**, ăn bớt nửa đĩa sáng thành
     một lưỡi mỏng; trăng khuyết (k lớn) thì cong về phía tối, phình ra. Lúc đầu tôi lấy
     dấu ngược nên trăng 12% vẽ ra thành trăng khuyết gần tròn. */
  const b = r * (1 - 2 * k);
  ctx.ellipse(0, 0, Math.abs(b), r, 0, Math.PI / 2, -Math.PI / 2, b > 0);
  ctx.closePath();
  ctx.fillStyle = '#f6f0d6'; ctx.fill();
  ctx.restore();
}

function ve(luc) {
  const b = bauTroi(luc);
  moc = [];
  const sangTroi = veNen(b.troi.cao);
  const { trangSang } = nguongSao(sangTroi, b);
  veNganHa(luc, sangTroi, trangSang);
  const coSaoThat = veSaoThat(luc, sangTroi, b);

  /* Chòm sao: đường nối và tên. Có sao thật rồi thì không chấm lại sao của chòm. */
  const roSao = Math.max(0, 1 - sangTroi * 2.4);
  if (roSao > .02) {
    ctx.lineWidth = 1;
    for (const c of b.chom) {
      const diem = c.sao.map(s => (s.cao > -2 ? chieu(s.cao, s.huong) : null));
      ctx.strokeStyle = `rgba(150,190,230,${.22 * roSao})`;
      ctx.beginPath();
      for (let i = 1; i < diem.length; i++) {
        if (diem[i - 1] && diem[i]) { ctx.moveTo(diem[i - 1].x, diem[i - 1].y); ctx.lineTo(diem[i].x, diem[i].y); }
      }
      ctx.stroke();
      let giua = null;
      for (let i = 0; i < diem.length; i++) {
        if (!diem[i]) continue;
        if (!coSaoThat) veSao(diem[i], 1.8, `rgba(232,238,255,${roSao})`);
        if (!giua || diem[i].y < giua.y) giua = diem[i];
      }
      if (giua && roSao > .35) {
        ctx.font = '500 11px "Be Vietnam Pro", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(190,215,235,${.5 * roSao})`;
        ctx.fillText(c.ten, giua.x, giua.y - 12);
      }
    }
  }

  /* Chỗ đã có chữ rồi thì thôi, kẻo hai cái tên chồng lên nhau khi Mặt Trăng đứng sát
     một hành tinh — đêm nay Sao Kim ngay cạnh Trăng là dính ngay. */
  const daGhi = [];
  const chenChu = (x, y) => {
    if (daGhi.some(c => Math.abs(c.x - x) < 52 && Math.abs(c.y - y) < 15)) return false;
    daGhi.push({ x, y }); return true;
  };

  /* Mặt Trăng và Mặt Trời ghi tên trước, hành tinh nhường chỗ. */
  if (b.trang.cao > -2) { const s = chieu(b.trang.cao, b.trang.huong); if (s) chenChu(s.x, s.y + 34); }
  if (b.troi.cao > -3) { const s = chieu(b.troi.cao, b.troi.huong); if (s) chenChu(s.x, s.y + 32); }

  /* Hành tinh: sáng hơn sao thường nên thấy được cả lúc trời còn nhá nhem. */
  for (const p of b.ht) {
    if (p.cao < -1) continue;
    const s = chieu(p.cao, p.huong);
    if (!s) continue;
    const ro = Math.max(0, 1 - sangTroi * (p.sang < -2 ? 1.1 : 2.2));
    if (ro < .05) continue;
    veSao(s, p.sang < -3 ? 3.6 : p.sang < -1 ? 3 : 2.2, p.mau);
    moc.push({ x: s.x, y: s.y, r: 20, ten: p.ten, loai: 'ht' });
    if (!chenChu(s.x, s.y + 22)) continue;
    ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(240,232,214,${.55 + .35 * ro})`;
    ctx.fillText(p.ten, s.x, s.y + 22);
  }

  /* Thiên thể đã lặn: vẽ thành BÓNG MỜ dưới đường chân trời, như nhìn xuyên qua đất.
     Không vẽ thì người dùng bấm vào đâu cũng không ra, mà nó lại là thứ hay bị hỏi nhất —
     "sao giờ không thấy mặt trăng". Vẽ mờ và ghi rõ "dưới chân trời" thì vừa thấy được nó
     đang ở đâu, vừa không nhầm là nó đang mọc. */
  const veBong = (cao, huong, ten, mau, r) => {
    if (cao > -1) return;
    const s = chieu(cao, huong);
    if (!s) return;
    ctx.save();
    ctx.globalAlpha = .34;
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = mau; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, 6.284); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = '500 11px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.fillStyle = mau;
    ctx.fillText(ten, s.x, s.y + r + 13);
    ctx.fillStyle = 'rgba(200,210,230,.85)';
    ctx.font = '400 10px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.fillText('dưới chân trời', s.x, s.y + r + 25);
    ctx.restore();
    moc.push({ x: s.x, y: s.y, r: Math.max(r, 16), ten, loai: 'bong' });
  };
  veBong(b.troi.cao, b.troi.huong, 'Mặt Trời', 'rgba(255,214,120,.9)', 13);
  veBong(b.trang.cao, b.trang.huong, 'Mặt Trăng', 'rgba(246,240,214,.9)', 12);
  for (const p of b.ht) if (p.cao <= -1) veBong(p.cao, p.huong, p.ten, p.mau, 7);

  /* Mặt Trăng: phóng to thì to theo, để thấy rõ các biển. */
  if (b.trang.cao > -2) {
    const s = chieu(b.trang.cao, b.trang.huong);
    if (s) {
      const R = 17 * Math.pow(GOC_THUONG / goc, .75);
      veTrang3D(s, b, R, sangTroi);
      moc.push({ x: s.x, y: s.y, r: Math.max(26, R + 8), ten: 'Mặt Trăng', loai: 'trang' });
      ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(246,240,214,.85)';
      ctx.fillText('Mặt Trăng', s.x, s.y + R + 17);
    }
  }

  /* Mặt Trời. */
  if (b.troi.cao > -3) {
    const s = chieu(b.troi.cao, b.troi.huong);
    if (s) {
      const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, 90);
      g.addColorStop(0, 'rgba(255,238,180,.95)'); g.addColorStop(.25, 'rgba(255,214,120,.45)');
      g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 90, 0, 6.284); ctx.fill();
      ctx.fillStyle = '#fff4cf'; ctx.beginPath(); ctx.arc(s.x, s.y, 15, 0, 6.284); ctx.fill();
      moc.push({ x: s.x, y: s.y, r: 26, ten: 'Mặt Trời', loai: 'troi' });
      ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,238,190,.9)';
      ctx.fillText('Mặt Trời', s.x, s.y + 32);
    }
  }

  veSuongMu(sangTroi, b);
  veChanTroi();
  return b;
}

/* ---------- dòng chữ dưới đáy ---------- */

function capNhatChu(b, luc) {
  const gio = new Date(luc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dau = new Date(luc); dau.setHours(0, 0, 0, 0);
  const ml = mocLanNho(dau.getTime());
  const gioNgan = (ms) => ms === null ? '—' :
    new Date(ms).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const mai = new Date(dau); mai.setDate(mai.getDate() + 1);
  const mlMai = mocLanNho(mai.getTime());
  const mt = mocLanNho(dau.getTime(), 'trang');
  const mtMai = mocLanNho(mai.getTime(), 'trang');

  const tren = b.ht.filter(p => p.cao > 0).map(p => p.ten);
  /* Dưới dự báo mưa chỉ còn một link nhỏ về Open-Meteo: giấy phép CC BY 4.0 của họ buộc có link
     ngay cạnh chỗ hiện dữ liệu của họ. Câu giải thích nguồn thì bỏ, người dùng không cần đọc. */
  const dongMua = cauMua(Date.now());   // giờ thật, kể cả khi đang xem thử giờ khác
  const q = tam.querySelector('.td-tin');
  const html = `
    <p class="td-dong1">${daChon ? noi.ten : 'Xem tạm ' + noi.ten} · ${gio} · ${b.toi.ten}</p>
    <p class="td-dong2">
      <button class="td-ten" data-xem="Mặt Trời">Mặt Trời</button> ${dangODau(b.troi.cao, b.troi.huong, ml, mlMai, luc)}
      · ${tenTrang(b.trang.tuoi, b.trang.sang)}, sáng ${Math.round(b.trang.sang * 100)}%,
      <button class="td-ten" data-xem="Mặt Trăng">Mặt Trăng</button> ${dangODau(b.trang.cao, b.trang.huong, mt, mtMai, luc)}
    </p>
    <p class="td-dong3">${tren.length ? 'Đang trên trời: ' + tren.join(' · ')
                                      : 'Không hành tinh nào trên trời lúc này'}</p>
    ${dongMua.length ? `<div class="td-mua">
      ${dongMua.map((c, i) => `<p class="${i ? 'td-mua-phu' : 'td-mua-chinh'}">${c}</p>`).join('')}
      <p class="td-mua-nguon"><a href="https://open-meteo.com/" target="_blank" rel="noopener">theo Open-Meteo.com</a></p>
    </div>` : mua.tinh === 'hong' ? `<p class="td-mua-hong">Chưa xin được dự báo mưa — có thể đang mất mạng.</p>`
      : !daChon ? `<p class="td-mua-hong">Bấm Đổi nơi để chọn chỗ bạn ở, app sẽ báo trời có mưa không.</p>` : ''}
    ${b.gapTrang.length ? `<p class="td-gap">${b.gapTrang.map(g =>
      g.cach < 0.6 ? `${g.ten} đang nấp ngay sau Mặt Trăng, cách ${so1(g.cach)}°`
                   : `${g.ten} đang sát Mặt Trăng, cách ${so1(g.cach)}°`).join(' · ')}</p>` : ''}`;
  /* Chỉ viết lại khi chữ thật sự đổi — thường là mỗi phút một lần, lúc đồng hồ nhảy số. Trước đây
     viết lại MỖI GIÂY, và mỗi lần như thế trình duyệt phải dàn trang, vẽ lại cả khối chữ; trên
     điện thoại đó là một cú khựng nhỏ lặp đều đặn giữa lúc đang kéo bầu trời. */
  if (q._html === html) return;
  q._html = html;
  q.innerHTML = html;

  /* Bấm thẳng vào chữ "Mặt Trời" / "Mặt Trăng" là quay nhìn về phía nó. Đây mới là lối đi cho
     trường hợp nó đã lặn: lúc đó nó không nằm trên màn nên chạm vào bầu trời không thể trúng. */
  q.querySelectorAll('.td-ten').forEach(n => {
    n.onclick = () => {
      const bb = veThe.b || b;             // vị trí mới nhất, không phải lúc chữ được viết
      const v = n.dataset.xem === 'Mặt Trời' ? bb.troi : bb.trang;
      chon = n.dataset.xem;
      nhinToi(v.cao, v.huong);
      veThe();
    };
  });
}

/* Giờ mọc lặn chỉ đổi mỗi ngày một lần và mỗi nơi một khác, mà tính nó là vòng lặp 1441 bước,
   mỗi bước tính đầy đủ vị trí thiên thể. Đo được: tám lời gọi tốn 25ms — mà dòng chữ chạy lại
   MỖI GIÂY, tức mỗi giây đốt 25ms chỉ để tính lại đúng mấy con số cũ. Trên điện thoại còn nặng
   hơn nhiều. Nên nhớ lại, và xoá khi đổi nơi. */
const khoMocLan = new Map();
function mocLanNho(msDauNgay, thienThe) {
  const khoa = `${msDauNgay}|${noi.vi}|${noi.kinh}|${thienThe || 'troi'}`;
  if (!khoMocLan.has(khoa)) {
    if (khoMocLan.size > 12) khoMocLan.clear();
    khoMocLan.set(khoa, A().mocLan(msDauNgay, noi.vi, noi.kinh, thienThe));
  }
  return khoMocLan.get(khoa);
}

/* ---------- dự báo mưa ----------
   Dùng Open-Meteo vì nó là dịch vụ duy nhất thoả cả ba ràng buộc của app này cùng lúc: không
   cần khoá API (nên không có bí mật nào để lộ), CORS mở thật (đã gọi thử với header Origin và
   vẫn trả access-control-allow-origin: *), và miễn phí cho mức dùng cá nhân.
   (met.no thì không dùng được từ trình duyệt: nó trả 403 cho BẤT KỲ request nào có Origin, dù
   thử bằng curl không Origin thì trông như CORS vẫn ổn.)

   Toạ độ làm tròn về hai chữ số thập phân TRƯỚC KHI gửi đi. Ô lưới của mô hình rộng chừng
   11km nên làm tròn tới ~1km không mất gì về độ chính xác, mà vị trí chính xác của người dùng
   thì không rời khỏi máy họ. */
const MUA_URL = 'https://api.open-meteo.com/v1/forecast';
const MUA_LAI = 600000;                                 // xin lại sau mười phút
let mua = { luc: 0, tinh: 'chua', gio: null, dangXin: false };
const cauMua = (luc) => mua.tinh === 'co' && self.TDTD_MUA
  ? self.TDTD_MUA.cau(self.TDTD_MUA.doc(mua.gio, luc)) : [];

async function xinMua() {
  if (mua.dangXin) return;
  mua.dangXin = true;
  try {
    const q = new URLSearchParams({
      latitude: (Math.round(noi.vi * 100) / 100).toString(),
      longitude: (Math.round(noi.kinh * 100) / 100).toString(),
      hourly: 'precipitation,rain,showers,precipitation_probability,weather_code',
      forecast_hours: '24', timezone: 'auto',
    });
    const bo = new AbortController();
    const hen = setTimeout(() => bo.abort(), 8000);
    const r = await fetch(`${MUA_URL}?${q}`, { signal: bo.signal });
    clearTimeout(hen);
    /* ĐỪNG tin r.ok. Khi mất mạng, service worker của app bắt lỗi fetch rồi trả về index.html
       với status 200 — r.ok vẫn TRUE, và JSON.parse sẽ nuốt phải một trang HTML. Phải soi
       kiểu nội dung mới biết mình nhận được cái gì. */
    const kieu = r.headers.get('content-type') || '';
    if (!r.ok || !kieu.includes('json')) throw new Error('khong-phai-json');
    const d = await r.json();
    /* Giữ dữ liệu thô, câu chữ dựng lại theo giờ hiện tại mỗi lần vẽ. Trước đây câu dựng một lần
       lúc xin dữ liệu rồi nằm yên mười phút, nên qua mốc 15 giờ mà chưa tới lượt xin lại thì
       vẫn còn báo đợt mưa 14–15 giờ. */
    mua = { luc: Date.now(), tinh: 'co', dangXin: false, gio: d.hourly };
  } catch (e) {
    mua = { luc: Date.now(), tinh: 'hong', dangXin: false, gio: null };
  }
}

/* ---------- chạm chọn một thiên thể ---------- */

/* Dò xem chạm trúng cái gì. Nhiều thứ chồng nhau thì lấy cái gần tâm chạm nhất.
   Bỏ qua mốc nằm ngoài màn: hàm chieu() chỉ trả null khi vật ở SAU LƯNG, còn vật ở trước mặt
   nhưng lệch ra ngoài mép thì nó vẫn trả toạ độ — có lúc âm hẳn. Không lọc thì chạm sát mép
   màn có thể trúng nhầm một thiên thể đang nằm ngoài khung. */
function chonTai(x, y) {
  let gan = null, dGan = Infinity;
  for (const m of moc) {
    if (m.x < -m.r || m.x > W + m.r || m.y < -m.r || m.y > H + m.r) continue;
    const d = Math.hypot(m.x - x, m.y - y);
    if (d <= m.r && d < dGan) { gan = m; dGan = d; }
  }
  chon = gan ? gan.ten : null;
  veThe();
}

/* Quay hướng nhìn về phía một thiên thể, kể cả khi nó đang dưới chân trời — đó mới là chỗ
   người dùng cần: "bấm vô xem mặt trăng" lúc trăng đã lặn thì phải đưa mắt xuống dưới đất. */
function nhinToi(cao, huong) {
  theoMay = false;
  ngam = { cao: Math.max(-82, Math.min(85, cao)), huong };
}
function keoNhin(dt = 16.7) {
  if (!ngam) return;
  quanTinh = null;
  const dh = A().quanh(ngam.huong - huongNhin), dc = ngam.cao - caoNhin;
  if (Math.abs(dh) < .4 && Math.abs(dc) < .4) { huongNhin = ngam.huong; caoNhin = ngam.cao; ngam = null; return; }
  const k = 1 - Math.pow(1 - .16, dt / 16.7);   // cùng một tốc độ trên màn 60 Hz lẫn 120 Hz
  huongNhin = A().chuan(huongNhin + dh * k);
  caoNhin = caoNhin + dc * k;
}

/* Hai thứ làm bầu trời trôi êm giữa hai khung hình.
   - Xoay theo máy: cảm biến điện thoại lúc nào cũng rung nhẹ, đưa thẳng số đo lên màn thì hình
     rung theo. Nên màn hình trôi dần về hướng cảm biến (hằng số thời gian 100ms): đủ nhanh để
     thấy như bám theo tay, đủ chậm để nuốt cái rung.
   - Nhấc ngón sau khi vuốt: bầu trời trôi thêm một chút rồi chậm dần mà dừng, như kéo bản đồ,
     chứ không đứng khựng lại. */
function troiNhin(dt) {
  if (theoMay && mucMay) {
    /* Làm mượt TRÊN VECTOR, không trên góc. Trên góc thì gần thiên đỉnh nó vỡ: cùng một bàn
       tay rung, con số hướng nhảy 3,1 độ mỗi khung lúc nhìn ngang nhưng vọt lên 12,3 độ lúc
       chĩa gần thẳng đứng, trong khi vector chỉ nhảy đều 3,9 độ ở mọi tư thế. Kéo trên vector
       thì một cử động nhỏ của tay luôn ra một thay đổi nhỏ trên màn. */
    const k = 1 - Math.exp(-dt / 100);
    const a = A().vecHuong(huongNhin, caoNhin), b = A().vecHuong(mucMay.h, mucMay.c);
    const g = A().gocHuong({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k });
    huongNhin = A().chuan(g.huong);
    caoNhin = Math.max(-85, Math.min(88, g.cao));
  }
  if (quanTinh && !keo) {
    huongNhin = A().chuan(huongNhin + quanTinh.h * dt);
    caoNhin = Math.max(-85, Math.min(88, caoNhin + quanTinh.c * dt));
    const giam = Math.exp(-dt / 325);
    quanTinh.h *= giam; quanTinh.c *= giam;
    if (Math.hypot(quanTinh.h, quanTinh.c) < .002) quanTinh = null;
  }
}

/* Thẻ thông tin của thiên thể đang chọn. Chỉ hiện những thứ app THẬT SỰ tính được. */
function veThe() {
  const o = tam && tam.querySelector('.td-the');
  if (!o) return;
  if (!chon) { o.hidden = true; return; }
  const b = veThe.b;
  if (!b) { o.hidden = true; return; }
  const luc = veThe.luc || Date.now();
  const dau = new Date(luc); dau.setHours(0, 0, 0, 0);
  const mai = new Date(dau); mai.setDate(mai.getDate() + 1);

  let v = null, phu = '';
  if (chon === 'Mặt Trời') {
    v = b.troi;
    phu = dangODau(v.cao, v.huong, mocLanNho(dau.getTime()),
                   mocLanNho(mai.getTime()), luc);
  } else if (chon === 'Mặt Trăng') {
    v = b.trang;
    /* CẨN THẬN đơn vị: kc của Trăng tính bằng KM (~385000), còn kc của Mặt Trời và hành tinh
       tính bằng ĐƠN VỊ THIÊN VĂN. Cùng một tên trường, hai thang lệch nhau 150 triệu lần —
       viết một dòng hiển thị dùng chung cho cả ba là ra ngay một Mặt Trăng cách 385 nghìn tỉ km. */
    phu = `${tenTrang(v.tuoi, v.sang)}, sáng ${Math.round(v.sang * 100)}% · ` +
      dangODau(v.cao, v.huong, mocLanNho(dau.getTime(), 'trang'),
               mocLanNho(mai.getTime(), 'trang'), luc) +
      ` · cách Trái Đất ${Math.round(v.kc / 1000)} nghìn km, ánh sáng đi hết ${so1(v.kc / 299792.458)} giây`;
  } else {
    v = b.ht.find(p => p.ten === chon);
    if (v) phu = (v.cao > 0 ? `đang ở ${Math.round(v.cao)}° trên ${huongChu(v.huong)}`
                            : 'đang ở dưới chân trời') +
      (v.kc ? ` · cách Trái Đất ${so1(v.kc)} đơn vị thiên văn` : '');
  }
  if (!v) { o.hidden = true; return; }
  o.hidden = false;
  /* Thẻ này có lớp kính mờ, vẽ lại rất tốn trên điện thoại, nên cũng chỉ viết lại khi chữ đổi.
     Viết lại mỗi giây còn gây một lỗi khác: đúng lúc ngón tay đang nhấn thì nút bị thay bằng nút
     mới, và cú bấm rơi mất. */
  const html = `<button class="td-the-thoi" aria-label="Đóng">✕</button>
    <p class="td-the-ten">${chon}</p>
    <p class="td-the-phu">${phu}</p>
    <button class="td-the-nhin">Quay nhìn về phía này</button>`;
  if (o._html !== html) { o._html = html; o.innerHTML = html; }
  o.querySelector('.td-the-thoi').onclick = () => { chon = null; o.hidden = true; };
  o.querySelector('.td-the-nhin').onclick = () => nhinToi(v.cao, v.huong);
}

/* Một thiên thể không ở trên trời thì có HAI lý do khác hẳn nhau: chưa mọc, hoặc đã lặn rồi.
   Bản trước gộp cả hai thành một câu "chưa lên khỏi chân trời", nên lúc mười một giờ đêm mà
   Trăng đã lặn từ chín rưỡi thì app vẫn bảo nó "chưa lên" — người đọc tưởng app hỏng. */
function dangODau(cao, huong, ml, mlMai, luc) {
  const g = (ms) => ms === null ? '—' :
    new Date(ms).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const t = A().trangThaiMocLan(cao, ml, mlMai, luc);
  if (t.tinh === 'tren')
    return `đang ở ${Math.round(cao)}° trên ${huongChu(huong)}` + (t.lan ? `, lặn lúc ${g(t.lan)}` : '');
  if (t.tinh === 'chuaMoc') return `chưa mọc, mọc lúc ${g(t.moc)}`;
  if (t.tinh === 'daLan') return `đã lặn lúc ${g(t.lan)}` + (t.maiMoc ? `, mai mọc ${g(t.maiMoc)}` : '');
  return 'đang ở dưới chân trời';
}

const so1 = (x) => x.toFixed(1).replace('.', ',');       // dấu thập phân kiểu Việt
const huongChu = (h) => TAM_HUONG[Math.round(((h % 360) + 360) % 360 / 45) % 8].toLowerCase();

/* ---------- vòng chạy ---------- */

function vong(t) {
  raf = requestAnimationFrame(vong);
  const dt = vong.tr && t ? Math.min(50, Math.max(0, t - vong.tr)) : 16.7;
  vong.tr = t;
  const luc = Date.now();
  if (vuTru && V()) {
    const kq = V().ve(ctx, W, H, DPR, luc, noi);
    if (!vong.t || luc - vong.t > 1000) {
      vong.t = luc;
      const q = tam.querySelector('.td-tin'), html = V().giaiThich(kq, noi);
      if (q._html !== html) { q._html = html; q.innerHTML = html; }
      const nt = tam.querySelector('.td-tua'), tt = 'Tua: ' + V().tua();
      if (nt.textContent !== tt) nt.textContent = tt;
    }
    return;
  }
  troiNhin(dt);
  keoNhin(dt);
  const b = ve(luc);
  veThe.b = b; veThe.luc = luc;
  if (!vong.t || luc - vong.t > 1000) {
    capNhatChu(b, luc); veThe(); vong.t = luc;
    /* Bám vào nhánh một giây sẵn có: phép so sánh này gần như miễn phí, mà mạng thì chỉ chạm
       tới mười phút một lần. */
    if (daChon && luc - mua.luc > MUA_LAI) xinMua();
  }
}

/* ---------- khung ---------- */

function doCo() {
  W = tam.clientWidth || innerWidth || 360;
  H = tam.clientHeight || innerHeight || 640;
  DPR = Math.min(2, devicePixelRatio || 1);
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'troidem';
  tam.innerHTML = `
    <canvas class="td-cv"></canvas>
    <button class="td-dong" aria-label="Đóng">✕</button>
    <div class="td-tin"></div>
    <div class="td-the" hidden></div>
    <button class="td-phong" type="button" hidden></button>
    <div class="td-thanh">
      <button class="td-noi" type="button">Đổi nơi</button>
      <button class="td-may" type="button">Xoay theo máy</button>
      <button class="td-vutru" type="button">Nhìn từ vũ trụ</button>
      <button class="td-canh" type="button" hidden>Hệ Mặt Trời</button>
      <button class="td-tua" type="button" hidden>Tua: Giờ thật</button>
    </div>
    <div class="td-bang" hidden></div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.td-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.td-dong').onclick = dong;
  tam.querySelector('.td-noi').onclick = moBangChonNoi;
  tam.querySelector('.td-may').onclick = doiTheoMay;
  tam.querySelector('.td-vutru').onclick = () => doiVuTru();
  tam.querySelector('.td-canh').onclick = () => {
    const c = V().doiCanh();
    tam.querySelector('.td-canh').textContent = c === 'traiDat' ? 'Hệ Mặt Trời' : 'Trái Đất – Mặt Trăng';
    vong.t = 0;
  };
  tam.querySelector('.td-tua').onclick = () => { tam.querySelector('.td-tua').textContent = 'Tua: ' + V().doiTua(); vong.t = 0; };

  /* Hai ngón chạm cùng lúc là chụm để phóng to/thu nhỏ: khoảng cách hai ngón đổi bao nhiêu lần thì
     góc nhìn đổi ngược lại bấy nhiêu lần. Đang chụm thì thôi kéo, kẻo bầu trời vừa phóng vừa trượt. */
  const kc = () => { const [a, b] = [...chamTay.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  cv.addEventListener('pointerdown', e => {
    chamTay.set(e.pointerId, { x: e.clientX, y: e.clientY });
    quanTinh = null; ngam = null;
    if (chamTay.size === 2) { chum = { d: kc(), dTruoc: kc(), goc }; keo = null; if (vuTru) V().thaKeo(); return; }
    if (chamTay.size > 2) return;
    if (vuTru) { V().batDauKeo(e.clientX, e.clientY); return; }
    keo = { x: e.clientX, y: e.clientY, h: huongNhin, c: caoNhin, luc: Date.now(), xa: 0,
            tr: e.timeStamp, vh: 0, vc: 0 };
  });
  cv.addEventListener('pointermove', e => {
    if (chamTay.has(e.pointerId)) chamTay.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (chum && chamTay.size >= 2) {
      if (vuTru) { V().phong(chum.dTruoc / kc()); chum.dTruoc = kc(); } else datGoc(chum.goc * chum.d / kc());
      return;
    }
    if (vuTru) { V().keo(e.clientX, e.clientY); return; }
    if (!keo) return;
    if (theoMay) doiTheoMay();              // tự kéo tay thì tắt xoay theo máy, và nút cũng tắt theo
    keo.xa = Math.max(keo.xa, Math.hypot(e.clientX - keo.x, e.clientY - keo.y));
    const h = A().chuan(keo.h - (e.clientX - keo.x) * goc / W);
    const c = Math.max(-85, Math.min(88, keo.c + (e.clientY - keo.y) * goc / W));
    /* Vận tốc làm mượt qua vài lần chạm, để một cú giật tay cuối cùng không quyết định cả cú trôi. */
    const dt = e.timeStamp - keo.tr;
    if (dt > 0) {
      keo.vh = keo.vh * .6 + (A().quanh(h - huongNhin) / dt) * .4;
      keo.vc = keo.vc * .6 + ((c - caoNhin) / dt) * .4;
    }
    keo.tr = e.timeStamp;
    huongNhin = h; caoNhin = c;
  });
  /* Chạm hay kéo? Nhích dưới 9px và nhả trong 450ms thì tính là CHẠM. Ngưỡng rộng tay vì
     ngón tay trên điện thoại không bao giờ đứng yên tuyệt đối. */
  cv.addEventListener('pointerup', e => {
    if (vuTru) { V().thaKeo(); return; }
    if (keo && keo.xa < 9 && Date.now() - keo.luc < 450) {
      const r = cv.getBoundingClientRect();
      chonTai(e.clientX - r.left, e.clientY - r.top);
    } else if (keo && e.timeStamp - keo.tr < 80 && Math.hypot(keo.vh, keo.vc) > .01) {
      /* Chỉ trôi khi ngón tay còn đang chạy lúc nhấc lên. Dừng tay rồi mới nhấc thì đứng yên. */
      quanTinh = { h: keo.vh, c: keo.vc };
    }
    keo = null;
  });
  const nhac = (e) => {
    chamTay.delete(e.pointerId);
    if (chamTay.size < 2) chum = null;
  };
  cv.addEventListener('pointerup', nhac);
  for (const s of ['pointercancel', 'pointerleave']) cv.addEventListener(s, (e) => { keo = null; nhac(e); });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    if (vuTru) V().phong(Math.pow(1.0015, e.deltaY)); else datGoc(goc * Math.pow(1.0015, e.deltaY));
  }, { passive: false });
  tam.querySelector('.td-phong').onclick = () => datGoc(GOC_THUONG);
  addEventListener('resize', () => { if (tam && tam.classList.contains('hien')) doCo(); });
}

/* Bật tắt cảnh nhìn từ vũ trụ. Vào thì tắt xoay theo máy (không có nghĩa ở ngoài vũ trụ), ẩn thẻ thiên
   thể và nút phóng; ra thì về bầu trời như cũ. */
function doiVuTru(bat = !vuTru) {
  if (bat && !V()) return;
  vuTru = bat;
  if (bat && theoMay) doiTheoMay();
  if (bat) { V().vao(); chon = null; ngam = null; }
  const q = (k) => tam.querySelector(k);
  q('.td-vutru').textContent = bat ? 'Về bầu trời' : 'Nhìn từ vũ trụ';
  q('.td-may').hidden = bat; q('.td-noi').hidden = bat; q('.td-canh').hidden = !bat; q('.td-tua').hidden = !bat;
  q('.td-the').hidden = true;
  q('.td-phong').hidden = bat || Math.abs(GOC_THUONG / goc - 1) < .08;
  if (bat) { q('.td-canh').textContent = V().canh() === 'traiDat' ? 'Hệ Mặt Trời' : 'Trái Đất – Mặt Trăng'; q('.td-tua').textContent = 'Tua: ' + V().tua(); }
  q('.td-tin')._html = null; vong.t = 0;
  tam.classList.toggle('vu-tru', bat);
}

/* Góc nhìn 12°–110°: hẹp nhất cỡ ống nhòm, rộng nhất cỡ mắt người. Lệch khỏi mặc định thì hiện
   nút nhỏ ghi độ phóng, bấm vào là về như cũ. */
function datGoc(g) {
  goc = Math.max(12, Math.min(110, g));
  const n = tam && tam.querySelector('.td-phong');
  if (!n) return;
  const lan = GOC_THUONG / goc;
  n.hidden = Math.abs(lan - 1) < .08;
  n.textContent = lan > 1 ? `Phóng ×${so1(lan)} · bấm để về` : `Thu ×${so1(1 / lan)} · bấm để về`;
}

/* ---------- chọn nơi đứng ---------- */

function moBangChonNoi() {
  const b = tam.querySelector('.td-bang');
  b.hidden = false;
  b.innerHTML = `
    <div class="td-hop">
      <p class="td-tieu">Bạn đang ở đâu?</p>
      ${daChon ? '' : '<p class="td-vi-sao">Để biết trời chỗ bạn có mưa không, và Mặt Trời, Mặt Trăng đang ở hướng nào.</p>'}
      <button class="td-dinhvi" type="button">Dùng vị trí của máy</button>
      <p class="td-hay">hoặc chọn thành phố</p>
      <div class="td-tp">${THANH_PHO.map(([t, v, k]) =>
        `<button type="button" data-vi="${v}" data-kinh="${k}"${daChon && t === noi.ten ? ' class="dang"' : ''}>${t}</button>`).join('')}</div>
      <button class="td-thoi" type="button">${daChon ? 'Thôi' : 'Để sau'}</button>
    </div>`;
  b.querySelector('.td-thoi').onclick = () => { b.hidden = true; };
  b.querySelector('.td-dinhvi').onclick = xinViTri;
  b.querySelectorAll('.td-tp button').forEach(n => {
    n.onclick = () => {
      doiNoi({ ten: n.textContent, vi: +n.dataset.vi, kinh: +n.dataset.kinh, tuMay: false });
      luuNoi(); b.hidden = true;
    };
  });
}

function luuNoi() { try { localStorage.setItem(NOI_KEY, JSON.stringify(noi)); } catch (e) {} }

/* Một cửa DUY NHẤT để đổi nơi. Ba chỗ vốn gán thẳng vào biến noi — nút thành phố, định vị, và
   móc kiểm thử — nên chỉ cần một chỗ quên xoá bộ nhớ giờ mọc lặn là app hiện giờ mọc của nơi
   cũ mà không ai thấy sai ở đâu. */
function doiNoi(moi, luu) {
  noi = moi;
  daChon = true;
  khoMocLan.clear();
  mua = { luc: 0, tinh: 'chua', gio: null, dangXin: false };   // dự báo của nơi cũ hết giá trị
  chon = null; ngam = null;
  const t = tam && tam.querySelector('.td-the');
  if (t) t.hidden = true;
  if (luu) luuNoi();
  return noi;
}

function xinViTri() {
  const b = tam.querySelector('.td-bang');
  const nut = b.querySelector('.td-dinhvi');
  if (!navigator.geolocation) { nut.textContent = 'Máy này không cho biết vị trí'; return; }
  nut.textContent = 'Đang hỏi vị trí…'; nut.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      doiNoi({ ten: 'chỗ bạn đứng', vi: p.coords.latitude, kinh: p.coords.longitude, tuMay: true });
      luuNoi(); b.hidden = true;
    },
    () => { nut.textContent = 'Không lấy được vị trí, chọn thành phố nhé'; nut.disabled = false; },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
}

/* ---------- xoay theo máy ---------- */

function ganCamBien() {
  batTheoMay = (e) => {
    if (!theoMay) return;
    /* Dựng CẢ ma trận quay từ alpha, beta, gamma thay vì lấy alpha làm hướng, beta làm độ cao.
       Cách rời rạc ấy đúng khi máy cầm thẳng, nhưng bỏ hẳn gamma — mà ngửa máy lên nhìn mặt
       trời thì tay luôn nghiêng. Đo được: ngửa 50 độ nghiêng 20 độ là sai hướng 30 độ; chĩa
       gần thẳng đứng nghiêng 5 độ là sai 68 độ. Bầu trời bị quăng đi theo từng rung tay, bộ
       làm mượt đuổi theo một cái đích đang nhảy, và nhìn ra thì tưởng máy lag.

       iOS có webkitCompassHeading đã trừ sẵn độ lệch từ nên chính xác hơn alpha; nó tương ứng
       với alpha theo công thức alpha = 360 - heading, nên thay vào rồi dựng ma trận như thường. */
    const al = typeof e.webkitCompassHeading === 'number' ? 360 - e.webkitCompassHeading : e.alpha;
    if (al === null && typeof e.beta !== 'number') return;
    const v = A().huongMay(al, e.beta, e.gamma);
    if (!v) return;
    mucMay = { h: A().chuan(v.huong), c: Math.max(-85, Math.min(88, v.cao)) };
  };
  addEventListener('deviceorientation', batTheoMay, true);
}

async function doiTheoMay() {
  const nut = tam.querySelector('.td-may');
  if (theoMay) { theoMay = false; mucMay = null; nut.classList.remove('bat'); nut.textContent = 'Xoay theo máy'; return; }
  /* iOS 13 trở lên bắt phải xin phép, và chỉ xin được ngay trong một cú chạm. */
  const D = self.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try {
      const tl = await D.requestPermission();
      if (tl !== 'granted') { nut.textContent = 'Máy không cho đọc cảm biến'; return; }
    } catch (e) { nut.textContent = 'Máy không cho đọc cảm biến'; return; }
  } else if (!('DeviceOrientationEvent' in self)) {
    nut.textContent = 'Máy này không có cảm biến hướng';
    return;
  }
  if (!batTheoMay) ganCamBien();
  quanTinh = null; mucMay = null;
  theoMay = true; nut.classList.add('bat'); nut.textContent = 'Đang xoay theo máy';
}

/* ---------- mở đóng ---------- */

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  /* Mở ra thì quay mặt về hướng có nhiều thứ đáng xem nhất: Mặt Trăng nếu nó đang trên
     trời, không thì Mặt Trời, không nữa thì nhìn về Nam. */
  const b = bauTroi(Date.now());
  huongNhin = b.trang.cao > 5 ? b.trang.huong : b.troi.cao > 5 ? b.troi.huong : 180;
  caoNhin = Math.max(15, Math.min(60, b.trang.cao > 5 ? b.trang.cao : b.troi.cao > 5 ? b.troi.cao : 25));
  if (!raf) raf = requestAnimationFrame(vong);
  /* Chưa chọn nơi thì hỏi ngay, không lặng lẽ lấy TP.HCM. Không tự bật định vị: chỉ hỏi vị trí
     khi người dùng bấm nút. Bấm "Để sau" thì lần mở sau hỏi lại. */
  if (!daChon) moBangChonNoi();
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  if (vuTru && tam) doiVuTru(false);
  theoMay = false; mucMay = null; quanTinh = null;
  if (tam) {                               // mở lại màn thì nút không còn ghi "Đang xoay theo máy" nữa
    const nut = tam.querySelector('.td-may');
    nut.classList.remove('bat'); nut.textContent = 'Xoay theo máy';
  }
  /* Bỏ lựa chọn và đích ngắm. Không bỏ thì mở lại màn, keoNhin() sẽ lôi hướng nhìn về thiên thể
     chọn từ lần trước, ghi đè luôn hướng mà mo() vừa đặt — người dùng mở ra thấy đang chúi
     xuống đất mà không hiểu vì sao. */
  chon = null; ngam = null;
  const t = tam && tam.querySelector('.td-the');
  if (t) t.hidden = true;
  if (tam) { tam.classList.remove('hien'); const b = tam.querySelector('.td-bang'); if (b) b.hidden = true; }
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_TROIDEM = { mo, dong,
  _bauTroi: (luc) => bauTroi(luc || Date.now()),
  _ve: (luc) => ve(luc || Date.now()),
  _keoNhin: () => keoNhin(),
  _noi: (v, k, ten) => doiNoi({ ten: ten || 'thử', vi: v, kinh: k, tuMay: false }),
  _nhin: (h, c, g) => { huongNhin = h; caoNhin = c; if (g) goc = g; return { huongNhin, caoNhin, goc }; },
  _chieu: (cao, huong) => chieu(cao, huong),
  _tenTrang: tenTrang,
  _mocLanNho: (ms, t) => mocLanNho(ms, t),
  _coNhoMocLan: () => khoMocLan.size,
  _xinMua: () => xinMua(),
  _mua: () => ({ tinh: mua.tinh, dong: cauMua(Date.now()) }),
  _quenMua: () => { mua = { luc: 0, tinh: 'chua', gio: null, dangXin: false }; },
  _moc: () => moc.map(m => ({ ten: m.ten, loai: m.loai, x: Math.round(m.x), y: Math.round(m.y), r: m.r })),
  _chonTai: (x, y) => { chonTai(x, y); return chon; },
  _chon: () => chon,
  _nhinToi: (c, h) => nhinToi(c, h),
  _dangODau: (cao, huong, ml, mlMai, luc) => dangODau(cao, huong, ml, mlMai, luc),
  _daChon: () => daChon,
  _troiNhin: (dt) => { troiNhin(dt); return { huongNhin, caoNhin, quanTinh }; },
  _quanTinh: (h, c) => { quanTinh = h === null ? null : { h, c }; },
  /* Chạy thẳng bộ bắt cảm biến, không cần bật nút — máy bàn không có cảm biến nên không thể
     bật được, mà đây lại đúng là đoạn mã từng sai. */
  _camBien: (e) => { if (!batTheoMay) ganCamBien(); const t = theoMay; theoMay = true; batTheoMay(e); theoMay = t; return mucMay && { ...mucMay }; },
  _mucMay: (h, c) => { theoMay = true; mucMay = { h, c }; },
  _htmlChu: () => tam.querySelector('.td-tin')._html,
  _quenNoi: () => { daChon = false; },
  _debug: () => ({ noi, daChon, huongNhin: Math.round(huongNhin), caoNhin: Math.round(caoNhin), goc, theoMay, W, H }),
  _datGoc: (g) => { datGoc(g); return goc; },
  _sao: (luc) => { const S = napSao(luc || Date.now()); return S && capNhatTap(S, luc || Date.now()); },
  _nganHa: (luc) => capNhatTap(napNganHa(luc || Date.now()), luc || Date.now()),
  _nguong: (sangTroi, b) => nguongSao(sangTroi, b),
  _gocTrenMan: (v, w) => gocTrenMan(v, w),
  _vecto: vecto,
  _vien: vienTai,
  _bien: BIEN,
  _ketCauTrang: (R, cosI, gocSang, dem) => { khoTrang = null; return ketCauTrang(R, cosI, gocSang, dem); },
  _vuTru: (b) => { if (b !== undefined) doiVuTru(b); return vuTru; },
  _chum: (d0, d1) => { chum = { d: d0, goc }; datGoc(chum.goc * d0 / d1); chum = null; return goc; } };
})();
