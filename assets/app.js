/* Thông Điệp Của Thượng Đế — mỗi ngày một lá, không lưu lại gì. */
(() => {
'use strict';

const { ymd, cardFor, newSeed } = self.TDTD;
/* ─────────────────────────────────────────────────────────────
   BẦU TRỜI SAO
   Mỗi ngôi sao là một trò nhỏ nằm rải trên nền. Thêm sao mới chỉ cần
   thêm một dòng vào mảng SAO bên dưới:
       { id, mau, nhan, hinh?, mo }
     id   : định danh duy nhất, dùng làm id của nút
     mau  : màu ngôi sao (bất kỳ mã màu CSS nào)
     nhan : mô tả cho trình đọc màn hình, không hiện thành chữ
     hinh : 'sao5' | 'lap-lanh' | 'sao4' | 'hoa' | chuỗi path SVG riêng
     mo   : hàm chạy khi bấm vào
     tieuDe, trang (không bắt buộc): tên riêng của trò, và trang riêng mang tên đó để chia sẻ link — xem linkTro()
     tenApp (trò có trang thì phải có): tên dưới biểu tượng khi cài app từ trò này — ngắn, dưới biểu tượng iPhone chỉ
       hiện chừng 12 chữ; xem datTenGoiY(), scripts/lam-ke-khai.py
     nutCai (không bắt buộc): trò có nút "Cài app" riêng — người vào thẳng từ link không thấy trang chính; xem themNutCaiApp()
   Bỏ một ngôi sao thì xoá dòng của nó, hoặc thêm bat: false.
   Các sao tự rải ngẫu nhiên, không bao giờ đè lên nhau, cũng không đè chữ.
   ───────────────────────────────────────────────────────────── */
const HINH_SAO = {
  sao5:      'M12 2.6l2.5 6.3 6.8.4-5.2 4.3 1.7 6.6L12 16.6 6.2 20.2l1.7-6.6-5.2-4.3 6.8-.4z',
  'lap-lanh':'M12 1.8l1.6 6.1 6.1 1.6-6.1 1.6L12 17.2l-1.6-6.1L4.3 9.5l6.1-1.6zM19.4 15.2l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7z',
  sao4:      'M12 1.5c.7 4.6 2.4 7.3 8.5 10.5-6.1 3.2-7.8 5.9-8.5 10.5-.7-4.6-2.4-7.3-8.5-10.5C9.6 8.8 11.3 6.1 12 1.5z',
  hoa:       'M12 2.4a3.4 3.4 0 013.3 4.2 3.4 3.4 0 012.1 5.4 3.4 3.4 0 01-2.1 5.4A3.4 3.4 0 0112 21.6a3.4 3.4 0 01-3.3-4.2 3.4 3.4 0 01-2.1-5.4 3.4 3.4 0 012.1-5.4A3.4 3.4 0 0112 2.4zm0 6a3.6 3.6 0 100 7.2 3.6 3.6 0 000-7.2z',
  tia:       'M12 1l1.9 7.2 5.4-4-4 5.4L22.5 12l-7.2 1.9 4 5.4-5.4-4L12 22.5l-1.9-7.2-5.4 4 4-5.4L1.5 12l7.2-1.9-4-5.4 5.4 4z',
  giot:      'M12 2.2c3.6 4.6 6.4 8.1 6.4 11.4A6.4 6.4 0 1 1 5.6 13.6c0-3.3 2.8-6.8 6.4-11.4z',
  sao6:      'M12 1.6l2.2 5.4 5.8-1.2-3.6 4.6 3.6 4.6-5.8-1.2-2.2 5.4-2.2-5.4-5.8 1.2 3.6-4.6-3.6-4.6 5.8 1.2z',
  trang:     'M15.2 2.6A9.6 9.6 0 1 0 21.4 15.4 7.8 7.8 0 0 1 15.2 2.6z',
  sao8:      'M12 1.4L13.76 7.75L19.5 4.5L16.25 10.24L22.6 12L16.25 13.76L19.5 19.5L13.76 16.25L12 22.6L10.24 16.25L4.5 19.5L7.75 13.76L1.4 12L7.75 10.24L4.5 4.5L10.24 7.75z',
  khoi:      'M12 1.8l8.6 4.9v10.6L12 22.2l-8.6-4.9V6.7zM12 4.1L5.6 7.7 12 11.4l6.4-3.7z',
  thung:     'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zM12 6.8l-1.41 3.66-3.92.21 3.05 2.47-1.01 3.79L12 14.8l3.29 2.13-1.01-3.79 3.05-2.47-3.92-.21z',
  coba:      'M12 12.7L5.5 16.5L7.7 20.2L16.3 20.2L18.4 16.5zM12.6 11.6L19.1 15.4L21.2 11.6L16.9 4.2L12.6 4.2zM11.4 11.6L11.4 4.2L7.1 4.2L2.8 11.6L4.9 15.4z',
  sen:       'M12 3.2c1.9 2.3 2.9 4.7 2.9 7.2 0 2.6-1 4.8-2.9 6.9-1.9-2.1-2.9-4.3-2.9-6.9 0-2.5 1-4.9 2.9-7.2zM2.6 9.6c3 .1 5.4 1.3 7 3.6 1 1.4 1.5 3 1.7 4.6-2.6-.1-4.8-1.1-6.4-2.9-1.3-1.5-2.1-3.3-2.3-5.3zM21.4 9.6c-3 .1-5.4 1.3-7 3.6-1 1.4-1.5 3-1.7 4.6 2.6-.1 4.8-1.1 6.4-2.9 1.3-1.5 2.1-3.3 2.3-5.3zM4.5 18.8c2.3 1.3 4.8 2 7.5 2s5.2-.7 7.5-2c-2.2.6-4.7.9-7.5.9s-5.3-.3-7.5-.9z',
};

const SAO = [
  { id: 'sao-game', mau: '#8fd6c2', hinh: 'lap-lanh',  nhan: 'Mùa chín, đưa nắng qua cho trái chín',
    duong: 'mua-chin',  khung: '.game',    mun: 'TDTD_GAME', tieuDe: 'Mùa Chín — đưa nắng cho trái chín', tenApp: 'Mùa Chín', trang: 'mua-chin/', nutCai: true },
  { id: 'sao-hoadang', mau: '#f0a860', hinh: 'hoa',    nhan: 'Thả đèn hoa đăng, buông điều nặng lòng',
    duong: 'tha-den',  khung: '.hoadang', mun: 'TDTD_HOADANG', tieuDe: 'Thả đèn hoa đăng', tenApp: 'Hoa đăng', trang: 'tha-den-hoa-dang/', nutCai: true },
  { id: 'sao-ho',   mau: '#7ec8e3', hinh: 'giot',      nhan: 'Hồ nước, có đàn ếch',
    duong: 'ho-sen',   khung: '.ho',      mun: 'TDTD_HO', tieuDe: 'Hồ sen và đàn ếch', tenApp: 'Hồ sen', trang: 'ho-sen/', nutCai: true },
  { id: 'sao-tho',  mau: '#b8a8e8', hinh: 'tia',       nhan: 'Hộp thở, thở theo nhịp bốn',
    duong: 'hoi-tho',   khung: '.hopho',   mun: 'TDTD_THO', tieuDe: 'Hộp thở — thở cho dịu lại', tenApp: 'Hộp thở', trang: 'hop-tho/', nutCai: true },
  { id: 'sao-chom', mau: '#f2ead0', hinh: 'sao4',      nhan: 'Nối sao thành chòm',
    duong: 'noi-sao',  khung: '.chomsao', mun: 'TDTD_CHOMSAO', tieuDe: 'Nối sao thành chòm', tenApp: 'Nối sao', trang: 'noi-sao-thanh-chom/', nutCai: true },
  { id: 'sao-troi', mau: '#aebff0', hinh: 'sao5',      nhan: 'Bầu trời thật đêm nay, ngay trên đầu bạn',
    duong: 'troi-dem', khung: '.troidem', mun: 'TDTD_TROIDEM', tieuDe: 'Bầu trời đêm nay', tenApp: 'Bầu trời đêm', trang: 'bau-troi-dem-nay/', nutCai: true },
  { id: 'sao-phatam', mau: '#e8c37a', hinh: 'tia',     nhan: 'Luyện phát âm, xem miệng đặt lưỡi ở đâu',
    duong: 'phat-am',  khung: '.phatam',  mun: 'TDTD_PHATAM', tieuDe: 'Luyện phát âm tiếng Anh', tenApp: 'Phát âm', trang: 'luyen-phat-am/', nutCai: true },
  { id: 'sao-lich', mau: '#e58a7a', hinh: 'sao8',      nhan: 'Xem ngày tốt xấu, nên và không nên làm gì',
    duong: 'xem-ngay', khung: '.xemngay', mun: 'TDTD_XEMNGAY', tieuDe: 'Xem ngày tốt xấu', tenApp: 'Xem ngày', trang: 'xem-ngay-tot-xau/', nutCai: true },
  { id: 'sao-so',   mau: '#b99ae8', hinh: 'sao6',      nhan: 'Thần số học: con số chủ đạo, biểu đồ ngày sinh',
    duong: 'than-so',  khung: '.thanso',  mun: 'TDTD_THANSO', tieuDe: 'Thần số học', tenApp: 'Thần số học', trang: 'than-so-hoc/', nutCai: true },
  { id: 'sao-ngu',  mau: '#f3dfa0', hinh: 'trang',     nhan: 'Nhạc ngủ: âm thanh và tần số ru ngủ, hẹn giờ tự tắt',
    duong: 'nhac-ngu', khung: '.nhacngu', mun: 'TDTD_NGU', tieuDe: 'Nhạc ngủ — hẹn giờ tự tắt', tenApp: 'Nhạc ngủ', trang: 'nhac-ngu/', nutCai: true },
  { id: 'sao-luanxa', mau: '#f2a7c3', hinh: 'sen',     nhan: 'Thiền luân xa: tụng chủng tử theo đàn tanpura và chuông xoay, qua bảy luân xa',
    duong: 'thien-luan-xa', khung: '.luanxa', mun: 'TDTD_LUANXA', tieuDe: 'Thiền bảy luân xa', tenApp: 'Thiền luân xa', trang: 'thien-luan-xa/', nutCai: true },
  { id: 'sao-laptrinh', mau: '#8fd0ff', hinh: 'khoi',  nhan: 'Robot thắp sao: 100 bài lập trình cho bé 6–10 tuổi',
    duong: 'lap-trinh', khung: '.laptrinh', mun: 'TDTD_LAPTRINH', tieuDe: 'Robot thắp sao — lập trình cho bé', tenApp: 'Thắp sao', trang: 'robot-thap-sao/', nutCai: true },
  { id: 'sao-sokoban', mau: '#f2c46b', hinh: 'thung', nhan: 'Đẩy thùng sao: Sokoban 100 màn, đẩy thùng vào ổ cho sáng lên',
    duong: 'day-thung', khung: '.sokoban', mun: 'TDTD_SOKOBAN', tieuDe: 'Đẩy thùng sao — Sokoban', tenApp: 'Đẩy thùng', trang: 'day-thung-sao/', nutCai: true },
  { id: 'sao-coba', mau: '#e9b3a8', hinh: 'coba', nhan: 'Cờ vua ba người: Trắng, Đen, Đỏ trên bàn lục giác, đấu với 2 máy hay mỗi người một máy qua mạng',
    duong: 'co-ba-nguoi', khung: '.coba', mun: 'TDTD_COBA', tieuDe: 'Cờ vua ba người', tenApp: 'Cờ ba người', trang: 'co-vua-ba-nguoi/', nutCai: true },
];


const SEED_KEY = 'tdtd.seed';   // hạt giống riêng của máy
const DAY_KEY  = 'tdtd.day';    // ngày đã nhận thông điệp, bị ghi đè mỗi ngày
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const THU = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const prettyDate = (s) => { const [y, m, d] = s.split('-').map(Number); const t = new Date(y, m - 1, d);
  return `${THU[t.getDay()]}, ngày ${d} tháng ${m} năm ${y}`; };

let CARDS = [], IDS = [], today = null, revealed = false, seed = 0;

/* Thứ duy nhất được ghi xuống máy: một con số làm hạt giống, để mỗi người có bộ bài riêng.
   Không có lịch sử, không có lá đã rút, không có gì tích lũy theo thời gian.
   Nếu trình duyệt chặn lưu trữ (chế độ ẩn danh chẳng hạn), hạt giống chỉ sống trong phiên này. */
function getSeed() {
  try {
    const saved = localStorage.getItem(SEED_KEY);
    if (saved !== null && /^-?\d+$/.test(saved)) return parseInt(saved, 10);
    const fresh = newSeed();
    localStorage.setItem(SEED_KEY, String(fresh));
    return fresh;
  } catch (e) {
    return newSeed();
  }
}

/* Ngày gần nhất đã nhận thông điệp. Chỉ giữ đúng một ngày, hôm sau ghi đè,
   nên không có lịch sử nào tích lũy và cũng không xem lại được thông điệp cũ. */
const readDay = () => { try { return localStorage.getItem(DAY_KEY); } catch (e) { return null; } };
const writeDay = (d) => { try { localStorage.setItem(DAY_KEY, d); } catch (e) {} };

/* Xem thử một ngày khác: thêm ?ngay=2026-12-25 vào URL. Chỉ để kiểm tra, không đổi cách app chạy thật. */
const previewDate = () => {
  const v = new URLSearchParams(location.search).get('ngay');
  if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
  const [y, m, d] = v.split('-').map(Number);
  const t = new Date(y, m - 1, d);
  return (t.getFullYear() === y && t.getMonth() === m - 1 && t.getDate() === d) ? v : null;
};
const PREVIEW = previewDate();
const nowDate = () => PREVIEW || ymd();

const cardOfToday = () => CARDS.find(c => c.id === cardFor(IDS, today, seed));

let toastT;
const toast = (msg) => { const el = $('#toast'); el.textContent = msg; el.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200); };

const openSheet = (title, html) => {
  const t = $('#sheet-title');
  t.textContent = title || '';
  t.hidden = !title;                      // không có tiêu đề thì bỏ luôn dòng đó
  $('#sheet-body').innerHTML = html;
  $('#sheet-wrap').hidden = false; document.body.style.overflow = 'hidden';
};
const closeSheet = () => { $('#sheet-wrap').hidden = true; document.body.style.overflow = ''; };

function render() {
  today = nowDate();
  $('#today-date').textContent = prettyDate(today);
  const c = cardOfToday();
  $('#message').textContent = c.thong_diep;
  $('#meaning').textContent = c.y_nghia;
  $('#card').classList.toggle('is-flipped', revealed);
  $('#cta').hidden = revealed;
  $('#after').hidden = !revealed;
  tick();
}

function reveal() {
  if (revealed) return;
  revealed = true;
  if (!PREVIEW) writeDay(today);
  render();
  setTimeout(() => {
    $('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    datCacSao();                          // bố cục vừa đổi, tìm chỗ trống mới
  }, 950);
}

function tick() {
  if (!revealed) return;
  if (PREVIEW) { $('#countdown').textContent = `Đang xem thử ngày ${PREVIEW}`; return; }
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const s = Math.max(0, Math.floor((mid - now) / 1000));
  const p = (n) => String(n).padStart(2, '0');
  $('#countdown').textContent = `Thông điệp mới sau ${p(s / 3600 | 0)}:${p((s % 3600) / 60 | 0)}:${p(s % 60)}`;
}

/* Hai nút cùng vẽ một tấm ảnh: "Chia sẻ ảnh" mở bảng chia sẻ của máy, "Tải về" lưu thẳng tệp
   PNG về máy. Máy không hỗ trợ chia sẻ tệp thì nút chia sẻ cũng tải ảnh về. */
let dangVeAnh = false;
async function lamAnh(nut, viec) {
  if (dangVeAnh || !self.TDTD_ANH) return;
  const chuCu = nut.innerHTML;
  dangVeAnh = true; nut.disabled = true; nut.innerHTML = '<span class="ico">◌</span>Đang vẽ…';
  try {
    const c = cardOfToday();
    const blob = await self.TDTD_ANH.veAnh({
      thongDiep: c.thong_diep, yNghia: c.y_nghia, ngayDep: prettyDate(today),
    });
    if (!blob) throw new Error('không tạo được ảnh');
    await viec(blob, `thong-diep-${today}.png`);
  } catch (e) {
    toast('Không tạo được ảnh, thử lại nhé');
  } finally {
    dangVeAnh = false; nut.disabled = false; nut.innerHTML = chuCu;
  }
}

const chiaSeAnh = () => lamAnh($('#btn-anh'), async (blob, ten) => {
    const tep = new File([blob], ten, { type: 'image/png' });
    /* Gửi **mỗi tấm ảnh**, không kèm text. Trước đây gửi kèm cả câu thông điệp, và Zalo,
       Messenger hay Facebook nhận được cả hai thì chỉ lấy chữ rồi bỏ ảnh — người dùng bấm
       "Chia sẻ ảnh" mà ra mỗi dòng chữ. Bản thân tấm ảnh đã có sẵn câu thông điệp, ngày
       tháng và tên app rồi, nên bỏ text đi không mất gì. */
    if (navigator.canShare && navigator.canShare({ files: [tep] })) {
      try { await navigator.share({ files: [tep] }); }
      catch (e) { if (e.name !== 'AbortError') taiAnh(blob, ten); }
    } else {
      taiAnh(blob, ten);
    }
});

/* iPhone mở app từ biểu tượng ngoài màn hình chính thì bấm tải tệp là app mở tấm ảnh chiếm cả
   màn hình mà không có đường quay lại. Ở đó dùng bảng chia sẻ của máy, có sẵn nút "Lưu hình ảnh"
   để lưu thẳng vào ứng dụng Ảnh. */
const IOS_CAI = !!navigator.standalone;
const taiVe = () => lamAnh($('#btn-tai'), async (blob, ten) => {
  const tep = new File([blob], ten, { type: 'image/png' });
  if (IOS_CAI && navigator.canShare && navigator.canShare({ files: [tep] })) {
    toast('Chọn "Lưu hình ảnh" để lưu vào Ảnh');
    try { await navigator.share({ files: [tep] }); } catch (e) {}
    return;
  }
  taiAnh(blob, ten);
});

function taiAnh(blob, ten) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = ten;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  toast('Đã tải ảnh về máy');
}

function about() {
  openSheet('Giới thiệu', `
    <p>Mỗi ngày, một thông điệp. Mở ứng dụng, hít một hơi thật sâu, rồi lật lá bài dành cho hôm nay.</p>
    <p>Ứng dụng không giữ lịch sử: không bộ sưu tập, không nhật ký, không tài khoản.</p>
    <p>Nội dung lấy cảm hứng từ bộ sách <em>Đối thoại với Thượng đế</em> của Neale Donald Walsch.</p>
    ${['daCai', 'mayTinh', 'trongApp'].includes(loaiCai()) ? '' : '<button class="ghost" id="btn-cai-app" style="margin-top:4px">Cài app vào điện thoại</button>'}`);
  const nc = $('#btn-cai-app');
  if (nc) nc.onclick = () => moCaiApp();
}

/* ---------- cài app lên điện thoại ----------
   Nhận dạng máy ở assets/caiapp.js; đây chỉ là bảng hướng dẫn. KHÔNG tự bật: bảng chỉ mở khi người dùng bấm —
   nút cài app trên thanh trên cùng, nút "Cài app" trong trò phát âm, hay mục "?". Bản trước tự bật 3 giây sau khi
   lật lá và 3 giây sau khi vào trò phát âm; người dùng thấy "đang sử dụng hiển thị cài app khó chịu lắm". */
const CA = self.TDTD_CAIAPP;
const loaiCai = () => (CA ? CA.loaiMay(navigator.userAgent, {
  standalone: !!navigator.standalone || matchMedia('(display-mode: standalone)').matches,
  coNhacCai: !!CA.nhacCai(), chamDuoc: navigator.maxTouchPoints > 1, daCaiNho: !!(CA.docTT() || {}).daCai }) : 'mayTinh');
const ICO_CHIA_SE = '<svg class="cai-ico" viewBox="0 0 24 24" aria-label="nút Chia sẻ"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10.5H6v10h12v-10h-2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
const ICO_THEM = '<svg class="cai-ico" viewBox="0 0 24 24" aria-label="biểu tượng Thêm"><rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const ICO_BA_CHAM = '<b class="cai-cham">⋯</b>';

/* ---------- mở app đã cài: vào thẳng trò đã cài ----------
   Người dùng hỏi "tải app trong mỗi game là vô app có tự động vô game không hay bay ra trang chủ", rồi chọn: vào thẳng trò
   đã cài. Trang mở đầu của app là thứ trình duyệt ghi lại lúc cài, mỗi nhà một kiểu:
   - Chrome (Android, máy tính) mở start_url của manifest, và đọc lại manifest mỗi lần thẻ <link rel="manifest"> đổi. Nên
     đang ở trò nào thì gắn manifest riêng của trò đó (<trang>app.webmanifest, scripts/lam-ke-khai.py viết): start_url
     ?tro=<duong>, cùng id "/" — vẫn một app. App dùng chung kho lưu với Chrome, nên lúc cài (appinstalled) ghi thêm trò
     đang mở — phòng khi Chrome cài theo manifest đã đọc từ trước. Trong app luôn gắn manifest của trò đã cài, kẻo Chrome
     kiểm bản cập nhật đúng lúc đang ở trò khác rồi đổi trang mở đầu theo trò đó.
   - Safari, và mọi trình duyệt trên iPhone, iPad (đều là WebKit), đọc manifest MỘT lần lúc tải trang rồi giữ tới khi rời
     trang — thẻ <link> đổi sau đó không đọc lại (DocumentLoader::loadApplicationManifest của WebKit). Người dùng báo: "Sao
     vô game thêm màn hình chính toàn ra trang chủ không vậy" — bản trước đổi manifest lúc vào trò thì Safari vẫn cầm
     manifest trang chủ. Nên index.html không gắn manifest cho WebKit: không có manifest thì "Thêm vào MH chính" lưu địa
     chỉ đang xem, và đang ở trò nào thì địa chỉ mang ?tro=<duong> (datTroDiaChi). App trên màn hình chính có kho lưu riêng,
     tách hẳn Safari (WebKit làm vậy có chủ ý), nên chỉ địa chỉ mang được trò sang.
   App mở với ?tro thì nhớ trò đó vào kho của app; lần mở app sau (không phải tải lại trang) vào thẳng trò, bấm ✕ là về
   trang chủ. */
const KHOA_TRO_CAI = 'tdtd.troCai';
const coTro = (d) => !!d && SAO.some(s => s.duong === d && s.trang);
const keKhaiCua = (d) => (coTro(d) ? SAO.find(s => s.duong === d).trang + 'app.webmanifest' : 'manifest.webmanifest');
/* lúc mở trang: nho — trò của app (chỉ khi đang chạy như app đã cài); mo — trò mở ngay: ?tro, hay trò đã nhớ khi mở app.
   Địa chỉ đã có #trò, hay đây là tải lại trang, thì để theo địa chỉ. Riêng app mở với ?tro mà sau # là chính trò đó thì mở
   trò từ đầu: iPhone lưu nguyên địa chỉ lúc "Thêm vào MH chính", có khi kèm mã phòng cờ (#co-ba-nguoi/MÃ) — không bỏ thì
   lần nào mở app cũng vào lại một phòng đã tan. */
function troLucMo(o) {
  const q = new URLSearchParams(o.search || '').get('tro'), hop = coTro(q) ? q : null;
  const nho = o.laApp ? hop || (coTro(o.nho) ? o.nho : null) : null;
  const troSauThang = (o.hash || '').slice(1).split('/')[0];
  return { nho, mo: o.taiLai ? null : o.laApp && hop && troSauThang === hop ? hop : o.hash ? null : hop || nho };
}
const laApp = () => !!navigator.standalone || matchMedia('(display-mode: standalone)').matches;
const docTroCai = () => { try { return localStorage.getItem(KHOA_TRO_CAI) || null; } catch (e) { return null; } };
const ghiTroCai = (d) => { try { if (d) localStorage.setItem(KHOA_TRO_CAI, d); else localStorage.removeItem(KHOA_TRO_CAI); } catch (e) {} };
/* Cài lúc này thì app mở vào đâu, mang tên gì. Có manifest (Chrome): gắn manifest của trò — trong đó có cả trang mở đầu
   lẫn tên. Không có (WebKit, xem index.html): địa chỉ mang ?tro=<trò>. Trong app thì để địa chỉ yên — app đã cài rồi. */
function datKeKhai(dangMo) {
  datTenGoiY(dangMo);
  const l = document.querySelector('link[rel="manifest"]'), app = laApp();
  if (!l) { if (!app) datTroDiaChi(coTro(dangMo) ? dangMo : null); return; }
  const href = keKhaiCua(app ? docTroCai() : dangMo);
  if (l.getAttribute('href') === href) return;
  l.setAttribute('href', href);
  /* Manifest đổi thì Chrome bỏ hộp cài đã đưa (DidUpdateWebManifestURL: Stop → ResetBindings), kiểm lại rồi đưa hộp mới
     (caiapp.js tự cất). Giữ hộp cũ thì bấm Cài app là gọi prompt() vào một hộp đã chết, không có gì hiện ra. */
  if (CA) CA.xoaNhacCai();
}
/* Tên gợi ý lúc "Thêm vào MH chính" trên iPhone. Người dùng: "khi bấm thêm màn hình chính luôn ra thông điệp, mỗi game
   bạn tự sửa lại tên gợi ý đó cho đúng". Không có manifest thì Safari lấy tên ở thẻ apple-mobile-web-app-title — thẻ
   này Safari tự đọc từ trang (mã WebKit không đụng tới, không giữ như manifest) — nên đang ở trò nào thì thẻ mang tên
   ngắn của trò đó (tenApp), về trang chủ thì "Thông Điệp". Chrome lấy tên trong manifest của trò (short_name = tenApp,
   scripts/lam-ke-khai.py viết). */
const TEN_GOC_APP = 'Thông Điệp';
const tenAppCua = (d) => (coTro(d) && SAO.find(s => s.duong === d).tenApp) || TEN_GOC_APP;
function datTenGoiY(d) {
  const m = document.querySelector('meta[name="apple-mobile-web-app-title"]'), ten = tenAppCua(d);
  if (m && m.getAttribute('content') !== ten) m.setAttribute('content', ten);
}
/* Đổi ?tro trên địa chỉ, giữ nguyên phần còn lại (?ngay=…, #trò/mã phòng). replaceState: không thêm bước Back. Địa chỉ
   trong trò giờ khác trang chủ cả phần trước dấu #, mà Back qua hai địa chỉ như thế Safari không báo hashchange — nên
   init nghe thêm popstate. */
function datTroDiaChi(d) {
  const p = new URLSearchParams(location.search);
  if ((p.get('tro') || null) === d) return;
  if (d) p.set('tro', d); else p.delete('tro');
  const q = p.toString();
  history.replaceState(history.state, '', location.pathname + (q ? '?' + q : '') + location.hash);
}
function vaoTroDaCai() {
  let taiLai = false;
  try { const n = performance.getEntriesByType('navigation')[0]; taiLai = !!n && n.type === 'reload'; } catch (e) {}
  const app = laApp(), lucMo = troLucMo({ search: location.search, hash: location.hash, laApp: app, taiLai, nho: docTroCai() });
  if (app && lucMo.nho !== docTroCai()) ghiTroCai(lucMo.nho);
  datKeKhai(null);
  if (lucMo.mo) history.replaceState(null, '', location.pathname + location.search + '#' + lucMo.mo);
  /* Android: cài xong (bằng nút Cài app hay menu Chrome) thì ghi trò đang mở — app dùng chung kho lưu với Chrome */
  addEventListener('appinstalled', () => ghiTroCai(saoDangMo ? saoDangMo.duong : ''));
}

/* Link đưa ra ngoài (Mở bằng Safari, Mở bằng Chrome, Chép link): đang ở trong trò nào thì là link của trò đó.
   Người dùng báo: mở link phát âm trong Zalo, bấm Mở bằng Safari để cài thì Safari ra trang chính — bản trước lấy
   origin + pathname, bỏ mất trò đang mở. Trò có trang riêng thì dùng trang riêng (/luyen-phat-am/), vì link mở
   bằng Chrome (intent://…#Intent;…) không mang được phần sau dấu # của mình. */
function linkCaiApp() {
  return saoDangMo ? linkTro(saoDangMo) : location.origin + location.pathname;
}

function moCaiApp() {
  const loai = loaiCai(), link = linkCaiApp();
  if (loai === 'daCai') { toast('Bạn đang dùng app rồi'); return; }
  const buoc = (ds) => `<ol class="cai-buoc">${ds.map((d, i) => `<li><span>${i + 1}</span><p>${d}</p></li>`).join('')}</ol>`;
  /* Các bước trên iPhone, iPad: giống hệt Nhớ Nha (nho-nha/src/ui/InstallSheet.tsx, ShareSteps) — nút Chia sẻ ở
     đâu, "Thêm vào MH chính" nằm sau "Xem thêm" hay phải kéo xuống, theo CA.cachChiaSe(). */
  const ua = navigator.userAgent, c = CA.cachChiaSe(ua, CA.laIpad(ua, navigator.maxTouchPoints > 1));
  /* chữ và biểu tượng luôn liền một dòng: biểu tượng rớt xuống dòng riêng trông như một bước khác (như Nhớ Nha) */
  const CHIA_SE = `<span class="cai-lien"><b>Chia sẻ</b> ${ICO_CHIA_SE}</span>`;
  const buocIos = buoc([
    { baCham: `Bấm nút ${ICO_BA_CHAM} ở thanh dưới, chọn ${CHIA_SE}.`,
      thanhDuoi: `Bấm nút ${CHIA_SE} ở thanh dưới.`,
      tren: `Bấm nút ${CHIA_SE} ở góc trên bên phải.`,
      menu: `Mở menu của trình duyệt, chọn ${CHIA_SE}.` }[c.nut],
    (c.bang === 'keo' ? 'Kéo xuống, chọn ' : `Bấm <b>Xem thêm</b>${c.bang === 'caHai' ? ' (hoặc kéo xuống)' : ''}, chọn `) +
      `<span class="cai-lien"><b>Thêm vào MH chính</b> ${ICO_THEM}</span>.`,
    `Bấm <b>Thêm</b>.`,
    `Mở <b>${esc(tenAppCua(saoDangMo && saoDangMo.duong))}</b> từ màn hình chính.`]);   // đúng tên gợi ý lúc này (datTenGoiY)
  /* Trong Zalo, Facebook…: gọi đúng tên app, nút mở thẳng bằng Safari (iOS 17 trở lên) hay Chrome, rồi link để
     chép, rồi menu của chính app đó — như Nhớ Nha (EscapeInApp). */
  const tenApp = CA.tenTrongApp(ua) || 'ứng dụng này', iosApp = loai === 'trongAppIos';
  const trinhDuyet = iosApp ? 'Safari' : 'Chrome';
  const ngoai = iosApp ? CA.linkSafari(link) : loai === 'trongAppAndroid' ? CA.linkChrome(link) : null;   // intent:// chỉ Android hiểu
  const trongApp = `<p class="cai-luu"><b>Mở bằng ${trinhDuyet} để cài được.</b> Trình duyệt trong ${esc(tenApp)} không cài được app.</p>
      ${ngoai ? `<a class="primary wide cai-nut" href="${esc(ngoai)}">Mở bằng ${trinhDuyet}</a>` : ''}
      <button class="ghost wide-ghost" id="btn-chep-cai">Chép link</button>
      <p class="cai-luu">Không mở được thì bấm ${ICO_BA_CHAM} ở góc trên, chọn mở bằng trình duyệt. Mở được rồi thì bấm nút
        <b>?</b> → <b>Cài app vào điện thoại</b>.</p>`;
  const than = {
    nhacCai: `<button class="primary wide" id="btn-cai-ngay">Cài app</button>`,
    /* Android: lúc cài, app ghi trò đang mở (appinstalled, dùng chung kho với Chrome) — tên dưới biểu tượng theo trò đó */
    daCaiTrinhDuyet: `<p>App đã cài trên máy này. Mở <b>${esc(tenAppCua(docTroCai()))}</b> từ biểu tượng ngoài màn hình chính.</p>`,
    iosSafari: buocIos,
    iosKhac: buocIos +
      `<p class="cai-luu">Không thấy mục <b>Thêm vào MH chính</b>? Mở trang này bằng <b>Safari</b> rồi bấm nút <b>?</b> → <b>Cài app vào điện thoại</b>.</p>
      <button class="ghost wide-ghost" id="btn-chep-cai">Chép link để dán vào Safari</button>`,
    iosKhacCu: `<p class="cai-luu">iPhone này chạy iOS cũ hơn 16.4 nên chỉ <b>Safari</b> mới cài được app — Chrome, Firefox thì chưa.</p>` + buoc([
      `Chép link bên dưới, mở <b>Safari</b> rồi dán vào thanh địa chỉ.`,
      `Trong Safari, bấm nút <b>?</b> → <b>Cài app vào điện thoại</b>.`]) +
      `<button class="ghost wide-ghost" id="btn-chep-cai">Chép link để dán vào Safari</button>`,
    trongAppIos: trongApp,
    trongAppAndroid: trongApp,
    androidTay: buoc([`Mở menu của trình duyệt (dấu <b class="cai-cham">⋮</b> hoặc ${ICO_BA_CHAM}).`, `Chọn <b>Cài đặt ứng dụng</b> hoặc <b>Thêm vào màn hình chính</b>.`]),
    mayTinh: `<p>Trên điện thoại, mở <b>${location.host}</b> rồi bấm nút <b>?</b> → <b>Cài app vào điện thoại</b>. Trên máy tính, Chrome và Edge có biểu tượng cài ở cuối thanh địa chỉ.</p>`,
  };
  than.trongApp = than.trongAppAndroid;
  const dau = `
    <div class="cai-dau"><img src="icons/icon-192.png" alt="" width="52" height="52">
      <p>Mở bằng một chạm từ màn hình chính, chạy toàn màn hình, mất mạng vẫn mở được. Không cần vào kho ứng dụng, không tốn dung lượng.</p></div>
    `;
  openSheet('Cài app vào điện thoại', dau + (than[loai] || than.mayTinh));
  /* Nút trong bảng mang id riêng. Bản trước nút này cũng mang id btn-cai, trùng nút cài trên thanh trên cùng (thêm ngày
     14/10): $() lấy trúng nút trên thanh, nút "Cài app" trong bảng không được gắn gì — người dùng báo "trên android bấm
     vô chữ cài app, app ko đc cài". Chrome không đưa hộp cài (hộp đã hết hạn, đã dùng) thì chỉ cách cài bằng menu. */
  const nut = $('#btn-cai-ngay');
  if (nut) nut.onclick = async () => {
    const e = CA.nhacCai();
    CA.xoaNhacCai();                                   // mỗi hộp cài chỉ gọi prompt() được một lần
    let outcome = null;
    if (e) try { await e.prompt(); ({ outcome } = await e.userChoice); } catch (loi) {}
    if (!outcome) { openSheet('Cài app vào điện thoại', dau + than.androidTay); return; }
    closeSheet();
    if (outcome === 'accepted') { CA.ghiTT({ ...(CA.docTT() || {}), daCai: true }); toast('Đang cài app…'); }
  };
  const chep = $('#btn-chep-cai');
  if (chep) chep.onclick = () => {
    const xong = () => toast(loai.startsWith('trongApp') ? `Đã chép link. Mở ${trinhDuyet}, dán vào ô địa chỉ.` : 'Đã chép link, dán vào trình duyệt nhé');
    if (navigator.clipboard) navigator.clipboard.writeText(link).then(xong, () => chepTay(link, xong)); else chepTay(link, xong);
  };
}

/* Đặt ngôi sao vào một chỗ trống ngẫu nhiên trong màn hình.
   Ưu tiên tuyệt đối là không chạm chữ; lá bài chỉ nhường khi màn hình quá hẹp. */
const VUNG_CHU = ['.topbar', '.today-date', '#cta', '#after', '#toast'];   // không bao giờ được đè
const VUNG_BAI = ['.card-shell'];                                          // tránh nốt nếu còn chỗ
const KHOANG_SAO = 18;   // hai ngôi sao phải cách nhau ít nhất bằng này

function taoCacSao() {
  const troi = $('#bau-troi-sao');
  if (!troi) return [];
  troi.innerHTML = '';
  return SAO.filter(s => s.bat !== false).map(s => {
    const b = document.createElement('button');
    b.className = 'star';
    b.id = s.id;
    b.setAttribute('aria-label', s.nhan);
    b.style.setProperty('--mau-sao', s.mau);
    b.style.animationDelay = -(Math.random() * 4).toFixed(2) + 's';
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${HINH_SAO[s.hinh] || s.hinh || HINH_SAO.sao5}"/></svg>`;
    b.onclick = () => moSao(s);
    troi.appendChild(b);
    return b;
  });
}
let NUT_SAO = [], saoDangMo = null, dangTheoDoi = null;

/* Mỗi trò một địa chỉ riêng, gửi cho ai là họ mở thẳng vào trò đó.
   Dùng phần sau dấu thăng nên không cần máy chủ định tuyến, và nút Back
   của điện thoại đóng trò lại thay vì thoát hẳn khỏi app. */
const boDau = () => {
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
};

const TEN_GOC = document.title;

function moSao(s) {
  const m = self[s.mun];
  if (!m) return;
  if (saoDangMo && saoDangMo !== s) dongSao(true);
  saoDangMo = s;
  m.mo();
  if (s.tieuDe) document.title = s.tieuDe;          // tên thẻ trình duyệt, và tên khi chia sẻ bằng nút của trình duyệt
  if (location.hash.slice(1).split('/')[0] !== s.duong) location.hash = s.duong;   // #co-ba-nguoi/MÃ: phần sau / là của trò
  themNutChepLink(s);
  themNutCaiApp(s);
  datKeKhai(s.duong);                                // cài app lúc này thì mở app là vào thẳng trò này
  theoDoiDong(s);
}

/* Gỡ các nút app gắn thêm vào trò. Phải gỡ ở MỌI đường đóng trò: bản trước chỉ gỡ khi bấm ✕ của trò, nên đóng
   bằng nút Back rồi mở trò khác thì nút 🔗 vẫn nằm trong trò cũ, themNutChepLink thấy "đã có" và trò mới không có nút. */
function goNutTro() {
  ['#nut-chep-link', '#nut-cai-app'].forEach(id => { const n = $(id); if (n) n.remove(); });
  $$('.co-nut-cai').forEach(k => k.classList.remove('co-nut-cai'));
  datKeKhai(null);                                   // về trang chủ: cài lúc này thì mở app ra trang chủ (trong app: giữ trò đã cài)
}

function dongSao(imLang) {
  const s = saoDangMo;
  saoDangMo = null;
  if (dangTheoDoi) { dangTheoDoi.disconnect(); dangTheoDoi = null; }
  if (s && self[s.mun]) self[s.mun].dong();
  goNutTro();
  document.title = TEN_GOC;
  if (!imLang) boDau();
}

/* Trò có nút đóng riêng và phím Esc riêng. Không sửa từng file, chỉ ngồi nhìn
   lớp 'hien' của nó: mất lớp đó nghĩa là người dùng vừa đóng, thì xoá địa chỉ đi. */
function theoDoiDong(s) {
  const k = $(s.khung);
  if (!k) return;
  if (dangTheoDoi) dangTheoDoi.disconnect();
  dangTheoDoi = new MutationObserver(() => {
    if (!k.classList.contains('hien')) {
      dangTheoDoi.disconnect(); dangTheoDoi = null; saoDangMo = null; document.title = TEN_GOC; boDau();
      goNutTro();
    }
  });
  dangTheoDoi.observe(k, { attributes: true, attributeFilter: ['class'] });
}

/* Nút chép địa chỉ, gắn vào trò đang mở, nằm cạnh nút đóng. Một chỗ cho cả năm trò. */
function themNutChepLink(s) {
  const k = $(s.khung);
  if (!k || $('#nut-chep-link')) return;
  const b = document.createElement('button');
  b.id = 'nut-chep-link';
  b.className = 'nut-link';
  b.setAttribute('aria-label', 'Chép địa chỉ trò này');
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 13.4a4 4 0 005.7 0l3-3a4 4 0 10-5.7-5.7l-1.2 1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M13.4 10.6a4 4 0 00-5.7 0l-3 3a4 4 0 105.7 5.7l1.2-1.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
  b.onclick = () => chepLink(s);
  k.appendChild(b);
}

/* Link của một trò. Zalo, Facebook, Tin nhắn hiện tiêu đề của TRANG mà link trỏ tới, còn phần sau dấu #
   không bao giờ được gửi lên máy chủ — nên link …/#phat-am lúc nào cũng hiện "Thông Điệp Của Thượng Đế".
   Trò nào có trang riêng (trang: 'luyen-phat-am/') thì chia sẻ trang đó: nó mang tiêu đề riêng rồi tự chuyển vào
   trò. Bản đầu chia sẻ /phat-am/ — Telegram đã lưu bản xem trước sai của địa chỉ đó (xem phat-am/index.html), nên
   đổi sang địa chỉ mới chưa bị lưu; /phat-am/ vẫn giữ, đã sửa, cho những link đã gửi đi. */
function linkTro(s) {
  return s.trang ? location.origin + location.pathname.replace(/[^/]*$/, '') + s.trang
                 : location.origin + location.pathname + '#' + s.duong;
}

/* Nút "Cài app" trong trò có nutCai (mọi trò). Người vào từ link đi thẳng vào trò, không thấy thanh trên cùng của
   trang chính, nên trò có nút riêng. Máy đã cài, máy tính thì không có nút. Lúc có nút, khung trò mang lớp
   co-nut-cai để thanh tiêu đề của trò chừa chỗ (app.css). */
function themNutCaiApp(s) {
  const k = $(s.khung);
  if (!k || !s.nutCai || !CA || $('#nut-cai-app')) return;
  if (['daCai', 'daCaiTrinhDuyet', 'mayTinh'].includes(loaiCai())) return;
  const b = document.createElement('button');
  b.id = 'nut-cai-app';
  b.className = 'nut-cai';
  b.type = 'button';
  b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7.5 10.5L12 15l4.5-4.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>Cài app';
  b.onclick = moCaiApp;
  k.appendChild(b);
  k.classList.add('co-nut-cai');
}

function chepLink(s) {
  const d = linkTro(s);
  const xong = () => toast('Đã chép địa chỉ trò này');
  /* Link CHỈ nằm ở url. Bản trước ghi link cả trong text ("… — https://…") lẫn url, nên Zalo, Tin nhắn
     dán ra hai link liền nhau. */
  if (navigator.share) { navigator.share({ title: s.tieuDe || TEN_GOC, text: s.nhan, url: d }).catch(() => {}); return; }
  if (navigator.clipboard) { navigator.clipboard.writeText(d).then(xong, () => chepTay(d, xong)); return; }
  chepTay(d, xong);
}

function chepTay(chu, xong) {
  const o = document.createElement('textarea');
  o.value = chu; o.style.position = 'fixed'; o.style.opacity = '0';
  document.body.appendChild(o); o.select();
  try { document.execCommand('copy'); xong(); } catch (e) { toast('Không chép được'); }
  document.body.removeChild(o);
}

/* Địa chỉ đổi: do người dùng bấm Back, dán link mới, hay mở từ link gửi tới. */
function theoDiaChi() {
  const d = location.hash.slice(1).split('/')[0];          // phần sau dấu / (mã phòng cờ) để trò tự đọc
  const s = SAO.find(x => x.duong === d);
  if (s) { if (saoDangMo !== s) moSao(s); }
  else if (saoDangMo) dongSao(true);
}

function datCacSao() {
  const daDat = [];
  // đặt theo thứ tự ngẫu nhiên để không ngôi sao nào luôn được ưu tiên chỗ đẹp
  for (const el of NUT_SAO.slice().sort(() => Math.random() - .5)) {
    const r = datNgoiSao(el, daDat);
    if (r) daDat.push(r);
  }
}

function datNgoiSao(el, daDat = []) {
  if (!el) return null;
  const D = 34, LE = 10;

  const hinh = (list) => list.map(q => $(q))
    .filter(n => n && !n.hidden && n.offsetParent !== null)
    .map(n => n.getBoundingClientRect())
    .filter(r => r.width > 0 && r.height > 0);
  // sao đã đặt cũng là vùng cấm, nới thêm KHOANG_SAO để không dính sát nhau
  const noRong = (r) => ({ left: r.left - KHOANG_SAO, right: r.right + KHOANG_SAO,
                           top: r.top - KHOANG_SAO, bottom: r.bottom + KHOANG_SAO });
  const chu = hinh(VUNG_CHU).concat(daDat.map(noRong));
  const bai = hinh(VUNG_BAI);

  const W = innerWidth, H = innerHeight;
  const xMin = LE, xMax = W - D - LE, yMin = LE, yMax = H - D - LE;
  if (xMax <= xMin || yMax <= yMin) return;

  const chong = (x, y, r, dem) =>
    Math.max(0, Math.min(x + D, r.right + dem) - Math.max(x, r.left - dem)) *
    Math.max(0, Math.min(y + D, r.bottom + dem) - Math.max(y, r.top - dem));
  const dinh = (x, y, ds, dem) => ds.some(r => chong(x, y, r, dem) > 0);

  // Thử lần lượt: né cả chữ lẫn bài với khoảng đệm rộng, rồi hẹp dần, rồi chỉ né chữ.
  const nacThang = [
    { ds: chu.concat(bai), dem: 12 },
    { ds: chu.concat(bai), dem: 4 },
    { ds: chu.concat(bai), dem: 0 },
    { ds: chu, dem: 8 },
    { ds: chu, dem: 0 },
  ];
  for (const { ds, dem } of nacThang) {
    for (let i = 0; i < 260; i++) {
      const x = xMin + Math.random() * (xMax - xMin);
      const y = yMin + Math.random() * (yMax - yMin);
      if (!dinh(x, y, ds, dem)) return dat(el, x, y, D);
    }
    const troi = [];
    for (let y = yMin; y <= yMax; y += 6)
      for (let x = xMin; x <= xMax; x += 6)
        if (!dinh(x, y, ds, dem)) troi.push([x, y]);
    if (troi.length) { const [x, y] = troi[Math.floor(Math.random() * troi.length)]; return dat(el, x, y, D); }
  }

  // Hết đường: chọn ô đè ít nhất, tính chữ nặng gấp 40 lần lá bài.
  let tot = null, reNhat = Infinity;
  for (let y = yMin; y <= yMax; y += 6)
    for (let x = xMin; x <= xMax; x += 6) {
      let gia = 0;
      for (const r of chu) gia += chong(x, y, r, 0) * 40;
      for (const r of bai) gia += chong(x, y, r, 0);
      if (gia < reNhat) { reNhat = gia; tot = [x, y]; }
    }
  return tot ? dat(el, tot[0], tot[1], D) : null;
}

function dat(el, x, y, D) {
  el.style.left = Math.round(x) + 'px';
  el.style.top = Math.round(y) + 'px';
  el.classList.add('is-placed');
  return { left: x, right: x + D, top: y, bottom: y + D, width: D, height: D };
}

let henDatSao;
const datLaiNgoiSao = () => { clearTimeout(henDatSao); henDatSao = setTimeout(datCacSao, 120); };

function stars() {
  const cv = $('#stars'), ctx = cv.getContext('2d'), rndSeed = self.TDTD.mulberry32;
  const draw = () => {
    const w = cv.width = innerWidth, h = cv.height = innerHeight;
    ctx.clearRect(0, 0, w, h);
    const rnd = rndSeed(20260908);
    for (let i = 0; i < Math.round(w * h / 5200); i++) {
      const x = rnd() * w, y = rnd() * h, r = rnd() * 1.25 + .25, a = rnd() * .55 + .12;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.284);
      ctx.fillStyle = `rgba(${230 + rnd() * 25 | 0},${225 + rnd() * 25 | 0},255,${a})`; ctx.fill();
    }
  };
  draw();
  let t; addEventListener('resize', () => { clearTimeout(t); t = setTimeout(draw, 200); });
}

