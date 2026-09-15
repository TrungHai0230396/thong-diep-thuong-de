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

   Tách làm hai tầng: tinh() TÍNH ra các nét, ve() DỰNG chuỗi SVG từ đó. Tách ra để chạy hình
   động được: mỗi khung chỉ cần gọi tinh() rồi thay thuộc tính d của vài nét, thay vì dựng lại
   cả chuỗi SVG rồi nhét innerHTML ba mươi lần một giây.

   Tham số thêm cho hình động:
   - hoi  (0..1): luồng hơi đang mạnh cỡ nào. Vẽ thành mấy mũi nhọn chạy dọc giữa khoang.
   - pha  (0..1): pha chạy của luồng hơi, tăng dần theo thời gian thì thấy hơi TRÔI ra.
   Cấu âm vốn là một CHUYỂN ĐỘNG, không phải một tư thế — riêng bài "/t/ cuối phải bật ra" thì
   thứ cần dạy là một sự kiện theo thời gian, hình đứng yên không thể nào nói được. */

/* Miệng lúc nghỉ: lưỡi nằm thấp, hàm hé, không chạm đâu cả. Mọi hình động đều bắt đầu từ đây. */
const NGHI = { luoiSau: .35, luoiCao: .2, dauLuoi: .1, moiTron: .1, hamMo: .3,
               rung: false, mui: false, chamO: 'khong', hoi: 0, pha: 0 };

/* Pha trộn hai bộ tham số, để đi mượt từ tư thế này sang tư thế kia. */
function tron(a, b, t) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const m = t * t * (3 - 2 * t);                       // vào chậm ra chậm, nhìn tự nhiên hơn
  const r = {};
  for (const k of ['luoiSau', 'luoiCao', 'dauLuoi', 'moiTron', 'hamMo', 'hoi', 'pha']) {
    const x = a[k] === undefined ? 0 : a[k], y = b[k] === undefined ? 0 : b[k];
    r[k] = x + (y - x) * (k === 'pha' ? t : m);        // pha thì chạy đều, không làm mượt
  }
  r.rung = m < .5 ? !!a.rung : !!b.rung;
  r.mui = m < .5 ? !!a.mui : !!b.mui;
  r.chamO = m < .5 ? (a.chamO || 'khong') : (b.chamO || 'khong');
  return r;
}

