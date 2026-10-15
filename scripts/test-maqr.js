/* Kiểm thử mã QR tự vẽ (assets/maqr.js): node scripts/test-maqr.js
   Mã QR hiện ở phòng chờ cờ ba người cho bạn ngồi cạnh quét. Bài này đối chiếu số liệu chuẩn ISO/IEC 18004 (bảng chuỗi
   định dạng mức M, đa thức sinh 10 mã sửa lỗi, ví dụ "HELLO WORLD" 1-M trong bài hướng dẫn QR của Thonky, bảng khối mức
   M), rồi đọc ngược ma trận bằng một bộ đọc viết riêng ở đây theo đúng định nghĩa trong chuẩn: đọc hai bản chuỗi định
   dạng, gỡ mặt nạ (công thức theo hàng i, cột j như chuẩn ghi), đọc zíc zắc, tách khối, soát mã sửa lỗi, giải kiểu byte
   — phải ra đúng chữ ban đầu. Trên trình duyệt đã quét thử bằng BarcodeDetector: ra đúng link mời. */
'use strict';
const Q = require('../assets/maqr.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

console.log('\n— Số liệu chuẩn —');
const DINH_DANG_M = ['101010000010010', '101000100100101', '101111001111100', '101101101001011',
                     '100010111111001', '100000011001110', '100111110010111', '100101010100000'];
ok('chuỗi định dạng mức M, mặt nạ 0–7: đúng bảng trong chuẩn', DINH_DANG_M.every((s, k) => Q.bitDinhDang(k).toString(2).padStart(15, '0') === s));
const mu = (x) => Q.EXP.indexOf(x);
ok('đa thức sinh 10 mã sửa lỗi: α⁰ α²⁵¹ α⁶⁷ α⁴⁶ α⁶¹ α¹¹⁸ α⁷⁰ α⁶⁴ α⁹⁴ α³² α⁴⁵', Q.daThucSinh(10).map(mu).join() === '0,251,67,46,61,118,70,64,94,32,45');
const HW = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
ok('mã sửa lỗi của "HELLO WORLD" 1-M khớp ví dụ chuẩn', Q.maSua(HW, 10).join() === '196,35,39,119,235,215,231,226,93,23', Q.maSua(HW, 10).join());
/* mức M, phiên bản 1–6: [mã sửa lỗi mỗi khối, số khối, mã dữ liệu mỗi khối]; tổng số mã 26, 44, 70, 100, 134, 172 */
const KHOI = [null, [10, 1, 16], [16, 1, 28], [26, 1, 44], [18, 2, 32], [24, 2, 43], [16, 4, 27]], TONG = [0, 26, 44, 70, 100, 134, 172];
ok('bảng khối mức M đúng chuẩn, cộng lại đúng tổng số mã từng phiên bản',
   JSON.stringify(Q.BANG) === JSON.stringify(KHOI) && KHOI.every((k, v) => !k || k[1] * (k[0] + k[2]) === TONG[v]));

/* ---- bộ đọc riêng ---- */
const CANH = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34]];
const MAT_NA = [(i, j) => (i + j) % 2 === 0, (i) => i % 2 === 0, (i, j) => j % 3 === 0, (i, j) => (i + j) % 3 === 0,
  (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0, (i, j) => (i * j) % 2 + (i * j) % 3 === 0,
  (i, j) => ((i * j) % 2 + (i * j) % 3) % 2 === 0, (i, j) => ((i + j) % 2 + (i * j) % 3) % 2 === 0];
function doc(o) {                                  // o[hàng][cột], true là ô đen → { chu, v, mat } hay { loi }
  const n = o.length, v = (n - 17) / 4;
  if (!Number.isInteger(v) || v < 1 || v > 6 || o.some(r => r.length !== n)) return { loi: 'kích thước' };
  const den = (x, y) => (o[y][x] ? 1 : 0);
  /* ô chức năng: ba ô định vị kèm viền trắng, hai đường định thời, ô căn chỉnh, chỗ chuỗi định dạng, ô luôn đen */
  const cn = Array.from({ length: n }, () => new Array(n).fill(false));
  const to = (x0, y0, w, h) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < n && y < n) cn[y][x] = true; };
  to(0, 0, 9, 9); to(n - 8, 0, 8, 9); to(0, n - 8, 9, 8);
  to(6, 0, 1, n); to(0, 6, n, 1);
  for (const a of CANH[v]) for (const b of CANH[v]) if (!cn[b][a]) to(a - 2, b - 2, 5, 5);
  /* ô định vị đúng hình 7×7 (viền đen, vành trắng, lõi 3×3 đen); định thời đen trắng xen kẽ; ô luôn đen */
  const dinhVi = (x0, y0) => { for (let dy = 0; dy < 7; dy++) for (let dx = 0; dx < 7; dx++) { const k = Math.max(Math.abs(dx - 3), Math.abs(dy - 3)); if (den(x0 + dx, y0 + dy) !== (k === 2 ? 0 : 1)) return false; } return true; };
  if (!dinhVi(0, 0) || !dinhVi(n - 7, 0) || !dinhVi(0, n - 7)) return { loi: 'ô định vị' };
  for (let i = 8; i < n - 8; i++) if (den(i, 6) !== (i % 2 ? 0 : 1) || den(6, i) !== (i % 2 ? 0 : 1)) return { loi: 'định thời' };
  if (!den(8, n - 8)) return { loi: 'ô luôn đen' };
  /* hai bản chuỗi định dạng (bit 0 là bit thấp nhất) phải giống nhau và nằm trong bảng mức M */
  let f1 = 0, f2 = 0;
  const p1 = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]];
  const p2 = [...Array(8).keys()].map(i => [n - 1 - i, 8]).concat([...Array(7).keys()].map(i => [8, n - 7 + i]));
  p1.forEach(([x, y], i) => { f1 |= den(x, y) << i; });
  p2.forEach(([x, y], i) => { f2 |= den(x, y) << i; });
  const mat = DINH_DANG_M.indexOf(f1.toString(2).padStart(15, '0'));
  if (f1 !== f2 || mat < 0) return { loi: 'chuỗi định dạng' };
  /* đọc zíc zắc từ góc phải dưới, hai cột một, bỏ cột định thời; gỡ mặt nạ theo công thức trong chuẩn */
  const bit = [];
  let cot = 0;
  for (let phai = n - 1; phai >= 1; phai -= 2, cot++) {
    if (phai === 6) phai = 5;
    const diLen = cot % 2 === 0;
    for (let k = 0; k < n; k++) {
      const y = diLen ? n - 1 - k : k;
      for (const x of [phai, phai - 1]) if (!cn[y][x]) bit.push(den(x, y) ^ (MAT_NA[mat](y, x) ? 1 : 0));
    }
  }
  const [ecc, soKhoi, dKhoi] = KHOI[v], tong = TONG[v];
  if (bit.length !== tong * 8 + (v === 1 ? 0 : 7)) return { loi: `số ô dữ liệu ${bit.length}` };
  const ma = [];
  for (let i = 0; i < tong; i++) ma.push(parseInt(bit.slice(i * 8, i * 8 + 8).join(''), 2));
  /* tách khối: dữ liệu xen kẽ trước, mã sửa lỗi xen kẽ sau; mỗi khối soát lại mã sửa lỗi */
  const khoi = Array.from({ length: soKhoi }, () => ({ d: [], e: [] }));
  let i = 0;
  for (let c = 0; c < dKhoi; c++) for (const k of khoi) k.d.push(ma[i++]);
  for (let c = 0; c < ecc; c++) for (const k of khoi) k.e.push(ma[i++]);
  if (khoi.some(k => Q.maSua(k.d, ecc).join() !== k.e.join())) return { loi: 'mã sửa lỗi' };
  /* kiểu byte: 0100, độ dài 8 bit, rồi từng byte UTF-8 */
  const du = [].concat(...khoi.map(k => k.d)), b = du.map(x => x.toString(2).padStart(8, '0')).join('');
  if (b.slice(0, 4) !== '0100') return { loi: 'kiểu mã hoá' };
  const dai = parseInt(b.slice(4, 12), 2), byte = [];
  for (let k = 0; k < dai; k++) byte.push(parseInt(b.slice(12 + k * 8, 20 + k * 8), 2));
  if (!/^0{0,4}$/.test(b.slice(12 + dai * 8, 16 + dai * 8))) return { loi: 'dấu kết thúc' };
  return { chu: Buffer.from(byte).toString('utf8'), v, mat };
}
/* SVG → ma trận: mỗi đoạn "M x y h w v1 h -w z" là một dải ô đen trên một hàng, chừa lề 4 ô */
function tuSvg(s) {
  const c = +(/viewBox="0 0 (\d+) \1"/.exec(s) || [])[1], n = c - 8;
  if (!(n > 0)) return null;
  const o = Array.from({ length: n }, () => new Array(n).fill(false));
  const d = (/<path d="([^"]*)"/.exec(s) || [])[1] || '';
  for (const m of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)) {
    const x = +m[1] - 4, y = +m[2] - 4, w = +m[3];
    if (w !== +m[4]) return null;
    for (let k = 0; k < w; k++) o[y][x + k] = true;
  }
  return o;
}

