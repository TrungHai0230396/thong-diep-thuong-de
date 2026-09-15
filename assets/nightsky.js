/* Bầu trời đêm nay — bầu trời thật, ở chỗ bạn đang đứng, vào đúng lúc này.

   Toàn bộ vị trí lấy từ assets/astro.js: Mặt Trời, Mặt Trăng, năm hành tinh mắt thường
   thấy được, cùng tám chòm sao mượn lại toạ độ thật của trò Nối sao.

   Không gọi mạng. Chỉ hỏi vị trí của máy nếu người dùng bấm cho phép; không thì chọn
   thành phố trong danh sách. Vị trí đã chọn giữ lại trong máy để lần sau khỏi chọn nữa. */
(() => {
'use strict';

const A = () => self.TDTD_ASTRO;
const RAD = Math.PI / 180;
const NOI_KEY = 'tdtd.troi.noi';

/* Vài thành phố cho ai không muốn bật định vị. Vĩ độ, kinh độ. */
const THANH_PHO = [
  ['Hà Nội', 21.0278, 105.8342], ['Hải Phòng', 20.8449, 106.6881],
  ['Huế', 16.4637, 107.5909], ['Đà Nẵng', 16.0544, 108.2022],
  ['Quy Nhơn', 13.7829, 109.2196], ['Đà Lạt', 11.9404, 108.4583],
  ['Nha Trang', 12.2388, 109.1967], ['TP.HCM', 10.8231, 106.6297],
  ['Cần Thơ', 10.0452, 105.7469], ['Cà Mau', 9.1769, 105.1524],
];

/* Năm hành tinh mắt thường nhìn thấy được: tên, màu, độ sáng biểu kiến điển hình. */
const HANH_TINH = [
  ['thuy', 'Sao Thuỷ', '#c8bda8', 0.0],
  ['kim',  'Sao Kim',  '#fff3d0', -4.0],
  ['hoa',  'Sao Hoả',  '#e08b6a', 0.5],
  ['moc',  'Sao Mộc',  '#f0e0b8', -2.2],
  ['tho',  'Sao Thổ',  '#e8d9a0', 0.6],
];

const TAM_HUONG = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];

/* Tên gọi tuần trăng theo tuổi trăng, tính bằng ngày kể từ mùng một. */
function tenTrang(tuoi, sang) {
  if (tuoi < 1.5 || tuoi > 28.0) return 'trăng non';
  if (tuoi < 6.5) return 'trăng lưỡi liềm đầu tháng';
  if (tuoi < 8.5) return 'trăng thượng huyền';
  if (tuoi < 13.5) return 'trăng khuyết đầu tháng';
  if (tuoi < 16.5) return 'trăng tròn';
  if (tuoi < 21.5) return 'trăng khuyết cuối tháng';
  if (tuoi < 23.5) return 'trăng hạ huyền';
  return 'trăng lưỡi liềm cuối tháng';
}

let tam, cv, ctx, W, H, DPR, raf = null;
let noi = { ten: 'TP.HCM', vi: 10.8231, kinh: 106.6297, tuMay: false };
let huongNhin = 180, caoNhin = 25, goc = 75;             // đang nhìn về đâu, và mở góc bao nhiêu
let theoMay = false, batTheoMay = null;
let keo = null, chon = null;

try {
  const l = JSON.parse(localStorage.getItem(NOI_KEY) || 'null');
  if (l && typeof l.vi === 'number') noi = l;
} catch (e) {}

/* ---------- chiếu từ bầu trời xuống mặt kính ---------- */

const vecto = (cao, huong) => ({
  x: Math.cos(cao * RAD) * Math.sin(huong * RAD),        // đông
  y: Math.cos(cao * RAD) * Math.cos(huong * RAD),        // bắc
  z: Math.sin(cao * RAD),                                 // lên
});
const cham = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;

/* Góc thật giữa hai điểm trên thiên cầu, tính bằng độ. */
const gocGiua = (c1, h1, c2, h2) => {
  const a = vecto(c1, h1), b = vecto(c2, h2);
  return Math.acos(Math.max(-1, Math.min(1, cham(a, b)))) / RAD;
};

/* Phép chiếu tâm: điểm nào ở sau lưng thì bỏ. Trả về toạ độ trên mặt kính, hoặc null. */
function chieu(cao, huong) {
  const f = vecto(caoNhin, huongNhin);
  const len = { x: 0, y: 0, z: 1 };
  let ph = { x: f.y * len.z - f.z * len.y, y: f.z * len.x - f.x * len.z, z: f.x * len.y - f.y * len.x };
  let d = Math.hypot(ph.x, ph.y, ph.z);
  if (d < 1e-6) { ph = { x: 1, y: 0, z: 0 }; d = 1; }     // nhìn thẳng lên thì chọn bừa một hướng
  ph = { x: ph.x / d, y: ph.y / d, z: ph.z / d };
  const tr = { x: ph.y * f.z - ph.z * f.y, y: ph.z * f.x - ph.x * f.z, z: ph.x * f.y - ph.y * f.x };
  const v = vecto(cao, huong);
  const s = cham(v, f);
  if (s <= .12) return null;                              // sau lưng hoặc sát mép, bỏ
  const ti = (W / 2) / Math.tan(goc / 2 * RAD);
  return { x: W / 2 + cham(v, ph) / s * ti, y: H / 2 - cham(v, tr) / s * ti, s };
}

/* ---------- gom hết mọi thứ đang ở trên trời ---------- */

function bauTroi(luc) {
  const JD = A().ngayJulius(luc);
  const dat = (o) => A().docCao(o.ra, o.dec, noi.vi, noi.kinh, JD);

  const t = A().matTroi(JD), vtTroi = dat(t);
  const tr = A().matTrang(JD), vtTrang = dat(tr);
  const toi = A().doToi(vtTroi.cao);

  const ht = HANH_TINH.map(([ma, ten, mau, sang]) => {
    const p = A().hanhTinh(ma, JD);
    return { ma, ten, mau, sang, ...dat(p), kc: p.kc };
  });

  const chom = [];
  const nguon = self.TDTD_CHOMSAO && self.TDTD_CHOMSAO._chom;
  if (nguon) for (const c of nguon) {
    const sao = c.sao.map(([ten, raGio, dec]) => ({ ten: ten.split(' (')[0], ...dat({ ra: raGio * 15, dec }) }));
    chom.push({ ten: c.ten, sao, noi: c.noi || null });
  }

  /* Có hôm Mặt Trăng đi ngang sát một hành tinh. Lúc đó hành tinh nấp sau đĩa trăng nên
     nhìn màn hình chẳng thấy gì — phải nói ra thì mới biết mà ngước lên xem.
     Đúng hôm viết chỗ này, 14/9/2026, Mặt Trăng che Sao Kim thật, và máy tính ra 0,48 độ. */
  const gapTrang = ht
    .filter(p => p.cao > -2)
    .map(p => ({ ten: p.ten, cach: gocGiua(p.cao, p.huong, vtTrang.cao, vtTrang.huong) }))
    .filter(g => g.cach < 3)
    .sort((a, b) => a.cach - b.cach);

  return { JD, troi: { ...t, ...vtTroi }, trang: { ...tr, ...vtTrang }, toi, ht, chom, gapTrang };
}

/* ---------- vẽ ---------- */

/* Màu nền đổi theo độ cao Mặt Trời: ban ngày xanh, chạng vạng chuyển dần, đêm thì đen. */
function veNen(caoTroi) {
  /* Trời tối nhanh hơn tuyến tính: mặt trời vừa lặn là đã sẫm hẳn, xuống -12 độ thì tối.
     Bình phương để đường cong dốc đúng như mắt thấy. */
  const p = Math.pow(Math.max(0, Math.min(1, (caoTroi + 12) / 18)), 2);
  const tren = [Math.round(8 + 82 * p), Math.round(12 + 122 * p), Math.round(26 + 176 * p)];
  const duoi = [Math.round(14 + 116 * p), Math.round(20 + 140 * p), Math.round(38 + 168 * p)];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${tren.join(',')})`);
  g.addColorStop(1, `rgb(${duoi.join(',')})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  return p;
}