function tinh(p) {
  const sa = p.luoiSau, cao = p.luoiCao, tip = p.dauLuoi, tron_ = p.moiTron;
  const ham = p.hamMo, mui = !!p.mui;
  const chamX = p.chamO && p.chamO !== 'khong' ? CHO_CHAM[p.chamO] : null;
  const ha = ham * 20, mx = -tron_ * 9;
  const sanY = (x) => 168 + ha + (x - LOI) * 0.14;
  const gocX = 176 + sa * 16;

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
  const moiTren = 118, moiDuoi = 140 + ha;

  /* đầu và cổ, dựng theo mốc thật trên mặt người: đỉnh sọ → trán → gờ mày → sống mũi →
     CHÓP MŨI → chân mũi → môi trên → (khe miệng) → môi dưới → cằm → hàm → cổ → gáy */
  const dau = `M172,20
    C138,20 110,30 97,52 C93,61 91,68 90,74
    C88,84 74,94 ${so(54 + mx)},${so(103)}
    C${so(47 + mx)},${so(106)} ${so(50 + mx)},${so(113)} ${so(63 + mx)},${so(114)}
    L${so(74 + mx)},${so(115)} L${so(76 + mx)},${so(119 - tron_ * 3)} L${LOI - 3},${moiTren}
    L${LOI - 3},${so(moiDuoi)} L${so(70 + mx)},${so(moiDuoi + 4 - tron_ * 2)}
    L${so(60 + mx)},${so(moiDuoi + 14)}
    C${so(50 + mx)},${so(moiDuoi + 26)} ${so(58 + mx)},${so(moiDuoi + 40)} ${so(76 + mx)},${so(moiDuoi + 46)}
    C104,${so(moiDuoi + 56)} 130,${so(moiDuoi + 64)} 140,${so(moiDuoi + 78)}
    L146,252 L246,252 L250,180
    C256,120 252,56 224,32 C210,22 192,20 172,20 Z`;

  /* khoang khí: miệng nối liền xuống họng thành MỘT đường. Họng là ống hẹp, không phải hộp. */
  let khoang = `M${LOI - 4},${moiTren}`;
  for (let x = LOI; x <= 190; x += 3) khoang += ` L${x},${so(vomY(x))}`;
  khoang += ` C196,${so(vomY(190) - 2)} 204,${so(vomY(190) + 4)} 206,${so(vomY(190) + 14)}`;
  khoang += ` L206,196 C204,206 190,208 ${so(gocX + 2)},200`;
  khoang += ` C${so(gocX + 6)},${so(gocY + 30)} ${so(gocX + 4)},${so(gocY + 12)} ${so(gocX)},${so(gocY)}`;
  for (let i = mat.length - 1; i >= 0; i--) khoang += ` L${mat[i][0]},${so(mat[i][1])}`;
  khoang += ` L${LOI - 4},${so(moiDuoi - 2)} Z`;

  /* lưỡi: một khối nằm TRÊN SÀN miệng, không lấp kín khoang */
  let luoi = `M${mat[0][0]},${so(mat[0][1])}`;
  for (let i = 1; i < mat.length; i++) luoi += ` L${mat[i][0]},${so(mat[i][1])}`;
  luoi += ` C${so(gocX + 5)},${so(gocY + 22)} ${so(gocX + 2)},${so(sanY(gocX) + 10)} ${so(gocX - 12)},${so(sanY(gocX) + 12)}`;
  luoi += ` C${so(gocX - 50)},${so(sanY(gocX - 50) + 12)} 118,${so(sanY(118) + 9)} ${LOI - 4},${so(sanY(LOI) + 2)} Z`;

  /* đường mũi: khe hẹp trên vòm miệng, cách vòm 12px — đúng bề dày xương vòm */
  const muiSan = (x) => vomY(Math.max(86, Math.min(x, 190))) - 12;
  let duongMui = `M84,${so(muiSan(84))}`;
  for (let x = 88; x <= 194; x += 6) duongMui += ` L${x},${so(muiSan(x))}`;
  duongMui += ` L198,${so(muiSan(190) - 2)} L198,${so(muiSan(190) - 15)}`;
  for (let x = 194; x >= 88; x -= 6) duongMui += ` L${x},${so(muiSan(x) - 15)}`;
  duongMui += ` L82,${so(muiSan(84) - 12)} Z`;

  const manHau = mui
    ? 'M192,88 C197,102 198,116 193,128'
    : 'M190,92 C198,86 202,80 200,72';

  const rangTren = `M${LOI - 7},${moiTren - 13} h7 v12 l-7,1 z`;
  const rangDuoi = `M${LOI - 7},${so(moiDuoi + 1)} h7 v-12 l-7,-1 z`;

  /* LUỒNG HƠI: mấy mũi nhọn chạy dọc giữa khoang, từ họng ra tới môi (hoặc rẽ lên mũi).
     Đây là thứ làm người xem thấy được âm đang THOÁT RA, chứ không chỉ thấy một tư thế. */
  const matY = (x) => {
    if (x <= mat[0][0]) return mat[0][1];
    for (let i = 0; i < mat.length - 1; i++)
      if (x <= mat[i + 1][0]) {
        const t = (x - mat[i][0]) / (mat[i + 1][0] - mat[i][0]);
        return mat[i][1] + (mat[i + 1][1] - mat[i][1]) * t;
      }
    return mat[mat.length - 1][1];
  };
  const hoi = [];
  const manh = p.hoi === undefined ? 0 : p.hoi;
  if (manh > .02) {
    const pha = ((p.pha || 0) % 1 + 1) % 1;
    const SO = 5;
    for (let k = 0; k < SO; k++) {
      let u = (k / SO + pha) % 1;                       // 0 ở trong họng, 1 ở ngoài môi
      const mo = Math.sin(Math.PI * u);                 // mờ dần ở hai đầu, khỏi hiện ra đột ngột
      if (mo < .15) continue;
      let x, y;
      if (mui && u > .45) {                             // rẽ lên mũi
        const w = (u - .45) / .55;
        x = 196 - w * 120;
        y = muiSan(x) - 7;
      } else {
        const uu = mui ? u / .45 : u;
        x = 200 - uu * (200 - (LOI - 12));
        const xc = Math.max(LOI - 6, Math.min(x, gocX));
        y = x > gocX ? (vomY(190) + 150) / 2 : (vomY(Math.min(xc, 190)) + matY(xc)) / 2;
      }
      hoi.push({ x: so(x), y: so(y), mo: so(mo * manh) });
    }
  }

  let vong = null;
  if (chamX !== null) {
    const cy = chamX <= 82 ? (moiTren + moiDuoi) / 2 : vomY(chamX) + 10;
    vong = { x: chamX, y: so(cy), ten: TEN_CHAM[p.chamO] };
  }
  return { dau, khoang, luoi, duongMui, manHau, rangTren, rangDuoi, hoi, vong,
           mui, rung: !!p.rung, chamO: p.chamO, mx, ha, moiTren, moiDuoi, dinhX, sanY, mat };
}