async function init() {
  try {
    CARDS = await (await fetch('data/cards.json', { cache: 'no-cache' })).json();
  } catch (e) {
    $('main').innerHTML = '<p class="ephemeral">Không tải được dữ liệu thông điệp.</p>';
    return;
  }
  IDS = CARDS.map(c => c.id);
  seed = getSeed();
  today = nowDate();
  revealed = !PREVIEW && readDay() === today;   // đã nhận hôm nay thì hiện lại luôn
  stars(); render();

  $('#card').onclick = reveal;
  $('#card').onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } };
  $('#btn-draw').onclick = reveal;
  NUT_SAO = taoCacSao();
  datCacSao();
  addEventListener('hashchange', theoDiaChi);
  /* Safari chỉ báo hashchange khi hai địa chỉ giống nhau phần trước dấu # (FrameLoader::loadInSameDocument). Trên iPhone
     địa chỉ trong trò có thêm ?tro= (datTroDiaChi), nên Back từ trò về trang chủ chỉ có popstate — Back, Forward nào
     Safari cũng báo popstate. Cả hai cùng tới thì theoDiaChi lần sau thấy đã đúng trò, không làm gì. */
  addEventListener('popstate', theoDiaChi);
  vaoTroDaCai();                        // app đã cài từ một trò: mở là vào thẳng trò đó
  theoDiaChi();                         // mở thẳng vào trò nếu địa chỉ có sẵn
  addEventListener('resize', datLaiNgoiSao);
  addEventListener('orientationchange', datLaiNgoiSao);
  $('#btn-anh').onclick = chiaSeAnh;
  $('#btn-tai').onclick = taiVe;
  $('#btn-about').onclick = about;
  /* Nút cài app trên thanh trên cùng: thấy thì tự bấm, không bảng nào tự bật lên giữa lúc đang dùng.
     Máy đã cài (hay đang mở từ màn hình chính), máy tính thì không có nút; vừa cài xong thì ẩn đi. */
  const nutCai = $('#btn-cai');
  if (nutCai) {
    nutCai.hidden = ['daCai', 'daCaiTrinhDuyet', 'mayTinh'].includes(loaiCai());
    nutCai.onclick = moCaiApp;
    addEventListener('appinstalled', () => { nutCai.hidden = true; });
  }
  $$('[data-close]').forEach(el => el.onclick = closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  setInterval(() => {                       // qua nửa đêm khi app đang mở: úp lá lại
    tick();
    if (!PREVIEW && ymd() !== today) { revealed = false; render(); toast('Một ngày mới đã bắt đầu'); }
  }, 1000);

}

