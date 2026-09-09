/* Thông Điệp Của Thượng Đế — mỗi ngày một lá, không lưu lại gì. */
(() => {
'use strict';

const { ymd, cardFor, luckyNumbers, luckyDigits, newSeed } = self.TDTD;
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
};

const SAO = [
  { id: 'sao-so',   mau: '#e8c37a', hinh: 'sao5',      nhan: 'Số may mắn hôm nay',
    mo: () => lucky() },
  { id: 'sao-game', mau: '#8fd6c2', hinh: 'lap-lanh',  nhan: 'Chém trái cây, xả stress',
    mo: () => self.TDTD_GAME && self.TDTD_GAME.mo() },
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

function copyText() {
  const c = cardOfToday();
  const text = `“${c.thong_diep}”\n\n${c.y_nghia}\n\n— Thông điệp của Thượng Đế, ${prettyDate(today).toLowerCase()}`;
  const done = () => toast('Đã chép vào bộ nhớ tạm');
  if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
  if (navigator.clipboard) { navigator.clipboard.writeText(text).then(done, () => fallback(text, done)); return; }
  fallback(text, done);
}
function fallback(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('Không chép được'); }
  document.body.removeChild(ta);
}

/* Dự đoán số — thuần giải trí. Số sinh ngẫu nhiên từ hạt giống của máy và ngày hôm nay,
   nên mỗi người một bộ, mỗi ngày một bộ, và bấm lại trong ngày không đổi được. */
const VE = [
  { ten: 'Mega 6/45',           loai: 'so',    n: 6, max: 45, salt: 1 },
  { ten: 'Power 6/55',          loai: 'so',    n: 6, max: 55, salt: 2 },
  // 5/35: năm số từ 1–35, kèm một số đặc biệt riêng từ 1–12
  { ten: 'Điện toán 5/35',      loai: 'so',    n: 5, max: 35, salt: 4, db: { max: 12, salt: 5 } },
  { ten: 'Vé số truyền thống',  loai: 'chuso', len: 6,        salt: 3 },
];

function lucky() {
  const bong = (n, lop = '') => `<span class="ball${lop}">${String(n).padStart(2, '0')}</span>`;
  const khoi = VE.map(v => {
    let bi = v.loai === 'so'
      ? luckyNumbers(today, seed, v.n, v.max, v.salt).map(n => bong(n)).join('')
      : luckyDigits(today, seed, v.len, v.salt).split('').map(d => `<span class="ball">${d}</span>`).join('');
    if (v.db) {
      const db = luckyNumbers(today, seed, 1, v.db.max, v.db.salt)[0];
      bi += `<span class="ngan" aria-hidden="true">+</span>` + bong(db, ' db');
    }
    const chu = v.db ? `<div class="ve-ten">${v.ten}<span class="ghi">số cuối là số đặc biệt (1–${v.db.max})</span></div>`
                     : `<div class="ve-ten">${v.ten}</div>`;
    return `<div class="ve">${chu}<div class="balls">${bi}</div></div>`;
  }).join('');
  openSheet('', `
    ${khoi}
    <p class="canh-bao">Đây là số ngẫu nhiên sinh từ ngày hôm nay, không phải dự đoán. Không ai đoán trước được kết quả xổ số. Xin chơi cho vui và trong khả năng của mình.</p>`);
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
    b.onclick = s.mo;
    troi.appendChild(b);
    return b;
  });
}
let NUT_SAO = [];

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
  addEventListener('resize', datLaiNgoiSao);
  addEventListener('orientationchange', datLaiNgoiSao);
  $('#btn-share').onclick = copyText;
  $('#btn-about').onclick = about;
  $$('[data-close]').forEach(el => el.onclick = closeSheet);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });

  setInterval(() => {                       // qua nửa đêm khi app đang mở: úp lá lại
    tick();
    if (!PREVIEW && ymd() !== today) { revealed = false; render(); toast('Một ngày mới đã bắt đầu'); }
  }, 1000);

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
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
