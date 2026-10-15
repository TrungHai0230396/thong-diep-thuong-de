/* Tạo màn cho Đẩy thùng sao (assets/sokoban.js) theo Joshua Taylor và Ian Parberry, "Procedural Generation of Sokoban
   Levels", GAMEON-NA 2011, tr. 5–12 (ianparberry.com/pubs/GAMEON-NA_METH_03.pdf). Ba bước như bài báo:

   1. Phòng trống. Chọn số khối 3×3 theo chiều ngang, dọc; mỗi khối lấp bằng một trong 17 mẫu (hình 2 của bài báo),
      xoay hay lật ngẫu nhiên. Mẫu 5×5: lõi 3×3 cộng một viền chồng lên khối bên cạnh; ô viền không để trống phải khớp
      với ô đã có. Không mẫu nào khớp thì bỏ cả phòng làm lại. Ngoài phòng là tường. Rồi loại phòng:
      - sàn không liền một khối (ô "người qua được mà thùng không qua được" — ô gạch chéo ở mẫu 10 — tính như tường
        khi xét chỗ này);
      - có khoảng sàn trống 4×3 hay 3×4 trở lên (bài báo: cây trạng thái rậm mà nông, khó tạo mà chẳng khó giải);
      - không đủ sàn cho số thùng, người và thêm một ô trống;
      - có ô sàn bị tường bao ba mặt.
   2. Đặt ổ: thử mọi cách đặt K ổ, theo thứ tự xáo ngẫu nhiên, có hẹn giờ — hết giờ thì lấy kết quả tốt nhất đã có.
   3. Thế xa nhất: từ lúc mọi thùng nằm trong ổ, chơi NGƯỢC (người kéo thùng), đo bằng "đường đẩy" (box lines: đẩy
      một thùng bao nhiêu ô theo cùng một hướng vẫn tính là một đường). Người gộp thành vùng đi được. Thế cần nhiều
      đường nhất là thế bày của màn. Kéo ra được thì đẩy về được — màn nào cũng giải được.
      Bài báo dùng tìm sâu dần hai lớp để đỡ tốn bộ nhớ (máy năm 2011); ở đây tìm theo chiều rộng thường, cùng kết quả.
   Chọn màn: điểm = 100·(số lần đẩy − số màn anh em + 4·số đường − 12·số thùng) + ngẫu nhiên(0–300); thùng kẹt cứng
   −100000; mỗi thùng sát tường −150; thùng sát người +50; thùng sát thùng +30; ổ sát ổ +30; điểm ≤ 0 thì bỏ. Màn
   trùng (kể cả xoay, lật, bỏ qua chỗ người đứng) thì bỏ. Độ khó để xếp thứ tự: đường·log(đường) − đường/lần đẩy
   (bài báo cộng thêm log thời gian tạo chỉ để phân xử hoà — ở đây hoà thì xét số bước ít nhất).
   Thêm một bước bài báo không có: bộ giải tìm số bước ít nhất (để chấm sao); màn nào bộ giải không xong trong giới
   hạn thì bỏ, và bỏ màn có thùng nằm sẵn trong ổ mà lời giải không đụng tới (thùng chỉ để trang trí).

   Chạy:  node scripts/tao-man-sokoban.js tao <tệp-kết-quả.jsonl> [số-luồng]   — tạo liên tục, ghi từng màn một dòng
          node scripts/tao-man-sokoban.js chon <tệp-kết-quả.jsonl>...            — chọn 100 màn, ghi assets/mansoko.js */
'use strict';
const fs = require('fs'), path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
global.self = global;
new Function(fs.readFileSync(path.join(__dirname, '..', 'assets', 'sokoban.js'), 'utf8'))();
const S = self.TDTD_SOKOBAN;

