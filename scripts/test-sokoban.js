/* Kiểm thử Đẩy thùng sao (Sokoban): node scripts/test-sokoban.js
   Luật đi và đẩy; bộ giải ít bước nhất đối chiếu với cách dò từng bước một (chậm mà chắc); ô chết, kẹt 2×2; bộ tạo màn
   (17 mẫu của bài báo, lọc phòng, chơi ngược đo bằng đường đẩy — đối chiếu với tìm xuôi); cả 100 màn: giải được bằng
   đúng lời giải lưu sẵn, số bước ít nhất là thật (giải lại), không thùng nào chỉ để trang trí, không màn nào trùng (kể
   cả xoay, lật); giao diện: bấm, hoàn tác lùi một lần đẩy, chơi lại, chạm để đi, thùng kẹt, chấm sao theo số lần đẩy,
   lưu, không có nút gợi ý. */
'use strict';
const fs = require('fs');
const path = require('path');
const goc = path.join(__dirname, '..');

/* DOM giả tối thiểu: đủ cho mo(), vẽ (bỏ qua), bảng ẩn hiện */
const ve2d = new Proxy({}, {
  get: (_, k) => {
    if (k === 'createLinearGradient' || k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'measureText') return () => ({ width: 10 });
    return () => {};
  },
  set: () => true,
});
const nut = (cls = '') => {
  const o = {
    className: cls, innerHTML: '', textContent: '', style: {}, children: [], _q: {}, dataset: {}, disabled: false,
    hidden: /sk-(tin|ds|bao)$/.test(cls),
    classList: {
      _s: new Set(String(cls).split(' ').filter(Boolean)),
      add(...a) { a.forEach(x => this._s.add(x)); }, remove(...a) { a.forEach(x => this._s.delete(x)); },
      toggle(x, b) { (b === undefined ? !this._s.has(x) : b) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); },
    },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {}, removeEventListener() {}, remove() {},
    setPointerCapture() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 375, height: 560 }),
    appendChild(c) { o.children.push(c); return c; }, getContext: () => ve2d, contains: () => true, closest: () => null,
    querySelector(sel) {
      if (sel.includes(':not([hidden])')) {
        for (const p of sel.split(',')) { const n = o.querySelector(p.replace(':not([hidden])', '').trim()); if (n && !n.hidden) return n; }
        return null;
      }
      const k = String(sel).replace(/^[.#]/, '');
      return o._q[k] || (o._q[k] = nut(k));
    },
    querySelectorAll() { return []; },
  };
  return o;
};
let luu = {};
global.document = { body: nut('body'), createElement: () => nut(), querySelector: () => null, querySelectorAll: () => [], addEventListener() {} };
global.self = global; global.window = global;
global.addEventListener = () => {}; global.removeEventListener = () => {};
global.localStorage = { getItem: (k) => (k in luu ? luu[k] : null), setItem: (k, v) => { luu[k] = String(v); }, removeItem: (k) => { delete luu[k]; } };
global.requestAnimationFrame = () => 1; global.cancelAnimationFrame = () => {};
global.devicePixelRatio = 1;
global.ResizeObserver = undefined;
for (const t of ['mansoko.js', 'sokoban.js']) new Function(fs.readFileSync(path.join(goc, 'assets', t), 'utf8'))();
const S = global.TDTD_SOKOBAN;
const T = require('./tao-man-sokoban.js');

let pass = 0, fail = 0;
const ok = (n, c, them = '') => { c ? pass++ : fail++; console.log(`${c ? '  ✓' : '  ✗'} ${n}${them ? ' — ' + them : ''}`); };

