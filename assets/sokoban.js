/* Đẩy thùng sao — Sokoban, 100 màn.

   Tìm hiểu trước khi làm (người dùng dặn):
   - Luật Sokoban (Hiroyuki Imabayashi, Thinking Rabbit, 1982): người giữ kho đi bốn hướng trên lưới ô vuông; đi vào ô
     có thùng thì đẩy thùng trượt thêm một ô theo hướng đó, nếu ô ấy trống. Không kéo được, không đẩy hai thùng một
     lúc. Mọi thùng nằm trên ô đích là xong màn.
   - Màn ghi theo ký hiệu XSB mà chương trình Sokoban nào cũng đọc được: # tường, khoảng trắng là sàn, . đích, $ thùng,
     * thùng trên đích, @ người, + người đứng trên đích. Lời giải ghi kiểu LURD: chữ thường là đi, chữ hoa là đẩy.
   - Màn của Thinking Rabbit và các bộ nổi tiếng (Microban, Sasquatch của David W. Skinner…) có bản quyền riêng, nên ở
     đây máy TỰ TẠO màn theo phương pháp của Joshua Taylor và Ian Parberry, "Procedural Generation of Sokoban Levels"
     (GAMEON-NA 2011, tr. 5–12): ghép phòng từ 17 mẫu 3×3 trong bài báo, thử các chỗ đặt ổ, rồi chơi NGƯỢC từ lúc mọi
     thùng đã nằm trong ổ — kéo thùng ra — để tìm thế bày cần nhiều "đường đẩy" nhất. Thế nào kéo ra được thì đẩy về
     được, nên màn nào cũng chắc chắn giải được. Bộ tạo: scripts/tao-man-sokoban.js. Màn: assets/mansoko.js.
   - Số lần đẩy ít nhất của mỗi màn do bộ giải ở đây tìm (giaiItDay: duyệt các thế sau mỗi lần đẩy theo Dijkstra, mỗi
     lần đẩy tính một, số bước đi chỉ để phân hoà). Chấm sao theo số lần đẩy, không tính bước chân (người dùng dặn).
   Người dùng chọn: máy tự tạo màn, 3D nhìn nghiêng như Robot thắp sao, robot đẩy thùng sao về ổ cho sáng lên. */
(function () {
'use strict';

const HUONG = [[0, -1], [1, 0], [0, 1], [-1, 0]];                  // lên, phải, xuống, trái (trên bản đồ)
const CHU = 'urdl';                                                  // LURD: chữ thường đi, chữ hoa đẩy

/* ---------- đọc màn XSB ----------
   Trong phòng = các ô đi tới được từ chỗ người đứng mà không qua tường (thùng không chặn). Ngoài phòng không vẽ. */
function docMan(dong) {
  const h = dong.length, w = Math.max(...dong.map(s => s.length)), n = w * h;
  const tuong = new Uint8Array(n), trong = new Uint8Array(n), dich = [], thung = [];
  let nguoi = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const c = dong[y][x] || ' ', i = y * w + x;
    if (c === '#') tuong[i] = 1;
    if (c === '.' || c === '*' || c === '+') dich.push(i);
    if (c === '$' || c === '*') thung.push(i);
    if (c === '@' || c === '+') nguoi = i;
  }
  if (nguoi >= 0) {
    const q = [nguoi]; trong[nguoi] = 1;
    while (q.length) {
      const i = q.pop(), x = i % w, y = (i - x) / w;
      for (const [dx, dy] of HUONG) {
        const nx = x + dx, ny = y + dy, j = ny * w + nx;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || tuong[j] || trong[j]) continue;
        trong[j] = 1; q.push(j);
      }
    }
  }
  return { w, h, tuong, trong, dich, thung, nguoi };
}
/* ghi lại thành XSB (bộ tạo màn, bài kiểm) */
function vietMan(m, thung = m.thung, nguoi = m.nguoi) {
  const coT = new Set(thung), coD = new Set(m.dich), ra = [];
  for (let y = 0; y < m.h; y++) {
    let s = '';
    for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x, t = coT.has(i), d = coD.has(i), p = i === nguoi;
      s += m.tuong[i] ? '#' : p ? (d ? '+' : '@') : t ? (d ? '*' : '$') : d ? '.' : ' ';
    }
    ra.push(s.replace(/\s+$/, ''));
  }
  return ra;
}

/* ---------- đồ thị sàn ----------
   Đánh số lại các ô trong phòng 0..F-1 cho bộ giải. ke[f*4+d]: ô sàn bên cạnh theo hướng d, -1 nếu là tường.
   chet[f] = 1: thùng nằm ở đây thì không bao giờ về ổ được nữa, kể cả khi phòng trống trơn (góc tường, dọc tường không
   có ổ). Tính bằng cách kéo ngược từ mọi ổ: ô nào kéo thùng tới được thì còn sống. */
function chuanBi(m) {
  const n = m.w * m.h, so = new Int32Array(n).fill(-1), san = [];
  for (let i = 0; i < n; i++) if (m.trong[i]) { so[i] = san.length; san.push(i); }
  const F = san.length, ke = new Int32Array(F * 4).fill(-1);
  for (let f = 0; f < F; f++) {
    const i = san[f], x = i % m.w, y = (i - x) / m.w;
    for (let d = 0; d < 4; d++) {
      const nx = x + HUONG[d][0], ny = y + HUONG[d][1];
      if (nx >= 0 && ny >= 0 && nx < m.w && ny < m.h) ke[f * 4 + d] = so[ny * m.w + nx];
    }
  }
  const laDich = new Uint8Array(F);
  for (const i of m.dich) if (so[i] >= 0) laDich[so[i]] = 1;
  /* khoảng cách đẩy ít nhất từ mỗi ô tới ổ gần nhất khi phòng trống; -1: ô chết */
  const xa = new Int32Array(F).fill(-1), q = [];
  for (let f = 0; f < F; f++) if (laDich[f]) { xa[f] = 0; q.push(f); }
  for (let k = 0; k < q.length; k++) {
    const c = q[k];
    for (let d = 0; d < 4; d++) {                                      // kéo thùng từ c sang b: người đứng b, lùi ra sau b
      const b = ke[c * 4 + d];
      if (b < 0 || xa[b] >= 0 || ke[b * 4 + d] < 0) continue;
      xa[b] = xa[c] + 1; q.push(b);
    }
  }
  const chet = new Uint8Array(F);
  for (let f = 0; f < F; f++) chet[f] = xa[f] < 0 ? 1 : 0;
  return { san, so, F, ke, laDich, chet, xa, w: m.w };
}

/* Bốn ô vuông 2×2 quanh ô f: ô nào cũng là tường hoặc thùng thì không thùng nào trong đó nhúc nhích được nữa
   (đẩy ngang cần ô bên cạnh trống, đẩy dọc cũng vậy). Có một thùng trong đó chưa nằm trong ổ là thua. */
function ket2x2(g, coThung, f) {
  const { ke, laDich } = g;
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0]]) {
    const o1 = ke[f * 4 + a], o2 = ke[f * 4 + b];
    let o3 = o1 >= 0 ? ke[o1 * 4 + b] : o2 >= 0 ? ke[o2 * 4 + a] : -2;
    if (o3 === -2) o3 = g.cheo ? g.cheo(f, a, b) : -1;
    const chan = (o) => o < 0 || coThung[o];
    if (!chan(o1) || !chan(o2) || !chan(o3)) continue;
    if (!laDich[f] || (o1 >= 0 && !laDich[o1]) || (o2 >= 0 && !laDich[o2]) || (o3 >= 0 && !laDich[o3])) return true;
  }
  return false;
}
/* ô chéo khi cả hai ô bên cạnh đều là tường: phải nhìn lưới gốc */
function themCheo(g) {
  const w = g.w;
  g.cheo = (f, a, b) => {
    const i = g.san[f] + HUONG[a][0] + HUONG[b][0] + (HUONG[a][1] + HUONG[b][1]) * w;
    return i >= 0 && i < g.so.length ? g.so[i] : -1;
  };
  return g;
}

/* ---------- đống nhị phân nhỏ cho bộ giải ---------- */
function dongMoi() { return { gia: [], id: [] }; }
function dongDay(h, gia, id) {
  let i = h.gia.length; h.gia.push(gia); h.id.push(id);
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (h.gia[p] <= gia) break;
    h.gia[i] = h.gia[p]; h.id[i] = h.id[p]; i = p;
  }
  h.gia[i] = gia; h.id[i] = id;
}
function dongLay(h) {
  const g0 = h.gia[0], i0 = h.id[0], g = h.gia.pop(), id = h.id.pop(), n = h.gia.length;
  if (n) {
    let i = 0;
    for (;;) {
      let c = 2 * i + 1;
      if (c >= n) break;
      if (c + 1 < n && h.gia[c + 1] < h.gia[c]) c++;
      if (h.gia[c] >= g) break;
      h.gia[i] = h.gia[c]; h.id[i] = h.id[c]; i = c;
    }
    h.gia[i] = g; h.id[i] = id;
  }
  return [g0, i0];
}