/* 17 mẫu của hình 2 bài báo. ? để trống (gì cũng được), # tường, . sàn, x sàn người qua được mà thùng không qua được. */
const MAU = [
  ['?????', '?...?', '?...?', '?...?', '?????'],
  ['?????', '?#..?', '?...?', '?...?', '?????'],
  ['???..', '?##..', '?...?', '?...?', '?????'],
  ['?????', '?###?', '?...?', '?...?', '?????'],
  ['?????', '?###?', '?#..?', '?#..?', '?????'],
  ['??.??', '?#..?', '....?', '?..#?', '?????'],
  ['?????', '?#..?', '....?', '?#..?', '?????'],
  ['??.??', '?#..?', '....?', '?#.#?', '??.??'],
  ['??.??', '?#.#?', '.....', '?#.#?', '??.??'],
  ['??.??', '?#.#?', '?#x..', '?###?', '?????'],
  ['?????', '?###?', '.....', '?###?', '?????'],
  ['?????', '?....', '?.#..', '?...?', '?????'],
  ['?????', '?###?', '?###?', '?###?', '?????'],
  ['?????', '?###?', '?#..?', '....?', '..???'],
  ['?.?.?', '?...?', '?#.#?', '?...?', '?.?.?'],
  ['?????', '?###?', '?###?', '?...?', '?...?'],
  ['?????', '?###?', '..#..', '?...?', '?..??'],
];
const xoay = (a) => Array.from({ length: a[0].length }, (_, i) => a.map(r => r[i]).reverse().join(''));   // xoay 90° (các hàng dài bằng nhau)
const lat = (a) => a.map(r => [...r].reverse().join(''));
const BIEN_THE = [];
for (const t of MAU) {
  const da = new Set();
  let a = t;
  for (let r = 0; r < 4; r++, a = xoay(a)) for (const b of [a, lat(a)]) {
    const k = b.join('|');
    if (!da.has(k)) { da.add(k); BIEN_THE.push(b); }
  }
}

/* số ngẫu nhiên có hạt giống (mulberry32) để chạy lại ra cùng phòng */
function ngauNhien(hat) {
  let a = hat >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function xao(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ---------- 1. phòng trống ---------- */
function dungPhong(bw, bh, r) {
  const W = 3 * bw + 2, H = 3 * bh + 2, o = new Array(W * H).fill(null);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!x || !y || x === W - 1 || y === H - 1) o[y * W + x] = '#';
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    const thu = xao(BIEN_THE.slice(), r);
    const khop = thu.find(t => {
      for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
        const v = t[i][j], e = o[(3 * by + i) * W + 3 * bx + j];
        if (v !== '?' && e !== null && (e === '#') !== (v === '#')) return false;
      }
      return true;
    });
    if (!khop) return null;
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const v = khop[i][j], k = (3 * by + i) * W + 3 * bx + j;
      if (v === '?') continue;
      if (o[k] === null || v === 'x') o[k] = v;
    }
  }
  return { W, H, o };
}
const laSan = (c) => c === '.' || c === 'x';
function kiemPhong(p, soThung) {
  const { W, H, o } = p;
  const san = [];
  for (let i = 0; i < W * H; i++) if (laSan(o[i])) san.push(i);
  if (san.length < soThung + 2) return 'ít sàn';
  /* liền một khối — ô x tính như tường */
  const thuong = san.filter(i => o[i] === '.'), da = new Set([thuong[0]]), q = [thuong[0]];
  while (q.length) {
    const c = q.pop();
    for (const d of [-1, 1, -W, W]) if (o[c + d] === '.' && !da.has(c + d)) { da.add(c + d); q.push(c + d); }
  }
  if (da.size !== thuong.length) return 'rời';
  /* khoảng trống 4×3 / 3×4 */
  for (const [rw, rh] of [[4, 3], [3, 4]]) for (let y = 0; y + rh <= H; y++) for (let x = 0; x + rw <= W; x++) {
    let du = true;
    for (let a = 0; a < rh && du; a++) for (let b = 0; b < rw; b++) if (!laSan(o[(y + a) * W + x + b])) { du = false; break; }
    if (du) return 'trống rộng';
  }
  /* ô bị tường bao ba mặt */
  for (const i of san) if ([-1, 1, -W, W].filter(d => o[i + d] === '#').length >= 3) return 'ngõ cụt';
  return null;
}
function manTuPhong(p) {                                              // dạng màn cho bộ giải (chưa có ổ, thùng, người)
  const n = p.W * p.H, tuong = new Uint8Array(n), trong = new Uint8Array(n);
  for (let i = 0; i < n; i++) { if (p.o[i] === '#') tuong[i] = 1; else trong[i] = 1; }
  return { w: p.W, h: p.H, tuong, trong, dich: [], thung: [], nguoi: -1 };
}

/* ---------- 3. thế xa nhất: chơi ngược, đo bằng đường đẩy ----------
   Thế = các thùng (số ô sàn, sắp tăng) + đại diện vùng người (ô nhỏ nhất vùng). Kéo: người đứng sát thùng phía d,
   lùi tiếp theo hướng d, thùng theo sau; kéo k ô cùng hướng = một đường. Trả lớp cuối (các thế xa nhất), độ sâu,
   số lần đẩy ít nhất trong các cách đi ít đường nhất, và ô người đứng sau lần kéo cuối. */
