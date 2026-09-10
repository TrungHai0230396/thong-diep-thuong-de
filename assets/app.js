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
};

const SAO = [
  { id: 'sao-game', mau: '#8fd6c2', hinh: 'lap-lanh',  nhan: 'Mùa chín, đưa nắng qua cho trái chín',
    duong: 'mua-chin',  khung: '.game',    mun: 'TDTD_GAME' },
  { id: 'sao-hoadang', mau: '#f0a860', hinh: 'hoa',    nhan: 'Thả đèn hoa đăng, buông điều nặng lòng',
    duong: 'tha-den',  khung: '.hoadang', mun: 'TDTD_HOADANG' },
  { id: 'sao-ho',   mau: '#7ec8e3', hinh: 'giot',      nhan: 'Hồ nước, có đàn ếch',
    duong: 'ho-sen',   khung: '.ho',      mun: 'TDTD_HO' },
  { id: 'sao-tho',  mau: '#b8a8e8', hinh: 'tia',       nhan: 'Hộp thở, thở theo nhịp bốn',
    duong: 'hoi-tho',   khung: '.hopho',   mun: 'TDTD_THO' },
  { id: 'sao-chom', mau: '#f2ead0', hinh: 'sao4',      nhan: 'Nối sao thành chòm',
    duong: 'noi-sao',  khung: '.chomsao', mun: 'TDTD_CHOMSAO' },
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

/* Chia sẻ ảnh: vẽ lá thành PNG rồi mở bảng chia sẻ của máy.
   Máy không hỗ trợ chia sẻ tệp thì tải ảnh về. */
let dangVeAnh = false;
async function chiaSeAnh() {
  if (dangVeAnh || !self.TDTD_ANH) return;
  const nut = $('#btn-anh'), chuCu = nut.innerHTML;
  dangVeAnh = true; nut.disabled = true; nut.innerHTML = '<span class="ico">◌</span>Đang vẽ…';
  try {
    const c = cardOfToday();
    const blob = await self.TDTD_ANH.veAnh({
      thongDiep: c.thong_diep, yNghia: c.y_nghia, ngayDep: prettyDate(today),
    });
    if (!blob) throw new Error('không tạo được ảnh');
    const ten = `thong-diep-${today}.png`;
    const tep = new File([blob], ten, { type: 'image/png' });
    const loi = `“${c.thong_diep}” — Thông điệp của Thượng Đế, ${prettyDate(today).toLowerCase()}`;
    if (navigator.canShare && navigator.canShare({ files: [tep] })) {
      try { await navigator.share({ files: [tep], text: loi }); }
      catch (e) { if (e.name !== 'AbortError') taiAnh(blob, ten); }
    } else {
      taiAnh(blob, ten);
    }
  } catch (e) {
    toast('Không tạo được ảnh, thử lại nhé');
  } finally {
    dangVeAnh = false; nut.disabled = false; nut.innerHTML = chuCu;
  }
}

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
    <p>Ứng dụng không giữ lịch sử: không bộ sưu tập, không nhật ký, không tài khoản. Thông điệp cũ không xem lại được. Mỗi ngày chỉ nhận một lần, ngày mai sẽ có lá khác.</p>
    <p>Bộ bài gồm ${CARDS.length} thông điệp và được xáo riêng cho từng người, nên hai người mở cùng một ngày vẫn nhận hai thông điệp khác nhau. Đi hết ${CARDS.length} ngày mới trọn một vòng, trong vòng đó không thông điệp nào lặp lại.</p>
    <p>Nội dung lấy cảm hứng từ bộ sách <em>Đối thoại với Thượng đế</em> của Neale Donald Walsch.</p>
    <button class="ghost" id="btn-reshuffle" style="margin-top:4px">Xáo lại bộ bài của tôi</button>`);
  $('#btn-reshuffle').onclick = () => {
    if (!confirm('Xáo lại bộ bài? Thông điệp hôm nay sẽ đổi sang lá khác.')) return;
    seed = newSeed();
    try { localStorage.setItem(SEED_KEY, String(seed)); localStorage.removeItem(DAY_KEY); } catch (e) {}
    revealed = false; closeSheet(); render(); toast('Đã xáo lại bộ bài');
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

function moSao(s) {
  const m = self[s.mun];
  if (!m) return;
  if (saoDangMo && saoDangMo !== s) dongSao(true);
  saoDangMo = s;
  m.mo();
  if (location.hash.slice(1) !== s.duong) location.hash = s.duong;
  themNutChepLink(s);
  theoDoiDong(s);
}

function dongSao(imLang) {
  const s = saoDangMo;
  saoDangMo = null;
  if (dangTheoDoi) { dangTheoDoi.disconnect(); dangTheoDoi = null; }
  if (s && self[s.mun]) self[s.mun].dong();
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
      dangTheoDoi.disconnect(); dangTheoDoi = null; saoDangMo = null; boDau();
      const n = $('#nut-chep-link'); if (n) n.remove();
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

function chepLink(s) {
  const d = location.origin + location.pathname + '#' + s.duong;
  const loi = `${s.nhan} — ${d}`;
  const xong = () => toast('Đã chép địa chỉ trò này');
  if (navigator.share) { navigator.share({ text: loi, url: d }).catch(() => {}); return; }
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
  const d = location.hash.slice(1);
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
  theoDiaChi();                         // mở thẳng vào trò nếu địa chỉ có sẵn
  addEventListener('resize', datLaiNgoiSao);
  addEventListener('orientationchange', datLaiNgoiSao);
  $('#btn-anh').onclick = chiaSeAnh;
  $('#btn-about').onclick = about;
  $$('[data-close]').forEach(el => el.onclick = closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  setInterval(() => {                       // qua nửa đêm khi app đang mở: úp lá lại
    tick();
    if (!PREVIEW && ymd() !== today) { revealed = false; render(); toast('Một ngày mới đã bắt đầu'); }
  }, 1000);

  tuCapNhat();
}

/* Tự nhận bản mới mà không cần xoá cache tay.
   Trước đây đổi mã xong người dùng phải mở app hai lần mới thấy, vì bản cũ
   đã nằm trong bộ nhớ đệm của service worker. Giờ khi có bản mới, service worker
   chiếm quyền ngay rồi trang tự tải lại đúng một lần. */
function tuCapNhat() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  const daCoBanCu = !!navigator.serviceWorker.controller;
  let daTaiLai = false;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!daCoBanCu || daTaiLai) return;   // lần cài đầu tiên thì khỏi tải lại
    daTaiLai = true;
    location.reload();
  });

  navigator.serviceWorker.register('sw.js').then(dk => {
    dk.update().catch(() => {});
    setInterval(() => dk.update().catch(() => {}), 30 * 60 * 1000);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) dk.update().catch(() => {});   // mở lại app là dò bản mới
    });
  }).catch(() => {});
}
init();

/* Móc cho kiểm thử: gọi thẳng bộ rải sao mà không phải chờ sự kiện resize. */
self.TDTD_SAO = {
  raiLai: () => datCacSao(),
  themSaoThu: (n, mau) => {                       // chỉ dùng khi thử, không ảnh hưởng bản chạy thật
    const troi = $('#bau-troi-sao'), goc = troi.children[0];
    while (troi.children.length < n) { const c = goc.cloneNode(true); c.id = 'sao-thu-' + troi.children.length; troi.appendChild(c); }
    [...troi.children].forEach((c, i) => c.style.setProperty('--mau-sao', mau[i % mau.length]));
    NUT_SAO = [...troi.children];
    return NUT_SAO.length;
  },
};
})();