/* loang từ ô p qua sàn không có thùng; ghi khoảng cách vào kc (dấu tem để khỏi xoá mảng) */
function loang(g, coThung, p, kc, tem, dau, cha) {
  const { ke } = g, q = loang.q || (loang.q = new Int32Array(4096));
  let dauQ = 0, cuoi = 0;
  q[cuoi++] = p; tem[p] = dau; kc[p] = 0; if (cha) cha[p] = -1;
  let nho = p;
  while (dauQ < cuoi) {
    const c = q[dauQ++];
    if (c < nho) nho = c;
    for (let d = 0; d < 4; d++) {
      const o = ke[c * 4 + d];
      if (o < 0 || coThung[o] || tem[o] === dau) continue;
      tem[o] = dau; kc[o] = kc[c] + 1; if (cha) cha[o] = c * 4 + d; q[cuoi++] = o;
    }
  }
  return nho;                                                         // ô nhỏ nhất vùng: đại diện cho cả vùng người đi được
}

/* ---------- bộ giải ----------
   Thế = vị trí các thùng + chỗ người đứng sau lần đẩy vừa rồi. Từ một thế: loang tìm khoảng cách tới mọi ô, rồi thử
   đẩy từng thùng theo từng hướng. Dijkstra trên chi phí ghép hai số:
   - giaiItDay (chấm sao dùng cái này — người dùng: "tính sao bằng bước đẩy thùng, ai lại tính bước chân"): mỗi lần đẩy
     tính trước, số bước đi chỉ để phân hoà → lời giải ít lần đẩy nhất, trong đó ít bước nhất;
   - giaiItBuoc: số bước đi trước, rồi tới số lần đẩy → lời giải ít bước nhất.
   Thế đích lấy ra đầu tiên là lời giải tốt nhất theo cách tính đó. Bỏ qua thế có thùng ở ô chết hay kẹt 2×2 (không bao
   giờ giải được nên không làm sai kết quả). trả { loiGiai, buoc, day, the } hoặc null. */
const giaiItBuoc = (m, gioiHan) => giai(m, false, gioiHan);
const giaiItDay = (m, gioiHan) => giai(m, true, gioiHan);
function giai(m, theoDay, gioiHan = 6e6) {
  const g = themCheo(chuanBi(m)), { F, ke, laDich, chet } = g, K = m.thung.length;
  if (m.thung.some(i => g.so[i] < 0) || g.so[m.nguoi] < 0) return null;
  const ma = (bs, p) => { let v = 0; for (let i = 0; i < K; i++) v = v * F + bs[i]; return v * F + p; };
  const giaiMa = (v, bs) => { const p = v % F; v = (v - p) / F; for (let i = K - 1; i >= 0; i--) { bs[i] = v % F; v = (v - bs[i]) / F; } return p; };
  const ids = new Map(), khoa = [], cha = [], cach = [], gia = [];
  const them = (k, c, ch, ca) => { const id = khoa.length; ids.set(k, id); khoa.push(k); gia.push(c); cha.push(ch); cach.push(ca); return id; };
  const bs0 = m.thung.map(i => g.so[i]).sort((a, b) => a - b);
  const dong = dongMoi(), BAC = 1024, DAY = 65536;             // ít bước: bước·1024 + lần đẩy; ít lần đẩy: lần đẩy·65536 + bước
  dongDay(dong, 0, them(ma(bs0, g.so[m.nguoi]), 0, -1, -1));
  const bs = new Int32Array(K), coThung = new Uint8Array(F), kc = new Int32Array(F), tem = new Int32Array(F);
  let dau = 0, xet = 0;
  while (dong.gia.length) {
    const [c, id] = dongLay(dong);
    if (c > gia[id]) continue;
    if (++xet > gioiHan) return null;
    const p = giaiMa(khoa[id], bs);
    let xong = true;
    for (let i = 0; i < K; i++) if (!laDich[bs[i]]) { xong = false; break; }
    if (xong) return dungLoiGiai(m, g, khoa, cha, cach, id, ids.size);
    coThung.fill(0); for (let i = 0; i < K; i++) coThung[bs[i]] = 1;
    loang(g, coThung, p, kc, tem, ++dau);
    for (let i = 0; i < K; i++) {
      const b = bs[i];
      for (let d = 0; d < 4; d++) {
        const sau = ke[b * 4 + ((d + 2) & 3)], toi = ke[b * 4 + d];
        if (sau < 0 || toi < 0 || tem[sau] !== dau || coThung[toi] || chet[toi]) continue;
        coThung[b] = 0; coThung[toi] = 1;
        const ket = ket2x2(g, coThung, toi);
        coThung[toi] = 0; coThung[b] = 1;
        if (ket) continue;
        const moi = Array.from(bs); moi[i] = toi; moi.sort((a, b2) => a - b2);
        const k = ma(moi, b), c2 = theoDay ? c + DAY + kc[sau] + 1 : c + (kc[sau] + 1) * BAC + 1, cu = ids.get(k);
        if (cu === undefined) dongDay(dong, c2, them(k, c2, id, b * 4 + d));
        else if (c2 < gia[cu]) { gia[cu] = c2; cha[cu] = id; cach[cu] = b * 4 + d; dongDay(dong, c2, cu); }
      }
    }
  }
  return null;
}
/* dựng chuỗi LURD: đi lại từ đầu, mỗi lần đẩy thì tìm đường ngắn nhất tới sau thùng (cùng cách loang) rồi đẩy */
function dungLoiGiai(m, g, khoa, cha, cach, id, the) {
  const day = [];
  for (let i = id; cha[i] >= 0; i = cha[i]) day.push(cach[i]);
  day.reverse();
  const { F, ke } = g, coThung = new Uint8Array(F), kc = new Int32Array(F), tem = new Int32Array(F), ch = new Int32Array(F);
  for (const i of m.thung) coThung[g.so[i]] = 1;
  let p = g.so[m.nguoi], s = '';
  day.forEach((x, k) => {
    const b = x >> 2, d = x & 3, sau = ke[b * 4 + ((d + 2) & 3)];
    loang(g, coThung, p, kc, tem, k + 1, ch);
    let duong = '';
    for (let o = sau; ch[o] >= 0; o = ch[o] >> 2) duong = CHU[ch[o] & 3] + duong;
    s += duong + CHU[d].toUpperCase();
    coThung[b] = 0; coThung[ke[b * 4 + d]] = 1; p = b;
  });
  return { loiGiai: s, buoc: s.length, day: day.length, the };
}

/* ---------- chơi ----------
   the: { p: ô người, thung: [ô của từng thùng], co: Int16Array ô → số thùng (-1 trống) }. Thùng giữ số riêng để vẽ
   đúng thùng nào đang trượt. */
function theMoi(m) {
  const co = new Int16Array(m.w * m.h).fill(-1);
  m.thung.forEach((o, k) => { co[o] = k; });
  return { p: m.nguoi, thung: m.thung.slice(), co };
}
function buocToi(m, o, d) {
  const x = o % m.w + HUONG[d][0], y = (o - o % m.w) / m.w + HUONG[d][1];
  return x < 0 || y < 0 || x >= m.w || y >= m.h ? -1 : y * m.w + x;
}
/* đi một bước theo hướng d. trả null nếu không đi được, không thì { tu, toi, thung: số thùng bị đẩy hay -1 } */
function di(m, the, d) {
  const toi = buocToi(m, the.p, d);
  if (toi < 0 || !m.trong[toi]) return null;
  const k = the.co[toi];
  if (k >= 0) {
    const sau = buocToi(m, toi, d);
    if (sau < 0 || !m.trong[sau] || the.co[sau] >= 0) return null;
    the.co[toi] = -1; the.co[sau] = k; the.thung[k] = sau;
  }
  const tu = the.p; the.p = toi;
  return { tu, toi, d, thung: k };
}
function luiLai(m, the, b) {                                          // hoàn tác một bước đã đi
  if (b.thung >= 0) {
    const o = the.thung[b.thung];
    the.co[o] = -1; the.co[b.toi] = b.thung; the.thung[b.thung] = b.toi;
  }
  the.p = b.tu;
}
const xongMan = (m, the) => the.thung.every(o => m.dich.includes(o));
/* chơi lại một chuỗi LURD: chữ hoa phải đẩy thật, chữ thường phải không đẩy */
function choiLai(m, s) {
  const the = theMoi(m);
  let day = 0;
  for (let i = 0; i < s.length; i++) {
    const d = CHU.indexOf(s[i].toLowerCase());
    const b = d < 0 ? null : di(m, the, d);
    if (!b || (b.thung >= 0) !== (s[i] !== s[i].toLowerCase())) return { loi: i, the };
    if (b.thung >= 0) day++;
  }
  return { xong: xongMan(m, the), buoc: s.length, day, the };
}
/* đường đi ngắn nhất (không đẩy) từ chỗ người tới ô o; trả mảng hướng, null nếu không tới được */
function duongToi(m, the, o) {
  if (!m.trong[o] || the.co[o] >= 0) return null;
  const cha = new Int32Array(m.w * m.h).fill(-2), q = [the.p];
  cha[the.p] = -1;
  for (let k = 0; k < q.length; k++) {
    const c = q[k];
    if (c === o) break;
    for (let d = 0; d < 4; d++) {
      const t = buocToi(m, c, d);
      if (t < 0 || !m.trong[t] || the.co[t] >= 0 || cha[t] !== -2) continue;
      cha[t] = c * 4 + d; q.push(t);
    }
  }
  if (cha[o] === -2) return null;
  const ra = [];
  for (let c = o; cha[c] >= 0; c = cha[c] >> 2) ra.push(cha[c] & 3);
  return ra.reverse();
}
/* thùng k vừa bị đẩy có kẹt hẳn không: ở ô chết, hay kẹt 2×2 */
function thungKet(m, g, the, k) {
  const f = g.so[the.thung[k]];
  if (g.chet[f]) return true;
  const coThung = new Uint8Array(g.F);
  for (const o of the.thung) coThung[g.so[o]] = 1;
  return ket2x2(g, coThung, f);
}