/* dò từng bước một trên (chỗ người, chỗ các thùng): chậm nhưng không thể sai — để đối chiếu bộ giải */
function doTungBuoc(m) {
  const khoa = (p, bs) => p + ':' + bs.slice().sort((a, b) => a - b).join(',');
  const dich = new Set(m.dich);
  const seen = new Set([khoa(m.nguoi, m.thung)]);
  let q = [{ p: m.nguoi, bs: m.thung.slice() }], d = 0;
  while (q.length) {
    const tiep = [];
    for (const s of q) {
      if (s.bs.every(b => dich.has(b))) return d;
      for (const [dx, dy] of S.HUONG) {
        const t = s.p + dx + dy * m.w;
        if (!m.trong[t]) continue;
        let bs = s.bs;
        const j = bs.indexOf(t);
        if (j >= 0) { const u = t + dx + dy * m.w; if (!m.trong[u] || bs.includes(u)) continue; bs = bs.slice(); bs[j] = u; }
        const k = khoa(t, bs);
        if (!seen.has(k)) { seen.add(k); tiep.push({ p: t, bs }); }
      }
    }
    q = tiep; d++;
  }
  return -1;
}
/* tìm xuôi theo số đường đẩy (đẩy một thùng bao nhiêu ô cùng hướng = một đường) — đối chiếu chơi ngược của bộ tạo */
function itDuongNhat(m) {
  const g = S.chuanBi(m), F = g.F, dich = new Set(m.dich.map(i => g.so[i]));
  const vung = (bs, p) => { const co = new Uint8Array(F); bs.forEach(b => { co[b] = 1; }); return S.loang(g, co, p, new Int32Array(F), new Int32Array(F), 1); };
  const bs0 = m.thung.map(i => g.so[i]).sort((a, b) => a - b);
  const khoa = (bs, r) => bs.join(',') + ':' + r;
  const seen = new Set([khoa(bs0, vung(bs0, g.so[m.nguoi]))]);
  let q = [{ bs: bs0, r: vung(bs0, g.so[m.nguoi]) }], d = 0;
  while (q.length) {
    const tiep = [];
    for (const s of q) {
      if (s.bs.every(b => dich.has(b))) return d;
      const co = new Uint8Array(F); s.bs.forEach(b => { co[b] = 1; });
      const kc = new Int32Array(F), tem = new Int32Array(F);
      S.loang(g, co, s.r, kc, tem, 7);
      s.bs.forEach((b, i) => {
        for (let h = 0; h < 4; h++) {
          const sau = g.ke[b * 4 + ((h + 2) & 3)];
          if (sau < 0 || tem[sau] !== 7) continue;
          let o = b, nguoi = sau;
          for (;;) {
            const t = g.ke[o * 4 + h];
            if (t < 0 || co[t]) break;
            nguoi = o; o = t;
            const bs = s.bs.slice(); bs[i] = o; bs.sort((a, c) => a - c);
            const r = vung(bs, nguoi), k = khoa(bs, r);
            if (!seen.has(k)) { seen.add(k); tiep.push({ bs, r }); }
          }
        }
      });
    }
    q = tiep; d++;
  }
  return -1;
}

/* tìm theo chiều rộng, mỗi lần đẩy một ô là một bước, người gộp thành vùng: số lần đẩy ít nhất — đối chiếu giaiItDay */
function itDayNhat(m) {
  const g = S.chuanBi(m), F = g.F, dich = new Set(m.dich.map(i => g.so[i]));
  const vung = (bs, p) => { const co = new Uint8Array(F); bs.forEach(b => { co[b] = 1; }); return S.loang(g, co, p, new Int32Array(F), new Int32Array(F), 1); };
  const bs0 = m.thung.map(i => g.so[i]).sort((a, b) => a - b), r0 = vung(bs0, g.so[m.nguoi]);
  const seen = new Set([bs0.join(',') + ':' + r0]);
  let q = [{ bs: bs0, r: r0 }], d = 0;
  while (q.length) {
    const tiep = [];
    for (const st of q) {
      if (st.bs.every(b => dich.has(b))) return d;
      const co = new Uint8Array(F); st.bs.forEach(b => { co[b] = 1; });
      const tem = new Int32Array(F);
      S.loang(g, co, st.r, new Int32Array(F), tem, 3);
      st.bs.forEach((b, i) => {
        for (let h = 0; h < 4; h++) {
          const sau = g.ke[b * 4 + ((h + 2) & 3)], toi = g.ke[b * 4 + h];
          if (sau < 0 || toi < 0 || tem[sau] !== 3 || co[toi]) continue;
          const bs = st.bs.slice(); bs[i] = toi; bs.sort((a, c) => a - c);
          const r = vung(bs, b), k = bs.join(',') + ':' + r;
          if (!seen.has(k)) { seen.add(k); tiep.push({ bs, r }); }
        }
      });
    }
    q = tiep; d++;
  }
  return -1;
}