function xaNhat(g, oDich, han) {
  const { F, ke } = g, K = oDich.length;
  const ma = (bs, p) => { let v = 0; for (let i = 0; i < K; i++) v = v * F + bs[i]; return v * F + p; };
  const coA = new Uint8Array(F), coB = new Uint8Array(F), kc = new Int32Array(F), temA = new Int32Array(F), temB = new Int32Array(F);
  let dauA = 0, dauB = 0;
  const seen = new Map();                                            // khoá → số thứ tự thế
  const TB = [], TP = [], TN = [], TD = [], TS = [];                  // thùng (K số mỗi thế), đại diện, chỗ người, số lần đẩy, độ sâu
  const them = (bs, rep, nguoi, day, sau) => { const id = TP.length; for (let i = 0; i < K; i++) TB.push(bs[i]); TP.push(rep); TN.push(nguoi); TD.push(day); TS.push(sau); return id; };
  let lop = [];
  for (const f of oDich) coA[f] = 1;
  for (let f = 0; f < F; f++) {
    if (coA[f] || temA[f] === dauA + 1) continue;
    const rep = S.loang(g, coA, f, kc, temA, dauA + 1);
    if (rep !== f) continue;
    const k = ma(oDich, rep);
    if (!seen.has(k)) { const id = them(oDich, rep, rep, 0, 0); seen.set(k, id); lop.push(id); }
  }
  dauA++;
  let sau = 0;
  const bs = new Int32Array(K), moi = new Int32Array(K);
  for (;;) {
    const tiep = [];
    for (const id of lop) {
      for (let i = 0; i < K; i++) bs[i] = TB[id * K + i];
      coA.fill(0); for (let i = 0; i < K; i++) coA[bs[i]] = 1;
      S.loang(g, coA, TP[id], kc, temA, ++dauA);
      coB.set(coA);
      for (let i = 0; i < K; i++) {
        const b = bs[i];
        for (let d = 0; d < 4; d++) {
          const p = ke[b * 4 + d];
          if (p < 0 || temA[p] !== dauA) continue;
          let thungMoi = b, nguoi = p;
          for (let k = 1; ; k++) {
            const toi = ke[nguoi * 4 + d];
            if (toi < 0 || coA[toi]) break;
            thungMoi = nguoi; nguoi = toi;
            coB[b] = 0; coB[thungMoi] = 1;
            const rep = S.loang(g, coB, nguoi, kc, temB, ++dauB);
            coB[thungMoi] = 0; coB[b] = 1;
            /* chèn thùng mới vào đúng chỗ cho dãy vẫn tăng */
            let w = 0;
            for (let j = 0; j < K; j++) if (j !== i) moi[w++] = bs[j];
            let c = K - 1;
            while (c > 0 && moi[c - 1] > thungMoi) { moi[c] = moi[c - 1]; c--; }
            moi[c] = thungMoi;
            const khoa = ma(moi, rep), cu = seen.get(khoa), day = TD[id] + k;
            if (cu === undefined) { const nid = them(moi, rep, nguoi, day, sau + 1); seen.set(khoa, nid); tiep.push(nid); }
            else if (TS[cu] === sau + 1 && day < TD[cu]) { TD[cu] = day; TN[cu] = nguoi; }
          }
        }
      }
      if (seen.size > han) return null;
    }
    if (!tiep.length) break;
    lop = tiep; sau++;
  }
  return { sau, dem: seen.size, cuoi: lop.map(id => ({ thung: TB.slice(id * K, id * K + K), nguoi: TN[id], day: TD[id] })) };
}

/* điểm của một màn ứng viên (bài báo) */
function diem(g, oDich, c, anhEm, r) {
  const { ke, laDich } = g, K = oDich.length, coThung = new Set(c.thung);
  let d = 100 * (c.day - anhEm + 4 * c.sau - 12 * K) + Math.floor(r() * 301);
  for (const b of c.thung) {
    const ben = [0, 1, 2, 3].map(h => ke[b * 4 + h]);
    const cungNgang = ben[1] < 0 || ben[3] < 0, cungDoc = ben[0] < 0 || ben[2] < 0;
    if (cungNgang && cungDoc && laDich[b]) d -= 100000;               // thùng kẹt cứng (nằm sẵn trong ổ, không bao giờ nhúc nhích)
    if (ben.some(o => o < 0)) d -= 150;
    if (ben.includes(c.nguoi)) d += 50;
    if (ben.some(o => o >= 0 && coThung.has(o))) d += 30;
  }
  const coDich = new Set(oDich);
  for (const o of oDich) if ([0, 1, 2, 3].some(h => coDich.has(ke[o * 4 + h]))) d += 30;
  return d;
}

