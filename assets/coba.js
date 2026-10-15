/* Cờ vua ba người — Trắng, Đen, Đỏ trên bàn lục giác 96 ô.

   Tìm hiểu trước khi làm (người dùng dặn):
   - Bàn: lục giác ghép từ ba nửa bàn cờ 4×8, như bằng sáng chế của Robert Zubrin (US 3652091, 1971) — cùng kiểu với các bản
     Yalta, Three-Man Chess (George Dekle, 1984), 3-chess.com. Ba cạnh xen kẽ của lục giác là ba hàng quân. Mỗi nhà chia
     đôi bằng "đường đỉnh" từ giữa cạnh hàng quân vào tâm; mỗi nửa là một tứ giác chia 4×4: đường ngang cắt đường đỉnh và
     cạnh bên ở 1/4, 1/2, 3/4, đường dọc chia mỗi đường ngang thành bốn phần bằng nhau (lời bằng sáng chế). Nửa a–d của
     một nhà giáp nửa e–h của nhà bên cạnh dọc "đường biên" từ tâm ra giữa cạnh: cột h của mình chạy thẳng sang cột a của
     nhà bên phải, cột d chạy sang cột e của nhà bên trái, đi tiếp về phía hàng quân của họ. Sáu ô d4, e4 của ba nhà gặp
     nhau ở tâm ("hoa thị").
   - Luật theo cờ vua thường. Riêng đường chéo qua đúng tâm thì rẽ được hai nhánh, cùng màu ô (Yalta: "tốt, tượng, hậu
     được chọn đường khi đi qua tâm"; 3-chess.com: "qua tâm thì chọn nhánh, vẫn cùng màu ô"); vì vậy tốt đứng ở d4, e4 có
     ba ô ăn chéo (Dekle). Mã đi chữ L: hai ô thẳng rồi một ô ngang (hoặc ngược lại) — gần tâm có thể tới hơn tám ô
     (3-chess.com), và luôn sang ô khác màu (Yalta).
   - Thứ tự: Trắng → Đen → Đỏ theo chiều kim đồng hồ. Không được để vua mình bị chiếu. Vua để hở cho người đi trước mình
     ăn thì mất vua (3-chess.com). Bị chiếu hết hay mất vua thì bị loại, quân hoá đá — vẫn chắn đường, ăn được, không ăn
     ai; còn vua cuối cùng thì thắng (luật người dùng chọn, như 3-chess.com). Hết nước mà không bị chiếu: còn ba người
     thì bỏ lượt, còn hai người thì hoà. Tốt tới hàng cuối của một nhà khác thì phong cấp. Không bắt tốt qua đường (như
     bộ threeChess của Đại học Tây Úc).
   - Máy nghĩ: tìm theo cây có cắt tỉa alpha–beta. Máy "Rùa" (chắc) dùng cách hoang tưởng — coi như hai đối thủ cùng
     đánh mình; máy "Hổ" (hăng) dùng Best-Reply Search của Schadd và Winands (2011): mỗi lượt chỉ tính một đối thủ đáp
     trả mạnh nhất, nên dám đánh hơn — nghiên cứu ở Đại học Maastricht thấy cách này mạnh hơn trong cờ nhiều người. */