console.log('\n— Đọc màn, đi, đẩy —');
{
  const m = S.docMan(['#######', '#+ $* #', '# $   #', '#. #  #', '#######']);
  ok('đọc ký hiệu XSB: người đứng trên ổ (+), thùng trong ổ (*)', m.nguoi === 8 && m.dich.length === 3 && m.thung.length === 3 && m.dich.includes(8) && m.dich.includes(11));
  ok('ghi lại đúng như cũ', S.vietMan(m).join('|') === '#######|#+ $* #|# $   #|#. #  #|#######');
  const the = S.theMoi(m);
  ok('đi vào ô trống', !!S.di(m, the, 1) && the.p === 9);
  const b = S.di(m, the, 1);
  ok('đẩy được thùng khi phía sau trống? (sau thùng là thùng khác: không đẩy được hai thùng)', b === null && the.p === 9);
  ok('không đi xuyên tường', S.di(m, the, 0) === null && the.p === 9);
  const b2 = S.di(m, the, 2);
  ok('đẩy thùng xuống: thùng trượt một ô', b2 && b2.thung >= 0 && the.thung.includes(23) && the.p === 16);
  ok('đẩy thùng vào tường thì không được', S.di(m, the, 2) === null);
  S.luiLai(m, the, b2);
  ok('hoàn tác trả lại đúng chỗ người và thùng', the.p === 9 && the.thung.includes(16) && the.co[16] >= 0 && the.co[23] < 0);
  ok('chơi lại chuỗi LURD: chữ hoa phải là đẩy thật', S.choiLai(m, 'rD').loi === undefined && S.choiLai(m, 'rd').loi === 1 && S.choiLai(m, 'R').loi === 0);
  const t2 = S.theMoi(m), duong = S.duongToi(m, t2, 23);
  let p = t2.p; for (const h of duong || []) p = S.buocToi(m, p, h);
  ok('tìm đường tới một ô, không đẩy gì; bị thùng chắn thì không có đường', duong && p === 23 && duong.length === 3 && S.duongToi(m, t2, 26) === null, duong && duong.join(''));
}

console.log('\n— Ô chết, kẹt 2×2 —');
{
  const m = S.docMan(['######', '#    #', '# $  #', '#@ . #', '######']);
  const g = S.themCheo(S.chuanBi(m));
  const f = (x, y) => g.so[y * m.w + x];
  ok('góc tường không có ổ là ô chết', g.chet[f(1, 1)] === 1 && g.chet[f(4, 1)] === 1);
  ok('dọc tường trên không có ổ: chết; ổ và ô kéo về được: sống', g.chet[f(2, 1)] === 1 && g.chet[f(3, 3)] === 0 && g.chet[f(2, 2)] === 0);
  const m2 = S.docMan(['#####', '#   #', '# $$#', '# $$#', '#@..#', '#####']);
  const g2 = S.themCheo(S.chuanBi(m2)), the = S.theMoi(m2);
  ok('bốn thùng thành khối 2×2 ngoài ổ: kẹt', S.thungKet(m2, g2, the, 0));
  const m3 = S.docMan(['#####', '#@  #', '# **#', '#   #', '#####']);
  ok('hai thùng sát tường nhưng đều trong ổ: không tính là kẹt', !S.thungKet(m3, S.themCheo(S.chuanBi(m3)), S.theMoi(m3), 0));
}

