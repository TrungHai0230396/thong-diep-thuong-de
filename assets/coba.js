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
     mã quân = D·8 + loại, D là đạo quân gốc (nhà sinh ra quân đó); loại 1 tốt, 2 mã, 3 tượng, 4 xe, 5 hậu, 6 vua, 7 tướng.
     t.chu[D] là nhà đang cầm đạo quân D. Luật thường: luôn là D, quân của nhà đã bị loại vẫn nằm đó ("đá"). Luật Tam quốc
     (người dùng: "giết vua thì được bầu 1 quân bên chết làm tướng, tướng đi yếu như vua, các quân còn sống bên chết thuộc
     về quân giết — như đánh trận lúc xưa, chiếm qua chiếm lại"): giết vua là cướp mọi đạo quân nhà đó đang cầm, người
     giết chọn một quân làm tướng (t.cho: đang chờ chọn); giết tướng là cướp đạo quân của tướng. Tốt vẫn tiến theo hướng
     của đạo gốc. */
  const TOT = 1, MA_ = 2, TUONG = 3, XE = 4, HAU = 5, VUA_ = 6, TG = 7;
  const GIA = [0, 100, 300, 320, 500, 900, 0, 250];
  const THU_TU = [0, 2, 1];                                           // Trắng → Đen → Đỏ, theo chiều kim đồng hồ
  const HANG_QUAN = [XE, MA_, TUONG, HAU, VUA_, TUONG, MA_, XE];      // hậu bên trái vua, như mọi bản cờ ba người
  function theMoi(luat) {
    const o = new Int8Array(96);
    for (let P = 0; P < 3; P++) for (let f = 0; f < 8; f++) { o[oCua(P, f, 1)] = P * 8 + HANG_QUAN[f]; o[oCua(P, f, 2)] = P * 8 + TOT; }
    return { o, luot: 0, song: [1, 1, 1], vua: [oCua(0, 4, 1), oCua(1, 4, 1), oCua(2, 4, 1)], nhap: 63, dem50: 0, soNuoc: 0, thang: -1, hoa: false,
      tq: luat === 'tq', chu: [0, 1, 2], cho: [] };
  }
  const chepThe = (t) => ({ o: Int8Array.from(t.o), luot: t.luot, song: t.song.slice(), vua: t.vua.slice(), nhap: t.nhap, dem50: t.dem50, soNuoc: t.soNuoc,
    thang: t.thang, hoa: t.hoa, tq: !!t.tq, chu: (t.chu || [0, 1, 2]).slice(), cho: (t.cho || []).map(k => Object.assign({}, k)) });
  const soSong = (t) => t.song[0] + t.song[1] + t.song[2];
  function keTiep(t, P) { let i = THU_TU.indexOf(P); for (let k = 0; k < 3; k++) { i = (i + 1) % 3; if (t.song[THU_TU[i]]) return THU_TU[i]; } return P; }

  /* ô c có bị nhà nào còn sống (khác P) nhắm tới không — quân tính theo nhà đang cầm nó; tướng nhắm như vua */
  function biNham(t, c, P) {
    const o = t.o, song = t.song, chu = t.chu;
    const dich = (x) => { const Q = chu[x >> 3]; return Q !== P && song[Q]; };
    for (const y of MA[c]) { const x = o[y]; if (x && (x & 7) === MA_ && dich(x)) return true; }
    for (const y of VUA[c]) { const x = o[y]; if (x && ((x & 7) === VUA_ || (x & 7) === TG) && dich(x)) return true; }
    for (let D = 0; D < 3; D++) { const Q = chu[D]; if (Q !== P && song[Q]) for (const y of TOT_BI_AN[D][c]) if (o[y] === D * 8 + TOT) return true; }
    for (const tia of TRUC[c]) for (const y of tia) { const x = o[y]; if (!x) continue; if (((x & 7) === XE || (x & 7) === HAU) && dich(x)) return true; break; }
    for (const tia of CHEO[c]) for (const y of tia) { const x = o[y]; if (!x) continue; if (((x & 7) === TUONG || (x & 7) === HAU) && dich(x)) return true; break; }
    return false;
  }
  const biChieu = (t, P) => t.song[P] && t.vua[P] >= 0 && biNham(t, t.vua[P], P);
  /* những quân đang chiếu vua P, kèm đường đi của chúng (để vẽ "báo nguy") */
  function aiChieu(t, P) {
    const o = t.o, c = t.vua[P], ra = [];
    if (c < 0 || !t.song[P]) return ra;
    const dich = (x) => { const Q = t.chu[x >> 3]; return Q !== P && t.song[Q]; };
    for (const y of MA[c]) { const x = o[y]; if (x && (x & 7) === MA_ && dich(x)) ra.push({ o: y, duong: [y, c] }); }
    for (const y of VUA[c]) { const x = o[y]; if (x && ((x & 7) === VUA_ || (x & 7) === TG) && dich(x)) ra.push({ o: y, duong: [y, c] }); }
    for (let D = 0; D < 3; D++) { const Q = t.chu[D]; if (Q !== P && t.song[Q]) for (const y of TOT_BI_AN[D][c]) if (o[y] === D * 8 + TOT) ra.push({ o: y, duong: [y, c] }); }
    const quet = (tias, loai) => { for (const tia of tias) for (let i = 0; i < tia.length; i++) { const x = o[tia[i]]; if (!x) continue;
      if (loai.includes(x & 7) && dich(x) && !ra.some(r => r.o === tia[i])) ra.push({ o: tia[i], duong: tia.slice(0, i + 1).reverse().concat([c]) }); break; } };
    quet(TRUC[c], [XE, HAU]); quet(CHEO[c], [TUONG, HAU]);
    return ra;
  }

  /* ---------- nước đi ----------
     nước = { tu, toi, phong (loại quân phong, 0 nếu không), nhap (1 nhập thành cánh vua, 2 cánh hậu) }. Luật Tam quốc thêm
     nước phong tướng: tu === toi, là ô của quân được chọn — ghi lên máy chủ như mọi nước khác. */
  const laHangCuoi = (D, c) => (c >> 5) !== D && hangO(c) === 1;
  function nuocGia(t, P, chiAn, ds) {
    const o = t.o, chu = t.chu, tem = nuocGia.tem || (nuocGia.tem = new Int32Array(96));
    let dau = (nuocGia.dau = (nuocGia.dau || 0) + 1);
    for (let c = 0; c < 96; c++) {
      const x = o[c];
      if (!x || chu[x >> 3] !== P) continue;
      const loai = x & 7, D = x >> 3;
      const them = (toi) => {
        const y = o[toi];
        if (y && chu[y >> 3] === P) return;
        if (chiAn && !y) return;
        ds.push({ tu: c, toi, phong: 0, nhap: 0 });
      };
      if (loai === TOT) {
        const toi = TOT_TIEN[D][c];
        if (toi >= 0 && !o[toi] && !chiAn) {
          if (laHangCuoi(D, toi)) ds.push({ tu: c, toi, phong: HAU, nhap: 0 });
          else {
            ds.push({ tu: c, toi, phong: 0, nhap: 0 });
            if ((c >> 5) === D && hangO(c) === 2) { const t2 = TOT_TIEN[D][toi]; if (t2 >= 0 && !o[t2]) ds.push({ tu: c, toi: t2, phong: 0, nhap: 0 }); }
          }
        } else if (toi >= 0 && !o[toi] && chiAn && laHangCuoi(D, toi)) ds.push({ tu: c, toi, phong: HAU, nhap: 0 });
        for (const y of TOT_AN[D][c]) { const z = o[y]; if (z && chu[z >> 3] !== P) ds.push({ tu: c, toi: y, phong: laHangCuoi(D, y) ? HAU : 0, nhap: 0 }); }
      } else if (loai === MA_) { for (const y of MA[c]) them(y); }
      else if (loai === VUA_) {
        for (const y of VUA[c]) them(y);
        if (!chiAn && D === P) nhapThanh(t, P, c, ds);
      } else if (loai === TG) { for (const y of VUA[c]) them(y); }
      else {
        dau = ++nuocGia.dau;
        const tias = loai === XE ? TRUC[c] : loai === TUONG ? CHEO[c] : TRUC[c].concat(CHEO[c]);
        for (const tia of tias) for (const y of tia) {
          const z = o[y];
          if (tem[y] !== dau) { tem[y] = dau; if (!z) { if (!chiAn) ds.push({ tu: c, toi: y, phong: 0, nhap: 0 }); } else if (chu[z >> 3] !== P) ds.push({ tu: c, toi: y, phong: 0, nhap: 0 }); }
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
  /* ---------- Tam quốc: đổi chủ, phong tướng ---------- */
  function coQuan(t, D) { for (let c = 0; c < 96; c++) { const x = t.o[c]; if (x && (x >> 3) === D) return true; } return false; }
  function coTuong(t, D) { for (let c = 0; c < 96; c++) if (t.o[c] === D * 8 + TG) return true; return false; }
  /* quân máy chọn làm tướng: rẻ, không đang bị nhắm (tướng mất là mất cả đạo quân) */
  function chonTuong(t, D) {
    const P = t.chu[D];
    let tot = -1, diem = Infinity;
    for (let c = 0; c < 96; c++) {
      const x = t.o[c];
      if (!x || (x >> 3) !== D) continue;
      const d = GIA[x & 7] + (biNham(t, c, P) ? 2000 : 0) + XA_TAM[c] * 2;
      if (d < diem) { diem = d; tot = c; }
    }
    return tot;
  }
  /* đạo quân D vừa đổi chủ mà chưa có tướng: tuDong (máy nghĩ thử) thì phong luôn, không thì chờ người cầm chọn.
     sau: ván dừng ở nhà nào — chọn tướng xong thì tới lượt nhà kế sau nhà đó */
  function canTuong(t, D, sau, tuDong, lui) {
    if (t.chu[D] === D || coTuong(t, D) || !coQuan(t, D)) return;
    if (tuDong) {
      const c = chonTuong(t, D);
      if (c >= 0) { if (lui) (lui.doi || (lui.doi = [])).push([c, t.o[c]]); t.o[c] = D * 8 + TG; }
      return;
    }
    if (!t.cho.some(k => k.dao === D)) t.cho.push({ ai: t.chu[D], dao: D, sau });
  }
  /* nhà B mất vua vào tay P: mọi đạo quân B đang cầm về tay P */
  function giet(t, B, P, sau, tuDong, lui) {
    for (let D = 0; D < 3; D++) if (t.chu[D] === B) t.chu[D] = P;
    for (let D = 0; D < 3; D++) if (t.chu[D] === P) canTuong(t, D, sau, tuDong, lui);
  }
  /* đi một nước (sửa thẳng vào t), trả thông tin để hoàn lại. tuDong: lúc máy nghĩ thử, cướp được đạo quân thì phong tướng
     luôn, khỏi dừng chờ chọn */
  function diNuoc(t, m, tuDong) {
    const o = t.o, x = o[m.tu], D = x >> 3, P = t.chu[D], an = o[m.toi];
    const lui = { m, x, an, nhap: t.nhap, dem50: t.dem50, vua: t.vua.slice(), song: t.song.slice(), chu: t.chu.slice(), cho: t.cho.slice(), doi: null };
    if (m.tu === m.toi) {                                              // phong quân này làm tướng của đạo quân nó
      o[m.tu] = D * 8 + TG;
      t.cho = t.cho.filter(k => k.dao !== D);
      t.soNuoc++;
      return lui;
    }
    o[m.toi] = m.phong ? D * 8 + m.phong : x; o[m.tu] = 0;
    if ((x & 7) === VUA_) {
      t.vua[D] = m.toi; t.nhap &= ~(3 << (2 * D));
      if (m.nhap === 1) { o[oCua(D, 5, 1)] = o[oCua(D, 7, 1)]; o[oCua(D, 7, 1)] = 0; }
      if (m.nhap === 2) { o[oCua(D, 3, 1)] = o[oCua(D, 0, 1)]; o[oCua(D, 0, 1)] = 0; }
    }
    for (let Q = 0; Q < 3; Q++) {                                    // xe rời chỗ cũ, hay bị ăn ở chỗ cũ: mất quyền nhập thành
      if (m.tu === oCua(Q, 7, 1) || m.toi === oCua(Q, 7, 1)) t.nhap &= ~(1 << (2 * Q));
      if (m.tu === oCua(Q, 0, 1) || m.toi === oCua(Q, 0, 1)) t.nhap &= ~(2 << (2 * Q));
    }
    if (an && (an & 7) === VUA_ && t.song[an >> 3]) {                  // ăn vua: nhà đó bị loại
      const B = an >> 3; t.song[B] = 0; t.vua[B] = -1;
      if (t.tq) giet(t, B, P, P, tuDong, lui);                          // Tam quốc: cướp mọi đạo quân nhà đó đang cầm
    } else if (an && (an & 7) === TG && t.tq) {                        // giết tướng: cướp đạo quân của tướng
      const B = an >> 3; t.chu[B] = P; canTuong(t, B, P, tuDong, lui);
    }
    t.dem50 = an || (x & 7) === TOT ? 0 : t.dem50 + 1;
    t.soNuoc++;
    return lui;
  }
  function hoanNuoc(t, lui) {
    const o = t.o, m = lui.m, D = lui.x >> 3;
    if (lui.doi) for (let i = lui.doi.length - 1; i >= 0; i--) o[lui.doi[i][0]] = lui.doi[i][1];
    o[m.tu] = lui.x;
    if (m.tu !== m.toi) o[m.toi] = lui.an;
    if (m.nhap === 1) { o[oCua(D, 7, 1)] = o[oCua(D, 5, 1)]; o[oCua(D, 5, 1)] = 0; }
    if (m.nhap === 2) { o[oCua(D, 0, 1)] = o[oCua(D, 3, 1)]; o[oCua(D, 3, 1)] = 0; }
    t.nhap = lui.nhap; t.dem50 = lui.dem50; t.vua = lui.vua; t.song = lui.song; t.chu = lui.chu; t.cho = lui.cho; t.soNuoc--;
  }
  /* nước hợp lệ: không để vua mình bị nhắm sau khi đi. Đang chờ chọn tướng thì chỉ có các nước phong tướng. */
  function nuocHopLe(t, P, chiAn) {
    if (t.cho.length) {
      const k = t.cho[0], ra = [];
      if (k.ai !== P || chiAn) return ra;
      for (let c = 0; c < 96; c++) { const x = t.o[c]; if (x && (x >> 3) === k.dao) ra.push({ tu: c, toi: c, phong: 0, nhap: 0 }); }
      return ra;
    }
    const gia = nuocGia(t, P, !!chiAn, []), ra = [];
    for (const m of gia) { const lui = diNuoc(t, m, true); if (!biChieu(t, P)) ra.push(m); hoanNuoc(t, lui); }
    return ra;
  }
  /* đường quân đi qua (để trượt quân theo đúng đường cong qua tâm) */
  function duongDi(t, m) {
    if (m.tu === m.toi) return [m.tu];
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
    const ev = [], phong = lui && lui.m.tu === lui.m.toi;
    if (phong) ev.push({ loai: 'phongtuong', ai: t.chu[lui.x >> 3], dao: lui.x >> 3, o: lui.m.tu, cu: lui.x & 7 });
    else if (lui && lui.an) {
      const ai = lui.chu[lui.x >> 3], B = lui.an >> 3;
      if ((lui.an & 7) === VUA_ && lui.song[B]) ev.push({ loai: 'anvua', ai, bi: B });
      if ((lui.an & 7) === TG && t.tq) ev.push({ loai: 'antuong', ai, dao: B, cu: lui.chu[B] });
    }
    if (lui && t.tq && !phong) for (let D = 0; D < 3; D++) if (t.chu[D] !== lui.chu[D]) ev.push({ loai: 'chiemquan', ai: t.chu[D], dao: D, cu: lui.chu[D] });
    const het = () => { t.cho = []; t.thang = t.song.indexOf(1); ev.push({ loai: 'thang', ai: t.thang }); return ev; };
    const choChon = () => { t.luot = t.cho[0].ai; ev.push({ loai: 'chontuong', ai: t.cho[0].ai, dao: t.cho[0].dao }); return ev; };
    if (soSong(t) <= 1) return het();
    if (t.cho.length) return choChon();
    /* vừa phong tướng: đi tiếp từ chỗ ván đã dừng (nhà vừa giết, hay nhà vừa bị chiếu hết) */
    let P = phong && lui.cho.length && lui.cho[0].sau !== undefined ? lui.cho[0].sau : t.luot, dem = 0;
    for (;;) {
      P = keTiep(t, P);
      if (++dem > 6) { t.hoa = true; ev.push({ loai: 'hoa', vi: 'kẹt' }); return ev; }
      if (nuocHopLe(t, P).length) break;
      if (biChieu(t, P)) {
        /* Tam quốc: chiếu hết cũng là giết vua — vua bị bắt khỏi bàn, người giết là nhà đang chiếu (ưu tiên nhà vừa đi) */
        const ke = t.tq ? aiChieu(t, P).map(r => t.chu[t.o[r.o] >> 3]) : [], nguoiDi = lui ? lui.chu[lui.x >> 3] : -1, vuaO = t.vua[P];
        t.song[P] = 0; t.vua[P] = -1; ev.push({ loai: 'chieuhet', bi: P });
        if (t.tq && ke.length) {
          const truoc = t.chu.slice();
          t.o[vuaO] = 0;
          giet(t, P, ke.includes(nguoiDi) ? nguoiDi : ke[0], P, false, null);
          for (let D = 0; D < 3; D++) if (t.chu[D] !== truoc[D]) ev.push({ loai: 'chiemquan', ai: t.chu[D], dao: D, cu: truoc[D] });
        }
        if (soSong(t) <= 1) return het();
        if (t.cho.length) return choChon();
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
  /* còn hai nhà mà chẳng nhà nào đủ quân chiếu hết (chỉ còn vua, hay vua với một mã/tượng): hoà. Tướng đi như vua nên
     cùng vua chiếu hết được: tính như quân đủ sức. */
  function thieuQuan(t) {
    if (soSong(t) !== 2) return false;
    const chuCua = (x) => t.chu[x >> 3];
    for (let c = 0; c < 96; c++) { const x = t.o[c]; if (!x || !t.song[chuCua(x)]) continue; const l = x & 7; if (l === TOT || l === XE || l === HAU || l === TG) return false; }
    const nhe = [0, 0, 0];
    for (let c = 0; c < 96; c++) { const x = t.o[c]; if (x && t.song[chuCua(x)] && ((x & 7) === MA_ || (x & 7) === TUONG)) nhe[chuCua(x)]++; }
    return nhe.every(n => n <= 1);
  }

  /* ---------- chấm điểm thế cờ ----------
     Điểm một nhà = giá quân + điểm vị trí của mọi quân nhà đó đang cầm; nhà đã loại tính 0. Máy nhìn từ phía mình: điểm
     mình − trung bình hai nhà kia. Tính cách: Hổ cộng điểm cho quân đã sang nhà người và quân áp sát vua địch; Rùa cộng
     điểm cho quân đứng che vua mình. Luật Tam quốc thì cướp được đạo quân là điểm vọt lên ngay, nên máy tự biết rình vua,
     rình tướng của người. */
  function diemNha(t, P, tc) {
    const o = t.o, chu = t.chu;
    let s = 0, quanLon = 0;
    for (let c = 0; c < 96; c++) { const x = o[c]; if (x && chu[x >> 3] !== P && t.song[chu[x >> 3]] && (x & 7) >= MA_ && (x & 7) <= HAU) quanLon++; }
    const tanCuoc = quanLon <= 4;
    for (let c = 0; c < 96; c++) {
      const x = o[c];
      if (!x || chu[x >> 3] !== P) continue;
      const loai = x & 7, D = x >> 3, nha = c >> 5, r = hangO(c), xa = XA_TAM[c];
      s += GIA[loai];
      if (loai === TOT) s += nha === D ? (r - 2) * 8 : 30 + (4 - r) * 18;
      else if (loai === MA_) s += (6 - Math.min(6, xa)) * 6;
      else if (loai === TUONG) s += (6 - Math.min(6, xa)) * 4;
      else if (loai === XE) s += nha !== D ? 12 : 0;
      else if (loai === HAU) s += (6 - Math.min(6, xa)) * 2;
      else if (loai === VUA_) s += tanCuoc ? (6 - Math.min(6, xa)) * 6 : (nha === P && r === 1 ? 24 : -16 - (6 - Math.min(6, xa)) * 4);
      else if (loai === TG) s += (6 - Math.min(6, xa)) * 2;
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
     một đối thủ đi (ai có nước đáp mạnh nhất), rồi lại tới mình. Tìm sâu dần tới khi hết giờ. Đang tới lượt mình chọn tướng
     (Tam quốc) thì chọn quân rẻ, không đang bị nhắm. */
  const VO_CUC = 1e6;
  function timNuoc(t0, X, ch) {
    const t = chepThe(t0), cauHinh = Object.assign({ kieu: 'hoangtuong', sau: 3, ms: 900, tinhCach: null, nhieu: 0 }, ch || {});
    if (t.cho.length) {
      const c = t.cho[0].ai === X ? chonTuong(t, t.cho[0].dao) : -1;
      return { nuoc: c >= 0 ? { tu: c, toi: c, phong: 0, nhap: 0 } : null, diem: 0, sau: 0, nut: 0 };
    }
    const tc = cauHinh.tinhCach, hetGio = Date.now() + cauHinh.ms;
    let nut = 0;
    const DUNG = {};
    const kiemGio = () => { if ((++nut & 511) === 0 && Date.now() > hetGio) throw DUNG; };
    const xepNuoc = (ds) => {
      for (const m of ds) {
        const an = t.o[m.toi];
        m.k = an ? ((an & 7) === VUA_ ? 1e5 : (an & 7) === TG ? 5e4 : GIA[an & 7] * 10 - GIA[t.o[m.tu] & 7] / 10) : 0;
        if (m.phong) m.k += 800;
      }
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
        const lui = diNuoc(t, m, true);
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
          const s = t.song.slice(), v0 = t.vua.slice(), chu0 = t.chu.slice(), vo = t.vua[ai], xv = t.o[vo];
          const ke = t.tq ? aiChieu(t, ai).map(r => t.chu[t.o[r.o] >> 3]) : [], tam = { doi: null };
          t.song[ai] = 0; t.vua[ai] = -1;
          if (t.tq && ke.length) { t.o[vo] = 0; giet(t, ai, ke[0], ai, true, tam); }
          const v = brs ? ab(depth - 1, a, b, X, ply + 1, !max, true) : ab(depth - 1, a, b, keTiep(t, ai), ply + 1, keTiep(t, ai) === X, false);
          if (tam.doi) for (let i = tam.doi.length - 1; i >= 0; i--) t.o[tam.doi[i][0]] = tam.doi[i][1];
          if (t.tq && ke.length) t.o[vo] = xv;
          t.song = s; t.vua = v0; t.chu = chu0;
          return v;
        }
        if (soSong(t) === 2) return 0;
        return brs ? ab(depth - 1, a, b, X, ply + 1, !max, true) : ab(depth - 1, a, b, keTiep(t, P), ply + 1, keTiep(t, P) === X, false);
      }
      let best = max ? -Infinity : Infinity;
      for (const m of xepNuoc(ds)) {
        const lui = diNuoc(t, m, true);
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
          const lui = diNuoc(t, m, true);
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
    LOAI: { TOT, MA: MA_, TUONG, XE, HAU, VUA: VUA_, TG }, GIA, THU_TU, theMoi, chepThe, soSong, keTiep, biNham, biChieu, aiChieu,
    nuocGia, nuocHopLe, diNuoc, hoanNuoc, duongDi, sauNuoc, thieuQuan, danhGia, timNuoc, chonTuong, coTuong,
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
const TEN_LOAI = { 1: 'Tốt', 2: 'Mã', 3: 'Tượng', 4: 'Xe', 5: 'Hậu', 6: 'Vua', 7: 'Tướng' };
/* màu quân, tô như gỗ tiện mặt mờ: sang (chỗ ánh sáng rọi, bên trái), giua, toi (bên phải), ria (mép ngoài cùng), vien (nét
   viền); cham: chấm màu trên thẻ, nút. Ba nhà ba độ sáng khác nhau (sáng, vừa, tối) cho người mù màu vẫn phân biệt */
const MAU = [
  { sang: '#fffaef', giua: '#eee0c2', toi: '#c9b286', ria: '#a18760', vien: '#4a3925', cham: '#f4ecd8' },
  { sang: '#f59a88', giua: '#d4493b', toi: '#9a2b21', ria: '#6b1a13', vien: '#3d0c07', cham: '#e0473a' },
  { sang: '#7c87a4', giua: '#3e455a', toi: '#202434', ria: '#14161f', vien: '#151824', cham: '#2b3142' },
];
const VIEN_SANG = Object.assign({}, MAU[2], { vien: '#aab3d0' });       // quân Đen vẽ trên nền tối (hàng quân mất trên thẻ): viền sáng
const DA = { sang: '#d4d0c8', giua: '#a4a098', toi: '#706d67', ria: '#56534e', vien: '#34322e' };
const TINH_CACH = {
  ho: { ten: 'Hổ', hang: true, kieu: 'brs',
    noi: { batDau: ['Vào trận thôi!', 'Hổ đây, ai trước nào?'], an: ['Ngon!', 'Của tôi nhé!', 'Xin nhé!'], chieu: ['Chiếu! Chạy đi đâu?', 'Chiếu tướng!'],
      mat: ['Hừ, nhớ đấy!', 'Được lắm!'], loai: ['Một người ra khỏi trận!'], biLoai: ['Hổ thua rồi… lần sau gặp lại!'], thang: ['Hổ vô địch!'],
      chiem: ['Đạo quân này giờ theo Hổ!', 'Về dưới cờ Hổ cả!'], biCuop: ['Dám cướp quân của Hổ à!', 'Trả quân đây!'] } },
  rua: { ten: 'Rùa', chac: true, kieu: 'hoangtuong',
    noi: { batDau: ['Chơi chậm thôi nhé.', 'Chậm mà chắc.'], an: ['Từ từ mà chắc.', 'Nhặt được rồi.', 'Cảm ơn nhé.'], chieu: ['Chiếu nhé, cẩn thận.'],
      mat: ['Không sao, còn nhiều.', 'Ừm…'], loai: ['Chậm mà chắc.'], biLoai: ['Rùa xin rút trước.'], thang: ['Rùa về đích!'],
      chiem: ['Thu nạp cả rồi.', 'Từ nay theo Rùa nhé.'], biCuop: ['Ây da, mất cả đạo quân…', 'Rùa sẽ lấy lại.'] } },
};
const KHO = [{ ten: 'Dễ', sau: 2, ms: 400, nhieu: 140 }, { ten: 'Vừa', sau: 3, ms: 700, nhieu: 16 }, { ten: 'Khó', sau: 6, ms: 1500, nhieu: 0 }];
const KHOA = 'tdtd.coba';
const docLuu = () => { try { const o = JSON.parse(localStorage.getItem(KHOA) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } };
const ghiLuu = (them) => { try { localStorage.setItem(KHOA, JSON.stringify(Object.assign(docLuu(), them))); } catch (e) {} };

let tam = null, cv = null, ctx = null, W = 360, H = 420, DPR = 1, raf = 0;
let van = null;                                                       // ván đang chơi
let chon = -1, nuocCuaChon = [], hoat = null, cho = [], xoay = 0, xoayDen = 0, demo = null, phongCho = null;
let chonXem = false;                                                  // quân đang chọn chỉ để xem (chưa tới lượt mình, hay quân nhà khác)
let xem = null;                                                       // đang xem cách đi từng quân trên bàn trống
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
    ctx.fillStyle = van && !xem && !van.the.song[P] ? '#6d6a64' : MAU[P].giua; ctx.fill();
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

/* ---------- quân cờ ----------
   Người dùng: "làm UIUX quân cờ đẹp hơn". Theo chuẩn thiết bị cờ của FIDE (bản có hiệu lực từ 1/3/2026): dáng Staunton;
   thứ tự cao thấp vua > hậu > tượng > mã > xe > tốt, chuẩn 95 / 85 / 70 / 60 / 55 / 50 mm, được lệch tối đa 10% — ở đây vua
   1,10 thì hậu 1,01, tượng 0,88, mã 0,76, xe 0,70, tốt 0,63 (đều trong khoảng cho phép, nghiêng về phía cao để quân nhỏ khỏi
   bé quá trên ô nhỏ); đầu vua khác hẳn đầu hậu (thập tự / vương miện có hạt), đầu tượng khác đầu tốt (khe chéo trên mũ);
   mặt mờ, không bóng loáng. Đế rộng hơn chuẩn (40–50% chiều cao) cho dễ nhận ra trên điện thoại. Tô như gỗ tiện: sáng bên
   trái, tối dần sang phải, vạch ở các khấc tiện; bóng đổ mềm dưới đế. Vẽ bằng nét (không dùng chữ ♔♕): máy nào cũng như nhau.
   Bản trước: quân nào cũng cao gần bằng nhau (tốt gần bằng hậu), tô một dải chéo. */
const CAO = [0, .63, .76, .88, .70, 1.01, 1.10, .86];                 // chiều cao từng loại (đơn vị s); 7 là tướng Tam quốc
const DE = [0, .205, .25, .235, .255, .27, .28, .25];                 // bán kính đế
/* thân tiện, đối xứng: điểm điều khiển nửa phải từ góc đế lên tới đỉnh (x = 0). Đường đi qua trung điểm hai điểm kề nhau
   (mượt như gỗ tiện); điểm viết hai lần thành góc. */
function thanTien(ds) {
  const pts = ds.concat(ds.slice(0, -1).reverse().map(([x, y]) => [-x, y]));
  ctx.moveTo(0, 0); ctx.lineTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) ctx.quadraticCurveTo(pts[i][0], pts[i][1], (pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2);
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); ctx.closePath();
}
const deTien = (r) => [[r, 0], [r, 0], [r, -.03], [r * 1.03, -.052], [r * .92, -.078], [r * .78, -.088], [r * .76, -.104]];
const tron2 = (x, y, rr) => { ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, 6.2832); };
/* từng loại: vien vẽ đường viền (một hay nhiều mảnh, cùng tô một lần), khac là các khấc tiện (độ cao, nửa rộng) để vạch,
   them vẽ chi tiết đè lên (mắt ngựa, khe mũ tượng, cờ của tướng) */
const DANG = {
  1: { vien: (r) => { thanTien(deTien(r).concat([[r * .58, -.15], [r * .44, -.27], [r * .36, -.355], [r * .84, -.37], [r * .86, -.40], [r * .86, -.40],
         [r * .40, -.42], [.06, -.43], [.118, -.47], [.12, -.585], [.06, -.64], [0, -.64]])); },
       khac: [[-.4, .17]] },
  4: { vien: (r) => {
         thanTien(deTien(r).concat([[r * .72, -.15], [r * .66, -.30], [r * .64, -.46], [r * .86, -.47], [r * .86, -.50], [r * .86, -.50], [r * .70, -.52], [0, -.52]]));
         const w = r * .9, b = -.505, t = -.70, kh = .06, k = w * .3;
         ctx.moveTo(-w, b); ctx.lineTo(-w, t); ctx.lineTo(-w + k, t); ctx.lineTo(-w + k, t + kh); ctx.lineTo(-k / 2, t + kh); ctx.lineTo(-k / 2, t);
         ctx.lineTo(k / 2, t); ctx.lineTo(k / 2, t + kh); ctx.lineTo(w - k, t + kh); ctx.lineTo(w - k, t); ctx.lineTo(w, t); ctx.lineTo(w, b); ctx.closePath(); },
       khac: [[-.48, .22], [-.6, .23]] },
  2: { vien: (r) => {
         thanTien(deTien(r).concat([[r * .8, -.12], [r * .8, -.12], [0, -.12]]));
         ctx.moveTo(.2, -.11);
         ctx.bezierCurveTo(.23, -.30, .2, -.52, .1, -.66);                  // gáy
         ctx.bezierCurveTo(.07, -.70, .05, -.73, .035, -.77);               // bờm sau tai
         ctx.lineTo(.0, -.72);                                              // tai
         ctx.bezierCurveTo(-.06, -.69, -.12, -.65, -.17, -.59);             // trán
         ctx.bezierCurveTo(-.21, -.54, -.25, -.50, -.255, -.465);           // sống mũi
         ctx.bezierCurveTo(-.26, -.43, -.22, -.415, -.18, -.425);           // mõm
         ctx.bezierCurveTo(-.14, -.435, -.11, -.45, -.075, -.43);           // hàm
         ctx.bezierCurveTo(-.06, -.39, -.15, -.31, -.17, -.22);             // cổ họng, ức
         ctx.bezierCurveTo(-.18, -.17, -.17, -.13, -.16, -.11);
         ctx.closePath(); },
       khac: [],
       them: (r, m) => {
         ctx.fillStyle = m.vien; ctx.beginPath(); ctx.ellipse(-.085, -.585, .022, .016, -.5, 0, 6.2832); ctx.fill();   // mắt
         ctx.beginPath(); ctx.arc(-.225, -.455, .012, 0, 6.2832); ctx.fill();                                        // lỗ mũi
         ctx.strokeStyle = m.vien; ctx.globalAlpha *= .55; ctx.lineWidth = .016;                                      // bờm
         ctx.beginPath(); for (const [a, b] of [[.13, -.62], [.17, -.52], [.19, -.42], [.2, -.32]]) { ctx.moveTo(a, b); ctx.quadraticCurveTo(a - .05, b + .02, a - .07, b + .07); } ctx.stroke();
       } },
  3: { vien: (r) => thanTien(deTien(r).concat([[r * .62, -.16], [r * .46, -.30], [r * .40, -.42], [r * .86, -.44], [r * .88, -.47], [r * .88, -.47],
         [r * .44, -.49], [r * .5, -.53], [r * .78, -.62], [r * .7, -.74], [.03, -.82], [.045, -.84], [.05, -.875], [0, -.88]])),
       khac: [[-.455, .2]],
       them: (r, m) => {                                                   // khe chéo trên mũ (FIDE: đầu tượng khác đầu tốt)
         ctx.strokeStyle = m.vien; ctx.lineWidth = .03; ctx.lineCap = 'round';
         ctx.beginPath(); ctx.moveTo(r * .52, -.73); ctx.lineTo(-r * .06, -.62); ctx.stroke();
       } },
  5: { vien: (r) => {
         thanTien(deTien(r).concat([[r * .64, -.17], [r * .46, -.34], [r * .42, -.52], [r * .82, -.55], [r * .84, -.58], [r * .84, -.58], [r * .48, -.60],
           [r * .6, -.70], [r * .9, -.82], [r * .9, -.84], [r * .5, -.86], [.07, -.90], [.04, -.93], [.05, -.97], [0, -1.01]]));
         ctx.moveTo(-r * .9, -.83);                                            // vương miện: năm mũi, đầu mũi có hạt
         for (const [a, b] of [[-.9, -.94], [-.6, -.86], [-.32, -.97], [0, -.88], [.32, -.97], [.6, -.86], [.9, -.94], [.9, -.83]]) ctx.lineTo(r * a, b);
         ctx.closePath();
         for (const a of [-.9, -.32, .32, .9]) tron2(r * a, Math.abs(a) > .5 ? -.955 : -.985, .028);
       },
       khac: [[-.565, .235]] },
  6: { vien: (r) => {
         thanTien(deTien(r).concat([[r * .64, -.17], [r * .46, -.36], [r * .42, -.57], [r * .84, -.60], [r * .86, -.63], [r * .86, -.63], [r * .48, -.65],
           [r * .64, -.76], [r * .84, -.84], [r * .84, -.86], [r * .5, -.875], [r * .44, -.93], [.035, -.945], [0, -.945]]));
         const v = .032, n = .1, y1 = -.935, y2 = -1.10, yn = -1.035;           // thập tự trên đỉnh
         ctx.moveTo(-v, y1); ctx.lineTo(-v * .8, yn + .025); ctx.lineTo(-n, yn + .03); ctx.lineTo(-n, yn - .03); ctx.lineTo(-v * .8, yn - .03); ctx.lineTo(-v, y2);
         ctx.lineTo(v, y2); ctx.lineTo(v * .8, yn - .03); ctx.lineTo(n, yn - .03); ctx.lineTo(n, yn + .03); ctx.lineTo(v * .8, yn + .025); ctx.lineTo(v, y1); ctx.closePath();
       },
       khac: [[-.615, .24], [-.85, .23]] },
  7: { vien: (r) => thanTien(deTien(r).concat([[r * .62, -.16], [r * .46, -.30], [r * .42, -.42], [r * .86, -.45], [r * .88, -.48], [r * .88, -.48],
         [r * .52, -.50], [r * .92, -.53], [r * .92, -.55], [r * .7, -.56], [r * .78, -.66], [r * .5, -.77], [.04, -.80], [.03, -.86], [0, -.86]])),
       khac: [[-.465, .2], [-.54, .23]],
       them: (r, m, goc) => {                                              // cán cờ và cờ hiệu màu đạo quân tướng cầm đầu
         ctx.strokeStyle = m.vien; ctx.lineWidth = .028;
         ctx.beginPath(); ctx.moveTo(r + .02, -.04); ctx.lineTo(r + .02, -.98); ctx.stroke();
         const co = goc || m;
         ctx.fillStyle = co.giua; ctx.lineWidth = .025;
         ctx.beginPath(); ctx.moveTo(r + .02, -.99); ctx.quadraticCurveTo(r + .22, -.97, r + .38, -.91); ctx.quadraticCurveTo(r + .22, -.86, r + .02, -.83); ctx.closePath(); ctx.fill(); ctx.stroke();
       } },
};
/* (x, y): giữa đế trên màn hình; s: cỡ quân; m: màu; da: quân đá (nhà đã bị loại); goc: màu đạo gốc khi quân đã đổi chủ
   (Tam quốc — vẽ vành màu đó quanh đế); nang: quân đang chọn nhấc lên khỏi bàn (0..1), bóng ở lại dưới bàn */
function vePhan(loai, x, y, s, m, da, goc, nang = 0) {
  const d = DANG[loai] || DANG[1], h = CAO[loai] || 1, r = DE[loai] || .25;
  ctx.save(); ctx.translate(x, y);
  const bong = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  bong.addColorStop(0, `rgba(0,0,0,${.42 - nang * .16})`); bong.addColorStop(.6, `rgba(0,0,0,${.2 - nang * .08})`); bong.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.translate(s * .03, s * .012); ctx.scale(s * r * (1.45 + nang * .35), s * r * (.42 + nang * .1));
  ctx.fillStyle = bong; ctx.beginPath(); ctx.arc(0, 0, 1, 0, 6.2832); ctx.fill(); ctx.restore();
  ctx.translate(0, -nang * s * .12); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); d.vien(r);
  ctx.save(); ctx.clip();
  const w = r * 1.08, g = ctx.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, m.ria); g.addColorStop(.2, m.sang); g.addColorStop(.46, m.giua); g.addColorStop(.8, m.toi); g.addColorStop(1, m.ria);
  ctx.fillStyle = g; ctx.fillRect(-.8, -1.2, 1.6, 1.3);
  const g2 = ctx.createLinearGradient(0, -h, 0, 0);
  g2.addColorStop(0, 'rgba(255,255,255,.13)'); g2.addColorStop(.5, 'rgba(255,255,255,0)'); g2.addColorStop(1, 'rgba(0,0,0,.18)');
  ctx.fillStyle = g2; ctx.fillRect(-.8, -1.2, 1.6, 1.3);
  for (const [yk, wk] of d.khac.concat([[-.088, r * .8]])) {                 // vạch tiện: rãnh tối, mép sáng ngay dưới
    ctx.lineWidth = .014; ctx.strokeStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.ellipse(0, yk, wk, wk * .14, 0, 0, Math.PI); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.beginPath(); ctx.ellipse(0, yk + .016, wk, wk * .14, 0, 0, Math.PI); ctx.stroke();
  }
  if (goc) {                                                                 // Tam quốc: quân cướp được mang vành màu đạo gốc
    ctx.fillStyle = goc.giua; ctx.globalAlpha *= .95;
    ctx.beginPath(); ctx.ellipse(0, -.05, r * 1.04, r * .2, 0, 0, Math.PI); ctx.lineTo(-r * 1.04, -.02); ctx.ellipse(0, -.02, r * 1.04, r * .2, 0, Math.PI, 0, true); ctx.closePath(); ctx.fill();
  }
  if (da) {                                                                  // quân đá: vài vết nứt
    ctx.strokeStyle = 'rgba(40,38,34,.6)'; ctx.lineWidth = .022;
    ctx.beginPath(); ctx.moveTo(-r * .4, -h * .42); ctx.lineTo(r * .05, -h * .55); ctx.lineTo(-r * .1, -h * .63); ctx.moveTo(r * .3, -h * .25); ctx.lineTo(r * .5, -h * .38); ctx.stroke();
  }
  ctx.restore();
  ctx.lineWidth = Math.max(.026, .9 / s); ctx.strokeStyle = m.vien;
  ctx.beginPath(); d.vien(r); ctx.stroke();
  if (d.them) { ctx.save(); d.them(r, m, goc); ctx.restore(); }
  ctx.restore();
}
function veQuan(x, c, toa, tiLe = 1, mo = 1, nang = 0) {
  const D = x >> 3, loai = x & 7, thuc = !demo && !xem && van, P = thuc ? van.the.chu[D] : D, da = thuc && !van.the.song[P];
  const s = Math.max(16, Math.min(60, coO(c) * 2.4)) * tiLe;
  ctx.globalAlpha = mo;
  vePhan(loai, toa[0], toa[1] + s * .32, s, da ? DA : MAU[P], da, !da && P !== D ? MAU[D] : null, nang);
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
  if (xem) {
    if (hoat) { const f = hoat.xong; hoat = null; f(); }              // ván vẫn chạy phía sau: nước mới áp ngay, khỏi chờ hình động
    veXem(t); return;
  }
  if (demo) { veDemo(t); return; }
  if (!van) return;
  const the = van.the;
  /* nước vừa đi của từng nhà, cũ trước mới sau: tới lượt mình là thấy cả hai nhà kia vừa làm gì */
  const vet = (van.vet || []).map((v, P) => v && Object.assign({ P }, v)).filter(Boolean).sort((a, b) => a.thu - b.thu);
  vet.forEach((v, i) => {
    const moi = i === vet.length - 1, m = MUI[v.P].o;
    toO(v.duong[0], `rgba(${m},${moi ? .28 : .15})`); toO(v.duong[v.duong.length - 1], `rgba(${m},${moi ? .46 : .26})`);
  });
  if (chon >= 0) toO(chon, chonXem ? 'rgba(205,150,255,.42)' : 'rgba(120,200,255,.45)');
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
  for (const c of thuTu) if (c !== chon) veQuan(the.o[c], c, tamO(c));
  vet.forEach((v, i) => veMuiTen(v, (chon >= 0 ? .35 : 1) * (i === vet.length - 1 ? .95 : i === vet.length - 2 ? .7 : .45)));
  if (the.cho && the.cho.length && !hoat) {                          // Tam quốc: đang chờ chọn tướng
    const D = the.cho[0].dao, nhip = .5 + .5 * Math.sin(t / 220);
    for (let c = 0; c < 96; c++) {
      const x = the.o[c];
      if (!x || (x >> 3) !== D) continue;
      const [px, py] = tamO(c), r = coO(c);
      ctx.lineWidth = Math.max(2.5, r * .16); ctx.strokeStyle = `rgba(255,214,90,${.5 + .45 * nhip})`;
      ctx.beginPath(); ctx.arc(px, py, r * .9, 0, 6.2832); ctx.stroke();
    }
  }
  if (van.loe && t - van.loe.t0 < 1400) {                            // tướng vừa phong: loé sáng một nhịp
    const [px, py] = tamO(van.loe.c), r = coO(van.loe.c) * (1.2 + (t - van.loe.t0) / 700), a = 1 - (t - van.loe.t0) / 1400;
    const g = ctx.createRadialGradient(px, py, 0, px, py, r * 1.6);
    g.addColorStop(0, `rgba(255,226,140,${.75 * a})`); g.addColorStop(1, 'rgba(255,226,140,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, r * 1.6, 0, 6.2832); ctx.fill();
  }
  for (const d of bao) veDuongDo(d.duong, t);
  if (chon >= 0 && nuocCuaChon.length) veDuongChon(the);
  veCham(the, nuocCuaChon, chonXem ? 'xem' : 'di');
  if (chon >= 0 && the.o[chon]) veQuan(the.o[chon], chon, tamO(chon), 1, 1, 1);   // quân đang chọn nhấc lên khỏi bàn, nằm trên đường đi
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
/* quân đang chọn: vẽ mọi đường nó đi được, uốn đúng theo bàn (đi qua tâm thì rẽ nhánh) — khỏi phải tự hình dung. Xanh là
   quân mình đang đi; tím là chỉ xem (chưa tới lượt mình, hay quân nhà khác) */
const MAU_DUONG = { di: ['rgba(10,35,60,.45)', 'rgba(110,215,255,.9)', 'rgba(20,120,175,.95)'], xem: ['rgba(45,20,70,.5)', 'rgba(215,165,255,.92)', 'rgba(130,70,190,.95)'] };
let duongChon = { c: -1, n: null, ds: [] };
function veDuongChon(the) {
  if (duongChon.c !== chon || duongChon.n !== nuocCuaChon) duongChon = { c: chon, n: nuocCuaChon, ds: nuocCuaChon.map(m => L.duongDi(the, m)) };
  veDuong(duongChon.ds, chonXem ? 'xem' : 'di');
}
function veDuong(ds, kieu) {
  const w = Math.max(2.5, ban.R * .016), m = MAU_DUONG[kieu];
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const [nen, rong] of [[m[0], w + 3], [m[1], w]]) {
    ctx.strokeStyle = nen; ctx.lineWidth = rong;
    for (const d of ds) { const pts = d.map(tamO); ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
  }
  ctx.restore();
}
/* chỗ đi được: chấm trắng viền xanh (tím nếu chỉ xem), ăn quân thì vòng đỏ */
function veCham(the, ds, kieu) {
  for (const m of ds) {
    const [x, y] = tamO(m.toi), r = coO(m.toi);
    if (the.o[m.toi]) {
      ctx.lineWidth = Math.max(3, r * .2) + 3; ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x, y, r * .82, 0, 6.2832); ctx.stroke();
      ctx.lineWidth = Math.max(3, r * .2); ctx.strokeStyle = 'rgba(215,40,30,.95)'; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(x, y, Math.max(4.5, r * .3), 0, 6.2832);
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = MAU_DUONG[kieu][2]; ctx.stroke();
    }
  }
}
function nhaNhin() {                                                  // nhà đang được nhìn từ phía dưới bàn
  if (!van) return 0;
  return van.nguoiChoi >= 0 ? van.nguoiChoi : 0;
}

/* ---------- trượt quân theo đường đi (cong qua tâm) ---------- */
/* chỗ quân tới khi đã đi được phần e của cả đường: toạ độ màn hình, và ô đang đi qua (để lấy cỡ quân) */
function diemTrenDuong(duong, e) {
  const pts = duong.map(tamO);
  let tong = 0; const doan = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); doan.push(d); tong += d; }
  let can = e * tong, i = 0;
  while (i < doan.length - 1 && can > doan[i]) { can -= doan[i]; i++; }
  const k = doan.length ? Math.min(1, can / (doan[i] || 1)) : 1, a = pts[i] || pts[0], b = pts[i + 1] || pts[0];
  return [tron(a[0], b[0], k), tron(a[1], b[1], k), duong[Math.min(duong.length - 1, Math.round(e * (duong.length - 1)))]];
}
function veHoat(t) {
  const h = hoat, p = Math.min(1, (t - h.t0) / h.lau), e = p * p * (3 - 2 * p);
  for (const q of h.quan) {
    const [x, y, c] = diemTrenDuong(q.duong, e), nhay = q.nhay ? Math.sin(e * Math.PI) : 0;
    veQuan(q.x, c, [x, y - nhay * coO(q.duong[0]) * 1.2], 1 + nhay * .12);
  }
  if (h.anX) veQuan(h.anX, h.an, tamO(h.an), 1, 1 - e);
  if (p >= 1) { const f = h.xong; hoat = null; f(); }
}

/* ---------- ván cờ ---------- */
function vanMoi(ch) {
  ch = Object.assign({ mau: 0, kho: 1, luat: 'thuong' }, ch || {});
  tatXem();
  roiPhong();                                                         // đấu với máy thì rời phòng đang ở (nếu có)
  boViec();
  const nguoi = [0, 1, 2].map(P => (P === ch.mau ? 'nguoi' : 'may'));
  const may = L.THU_TU.filter(P => nguoi[P] === 'may');
  const tinh = [null, null, null];
  const sauNguoi = (P) => { const i = L.THU_TU.indexOf(P); return [1, 2].map(k => L.THU_TU[(i + k) % 3]); };
  const [a, b] = sauNguoi(ch.mau); tinh[a] = 'ho'; tinh[b] = 'rua';
  van = { the: L.theMoi(ch.luat), luat: ch.luat === 'tq' ? 'tq' : 'thuong', cheDo: 'may', nguoi, tinh, kho: ch.kho, nguoiChoi: ch.mau, lichSu: [], nuocCuoi: null, vet: [null, null, null], dangNghi: -1, an: [0, 0, 0], mat: [[], [], []], soNuoc: 0, xemTiep: false };
  boChon(); hoat = null; phongCho = null;
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
  if (laNguoi(P)) { van.lichSu.push({ the: L.chepThe(the), nuocCuoi: van.nuocCuoi, vet: (van.vet || []).slice(), an: van.an.slice(), mat: van.mat.map(a => a.slice()) }); capNhatChu(); return; }
  if (!the.song[van.nguoiChoi] && !van.xemTiep) return;               // bạn bị loại: chờ chọn xem tiếp hay ván mới
  nhoMayNghi(P);
}
function gocGan(g) { while (g - xoay > Math.PI) g -= 2 * Math.PI; while (xoay - g > Math.PI) g += 2 * Math.PI; return g; }
/* đi một nước: trượt quân theo đường, rồi tính lượt sau */
function thucHien(m, P) {
  const the = van.the;
  if (the.luot !== P || the.thang >= 0 || the.hoa) return;
  if (m.tu === m.toi) {                                              // phong tướng: không trượt, sáng lên một nhịp
    boChon();
    const ev = apDung(m, P);
    van.loe = { c: m.tu, t0: bay() };
    tiengPhong(); baoSuKien(ev);
    if (!raf) raf = requestAnimationFrame(vong);
    denLuot();
    return;
  }
  const x = the.o[m.tu], an = the.o[m.toi], chuAn = an ? the.chu[an >> 3] : -1, duong = L.duongDi(the, m);
  const quan = [{ x, duong, nhay: (x & 7) === 2 }];
  if (m.nhap) { const r = the.o[L.oCua(P, m.nhap === 1 ? 7 : 0, 1)]; quan.push({ x: r, duong: [L.oCua(P, m.nhap === 1 ? 7 : 0, 1), L.oCua(P, m.nhap === 1 ? 5 : 3, 1)] }); }
  boChon();
  const lau = Math.min(900, 180 + duong.length * 70);
  hoat = { quan, dau: quan.map(q => q.duong[0]), an: an ? m.toi : -1, anX: an, t0: bay(), lau, xong: () => {
    const ev = apDung(m, P);
    tiengDi(!!an);
    noiVeNuoc(P, an, ev, chuAn);
    if (an && chuAn === van.nguoiChoi && chuAn !== P && (an & 7) !== L.LOAI.VUA && (an & 7) !== L.LOAI.TG) bao(`${tenNha(P)} ăn ${TEN_LOAI[an & 7].toLowerCase()} của bạn.`);
    baoSuKien(ev);
    denLuot();
  } };
  if (!raf) raf = requestAnimationFrame(vong);
}
/* phần còn lại của một nước, lúc quân tới nơi — hay áp ngay không trượt, khi đuổi kịp ván qua mạng */
function apDung(m, P) {
  /* phong tướng (ô đi = ô đến) không ăn quân nào — bản trước tính nhầm thành ăn chính quân vừa phong, cộng điểm sai */
  const the = van.the, an = m.tu !== m.toi ? the.o[m.toi] : 0, chuAn = an ? the.chu[an >> 3] : -1, duong = L.duongDi(the, m), ma = (the.o[m.tu] & 7) === L.LOAI.MA;
  const lui = L.diNuoc(the, m);
  van.nuocCuoi = { tu: m.tu, toi: m.toi }; van.soNuoc++;
  if (!van.vet) van.vet = [null, null, null];
  if (!van.mat) van.mat = [[], [], []];
  if (m.tu !== m.toi) van.vet[P] = { duong, ma, thu: van.soNuoc };      // mũi tên nước vừa đi của nhà này (phong tướng thì không)
  if (an) { van.an[P] += L.GIA[an & 7] || 0; van.mat[chuAn].push(an); } // quân mất ghi cho nhà đang cầm quân đó
  const vuaCu = the.vua.slice(), ev = L.sauNuoc(the, lui);
  /* Tam quốc: bị chiếu hết thì vua bị bắt khỏi bàn — cũng là mất vua */
  for (const e of ev) if (e.loai === 'chieuhet' && vuaCu[e.bi] >= 0 && the.o[vuaCu[e.bi]] !== e.bi * 8 + L.LOAI.VUA) van.mat[e.bi].push(e.bi * 8 + L.LOAI.VUA);
  if (chonXem) boChon();                                              // thế cờ đã đổi: thôi xem nước của quân vừa chọn
  return ev;
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
function noiVeNuoc(P, an, ev, chuAn = an ? an >> 3 : -1) {
  if (an && (an & 7) !== 6) { noi(P, 'an', .5); if (chuAn >= 0 && van.tinh[chuAn] && van.the.song[chuAn]) noi(chuAn, 'mat', .45, 900); }
  const cq = ev.find(e => e.loai === 'chiemquan');
  if (cq) { noi(cq.ai, 'chiem', 1, 700); if (cq.cu >= 0 && van.the.song[cq.cu]) noi(cq.cu, 'biCuop', 1, 1700); }
  for (const e of ev) {
    if (e.loai === 'chieu' && e.bi !== P && van.tinh[P]) noi(P, 'chieu', 1);
    if ((e.loai === 'anvua' || e.loai === 'chieuhet') && van.tinh[e.bi]) noi(e.bi, 'biLoai', 1, 300);
    if (e.loai === 'anvua' && van.tinh[P]) noi(P, 'loai', 1, 1400);
    if (e.loai === 'thang' && van.tinh[e.ai]) noi(e.ai, 'thang', 1, 500);
  }
}
function hienNoi(P, cau, doi = 0) {
  if (!tam) return;
  const the_ = tam.querySelector(`.cb-the[data-p="${P}"]`), b = tam.querySelector('.cb-noi'), bao_ = tam.querySelector('.cb-bao');
  if (!the_ || !b) return;
  /* đang có lời báo (cùng chỗ trên đầu bàn, như "Hổ ăn mã của bạn"): đợi báo tắt rồi mới nói, khỏi che mất lời báo */
  if (bao_ && !bao_.hidden && doi < 12) { setTimeout(() => hienNoi(P, cau, doi + 1), 300); return; }
  const r = the_.getBoundingClientRect(), g = tam.getBoundingClientRect();
  b.textContent = cau; b.hidden = false;
  b.style.left = Math.max(8, Math.min(g.width - 180, r.left - g.left + r.width / 2 - 70)) + 'px';
  b.style.top = (r.bottom - g.top + 6) + 'px';
  clearTimeout(hienNoi.t); hienNoi.t = setTimeout(() => { b.hidden = true; }, 2600);
}
function baoSuKien(ev) {
  const tq = van && van.the.tq;
  for (const e of ev) {
    const cq = ev.find(x => x.loai === 'chiemquan' && x.dao === (e.bi !== undefined ? e.bi : e.dao));
    if (e.loai === 'anvua') {
      bao(tq ? `${tenNha(e.ai)} giết vua ${tenNha(e.bi)}! Cả đạo quân ${TEN_MAU[e.bi]} về tay ${tenNha(e.ai)}.` : `${tenNha(e.ai)} ăn vua ${tenNha(e.bi)}! ${tenNha(e.bi)} bị loại, quân hoá đá.`);
      tiengLoai();
    } else if (e.loai === 'chieuhet') {
      bao(tq && cq ? `${tenNha(e.bi)} bị chiếu hết — vua bị bắt, đạo quân ${TEN_MAU[e.bi]} về tay ${tenNha(cq.ai)}.` : `${tenNha(e.bi)} bị chiếu hết — bị loại, quân hoá đá.`);
      tiengLoai();
    } else if (e.loai === 'antuong') { bao(`${tenNha(e.ai)} giết tướng, cướp đạo quân ${TEN_MAU[e.dao]} từ tay ${tenNha(e.cu)}!`); tiengLoai(); }
    else if (e.loai === 'chontuong') {
      if (laMinh(e.ai)) { bao(`Chạm một quân ${TEN_MAU[e.dao].toLowerCase()} (vòng vàng) để phong tướng — tướng đi như vua, mất tướng là mất cả đạo quân.`); tiengToiLuot(); }
    } else if (e.loai === 'phongtuong') bao(`${tenNha(e.ai)} phong ${TEN_LOAI[e.cu]} làm tướng đạo quân ${TEN_MAU[e.dao]}.`);
    else if (e.loai === 'boluot') bao(`${tenNha(e.ai)} hết nước đi mà không bị chiếu: bỏ lượt.`);
    else if (e.loai === 'chieu') {
      if (laMinh(e.bi)) { bao('Vua đang bị chiếu! Đường đỏ là quân đang nhắm vào vua.'); tiengChieu(); }
      else if (e.bi === van.the.luot) tiengChieu();
    }
  }
}
function bao(chu) {
  const p = tam && tam.querySelector('.cb-bao'), n = tam && tam.querySelector('.cb-noi');
  if (!p) return;
  if (n) n.hidden = true;                                             // lời báo cần đọc hơn câu nói của máy: tắt bong bóng cho khỏi che
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
    const daoGiu = the.tq && the.song[P] ? [0, 1, 2].filter(D => D !== P && the.chu[D] === P).length : 0;
    if (daoGiu) tt = (tt ? tt + ' · ' : '') + `giữ ${daoGiu + 1} đạo quân`;
    n.querySelector('span').textContent = tt;
    n.classList.toggle('cb-dang', the.luot === P && the.thang < 0 && !the.hoa);
    n.classList.toggle('cb-loai', !the.song[P]);
    n.classList.toggle('cb-chieu', the.song[P] && L.biChieu(the, P));
  }
  veMat();
  if (xem) return;                                                    // đang xem cách đi từng quân: thanh dưới là của bảng xem
  const l = tam.querySelector('.cb-luot'), P = the.luot;
  if (the.thang >= 0) l.textContent = `${tenNha(the.thang)} thắng!`;
  else if (the.hoa) l.textContent = 'Hoà.';
  else if (van.cheDo === 'phong' && phong && phong.rot) l.textContent = 'Mất mạng — đang nối lại…';
  else if (the.cho && the.cho.length) l.textContent = laMinh(P) ? `Chạm một quân ${TEN_MAU[the.cho[0].dao].toLowerCase()} (vòng vàng) để phong tướng` : `${tenNha(P)} đang chọn tướng cho đạo quân ${TEN_MAU[the.cho[0].dao]}…`;
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
  ten.textContent = (van.cheDo === 'phong'
    ? `Phòng ${van.ma} · ${van.nguoiChoi >= 0 ? `bạn cầm ${TEN_MAU[van.nguoiChoi]}` : 'đang xem'} · máy ${KHO[van.kho].ten.toLowerCase()}`
    : `Bạn cầm ${TEN_MAU[van.nguoiChoi]} · máy ${KHO[van.kho].ten.toLowerCase()}`) + (the.tq ? ' · Tam quốc' : '');
}
/* quân đã mất của từng nhà (người dùng: "cho biết quân mình bị mất con nào nữa"): ghi lúc bị ăn, cho nhà đang cầm quân
   đó; thẻ mỗi nhà vẽ một hàng hình quân nhỏ, quân quý trước, cùng loại thì xếp chồng. Chạm thẻ thì báo bằng chữ. */
const THU_MAT = [6, 7, 5, 4, 3, 2, 1];
const xepMat = (ds) => ds.slice().sort((a, b) => THU_MAT.indexOf(a & 7) - THU_MAT.indexOf(b & 7) || (a >> 3) - (b >> 3));
function veMat() {
  if (!tam) return;
  for (const P of L.THU_TU) {
    const k = tam.querySelector(`.cb-the[data-p="${P}"] .cb-mat`);
    if (!k) continue;
    const ds = van && van.mat ? xepMat(van.mat[P]) : null;
    k.hidden = !ds;
    const w = ds ? k.clientWidth || 0 : 0, h = ds ? k.clientHeight || 0 : 0;
    if (!w || !h || !k.getContext) continue;
    if (k.width !== Math.round(w * DPR)) k.width = Math.round(w * DPR);
    if (k.height !== Math.round(h * DPR)) k.height = Math.round(h * DPR);
    const c2 = k.getContext('2d');
    c2.setTransform(DPR, 0, 0, DPR, 0, 0); c2.clearRect(0, 0, w, h);
    if (!ds.length) continue;
    /* hình nhỏ: quân thấp vẽ to lên một chút (cao ít nhất 0,8 vua) cho tốt khỏi bé quá, vua hậu vừa khít hàng */
    const s = h - 2, xs = [], co = (q) => s / Math.max(CAO[q & 7] || 1, .8);
    let x = s * .32;
    ds.forEach((q, i) => { if (i) x += ((q & 7) === (ds[i - 1] & 7) ? .34 : .6) * s; xs.push(x); });
    const ep = xs.length > 1 && xs[xs.length - 1] + s * .32 > w ? (w - s * .64) / (xs[xs.length - 1] - xs[0]) : 1;
    const cu = ctx;
    ctx = c2;
    ds.forEach((q, i) => vePhan(q & 7, xs[0] + (xs[i] - xs[0]) * ep, h - 1.5, co(q), P === 2 ? VIEN_SANG : MAU[P], false, (q >> 3) !== P ? MAU[q >> 3] : null));
    ctx = cu;
  }
}
function baoMat(P) {
  if (!van || !van.mat) return;
  const ds = xepMat(van.mat[P]), dem = {};
  for (const x of ds) dem[x & 7] = (dem[x & 7] || 0) + 1;
  const chu = THU_MAT.filter(l => dem[l]).map(l => `${dem[l] > 1 ? dem[l] + ' ' : ''}${TEN_LOAI[l].toLowerCase()}`).join(', ');
  bao(`${tenNha(P)} (${TEN_MAU[P]}) ${chu ? 'đã mất: ' + chu : 'chưa mất quân nào'}.`);
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
  van.mat = (s.mat || [[], [], []]).map(a => a.slice());
  boChon();
  tatTin();
  denLuot();
}

/* ---------- chạm vào bàn ----------
   Tới lượt mình: chạm quân mình để chọn — mọi đạo quân mình đang giữ, cả đạo quân vừa chiếm ở luật Tam quốc — rồi chạm
   chấm để đi. Chưa tới lượt, hay chạm quân nhà khác: chỉ xem quân đó đi được đâu (người dùng: "trong lúc chờ cho nhấn để
   xem nước đi từng con") — vẽ màu tím, chạm chấm không đi. */
function boChon() { chon = -1; nuocCuaChon = []; chonXem = false; }
function chamBan(px, py) {
  if (!van || hoat || demo) return;
  const the = van.the, P = the.luot;
  const toiMinh = the.thang < 0 && !the.hoa && laMinh(P) && van.dangNghi < 0;
  if (toiMinh && the.cho && the.cho.length) {                         // Tam quốc: chạm một quân của đạo quân vừa chiếm để phong tướng
    const c = oTai(px, py), x = c >= 0 ? the.o[c] : 0;
    if (x && (x >> 3) === the.cho[0].dao) diNuoc({ tu: c, toi: c, phong: 0, nhap: 0 }, P);
    else bao(`Chạm một quân ${TEN_MAU[the.cho[0].dao].toLowerCase()} (vòng vàng) để phong làm tướng.`);
    return;
  }
  const cuaMinh = (o) => o >= 0 && !!the.o[o] && the.chu[the.o[o] >> 3] === P;
  let c = oTai(px, py);
  /* chạm hơi lệch ô đích (ô rìa nhỏ): bắt vào chấm gần nhất trong tầm */
  if (toiMinh && chon >= 0 && !chonXem && (c < 0 || !nuocCuaChon.some(m => m.toi === c))) {
    let tot = -1, gan = Infinity;
    for (const m of nuocCuaChon) { const [x, y] = tamO(m.toi), d = Math.hypot(x - px, y - py); if (d < gan && d < coO(m.toi) * 1.6) { gan = d; tot = m.toi; } }
    if (tot >= 0 && !cuaMinh(c)) c = tot;
  }
  if (c < 0) { boChon(); return; }
  const m = toiMinh && chon >= 0 && !chonXem ? nuocCuaChon.find(n => n.toi === c) : null;
  if (m) {
    if (m.phong) { hoiPhong(m, P); return; }
    diNuoc(m, P);
    return;
  }
  if (toiMinh && cuaMinh(c)) {
    chon = c; chonXem = false; nuocCuaChon = L.nuocHopLe(the, P).filter(n => n.tu === c);
    tiengCham();
    if (!nuocCuaChon.length) bao(L.biChieu(the, P) ? 'Quân này không đi được — vua đang bị chiếu, phải chặn hay tránh.' : 'Quân này chưa có đường đi.');
    return;
  }
  if (the.o[c] && !(chonXem && chon === c)) { xemNuocQuan(c); return; }   // chạm lại quân đang xem thì thôi xem
  boChon();
}
/* chỉ xem một quân đi được đâu theo thế cờ lúc này — tới lượt nhà đó thì đi được đúng chừng ấy */
function xemNuocQuan(c) {
  const the = van.the, x = the.o[c], Q = the.chu[x >> 3], ten = `${TEN_LOAI[x & 7]} ${TEN_MAU[x >> 3].toLowerCase()}`;
  const t = the.cho && the.cho.length ? Object.assign(L.chepThe(the), { cho: [] }) : the;
  chon = c; chonXem = true;
  nuocCuaChon = the.song[Q] ? L.nuocHopLe(t, Q).filter(n => n.tu === c) : [];
  tiengCham();
  if (!the.song[Q]) bao(`${ten} đã hoá đá — nhà ${TEN_MAU[Q]} bị loại, quân này không đi nữa.`);
  else bao(`${ten} ${Q === van.nguoiChoi ? 'của bạn' : `của ${tenNha(Q)}`}: ${nuocCuaChon.length ? `${nuocCuaChon.length} nước đi được` : 'chưa có đường đi'} (chỉ xem${Q === van.nguoiChoi ? ', chưa tới lượt bạn' : ''}).`);
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
    const r = await MANG.goi(`coba/${ma}`, 'PUT', Object.assign({ tao: MANG.GIO, chu: ch.mau, kho: ch.kho, ghe: { [ch.mau]: { id, ten, thay: MANG.GIO } } }, ch.luat === 'tq' ? { luat: 'tq' } : {}));
    if (r.ok) { vaoPhong(ma, { id, P: ch.mau }); return true; }
    if (r.ma !== 401 || ch.ma) break;               // mất mạng, hay mã định sẵn (ván nữa) đã có người dùng
  }
  moTin('<p class="cb-tin-nho">Chơi qua mạng</p><h2>Chưa tạo được phòng</h2><p>Kiểm tra mạng rồi thử lại.</p><button type="button" class="cb-moi">Quay lại</button>');
  return false;
}
/* vào phòng: minh = { id, P } khi đã có ghế (người tạo phòng, hay mở lại); muonNgoi: ghế muốn ngồi khi theo ván nữa */
function vaoPhong(ma, minh, muonNgoi = -1, tuMo = false) {
  if (!MANG || !MANG.laMa(ma)) return;
  const cu = docLuu().cu;
  if (!minh && cu && cu.ma === ma) minh = { id: cu.id, P: cu.P };     // vừa rời phòng (giữa ván, hay phòng chờ) rồi mở lại link: vào lại đúng ghế
  dungLuong();
  tatXem();
  if (van && van.cheDo === 'phong') { boViec(); van = null; hoat = null; veMat(); }
  /* nhipCuoi = 0: có ghế sẵn (tải lại trang, mở lại link) thì báo "còn ở đây" ngay lượt kiểm kế (≤5 giây) — dấu giờ trên
     máy chủ có khi đã cũ, đợi đủ 20 giây thì người khác thấy mình vắng, người được mời lại thấy nút Bắt đầu */
  phong = { ma, id: minh ? minh.id : MANG.idMoi(), P: minh ? minh.P : -1, cay: undefined, ke: 0, nhat: [], daGui: null, lech: 0,
    song: false, nhipCuoi: 0, muonNgoi, nghiO: -1, baoLuot: -1, tuMo, choTiep: 0, sanhCu: '' };
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
  tatXem();
  const cay = phong.cay, ma = phong.ma;
  dungLuong();
  /* hết ván đủ 5 phút thì dọn phòng (luật chỉ cho xoá lúc đó, hay khi phòng đã quá một ngày) */
  if (cay && cay.xong && gioMay() - cay.xong > 300000) MANG.goi(`coba/${ma}`, 'DELETE');
  /* nhớ ghế để mở lại link là ngồi lại đúng chỗ — cả lúc rời phòng chờ: ghế đã giành thì máy chủ không cho xoá, không nhớ
     thì chính ghế cũ của mình chặn mình */
  const cu = cay && !cay.xong && phong.P >= 0 ? { ma, id: phong.id, P: phong.P } : undefined;
  phong = null;
  ghiLuu({ phong: undefined, cu });
  if (van && van.cheDo === 'phong') { boViec(); van = null; hoat = null; boChon(); veMat(); }
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
/* phòng chờ. Người dùng: "chỗ tạo phòng vô phòng khó sài quá". Bản trước: nút nổi nhất sau khi tạo phòng là Bắt đầu (dễ
   bấm nhầm rồi chơi một mình với hai máy), Gửi link mời chỉ là nút phụ, người mở link phải gõ tên rồi chọn ghế. Giờ:
   chưa ai vào thì Gửi link mời là nút chính, có mã QR cho bạn ngồi cạnh quét, mã phòng to có nút chép; Bắt đầu nói rõ
   máy chơi thay mấy ghế; người mở link bấm một nút "Vào chơi quân …" là vào. */
const luatChu = (cay) => (cay && cay.luat === 'tq' ? 'Luật Tam quốc' : 'Luật thường');
function hangGhe(cay, minh, trongVan) {
  return '<div class="cb-ghe-hang">' + L.THU_TU.map(P => {
    const g = gheCua(P), may = trongVan && van && !laNguoi(P);
    const ten = may ? TINH_CACH[van.tinh[P]].ten : g ? esc(P === minh ? 'Bạn' : (g.ten || TEN_MAU[P])) : 'Chờ bạn';
    const phu = [TEN_MAU[P], may ? 'máy chơi thay' : '', g && P === cay.chu && !may ? 'chủ phòng' : '', g && !may && !conO(P) ? 'vắng' : '', !g && !may ? 'ghế trống' : ''].filter(Boolean).join(' · ');
    return `<div class="cb-ghe-o${g || may ? '' : ' cb-ghe-trong'}${P === minh ? ' cb-ghe-minh' : ''}"><i style="background:${MAU[P].cham}"></i><b>${ten}</b><small>${phu}</small></div>`;
  }).join('') + '</div>';
}
const dongMa = () => `<div class="cb-ma-dong"><span class="cb-ma-to">${phong.ma}</span><button type="button" class="cb-chep-ma">Chép mã</button></div>`;
const khungQR = () => (phong.qr && self.TDTD_MAQR ? `<div class="cb-qr">${self.TDTD_MAQR.svg(linkMoi(phong.ma))}</div><p class="cb-meo">Bạn ngồi cạnh mở camera điện thoại, quét mã này là vào phòng.</p>` : '');
const nutQR = () => (self.TDTD_MAQR ? `<button type="button" class="cb-phu cb-qr-bat">${phong.qr ? 'Ẩn mã QR' : 'Hiện mã QR cho bạn ngồi cạnh'}</button>` : '');
function veSanh() {
  const cay = phong.cay, minh = phong.P, chu = cay.chu;
  if (minh < 0 && phong.muonNgoi >= 0 && !gheCua(phong.muonNgoi)) { const P = phong.muonNgoi; phong.muonNgoi = -1; ngoiGhe(P); }
  if (xem) { veSanhKhiXem(); return; }
  const trong = L.THU_TU.filter(P => !gheCua(P)), ban = L.THU_TU.filter(P => gheCua(P) && P !== minh).length;
  const tenChu = gheCua(chu) ? esc(gheCua(chu).ten || TEN_MAU[chu]) : 'Bạn bè';
  let html;
  if (minh < 0) {
    html = `<p class="cb-tin-nho">Lời mời · ${luatChu(cay)}</p><h2>${tenChu} mời bạn chơi cờ ba người</h2>${hangGhe(cay, minh)}
      ${trong.length ? `<p class="cb-nhan">Tên của bạn</p><input class="cb-o-ten" maxlength="20" value="${esc(tenMinh())}" placeholder="Để trống thì gọi theo màu quân" autocomplete="nickname">
      <p class="cb-nhan">Chọn quân để vào chơi</p>${trong.map(P => `<button type="button" class="cb-vaochoi" data-ngoi="${P}"><i style="background:${MAU[P].cham}"></i>Vào chơi quân ${TEN_MAU[P]}</button>`).join('')}`
      : '<p class="cb-meo">Phòng đã đủ ba người. Bạn vẫn ở đây xem ván khi bắt đầu.</p>'}
      ${NUT_XEM_QUAN}
      <p class="cb-meo">Phòng ${phong.ma}</p>
      <button type="button" class="cb-chu cb-roi">Không vào nữa</button>`;
  } else {
    /* chủ phòng: chưa ai vào thì Gửi link mời là nút chính, có bạn vào rồi thì Bắt đầu. Người được mời thì chờ chủ phòng;
       chủ phòng vắng quá một phút (có khi chỉ đang ở Zalo gửi link) mới hiện Bắt đầu, mà là nút phụ cho khỏi bấm nhầm
       lúc người thứ ba chưa kịp vào. Đủ ba người thì thôi nút mời và mã QR. */
    const laChu = minh === chu, chuVang = !laChu && !conO(chu), batDauChinh = laChu && ban > 0;
    const nutBatDau = laChu || chuVang ? `<button type="button" class="${batDauChinh ? '' : 'cb-phu '}cb-batdau-phong">Bắt đầu${trong.length ? `<small>máy chơi thay ${trong.length} ghế trống</small>` : ''}</button>` : '';
    const nutMoi = trong.length ? nutMoiBan(laChu ? 'Gửi link mời' : 'Mời thêm bạn', 'Chép link mời', laChu && !ban) + nutQR() + khungQR() : '';
    const loi = !laChu ? (chuVang ? `${tenChu} đang vắng. Muốn chơi luôn thì bấm Bắt đầu, khỏi chờ.` : `Chờ ${tenChu} bấm Bắt đầu…`)
      : !trong.length ? 'Đủ ba người rồi.'
      : `${ban ? `${ban} bạn đã vào, còn ${trong.length} ghế trống. ` : 'Chưa ai vào. '}Bạn bè mở link, quét mã QR, hay nhập mã ở mục "Vào phòng của bạn".`;
    html = `<p class="cb-tin-nho">Phòng chờ · ${luatChu(cay)}</p>${dongMa()}${hangGhe(cay, minh)}
      <p class="cb-meo">${loi}</p>
      ${batDauChinh ? nutBatDau + nutMoi : nutMoi + nutBatDau}
      ${NUT_XEM_QUAN}
      <button type="button" class="cb-chu cb-roi">Rời phòng</button>`;
  }
  if (html !== phong.sanhCu || tam.querySelector('.cb-tin').hidden) { phong.sanhCu = html; moTin(html); }
}
/* đang xem cách đi từng quân lúc ở phòng chờ: khỏi bật lại bảng mỗi lần phòng đổi — chỉ báo ai vừa vào, và ghi tình hình
   phòng dưới tên trò */
const NUT_XEM_QUAN = '<button type="button" class="cb-phu cb-xemquan" data-tu="sanh">Xem cách đi từng quân</button>';
function veSanhKhiXem() {
  const cay = phong.cay, co = L.THU_TU.filter(P => gheCua(P)), g = gheCua(cay.chu), tenChu = g ? g.ten || TEN_MAU[cay.chu] : 'chủ phòng';
  if (xem.ghe) for (const P of co) if (!xem.ghe.includes(P) && P !== phong.P) bao(`${gheCua(P).ten || TEN_MAU[P]} vừa vào chơi quân ${TEN_MAU[P]}.`);
  xem.ghe = co;
  tam.querySelector('.cb-ten span').textContent = `Phòng ${phong.ma} · ${co.length}/3 người · ${phong.P === cay.chu ? 'chưa bắt đầu' : phong.P < 0 ? 'bạn chưa vào ghế' : `chờ ${tenChu} bắt đầu`}`;
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
  if (xem) { tatXem(); bao('Ván bắt đầu rồi!'); }
  boViec();
  van = { the: L.theMoi(phong.cay.luat), luat: phong.cay.luat === 'tq' ? 'tq' : 'thuong', cheDo: 'phong', ma: phong.ma, nguoi: ['nguoi', 'nguoi', 'nguoi'], tinh: [null, null, null], kho: 0, nguoiChoi: phong.P,
    lichSu: [], nuocCuoi: null, vet: [null, null, null], dangNghi: -1, an: [0, 0, 0], mat: [[], [], []], soNuoc: 0, xemTiep: true };
  capNhatNguoi();
  Object.assign(phong, { ke: 0, nhat: [], daGui: null, song: false, nghiO: -1, baoLuot: -1 });
  boChon(); hoat = null; phongCho = null;
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
    /* trang đang ẩn (chuyển sang app khác) thì trình duyệt không chạy hình động, đang xem cách đi từng quân thì bàn không vẽ
       ván: áp ngay cho khỏi dồn lại */
    if (!phong.song || ds[phong.ke] || xem || (typeof document !== 'undefined' && document.hidden)) { apDung(m, mv.P); continue; }
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
  hoat = null; boChon(); phongCho = null;
  Object.assign(van, { the: L.theMoi(phong.cay && phong.cay.luat), nuocCuoi: null, vet: [null, null, null], an: [0, 0, 0], mat: [[], [], []], soNuoc: 0, hetVan: false });
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
/* nút mời. Người dùng: "gửi link mời cho sao chép link nữa". Máy có bảng chia sẻ (điện thoại) thì "Gửi link mời" mở bảng
   chia sẻ, cạnh đó "Chép link" để dán vào đâu cũng được; máy không có (trình duyệt trong Zalo, máy tính) thì một nút chép */
const coChiaSe = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';
function nutMoiBan(nhanGui, nhanChep, chinh) {
  return coChiaSe()
    ? `<div class="cb-hai"><button type="button" class="${chinh ? '' : 'cb-phu '}cb-moi-ban">${nhanGui}</button><button type="button" class="cb-phu cb-chep-link">Chép link</button></div>`
    : `<button type="button" class="${chinh ? '' : 'cb-phu '}cb-chep-link">${nhanChep}</button>`;
}
/* chép chữ: clipboard (cần https), không được thì cách cũ textarea + execCommand — trình duyệt trong app chat có lúc chỉ
   chạy cách cũ. Trả Promise<true/false> */
function chepChu(chu) {
  const cachCu = () => {
    try {
      const o = document.createElement('textarea');
      o.value = chu; o.setAttribute('readonly', ''); o.style.position = 'fixed'; o.style.opacity = '0';
      document.body.appendChild(o); o.select();
      const ok = document.execCommand('copy');
      o.remove();
      return !!ok;
    } catch (e) { return false; }
  };
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(chu).then(() => true, () => cachCu());
  return Promise.resolve(cachCu());
}
/* nút vừa bấm đổi chữ một lúc cho biết đã xong, ngay chỗ ngón tay */
function nutXong(sel, chu) {
  const b = tam && tam.querySelector(`.cb-tin ${sel}`);
  if (!b) return;
  const cu = b.textContent;
  b.textContent = chu;
  setTimeout(() => { if (b.textContent === chu) b.textContent = cu; }, 1800);
}
function chepMa() {
  if (!phong) return;
  const ma = phong.ma;
  chepChu(ma).then(ok => { nutXong('.cb-chep-ma', ok ? 'Đã chép ✓' : 'Chưa chép được'); bao(ok ? `Đã chép mã phòng ${ma}` : `Mã phòng: ${ma}`); });
}
/* chép không được thì hiện link trong ô cho chạm giữ mà chép */
function chepLink() {
  if (!phong) return;
  const ma = phong.ma, url = linkMoi(ma);
  chepChu(url).then(ok => {
    if (ok) { nutXong('.cb-chep-link', 'Đã chép ✓'); bao(`Đã chép link mời phòng ${ma} — dán vào Zalo, Messenger để gửi.`); return; }
    moTin(`<p class="cb-tin-nho">Phòng ${ma}</p><h2>Chép link mời</h2><p>Máy chưa cho chép tự động. Chạm giữ vào link rồi chọn Sao chép:</p>
      <input class="cb-o-ten cb-o-link" readonly value="${esc(url)}"><button type="button" class="cb-dongtin">Xong</button>`);
    const o = tam && tam.querySelector('.cb-o-link');
    if (o && o.select) setTimeout(() => { try { o.focus(); o.select(); } catch (e) {} }, 60);
  });
}
function moiBan() {
  if (!phong) return;
  const url = linkMoi(phong.ma);
  if (coChiaSe()) { navigator.share({ title: 'Cờ vua ba người', text: `Vào phòng ${phong.ma} chơi cờ ba người`, url }).catch(() => {}); return; }
  chepLink();
}
function moPhongTT() {
  moTin(`<p class="cb-tin-nho">Đang chơi qua mạng · ${luatChu(phong.cay)}</p>${dongMa()}${hangGhe(phong.cay, phong.P, true)}
    <p class="cb-meo">Ai có link cũng vào xem được. Tới lượt người vắng quá một phút thì người khác bấm được "Cho máy đi thay".</p>
    <button type="button" class="cb-dongtin">Chơi tiếp</button>
    ${nutMoiBan('Gửi link xem ván', 'Chép link xem ván', false)}
    ${nutQR()}${khungQR()}
    <button type="button" class="cb-chu cb-roi">Rời phòng</button>`);
}
function xacNhanRoi() {
  moTin(`<p class="cb-tin-nho">Phòng ${phong.ma}</p><h2>Rời phòng giữa ván?</h2>
    <p>Ghế của bạn đứng yên; tới lượt bạn thì người khác bấm được "Cho máy đi thay". Mở lại link phòng là vào lại đúng ghế.</p>
    <button type="button" class="cb-dongtin">Ở lại chơi tiếp</button>
    <button type="button" class="cb-phu cb-roi-that">Rời phòng</button>`);
}
/* ván nữa: ai bấm trước thì giữ chỗ mã phòng mới trong phòng cũ (tiep, ghi một lần), rồi tạo phòng đó */
async function vanNua() {
  if (!phong || !phong.cay) return;
  if (phong.cay.tiep) { theoTiep(phong.cay.tiep); return; }
  const cu = phong.ma, P = phong.P >= 0 ? phong.P : 0, kho = phong.cay.kho || 0, ma = MANG.maMoi();
  const r = await MANG.goi(`coba/${cu}/tiep`, 'PUT', ma);
  if (!phong || phong.ma !== cu) return;
  if (!r.ok) { bao(r.ma === 401 ? 'Có người vừa mời ván nữa — bấm Vào ván mới.' : 'Mất mạng, thử lại nhé.'); return; }
  await taoPhong({ mau: P, kho, ten: tenMinh() || TEN_MAU[P], ma, luat: phong.cay.luat === 'tq' ? 'tq' : 'thuong' });
}
function theoTiep(ma) {
  const P = phong && phong.P >= 0 ? phong.P : -1;
  vaoPhong(ma, null, P);
  if (phong) phong.choTiep = Date.now();
}
/* lấy mã phòng từ chữ người dùng gõ hay dán: mã trần, hay cả link mời (…?phong=MÃ, …#co-ba-nguoi/MÃ) */
function trichMa(chu) {
  const s = String(chu || '').trim();
  const m = /[?&]phong=([A-Za-z0-9]{6})/.exec(s) || /#co-ba-nguoi\/([A-Za-z0-9]{6})/.exec(s);
  const ma = (m ? m[1] : s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return MANG && MANG.laMa(ma) ? ma : '';
}
function vaoBangMa() {
  const o = tam && tam.querySelector('.cb-o-ma'), t = tam && tam.querySelector('.cb-o-ten');
  if (t) ghiLuu({ ten: t.value.trim().slice(0, 20) });
  const ma = trichMa(o ? o.value : '');
  if (ma) vaoPhong(ma); else bao('Mã phòng gồm 6 chữ và số, như trong tin nhắn mời.');
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
function batDemo() { tatXem(); tatTin(); demo = { buoc: 0, t0: bay() }; xoay = xoayDen = 0; capNhatDemo(); }
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

/* ---------- xem cách đi từng quân ----------
   Người dùng: "trong lúc chờ cho nhấn để xem nước đi từng con (option trước khi vô phòng)". Bàn trống, một quân của nhà
   mình; chọn loại quân ở thanh dưới, vẽ mọi đường nó đi được. Chạm chấm thì quân trượt tới theo đúng đường (qua tâm thì
   uốn), chạm ô khác thì đặt quân vào đó. Mở từ phòng chờ (cả lúc chưa vào ghế) và bảng Cách chơi; ván qua mạng bắt đầu
   thì tự đóng. Mỗi loại quân đặt sẵn ở một ô cho thấy rõ cái lạ của bàn ba người. */
const XEM_QUAN = {                                                    // loại: [cột, hàng ô đặt sẵn trong nhà mình, lời giải thích]
  6: [3, 4, 'Vua đi một ô mọi hướng; quanh tâm thì chạm cả ô nhà khác.'],
  5: [3, 4, 'Hậu đi thẳng hay chéo bao xa cũng được; qua tâm thì rẽ sang nhà khác.'],
  4: [4, 1, 'Xe đi thẳng theo hàng, theo cột; cột qua tâm thì uốn sang nhà bên cạnh.'],
  3: [0, 1, 'Tượng đi chéo, giữ màu ô; tới ô sát tâm thì rẽ hai nhánh.'],
  2: [3, 4, 'Mã đi chữ L: hai ô thẳng, một ô ngang; gần tâm tới được nhiều ô hơn.'],
  1: [4, 2, 'Tốt tiến một ô (lần đầu được hai ô), ăn chéo ô đỏ phía trước; tới hàng 1 nhà khác thì phong cấp.'],
  7: [3, 4, 'Tướng (Tam quốc) đi một ô như vua, không nhập thành; mất tướng là mất cả đạo quân.'],
};
const XEM_THU_TU = [6, 5, 4, 3, 2, 1, 7];
const tenO = (c) => `${'abcdefgh'[L.cotO(c)]}${L.hangO(c)} nhà ${TEN_MAU[L.nhaO(c)]}`;
function theXem() {
  const t = L.theMoi(xem.tq ? 'tq' : 'thuong');
  t.o.fill(0); t.nhap = 0; t.vua = [-1, -1, -1]; t.luot = xem.P;
  t.o[xem.c] = xem.P * 8 + xem.loai;
  if (xem.loai === L.LOAI.VUA) t.vua[xem.P] = xem.c;
  return t;
}
const nuocXem = (t) => L.nuocGia(t, xem.P, false, []);
function batXem(tu) {
  if (!tam) return;
  tatTin(); demo = null; boChon();
  const tq = !!((phong && phong.cay && phong.cay.luat === 'tq') || (van && van.the.tq) || (!phong && !van && docLuu().luat === 'tq'));
  const P = phong && phong.P >= 0 ? phong.P : van && van.nguoiChoi >= 0 ? van.nguoiChoi : 0, an = {};
  for (const s of ['.cb-hoan', '.cb-thay', '.cb-moi']) { const b = tam.querySelector(s); an[s] = !!b.hidden; b.hidden = true; }
  xem = { tu, P, tq, loai: L.LOAI.XE, c: L.oCua(P, 4, 1), truot: null, daCham: false, an, ghe: phong && phong.cay ? L.THU_TU.filter(Q => gheCua(Q)) : null };
  xoay = xoayDen = GOC_NHIN[P];
  const k = tam.querySelector('.cb-xem');
  k.innerHTML = XEM_THU_TU.filter(l => l !== L.LOAI.TG || tq).map(l => `<button type="button" data-xq="${l}">${TEN_LOAI[l]}</button>`).join('');
  k.hidden = false;
  const x = tam.querySelector('.cb-xong');
  x.textContent = tu === 'sanh' ? 'Về phòng chờ' : 'Xong';
  x.hidden = false;
  capNhatXem();
  if (tu === 'sanh' && phong && phong.cay && !phong.cay.batDau) veSanhKhiXem();
  if (!raf) raf = requestAnimationFrame(vong);
}
function chonXemQuan(loai) {
  if (!xem || !XEM_QUAN[loai]) return;
  xem.loai = loai; xem.c = L.oCua(xem.P, XEM_QUAN[loai][0], XEM_QUAN[loai][1]); xem.truot = null;
  tiengCham();
  capNhatXem();
}
function chamXem(px, py) {
  if (!xem || xem.truot) return;
  const c = oTai(px, py);
  if (c < 0) return;
  xem.daCham = true;
  const t = theXem(), m = nuocXem(t).find(n => n.toi === c);
  if (m) { const duong = L.duongDi(t, m); xem.truot = { duong, toi: c, t0: bay(), lau: Math.min(900, 180 + duong.length * 70) }; tiengDi(false); }
  else if (c !== xem.c) { xem.c = c; tiengCham(); }
  capNhatXem();
}
function capNhatXem() {
  if (!xem || !tam) return;
  const n = nuocXem(theXem()).length, q = XEM_QUAN[xem.loai];
  const dem = xem.loai === L.LOAI.TOT ? `tiến được ${n} ô, ăn chéo ${L.TOT_AN[xem.P][xem.c].length} ô (tô đỏ)` : `đi được ${n} ô`;
  tam.querySelector('.cb-luot').textContent = `${TEN_LOAI[xem.loai]} ở ${tenO(xem.c)}: ${dem}. ${q[2]}${xem.daCham ? '' : ' Chạm chấm để quân đi tới đó, chạm ô khác để đặt quân vào đó.'}`;
  for (const b of tam.querySelectorAll('.cb-xem [data-xq]')) b.classList.toggle('cb-bat', +b.dataset.xq === xem.loai);
}
function veXem(t) {
  const h = xem.truot, x = xem.P * 8 + xem.loai;
  if (h) {                                                            // quân đang trượt tới chỗ vừa chạm
    const p = Math.min(1, (t - h.t0) / h.lau), e = p * p * (3 - 2 * p), [px, py, c] = diemTrenDuong(h.duong, e);
    toO(h.toi, 'rgba(120,200,255,.3)');
    veQuan(x, c, [px, py - (xem.loai === L.LOAI.MA ? Math.sin(e * Math.PI) * coO(h.duong[0]) * 1.2 : 0)]);
    if (p >= 1) { xem.c = h.toi; xem.truot = null; capNhatXem(); }
    return;
  }
  const th = theXem(), ds = nuocXem(th);
  if (xem.loai === L.LOAI.TOT) for (const y of L.TOT_AN[xem.P][xem.c]) toO(y, 'rgba(255,90,70,.42)');
  toO(xem.c, 'rgba(120,200,255,.45)');
  veDuong(ds.map(m => L.duongDi(th, m)), 'di');
  veCham(th, ds, 'di');
  veQuan(x, xem.c, tamO(xem.c));
}
function tatXem() {
  if (!xem) return;
  const an = xem.an;
  xem = null;
  if (!tam) return;
  tam.querySelector('.cb-xem').hidden = true;
  tam.querySelector('.cb-xong').hidden = true;
  for (const s in an) tam.querySelector(s).hidden = an[s];
  tam.querySelector('.cb-luot').textContent = '';
  tam.querySelector('.cb-ten span').textContent = '';
  if (van) { xoay = xoayDen = GOC_NHIN[nhaNhin()]; capNhatChu(); }
}
function thoatXem() {
  const tu = xem && xem.tu;
  tatXem();
  if (tu === 'sanh' && phong && phong.cay && !phong.cay.batDau) veSanh();
  else if (tu === 'huongdan') moHuongDan();
  else if (!van) moCaiDat();
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
function tiengPhong() { if (!amThanh()) return; const t = am.currentTime + .02; not(523.25, t, .22, .06, 'triangle'); not(783.99, t + .1, .3, .06, 'triangle'); not(1046.5, t + .2, .4, .05, 'triangle'); }
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
    <div class="cb-nha">${L.THU_TU.map(P => `<div class="cb-the" data-p="${P}"><i style="background:${MAU[P].cham}"></i><b></b><span></span><canvas class="cb-mat" hidden></canvas></div>`).join('')}</div>
    <div class="cb-canh"><canvas class="cb-cv"></canvas><p class="cb-bao" hidden></p></div>
    <div class="cb-duoi">
      <p class="cb-luot" aria-live="polite"></p>
      <div class="cb-xem" hidden></div>
      <div class="cb-nut"><button class="cb-hoan" type="button">↶ Hoàn tác</button><button class="cb-thay" type="button" hidden></button><button class="cb-moi" type="button">Ván mới</button><button class="cb-xong" type="button" hidden>Xong</button></div>
    </div>
    <p class="cb-noi" hidden></p>
    <div class="cb-tin" hidden><div class="cb-tin-trong"></div></div>`;
  document.body.appendChild(tam);
  for (const P of L.THU_TU) { const n = tam.querySelector(`.cb-the[data-p="${P}"] b`); if (n) n.textContent = TEN_MAU[P]; }
  tam.querySelector('.cb-hoan').hidden = true;
  cv = tam.querySelector('.cb-cv'); ctx = cv.getContext && cv.getContext('2d');
  tam.addEventListener('click', bam);
  tam.addEventListener('input', (e) => {
    const o = e.target;
    if (!o || !o.classList) return;
    if (o.classList.contains('cb-o-ten')) ghiLuu({ ten: o.value.trim().slice(0, 20) });
    if (o.classList.contains('cb-o-ma')) {
      const ma = trichMa(o.value), n = tam.querySelector('.cb-vao');
      if (ma && /phong=|#co-ba-nguoi\//i.test(o.value)) o.value = ma;     // dán cả link: chỉ để lại mã cho dễ nhìn
      if (n) n.disabled = !ma;
    }
  });
  tam.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('cb-o-ma')) vaoBangMa(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden && phong) { phong.nhipCuoi = 0; kiemPhong(); } });
  addEventListener('hashchange', theoMaTrenDiaChi);
  cv.addEventListener('pointerdown', (e) => {
    amThanh();
    if (demo) { tiepDemo(); return; }
    const r = cv.getBoundingClientRect();
    if (xem) chamXem(e.clientX - r.left, e.clientY - r.top);
    else chamBan(e.clientX - r.left, e.clientY - r.top);
  });
  addEventListener('resize', doCo);
  if (typeof ResizeObserver === 'function') new ResizeObserver(doCo).observe(tam.querySelector('.cb-canh'));
}
function doCo() {
  if (!tam || !cv) return;
  const k = tam.querySelector('.cb-canh').getBoundingClientRect();
  DPR = Math.min(self.devicePixelRatio || 1, 2); W = Math.max(220, k.width || 360); H = Math.max(200, k.height || 420);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
  veMat();
}
/* lớp cb-co-tin: đang có bảng — lời báo dời xuống cuối màn hình, nằm trên bảng (trước đây nằm dưới bảng, bấm Chép mã hay vào
   ghế không được ở phòng chờ mà không thấy báo gì) */
function moTin(html) { const h = tam.querySelector('.cb-tin'); h.querySelector('.cb-tin-trong').innerHTML = html; h.hidden = false; tam.classList.add('cb-co-tin'); }
function tatTin() { if (tam) { tam.querySelector('.cb-tin').hidden = true; tam.classList.remove('cb-co-tin'); } }
/* Ván mới: ba lối — đấu với máy, tạo phòng, vào phòng — mỗi lối một màn ngắn có nút quay lại. Bản trước gộp hết vào một
   bảng dài (luật, tên, màu, mức máy, tạo phòng, rồi tới ô nhập mã nằm tận cuối), người có mã phải kéo qua mọi thứ. */
const HINH_LOI = {
  may: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="11" rx="3"/><circle cx="9.5" cy="13.5" r="1.2"/><circle cx="14.5" cy="13.5" r="1.2"/><path d="M12 4.5V8M9 19v2M15 19v2"/></svg>',
  tao: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><path d="M18 7.5v6M15 10.5h6"/></svg>',
  vao: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15.5" r="3.5"/><path d="M10.5 13L19 4.5M16.2 7.3l2.4 2.4M14 9.5l1.9 1.9"/></svg>',
};
let manDang = 'chinh';
function moCaiDat() { moMan('chinh'); }
function moMan(man) {
  manDang = man;
  const l = docLuu(), mau = [0, 1, 2].includes(l.mau) ? l.mau : 0, kho = [0, 1, 2].includes(l.kho) ? l.kho : 1, luat = l.luat === 'tq' ? 'tq' : 'thuong';
  const nut = (ten, gt, bat, nhom) => `<button type="button" class="cb-chon${bat ? ' cb-bat' : ''}" data-${nhom}="${gt}">${ten}</button>`;
  const quan = [0, 2, 1].map(P => nut(P === 0 ? 'Trắng<small>đi trước</small>' : TEN_MAU[P], P, P === mau, 'mau')).join('');
  const muc = KHO.map((k, i) => nut(k.ten, i, i === kho, 'kho')).join('');
  const dongLuat = `<p class="cb-nhan">Luật</p><div class="cb-hang">${nut('Thường', 'thuong', luat === 'thuong', 'luat')}${nut('Tam quốc', 'tq', luat === 'tq', 'luat')}</div>
    <p class="cb-meo cb-trai">${luat === 'tq' ? 'Giết vua là chiếm cả đạo quân nhà đó, chọn một quân làm <b>tướng</b> (đi như vua). Giết tướng là cướp đạo quân.' : 'Bị loại thì quân hoá đá, vẫn chắn đường.'} Còn vua cuối cùng thì thắng.</p>`;
  const lui = '<button type="button" class="cb-lui" data-man="chinh">‹ Quay lại</button>';
  const oTen = (goiY) => `<p class="cb-nhan">Tên của bạn</p><input class="cb-o-ten" maxlength="20" value="${esc(l.ten || '')}" placeholder="${goiY}" autocomplete="nickname">`;
  let html;
  if (man === 'may') html = `${lui}<p class="cb-tin-nho">Đấu với 2 máy</p><h2>Hổ và Rùa</h2>${dongLuat}
    <p class="cb-nhan">Bạn cầm quân</p><div class="cb-hang">${quan}</div>
    <p class="cb-nhan">Máy chơi</p><div class="cb-hang">${muc}</div>
    <p class="cb-meo">Hổ hăng, dám đánh; Rùa chậm mà chắc.</p>
    <button type="button" class="cb-batdau">Bắt đầu</button>`;
  else if (man === 'tao' && MANG) html = `${lui}<p class="cb-tin-nho">Tạo phòng</p><h2>Mời bạn chơi cùng</h2>
    ${oTen('Để bạn bè biết là ai')}${dongLuat}
    <p class="cb-nhan">Bạn cầm quân</p><div class="cb-hang">${quan}</div>
    <p class="cb-nhan">Ghế không ai vào thì máy chơi</p><div class="cb-hang">${muc}</div>
    <button type="button" class="cb-tao">Tạo phòng</button>
    <p class="cb-meo">Tạo xong có link và mã QR để mời. Nước đi và tên gửi qua máy chủ Firebase của Google; ai có mã phòng thì xem được.</p>`;
  else if (man === 'vao' && MANG) html = `${lui}<p class="cb-tin-nho">Vào phòng</p><h2>Nhập mã phòng</h2>
    <input class="cb-o-ma cb-o-ma-to" maxlength="400" placeholder="VD: BMVZVJ" autocapitalize="characters" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="go">
    <p class="cb-meo">6 chữ và số trong tin nhắn mời — dán cả link vào đây cũng được.</p>
    ${oTen('Để trống thì gọi theo màu quân')}
    <button type="button" class="cb-vao" disabled>Vào phòng</button>`;
  else {
    manDang = 'chinh';
    const loi = (k, tieu, phu) => `<button type="button" class="cb-lua" data-man="${k}"><span class="cb-lua-hinh">${HINH_LOI[k]}</span><span class="cb-lua-chu"><b>${tieu}</b><i>${phu}</i></span></button>`;
    html = `<p class="cb-tin-nho">Ván mới</p><h2>Cờ vua ba người</h2>
    ${loi('may', 'Đấu với 2 máy', 'Chơi một mình với Hổ và Rùa')}
    ${MANG ? loi('tao', 'Tạo phòng, mời bạn', 'Mỗi người một máy — gửi link hay cho quét mã QR') + loi('vao', 'Vào phòng của bạn', 'Có mã 6 ký tự, hay link bạn gửi') : ''}
    <button type="button" class="cb-chu cb-tieng">${coTieng ? '🔊 Âm thanh đang bật' : '🔇 Âm thanh đang tắt'}</button>`;
  }
  moTin(html);
  if (manDang === 'vao') { const o = tam.querySelector('.cb-o-ma'); if (o && o.focus) setTimeout(() => o.focus(), 60); }
}
function moHuongDan() {
  moTin(`<p class="cb-tin-nho">Cách chơi</p><h2>Cờ vua ba người</h2>
    <p>Như cờ vua thường, nhưng ba nhà: <b>Trắng → Đen → Đỏ</b> lần lượt đi theo chiều kim đồng hồ. Bàn 96 ô ghép từ ba nửa bàn cờ; mỗi nhà một cạnh.</p>
    <p><b>Đường uốn qua giữa bàn:</b> cột của mình chạy thẳng sang nhà bên cạnh (cột h của Trắng nối cột a của Đỏ). Đi chéo qua đúng tâm thì chọn một trong hai nhánh, cùng màu ô. Tốt đứng ở d4, e4 có ba ô ăn chéo.</p>
    <p><b>Không được để vua mình bị chiếu.</b> Vua để hở cho người đi trước mình ăn là mất vua. Bị chiếu hết hay mất vua thì bị loại: quân hoá đá, vẫn chắn đường và ăn được, nhưng không ăn ai.</p>
    <p><b>Còn vua cuối cùng thì thắng.</b> Hết nước mà không bị chiếu: còn ba nhà thì bỏ lượt, còn hai nhà thì hoà. Tốt tới hàng cuối của một nhà khác thì phong cấp. Không có bắt tốt qua đường.</p>
    <p><b>Luật Tam quốc</b> (chọn ở bảng ván mới): giết vua một nhà — ăn vua hay chiếu hết — là chiếm cả đạo quân nhà đó, quân đổi sang màu mình, giữ vành màu cũ. Người giết chạm một quân của đạo quân đó để phong <b>tướng</b>: tướng đi từng ô như vua, cầm cờ hiệu màu đạo quân. Nhà khác giết được tướng thì cướp luôn đạo quân, lại phong tướng mới — chiếm qua chiếm lại. Mất vua của chính mình thì mọi đạo quân mình giữ về tay người giết.</p>
    <p class="cb-meo">Đường đỏ là báo nguy: quân nào đang chiếu vua mình.</p>
    <button type="button" class="cb-demo">Xem hình động đường đi qua tâm</button>
    <button type="button" class="cb-phu cb-xemquan" data-tu="huongdan">Xem cách đi từng quân</button>
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
  if ((n = q('.cb-xemquan'))) { batXem(n.dataset.tu || 'huongdan'); return; }
  if ((n = q('[data-xq]'))) { chonXemQuan(+n.dataset.xq); return; }
  if (q('.cb-xong')) { thoatXem(); return; }
  if ((n = q('.cb-the'))) { baoMat(+n.dataset.p); return; }
  if (q('.cb-hoi')) { moHuongDan(); return; }
  if (q('.cb-moi')) { if (van && van.cheDo === 'phong' && phong) moPhongTT(); else moCaiDat(); return; }
  if ((n = q('[data-man]'))) { moMan(n.dataset.man); return; }
  if (q('.cb-hoan')) { hoanTac(); return; }
  if (q('.cb-demo')) { batDemo(); return; }
  if (q('.cb-dongtin')) { tatTin(); if (!van) { if (phong && phong.cay && !phong.cay.batDau) veSanh(); else moCaiDat(); } return; }
  if ((n = q('[data-mau]'))) { ghiLuu({ mau: +n.dataset.mau }); moMan(manDang); return; }
  if ((n = q('[data-kho]'))) { ghiLuu({ kho: +n.dataset.kho }); moMan(manDang); return; }
  if ((n = q('[data-luat]'))) { ghiLuu({ luat: n.dataset.luat }); moMan(manDang); return; }
  if ((n = q('[data-ngoi]'))) { ngoiGhe(+n.dataset.ngoi); return; }
  if (q('.cb-tao')) { amThanh(); const c = docLuu(); taoPhong({ mau: [0, 1, 2].includes(c.mau) ? c.mau : 0, kho: [0, 1, 2].includes(c.kho) ? c.kho : 1, ten: tenMinh(), luat: c.luat === 'tq' ? 'tq' : 'thuong' }); return; }
  if (q('.cb-vao')) { amThanh(); vaoBangMa(); return; }
  if (q('.cb-batdau-phong')) { amThanh(); batDauPhong(); return; }
  if (q('.cb-moi-ban')) { moiBan(); return; }
  if (q('.cb-roi')) { if (van && van.cheDo === 'phong' && !van.hetVan && phong) xacNhanRoi(); else { roiPhong(); moCaiDat(); } return; }
  if (q('.cb-roi-that')) { roiPhong(); moCaiDat(); return; }
  if (q('.cb-chep-ma')) { chepMa(); return; }
  if (q('.cb-chep-link')) { chepLink(); return; }
  if (q('.cb-qr-bat')) { if (phong) { phong.qr = !phong.qr; if (phong.cay && !phong.cay.batDau) veSanh(); else moPhongTT(); } return; }
  if (q('.cb-vannua')) { vanNua(); return; }
  if (q('.cb-vaotiep')) { if (phong && phong.cay && phong.cay.tiep) theoTiep(phong.cay.tiep); return; }
  if ((n = q('.cb-thay'))) { if (n.dataset.viec === 'tudi') tuDiTiep(); else choMayThay(); return; }
  if (q('.cb-tieng')) { coTieng = !coTieng; if (!coTieng && am) am.suspend(); moMan(manDang); return; }
  if (q('.cb-batdau')) { amThanh(); const c = docLuu(); vanMoi({ mau: [0, 1, 2].includes(c.mau) ? c.mau : 0, kho: [0, 1, 2].includes(c.kho) ? c.kho : 1, luat: c.luat === 'tq' ? 'tq' : 'thuong' }); return; }
  if (q('.cb-lai')) { vanMoi({ che: van.cheDo, mau: van.nguoiChoi, kho: van.kho, luat: van.luat }); return; }
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
    moTin(`<p class="cb-tin-nho">Bạn bị loại</p><h2>Vua của bạn đã mất</h2><p>${van.the.tq ? 'Cả đạo quân của bạn về tay người giết.' : 'Quân của bạn hoá đá.'} Hai máy vẫn đấu tiếp tới khi còn một vua.</p>
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
  tatXem();
  dungLuong();
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (am && am.state === 'running') am.suspend();
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}
if (typeof addEventListener === 'function') addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !tam || !tam.classList.contains('hien')) return;
  if (xem) { thoatXem(); return; }
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
  _bam: (e) => bam(e), _trichMa: (s) => trichMa(s), _CAO: CAO, _MAU: MAU, _DA: DA,
  _vePhan: (c2, ...a) => { const cu = ctx; ctx = c2; try { vePhan(...a); } finally { ctx = cu; } }, _chonXem: () => chonXem, _xem: () => xem, _batXem: (tu) => batXem(tu), _chonXemQuan: (l) => chonXemQuan(l),
  _chamXem: (x, y) => chamXem(x, y), _thoatXem: () => thoatXem(), _baoMat: (P) => baoMat(P), _noi: (P, loai) => noi(P, loai),
};
})();
