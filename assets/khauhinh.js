/* Vẽ khẩu hình: mặt cắt dọc khoang miệng, khuôn miệng nhìn thẳng, và sơ đồ nguyên âm.
   Hàm thuần, trả về chuỗi SVG — kiểm thử được bằng Node như core.js.

   Số liệu lấy từ mã nguồn SVG chuẩn trên Wikimedia (xem content/ghi-chu-khau-hinh-ipa.md):
   - Mặt quay sang TRÁI, vẽ trọn profile đầu, không vẽ tai tóc mắt.
   - Lưỡi chiếm chừng 37% bề rộng và 46% chiều cao của đầu, và cần 27–30 điểm neo thì mới
     ra hình cái lưỡi; ít hơn thì nhìn như cục bột. Ở đây lấy mẫu 3 px một điểm, được ~39 điểm.
   - Khoang khí tô SÁNG trên nền mô tối. Đây là mẹo quan trọng nhất: chỗ nào sáng hẹp lại
     chính là chỗ bị chặn. Bản nháp đầu tôi làm ngược nên nhìn không ra.
   - Phải có nhãn "lợi" (alveolar ridge): /t d s z n l/ đều chạm ở đó, và người Việt hay đặt
     lưỡi vào răng theo thói quen tiếng Việt. Danh sách nhãn giải phẫu chuẩn lại thiếu chỗ này.
   - Sơ đồ nguyên âm không thể hiện được độ tròn môi, nên phải có hình môi nhìn thẳng đi kèm. */