function ve(p, o) {
  o = o || {};
  const N = tinh(p);
  const g = [];
  const nhan = (x, y, chu, mau, co, neo) =>
    `<text x="${so(x)}" y="${so(y)}"${neo ? ` text-anchor="${neo}"` : ''} font-size="${co || 12}" fill="${mau || 'rgba(244,239,230,.62)'}">${chu}</text>`;

  g.push(`<path class="k-dau" d="${N.dau}" fill="rgba(226,140,134,.22)" stroke="rgba(244,239,230,.55)" stroke-width="1.6" stroke-linejoin="round"/>`);
  g.push(`<path class="k-khoang" d="${N.khoang}" fill="rgba(238,246,252,.92)"/>`);
  g.push(`<path class="k-mui" d="${N.duongMui}" fill="${N.mui ? 'rgba(126,200,227,.6)' : 'rgba(226,140,134,0)'}" stroke="${N.mui ? 'rgba(126,200,227,.95)' : 'rgba(226,140,134,0)'}" stroke-width="1.4"/>`);
  g.push(`<path class="k-hau" d="${N.manHau}" fill="none" stroke="rgba(244,239,230,.9)" stroke-width="3.4" stroke-linecap="round"/>`);
  g.push(`<path class="k-luoi" d="${N.luoi}" fill="#d9525f" fill-opacity=".9" stroke="#ffd0d4" stroke-width="2" stroke-linejoin="round"/>`);

  let dv = `M${LOI},${so(vomY(LOI))}`;
  for (let x = LOI + 3; x <= 190; x += 3) dv += ` L${x},${so(vomY(x))}`;
  g.push(`<path d="${dv}" fill="none" stroke="rgba(244,239,230,.9)" stroke-width="2.4" stroke-linecap="round"/>`);
  g.push(`<path d="M206,${so(vomY(190) + 16)} L206,194" fill="none" stroke="rgba(244,239,230,.34)" stroke-width="1.8"/>`);
  g.push(`<path class="k-rt" d="${N.rangTren}" fill="rgba(252,250,246,.9)"/>`);
  g.push(`<path class="k-rd" d="${N.rangDuoi}" fill="rgba(252,250,246,.9)"/>`);

  g.push(`<g class="k-hoi">${N.hoi.map(h =>
    `<path d="M${h.x},${h.y} l-7,-5 M${h.x},${h.y} l-7,5" fill="none" stroke="${N.mui ? '#1f6d8c' : '#2f6d8c'}" stroke-opacity="${h.mo}" stroke-width="2.6" stroke-linecap="round"/>`).join('')}</g>`);

  if (N.vong) {
    g.push(`<circle class="k-vong" cx="${N.vong.x}" cy="${N.vong.y}" r="7.5" fill="none" stroke="#e8c37a" stroke-width="2.8"/>`);
    g.push(`<path d="M${N.vong.x + 8},${so(N.vong.y - 6)} L234,50" fill="none" stroke="rgba(232,195,122,.6)" stroke-width="1.3"/>`);
  }

  /* NHÃN: tối đa ba, và chỉ nhãn nào ĐANG LÀM VIỆC cho âm này.
     Bản trước dán chín nhãn cố định lên mọi hình. Với người chưa học ngữ âm thì chín nhãn là
     quá tải — và đó là một phần của lời chê "nhìn không hiểu gì". Nhãn cũng viết bằng CẢM
     GIÁC chứ không bằng giải phẫu: "gờ cứng sau răng trên" thì rà lưỡi là thấy, còn "lợi" thì
     phải học mới biết nó ở đâu. */
  const CAM_GIAC = {
    moi: ['hai môi', 'chạm nhau ở đây'],
    rang: ['răng trên', 'chạm ở đây'],
    loi: ['gờ cứng sau răng trên', 'đầu lưỡi chạm đây'],
    'sau-loi': ['lùi vào sau gờ một chút', 'lưng lưỡi nhích lên đây'],
    'vom-cung': ['vòm cứng ở trên', 'lưng lưỡi nâng lên đây'],
    'vom-mem': ['chỗ mềm tít trong', 'sau lưỡi chạm đây'],
  };
  if (N.vong) {
    const [noi1, noi2] = CAM_GIAC[p.chamO] || ['', ''];
    g.push(nhan(238, 60, noi1, 'rgba(232,195,122,.8)', 11.5));
    g.push(nhan(238, 42, noi2, '#e8c37a', 13));
  }
  g.push(nhan(so(N.dinhX), so(N.sanY(N.dinhX) + 4), 'lưỡi', '#ffd9dc', 12, 'middle'));
  g.push(`<g class="k-nhanmui"${N.mui ? '' : ' opacity="0"'}>${nhan(142, 50, 'hơi ra đằng mũi', '#7ec8e3', 12.5, 'middle')}</g>`);
  g.push(`<g class="k-rung">${N.rung
    ? `<path d="M240,212 q7,-9 14,0 q7,9 14,0" fill="none" stroke="#9fd8b0" stroke-width="2.4"/>` + nhan(240, 231, 'cổ họng rung', '#9fd8b0', 12)
    : `<path d="M240,212 h28" stroke="rgba(244,239,230,.42)" stroke-width="2.4"/>` + nhan(240, 231, 'không rung', null, 12)}</g>`);

  const nhanA = o.nhan || 'Mặt cắt dọc khoang miệng';
  return `<svg viewBox="24 12 314 244" role="img" aria-label="${nhanA}">${g.join('')}</svg>`;
}