/* Tự nhận bản mới mà không cần xoá cache tay.
   Trước đây đổi mã xong người dùng phải mở app hai lần mới thấy, vì bản cũ
   đã nằm trong bộ nhớ đệm của service worker. Giờ khi có bản mới, service worker
   chiếm quyền ngay rồi trang tự tải lại.

   Người dùng báo "mở trang chủ lâu lâu bị reset 2 lần". Ba chỗ hở của bản trước:
   - Chỗ nghe tin có bản mới chỉ gắn SAU khi tải xong bộ bài. Trình duyệt tự dò bản mới ngay lúc
     mở trang, nên có lúc tin tới trước khi có người nghe (trang chạy mã cũ tới lần mở sau), có
     lúc cả lượt dò của trình duyệt lẫn lượt app tự gọi đều ra bản mới.
   - Không có gì chặn trang VỪA tự tải lại khỏi tải lại lần nữa: hai bản lên sát nhau (dự án này
     có ngày đưa lên mấy lần) là thành hai lần liền.
   - Tin tới lúc người ta đang dùng dở (đã lật bài, đang mở một ngôi sao) cũng tải lại ngay,
     trông như bị reset giữa chừng.
   Giờ: nghe tin ngay từ lúc trang mở; vừa mở chưa tới 5 giây và chưa chạm gì thì tải lại luôn,
   như một phần của lúc mở; đang dùng dở thì đợi lúc chuyển sang app khác mới lặng lẽ tải lại;
   và trong 15 giây sau một lần tự tải lại thì không tải lại nữa. */
