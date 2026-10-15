/* Mã QR tự vẽ, không thư viện, chạy được khi mất mạng: chữ → ma trận ô đen trắng → SVG. Dùng cho phòng cờ ba người:
   bạn ngồi cạnh giơ camera quét là vào phòng (người dùng: "chỗ tạo phòng vô phòng khó sài quá").
   Theo chuẩn ISO/IEC 18004: kiểu byte (UTF-8), mức sửa lỗi M (chịu được chừng 15% ô hỏng), phiên bản 1–6 (21–41 ô mỗi
   cạnh; link mời chừng 70 ký tự rơi vào phiên bản 5), chọn mặt nạ có điểm phạt thấp nhất. Cách đặt bit định dạng, mặt
   nạ và điểm phạt làm theo bản cài mẫu của Nayuki ("QR Code generator library", nayuki.io), đối chiếu chuẩn. */
(function (root) {
'use strict';
/* mức M, phiên bản 1–6: [mã sửa lỗi mỗi khối, số khối, mã dữ liệu mỗi khối] — mức M tới phiên bản 6 các khối đều nhau */
const BANG = [null, [10, 1, 16], [16, 1, 28], [26, 1, 44], [18, 2, 32], [24, 2, 43], [16, 4, 27]];
const CANH = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];         // tâm các ô căn chỉnh

/* số học trên GF(256), đa thức sinh 0x11d */
const EXP = new Array(512), LOG = new Array(256);
{ let x = 1; for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 256) x ^= 0x11d; } for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255]; }
const nhan = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);
function daThucSinh(n) {                                     // (x − α⁰)(x − α¹)…(x − αⁿ⁻¹), hệ số bậc cao trước
  let g = [1];
  for (let i = 0; i < n; i++) {
    const r = new Array(g.length + 1).fill(0);
    for (let a = 0; a < g.length; a++) { r[a] ^= g[a]; r[a + 1] ^= nhan(g[a], EXP[i]); }
    g = r;
  }
  return g;
}
function maSua(du, n) {                                     // Reed–Solomon: phần dư của du·xⁿ chia đa thức sinh
  const g = daThucSinh(n), r = du.concat(new Array(n).fill(0));
  for (let i = 0; i < du.length; i++) { const h = r[i]; if (h) for (let j = 0; j < g.length; j++) r[i + j] ^= nhan(g[j], h); }
  return r.slice(du.length);
}
const utf8 = (s) => (typeof TextEncoder !== 'undefined' ? Array.from(new TextEncoder().encode(s)) : Array.from(unescape(encodeURIComponent(s)), c => c.charCodeAt(0)));

/* chuỗi mã (dữ liệu xen kẽ các khối, rồi mã sửa lỗi xen kẽ) và phiên bản nhỏ nhất chứa vừa */
function maHoa(chu) {
  const b = utf8(chu);
  let v = 1;
  while (v <= 6 && b.length > Math.floor((BANG[v][1] * BANG[v][2] * 8 - 12) / 8)) v++;
  if (v > 6) return null;
  const [ecc, soKhoi, dKhoi] = BANG[v], tong = soKhoi * dKhoi, bit = [];
  const day = (x, n) => { for (let i = n - 1; i >= 0; i--) bit.push((x >> i) & 1); };
  day(4, 4); day(b.length, 8); for (const x of b) day(x, 8);       // kiểu byte 0100, độ dài 8 bit, dữ liệu
  day(0, Math.min(4, tong * 8 - bit.length));                       // dấu kết thúc
  while (bit.length % 8) bit.push(0);
  const du = [];
  for (let i = 0; i < bit.length; i += 8) du.push(parseInt(bit.slice(i, i + 8).join(''), 2));
  for (let p = 0; du.length < tong; p++) du.push(p % 2 ? 0x11 : 0xEC);   // byte độn
  const khoi = [], sua = [];
  for (let k = 0; k < soKhoi; k++) { const d = du.slice(k * dKhoi, (k + 1) * dKhoi); khoi.push(d); sua.push(maSua(d, ecc)); }
  const ra = [];
  for (let i = 0; i < dKhoi; i++) for (const d of khoi) ra.push(d[i]);
  for (let i = 0; i < ecc; i++) for (const e of sua) ra.push(e[i]);
  return { v, ma: ra, khoi, sua };
}

const MAT_NA = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => (x * y) % 2 + (x * y) % 3 === 0,
  (x, y) => ((x * y) % 2 + (x * y) % 3) % 2 === 0, (x, y) => ((x + y) % 2 + (x * y) % 3) % 2 === 0,
];
/* 15 bit định dạng: mức M (00) + mặt nạ, mã BCH (đa thức 0x537), XOR 0x5412 */
function bitDinhDang(mat) { const d = mat; let r = d; for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537); return ((d << 10) | r) ^ 0x5412; }