/* Thay các nét đang chuyển động trên một hình đã vẽ. Rẻ hơn dựng lại cả chuỗi SVG. */
function capNhat(svg, p) {
  if (!svg) return;
  const N = tinh(p);
  const dat = (lop, d) => { const e = svg.querySelector('.' + lop); if (e) e.setAttribute('d', d); };
  dat('k-dau', N.dau); dat('k-khoang', N.khoang); dat('k-luoi', N.luoi);
  dat('k-hau', N.manHau); dat('k-rt', N.rangTren); dat('k-rd', N.rangDuoi);
  const m = svg.querySelector('.k-mui');
  if (m) {
    m.setAttribute('d', N.duongMui);
    m.setAttribute('fill', N.mui ? 'rgba(126,200,227,.6)' : 'rgba(226,140,134,0)');
    m.setAttribute('stroke', N.mui ? 'rgba(126,200,227,.95)' : 'rgba(226,140,134,0)');
  }
  const nm = svg.querySelector('.k-nhanmui');
  if (nm) nm.setAttribute('opacity', N.mui ? '1' : '0');
  const v = svg.querySelector('.k-vong');
  if (v) {
    v.setAttribute('opacity', N.vong ? '1' : '0');
    if (N.vong) { v.setAttribute('cx', N.vong.x); v.setAttribute('cy', N.vong.y); }
  }
  const h = svg.querySelector('.k-hoi');
  if (h) h.innerHTML = N.hoi.map(k =>
    `<path d="M${k.x},${k.y} l-7,-5 M${k.x},${k.y} l-7,5" fill="none" stroke="${N.mui ? '#1f6d8c' : '#2f6d8c'}" stroke-opacity="${k.mo}" stroke-width="2.6" stroke-linecap="round"/>`).join('');
}

