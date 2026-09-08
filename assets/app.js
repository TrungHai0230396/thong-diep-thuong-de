/* Thông Điệp Của Thượng Đế — mỗi ngày một lá, không lưu lại gì. */
(() => {
'use strict';

const { ymd, cardFor, newSeed } = self.TDTD;
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
  $('#sheet-title').textContent = title; $('#sheet-body').innerHTML = html;
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
  setTimeout(() => $('#after').scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 950);
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
})();