/* ---------- 2. đặt ổ, có hẹn giờ ---------- */
function toHop(n, k) { let c = 1; for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1); return c; }
function* cachDat(F, K, r) {
  if (toHop(F, K) <= 300000) {
    const tat = [], cur = [];
    (function de(tu) { if (cur.length === K) { tat.push(cur.slice()); return; } for (let f = tu; f < F; f++) { cur.push(f); de(f + 1); cur.pop(); } })(0);
    yield* xao(tat, r);
  } else {
    const da = new Set();
    for (;;) {
      const s = new Set();
      while (s.size < K) s.add(Math.floor(r() * F));
      const a = [...s].sort((x, y) => x - y), k = a.join(',');
      if (!da.has(k)) { da.add(k); yield a; }
    }
  }
}

function taoMot(K, bw, bh, giay, r, hanThe) {
  let p = null, thuPhong = 0;
  while (!p) {
    if (++thuPhong > 20000) return null;
    const q = dungPhong(bw, bh, r);
    if (q && !kiemPhong(q, K)) p = q;
  }
  const m = manTuPhong(p), g = S.themCheo(S.chuanBi(m));
  const t0 = Date.now();
  let sauNhat = 0, tapXa = [];                                        // mọi thế xa nhất (ở độ sâu lớn nhất) của mọi cách đặt ổ
  let soCach = 0;
  for (const oDich of cachDat(g.F, K, r)) {
    if (Date.now() - t0 > giay * 1000) break;
    soCach++;
    const kq = xaNhat(g, oDich, hanThe);
    if (!kq || kq.sau < sauNhat || kq.sau === 0) continue;
    if (kq.sau > sauNhat) { sauNhat = kq.sau; tapXa = []; }
    for (const c of kq.cuoi) tapXa.push({ oDich, thung: c.thung, nguoi: c.nguoi, day: c.day, sau: kq.sau, dem: kq.dem });
  }
  if (!tapXa.length) return null;
  let tot = null;
  for (const c of tapXa) {
    const gD = S.chuanBi(Object.assign({}, m, { dich: c.oDich.map(f => g.san[f]) }));
    const d = diem(gD, c.oDich, c, tapXa.length - 1, r);
    if (d > 0 && (!tot || d > tot.diem)) tot = Object.assign({ diem: d }, c);
  }
  if (!tot) return null;
  const xong = Object.assign({}, m, { dich: tot.oDich.map(f => g.san[f]), thung: tot.thung.map(f => g.san[f]), nguoi: g.san[tot.nguoi] });
  return {
    dong: gon(xong), thung: K, khoi: [bw, bh], duong: tot.sau, day: tot.day, anhEm: tapXa.length - 1,
    diem: tot.diem, giay: (Date.now() - t0) / 1000, soCach, dem: tot.dem,
  };
}
/* bỏ tường không sát sàn (cả chéo), cắt hàng cột trống: màn nhìn gọn như màn Sokoban thường */
function gon(m) {
  const { w, h } = m;
  const giu = (i) => {
    if (!m.tuong[i]) return true;
    const x = i % w, y = (i - x) / w;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < w && ny < h && m.trong[ny * w + nx]) return true;
    }
    return false;
  };
  const tuong = Uint8Array.from(m.tuong, (v, i) => (v && giu(i) ? 1 : 0));
  const dong = S.vietMan(Object.assign({}, m, { tuong }));
  const x0 = Math.min(...dong.filter(s => s.trim()).map(s => s.search(/\S/)));
  return dong.filter(s => s.trim()).map(s => s.slice(x0));
}

/* dạng chuẩn để so trùng: 8 phép xoay lật, bỏ chỗ người đứng */
function dangChuan(dong) {
  const w = Math.max(...dong.map(s => s.length));
  let a = dong.map(s => s.padEnd(w).replace(/[@]/g, ' ').replace(/\+/g, '.'));
  const ra = [];
  for (let r = 0; r < 4; r++, a = xoay(a)) for (const b of [a, lat(a)]) ra.push(b.map(s => s.replace(/\s+$/, '')).join('|'));
  return ra.sort()[0];
}