(function (root) {
'use strict';

/* ---------- giải phẫu cố định ---------- */
const LOI = 86, GOC_MAX = 198, TUONG = 214, DAY = 244;
const MOC_VOM = [[86, 104], [104, 90], [124, 84], [148, 84], [170, 88], [190, 94]];

function vomY(x) {
  if (x <= MOC_VOM[0][0]) return MOC_VOM[0][1];
  for (let i = 0; i < MOC_VOM.length - 1; i++) {
    const [x1, y1] = MOC_VOM[i], [x2, y2] = MOC_VOM[i + 1];
    if (x <= x2) { const t = (x - x1) / (x2 - x1); return y1 + (y2 - y1) * (3 * t * t - 2 * t * t * t); }
  }
  return MOC_VOM[MOC_VOM.length - 1][1];
}

const CHO_CHAM = { moi: 66, rang: 82, loi: 92, 'sau-loi': 108, 'vom-cung': 140, 'vom-mem': 186 };
const TEN_CHAM = { moi: 'hai môi chạm nhau', rang: 'lưỡi chạm răng', loi: 'lưỡi chạm lợi',
  'sau-loi': 'lưỡi sát sau lợi', 'vom-cung': 'lưng lưỡi lên vòm cứng', 'vom-mem': 'sau lưỡi lên vòm mềm' };

const so = (n) => Math.round(n * 10) / 10;

/* ---------- mặt cắt dọc ---------- */
/* Bố cục: mặt quay sang TRÁI. Đầu và cổ tô màu mô (tối), khoang khí khoét ra bằng màu SÁNG —
   nhìn vào là thấy ngay chỗ nào hẹp lại, vì chỗ hẹp chính là chỗ đang cấu âm.
   Khoang miệng và khoang họng nối làm MỘT đường liền, vì trong người chúng vốn là một đường khí.
   Đường mũi chỉ mở khi âm đi qua mũi; lúc không mở thì màn hầu vẽ đóng sát thành họng. */
function ve(p, o) {
  o = o || {};
  const sa = p.luoiSau, cao = p.luoiCao, tip = p.dauLuoi, tron = p.moiTron;
  const ham = p.hamMo, mui = !!p.mui, rung = !!p.rung;
  const chamX = p.chamO && p.chamO !== 'khong' ? CHO_CHAM[p.chamO] : null;
  const g = [], ha = ham * 20, mx = -tron * 9;
  const sanY = (x) => 168 + ha + (x - LOI) * 0.14;      // sàn miệng, hạ xuống khi há hàm
  const gocX = 176 + sa * 16;                            // gốc lưỡi lùi về sau khi âm là âm sau

  /* mặt lưng lưỡi: một gò cao quanh dinhX, bị vòm chặn lại, và siết hẳn vào ở chỗ cấu âm */
  const dinhX = 104 + sa * 66, beRong = 38 + sa * 14, hGo = 12 + cao * 40;
  const mat = [];
  for (let x = LOI - 6; x <= gocX; x += 3) {
    const go = hGo * Math.exp(-Math.pow((x - dinhX) / beRong, 2));
    let y = sanY(x) - 22 - go;
    const vom = vomY(Math.min(x, 190));
    let ke = 14;
    if (chamX !== null) ke = 14 - 12.5 * Math.exp(-Math.pow((x - chamX) / 15, 2));
    if (y < vom + ke) y = vom + ke;
    mat.push([x, y]);
  }
  const tipY = Math.min(mat[0][1], sanY(LOI) - 20 - tip * 34);
  mat[0] = [LOI - 6, tipY];
  mat[1] = [mat[1][0], Math.min(mat[1][1], tipY + 4)];
  const gocY = mat[mat.length - 1][1];

  const moiTren = 118, moiDuoi = 140 + ha;               // hai mép khe miệng
  const hongDay = 206, vomSau = so(vomY(190));

  /* ---- 1. đầu và cổ, dựng theo các mốc thật trên mặt người ----
     đỉnh sọ → trán → gờ mày → sống mũi → CHÓP MŨI → chân mũi → môi trên
     → (khe miệng) → môi dưới → cằm → hàm dưới → cổ → gáy → sau sọ.
     Cái mũi nhọn và dài là thứ làm người xem nhận ra ngay đây là mặt người nhìn nghiêng. */
  g.push(`<path d="M172,20
    C138,20 110,30 97,52 C93,61 91,68 90,74
    C88,84 74,94 ${so(54 + mx)},${so(103)}
    C${so(47 + mx)},${so(106)} ${so(50 + mx)},${so(113)} ${so(63 + mx)},${so(114)}
    L${so(74 + mx)},${so(115)} L${so(76 + mx)},${so(119 - tron * 3)} L${LOI - 3},${moiTren}
    L${LOI - 3},${so(moiDuoi)} L${so(70 + mx)},${so(moiDuoi + 4 - tron * 2)}
    L${so(60 + mx)},${so(moiDuoi + 14)}
    C${so(50 + mx)},${so(moiDuoi + 26)} ${so(58 + mx)},${so(moiDuoi + 40)} ${so(76 + mx)},${so(moiDuoi + 46)}
    C104,${so(moiDuoi + 56)} 130,${so(moiDuoi + 64)} 140,${so(moiDuoi + 78)}
    L146,252 L246,252 L250,180
    C256,120 252,56 224,32 C210,22 192,20 172,20 Z"
    fill="rgba(226,140,134,.22)" stroke="rgba(244,239,230,.55)" stroke-width="1.6" stroke-linejoin="round"/>`);

  /* ---- 2. khoang khí: miệng nối liền xuống họng thành MỘT đường, tô sáng ----
     Họng là một cái ống hẹp chứ không phải một cái hộp — vẽ rộng ra là mất hình. */
  let kk = `M${LOI - 4},${moiTren}`;
  for (let x = LOI; x <= 190; x += 3) kk += ` L${x},${so(vomY(x))}`;
  kk += ` C196,${so(vomY(190) - 2)} 204,${so(vomY(190) + 4)} 206,${so(vomY(190) + 14)}`;
  kk += ` L206,196 C204,206 190,208 ${so(gocX + 2)},200`;
  kk += ` C${so(gocX + 6)},${so(gocY + 30)} ${so(gocX + 4)},${so(gocY + 12)} ${so(gocX)},${so(gocY)}`;
  for (let i = mat.length - 1; i >= 0; i--) kk += ` L${mat[i][0]},${so(mat[i][1])}`;
  kk += ` L${LOI - 4},${so(moiDuoi - 2)} Z`;
  g.push(`<path d="${kk}" fill="rgba(238,246,252,.92)"/>`);

  /* ---- 3. đường mũi: một khe hẹp chạy trên vòm miệng, nằm gọn dưới sống mũi ---- */
  /* Sàn đường mũi bám theo vòm miệng và cách ra 12px — đó là bề dày xương vòm,
     và cũng là thứ giữ cho đường mũi không bao giờ chồng lên khoang miệng. */
  const muiSan = (x) => vomY(Math.max(86, Math.min(x, 190))) - 12;
  let dMui = `M84,${so(muiSan(84))}`;
  for (let x = 88; x <= 194; x += 6) dMui += ` L${x},${so(muiSan(x))}`;
  dMui += ` L198,${so(muiSan(190) - 2)} L198,${so(muiSan(190) - 15)}`;
  for (let x = 194; x >= 88; x -= 6) dMui += ` L${x},${so(muiSan(x) - 15)}`;
  dMui += ` L82,${so(muiSan(84) - 12)} Z`;
  if (mui) {
    g.push(`<path d="${dMui}" fill="rgba(126,200,227,.6)" stroke="rgba(126,200,227,.95)" stroke-width="1.4"/>`);
    g.push(`<defs><marker id="pa-mui" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5"
      orient="auto"><path d="M0,1 L9,5 L0,9 z" fill="#1f6d8c"/></marker></defs>`);
    g.push(`<path d="M188,${so(muiSan(188) - 8)} C160,${so(muiSan(160) - 8)} 136,${so(muiSan(136) - 8)} 112,${so(muiSan(112) - 8)}"
      fill="none" stroke="#1f6d8c" stroke-width="2.2" stroke-linecap="round" marker-end="url(#pa-mui)"/>`);
  }   /* âm không qua mũi thì KHÔNG vẽ đường mũi: màn hầu đóng ở dưới đã nói đủ,
         vẽ thêm một đường rỗng chỉ làm hình rối. */

  /* ---- 4. màn hầu: hạ xuống cho hơi lên mũi, hoặc nâng lên bịt kín đường mũi ---- */
  g.push(mui
    ? `<path d="M192,88 C197,102 198,116 193,128" fill="none" stroke="rgba(244,239,230,.9)" stroke-width="3.4" stroke-linecap="round"/>`
    : `<path d="M190,92 C198,86 202,80 200,72" fill="none" stroke="rgba(244,239,230,.9)" stroke-width="3.4" stroke-linecap="round"/>`);

  /* ---- 5. lưỡi: màu riêng hẳn, nằm trên sàn miệng chứ không lấp kín khoang ---- */
  let dl = `M${mat[0][0]},${so(mat[0][1])}`;
  for (let i = 1; i < mat.length; i++) dl += ` L${mat[i][0]},${so(mat[i][1])}`;
  dl += ` C${so(gocX + 5)},${so(gocY + 22)} ${so(gocX + 2)},${so(sanY(gocX) + 10)} ${so(gocX - 12)},${so(sanY(gocX) + 12)}`;
  dl += ` C${so(gocX - 50)},${so(sanY(gocX - 50) + 12)} 118,${so(sanY(118) + 9)} ${LOI - 4},${so(sanY(LOI) + 2)} Z`;
  g.push(`<path d="${dl}" fill="#d9525f" fill-opacity=".9" stroke="#ffd0d4" stroke-width="2" stroke-linejoin="round"/>`);

  /* ---- 6. vòm, thành họng, răng ---- */
  let dv = `M${LOI},${so(vomY(LOI))}`;
  for (let x = LOI + 3; x <= 190; x += 3) dv += ` L${x},${so(vomY(x))}`;
  g.push(`<path d="${dv}" fill="none" stroke="rgba(244,239,230,.9)" stroke-width="2.4" stroke-linecap="round"/>`);
  g.push(`<path d="M206,${so(vomY(190) + 16)} L206,194" fill="none" stroke="rgba(244,239,230,.34)" stroke-width="1.8"/>`);
  g.push(`<path d="M${LOI - 7},${moiTren - 13} h7 v12 l-7,1 z" fill="rgba(252,250,246,.9)"/>`);
  g.push(`<path d="M${LOI - 7},${so(moiDuoi + 1)} h7 v-12 l-7,-1 z" fill="rgba(252,250,246,.9)"/>`);

  /* ---- 7. chỗ cấu âm: vòng vàng, nhãn đặt ở cột trống bên phải để không đè lên hình ---- */
  const nhan = (x, y, chu, mau, co, neo) =>
    `<text x="${so(x)}" y="${so(y)}"${neo ? ` text-anchor="${neo}"` : ''} font-size="${co || 12}" fill="${mau || 'rgba(244,239,230,.62)'}">${chu}</text>`;
  if (chamX !== null) {
    const cy = chamX <= 82 ? (moiTren + moiDuoi) / 2 : vomY(chamX) + 10;
    g.push(`<circle cx="${chamX}" cy="${so(cy)}" r="7.5" fill="none" stroke="#e8c37a" stroke-width="2.8"/>`);
    g.push(`<path d="M${chamX + 8},${so(cy - 6)} L236,38" fill="none" stroke="rgba(232,195,122,.6)" stroke-width="1.3"/>`);
    g.push(nhan(238, 42, TEN_CHAM[p.chamO], '#e8c37a', 13));
  }

  /* ---- 8. nhãn bộ phận: chữ tối trên khoang sáng, chữ sáng trên mô tối ---- */
  g.push(nhan(28, so((moiTren + moiDuoi) / 2 + 4), 'môi'));
  g.push(nhan(150, so(vomY(150) + 16), 'vòm miệng', 'rgba(56,66,86,.8)', 11, 'middle'));
  if (p.chamO !== 'loi' && p.chamO !== 'rang') {
    g.push(nhan(LOI + 15, so(vomY(LOI) + 16), 'lợi', 'rgba(150,116,44,.95)', 11.5));
    g.push(`<path d="M${LOI + 13},${so(vomY(LOI) + 11)} L${LOI + 2},${so(vomY(LOI) + 2)}" fill="none" stroke="rgba(150,116,44,.7)" stroke-width="1.2"/>`);
  }
  g.push(nhan(so(dinhX), so(sanY(dinhX) + 4), 'lưỡi', '#ffd9dc', 12, 'middle'));
  g.push(`<path d="M208,178 L232,170" fill="none" stroke="rgba(244,239,230,.3)" stroke-width="1.2"/>`);
  g.push(nhan(235, 173, 'họng', null, 12));
  if (mui) g.push(nhan(146, 52, 'hơi thoát lên mũi', '#7ec8e3', 11.5, 'middle'));
  g.push(rung
    ? `<path d="M240,212 q7,-9 14,0 q7,9 14,0" fill="none" stroke="#9fd8b0" stroke-width="2.4"/>` + nhan(240, 231, 'cổ họng rung', '#9fd8b0', 12)
    : `<path d="M240,212 h28" stroke="rgba(244,239,230,.42)" stroke-width="2.4"/>` + nhan(240, 231, 'không rung', null, 12));

  const nhanA = o.nhan || 'Mặt cắt dọc khoang miệng';
  return `<svg viewBox="24 12 314 244" role="img" aria-label="${nhanA}">${g.join('')}</svg>`;
}

/* ---------- khuôn miệng nhìn thẳng: chỉ ba kiểu, đúng như tài liệu dạy ---------- */
const MOI = {
  det:   { rx: 34, ry: 7,  chu: 'môi dẹt, kéo ngang như đang cười' },
  trung: { rx: 24, ry: 13, chu: 'môi thả lỏng, không kéo không chu' },
  tron:  { rx: 14, ry: 15, chu: 'môi tròn, chu ra trước' },
  mo:    { rx: 26, ry: 24, chu: 'hàm mở to' },
};
function veMoi(kieu, o) {
  const m = MOI[kieu] || MOI.trung;
  o = o || {};
  return `<svg viewBox="-16 0 182 92" role="img" aria-label="Khuôn miệng nhìn thẳng: ${m.chu}">
    <ellipse cx="75" cy="38" rx="${m.rx + 7}" ry="${m.ry + 6}" fill="rgba(226,140,134,.25)"/>
    <ellipse cx="75" cy="38" rx="${m.rx}" ry="${m.ry}" fill="#121a2c" stroke="#e0616d" stroke-width="3.4"/>
    ${m.ry > 10 ? `<path d="M${75 - m.rx * .5},${38 + m.ry * .35} q${m.rx * .5},${m.ry * .3} ${m.rx},0" fill="none" stroke="rgba(255,208,212,.5)" stroke-width="2"/>` : ''}
    <text x="75" y="84" text-anchor="middle" font-size="10.5" fill="rgba(244,239,230,.62)">${o.chu || m.chu}</text>
  </svg>`;
}

/* ---------- sơ đồ nguyên âm ----------
   Hình thang lấy nguyên từ Blank_vowel_trapezoid.svg (public domain):
   bốn góc (100,50) (900,50) (900,650) (500,650), cạnh trên 800 cạnh dưới 400, cao 600.
   Toạ độ nguyên âm chuẩn hoá theo Roach, Journal of the IPA tr. 242. */
const NGUYEN_AM = [
  { ipa: 'iː', X: .055, Y: .044 }, { ipa: 'ɪ', X: .303, Y: .191 },
  { ipa: 'e',  X: .008, Y: .566 }, { ipa: 'æ', X: .029, Y: .864 },
  { ipa: 'ʌ',  X: .475, Y: .790 }, { ipa: 'ɑː', X: .861, Y: .967 },
  { ipa: 'ɒ',  X: .957, Y: .866 }, { ipa: 'ɔː', X: .971, Y: .417 },
  { ipa: 'ʊ',  X: .721, Y: .196 }, { ipa: 'uː', X: .829, Y: .046 },
  { ipa: 'ɜː', X: .497, Y: .499 }, { ipa: 'ə', X: .497, Y: .499, lech: 30 },
];
const viTri = (v) => {
  const y = 50 + 600 * v.Y, xL = 100 + 400 * v.Y;
  return [xL + v.X * (900 - xL) + (v.lech || 0), y];
};
function veNguyenAm(dang) {
  const g = [`<path d="M100,50H900V650H500zM500,50 700,650M233.333,250H900M366.667,450H900"
    fill="none" stroke="rgba(244,239,230,.35)" stroke-width="4"/>`];
  g.push(`<text x="104" y="34" font-size="30" fill="rgba(244,239,230,.45)">trước</text>`);
  g.push(`<text x="838" y="34" font-size="30" fill="rgba(244,239,230,.45)" text-anchor="end">sau</text>`);
  g.push(`<text x="70" y="60" font-size="30" fill="rgba(244,239,230,.45)" text-anchor="end" transform="rotate(-90 70 60)">lưỡi cao</text>`);
  for (const v of NGUYEN_AM) {
    const [x, y] = viTri(v);
    const dang_ = dang === v.ipa;
    g.push(`<circle cx="${so(x)}" cy="${so(y)}" r="${dang_ ? 34 : 24}" fill="${dang_ ? '#e8c37a' : 'rgba(255,255,255,.1)'}"
      stroke="${dang_ ? '#e8c37a' : 'rgba(244,239,230,.4)'}" stroke-width="3"/>`);
    g.push(`<text x="${so(x)}" y="${so(y + 12)}" text-anchor="middle" font-size="${dang_ ? 34 : 28}"
      fill="${dang_ ? '#121a2c' : 'rgba(244,239,230,.8)'}" font-weight="${dang_ ? '600' : '400'}">${v.ipa}</text>`);
  }
  return `<svg viewBox="40 0 900 700" role="img" aria-label="Sơ đồ nguyên âm tiếng Anh">${g.join('')}</svg>`;
}

const API = { ve, veMoi, veNguyenAm, vomY, NGUYEN_AM, viTri, CHO_CHAM, TEN_CHAM };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_KHAUHINH = API;
})(typeof self !== 'undefined' ? self : this);