/* ---------- MIỆNG NHÌN THẲNG, như soi gương ----------
   Đây mới là hình CHÍNH, không phải hình cắt dọc. Lý do là bằng chứng, không phải sở thích:
   không nghiên cứu nào chứng minh cho người học nhìn bộ phận BÊN TRONG tốt hơn cho họ nhìn
   MẶT người nói (Nakai 2018); thí nghiệm đối chứng cho thấy hình cắt dọc có lưỡi không hơn
   hình mặt đầy đủ, và khả năng đọc MÔI áp đảo khả năng đọc LƯỠI (Badin 2010); hình bên trong
   chỉ bắt đầu có ích SAU khi người ta được dạy cách đọc nó (Grauwinkel 2007).

   Cái này thì soi gương là tự kiểm được ngay — đó là chỗ nó hơn hẳn hình cắt dọc. */
function veMatTruoc(p, o) {
  o = o || {};
  const tron_ = p.moiTron || 0, ham = p.hamMo || 0, tip = p.dauLuoi || 0;
  const cham = p.chamO || 'khong';
  const kin = cham === 'moi';                       // /p/ /b/ /m/: hai môi khép kín
  const cangRang = cham === 'rang' && tip < .5;     // /f/ /v/: răng trên cắn môi dưới
  const luoiRa = cham === 'rang' && tip >= .5;      // /θ/ /ð/: đầu lưỡi thò ra giữa hai hàm răng
  const g = [];

  const CX = 100, CY = 76;
  /* Chu môi không chỉ là hẹp ngang — nó còn làm khe miệng TRÒN lại. Bản đầu tôi chỉ bóp
     chiều ngang nên /ʃ/ và /w/ vẽ ra giống hệt nhau, nhìn không phân biệt nổi. */
  const rong = kin ? 46 : 29 + (1 - tron_) * 31;
  const cao = kin ? 0 : 5 + ham * 38 + tron_ * 19;

  g.push(`<ellipse cx="${CX}" cy="${CY}" rx="86" ry="62" fill="rgba(226,140,134,.16)"/>`);

  if (kin) {
    g.push(`<path class="t-moi" d="M${CX - rong},${CY} C${CX - rong / 2},${CY - 9} ${CX + rong / 2},${CY - 9} ${CX + rong},${CY}
      C${CX + rong / 2},${CY + 10} ${CX - rong / 2},${CY + 10} ${CX - rong},${CY} Z"
      fill="rgba(216,122,124,.55)" stroke="#e8949a" stroke-width="2.4"/>`);
    g.push(`<path d="M${CX - rong + 3},${CY} L${CX + rong - 3},${CY}" stroke="#a8464f" stroke-width="2.6" stroke-linecap="round"/>`);
  } else {
    /* vành môi, rồi khoang tối bên trong, rồi răng, rồi lưỡi — đúng thứ tự nhìn thấy trong gương */
    g.push(`<path class="t-moi" d="M${CX - rong - 7},${CY} C${CX - rong / 2},${so(CY - cao / 2 - 13)} ${CX + rong / 2},${so(CY - cao / 2 - 13)} ${CX + rong + 7},${CY}
      C${CX + rong / 2},${so(CY + cao / 2 + 14)} ${CX - rong / 2},${so(CY + cao / 2 + 14)} ${CX - rong - 7},${CY} Z"
      fill="rgba(216,122,124,.5)" stroke="#e8949a" stroke-width="2.4"/>`);
    g.push(`<path class="t-trong" d="M${CX - rong},${CY} C${CX - rong / 2},${so(CY - cao / 2 - 3)} ${CX + rong / 2},${so(CY - cao / 2 - 3)} ${CX + rong},${CY}
      C${CX + rong / 2},${so(CY + cao / 2 + 3)} ${CX - rong / 2},${so(CY + cao / 2 + 3)} ${CX - rong},${CY} Z"
      fill="#3a2230"/>`);
    if (cao > 8) {
      let rt = '';
      for (let i = -2; i <= 2; i++) {
        const x = CX + i * 12.5;
        rt += `<rect x="${so(x - 5.6)}" y="${so(CY - cao / 2 - 1)}" width="11.2" height="${so(Math.min(11, cao * .38))}" rx="2" fill="rgba(252,250,246,.94)"/>`;
      }
      g.push(`<g class="t-rang">${rt}</g>`);
      if (cao > 20) {
        let rd = '';
        for (let i = -2; i <= 2; i++)
          rd += `<rect x="${so(CX + i * 12.5 - 5.2)}" y="${so(CY + cao / 2 - Math.min(8, cao * .26))}" width="10.4" height="${so(Math.min(8, cao * .26))}" rx="2" fill="rgba(248,244,238,.8)"/>`;
        g.push(`<g class="t-rangd">${rd}</g>`);
      }
    }
    /* lưỡi: chỉ vẽ khi thật sự nhìn thấy, đúng như soi gương */
    if (luoiRa) {
      g.push(`<path class="t-luoi" d="M${CX - 20},${so(CY + 3)} C${CX - 14},${so(CY - 9)} ${CX + 14},${so(CY - 9)} ${CX + 20},${so(CY + 3)}
        C${CX + 12},${so(CY + 9)} ${CX - 12},${so(CY + 9)} ${CX - 20},${so(CY + 3)} Z"
        fill="#d9525f" stroke="#ffd0d4" stroke-width="2"/>`);
    } else if (cao > 14) {
      const ly = CY + cao / 2 - 2 - tip * (cao * .42);
      g.push(`<path class="t-luoi" d="M${CX - rong + 6},${so(CY + cao / 2 - 1)} C${CX - rong / 2},${so(ly)} ${CX + rong / 2},${so(ly)} ${CX + rong - 6},${so(CY + cao / 2 - 1)} Z"
        fill="#c4505c" fill-opacity=".9" stroke="#f0a0a8" stroke-width="1.6"/>`);
    }
  }
  if (cangRang) {
    /* răng trên cắn hờ môi dưới — dấu hiệu dễ thấy nhất của /f/ và /v/ khi soi gương */
    let r = '';
    for (let i = -2; i <= 2; i++)
      r += `<rect x="${so(CX + i * 12.5 - 5.6)}" y="${so(CY - 4)}" width="11.2" height="11" rx="2" fill="rgba(252,250,246,.96)"/>`;
    g.push(`<g class="t-can">${r}</g>`);
    g.push(`<path d="M${CX - 40},${so(CY + 9)} C${CX - 20},${so(CY + 17)} ${CX + 20},${so(CY + 17)} ${CX + 40},${so(CY + 9)}"
      fill="none" stroke="#e8949a" stroke-width="5" stroke-linecap="round"/>`);
  }

  const chu = o.chu || (kin ? 'hai môi khép kín lại' : cangRang ? 'răng trên chạm môi dưới'
    : luoiRa ? 'đầu lưỡi thò ra giữa hai hàm răng'
    : tron_ > .5 ? 'môi chu tròn ra trước' : tron_ < .2 && ham < .3 ? 'môi kéo ngang như cười'
    : ham > .7 ? 'há hàm to' : 'môi thả lỏng');
  g.push(`<text x="${CX}" y="146" text-anchor="middle" font-size="12.5" fill="rgba(244,239,230,.72)">${chu}</text>`);
  return `<svg viewBox="0 0 200 156" role="img" aria-label="${o.nhan || 'Miệng nhìn thẳng: ' + chu}">${g.join('')}</svg>`;
}