console.log('\n— Đọc ngược bằng bộ đọc riêng —');
const LINK = 'https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/?phong=BMVZVJ';
for (const [ten, chu, vMong] of [['link mời trên trang thật (69 ký tự)', LINK, 5], ['link mời lúc chạy thử trên máy (51 ký tự)', 'http://localhost:5179/co-vua-ba-nguoi/?phong=RYXQQE', 4],
  ['một ký tự', 'A', 1], ['chữ có dấu: 36 ký tự mà 49 byte UTF-8, quá 42 nên lên phiên bản 4', 'Cờ vua ba người — mời bạn vào phòng!', 4]]) {
  const q = Q.maTran(chu), r = q ? doc(q.o) : { loi: 'không vẽ được' };
  ok(`${ten}: đọc lại đúng chữ, phiên bản ${vMong}`, r.chu === chu && r.v === vMong && q.v === vMong && r.mat === q.mat, r.loi || `v${r.v} mặt nạ ${r.mat}`);
}
const svg = Q.svg(LINK), tu = tuSvg(svg), q5 = Q.maTran(LINK);
ok('SVG vẽ đúng từng ô của ma trận, lề trắng 4 ô, nền trắng ô đen', !!tu && JSON.stringify(tu) === JSON.stringify(q5.o) && /viewBox="0 0 45 45"/.test(svg) && /fill="#fff"/.test(svg) && /fill="#111"/.test(svg));
/* sát sức chứa: 14, 26, 42, 62, 84, 106 byte (kiểu byte, mức M) — đủ thì giữ phiên bản, thêm một byte thì lên bậc */
const SUC = [0, 14, 26, 42, 62, 84, 106];
let dungBac = true;
for (let v = 1; v <= 6; v++) {
  const vua = 'x'.repeat(SUC[v]), qua = vua + 'x', a = Q.maTran(vua), b = Q.maTran(qua);
  if (!a || a.v !== v || doc(a.o).chu !== vua) dungBac = false;
  if (v < 6 && (!b || b.v !== v + 1 || doc(b.o).chu !== qua)) dungBac = false;
}
ok('vừa khít sức chứa thì giữ phiên bản, thêm một byte thì lên phiên bản kế; quá 106 byte thì thôi không vẽ',
   dungBac && Q.maTran('x'.repeat(107)) === null && Q.svg('x'.repeat(107)) === '');
