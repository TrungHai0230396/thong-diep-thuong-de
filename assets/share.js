/* Vẽ lá thông điệp thành ảnh dọc 1080×1920 để chia sẻ lên mạng xã hội. */
(() => {
'use strict';

const R = 1080, C = 1920;                 // khổ ảnh, vừa khung story của Facebook/Zalo
const SERIF = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const SANS  = '"Be Vietnam Pro", system-ui, -apple-system, sans-serif';

/* Nạp sẵn font, nếu mạng hỏng thì rơi về font hệ thống chứ không treo. */
async function napFont() {
  if (!document.fonts) return;
  const ds = ['600 84px "Cormorant Garamond"', '400 34px "Be Vietnam Pro"', '500 24px "Be Vietnam Pro"'];
  try { await Promise.race([Promise.all(ds.map(d => document.fonts.load(d))), new Promise(r => setTimeout(r, 2500))]); }
  catch (e) { /* dùng font dự phòng */ }
}

const bam = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const nn = (seed) => { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* Cắt chuỗi thành các dòng không vượt quá bề rộng cho trước. */
function xuongDong(ctx, chu, rong) {
  const tu = chu.split(' '), dong = [];
  let hien = '';
  for (const t of tu) {
    const thu = hien ? hien + ' ' + t : t;
    if (ctx.measureText(thu).width <= rong || !hien) hien = thu;
    else { dong.push(hien); hien = t; }
  }
  if (hien) dong.push(hien);
  return dong;
}

/* Chọn cỡ chữ lớn nhất mà vẫn đủ chỗ. */
function vuaKhung(ctx, chu, rong, caoToiDa, coMax, coMin, heSoDong, font) {
  for (let co = coMax; co >= coMin; co -= 2) {
    ctx.font = `600 ${co}px ${font}`;
    const d = xuongDong(ctx, chu, rong);
    if (d.length * co * heSoDong <= caoToiDa) return { co, dong: d };
  }
  ctx.font = `600 ${coMin}px ${font}`;
  return { co: coMin, dong: xuongDong(ctx, chu, rong) };
}

function chuGian(ctx, chu, x, y, gian) {
  if ('letterSpacing' in ctx) { ctx.letterSpacing = gian + 'px'; ctx.fillText(chu, x, y); ctx.letterSpacing = '0px'; return; }
  const rong = [...chu].reduce((s, c) => s + ctx.measureText(c).width + gian, -gian);
  let cx = x - rong / 2;
  const canCu = ctx.textAlign; ctx.textAlign = 'left';
  for (const c of chu) { ctx.fillText(c, cx, y); cx += ctx.measureText(c).width + gian; }
  ctx.textAlign = canCu;
}

async function veAnh({ thongDiep, yNghia, ngayDep }) {
  await napFont();
  const cv = document.createElement('canvas');
  cv.width = R; cv.height = C;
  const ctx = cv.getContext('2d');

  // nền trời đêm
  const nen = ctx.createLinearGradient(0, 0, 0, C);
  nen.addColorStop(0, '#2a2059'); nen.addColorStop(.42, '#171233'); nen.addColorStop(1, '#0b0917');
  ctx.fillStyle = nen; ctx.fillRect(0, 0, R, C);

  // quầng sáng phía trên
  const quang = ctx.createRadialGradient(R / 2, C * .3, 40, R / 2, C * .3, R * .78);
  quang.addColorStop(0, 'rgba(232,195,122,.14)'); quang.addColorStop(1, 'rgba(232,195,122,0)');
  ctx.fillStyle = quang; ctx.fillRect(0, 0, R, C);

  // sao, rải theo chính thông điệp nên mỗi lá một bầu trời riêng
  const rnd = nn(bam(thongDiep));
  for (let i = 0; i < 190; i++) {
    const x = rnd() * R, y = rnd() * C, r = rnd() * 2.6 + .6;
    ctx.globalAlpha = rnd() * .5 + .12; ctx.fillStyle = '#eae6ff';
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.284); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // khung vàng
  const khung = (m, w, a) => {
    ctx.strokeStyle = `rgba(201,162,77,${a})`; ctx.lineWidth = w;
    ctx.beginPath(); ctx.roundRect(m, m, R - m * 2, C - m * 2, 26); ctx.stroke();
  };
  khung(54, 3, .55); khung(78, 1.5, .22);

  ctx.textAlign = 'center';

  /* Đo trước toàn bộ khối nội dung rồi căn giữa theo chiều dọc,
     để lá chữ ngắn và lá chữ dài đều cân, không dồn lên trên. */
  const RONG_MSG = 800, RONG_Y = 740, BAN_KINH_HOA = 124;
  const { co, dong } = vuaKhung(ctx, thongDiep, RONG_MSG, 620, 84, 46, 1.36, SERIF);
  ctx.font = `400 34px ${SANS}`;
  const dongY = xuongDong(ctx, yNghia, RONG_Y);

  const caoHoa = BAN_KINH_HOA * 2;
  const caoMsg = dong.length * co * 1.36;
  const caoY = dongY.length * 52;
  const KHE1 = 96, KHE2 = 54, KHE3 = 62;                 // hoa→chữ, chữ→gạch, gạch→ý nghĩa
  const caoKhoi = caoHoa + KHE1 + caoMsg + KHE2 + KHE3 + caoY;

  const TREN = 130, DUOI = 1712;                          // vùng cho phép đặt khối
  let y = TREN + Math.max(0, (DUOI - TREN - caoKhoi) / 2);

  // hoa văn mặt trời
  const hx = R / 2, hy = y + BAN_KINH_HOA;
  ctx.strokeStyle = 'rgba(232,195,122,.8)'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(hx, hy, 42, 0, 6.284); ctx.stroke();
  ctx.globalAlpha = .38; ctx.beginPath(); ctx.arc(hx, hy, 64, 0, 6.284); ctx.stroke();
  ctx.globalAlpha = .16; ctx.beginPath(); ctx.arc(hx, hy, 86, 0, 6.284); ctx.stroke();
  ctx.globalAlpha = .75;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(a) * 100, hy + Math.sin(a) * 100);
    ctx.lineTo(hx + Math.cos(a) * BAN_KINH_HOA, hy + Math.sin(a) * BAN_KINH_HOA);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#e8c37a'; ctx.beginPath(); ctx.arc(hx, hy, 13, 0, 6.284); ctx.fill();
  y += caoHoa + KHE1;

  // thông điệp
  ctx.font = `600 ${co}px ${SERIF}`;
  ctx.fillStyle = '#f6f1e7';
  ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 3;
  for (const d of dong) { y += co; ctx.fillText(d, R / 2, y); y += co * .36; }
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // gạch ngăn
  y += KHE2;
  const g = ctx.createLinearGradient(R / 2 - 200, 0, R / 2 + 200, 0);
  g.addColorStop(0, 'rgba(201,162,77,0)'); g.addColorStop(.5, 'rgba(201,162,77,.85)'); g.addColorStop(1, 'rgba(201,162,77,0)');
  ctx.fillStyle = g; ctx.fillRect(R / 2 - 200, y, 400, 1.6);

  // ý nghĩa
  y += KHE3;
  ctx.font = `400 34px ${SANS}`;
  ctx.fillStyle = 'rgba(202,195,218,.92)';
  for (const d of dongY) { y += 36; ctx.fillText(d, R / 2, y); y += 16; }

  // chân ảnh
  ctx.font = `500 23px ${SANS}`; ctx.fillStyle = 'rgba(232,195,122,.9)';
  chuGian(ctx, 'THÔNG ĐIỆP CỦA THƯỢNG ĐẾ', R / 2, C - 148, 5);
  ctx.font = `400 25px ${SANS}`; ctx.fillStyle = 'rgba(185,178,204,.75)';
  ctx.fillText(ngayDep, R / 2, C - 102);

  return new Promise(res => cv.toBlob(res, 'image/png'));
}

self.TDTD_ANH = { veAnh };
})();