/* ma trận: m[y][x] = true là ô đen */
function maTran(chu) {
  const kq = maHoa(chu);
  if (!kq) return null;
  const { v, ma } = kq, n = 17 + 4 * v;
  const m = Array.from({ length: n }, () => new Array(n).fill(false));
  const co = Array.from({ length: n }, () => new Array(n).fill(false));    // ô chức năng (không đặt dữ liệu, không che)
  const dat = (x, y, den) => { m[y][x] = den; co[y][x] = true; };
  const timDau = (x0, y0) => {
    for (let dy = -1; dy <= 7; dy++) for (let dx = -1; dx <= 7; dx++) {
      const x = x0 + dx, y = y0 + dy;
      if (x < 0 || y < 0 || x >= n || y >= n) continue;
      const k = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      dat(x, y, k !== 2 && k !== 4);
    }
  };
  timDau(0, 0); timDau(n - 7, 0); timDau(0, n - 7);
  for (let i = 8; i < n - 8; i++) { dat(i, 6, i % 2 === 0); dat(6, i, i % 2 === 0); }
  const ca = CANH[v], cuoi = ca.length - 1;
  for (let i = 0; i < ca.length; i++) for (let j = 0; j < ca.length; j++) {
    if ((i === 0 && j === 0) || (i === 0 && j === cuoi) || (i === cuoi && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) dat(ca[i] + dx, ca[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  /* 15 bit định dạng quanh ba ô định vị (vị trí như bản cài mẫu của Nayuki) */
  const datDinhDang = (b, mm) => {
    const bit = (i) => ((b >>> i) & 1) === 1, d = (x, y, den) => { mm[y][x] = den; co[y][x] = true; };
    for (let i = 0; i <= 5; i++) d(8, i, bit(i));
    d(8, 7, bit(6)); d(8, 8, bit(7)); d(7, 8, bit(8));
    for (let i = 9; i < 15; i++) d(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) d(n - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) d(8, n - 15 + i, bit(i));
    d(8, n - 8, true);                                               // ô luôn đen
  };
  datDinhDang(0, m);                                                 // giữ chỗ trước khi đặt dữ liệu
  /* đặt dữ liệu theo đường zíc zắc hai cột một, từ góc phải dưới, bỏ cột định thời */
  let k = 0;
  const bit = (i) => (i < ma.length * 8 ? ((ma[i >> 3] >> (7 - (i & 7))) & 1) === 1 : false);
  for (let phai = n - 1; phai >= 1; phai -= 2) {
    if (phai === 6) phai = 5;
    const len = ((phai + 1) & 2) === 0;
    for (let j = 0; j < n; j++) for (let t = 0; t < 2; t++) {
      const x = phai - t, y = len ? n - 1 - j : j;
      if (co[y][x]) continue;
      m[y][x] = bit(k++);
    }
  }
  /* thử cả tám mặt nạ, giữ cái điểm phạt thấp nhất */
  let tot = null, diemTot = Infinity, matTot = 0;
  for (let mat = 0; mat < 8; mat++) {
    const b = m.map(r => r.slice());
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!co[y][x] && MAT_NA[mat](x, y)) b[y][x] = !b[y][x];
    datDinhDang(bitDinhDang(mat), b);
    const d = diemPhat(b);
    if (d < diemTot) { diemTot = d; tot = b; matTot = mat; }
  }
  return { n, o: tot, v, mat: matTot };
}
function diemPhat(m) {
  const n = m.length;
  let d = 0, den = 0;
  const hang = (lay) => {
    for (let a = 0; a < n; a++) {
      let chay = 1;
      for (let b = 1; b <= n; b++) {
        if (b < n && lay(a, b) === lay(a, b - 1)) { chay++; continue; }
        if (chay >= 5) d += 3 + (chay - 5);
        chay = 1;
      }
      for (let b = 0; b + 10 < n; b++) {                             // giống ô định vị 1:1:3:1:1 cạnh bốn ô trắng
        const s = Array.from({ length: 11 }, (_, i) => (lay(a, b + i) ? 1 : 0)).join('');
        if (s === '10111010000' || s === '00001011101') d += 40;
      }
    }
  };
  hang((a, b) => m[a][b]); hang((a, b) => m[b][a]);
  for (let y = 0; y + 1 < n; y++) for (let x = 0; x + 1 < n; x++) { const c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) d += 3; }
  for (const r of m) for (const c of r) if (c) den++;
  d += (Math.ceil(Math.abs(den * 20 - n * n * 10) / (n * n)) - 1) * 10;
  return d;
}
/* SVG vuông, chừa lề trắng 4 ô như chuẩn đòi; gộp các ô đen liền nhau trên một hàng cho gọn */
function svg(chu, mauDen = '#111', mauTrang = '#fff') {
  const q = maTran(chu);
  if (!q) return '';
  const L = 4, c = q.n + 2 * L;
  let p = '';
  for (let y = 0; y < q.n; y++) for (let x = 0; x < q.n;) {
    if (!q.o[y][x]) { x++; continue; }
    let x2 = x; while (x2 < q.n && q.o[y][x2]) x2++;
    p += `M${x + L} ${y + L}h${x2 - x}v1h${x - x2}z`;
    x = x2;
  }
  return `<svg viewBox="0 0 ${c} ${c}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" role="img" aria-label="Mã QR"><rect width="${c}" height="${c}" fill="${mauTrang}"/><path d="${p}" fill="${mauDen}"/></svg>`;
}

const API = { maHoa, maTran, svg, bitDinhDang, daThucSinh, maSua, nhan, EXP, BANG };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_MAQR = API;
})(typeof self !== 'undefined' ? self : this);