/* Đường chân trời và nền đất, vẽ theo đúng phép chiếu nên nó cong khi ngẩng đầu. */
function veChanTroi() {
  ctx.save();
  ctx.beginPath();
  let dau = true, diem = [];
  for (let h = 0; h <= 360; h += 2) {
    const p = chieu(0, h);
    if (!p) { dau = true; continue; }
    diem.push(p);
    if (dau) { ctx.moveTo(p.x, p.y); dau = false; } else ctx.lineTo(p.x, p.y);
  }
  ctx.strokeStyle = 'rgba(190,215,235,.4)'; ctx.lineWidth = 1.4; ctx.stroke();

  if (diem.length > 1) {                                  // tô đất bên dưới
    ctx.beginPath();
    ctx.moveTo(diem[0].x, diem[0].y);
    for (const p of diem) ctx.lineTo(p.x, p.y);
    ctx.lineTo(diem[diem.length - 1].x, H); ctx.lineTo(diem[0].x, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(6,10,16,.86)'; ctx.fill();
  }
  ctx.restore();

  ctx.font = '600 12px "Be Vietnam Pro", system-ui, sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i < 8; i++) {
    const p = chieu(0, i * 45);
    if (!p) continue;
    ctx.fillStyle = i === 0 ? 'rgba(240,196,138,.95)' : 'rgba(190,215,235,.6)';
    ctx.fillText(TAM_HUONG[i], p.x, p.y - 9);            // ghi phía trên chân trời, kẻo nền đất che mất
  }
}