/* ======================================================================================================
   Giao diện. Màn ở assets/mansoko.js: { m: XSB nối bằng "|", k: số thùng, day: số lần đẩy ít nhất, giai: lời giải LURD }.
   ====================================================================================================== */
const S = { HUONG, CHU, docMan, chuanBi, themCheo, theMoi, di, luiLai, xongMan, duongToi, thungKet, buocToi };
const MAN = self.TDTD_MANSOKO || [];
const TEN_CHUONG = { 1: 'Một thùng — làm quen', 2: 'Hai thùng', 3: 'Ba thùng', 4: 'Bốn thùng', 5: 'Năm thùng', 6: 'Sáu thùng' };
const CHUONG = [];
MAN.forEach((m, i) => {
  const c = CHUONG[CHUONG.length - 1];
  if (c && c.k === m.k) c.den = i; else CHUONG.push({ k: m.k, tu: i, den: i });
});
const chuongCua = (i) => CHUONG.findIndex(c => i >= c.tu && i <= c.den);

/* Lưu đúng một mục: số sao từng màn (chuỗi 0–3), màn đang chơi, đã xem cách chơi chưa. Không lưu nước đi. */
const KHOA = 'tdtd.soko';
const docLuu = () => { try { const o = JSON.parse(localStorage.getItem(KHOA) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const ghiLuu = (them) => { try { localStorage.setItem(KHOA, JSON.stringify(Object.assign(docLuu(), them))); } catch (e) {} };
const saoCua = () => String(docLuu().s || '').replace(/[^0-3]/g, '0').padEnd(MAN.length, '0').slice(0, MAN.length);
function ghiSao(i, n) { const s = saoCua().split(''); if (n > +s[i]) { s[i] = String(n); ghiLuu({ s: s.join('') }); } }
/* Chấm sao theo số lần đẩy (người dùng: "tính sao bằng bước đẩy thùng đi, ai lại tính bước chân"): đẩy đúng số lần ít
   nhất bộ giải tìm được → 3 sao; dư không quá một phần tư → 2 sao; dư hơn → 1 sao. Đi bao nhiêu bước cũng được. Xong
   màn là có ít nhất 1 sao. */
const soSao = (day, itNhat) => day <= itNhat ? 3 : day <= itNhat + Math.ceil(itNhat / 4) ? 2 : 1;
const manMo = () => { const b = docLuu().b; return Number.isInteger(b) && b >= 0 && b < MAN.length ? b : Math.max(0, saoCua().indexOf('0')); };
let cheDoThu = typeof location !== 'undefined' && /[?&]mohet\b/i.test(location.search || '');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let tam = null, cv = null, ctx = null, W = 360, H = 420, DPR = 1, raf = 0;
let so = 0, M = null, G = null, the = null, lichSu = [], truocLamLai = null;
let dang = null, hang = [], huong = 2, thang = false, maMan = 0;
let ket = new Set(), sang = [], sangLuc = [], oVe = [], xemGiai = false;
let goc = 0, gocDen = 0;

/* ---------- vẽ cảnh 3D nhìn nghiêng ----------
   Cùng kiểu với Robot thắp sao (đá xanh lơ lửng giữa trời sao, robot ấy) nhưng nhìn từ cao hơn và THẲNG theo lưới: hàng
   ô nằm ngang, cột ô đứng dọc trên màn hình, chỉ thấy mặt trên và mặt trước của khối. Bản đầu xoay lệch 18° cho thấy cả
   mặt bên — người dùng: "làm cho map thẳng đi, nó bị xéo qua một góc người dùng khó chịu". Sokoban phải thấy rõ từng ô,
   và bấm ▲ thì robot đi lên trên màn chứ không đi chéo. Xoay được 90° một lần, xoay xong vẫn thẳng. */
/* Nhìn thẳng thì khối ở hàng dưới che phần ô ngay sau nó: bản đầu (tường cao .56, nén .74/.62) che gần nửa ô — ổ sát
   tường dưới bị khuất một nửa. Nhìn cao hơn (nén chiều sâu ít hơn, chiều cao nhiều hơn) và tường thấp hơn chút: che
   chừng một phần ba ô, ổ và thùng sau tường vẫn nhìn rõ. */
const KY = .8, KZ = .52;                       // nén chiều sâu, chiều cao
const ZT = .5, DAY_T = -.3;                    // tường: mặt trên, đáy (lơ lửng như các khối đá của Robot thắp sao)
const RT = .36, ZTH = .58;                     // thùng: nửa cạnh, cao
let toa = { cx: 0, cy: 0, s: 40, tx: 0, ty: 0 };
function chieu(x, y, z) {
  const dx = x - toa.tx, dy = y - toa.ty, c = Math.cos(goc), s = Math.sin(goc);
  const X = dx * c - dy * s, Y = dx * s + dy * c;
  return { x: toa.cx + X * toa.s, y: toa.cy + Y * toa.s * KY - z * toa.s * KZ, d: Y };
}
const toaDo = (o) => ({ x: o % M.w, y: (o - o % M.w) / M.w });
function khungCanh(g) {                        // khung bao của cả màn ở góc g, cỡ 1
  const giu = goc; goc = g;
  const t0 = Object.assign({}, toa);
  toa.tx = (M.w - 1) / 2; toa.ty = (M.h - 1) / 2; toa.s = 1; toa.cx = 0; toa.cy = 0;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const c of oVe) for (const [a, b] of [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]]) for (const z of [DAY_T, c.tuong ? ZT : 0]) {
    const p = chieu(c.x + a, c.y + b, z);
    if (p.x < x0) x0 = p.x; if (p.x > x1) x1 = p.x; if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y;
  }
  goc = giu; Object.assign(toa, t0);
  return { x0, x1, y0, y1 };
}
const TREN = 46, DUOI = 54;                    // chừa chỗ cho dòng chữ trên cảnh và hàng nút dưới cảnh
function coCanh(k) { return Math.min((W - 20) / (k.x1 - k.x0), (H - TREN - DUOI) / (k.y1 - k.y0), 74); }
function canhKhung() {
  const k = khungCanh(goc), s = coCanh(k);
  toa.tx = (M.w - 1) / 2; toa.ty = (M.h - 1) / 2;
  toa.s = s; toa.cx = W / 2 - (k.x0 + k.x1) / 2 * s; toa.cy = (TREN + H - DUOI) / 2 - (k.y0 + k.y1) / 2 * s;
}
/* góc nhìn mặc định: trong bốn góc (cách nhau 90°), góc cho ô to nhất — màn bề ngang thì nằm ngang trên màn hình */
function gocTot() {
  let tot = 0, co = 0;
  for (let k = 0; k < 4; k++) { const g = k * Math.PI / 2, s = coCanh(khungCanh(g)); if (s > co * 1.04) { co = s; tot = g; } }
  return tot;
}
/* hướng trên màn hình (0 lên, 1 phải, 2 xuống, 3 trái) → hướng trên bản đồ đang hiện gần nhất với nó */
function huongTheoMan(sd) {
  const muc = [[0, -1], [1, 0], [0, 1], [-1, 0]][sd], c = Math.cos(gocDen), s = Math.sin(gocDen);
  let tot = 0, max = -Infinity;
  for (let d = 0; d < 4; d++) {
    const [dx, dy] = S.HUONG[d], X = dx * c - dy * s, Y = (dx * s + dy * c) * KY, n = Math.hypot(X, Y);
    const tich = (X * muc[0] + Y * muc[1]) / n;
    if (tich > max) { max = tich; tot = d; }
  }
  return tot;
}

function da(p) { ctx.beginPath(); ctx.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) ctx.lineTo(p[i].x, p[i].y); ctx.closePath(); }
const tron = (a, b, t) => a + (b - a) * t;
function veNen() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d0b22'); g.addColorStop(1, '#1b1840');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(230,236,255,.55)';
  for (let k = 0; k < 60; k++) { const x = (k * 97.13) % W, y = (k * 53.71) % H, r = k % 7 ? .7 : 1.3; ctx.fillRect(x, y, r, r); }
}
/* ngôi sao nằm trên mặt phẳng z, đỉnh luôn chĩa lên trên màn dù xoay cảnh thế nào */
function saoPhang(x, y, z, R, r) {
  const a0 = Math.atan2(-Math.cos(goc), -Math.sin(goc)), p = [];
  for (let k = 0; k < 10; k++) { const a = a0 + k * Math.PI / 5, q = k % 2 ? r : R; p.push(chieu(x + Math.cos(a) * q, y + Math.sin(a) * q, z)); }
  da(p);
}
function veSan(c) {
  const r = .5, p = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([a, b]) => chieu(c.x + a, c.y + b, 0));
  da(p);
  ctx.fillStyle = (c.x + c.y) % 2 ? '#2b3466' : '#262e5c'; ctx.fill();
  ctx.strokeStyle = 'rgba(170,190,255,.13)'; ctx.lineWidth = 1; ctx.stroke();
}
/* ổ sao: vòng vàng khắc trên sàn, giữa có hình ngôi sao mờ; nhấp nháy nhẹ cho dễ thấy chỗ cần đẩy thùng tới */
function veO(c, t) {
  const vong = [];
  for (let k = 0; k < 24; k++) { const a = k / 24 * 6.2832; vong.push(chieu(c.x + Math.cos(a) * .32, c.y + Math.sin(a) * .32, .002)); }
  da(vong); ctx.fillStyle = 'rgba(8,10,32,.55)'; ctx.fill();
  const nhip = .5 + .3 * Math.sin(t / 520 + c.x * 1.7 + c.y);
  ctx.strokeStyle = `rgba(255,214,120,${nhip.toFixed(3)})`; ctx.lineWidth = Math.max(1.3, toa.s * .04); ctx.stroke();
  saoPhang(c.x, c.y, .003, .18, .08);
  ctx.fillStyle = 'rgba(255,214,120,.16)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,226,150,.6)'; ctx.lineWidth = Math.max(1, toa.s * .025); ctx.stroke();
}
function mauDa(sang) { return `rgb(${Math.round(122 * sang)},${Math.round(142 * sang)},${Math.round(222 * sang)})`; }
const MAT = [[0, -1, 0, 1], [1, 0, 1, 2], [0, 1, 2, 3], [-1, 0, 3, 0]];  // pháp tuyến, hai góc của mặt bên
function laTuong(x, y) { return x >= 0 && y >= 0 && x < M.w && y < M.h && !!M.tuong[y * M.w + x]; }
function laTrong(x, y) { return x >= 0 && y >= 0 && x < M.w && y < M.h && !!M.trong[y * M.w + x]; }
function veTuong(c) {
  const r = .5, c4 = [[-r, -r], [r, -r], [r, r], [-r, r]];
  const tren = c4.map(([a, b]) => chieu(c.x + a, c.y + b, ZT));
  const sn = Math.sin(goc), cs = Math.cos(goc);
  for (const [nx, ny, a, b] of MAT) {
    if (nx * sn + ny * cs <= .01 || laTuong(c.x + nx, c.y + ny)) continue;
    /* mặt nhìn vào sàn chỉ lộ từ mặt sàn trở lên; mặt nhìn ra ngoài thì lộ tới đáy */
    const zd = laTrong(c.x + nx, c.y + ny) ? 0 : DAY_T;
    const da0 = chieu(c.x + c4[a][0], c.y + c4[a][1], zd), da1 = chieu(c.x + c4[b][0], c.y + c4[b][1], zd);
    da([tren[a], tren[b], da1, da0]);
    const anh = .52 + .3 * Math.max(0, -nx * .6 - ny * .8 + .4) + .12 * (nx * cs - ny * sn > 0 ? 1 : 0);   // nắng từ tây bắc
    const g = ctx.createLinearGradient(0, tren[a].y, 0, da0.y);
    g.addColorStop(0, mauDa(anh)); g.addColorStop(1, mauDa(anh * .62));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1; ctx.stroke();
  }
  da(tren);
  const g = ctx.createLinearGradient(tren[0].x, tren[0].y, tren[2].x, tren[2].y);
  g.addColorStop(0, mauDa(1.16)); g.addColorStop(1, mauDa(.94));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(220,230,255,.3)'; ctx.lineWidth = 1.1; ctx.stroke();
}
/* thùng sao: hộp gỗ, mặt trên vẽ ngôi sao. Vào ổ thì sao sáng vàng, thùng ửng lên, có quầng sáng. Kẹt thì đỏ. */
function mauThung(sang, ket, k) {
  const a = ket ? [178, 74, 64] : [tron(150, 206, sang), tron(102, 140, sang), tron(56, 58, sang)];
  return `rgb(${Math.round(a[0] * k)},${Math.round(a[1] * k)},${Math.round(a[2] * k)})`;
}
function veThung(x, y, sang, ket, t, no) {
  const r = RT, c4 = [[-r, -r], [r, -r], [r, r], [-r, r]];
  const tren = c4.map(([a, b]) => chieu(x + a, y + b, ZTH)), duoi = c4.map(([a, b]) => chieu(x + a, y + b, 0));
  const s = toa.s;
  const bong = [[-r, -r], [r, -r], [r, r], [-r, r]].map(([a, b]) => chieu(x + a * 1.12 + .07, y + b * 1.12 + .07, .001));
  da(bong); ctx.fillStyle = 'rgba(0,0,12,.3)'; ctx.fill();               // bóng đổ về phía đông nam (nắng từ tây bắc)
  if (sang > .02) {                                                    // quầng sáng quanh thùng đã vào ổ
    const p = chieu(x, y, ZTH * .6), R = s * (.85 + .08 * Math.sin(t / 380 + x) + no * .5);
    const h = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, R);
    h.addColorStop(0, `rgba(255,214,110,${(.34 * sang).toFixed(3)})`); h.addColorStop(1, 'rgba(255,200,90,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, 6.2832); ctx.fill();
  }
  const sn = Math.sin(goc), cs = Math.cos(goc);
  for (const [nx, ny, a, b] of MAT) {
    if (nx * sn + ny * cs <= .01) continue;
    da([tren[a], tren[b], duoi[b], duoi[a]]);
    const anh = .62 + .25 * Math.max(0, -nx * .6 - ny * .8 + .4) + .1 * (nx * cs - ny * sn > 0 ? 1 : 0);
    const g = ctx.createLinearGradient(0, tren[a].y, 0, duoi[a].y);
    g.addColorStop(0, mauThung(sang, ket, anh)); g.addColorStop(1, mauThung(sang, ket, anh * .7));
    ctx.fillStyle = g; ctx.fill();
    /* khung ván gỗ */
    const vao = (p, q, k) => ({ x: tron(p.x, q.x, k), y: tron(p.y, q.y, k) });
    const A = tren[a], B = tren[b], C = duoi[b], D = duoi[a], e = .16;
    const q = [vao(vao(A, B, e), vao(D, C, e), e), vao(vao(A, B, 1 - e), vao(D, C, 1 - e), e), vao(vao(A, B, 1 - e), vao(D, C, 1 - e), 1 - e), vao(vao(A, B, e), vao(D, C, e), 1 - e)];
    da(q); ctx.strokeStyle = ket ? 'rgba(255,200,190,.35)' : `rgba(255,236,190,${(.22 + .2 * sang).toFixed(3)})`; ctx.lineWidth = Math.max(1, s * .022); ctx.stroke();
  }
  da(tren);
  const g = ctx.createLinearGradient(tren[0].x, tren[0].y, tren[2].x, tren[2].y);
  g.addColorStop(0, mauThung(sang, ket, 1.15)); g.addColorStop(1, mauThung(sang, ket, .96));
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = ket ? 'rgba(255,170,160,.7)' : 'rgba(255,240,205,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
  /* ngôi sao trên nắp */
  const R = .2 * (1 + no * .35);
  if (sang > .5) {
    const p = chieu(x, y, ZTH);
    const h = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s * .42);
    h.addColorStop(0, 'rgba(255,240,170,.75)'); h.addColorStop(1, 'rgba(255,210,100,0)');
    ctx.fillStyle = h; ctx.beginPath(); ctx.arc(p.x, p.y, s * .42, 0, 6.2832); ctx.fill();
    saoPhang(x, y, ZTH + .002, R * 1.12, R * .5);
    const gs = ctx.createLinearGradient(p.x, p.y - s * .2, p.x, p.y + s * .2);
    gs.addColorStop(0, '#ffffff'); gs.addColorStop(.55, '#fff2a8'); gs.addColorStop(1, '#ffd34d');
    ctx.fillStyle = gs; ctx.fill();
    ctx.strokeStyle = 'rgba(150,84,12,.85)'; ctx.lineWidth = Math.max(1, s * .022); ctx.stroke();
  } else {
    saoPhang(x, y, ZTH + .002, R, R * .44);
    ctx.fillStyle = ket ? 'rgba(255,190,180,.3)' : 'rgba(255,236,190,.28)'; ctx.fill();
    ctx.strokeStyle = ket ? 'rgba(255,210,200,.7)' : 'rgba(255,240,205,.7)'; ctx.lineWidth = Math.max(1, s * .024); ctx.stroke();
  }
}
/* robot của Robot thắp sao: thân tròn bóng, đầu có kính, mắt nhìn theo hướng đi; quay lưng thì không thấy mắt */
function veRobot(r, t) {
  const p = chieu(r.x, r.y, 0), s = toa.s, fx = Math.cos(r.hg), fy = Math.sin(r.hg);
  const tr = chieu(r.x + fx * .3, r.y + fy * .3, 0), vx = (tr.x - p.x) / s, vy = (tr.y - p.y) / s;
  const nhin = Math.max(-1, Math.min(1, fx * Math.sin(goc) + fy * Math.cos(goc)));
  const nay = Math.abs(Math.sin(t / 260)) * s * .02 * (r.dang ? 1 : .4);
  ctx.fillStyle = 'rgba(0,0,10,.35)'; ctx.beginPath(); ctx.ellipse(p.x, p.y, s * .26, s * .13, 0, 0, 6.2832); ctx.fill();
  const bx = p.x, by = p.y - s * .3 - nay;
  ctx.fillStyle = '#2b3150';
  ctx.beginPath(); ctx.ellipse(bx - s * .12, p.y - s * .04, s * .06, s * .04, 0, 0, 6.2832); ctx.ellipse(bx + s * .12, p.y - s * .04, s * .06, s * .04, 0, 0, 6.2832); ctx.fill();
  const than = ctx.createRadialGradient(bx - s * .08, by - s * .1, s * .02, bx, by, s * .3);
  than.addColorStop(0, '#ffffff'); than.addColorStop(.45, '#cfdcf5'); than.addColorStop(1, '#6f82b8');
  ctx.fillStyle = than; ctx.beginPath(); ctx.ellipse(bx, by, s * .23, s * .25, 0, 0, 6.2832); ctx.fill();
  const hx = bx, hy = by - s * .32;
  ctx.strokeStyle = '#9fb0dc'; ctx.lineWidth = Math.max(1.5, s * .025);
  ctx.beginPath(); ctx.moveTo(hx, hy - s * .13); ctx.lineTo(hx + vx * s * .06, hy - s * .28); ctx.stroke();
  const dau = ctx.createRadialGradient(hx + vx * s * .06, hy - s * .29, 0, hx + vx * s * .06, hy - s * .29, s * .07);
  dau.addColorStop(0, '#ffd36e'); dau.addColorStop(1, 'rgba(255,180,80,.2)');
  ctx.fillStyle = dau; ctx.beginPath(); ctx.arc(hx + vx * s * .06, hy - s * .29, s * .07, 0, 6.2832); ctx.fill();
  const dg = ctx.createRadialGradient(hx - s * .06, hy - s * .06, s * .02, hx, hy, s * .2);
  dg.addColorStop(0, '#ffffff'); dg.addColorStop(.5, '#dbe5fa'); dg.addColorStop(1, '#7d90c4');
  ctx.fillStyle = dg; ctx.beginPath(); ctx.ellipse(hx, hy, s * .19, s * .16, 0, 0, 6.2832); ctx.fill();
  if (nhin > -.35) {
    const kx = hx + vx * s * .3 * (1 - nhin * .3), ky = hy + vy * s * .2 + s * .01, kr = s * .13 * (.55 + .45 * Math.max(0, nhin));
    ctx.fillStyle = '#1b2240'; ctx.beginPath(); ctx.ellipse(kx, ky, kr, s * .085, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#7ff0ff';
    const cach = kr * .45;
    ctx.beginPath(); ctx.ellipse(kx - cach, ky, s * .026, s * .034, 0, 0, 6.2832); ctx.ellipse(kx + cach, ky, s * .026, s * .034, 0, 0, 6.2832); ctx.fill();
  }
  if (r.sai > .05) {                                                     // đâm vào tường, thùng không đẩy được: "!" đỏ
    const ex = hx + s * .25, ey = hy - s * .34, R = s * .12 * (.7 + .3 * r.sai);
    ctx.globalAlpha = Math.min(1, r.sai * 1.6);
    ctx.fillStyle = '#ff5a4f'; ctx.beginPath(); ctx.arc(ex, ey, R, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${Math.round(R * 1.5)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('!', ex, ey + R * .05);
    ctx.globalAlpha = 1;
  }
}
function veCanh(t) {
  if (!ctx || !M) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  veNen();
  canhKhung();
  const v = viTri(t);
  for (const c of oVe) if (!c.tuong) { veSan(c); if (c.dich) veO(c, t); }
  const ds = [];
  for (const c of oVe) if (c.tuong) ds.push({ d: chieu(c.x, c.y, 0).d, loai: 0, c });
  v.thung.forEach((p, k) => ds.push({ d: chieu(p.x, p.y, 0).d, loai: 1, p, k }));
  ds.push({ d: chieu(v.robot.x, v.robot.y, 0).d, loai: 2 });
  ds.sort((a, b) => a.d - b.d || a.loai - b.loai);
  for (const o of ds) {
    if (o.loai === 0) veTuong(o.c);
    else if (o.loai === 1) {
      const no = sangLuc[o.k] ? Math.max(0, 1 - (t - sangLuc[o.k]) / 600) : 0;
      veThung(o.p.x, o.p.y, sang[o.k], ket.has(o.k), t, t >= (sangLuc[o.k] || 0) ? no : 0);
    } else veRobot(v.robot, t);
  }
}

/* ---------- chuyển động ----------
   Thế (the) đổi ngay khi bấm; hình chỉ trượt theo cho mượt. Bấm nhanh hơn hình chạy thì nước sau xếp hàng chờ. */
function viTri(t) {
  const b = dang, p = b ? Math.min(1, (t - b.t0) / b.lau) : 1, em = p * p * (3 - 2 * p);
  const hg = (d) => Math.atan2(S.HUONG[d][1], S.HUONG[d][0]);
  const thung = the.thung.map(o => toaDo(o));
  const rb = toaDo(the.p);
  const robot = { x: rb.x, y: rb.y, hg: hg(huong), dang: !!b };
  if (!b) return { robot, thung };
  if (b.kieu === 'vuong') {                                            // không đi được: nhích tới rồi lùi lại
    const k = Math.sin(p * Math.PI) * .14;
    robot.x += S.HUONG[b.d][0] * k; robot.y += S.HUONG[b.d][1] * k; robot.sai = Math.sin(p * Math.PI);
    return { robot, thung };
  }
  const tu = toaDo(b.b.tu), toi = toaDo(b.b.toi), lui = b.kieu === 'lui';
  const a = lui ? toi : tu, c = lui ? tu : toi;                        // hoàn tác: chạy ngược
  robot.x = tron(a.x, c.x, em); robot.y = tron(a.y, c.y, em);
  if (b.b.thung >= 0) {
    const [dx, dy] = S.HUONG[b.b.d], k = b.b.thung;
    const t0 = lui ? { x: toi.x + dx, y: toi.y + dy } : toi, t1 = lui ? toi : { x: toi.x + dx, y: toi.y + dy };
    thung[k] = { x: tron(t0.x, t1.x, em), y: tron(t0.y, t1.y, em) };
  }
  return { robot, thung };
}
const bay = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
/* Pin, giật ("sao mở app nhanh hết pin", "sửa hết lag"): vẽ lại cả màn mỗi khung hình — máy 120 Hz là 120 lần mỗi
   giây — kể cả lúc không có gì đổi là thứ ngốn pin nhất. Đang chạm, vừa chạm hay bấm phím trong 3 giây, hay có gì
   đang chạy thì vẽ tối đa 60 lần mỗi giây; bàn đứng yên thì 4 lần — thứ đổi không qua tay mình (máy, bạn qua mạng) vẫn hiện, chậm nhất một phần tư giây. */
const NGHI_MS = 3000, NHIP_NGHI = 250;
let veLuc = -1e9, thucLuc = -1e9, moiThuc = false, dangCham = false, henNghi = 0, nhipVe = 15;
function chayDuoc() { return !!(tam && tam.classList.contains('hien')); }
function danhThuc(e) {
  if (e && e.type === 'pointerdown') dangCham = true;
  else if (e && (e.type === 'pointerup' || e.type === 'pointercancel')) dangCham = false;
  moiThuc = true; nhipVe = 15;
  if (henNghi) { clearTimeout(henNghi); henNghi = 0; }
  if (!raf && chayDuoc()) raf = requestAnimationFrame(vong);
}
function boKhung(t) {                                   // chưa tới nhịp vẽ: hẹn khung sau, khỏi vẽ
  if (t - veLuc >= nhipVe - 1) { veLuc = t; return false; }
  raf = requestAnimationFrame(vong);
  return true;
}
function henVe(t, muc) {                                // muc 2: có gì đang chạy; 0: đứng yên
  if (muc === 2 || moiThuc || dangCham) { moiThuc = false; thucLuc = t; }
  if (t - thucLuc < NGHI_MS) nhipVe = 15;
  else {
    if (!henNghi) henNghi = setTimeout(() => { henNghi = 0; if (!raf && chayDuoc()) raf = requestAnimationFrame(vong); }, NHIP_NGHI);
    return;
  }
  raf = requestAnimationFrame(vong);
}
function vong(t) {
  raf = 0;
  if (!tam || !tam.classList.contains('hien') || boKhung(t)) return;
  if (Math.abs(gocDen - goc) > .001) goc += (gocDen - goc) * .2; else goc = gocDen;
  if (dang && t - dang.t0 >= dang.lau) dang = null;
  if (!dang && hang.length && !thang) thucHien(hang.shift(), t, hang.length > 0);
  if (the) the.thung.forEach((o, k) => { const muc = M.dich.includes(o) ? 1 : 0; sang[k] += (muc - sang[k]) * .14; });
  veCanh(t);
  henVe(t, dang || (hang.length && !thang) || goc !== gocDen ? 2 : 0);
}
/* bấm một hướng (đã đổi sang hướng trên bản đồ) */
function lam(d) {
  if (thang || !M || tam.querySelector('.sk-tin:not([hidden]),.sk-ds:not([hidden])')) return;
  if (hang.length > 2) hang = [];                                      // đang tự đi theo chạm: bấm hướng thì thôi
  if (dang || hang.length) { if (hang.length < 2) hang.push(d); return; }
  thucHien(d, bay(), false);
}
function thucHien(d, t, nhanh) {
  huong = d;
  const b = S.di(M, the, d);
  if (!b) { dang = { kieu: 'vuong', d, t0: t, lau: 180 }; hang = []; tiengCham(); return; }
  lichSu.push(b); truocLamLai = null;
  dang = { kieu: b.thung >= 0 ? 'day' : 'di', b, t0: t, lau: b.thung >= 0 ? 165 : nhanh ? 85 : 120 };
  if (b.thung >= 0) {
    const vao = M.dich.includes(the.thung[b.thung]), ra = M.dich.includes(b.toi);
    tiengDay(dang.lau);
    if (vao) { sangLuc[b.thung] = t + dang.lau; tingSao(soTrongO() - 1, dang.lau); }
    else if (ra) tiengRa(dang.lau);
    kiemKet(true);
  }
  capNhatChu();
  if (S.xongMan(M, the)) {
    thang = true; hang = []; tatBao();
    const ma = maMan;
    setTimeout(() => { if (ma === maMan && thang) ketThucMan(); }, dang.lau + 420);
  }
}
const soTrongO = () => the.thung.filter(o => M.dich.includes(o)).length;
/* thùng kẹt hẳn (ô chết, kẹt 2×2) thì tô đỏ và nói ngay — người mới hay đẩy thùng vào góc rồi loay hoay mãi */
function kiemKet(baoMoi) {
  const moi = new Set();
  the.thung.forEach((o, k) => { if (S.thungKet(M, G, the, k)) moi.add(k); });
  const them = [...moi].some(k => !ket.has(k));
  ket = moi;
  if (them && baoMoi) { bao('Thùng này kẹt rồi, không đưa về ổ được nữa. Bấm ↶ Hoàn tác để lùi lại lần đẩy vừa rồi.', 0); tiengVuong(); }
  else if (!moi.size && tam.querySelector('.sk-bao').dataset.ket) tatBao();
  if (them && baoMoi) tam.querySelector('.sk-bao').dataset.ket = '1';
}
function datXong() { dang = null; }
/* Hoàn tác lùi một lần đẩy (người dùng: "lùi lại cũng lùi tới chỗ thùng đẩy"): bỏ các bước đi sau lần đẩy cuối và bỏ cả
   lần đẩy đó — robot về đúng chỗ đứng đẩy, thùng về chỗ cũ. Chưa đẩy lần nào thì robot về chỗ xuất phát. */
function hoanTac() {
  if (!M) return;
  if (thang) { thang = false; tam.querySelector('.sk-tin').hidden = true; }
  datXong(); hang = [];
  if (!lichSu.length) {
    if (truocLamLai) {                                                 // hoàn tác cả lần bấm Chơi lại
      const ls = truocLamLai; truocLamLai = null;
      lichSu = ls.map(b => S.di(M, the, b.d));
      if (lichSu.length) huong = lichSu[lichSu.length - 1].d;
      kiemKet(false); capNhatChu(); tatBao();
    }
    return;
  }
  while (lichSu.length && lichSu[lichSu.length - 1].thung < 0) { const b = lichSu.pop(); S.luiLai(M, the, b); huong = b.d; }
  const b = lichSu.pop();
  if (b) { S.luiLai(M, the, b); huong = b.d; dang = { kieu: 'lui', b, t0: bay(), lau: 150 }; }
  kiemKet(false); capNhatChu();
}
function choiLaiMan() {
  if (!lichSu.length) return;
  if (thang) { thang = false; tam.querySelector('.sk-tin').hidden = true; }
  datXong(); hang = []; xemGiai = false;
  truocLamLai = lichSu; lichSu = []; the = S.theMoi(M); huong = 2;
  kiemKet(false); capNhatChu();
  bao('Đã bày lại từ đầu. Bấm ↶ Hoàn tác nếu lỡ tay.', 2600);
}

/* ---------- chạm vào cảnh ----------
   Chạm một ô sàn: robot tự đi tới (đường ngắn nhất, không đẩy gì). Chạm thùng đứng sát robot: đẩy nó. Chạm thùng ở xa:
   robot đi tới sát thùng, chạm lần nữa thì đẩy. Vuốt trên cảnh: mỗi quãng vuốt là một bước theo hướng vuốt. */
function boLoi(p) {                                                    // bao lồi của các điểm (để biết chạm trúng khối nào)
  p = p.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cheo = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const duoi = [], tren = [];
  for (const q of p) { while (duoi.length > 1 && cheo(duoi[duoi.length - 2], duoi[duoi.length - 1], q) <= 0) duoi.pop(); duoi.push(q); }
  for (const q of p.reverse()) { while (tren.length > 1 && cheo(tren[tren.length - 2], tren[tren.length - 1], q) <= 0) tren.pop(); tren.push(q); }
  return duoi.slice(0, -1).concat(tren.slice(0, -1));
}
function trongDa(h, x, y) {
  for (let i = 0; i < h.length; i++) {
    const a = h[i], b = h[(i + 1) % h.length];
    if ((b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x) < 0) return false;
  }
  return true;
}
function khoiHop(x, y, r, z0, z1) {
  const p = [];
  for (const [a, b] of [[-r, -r], [r, -r], [r, r], [-r, r]]) for (const z of [z0, z1]) p.push(chieu(x + a, y + b, z));
  return boLoi(p);
}
function oDuocCham(px, py) {
  let tot = null;
  the.thung.forEach((o, k) => {
    const c = toaDo(o);
    if (trongDa(khoiHop(c.x, c.y, RT, 0, ZTH), px, py)) { const d = chieu(c.x, c.y, 0).d; if (!tot || d > tot.d) tot = { loai: 'thung', k, d }; }
  });
  for (const c of oVe) if (c.tuong && trongDa(khoiHop(c.x, c.y, .5, 0, ZT), px, py)) {
    const d = chieu(c.x, c.y, 0).d;
    if (!tot || d > tot.d) tot = { loai: 'tuong', d };
  }
  if (tot) return tot;
  const X = (px - toa.cx) / toa.s, Y = (py - toa.cy) / (toa.s * KY), c = Math.cos(goc), s = Math.sin(goc);
  const gx = Math.round(toa.tx + X * c + Y * s), gy = Math.round(toa.ty - X * s + Y * c);
  return laTrong(gx, gy) ? { loai: 'san', o: gy * M.w + gx } : null;
}
function chamO(px, py) {
  if (thang || !M) return;
  const h = oDuocCham(px, py);
  if (!h || h.loai === 'tuong') return;
  hang = [];
  if (h.loai === 'thung') {
    const o = the.thung[h.k];
    for (let d = 0; d < 4; d++) if (S.buocToi(M, the.p, d) === o) { lam(d); return; }
    let tot = null;
    for (let d = 0; d < 4; d++) {
      const q = S.buocToi(M, o, d);
      if (q < 0 || !M.trong[q] || the.co[q] >= 0) continue;
      const p = S.duongToi(M, the, q);
      if (p && (!tot || p.length < tot.length)) tot = p;
    }
    if (tot) hang = tot; else bao('Robot không tới sát thùng này được.', 2200);
    return;
  }
  if (h.o === the.p) return;
  const p = S.duongToi(M, the, h.o);
  if (p) hang = p; else bao('Không có đường tới ô đó — thùng đang chắn.', 2200);
}
let cham = null;
function chamXuong(e) {
  if (e.target !== cv) return;
  amThanh();                                                           // mở âm thanh trong lúc chạm (iPhone đòi vậy)
  cham = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ax: e.clientX, ay: e.clientY, vuot: false };
  try { cv.setPointerCapture(e.pointerId); } catch (er) {}
}
function chamDi(e) {
  if (!cham || e.pointerId !== cham.id) return;
  const dx = e.clientX - cham.ax, dy = e.clientY - cham.ay, Q = 34;
  if (Math.abs(dx) < Q && Math.abs(dy) < Q) return;
  const sd = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0);
  cham.vuot = true;
  if (sd === 1 || sd === 3) { cham.ax += sd === 1 ? Q : -Q; cham.ay = e.clientY; } else { cham.ay += sd === 2 ? Q : -Q; cham.ax = e.clientX; }
  lam(huongTheoMan(sd));
}
function chamLen(e) {
  if (!cham || e.pointerId !== cham.id) return;
  const c = cham; cham = null;
  if (!c.vuot && Math.hypot(e.clientX - c.x0, e.clientY - c.y0) < 12) {
    const k = cv.getBoundingClientRect();
    chamO(e.clientX - k.left, e.clientY - k.top);
  }
}
/* giữ nút mũi tên (hay ↶) thì lặp lại, như giữ phím trên máy tính */
let giu = null;
function batDauGiu(e) {
  const n = e.target.closest && e.target.closest('[data-man],.sk-hoan');
  if (!n || !tam.contains(n)) return;
  e.preventDefault();
  amThanh();
  const lamMot = () => { if (n.classList.contains('sk-hoan')) hoanTac(); else lam(huongTheoMan(+n.dataset.man)); };
  dungGiu();
  lamMot();
  giu = { n, t: setTimeout(function lap() { lamMot(); giu.t = setTimeout(lap, n.classList.contains('sk-hoan') ? 280 : 150); }, n.classList.contains('sk-hoan') ? 450 : 340) };
  n.classList.add('sk-dang-bam');
}
function dungGiu() { if (giu) { clearTimeout(giu.t); giu.n.classList.remove('sk-dang-bam'); giu = null; } }

/* ---------- âm thanh ----------
   Như Robot thắp sao: tạo ngay bằng Web Audio, không tải tệp. Đẩy: tiếng "cộc" gỗ nhỏ. Thùng vào ổ: tiếng chuông, mỗi thùng
   sau cao hơn một bậc (Đô Mi Son Đố…). Thùng rời ổ: một nốt trầm xuống. Đâm vào tường: "bộp" nhỏ. Xong màn: bốn nốt đi
   lên rồi hợp âm. Máy để im lặng thì không kêu. Bật/tắt ở danh sách màn. */
let am = null, coTieng = true;
function amThanh() {
  if (!coTieng) return null;
  try {
    if (!am) { const AC = self.AudioContext || self.webkitAudioContext; if (!AC) return null; am = new AC(); }
    if (am.state === 'suspended') am.resume();
    return am;
  } catch (e) { return null; }
}
function not(f, luc, lau, to, kieu = 'sine') {
  const a = am, o = a.createOscillator(), v = a.createGain();
  o.type = kieu; o.frequency.value = f;
  v.gain.setValueAtTime(0, luc); v.gain.linearRampToValueAtTime(to, luc + .008); v.gain.exponentialRampToValueAtTime(.0001, luc + lau);
  o.connect(v); v.connect(a.destination); o.start(luc); o.stop(luc + lau + .05);
  return o;
}
const BAC = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
function tingSao(thu, cho = 0) {
  if (!amThanh()) return;
  const t = am.currentTime + .01 + cho / 1000, f = BAC[Math.min(thu, BAC.length - 1)];
  not(f, t, 1.1, .2); not(f * 2.756, t, .45, .06); not(f * 5.404, t, .22, .03);
}
function tiengDay(cho = 0) {
  if (!amThanh()) return;
  const t = am.currentTime + .005, o = not(150, t, .09, .07, 'triangle');
  o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(95, t + .08);
  if (cho > 80) not(120, t + cho / 1000 - .02, .06, .04, 'triangle');
}
function tiengRa(cho = 0) {
  if (!amThanh()) return;
  const t = am.currentTime + .01 + cho / 1000, o = not(392, t, .35, .07);
  o.frequency.setValueAtTime(392, t); o.frequency.exponentialRampToValueAtTime(262, t + .3);
}
function tiengCham() {
  if (!amThanh()) return;
  const t = am.currentTime + .01, o = not(170, t, .12, .07);
  o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(110, t + .1);
}
function tiengVuong() {
  if (!amThanh()) return;
  const t = am.currentTime + .01, o = not(190, t, .18, .12);
  o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(110, t + .15);
}
function nhacThang() {
  if (!amThanh()) return;
  const t = am.currentTime + .02;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => not(f, t + i * .11, .5, .14, 'triangle'));
  [523.25, 659.25, 783.99].forEach(f => not(f, t + .5, 1.4, .08, 'triangle'));
  not(2093, t + .5, .8, .025);
}