console.log('\n— Bộ giải, đối chiếu cách dò từng bước —');
{
  const cac = [
    ['#######', '#.    #', '#  #  #', '#  $  #', '# @   #', '#######'],
    ['########', '#  .   #', '# $$#  #', '#  . @ #', '########'],
    ['  #####', '###   #', '#.@$  #', '### $.#', '#.##$ #', '# # . ##', '#$ *$$.#', '#   .  #', '########'],
  ];
  /* thêm vài màn thật ít thùng trong bộ màn */
  for (const m of S.MAN.filter(x => x.k <= 2).slice(0, 8)) cac.push(m.m.split('|'));
  let khop = 0, sai = [], saiDay = [];
  for (const r of cac) {
    const m = S.docMan(r), kq = S.giaiItBuoc(m), doi = doTungBuoc(m);
    if (kq && kq.buoc === doi && S.choiLai(m, kq.loiGiai).xong) khop++; else sai.push(`${r.join('|')}: ${kq && kq.buoc} / ${doi}`);
    const kd = S.giaiItDay(m), doiDay = itDayNhat(m), lai = kd && S.choiLai(m, kd.loiGiai);
    if (!kd || kd.day !== doiDay || !lai.xong || lai.day !== kd.day) saiDay.push(`${r.join('|')}: ${kd && kd.day} / ${doiDay}`);
    else if (kd.day > kq.day) saiDay.push(`${r.join('|')}: ít lần đẩy nhất ${kd.day} mà lời giải ít bước chỉ ${kq.day} lần đẩy`);
  }
  ok(`số bước ít nhất trùng với dò từng bước (${cac.length} màn), lời giải chơi lại xong màn`, !sai.length, sai.join('; '));
  ok(`số lần đẩy ít nhất trùng với tìm theo chiều rộng từng lần đẩy (${cac.length} màn), lời giải chơi lại xong màn`, !saiDay.length, saiDay.join('; '));
  ok('màn không giải được (thùng nằm ở góc): trả null', S.giaiItBuoc(S.docMan(['#####', '#$ .#', '#@  #', '#####'])) === null);
}