/* Mã màu ở đây là hex, nên phải tự đổi ra rgba mới đặt được độ mờ. Lúc đầu tôi viết
   mau.replace('rgb','rgba') — với chuỗi hex thì phép thay đó không ăn gì cả, gradient
   bắt đầu bằng màu đặc và quầng sáng ra thành một cục tròn chứ không mờ dần. */
const moDi = (hex, a) => {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return `rgba(${parseInt(v.slice(0, 2), 16)},${parseInt(v.slice(2, 4), 16)},${parseInt(v.slice(4, 6), 16)},${a})`;
};

function veSao(p, doSang, mau) {
  const r = Math.max(.7, doSang);
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.284);
  ctx.fillStyle = mau; ctx.fill();
  if (doSang > 2) {                                       // vật sáng thì có quầng
    const g = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 5);
    g.addColorStop(0, mau.startsWith('#') ? moDi(mau, .3) : mau);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r * 5, 0, 6.284); ctx.fill();
  }
}

/* Mặt Trăng: vẽ đúng phần khuyết, và quay sao cho bề sáng hướng về phía Mặt Trời.
   Ở gần xích đạo lưỡi liềm nằm ngang như cái thuyền chứ không dựng đứng — cái đó ra
   được là nhờ chỗ quay này, chứ không phải vẽ sẵn. */
function veTrang(p, pTroi, r, sang) {
  const q = pTroi ? Math.atan2(pTroi.y - p.y, pTroi.x - p.x) : -Math.PI / 2;
  ctx.save();
  ctx.translate(p.x, p.y); ctx.rotate(q);                 // trục x giờ chỉ về phía Mặt Trời

  const g = ctx.createRadialGradient(0, 0, r * .2, 0, 0, r * 4.5);
  g.addColorStop(0, 'rgba(246,240,214,.28)'); g.addColorStop(1, 'rgba(246,240,214,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 4.5, 0, 6.284); ctx.fill();

  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.284);            // phần tối, vẫn thấy mờ mờ
  ctx.fillStyle = 'rgba(74,78,96,.5)'; ctx.fill();

  const k = Math.max(0, Math.min(1, sang));
  ctx.beginPath();
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);            // nửa đĩa phía Mặt Trời luôn sáng
  /* Ranh giới sáng tối là nửa elip đi qua điểm x = (1 - 2k)·r.
     Trăng lưỡi liềm (k nhỏ) thì nó cong về **phía Mặt Trời**, ăn bớt nửa đĩa sáng thành
     một lưỡi mỏng; trăng khuyết (k lớn) thì cong về phía tối, phình ra. Lúc đầu tôi lấy
     dấu ngược nên trăng 12% vẽ ra thành trăng khuyết gần tròn. */
  const b = r * (1 - 2 * k);
  ctx.ellipse(0, 0, Math.abs(b), r, 0, Math.PI / 2, -Math.PI / 2, b > 0);
  ctx.closePath();
  ctx.fillStyle = '#f6f0d6'; ctx.fill();
  ctx.restore();
}