/* ---------- khung ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'sokoban';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="sk-dau">
      <button class="sk-dsnut" type="button" aria-label="Danh sách màn">☰</button>
      <p class="sk-ten"></p>
      <button class="sk-hoi" type="button" aria-label="Cách chơi">?</button>
    </div>
    <div class="sk-canh">
      <canvas class="sk-cv"></canvas>
      <p class="sk-muc" aria-live="polite"></p>
      <p class="sk-dem"></p>
      <div class="sk-chuyen"><button type="button" data-chuyen="-1"></button><button type="button" data-chuyen="1"></button></div>
      <div class="sk-xoay"><button type="button" data-xoay="-1" aria-label="Xoay cảnh sang trái">⟲</button><button type="button" data-xoay="1" aria-label="Xoay cảnh sang phải">⟳</button></div>
      <p class="sk-bao" hidden></p>
    </div>
    <div class="sk-duoi">
      <div class="sk-lenh">
        <button class="sk-hoan" type="button" aria-label="Hoàn tác: lùi lại một lần đẩy"><span>↶</span>Hoàn tác</button>
        <button class="sk-lai" type="button" aria-label="Bày lại từ đầu"><span>↻</span>Chơi lại</button>
      </div>
      <div class="sk-pad">
        <button type="button" data-man="0" aria-label="Đi lên">▲</button>
        <button type="button" data-man="3" aria-label="Đi sang trái">◀</button>
        <button type="button" data-man="1" aria-label="Đi sang phải">▶</button>
        <button type="button" data-man="2" aria-label="Đi xuống">▼</button>
      </div>
    </div>
    <div class="sk-tin" hidden><div class="sk-tin-trong"></div></div>
    <div class="sk-ds" hidden><div class="sk-ds-trong"></div></div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.sk-cv'); ctx = cv.getContext && cv.getContext('2d');
  tam.addEventListener('click', bam);
  cv.addEventListener('pointerdown', chamXuong);
  cv.addEventListener('pointermove', chamDi);
  cv.addEventListener('pointerup', chamLen);
  cv.addEventListener('pointercancel', () => { cham = null; });
  tam.addEventListener('pointerdown', batDauGiu);
  ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'wheel'].forEach(k => tam.addEventListener(k, danhThuc, true));
  addEventListener('keydown', danhThuc, true); addEventListener('resize', danhThuc);
  addEventListener('pointerup', dungGiu);
  addEventListener('pointercancel', dungGiu);
  addEventListener('blur', dungGiu);
  addEventListener('resize', doCo);
  if (typeof ResizeObserver === 'function') new ResizeObserver(doCo).observe(tam.querySelector('.sk-canh'));
}
function doCo() {
  if (!tam || !cv) return;
  const k = tam.querySelector('.sk-canh').getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2); W = Math.max(200, k.width || 360); H = Math.max(160, k.height || 420);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
}
function bao(chu, lau = 2800) {
  const p = tam.querySelector('.sk-bao');
  p.textContent = chu; p.hidden = false; delete p.dataset.ket;
  clearTimeout(bao.t); if (lau) bao.t = setTimeout(() => { p.hidden = true; }, lau);
}
function tatBao() { clearTimeout(bao.t); if (tam) { const p = tam.querySelector('.sk-bao'); p.hidden = true; delete p.dataset.ket; } }
function capNhatChu() {
  if (!tam || !M) return;
  const n = M.thung.length, vao = soTrongO(), day = lichSu.filter(b => b.thung >= 0).length;
  tam.querySelector('.sk-muc').innerHTML = `<b>${vao}/${n}</b> thùng vào ổ`;
  tam.querySelector('.sk-dem').textContent = `${day} lần đẩy · ${lichSu.length} bước`;
  tam.querySelector('.sk-hoan').disabled = !lichSu.length && !truocLamLai;
  tam.querySelector('.sk-lai').disabled = !lichSu.length;
}
/* dòng phụ ở đầu trang: số lần đẩy ít nhất, và số sao cao nhất đã được ở màn này (★★☆) — ngắn cho vừa màn hẹp */
const dongPhu = (day, sao) => `Ít nhất ${day} lần đẩy${sao ? ' · ' + '★'.repeat(sao) + '☆'.repeat(3 - sao) : ''}`;
function moMan(i) {
  so = Math.max(0, Math.min(MAN.length - 1, i));
  maMan++;
  tam.querySelector('.sk-tin').hidden = true; tam.querySelector('.sk-ds').hidden = true;
  const m = MAN[so];
  M = S.docMan(m.m.split('|')); G = S.themCheo(S.chuanBi(M));
  the = S.theMoi(M); lichSu = []; truocLamLai = null; dang = null; hang = []; thang = false; huong = 2; xemGiai = false;
  sang = M.thung.map(o => (M.dich.includes(o) ? 1 : 0)); sangLuc = [];
  oVe = [];
  for (let y = 0; y < M.h; y++) for (let x = 0; x < M.w; x++) {
    const i2 = y * M.w + x;
    if (M.trong[i2]) oVe.push({ x, y, tuong: false, dich: M.dich.includes(i2) });
    else if (M.tuong[i2] && [-1, 0, 1].some(a => [-1, 0, 1].some(b => laTrong(x + a, y + b)))) oVe.push({ x, y, tuong: true });
  }
  ket = new Set(); kiemKet(false);
  goc = gocDen = gocTot();
  tatBao();
  const sao = +saoCua()[so];
  tam.querySelector('.sk-ten').innerHTML = `<b>Màn ${so + 1}</b> · ${M.thung.length} thùng<span>${dongPhu(m.day, sao)}</span>`;
  const [lui, toi] = tam.querySelectorAll('[data-chuyen]');
  if (lui) { lui.textContent = `‹ Màn ${so}`; lui.hidden = so === 0; lui.setAttribute('aria-label', `Màn trước: màn ${so}`); }
  if (toi) { toi.textContent = `Màn ${so + 2} ›`; toi.hidden = so === MAN.length - 1; toi.setAttribute('aria-label', `Màn sau: màn ${so + 2}`); }
  capNhatChu();
  ghiLuu({ b: so });
  if (!docLuu().h) { ghiLuu({ h: 1 }); moTin('cach'); }
}
function moTin(loai, them) {
  const hop = tam.querySelector('.sk-tin');
  let html = '';
  if (loai === 'cach') {
    html = `<p class="sk-tin-nho">Sokoban</p><h2>Đẩy thùng sao</h2>
      <p>Đẩy hết thùng vào các <b>ổ vàng</b>. Thùng vào ổ thì ngôi sao trên nắp sáng lên; mọi thùng đều sáng là xong màn.</p>
      <p>Robot chỉ <b>đẩy</b> được, không kéo được, và mỗi lần chỉ đẩy một thùng. Đẩy thùng vào góc tường là hết lấy ra — thùng sẽ đỏ lên. <b>↶ Hoàn tác</b> lùi lại một lần đẩy: robot về đúng chỗ đứng đẩy, thùng về chỗ cũ.</p>
      <p>Đi: bấm mũi tên, vuốt trên cảnh, hay chạm vào một ô để robot tự đi tới. Chạm vào thùng ngay cạnh robot để đẩy. Máy tính: phím mũi tên, Z hoàn tác, R chơi lại.</p>
      <p class="sk-tin-meo">Sao tính theo số lần đẩy thùng, đi bao nhiêu bước cũng được: đẩy đúng số lần ít nhất là 3 sao. Bí thì bấm ↻ Chơi lại, nhìn lại từ đầu.</p>
      <button type="button" class="sk-tin-dong">Chơi</button>`;
  } else if (loai === 'thang') {
    const m = MAN[so], { buoc, day, sao } = them;
    const nhanXet = day < m.day ? 'Còn ít lần đẩy hơn cả lời giải của máy — giỏi quá!'
      : day === m.day ? 'Đúng số lần đẩy ít nhất — đủ 3 sao!'
      : `Ít nhất là ${m.day} lần đẩy. Bớt ${day - m.day} lần đẩy nữa là được 3 sao — thử lại xem?`;
    html = `<div class="sk-tin-sao">${[0, 1, 2].map(k => `<span class="${k < sao ? 'sk-co' : ''}">★</span>`).join('')}</div>
      <h2>${sao === 3 ? 'Tuyệt vời!' : 'Xong màn ' + (so + 1) + '!'}</h2>
      <p>Bạn đẩy ${day} lần (đi ${buoc} bước). ${nhanXet}</p>
      ${so < MAN.length - 1 ? `<button type="button" class="sk-tin-tiep">Màn ${so + 2} ›</button>` : '<p class="sk-tin-meo">Đây là màn cuối. Còn màn nào chưa đủ 3 sao thì vào ☰ chơi lại nhé.</p>'}
      ${sao < 3 ? '<button type="button" class="sk-tin-lai sk-phu">Chơi lại cho đủ 3 sao</button>' : ''}
      <button type="button" class="sk-tin-ds sk-phu">Danh sách màn</button>`;
  }
  else if (loai === 'xem') {
    html = `<p class="sk-tin-nho">Chế độ thử</p><h2>Lời giải của máy</h2>
      <p>Máy vừa chơi lời giải ít lần đẩy nhất: ${them.day} lần đẩy. Máy chơi thì không tính sao — tự chơi để lấy sao nhé.</p>
      <button type="button" class="sk-tin-lai">Tự chơi màn này</button>
      ${so < MAN.length - 1 ? `<button type="button" class="sk-tin-tiep sk-phu">Màn ${so + 2} ›</button>` : ''}`;
  }
  hop.querySelector('.sk-tin-trong').innerHTML = html;
  hop.hidden = false;
}
function moDs() {
  const hop = tam.querySelector('.sk-ds'), s = saoCua();
  const tong = [...s].reduce((a, c) => a + +c, 0);
  let html = `<button type="button" class="sk-ds-x" aria-label="Đóng">✕</button><h2 data-bi>Đẩy thùng sao</h2>
    <p class="sk-ds-phu">${MAN.length} màn, máy tự tạo — màn nào cũng chắc chắn giải được. Màn nào cũng mở, chơi màn nào cũng được.</p>
    <p class="sk-ds-tong">★ ${tong} / ${MAN.length * 3}</p>
    <button type="button" class="sk-ds-tieng" data-tieng>${coTieng ? '🔊 Âm thanh: bật' : '🔇 Âm thanh: tắt'}</button>`;
  if (cheDoThu) html += `<button type="button" class="sk-ds-tieng sk-ds-xem" data-xem>▶ Xem lời giải màn ${so + 1}</button>`;
  CHUONG.forEach((c, ci) => {
    html += `<h3>Chương ${ci + 1} · ${esc(TEN_CHUONG[c.k] || c.k + ' thùng')}</h3><div class="sk-ds-luoi">`;
    for (let i = c.tu; i <= c.den; i++) {
      const n = +s[i];
      html += `<button type="button" data-man-so="${i}" class="${n === 3 ? 'sk-du' : n ? 'sk-xong' : ''}${i === so ? ' sk-dang' : ''}" aria-label="Màn ${i + 1}${n ? ', ' + n + ' sao' : ''}">${i + 1}<i>${n ? '★'.repeat(n) : ''}</i></button>`;
    }
    html += '</div>';
  });
  html += '<button type="button" class="sk-ds-dong">Đóng</button>';
  hop.querySelector('.sk-ds-trong').innerHTML = html;
  hop.hidden = false;
}
let bamBi = { n: 0, luc: 0 };
function bam(e) {
  const t = e.target, q = (s) => t.closest && t.closest(s);
  if (q('.xn-dong')) { dong(); return; }
  if (q('.sk-bao')) { tatBao(); return; }
  let n;
  if (e.detail === 0 && (n = q('[data-man]'))) { lam(huongTheoMan(+n.dataset.man)); return; }
  if (e.detail === 0 && q('.sk-hoan')) { hoanTac(); return; }
  if ((n = q('[data-xoay]'))) { gocDen += (+n.dataset.xoay) * Math.PI / 2; return; }
  if ((n = q('[data-chuyen]'))) { moMan(so + (+n.dataset.chuyen)); return; }
  if (q('.sk-lai')) { choiLaiMan(); return; }
  if (q('.sk-hoi')) { moTin('cach'); return; }
  if (q('.sk-dsnut')) { moDs(); return; }
  if ((n = q('[data-man-so]'))) { tam.querySelector('.sk-ds').hidden = true; moMan(+n.dataset.manSo); return; }
  if (q('.sk-ds-dong') || q('.sk-ds-x') || t === tam.querySelector('.sk-ds')) { tam.querySelector('.sk-ds').hidden = true; return; }
  if (q('[data-bi]')) {                                                // chạm 7 lần liền vào tên trò: chế độ thử (xem lời giải)
    const luc = Date.now();
    bamBi = luc - bamBi.luc < 1500 ? { n: bamBi.n + 1, luc } : { n: 1, luc };
    if (bamBi.n >= 7 && !cheDoThu) { cheDoThu = true; moDs(); bao('Đã bật chế độ thử: có nút xem lời giải.'); }
    return;
  }
  if (q('[data-tieng]')) { coTieng = !coTieng; if (!coTieng && am) am.suspend(); moDs(); if (coTieng) tingSao(0); return; }
  if (q('[data-xem]')) { xemLoiGiai(); return; }
  if (q('.sk-tin-tiep')) { tam.querySelector('.sk-tin').hidden = true; moMan(so + 1); return; }
  if (q('.sk-tin-lai')) { tam.querySelector('.sk-tin').hidden = true; moMan(so); return; }
  if (q('.sk-tin-ds')) { tam.querySelector('.sk-tin').hidden = true; moDs(); return; }
  if (q('.sk-tin-dong')) { tam.querySelector('.sk-tin').hidden = true; return; }
}
/* Chế độ thử (chạm 7 lần vào tên trò): máy tự chơi lời giải ít bước nhất để người làm app kiểm màn. Máy chơi thì không
   tính sao — kẻo xem lời giải là được 3 sao. */