(function () {
'use strict';

/* ======================================================================================================
   LÕI: hình học, luật, máy nghĩ. Viết tự chứa (không dùng biến bên ngoài) để chạy được trong Web Worker:
   máy nghĩ chạy ở luồng riêng, màn hình không bị đứng.
   ====================================================================================================== */
function LOI() {
  'use strict';
  /* ---------- hình học ----------
     Ô = P·32 + (hàng−1)·8 + cột; P: 0 Trắng, 1 Đỏ, 2 Đen; cột 0..7 là a..h; hàng 1..4 tính từ hàng quân của nhà đó.
     Sáu tứ giác ("diều") quanh tâm, đánh số n = 0..5: nhà P có diều 2P (cột a–d) và 2P+1 (cột e–h). Trong một diều, ô
     có toạ độ (p, q): p = cách cạnh trong phía trước (diều n−1), q = cách cạnh trong phía sau (diều n+1). Ô (0,0) chạm tâm.
     Bước qua cạnh trong thì sang diều bên cạnh, hai trục đổi vai cho nhau. */
  const oCua = (P, f, r) => P * 32 + (r - 1) * 8 + f;
  const nhaO = (c) => c >> 5, cotO = (c) => c & 7, hangO = (c) => ((c >> 3) & 3) + 1;
  function dieu(c) { const P = c >> 5, f = c & 7, r = ((c >> 3) & 3) + 1; return f < 4 ? [2 * P, 4 - r, 3 - f] : [2 * P + 1, f - 4, 4 - r]; }
  function tuDieu(n, p, q) { n = ((n % 6) + 6) % 6; const P = n >> 1; return n & 1 ? oCua(P, p + 4, 4 - q) : oCua(P, 3 - q, 4 - p); }
  /* hướng trong diều: 0 +p, 1 −p, 2 +q, 3 −q. buoc trả [ô mới, đã qua cạnh nào: 0 không, 1 cạnh trước, 2 cạnh sau] */
  function buoc(c, d) {
    const [n, p, q] = dieu(c);
    if (d === 0) return p < 3 ? [tuDieu(n, p + 1, q), 0] : null;
    if (d === 2) return q < 3 ? [tuDieu(n, p, q + 1), 0] : null;
    if (d === 1) return p > 0 ? [tuDieu(n, p - 1, q), 0] : [tuDieu(n - 1, q, 0), 1];
    return q > 0 ? [tuDieu(n, p, q - 1), 0] : [tuDieu(n + 1, 0, p), 2];
  }
  const QUA_TRUOC = [3, 2, 0, 1], QUA_SAU = [2, 3, 1, 0];
  const doiHuong = (d, x) => (x === 1 ? QUA_TRUOC[d] : x === 2 ? QUA_SAU[d] : d);
  const VUONG = (d) => (d < 2 ? [2, 3] : [0, 1]);
  /* bước chéo (d1, d2): đi d1 rồi d2, và d2 rồi d1. Thường ra cùng một ô; riêng từ ô chạm tâm đi về phía tâm thì ra hai ô
     khác nhau — hai nhánh qua tâm. trả [[ô, hướng d1 mới, hướng d2 mới], ...] */
  function cheo(c, d1, d2) {
    const kq = [];
    for (const [a, b] of [[d1, d2], [d2, d1]]) {
      const s1 = buoc(c, a);
      if (!s1) continue;
      const a2 = doiHuong(a, s1[1]), b2 = doiHuong(b, s1[1]);
      const s2 = buoc(s1[0], b2);
      if (!s2) continue;
      const a3 = doiHuong(a2, s2[1]), b3 = doiHuong(b2, s2[1]);
      const h = a === d1 ? [a3, b3] : [b3, a3];
      if (!kq.some(k => k[0] === s2[0])) kq.push([s2[0], h[0], h[1]]);
    }
    return kq;
  }

  /* ---------- bảng tính sẵn ---------- */
  const TRUC = [], CHEO = [], MA = [], VUA = [], KE = [];
  for (let c = 0; c < 96; c++) {
    TRUC[c] = [0, 1, 2, 3].map(d0 => {
      const tia = [];
      let x = c, d = d0;
      for (;;) { const s = buoc(x, d); if (!s) break; x = s[0]; d = doiHuong(d, s[1]); tia.push(x); }
      return tia;
    });
    const tiaCheo = [];
    const keoCheo = (x, d1, d2, dau) => {
      const kq = cheo(x, d1, d2);
      if (!kq.length) { if (dau.length) tiaCheo.push(dau); return; }
      for (const [y, e1, e2] of kq) keoCheo(y, e1, e2, dau.concat([y]));
    };
    for (const d1 of [0, 1]) for (const d2 of [2, 3]) keoCheo(c, d1, d2, []);
    CHEO[c] = tiaCheo;
    const ma = new Set();
    for (let d = 0; d < 4; d++) for (const s0 of VUONG(d)) {
      let x = c, dd = d, ss = s0, ok = true;                          // hai ô thẳng rồi một ô ngang
      for (let k = 0; k < 2 && ok; k++) { const s = buoc(x, dd); if (!s) { ok = false; break; } x = s[0]; ss = doiHuong(ss, s[1]); dd = doiHuong(dd, s[1]); }
      if (ok) { const s = buoc(x, ss); if (s) ma.add(s[0]); }
      x = c; dd = d; ss = s0; ok = true;                              // một ô ngang rồi hai ô thẳng
      { const s = buoc(x, ss); if (!s) ok = false; else { x = s[0]; dd = doiHuong(dd, s[1]); } }
      for (let k = 0; k < 2 && ok; k++) { const s = buoc(x, dd); if (!s) { ok = false; break; } x = s[0]; dd = doiHuong(dd, s[1]); }
      if (ok) ma.add(x);
    }
    ma.delete(c);
    MA[c] = [...ma];
    const ke = new Set();
    for (let d = 0; d < 4; d++) { const s = buoc(c, d); if (s) ke.add(s[0]); }
    KE[c] = [...ke];
    for (const d1 of [0, 1]) for (const d2 of [2, 3]) for (const [y] of cheo(c, d1, d2)) ke.add(y);
    VUA[c] = [...ke];
  }
  /* tốt: tiến về hàng 4 khi còn ở nhà mình; sang nhà khác thì tiến về hàng quân của nhà đó (theo chỗ đứng, không cần nhớ
     tốt từ đâu tới). Ăn chéo phía trước, qua tâm thì thêm nhánh. */
  const TOT_TIEN = [[], [], []], TOT_AN = [[], [], []], TOT_BI_AN = [[], [], []];
  for (let P = 0; P < 3; P++) {
    for (let c = 0; c < 96; c++) TOT_BI_AN[P][c] = [];
    for (let c = 0; c < 96; c++) {
      const nha = c >> 5, f = c & 7, tien = nha === P ? (f < 4 ? 1 : 3) : (f < 4 ? 0 : 2);
      const s = buoc(c, tien);
      TOT_TIEN[P][c] = s ? s[0] : -1;
      const an = [];
      for (const ben of VUONG(tien)) for (const [y] of cheo(c, tien, ben)) if (!an.includes(y)) an.push(y);
      TOT_AN[P][c] = an;
      for (const y of an) TOT_BI_AN[P][y].push(c);
    }
  }
  const HOA_THI = [0, 1, 2, 3, 4, 5].map(n => tuDieu(n, 0, 0));
  /* khoảng cách (bước vua) tới hoa thị: để chấm điểm quân ở gần giữa bàn */
  const XA_TAM = new Array(96).fill(99);
  { const q = HOA_THI.slice(); q.forEach(c => { XA_TAM[c] = 0; });
    for (let i = 0; i < q.length; i++) for (const y of VUA[q[i]]) if (XA_TAM[y] > XA_TAM[q[i]] + 1) { XA_TAM[y] = XA_TAM[q[i]] + 1; q.push(y); } }

  /* ---------- quân, thế cờ ----------
     mã quân = P·8 + loại; loại 1 tốt, 2 mã, 3 tượng, 4 xe, 5 hậu, 6 vua. Quân của nhà đã bị loại vẫn nằm đó ("đá"). */
  const TOT = 1, MA_ = 2, TUONG = 3, XE = 4, HAU = 5, VUA_ = 6;
  const GIA = [0, 100, 300, 320, 500, 900, 0];
  const THU_TU = [0, 2, 1];                                           // Trắng → Đen → Đỏ, theo chiều kim đồng hồ
  const HANG_QUAN = [XE, MA_, TUONG, HAU, VUA_, TUONG, MA_, XE];      // hậu bên trái vua, như mọi bản cờ ba người
  function theMoi() {
    const o = new Int8Array(96);
    for (let P = 0; P < 3; P++) for (let f = 0; f < 8; f++) { o[oCua(P, f, 1)] = P * 8 + HANG_QUAN[f]; o[oCua(P, f, 2)] = P * 8 + TOT; }
    return { o, luot: 0, song: [1, 1, 1], vua: [oCua(0, 4, 1), oCua(1, 4, 1), oCua(2, 4, 1)], nhap: 63, dem50: 0, soNuoc: 0, thang: -1, hoa: false };
  }
  const chepThe = (t) => ({ o: Int8Array.from(t.o), luot: t.luot, song: t.song.slice(), vua: t.vua.slice(), nhap: t.nhap, dem50: t.dem50, soNuoc: t.soNuoc, thang: t.thang, hoa: t.hoa });
  const soSong = (t) => t.song[0] + t.song[1] + t.song[2];
  function keTiep(t, P) { let i = THU_TU.indexOf(P); for (let k = 0; k < 3; k++) { i = (i + 1) % 3; if (t.song[THU_TU[i]]) return THU_TU[i]; } return P; }

  /* ô c có bị nhà nào còn sống (khác P) nhắm tới không */
  function biNham(t, c, P) {
    const o = t.o, song = t.song;
    const dich = (x) => { const Q = x >> 3; return Q !== P && song[Q]; };
    for (const y of MA[c]) { const x = o[y]; if (x && (x & 7) === MA_ && dich(x)) return true; }
    for (const y of VUA[c]) { const x = o[y]; if (x && (x & 7) === VUA_ && dich(x)) return true; }
    for (let Q = 0; Q < 3; Q++) if (Q !== P && song[Q]) for (const y of TOT_BI_AN[Q][c]) if (o[y] === Q * 8 + TOT) return true;
    for (const tia of TRUC[c]) for (const y of tia) { const x = o[y]; if (!x) continue; if (((x & 7) === XE || (x & 7) === HAU) && dich(x)) return true; break; }
    for (const tia of CHEO[c]) for (const y of tia) { const x = o[y]; if (!x) continue; if (((x & 7) === TUONG || (x & 7) === HAU) && dich(x)) return true; break; }
    return false;
  }
  const biChieu = (t, P) => t.song[P] && t.vua[P] >= 0 && biNham(t, t.vua[P], P);
  /* những quân đang chiếu vua P, kèm đường đi của chúng (để vẽ "báo nguy") */
  function aiChieu(t, P) {
    const o = t.o, c = t.vua[P], ra = [];
    if (c < 0 || !t.song[P]) return ra;
    const dich = (x) => { const Q = x >> 3; return Q !== P && t.song[Q]; };
    for (const y of MA[c]) { const x = o[y]; if (x && (x & 7) === MA_ && dich(x)) ra.push({ o: y, duong: [y, c] }); }
    for (const y of VUA[c]) { const x = o[y]; if (x && (x & 7) === VUA_ && dich(x)) ra.push({ o: y, duong: [y, c] }); }
    for (let Q = 0; Q < 3; Q++) if (Q !== P && t.song[Q]) for (const y of TOT_BI_AN[Q][c]) if (o[y] === Q * 8 + TOT) ra.push({ o: y, duong: [y, c] });
    const quet = (tias, loai) => { for (const tia of tias) for (let i = 0; i < tia.length; i++) { const x = o[tia[i]]; if (!x) continue;
      if (loai.includes(x & 7) && dich(x) && !ra.some(r => r.o === tia[i])) ra.push({ o: tia[i], duong: tia.slice(0, i + 1).reverse().concat([c]) }); break; } };
    quet(TRUC[c], [XE, HAU]); quet(CHEO[c], [TUONG, HAU]);
    return ra;
  }

  /* ---------- nước đi ----------
     nước = { tu, toi, phong (loại quân phong, 0 nếu không), nhap (1 nhập thành cánh vua, 2 cánh hậu) } */
  const laHangCuoi = (P, c) => (c >> 5) !== P && hangO(c) === 1;
  function nuocGia(t, P, chiAn, ds) {
    const o = t.o, tem = nuocGia.tem || (nuocGia.tem = new Int32Array(96));
    let dau = (nuocGia.dau = (nuocGia.dau || 0) + 1);
    for (let c = 0; c < 96; c++) {
      const x = o[c];
      if (!x || (x >> 3) !== P) continue;
      const loai = x & 7;
      const them = (toi) => {
        const y = o[toi];
        if (y && (y >> 3) === P) return;
        if (chiAn && !y) return;
        ds.push({ tu: c, toi, phong: 0, nhap: 0 });
      };
      if (loai === TOT) {
        const toi = TOT_TIEN[P][c];
        if (toi >= 0 && !o[toi] && !chiAn) {
          if (laHangCuoi(P, toi)) ds.push({ tu: c, toi, phong: HAU, nhap: 0 });
          else {
            ds.push({ tu: c, toi, phong: 0, nhap: 0 });
            if ((c >> 5) === P && hangO(c) === 2) { const t2 = TOT_TIEN[P][toi]; if (t2 >= 0 && !o[t2]) ds.push({ tu: c, toi: t2, phong: 0, nhap: 0 }); }
          }
        } else if (toi >= 0 && !o[toi] && chiAn && laHangCuoi(P, toi)) ds.push({ tu: c, toi, phong: HAU, nhap: 0 });
        for (const y of TOT_AN[P][c]) { const z = o[y]; if (z && (z >> 3) !== P) ds.push({ tu: c, toi: y, phong: laHangCuoi(P, y) ? HAU : 0, nhap: 0 }); }
      } else if (loai === MA_) { for (const y of MA[c]) them(y); }
      else if (loai === VUA_) {
        for (const y of VUA[c]) them(y);
        if (!chiAn) nhapThanh(t, P, c, ds);
      } else {
        dau = ++nuocGia.dau;
        const tias = loai === XE ? TRUC[c] : loai === TUONG ? CHEO[c] : TRUC[c].concat(CHEO[c]);
        for (const tia of tias) for (const y of tia) {
          const z = o[y];
          if (tem[y] !== dau) { tem[y] = dau; if (!z) { if (!chiAn) ds.push({ tu: c, toi: y, phong: 0, nhap: 0 }); } else if ((z >> 3) !== P) ds.push({ tu: c, toi: y, phong: 0, nhap: 0 }); }
          if (z) break;
        }
      }
    }
    return ds;
  }
  function nhapThanh(t, P, c, ds) {
    if (c !== oCua(P, 4, 1) || !(t.nhap & (3 << (2 * P)))) return;
    const o = t.o;
    if (biNham(t, c, P)) return;
    if ((t.nhap & (1 << (2 * P))) && o[oCua(P, 7, 1)] === P * 8 + XE && !o[oCua(P, 5, 1)] && !o[oCua(P, 6, 1)]
        && !biNham(t, oCua(P, 5, 1), P) && !biNham(t, oCua(P, 6, 1), P)) ds.push({ tu: c, toi: oCua(P, 6, 1), phong: 0, nhap: 1 });
    if ((t.nhap & (2 << (2 * P))) && o[oCua(P, 0, 1)] === P * 8 + XE && !o[oCua(P, 1, 1)] && !o[oCua(P, 2, 1)] && !o[oCua(P, 3, 1)]
        && !biNham(t, oCua(P, 3, 1), P) && !biNham(t, oCua(P, 2, 1), P)) ds.push({ tu: c, toi: oCua(P, 2, 1), phong: 0, nhap: 2 });
  }
  /* đi một nước (sửa thẳng vào t), trả thông tin để hoàn lại */
  function diNuoc(t, m) {
    const o = t.o, x = o[m.tu], P = x >> 3, an = o[m.toi];
    const lui = { m, x, an, nhap: t.nhap, dem50: t.dem50, vua: t.vua.slice(), song: t.song.slice() };
    o[m.toi] = m.phong ? P * 8 + m.phong : x; o[m.tu] = 0;
    if ((x & 7) === VUA_) {
      t.vua[P] = m.toi; t.nhap &= ~(3 << (2 * P));
      if (m.nhap === 1) { o[oCua(P, 5, 1)] = o[oCua(P, 7, 1)]; o[oCua(P, 7, 1)] = 0; }
      if (m.nhap === 2) { o[oCua(P, 3, 1)] = o[oCua(P, 0, 1)]; o[oCua(P, 0, 1)] = 0; }
    }
    for (let Q = 0; Q < 3; Q++) {                                    // xe rời chỗ cũ, hay bị ăn ở chỗ cũ: mất quyền nhập thành
      if (m.tu === oCua(Q, 7, 1) || m.toi === oCua(Q, 7, 1)) t.nhap &= ~(1 << (2 * Q));
      if (m.tu === oCua(Q, 0, 1) || m.toi === oCua(Q, 0, 1)) t.nhap &= ~(2 << (2 * Q));
    }
    if (an && (an & 7) === VUA_ && t.song[an >> 3]) { t.song[an >> 3] = 0; t.vua[an >> 3] = -1; }   // ăn vua: nhà đó bị loại
    t.dem50 = an || (x & 7) === TOT ? 0 : t.dem50 + 1;
    t.soNuoc++;
    return lui;
  }
  function hoanNuoc(t, lui) {
    const o = t.o, m = lui.m, P = lui.x >> 3;
    o[m.tu] = lui.x; o[m.toi] = lui.an;
    if (m.nhap === 1) { o[oCua(P, 7, 1)] = o[oCua(P, 5, 1)]; o[oCua(P, 5, 1)] = 0; }
    if (m.nhap === 2) { o[oCua(P, 0, 1)] = o[oCua(P, 3, 1)]; o[oCua(P, 3, 1)] = 0; }
    t.nhap = lui.nhap; t.dem50 = lui.dem50; t.vua = lui.vua; t.song = lui.song; t.soNuoc--;
  }
  /* nước hợp lệ: không để vua mình bị nhắm sau khi đi */
  function nuocHopLe(t, P, chiAn) {
    const gia = nuocGia(t, P, !!chiAn, []), ra = [];
    for (const m of gia) { const lui = diNuoc(t, m); if (!biChieu(t, P)) ra.push(m); hoanNuoc(t, lui); }
    return ra;
  }
  /* đường quân đi qua (để trượt quân theo đúng đường cong qua tâm) */
  function duongDi(t, m) {
    const x = t.o[m.tu], loai = x & 7;
    if (loai === XE || loai === TUONG || loai === HAU) {
      const tias = loai === XE ? TRUC[m.tu] : loai === TUONG ? CHEO[m.tu] : TRUC[m.tu].concat(CHEO[m.tu]);
      for (const tia of tias) { const i = tia.indexOf(m.toi); if (i >= 0 && tia.slice(0, i).every(y => !t.o[y])) return [m.tu].concat(tia.slice(0, i + 1)); }
    }
    if (loai === TOT && (m.toi === TOT_TIEN[x >> 3][TOT_TIEN[x >> 3][m.tu]])) return [m.tu, TOT_TIEN[x >> 3][m.tu], m.toi];
    if (m.nhap === 1) return [m.tu, oCua(x >> 3, 5, 1), m.toi];
    if (m.nhap === 2) return [m.tu, oCua(x >> 3, 3, 1), m.toi];
    return [m.tu, m.toi];
  }

  /* ---------- sau mỗi nước: tới lượt ai, ai bị loại, hết ván chưa ----------
     trả danh sách sự kiện để màn hình nói ra. Sửa thẳng vào t. */
  function sauNuoc(t, lui) {
    const ev = [];
    if (lui && lui.an && (lui.an & 7) === VUA_ && lui.song[lui.an >> 3]) ev.push({ loai: 'anvua', ai: lui.x >> 3, bi: lui.an >> 3 });
    if (soSong(t) <= 1) { t.thang = t.song.indexOf(1); ev.push({ loai: 'thang', ai: t.thang }); return ev; }
    let P = t.luot, dem = 0;
    for (;;) {
      P = keTiep(t, P);
      if (++dem > 6) { t.hoa = true; ev.push({ loai: 'hoa', vi: 'kẹt' }); return ev; }
      if (nuocHopLe(t, P).length) break;
      if (biChieu(t, P)) {
        t.song[P] = 0; t.vua[P] = -1; ev.push({ loai: 'chieuhet', bi: P });
        if (soSong(t) <= 1) { t.thang = t.song.indexOf(1); ev.push({ loai: 'thang', ai: t.thang }); return ev; }
      } else {
        if (soSong(t) === 2) { t.hoa = true; ev.push({ loai: 'hoa', vi: 'hếtnước', ai: P }); return ev; }
        ev.push({ loai: 'boluot', ai: P });
      }
    }
    t.luot = P;
    if (t.dem50 >= 50 * soSong(t)) { t.hoa = true; ev.push({ loai: 'hoa', vi: '50' }); return ev; }
    if (thieuQuan(t)) { t.hoa = true; ev.push({ loai: 'hoa', vi: 'thiếuquân' }); return ev; }
    for (let Q = 0; Q < 3; Q++) if (Q !== P && t.song[Q] && biChieu(t, Q)) ev.push({ loai: 'chieu', bi: Q });
    if (biChieu(t, P)) ev.push({ loai: 'chieu', bi: P });
    return ev;
  }
  /* còn hai nhà mà chẳng nhà nào đủ quân chiếu hết (chỉ còn vua, hay vua với một mã/tượng): hoà */
  function thieuQuan(t) {
    if (soSong(t) !== 2) return false;
    for (let c = 0; c < 96; c++) { const x = t.o[c]; if (!x || !t.song[x >> 3]) continue; const l = x & 7; if (l === TOT || l === XE || l === HAU) return false; }
    const nhe = [0, 0, 0];
    for (let c = 0; c < 96; c++) { const x = t.o[c]; if (x && t.song[x >> 3] && ((x & 7) === MA_ || (x & 7) === TUONG)) nhe[x >> 3]++; }
    return nhe.every(n => n <= 1);
  }

  /* ---------- chấm điểm thế cờ ----------
     Điểm một nhà = giá quân + điểm vị trí; nhà đã loại tính 0. Máy nhìn từ phía mình: điểm mình − trung bình hai nhà kia.
     Tính cách: Hổ cộng điểm cho quân đã sang nhà người và quân áp sát vua địch; Rùa cộng điểm cho quân đứng che vua mình. */
  function diemNha(t, P, tc) {
    const o = t.o;
    let s = 0, quanLon = 0;
    for (let c = 0; c < 96; c++) { const x = o[c]; if (x && (x >> 3) !== P && t.song[x >> 3] && (x & 7) >= MA_ && (x & 7) <= HAU) quanLon++; }
    const tanCuoc = quanLon <= 4;
    for (let c = 0; c < 96; c++) {
      const x = o[c];
      if (!x || (x >> 3) !== P) continue;
      const loai = x & 7, nha = c >> 5, r = hangO(c), xa = XA_TAM[c];
      s += GIA[loai];
      if (loai === TOT) s += nha === P ? (r - 2) * 8 : 30 + (4 - r) * 18;
      else if (loai === MA_) s += (6 - Math.min(6, xa)) * 6;
      else if (loai === TUONG) s += (6 - Math.min(6, xa)) * 4;
      else if (loai === XE) s += nha !== P ? 12 : 0;
      else if (loai === HAU) s += (6 - Math.min(6, xa)) * 2;
      else if (loai === VUA_) s += tanCuoc ? (6 - Math.min(6, xa)) * 6 : (nha === P && r === 1 ? 24 : -16 - (6 - Math.min(6, xa)) * 4);
      if (tc && loai !== VUA_) {
        if (tc.hang && nha !== P) s += 10;
        if (tc.hang) for (let Q = 0; Q < 3; Q++) if (Q !== P && t.song[Q] && t.vua[Q] >= 0 && VUA[t.vua[Q]].includes(c)) s += 22;
        if (tc.chac && t.vua[P] >= 0 && VUA[t.vua[P]].includes(c)) s += 14;
      }
    }
    return s;
  }
  function danhGia(t, X, tc) {
    if (!t.song[X]) return -100000;
    let dich = 0;
    for (let Q = 0; Q < 3; Q++) if (Q !== X && t.song[Q]) dich += diemNha(t, Q, null);
    return diemNha(t, X, tc) - dich / 2;
  }

  /* ---------- tìm nước ----------
     kieu 'hoangtuong': hai đối thủ cùng tìm cách hại mình (min, min). kieu 'brs': Best-Reply Search — sau nước mình, chỉ
     một đối thủ đi (ai có nước đáp mạnh nhất), rồi lại tới mình. Tìm sâu dần tới khi hết giờ. */
  const VO_CUC = 1e6;
  function timNuoc(t0, X, ch) {
    const t = chepThe(t0), cauHinh = Object.assign({ kieu: 'hoangtuong', sau: 3, ms: 900, tinhCach: null, nhieu: 0 }, ch || {});
    const tc = cauHinh.tinhCach, hetGio = Date.now() + cauHinh.ms;
    let nut = 0;
    const DUNG = {};
    const kiemGio = () => { if ((++nut & 511) === 0 && Date.now() > hetGio) throw DUNG; };
    const xepNuoc = (ds) => {
      for (const m of ds) { const an = t.o[m.toi]; m.k = an ? ((an & 7) === VUA_ ? 1e5 : GIA[an & 7] * 10 - GIA[t.o[m.tu] & 7] / 10) : 0; if (m.phong) m.k += 800; }
      return ds.sort((a, b) => b.k - a.k);
    };
    const dg = () => danhGia(t, X, tc) + (cauHinh.nhieu ? (Math.random() - .5) * cauHinh.nhieu : 0);
    function ketThuc(ply) {
      if (!t.song[X]) return -VO_CUC + ply;
      if (soSong(t) === 1) return VO_CUC - ply;
      return null;
    }
    /* tĩnh lặng: tới đáy thì chỉ xét nước ăn quân, kẻo dừng giữa một cuộc đổi quân */
    function tinh(a, b, P, ply, qd, max, brs) {
      kiemGio();
      const kt = ketThuc(ply); if (kt !== null) return kt;
      const dung = dg();
      if (qd >= 4) return dung;
      if (max) { if (dung >= b) return dung; if (dung > a) a = dung; } else { if (dung <= a) return dung; if (dung < b) b = dung; }
      let ds;
      if (brs && !max) { ds = []; for (let Q = 0; Q < 3; Q++) if (Q !== X && t.song[Q]) for (const m of nuocHopLe(t, Q, true)) ds.push(m); }
      else ds = nuocHopLe(t, P, true);
      let best = dung;
      for (const m of xepNuoc(ds)) {
        const lui = diNuoc(t, m);
        const v = brs ? tinh(a, b, X, ply + 1, qd + 1, !max, true) : tinh(a, b, keTiep(t, P), ply + 1, qd + 1, keTiep(t, P) === X, false);
        hoanNuoc(t, lui);
        if (max) { if (v > best) best = v; if (best > a) a = best; } else { if (v < best) best = v; if (best < b) b = best; }
        if (a >= b) break;
      }
      return best;
    }
    function ab(depth, a, b, P, ply, max, brs) {
      kiemGio();
      const kt = ketThuc(ply); if (kt !== null) return kt;
      if (depth <= 0) return tinh(a, b, P, ply, 0, max, brs);
      let ds;
      if (brs && !max) { ds = []; for (let Q = 0; Q < 3; Q++) if (Q !== X && t.song[Q]) for (const m of nuocHopLe(t, Q)) ds.push(m); }
      else ds = nuocHopLe(t, P);
      if (!ds.length) {
        const ai = brs && !max ? -1 : P;
        if (ai >= 0 && biChieu(t, ai)) {                               // bị chiếu hết: loại nhà đó rồi đi tiếp
          const s = t.song.slice(), v0 = t.vua.slice();
          t.song[ai] = 0; t.vua[ai] = -1;
          const v = brs ? ab(depth - 1, a, b, X, ply + 1, !max, true) : ab(depth - 1, a, b, keTiep(t, ai), ply + 1, keTiep(t, ai) === X, false);
          t.song = s; t.vua = v0;
          return v;
        }
        if (soSong(t) === 2) return 0;
        return brs ? ab(depth - 1, a, b, X, ply + 1, !max, true) : ab(depth - 1, a, b, keTiep(t, P), ply + 1, keTiep(t, P) === X, false);
      }
      let best = max ? -Infinity : Infinity;
      for (const m of xepNuoc(ds)) {
        const lui = diNuoc(t, m);
        const v = brs ? ab(depth - 1, a, b, X, ply + 1, !max, true) : ab(depth - 1, a, b, keTiep(t, P), ply + 1, keTiep(t, P) === X, false);
        hoanNuoc(t, lui);
        if (max) { if (v > best) best = v; if (best > a) a = best; } else { if (v < best) best = v; if (best < b) b = best; }
        if (a >= b) break;
      }
      return best;
    }
    const brs = cauHinh.kieu === 'brs';
    let goc = xepNuoc(nuocHopLe(t, X));
    if (!goc.length) return { nuoc: null };
    let tot = goc[0], diem = -Infinity, sauXong = 0;
    for (let sau = 1; sau <= cauHinh.sau; sau++) {
      let botNhat = null, botDiem = -Infinity;
      try {
        for (const m of goc) {
          const lui = diNuoc(t, m);
          const v = brs ? ab(sau - 1, botDiem, Infinity, X, 1, false, true) : ab(sau - 1, botDiem, Infinity, keTiep(t, X), 1, keTiep(t, X) === X, false);
          hoanNuoc(t, lui);
          m.v = v;
          if (v > botDiem) { botDiem = v; botNhat = m; }
        }
      } catch (e) {
        if (e !== DUNG) throw e;
        if (botNhat && botDiem > -Infinity && sauXong >= 1 && botNhat === goc[0]) { tot = botNhat; diem = botDiem; }
        break;
      }
      tot = botNhat; diem = botDiem; sauXong = sau;
      goc = goc.slice().sort((p, q) => (q.v || -Infinity) - (p.v || -Infinity));
      if (Math.abs(diem) > VO_CUC / 2) break;
    }
    return { nuoc: { tu: tot.tu, toi: tot.toi, phong: tot.phong, nhap: tot.nhap }, diem, sau: sauXong, nut };
  }

  return {
    oCua, nhaO, cotO, hangO, dieu, tuDieu, buoc, cheo, BANG: { TRUC, CHEO, MA, VUA, KE }, TOT_TIEN, TOT_AN, TOT_BI_AN, HOA_THI, XA_TAM,
    LOAI: { TOT, MA: MA_, TUONG, XE, HAU, VUA: VUA_ }, GIA, THU_TU, theMoi, chepThe, soSong, keTiep, biNham, biChieu, aiChieu,
    nuocGia, nuocHopLe, diNuoc, hoanNuoc, duongDi, sauNuoc, thieuQuan, danhGia, timNuoc,
  };
}
const L = LOI();

/* ======================================================================================================
   MÁY NGHĨ Ở LUỒNG RIÊNG: dựng Web Worker từ chính mã lõi (LOI viết tự chứa), khỏi tải tệp nào thêm — chạy được cả khi
   mất mạng. Không tạo được Worker thì nghĩ ngay trên luồng chính.
   ====================================================================================================== */
let tho = null, viec = 0;
const choViec = new Map();                                            // số việc → hàm nhận kết quả
function taoTho() {
  if (tho || typeof Worker !== 'function' || typeof Blob !== 'function' || typeof URL === 'undefined' || !URL.createObjectURL) return;
  try {
    const ma = `const L=(${LOI.toString()})();onmessage=e=>{const d=e.data;postMessage({so:d.so,kq:L.timNuoc(d.the,d.P,d.ch)});};`;
    tho = new Worker(URL.createObjectURL(new Blob([ma], { type: 'text/javascript' })));
    tho.onmessage = (e) => { const f = choViec.get(e.data.so); choViec.delete(e.data.so); if (f) f(e.data.kq); };
    tho.onerror = () => { tho = null; };
  } catch (e) { tho = null; }
}
/* bỏ việc máy đang nghĩ (hoàn tác, ván mới): luồng nghĩ đang bận thì dựng lại cho khỏi phải chờ nó nghĩ xong */
function boViec() {
  viec++;
  if (van) van.dangNghi = -1;
  if (choViec.size && tho) { tho.terminate(); tho = null; choViec.clear(); taoTho(); }
}
function nhoMayNghi(P) {
  const so = ++viec, ch = cauHinhMay(P), the = L.chepThe(van.the), batDau = Date.now();
  van.dangNghi = P;
  capNhatChu();
  const xong = (kq) => setTimeout(() => apDungNuocMay(so, P, kq), Math.max(0, 450 - (Date.now() - batDau)));   // để người xem kịp theo
  if (tho) { choViec.set(so, xong); tho.postMessage({ so, the, P, ch }); }
  else setTimeout(() => xong(L.timNuoc(the, P, ch)), 40);
}
function apDungNuocMay(so, P, kq) {
  if (so !== viec || !van || van.dangNghi !== P) return;              // việc cũ (đã hoàn tác, ván mới)
  van.dangNghi = -1;
  if (!kq || !kq.nuoc) return;
  diNuoc(kq.nuoc, P);
}

/* ======================================================================================================
   GIAO DIỆN
   ====================================================================================================== */
const TEN_MAU = ['Trắng', 'Đỏ', 'Đen'];
const MAU = [                                                         // màu quân: sáng, giữa, tối, viền
  { sang: '#fffdf6', giua: '#efe6d2', toi: '#c9bb9c', vien: '#3b2f22', cham: '#f4ecd8' },
  { sang: '#ff9a8a', giua: '#e0473a', toi: '#9e2219', vien: '#3a0b07', cham: '#e0473a' },
  { sang: '#6c7590', giua: '#363d52', toi: '#151925', vien: '#dfe6fb', cham: '#2b3142' },
];
const DA = { sang: '#c8c4bc', giua: '#9a968e', toi: '#66635d', vien: '#34322e' };
const TINH_CACH = {
  ho: { ten: 'Hổ', hang: true, kieu: 'brs',
    noi: { batDau: ['Vào trận thôi!', 'Hổ đây, ai trước nào?'], an: ['Ngon!', 'Của tôi nhé!', 'Xin nhé!'], chieu: ['Chiếu! Chạy đi đâu?', 'Chiếu tướng!'],
      mat: ['Hừ, nhớ đấy!', 'Được lắm!'], loai: ['Một người ra khỏi trận!'], biLoai: ['Hổ thua rồi… lần sau gặp lại!'], thang: ['Hổ vô địch!'] } },
  rua: { ten: 'Rùa', chac: true, kieu: 'hoangtuong',
    noi: { batDau: ['Chơi chậm thôi nhé.', 'Chậm mà chắc.'], an: ['Từ từ mà chắc.', 'Nhặt được rồi.', 'Cảm ơn nhé.'], chieu: ['Chiếu nhé, cẩn thận.'],
      mat: ['Không sao, còn nhiều.', 'Ừm…'], loai: ['Chậm mà chắc.'], biLoai: ['Rùa xin rút trước.'], thang: ['Rùa về đích!'] } },
};
const KHO = [{ ten: 'Dễ', sau: 2, ms: 400, nhieu: 140 }, { ten: 'Vừa', sau: 3, ms: 700, nhieu: 16 }, { ten: 'Khó', sau: 6, ms: 1500, nhieu: 0 }];
const KHOA = 'tdtd.coba';
const docLuu = () => { try { const o = JSON.parse(localStorage.getItem(KHOA) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const ghiLuu = (them) => { try { localStorage.setItem(KHOA, JSON.stringify(Object.assign(docLuu(), them))); } catch (e) {} };

let tam = null, cv = null, ctx = null, W = 360, H = 420, DPR = 1, raf = 0;
let van = null;                                                       // ván đang chơi
let chon = -1, nuocCuaChon = [], hoat = null, cho = [], xoay = 0, xoayDen = 0, demo = null, phongCho = null;
let coTieng = true, am = null;

/* ---------- hình bàn ----------
   Lục giác bán kính 1, đỉnh V_i ở góc 240° + 60°·i (Trắng ở cạnh dưới). Diều n: tâm, trung điểm M_{n−1}, đỉnh V_n,
   trung điểm M_n; ô (p, q) lấy bốn góc theo nội suy song tuyến — đúng cách chia của bằng sáng chế. */
const DINH = [0, 1, 2, 3, 4, 5].map(i => { const a = (240 + 60 * i) * Math.PI / 180; return [Math.cos(a), Math.sin(a)]; });
const GIUA = DINH.map((v, i) => { const w = DINH[(i + 1) % 6]; return [(v[0] + w[0]) / 2, (v[1] + w[1]) / 2]; });
function diemDieu(n, p, q) {
  const u = p / 4, v = q / 4, M1 = GIUA[n], M0 = GIUA[(n + 5) % 6], V = DINH[n];
  return [u * (1 - v) * M1[0] + (1 - u) * v * M0[0] + u * v * V[0], u * (1 - v) * M1[1] + (1 - u) * v * M0[1] + u * v * V[1]];
}
const GOC_O = [], TAM_O = [], CO_O = [];
for (let c = 0; c < 96; c++) {
  const [n, p, q] = L.dieu(c);
  GOC_O[c] = [diemDieu(n, p, q), diemDieu(n, p + 1, q), diemDieu(n, p + 1, q + 1), diemDieu(n, p, q + 1)];
  TAM_O[c] = diemDieu(n, p + .5, q + .5);
  /* cỡ ô: khoảng cách ngắn nhất từ tâm ô tới bốn cạnh — để quân vừa ô (ô sát tâm to hơn ô ngoài rìa) */
  let m = Infinity;
  for (let k = 0; k < 4; k++) {
    const a = GOC_O[c][k], b = GOC_O[c][(k + 1) % 4], dx = b[0] - a[0], dy = b[1] - a[1];
    m = Math.min(m, Math.abs((TAM_O[c][0] - a[0]) * dy - (TAM_O[c][1] - a[1]) * dx) / Math.hypot(dx, dy));
  }
  CO_O[c] = m;
}
const GOC_NHIN = [0, -2 * Math.PI / 3, 2 * Math.PI / 3];              // xoay bàn cho nhà P nằm dưới
let ban = { cx: 0, cy: 0, R: 100 };
function veRa(x, y) {                                                // toạ độ bàn → màn hình
  const c = Math.cos(xoay), s = Math.sin(xoay);
  return [ban.cx + (x * c - y * s) * ban.R, ban.cy - (x * s + y * c) * ban.R];
}
function vaoBan(px, py) {                                            // màn hình → toạ độ bàn
  const X = (px - ban.cx) / ban.R, Y = -(py - ban.cy) / ban.R, c = Math.cos(-xoay), s = Math.sin(-xoay);
  return [X * c - Y * s, X * s + Y * c];
}
function trongTuGiac(g, x, y) {
  let am = 0, duong = 0;
  for (let k = 0; k < 4; k++) {
    const a = g[k], b = g[(k + 1) % 4], z = (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    if (z < 0) am++; else duong++;
  }
  return !am || !duong;
}
function oTai(px, py) {
  const [x, y] = vaoBan(px, py);
  for (let c = 0; c < 96; c++) if (trongTuGiac(GOC_O[c], x, y)) return c;
  return -1;
}
function canhBan() {
  const le = 18;
  ban.R = Math.max(40, Math.min((W - le * 2) / 2, (H - le * 2) / Math.sqrt(3)));
  ban.cx = W / 2; ban.cy = H / 2;
}

/* ---------- vẽ ---------- */
function tron(a, b, t) { return a + (b - a) * t; }
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function pha(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2); return `rgb(${a.map((v, i) => Math.round(tron(v, b[i], t))).join(',')})`; }
const TONG_NHA = ['#f6e7c8', '#e06a5a', '#56607c'];                   // màu nhuộm nhẹ ba nhà
function veNen() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d0b22'); g.addColorStop(1, '#1b1840');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(230,236,255,.5)';
  for (let k = 0; k < 50; k++) { const x = (k * 97.13) % W, y = (k * 53.71) % H, r = k % 7 ? .7 : 1.3; ctx.fillRect(x, y, r, r); }
}
function duongDa(pts) { ctx.beginPath(); pts.forEach((p, i) => { const [x, y] = veRa(p[0], p[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
function veBan(t) {
  /* khung gỗ, bóng đổ, dải màu ba nhà dọc cạnh hàng quân */
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  duongDa(DINH.map(v => [v[0] * 1.075, v[1] * 1.075]));
  const gk = ctx.createLinearGradient(0, ban.cy - ban.R, 0, ban.cy + ban.R);
  gk.addColorStop(0, '#7a5034'); gk.addColorStop(1, '#4a2e1b');
  ctx.fillStyle = gk; ctx.fill();
  ctx.restore();
  for (let P = 0; P < 3; P++) {
    const a = DINH[2 * P], b = DINH[2 * P + 1];
    duongDa([[a[0] * 1.065, a[1] * 1.065], [b[0] * 1.065, b[1] * 1.065], [b[0] * 1.012, b[1] * 1.012], [a[0] * 1.012, a[1] * 1.012]]);
    ctx.fillStyle = van && !van.the.song[P] ? '#6d6a64' : MAU[P].giua; ctx.fill();
  }
  for (let c = 0; c < 96; c++) {
    const toi = (L.cotO(c) + L.hangO(c)) & 1;
    duongDa(GOC_O[c]);
    ctx.fillStyle = pha(toi ? '#b48b62' : '#ecdcb9', TONG_NHA[L.nhaO(c)], L.nhaO(c) ? .13 : .06);
    ctx.fill();
    ctx.strokeStyle = 'rgba(70,45,25,.35)'; ctx.lineWidth = 1; ctx.stroke();
  }
  /* hoa thị: ngôi sao nhỏ bằng đồng ở tâm, chỗ sáu ô gặp nhau */
  const [x0, y0] = veRa(0, 0), r = ban.R * .045;
  ctx.beginPath();
  for (let k = 0; k < 12; k++) { const a = xoay + k * Math.PI / 6, q = k % 2 ? r * .45 : r; ctx[k ? 'lineTo' : 'moveTo'](x0 + Math.cos(a) * q, y0 - Math.sin(a) * q); }
  ctx.closePath(); ctx.fillStyle = '#e8c070'; ctx.fill(); ctx.strokeStyle = '#7a5a22'; ctx.lineWidth = 1; ctx.stroke();
}
function toO(c, mau) { duongDa(GOC_O[c]); ctx.fillStyle = mau; ctx.fill(); }
function tamO(c) { return veRa(TAM_O[c][0], TAM_O[c][1]); }
function coO(c) { return CO_O[c] * ban.R; }

/* quân cờ vẽ bằng nét (không dùng chữ ♔♕: máy nào cũng giống nhau, có khối, có bóng) — cao 1 đơn vị, đế ở y = 0 */
function vePhan(loai, x, y, s, m, da) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(.04, .015, .37, .095, 0, 0, 6.2832); ctx.fill();
  const g = ctx.createLinearGradient(-.4, -.5, .4, -.3);
  g.addColorStop(0, m.sang); g.addColorStop(.55, m.giua); g.addColorStop(1, m.toi);
  ctx.fillStyle = g; ctx.strokeStyle = m.vien; ctx.lineWidth = .05; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const hinh = (f) => { ctx.beginPath(); f(); ctx.fill(); ctx.stroke(); };
  hinh(() => { ctx.moveTo(-.34, 0); ctx.lineTo(.34, 0); ctx.quadraticCurveTo(.37, -.1, .26, -.13); ctx.lineTo(-.26, -.13); ctx.quadraticCurveTo(-.37, -.1, -.34, 0); ctx.closePath(); });
  if (loai === 1) {                                                   // tốt
    hinh(() => { ctx.moveTo(-.18, -.13); ctx.quadraticCurveTo(-.09, -.32, -.11, -.46); ctx.lineTo(.11, -.46); ctx.quadraticCurveTo(.09, -.32, .18, -.13); ctx.closePath(); });
    hinh(() => ctx.ellipse(0, -.48, .17, .05, 0, 0, 6.2832));
    hinh(() => ctx.arc(0, -.66, .16, 0, 6.2832));
  } else if (loai === 4) {                                            // xe
    hinh(() => { ctx.moveTo(-.24, -.13); ctx.lineTo(-.19, -.6); ctx.lineTo(.19, -.6); ctx.lineTo(.24, -.13); ctx.closePath(); });
    hinh(() => { ctx.moveTo(-.28, -.6); ctx.lineTo(-.28, -.84); ctx.lineTo(-.17, -.84); ctx.lineTo(-.17, -.74); ctx.lineTo(-.06, -.74); ctx.lineTo(-.06, -.84); ctx.lineTo(.06, -.84);
      ctx.lineTo(.06, -.74); ctx.lineTo(.17, -.74); ctx.lineTo(.17, -.84); ctx.lineTo(.28, -.84); ctx.lineTo(.28, -.6); ctx.closePath(); });
  } else if (loai === 2) {                                            // mã
    hinh(() => { ctx.moveTo(.25, -.13); ctx.quadraticCurveTo(.3, -.55, .14, -.8); ctx.lineTo(.08, -.96); ctx.lineTo(-.02, -.84); ctx.quadraticCurveTo(-.2, -.78, -.33, -.56);
      ctx.quadraticCurveTo(-.36, -.47, -.28, -.45); ctx.lineTo(-.12, -.52); ctx.quadraticCurveTo(-.18, -.32, -.2, -.13); ctx.closePath(); });
    ctx.fillStyle = m.vien; ctx.beginPath(); ctx.arc(-.06, -.7, .035, 0, 6.2832); ctx.fill();
  } else if (loai === 3) {                                            // tượng
    hinh(() => { ctx.moveTo(-.2, -.13); ctx.quadraticCurveTo(-.32, -.46, 0, -.82); ctx.quadraticCurveTo(.32, -.46, .2, -.13); ctx.closePath(); });
    hinh(() => ctx.ellipse(0, -.24, .2, .05, 0, 0, 6.2832));
    ctx.beginPath(); ctx.moveTo(.04, -.64); ctx.lineTo(.14, -.5); ctx.stroke();
    hinh(() => ctx.arc(0, -.88, .06, 0, 6.2832));
  } else if (loai === 5) {                                            // hậu
    hinh(() => { ctx.moveTo(-.2, -.13); ctx.lineTo(-.31, -.66); ctx.lineTo(-.18, -.52); ctx.lineTo(-.16, -.72); ctx.lineTo(-.06, -.55); ctx.lineTo(0, -.77);
      ctx.lineTo(.06, -.55); ctx.lineTo(.16, -.72); ctx.lineTo(.18, -.52); ctx.lineTo(.31, -.66); ctx.lineTo(.2, -.13); ctx.closePath(); });
    for (const [bx, by] of [[-.31, -.69], [-.16, -.75], [0, -.81], [.16, -.75], [.31, -.69]]) hinh(() => ctx.arc(bx, by, .045, 0, 6.2832));
  } else if (loai === 6) {                                            // vua
    hinh(() => { ctx.moveTo(-.2, -.13); ctx.quadraticCurveTo(-.33, -.5, -.22, -.66); ctx.lineTo(.22, -.66); ctx.quadraticCurveTo(.33, -.5, .2, -.13); ctx.closePath(); });
    hinh(() => { ctx.rect(-.24, -.73, .48, .08); });
    hinh(() => { ctx.moveTo(-.04, -.73); ctx.lineTo(-.04, -.83); ctx.lineTo(-.12, -.83); ctx.lineTo(-.12, -.9); ctx.lineTo(-.04, -.9); ctx.lineTo(-.04, -.99); ctx.lineTo(.04, -.99);
      ctx.lineTo(.04, -.9); ctx.lineTo(.12, -.9); ctx.lineTo(.12, -.83); ctx.lineTo(.04, -.83); ctx.lineTo(.04, -.73); ctx.closePath(); });
  }
  if (da) {                                                          // quân đá: vài vết nứt
    ctx.strokeStyle = 'rgba(40,38,34,.6)'; ctx.lineWidth = .025;
    ctx.beginPath(); ctx.moveTo(-.1, -.3); ctx.lineTo(.02, -.42); ctx.lineTo(-.03, -.5); ctx.moveTo(.08, -.2); ctx.lineTo(.13, -.32); ctx.stroke();
  }
  ctx.restore();
}
function veQuan(x, c, toa, tiLe = 1, mo = 1) {
  const P = x >> 3, loai = x & 7, da = !demo && van && !van.the.song[P];
  const s = Math.max(15, Math.min(54, coO(c) * 2.15)) * tiLe;
  ctx.globalAlpha = mo;
  vePhan(loai, toa[0], toa[1] + s * .38, s, da ? DA : MAU[P], da);
  ctx.globalAlpha = 1;
}
function veDuongDo(duong, t) {                                       // báo nguy: đường đỏ từ quân đang chiếu tới vua
  const pts = duong.map(tamO);
  ctx.save();
  ctx.strokeStyle = 'rgba(255,70,60,.9)'; ctx.lineWidth = Math.max(2, ban.R * .012); ctx.setLineDash([7, 5]); ctx.lineDashOffset = -t / 40;
  ctx.shadowColor = 'rgba(255,60,50,.8)'; ctx.shadowBlur = 8;
  ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
  ctx.restore();
}
function veCanh(t) {
  if (!ctx) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  veNen();
  canhBan();
  veBan(t);
  if (demo) { veDemo(t); return; }
  if (!van) return;
  const the = van.the;
  /* nước vừa đi của từng nhà, cũ trước mới sau: tới lượt mình là thấy cả hai nhà kia vừa làm gì */
  const vet = (van.vet || []).map((v, P) => v && Object.assign({ P }, v)).filter(Boolean).sort((a, b) => a.thu - b.thu);
  vet.forEach((v, i) => {
    const moi = i === vet.length - 1, m = MUI[v.P].o;
    toO(v.duong[0], `rgba(${m},${moi ? .28 : .15})`); toO(v.duong[v.duong.length - 1], `rgba(${m},${moi ? .46 : .26})`);
  });
  if (chon >= 0) toO(chon, 'rgba(120,200,255,.45)');
  const nguoiXem = nhaNhin();
  const bao = nguoiXem >= 0 && the.song[nguoiXem] && the.thang < 0 ? L.aiChieu(the, nguoiXem) : [];
  if (bao.length) {
    const c = the.vua[nguoiXem], [x, y] = tamO(c), r = coO(c) * (1.1 + .15 * Math.sin(t / 160));
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.4);
    g.addColorStop(0, 'rgba(255,60,50,.55)'); g.addColorStop(1, 'rgba(255,60,50,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 1.4, 0, 6.2832); ctx.fill();
  }
  /* quân: chừa quân đang trượt, vẽ từ trên xuống dưới cho quân phía dưới đè quân phía trên */
  const thuTu = [];
  for (let c = 0; c < 96; c++) if (the.o[c] && !(hoat && (hoat.an === c || hoat.dau.includes(c)))) thuTu.push(c);
  thuTu.sort((a, b) => tamO(a)[1] - tamO(b)[1]);
  for (const c of thuTu) veQuan(the.o[c], c, tamO(c));
  vet.forEach((v, i) => veMuiTen(v, (chon >= 0 ? .35 : 1) * (i === vet.length - 1 ? .95 : i === vet.length - 2 ? .7 : .45)));
  for (const d of bao) veDuongDo(d.duong, t);
  if (chon >= 0 && nuocCuaChon.length) veDuongChon(the);
  for (const m of nuocCuaChon) {                                     // chỗ đi được: chấm trắng viền xanh, ăn quân thì vòng đỏ
    const [x, y] = tamO(m.toi), r = coO(m.toi);
    if (the.o[m.toi]) {
      ctx.lineWidth = Math.max(3, r * .2) + 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x, y, r * .82, 0, 6.2832); ctx.stroke();
      ctx.lineWidth = Math.max(3, r * .2); ctx.strokeStyle = 'rgba(215,40,30,.95)'; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(x, y, Math.max(4.5, r * .3), 0, 6.2832);
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(20,120,175,.95)'; ctx.stroke();
    }
  }
  if (hoat) veHoat(t);
}
/* màu mũi tên từng nhà (ruột, viền) và màu tô ô: chọn cho nổi trên gỗ sáng lẫn gỗ tối */
const MUI = [{ ruot: '#fff4c8', vien: 'rgba(60,40,20,.8)', o: '255,214,90' },
  { ruot: '#ff5a45', vien: 'rgba(255,255,255,.85)', o: '235,80,60' },
  { ruot: '#2f3a5c', vien: 'rgba(255,255,255,.85)', o: '80,120,220' }];
/* mũi tên theo đúng đường quân đã đi (xe, tượng, hậu qua tâm thì cong theo cột); mã nhảy thì vòng cung. Đầu mũi tên
   dừng trước tâm ô đích một chút cho khỏi che quân vừa tới. */
function veMuiTen(v, mo) {
  const pts = v.duong.map(tamO);
  if (pts.length < 2 || mo <= 0) return;
  const c = MUI[v.P], w = Math.max(3, ban.R * .026), cuoi = pts[pts.length - 1], dauMui = w * 2.7;
  let truoc = pts[pts.length - 2], dk = null;
  if (v.ma) {                                                         // mã: cung qua một điểm lệch sang bên
    const [a, b] = pts, dx = b[0] - a[0], dy = b[1] - a[1];
    dk = [(a[0] + b[0]) / 2 - dy * .28, (a[1] + b[1]) / 2 + dx * .28]; truoc = dk;
  }
  const g = Math.atan2(cuoi[1] - truoc[1], cuoi[0] - truoc[0]), lui = coO(v.duong[v.duong.length - 1]) * .45;
  const dinh = [cuoi[0] - Math.cos(g) * lui, cuoi[1] - Math.sin(g) * lui];
  const day = [dinh[0] - Math.cos(g) * dauMui, dinh[1] - Math.sin(g) * dauMui];
  const than = () => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    if (dk) ctx.quadraticCurveTo(dk[0], dk[1], day[0], day[1]);
    else { for (let i = 1; i < pts.length - 1; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineTo(day[0], day[1]); }
  };
  const mui = () => {
    const n = [-Math.sin(g) * w * 1.7, Math.cos(g) * w * 1.7];
    ctx.beginPath(); ctx.moveTo(dinh[0], dinh[1]); ctx.lineTo(day[0] + n[0], day[1] + n[1]); ctx.lineTo(day[0] - n[0], day[1] - n[1]); ctx.closePath();
  };
  ctx.save();
  ctx.globalAlpha = mo; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  than(); ctx.strokeStyle = c.vien; ctx.lineWidth = w + 3; ctx.stroke();
  mui(); ctx.fillStyle = c.vien; ctx.lineWidth = 3; ctx.strokeStyle = c.vien; ctx.stroke(); ctx.fill();
  than(); ctx.strokeStyle = c.ruot; ctx.lineWidth = w; ctx.stroke();
  mui(); ctx.fillStyle = c.ruot; ctx.fill();
  ctx.beginPath(); ctx.arc(pts[0][0], pts[0][1], w * .9, 0, 6.2832); ctx.fillStyle = c.ruot; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = c.vien; ctx.stroke();
  ctx.restore();
}
/* quân đang chọn: vẽ mọi đường nó đi được, uốn đúng theo bàn (đi qua tâm thì rẽ nhánh) — khỏi phải tự hình dung */
let duongChon = { c: -1, n: null, ds: [] };
function veDuongChon(the) {
  if (duongChon.c !== chon || duongChon.n !== nuocCuaChon) duongChon = { c: chon, n: nuocCuaChon, ds: nuocCuaChon.map(m => L.duongDi(the, m)) };
  const w = Math.max(2.5, ban.R * .016);
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [nen, rong] of [['rgba(10,35,60,.45)', w + 3], ['rgba(110,215,255,.9)', w]]) {
    ctx.strokeStyle = nen; ctx.lineWidth = rong;
    for (const d of duongChon.ds) { const pts = d.map(tamO); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
  }
  ctx.restore();
}
function nhaNhin() {                                                  // nhà đang được nhìn từ phía dưới bàn
  if (!van) return 0;
  return van.nguoiChoi >= 0 ? van.nguoiChoi : 0;
}

/* ---------- trượt quân theo đường đi (cong qua tâm) ---------- */
function veHoat(t) {
  const h = hoat, p = Math.min(1, (t - h.t0) / h.lau), e = p * p * (3 - 2 * p);
  for (const q of h.quan) {
    const pts = q.duong.map(tamO);
    let tong = 0; const doan = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); doan.push(d); tong += d; }
    let can = e * tong, i = 0;
    while (i < doan.length - 1 && can > doan[i]) { can -= doan[i]; i++; }
    const k = doan.length ? Math.min(1, can / (doan[i] || 1)) : 1, a = pts[i] || pts[0], b = pts[i + 1] || pts[0];
    const x = tron(a[0], b[0], k), y = tron(a[1], b[1], k) - (q.nhay ? Math.sin(e * Math.PI) * coO(q.duong[0]) * 1.2 : 0);
    const c = q.duong[Math.min(q.duong.length - 1, Math.round(e * (q.duong.length - 1)))];
    veQuan(q.x, c, [x, y], q.nhay ? 1 + Math.sin(e * Math.PI) * .12 : 1);
  }
  if (h.anX) veQuan(h.anX, h.an, tamO(h.an), 1, 1 - e);
  if (p >= 1) { const f = h.xong; hoat = null; f(); }
}

/* ---------- ván cờ ---------- */
function vanMoi(ch) {
  ch = Object.assign({ mau: 0, kho: 1 }, ch || {});
  roiPhong();                                                         // đấu với máy thì rời phòng đang ở (nếu có)
  boViec();
  const nguoi = [0, 1, 2].map(P => (P === ch.mau ? 'nguoi' : 'may'));
  const may = L.THU_TU.filter(P => nguoi[P] === 'may');
  const tinh = [null, null, null];
  const sauNguoi = (P) => { const i = L.THU_TU.indexOf(P); return [1, 2].map(k => L.THU_TU[(i + k) % 3]); };
  const [a, b] = sauNguoi(ch.mau); tinh[a] = 'ho'; tinh[b] = 'rua';
  van = { the: L.theMoi(), cheDo: 'may', nguoi, tinh, kho: ch.kho, nguoiChoi: ch.mau, lichSu: [], nuocCuoi: null, vet: [null, null, null], dangNghi: -1, an: [0, 0, 0], soNuoc: 0, xemTiep: false };
  chon = -1; nuocCuaChon = []; hoat = null; phongCho = null;
  xoay = xoayDen = GOC_NHIN[nhaNhin()];
  tatTin(); capNhatChu();
  for (const P of may) noi(P, 'batDau', 1, 400 + 900 * may.indexOf(P));
  denLuot();
}
function laNguoi(P) { return van.nguoi[P] === 'nguoi'; }
/* nhà P có phải người cầm máy này không (ván qua mạng: ghế của mình, lúc máy không đi thay) */
function laMinh(P) { return !!van && P === van.nguoiChoi && laNguoi(P); }
function tenNha(P) {
  if (!van) return TEN_MAU[P];
  if (P === van.nguoiChoi && (van.cheDo === 'phong' || laNguoi(P))) return 'Bạn';
  if (van.tinh[P]) return TINH_CACH[van.tinh[P]].ten;
  const g = gheCua(P);
  return (g && g.ten) || TEN_MAU[P];
}
function cauHinhMay(P) {
  const k = KHO[van.kho], tc = TINH_CACH[van.tinh[P]] || TINH_CACH.rua;
  return { kieu: tc.kieu, sau: k.sau, ms: k.ms, nhieu: k.nhieu, tinhCach: { hang: !!tc.hang, chac: !!tc.chac } };
}
/* tới lượt ai: người thì chờ chạm, máy thì nhờ nghĩ. Ván qua mạng: nước người khác tới từ máy chủ (chayPhong); ghế máy
   chơi thay thì máy của người chạy máy nghĩ giùm (toiChayMay) */
function denLuot() {
  const the = van.the;
  capNhatChu();
  if (the.thang >= 0 || the.hoa) {
    if (!van.hetVan) { van.hetVan = true; setTimeout(() => ketThucVan(), 700); }
    return;
  }
  const P = the.luot;
  if (van.cheDo === 'phong') {
    if (phong && phong.cay && phong.cay.nuoc && phong.cay.nuoc[phong.ke]) { chayPhong(); return; }
    if (laMinh(P)) { if (phong && phong.song && phong.baoLuot !== phong.ke) { phong.baoLuot = phong.ke; tiengToiLuot(); } return; }
    if (!laNguoi(P) && van.dangNghi < 0 && phong && phong.nghiO !== phong.ke && toiChayMay()) { phong.nghiO = phong.ke; nhoMayNghi(P); }
    return;
  }
  if (laNguoi(P)) { van.lichSu.push({ the: L.chepThe(the), nuocCuoi: van.nuocCuoi, vet: (van.vet || []).slice(), an: van.an.slice() }); capNhatChu(); return; }
  if (!the.song[van.nguoiChoi] && !van.xemTiep) return;               // bạn bị loại: chờ chọn xem tiếp hay ván mới
  nhoMayNghi(P);
}
function gocGan(g) { while (g - xoay > Math.PI) g -= 2 * Math.PI; while (xoay - g > Math.PI) g += 2 * Math.PI; return g; }
/* đi một nước: trượt quân theo đường, rồi tính lượt sau */
function thucHien(m, P) {
  const the = van.the;
  if (the.luot !== P || the.thang >= 0 || the.hoa) return;
  const x = the.o[m.tu], an = the.o[m.toi], duong = L.duongDi(the, m);
  const quan = [{ x, duong, nhay: (x & 7) === 2 }];
  if (m.nhap) { const r = the.o[L.oCua(P, m.nhap === 1 ? 7 : 0, 1)]; quan.push({ x: r, duong: [L.oCua(P, m.nhap === 1 ? 7 : 0, 1), L.oCua(P, m.nhap === 1 ? 5 : 3, 1)] }); }
  chon = -1; nuocCuaChon = [];
  const lau = Math.min(900, 180 + duong.length * 70);
  hoat = { quan, dau: quan.map(q => q.duong[0]), an: an ? m.toi : -1, anX: an, t0: bay(), lau, xong: () => {
    const ev = apDung(m, P);
    tiengDi(!!an);
    noiVeNuoc(P, an, ev);
    baoSuKien(ev);
    denLuot();
  } };
  if (!raf) raf = requestAnimationFrame(vong);
}
/* phần còn lại của một nước, lúc quân tới nơi — hay áp ngay không trượt, khi đuổi kịp ván qua mạng */
function apDung(m, P) {
  const the = van.the, an = the.o[m.toi], duong = L.duongDi(the, m), ma = (the.o[m.tu] & 7) === L.LOAI.MA;
  const lui = L.diNuoc(the, m);
  van.nuocCuoi = { tu: m.tu, toi: m.toi }; van.soNuoc++;
  if (!van.vet) van.vet = [null, null, null];
  van.vet[P] = { duong, ma, thu: van.soNuoc };                          // mũi tên nước vừa đi của nhà này
  if (an) van.an[P] += L.GIA[an & 7] || 0;
  return L.sauNuoc(the, lui);
}
const bay = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/* ---------- lời nói của hai máy, lời báo ---------- */
function noi(P, loai, xacSuat = 1, cho = 0) {
  if (!van || !van.tinh[P] || Math.random() > xacSuat) return;
  const ds = TINH_CACH[van.tinh[P]].noi[loai];
  if (!ds) return;
  const cau = ds[Math.floor(Math.random() * ds.length)];
  setTimeout(() => hienNoi(P, cau), cho);
}
function noiVeNuoc(P, an, ev) {
  if (an && (an & 7) !== 6) { noi(P, 'an', .5); if (van.tinh[an >> 3] && van.the.song[an >> 3]) noi(an >> 3, 'mat', .45, 900); }
  for (const e of ev) {
    if (e.loai === 'chieu' && e.bi !== P && van.tinh[P]) noi(P, 'chieu', 1);
    if ((e.loai === 'anvua' || e.loai === 'chieuhet') && van.tinh[e.bi]) noi(e.bi, 'biLoai', 1, 300);
    if (e.loai === 'anvua' && van.tinh[P]) noi(P, 'loai', 1, 1400);
    if (e.loai === 'thang' && van.tinh[e.ai]) noi(e.ai, 'thang', 1, 500);
  }
}
function hienNoi(P, cau) {
  if (!tam) return;
  const the_ = tam.querySelector(`.cb-the[data-p="${P}"]`), b = tam.querySelector('.cb-noi');
  if (!the_ || !b) return;
  const r = the_.getBoundingClientRect(), g = tam.getBoundingClientRect();
  b.textContent = cau; b.hidden = false;
  b.style.left = Math.max(8, Math.min(g.width - 180, r.left - g.left + r.width / 2 - 70)) + 'px';
  b.style.top = (r.bottom - g.top + 6) + 'px';
  clearTimeout(hienNoi.t); hienNoi.t = setTimeout(() => { b.hidden = true; }, 2600);
}
function baoSuKien(ev) {
  for (const e of ev) {
    if (e.loai === 'anvua') { bao(`${tenNha(e.ai)} ăn vua ${tenNha(e.bi)}! ${tenNha(e.bi)} bị loại, quân hoá đá.`); tiengLoai(); }
    else if (e.loai === 'chieuhet') { bao(`${tenNha(e.bi)} bị chiếu hết — bị loại, quân hoá đá.`); tiengLoai(); }
    else if (e.loai === 'boluot') bao(`${tenNha(e.ai)} hết nước đi mà không bị chiếu: bỏ lượt.`);
    else if (e.loai === 'chieu') {
      if (laMinh(e.bi)) { bao('Vua đang bị chiếu! Đường đỏ là quân đang nhắm vào vua.'); tiengChieu(); }
      else if (e.bi === van.the.luot) tiengChieu();
    }
  }
}
function bao(chu) {
  const p = tam && tam.querySelector('.cb-bao');
  if (!p) return;
  p.textContent = chu; p.hidden = false;
  clearTimeout(bao.t); bao.t = setTimeout(() => { p.hidden = true; }, 3200);
}
function capNhatChu() {
  if (!tam || !van) return;
  const the = van.the;
  for (const P of L.THU_TU) {
    const n = tam.querySelector(`.cb-the[data-p="${P}"]`);
    if (!n) continue;
    n.querySelector('b').textContent = tenNha(P);
    let tt = '';
    if (the.thang === P) tt = 'thắng';
    else if (!the.song[P]) tt = 'bị loại';
    else if (van.dangNghi === P) tt = 'đang nghĩ…';
    else if (the.luot === P && the.thang < 0 && !the.hoa) tt = L.biChieu(the, P) ? 'bị chiếu!' : 'đang đi';
    else tt = van.an[P] ? `ăn ${Math.round(van.an[P] / 100)} điểm` : '';
    if (van.cheDo === 'phong' && laNguoi(P) && P !== van.nguoiChoi && the.song[P] && !conO(P)) tt = tt ? tt + ' · vắng' : 'vắng';
    n.querySelector('span').textContent = tt;
    n.classList.toggle('cb-dang', the.luot === P && the.thang < 0 && !the.hoa);
    n.classList.toggle('cb-loai', !the.song[P]);
    n.classList.toggle('cb-chieu', the.song[P] && L.biChieu(the, P));
  }
  const l = tam.querySelector('.cb-luot'), P = the.luot;
  if (the.thang >= 0) l.textContent = `${tenNha(the.thang)} thắng!`;
  else if (the.hoa) l.textContent = 'Hoà.';
  else if (van.cheDo === 'phong' && phong && phong.rot) l.textContent = 'Mất mạng — đang nối lại…';
  else if (van.dangNghi >= 0) l.textContent = `${tenNha(van.dangNghi)} (${TEN_MAU[van.dangNghi]}) đang nghĩ…`;
  else if (laMinh(P)) l.textContent = 'Lượt của bạn — chạm một quân để đi';
  else if (van.cheDo === 'phong') l.textContent = laNguoi(P) ? `Chờ ${tenNha(P)} (${TEN_MAU[P]}) đi…${conO(P) ? '' : ' — đang vắng'}` : `Lượt ${tenNha(P)} (${TEN_MAU[P]}, máy chơi thay)`;
  else l.textContent = `Lượt ${tenNha(P)}`;
  const h = tam.querySelector('.cb-hoan');
  h.hidden = van.cheDo !== 'may';
  h.disabled = !coTheHoan() || !!hoat;
  const t = tam.querySelector('.cb-thay'), viec = viecPhong();
  t.hidden = !viec; t.dataset.viec = viec;
  t.textContent = viec === 'tudi' ? 'Tự đi tiếp' : viec === 'thay' ? `Cho máy đi thay ${tenNha(P)}` : '';
  tam.querySelector('.cb-moi').textContent = van.cheDo === 'phong' ? 'Phòng' : 'Ván mới';
  const ten = tam.querySelector('.cb-ten span');
  ten.textContent = van.cheDo === 'phong'
    ? `Phòng ${van.ma} · ${van.nguoiChoi >= 0 ? `bạn cầm ${TEN_MAU[van.nguoiChoi]}` : 'đang xem'} · máy ${KHO[van.kho].ten.toLowerCase()}`
    : `Bạn cầm ${TEN_MAU[van.nguoiChoi]} · máy ${KHO[van.kho].ten.toLowerCase()}`;
}
/* hoàn tác: về đầu lượt trước của bạn (bỏ luôn hai nước máy đi sau đó) */
/* ảnh chụp ở đầu mỗi lượt của bạn: tới lượt bạn thì cái cuối là lượt hiện tại, cần thêm một cái trước đó mới hoàn tác được */
const coTheHoan = () => !!van && van.cheDo === 'may' && van.lichSu.length >= (laNguoi(van.the.luot) && van.dangNghi < 0 ? 2 : 1);
function hoanTac() {
  if (!van || van.cheDo !== 'may' || hoat || !coTheHoan()) return;
  if (laNguoi(van.the.luot) && van.dangNghi < 0) van.lichSu.pop();          // ảnh chụp của lượt hiện tại
  boViec();
  const s = van.lichSu.pop();
  if (!s) return;
  van.the = L.chepThe(s.the); van.nuocCuoi = s.nuocCuoi; van.vet = (s.vet || [null, null, null]).slice(); van.an = s.an.slice(); van.soNuoc = Math.max(0, van.soNuoc - 3); van.hetVan = false;
  chon = -1; nuocCuaChon = [];
  tatTin();
  denLuot();
}

/* ---------- chạm vào bàn ---------- */
function chamBan(px, py) {
  if (!van || hoat || demo) return;
  const the = van.the, P = the.luot;
  if (the.thang >= 0 || the.hoa || !laMinh(P) || van.dangNghi >= 0) return;
  let c = oTai(px, py);
  /* chạm hơi lệch ô đích (ô rìa nhỏ): bắt vào chấm gần nhất trong tầm */
  if (chon >= 0 && (c < 0 || !nuocCuaChon.some(m => m.toi === c))) {
    let tot = -1, gan = Infinity;
    for (const m of nuocCuaChon) { const [x, y] = tamO(m.toi), d = Math.hypot(x - px, y - py); if (d < gan && d < coO(m.toi) * 1.6) { gan = d; tot = m.toi; } }
    if (tot >= 0 && !(c >= 0 && the.o[c] && (the.o[c] >> 3) === P)) c = tot;
  }
  if (c < 0) { chon = -1; nuocCuaChon = []; return; }
  const m = nuocCuaChon.find(n => n.toi === c);
  if (chon >= 0 && m) {
    if (m.phong) { hoiPhong(m, P); return; }
    diNuoc(m, P);
    return;
  }
  if (the.o[c] && (the.o[c] >> 3) === P) {
    chon = c; nuocCuaChon = L.nuocHopLe(the, P).filter(n => n.tu === c);
    tiengCham();
    if (!nuocCuaChon.length) bao(L.biChieu(the, P) ? 'Quân này không đi được — vua đang bị chiếu, phải chặn hay tránh.' : 'Quân này chưa có đường đi.');
    return;
  }
  chon = -1; nuocCuaChon = [];
}
function hoiPhong(m, P) {
  phongCho = m;
  const ten = { 5: 'Hậu', 4: 'Xe', 3: 'Tượng', 2: 'Mã' };
  moTin(`<p class="cb-tin-nho">Phong cấp</p><h2>Tốt hoá thành…</h2><div class="cb-phong">${[5, 4, 3, 2].map(l => `<button type="button" data-phong="${l}">${ten[l]}</button>`).join('')}</div>`);
}

/* ======================================================================================================
   CHƠI QUA MẠNG — mỗi người một máy, vào cùng một phòng bằng link hay mã 6 ký tự (assets/phong.js nói chuyện với
   Firebase). Người dùng: "làm tạo phòng để chơi nhiều máy đi, đừng làm đánh trên 1 máy" — bỏ kiểu ba người chung máy.
   Máy chủ chỉ giữ danh sách nước đi; máy nào cũng đọc lần lượt từ đầu và tự tính thế cờ bằng chính lõi luật, nên máy
   chủ không cần hiểu cờ. Luật Firebase chỉ cho thêm nước vào cuối, ai ghi trước vào ô số n thì nước đó được; nước sai
   luật thì máy nào cũng bỏ qua như nhau, nên mọi máy luôn ra cùng một thế cờ. Ghế trống lúc bắt đầu thì máy chơi thay
   (người dùng chọn): máy của người ngồi ghế số nhỏ nhất còn ở đây nghĩ giùm rồi ghi nước lên.
   ====================================================================================================== */
const MANG = self.TDTD_PHONG;
let phong = null;
const VANG = 60000, NHIP = 20000;                   // im lặng quá 60 giây là coi như đã rời; 20 giây báo "còn ở đây" một lần
const gheCua = (P) => phong && phong.cay && phong.cay.ghe ? phong.cay.ghe[P] : null;
const mayCua = (P) => phong && phong.cay && phong.cay.may ? phong.cay.may[P] : null;
const gioMay = () => Date.now() + (phong ? phong.lech : 0);   // giờ máy chủ, đo lệch qua dấu giờ của chính mình
function conO(P) { const g = gheCua(P); return !!g && (P === phong.P || (!!g.thay && gioMay() - g.thay < VANG)); }
const khoaNuoc = (n) => `${n.P}.${n.tu}.${n.toi}.${n.phong || 0}.${n.nhap || 0}`;
const tenMinh = () => String(docLuu().ten || '').trim().slice(0, 20);
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* link mời đi qua trang chia sẻ riêng (co-vua-ba-nguoi/), để Zalo, Messenger hiện tên và ảnh của trò */
const linkMoi = (ma) => location.origin + location.pathname.replace(/[^/]*$/, '') + 'co-vua-ba-nguoi/?phong=' + ma;
const MA_DIA_CHI = /^#co-ba-nguoi\/([A-HJ-NP-Z2-9]{6})$/;
const dauThang = () => (typeof location !== 'undefined' && location.hash) || '';
function datDiaChi(ma) {
  try { history.replaceState(null, '', location.pathname + location.search + '#co-ba-nguoi' + (ma ? '/' + ma : '')); } catch (e) {}
}

async function taoPhong(ch) {
  if (!MANG) return false;
  const id = MANG.idMoi(), ten = ch.ten || TEN_MAU[ch.mau];
  moTin('<p class="cb-tin-nho">Chơi qua mạng</p><h2>Đang tạo phòng…</h2>');
  for (let lan = 0; lan < 4; lan++) {
    const ma = ch.ma || MANG.maMoi();
    const r = await MANG.goi(`coba/${ma}`, 'PUT', { tao: MANG.GIO, chu: ch.mau, kho: ch.kho, ghe: { [ch.mau]: { id, ten, thay: MANG.GIO } } });
    if (r.ok) { vaoPhong(ma, { id, P: ch.mau }); return true; }
    if (r.ma !== 401 || ch.ma) break;               // mất mạng, hay mã định sẵn (ván nữa) đã có người dùng
  }
  moTin('<p class="cb-tin-nho">Chơi qua mạng</p><h2>Chưa tạo được phòng</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="cb-moi">Quay lại</button>');
  return false;
}
/* vào phòng: minh = { id, P } khi đã có ghế (người tạo phòng, hay mở lại); muonNgoi: ghế muốn ngồi khi theo ván nữa */
function vaoPhong(ma, minh, muonNgoi = -1, tuMo = false) {
  if (!MANG || !MANG.laMa(ma)) return;
  dungLuong();
  if (van && van.cheDo === 'phong') { boViec(); van = null; hoat = null; }
  phong = { ma, id: minh ? minh.id : MANG.idMoi(), P: minh ? minh.P : -1, cay: undefined, ke: 0, nhat: [], daGui: null, lech: 0,
    song: false, nhipCuoi: minh ? Date.now() : 0, muonNgoi, nghiO: -1, baoLuot: -1, tuMo, choTiep: 0, sanhCu: '' };
  if (phong.P >= 0) ghiLuu({ phong: { ma, id: phong.id, P: phong.P } });
  datDiaChi(ma);
  noiPhong();
  if (!tuMo) moTin(`<p class="cb-tin-nho">Phòng ${ma}</p><h2>Đang vào phòng…</h2>`);
}
function noiPhong() {
  if (!phong || phong.luong) return;
  phong.luong = MANG.nghe(`coba/${phong.ma}`, khiPhongDoi, () => { if (phong) { phong.rot = true; if (van) capNhatChu(); } });
  phong.kiem = setInterval(kiemPhong, 5000);
}
function dungLuong() {                               // tạm ngưng nghe (đóng trò), vẫn giữ chỗ trong phòng
  if (!phong) return;
  if (phong.luong) { phong.luong.dung(); phong.luong = null; }
  if (phong.kiem) { clearInterval(phong.kiem); phong.kiem = 0; }
}
function roiPhong() {                                // rời hẳn
  if (!phong) return;
  const cay = phong.cay, ma = phong.ma;
  dungLuong();
  /* hết ván đủ 5 phút thì dọn phòng (luật chỉ cho xoá lúc đó, hay khi phòng đã quá một ngày) */
  if (cay && cay.xong && gioMay() - cay.xong > 300000) MANG.goi(`coba/${ma}`, 'DELETE');
  phong = null;
  ghiLuu({ phong: undefined });
  if (van && van.cheDo === 'phong') { boViec(); van = null; hoat = null; chon = -1; nuocCuaChon = []; }
  if (tam) { tam.querySelector('.cb-moi').textContent = 'Ván mới'; tam.querySelector('.cb-thay').hidden = true; }
  datDiaChi('');
}
function khiPhongDoi(cay) {
  if (!phong) return;
  const truoc = phong.cay;
  phong.cay = cay; phong.rot = false;
  if (cay == null) {
    if (phong.choTiep && Date.now() - phong.choTiep < 20000) return;   // vừa theo "ván nữa": phòng mới đang được tạo
    const ma = phong.ma, tuMo = phong.tuMo;
    roiPhong();
    if (tuMo) moCaiDat();
    else moTin(`<p class="cb-tin-nho">Phòng ${ma}</p><h2>Không thấy phòng này</h2><p>Mã sai, hoặc phòng đã đóng sau khi chơi xong.</p><button type="button" class="cb-moi">Quay lại</button>`);
    return;
  }
  phong.choTiep = 0;
  const g = gheCua(phong.P), gCu = truoc && truoc.ghe && truoc.ghe[phong.P];
  if (phong.P >= 0 && g && g.id === phong.id && g.thay && !(gCu && gCu.thay === g.thay)) phong.lech = g.thay - Date.now();
  if (phong.P >= 0 && g && g.id !== phong.id) { phong.P = -1; ghiLuu({ phong: undefined }); bao('Ghế đó vừa có người khác ngồi trước.'); }
  if ((cay.tao && gioMay() - cay.tao > 86400000) || (phong.tuMo && cay.xong)) {      // phòng đã cũ: dọn luôn, khỏi mở lại
    const tuMo = phong.tuMo;
    if (cay.tao && gioMay() - cay.tao > 86400000) MANG.goi(`coba/${phong.ma}`, 'DELETE');
    roiPhong();
    if (tuMo) moCaiDat(); else moTin('<p class="cb-tin-nho">Chơi qua mạng</p><h2>Phòng này đã đóng</h2><p>Phòng chỉ giữ trong một ngày.</p><button type="button" class="cb-moi">Quay lại</button>');
    return;
  }
  phong.tuMo = false;
  if (!cay.batDau) { veSanh(); return; }
  if (!van || van.cheDo !== 'phong' || van.ma !== phong.ma) { batDauVanPhong(); return; }
  capNhatNguoi();
  kiemNhat();
  chayPhong();
  capNhatChu();
  if (van && van.hetVan && tam.querySelector('.cb-tin .cb-vannua, .cb-tin .cb-vaotiep')) ketThucVan(true);   // có lời mời ván nữa
}
/* phòng chờ: ba ghế, link mời, Bắt đầu (chủ phòng; chủ phòng vắng thì người khác bấm được) */
function veSanh() {
  const cay = phong.cay, minh = phong.P;
  if (minh < 0 && phong.muonNgoi >= 0 && !gheCua(phong.muonNgoi)) { const P = phong.muonNgoi; phong.muonNgoi = -1; ngoiGhe(P); }
  const dong = L.THU_TU.map(P => {
    const g = gheCua(P);
    const ai = g ? `${esc(g.ten || TEN_MAU[P])}${P === minh ? ' (bạn)' : ''}${P === cay.chu ? ' · chủ phòng' : ''}${conO(P) ? '' : ' · vắng'}` : 'còn trống';
    const nut = !g && minh < 0 ? `<button type="button" class="cb-chon" data-ngoi="${P}">Ngồi đây</button>` : '';
    return `<div class="cb-ghe"><i style="background:${MAU[P].cham}"></i><span><b>${TEN_MAU[P]}</b> ${ai}</span>${nut}</div>`;
  }).join('');
  const batDauDuoc = minh >= 0 && (minh === cay.chu || !conO(cay.chu));
  const loi = batDauDuoc ? 'Bấm Bắt đầu lúc nào cũng được — ghế còn trống thì máy chơi thay.' : minh >= 0 ? 'Chờ chủ phòng bấm Bắt đầu.' : 'Chọn một ghế còn trống để vào chơi.';
  const html = `<p class="cb-tin-nho">Phòng chờ</p><h2>Phòng <span class="cb-ma">${phong.ma}</span></h2>
    <div class="cb-ghe-ds">${dong}</div>
    ${minh < 0 ? `<p class="cb-nhan">Tên của bạn</p><input class="cb-o-ten" maxlength="20" value="${esc(tenMinh())}" placeholder="Để trống thì gọi theo màu quân">` : ''}
    <p class="cb-meo">Gửi link hay mã phòng cho bạn bè. ${loi}</p>
    ${batDauDuoc ? '<button type="button" class="cb-batdau-phong">Bắt đầu</button>' : ''}
    <button type="button" class="cb-phu cb-moi-ban">Gửi link mời</button>
    <button type="button" class="cb-phu cb-roi">Rời phòng</button>`;
  if (html !== phong.sanhCu || tam.querySelector('.cb-tin').hidden) { phong.sanhCu = html; moTin(html); }
}
async function ngoiGhe(P) {
  if (!phong || phong.P >= 0) return;
  const o = tam && tam.querySelector('.cb-o-ten');
  if (o) ghiLuu({ ten: o.value.trim().slice(0, 20) });
  const r = await MANG.goi(`coba/${phong.ma}/ghe/${P}`, 'PATCH', { id: phong.id, ten: tenMinh() || TEN_MAU[P], thay: MANG.GIO });
  if (!phong) return;
  if (r.ok) {
    phong.P = P; phong.nhipCuoi = Date.now();
    ghiLuu({ phong: { ma: phong.ma, id: phong.id, P } });
    if (phong.cay) khiPhongDoi(phong.cay);
  } else bao(r.ma === 401 ? (phong.cay && phong.cay.batDau ? 'Ván đã bắt đầu, không vào ghế được nữa.' : 'Ghế này vừa có người ngồi.') : 'Mất mạng, chưa vào được ghế.');
}
async function batDauPhong() {
  if (!phong || !phong.cay || phong.cay.batDau) return;
  const them = { batDau: MANG.GIO }, tc = ['ho', 'rua'];
  let k = 0;
  for (const P of L.THU_TU) if (!gheCua(P)) them['may/' + P] = tc[k++];
  const r = await MANG.goi(`coba/${phong.ma}`, 'PATCH', them);
  if (!r.ok && r.ma !== 401) bao('Mất mạng, chưa bắt đầu được.');
}
function batDauVanPhong() {
  boViec();
  van = { the: L.theMoi(), cheDo: 'phong', ma: phong.ma, nguoi: ['nguoi', 'nguoi', 'nguoi'], tinh: [null, null, null], kho: 0, nguoiChoi: phong.P,
    lichSu: [], nuocCuoi: null, vet: [null, null, null], dangNghi: -1, an: [0, 0, 0], soNuoc: 0, xemTiep: true };
  capNhatNguoi();
  Object.assign(phong, { ke: 0, nhat: [], daGui: null, song: false, nghiO: -1, baoLuot: -1 });
  chon = -1; nuocCuaChon = []; hoat = null; phongCho = null;
  xoay = xoayDen = GOC_NHIN[nhaNhin()];
  tatTin();
  chayPhong();
  if (van && van.soNuoc === 0) L.THU_TU.forEach((P, i) => noi(P, 'batDau', .7, 500 + 900 * i));
}
/* ai là người, ai do máy chơi thay (ghế trống lúc bắt đầu, hay người vắng đã được cho máy đi thay) */
function capNhatNguoi() {
  for (const P of [0, 1, 2]) {
    const may = mayCua(P), g = gheCua(P);
    van.nguoi[P] = may || !g ? 'may' : 'nguoi';
    van.tinh[P] = may || (g ? null : 'rua');
  }
  van.nguoiChoi = phong.P;
  van.kho = [0, 1, 2].includes(phong.cay.kho) ? phong.cay.kho : 0;
}
/* tìm nước hợp lệ đúng như nước trên máy chủ; tốt phong cấp thì chọn được Hậu, Xe, Tượng, Mã */
function timNuocMang(the, mv) {
  if (the.thang >= 0 || the.hoa || mv.P !== the.luot) return null;
  const n = L.nuocHopLe(the, mv.P).find(x => x.tu === mv.tu && x.toi === mv.toi && (x.nhap || 0) === (mv.nhap || 0));
  if (!n) return null;
  if (n.phong) return [2, 3, 4, 5].includes(mv.phong) ? Object.assign({}, n, { phong: mv.phong }) : null;
  return mv.phong ? null : n;
}
/* áp các nước mới tới từ máy chủ, theo đúng thứ tự. Lúc vào phòng (hay dựng lại) thì áp ngay hết cho kịp; đang chơi thì
   nước mới nhất trượt quân như thường, xong lại gọi tiếp (denLuot → chayPhong). */
function chayPhong() {
  if (!phong || !van || van.cheDo !== 'phong' || hoat) return;
  const ds = (phong.cay && phong.cay.nuoc) || {};
  for (;;) {
    const mv = ds[phong.ke];
    if (!mv) break;
    const m = timNuocMang(van.the, mv);
    phong.nhat.push(khoaNuoc(mv));
    phong.ke++;
    if (!m) continue;                                // nước sai luật: máy nào cũng bỏ qua như nhau
    if (van.dangNghi >= 0) boViec();                 // máy khác đã đi giùm trước
    /* trang đang ẩn (chuyển sang app khác) thì trình duyệt không chạy hình động: áp ngay cho khỏi dồn lại */
    if (!phong.song || ds[phong.ke] || (typeof document !== 'undefined' && document.hidden)) { apDung(m, mv.P); continue; }
    thucHien(m, mv.P);
    return;
  }
  phong.song = true;
  denLuot();
}
/* đi một nước của mình (hay của máy chơi thay mà mình chạy): ván qua mạng thì áp liền rồi ghi lên máy chủ */
function diNuoc(m, P) {
  if (!van || van.cheDo !== 'phong') { thucHien(m, P); return; }
  if (!phong || van.the.luot !== P || hoat) return;
  const n = phong.ke, mv = { P, tu: m.tu, toi: m.toi, phong: m.phong || 0, nhap: m.nhap || 0 };
  phong.ke++; phong.nhat.push(khoaNuoc(mv)); phong.daGui = { n };
  thucHien(m, P);
  const ma = phong.ma;
  MANG.goi(`coba/${ma}/nuoc/${n}`, 'PUT', mv).then((r) => {
    if (!phong || phong.ma !== ma || !phong.daGui || phong.daGui.n !== n || r.ok) return;
    phong.daGui = null;
    bao(r.ma === 401 ? 'Nước vừa rồi không được tính — máy khác đã ghi trước.' : 'Mất mạng, nước vừa rồi chưa gửi được.');
    dungLaiPhong();
  });
}
/* các nước đã áp phải khớp danh sách trên máy chủ; lệch (hiếm: hai máy cùng ghi một ô) thì dựng lại từ đầu */
function kiemNhat() {
  const ds = (phong.cay && phong.cay.nuoc) || {};
  for (let i = 0; i < phong.nhat.length; i++) {
    const mv = ds[i];
    if (!mv) { if (phong.daGui && phong.daGui.n === i) continue; dungLaiPhong(); return; }
    if (khoaNuoc(mv) !== phong.nhat[i]) { dungLaiPhong(); return; }
  }
  if (phong.daGui && ds[phong.daGui.n]) phong.daGui = null;
}
function dungLaiPhong() {
  if (!van || !phong) return;
  boViec();
  hoat = null; chon = -1; nuocCuaChon = []; phongCho = null;
  Object.assign(van, { the: L.theMoi(), nuocCuoi: null, vet: [null, null, null], an: [0, 0, 0], soNuoc: 0, hetVan: false });
  Object.assign(phong, { ke: 0, nhat: [], daGui: null, song: false, nghiO: -1 });
  chayPhong();
}
/* máy chơi thay do ai chạy: người ngồi ghế số nhỏ nhất còn ở đây (không ai thì người còn ở đây bất kỳ) */
function toiChayMay() {
  if (!phong || phong.P < 0) return false;
  let ds = [0, 1, 2].filter(P => gheCua(P) && !mayCua(P) && conO(P));
  if (!ds.length) ds = [0, 1, 2].filter(P => gheCua(P) && conO(P));
  return ds.length > 0 && ds[0] === phong.P;
}
function viecPhong() {
  if (!van || van.cheDo !== 'phong' || !phong || phong.P < 0 || van.the.thang >= 0 || van.the.hoa) return '';
  if (mayCua(phong.P)) return 'tudi';
  const P = van.the.luot;
  return laNguoi(P) && P !== phong.P && van.the.song[P] && !conO(P) ? 'thay' : '';
}
function choMayThay() {
  const P = van && van.the.luot;
  if (viecPhong() !== 'thay') return;
  const dang = [0, 1, 2].map(mayCua);
  MANG.goi(`coba/${phong.ma}/may/${P}`, 'PUT', dang.includes('ho') ? 'rua' : 'ho');
}
function tuDiTiep() { if (viecPhong() === 'tudi') MANG.goi(`coba/${phong.ma}/may/${phong.P}`, 'DELETE'); }
/* mỗi 5 giây: báo mình còn ở đây, nối lại luồng nếu đã đóng, xem có phải nhận chạy máy (người trước đã rời) */
function kiemPhong() {
  if (!phong) return;
  if (phong.P >= 0 && Date.now() - phong.nhipCuoi > NHIP && !document.hidden) {
    phong.nhipCuoi = Date.now();
    MANG.goi(`coba/${phong.ma}/ghe/${phong.P}/thay`, 'PUT', MANG.GIO);
  }
  if (phong.luong) phong.luong.noiLai();
  if (!phong.cay) return;
  if (!phong.cay.batDau) veSanh();
  else if (van && van.cheDo === 'phong' && !hoat) denLuot();
}
function moiBan() {
  if (!phong) return;
  const url = linkMoi(phong.ma), xong = () => bao(`Đã chép link mời. Mã phòng: ${phong ? phong.ma : ''}`);
  if (navigator.share) { navigator.share({ title: 'Cờ vua ba người', text: `Vào phòng ${phong.ma} chơi cờ ba người`, url }).catch(() => {}); return; }
  if (navigator.clipboard) navigator.clipboard.writeText(url).then(xong, () => bao(`Mã phòng: ${phong.ma}`)); else bao(`Mã phòng: ${phong.ma}`);
}
function moPhongTT() {
  const dong = L.THU_TU.map(P => `<div class="cb-ghe"><i style="background:${MAU[P].cham}"></i><span><b>${TEN_MAU[P]}</b> ${esc(tenNha(P))}${!laNguoi(P) ? ' · máy chơi thay' : conO(P) ? '' : ' · vắng'}</span></div>`).join('');
  moTin(`<p class="cb-tin-nho">Đang chơi qua mạng</p><h2>Phòng <span class="cb-ma">${phong.ma}</span></h2><div class="cb-ghe-ds">${dong}</div>
    <p class="cb-meo">Ai có link cũng vào xem được. Tới lượt người vắng quá một phút thì người khác bấm được "Cho máy đi thay".</p>
    <button type="button" class="cb-dongtin">Chơi tiếp</button><button type="button" class="cb-phu cb-moi-ban">Gửi link</button><button type="button" class="cb-phu cb-roi">Rời phòng</button>`);
}
/* ván nữa: ai bấm trước thì giữ chỗ mã phòng mới trong phòng cũ (tiep, ghi một lần), rồi tạo phòng đó */
async function vanNua() {
  if (!phong || !phong.cay) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }
  const cu = phong.ma, P = phong.P >= 0 ? phong.P : 0, kho = phong.cay.kho || 0, ma = MANG.maMoi();
  const r = await MANG.goi(`coba/${cu}/tiep`, 'PUT', ma);
  if (!phong || phong.ma !== cu) return;
  if (!r.ok) { bao(r.ma === 401 ? 'Có người vừa mời ván nữa — bấm Vào ván mới.' : 'Mất mạng, thử lại nhé.'); return; }
  await taoPhong({ mau: P, kho, ten: tenMinh() || TEN_MAU[P], ma });
}
function theoTiep(ma) {
  const P = phong && phong.P >= 0 ? phong.P : -1;
  vaoPhong(ma, null, P);
  if (phong) phong.choTiep = Date.now();
}
function vaoBangMa() {
  const o = tam && tam.querySelector('.cb-o-ma'), t = tam && tam.querySelector('.cb-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  const ma = String(o ? o.value : '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (MANG && MANG.laMa(ma)) vaoPhong(ma); else bao('Mã phòng gồm 6 chữ và số, như trong link mời.');
}
function theoMaTrenDiaChi() {
  if (!tam || !tam.classList.contains('hien') || !MANG) return;
  const m = MA_DIA_CHI.exec(dauThang());
  if (m && (!phong || phong.ma !== m[1])) { const l = docLuu().phong; vaoPhong(m[1], l && l.ma === m[1] ? { id: l.id, P: l.P } : null); }
}

/* ---------- hình động hướng dẫn: đường uốn qua tâm ---------- */
const DEMO = [
  { chu: 'Xe đi thẳng cột e của Trắng: tới sát tâm thì cột uốn sang cột d của Đỏ, chạy tiếp về tận hàng quân Đỏ.',
    quan: [[L.oCua(0, 4, 1), 4]], duong: [[L.oCua(0, 4, 1)].concat(L.BANG.TRUC[L.oCua(0, 4, 1)][3])] },
  { chu: 'Tượng đi chéo tới ô d4 (sát tâm) thì chọn rẽ sang nhà Đen hoặc nhà Đỏ — hai nhánh, vẫn cùng màu ô.',
    quan: [[L.oCua(0, 0, 1), 3]], duong: L.BANG.CHEO[L.oCua(0, 0, 1)].filter(t => t.length >= 6).map(t => [L.oCua(0, 0, 1)].concat(t)) },
  { chu: 'Tốt đứng ở d4 tiến thẳng sang nhà Đen, và có tới ba ô ăn chéo: một ô bên nhà Đen, hai ô qua tâm.',
    quan: [[L.oCua(0, 3, 4), 1]], tien: [L.TOT_TIEN[0][L.oCua(0, 3, 4)]], an: L.TOT_AN[0][L.oCua(0, 3, 4)] },
  { chu: 'Mã đi chữ L (hai ô thẳng, một ô ngang). Gần tâm đường uốn nên mã tới được nhiều ô hơn — ở đây là 10 ô.',
    quan: [[L.oCua(0, 3, 4), 2]], an: L.BANG.MA[L.oCua(0, 3, 4)] },
];
function batDemo() { tatTin(); demo = { buoc: 0, t0: bay() }; xoay = xoayDen = 0; capNhatDemo(); }
function capNhatDemo() { const p = tam.querySelector('.cb-luot'); if (demo) p.textContent = `${demo.buoc + 1}/${DEMO.length} · ${DEMO[demo.buoc].chu} (chạm để xem tiếp)`; }
function veDemo(t) {
  const d = DEMO[demo.buoc], p = Math.min(1, (t - demo.t0) / 2400);
  const MAUD = ['rgba(90,200,255,.55)', 'rgba(255,200,80,.6)'];
  (d.duong || []).forEach((duong, k) => {
    const n = Math.max(1, Math.round(p * (duong.length - 1)));
    for (let i = 1; i <= n; i++) toO(duong[i], MAUD[k % 2]);
  });
  (d.tien || []).forEach(c => toO(c, 'rgba(90,220,120,.55)'));
  (d.an || []).forEach(c => toO(c, 'rgba(255,90,70,.55)'));
  for (const [c, loai] of d.quan) {
    if (d.duong) {
      for (const duong of d.duong) {
        const pts = duong.map(tamO), n = (pts.length - 1) * (p * p * (3 - 2 * p)), i = Math.min(pts.length - 2, Math.floor(n)), k = n - i;
        veQuan(loai, duong[Math.round(n)], [tron(pts[i][0], pts[i + 1][0], k), tron(pts[i][1], pts[i + 1][1], k)], 1, d.duong.length > 1 ? .85 : 1);
      }
    } else veQuan(loai, c, tamO(c));
  }
  if (t - demo.t0 > 6500) { tiepDemo(); }
}
function tiepDemo() {
  if (!demo) return;
  demo.buoc++; demo.t0 = bay();
  if (demo.buoc >= DEMO.length) {
    demo = null;
    if (van) { xoay = xoayDen = GOC_NHIN[nhaNhin()]; capNhatChu(); } else { tam.querySelector('.cb-luot').textContent = ''; moCaiDat(); }
    return;
  }
  capNhatDemo();
}

/* ---------- âm thanh (Web Audio, không tải tệp) ---------- */
function amThanh() {
  if (!coTieng) return null;
  try { if (!am) { const AC = self.AudioContext || self.webkitAudioContext; if (!AC) return null; am = new AC(); } if (am.state === 'suspended') am.resume(); return am; } catch (e) { return null; }
}
function not(f, luc, lau, to, kieu = 'sine') {
  const o = am.createOscillator(), v = am.createGain();
  o.type = kieu; o.frequency.value = f;
  v.gain.setValueAtTime(0, luc); v.gain.linearRampToValueAtTime(to, luc + .006); v.gain.exponentialRampToValueAtTime(.0001, luc + lau);
  o.connect(v); v.connect(am.destination); o.start(luc); o.stop(luc + lau + .05);
  return o;
}
function tiengDi(an) {
  if (!amThanh()) return;
  const t = am.currentTime + .01, o = not(an ? 160 : 260, t, an ? .16 : .08, an ? .16 : .1, 'triangle');
  o.frequency.exponentialRampToValueAtTime(an ? 90 : 180, t + .07);
}
function tiengCham() { if (amThanh()) not(880, am.currentTime + .01, .05, .03); }
function tiengChieu() { if (!amThanh()) return; const t = am.currentTime + .02; not(988, t, .22, .08); not(784, t + .14, .3, .08); }
function tiengLoai() { if (!amThanh()) return; const t = am.currentTime + .02; not(196, t, 1.2, .14); not(196 * 2.76, t, .5, .03); }
function tiengToiLuot() { if (!amThanh()) return; const t = am.currentTime + .02; not(659.25, t, .16, .05); not(987.77, t + .13, .26, .05); if (navigator.vibrate) navigator.vibrate(40); }
function tiengThang() { if (!amThanh()) return; const t = am.currentTime + .02; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => not(f, t + i * .11, .5, .12, 'triangle')); }

/* ---------- khung, bảng ---------- */
function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'coba';
  tam.innerHTML = `
    <button class="xn-dong" type="button" aria-label="Đóng">✕</button>
    <div class="cb-dau">
      <p class="cb-ten"><b>Cờ vua ba người</b><span></span></p>
      <button class="cb-hoi" type="button" aria-label="Cách chơi">?</button>
    </div>
    <div class="cb-nha">${L.THU_TU.map(P => `<div class="cb-the" data-p="${P}"><i style="background:${MAU[P].cham}"></i><b></b><span></span></div>`).join('')}</div>
    <div class="cb-canh"><canvas class="cb-cv"></canvas><p class="cb-bao" hidden></p></div>
    <div class="cb-duoi">
      <p class="cb-luot" aria-live="polite"></p>
      <div class="cb-nut"><button class="cb-hoan" type="button">↶ Hoàn tác</button><button class="cb-thay" type="button" hidden></button><button class="cb-moi" type="button">Ván mới</button></div>
    </div>
    <p class="cb-noi" hidden></p>
    <div class="cb-tin" hidden><div class="cb-tin-trong"></div></div>`;
  document.body.appendChild(tam);
  for (const P of L.THU_TU) { const n = tam.querySelector(`.cb-the[data-p="${P}"] b`); if (n) n.textContent = TEN_MAU[P]; }
  tam.querySelector('.cb-hoan').hidden = true;
  cv = tam.querySelector('.cb-cv'); ctx = cv.getContext && cv.getContext('2d');
  tam.addEventListener('click', bam);
  tam.addEventListener('input', (e) => { if (e.target && e.target.classList && e.target.classList.contains('cb-o-ten')) ghiLuu({ ten: e.target.value.trim().slice(0, 20) }); });
  tam.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('cb-o-ma')) vaoBangMa(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && phong) { phong.nhipCuoi = 0; kiemPhong(); } });
  addEventListener('hashchange', theoMaTrenDiaChi);
  cv.addEventListener('pointerdown', (e) => {
    amThanh();
    if (demo) { tiepDemo(); return; }
    const r = cv.getBoundingClientRect();
    chamBan(e.clientX - r.left, e.clientY - r.top);
  });
  addEventListener('resize', doCo);
  if (typeof ResizeObserver === 'function') new ResizeObserver(doCo).observe(tam.querySelector('.cb-canh'));
}
function doCo() {
  if (!tam || !cv) return;
  const k = tam.querySelector('.cb-canh').getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2); W = Math.max(220, k.width || 360); H = Math.max(200, k.height || 420);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
}
function moTin(html) { const h = tam.querySelector('.cb-tin'); h.querySelector('.cb-tin-trong').innerHTML = html; h.hidden = false; }
function tatTin() { if (tam) tam.querySelector('.cb-tin').hidden = true; }
function moCaiDat() {
  const l = docLuu(), che = l.che === 'phong' && MANG ? 'phong' : 'may', mau = [0, 1, 2].includes(l.mau) ? l.mau : 0, kho = [0, 1, 2].includes(l.kho) ? l.kho : 1;
  const nut = (ten, gt, chon_, nhom) => `<button type="button" class="cb-chon${chon_ ? ' cb-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const quan = [0, 2, 1].map(P => nut(TEN_MAU[P] + (P === 0 ? ' (đi trước)' : ''), P, P === mau, 'mau')).join('');
  const muc = KHO.map((k, i) => nut(k.ten, i, i === kho, 'kho')).join('');
  const phan = che === 'phong' ? `
    <p class="cb-nhan">Tên của bạn</p><input class="cb-o-ten" maxlength="20" value="${esc(l.ten || '')}" placeholder="Để trống thì gọi theo màu quân">
    <p class="cb-nhan">Bạn cầm quân</p><div class="cb-hang">${quan}</div>
    <p class="cb-nhan">Ghế trống thì máy chơi</p><div class="cb-hang">${muc}</div>
    <button type="button" class="cb-tao">Tạo phòng</button>
    <p class="cb-nhan">Có mã phòng của bạn bè?</p>
    <div class="cb-hang"><input class="cb-o-ma" maxlength="6" placeholder="Mã 6 ký tự" autocapitalize="characters" autocomplete="off" spellcheck="false"><button type="button" class="cb-chon cb-vao">Vào</button></div>
    <p class="cb-meo">Mỗi người một máy. Nước đi và tên bạn gửi qua máy chủ Firebase của Google để các máy thấy nhau; ai có mã phòng thì xem được.</p>` : `
    <p class="cb-nhan">Bạn cầm quân</p><div class="cb-hang">${quan}</div>
    <p class="cb-nhan">Máy chơi</p><div class="cb-hang">${muc}</div>
    <p class="cb-meo">Hai máy có tính cách riêng: <b>Hổ</b> hăng, dám đánh; <b>Rùa</b> chậm mà chắc.</p>
    <button type="button" class="cb-batdau">Bắt đầu</button>`;
  moTin(`<p class="cb-tin-nho">Ván mới</p><h2>Cờ vua ba người</h2>
    <p class="cb-nhan">Cách chơi</p><div class="cb-hang">${nut('Đấu với 2 máy', 'may', che === 'may', 'che')}${MANG ? nut('Chơi qua mạng', 'phong', che === 'phong', 'che') : ''}</div>${phan}
    <button type="button" class="cb-phu cb-tieng">${coTieng ? '🔊 Âm thanh: bật' : '🔇 Âm thanh: tắt'}</button>`);
  moCaiDat.ch = { che, mau, kho };
}
function moHuongDan() {
  moTin(`<p class="cb-tin-nho">Cách chơi</p><h2>Cờ vua ba người</h2>
    <p>Như cờ vua thường, nhưng ba nhà: <b>Trắng → Đen → Đỏ</b> lần lượt đi theo chiều kim đồng hồ. Bàn 96 ô ghép từ ba nửa bàn cờ; mỗi nhà một cạnh.</p>
    <p><b>Đường uốn qua giữa bàn:</b> cột của mình chạy thẳng sang nhà bên cạnh (cột h của Trắng nối cột a của Đỏ). Đi chéo qua đúng tâm thì chọn một trong hai nhánh, cùng màu ô. Tốt đứng ở d4, e4 có ba ô ăn chéo.</p>
    <p><b>Không được để vua mình bị chiếu.</b> Vua để hở cho người đi trước mình ăn là mất vua. Bị chiếu hết hay mất vua thì bị loại: quân hoá đá, vẫn chắn đường và ăn được, nhưng không ăn ai.</p>
    <p><b>Còn vua cuối cùng thì thắng.</b> Hết nước mà không bị chiếu: còn ba nhà thì bỏ lượt, còn hai nhà thì hoà. Tốt tới hàng cuối của một nhà khác thì phong cấp. Không có bắt tốt qua đường.</p>
    <p class="cb-meo">Đường đỏ là báo nguy: quân nào đang chiếu vua mình.</p>
    <button type="button" class="cb-demo">Xem hình động đường đi qua tâm</button>
    <button type="button" class="cb-phu cb-dongtin">Chơi</button>`);
}
function ketThucVan(capNhat) {
  if (!van) return;
  const the = van.the, ban_ = van.nguoiChoi;
  if (van.cheDo === 'phong') {
    if (!capNhat) {
      if (the.thang >= 0) tiengThang();
      if (phong && phong.cay && !phong.cay.xong) MANG.goi(`coba/${phong.ma}/xong`, 'PUT', MANG.GIO);   // mốc để dọn phòng sau 5 phút
    }
    const tieuDe = the.thang >= 0 ? (the.thang === ban_ ? 'Bạn thắng!' : `${tenNha(the.thang)} thắng!`) : 'Hoà';
    const loi = the.thang >= 0 ? `${tenNha(the.thang)} (${TEN_MAU[the.thang]}) là vua cuối cùng còn đứng.` : 'Không ai còn cách chiếu hết người kia.';
    const tiep = phong && phong.cay && phong.cay.tiep;
    moTin(`<p class="cb-tin-nho">Hết ván · ${van.soNuoc} nước · phòng ${van.ma}</p><h2>${tieuDe}</h2><p>${loi}</p>
      <p class="cb-meo">${L.THU_TU.map(P => `${esc(tenNha(P))}: ăn ${Math.round(van.an[P] / 100)} điểm`).join(' · ')}</p>
      ${tiep ? '<p class="cb-meo">Có người mời chơi ván nữa.</p><button type="button" class="cb-vaotiep">Vào ván mới</button>' : '<button type="button" class="cb-vannua">Chơi ván nữa</button>'}
      <button type="button" class="cb-phu cb-roi">Rời phòng</button>`);
    return;
  }
  if (the.thang >= 0) tiengThang();
  const tieuDe = the.thang >= 0 ? (the.thang === ban_ ? 'Bạn thắng!' : `${tenNha(the.thang)} thắng!`) : 'Hoà';
  const loi = the.thang >= 0 ? `${tenNha(the.thang)} (${TEN_MAU[the.thang]}) là vua cuối cùng còn đứng.` : 'Không ai còn cách chiếu hết người kia.';
  moTin(`<p class="cb-tin-nho">Hết ván · ${van.soNuoc} nước</p><h2>${tieuDe}</h2><p>${loi}</p>
    <p class="cb-meo">${L.THU_TU.map(P => `${tenNha(P)}: ăn ${Math.round(van.an[P] / 100)} điểm`).join(' · ')}</p>
    <button type="button" class="cb-lai">Ván mới, như cũ</button><button type="button" class="cb-phu cb-moi">Đổi cách chơi</button>`);
}
function bam(e) {
  const t = e.target, q = (s) => t.closest && t.closest(s);
  let n;
  if (q('.xn-dong')) { dong(); return; }
  if (q('.cb-noi') || q('.cb-bao')) { t.hidden = true; return; }
  if (q('.cb-hoi')) { moHuongDan(); return; }
  if (q('.cb-moi')) { if (van && van.cheDo === 'phong' && phong) moPhongTT(); else moCaiDat(); return; }
  if (q('.cb-hoan')) { hoanTac(); return; }
  if (q('.cb-demo')) { batDemo(); return; }
  if (q('.cb-dongtin')) { tatTin(); if (!van) moCaiDat(); return; }
  if ((n = q('[data-che]'))) { moCaiDat.ch.che = n.dataset.che; ghiLuu({ che: n.dataset.che }); moCaiDat(); return; }
  if ((n = q('[data-mau]'))) { ghiLuu({ mau: +n.dataset.mau }); moCaiDat(); return; }
  if ((n = q('[data-kho]'))) { ghiLuu({ kho: +n.dataset.kho }); moCaiDat(); return; }
  if ((n = q('[data-ngoi]'))) { ngoiGhe(+n.dataset.ngoi); return; }
  if (q('.cb-tao')) { amThanh(); const c = moCaiDat.ch; taoPhong({ mau: c.mau, kho: c.kho, ten: tenMinh() }); return; }
  if (q('.cb-vao')) { amThanh(); vaoBangMa(); return; }
  if (q('.cb-batdau-phong')) { amThanh(); batDauPhong(); return; }
  if (q('.cb-moi-ban')) { moiBan(); return; }
  if (q('.cb-roi')) { roiPhong(); moCaiDat(); return; }
  if (q('.cb-vannua')) { vanNua(); return; }
  if (q('.cb-vaotiep')) { if (phong && phong.cay && phong.cay.tiep) theoTiep(phong.cay.tiep); return; }
  if ((n = q('.cb-thay'))) { if (n.dataset.viec === 'tudi') tuDiTiep(); else choMayThay(); return; }
  if (q('.cb-tieng')) { coTieng = !coTieng; if (!coTieng && am) am.suspend(); moCaiDat(); return; }
  if (q('.cb-batdau')) { amThanh(); vanMoi(moCaiDat.ch); return; }
  if (q('.cb-lai')) { vanMoi({ che: van.cheDo, mau: van.nguoiChoi, kho: van.kho }); return; }
  if (q('.cb-xemtiep')) { van.xemTiep = true; tatTin(); denLuot(); return; }
  if ((n = q('[data-phong]'))) { const m = Object.assign({}, phongCho, { phong: +n.dataset.phong }); phongCho = null; tatTin(); diNuoc(m, van.the.luot); return; }
}
function vong(t) {
  raf = 0;
  if (!tam || !tam.classList.contains('hien')) return;
  if (Math.abs(xoayDen - xoay) > .002) xoay += (xoayDen - xoay) * .12; else xoay = xoayDen;
  veCanh(t);
  /* bạn bị loại khi đấu với máy: hỏi xem tiếp hay ván mới (một lần) */
  if (van && van.cheDo === 'may' && !van.the.song[van.nguoiChoi] && !van.xemTiep && van.the.thang < 0 && !van.the.hoa && !hoat && !van.daHoiLoai) {
    van.daHoiLoai = true;
    moTin(`<p class="cb-tin-nho">Bạn bị loại</p><h2>Vua của bạn đã mất</h2><p>Quân của bạn hoá đá. Hai máy vẫn đấu tiếp tới khi còn một vua.</p>
      <button type="button" class="cb-xemtiep">Xem hai máy đấu tiếp</button><button type="button" class="cb-phu cb-lai">Ván mới</button>`);
  }
  raf = requestAnimationFrame(vong);
}
function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  taoTho();
  const m = MANG && MA_DIA_CHI.exec(dauThang()), luu = docLuu().phong;
  if (m) {
    if (!phong || phong.ma !== m[1]) vaoPhong(m[1], luu && luu.ma === m[1] ? { id: luu.id, P: luu.P } : null);
    else noiPhong();
  } else if (phong) { noiPhong(); datDiaChi(phong.ma); }
  else if (!van && MANG && luu && MANG.laMa(luu.ma)) vaoPhong(luu.ma, { id: luu.id, P: luu.P }, -1, true);   // mở lại sau khi tải lại trang
  else if (!van) {
    if (!docLuu().h) { ghiLuu({ h: 1 }); moHuongDan(); }
    else moCaiDat();
  }
  if (!raf) raf = requestAnimationFrame(vong);
}
function dong() {
  dungLuong();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (am && am.state === 'running') am.suspend();
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}
if (typeof addEventListener === 'function') addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !tam || !tam.classList.contains('hien')) return;
  if (!tam.querySelector('.cb-tin').hidden && van) tatTin(); else dong();
});

self.TDTD_COBA = {
  L, LOI, mo, dong, KHO, TINH_CACH,
  _vanMoi: (ch) => vanMoi(ch), _van: () => van, _thucHien: (m, P) => thucHien(m, P), _chamBan: (x, y) => chamBan(x, y), _hoanTac: () => hoanTac(),
  _tamO: (c) => tamO(c), _oTai: (x, y) => oTai(x, y), _canhBan: () => canhBan(), _xoay: () => xoay, _xoayDen: () => xoayDen, _datXoay: (g) => { xoay = xoayDen = g; },
  _chon: () => chon, _nuocCuaChon: () => nuocCuaChon, _hoat: () => hoat, _xongHoat: () => { if (hoat) { const f = hoat.xong; hoat = null; f(); } },
  _apDungNuocMay: (so, P, kq) => apDungNuocMay(so, P, kq), _viec: () => viec, _coTheHoan: () => coTheHoan(), _demo: () => demo, _batDemo: () => batDemo(), _tiepDemo: () => tiepDemo(),
  _veCanh: (t) => veCanh(t), _GOC_NHIN: GOC_NHIN, _CO_O: CO_O, _cauHinhMay: (P) => cauHinhMay(P), _tenNha: (P) => tenNha(P),
  _phong: () => phong, _taoPhong: (ch) => taoPhong(ch), _vaoPhong: (ma, minh, muon) => vaoPhong(ma, minh, muon), _ngoiGhe: (P) => ngoiGhe(P),
  _batDauPhong: () => batDauPhong(), _diNuoc: (m, P) => diNuoc(m, P), _roiPhong: () => roiPhong(), _vanNua: () => vanNua(), _theoTiep: (ma) => theoTiep(ma),
  _kiemPhong: () => kiemPhong(), _toiChayMay: () => toiChayMay(), _viecPhong: () => viecPhong(), _choMayThay: () => choMayThay(), _tuDiTiep: () => tuDiTiep(),
  _timNuocMang: (the, mv) => timNuocMang(the, mv), _moCaiDat: () => moCaiDat(), _laMinh: (P) => laMinh(P), _duongChon: () => duongChon,
};
})();