/* ---------- chạy song song ---------- */
const LICH = [                                                        // [số thùng, khối ngang, khối dọc, giây cho mỗi phòng]
  [1, 1, 1, 1], [1, 1, 2, 2], [1, 2, 1, 2], [1, 2, 2, 3],
  [2, 1, 2, 4], [2, 2, 1, 4], [2, 2, 2, 8], [2, 2, 3, 12], [2, 3, 2, 12],
  [3, 2, 2, 30], [3, 2, 3, 45], [3, 3, 2, 45], [3, 3, 3, 60],
  [4, 2, 2, 90], [4, 2, 3, 120], [4, 3, 2, 120], [4, 3, 3, 150],
  [5, 2, 3, 180], [5, 3, 2, 180], [5, 3, 3, 240],
];
const MUC = { 1: 30, 2: 80, 3: 90, 4: 60, 5: 36 };                 // cần bao nhiêu ứng viên mỗi số thùng (chọn 100 trong đó)

if (!isMainThread) {
  const r = ngauNhien(workerData.hat);
  parentPort.on('message', (viec) => {
    if (!viec) { process.exit(0); }
    const [K, bw, bh, giay] = viec;
    const kq = taoMot(K, bw, bh, giay, r, 2.5e6);
    if (kq) {
      const m = S.docMan(kq.dong);
      const giai = S.giaiItBuoc(m, 4e6);
      if (giai) {
        kq.it = giai.buoc; kq.dayIt = giai.day; kq.loiGiai = giai.loiGiai;
        /* thùng nằm sẵn trong ổ mà lời giải không đụng tới: chỉ để trang trí */
        const dichSet = new Set(m.dich), dung = new Set();
        const the = S.theMoi(m);
        for (const ch of giai.loiGiai) { const b = S.di(m, the, S.CHU.indexOf(ch.toLowerCase())); if (b.thung >= 0) dung.add(b.thung); }
        kq.thungThua = m.thung.filter((o, k) => dichSet.has(o) && !dung.has(k)).length;
      } else kq.it = null;
    }
    parentPort.postMessage(kq);
  });
} else if (process.argv[2] === 'tao') {
  /* tham số thứ năm (không bắt buộc): chỉ tạo các số thùng này, vd "1,2,3" — chạy hai tiến trình song song để việc
     nhanh (2–3 thùng) khỏi phải xếp hàng sau việc lâu (4–5 thùng, vài phút một phòng) */
  const tep = process.argv[3], soLuong = +process.argv[4] || 7;
  const chiK = process.argv[5] ? process.argv[5].split(',').map(Number) : null;
  const da = new Map();                                               // số thùng → số ứng viên đã có
  const trung = new Set();
  if (fs.existsSync(tep)) for (const s of fs.readFileSync(tep, 'utf8').split('\n')) if (s.trim()) {
    const o = JSON.parse(s); da.set(o.thung, (da.get(o.thung) || 0) + 1); trung.add(dangChuan(o.dong));
  }
  let lan = 0;
  const viecTiep = () => {
    const thieu = LICH.filter(([K]) => (!chiK || chiK.includes(K)) && (da.get(K) || 0) < MUC[K]);
    if (!thieu.length) return null;
    return thieu[lan++ % thieu.length];
  };
  let dangChay = 0;
  for (let i = 0; i < soLuong; i++) {
    const wk = new Worker(__filename, { workerData: { hat: (Date.now() + i * 7919) >>> 0 } });
    dangChay++;
    const giao = () => { const v = viecTiep(); if (!v) { wk.postMessage(null); dangChay--; if (!dangChay) console.log('xong'); return; } wk.postMessage(v); };
    wk.on('message', (kq) => {
      if (kq && kq.it && !kq.thungThua) {
        const c = dangChuan(kq.dong);
        if (!trung.has(c)) {
          trung.add(c); da.set(kq.thung, (da.get(kq.thung) || 0) + 1);
          fs.appendFileSync(tep, JSON.stringify(kq) + '\n');
          console.log(`${kq.thung} thùng ${kq.khoi.join('×')}: ${kq.duong} đường, ${kq.day} đẩy, ít nhất ${kq.it} bước, ${kq.giay.toFixed(0)} giây — đã có ${[...da].map(([k, v]) => k + ':' + v).join(' ')}`);
        }
      }
      giao();
    });
    wk.on('error', (e) => { console.error('luồng lỗi', e); });
    giao();
  }
} else if (process.argv[2] === 'thu') {
  /* thử nhanh một phòng: node scripts/tao-man-sokoban.js thu K bw bh giây [hạt] */
  const [K, bw, bh, giay, hat] = process.argv.slice(3).map(Number);
  const r = ngauNhien(hat || 1);
  const kq = taoMot(K, bw, bh, giay, r, 2.5e6);
  if (kq) {
    const giai = S.giaiItBuoc(S.docMan(kq.dong), 4e6);
    console.log(kq.dong.join('\n'));
    console.log(Object.assign({}, kq, { dong: undefined }), giai && { it: giai.buoc, day: giai.day, the: giai.the });
  } else console.log('không ra màn');
}