console.log('\n— Bộ tạo màn (Taylor & Parberry 2011) —');
{
  ok('17 mẫu, mỗi mẫu 5×5, lõi 3×3 không để trống', T.MAU.length === 17 && T.MAU.every(t => t.length === 5 && t.every(r => r.length === 5 && /^[?#.x]+$/.test(r)) && [1, 2, 3].every(i => [1, 2, 3].every(j => t[i][j] !== '?'))));
  ok('xoay, lật đủ kiểu: 75 biến thể khác nhau', T.BIEN_THE.length === 75, String(T.BIEN_THE.length));
  const mk = (rows) => ({ W: rows[0].length, H: rows.length, o: rows.join('').split('').map(c => (c === ' ' ? '.' : c)) });
  ok('loại phòng có ô bị tường bao ba mặt', T.kiemPhong(mk(['#######', '#     #', '# ### #', '# # # #', '#     #', '#######']), 1) === 'ngõ cụt');
  ok('loại phòng có khoảng trống 4×3', T.kiemPhong(mk(['######', '#    #', '#    #', '#    #', '######']), 1) === 'trống rộng');
  ok('loại phòng rời làm hai', T.kiemPhong(mk(['#######', '#  #  #', '#  #  #', '#######']), 1) === 'rời');
  ok('ô "người qua được, thùng không qua" tính như tường khi xét liền khối', T.kiemPhong(mk(['#######', '#  x  #', '#  #  #', '#######']), 1) === 'rời');
  let a = 7;
  const r = () => { a = (a * 1103515245 + 12345) % 2147483648; return a / 2147483648; };
  let phong = 0, dat = 0;
  for (let i = 0; i < 300; i++) { const p = T.dungPhong(2, 2, r); if (p) { phong++; if (!T.kiemPhong(p, 2)) dat++; } }
  ok('ghép được phòng 2×2 khối, một phần qua được bộ lọc', phong > 200 && dat > 50, `${phong} phòng ghép xong, ${dat} qua lọc`);
  /* chơi ngược: thế xa nhất phải cần đúng chừng ấy đường đẩy khi tìm xuôi */
  const thu = ['#######', '#     #', '# # # #', '#     #', '#######'];
  const m = S.docMan(thu.map((s, i) => (i === 1 ? '#@    #' : s)));
  const g = S.themCheo(S.chuanBi(m));
  const oDich = [g.so[3 * m.w + 4], g.so[3 * m.w + 5]].sort((x, y) => x - y);
  const kq = T.xaNhat(g, oDich, 1e6);
  const c = kq.cuoi[0];
  const mm = Object.assign({}, m, { dich: oDich.map(f => g.san[f]), thung: c.thung.map(f => g.san[f]), nguoi: g.san[c.nguoi] });
  ok('thế xa nhất của chơi ngược cần đúng ngần ấy đường đẩy khi tìm xuôi', kq.sau > 0 && itDuongNhat(mm) === kq.sau, `${kq.sau} đường, ${kq.cuoi.length} thế xa nhất`);
  ok('thế xa nhất giải được (bộ giải ít bước nhất tìm ra)', !!S.giaiItBuoc(mm));
  const A = ['#####', '#@$.#', '#####'];
  ok('so trùng: lật, xoay, dời chỗ người vẫn là một màn', T.dangChuan(A) === T.dangChuan(['#####', '#.$@#', '#####']) && T.dangChuan(A) === T.dangChuan(['###', '#@#', '#$#', '#.#', '###']) && T.dangChuan(A) !== T.dangChuan(['#####', '#$ .#', '#####']));
}

console.log('\n— Cả bộ màn —');
const loi = { doc: [], so: [], giai: [], day: [], tao: [], co: [], ket: [] };
const chuan = new Set(), trung = [];
S.MAN.forEach((x, i) => {
  const ten = `màn ${i + 1}`, rows = x.m.split('|');
  const m = S.docMan(rows);
  if (m.nguoi < 0 || !rows.every(r => /^[ #.$*@+]*$/.test(r)) || rows.join('').replace(/[^@+]/g, '').length !== 1) { loi.doc.push(ten); return; }
  for (let y = 0; y < m.h; y++) for (let xx = 0; xx < m.w; xx++) if (m.trong[y * m.w + xx] && (!xx || !y || xx === m.w - 1 || y === m.h - 1)) loi.doc.push(`${ten}: hở tường`);
  if (m.thung.length !== x.k || m.dich.length !== x.k) loi.so.push(`${ten}: ${m.thung.length} thùng, ${m.dich.length} ổ, ghi ${x.k}`);
  if (m.w > 12 || m.h > 12) loi.co.push(`${ten}: ${m.w}×${m.h}`);
  const lai = S.choiLai(m, x.giai);
  if (!lai.xong || lai.day !== x.day) loi.giai.push(`${ten}: ${lai.xong ? lai.day + ' lần đẩy, ghi ' + x.day : 'không xong'}`);
  /* thùng nào cũng phải được đẩy ít nhất một lần */
  const the = S.theMoi(m), dung = new Set();
  for (const ch of x.giai) { const b = S.di(m, the, S.CHU.indexOf(ch.toLowerCase())); if (b && b.thung >= 0) dung.add(b.thung); }
  if (dung.size !== m.thung.length) loi.tao.push(`${ten}: ${m.thung.length - dung.size} thùng không phải đẩy`);
  const g = S.themCheo(S.chuanBi(m)), t0 = S.theMoi(m);
  if (m.thung.some((o, k) => S.thungKet(m, g, t0, k))) loi.ket.push(ten);
  const kq = S.giaiItDay(m, 8e6);                                      // cả bộ chừng 20 giây
  if (!kq || kq.day !== x.day || kq.buoc !== lai.buoc) loi.day.push(`${ten}: giải lại ra ${kq && kq.day} lần đẩy ${kq && kq.buoc} bước, ghi ${x.day} lần đẩy ${lai.buoc} bước`);
  const c = T.dangChuan(rows);
  if (chuan.has(c)) trung.push(ten); chuan.add(c);
});
ok('đúng 100 màn', S.MAN.length === 100, `${S.MAN.length} màn`);
ok('màn nào cũng đọc được: một robot, kín tường, chỉ ký hiệu XSB', !loi.doc.length, loi.doc.join(', '));
ok('số thùng = số ổ = số ghi trong màn', !loi.so.length, loi.so.join(', '));
ok('vừa màn hình điện thoại (không quá 12×12 ô)', !loi.co.length, loi.co.join(', '));
ok('lời giải lưu sẵn chơi lại xong màn, đúng số lần đẩy ít nhất đã ghi', !loi.giai.length, loi.giai.join(', '));
ok('số lần đẩy ít nhất là thật: bộ giải giải lại cả bộ ra đúng số đã ghi (và lời giải lưu sẵn ít bước nhất trong số đó)', !loi.day.length, loi.day.join(', '));
ok('không thùng nào chỉ để trang trí (lời giải đẩy mọi thùng)', !loi.tao.length, loi.tao.join(', '));
ok('lúc bày không thùng nào kẹt sẵn', !loi.ket.length, loi.ket.join(', '));
ok('không có hai màn trùng nhau, kể cả xoay, lật', !trung.length, trung.join(', '));
ok('chương theo số thùng tăng dần, màn 1 chỉ một thùng', S.MAN[0] && S.MAN[0].k === 1 && S.MAN.every((x, i) => !i || x.k >= S.MAN[i - 1].k));
const doKho = (x) => x.d * Math.log(x.d) - x.d / x.giai.replace(/[a-z]/g, '').length;
ok('trong mỗi chương độ khó không giảm (đường·log đường − đường/lần đẩy, như bài báo)', S.CHUONG.every(c => {
  for (let i = c.tu + 1; i <= c.den; i++) if (doKho(S.MAN[i]) < doKho(S.MAN[i - 1]) - 1e-9) return false;
  return true;
}));

console.log('\n— Chơi (giao diện) —');
const chayHet = () => { let t = Date.now() + 1e6; for (let i = 0; i < 5000 && (S._hang().length || S._dang()); i++) { t += 1000; S._buocTiep(t); } };
{
  luu['tdtd.soko'] = JSON.stringify({ h: 1 });                         // đã xem cách chơi: bảng hướng dẫn không chắn nước đi
  S.mo();
  S._moMan(0);
  const m = S.docMan(S.MAN[0].m.split('|'));
  S._datGoc(.32);
  ok('góc mặc định: bấm ▲ là đi lên bản đồ, ▶ sang phải', S._huongTheoMan(0) === 0 && S._huongTheoMan(1) === 1 && S._huongTheoMan(2) === 2 && S._huongTheoMan(3) === 3);
  S._datGoc(.32 + Math.PI / 2);
  ok('xoay cảnh 90°: ▲ vẫn là hướng đang hướng lên trên màn', S._huongTheoMan(0) === 3 && S._huongTheoMan(1) === 0);
  S._datGoc(.32);
  /* hoàn tác lùi một lần đẩy (người dùng: "lùi lại cũng lùi tới chỗ thùng đẩy"): chọn màn mà lời giải có đi bộ trước lần
     đẩy đầu và đi bộ ngay sau nó */
  const kL = S.MAN.findIndex(x => { const g = x.giai, p = g.search(/[A-Z]/); return p > 0 && g[p + 1] && g[p + 1] === g[p + 1].toLowerCase(); });
  S._moMan(kL);
  const mL = S.docMan(S.MAN[kL].m.split('|')), gL = S.MAN[kL].giai, p1 = gL.search(/[A-Z]/);
  let n1 = p1 + 1; while (n1 < gL.length && gL[n1] === gL[n1].toLowerCase()) n1++;
  for (const ch of gL.slice(0, n1)) { S._lam(S.CHU.indexOf(ch.toLowerCase())); chayHet(); }
  ok('đi theo lời giải: đếm đúng số bước, số lần đẩy', S._lichSu().length === n1 && S._lichSu().filter(b => b.thung >= 0).length === 1);
  const tL = S.theMoi(mL); for (const ch of gL.slice(0, p1)) S.di(mL, tL, S.CHU.indexOf(ch));
  S._hoanTac(); chayHet();
  ok('hoàn tác lùi cả lần đẩy: bỏ các bước đi sau nó, robot về đúng chỗ đứng đẩy, thùng về chỗ cũ', S._lichSu().length === p1 && S._the().p === tL.p && S._the().thung.join() === mL.thung.join());
  S._hoanTac(); chayHet();
  ok('chưa đẩy lần nào thì hoàn tác về chỗ xuất phát', S._lichSu().length === 0 && S._the().p === mL.nguoi);
  for (const ch of gL.slice(0, n1)) { S._lam(S.CHU.indexOf(ch.toLowerCase())); chayHet(); }
  S._choiLai();
  ok('chơi lại: bày lại từ đầu', S._lichSu().length === 0 && S._the().p === mL.nguoi);
  S._hoanTac();
  ok('hoàn tác ngay sau khi chơi lại: lấy lại các bước cũ', S._lichSu().length === n1);
  /* sao tính theo số lần đẩy, không tính bước chân: đi thừa hai bước rồi giải đúng số lần đẩy ít nhất vẫn 3 sao */
  S._moMan(0); S._datGoc(.32);
  const giai = S.MAN[0].giai;
  let thua = -1;
  for (let d = 0; d < 4 && thua < 0; d++) { const o = S.buocToi(m, m.nguoi, d); if (o >= 0 && m.trong[o] && !m.thung.includes(o)) thua = d; }
  S._lam(thua); chayHet(); S._lam((thua + 2) & 3); chayHet();
  for (const ch of giai) { S._lam(S.CHU.indexOf(ch.toLowerCase())); chayHet(); }
  ok('đi hết lời giải: xong màn', S._dangThang() && S._lichSu().filter(b => b.thung >= 0).length === S.MAN[0].day);
  S._ketThucMan();
  ok('đi thừa bước mà đẩy đúng số lần ít nhất: vẫn 3 sao (không tính bước chân)', S._lichSu().length === giai.length + 2 && JSON.parse(luu['tdtd.soko']).s[0] === '3');
  ok('chấm sao theo lần đẩy: đúng số ít nhất 3 sao, dư ¼ 2 sao, dư hơn 1 sao', S.soSao(20, 20) === 3 && S.soSao(25, 20) === 2 && S.soSao(26, 20) === 1 && S.soSao(19, 20) === 3);
  S._moMan(1);
  ok('mở màn khác: thế mới, chưa đi bước nào', S._lichSu().length === 0 && !S._dangThang());
  const o = JSON.parse(luu['tdtd.soko'] || '{}');
  ok('chỉ lưu một mục: sao từng màn, màn đang chơi, đã xem cách chơi', Object.keys(o).every(k => ['s', 'b', 'h'].includes(k)) && o.b === 1 && o.h === 1);
  /* thùng kẹt: tìm một màn có cách đẩy thùng vào ô chết */
  let thayKet = false;
  for (let i = 0; i < S.MAN.length && !thayKet; i++) {
    S._moMan(i);
    const mm = S.docMan(S.MAN[i].m.split('|')), gg = S.themCheo(S.chuanBi(mm));
    for (let k = 0; k < mm.thung.length && !thayKet; k++) for (let d = 0; d < 4 && !thayKet; d++) {
      const o2 = S._the().thung[k], toi = S.buocToi(mm, o2, d), sau = S.buocToi(mm, o2, (d + 2) & 3);
      if (toi < 0 || !mm.trong[toi] || !gg.chet[gg.so[toi]] || sau < 0 || !mm.trong[sau] || S._the().co[sau] >= 0 || S._the().co[toi] >= 0) continue;
      const duong = S.duongToi(mm, S._the(), sau);
      if (!duong) continue;
      for (const h of duong) { S._lam(h); chayHet(); }
      S._lam(d); chayHet();
      thayKet = S._ket().has(k);
      if (thayKet) {
        S._hoanTac(); chayHet();
        ok('đẩy thùng vào ô chết: tô đỏ ngay; hoàn tác thì hết đỏ', !S._ket().size);
      }
    }
  }
  if (!thayKet) ok('tìm được màn để thử đẩy thùng vào ô chết', false);
  /* chạm vào sàn: robot tự đi tới. Chọn ô mà ô phía trước (phía nam) cũng là sàn trống — không khối cao nào đứng chắn
     trước mặt ô đó trên màn hình */
  let dich = -1, so = -1;
  for (let k = 0; k < S.MAN.length && dich < 0; k++) {
    const mk = S.docMan(S.MAN[k].m.split('|'));
    for (let i = 0; i < mk.w * mk.h && dich < 0; i++) {
      const nam = i + mk.w, d0 = mk.trong[i] && !mk.thung.includes(i) && i !== mk.nguoi && S.duongToi(mk, S.theMoi(mk), i);
      if (d0 && d0.length >= 2 && mk.trong[nam] && !mk.thung.includes(nam)) { dich = i; so = k; }
    }
  }
  S._moMan(so); S._datGoc(.32); S._canhKhung();
  const w0 = S.docMan(S.MAN[so].m.split('|')).w;
  const pp = S._chieu(dich % w0, Math.floor(dich / w0), 0);
  const trung2 = S._oDuocCham(pp.x, pp.y);
  S._chamO(pp.x, pp.y); chayHet();
  ok('chạm vào một ô sàn: robot tự đi tới đúng ô đó', trung2 && trung2.loai === 'san' && trung2.o === dich && S._the().p === dich, `màn ${so + 1}, ô ${dich}, chạm trúng ${JSON.stringify(trung2)}, robot ở ${S._the().p}`);
  /* chạm vào giữa từng ô sàn, ở cả bốn góc xoay: hoặc trúng đúng ô đó, hoặc trúng khối cao đứng chắn phía trước — không
     bao giờ ra một ô sàn khác */
  let dung = 0, che = 0, sai = [];
  for (const k of [3, 40, 90].filter(k => k < S.MAN.length)) {
    S._moMan(k);
    const mk = S.docMan(S.MAN[k].m.split('|'));
    for (let q = 0; q < 4; q++) {
      S._datGoc(.32 + q * Math.PI / 2); S._canhKhung();
      for (let i = 0; i < mk.w * mk.h; i++) {
        if (!mk.trong[i]) continue;
        const p2 = S._chieu(i % mk.w, Math.floor(i / mk.w), 0), h = S._oDuocCham(p2.x, p2.y);
        if (h && h.loai === 'san' && h.o === i) dung++; else if (h && h.loai !== 'san') che++; else sai.push(`màn ${k + 1} góc ${q} ô ${i}→${h && h.o}`);
      }
    }
  }
  ok('chạm giữa ô nào cũng ra đúng ô đó (hay khối chắn trước mặt), ở cả bốn góc xoay', !sai.length && dung > 2 * che, `${dung} trúng, ${che} bị khối chắn${sai.length ? '; sai: ' + sai.slice(0, 5).join(', ') : ''}`);
  /* người dùng: "cho gợi ý chi vậy, người dùng dùng gợi ý hết sao" — bỏ hẳn. Chế độ thử của người làm app vẫn xem được
     lời giải, nhưng máy chơi thì không tính sao */
  const nguon = fs.readFileSync(path.join(goc, 'assets', 'sokoban.js'), 'utf8');
  ok('không còn nút gợi ý, không còn bộ giải gợi ý', !/sk-goiy|💡|giaiNhanh|Gợi ý/.test(nguon) && S.giaiNhanh === undefined);
  const kx = S.MAN.length - 1, truoc = JSON.parse(luu['tdtd.soko']).s || '';
  S._moMan(kx); S._xemLoiGiai(); chayHet(); S._ketThucMan();
  const sau = JSON.parse(luu['tdtd.soko']).s || '';
  ok('chế độ thử: máy chơi hết lời giải mà không ghi sao', S._dangThang() && S._lichSu().filter(b => b.thung >= 0).length === S.MAN[kx].day && (sau[kx] || '0') === (truoc[kx] || '0') && (sau[kx] || '0') === '0');
  S.dong();
}

console.log('\n— Gắn vào app —');
{
  const html = fs.readFileSync(path.join(goc, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(goc, 'sw.js'), 'utf8');
  const app = fs.readFileSync(path.join(goc, 'assets', 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(goc, 'assets', 'app.css'), 'utf8');
  const vt = (t) => html.indexOf(`src="assets/${t}"`);
  ok('index.html nạp mansoko.js rồi sokoban.js, trước app.js', vt('mansoko.js') > 0 && vt('mansoko.js') < vt('sokoban.js') && vt('sokoban.js') < vt('app.js'));
  ok('sw.js cất sẵn cả hai tệp để chơi khi mất mạng', sw.includes("'assets/mansoko.js'") && sw.includes("'assets/sokoban.js'"));
  ok('có ngôi sao trên trang chính, mở bằng #day-thung', /id: 'sao-sokoban'[\s\S]*?duong: 'day-thung', khung: '\.sokoban', mun: 'TDTD_SOKOBAN'/.test(app) && /\n  thung: +'M/.test(app));
  ok('có kiểu dáng cho khung trò', css.includes('.sokoban{') && css.includes('.sokoban.hien{display:flex}') && css.includes('.sk-pad'));
}

console.log(`\n${fail ? '✗' : '✓'} ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