function ve(luc) {
  const b = bauTroi(luc);
  const sangTroi = veNen(b.troi.cao);

  /* Sao chỉ hiện khi trời đủ tối, và mờ dần theo độ sáng còn lại của bầu trời. */
  const roSao = Math.max(0, 1 - sangTroi * 2.4);
  if (roSao > .02) {
    ctx.lineWidth = 1;
    for (const c of b.chom) {
      const diem = c.sao.map(s => (s.cao > -2 ? chieu(s.cao, s.huong) : null));
      ctx.strokeStyle = `rgba(150,190,230,${.22 * roSao})`;
      ctx.beginPath();
      for (let i = 1; i < diem.length; i++) {
        if (diem[i - 1] && diem[i]) { ctx.moveTo(diem[i - 1].x, diem[i - 1].y); ctx.lineTo(diem[i].x, diem[i].y); }
      }
      ctx.stroke();
      let giua = null;
      for (let i = 0; i < diem.length; i++) {
        if (!diem[i]) continue;
        veSao(diem[i], 1.8, `rgba(232,238,255,${roSao})`);
        if (!giua || diem[i].y < giua.y) giua = diem[i];
      }
      if (giua && roSao > .35) {
        ctx.font = '500 11px "Be Vietnam Pro", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(190,215,235,${.5 * roSao})`;
        ctx.fillText(c.ten, giua.x, giua.y - 12);
      }
    }
  }

  /* Chỗ đã có chữ rồi thì thôi, kẻo hai cái tên chồng lên nhau khi Mặt Trăng đứng sát
     một hành tinh — đêm nay Sao Kim ngay cạnh Trăng là dính ngay. */
  const daGhi = [];
  const chenChu = (x, y) => {
    if (daGhi.some(c => Math.abs(c.x - x) < 52 && Math.abs(c.y - y) < 15)) return false;
    daGhi.push({ x, y }); return true;
  };

  /* Mặt Trăng và Mặt Trời ghi tên trước, hành tinh nhường chỗ. */
  if (b.trang.cao > -2) { const s = chieu(b.trang.cao, b.trang.huong); if (s) chenChu(s.x, s.y + 34); }
  if (b.troi.cao > -3) { const s = chieu(b.troi.cao, b.troi.huong); if (s) chenChu(s.x, s.y + 32); }

  /* Hành tinh: sáng hơn sao thường nên thấy được cả lúc trời còn nhá nhem. */
  for (const p of b.ht) {
    if (p.cao < -1) continue;
    const s = chieu(p.cao, p.huong);
    if (!s) continue;
    const ro = Math.max(0, 1 - sangTroi * (p.sang < -2 ? 1.1 : 2.2));
    if (ro < .05) continue;
    veSao(s, p.sang < -3 ? 3.6 : p.sang < -1 ? 3 : 2.2, p.mau);
    if (!chenChu(s.x, s.y + 22)) continue;
    ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(240,232,214,${.55 + .35 * ro})`;
    ctx.fillText(p.ten, s.x, s.y + 22);
  }

  /* Mặt Trăng. */
  if (b.trang.cao > -2) {
    const s = chieu(b.trang.cao, b.trang.huong);
    if (s) {
      const sTroi = b.troi.cao > -30 ? chieu(b.troi.cao, b.troi.huong) : null;
      veTrang(s, sTroi, 17, b.trang.sang);
      ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(246,240,214,.85)';
      ctx.fillText('Mặt Trăng', s.x, s.y + 34);
    }
  }

  /* Mặt Trời. */
  if (b.troi.cao > -3) {
    const s = chieu(b.troi.cao, b.troi.huong);
    if (s) {
      const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, 90);
      g.addColorStop(0, 'rgba(255,238,180,.95)'); g.addColorStop(.25, 'rgba(255,214,120,.45)');
      g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s.x, s.y, 90, 0, 6.284); ctx.fill();
      ctx.fillStyle = '#fff4cf'; ctx.beginPath(); ctx.arc(s.x, s.y, 15, 0, 6.284); ctx.fill();
      ctx.font = '500 12px "Be Vietnam Pro", system-ui, sans-serif';
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,238,190,.9)';
      ctx.fillText('Mặt Trời', s.x, s.y + 32);
    }
  }

  veChanTroi();
  return b;
}

/* ---------- dòng chữ dưới đáy ---------- */

function capNhatChu(b, luc) {
  const gio = new Date(luc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const dau = new Date(luc); dau.setHours(0, 0, 0, 0);
  const ml = A().mocLan(dau.getTime(), noi.vi, noi.kinh);
  const gioNgan = (ms) => ms === null ? '—' :
    new Date(ms).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const mai = new Date(dau); mai.setDate(mai.getDate() + 1);
  const mlMai = A().mocLan(mai.getTime(), noi.vi, noi.kinh);
  const mt = A().mocLan(dau.getTime(), noi.vi, noi.kinh, 'trang');
  const mtMai = A().mocLan(mai.getTime(), noi.vi, noi.kinh, 'trang');

  const tren = b.ht.filter(p => p.cao > 0).map(p => p.ten);
  const q = tam.querySelector('.td-tin');
  q.innerHTML = `
    <p class="td-dong1">${noi.ten} · ${gio} · ${b.toi.ten}</p>
    <p class="td-dong2">
      Mặt Trời ${dangODau(b.troi.cao, b.troi.huong, ml, mlMai, luc)}
      · ${tenTrang(b.trang.tuoi, b.trang.sang)}, sáng ${Math.round(b.trang.sang * 100)}%,
      ${dangODau(b.trang.cao, b.trang.huong, mt, mtMai, luc)}
    </p>
    <p class="td-dong3">${tren.length ? 'Đang trên trời: ' + tren.join(' · ')
                                      : 'Không hành tinh nào trên trời lúc này'}</p>
    ${b.gapTrang.length ? `<p class="td-gap">${b.gapTrang.map(g =>
      g.cach < 0.6 ? `${g.ten} đang nấp ngay sau Mặt Trăng, cách ${so1(g.cach)}°`
                   : `${g.ten} đang sát Mặt Trăng, cách ${so1(g.cach)}°`).join(' · ')}</p>` : ''}`;
}

/* Một thiên thể không ở trên trời thì có HAI lý do khác hẳn nhau: chưa mọc, hoặc đã lặn rồi.
   Bản trước gộp cả hai thành một câu "chưa lên khỏi chân trời", nên lúc mười một giờ đêm mà
   Trăng đã lặn từ chín rưỡi thì app vẫn bảo nó "chưa lên" — người đọc tưởng app hỏng. */
function dangODau(cao, huong, ml, mlMai, luc) {
  const g = (ms) => ms === null ? '—' :
    new Date(ms).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const t = A().trangThaiMocLan(cao, ml, mlMai, luc);
  if (t.tinh === 'tren')
    return `đang ở ${Math.round(cao)}° trên ${huongChu(huong)}` + (t.lan ? `, lặn lúc ${g(t.lan)}` : '');
  if (t.tinh === 'chuaMoc') return `chưa mọc, mọc lúc ${g(t.moc)}`;
  if (t.tinh === 'daLan') return `đã lặn lúc ${g(t.lan)}` + (t.maiMoc ? `, mai mọc ${g(t.maiMoc)}` : '');
  return 'đang ở dưới chân trời';
}

const so1 = (x) => x.toFixed(1).replace('.', ',');       // dấu thập phân kiểu Việt
const huongChu = (h) => TAM_HUONG[Math.round(((h % 360) + 360) % 360 / 45) % 8].toLowerCase();

/* ---------- vòng chạy ---------- */

function vong() {
  raf = requestAnimationFrame(vong);
  const luc = Date.now();
  const b = ve(luc);
  if (!vong.t || luc - vong.t > 1000) { capNhatChu(b, luc); vong.t = luc; }
}

/* ---------- khung ---------- */

function doCo() {
  W = tam.clientWidth || innerWidth || 360;
  H = tam.clientHeight || innerHeight || 640;
  DPR = Math.min(2, devicePixelRatio || 1);
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'troidem';
  tam.innerHTML = `
    <canvas class="td-cv"></canvas>
    <button class="td-dong" aria-label="Đóng">✕</button>
    <div class="td-tin"></div>
    <div class="td-thanh">
      <button class="td-noi" type="button">Đổi nơi</button>
      <button class="td-may" type="button">Xoay theo máy</button>
    </div>
    <div class="td-bang" hidden></div>`;
  document.body.appendChild(tam);
  cv = tam.querySelector('.td-cv');
  ctx = cv.getContext('2d');
  tam.querySelector('.td-dong').onclick = dong;
  tam.querySelector('.td-noi').onclick = moBangChonNoi;
  tam.querySelector('.td-may').onclick = doiTheoMay;

  cv.addEventListener('pointerdown', e => { keo = { x: e.clientX, y: e.clientY, h: huongNhin, c: caoNhin }; });
  cv.addEventListener('pointermove', e => {
    if (!keo) return;
    theoMay = false;
    huongNhin = A().chuan(keo.h - (e.clientX - keo.x) * goc / W);
    caoNhin = Math.max(-20, Math.min(88, keo.c + (e.clientY - keo.y) * goc / W));
  });
  for (const s of ['pointerup', 'pointercancel', 'pointerleave']) cv.addEventListener(s, () => { keo = null; });
  cv.addEventListener('wheel', e => {
    e.preventDefault();
    goc = Math.max(25, Math.min(110, goc + Math.sign(e.deltaY) * 4));
  }, { passive: false });
  addEventListener('resize', () => { if (tam && tam.classList.contains('hien')) doCo(); });
}

/* ---------- chọn nơi đứng ---------- */

function moBangChonNoi() {
  const b = tam.querySelector('.td-bang');
  b.hidden = false;
  b.innerHTML = `
    <div class="td-hop">
      <p class="td-tieu">Bạn đang ở đâu?</p>
      <button class="td-dinhvi" type="button">Dùng vị trí của máy</button>
      <p class="td-hay">hoặc chọn thành phố</p>
      <div class="td-tp">${THANH_PHO.map(([t, v, k]) =>
        `<button type="button" data-vi="${v}" data-kinh="${k}"${t === noi.ten ? ' class="dang"' : ''}>${t}</button>`).join('')}</div>
      <button class="td-thoi" type="button">Thôi</button>
    </div>`;
  b.querySelector('.td-thoi').onclick = () => { b.hidden = true; };
  b.querySelector('.td-dinhvi').onclick = xinViTri;
  b.querySelectorAll('.td-tp button').forEach(n => {
    n.onclick = () => {
      noi = { ten: n.textContent, vi: +n.dataset.vi, kinh: +n.dataset.kinh, tuMay: false };
      luuNoi(); b.hidden = true;
    };
  });
}

function luuNoi() { try { localStorage.setItem(NOI_KEY, JSON.stringify(noi)); } catch (e) {} }

function xinViTri() {
  const b = tam.querySelector('.td-bang');
  const nut = b.querySelector('.td-dinhvi');
  if (!navigator.geolocation) { nut.textContent = 'Máy này không cho biết vị trí'; return; }
  nut.textContent = 'Đang hỏi vị trí…'; nut.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      noi = { ten: 'chỗ bạn đứng', vi: p.coords.latitude, kinh: p.coords.longitude, tuMay: true };
      luuNoi(); b.hidden = true;
    },
    () => { nut.textContent = 'Không lấy được vị trí, chọn thành phố nhé'; nut.disabled = false; },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
}

/* ---------- xoay theo máy ---------- */

function ganCamBien() {
  batTheoMay = (e) => {
    if (!theoMay) return;
    /* alpha là hướng la bàn, beta là ngẩng cúi. webkitCompassHeading của iOS chính xác hơn
       vì nó đã trừ độ lệch từ; Android thì lấy alpha rồi đảo dấu. */
    const h = typeof e.webkitCompassHeading === 'number' ? e.webkitCompassHeading
            : (e.alpha === null ? null : 360 - e.alpha);
    if (h !== null) huongNhin = A().chuan(h);
    if (typeof e.beta === 'number') caoNhin = Math.max(-20, Math.min(88, e.beta - 90));
  };
  addEventListener('deviceorientation', batTheoMay, true);
}

async function doiTheoMay() {
  const nut = tam.querySelector('.td-may');
  if (theoMay) { theoMay = false; nut.classList.remove('bat'); nut.textContent = 'Xoay theo máy'; return; }
  /* iOS 13 trở lên bắt phải xin phép, và chỉ xin được ngay trong một cú chạm. */
  const D = self.DeviceOrientationEvent;
  if (D && typeof D.requestPermission === 'function') {
    try {
      const tl = await D.requestPermission();
      if (tl !== 'granted') { nut.textContent = 'Máy không cho đọc cảm biến'; return; }
    } catch (e) { nut.textContent = 'Máy không cho đọc cảm biến'; return; }
  } else if (!('DeviceOrientationEvent' in self)) {
    nut.textContent = 'Máy này không có cảm biến hướng';
    return;
  }
  if (!batTheoMay) ganCamBien();
  theoMay = true; nut.classList.add('bat'); nut.textContent = 'Đang xoay theo máy';
}

/* ---------- mở đóng ---------- */

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  doCo();
  /* Mở ra thì quay mặt về hướng có nhiều thứ đáng xem nhất: Mặt Trăng nếu nó đang trên
     trời, không thì Mặt Trời, không nữa thì nhìn về Nam. */
  const b = bauTroi(Date.now());
  huongNhin = b.trang.cao > 5 ? b.trang.huong : b.troi.cao > 5 ? b.troi.huong : 180;
  caoNhin = Math.max(15, Math.min(60, b.trang.cao > 5 ? b.trang.cao : b.troi.cao > 5 ? b.troi.cao : 25));
  if (!raf) raf = requestAnimationFrame(vong);
}

function dong() {
  if (raf) { cancelAnimationFrame(raf); raf = null; }
  theoMay = false;
  if (tam) { tam.classList.remove('hien'); const b = tam.querySelector('.td-bang'); if (b) b.hidden = true; }
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => { if (e.key === 'Escape' && tam && tam.classList.contains('hien')) dong(); });

self.TDTD_TROIDEM = { mo, dong,
  _bauTroi: (luc) => bauTroi(luc || Date.now()),
  _noi: (v, k, ten) => { noi = { ten: ten || 'thử', vi: v, kinh: k, tuMay: false }; return noi; },
  _nhin: (h, c, g) => { huongNhin = h; caoNhin = c; if (g) goc = g; return { huongNhin, caoNhin, goc }; },
  _chieu: (cao, huong) => chieu(cao, huong),
  _tenTrang: tenTrang,
  _dangODau: (cao, huong, ml, mlMai, luc) => dangODau(cao, huong, ml, mlMai, luc),
  _debug: () => ({ noi, huongNhin: Math.round(huongNhin), caoNhin: Math.round(caoNhin), goc, theoMay, W, H }) };
})();