/* ---------- chọn 100 màn ----------
   Mỗi chương một số thùng (1 → 5). Trong chương xếp theo độ khó của bài báo (đường·log đường − đường/lần đẩy), lấy
   cách đều từ dễ tới khó; chương một thùng (làm quen) lấy những màn dễ nhất. Hai màn liền nhau không được giống nhau
   quá (cùng phòng). */
const PHAN = { 1: 6, 2: 24, 3: 30, 4: 25, 5: 15 };
/* số lần đẩy lấy theo lời giải ít bước nhất (lời giải lưu trong màn) để bài kiểm tính lại được */
const doKho = (c) => c.duong * Math.log(c.duong) - c.duong / c.dayIt;
function chon(tep) {
  const tat = [];
  for (const t of tep) for (const s of fs.readFileSync(t, 'utf8').split('\n')) if (s.trim()) tat.push(JSON.parse(s));
  const da = new Set(), ra = [];
  for (const K of Object.keys(PHAN).map(Number)) {
    const nhom = [], thay = new Set();                                 // bỏ màn trùng (kể cả xoay, lật) ngay trong nhóm
    for (const c of tat.filter(c => c.thung === K && c.it && !c.thungThua).sort((a, b) => doKho(a) - doKho(b) || a.it - b.it)) {
      const d = dangChuan(c.dong);
      /* chương làm quen: robot không đứng sẵn trên ổ — người mới phải thấy ngay ổ ở đâu */
      if (K === 1 && c.dong.some(r => r.includes('+'))) continue;
      if (!da.has(d) && !thay.has(d)) { thay.add(d); nhom.push(c); }
    }
    const n = Math.min(PHAN[K], nhom.length);
    const lay = K === 1 ? nhom.slice(0, n) : Array.from({ length: n }, (_, i) => nhom[Math.round(i * (nhom.length - 1) / Math.max(1, n - 1))]);
    for (const c of lay) { da.add(dangChuan(c.dong)); ra.push(c); }
    console.log(`${K} thùng: ${nhom.length} ứng viên, lấy ${lay.length}; đường ${lay.map(c => c.duong).join(' ')}`);
  }
  return ra;
}
function ghiMan(ds) {
  const dong = ds.map(c => `  { m: '${c.dong.join('|')}', k: ${c.thung}, it: ${c.it}, d: ${c.duong}, giai: '${c.loiGiai}' },`);
  const dau = `/* ${ds.length} màn của Đẩy thùng sao (assets/sokoban.js). Máy tự tạo bằng scripts/tao-man-sokoban.js theo Taylor & Parberry
   (GAMEON-NA 2011): ghép phòng từ 17 mẫu, đặt ổ, chơi ngược từ lúc mọi thùng nằm trong ổ để tìm thế xa nhất — màn nào
   cũng giải được. Đừng sửa tay: chạy lại "node scripts/tao-man-sokoban.js chon …" (bài kiểm scripts/test-sokoban.js
   giải lại từng màn để chắc số bước ít nhất đúng).
   m: màn ký hiệu XSB (# tường, . ổ, $ thùng, * thùng trong ổ, @ robot, + robot đứng trên ổ), các hàng nối bằng "|".
   k: số thùng. it: số bước ít nhất. d: số đường đẩy (box lines — đẩy một thùng nhiều ô cùng hướng tính một đường),
   thước đo độ khó của bài báo. giai: một lời giải ít bước nhất, kiểu LURD (chữ thường đi, chữ hoa đẩy). */
self.TDTD_MANSOKO = [
`;
  fs.writeFileSync(path.join(__dirname, '..', 'assets', 'mansoko.js'), dau + dong.join('\n') + '\n];\n');
}
if (isMainThread && process.argv[2] === 'chon') {
  const ds = chon(process.argv.slice(3));
  ghiMan(ds);
  console.log('đã ghi', ds.length, 'màn vào assets/mansoko.js');
}

module.exports = { MAU, BIEN_THE, dungPhong, kiemPhong, xaNhat, dangChuan, gon, doKho, chon };