function xemLoiGiai() {
  tam.querySelector('.sk-ds').hidden = true;
  moMan(so);
  xemGiai = true;
  hang = [...MAN[so].giai].map(c => S.CHU.indexOf(c.toLowerCase()));
}
function ketThucMan() {
  const buoc = lichSu.length, day = lichSu.filter(b => b.thung >= 0).length, sao = soSao(day, MAN[so].day);
  nhacThang();
  if (xemGiai) { moTin('xem', { day }); return; }
  ghiSao(so, sao);
  moTin('thang', { buoc, day, sao });
  tam.querySelector('.sk-ten span').textContent = dongPhu(MAN[so].day, +saoCua()[so]);
}
function phim(e) {
  if (!tam || !tam.classList.contains('hien')) return;
  const hop = tam.querySelector('.sk-tin:not([hidden]),.sk-ds:not([hidden])');
  if (e.key === 'Escape') { if (hop) hop.hidden = true; else dong(); return; }
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (hop) { if (e.key === 'Enter') { const b = hop.querySelector('button.sk-tin-tiep,button.sk-tin-dong'); if (b) { e.preventDefault(); b.click(); } } return; }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const sd = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 }[k];
  if (sd !== undefined) { e.preventDefault(); amThanh(); lam(huongTheoMan(sd)); return; }
  if (k === 'z' || k === 'u' || k === 'Backspace') { e.preventDefault(); hoanTac(); return; }
  if (k === 'r') { e.preventDefault(); choiLaiMan(); }
}
if (typeof addEventListener === 'function') addEventListener('keydown', phim);   // bộ tạo màn nạp tệp này trong Node

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  if (MAN.length) moMan(manMo());
  danhThuc();
}
function dong() {
  dungGiu(); cham = null; hang = [];
  if (am && am.state === 'running') am.suspend();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (henNghi) { clearTimeout(henNghi); henNghi = 0; }
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

self.TDTD_SOKOBAN = {
  HUONG, CHU, docMan, vietMan, chuanBi, themCheo, ket2x2, loang, giaiItBuoc, giaiItDay,
  theMoi, di, luiLai, xongMan, choiLai, duongToi, thungKet, buocToi, dongMoi, dongDay, dongLay,
  MAN, CHUONG, soSao, mo, dong,
  _moMan: (i) => moMan(i), _lam: (d) => lam(d), _hoanTac: () => hoanTac(), _choiLai: () => choiLaiMan(), _xemLoiGiai: () => xemLoiGiai(),
  _the: () => the, _lichSu: () => lichSu, _ket: () => ket, _hang: () => hang, _chamO: chamO, _ketThucMan: () => ketThucMan(),
  _huongTheoMan: (sd) => huongTheoMan(sd), _datGoc: (g) => { goc = gocDen = g; }, _buocTiep: (t) => vong(t), _dangThang: () => thang,
  _oDuocCham: (x, y) => oDuocCham(x, y), _chieu: (x, y, z) => chieu(x, y, z), _canhKhung: () => canhKhung(),
  _dang: () => dang, _goc: () => goc,
};
})();