/* nhiều chữ ngẫu nhiên (mã phòng ngẫu nhiên, độ dài ngẫu nhiên): đọc lại đúng hết, đi qua đủ tám mặt nạ */
let s = 12345;
const ngau = () => (s = (s * 16807) % 2147483647) / 2147483647;
const BANG_MA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', daGap = new Set();
let sai = '';
for (let k = 0; k < 300 && !sai; k++) {
  const ma = Array.from({ length: 6 }, () => BANG_MA[Math.floor(ngau() * 32)]).join('');
  const chu = k % 2 ? `https://thong-diep-thuong-de.vercel.app/co-vua-ba-nguoi/?phong=${ma}` : Array.from({ length: 1 + Math.floor(ngau() * 100) }, () => String.fromCharCode(32 + Math.floor(ngau() * 95))).join('');
  const q = Q.maTran(chu), r = doc(q.o);
  if (r.chu !== chu) sai = `${JSON.stringify(chu)}: ${r.loi || r.chu}`;
  daGap.add(r.mat);
}
ok('300 chữ ngẫu nhiên (link với mã phòng ngẫu nhiên, chữ dài 1–100 ký tự): đọc lại đúng hết, gặp đủ tám mặt nạ', !sai && daGap.size === 8, sai || `${daGap.size} mặt nạ`);
/* phá thử: đảo một ô dữ liệu thì bộ đọc báo sai mã sửa lỗi (bộ đọc không dễ dãi) */
const hong = q5.o.map(r => r.slice());
hong[20][20] = !hong[20][20];
ok('đảo một ô dữ liệu: bộ đọc phát hiện (soát mã sửa lỗi thật sự chạy)', doc(hong).loi === 'mã sửa lỗi', doc(hong).loi);

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
