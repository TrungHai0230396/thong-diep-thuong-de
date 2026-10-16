/* Hôm nay ăn gì — giao diện ngôi sao. Dữ liệu món và mọi phép tính (chọn món, vòng quay, mâm cơm, gộp phiếu nhóm)
   nằm ở assets/monan.js, hàm thuần có bài kiểm (scripts/test-angi.js).

   Hai thẻ:
   - Ăn ngoài, gọi về: vòng quay tám món hợp bữa, hợp trời, hợp túi tiền. Chạm QUAY hay vuốt mạnh vòng tròn; chạm một
     miếng để bỏ hay đổi món đó. "Cả nhóm": chuyền máy, mỗi người tim món thèm, gạch món không muốn, rồi quay vòng của
     nhóm — món nhiều tim thì miếng to hơn.
   - Nấu ở nhà: mâm ba món mặn, canh, rau chạy như máy xèng ba hàng; khoá món ưng ý rồi quay phần còn lại; danh sách
     đi chợ, gửi cả nhà.
   Lưu đúng một mục tdtd.angi: lựa chọn lọc, món của tôi, món đã chốt trong bảy ngày gần đây (để né món vừa ăn). */
(() => {
'use strict';

const M = () => self.TDTD_MONAN;
const KHOA = 'tdtd.angi';
const NOI_TROI = 'tdtd.troi.noi';                    // nơi ở chọn trong Bầu trời đêm: chỉ đọc, không ghi đè
const TROI_URL = 'https://api.open-meteo.com/v1/forecast';
const MAU = ['#f2836b', '#f4c35e', '#9fd38a', '#f3e3c0', '#ea8fb0', '#8fd3c8', '#f6a65a', '#c3b1ea'];
const R = 150;                                        // bán kính bánh xe, đơn vị của viewBox (−175…175)
const R_TRUC = 46;                                    // nút QUAY ở giữa che tới đây
const LOAI = ['man', 'canh', 'rau'];
const TEN_KHONG = { b: 'Bò', h: 'Heo', g: 'Gà', v: 'Vịt', c: 'Cá', s: 'Hải sản', cay: 'Cay', mo: 'Dầu mỡ' };
const TEN_TROI = { mua: 'trời mưa', nong: 'nắng nóng', lanh: 'trời lạnh' };
const TIM = '♥︎';                          // trái tim dạng chữ, không thành hình emoji đỏ
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hoa = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const deg = (r) => r * 180 / Math.PI;
const coNav = () => typeof navigator !== 'undefined';
const giamDong = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };

const ICO = {
  doi: '<path d="M20 11a8 8 0 0 0-14.3-4.9M4 4.5V9h4.5M4 13a8 8 0 0 0 14.3 4.9M20 19.5V15h-4.5"/>',
  loc: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  nhom: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.3 3-5 6-5s5.4 1.7 6 5"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.8 14.6c2.5.2 4.4 1.7 4.9 4.9"/>',
  cho: '<path d="M4 9.5h16l-1.7 9.1a2 2 0 0 1-2 1.6H7.7a2 2 0 0 1-2-1.6z"/><path d="M8.5 9.5L11 4.5M15.5 9.5L13 4.5"/>',
  gui: '<path d="M12 3v12M7.5 7.5L12 3l4.5 4.5"/><path d="M8 10.5H6v10h12v-10h-2"/>',
  khoa: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  mo: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.6"/>',
  tieng: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
  tat: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  ghim: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
};
const ico = (k) => `<svg class="ag-ico" viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;

let tam = null, rafVong = 0, rafMam = 0, henBao = 0, dangXinTroi = false, am = null;
let cd = macDinh();
const ss = {
  tab: 'ngoai', bua: 'T', bua0: '', ngay: '', ram: null, chayHom: false,
  troiTu: null,                    // trời ở nơi ở: { loai, nhiet, luc, ten, vi, kinh }
  vong: [], noi: [], du: 0,        // các miếng đang có: [{ mon, w, tim }]; noi: đã nới lọc gì; du: số món hợp lọc
  vongCu: null, nhomVong: 0,       // đang quay vòng của nhóm (số người) thì giữ vòng thường ở vongCu
  boDi: new Set(),                 // món đã bỏ khỏi vòng trong bữa này
  goc: 0, quay: null, kim: 0, tachLuc: -1e9, keo: null,
  chon: -1, kq: null,              // miếng đang chạm chọn; kết quả { chiSo, mon, daChot }
  daDung: false,                   // đã quay, đã sửa vòng: từ đó đừng tự đổi vòng sau lưng người dùng
  bang: '', truocBang: '', nhom: null,
  mam: null, khoa: { man: false, canh: false, rau: false }, quayMam: null, daMua: new Set(),
};

/* ---------- lưu ---------- */

function macDinh() {
  return { tab: 'ngoai', khong: [], chay: false, tui: 3, troi: 'tu', mien: 'tu', ne: true, chot: [], rieng: [],
           chiRieng: false, nhanh: false, tieng: true, daQuay: false, soNguoi: 3, vt: null };
}
function docCD() {
  const g = macDinh();
  try {
    const o = JSON.parse(localStorage.getItem(KHOA) || 'null');
    if (!o || typeof o !== 'object') return g;
    const ds = (x) => (Array.isArray(x) ? x : []);
    return {
      tab: o.tab === 'nha' ? 'nha' : 'ngoai',
      khong: ds(o.khong).filter(k => k in TEN_KHONG),
      chay: !!o.chay, tui: [1, 2, 3].includes(o.tui) ? o.tui : 3,
      troi: ['tu', 'mua', 'nong', 'lanh', 'thuong'].includes(o.troi) ? o.troi : 'tu',
      mien: ['tu', 'B', 'T', 'N', 'khong'].includes(o.mien) ? o.mien : 'tu',
      ne: o.ne !== false,
      chot: ds(o.chot).filter(c => c && typeof c.id === 'string' && typeof c.ngay === 'string')
        .map(c => ({ id: c.id, ten: String(c.ten || '').slice(0, 60), ngay: c.ngay })),
      rieng: ds(o.rieng).filter(t => typeof t === 'string' && t.trim()).map(t => t.trim().slice(0, 40)).slice(0, 30),
      chiRieng: !!o.chiRieng, nhanh: !!o.nhanh, tieng: o.tieng !== false, daQuay: !!o.daQuay,
      soNguoi: Math.min(12, Math.max(2, (o.soNguoi | 0) || 3)),
      vt: o.vt && typeof o.vt.vi === 'number' && typeof o.vt.kinh === 'number' ? { vi: o.vt.vi, kinh: o.vt.kinh } : null,
    };
  } catch (e) { return g; }
}
function luuCD() { try { localStorage.setItem(KHOA, JSON.stringify(cd)); } catch (e) {} }

/* ---------- hoàn cảnh ---------- */

function noiO() {
  try {
    const l = JSON.parse(localStorage.getItem(NOI_TROI) || 'null');
    if (l && typeof l.vi === 'number' && typeof l.kinh === 'number') return { vi: l.vi, kinh: l.kinh, ten: typeof l.ten === 'string' ? l.ten : '' };
  } catch (e) {}
  return cd.vt ? { vi: cd.vt.vi, kinh: cd.vt.kinh, ten: '' } : null;
}
function troiNay() {
  if (cd.troi === 'tu') return ss.troiTu ? ss.troiTu.loai : '';
  return cd.troi === 'thuong' ? '' : cd.troi;
}
function mienNay() {
  if (cd.mien === 'khong') return '';
  if (cd.mien !== 'tu') return cd.mien;
  const n = noiO();
  return n ? M().mienTheoViTri(n.vi, n.kinh) : '';
}
const ganDay = () => (cd.ne ? M().monGanDay(cd.chot, ss.ngay) : new Map());
function dkNgoai(them) {
  return { bua: ss.bua, chay: cd.chay || ss.chayHom, tui: cd.tui, khong: cd.khong, troi: troiNay(), mien: mienNay(),
           nhom: ss.nhomVong > 0, ganDay: new Set(ganDay().keys()), bo: new Set(ss.boDi), ...(them || {}) };
}
const dkNha = () => ({ chay: cd.chay || ss.chayHom, nhanh: cd.nhanh, khong: cd.khong.filter(k => k.length === 1) });
function tenMon(id) {
  const m = M().NGOAI.find(x => x.id === id);
  if (m) return m.ngan;
  const c = cd.chot.find(x => x.id === id);
  return c ? c.ten : id;
}

/* Trời lúc này ở nơi ở — chỉ khi đã có nơi ở (chọn trong Bầu trời đêm, hay bấm "Lấy thời tiết chỗ tôi"). Toạ độ làm
   tròn hai chữ số thập phân trước khi gửi đi, như phần dự báo mưa. Không lấy được thì thôi, gợi ý như thường. */
async function layThoiTiet() {
  const n = noiO();
  if (!n || dangXinTroi || typeof fetch !== 'function') return;
  if (ss.troiTu && Date.now() - ss.troiTu.luc < 30 * 60000 && ss.troiTu.vi === n.vi && ss.troiTu.kinh === n.kinh) return;
  dangXinTroi = true;
  try {
    const q = new URLSearchParams({
      latitude: (Math.round(n.vi * 100) / 100).toString(), longitude: (Math.round(n.kinh * 100) / 100).toString(),
      current: 'temperature_2m,apparent_temperature,precipitation,weather_code', timezone: 'auto',
    });
    const bo = typeof AbortController === 'function' ? new AbortController() : null;
    const hen = bo ? setTimeout(() => bo.abort(), 7000) : 0;
    const r = await fetch(`${TROI_URL}?${q}`, bo ? { signal: bo.signal } : {});
    clearTimeout(hen);
    /* mất mạng thì service worker trả index.html với status 200: soi kiểu nội dung chứ đừng tin r.ok */
    const kieu = (r && r.headers && r.headers.get('content-type')) || '';
    if (!r.ok || !kieu.includes('json')) throw new Error('khong-phai-json');
    const t = M().docThoiTiet(await r.json());
    if (!t) throw new Error('du-lieu-la');
    ss.troiTu = { ...t, luc: Date.now(), ten: n.ten, vi: n.vi, kinh: n.kinh };
    if (tam && tam.classList.contains('hien')) {
      if (cd.troi === 'tu' && !ss.daDung && !ss.quay && !ss.nhomVong && !ss.bang) lapVong();
      veBoiCanh();
      if (ss.bang === 'loc') veBang();
    }
  } catch (e) { /* không có trời thì thôi */ }
  dangXinTroi = false;
}
function layViTri() {
  if (!coNav() || !navigator.geolocation) { bao('Máy này không cho lấy vị trí'); return; }
  bao('Đang lấy vị trí…');
  navigator.geolocation.getCurrentPosition(p => {
    cd.vt = { vi: Math.round(p.coords.latitude * 100) / 100, kinh: Math.round(p.coords.longitude * 100) / 100 };
    if (cd.troi !== 'tu') cd.troi = 'tu';
    luuCD(); ss.troiTu = null; layThoiTiet();
    if (ss.bang === 'loc') veBang();
  }, () => bao('Không lấy được vị trí — chọn trời bằng tay nhé'), { timeout: 12000, maximumAge: 3600000 });
}

/* ---------- vòng quay ---------- */

function xao(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
}
const monCuaToi = () => cd.rieng.map(t => M().monRieng(t)).filter(Boolean);

/* Dựng vòng mới. tranh: các món của bộ vừa rồi (bấm "Đổi bộ khác"): cố tránh, thiếu thì mới lặp lại. Món của tôi lên
   vòng hai món mỗi lượt; bật "Chỉ quay món của tôi" thì cả vòng là món của tôi. */
function lapVong(tranh) {
  const gd = ganDay();
  /* Món tự gõ thì app không biết chay hay mặn ("Cơm gà cô Ba"): đang chay thì không trộn vào — trừ khi người dùng bật
     "Chỉ quay món của tôi", tức là tự chịu trách nhiệm với danh sách của mình. */
  const chay = cd.chay || ss.chayHom;
  const rieng = chay && !cd.chiRieng ? [] : monCuaToi().filter(m => !gd.has(m.id) || cd.chiRieng);
  let mon = [], noi = [], du = 0;
  if (cd.chiRieng && monCuaToi().length >= 2) {
    const tot = rieng.filter(m => !ss.boDi.has(m.id));
    mon = xao(tot.length >= 2 ? tot : monCuaToi()).slice(0, 12);
    du = mon.length;
  } else {
    const soRieng = Math.min(2, rieng.length), can = 8 - soRieng;
    const tranhDs = tranh ? [...tranh] : [];
    let r = M().vongNgoai(M().NGOAI, dkNgoai({ bo: new Set([...ss.boDi, ...tranhDs]) }), can);
    if (tranh && r.mon.length < can) {
      const them = M().vongNgoai(M().NGOAI, dkNgoai({ bo: new Set([...ss.boDi, ...r.mon.map(m => m.id)]) }), can - r.mon.length);
      r = { ...r, mon: r.mon.concat(them.mon), du: Math.max(r.du, them.du) };
    }
    mon = xao(r.mon.concat(xao(rieng).slice(0, soRieng)));
    noi = r.noi; du = r.du + soRieng;
  }
  ss.vong = mon.map(m => ({ mon: m, w: 1, tim: 0 }));
  ss.noi = noi; ss.du = du; ss.nhomVong = 0; ss.vongCu = null; ss.chon = -1; ss.kq = null;
  veBanh(); veChon(); veNhomDau(); veGoi();
}

const diem = (a, r) => [r * Math.sin(a), -r * Math.cos(a)];
const mauMieng = (i, n) => { let k = i % MAU.length; if (n > 1 && i === n - 1 && k === 0) k = 2; return MAU[k]; };

function veBanh() {
  if (!tam) return;
  const svg = tam.querySelector('.ag-banh'), n = ss.vong.length;
  const mieng = M().cacMieng(ss.vong.map(x => x.w));
  let s = `<circle class="ag-vanh" r="${R + 17}"/><g class="ag-xoay">`;
  mieng.forEach((m, i) => {
    const [x1, y1] = diem(m.dau, R), [x2, y2] = diem(m.cuoi, R), lon = m.cuoi - m.dau > Math.PI ? 1 : 0;
    const d = n === 1 ? `M0 ${-R}A${R} ${R} 0 1 1 0 ${R}A${R} ${R} 0 1 1 0 ${-R}Z`
                      : `M0 0L${x1.toFixed(2)} ${y1.toFixed(2)}A${R} ${R} 0 ${lon} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}Z`;
    s += `<path class="ag-mieng" data-i="${i}" d="${d}" fill="${mauMieng(i, n)}"/>`;
  });
  mieng.forEach((m, i) => {
    const x = ss.vong[i], giua = (m.dau + m.cuoi) / 2, rong = m.cuoi - m.dau;
    const chu = x.mon.ngan, dai = R - 14 - (R_TRUC + 6);
    const hang = x.tim && rong > 0.5 ? 2 : 1;            // vòng của nhóm: số tim một dòng nhỏ bên dưới, miếng đủ rộng
    let co = Math.min(14.5, dai / (chu.length * 0.56));
    co = Math.max(8, Math.min(co, 2 * 92 * Math.sin(Math.min(rong, Math.PI) / 2) / (1.3 * hang)));   // miếng hẹp thì chữ nhỏ lại cho vừa
    const trong = hang === 2 ? `<tspan dy="-0.55em">${esc(chu)}</tspan><tspan x="0" dy="1.25em" font-size="0.82em">${TIM} ${x.tim}</tspan>`
                             : esc(chu) + (x.tim ? ` ${TIM}${x.tim}` : '');
    s += `<text class="ag-chu" data-i="${i}" transform="rotate(${(deg(giua) - 90).toFixed(2)}) translate(${R - 14} 0)" font-size="${co.toFixed(1)}">${trong}</text>`;
  });
  if (n > 1) mieng.forEach(m => { const [x, y] = diem(m.dau, R + 8.5); s += `<circle class="ag-den" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="3.3"/>`; });
  s += `</g><g class="ag-kim"><path d="M0 ${-R + 7}L-12.5 ${-R - 23}Q0 ${-R - 32} 12.5 ${-R - 23}Z"/><circle cx="0" cy="${-R - 21}" r="3.3"/></g>`;
  svg.innerHTML = s;
  ss.elXoay = svg.querySelector('.ag-xoay'); ss.elKim = svg.querySelector('.ag-kim');
  ss.elChu = [...svg.querySelectorAll('.ag-chu')]; ss.giuaChu = mieng.map(m => deg((m.dau + m.cuoi) / 2));
  datGoc(ss.goc);
  const v = tam.querySelector('.ag-vong');
  v.setAttribute('aria-label', 'Vòng quay ' + n + ' món: ' + ss.vong.map(x => x.mon.ten).join(', '));
  danhDau();
}
function datGoc(g) {
  if (ss.elXoay) ss.elXoay.setAttribute('transform', `rotate(${deg(g).toFixed(3)})`);
  if (!ss.quay) latChu();
}
/* Chữ chạy dọc bán kính thì nửa trái vòng bị lộn ngược. Lúc vòng đứng yên (hay đang kéo tay), miếng nào đang ở nửa trái
   thì lật chữ lại cho đọc xuôi, từ mép vào trục. Đang quay thì để yên, lật liên tục trông như nhấp nháy. */
function latChu() {
  const g = deg(ss.goc);
  (ss.elChu || []).forEach((t, i) => {
    const giua = ss.giuaChu[i], a = (((giua + g) % 360) + 360) % 360, lat = a > 180;
    if (t._lat === lat) return;
    t._lat = lat;
    t.setAttribute('transform', lat ? `rotate(${(giua + 90).toFixed(2)}) translate(${-(R - 14)} 0)`
                                    : `rotate(${(giua - 90).toFixed(2)}) translate(${R - 14} 0)`);
    t.classList.toggle('lat', lat);
  });
}
function datKim(d) { if (ss.elKim) ss.elKim.setAttribute('transform', d ? `rotate(${d.toFixed(2)} 0 ${-R - 21})` : ''); }
function danhDau() {
  if (!tam) return;
  for (const p of tam.querySelectorAll('.ag-mieng, .ag-chu')) {
    const i = +p.dataset.i, thang = !!ss.kq && i === ss.kq.chiSo;
    p.classList.toggle('chon', i === ss.chon);
    p.classList.toggle('thang', thang);
    p.classList.toggle('mo', !!ss.kq && !thang);
  }
}

function quayNut() {
  if (ss.quay || ss.bang || !ss.vong.length) return;   // bảng đang mở: phím Enter còn đậu trên nút QUAY phía sau thì thôi
  if (ss.vong.length === 1) { moKetQua(0); return; }
  const nhanh = giamDong();
  batDauQuay(M().cuQuay(ss.vong.map(x => x.w), ss.goc, Math.random, nhanh ? M().MA_SAT_NHANH : M().MA_SAT, nhanh ? [1, 1] : [3, 5]));
}
function batDauQuay(cu) {
  const mieng = M().cacMieng(ss.vong.map(x => x.w));
  ss.daDung = true; ss.chon = -1; ss.kq = null;
  anKetQua(); veChon(); danhDau();
  ss.quay = { cu, goc0: ss.goc, batDau: 0, mieng, o: M().miengDuoiKim(mieng, ss.goc) };
  amThanh();                                       // mở tiếng ngay trong cú chạm (Safari đòi vậy)
  const nut = tam.querySelector('.ag-quay');
  if (nut) nut.disabled = true;
  veGoi('Đang quay…');
  if (!cd.daQuay) { cd.daQuay = true; luuCD(); }
  if (!rafVong) rafVong = requestAnimationFrame(khung);
}
/* Mỗi khung hình tính thẳng góc theo thời gian (lời giải đóng ở monan.js): trang bị ẩn rồi hiện lại thì bánh xe
   nhảy tới đúng chỗ, không chạy dồn. */
function khung(now) {
  rafVong = 0;
  const q = ss.quay;
  if (!q || !tam) return;
  if (!q.batDau) q.batDau = now;
  const t = (now - q.batDau) / 1000, cu = q.cu;
  const g = q.goc0 + cu.huong * M().gocSau(cu.w0, t, cu.ms);
  ss.goc = g; datGoc(g);
  const o = M().miengDuoiKim(q.mieng, g);
  if (o !== q.o) { q.o = o; tach(M().vanTocSau(cu.w0, t, cu.ms), now); }
  const tre = now - ss.tachLuc;                    // lá gảy bật lệch khi chạm chốt rồi về chỗ
  datKim(tre < 130 ? -cu.huong * ss.kim * (1 - tre / 130) : 0);
  if (t >= cu.thoiGian) {
    ss.quay = null; ss.goc = M().quyGoc(cu.gocCuoi); datGoc(ss.goc); datKim(0);
    const nut = tam.querySelector('.ag-quay');
    if (nut) nut.disabled = false;
    tiengDung();
    if (coNav() && navigator.vibrate) try { navigator.vibrate(18); } catch (e) {}
    moKetQua(M().miengDuoiKim(q.mieng, ss.goc));
    return;
  }
  rafVong = requestAnimationFrame(khung);
}
function tach(v, now) {
  if (now - ss.tachLuc < 28) return;               // quá 35 tiếng mỗi giây thì nghe thành tiếng rè: bỏ bớt
  ss.tachLuc = now; ss.kim = Math.min(24, 9 + v * 0.9);
  tiengTach(v);
  if (coNav() && navigator.vibrate && v < 12) try { navigator.vibrate(4); } catch (e) {}
}

/* Kéo, vuốt bánh xe. Chạm nhẹ (không kéo) vào một miếng là chọn miếng đó. */
function chamCho(e) {
  const r = tam.querySelector('.ag-banh').getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  return { a: Math.atan2(dx, -dy), r: Math.hypot(dx, dy) * 350 / (r.width || 350) };
}
function chamXuong(e) {
  if (ss.quay || ss.keo) return;
  const c = chamCho(e);
  if (c.r < R_TRUC || c.r > R + 24) return;
  ss.keo = { id: e.pointerId, a: c.a, x: e.clientX, y: e.clientY, t0: e.timeStamp, di: 0, mau: [[e.timeStamp, ss.goc]],
             o: M().miengDuoiKim(M().cacMieng(ss.vong.map(x => x.w)), ss.goc) };
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch (loi) {}
}
function keoTay(e) {
  const k = ss.keo;
  if (!k || e.pointerId !== k.id) return;
  const c = chamCho(e);
  let d = c.a - k.a;
  if (d > Math.PI) d -= 2 * Math.PI;
  if (d < -Math.PI) d += 2 * Math.PI;
  k.a = c.a; k.di = Math.max(k.di, Math.hypot(e.clientX - k.x, e.clientY - k.y));
  if (k.di < 8) return;                            // chưa ra khỏi một cú chạm thì chưa xoay
  ss.goc += d; datGoc(ss.goc);
  k.mau.push([e.timeStamp, ss.goc]);
  if (k.mau.length > 12) k.mau.shift();
  const o = M().miengDuoiKim(M().cacMieng(ss.vong.map(x => x.w)), ss.goc);
  if (o !== k.o) { k.o = o; tach(3, e.timeStamp); }
}
function thaTay(e) {
  const k = ss.keo;
  if (!k || e.pointerId !== k.id) return;
  ss.keo = null;
  if (k.di < 8 && e.timeStamp - k.t0 < 500) {
    const c = chamCho(e);
    if (c.r >= R_TRUC && c.r <= R + 4) chonMieng(M().miengDuoiKim(M().cacMieng(ss.vong.map(x => x.w)), ss.goc - c.a));
    return;
  }
  const het = k.mau[k.mau.length - 1], dau = k.mau.find(m => m[0] >= het[0] - 100) || k.mau[0];
  const w = het[0] > dau[0] ? (het[1] - dau[1]) / ((het[0] - dau[0]) / 1000) : 0;
  if (Math.abs(w) >= 4 && e.timeStamp - het[0] < 80 && ss.vong.length > 1) {
    batDauQuay(M().cuVuot(w, ss.goc, ss.vong.map(x => x.w), Math.random, giamDong() ? M().MA_SAT_NHANH : M().MA_SAT));
  }
}
function huyKeo() { ss.keo = null; }

function chonMieng(i) {
  if (ss.quay || i < 0 || i >= ss.vong.length) return;
  ss.chon = ss.chon === i ? -1 : i;
  ss.kq = null;
  danhDau(); veChon();
}
function veChon() {
  if (!tam) return;
  const o = tam.querySelector('.ag-o-chon'), x = ss.vong[ss.chon];
  if (!x) { o.hidden = true; o.innerHTML = ''; return; }
  o.hidden = false;
  o.innerHTML = `<p><b>${esc(x.mon.ten)}</b>${x.mon.mota ? ' — ' + esc(x.mon.mota) : x.mon.rieng ? ' — món của bạn' : ''}</p>
    <div class="ag-o-nut">
      <button type="button" data-viec="bo-mieng">Bỏ khỏi vòng</button>
      ${ss.nhomVong ? '' : '<button type="button" data-viec="doi-mieng">Đổi món khác</button>'}
      <button type="button" data-viec="bo-chon" aria-label="Thôi">✕</button>
    </div>`;
}
function boMieng(i) {
  if (ss.vong.length <= 2) { bao('Vòng cần ít nhất hai món'); return false; }
  const [x] = ss.vong.splice(i, 1);
  ss.boDi.add(x.mon.id);
  ss.chon = -1; ss.kq = null; ss.daDung = true;
  veBanh(); veChon(); veGoi();
  return true;
}
function doiMieng(i) {
  const x = ss.vong[i];
  if (!x) return;
  const dangCo = ss.vong.map(v => v.mon.id);
  let moi = null;
  if (x.mon.rieng || cd.chiRieng) {
    const con = monCuaToi().filter(m => !dangCo.includes(m.id) && !ss.boDi.has(m.id));
    moi = con.length ? con[Math.floor(Math.random() * con.length)] : null;
  }
  if (!moi && !(cd.chiRieng && monCuaToi().length >= 2)) moi = M().monThay(M().NGOAI, dkNgoai(), dangCo);
  if (!moi) { bao('Hết món hợp lọc để đổi'); return; }
  ss.boDi.add(x.mon.id);
  ss.vong[i] = { mon: moi, w: x.w, tim: 0 };
  ss.daDung = true;
  veBanh(); veChon();
}

/* ---------- kết quả ---------- */

function moKetQua(i) {
  const x = ss.vong[i];
  if (!x || !tam) return;
  ss.kq = { chiSo: i, mon: x.mon, daChot: false };
  danhDau(); veKetQua();
  tam.querySelector('.ag-kq-nen').hidden = false;
  const k = tam.querySelector('.ag-kq');
  k.hidden = false;
  veGoi(`Ra ${x.mon.ten}.`);
  const nut = k.querySelector('.ag-nut-chinh');
  if (nut && nut.focus) try { nut.focus({ preventScroll: true }); } catch (e) {}
}
function veKetQua() {
  const k = tam.querySelector('.ag-kq'), kq = ss.kq;
  if (!kq) return;
  const m = kq.mon;
  const dau = ss.nhomVong ? 'Cả nhóm ăn' : ss.bua === 'K' ? 'Khuya nay ăn' : `${hoa(M().TEN_BUA[ss.bua])} nay ăn`;
  if (!kq.daChot) {
    const nhan = m.rieng ? ['Món của bạn'] : M().nhanMon(m, dkNgoai());
    k.innerHTML = `
      <p class="ag-kq-nhan">${esc(dau)}</p>
      <h3 class="ag-kq-ten" id="ag-kq-ten">${esc(m.ten)}</h3>
      ${m.mota ? `<p class="ag-kq-mo">${esc(m.mota)}</p>` : ''}
      ${nhan.length ? `<p class="ag-tag">${nhan.map(t => `<span>${esc(t)}</span>`).join('')}</p>` : ''}
      <button class="ag-nut-chinh" type="button" data-viec="chot">Chốt món này</button>
      <div class="ag-hai">
        <button class="ag-nut-phu" type="button" data-viec="quay-lai">Quay lại</button>
        ${ss.vong.length > 2 ? '<button class="ag-nut-phu" type="button" data-viec="bo-quay">Bỏ món, quay tiếp</button>' : ''}
      </div>
      <p class="ag-meo">Mới nghe tên đã thấy tiếc? Vậy là bụng đang thèm món khác rồi — quay lại cũng được.</p>`;
  } else {
    k.innerHTML = `
      <p class="ag-kq-nhan">Chốt rồi</p>
      <h3 class="ag-kq-ten" id="ag-kq-ten">${esc(m.ten)}</h3>
      <a class="ag-nut-chinh ag-lien" href="${esc(M().linkTimQuan(m.ten))}" target="_blank" rel="noopener">${ico('ghim')}Tìm quán gần đây</a>
      <div class="ag-hai">
        <button class="ag-nut-phu" type="button" data-viec="bao-nhom">${ico('gui')}Báo cả nhóm</button>
        <button class="ag-nut-phu" type="button" data-viec="xong-kq">Xong</button>
      </div>
      ${cd.ne ? '<p class="ag-meo">Hai hôm tới vòng quay sẽ né món này cho đổi vị.</p>' : ''}`;
  }
}
function anKetQua() {
  if (!tam) return;
  tam.querySelector('.ag-kq').hidden = true;
  tam.querySelector('.ag-kq-nen').hidden = true;
}
function dongKetQua() {
  ss.kq = null;
  anKetQua(); danhDau(); veGoi();
  const nut = tam.querySelector('.ag-quay');
  if (nut && nut.focus) try { nut.focus({ preventScroll: true }); } catch (e) {}
}
function chot() {
  const kq = ss.kq;
  if (!kq || kq.daChot) return;
  kq.daChot = true;
  cd.chot = M().gonChot([{ id: kq.mon.id, ten: kq.mon.ten, ngay: ss.ngay }].concat(cd.chot), ss.ngay);
  luuCD();
  veKetQua(); veBoiCanh(); tiengChot(); phaoGiay();
  veGoi(`Chốt ${kq.mon.ten}.`);
}
function phaoGiay() {
  if (giamDong() || typeof document === 'undefined') return;
  const k = tam.querySelector('.ag-kq'), hop = document.createElement('div');
  hop.className = 'ag-phao';
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('i'), a = Math.random() * Math.PI * 2, r = 60 + Math.random() * 110;
    if (s.style && s.style.setProperty) {
      s.style.setProperty('--x', (Math.cos(a) * r).toFixed(0) + 'px');
      s.style.setProperty('--y', (Math.sin(a) * r * 0.7 - 50).toFixed(0) + 'px');
      s.style.setProperty('--q', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      s.style.background = MAU[i % MAU.length];
      s.style.animationDelay = (Math.random() * 0.1).toFixed(2) + 's';
    }
    hop.appendChild(s);
  }
  k.appendChild(hop);
  setTimeout(() => { if (hop.remove) hop.remove(); }, 1500);
}

/* ---------- chia sẻ ---------- */

function linkTrang() {
  try { return location.origin + location.pathname.replace(/[^/]*$/, '') + 'hom-nay-an-gi/'; } catch (e) { return ''; }
}
/* Link CHỈ nằm ở url, chữ đi kèm không chứa link (Zalo, Tin nhắn dán ra hai link liền nhau — xem README). */
function chiaSe(chu) {
  const url = linkTrang();
  if (coNav() && navigator.share) { navigator.share({ title: 'Hôm nay ăn gì?', text: chu, url }).catch(() => {}); return; }
  chep(chu + (url ? '\n' + url : ''), 'Đã chép, dán vào nhóm chat nhé');
}
function chep(chu, loi) {
  const xong = () => bao(loi);
  if (coNav() && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(chu).then(xong, () => chepTay(chu, xong));
  else chepTay(chu, xong);
}
function chepTay(chu, xong) {
  try {
    const o = document.createElement('textarea');
    o.value = chu; o.style.position = 'fixed'; o.style.opacity = '0';
    document.body.appendChild(o); o.select();
    document.execCommand('copy'); document.body.removeChild(o); xong();
  } catch (e) { bao('Không chép được'); }
}
function baoNhom() {
  const m = ss.kq && ss.kq.mon;
  if (!m) return;
  chiaSe(`${ss.bua === 'K' ? 'Khuya nay' : hoa(M().TEN_BUA[ss.bua]) + ' nay'} ăn ${m.ten} nhé!`);
}
function chuMam() {
  const m = ss.mam;
  return `${M().LUC_NAU[ss.bua]} nấu: ${m.man.ten}, ${m.canh.ten}, ${m.rau.ten}.\nĐi chợ: ${M().diCho(m).join(', ')}.`;
}

/* ---------- nấu ở nhà: ba hàng như máy xèng ---------- */

const mucHtml = (m) => `<div class="ag-muc"><b>${m ? esc(m.ten) : '—'}</b>${m ? `<i>${m.phut} phút</i>` : ''}</div>`;
function lapMam(hoatCanh) {
  if (ss.quayMam) return;
  const khoa = {};
  for (const l of LOAI) if (ss.khoa[l] && ss.mam) khoa[l] = ss.mam[l];
  if (ss.mam && LOAI.every(l => khoa[l])) { bao('Cả ba món đang khoá — mở khoá một món để quay'); return; }
  const moi = M().chonMam(M().NHA, dkNha(), khoa, ss.mam || {});
  ss.daMua = new Set();
  if (hoatCanh && ss.mam && !giamDong()) quayCuon(moi);
  else { ss.mam = moi; veMam(); }
}
function veMam() {
  if (!tam) return;
  for (const l of LOAI) {
    const cot = tam.querySelector(`.ag-cot[data-loai="${l}"]`), dai = cot.querySelector('.ag-dai'), k = cot.querySelector('.ag-khoa');
    dai.innerHTML = mucHtml(ss.mam && ss.mam[l]);
    dai.style.transform = '';
    k.setAttribute('aria-pressed', ss.khoa[l] ? 'true' : 'false');
    k.setAttribute('aria-label', `${ss.khoa[l] ? 'Mở khoá' : 'Khoá'} ${M().LOAI_NHA[l].toLowerCase()}`);
    k.innerHTML = ico(ss.khoa[l] ? 'khoa' : 'mo');
    cot.classList.toggle('khoa', !!ss.khoa[l]);
  }
  const cap = ss.mam ? M().loiCap(ss.mam) : '', p = tam.querySelector('.ag-cap');
  p.hidden = !cap; p.textContent = cap;
  const lau = ss.mam ? Math.max(...LOAI.map(l => ss.mam[l].phut)) : 0;
  tam.querySelector('.ag-gio').textContent = lau ? `Nấu song song thì chừng ${lau} phút là xong.` : '';
}
function quayCuon(moi) {
  const dk = dkNha(), cuon = [];
  let thu = 0;
  for (const l of LOAI) {
    if (ss.khoa[l]) continue;
    const ds = M().NHA.filter(m => m.loai === l && M().hopNha(m, dk));
    const n = 10 + thu * 4, dai = [ss.mam[l]];
    for (let i = 0; i < n - 1; i++) dai.push(ds[Math.floor(Math.random() * ds.length)] || moi[l]);
    dai.push(moi[l]);
    const el = tam.querySelector(`.ag-cot[data-loai="${l}"] .ag-dai`);
    el.innerHTML = dai.map(mucHtml).join('');
    cuon.push({ el, n, lau: 0.9 + thu * 0.4, o: 0, xong: false });
    thu++;
  }
  const muc = tam.querySelector('.ag-muc');
  ss.quayMam = { cuon, moi, batDau: 0, H: (muc && muc.offsetHeight) || 64 };
  amThanh();
  const nut = tam.querySelector('.ag-quay-mam');
  if (nut) nut.disabled = true;
  if (!rafMam) rafMam = requestAnimationFrame(khungMam);
}
function khungMam(now) {
  rafMam = 0;
  const q = ss.quayMam;
  if (!q || !tam) return;
  if (!q.batDau) q.batDau = now;
  const t = (now - q.batDau) / 1000;
  let het = true;
  for (const c of q.cuon) {
    const u = Math.min(1, t / c.lau), e = 1 - Math.pow(1 - u, 3), vt = e * c.n;
    c.el.style.transform = `translateY(${(-vt * q.H).toFixed(1)}px)`;
    const o = Math.round(vt);
    if (o !== c.o) { c.o = o; if (u < 1) tiengCuon(); }
    if (u >= 1 && !c.xong) { c.xong = true; tiengKhop(); }
    if (u < 1) het = false;
  }
  if (het) {
    ss.mam = q.moi; ss.quayMam = null; veMam();
    const nut = tam.querySelector('.ag-quay-mam');
    if (nut) nut.disabled = false;
    veGoiNha(`Mâm: ${ss.mam.man.ten}, ${ss.mam.canh.ten}, ${ss.mam.rau.ten}.`);
    return;
  }
  rafMam = requestAnimationFrame(khungMam);
}
function veGoiNha(chu) { const g = tam && tam.querySelector('.ag-goi-nha'); if (g) g.textContent = chu; }

/* ---------- bảng: lọc, cả nhóm, đi chợ ---------- */

const loc = ['khong', 'chay', 'tui', 'troi', 'mien', 'ne', 'rieng', 'chiRieng', 'nhanh'];
const anhLoc = () => JSON.stringify([loc.map(k => cd[k]), ss.bua]);
function moBang(loai) {
  if (ss.quay || ss.quayMam) return;
  ss.bang = loai; ss.truocBang = anhLoc();
  veBang();
  tam.querySelector('.ag-bang-nen').hidden = false;
  const b = tam.querySelector('.ag-bang');
  b.hidden = false; b.scrollTop = 0;
}
function dongBang() {
  if (!ss.bang) return;
  const loai = ss.bang;
  ss.bang = '';
  tam.querySelector('.ag-bang').hidden = true;
  tam.querySelector('.ag-bang-nen').hidden = true;
  if (loai === 'loc') {
    luuCD();
    if (anhLoc() !== ss.truocBang) lamMoiCaHai();
    veBoiCanh();
  }
  if (loai === 'nhom' && ss.nhom && ss.nhom.buoc !== 'xong') ss.nhom = null;   // bỏ dở giữa chừng thì thôi
}
/* Vẽ lại cả bảng mỗi lần chạm (gọn hơn sửa từng nút), nhưng giữ chỗ cuộn và trả tiêu điểm về đúng nút vừa bấm — không
   thì người dùng bàn phím, trình đọc màn hình bị đá về đầu trang sau mỗi lần chọn. */
const dauNut = (el) => ['loc', 'gt', 'cong', 'viec', 'i'].map(k => (el.dataset && el.dataset[k]) || '').join('|');
/* Lọc, chay hôm nay áp cho cả hai thẻ: dựng lại thẻ đang mở, thẻ kia bỏ đi để lúc chuyển sang thì dựng mới. */
function lamMoiCaHai() {
  ss.khoa = { man: false, canh: false, rau: false };
  if (ss.tab === 'ngoai') { ss.daDung = true; lapVong(); ss.mam = null; }
  else { lapMam(false); ss.vong = []; ss.vongCu = null; ss.nhomVong = 0; }
}
function veBang() {
  const b = tam.querySelector('.ag-bang'), cuon = b.scrollTop;
  const dang = typeof document !== 'undefined' ? document.activeElement : null;
  const giu = dang && dang !== b && b.contains && b.contains(dang) && dang.tagName === 'BUTTON' ? dauNut(dang) : '';
  b.innerHTML = ss.bang === 'loc' ? htmlLoc() : ss.bang === 'nhom' ? htmlNhom() : ss.bang === 'cho' ? htmlCho() : '';
  b.scrollTop = cuon;
  if (giu) for (const n of b.querySelectorAll('button')) if (dauNut(n) === giu) { try { n.focus({ preventScroll: true }); } catch (e) {} break; }
}
const chip = (nhom, gt, ten, bat) => `<button type="button" data-loc="${nhom}" data-gt="${gt}" aria-pressed="${bat ? 'true' : 'false'}">${ten}</button>`;
const mucLoc = (ten, trong, lop = '') => `<div class="ag-muc-loc"><p>${ten}</p><div class="ag-chips ${lop}">${trong}</div></div>`;
const cong = (k, ten, bat) => `<button type="button" class="ag-cong" data-cong="${k}" aria-pressed="${bat ? 'true' : 'false'}"><span>${ten}</span><i aria-hidden="true"></i></button>`;
function htmlLoc() {
  const ngoai = ss.tab === 'ngoai';
  let h = `<h3>${ngoai ? 'Lọc món' : 'Lọc mâm cơm'}</h3>`;
  if (ngoai) h += mucLoc('Bữa', M().BUA.map(b => chip('bua', b, hoa(M().TEN_BUA[b]), ss.bua === b)).join(''));
  h += mucLoc('Không ăn', (ngoai ? Object.keys(TEN_KHONG) : ['b', 'h', 'g', 'v', 'c', 's'])
    .map(k => chip('khong', k, TEN_KHONG[k], cd.khong.includes(k))).join(''), 'ag-khong');
  if (ngoai) {
    h += mucLoc('Túi tiền' + (new Date().getDate() >= 25 ? ' <i>— cuối tháng rồi nhỉ</i>' : ''),
      [[1, 'Dưới 40k'], [2, 'Dưới 80k'], [3, 'Thoải mái']].map(([g, t]) => chip('tui', g, t, cd.tui === g)).join(''));
    const n = noiO(), tu = n ? (ss.troiTu ? `Tự đoán: ${TEN_TROI[ss.troiTu.loai] || 'dễ chịu'} ${ss.troiTu.nhiet}°` : 'Tự đoán theo nơi ở') : '';
    h += mucLoc('Trời lúc này',
      (tu ? chip('troi', 'tu', esc(tu), cd.troi === 'tu') : '') +
      [['mua', 'Mưa'], ['nong', 'Nắng nóng'], ['lanh', 'Lạnh'], ['thuong', 'Bình thường']]
        .map(([g, t]) => chip('troi', g, t, cd.troi === g || (!tu && cd.troi === 'tu' && g === 'thuong'))).join('') +
      (n ? '' : `<button type="button" class="ag-lay-vt" data-viec="lay-vt">${ico('ghim')}Lấy thời tiết chỗ tôi</button>`));
    const doan = cd.mien === 'tu' ? mienNay() : '';
    h += mucLoc('Bạn ở' + (doan ? ' <i>— đoán theo nơi ở</i>' : ''),
      [['B', 'Miền Bắc'], ['T', 'Miền Trung'], ['N', 'Miền Nam'], ['khong', 'Đâu cũng được']]
        .map(([g, t]) => chip('mien', g, t, cd.mien === g || (cd.mien === 'tu' && (doan ? doan === g : g === 'khong')))).join(''));
  }
  h += `<div class="ag-cac-cong">${cong('chay', 'Tôi ăn chay', cd.chay)}${ngoai
    ? cong('ne', 'Né món đã chốt hai hôm nay', cd.ne) : cong('nhanh', 'Nấu nhanh: mỗi món không quá 30 phút', cd.nhanh)}</div>`;
  if (ngoai) {
    const gd = M().monGanDay(cd.chot, ss.ngay);
    if (gd.size) {
      const khi = (c) => (c === 0 ? 'hôm nay' : c === 1 ? 'hôm qua' : 'hôm kia');
      h += `<p class="ag-ghi">Đã chốt: ${[...gd].map(([id, c]) => `${esc(tenMon(id))} (${khi(c)})`).join(', ')}.
        <button type="button" class="ag-chu-nut" data-viec="xoa-chot">Xoá</button></p>`;
    }
    h += `<div class="ag-muc-loc"><p>Món của tôi <i>— quán quen, món gần chỗ làm</i></p>
      <div class="ag-them"><input class="ag-o-them" type="text" maxlength="40" placeholder="Ví dụ: Cơm gà cô Ba" autocomplete="off" enterkeyhint="done" aria-label="Tên món hay quán">
        <button type="button" data-viec="them-rieng">Thêm</button></div>
      ${cd.rieng.length ? `<div class="ag-chips ag-rieng">${cd.rieng.map((t, i) => `<button type="button" data-viec="xoa-rieng" data-i="${i}" aria-label="Bỏ ${esc(t)}">${esc(t)} <span aria-hidden="true">✕</span></button>`).join('')}</div>` : ''}
      ${cd.rieng.length >= 2 ? cong('chiRieng', 'Chỉ quay món của tôi', cd.chiRieng)
        : `<p class="ag-ghi">Món của bạn lên vòng mỗi lượt hai món. Có từ hai món trở lên thì quay riêng được.</p>`}
    </div>`;
  }
  return h + '<button class="ag-nut-chinh" type="button" data-viec="dong-bang">Xong</button>';
}
function bamLoc(nhom, gt) {
  if (nhom === 'bua') ss.bua = gt;
  else if (nhom === 'khong') { const i = cd.khong.indexOf(gt); if (i >= 0) cd.khong.splice(i, 1); else cd.khong.push(gt); }
  else if (nhom === 'tui') cd.tui = +gt;
  else if (nhom === 'troi') cd.troi = gt;
  else if (nhom === 'mien') cd.mien = gt;
  veBang();
}
function batCong(k) { cd[k] = !cd[k]; veBang(); }
function themRieng() {
  const o = tam.querySelector('.ag-o-them'), t = o ? String(o.value || '').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
  if (!t) return;
  if (cd.rieng.some(x => x.toLowerCase() === t.toLowerCase())) { bao('Món này có rồi'); return; }
  if (cd.rieng.length >= 30) { bao('Tối đa 30 món của bạn'); return; }
  cd.rieng.push(t); luuCD(); veBang();
  const o2 = tam.querySelector('.ag-o-them');
  if (o2 && o2.focus) try { o2.focus(); } catch (e) {}
}

/* Cả nhóm: chuyền máy, mỗi người một lượt. */
function moNhom() {
  const mon = (ss.vongCu || ss.vong).map(x => x.mon);
  if (mon.length < 3) { bao('Vòng cần ít nhất ba món để cả nhóm chọn'); return; }
  ss.nhom = { so: cd.soNguoi, luot: 0, phieu: [], mon, buoc: 'dat' };
  moBang('nhom');
}
function htmlNhom() {
  const n = ss.nhom;
  if (!n) return '';
  if (n.buoc === 'dat') return `<h3>Cả nhóm cùng chọn</h3>
    <p class="ag-loi">Chuyền máy lần lượt cho từng người. Mỗi người thả ${TIM} vào món mình thèm, gạch ✕ món không muốn ăn
      (tối đa hai món). Không ai thấy người khác chọn gì.</p>
    <p class="ag-loi">Món bị ai gạch thì loại. Món còn lại lên vòng quay, món nhiều ${TIM} thì miếng to hơn — để vòng
      quay quyết, không ai phải mang tiếng chọn dở.</p>
    <div class="ag-dem"><span>Mấy người?</span>
      <button type="button" data-viec="bot-nguoi" aria-label="Bớt một người">−</button><b>${n.so}</b>
      <button type="button" data-viec="them-nguoi" aria-label="Thêm một người">+</button></div>
    <button class="ag-nut-chinh" type="button" data-viec="bat-dau-nhom">Bắt đầu</button>`;
  if (n.buoc === 'bau') {
    const p = n.phieu[n.luot];
    return `<h3>Người thứ ${n.luot + 1} / ${n.so}</h3>
      <p class="ag-loi ag-giua">${TIM} món thèm · ✕ món không muốn (tối đa hai)</p>
      <div class="ag-phieu">${n.mon.map((m, i) => `
        <div class="ag-pm${p.khong.includes(i) ? ' bi-gach' : ''}${p.tim.includes(i) ? ' co-tim' : ''}"><b>${esc(m.ten)}</b>
          <span><button type="button" class="ag-tim" data-viec="tim" data-i="${i}" aria-pressed="${p.tim.includes(i)}" aria-label="Thèm ${esc(m.ten)}">${TIM}</button><button type="button" class="ag-gach" data-viec="gach" data-i="${i}" aria-pressed="${p.khong.includes(i)}" aria-label="Không muốn ${esc(m.ten)}">✕</button></span></div>`).join('')}</div>
      <button class="ag-nut-chinh" type="button" data-viec="xong-luot">${n.luot + 1 < n.so ? 'Xong, chuyền máy' : 'Xong, xem kết quả'}</button>`;
  }
  if (n.buoc === 'chuyen') return `<div class="ag-chuyen">
      <p class="ag-chuyen-so">${n.luot + 2}</p>
      <h3>Đưa máy cho người thứ ${n.luot + 2}</h3>
      <p class="ag-loi ag-giua">Người vừa chọn xong đừng nhìn nhé.</p>
      <button class="ag-nut-chinh" type="button" data-viec="nhan-may">Tôi là người thứ ${n.luot + 2}</button></div>`;
  const g = M().gopPhieu(n.mon.length, n.phieu), con = new Set(g.con);
  const thu = [...n.mon.keys()].sort((a, b) => (con.has(b) - con.has(a)) || (g.tim[b] - g.tim[a]) || (g.khong[a] - g.khong[b]));
  const loi = g.con.length === 1 ? `Chỉ còn ${esc(n.mon[g.con[0]].ten)} là ai cũng chịu.`
    : g.hetSach ? `Món nào cũng có người gạch, nên giữ ${g.con.length} món bị gạch ít nhất.`
    : `Còn ${g.con.length} món. Món nhiều ${TIM} thì miếng to hơn — quay cho công bằng.`;
  return `<h3>Kết quả của nhóm</h3>
    <ul class="ag-tong">${thu.map(i => `<li class="${con.has(i) ? '' : 'loai'}"><b>${esc(n.mon[i].ten)}</b>
      <span>${g.tim[i] ? `${TIM} ${g.tim[i]}` : ''}${g.khong[i] ? ` ✕ ${g.khong[i]}` : ''}${con.has(i) ? '' : ' · loại'}</span></li>`).join('')}</ul>
    <p class="ag-loi ag-giua">${loi}</p>
    ${g.con.length === 1 ? '<button class="ag-nut-chinh" type="button" data-viec="nhom-chot">Chốt món này</button>'
      : '<button class="ag-nut-chinh" type="button" data-viec="nhom-quay">Quay vòng của nhóm</button>'}`;
}
function bamPhieu(viec, i) {
  const p = ss.nhom.phieu[ss.nhom.luot], tim = p.tim.indexOf(i), khong = p.khong.indexOf(i);
  if (viec === 'tim') { if (tim >= 0) p.tim.splice(tim, 1); else { p.tim.push(i); if (khong >= 0) p.khong.splice(khong, 1); } }
  else if (khong >= 0) p.khong.splice(khong, 1);
  else if (p.khong.length >= 2) { bao('Mỗi người gạch tối đa hai món'); return; }
  else { p.khong.push(i); if (tim >= 0) p.tim.splice(tim, 1); }
  veBang();
}
function vongNhom(quayLuon) {
  const n = ss.nhom, g = M().gopPhieu(n.mon.length, n.phieu);
  if (!ss.nhomVong) ss.vongCu = ss.vong;
  ss.vong = g.con.map((i, k) => ({ mon: n.mon[i], w: g.trongSo[k], tim: g.tim[i] }));
  ss.nhomVong = n.so; n.buoc = 'xong'; ss.chon = -1; ss.kq = null; ss.daDung = true;
  dongBang();
  veBanh(); veChon(); veNhomDau(); veGoi();
  if (ss.vong.length === 1) moKetQua(0);
  else if (quayLuon) setTimeout(() => { if (tam && tam.classList.contains('hien') && !ss.quay && ss.nhomVong) quayNut(); }, 450);
}
function veNhomDau() {
  if (!tam) return;
  const d = tam.querySelector('.ag-nhom-dau');
  d.hidden = !ss.nhomVong;
  d.innerHTML = ss.nhomVong ? `Vòng của nhóm ${ss.nhomVong} người · miếng to là món nhiều ${TIM}
    <button type="button" class="ag-chu-nut" data-viec="ve-vong-thuong">Về vòng thường</button>` : '';
}

function htmlCho() {
  const ds = ss.mam ? M().diCho(ss.mam) : [];
  return `<h3>Đi chợ</h3>
    <p class="ag-loi ag-giua">${esc(LOAI.map(l => ss.mam[l].ten).join(' · '))}</p>
    <ul class="ag-cho">${ds.map((t, i) => `<li><label><input type="checkbox" data-cho="${i}"${ss.daMua.has(t) ? ' checked' : ''}><span>${esc(t)}</span></label></li>`).join('')}</ul>
    <p class="ag-ghi">Không ghi gia vị nhà nào cũng có: nước mắm, muối, đường, dầu ăn, tiêu.</p>
    <div class="ag-hai">
      <button class="ag-nut-phu" type="button" data-viec="chep-cho">Chép danh sách</button>
      <button class="ag-nut-phu" type="button" data-viec="gui-mam">${ico('gui')}Gửi cả nhà</button>
    </div>
    <button class="ag-nut-chinh" type="button" data-viec="dong-bang">Xong</button>`;
}

/* ---------- vẽ phần chung ---------- */

function veBoiCanh() {
  if (!tam) return;
  tam.querySelector('.ag-tieude').textContent = M().cauHoi(ss.bua, ss.tab);
  const phan = [];
  if (ss.tab === 'ngoai') {
    phan.push(M().NHAN_BUA[ss.bua]);
    const t = troiNay(), tu = cd.troi === 'tu' && ss.troiTu;
    if (t) phan.push(TEN_TROI[t] + (tu ? ` ${ss.troiTu.nhiet}°` : ''));
    else if (tu) phan.push(`${ss.troiTu.nhiet}°`);
    if (cd.tui < 3) phan.push(cd.tui === 1 ? 'dưới 40k' : 'dưới 80k');
  } else {
    phan.push('Mâm ba món');
    if (cd.nhanh) phan.push('nấu nhanh');
  }
  if (cd.chay || ss.chayHom) phan.push('món chay');
  const khong = cd.khong.filter(k => ss.tab === 'ngoai' || k.length === 1).map(k => TEN_KHONG[k].toLowerCase());
  if (khong.length) phan.push('không ' + khong.slice(0, 3).join(', ') + (khong.length > 3 ? '…' : ''));
  if (ss.tab === 'ngoai') { const g = [...ganDay().keys()]; if (g.length) phan.push('né ' + tenMon(g[0]) + (g.length > 1 ? '…' : '')); }
  tam.querySelector('.ag-bc').innerHTML = `${esc(phan.join(' · '))} · <b>Lọc ›</b>`;
  const r = tam.querySelector('.ag-ram');
  if (ss.ram && !cd.chay) {
    r.hidden = false;
    r.innerHTML = `${esc(ss.ram.ten)} âm lịch, nhiều nhà ăn chay.
      <button type="button" data-viec="chay-hom" aria-pressed="${ss.chayHom ? 'true' : 'false'}">${ss.chayHom ? 'Thôi, món thường' : 'Quay món chay'}</button>`;
  } else { r.hidden = true; r.innerHTML = ''; }
}
function veGoi(chu) {
  if (!tam) return;
  const g = tam.querySelector('.ag-goi');
  if (chu !== undefined) { g.textContent = chu; return; }
  let s = '';
  if (ss.noi.length) s += `Lọc chặt quá nên đã ${ss.noi.map(x => x.loi).join(', ')}. `;
  if (!ss.nhomVong && !cd.chiRieng && ss.du < 8) s += `Lúc này chỉ có ${ss.du} món hợp lọc. `;
  if (!cd.daQuay) s += 'Chạm QUAY hay vuốt mạnh vòng tròn. Chạm một món để bỏ hay đổi.';
  g.textContent = s.trim();
}
function apTab() {
  for (const b of tam.querySelectorAll('.ag-the button')) b.setAttribute('aria-selected', b.dataset.tab === ss.tab ? 'true' : 'false');
  tam.querySelector('.ag-ngoai').hidden = ss.tab !== 'ngoai';
  tam.querySelector('.ag-nha').hidden = ss.tab !== 'nha';
}
function doiTab(t) {
  if (t === ss.tab || ss.quay || ss.quayMam) return;
  ss.tab = cd.tab = t; luuCD();
  apTab();
  if (t === 'nha' && !ss.mam) lapMam(false);
  if (t === 'ngoai' && !ss.vong.length) lapVong();
  veBoiCanh();
}
function veTieng() {
  const b = tam.querySelector('.ag-tieng');
  b.innerHTML = ico(cd.tieng ? 'tieng' : 'tat');
  b.setAttribute('aria-pressed', cd.tieng ? 'true' : 'false');
  b.setAttribute('aria-label', cd.tieng ? 'Tắt tiếng' : 'Bật tiếng');
}
function bao(chu) {
  if (!tam) return;
  const b = tam.querySelector('.ag-bao');
  b.textContent = chu; b.hidden = false;
  clearTimeout(henBao); henBao = setTimeout(() => { b.hidden = true; }, 2400);
}

/* ---------- âm thanh (Web Audio, không tải tệp) ---------- */

function amThanh() {
  if (!cd.tieng) return null;
  try {
    if (!am) { const AC = self.AudioContext || self.webkitAudioContext; if (!AC) return null; am = new AC(); }
    if (am.state === 'suspended') am.resume();
    return am;
  } catch (e) { return null; }
}
function not(f, luc, lau, to, kieu = 'sine') {
  const o = am.createOscillator(), v = am.createGain();
  o.type = kieu; o.frequency.value = f;
  v.gain.setValueAtTime(0, luc); v.gain.linearRampToValueAtTime(to, luc + 0.003); v.gain.exponentialRampToValueAtTime(0.0001, luc + lau);
  o.connect(v); v.connect(am.destination); o.start(luc); o.stop(luc + lau + 0.05);
}
function tiengTach(v) {                            // lá gảy chạm chốt: tiếng tách gỗ, nhanh thì to hơn chút
  if (!amThanh()) return;
  const t = am.currentTime + 0.004, to = 0.028 + Math.min(0.04, v * 0.0025);
  not(1750, t, 0.022, to, 'triangle'); not(3500, t, 0.009, to * 0.45);
}
function tiengDung() { if (!amThanh()) return; const t = am.currentTime + 0.02; not(659.25, t, 0.22, 0.06); not(987.77, t + 0.12, 0.38, 0.06); }
function tiengChot() { if (!amThanh()) return; const t = am.currentTime + 0.02; [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => not(f, t + i * 0.09, 0.45, 0.07, 'triangle')); }
function tiengCuon() { if (amThanh()) not(950, am.currentTime + 0.004, 0.02, 0.03, 'triangle'); }
function tiengKhop() { if (!amThanh()) return; const t = am.currentTime + 0.01; not(220, t, 0.1, 0.09, 'triangle'); not(440, t, 0.05, 0.03); }
function doiTieng() {
  cd.tieng = !cd.tieng; luuCD(); veTieng();
  if (!cd.tieng && am && am.state === 'running') am.suspend();
  if (cd.tieng) tiengTach(4);
}

/* ---------- bấm ---------- */

function bam(e) {
  const t = e.target && e.target.closest ? e.target.closest('button, [data-viec], a') : null;
  if (t && tam.contains(t) && t.tagName !== 'A') lam(t);
}
function lam(t) {
  const ds = t.dataset || {};
  if (t.classList.contains('ag-dong')) { dong(); return; }
  if (t.classList.contains('ag-tieng')) { doiTieng(); return; }
  if (t.classList.contains('ag-quay')) { quayNut(); return; }
  if (t.classList.contains('ag-bc')) { moBang('loc'); return; }
  if (ds.tab) { doiTab(ds.tab); return; }
  if (ds.loc) { bamLoc(ds.loc, ds.gt); return; }
  if (ds.cong) { batCong(ds.cong); return; }
  if (ds.loai && (t.classList.contains('ag-khoa') || ds.viec === 'khoa-o')) {   // ổ khoá, hay chạm thẳng vào ô món
    if (!ss.quayMam && ss.mam) { ss.khoa[ds.loai] = !ss.khoa[ds.loai]; veMam(); }
    return;
  }
  const i = +ds.i;
  switch (ds.viec) {
    case 'doi-bo': if (!ss.quay) { const cu = new Set(ss.vong.map(x => x.mon.id)); ss.daDung = true; lapVong(cu); } break;
    case 'loc': moBang('loc'); break;
    case 'nhom': if (!ss.quay) moNhom(); break;
    case 'bo-mieng': if (ss.chon >= 0) boMieng(ss.chon); break;
    case 'doi-mieng': if (ss.chon >= 0) doiMieng(ss.chon); break;
    case 'bo-chon': ss.chon = -1; danhDau(); veChon(); break;
    case 'chot': chot(); break;
    case 'quay-lai': dongKetQua(); break;
    case 'bo-quay': { const k = ss.kq && ss.kq.chiSo; dongKetQua(); if (k != null && boMieng(k)) quayNut(); break; }
    case 'bao-nhom': baoNhom(); break;
    case 'xong-kq': case 'dong-kq': dongKetQua(); break;
    case 'dong-bang': dongBang(); break;
    case 'chay-hom': ss.chayHom = !ss.chayHom; ss.boDi = new Set(); lamMoiCaHai(); veBoiCanh(); break;
    case 'lay-vt': layViTri(); break;
    case 'xoa-chot': cd.chot = []; luuCD(); veBang(); break;
    case 'them-rieng': themRieng(); break;
    case 'xoa-rieng': if (i >= 0) { cd.rieng.splice(i, 1); if (cd.rieng.length < 2) cd.chiRieng = false; luuCD(); veBang(); } break;
    case 'bot-nguoi': ss.nhom.so = Math.max(2, ss.nhom.so - 1); veBang(); break;
    case 'them-nguoi': ss.nhom.so = Math.min(12, ss.nhom.so + 1); veBang(); break;
    case 'bat-dau-nhom':
      cd.soNguoi = ss.nhom.so; luuCD();
      ss.nhom.phieu = Array.from({ length: ss.nhom.so }, () => ({ tim: [], khong: [] }));
      ss.nhom.luot = 0; ss.nhom.buoc = 'bau'; veBang(); break;
    case 'tim': case 'gach': bamPhieu(ds.viec, i); break;
    case 'xong-luot': ss.nhom.buoc = ss.nhom.luot + 1 < ss.nhom.so ? 'chuyen' : 'kq'; veBang(); tam.querySelector('.ag-bang').scrollTop = 0; break;
    case 'nhan-may': ss.nhom.luot++; ss.nhom.buoc = 'bau'; veBang(); break;
    case 'nhom-quay': vongNhom(true); break;
    case 'nhom-chot': vongNhom(false); break;
    case 've-vong-thuong':
      if (ss.vongCu) ss.vong = ss.vongCu;
      ss.vongCu = null; ss.nhomVong = 0; ss.chon = -1; ss.kq = null;
      veBanh(); veChon(); veNhomDau(); veGoi(); break;
    case 'quay-mam': lapMam(true); break;
    case 'cho': if (ss.mam) moBang('cho'); break;
    case 'gui-mam': if (ss.mam) chiaSe(chuMam()); break;
    case 'chep-cho': if (ss.mam) chep(chuMam(), 'Đã chép danh sách đi chợ'); break;
    default: break;
  }
}

/* ---------- khung ---------- */

function dungKhung() {
  if (tam) return;
  tam = document.createElement('div');
  tam.className = 'angi';
  tam.innerHTML = `
    <button class="ag-dong" type="button" aria-label="Đóng">✕</button>
    <button class="ag-tieng" type="button" aria-label="Tắt tiếng"></button>
    <div class="ag-trong">
      <h2 class="ag-tieude">Hôm nay ăn gì?</h2>
      <div class="ag-the" role="tablist" aria-label="Ăn ở đâu">
        <button type="button" role="tab" data-tab="ngoai">Ăn ngoài · gọi về</button>
        <button type="button" role="tab" data-tab="nha">Nấu ở nhà</button>
      </div>
      <button class="ag-bc" type="button" aria-label="Mở bảng lọc"></button>
      <p class="ag-ram" hidden></p>
      <section class="ag-ngoai" aria-label="Vòng quay món ăn">
        <p class="ag-nhom-dau" hidden></p>
        <div class="ag-vong" role="img" aria-label="Vòng quay">
          <svg class="ag-banh" viewBox="-175 -175 350 350"></svg>
          <button class="ag-quay" type="button" aria-label="Quay vòng">QUAY</button>
        </div>
        <p class="ag-goi" aria-live="polite"></p>
        <div class="ag-o-chon" hidden></div>
        <div class="ag-hang">
          <button type="button" data-viec="doi-bo">${ico('doi')}Đổi bộ khác</button>
          <button type="button" data-viec="loc">${ico('loc')}Lọc</button>
          <button type="button" data-viec="nhom">${ico('nhom')}Cả nhóm</button>
        </div>
      </section>
      <section class="ag-nha" aria-label="Mâm cơm nấu ở nhà" hidden>
        <div class="ag-mam">${LOAI.map(l => `
          <div class="ag-cot" data-loai="${l}">
            <p class="ag-cot-ten">${M().LOAI_NHA[l]}</p>
            <div class="ag-o" data-viec="khoa-o" data-loai="${l}"><div class="ag-dai"></div></div>
            <button class="ag-khoa" type="button" data-loai="${l}" aria-pressed="false"></button>
          </div>`).join('')}
        </div>
        <p class="ag-cap" hidden></p>
        <p class="ag-gio"></p>
        <button class="ag-nut-chinh ag-quay-mam" type="button" data-viec="quay-mam">Quay mâm khác</button>
        <p class="ag-goi-nha ag-an" aria-live="polite"></p>
        <div class="ag-hang">
          <button type="button" data-viec="cho">${ico('cho')}Đi chợ</button>
          <button type="button" data-viec="gui-mam">${ico('gui')}Gửi cả nhà</button>
          <button type="button" data-viec="loc">${ico('loc')}Lọc</button>
        </div>
        <p class="ag-ghi ag-giua">Bấm ổ khoá để giữ món ưng ý, quay lại phần còn lại.</p>
      </section>
    </div>
    <div class="ag-kq-nen" data-viec="dong-kq" hidden></div>
    <div class="ag-kq" role="dialog" aria-modal="true" aria-labelledby="ag-kq-ten" hidden></div>
    <div class="ag-bang-nen" data-viec="dong-bang" hidden></div>
    <div class="ag-bang" role="dialog" aria-modal="true" aria-label="Bảng chọn" hidden></div>
    <p class="ag-bao" role="status" hidden></p>`;
  document.body.appendChild(tam);
  tam.addEventListener('click', bam);
  const svg = tam.querySelector('.ag-banh');
  svg.addEventListener('pointerdown', chamXuong);
  svg.addEventListener('pointermove', keoTay);
  svg.addEventListener('pointerup', thaTay);
  svg.addEventListener('pointercancel', huyKeo);
  const bang = tam.querySelector('.ag-bang');
  bang.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target && e.target.classList && e.target.classList.contains('ag-o-them')) { e.preventDefault(); themRieng(); }
  });
  bang.addEventListener('change', e => {
    const o = e.target, i = o && o.dataset ? +o.dataset.cho : NaN;
    if (!ss.mam || isNaN(i)) return;
    const t = M().diCho(ss.mam)[i];
    if (o.checked) ss.daMua.add(t); else ss.daMua.delete(t);
  });
}

function mo() {
  dungKhung();
  document.body.classList.add('khoa-cuon');
  tam.classList.add('hien');
  cd = docCD();
  const nay = new Date(), ngay = M().ngayCua(nay), bua = M().buaLuc(nay);
  if (ngay !== ss.ngay || bua !== ss.bua0) {          // sang bữa khác, ngày khác: vòng mới, mâm mới
    ss.bua = ss.bua0 = bua; ss.chayHom = false; ss.boDi = new Set(); ss.vong = []; ss.vongCu = null; ss.nhomVong = 0;
    ss.mam = null; ss.khoa = { man: false, canh: false, rau: false }; ss.daDung = false;
  }
  ss.ngay = ngay;
  ss.ram = M().ngayChay(nay.getDate(), nay.getMonth() + 1, nay.getFullYear(), self.TDTD_LICH);
  cd.chot = M().gonChot(cd.chot, ngay);
  ss.tab = cd.tab; ss.kq = null; ss.chon = -1; ss.bang = ''; ss.nhom = null;
  anKetQua();
  tam.querySelector('.ag-bang').hidden = true; tam.querySelector('.ag-bang-nen').hidden = true;
  const nut = tam.querySelector('.ag-quay'), nutMam = tam.querySelector('.ag-quay-mam');
  if (nut) nut.disabled = false;
  if (nutMam) nutMam.disabled = false;
  apTab(); veTieng();
  if (!ss.vong.length) lapVong(); else { veBanh(); veChon(); veNhomDau(); veGoi(); }
  if (ss.tab === 'nha' || ss.mam) { if (!ss.mam) lapMam(false); else veMam(); }
  veBoiCanh();
  layThoiTiet();
}

function dong() {
  if (rafVong) { cancelAnimationFrame(rafVong); rafVong = 0; }
  if (rafMam) { cancelAnimationFrame(rafMam); rafMam = 0; }
  if (ss.quay) { ss.goc = M().quyGoc(ss.quay.cu.gocCuoi); ss.quay = null; }
  if (ss.quayMam) { ss.mam = ss.quayMam.moi; ss.quayMam = null; }
  ss.keo = null;
  if (am && am.state === 'running') am.suspend();
  if (tam) tam.classList.remove('hien');
  document.body.classList.remove('khoa-cuon');
}

addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !tam || !tam.classList.contains('hien')) return;
  if (ss.bang) dongBang();
  else if (!tam.querySelector('.ag-kq').hidden) dongKetQua();
  else dong();
});

self.TDTD_ANGI = {
  mo, dong,
  _ss: () => ss, _cd: () => cd,
  _lapVong: (tranh) => lapVong(tranh), _quay: (cu) => batDauQuay(cu), _khung: (t) => khung(t), _khungMam: (t) => khungMam(t),
  _quayNut: () => quayNut(), _chonMieng: (i) => chonMieng(i), _boMieng: (i) => boMieng(i), _doiMieng: (i) => doiMieng(i),
  _chot: () => chot(), _dongKetQua: () => dongKetQua(), _lapMam: (h) => lapMam(h), _doiTab: (t) => doiTab(t),
  _moBang: (l) => moBang(l), _dongBang: () => dongBang(), _bamLoc: (n, g) => bamLoc(n, g), _batCong: (k) => batCong(k),
  _moNhom: () => moNhom(),
  _lam: (viec, them) => lam({ dataset: { viec, ...(them || {}) }, classList: { contains: () => false }, tagName: 'BUTTON' }),
  _chuMam: () => chuMam(), _veKetQua: () => veKetQua(),
};
})();