const MO_LUC = Date.now();
const TAI_LAI_KEY = 'tdtd.taiLai';
let daTuongTac = false;
for (const s of ['pointerdown', 'keydown'])
  addEventListener(s, () => { daTuongTac = true; }, { capture: true, passive: true });

/* Quyết định khi có bản mới: 'ngay' tải lại luôn, 'hoan' đợi lúc trang bị ẩn đi. */
function nenTaiLai(bayGio, lanTruoc, tuongTac, moLuc) {
  if (lanTruoc && bayGio - lanTruoc < 15000) return 'hoan';   // vừa tự tải lại xong: không tải lần hai trước mặt
  if (!tuongTac && bayGio - moLuc < 5000) return 'ngay';       // vừa mở, chưa chạm gì
  return 'hoan';                                               // đang dùng dở
}

let taiLai = () => location.reload();
function tuCapNhat() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const daCoBanCu = !!navigator.serviceWorker.controller;   // tính ngay lúc trang mở, trước mọi chờ đợi
  let daTaiLai = false, choTaiLai = false;
  const lamTaiLai = () => {
    if (daTaiLai) return;
    daTaiLai = true;
    try { sessionStorage.setItem(TAI_LAI_KEY, String(Date.now())); } catch (e) {}
    taiLai();
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!daCoBanCu || daTaiLai) return;   // lần cài đầu tiên thì khỏi tải lại
    let lanTruoc = 0;
    try { lanTruoc = +sessionStorage.getItem(TAI_LAI_KEY) || 0; } catch (e) {}
    if (nenTaiLai(Date.now(), lanTruoc, daTuongTac, MO_LUC) === 'ngay') lamTaiLai();
    else choTaiLai = true;
  });
  /* Nhạc ngủ hay buổi thiền luân xa đang phát thì khoá màn hình cũng là trang bị ẩn — tải lại lúc đó là
     tắt tiếng của người đang ngủ, đang thiền. Đợi tiếng tự tắt xong (cả hai báo 'tdtd-ngu-het') mới tải. */
  const dangPhatNhac = () => ['TDTD_NGU', 'TDTD_LUANXA'].some(m => self[m] && self[m].dangPhat());
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && choTaiLai && !dangPhatNhac()) lamTaiLai();   // người dùng đã chuyển đi, tải lại không ai thấy
  });
  addEventListener('tdtd-ngu-het', () => { if (document.hidden && choTaiLai) lamTaiLai(); });

  navigator.serviceWorker.register('sw.js').then(dk => {
    dk.update().catch(() => {});
    setInterval(() => dk.update().catch(() => {}), 30 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) dk.update().catch(() => {});   // mở lại app là dò bản mới
    });
  }).catch(() => {});
}
tuCapNhat();      // gắn chỗ nghe tin có bản mới NGAY, không đợi tải xong bộ bài
init();

/* Móc cho kiểm thử: gọi thẳng bộ rải sao mà không phải chờ sự kiện resize. */
self.TDTD_SAO = {
  raiLai: () => datCacSao(),
  _nenTaiLai: nenTaiLai,
  _thayTaiLai: (f) => { taiLai = f; },
  themSaoThu: (n, mau) => {                       // chỉ dùng khi thử, không ảnh hưởng bản chạy thật
    const troi = $('#bau-troi-sao'), goc = troi.children[0];
    while (troi.children.length < n) { const c = goc.cloneNode(true); c.id = 'sao-thu-' + troi.children.length; troi.appendChild(c); }
    [...troi.children].forEach((c, i) => c.style.setProperty('--mau-sao', mau[i % mau.length]));
    NUT_SAO = [...troi.children];
    return NUT_SAO.length;
  },
};
})();