/* Thay các nét động trên hình nhìn thẳng — nhưng GIỮ NGUYÊN dòng chú thích.
   Dòng chú thích mô tả tư thế ĐÍCH của âm, còn hình thì đang chạy qua các tư thế trung gian.
   Bản đầu tôi vẽ lại cả chú thích theo từng khung, thành ra /p/ hiện "môi kéo ngang như cười"
   ngay giữa chừng — đúng với khung hình đó, nhưng sai với bài học. */
function capNhatTruoc(svg, p) {
  if (!svg) return;
  const cu = svg.querySelector('text');
  const giu = cu ? cu.outerHTML : '';
  const moi = veMatTruoc(p, {});
  let than = moi.slice(moi.indexOf('>') + 1, moi.lastIndexOf('</svg>'));
  than = than.replace(/<text[\s\S]*?<\/text>/g, '');
  svg.innerHTML = than + giu;
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

const API = { ve, capNhat, tinh, tron, NGHI, veMatTruoc, capNhatTruoc, veMoi, veNguyenAm, vomY, NGUYEN_AM, viTri, CHO_CHAM, TEN_CHAM };
if (typeof module !== 'undefined' && module.exports) module.exports = API; else root.TDTD_KHAUHINH = API;
})(typeof self !== 'undefined' ? self : this);
